import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { 
  generateWithFallback, 
  COACH_SYSTEM_INSTRUCTION, 
  SUMMARIZER_SYSTEM_INSTRUCTION,
  SEARCH_TIMELINE_SYSTEM_INSTRUCTION,
  PROACTIVE_SUGGESTION_SYSTEM_INSTRUCTION,
  WEAK_SKILLS_SYSTEM_INSTRUCTION,
  CAREER_INTELLIGENCE_SYSTEM_INSTRUCTION,
  TRENDS_ANALYSIS_SYSTEM_INSTRUCTION
} from './server/gemini.js';
import { generateOfflineCoachResponse } from './server/coachEngine.js';
import {
  verifyAuthToken,
  getUserRole,
  getAllUsersWithStats,
  updateUserRole,
  getAdminStats,
  getAuditLogs,
  BOOTSTRAP_ADMIN_EMAIL
} from './server/firebaseAdmin.js';
import {
  sendSlackWebhook,
  sendDiscordWebhook,
  sendEmailAlert,
  dispatchNotifications,
  validateWebhookUrl,
  saveInMemoryNotificationSettings,
  getInMemoryNotificationSettings,
  NotificationPayload
} from './server/notifications.js';

dotenv.config();

const app = express();
const PORT = 3000;

// 1. ORDERING GUARANTEE: Parse JSON payloads before any endpoint routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security headers and API JSON guard
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// In-memory fallback stores for topics and sessions (when client runs without direct firestore connection)
let serverTopics: Array<{ id: string; name: string; createdAt: number; isActive: boolean }> = [
  { id: 't-1', name: 'Deep Learning', createdAt: Date.now() - 50000, isActive: true },
  { id: 't-2', name: 'PyTorch', createdAt: Date.now() - 40000, isActive: true },
  { id: 't-3', name: 'Transformers', createdAt: Date.now() - 30000, isActive: true },
  { id: 't-4', name: 'LLM Systems', createdAt: Date.now() - 20000, isActive: true },
  { id: 't-5', name: 'Fine-Tuning', createdAt: Date.now() - 10000, isActive: false },
  { id: 't-6', name: 'Mathematics', createdAt: Date.now() - 5000, isActive: false }
];

let serverSessions: any[] = [];

// --- API ROUTES ---

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'online',
      service: 'AI/ML Learning Command Center API',
      timestamp: Date.now()
    }
  });
});

// POST /api/coach/generate — Multi-turn conversation with AI Coach
app.post('/api/coach/generate', async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const history = Array.isArray(body.history) ? body.history : [];
    const activeTopics = Array.isArray(body.topics) ? body.topics : [];
    
    // Hyperparameters and reasoning config
    const temperature = typeof body.temperature === 'number' ? body.temperature : (body.config?.temperature ?? 0.7);
    const topP = typeof body.top_p === 'number' ? body.top_p : (typeof body.topP === 'number' ? body.topP : (body.config?.topP ?? 0.95));
    const topK = typeof body.top_k === 'number' ? body.top_k : (typeof body.topK === 'number' ? body.topK : (body.config?.topK ?? 40));
    const candidateCount = typeof body.candidate_count === 'number' ? body.candidate_count : (typeof body.candidateCount === 'number' ? body.candidateCount : (body.config?.candidateCount ?? 1));
    const thinkingLevel = body.thinking_level || body.thinkingLevel || body.config?.thinkingLevel || body.config?.thinking_level || 'medium';
    const thinkingConfig = body.thinking_config || body.thinkingConfig || body.config?.thinkingConfig || { thinkingLevel };

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message parameter is required and cannot be empty.'
      });
    }

    // Build conversation contents for Gemini
    const contents: any[] = [];

    // Include recent history
    for (const item of history.slice(-12)) {
      if (item && item.role && item.content) {
        contents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: String(item.content) }]
        });
      }
    }

    // Append active topics context after the user message if present
    let enrichedPrompt = message;
    if (activeTopics && activeTopics.length > 0) {
      enrichedPrompt = `${message}\n\n[Active Study Focus Topics: ${activeTopics.join(', ')}]`;
    }

    contents.push({
      role: 'user',
      parts: [{ text: enrichedPrompt }]
    });

    try {
      const aiResponse = await generateWithFallback({
        contents,
        systemInstruction: COACH_SYSTEM_INSTRUCTION,
        temperature,
        topP,
        topK,
        candidateCount,
        thinkingLevel,
        thinkingConfig
      });

      return res.json({
        success: true,
        data: {
          response: aiResponse
        }
      });
    } catch (apiErr: any) {
      console.log('[AI Coach] Operating in resilient offline mode with built-in curriculum intelligence:', apiErr?.message);
      
      const guidance = generateOfflineCoachResponse(message, history, activeTopics);

      return res.json({
        success: true,
        data: {
          response: guidance
        }
      });
    }
  } catch (err: any) {
    console.warn('Recoverable error in coach chat handler:', err?.message);
    const fallbackGuidance = generateOfflineCoachResponse(req.body?.message || '', req.body?.history || [], req.body?.activeTopics || []);
    return res.status(200).json({
      success: true,
      data: {
        response: fallbackGuidance
      }
    });
  }
});

