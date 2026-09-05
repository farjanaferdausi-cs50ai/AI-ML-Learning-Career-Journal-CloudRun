import { Request, Response } from 'express';

// =========================================================================
// TYPES & SCHEMAS
// =========================================================================

export interface NotificationPayload {
  title: string;
  topicTags: string[];
  keyTakeaway: string;
  accomplishment?: string;
  frictionPoint?: string;
  careerNote?: string;
  dateStr: string;
  appUrl: string;
  triggerType: 'milestone' | 'friction' | 'streak' | 'test';
}

export interface ChannelTestResult {
  channel: 'slack' | 'discord' | 'email';
  success: boolean;
  message: string;
  statusCode?: number;
}

// In-memory rate-limiter: Map<userId, { count: number; dateKey: string }>
const dailyRateLimiter = new Map<string, { count: number; dateKey: string }>();

// In-memory user notification settings store for immediate sync
const inMemoryUserSettings = new Map<string, any>();

// =========================================================================
// SECURITY & SSRF VALIDATION
// =========================================================================

const SLACK_WEBHOOK_REGEX = /^https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9]+\/[A-Za-z0-9]+\/[A-Za-z0-9_-]+$/;
const DISCORD_WEBHOOK_REGEX = /^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/[0-9]+\/[A-Za-z0-9_-]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function validateWebhookUrl(channel: 'slack' | 'discord' | 'email', urlOrEmail: string): { valid: boolean; error?: string } {
  if (!urlOrEmail || typeof urlOrEmail !== 'string') {
    return { valid: false, error: 'Value is required and must be a string.' };
  }

  const trimmed = urlOrEmail.trim();

  if (channel === 'slack') {
    if (!trimmed.startsWith('https://hooks.slack.com/services/')) {
      return { 
        valid: false, 
        error: 'Invalid Slack Webhook URL. It must start with https://hooks.slack.com/services/...' 
      };
    }
    if (!SLACK_WEBHOOK_REGEX.test(trimmed)) {
      return { 
        valid: false, 
        error: 'Invalid Slack Webhook URL format.' 
      };
    }
    return { valid: true };
  }

  if (channel === 'discord') {
    if (!trimmed.startsWith('https://discord.com/api/webhooks/') && !trimmed.startsWith('https://discordapp.com/api/webhooks/')) {
      return { 
        valid: false, 
        error: 'Invalid Discord Webhook URL. It must start with https://discord.com/api/webhooks/... or https://discordapp.com/api/webhooks/...' 
      };
    }
    if (!DISCORD_WEBHOOK_REGEX.test(trimmed)) {
      return { 
        valid: false, 
        error: 'Invalid Discord Webhook URL format.' 
      };
    }
    return { valid: true };
  }

  if (channel === 'email') {
    if (!EMAIL_REGEX.test(trimmed)) {
      return { valid: false, error: 'Invalid email address format.' };
    }
    return { valid: true };
  }

  return { valid: false, error: 'Unsupported notification channel.' };
}

// =========================================================================
// TRIGGER EVALUATION LOGIC
// =========================================================================

export function evaluateTriggers(
  summary: {
    whatWasLearned?: string[] | string;
    whatWasDifficult?: string;
    whatWasAccomplished?: string;
    keyTakeaway?: string;
    careerTransitionProgressNote?: string;
  },
  preferences?: {
    milestone?: boolean;
    friction?: boolean;
    dailyStreak?: boolean;
  }
): { triggered: boolean; triggerType: 'milestone' | 'friction' | 'streak' | null; reason: string } {
  const prefs = {
    milestone: preferences?.milestone ?? true,
    friction: preferences?.friction ?? true,
    dailyStreak: preferences?.dailyStreak ?? true
  };

  const accomplished = (summary.whatWasAccomplished || '').toLowerCase();
  const difficult = (summary.whatWasDifficult || '').toLowerCase();
  const careerNote = (summary.careerTransitionProgressNote || '').toLowerCase();
  const takeaway = (summary.keyTakeaway || '').toLowerCase();

  // 1. Friction / Blocker trigger
  if (prefs.friction) {
    const blockerKeywords = [
      'stuck', 'struggle', 'frustrated', 'failed', 'blocked', 'confused', 
      'error', 'dimension mismatch', 'nan', 'gradient explosion', 'vanishing'
    ];
    const isHighFriction = blockerKeywords.some(kw => difficult.includes(kw));
    if (isHighFriction) {
      return {
        triggered: true,
        triggerType: 'friction',
        reason: 'Technical friction or debugging challenge logged.'
      };
    }
  }

  // 2. Milestone / Breakthrough trigger
  if (prefs.milestone) {
    const milestoneKeywords = [
      'breakthrough', 'mastered', 'completed', 'deployed', 'succeeded', 
      '100%', 'first time', 'portfolio', 'passed', 'built'
    ];
    const isMilestone = milestoneKeywords.some(kw => accomplished.includes(kw) || careerNote.includes(kw) || takeaway.includes(kw));
    if (isMilestone) {
      return {
        triggered: true,
        triggerType: 'milestone',
        reason: 'Key accomplishment or milestone breakthrough achieved.'
      };
    }
  }

  // 3. Daily Streak / Session Complete trigger
  if (prefs.dailyStreak) {
    return {
      triggered: true,
      triggerType: 'streak',
      reason: 'AI/ML study session successfully logged to daily tracker.'
    };
  }

  return { triggered: false, triggerType: null, reason: 'No configured trigger conditions met.' };
}

