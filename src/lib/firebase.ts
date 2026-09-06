import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  initializeFirestore,
  setLogLevel,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  getDocFromServer,
  Unsubscribe
} from 'firebase/firestore';
import type { 
  Topic, 
  JournalSession, 
  JournalLocation,
  CareerProgressData, 
  LearningProgressStats,
  SkillItem,
  ProjectItem,
  GoalItem,
  StudySessionItem,
  AIRecommendationItem,
  CourseItem
} from '../types';
import firebaseConfigData from '../../firebase-applet-config.json';

// --- ENUMS & FIRESTORE ERROR HANDLING ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = getAuth();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth.currentUser?.uid,
      email: currentAuth.currentUser?.email,
      emailVerified: currentAuth.currentUser?.emailVerified,
      isAnonymous: currentAuth.currentUser?.isAnonymous,
      tenantId: currentAuth.currentUser?.tenantId,
      providerInfo: currentAuth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Sanitize payload helper to strictly remove undefined values before Firestore writes
export function sanitizePayload<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_, value) => (value === undefined ? null : value)));
}

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Suppress internal Firestore connection retry warnings in the browser console
try {
  setLogLevel('error');
} catch {
  // Graceful fallback if not supported
}

// Initialize Firestore with long-polling fallback to prevent WebChannel RPC 'Listen' stream transport disconnects behind container reverse proxies
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  firebaseConfigData.firestoreDatabaseId || undefined
);

// Test Firestore connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is currently offline. Operating in cache-first mode.');
    }
    return false;
  }
}
// Execute test asynchronously on load
testConnection().catch(() => {});

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Sign In with Google Error:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// =========================================================================
// DEFAULT DATA SEEDS (Reflecting Farjana's 14+ Yrs HR to AI/ML Journey)
// =========================================================================

export const DEFAULT_INITIAL_TOPICS: string[] = [
  'Deep Learning',
  'PyTorch',
  'Transformers',
  'LLM Systems',
  'Fine-Tuning',
  'Mathematics'
];

export const DEFAULT_LEARNING_STATS: LearningProgressStats = {
  userId: '',
  progressPercentage: 72,
  lessonsCompleted: 48,
  totalLessons: 67,
  totalProjects: 14,
  projectsThisMonth: 4,
  skillsMasteryPercentage: 78,
  strongSkillsCount: 12,
  currentStreakDays: 12,
  bestStreakDays: 18,
  updatedAt: Date.now()
};

export const DEFAULT_CAREER_PROGRESS: CareerProgressData = {
  currentStage: 'Intensive Transition & Applied Portfolio Building',
  targetRole: 'AI/ML Engineer',
  yearsInHR: 14,
  learningPlatforms: [
    {
      id: 'google-cloud',
      name: 'Google Cloud Gen AI Academy',
      role: 'Cloud & Scalable AI',
      focus: 'Vertex AI, Gemini models, Cloud Run containerization, and MLOps',
      status: 'In Progress',
      progressPercentage: 71,
      badgeColor: '#a855f7'
    },
    {
      id: 'codebasics',
      name: 'CodeBasics',
      role: 'Core Foundations & Math',
      focus: 'Python data structures, linear algebra, calculus, and neural network math',
      status: 'Active',
      progressPercentage: 85,
      badgeColor: '#10b981'
    },
    {
      id: 'codealpha',
      name: 'CodeAlpha',
      role: 'Hands-on Projects & Internships',
      focus: 'Applied NLP architectures, computer vision prototypes, and production APIs',
      status: 'Active',
      progressPercentage: 80,
      badgeColor: '#f43f5e'
    },
    {
      id: 'ostad',
      name: 'Ostad',
      role: 'Structured AI/ML Curriculum',
      focus: 'End-to-end Machine Learning pipelines, model deployment, and live mentor sessions',
      status: 'In Progress',
      progressPercentage: 78,
      badgeColor: '#00F0FF'
    }
  ],
  weeklyGoals: [
    'Master Self-Attention and Multi-Head Attention mechanics in PyTorch',
    'Deploy a Gemini 3.7 Flash application with resilient server fallbacks',
    'Synthesize HR talent workflow analogies into AI pipeline architectures'
  ],
  achievements: [
    'Transitioned 14+ years of strategic HR leadership into technical problem-solving mastery',
    'Configured multi-platform AI/ML curriculum across Ostad, CodeBasics, Google Cloud Gen AI Academy & CodeAlpha',
    'Engineered custom AI/ML Career Command Center on Google Cloud'
  ],
  updatedAt: Date.now()
};

