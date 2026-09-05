import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Moon, 
  Zap, 
  Flame, 
  HelpCircle, 
  ShieldAlert, 
  RefreshCw, 
  Check, 
  Sparkles,
  Mail,
  Sliders,
  Clock
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { UserNotificationSettings } from '../types';
import type { ToastNotification, SuccessType } from './common/SuccessFeedback';
import { 
  fetchNotificationSettings, 
  saveNotificationSettings, 
  testNotificationChannel,
  DEFAULT_NOTIFICATION_SETTINGS 
} from '../lib/notificationsApi';

interface NotificationSettingsCardProps {
  currentUser: User | null;
  onShowToast?: (toast: Omit<ToastNotification, 'id'>) => void;
}

export const NotificationSettingsCard: React.FC<NotificationSettingsCardProps> = ({
  currentUser,
  onShowToast
}) => {
  const [settings, setSettings] = useState<UserNotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<Record<string, { loading: boolean; success?: boolean; error?: string }>>({
    slack: { loading: false },
    discord: { loading: false },
    email: { loading: false }
  });

  const userId = currentUser ? currentUser.uid : 'guest-user';

  // Load settings
  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const token = currentUser ? await currentUser.getIdToken() : undefined;
        const loaded = await fetchNotificationSettings(userId, token);
        if (mounted) {
          setSettings(loaded);
        }
      } catch (err) {
        console.error('Failed to load notification settings:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [userId, currentUser]);

  // Save changes
  const handleSave = async (updated: UserNotificationSettings) => {
    setSettings(updated);
    setIsSaving(true);
    try {
      const token = currentUser ? await currentUser.getIdToken() : undefined;
      await saveNotificationSettings(userId, updated, token);
      onShowToast?.({
        type: 'save',
        title: 'Settings Saved',
        message: 'Your notification preferences and webhook URLs have been updated.'
      });
    } catch (err: any) {
      onShowToast?.({
        type: 'custom',
        title: 'Save Failed',
        message: err?.message || 'Could not save notification settings.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Test a channel
  const handleTestChannel = async (channel: 'slack' | 'discord' | 'email') => {
    let target = '';
    if (channel === 'slack') target = settings.slack.webhookUrl || '';
    if (channel === 'discord') target = settings.discord.webhookUrl || '';
    if (channel === 'email') target = settings.email.emailAddress || '';

    if (!target) {
      setTestStatus(prev => ({
        ...prev,
        [channel]: { loading: false, success: false, error: `Please enter a valid ${channel === 'email' ? 'email' : 'webhook URL'} first.` }
      }));
      return;
    }

    setTestStatus(prev => ({ ...prev, [channel]: { loading: true, error: undefined } }));

    try {
      const token = currentUser ? await currentUser.getIdToken() : undefined;
      const res = await testNotificationChannel(channel, target, token);

      if (res.success) {
        setTestStatus(prev => ({
          ...prev,
          [channel]: { loading: false, success: true, error: undefined }
        }));
        
        // Update settings status
        const updated = {
          ...settings,
          [channel]: {
            ...settings[channel],
            lastTestStatus: 'success' as const,
            lastTestError: undefined,
            lastTestAt: Date.now()
          }
        };
        handleSave(updated);

        onShowToast?.({
          type: 'custom',
          title: 'Test Notification Delivered',
          message: `Verification message sent successfully to your ${channel} channel!`
        });
      } else {
        setTestStatus(prev => ({
          ...prev,
          [channel]: { loading: false, success: false, error: res.message }
        }));

        const updated = {
          ...settings,
          [channel]: {
            ...settings[channel],
            lastTestStatus: 'failed' as const,
            lastTestError: res.message,
            lastTestAt: Date.now()
          }
        };
        handleSave(updated);

        onShowToast?.({
          type: 'custom',
          title: 'Delivery Verification Failed',
          message: res.message
        });
      }
    } catch (err: any) {
      setTestStatus(prev => ({
        ...prev,
        [channel]: { loading: false, success: false, error: err?.message || 'Verification failed.' }
      }));
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#070e20] border border-[#142347] shadow-lg space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#121f3d]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              External Notifications & Alerts
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Server-Side Webhooks
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Receive automated summaries and milestone alerts directly in Slack, Discord, or Email upon journal entry completion.
            </p>
          </div>
        </div>

        {isSaving && (
          <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Saving changes...</span>
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs font-mono text-slate-400 animate-pulse flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#00F0FF]" />
          <span>Loading notification preferences...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Notification Channels Grid */}
          <div className="space-y-4">
            <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>Notification Channels (Encrypted & Dispatched Server-Side)</span>
            </div>

            {/* 1. Slack Webhook */}
            <div className="p-4 rounded-xl bg-[#091124] border border-[#182647] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#E01E5A]/20 text-[#E01E5A] flex items-center justify-center text-xs font-bold font-mono">
                    #
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Slack Incoming Webhook</div>
                    <div className="text-[10px] font-mono text-slate-400">Formatted blocks with topic pills & key takeaways</div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.slack.enabled}
                    onChange={(e) => {
                      const updated = {
                        ...settings,
                        slack: { ...settings.slack, enabled: e.target.checked }
                      };
                      handleSave(updated);
                    }}
                    className="sr-only peer"
                    aria-label="Toggle Slack notifications"
                  />
                  <div className="w-9 h-5 bg-[#0e1633] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00F0FF]"></div>
                </label>
              </div>

              {settings.slack.enabled && (
                <div className="space-y-2 pt-2 border-t border-[#121f3d]">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      placeholder="https://hooks.slack.com/services/T.../B.../X..."
                      value={settings.slack.webhookUrl || ''}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          slack: { ...settings.slack, webhookUrl: e.target.value }
                        });
                      }}
                      onBlur={() => handleSave(settings)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#060b18] border border-[#182647] focus:border-[#00F0FF] text-xs font-mono text-white placeholder-slate-600 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      disabled={testStatus.slack.loading || !settings.slack.webhookUrl}
                      onClick={() => handleTestChannel('slack')}
                      className="px-3 py-1.5 rounded-lg bg-[#0072FF]/20 hover:bg-[#0072FF]/40 border border-[#0072FF]/50 text-[#00F0FF] text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      aria-label="Send test Slack notification"
                    >
                      {testStatus.slack.loading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Test Slack</span>
                    </button>
                  </div>

                  {testStatus.slack.error && (
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] font-mono flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{testStatus.slack.error}</span>
                    </div>
                  )}

                  {testStatus.slack.success && (
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Last test succeeded! Webhook is verified and ready.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Discord Webhook */}
            <div className="p-4 rounded-xl bg-[#091124] border border-[#182647] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#5865F2]/20 text-[#5865F2] flex items-center justify-center text-xs font-bold font-mono">
                    D
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Discord Channel Webhook</div>
                    <div className="text-[10px] font-mono text-slate-400">Rich embeds with color coding, milestone tags & deep links</div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.discord.enabled}
                    onChange={(e) => {
                      const updated = {
                        ...settings,
                        discord: { ...settings.discord, enabled: e.target.checked }
                      };
                      handleSave(updated);
                    }}
                    className="sr-only peer"
                    aria-label="Toggle Discord notifications"
                  />
                  <div className="w-9 h-5 bg-[#0e1633] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00F0FF]"></div>
                </label>
              </div>

              {settings.discord.enabled && (
                <div className="space-y-2 pt-2 border-t border-[#121f3d]">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      placeholder="https://discord.com/api/webhooks/1234.../abcd..."
                      value={settings.discord.webhookUrl || ''}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          discord: { ...settings.discord, webhookUrl: e.target.value }
                        });
                      }}
                      onBlur={() => handleSave(settings)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#060b18] border border-[#182647] focus:border-[#00F0FF] text-xs font-mono text-white placeholder-slate-600 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      disabled={testStatus.discord.loading || !settings.discord.webhookUrl}
                      onClick={() => handleTestChannel('discord')}
                      className="px-3 py-1.5 rounded-lg bg-[#0072FF]/20 hover:bg-[#0072FF]/40 border border-[#0072FF]/50 text-[#00F0FF] text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      aria-label="Send test Discord notification"
                    >
                      {testStatus.discord.loading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Test Discord</span>
                    </button>
                  </div>

                  {testStatus.discord.error && (
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] font-mono flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{testStatus.discord.error}</span>
                    </div>
                  )}

                  {testStatus.discord.success && (
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Last test succeeded! Discord webhook is active.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Transactional Email */}
            <div className="p-4 rounded-xl bg-[#091124] border border-[#182647] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#10b981]/20 text-[#10b981] flex items-center justify-center text-xs font-bold font-mono">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Transactional Email Alert</div>
                    <div className="text-[10px] font-mono text-slate-400">Automated study digest & achievement summaries sent to your inbox</div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email.enabled}
                    onChange={(e) => {
                      const updated = {
                        ...settings,
                        email: { ...settings.email, enabled: e.target.checked }
                      };
                      handleSave(updated);
                    }}
                    className="sr-only peer"
                    aria-label="Toggle Email alerts"
                  />
                  <div className="w-9 h-5 bg-[#0e1633] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00F0FF]"></div>
                </label>
              </div>

              {settings.email.enabled && (
                <div className="space-y-2 pt-2 border-t border-[#121f3d]">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      placeholder="farjana@example.com"
                      value={settings.email.emailAddress || (currentUser?.email || '')}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          email: { ...settings.email, emailAddress: e.target.value }
                        });
                      }}
                      onBlur={() => handleSave(settings)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#060b18] border border-[#182647] focus:border-[#00F0FF] text-xs font-mono text-white placeholder-slate-600 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      disabled={testStatus.email.loading || (!settings.email.emailAddress && !currentUser?.email)}
                      onClick={() => handleTestChannel('email')}
                      className="px-3 py-1.5 rounded-lg bg-[#0072FF]/20 hover:bg-[#0072FF]/40 border border-[#0072FF]/50 text-[#00F0FF] text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      aria-label="Send test email alert"
                    >
                      {testStatus.email.loading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Test Email</span>
                    </button>
                  </div>

                  {testStatus.email.error && (
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] font-mono flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{testStatus.email.error}</span>
                    </div>
                  )}

                  {testStatus.email.success && (
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Email verification succeeded! Alerts will route to your address.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Trigger Types & Quiet Hours Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Trigger Types */}
            <div className="p-4 rounded-xl bg-[#091124] border border-[#182647] space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#121f3d]">
                <Flame className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">Trigger Conditions</h4>
              </div>

              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                  <span className="text-slate-300">Milestones & Breakthroughs</span>
                  <input
                    type="checkbox"
                    checked={settings.triggers.milestone}
                    onChange={(e) => {
                      const updated = {
                        ...settings,
                        triggers: { ...settings.triggers, milestone: e.target.checked }
                      };
                      handleSave(updated);
                    }}
                    className="w-4 h-4 rounded bg-[#0e1633] border-[#182647] accent-[#00F0FF]"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                  <span className="text-slate-300">Friction & Blocker Nudges</span>
                  <input
                    type="checkbox"
                    checked={settings.triggers.friction}
                    onChange={(e) => {
                      const updated = {
                        ...settings,
                        triggers: { ...settings.triggers, friction: e.target.checked }
                      };
                      handleSave(updated);
                    }}
                    className="w-4 h-4 rounded bg-[#0e1633] border-[#182647] accent-[#00F0FF]"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer select-none">
                  <span className="text-slate-300">Daily Study Streak Complete</span>
                  <input
                    type="checkbox"
                    checked={settings.triggers.dailyStreak}
                    onChange={(e) => {
                      const updated = {
                        ...settings,
                        triggers: { ...settings.triggers, dailyStreak: e.target.checked }
                      };
                      handleSave(updated);
                    }}
                    className="w-4 h-4 rounded bg-[#0e1633] border-[#182647] accent-[#00F0FF]"
                  />
                </label>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="p-4 rounded-xl bg-[#091124] border border-[#182647] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#121f3d]">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold text-white">Quiet Hours Window</h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.quietHours.enabled}
                    onChange={(e) => {
                      const updated = {
                        ...settings,
                        quietHours: { ...settings.quietHours, enabled: e.target.checked }
                      };
                      handleSave(updated);
                    }}
                    className="sr-only peer"
                    aria-label="Toggle quiet hours"
                  />
                  <div className="w-7 h-4 bg-[#0e1633] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>

              {settings.quietHours.enabled ? (
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mute from:</span>
                    <select
                      value={settings.quietHours.startHour}
                      onChange={(e) => {
                        const updated = {
                          ...settings,
                          quietHours: { ...settings.quietHours, startHour: parseInt(e.target.value, 10) }
                        };
                        handleSave(updated);
                      }}
                      className="px-2 py-1 rounded bg-[#060b18] border border-[#182647] text-white text-xs"
                    >
                      <option value={20}>8:00 PM</option>
                      <option value={21}>9:00 PM</option>
                      <option value={22}>10:00 PM (Default)</option>
                      <option value={23}>11:00 PM</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Until:</span>
                    <select
                      value={settings.quietHours.endHour}
                      onChange={(e) => {
                        const updated = {
                          ...settings,
                          quietHours: { ...settings.quietHours, endHour: parseInt(e.target.value, 10) }
                        };
                        handleSave(updated);
                      }}
                      className="px-2 py-1 rounded bg-[#060b18] border border-[#182647] text-white text-xs"
                    >
                      <option value={6}>6:00 AM</option>
                      <option value={7}>7:00 AM</option>
                      <option value={8}>8:00 AM (Default)</option>
                      <option value={9}>9:00 AM</option>
                    </select>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Notifications triggered during quiet hours will be suppressed cleanly without throwing errors.
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-2">
                  Quiet hours disabled. Notifications will dispatch immediately upon session completion.
                </div>
              )}
            </div>
          </div>

          {/* Security & Anti-Spam Footer Note */}
          <div className="p-3 rounded-xl bg-[#091228] border border-[#162752] flex items-start gap-2.5 text-xs text-slate-400">
            <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-bold">Zero-Hardcoding & SSRF Safeguards: </span>
              Webhook URLs are encrypted and stored exclusively in your owner-bound Firestore profile. Outbound calls are executed server-side with strict domain whitelisting (Slack/Discord domains only) and capped at a maximum of 5 alerts per day.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