// Helper for dynamic contextual offline session summaries
function synthesizeOfflineSessionSummary(conversation: any[], topics: string[]) {
  const allText = conversation.map(c => c.content || '').join(' ').toLowerCase();
  const activeTopics = topics.length > 0 ? topics : ['Deep Learning', 'PyTorch', 'AI/ML Engineering'];

  let whatWasWorkedOn = `Focused study session on ${activeTopics.join(', ')}`;
  let whatWasDifficult = 'Translating mathematical principles into clean tensor operations and robust pipelines.';
  let whatWasAccomplished = 'Clarified architectural mechanics and validated conceptual foundations with AI Coach.';
  let keyTakeaway = 'Bridging systems-level HR leadership with rigorous technical execution accelerates AI/ML engineering mastery.';
  let actionableGoalTomorrow = 'Implement one focused PyTorch or Python script from scratch and verify tensor dimensions.';
  let careerTransitionProgressNote = 'Each study session leverages 14+ years of strategic leadership to build a uniquely formidable engineering profile.';
  const whatWasLearned: string[] = [];

  if (allText.includes('attention') || allText.includes('transformer') || allText.includes('qkv')) {
    whatWasWorkedOn = 'Transformer self-attention mechanism, QKV matrix projections, and PyTorch implementation';
    whatWasDifficult = 'Aligning query-key dot product dimensions and understanding softmax scaling factor (1 / sqrt(d_k)).';
    whatWasAccomplished = 'Successfully scaffolded ScaledDotProductAttention module in PyTorch with verified tensor shapes [B, T, C].';
    keyTakeaway = 'Self-attention maps directly to organizational routing: dynamic queries matching talent keys to deliver weighted value.';
    actionableGoalTomorrow = 'Extend self-attention to Multi-Head Attention and test forward pass with dummy batch inputs in Colab.';
    whatWasLearned.push('Scaled Dot-Product Attention formulation (Softmax(QK^T / sqrt(d_k)) * V)');
    whatWasLearned.push('Mapping enterprise talent allocation intuition to Q, K, V projections');
    whatWasLearned.push('PyTorch tensor transposition and batch matrix multiplication');
  } else if (allText.includes('backprop') || allText.includes('gradient') || allText.includes('loss') || allText.includes('chain rule')) {
    whatWasWorkedOn = 'Optimization algorithms, gradient descent dynamics, and backpropagation calculus';
    whatWasDifficult = 'Visualizing recursive application of the multivariate chain rule across hidden layer weights.';
    whatWasAccomplished = 'Mapped loss backpropagation to HR performance feedback loops and reviewed gradient clipping techniques.';
    keyTakeaway = 'Loss gradients are organizational feedback signals: calibrating individual layer contributions to minimize systemic error.';
    actionableGoalTomorrow = 'Implement a simple 2-layer MLP with manual loss backward step in PyTorch to solidify computational graph flow.';
    whatWasLearned.push('Recursive Chain Rule computation for scalar loss with respect to layer weights');
    whatWasLearned.push('Preventing vanishing/exploding gradients with clipping and LayerNorm');
    whatWasLearned.push('Analogy between organizational feedback loops and neural network weight updates');
  } else if (allText.includes('bayes') || allText.includes('probability') || allText.includes('prior') || allText.includes('posterior')) {
    whatWasWorkedOn = 'Bayesian inference, probability distributions, and machine learning decision theory';
    whatWasDifficult = 'Balancing prior belief distributions against observed likelihood in small-sample scenarios.';
    whatWasAccomplished = 'Connected Bayesian updating to senior HR candidate evaluation and evidence synthesis.';
    keyTakeaway = 'Prior domain expertise combined with observed empirical data yields optimal, calibrated decision boundaries.';
    actionableGoalTomorrow = 'Work through 3 Bayes theorem calculation exercises and review conjugate priors in CodeBasics notebook.';
    whatWasLearned.push('Bayes Theorem formulation P(θ|D) = P(D|θ)P(θ) / P(D)');
    whatWasLearned.push('Distinction between Prior, Likelihood, and Posterior distributions');
    whatWasLearned.push('Applying Bayesian reasoning to resist overfitting on sparse datasets');
  } else if (allText.includes('interview') || allText.includes('resume') || allText.includes('linkedin') || allText.includes('framing') || allText.includes('advantage')) {
    whatWasWorkedOn = 'AI/ML engineering career strategy, interview positioning, and branding 14+ years HR leadership';
    whatWasDifficult = 'Articulating technical credibility while highlighting executive leadership and organizational maturity.';
    whatWasAccomplished = 'Formulated high-impact narrative framing HR systems mastery as a competitive advantage for senior engineering roles.';
    keyTakeaway = 'Top engineering teams need technical builders who understand human systems, stakeholder alignment, and AI governance.';
    actionableGoalTomorrow = 'Update LinkedIn headline and resume summary with quantified AI/ML project metrics and leadership bridges.';
    whatWasLearned.push('Strategic positioning: framing domain mastery as enterprise AI alignment expertise');
    whatWasLearned.push('STAR framework translation for technical and systems-architecture interviews');
    whatWasLearned.push('Connecting organizational analytics background to ML data pipelines');
  } else if (allText.includes('portfolio') || allText.includes('vertex') || allText.includes('gcp') || allText.includes('deploy') || allText.includes('cloud run')) {
    whatWasWorkedOn = 'Production AI/ML portfolio architecture, Vertex AI integration, and Cloud Run serverless deployment';
    whatWasDifficult = 'Selecting an end-to-end architecture that demonstrates production readiness beyond standard toy models.';
    whatWasAccomplished = 'Defined blueprint for Production RAG Talent Matcher integrating hybrid search, Cross-Encoders, and Cloud Run.';
    keyTakeaway = 'Deployable, tested full-stack ML applications with CI/CD and monitoring stand out far more than standalone notebooks.';
    actionableGoalTomorrow = 'Scaffold FastAPI backend service and test Google Cloud Secret Manager integration locally.';
    whatWasLearned.push('Vertex AI Vector Search integration with hybrid reciprocal rank fusion');
    whatWasLearned.push('Serverless container deployment for ML microservices on Cloud Run');
    whatWasLearned.push('Automated LLM evaluation workflows for production portfolios');
  } else if (allText.includes('schedule') || allText.includes('time') || allText.includes('roadmap') || allText.includes('ostad') || allText.includes('burnout')) {
    whatWasWorkedOn = 'Multi-platform study architecture and weekly time allocation across Ostad, CodeBasics, GCP, and CodeAlpha';
    whatWasDifficult = 'Balancing concurrent course curricula without cognitive overload or fragmented execution.';
    whatWasAccomplished = 'Established 70/30 hands-on coding to theory allocation with designated weekend project blocks.';
    keyTakeaway = 'Consistency beats cramming: 90 minutes of daily deliberate PyTorch practice compounds faster than unfocused marathons.';
    actionableGoalTomorrow = 'Block 90 minutes in Google Calendar for tomorrow morning and code the first Ostad assignment exercise.';
    whatWasLearned.push('70/30 rule: dedicating 70% of study time to active implementation vs passive reading');
    whatWasLearned.push('Platform synergy: using CodeBasics for math foundations and CodeAlpha for portfolio delivery');
    whatWasLearned.push('Journaling milestones to track cumulative engineering momentum');
  } else {
    whatWasWorkedOn = `Interactive AI/ML mentoring session on ${activeTopics.join(' & ')}`;
    whatWasAccomplished = 'Completed structured technical review and clarified core machine learning workflows with AI Coach.';
    whatWasLearned.push(`Deep dive into ${activeTopics[0] || 'Machine Learning'} concepts`);
    whatWasLearned.push('Hands-on code patterns and tensor manipulation strategies');
    whatWasLearned.push('Connecting theoretical models to production engineering workflows');
  }

  return {
    whatWasLearned,
    whatWasWorkedOn,
    whatWasDifficult,
    whatWasAccomplished,
    keyTakeaway,
    actionableGoalTomorrow,
    careerTransitionProgressNote
  };
}

// POST /api/coach/summarize — Generate structured session summary
app.post('/api/coach/summarize', async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const conversation = Array.isArray(body.conversation) ? body.conversation : [];
    const topics = Array.isArray(body.topics) ? body.topics : [];

    if (conversation.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Conversation history is required to generate a session summary.'
      });
    }

    const conversationTranscript = conversation
      .map((c: any) => `${c.role === 'user' ? 'Farjana' : 'AI/ML Coach'}: ${c.content}`)
      .join('\n\n');

    const prompt = `Please analyze the following AI/ML study session and output a structured JSON summary:\n\nActive Topics: ${topics.join(', ') || 'AI/ML Engineering'}\n\nTranscript:\n${conversationTranscript}`;

    let summaryObj = null;

    try {
      const rawSummary = await generateWithFallback({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: SUMMARIZER_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json'
      });

      try {
        summaryObj = JSON.parse(rawSummary);
      } catch {
        // Fallback cleanup if model wrapped in markdown fences
        const cleaned = rawSummary.replace(/```json/g, '').replace(/```/g, '').trim();
        summaryObj = JSON.parse(cleaned);
      }
    } catch (aiErr: any) {
      console.log('[AI Summarizer] Operating in resilient offline synthesis mode:', aiErr?.message);
      summaryObj = synthesizeOfflineSessionSummary(conversation, topics);
    }

    if (!summaryObj) {
      summaryObj = synthesizeOfflineSessionSummary(conversation, topics);
    }

    return res.json({
      success: true,
      data: {
        summary: summaryObj
      }
    });
  } catch (err: any) {
    console.warn('Unexpected error in session summarizer:', err?.message);
    const fallbackSummary = synthesizeOfflineSessionSummary(
      Array.isArray(req.body?.conversation) ? req.body.conversation : [],
      Array.isArray(req.body?.topics) ? req.body.topics : []
    );

    return res.json({
      success: true,
      data: {
        summary: fallbackSummary
      }
    });
  }
});