export const DEFAULT_SKILLS: Omit<SkillItem, 'userId'>[] = [
  { id: 'skill-python', skill: 'Python & Data Engineering', level: 90, category: 'Fundamentals', platform: 'CodeBasics', verified: true, updatedAt: Date.now() },
  { id: 'skill-math', skill: 'Linear Algebra & Statistics', level: 85, category: 'Theory', platform: 'CodeBasics', verified: true, updatedAt: Date.now() },
  { id: 'skill-pytorch', skill: 'Deep Learning & PyTorch', level: 82, category: 'Core ML', platform: 'Ostad', verified: true, updatedAt: Date.now() },
  { id: 'skill-transformers', skill: 'Transformers & Scaled Attention', level: 78, category: 'Gen AI', platform: 'Ostad / Research', verified: true, updatedAt: Date.now() },
  { id: 'skill-gcp', skill: 'Google Cloud Vertex AI & Run', level: 75, category: 'Cloud Engineering', platform: 'Google Cloud Gen AI Academy', verified: true, updatedAt: Date.now() },
  { id: 'skill-portfolio', skill: 'Production AI Portfolio', level: 70, category: 'Projects', platform: 'CodeAlpha', verified: true, updatedAt: Date.now() }
];

export const DEFAULT_PROJECTS: Omit<ProjectItem, 'userId'>[] = [
  {
    id: 'ai-ml-journal',
    title: 'AI/ML Career Transition & Technical Journal',
    role: 'Full-Stack AI Engineering',
    status: 'Live & Active',
    statusColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    description: 'End-to-end full-stack career transition journal integrating Google Gemini API with fallback ladders, Firebase Authentication, Cloud Firestore real-time state persistence, and responsive glassmorphism UI.',
    stack: ['TypeScript', 'React 18', 'Tailwind CSS', 'Node.js/Express', 'Gemini API', 'Firestore', 'Cloud Run'],
    achievements: [
      'Multi-model fallback ladder across Gemini 3.6 Flash and Gemini 3.1 Flash Lite with exponential backoff',
      'Owner-bound Firestore document isolation and real-time reflection persistence',
      'High-density dashboard with SVG circuit illustrations and interactive prompt matrix'
    ],
    prompt: 'Can you help me formulate bullet points for my AI/ML Career Transition Journal project on my resume and GitHub README?',
    updatedAt: Date.now()
  },
  {
    id: 'rag-talent-intelligence',
    title: 'Talent & HR Algorithmic Intelligence Engine',
    role: 'RAG & Hybrid Search',
    status: 'In Development',
    statusColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    description: 'Bridging 14+ years of HR talent management into computational vector retrieval. Converts job architecture, competency matrices, and employee retention factors into dense embeddings for semantic skill matching.',
    stack: ['PyTorch', 'Hugging Face', 'Qdrant / ChromaDB', 'LangChain', 'FastAPI', 'Docker'],
    achievements: [
      'Custom domain chunking preserving hierarchical organizational job families',
      'Hybrid BM25 + dense cosine similarity retrieval pipeline for multi-competency scoring',
      'HR policy compliance safeguards preventing gender and demographic bias'
    ],
    prompt: 'Help me architect the retrieval pipeline for the Talent Intelligence Engine using hybrid dense-sparse vector search.',
    updatedAt: Date.now()
  },
  {
    id: 'pytorch-attention-from-scratch',
    title: 'PyTorch Multi-Head Attention & Transformer From Scratch',
    role: 'Core Deep Learning',
    status: 'Completed',
    statusColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    description: 'Clean from-scratch implementation of the Transformer architecture following Vaswani et al. Scaled dot-product attention, multi-head projection layers, layer normalization, and autoregressive causal masking.',
    stack: ['Python', 'PyTorch', 'NumPy', 'Matplotlib', 'Weights & Biases'],
    achievements: [
      'Explicit tensor dimensional transformations [B, T, C] -> [B, NH, T, HS]',
      'Rotary Positional Embeddings (RoPE) and causal triangular attention masking',
      'Trained character-level Shakespeare language model achieving low cross-entropy validation loss'
    ],
    prompt: 'Explain how to write a unit test suite verifying that causal masking in my PyTorch Multi-Head Attention block never leaks future tokens.',
    updatedAt: Date.now()
  },
  {
    id: 'gcp-vertex-deployer',
    title: 'GCP Vertex AI & Cloud Run Serverless Inference Pipeline',
    role: 'MLOps & Cloud',
    status: 'Completed',
    statusColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    description: 'Automated CI/CD deployment blueprint packaging containerized Gen AI microservices to Google Cloud Run with Secret Manager and IAM least-privilege service accounts.',
    stack: ['Google Cloud Run', 'Vertex AI', 'Docker', 'Secret Manager', 'Google Cloud IAM', 'GitHub Actions'],
    achievements: [
      'Sub-second container cold-starts using optimized alpine base images',
      'Zero hardcoded API secrets with dynamic Secret Manager mounting',
      'Automated health checks, structured logging, and concurrency scaling up to 80 req/instance'
    ],
    prompt: 'What are the top MLOps interview questions regarding Cloud Run deployment, latency optimization, and Secret Manager access?',
    updatedAt: Date.now()
  }
];