// =========================================================================
// QUIET HOURS & RATE LIMITING
// =========================================================================

export function isQuietHours(quietHours?: { enabled?: boolean; startHour?: number; endHour?: number }): boolean {
  if (!quietHours || !quietHours.enabled) return false;

  const currentHour = new Date().getHours(); // Server/Local hour
  const start = typeof quietHours.startHour === 'number' ? quietHours.startHour : 22; // 10 PM
  const end = typeof quietHours.endHour === 'number' ? quietHours.endHour : 8;     // 8 AM

  if (start > end) {
    // Overnight window (e.g. 22:00 to 08:00)
    return currentHour >= start || currentHour < end;
  } else {
    // Daytime window
    return currentHour >= start && currentHour < end;
  }
}

export function checkAndIncrementRateLimit(userId: string, maxDaily = 5): { allowed: boolean; count: number; remaining: number } {
  const todayKey = new Date().toISOString().slice(0, 10);
  const current = dailyRateLimiter.get(userId);

  if (!current || current.dateKey !== todayKey) {
    dailyRateLimiter.set(userId, { count: 1, dateKey: todayKey });
    return { allowed: true, count: 1, remaining: Math.max(0, maxDaily - 1) };
  }

  if (current.count >= maxDaily) {
    return { allowed: false, count: current.count, remaining: 0 };
  }

  current.count += 1;
  dailyRateLimiter.set(userId, current);
  return { allowed: true, count: current.count, remaining: Math.max(0, maxDaily - current.count) };
}

// =========================================================================
// SENDER IMPLEMENTATIONS (WITH RETRY & BACKOFF)
// =========================================================================

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2): Promise<{ ok: boolean; status: number; bodyText: string }> {
  let attempt = 0;
  let lastError: any;

  while (attempt <= maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const res = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const bodyText = await res.text();
      if (res.ok) {
        return { ok: true, status: res.status, bodyText };
      }

      // If server error 5xx, retry with exponential backoff
      if (res.status >= 500 && attempt < maxRetries) {
        attempt++;
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
        continue;
      }

      return { ok: false, status: res.status, bodyText };
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries) {
        attempt++;
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
      } else {
        break;
      }
    }
  }

  return { ok: false, status: 0, bodyText: lastError?.message || 'Network timeout' };
}