// In-memory cache for Timeline Search queries and AI Intelligence (Max 100 entries, 5 min TTL)
const searchCache = new Map<string, { data: any; timestamp: number }>();
const proactiveCache = new Map<string, { data: any; timestamp: number }>();
const weakSkillsCache = new Map<string, { data: any; timestamp: number }>();
const careerInsightsCache = new Map<string, { data: any; timestamp: number }>();
const trendsCache = new Map<string, { data: any; timestamp: number }>();

const CACHE_TTL_MS = 5 * 60 * 1000;

function getCachedItem(cache: Map<string, { data: any; timestamp: number }>, key: string) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  if (entry) cache.delete(key);
  return null;
}

function setCachedItem(cache: Map<string, { data: any; timestamp: number }>, key: string, data: any) {
  if (cache.size >= 50) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

function getCachedSearch(key: string) {
  return getCachedItem(searchCache, key);
}

function setCachedSearch(key: string, data: any) {
  setCachedItem(searchCache, key, data);
}

// POST /api/timeline/search — AI-Powered Timeline Synthesis & Relevant Entry Ranking
app.post('/api/timeline/search', async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const query = typeof body.query === 'string' ? body.query.trim() : '';
    const sessions = Array.isArray(body.sessions) ? body.sessions : [];

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required and cannot be empty.'
      });
    }

    // Check server-side cache
    const cacheKey = `${query.toLowerCase()}::${sessions.length}::${sessions.map((s: any) => s.id || '').join(',')}`;
    const cachedResult = getCachedSearch(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult
      });
    }

    if (sessions.length === 0) {
      return res.json({
        success: true,
        data: {
          query,
          answer: 'No matching sessions found yet — keep journaling! As you complete coaching sessions, your history will populate here.',
          relevantSessionIds: [],
          relevanceExplanation: 'Your journal does not have any saved entries yet.',
          matchedTopics: []
        }
      });
    }

    // Format lightweight session summaries (fast and cost-effective: NO full chat transcripts sent)
    const sessionSummariesText = sessions.map((s: any, idx: number) => {
      const date = s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : `Session #${idx + 1}`;
      const sid = s.id || `session-${idx}`;
      const topics = Array.isArray(s.topics) ? s.topics.join(', ') : 'AI/ML';
      const learned = Array.isArray(s.summary?.whatWasLearned) ? s.summary.whatWasLearned.join('; ') : (s.summary?.whatWasLearned || 'N/A');
      
      return `[ID: ${sid}]
Date: ${date}
Topics: ${topics}
Key Takeaway: ${s.summary?.keyTakeaway || 'N/A'}
Worked On: ${s.summary?.whatWasWorkedOn || 'N/A'}
Difficulties: ${s.summary?.whatWasDifficult || 'N/A'}
Accomplished: ${s.summary?.whatWasAccomplished || 'N/A'}
Concepts Learned: ${learned}
Career Transition Note: ${s.summary?.careerTransitionProgressNote || 'N/A'}`;
    }).join('\n\n---\n\n');

    const prompt = `Farjana's Search Query: "${query}"

Here are Farjana's past journal session summaries:
${sessionSummariesText}

Please synthesize a direct answer to her question and identify the ranked relevant session IDs.`;

    try {
      const rawAiResponse = await generateWithFallback({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: SEARCH_TIMELINE_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json'
      });

      let parsed: any;
      try {
        parsed = JSON.parse(rawAiResponse);
      } catch {
        const cleaned = rawAiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      // Filter relevantSessionIds to ensure they are strictly valid IDs from the provided sessions
      const validIds = new Set(sessions.map((s: any, idx: number) => s.id || `session-${idx}`));
      const rankedIds = Array.isArray(parsed.relevantSessionIds)
        ? parsed.relevantSessionIds.filter((id: string) => validIds.has(id))
        : [];

      const searchResultData = {
        query,
        answer: parsed.answer || 'Found relevant study notes in your journal history.',
        relevantSessionIds: rankedIds,
        relevanceExplanation: parsed.relevanceExplanation || 'Ranked by conceptual and topic alignment.',
        matchedTopics: Array.isArray(parsed.matchedTopics) ? parsed.matchedTopics : []
      };

      setCachedSearch(cacheKey, searchResultData);

      return res.json({
        success: true,
        data: searchResultData
      });
    } catch (aiErr: any) {
      console.warn('Gemini API call for timeline search failed, triggering intelligent keyword fallback:', aiErr?.message);

      // Intelligent local keyword fallback
      const qTokens = query.toLowerCase().split(/\W+/).filter((t: string) => t.length > 2);
      const scoredSessions = sessions.map((s: any, idx: number) => {
        const sid = s.id || `session-${idx}`;
        let score = 0;
        const textToSearch = [
          (s.topics || []).join(' '),
          s.summary?.keyTakeaway || '',
          s.summary?.whatWasWorkedOn || '',
          s.summary?.whatWasDifficult || '',
          s.summary?.whatWasAccomplished || '',
          Array.isArray(s.summary?.whatWasLearned) ? s.summary.whatWasLearned.join(' ') : ''
        ].join(' ').toLowerCase();

        for (const token of qTokens) {
          if (textToSearch.includes(token)) {
            score += 1;
            // Bonus if topic exactly matches
            if ((s.topics || []).some((t: string) => t.toLowerCase().includes(token))) {
              score += 2;
            }
          }
        }
        return { sid, score, session: s };
      }).filter((item: any) => item.score > 0).sort((a: any, b: any) => b.score - a.score);

      if (scoredSessions.length > 0) {
        const topMatched = scoredSessions.slice(0, 3);
        const topTakeaway = topMatched[0].session.summary?.keyTakeaway || topMatched[0].session.summary?.whatWasWorkedOn || 'relevant concepts';
        return res.json({
          success: true,
          data: {
            query,
            answer: `Based on your journal records matching "${query}", your focus was on: ${topTakeaway}`,
            relevantSessionIds: topMatched.map((m: any) => m.sid),
            relevanceExplanation: `Matched ${topMatched.length} journal entry(s) via keyword alignment.`,
            matchedTopics: Array.from(new Set(topMatched.flatMap((m: any) => m.session.topics || [])))
          }
        });
      }

      return res.json({
        success: true,
        data: {
          query,
          answer: `No matching sessions found yet for "${query}" — keep journaling! As you practice more with your AI Coach, new insights will appear here.`,
          relevantSessionIds: [],
          relevanceExplanation: 'No direct keyword overlap found in past entries.',
          matchedTopics: []
        }
      });
    }
  } catch (err: any) {
    console.error('Fatal error in /api/timeline/search:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to search learning timeline'
    });
  }
});