export const DEFAULT_STUDY_SESSIONS: Omit<StudySessionItem, 'userId'>[] = [
  {
    id: 'day-1',
    dayNumber: 1,
    dateLabel: 'Yesterday (Day 1)',
    isToday: false,
    isYesterday: true,
    status: 'completed',
    title: 'AI/ML App Launch & Math Foundations',
    focusTopics: ['Python for AI', 'Linear Algebra', 'Gaussian Distribution', 'GCP Setup'],
    hoursLogged: 3.5,
    milestone: 'Initialized Career Transition Journal & completed CodeBasics math module',
    platform: 'CodeBasics & Google Cloud',
    journalLogged: true,
    completedAt: Date.now() - 86400000,
    createdAt: Date.now() - 86400000
  },
  {
    id: 'day-2',
    dayNumber: 2,
    dateLabel: 'Today (Day 2)',
    isToday: true,
    isYesterday: false,
    status: 'in_progress',
    title: 'Deep Learning & Self-Attention Mechanics',
    focusTopics: ['PyTorch Tensors', 'Scaled Dot-Product Attention', 'QKV Dimension Projections'],
    hoursLogged: 2.5,
    milestone: 'Constructed single-head self-attention layer & verified tensor shapes',
    platform: 'Ostad & CodeAlpha',
    journalLogged: true,
    createdAt: Date.now()
  },
  {
    id: 'day-3',
    dayNumber: 3,
    dateLabel: 'Tomorrow (Day 3)',
    isToday: false,
    isYesterday: false,
    status: 'upcoming',
    title: 'Multi-Head Attention & Transformer Encoders',
    focusTopics: ['Multi-Head Projections', 'LayerNorm & Residuals', 'Positional Encoding'],
    hoursLogged: 0,
    milestone: 'Assemble 4-head attention block and run test sentence forward pass',
    platform: 'Ostad AI/ML Masterclass',
    journalLogged: false,
    createdAt: Date.now()
  },
  {
    id: 'day-4',
    dayNumber: 4,
    dateLabel: 'Day 4 (Upcoming)',
    isToday: false,
    isYesterday: false,
    status: 'upcoming',
    title: 'Transformer Decoders & Autoregressive Gen',
    focusTopics: ['Causal Masking', 'KV Caching', 'Greedy vs Beam Search'],
    hoursLogged: 0,
    milestone: 'Implement causal decoding mask and generate tokens step-by-step',
    platform: 'Google Cloud Gen AI Academy',
    journalLogged: false,
    createdAt: Date.now()
  },
  {
    id: 'day-5',
    dayNumber: 5,
    dateLabel: 'Day 5 (Upcoming)',
    isToday: false,
    isYesterday: false,
    status: 'upcoming',
    title: 'Fine-Tuning & Parameter-Efficient LoRA',
    focusTopics: ['PEFT / LoRA', 'Hugging Face Transformers', 'Quantization QLoRA'],
    hoursLogged: 0,
    milestone: 'Fine-tune small open-weight LLM on custom domain instruction dataset',
    platform: 'CodeAlpha & Ostad',
    journalLogged: false,
    createdAt: Date.now()
  },
  {
    id: 'day-6',
    dayNumber: 6,
    dateLabel: 'Day 6 (Upcoming)',
    isToday: false,
    isYesterday: false,
    status: 'upcoming',
    title: 'End-to-End AI/ML Portfolio Application',
    focusTopics: ['FastAPI Backend', 'PyTorch Inference API', 'Docker Container'],
    hoursLogged: 0,
    milestone: 'Package sentiment reasoning model as a production containerized API',
    platform: 'CodeAlpha Applied Projects',
    journalLogged: false,
    createdAt: Date.now()
  },
  {
    id: 'day-7',
    dayNumber: 7,
    dateLabel: 'Day 7 (Upcoming)',
    isToday: false,
    isYesterday: false,
    status: 'upcoming',
    title: 'Cloud Run Deployment & Career Synthesis',
    focusTopics: ['Google Cloud Run', 'Secret Manager', 'Resume Synthesis', 'HR domain AI'],
    hoursLogged: 0,
    milestone: 'Deploy portfolio API to Cloud Run and document technical case study',
    platform: 'Google Cloud & Portfolio',
    journalLogged: false,
    createdAt: Date.now()
  }
];

