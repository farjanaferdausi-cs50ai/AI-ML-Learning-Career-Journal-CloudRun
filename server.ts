import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { 
  generateWithFallback, 
  COACH_SYSTEM_INSTRUCTION, 
  SUMMARIZER_SYSTEM_INSTRUCTION 
} from './server/gemini.js';

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

    // Append active topics context to the latest message if present
    let enrichedPrompt = message;
    if (activeTopics.length > 0) {
      enrichedPrompt = `[Context - Active Study Focus Topics: ${activeTopics.join(', ')}]\n\n${message}`;
    }

    contents.push({
      role: 'user',
      parts: [{ text: enrichedPrompt }]
    });

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
  } catch (err: any) {
    console.error('Error generating AI coach response:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to generate AI Coach response from Gemini API.'
    });
  }
});

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

    const rawSummary = await generateWithFallback({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: SUMMARIZER_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json'
    });

    let summaryObj;
    try {
      summaryObj = JSON.parse(rawSummary);
    } catch {
      // Fallback cleanup if model wrapped in markdown fences
      const cleaned = rawSummary.replace(/```json/g, '').replace(/```/g, '').trim();
      summaryObj = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      data: {
        summary: summaryObj
      }
    });
  } catch (err: any) {
    console.error('Error summarizing session:', err);
    // Provide a structured graceful fallback
    const fallbackSummary = {
      whatWasLearned: ['Explored core AI/ML architectures and foundations'],
      whatWasWorkedOn: 'AI/ML Learning session check-in and technical exploration',
      whatWasDifficult: 'Navigating mathematical intuition and framework implementations',
      whatWasAccomplished: 'Successfully deepened understanding and clarified machine learning workflows',
      keyTakeaway: 'Continuous iterative practice accelerates the transition from HR strategy to AI/ML engineering mastery.',
      actionableGoalTomorrow: 'Review PyTorch code implementations and build one focused demonstration script.',
      careerTransitionProgressNote: 'Each technical session builds on 14+ years of strategic problem-solving to create a unique engineering perspective.'
    };

    return res.json({
      success: true,
      data: {
        summary: fallbackSummary
      }
    });
  }
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
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