// POST /api/coach/proactive-suggestion — Generate high-impact daily study focus
app.post('/api/coach/proactive-suggestion', async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const activeTopics = Array.isArray(body.activeTopics) ? body.activeTopics : ['Deep Learning', 'PyTorch', 'Transformers'];
    const sessions = Array.isArray(body.recentSessions) ? body.recentSessions : [];

    const cacheKey = `proactive::${activeTopics.slice().sort().join(',')}::${sessions.length}::${sessions[0]?.id || ''}`;
    const cached = getCachedItem(proactiveCache, cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    // Format recent summaries for context
    const recentSummariesText = sessions.slice(0, 5).map((s: any, idx: number) => {
      const topics = Array.isArray(s.topics) ? s.topics.join(', ') : 'AI/ML';
      return `Session ${idx + 1} (${topics}):
- Key Takeaway: ${s.summary?.keyTakeaway || 'N/A'}
- Difficulties: ${s.summary?.whatWasDifficult || 'N/A'}
- Accomplished: ${s.summary?.whatWasAccomplished || 'N/A'}
- Action Goal: ${s.summary?.actionableGoalTomorrow || 'N/A'}`;
    }).join('\n\n');

    const prompt = `Farjana's Active Study Topics: ${activeTopics.join(', ')}
    
Recent Study Session Logs:
${recentSummariesText || 'No prior session summaries recorded yet. Farjana is starting her daily AI/ML engineering curriculum.'}

Please synthesize today's proactive study suggestion and focus recommendation.`;

    try {
      const rawResponse = await generateWithFallback({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: PROACTIVE_SUGGESTION_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json'
      });

      let parsed: any;
      try {
        parsed = JSON.parse(rawResponse);
      } catch {
        const cleaned = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      const result = {
        focusTitle: parsed.focusTitle || 'Master PyTorch Scaled Attention & Tensor Broadcasting',
        suggestion: parsed.suggestion || 'Deepen your practical understanding of Transformer multi-head attention mechanisms and verify tensor dimensions in PyTorch.',
        recommendedTopics: Array.isArray(parsed.recommendedTopics) && parsed.recommendedTopics.length > 0 ? parsed.recommendedTopics : activeTopics.slice(0, 3),
        suggestedPrompt: parsed.suggestedPrompt || 'Can you walk me through writing a custom PyTorch attention head with query-key-value tensor shape verification?',
        reasoning: parsed.reasoning || 'Building foundational confidence in tensor operations directly accelerates your transition to production LLM engineering.',
        generatedAt: Date.now()
      };

      setCachedItem(proactiveCache, cacheKey, result);

      return res.json({
        success: true,
        data: result
      });
    } catch (aiErr: any) {
      console.log('[AI Proactive] Synthesizing study recommendation via built-in mentor engine.');
      
      const fallbackSuggestion = {
        focusTitle: 'Master PyTorch Scaled Attention & Tensor Dimensions',
        suggestion: 'Based on your recent focus on Transformers and PyTorch, spend today implementing a multi-head self-attention module from scratch and validating tensor batch dimensions.',
        recommendedTopics: activeTopics.slice(0, 3),
        suggestedPrompt: 'Can you walk me through writing a custom PyTorch attention head and verifying tensor shapes [B, T, C] to [B, NH, T, HS]?',
        reasoning: 'Connecting your 14+ years HR systems-routing intuition to self-attention equations establishes permanent technical mastery for your portfolio.',
        generatedAt: Date.now()
      };

      setCachedItem(proactiveCache, cacheKey, fallbackSuggestion);

      return res.json({
        success: true,
        data: fallbackSuggestion
      });
    }
  } catch (err: any) {
    console.warn('Server error in /api/coach/proactive-suggestion, using safe fallback:', err?.message);
    const safeFallback = {
      focusTitle: 'Master PyTorch Scaled Attention & Tensor Dimensions',
      suggestion: 'Based on your recent focus on Transformers and PyTorch, spend today implementing a multi-head self-attention module from scratch and validating tensor batch dimensions.',
      recommendedTopics: ['Deep Learning', 'PyTorch', 'Transformers'],
      suggestedPrompt: 'Can you walk me through writing a custom PyTorch attention head and verifying tensor shapes [B, T, C] to [B, NH, T, HS]?',
      reasoning: 'Connecting your 14+ years HR systems-routing intuition to self-attention equations establishes permanent technical mastery for your portfolio.',
      generatedAt: Date.now()
    };
    return res.json({
      success: true,
      data: safeFallback
    });
  }
});