export const DEFAULT_GOALS: Omit<GoalItem, 'userId'>[] = [
  {
    id: 'goal-1',
    title: 'Master Self-Attention and Multi-Head Attention mechanics in PyTorch',
    category: 'weekly',
    targetDate: 'End of Week',
    completed: true,
    completedAt: Date.now() - 3600000,
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'goal-2',
    title: 'Deploy a Gemini 3.7 Flash application with resilient server fallbacks',
    category: 'weekly',
    targetDate: 'This Weekend',
    completed: true,
    completedAt: Date.now() - 1800000,
    createdAt: Date.now() - 86400000
  },
  {
    id: 'goal-3',
    title: 'Synthesize HR talent workflow analogies into AI pipeline architectures',
    category: 'career',
    targetDate: 'Ongoing',
    completed: false,
    createdAt: Date.now()
  }
];

export const DEFAULT_AI_RECOMMENDATIONS: Omit<AIRecommendationItem, 'userId'>[] = [
  {
    id: 'rec-1',
    title: 'Deep-Dive: PyTorch Vectorized Operations over Loops',
    category: 'Optimization Tip',
    advice: 'When preprocessing text token sequences or calculating loss tensors, replace explicit Python loops with batch matrix broadcasting (`torch.bmm` or `torch.einsum`). This delivers 10x-50x speedups on GPU.',
    actionableSteps: [
      'Refactor attention score matrix multiplications into batched operations',
      'Benchmark forward pass execution time using `torch.cuda.Event`'
    ],
    relatedTopics: ['PyTorch', 'Transformers', 'Deep Learning'],
    createdAt: Date.now()
  },
  {
    id: 'rec-2',
    title: 'Career Synergy: Frame 14+ Years HR Experience in AI System Design',
    category: 'Interview Strategy',
    advice: 'Highlight how your deep understanding of human evaluation rubrics and talent metrics translates directly into designing better loss functions, alignment feedback loops (RLHF/DPO), and semantic RAG filtering.',
    actionableSteps: [
      'Document your Talent Intelligence Engine case study',
      'Explain domain chunking vs naive token chunking during technical interviews'
    ],
    relatedTopics: ['LLM Systems', 'Career Transition', 'Fine-Tuning'],
    createdAt: Date.now()
  }
];

// =========================================================================
// FIRESTORE USER-SCOPED REPOSITORIES & REALTIME SYNCHRONIZERS
// =========================================================================

/**
 * Bootstrap and seed all Firestore collections for a newly authenticated user.
 */
