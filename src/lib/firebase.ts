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
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import type { Topic, JournalSession, CareerProgressData } from '../types';
import firebaseConfigData from '../../firebase-applet-config.json';

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

// Use custom database ID if provisioned, else default
export const db = firebaseConfigData.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Initial Default Topics for Farjana's AI/ML Transition
export const DEFAULT_INITIAL_TOPICS: string[] = [
  'Deep Learning',
  'PyTorch',
  'Transformers',
  'LLM Systems',
  'Fine-Tuning',
  'Mathematics'
];

export const DEFAULT_CAREER_PROGRESS: CareerProgressData = {
  currentStage: 'Intensive Transition & Applied Portfolio Building',
  targetRole: 'AI/ML Engineer',
  yearsInHR: 14,
  learningPlatforms: [
    {
      id: 'ostad',
      name: 'Ostad',
      role: 'Structured AI/ML Curriculum',
      focus: 'End-to-end Machine Learning pipelines, model deployment, and live mentor sessions',
      status: 'In Progress',
      progressPercentage: 78,
      badgeColor: '#00f3ff'
    },
    {
      id: 'codebasics',
      name: 'CodeBasics',
      role: 'Core Foundations & Math',
      focus: 'Python data structures, linear algebra, calculus, and neural network math',
      status: 'Active',
      progressPercentage: 85,
      badgeColor: '#00ff66'
    },
    {
      id: 'google-cloud',
      name: 'Google Cloud Gen AI Academy',
      role: 'Cloud & Scalable AI',
      focus: 'Vertex AI, Gemini models, Cloud Run containerization, and MLOps',
      status: 'In Progress',
      progressPercentage: 70,
      badgeColor: '#9d4edd'
    },
    {
      id: 'codealpha',
      name: 'CodeAlpha',
      role: 'Hands-on Projects & Internships',
      focus: 'Applied NLP architectures, computer vision prototypes, and production APIs',
      status: 'Active',
      progressPercentage: 80,
      badgeColor: '#ff70a6'
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

// --- FIRESTORE USER-SCOPED REPOSITORIES ---

export async function fetchUserTopics(userId: string): Promise<Topic[]> {
  try {
    const topicsRef = collection(db, 'users', userId, 'topics');
    const q = query(topicsRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Seed default topics
      const createdTopics: Topic[] = [];
      for (const topicName of DEFAULT_INITIAL_TOPICS) {
        const newTopicRef = doc(topicsRef);
        const topicData: Topic = {
          id: newTopicRef.id,
          name: topicName,
          createdAt: Date.now(),
          isActive: ['Deep Learning', 'PyTorch', 'Transformers', 'LLM Systems'].includes(topicName)
        };
        await setDoc(newTopicRef, sanitizePayload(topicData));
        createdTopics.push(topicData);
      }
      return createdTopics;
    }

    const rawDocs = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Topic));

    // Deduplicate by name to prevent duplicate keys across legacy or concurrent seeds
    const seenNames = new Set<string>();
    const deduplicated: Topic[] = [];
    for (const t of rawDocs) {
      const lower = t.name ? t.name.trim().toLowerCase() : t.id;
      if (lower && !seenNames.has(lower)) {
        seenNames.add(lower);
        deduplicated.push(t);
      }
    }
    return deduplicated;
  } catch (error) {
    console.error('Error fetching topics:', error);
    return DEFAULT_INITIAL_TOPICS.map((name, i) => ({
      id: `local-${i}`,
      name,
      createdAt: Date.now() + i,
      isActive: i < 4
    }));
  }
}

export async function addFirestoreTopic(userId: string, name: string): Promise<Topic> {
  const topicsRef = collection(db, 'users', userId, 'topics');
  const newTopicRef = doc(topicsRef);
  const newTopic: Topic = {
    id: newTopicRef.id,
    name: name.trim(),
    createdAt: Date.now(),
    isActive: true
  };
  await setDoc(newTopicRef, sanitizePayload(newTopic));
  return newTopic;
}

export async function deleteFirestoreTopic(userId: string, topicId: string): Promise<void> {
  const topicRef = doc(db, 'users', userId, 'topics', topicId);
  await deleteDoc(topicRef);
}

export async function updateFirestoreTopicStatus(userId: string, topicId: string, isActive: boolean): Promise<void> {
  const topicRef = doc(db, 'users', userId, 'topics', topicId);
  await setDoc(topicRef, sanitizePayload({ isActive }), { merge: true });
}

export async function saveJournalSession(userId: string, session: Omit<JournalSession, 'id' | 'userId'>): Promise<string> {
  const sessionsRef = collection(db, 'users', userId, 'sessions');
  const newSessionRef = doc(sessionsRef);
  const fullSession: JournalSession = {
    ...session,
    id: newSessionRef.id,
    userId,
    createdAt: session.createdAt || Date.now()
  };
  await setDoc(newSessionRef, sanitizePayload(fullSession));
  return newSessionRef.id;
}

export async function fetchUserSessions(userId: string): Promise<JournalSession[]> {
  try {
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const q = query(sessionsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as JournalSession));
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
}

export async function fetchCareerProgress(userId: string): Promise<CareerProgressData> {
  try {
    const docRef = doc(db, 'users', userId, 'profile', 'careerProgress');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as CareerProgressData;
      let hasUpdates = false;
      if (Array.isArray(data.learningPlatforms)) {
        const updatedPlatforms = data.learningPlatforms.map(platform => {
          if (platform.name === 'Google Cloud Academy' || platform.id === 'google-cloud') {
            if (platform.name !== 'Google Cloud Gen AI Academy') {
              hasUpdates = true;
              return { ...platform, name: 'Google Cloud Gen AI Academy' };
            }
          }
          return platform;
        });
        if (hasUpdates) {
          data.learningPlatforms = updatedPlatforms;
          await setDoc(docRef, sanitizePayload(data), { merge: true });
        }
      }
      return data;
    } else {
      await setDoc(docRef, sanitizePayload(DEFAULT_CAREER_PROGRESS));
      return DEFAULT_CAREER_PROGRESS;
    }
  } catch (error) {
    console.error('Error fetching career progress:', error);
    return DEFAULT_CAREER_PROGRESS;
  }
}