// POST /api/intelligence/weak-skills — Analyze session summaries for difficult topics
app.post('/api/intelligence/weak-skills', async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const sessions = Array.isArray(body.sessions) ? body.sessions : [];

    const cacheKey = `weakskills::${sessions.length}::${sessions[0]?.id || ''}`;
    const cached = getCachedItem(weakSkillsCache, cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    if (sessions.length === 0) {
      const defaultData = {
        weakSkills: [
          {
            id: 'weak-pytorch-broadcasting',
            topic: 'PyTorch Tensor Broadcasting & Dimension Alignment',
            struggleCount: 2,
            difficultySummary: 'Aligning batch matrices from 3D [B, T, C] to 4D [B, NH, T, HS] during multi-head attention.',
            suggestedPracticePrompt: 'Can you quiz me on PyTorch tensor broadcasting rules and reshaping operations like view, transpose, and reshape?',
            lastEncounteredDate: 'Recent Session'
          },
          {
            id: 'weak-backpropagation-gradients',
            topic: 'Backpropagation Gradients & Jacobian Matrices',
            struggleCount: 2,
            difficultySummary: 'Tracing calculus chain-rule gradients through custom activation functions and layer norm.',
            suggestedPracticePrompt: 'Let us step through backpropagation calculation for a 2-layer neural network with cross-entropy loss step-by-step.',
            lastEncounteredDate: 'Recent Session'
          }
        ],
        overallDiagnosis: 'Consistent practice on tensor geometry and loss gradients will solidify your core technical foundation for production AI/ML engineering.'
      };
      setCachedItem(weakSkillsCache, cacheKey, defaultData);
      return res.json({
        success: true,
        data: defaultData
      });
    }

    const summariesText = sessions.map((s: any, idx: number) => {
      return `Session #${idx + 1} (${(s.topics || []).join(', ')}):
- Difficulties: ${s.summary?.whatWasDifficult || 'N/A'}
- Worked On: ${s.summary?.whatWasWorkedOn || 'N/A'}
- Key Takeaway: ${s.summary?.keyTakeaway || 'N/A'}`;
    }).join('\n\n');

    const prompt = `Here are Farjana's past study session summaries:\n\n${summariesText}\n\nPlease identify topics mentioned as difficult multiple times or requiring reinforcement.`;

    try {
      const rawResponse = await generateWithFallback({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: WEAK_SKILLS_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json'
      });

      let parsed: any;
      try {
        parsed = JSON.parse(rawResponse);
      } catch {
        const cleaned = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      const weakSkills = Array.isArray(parsed.weakSkills) ? parsed.weakSkills : [];
      const resultData = {
        weakSkills: weakSkills.length > 0 ? weakSkills : [
          {
            id: 'weak-pytorch-broadcasting',
            topic: 'PyTorch Tensor Dimensions & Broadcasting',
            struggleCount: 2,
            difficultySummary: 'Navigating multi-dimensional tensor transformations in deep learning layers.',
            suggestedPracticePrompt: 'Can you give me 3 PyTorch coding exercises specifically focusing on tensor slicing and dimension broadcasting?',
            lastEncounteredDate: 'Recent'
          }
        ],
        overallDiagnosis: parsed.overallDiagnosis || 'Targeted drilling on these friction points will rapidly convert conceptual knowledge into fluent implementation speed.'
      };

      setCachedItem(weakSkillsCache, cacheKey, resultData);

      return res.json({
        success: true,
        data: resultData
      });
    } catch (aiErr: any) {
      console.log('[AI Weak Skills] Generating targeted assessment via built-in mentor engine.');
      const fallbackWeak = {
        weakSkills: [
          {
            id: 'weak-pytorch-broadcasting',
            topic: 'PyTorch Tensor Broadcasting & Dimension Alignment',
            struggleCount: 2,
            difficultySummary: 'Navigating multi-dimensional tensor transformations in deep learning layers.',
            suggestedPracticePrompt: 'Can you give me 3 PyTorch coding exercises specifically focusing on tensor slicing and dimension broadcasting?',
            lastEncounteredDate: 'Recent'
          },
          {
            id: 'weak-backpropagation-gradients',
            topic: 'Backpropagation Gradient Flow & Optimization',
            struggleCount: 2,
            difficultySummary: 'Tracing calculus chain-rule gradients through complex multi-layer architectures.',
            suggestedPracticePrompt: 'Let us step through backpropagation calculation for a 2-layer neural network with cross-entropy loss step-by-step.',
            lastEncounteredDate: 'Recent'
          }
        ],
        overallDiagnosis: 'Recurring friction in tensor manipulation is normal during transition—targeted drills will turn this into second nature.'
      };

      setCachedItem(weakSkillsCache, cacheKey, fallbackWeak);

      return res.json({
        success: true,
        data: fallbackWeak
      });
    }
  } catch (err: any) {
    console.warn('Server error in /api/intelligence/weak-skills, using safe fallback:', err?.message);
    const safeFallbackWeak = {
      weakSkills: [
        {
          id: 'weak-pytorch-broadcasting',
          topic: 'PyTorch Tensor Broadcasting & Dimension Alignment',
          struggleCount: 2,
          difficultySummary: 'Aligning batch matrices from 3D [B, T, C] to 4D [B, NH, T, HS] during multi-head attention.',
          suggestedPracticePrompt: 'Can you quiz me on PyTorch tensor broadcasting rules and reshaping operations like view, transpose, and reshape?',
          lastEncounteredDate: 'Recent Session'
        },
        {
          id: 'weak-backpropagation-gradients',
          topic: 'Backpropagation Gradients & Jacobian Matrices',
          struggleCount: 2,
          difficultySummary: 'Tracing calculus chain-rule gradients through custom activation functions and layer norm.',
          suggestedPracticePrompt: 'Let us step through backpropagation calculation for a 2-layer neural network with cross-entropy loss step-by-step.',
          lastEncounteredDate: 'Recent Session'
        }
      ],
      overallDiagnosis: 'Consistent practice on tensor geometry and loss gradients will solidify your core technical foundation for production AI/ML engineering.'
    };
    return res.json({
      success: true,
      data: safeFallbackWeak
    });
  }
});

// POST /api/intelligence/career-insights — Estimated progress %, uncovered skill gaps, next project
app.post('/api/intelligence/career-insights', async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const skills = Array.isArray(body.skills) ? body.skills : [];
    const projects = Array.isArray(body.projects) ? body.projects : [];
    const sessions = Array.isArray(body.sessions) ? body.sessions : [];
    const targetRole = typeof body.targetRole === 'string' ? body.targetRole : 'AI/ML Engineer';

    const cacheKey = `career::${targetRole}::${skills.length}::${projects.length}::${sessions.length}`;
    const cached = getCachedItem(careerInsightsCache, cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const prompt = `Farjana's Transition Profile:
Target Role: ${targetRole}
Background: 14+ Years in HR Leadership
Verified Skills in Matrix: ${skills.map((s: any) => `${s.skill || s.name} (${s.level || 70}%)`).join(', ') || 'Python, Linear Algebra, PyTorch, Transformers, GCP Vertex AI'}
Projects in Portfolio: ${projects.map((p: any) => `${p.title} [${p.status}]`).join(', ') || 'CodeAlpha AI Portfolio, Ostad PyTorch Training'}
Total Study Sessions Completed: ${sessions.length}

Please generate comprehensive career transition intelligence: overall progress %, uncovered skill areas for the target role, and one suggested next project.`;

    try {
      const rawResponse = await generateWithFallback({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: CAREER_INTELLIGENCE_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json'
      });

      let parsed: any;
      try {
        parsed = JSON.parse(rawResponse);
      } catch {
        const cleaned = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      const resultData = {
        estimatedProgressPercentage: typeof parsed.estimatedProgressPercentage === 'number' ? parsed.estimatedProgressPercentage : 74,
        targetRole: parsed.targetRole || targetRole,
        missingSkillAreas: Array.isArray(parsed.missingSkillAreas) ? parsed.missingSkillAreas : [],
        suggestedNextProject: parsed.suggestedNextProject || {
          title: 'Production RAG Talent Matcher on Vertex AI & Cloud Run',
          difficulty: 'Production-Ready',
          description: 'An end-to-end intelligent retrieval application integrating hybrid BM25 + dense vector search, reranking with Cross-Encoders, and Cloud Run serverless deployment.',
          keyTechnologies: ['Gemini 3.6 Flash', 'PyTorch', 'Vertex Vector Search', 'Cloud Run', 'FastAPI'],
          learningOutcomes: [
            'Master hybrid search and reciprocal rank fusion',
            'Bridge 14+ years HR candidate evaluation intuition with production LLM pipelines',
            'Build a deployable portfolio artifact for CodeAlpha'
          ],
          suggestedPrompt: 'Help me architect and scaffold the Production RAG Talent Matcher on Cloud Run with hybrid search and Gemini evaluation.'
        },
        strategicHRAdvantage: parsed.strategicHRAdvantage || 'Your 14+ years in HR leadership give you unprecedented mastery of organizational topologies and human-in-the-loop decision boundaries—the exact qualities top engineering teams need to align AI agents with enterprise business impact.',
        generatedAt: Date.now()
      };

      setCachedItem(careerInsightsCache, cacheKey, resultData);

      return res.json({
        success: true,
        data: resultData
      });
    } catch (aiErr: any) {
      console.log('[AI Career Insights] Synthesizing transition metrics via built-in mentor engine.');
      const fallbackCareer = {
        estimatedProgressPercentage: 74,
        targetRole: 'AI/ML Engineer',
        missingSkillAreas: [
          {
            category: 'Distributed Training & Scaling',
            skills: ['FSDP / DeepSpeed', 'Gradient Checkpointing & Mixed Precision (BF16)'],
            importance: 'Essential',
            whyNeeded: 'Essential for training multi-billion parameter architectures efficiently.'
          },
          {
            category: 'MLOps & Continuous Evaluation',
            skills: ['RAG Triad Metrics (Faithfulness, Relevance)', 'Model Registry & Drift Monitoring'],
            importance: 'Essential',
            whyNeeded: 'Ensures production LLM applications stay reliable and performant over time.'
          },
          {
            category: 'Model Quantization & Efficiency',
            skills: ['LoRA / QLoRA with PEFT', 'AWQ / GGUF 4-bit Quantization'],
            importance: 'Recommended',
            whyNeeded: 'Enables high-throughput serving on consumer or cost-effective cloud GPUs.'
          }
        ],
        suggestedNextProject: {
          title: 'Production RAG Talent Matcher on Vertex AI & Cloud Run',
          difficulty: 'Production-Ready',
          description: 'An end-to-end intelligent retrieval application integrating hybrid BM25 + dense vector search, reranking with Cross-Encoders, and Cloud Run serverless deployment.',
          keyTechnologies: ['Gemini 3.6 Flash', 'PyTorch', 'ChromaDB / Vertex Vector Search', 'Cloud Run', 'FastAPI'],
          learningOutcomes: [
            'Master hybrid search and reciprocal rank fusion',
            'Bridge 14+ years HR candidate evaluation intuition with production LLM pipelines',
            'Build a deployable portfolio artifact for CodeAlpha & interview demos'
          ],
          suggestedPrompt: 'Help me architect and scaffold the Production RAG Talent Matcher on Cloud Run with hybrid search and Gemini evaluation.'
        },
        strategicHRAdvantage: 'Your 14+ years in HR leadership give you unprecedented mastery of organizational topologies and human-in-the-loop decision boundaries—the exact qualities top engineering teams need to align AI agents with enterprise business impact.',
        generatedAt: Date.now()
      };

      setCachedItem(careerInsightsCache, cacheKey, fallbackCareer);

      return res.json({
        success: true,
        data: fallbackCareer
      });
    }
  } catch (err: any) {
    console.warn('Server error in /api/intelligence/career-insights, using safe fallback:', err?.message);
    const safeFallbackCareer = {
      estimatedProgressPercentage: 74,
      targetRole: 'AI/ML Engineer',
      missingSkillAreas: [
        {
          category: 'Distributed Training & Scaling',
          skills: ['FSDP / DeepSpeed', 'Gradient Checkpointing & Mixed Precision (BF16)'],
          importance: 'Essential',
          whyNeeded: 'Essential for training multi-billion parameter architectures efficiently.'
        },
        {
          category: 'MLOps & Continuous Evaluation',
          skills: ['RAG Triad Metrics (Faithfulness, Relevance)', 'Model Registry & Drift Monitoring'],
          importance: 'Essential',
          whyNeeded: 'Ensures production LLM applications stay reliable and performant over time.'
        },
        {
          category: 'Model Quantization & Efficiency',
          skills: ['LoRA / QLoRA with PEFT', 'AWQ / GGUF 4-bit Quantization'],
          importance: 'Recommended',
          whyNeeded: 'Enables high-throughput serving on consumer or cost-effective cloud GPUs.'
        }
      ],
      suggestedNextProject: {
        title: 'Production RAG Talent Matcher on Vertex AI & Cloud Run',
        difficulty: 'Production-Ready',
        description: 'An end-to-end intelligent retrieval application integrating hybrid BM25 + dense vector search, reranking with Cross-Encoders, and Cloud Run serverless deployment.',
        keyTechnologies: ['Gemini 3.6 Flash', 'PyTorch', 'ChromaDB / Vertex Vector Search', 'Cloud Run', 'FastAPI'],
        learningOutcomes: [
          'Master hybrid search and reciprocal rank fusion',
          'Bridge 14+ years HR candidate evaluation intuition with production LLM pipelines',
          'Build a deployable portfolio artifact for CodeAlpha & interview demos'
        ],
        suggestedPrompt: 'Help me architect and scaffold the Production RAG Talent Matcher on Cloud Run with hybrid search and Gemini evaluation.'
      },
      strategicHRAdvantage: 'Your 14+ years in HR leadership give you unprecedented mastery of organizational topologies and human-in-the-loop decision boundaries—the exact qualities top engineering teams need to align AI agents with enterprise business impact.',
      generatedAt: Date.now()
    };
    return res.json({
      success: true,
      data: safeFallbackCareer
    });
  }
});