export async function bootstrapUserData(userId: string): Promise<void> {
  if (!userId) return;

  try {
    // 0. Ensure root user document exists with default 'user' role
    const userRootRef = doc(db, 'users', userId);
    const userRootSnap = await getDoc(userRootRef);

    if (!userRootSnap.exists()) {
      await setDoc(userRootRef, sanitizePayload({
        userId,
        email: auth.currentUser?.email || '',
        displayName: auth.currentUser?.displayName || (auth.currentUser?.email ? auth.currentUser.email.split('@')[0] : 'User'),
        photoURL: auth.currentUser?.photoURL || '',
        role: 'user', // Always defaults to standard 'user'
        createdAt: Date.now(),
        lastActiveAt: Date.now()
      }));
    } else {
      // Update activity timestamp without touching role
      await setDoc(userRootRef, sanitizePayload({
        lastActiveAt: Date.now(),
        email: auth.currentUser?.email || undefined,
        displayName: auth.currentUser?.displayName || undefined,
        photoURL: auth.currentUser?.photoURL || undefined
      }), { merge: true });
    }

    const profileRef = doc(db, 'users', userId, 'profile', 'careerProgress');
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      // 1. Profile / Career Progress
      await setDoc(profileRef, sanitizePayload({
        ...DEFAULT_CAREER_PROGRESS,
        userId,
        updatedAt: Date.now()
      }));

      // 2. Learning Progress Stats
      const statsRef = doc(db, 'users', userId, 'learningProgress', 'overview');
      await setDoc(statsRef, sanitizePayload({
        ...DEFAULT_LEARNING_STATS,
        userId,
        updatedAt: Date.now()
      }));

      // 3. Topics
      const topicsRef = collection(db, 'users', userId, 'topics');
      for (let i = 0; i < DEFAULT_INITIAL_TOPICS.length; i++) {
        const topicName = DEFAULT_INITIAL_TOPICS[i];
        const newTopicRef = doc(topicsRef);
        await setDoc(newTopicRef, sanitizePayload({
          id: newTopicRef.id,
          userId,
          name: topicName,
          createdAt: Date.now() + i,
          isActive: ['Deep Learning', 'PyTorch', 'Transformers', 'LLM Systems'].includes(topicName)
        }));
      }

      // 4. Skills
      for (const skill of DEFAULT_SKILLS) {
        const skillRef = doc(db, 'users', userId, 'skills', skill.id);
        await setDoc(skillRef, sanitizePayload({ ...skill, userId }));
      }

      // 5. Projects
      for (const project of DEFAULT_PROJECTS) {
        const projRef = doc(db, 'users', userId, 'projects', project.id);
        await setDoc(projRef, sanitizePayload({ ...project, userId }));
      }

      // 6. Goals
      for (const goal of DEFAULT_GOALS) {
        const goalRef = doc(db, 'users', userId, 'goals', goal.id);
        await setDoc(goalRef, sanitizePayload({ ...goal, userId }));
      }

      // 7. Study Sessions
      for (const session of DEFAULT_STUDY_SESSIONS) {
        const studyRef = doc(db, 'users', userId, 'studySessions', session.id);
        await setDoc(studyRef, sanitizePayload({ ...session, userId }));
      }

      // 8. AI Recommendations
      for (const rec of DEFAULT_AI_RECOMMENDATIONS) {
        const recRef = doc(db, 'users', userId, 'aiRecommendations', rec.id);
        await setDoc(recRef, sanitizePayload({ ...rec, userId }));
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
}

/**
 * Realtime listener for root user document and role.
 */
export function subscribeUserAccount(userId: string, callback: (account: any | null) => void): Unsubscribe {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
  });
}

// -------------------------------------------------------------------------
// TOPICS REPOSITORY
// -------------------------------------------------------------------------