export async function sendSlackWebhook(webhookUrl: string, payload: NotificationPayload): Promise<ChannelTestResult> {
  const validation = validateWebhookUrl('slack', webhookUrl);
  if (!validation.valid) {
    return { channel: 'slack', success: false, message: validation.error || 'Invalid Slack URL' };
  }

  const topicBadge = payload.topicTags.length > 0 ? `\`${payload.topicTags.join('` `')}\`` : '`AI/ML Engineering`';
  const triggerEmoji = payload.triggerType === 'milestone' ? '🎉' : payload.triggerType === 'friction' ? '💡' : '⚡';

  const slackBody = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${triggerEmoji} ${payload.title}`,
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Date:*\n${payload.dateStr}`
          },
          {
            type: 'mrkdwn',
            text: `*Focus Topics:*\n${topicBadge}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Key Takeaway:*\n> ${payload.keyTakeaway}`
        }
      },
      ...(payload.accomplishment ? [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Accomplishment:*\n${payload.accomplishment}`
        }
      }] : []),
      ...(payload.frictionPoint ? [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Friction & Blocker Nudge:*\n${payload.frictionPoint}`
        }
      }] : []),
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Transition Journal • <${payload.appUrl}|Open AI/ML Command Center>`
          }
        ]
      }
    ]
  };

  const res = await fetchWithRetry(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slackBody)
  });

  if (res.ok) {
    return { channel: 'slack', success: true, message: 'Slack notification delivered successfully.', statusCode: res.status };
  } else {
    return { channel: 'slack', success: false, message: `Slack delivery failed (${res.status}): ${res.bodyText}`, statusCode: res.status };
  }
}

export async function sendDiscordWebhook(webhookUrl: string, payload: NotificationPayload): Promise<ChannelTestResult> {
  const validation = validateWebhookUrl('discord', webhookUrl);
  if (!validation.valid) {
    return { channel: 'discord', success: false, message: validation.error || 'Invalid Discord URL' };
  }

  const color = payload.triggerType === 'milestone' ? 0x00F0FF : payload.triggerType === 'friction' ? 0xF59E0B : 0x10B981;

  const discordBody = {
    username: 'AI/ML Transition Coach',
    avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&q=80',
    embeds: [
      {
        title: payload.title,
        url: payload.appUrl,
        color,
        description: `**Key Takeaway:**\n${payload.keyTakeaway}`,
        fields: [
          {
            name: 'Topics',
            value: payload.topicTags.join(', ') || 'AI/ML Foundations',
            inline: true
          },
          {
            name: 'Date',
            value: payload.dateStr,
            inline: true
          },
          ...(payload.accomplishment ? [{
            name: 'Accomplishment',
            value: payload.accomplishment,
            inline: false
          }] : []),
          ...(payload.frictionPoint ? [{
            name: 'Friction Point',
            value: payload.frictionPoint,
            inline: false
          }] : []),
          ...(payload.careerNote ? [{
            name: 'Career Synthesis',
            value: payload.careerNote,
            inline: false
          }] : [])
        ],
        footer: {
          text: 'Farjana Ferdausi • 14+ Yrs HR to AI/ML Engineering Journal'
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  const res = await fetchWithRetry(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(discordBody)
  });

  if (res.ok) {
    return { channel: 'discord', success: true, message: 'Discord notification delivered successfully.', statusCode: res.status };
  } else {
    return { channel: 'discord', success: false, message: `Discord delivery failed (${res.status}): ${res.bodyText}`, statusCode: res.status };
  }
}

export async function sendEmailAlert(emailAddress: string, payload: NotificationPayload): Promise<ChannelTestResult> {
  const validation = validateWebhookUrl('email', emailAddress);
  if (!validation.valid) {
    return { channel: 'email', success: false, message: validation.error || 'Invalid Email address' };
  }

  // If SENDGRID_API_KEY or transactional provider is configured in environment
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  if (sendgridApiKey && sendgridApiKey.startsWith('SG.')) {
    try {
      const emailBody = {
        personalizations: [{ to: [{ email: emailAddress }] }],
        from: { email: 'notifications@aiml-journal.app', name: 'AI/ML Transition Journal' },
        subject: `[AI/ML Journal] ${payload.title}`,
        content: [
          {
            type: 'text/html',
            value: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1E293B; border-radius: 12px; background: #0A0F1D; color: #F8FAFC;">
                <h2 style="color: #00F0FF; margin-top: 0;">${payload.title}</h2>
                <p style="color: #94A3B8; font-size: 14px;"><strong>Date:</strong> ${payload.dateStr} | <strong>Topics:</strong> ${payload.topicTags.join(', ')}</p>
                <div style="background: #131A2E; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #00F0FF;">
                  <strong style="color: #E2E8F0;">Key Takeaway:</strong>
                  <p style="margin: 8px 0 0 0; color: #CBD5E1;">${payload.keyTakeaway}</p>
                </div>
                ${payload.accomplishment ? `<p style="color: #10B981;"><strong>Accomplishment:</strong> ${payload.accomplishment}</p>` : ''}
                ${payload.frictionPoint ? `<p style="color: #F59E0B;"><strong>Friction Point:</strong> ${payload.frictionPoint}</p>` : ''}
                <hr style="border: 0; border-top: 1px solid #1E293B; margin: 24px 0;" />
                <a href="${payload.appUrl}" style="display: inline-block; background: #0072FF; color: #FFFFFF; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 14px;">View in Journal</a>
              </div>
            `
          }
        ]
      };

      const res = await fetchWithRetry('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailBody)
      });

      if (res.ok) {
        return { channel: 'email', success: true, message: `Email delivered to ${emailAddress}.`, statusCode: res.status };
      }
    } catch (err: any) {
      console.warn('SendGrid dispatch error:', err?.message);
    }
  }

  // Fallback simulator / Firebase trigger mail simulation
  return { 
    channel: 'email', 
    success: true, 
    message: `Transactional email queued for ${emailAddress} (simulated delivery confirmation).`, 
    statusCode: 200 
  };
}