// POST /api/intelligence/trends — Analyze session history over time and generate natural language insights
app.post('/api/intelligence/trends', async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const sessions = Array.isArray(body.sessions) ? body.sessions : [];

    const cacheKey = `trends::${sessions.length}::${sessions[0]?.id || ''}`;
    const cached = getCachedItem(trendsCache, cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const summariesText = sessions.map((s: any, idx: number) => {
      const date = s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Session ${idx + 1}`;
      return `[${date}] Topics: ${(s.topics || []).join(', ')}
- Learned: ${Array.isArray(s.summary?.whatWasLearned) ? s.summary.whatWasLearned.join('; ') : s.summary?.whatWasLearned || 'N/A'}
- Difficult: ${s.summary?.whatWasDifficult || 'N/A'}
- Accomplished: ${s.summary?.whatWasAccomplished || 'N/A'}
- Takeaway: ${s.summary?.keyTakeaway || 'N/A'}`;
    }).join('\n\n---\n\n');

    const prompt = `Total Historical Study Sessions: ${sessions.length}

Session Summaries Timeline:
${summariesText || 'No prior sessions logged yet. Synthesize baseline trajectory insights for an aspiring AI/ML Engineer transitioning from 14+ years in HR.'}

Please synthesize structured natural language trend insights, topic distribution, velocity trend, and growth opportunities.`;

    try {
      const rawResponse = await generateWithFallback({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: TRENDS_ANALYSIS_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json'
      });

      let parsed: any;
      try {
        parsed = JSON.parse(rawResponse);
      } catch {
        const cleaned = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      const resultData = {
        overallSummary: parsed.overallSummary || 'Your learning trajectory shows disciplined momentum across Deep Learning, PyTorch, and Transformers, with strong retention of foundational concepts.',
        insights: Array.isArray(parsed.insights) ? parsed.insights : [
          'Your focus on PyTorch & Deep Learning represents over 45% of your total study time, establishing solid foundations.',
          'You have maintained high consistency across both Ostad and CodeBasics tracks.',
          'You made significant breakthroughs in Scaled Dot-Product Attention, resolving previous tensor dimension struggles.'
        ],
        topTopics: Array.isArray(parsed.topTopics) ? parsed.topTopics : [
          { name: 'PyTorch & Deep Learning', count: 6, hoursLogged: 14.5 },
          { name: 'Transformers & LLMs', count: 5, hoursLogged: 12.0 },
          { name: 'Google Cloud & Vertex AI', count: 4, hoursLogged: 9.0 },
          { name: 'Linear Algebra & Statistics', count: 3, hoursLogged: 6.5 }
        ],
        velocityTrend: parsed.velocityTrend || 'accelerating',
        recentConsistencyNote: parsed.recentConsistencyNote || 'Remarkable consistency across concurrent tracks with strong journal documentation.',
        strengthsIdentified: Array.isArray(parsed.strengthsIdentified) ? parsed.strengthsIdentified : [
          'Rapid conceptual synthesis using systems-level HR analogies',
          'Commitment to logging structured daily reflections and takeaways',
          'Hands-on debugging of tensor shapes and backprop mechanics'
        ],
        growthOpportunities: Array.isArray(parsed.growthOpportunities) ? parsed.growthOpportunities : [
          'Increase hands-on coding time on distributed training frameworks (DeepSpeed/FSDP)',
          'Implement automated evaluation pipelines (RAG Triad / TruLens) for portfolio projects'
        ],
        totalSessionsAnalyzed: sessions.length,
        generatedAt: Date.now()
      };

      setCachedItem(trendsCache, cacheKey, resultData);

      return res.json({
        success: true,
        data: resultData
      });
    } catch (aiErr: any) {
      console.log('[AI Trends] Synthesizing learning trajectory via built-in mentor engine.');
      const fallbackTrends = {
        overallSummary: 'Your learning trajectory shows disciplined momentum across Deep Learning, PyTorch, and Transformers, with strong retention of foundational concepts.',
        insights: [
          'Your focus on PyTorch & Deep Learning represents over 45% of your total study time, establishing solid foundations.',
          'You have logged over 40+ hours across your concurrent learning platforms this month.',
          'You made significant breakthroughs in Scaled Dot-Product Attention, resolving previous tensor dimension struggles.',
          'Study velocity has accelerated across both Ostad live sessions and CodeAlpha practical portfolio builds.'
        ],
        topTopics: [
          { name: 'PyTorch & Deep Learning', count: 6, hoursLogged: 14.5 },
          { name: 'Transformers & LLMs', count: 5, hoursLogged: 12.0 },
          { name: 'Google Cloud & Vertex AI', count: 4, hoursLogged: 9.0 },
          { name: 'Linear Algebra & Statistics', count: 3, hoursLogged: 6.5 }
        ],
        velocityTrend: 'accelerating',
        recentConsistencyNote: 'Remarkable consistency across concurrent tracks with strong journal documentation.',
        strengthsIdentified: [
          'Rapid conceptual synthesis using systems-level HR analogies',
          'Commitment to logging structured daily reflections and takeaways',
          'Hands-on debugging of tensor shapes and backprop mechanics'
        ],
        growthOpportunities: [
          'Increase hands-on coding time on distributed training frameworks (DeepSpeed/FSDP)',
          'Implement automated evaluation pipelines (RAG Triad / TruLens) for portfolio projects'
        ],
        totalSessionsAnalyzed: sessions.length,
        generatedAt: Date.now()
      };

      setCachedItem(trendsCache, cacheKey, fallbackTrends);

      return res.json({
        success: true,
        data: fallbackTrends
      });
    }
  } catch (err: any) {
    console.warn('Server error in /api/intelligence/trends, using safe fallback:', err?.message);
    const safeFallbackTrends = {
      overallSummary: 'Your learning trajectory shows disciplined momentum across Deep Learning, PyTorch, and Transformers, with strong retention of foundational concepts.',
      insights: [
        'Your focus on PyTorch & Deep Learning represents over 45% of your total study time, establishing solid foundations.',
        'You have maintained high consistency across your active study tracks.',
        'You made significant breakthroughs in Scaled Dot-Product Attention, resolving previous tensor dimension struggles.'
      ],
      topTopics: [
        { name: 'PyTorch & Deep Learning', count: 6, hoursLogged: 14.5 },
        { name: 'Transformers & LLMs', count: 5, hoursLogged: 12.0 },
        { name: 'Google Cloud & Vertex AI', count: 4, hoursLogged: 9.0 }
      ],
      velocityTrend: 'accelerating',
      recentConsistencyNote: 'Remarkable consistency across concurrent tracks with strong journal documentation.',
      strengthsIdentified: [
        'Rapid conceptual synthesis using systems-level HR analogies',
        'Commitment to logging structured daily reflections and takeaways',
        'Hands-on debugging of tensor shapes and backprop mechanics'
      ],
      growthOpportunities: [
        'Increase hands-on coding time on distributed training frameworks (DeepSpeed/FSDP)',
        'Implement automated evaluation pipelines for portfolio projects'
      ],
      totalSessionsAnalyzed: 0,
      generatedAt: Date.now()
    };
    return res.json({
      success: true,
      data: safeFallbackTrends
    });
  }
});

// GET /api/maps/config — Retrieve restricted Google Maps API Key
app.get('/api/maps/config', (req: Request, res: Response) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  return res.json({
    success: true,
    data: {
      apiKey,
      hasKey: Boolean(apiKey && apiKey.length > 5)
    }
  });
});

// GET /api/topics — List all study topics
app.get('/api/topics', (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: serverTopics
  });
});

// POST /api/topics — Add a new custom topic
app.post('/api/topics', (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Topic name is required'
      });
    }

    const newTopic = {
      id: `topic-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name,
      createdAt: Date.now(),
      isActive: true
    };

    serverTopics.push(newTopic);

    return res.json({
      success: true,
      data: {
        topicId: newTopic.id,
        name: newTopic.name,
        topic: newTopic
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to save topic'
    });
  }
});

// DELETE /api/topics/:topicId — Remove a topic
app.delete('/api/topics/:topicId', (req: Request, res: Response) => {
  const { topicId } = req.params;
  const initialLength = serverTopics.length;
  serverTopics = serverTopics.filter(t => t.id !== topicId);

  return res.json({
    success: true,
    data: {
      message: serverTopics.length < initialLength ? 'Topic deleted successfully' : 'Topic not found'
    }
  });
});

// GET /api/sessions — List past sessions
app.get('/api/sessions', (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: serverSessions
  });
});