export async function fetchUserTopics(userId: string): Promise<Topic[]> {
  const path = `users/${userId}/topics`;
  try {
    const topicsRef = collection(db, 'users', userId, 'topics');
    const q = query(topicsRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      await bootstrapUserData(userId);
      const seededSnap = await getDocs(q);
      return seededSnap.docs.map(d => ({ id: d.id, ...d.data() } as Topic));
    }

    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Topic));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export function subscribeUserTopics(userId: string, callback: (topics: Topic[]) => void): Unsubscribe {
  const path = `users/${userId}/topics`;
  const topicsRef = collection(db, 'users', userId, 'topics');
  const q = query(topicsRef, orderBy('createdAt', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const topics = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Topic));
    callback(topics);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function addFirestoreTopic(userId: string, name: string): Promise<Topic> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Topic name cannot be empty');
  
  const path = `users/${userId}/topics`;
  try {
    const topicsRef = collection(db, 'users', userId, 'topics');
    const newTopicRef = doc(topicsRef);
    const newTopic: Topic = {
      id: newTopicRef.id,
      name: trimmed,
      createdAt: Date.now(),
      isActive: true
    };
    await setDoc(newTopicRef, sanitizePayload({ ...newTopic, userId }));
    return newTopic;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function deleteFirestoreTopic(userId: string, topicId: string): Promise<void> {
  const path = `users/${userId}/topics/${topicId}`;
  try {
    const topicRef = doc(db, 'users', userId, 'topics', topicId);
    await deleteDoc(topicRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateFirestoreTopicStatus(userId: string, topicId: string, isActive: boolean): Promise<void> {
  const path = `users/${userId}/topics/${topicId}`;
  try {
    const topicRef = doc(db, 'users', userId, 'topics', topicId);
    await setDoc(topicRef, sanitizePayload({ isActive, updatedAt: Date.now() }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// -------------------------------------------------------------------------
// JOURNAL ENTRIES & SESSIONS REPOSITORY
// -------------------------------------------------------------------------

export async function saveJournalSession(userId: string, session: Omit<JournalSession, 'id' | 'userId'>): Promise<string> {
  const path = `users/${userId}/sessions`;
  try {
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const newSessionRef = doc(sessionsRef);
    const fullSession: JournalSession = {
      ...session,
      id: newSessionRef.id,
      userId,
      createdAt: session.createdAt || Date.now()
    };
    await setDoc(newSessionRef, sanitizePayload(fullSession));

    // Also persist duplicate to journalEntries subcollection for parity
    const journalRef = doc(db, 'users', userId, 'journalEntries', newSessionRef.id);
    await setDoc(journalRef, sanitizePayload(fullSession));

    return newSessionRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function fetchUserSessions(userId: string, limitCount?: number): Promise<JournalSession[]> {
  const path = `users/${userId}/sessions`;
  try {
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const q = query(sessionsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as JournalSession));

    if (limitCount && limitCount > 0) {
      return sessions.slice(0, limitCount);
    }
    return sessions;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function updateJournalSessionLocation(
  userId: string, 
  sessionId: string, 
  location: JournalLocation | null
): Promise<void> {
  const path = `users/${userId}/sessions/${sessionId}`;
  try {
    const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
    const journalRef = doc(db, 'users', userId, 'journalEntries', sessionId);
    
    const updateData = location 
      ? sanitizePayload({ location, updatedAt: Date.now() }) 
      : { location: null, updatedAt: Date.now() };

    await setDoc(sessionRef, updateData, { merge: true });
    await setDoc(journalRef, updateData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export function subscribeUserSessions(userId: string, callback: (sessions: JournalSession[]) => void): Unsubscribe {
  const path = `users/${userId}/sessions`;
  const sessionsRef = collection(db, 'users', userId, 'sessions');
  const q = query(sessionsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const sessions = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as JournalSession));
    callback(sessions);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

// -------------------------------------------------------------------------
// CAREER PROGRESS & PROFILE REPOSITORY
// -------------------------------------------------------------------------

export async function fetchCareerProgress(userId: string): Promise<CareerProgressData> {
  const path = `users/${userId}/profile/careerProgress`;
  try {
    const docRef = doc(db, 'users', userId, 'profile', 'careerProgress');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as CareerProgressData;
    } else {
      await bootstrapUserData(userId);
      return DEFAULT_CAREER_PROGRESS;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return DEFAULT_CAREER_PROGRESS;
  }
}

export function subscribeCareerProgress(userId: string, callback: (data: CareerProgressData) => void): Unsubscribe {
  const path = `users/${userId}/profile/careerProgress`;
  const docRef = doc(db, 'users', userId, 'profile', 'careerProgress');

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as CareerProgressData);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export async function updateCareerProgress(userId: string, data: Partial<CareerProgressData>): Promise<void> {
  const path = `users/${userId}/profile/careerProgress`;
  try {
    const docRef = doc(db, 'users', userId, 'profile', 'careerProgress');
    await setDoc(docRef, sanitizePayload({ ...data, updatedAt: Date.now() }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// -------------------------------------------------------------------------
// LEARNING PROGRESS STATS (OVERVIEW) REPOSITORY
// -------------------------------------------------------------------------

export async function fetchLearningStats(userId: string): Promise<LearningProgressStats> {
  const path = `users/${userId}/learningProgress/overview`;
  try {
    const docRef = doc(db, 'users', userId, 'learningProgress', 'overview');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as LearningProgressStats;
    } else {
      return { ...DEFAULT_LEARNING_STATS, userId };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return { ...DEFAULT_LEARNING_STATS, userId };
  }
}

export function subscribeLearningStats(userId: string, callback: (stats: LearningProgressStats) => void): Unsubscribe {
  const path = `users/${userId}/learningProgress/overview`;
  const docRef = doc(db, 'users', userId, 'learningProgress', 'overview');

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as LearningProgressStats);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

export async function updateLearningStats(userId: string, stats: Partial<LearningProgressStats>): Promise<void> {
  const path = `users/${userId}/learningProgress/overview`;
  try {
    const docRef = doc(db, 'users', userId, 'learningProgress', 'overview');
    await setDoc(docRef, sanitizePayload({ ...stats, updatedAt: Date.now() }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// -------------------------------------------------------------------------
// SKILLS REPOSITORY
// -------------------------------------------------------------------------

export async function fetchUserSkills(userId: string): Promise<SkillItem[]> {
  const path = `users/${userId}/skills`;
  try {
    const skillsRef = collection(db, 'users', userId, 'skills');
    const snapshot = await getDocs(skillsRef);
    if (snapshot.empty) {
      await bootstrapUserData(userId);
      const seededSnap = await getDocs(skillsRef);
      return seededSnap.docs.map(d => ({ id: d.id, ...d.data() } as SkillItem));
    }
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SkillItem));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export function subscribeUserSkills(userId: string, callback: (skills: SkillItem[]) => void): Unsubscribe {
  const path = `users/${userId}/skills`;
  const skillsRef = collection(db, 'users', userId, 'skills');

  return onSnapshot(skillsRef, (snapshot) => {
    const skills = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SkillItem));
    callback(skills);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function updateSkillLevel(userId: string, skillId: string, level: number): Promise<void> {
  const path = `users/${userId}/skills/${skillId}`;
  try {
    const skillRef = doc(db, 'users', userId, 'skills', skillId);
    await setDoc(skillRef, sanitizePayload({ level, updatedAt: Date.now() }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// -------------------------------------------------------------------------
// PROJECTS REPOSITORY
// -------------------------------------------------------------------------

export async function fetchUserProjects(userId: string): Promise<ProjectItem[]> {
  const path = `users/${userId}/projects`;
  try {
    const projectsRef = collection(db, 'users', userId, 'projects');
    const snapshot = await getDocs(projectsRef);
    if (snapshot.empty) {
      await bootstrapUserData(userId);
      const seededSnap = await getDocs(projectsRef);
      return seededSnap.docs.map(d => ({ id: d.id, ...d.data() } as ProjectItem));
    }
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ProjectItem));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export function subscribeUserProjects(userId: string, callback: (projects: ProjectItem[]) => void): Unsubscribe {
  const path = `users/${userId}/projects`;
  const projectsRef = collection(db, 'users', userId, 'projects');

  return onSnapshot(projectsRef, (snapshot) => {
    const projects = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ProjectItem));
    callback(projects);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function updateProjectStatus(userId: string, projectId: string, status: string, statusColor?: string): Promise<void> {
  const path = `users/${userId}/projects/${projectId}`;
  try {
    const projRef = doc(db, 'users', userId, 'projects', projectId);
    const payload: Record<string, any> = { status, updatedAt: Date.now() };
    if (statusColor) payload.statusColor = statusColor;
    await setDoc(projRef, sanitizePayload(payload), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// -------------------------------------------------------------------------
// GOALS REPOSITORY
// -------------------------------------------------------------------------

export async function fetchUserGoals(userId: string): Promise<GoalItem[]> {
  const path = `users/${userId}/goals`;
  try {
    const goalsRef = collection(db, 'users', userId, 'goals');
    const q = query(goalsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      await bootstrapUserData(userId);
      const seededSnap = await getDocs(q);
      return seededSnap.docs.map(d => ({ id: d.id, ...d.data() } as GoalItem));
    }
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GoalItem));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export function subscribeUserGoals(userId: string, callback: (goals: GoalItem[]) => void): Unsubscribe {
  const path = `users/${userId}/goals`;
  const goalsRef = collection(db, 'users', userId, 'goals');
  const q = query(goalsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const goals = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GoalItem));
    callback(goals);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function toggleGoalCompletion(userId: string, goalId: string, completed: boolean): Promise<void> {
  const path = `users/${userId}/goals/${goalId}`;
  try {
    const goalRef = doc(db, 'users', userId, 'goals', goalId);
    await setDoc(goalRef, sanitizePayload({
      completed,
      completedAt: completed ? Date.now() : null
    }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function addGoal(userId: string, title: string, category: 'weekly' | 'milestone' | 'career' = 'weekly'): Promise<GoalItem> {
  const path = `users/${userId}/goals`;
  try {
    const goalsRef = collection(db, 'users', userId, 'goals');
    const newGoalRef = doc(goalsRef);
    const newGoal: GoalItem = {
      id: newGoalRef.id,
      userId,
      title: title.trim(),
      category,
      completed: false,
      createdAt: Date.now()
    };
    await setDoc(newGoalRef, sanitizePayload(newGoal));
    return newGoal;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

// -------------------------------------------------------------------------
// DAILY STUDY SESSIONS REPOSITORY
// -------------------------------------------------------------------------

export async function fetchStudySessions(userId: string): Promise<StudySessionItem[]> {
  const path = `users/${userId}/studySessions`;
  try {
    const sessionsRef = collection(db, 'users', userId, 'studySessions');
    const q = query(sessionsRef, orderBy('dayNumber', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      await bootstrapUserData(userId);
      const seededSnap = await getDocs(q);
      return seededSnap.docs.map(d => ({ id: d.id, ...d.data() } as StudySessionItem));
    }
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as StudySessionItem));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export function subscribeStudySessions(userId: string, callback: (sessions: StudySessionItem[]) => void): Unsubscribe {
  const path = `users/${userId}/studySessions`;
  const sessionsRef = collection(db, 'users', userId, 'studySessions');
  const q = query(sessionsRef, orderBy('dayNumber', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const sessions = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as StudySessionItem));
    callback(sessions);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function updateStudySessionHours(userId: string, sessionId: string, hoursLogged: number): Promise<void> {
  const path = `users/${userId}/studySessions/${sessionId}`;
  try {
    const studyRef = doc(db, 'users', userId, 'studySessions', sessionId);
    await setDoc(studyRef, sanitizePayload({ hoursLogged, journalLogged: true }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateStudySessionStatus(userId: string, sessionId: string, status: 'completed' | 'in_progress' | 'upcoming'): Promise<void> {
  const path = `users/${userId}/studySessions/${sessionId}`;
  try {
    const studyRef = doc(db, 'users', userId, 'studySessions', sessionId);
    await setDoc(studyRef, sanitizePayload({ 
      status, 
      completedAt: status === 'completed' ? Date.now() : null 
    }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// -------------------------------------------------------------------------
// AI RECOMMENDATIONS REPOSITORY
// -------------------------------------------------------------------------

export async function fetchAIRecommendations(userId: string): Promise<AIRecommendationItem[]> {
  const path = `users/${userId}/aiRecommendations`;
  try {
    const recsRef = collection(db, 'users', userId, 'aiRecommendations');
    const snapshot = await getDocs(recsRef);
    if (snapshot.empty) {
      await bootstrapUserData(userId);
      const seededSnap = await getDocs(recsRef);
      return seededSnap.docs.map(d => ({ id: d.id, ...d.data() } as AIRecommendationItem));
    }
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AIRecommendationItem));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export function subscribeAIRecommendations(userId: string, callback: (recs: AIRecommendationItem[]) => void): Unsubscribe {
  const path = `users/${userId}/aiRecommendations`;
  const recsRef = collection(db, 'users', userId, 'aiRecommendations');

  return onSnapshot(recsRef, (snapshot) => {
    const recs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AIRecommendationItem));
    callback(recs);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}