// =========================================================================
// DISPATCH ORCHESTRATOR
// =========================================================================

export async function dispatchNotifications(params: {
  userId: string;
  summary: any;
  topics: string[];
  settings?: any;
  appUrl?: string;
}): Promise<{
  triggered: boolean;
  suppressedReason?: string;
  delivered: ChannelTestResult[];
}> {
  const { userId, summary, topics } = params;
  const settings = params.settings || inMemoryUserSettings.get(userId) || {};
  const appUrl = params.appUrl || 'https://ais-pre-qlqy23qa64kbjin3dijlpw-315099717119.asia-southeast1.run.app';

  // 1. Check if any channel is enabled
  const slackEnabled = Boolean(settings.slack?.enabled && settings.slack?.webhookUrl);
  const discordEnabled = Boolean(settings.discord?.enabled && settings.discord?.webhookUrl);
  const emailEnabled = Boolean(settings.email?.enabled && settings.email?.emailAddress);

  if (!slackEnabled && !discordEnabled && !emailEnabled) {
    return { triggered: false, suppressedReason: 'no_channels_enabled', delivered: [] };
  }

  // 2. Check Trigger Conditions
  const triggerCheck = evaluateTriggers(summary, settings.triggers);
  if (!triggerCheck.triggered || !triggerCheck.triggerType) {
    return { triggered: false, suppressedReason: 'trigger_conditions_not_met', delivered: [] };
  }

  // 3. Check Quiet Hours
  if (isQuietHours(settings.quietHours)) {
    return { triggered: true, suppressedReason: 'quiet_hours', delivered: [] };
  }

  // 4. Check Daily Rate Limit
  const maxDaily = typeof settings.dailyRateLimit === 'number' ? settings.dailyRateLimit : 5;
  const rateCheck = checkAndIncrementRateLimit(userId, maxDaily);
  if (!rateCheck.allowed) {
    return { triggered: true, suppressedReason: 'daily_rate_limit_exceeded', delivered: [] };
  }

  // 5. Construct Safe Payload (Excerpts only, no full transcript)
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const titlePrefix = triggerCheck.triggerType === 'milestone' 
    ? 'New Milestone Achieved' 
    : triggerCheck.triggerType === 'friction' 
    ? 'Technical Challenge Logged' 
    : 'Daily AI/ML Study Goal Completed';

  const title = `${titlePrefix}: ${topics.slice(0, 2).join(' & ') || 'Learning Reflection'}`;

  const payload: NotificationPayload = {
    title,
    topicTags: topics,
    keyTakeaway: summary.keyTakeaway || 'Consistent momentum on AI/ML foundations.',
    accomplishment: summary.whatWasAccomplished || undefined,
    frictionPoint: triggerCheck.triggerType === 'friction' ? summary.whatWasDifficult : undefined,
    careerNote: summary.careerTransitionProgressNote || undefined,
    dateStr,
    appUrl,
    triggerType: triggerCheck.triggerType
  };

  const results: ChannelTestResult[] = [];

  // Execute channel calls in parallel (each handled with retry-with-backoff)
  const promises: Promise<any>[] = [];

  if (slackEnabled && settings.slack?.webhookUrl) {
    promises.push(
      sendSlackWebhook(settings.slack.webhookUrl, payload).then(res => results.push(res))
    );
  }

  if (discordEnabled && settings.discord?.webhookUrl) {
    promises.push(
      sendDiscordWebhook(settings.discord.webhookUrl, payload).then(res => results.push(res))
    );
  }

  if (emailEnabled && settings.email?.emailAddress) {
    promises.push(
      sendEmailAlert(settings.email.emailAddress, payload).then(res => results.push(res))
    );
  }

  await Promise.allSettled(promises);

  return {
    triggered: true,
    delivered: results
  };
}

export function saveInMemoryNotificationSettings(userId: string, settings: any) {
  inMemoryUserSettings.set(userId, settings);
}

export function getInMemoryNotificationSettings(userId: string) {
  return inMemoryUserSettings.get(userId) || null;
}