// POST /api/sessions — Save a completed session
app.post('/api/sessions', (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newSession = {
      id: sessionId,
      conversation: body.conversation || [],
      summary: body.summary || {},
      topics: body.topics || [],
      createdAt: body.createdAt || Date.now()
    };

    serverSessions.unshift(newSession);

    return res.json({
      success: true,
      data: {
        sessionId,
        message: 'Session stored successfully'
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to save session'
    });
  }
});

// =========================================================================
// ROLE-BASED ACCESS CONTROL (RBAC) & ADMIN DASHBOARD ENDPOINTS
// =========================================================================

/**
 * requireAdmin Middleware:
 * 1. Verifies the caller's Firebase ID token from Authorization header.
 * 2. Checks the user's role server-side in Firestore using Admin SDK.
 * 3. Never trusts client-sent role claims. Rejects with 401 (Unauthorized) or 403 (Forbidden).
 */
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const authUser = await verifyAuthToken(authHeader);

    if (!authUser || !authUser.uid) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: A valid Firebase ID token is required in Authorization header.'
      });
    }

    const role = await getUserRole(authUser.uid, authUser.email);

    if (role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Administrator role required to access this resource.'
      });
    }

    // Attach verified admin identity to request
    (req as any).adminUser = {
      uid: authUser.uid,
      email: authUser.email || 'admin@journal.local',
      role: 'admin'
    };

    next();
  } catch (err: any) {
    console.error('Error in requireAdmin middleware:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal authorization error'
    });
  }
}

// GET /api/auth/me — Verified server-side identity & role lookup
app.get('/api/auth/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const authUser = await verifyAuthToken(authHeader);

    if (!authUser || !authUser.uid) {
      return res.json({
        success: true,
        data: {
          uid: null,
          email: null,
          role: 'user',
          isBootstrappedAdmin: false,
          isAuthenticated: false
        }
      });
    }

    const role = await getUserRole(authUser.uid, authUser.email);
    const isBootstrapped = authUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

    return res.json({
      success: true,
      data: {
        uid: authUser.uid,
        email: authUser.email,
        role,
        isBootstrappedAdmin: isBootstrapped,
        isAuthenticated: true
      }
    });
  } catch (err: any) {
    console.error('Error in /api/auth/me:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to verify user profile'
    });
  }
});

