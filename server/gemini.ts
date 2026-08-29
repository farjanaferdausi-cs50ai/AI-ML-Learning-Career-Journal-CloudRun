import { GoogleGenAI } from '@google/genai';

// Initialize GoogleGenAI lazily with GEMINI_API_KEY from environment
let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({ 
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Resilient Model Fallback Ladder according to Gemini API guidance and production directives:
// Primary: gemini-3.6-flash, High-Availability: gemini-3.1-flash-lite, Dynamic: gemini-flash-latest, Reasoning: gemini-3.7-flash
const defaultModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const BASE_FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
  'gemini-3.1-pro-preview'
];

// Ensure configured model is first in the ladder without duplicates
const MODEL_FALLBACK_LADDER = [
  defaultModel,
  ...BASE_FALLBACK_MODELS.filter(m => m !== defaultModel)
];

// Helper to delay for backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateWithFallback(params: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: any;
  temperature?: number;
  topP?: number;
  topK?: number;
  candidateCount?: number;
  thinkingLevel?: string;
  thinkingConfig?: any;
}): Promise<string> {
  const ai = getGenAI();
  let lastError: any = null;

  for (const modelName of MODEL_FALLBACK_LADDER) {
    // Up to 2 quick retry attempts per model with exponential backoff on 503 / 429
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const config: any = {};
        if (params.systemInstruction) {
          config.systemInstruction = params.systemInstruction;
        }
        if (params.responseMimeType) {
          config.responseMimeType = params.responseMimeType;
        }
        if (params.responseSchema) {
          config.responseSchema = params.responseSchema;
        }
        if (typeof params.temperature === 'number') {
          config.temperature = params.temperature;
        }
        if (typeof params.topP === 'number') {
          config.topP = params.topP;
        }
        if (typeof params.topK === 'number') {
          config.topK = params.topK;
        }
        if (typeof params.candidateCount === 'number') {
          config.candidateCount = params.candidateCount;
        }

        // Configure thinking level only for Gemini 3 models that support thinking
        if (modelName === 'gemini-3.7-flash' || modelName.includes('thinking')) {
          const thinkingLevel = params.thinkingLevel || params.thinkingConfig?.thinkingLevel || 'medium';
          config.thinkingConfig = {
            thinkingLevel: thinkingLevel.toUpperCase() === 'HIGH' ? 'HIGH' : thinkingLevel.toUpperCase() === 'LOW' ? 'LOW' : 'LOW'
          };
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config
        });

        if (response && typeof response.text === 'string' && response.text.length > 0) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`[Gemini Fallback] Model ${modelName} (attempt ${attempt}/2) failed: ${errMsg}`);

        const isDemandSpikeOrRateLimit = 
          errMsg.includes('503') || 
          errMsg.includes('high demand') || 
          errMsg.includes('UNAVAILABLE') || 
          errMsg.includes('429') || 
          errMsg.includes('RESOURCE_EXHAUSTED');

        if (isDemandSpikeOrRateLimit && attempt < 2) {
          // Brief backoff before retry or switching model
          await delay(attempt * 400);
          continue;
        }

        // Break attempt loop to move immediately to the next model in the fallback ladder
        break;
      }
    }
  }

  throw new Error(`All Gemini models failed in fallback ladder. Last error: ${lastError?.message || 'Unknown error'}`);
}

export const COACH_SYSTEM_INSTRUCTION = `You are the specialized AI/ML Career & Technical Coach for Farjana Ferdausi.
Farjana is an ambitious professional transitioning from a distinguished 14+ years career in Human Resources to full-time AI/ML Engineering.
She is currently studying concurrently across 4 key platforms:
1. Ostad (Structured AI/ML Curriculum & live applied mentorship)
2. CodeBasics (Foundational data science, Python, linear algebra & calculus)
3. Google Cloud Gen AI Academy (Cloud architectures, Vertex AI, Gemini models, containerization)
4. CodeAlpha (Practical AI/ML internship projects & portfolio implementations)

YOUR OBJECTIVES & PERSONA:
- Persona: Elite AI/ML Technical Mentor & Career Strategist. Encouraging, rigorous, pragmatic, and visionary.
- Pedagogical Bridge: Leverage Farjana's 14+ years of HR mastery (systems thinking, talent evaluation, organizational structures, pipeline optimization) as intuitive conceptual analogies to explain complex machine learning concepts (e.g. self-attention is like cross-functional talent routing, loss gradients are performance feedback loops, dropout is team resilience, transformers are distributed organizational communication matrices).
- Technical Depth: Provide production-grade, clear PyTorch / Python code snippets, mathematical foundations (vectors, matrices, gradients), and architectural breakdowns when asked.
- Career Encouragement: Recognize the immense value of domain expertise and leadership maturity she brings to AI/ML engineering.
- Formatting: Use elegant, well-structured Markdown with clean headers, bullet points, and syntax-highlighted code blocks. Keep responses engaging and directly actionable. Always refer to "AI/ML" explicitly in your advice.`;

export const SUMMARIZER_SYSTEM_INSTRUCTION = `You are an expert AI/ML technical evaluation assistant.
Your task is to analyze a study/mentoring session between Farjana Ferdausi and her AI/ML Coach, and output a structured JSON summary reflecting her technical gains and career transition progress from HR to AI/ML Engineering.

You MUST respond strictly with a valid JSON object adhering to this schema:
{
  "whatWasLearned": ["array of specific concepts learned"],
  "whatWasWorkedOn": "concise description of the topic or problem tackled",
  "whatWasDifficult": "the primary friction point or challenging conceptual leap resolved",
  "whatWasAccomplished": "concrete technical milestone or realization achieved",
  "keyTakeaway": "core conceptual takeaway in 1-2 powerful sentences",
  "actionableGoalTomorrow": "one concrete, realistic study/coding task for tomorrow's session",
  "careerTransitionProgressNote": "motivational insight connecting today's progress to her 14+ year HR to AI/ML engineering transition"
}`;