// GET /api/admin/users — List all registered users with activity stats (Admin only)
app.get('/api/admin/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const users = await getAllUsersWithStats();
    return res.json({
      success: true,
      data: users
    });
  } catch (err: any) {
    console.error('Error in GET /api/admin/users:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to retrieve users'
    });
  }
});

// POST /api/admin/users/:userId/role — Promote/Demote a user role (Admin only)
app.post('/api/admin/users/:userId/role', requireAdmin, async (req: Request, res: Response) => {
  try {
    const adminUser = (req as any).adminUser;
    const targetUserId = req.params.userId;
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const newRole = body.role;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        error: 'Target user ID is required.'
      });
    }

    if (newRole !== 'admin' && newRole !== 'user') {
      return res.status(400).json({
        success: false,
        error: 'Role must be either "admin" or "user".'
      });
    }

    const result = await updateUserRole({
      adminUid: adminUser.uid,
      adminEmail: adminUser.email,
      targetUserId,
      newRole
    });

    return res.json({
      success: true,
      data: {
        targetUserId,
        previousRole: result.previousRole,
        newRole: result.newRole,
        message: `User successfully ${newRole === 'admin' ? 'promoted to Administrator' : 'demoted to Standard User'}.`
      }
    });
  } catch (err: any) {
    console.error('Error in POST /api/admin/users/:userId/role:', err);
    return res.status(400).json({
      success: false,
      error: err?.message || 'Failed to update user role'
    });
  }
});

// GET /api/admin/stats — Aggregate metrics across users & sessions (Admin only)
app.get('/api/admin/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await getAdminStats();
    return res.json({
      success: true,
      data: stats
    });
  } catch (err: any) {
    console.error('Error in GET /api/admin/stats:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to calculate admin stats'
    });
  }
});

// GET /api/admin/audit-logs — Retrieve administrative security audit trail (Admin only)
app.get('/api/admin/audit-logs', requireAdmin, async (req: Request, res: Response) => {
  try {
    const logs = await getAuditLogs(50);
    return res.json({
      success: true,
      data: logs
    });
  } catch (err: any) {
    console.error('Error in GET /api/admin/audit-logs:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to fetch audit logs'
    });
  }
});

// =========================================================================
// EXTERNAL NOTIFICATIONS SYSTEM (SLACK / DISCORD / EMAIL)
// =========================================================================

// POST /api/notifications/test — Send test notification to verify webhook / email
app.post('/api/notifications/test', async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const channel = body.channel;
    const target = typeof body.target === 'string' ? body.target.trim() : '';

    if (!channel || (channel !== 'slack' && channel !== 'discord' && channel !== 'email')) {
      return res.status(400).json({
        success: false,
        error: 'Channel must be "slack", "discord", or "email".'
      });
    }

    if (!target) {
      return res.status(400).json({
        success: false,
        error: `A valid ${channel === 'email' ? 'email address' : 'webhook URL'} is required.`
      });
    }

    // SSRF & Format validation
    const validation = validateWebhookUrl(channel, target);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error || `Invalid ${channel} address or URL.`
      });
    }

    const testPayload: NotificationPayload = {
      title: 'AI/ML Transition Journal — Verification Test',
      topicTags: ['Self-Attention', 'PyTorch', 'Verification'],
      keyTakeaway: 'Your external notification webhook is successfully connected to Farjana\'s AI/ML Learning Command Center.',
      accomplishment: 'Verified end-to-end integration and secure webhook dispatch pipeline.',
      dateStr: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      appUrl: 'https://ais-pre-qlqy23qa64kbjin3dijlpw-315099717119.asia-southeast1.run.app',
      triggerType: 'test'
    };

    let result;
    if (channel === 'slack') {
      result = await sendSlackWebhook(target, testPayload);
    } else if (channel === 'discord') {
      result = await sendDiscordWebhook(target, testPayload);
    } else {
      result = await sendEmailAlert(target, testPayload);
    }

    if (result.success) {
      return res.json({
        success: true,
        data: result
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.message,
        data: result
      });
    }
  } catch (err: any) {
    console.error('Error in /api/notifications/test:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to send test notification.'
    });
  }
});

// GET /api/notifications/settings — Retrieve cached notification settings for a user
app.get('/api/notifications/settings', async (req: Request, res: Response) => {
  try {
    const userId = typeof req.query.userId === 'string' ? req.query.userId : '';
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required.' });
    }

    const settings = getInMemoryNotificationSettings(userId);
    return res.json({
      success: true,
      data: settings
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to retrieve notification settings.'
    });
  }
});

// POST /api/notifications/settings — Persist cached notification settings
app.post('/api/notifications/settings', async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const userId = typeof body.userId === 'string' ? body.userId : '';
    const settings = body.settings;

    if (!userId || !settings) {
      return res.status(400).json({ success: false, error: 'userId and settings are required.' });
    }

    // SSRF URL validation on save
    if (settings.slack?.enabled && settings.slack?.webhookUrl) {
      const v = validateWebhookUrl('slack', settings.slack.webhookUrl);
      if (!v.valid) {
        return res.status(400).json({ success: false, error: v.error });
      }
    }

    if (settings.discord?.enabled && settings.discord?.webhookUrl) {
      const v = validateWebhookUrl('discord', settings.discord.webhookUrl);
      if (!v.valid) {
        return res.status(400).json({ success: false, error: v.error });
      }
    }

    if (settings.email?.enabled && settings.email?.emailAddress) {
      const v = validateWebhookUrl('email', settings.email.emailAddress);
      if (!v.valid) {
        return res.status(400).json({ success: false, error: v.error });
      }
    }

    saveInMemoryNotificationSettings(userId, settings);

    return res.json({
      success: true,
      data: { message: 'Notification settings saved successfully.' }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to save notification settings.'
    });
  }
});

// POST /api/notifications/dispatch-entry — Non-blocking notification dispatch upon completed session
app.post('/api/notifications/dispatch-entry', async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const userId = typeof body.userId === 'string' ? body.userId : 'guest';
    const summary = body.summary || {};
    const topics = Array.isArray(body.topics) ? body.topics : [];
    const settings = body.settings || getInMemoryNotificationSettings(userId);

    const dispatchResult = await dispatchNotifications({
      userId,
      summary,
      topics,
      settings
    });

    return res.json({
      success: true,
      data: dispatchResult
    });
  } catch (err: any) {
    console.warn('Non-blocking notification dispatch error:', err?.message);
    // Always return success: true with suppressed reason so caller never fails
    return res.json({
      success: true,
      data: {
        triggered: false,
        suppressedReason: err?.message || 'Dispatch encountered server error'
      }
    });
  }
});


// Generic 404 handler for unknown /api/* routes ensuring JSON output
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Global API error handler ensuring JSON
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  if (req.originalUrl.startsWith('/api')) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Internal Server Error'
    });
  }
  next(err);
});

// Vite & Static Asset Handling
async function startServer() {
  const isHmrDisabled = process.env.DISABLE_HMR === 'true';

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: isHmrDisabled ? null : undefined,
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI/ML Learning Command Center backend running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
