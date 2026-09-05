import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { User } from 'firebase/auth';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { RoleTargetBar } from './components/RoleTargetBar';
import { KeyStatsRow } from './components/KeyStatsRow';
import { CurriculumSection } from './components/CurriculumSection';
import { DailyStudyTrack, StudyDay } from './components/DailyStudyTrack';
import { TopicManager } from './components/TopicManager';
import { AICoachChat } from './components/AICoachChat';
import { QuickActionsFocusRow } from './components/QuickActionsFocusRow';
import { LearningTimeline } from './components/LearningTimeline';
import { BottomNavBar } from './components/BottomNavBar';
import { MobileDrawer } from './components/MobileDrawer';
import { ToastProvider, useToast } from './components/common/SuccessFeedback';
import { AnalyticsSkeleton, LoadingState } from './components/common/LoadingState';

import { ProactiveCoachSuggestion } from './components/ProactiveCoachSuggestion';
import { WeakSkillsCard } from './components/WeakSkillsCard';
import { CareerIntelligenceCard } from './components/CareerIntelligenceCard';
import { TrendsView } from './components/TrendsView';
import { SmartStudyPlanner } from './components/SmartStudyPlanner';
import { DashboardView } from './components/DashboardView';
import { AchievementsView } from './components/AchievementsView';

// Lazy-loaded secondary tab views and modals for optimal bundle splitting
const RoadmapView = React.lazy(() => import('./components/RoadmapView').then(m => ({ default: m.RoadmapView })));
const ExploreView = React.lazy(() => import('./components/ExploreView').then(m => ({ default: m.ExploreView })));
const PortfolioView = React.lazy(() => import('./components/PortfolioView').then(m => ({ default: m.PortfolioView })));
const ResourcesView = React.lazy(() => import('./components/ResourcesView').then(m => ({ default: m.ResourcesView })));
const CommunityView = React.lazy(() => import('./components/CommunityView').then(m => ({ default: m.CommunityView })));
const SettingsView = React.lazy(() => import('./components/SettingsView').then(m => ({ default: m.SettingsView })));
const ProgressView = React.lazy(() => import('./components/ProgressView').then(m => ({ default: m.ProgressView })));
const AnalyticsView = React.lazy(() => import('./components/AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const AdminDashboardView = React.lazy(() => import('./components/AdminDashboardView').then(m => ({ default: m.AdminDashboardView })));
const SessionSummaryModal = React.lazy(() => import('./components/SessionSummaryModal').then(m => ({ default: m.SessionSummaryModal })));
const SignOutModal = React.lazy(() => import('./components/SignOutModal').then(m => ({ default: m.SignOutModal })));
const AuthModal = React.lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));

import { 
  subscribeToAuth, 
  signInWithGoogle, 
  signOutUser,
  subscribeUserAccount,
  subscribeUserTopics,
  addFirestoreTopic,
  deleteFirestoreTopic,
  updateFirestoreTopicStatus,
  saveJournalSession,
  updateJournalSessionLocation,
  subscribeUserSessions,
  subscribeCareerProgress,
  subscribeLearningStats,
  updateLearningStats,
  subscribeUserSkills,
  updateSkillLevel,
  subscribeUserProjects,
  updateProjectStatus,
  subscribeUserGoals,
  toggleGoalCompletion,
  addGoal,
  subscribeStudySessions,
  updateStudySessionStatus,
  subscribeAIRecommendations,
  DEFAULT_CAREER_PROGRESS,
  DEFAULT_LEARNING_STATS,
  DEFAULT_INITIAL_TOPICS,
  DEFAULT_SKILLS,
  DEFAULT_PROJECTS,
  DEFAULT_STUDY_SESSIONS,
  DEFAULT_GOALS
} from './lib/firebase';
import { dispatchJournalNotifications } from './lib/notificationsApi';

import type { 
  ChatMessage, 
  SessionSummary, 
  JournalSession, 
  JournalLocation,
  Topic, 
  CareerProgressData,
  LearningProgressStats,
  SkillItem,
  ProjectItem,
  GoalItem,
  StudySessionItem,
  AIRecommendationItem,
  GenerationConfig,
  ProactiveFocusSuggestion,
  WeakSkillItem,
  CareerIntelligenceData,
  JournalTrendsAnalysis,
  UserRole
} from './types';
import { fetchServerIdentity } from './lib/adminApi';

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

function AppContent() {
  const { notifySave, notifyUpdate, notifyDelete, notifyJournalCreated, notifyGoalComplete, showToast } = useToast();

  // Authentication State & Role-Based Access Control (RBAC)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  // Global Sync Error state
  const [syncError, setSyncError] = useState<string | null>(null);

  // Theme State ('dark' | 'light') with session & localStorage persistence
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('aiml_journal_theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('aiml_journal_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark');
        document.body.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
        document.documentElement.classList.add('dark');
        document.body.classList.remove('light-theme');
      }
    } catch (e) {
      console.error('Failed to sync theme to localStorage:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // State Collections for User / App Data
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [careerData, setCareerData] = useState<CareerProgressData>(DEFAULT_CAREER_PROGRESS);
  const [learningStats, setLearningStats] = useState<LearningProgressStats>(DEFAULT_LEARNING_STATS);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [studySessions, setStudySessions] = useState<StudySessionItem[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendationItem[]>([]);

  // Active Chat Session State
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>({
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    candidateCount: 1,
    thinkingLevel: 'medium'
  });

  // Historical Sessions State
  const [sessions, setSessions] = useState<JournalSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Completed Session Summary Modal State
  const [activeSummary, setActiveSummary] = useState<SessionSummary | null>(null);
  const [summaryTopics, setSummaryTopics] = useState<string[]>([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [activeSavedSessionId, setActiveSavedSessionId] = useState<string | null>(null);
  const [activeSummaryLocation, setActiveSummaryLocation] = useState<JournalLocation | null>(null);

  // Update session location handler (Firestore + Local State)
  const handleUpdateSessionLocation = useCallback(async (sessionId: string, location: JournalLocation | null) => {
    try {
      if (currentUser) {
        await updateJournalSessionLocation(currentUser.uid, sessionId, location);
      }
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, location: location || undefined } : s));
      showToast({
        title: location ? 'Location Tagged' : 'Location Removed',
        message: location ? `Venue updated to ${location.placeName}` : 'Study venue removed.',
        type: 'update'
      });
    } catch (err: any) {
      console.error('Failed to update session location:', err);
      showToast({
        title: 'Update Failed',
        message: err?.message || 'Could not update location in database.',
        type: 'custom'
      });
    }
  }, [currentUser, showToast]);

  const handleUpdateSummaryLocation = useCallback(async (loc: JournalLocation | null) => {
    setActiveSummaryLocation(loc);
    if (activeSavedSessionId) {
      await handleUpdateSessionLocation(activeSavedSessionId, loc);
    }
  }, [activeSavedSessionId, handleUpdateSessionLocation]);

  // AI Intelligence State (Proactive Suggestions, Weak Skills, Career Intelligence, Trends)
  const [proactiveSuggestion, setProactiveSuggestion] = useState<ProactiveFocusSuggestion | null>({
    focusTitle: 'Master PyTorch Scaled Attention & Tensor Dimensions',
    suggestion: 'Deepen your practical understanding of Transformer multi-head attention mechanisms and verify tensor dimensions in PyTorch.',
    recommendedTopics: ['Deep Learning', 'PyTorch', 'Transformers'],
    suggestedPrompt: 'Can you walk me through writing a custom PyTorch attention head with query-key-value tensor shape verification?',
    reasoning: 'Connecting your 14+ years HR systems-routing intuition to self-attention equations establishes permanent technical mastery for your portfolio.',
    generatedAt: Date.now()
  });
  const [proactiveLoading, setProactiveLoading] = useState(false);

  const [weakSkills, setWeakSkills] = useState<WeakSkillItem[]>([
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
  ]);
  const [weakSkillsDiagnosis, setWeakSkillsDiagnosis] = useState<string>('Consistent practice on tensor geometry and loss gradients will solidify your core technical foundation for production AI/ML engineering.');
  const [weakSkillsLoading, setWeakSkillsLoading] = useState(false);

  const [careerIntelligence, setCareerIntelligence] = useState<CareerIntelligenceData | null>(null);
  const [careerIntelligenceLoading, setCareerIntelligenceLoading] = useState(false);

  const [trendsData, setTrendsData] = useState<JournalTrendsAnalysis | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(false);

  // Helper to deduplicate topics by name
  const deduplicateTopics = useCallback((list: Topic[]): Topic[] => {
    const seen = new Set<string>();
    return list.filter(item => {
      const key = item.name ? item.name.trim().toLowerCase() : item.id;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  // 1. Subscribe to Firebase Auth and bind real-time Firestore listeners
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const unsubscribeAuth = subscribeToAuth(async (user) => {
      // Clean up previous listeners
      unsubs.forEach(unsub => unsub());
      unsubs = [];

      setCurrentUser(user);
      setIsAuthLoading(false);
      
      if (user) {
        setTopicsLoading(true);
        setSessionsLoading(true);
        setSyncError(null);

        // Bind real-time snapshot listeners for authenticated user
        try {
          // Listen to user account document for role changes
          const unsubAccount = subscribeUserAccount(user.uid, (account) => {
            if (account && account.role) {
              setUserRole(account.role);
            } else {
              setUserRole('user');
            }
          });

          // Fetch server identity verification in background
          fetchServerIdentity().then(identity => {
            if (identity && identity.role) {
              setUserRole(identity.role);
            }
          }).catch(() => {
            // Keep existing state if offline or network error
          });

          const unsubTopics = subscribeUserTopics(user.uid, (data) => {
            setTopics(deduplicateTopics(data));
            setTopicsLoading(false);
          });
          const unsubSessions = subscribeUserSessions(user.uid, (data) => {
            setSessions(data);
            setSessionsLoading(false);
          });
          const unsubCareer = subscribeCareerProgress(user.uid, (data) => {
            setCareerData(data);
          });
          const unsubStats = subscribeLearningStats(user.uid, (data) => {
            setLearningStats(data);
          });
          const unsubSkills = subscribeUserSkills(user.uid, (data) => {
            setSkills(data);
          });
          const unsubProjects = subscribeUserProjects(user.uid, (data) => {
            setProjects(data);
          });
          const unsubGoals = subscribeUserGoals(user.uid, (data) => {
            setGoals(data);
          });
          const unsubStudy = subscribeStudySessions(user.uid, (data) => {
            setStudySessions(data);
          });
          const unsubRecs = subscribeAIRecommendations(user.uid, (data) => {
            setAiRecommendations(data);
          });

          unsubs.push(
            unsubAccount,
            unsubTopics, 
            unsubSessions, 
            unsubCareer, 
            unsubStats, 
            unsubSkills, 
            unsubProjects, 
            unsubGoals, 
            unsubStudy, 
            unsubRecs
          );
        } catch (err) {
          console.error('Error establishing Firestore listeners:', err);
          setSyncError('Unable to connect to live Firestore database. Retrying in background...');
          setTopicsLoading(false);
          setSessionsLoading(false);
        }
      } else {
        setUserRole('user');
        // Fallback to initial guest seed state
        loadGuestData();
      }
    });

    return () => {
      unsubscribeAuth();
      unsubs.forEach(unsub => unsub());
    };
  }, [deduplicateTopics]);

  // Helper to load guest data
  const loadGuestData = async () => {
    setTopics(DEFAULT_INITIAL_TOPICS.map((name, i) => ({
      id: `topic-${i}`,
      name,
      createdAt: Date.now() + i,
      isActive: ['Deep Learning', 'PyTorch', 'Transformers', 'LLM Systems'].includes(name)
    })));
    setCareerData(DEFAULT_CAREER_PROGRESS);
    setLearningStats(DEFAULT_LEARNING_STATS);
    setSkills(DEFAULT_SKILLS.map(s => ({ ...s, userId: 'guest' })));
    setProjects(DEFAULT_PROJECTS.map(p => ({ ...p, userId: 'guest' })));
    setGoals(DEFAULT_GOALS.map(g => ({ ...g, userId: 'guest' })));
    setStudySessions(DEFAULT_STUDY_SESSIONS.map(s => ({ ...s, userId: 'guest' })));
  };

  // Sign In Handler
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const user = await signInWithGoogle();
      setCurrentUser(user);
      setShowAuthModal(false);
      showToast({
        type: 'save',
        title: 'Authenticated Successfully 🚀',
        message: `Welcome back! Real-time Firestore sync active for ${user.email || 'your account'}.`
      });
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setAuthError(err?.message || 'Failed to authenticate with Google. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutUser();
      setCurrentUser(null);
      setShowSignOutModal(false);
      setConversation([]);
      showToast({
        type: 'update',
        title: 'Signed Out',
        message: 'Switched to guest sandbox mode. Your progress is saved safely in Firestore.'
      });
      loadGuestData();
    } catch (err: any) {
      console.error('Sign Out error:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  // Topic Handlers (Toggle, Add, Delete)
  const handleToggleTopic = async (topicId: string, currentActive: boolean) => {
    const target = topics.find(t => t.id === topicId);
    const updated = topics.map(t => t.id === topicId ? { ...t, isActive: !currentActive } : t);
    setTopics(updated);

    if (target) {
      notifyUpdate('Topic Status', `"${target.name}" is now ${!currentActive ? 'Active' : 'Muted'}`);
    }

    if (currentUser) {
      try {
        await updateFirestoreTopicStatus(currentUser.uid, topicId, !currentActive);
      } catch (e) {
        console.error('Failed to sync topic status to Firestore:', e);
      }
    }
  };

  const handleAddTopic = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      if (currentUser) {
        const newTopic = await addFirestoreTopic(currentUser.uid, trimmed);
        setTopics(prev => deduplicateTopics([...prev, newTopic]));
      } else {
        const fallbackTopic: Topic = {
          id: `local-${Date.now()}`,
          name: trimmed,
          createdAt: Date.now(),
          isActive: true
        };
        setTopics(prev => deduplicateTopics([...prev, fallbackTopic]));
      }
      notifySave('Topic Focus', `Added "${trimmed}" to your active study focus.`);
    } catch (err) {
      console.error('Error adding topic:', err);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    const target = topics.find(t => t.id === topicId);
    setTopics(prev => prev.filter(t => t.id !== topicId));

    if (target) {
      notifyDelete(`"${target.name}"`);
    }

    if (currentUser) {
      try {
        await deleteFirestoreTopic(currentUser.uid, topicId);
      } catch (e) {
        console.error('Failed to delete topic from Firestore:', e);
      }
    }
  };

  // AI Coach Messaging with Gemini Fallback
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    const newHistory = [...conversation, userMsg];
    setConversation(newHistory);
    setIsGenerating(true);
    setChatError(null);

    const activeTopicNames = topics.filter(t => t.isActive).map(t => t.name);

    try {
      const res = await fetch('/api/coach/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history: conversation,
          topics: activeTopicNames,
          temperature: generationConfig.temperature,
          topP: generationConfig.topP,
          topK: generationConfig.topK,
          candidateCount: generationConfig.candidateCount,
          thinkingLevel: generationConfig.thinkingLevel || 'medium',
          thinkingConfig: { thinkingLevel: generationConfig.thinkingLevel || 'medium' }
        })
      });

      if (!res.headers.get('content-type')?.includes('application/json')) {
        throw new Error('Server returned an unexpected non-JSON response. Please try again.');
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Request failed with status ${res.status}`);
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: json.data.response,
        timestamp: Date.now()
      };

      setConversation(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI Coach message error:', err);
      setChatError(err?.message || 'Unable to connect to AI Coach. Please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Complete Session & Synthesize Journal Entry
  const handleCompleteSession = async () => {
    if (conversation.length < 2) return;

    setIsSummarizing(true);
    setChatError(null);

    const activeTopicNames = topics.filter(t => t.isActive).map(t => t.name);

    try {
      const res = await fetch('/api/coach/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          conversation,
          topics: activeTopicNames
        })
      });

      if (!res.headers.get('content-type')?.includes('application/json')) {
        throw new Error('Server returned an unexpected non-JSON response.');
      }

      const json = await res.json();
      if (!json.success || !json.data?.summary) {
        throw new Error(json.error || 'Failed to synthesize session summary');
      }

      const summary: SessionSummary = json.data.summary;
      setActiveSummary(summary);
      setSummaryTopics(activeTopicNames);
      setShowSummaryModal(true);

      const newSession: Omit<JournalSession, 'id' | 'userId'> = {
        conversation,
        summary,
        topics: activeTopicNames,
        createdAt: Date.now()
      };

      if (currentUser) {
        const savedId = await saveJournalSession(currentUser.uid, newSession);
        setActiveSavedSessionId(savedId);
        setActiveSummaryLocation(null);
        setSessions(prev => [{ ...newSession, id: savedId, userId: currentUser.uid }, ...prev]);
        
        // Optimistically increment lessons completed
        const updatedCompleted = (learningStats.lessonsCompleted || 48) + 1;
        const updatedProgress = Math.min(100, Math.round((updatedCompleted / (learningStats.totalLessons || 67)) * 100));
        await updateLearningStats(currentUser.uid, {
          lessonsCompleted: updatedCompleted,
          progressPercentage: updatedProgress
        });
      } else {
        const localId = `local-${Date.now()}`;
        setActiveSavedSessionId(localId);
        setActiveSummaryLocation(null);
        setSessions(prev => [{ ...newSession, id: localId, userId: 'guest' }, ...prev]);
      }

      notifyJournalCreated(activeTopicNames.slice(0, 2).join(' & ') || 'AI/ML Study Reflection');

      // Dispatch non-blocking external notification (Slack / Discord / Email)
      (async () => {
        try {
          const idToken = currentUser ? await currentUser.getIdToken() : undefined;
          const dispatchRes = await dispatchJournalNotifications({
            userId: currentUser ? currentUser.uid : 'guest',
            summary,
            topics: activeTopicNames,
            idToken
          });
          if (dispatchRes?.triggered && dispatchRes?.delivered && dispatchRes.delivered.length > 0) {
            const successChannels = dispatchRes.delivered.filter(d => d.success).map(d => d.channel);
            if (successChannels.length > 0) {
              showToast({
                type: 'update',
                title: 'External Alert Dispatched',
                message: `Summary relayed to ${successChannels.join(', ')}.`
              });
            }
          }
        } catch (notifErr) {
          console.warn('Notification dispatch error (non-blocking):', notifErr);
        }
      })();

      // Trigger background refresh of intelligence features with new session history
      setTimeout(() => {
        fetchProactiveSuggestion();
        fetchWeakSkills();
        fetchTrendsAnalysis();
        fetchCareerIntelligence();
      }, 500);
    } catch (err: any) {
      console.error('Summarize error:', err);
      setChatError(err?.message || 'Failed to synthesize session summary. Check connection.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Reset Active Conversation
  const handleResetConversation = () => {
    setConversation([]);
    setChatError(null);
    showToast({
      type: 'update',
      title: 'New Dialogue Started',
      message: 'Dialogue context refreshed. Ready for your next AI/ML topic.'
    });
  };

  // Goal toggle handler
  const handleToggleGoal = async (goalId: string, completed: boolean) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, completed, completedAt: completed ? Date.now() : undefined } : g));
    if (completed) {
      notifyGoalComplete('Milestone Goal', 'Goal marked completed! Great job on consistent progress.');
    }
    if (currentUser) {
      try {
        await toggleGoalCompletion(currentUser.uid, goalId, completed);
      } catch (e) {
        console.error('Failed to sync goal toggle to Firestore:', e);
      }
    }
  };

  // Goal add handler
  const handleAddGoal = async (title: string, category: 'weekly' | 'milestone' | 'career' = 'weekly') => {
    if (!title.trim()) return;
    if (currentUser) {
      try {
        const newGoal = await addGoal(currentUser.uid, title, category);
        setGoals(prev => [newGoal, ...prev]);
        notifySave('New Goal', `"${title}" has been saved to your roadmap.`);
      } catch (e) {
        console.error('Failed to add goal to Firestore:', e);
      }
    } else {
      const localGoal: GoalItem = {
        id: `goal-${Date.now()}`,
        userId: 'guest',
        title: title.trim(),
        category,
        completed: false,
        createdAt: Date.now()
      };
      setGoals(prev => [localGoal, ...prev]);
      notifySave('New Goal', `"${title}" has been saved.`);
    }
  };

  // Study Session Status Toggle
  const handleToggleStudyStatus = async (dayNumber: number, newStatus: 'completed' | 'in_progress' | 'upcoming') => {
    setStudySessions(prev => prev.map(s => s.dayNumber === dayNumber ? { ...s, status: newStatus } : s));
    const targetSession = studySessions.find(s => s.dayNumber === dayNumber);
    if (currentUser && targetSession) {
      try {
        await updateStudySessionStatus(currentUser.uid, targetSession.id, newStatus);
      } catch (e) {
        console.error('Failed to update study session status in Firestore:', e);
      }
    }
  };

  // Skill Level update
  const handleUpdateSkillLevel = async (skillId: string, level: number) => {
    setSkills(prev => prev.map(s => s.id === skillId ? { ...s, level } : s));
    if (currentUser) {
      try {
        await updateSkillLevel(currentUser.uid, skillId, level);
      } catch (e) {
        console.error('Failed to update skill in Firestore:', e);
      }
    }
  };

  // Project Status update
  const handleUpdateProjectStatus = async (projectId: string, status: string, color?: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status, statusColor: color || p.statusColor } : p));
    if (currentUser) {
      try {
        await updateProjectStatus(currentUser.uid, projectId, status, color);
      } catch (e) {
        console.error('Failed to update project status in Firestore:', e);
      }
    }
  };

  // Quick prompt injection to AI Coach
  const handleSelectPrompt = (prompt: string) => {
    setActiveTab('home');
    handleSendMessage(prompt);
    // Smooth scroll to coach area if on page
    setTimeout(() => {
      const coachSection = document.getElementById('ai-coach-section');
      if (coachSection) {
        coachSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Intelligence Feature 1: Proactive Focus Suggestion Fetch
  const fetchProactiveSuggestion = useCallback(async (retryCount = 0) => {
    setProactiveLoading(true);
    try {
      const activeTopicNames = topics.filter(t => t.isActive).map(t => t.name);
      const res = await fetch('/api/coach/proactive-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeTopics: activeTopicNames.length > 0 ? activeTopicNames : ['Deep Learning', 'PyTorch', 'Transformers'],
          recentSessions: sessions.slice(0, 5)
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.data) {
          setProactiveSuggestion(data.data);
          return;
        }
      }
      throw new Error(`HTTP ${res.status}`);
    } catch {
      if (retryCount < 1) {
        setTimeout(() => fetchProactiveSuggestion(retryCount + 1), 1500);
        return;
      }
      // Resilient fallback without noisy console warnings
      setProactiveSuggestion(prev => prev || {
        focusTitle: 'Master PyTorch Scaled Attention & Tensor Dimensions',
        suggestion: 'Deepen your practical understanding of Transformer multi-head attention mechanisms and verify tensor dimensions in PyTorch.',
        recommendedTopics: topics.filter(t => t.isActive).map(t => t.name).slice(0, 3) || ['Deep Learning', 'PyTorch', 'Transformers'],
        suggestedPrompt: 'Can you walk me through writing a custom PyTorch attention head with query-key-value tensor shape verification?',
        reasoning: 'Connecting your 14+ years HR systems-routing intuition to self-attention equations establishes permanent technical mastery for your portfolio.',
        generatedAt: Date.now()
      });
    } finally {
      setProactiveLoading(false);
    }
  }, [topics, sessions]);

  // Intelligence Feature 2: Weak-Skills Detection Fetch
  const fetchWeakSkills = useCallback(async (retryCount = 0) => {
    setWeakSkillsLoading(true);
    try {
      const res = await fetch('/api/intelligence/weak-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.data) {
          setWeakSkills(data.data.weakSkills || []);
          setWeakSkillsDiagnosis(data.data.overallDiagnosis || '');
          return;
        }
      }
      throw new Error(`HTTP ${res.status}`);
    } catch {
      if (retryCount < 1) {
        setTimeout(() => fetchWeakSkills(retryCount + 1), 1500);
        return;
      }
    } finally {
      setWeakSkillsLoading(false);
    }
  }, [sessions]);

  // Intelligence Feature 3: Career Intelligence Insights Fetch
  const fetchCareerIntelligence = useCallback(async (retryCount = 0) => {
    setCareerIntelligenceLoading(true);
    try {
      const res = await fetch('/api/intelligence/career-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills,
          projects,
          sessions,
          targetRole: 'AI/ML Engineer'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.data) {
          setCareerIntelligence(data.data);
          return;
        }
      }
      throw new Error(`HTTP ${res.status}`);
    } catch {
      if (retryCount < 1) {
        setTimeout(() => fetchCareerIntelligence(retryCount + 1), 1500);
        return;
      }
      setCareerIntelligence(prev => prev || {
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
          }
        ],
        suggestedNextProject: {
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
        strategicHRAdvantage: 'Your 14+ years in HR leadership give you unprecedented mastery of organizational topologies and human-in-the-loop decision boundaries—the exact qualities top engineering teams need to align AI agents with enterprise business impact.',
        generatedAt: Date.now()
      });
    } finally {
      setCareerIntelligenceLoading(false);
    }
  }, [skills, projects, sessions]);

  // Intelligence Feature 4: AI Journal Trends Analysis Fetch
  const fetchTrendsAnalysis = useCallback(async (retryCount = 0) => {
    setTrendsLoading(true);
    try {
      const res = await fetch('/api/intelligence/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.data) {
          setTrendsData(data.data);
          return;
        }
      }
      throw new Error(`HTTP ${res.status}`);
    } catch {
      if (retryCount < 1) {
        setTimeout(() => fetchTrendsAnalysis(retryCount + 1), 1500);
        return;
      }
      setTrendsData(prev => prev || {
        overallSummary: 'Your learning trajectory shows disciplined momentum across Deep Learning, PyTorch, and Transformers, with strong retention of foundational concepts.',
        insights: [
          'Your focus on PyTorch & Deep Learning represents over 45% of your total study time, establishing solid foundations.',
          'You have maintained high consistency across both Ostad and CodeAlpha tracks.',
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
        totalSessionsAnalyzed: sessions.length,
        generatedAt: Date.now()
      });
    } finally {
      setTrendsLoading(false);
    }
  }, [sessions]);

  // Intelligent lazy-fetching for intelligence features to avoid quota burst
  const initialFetchDone = useRef(false);

  useEffect(() => {
    if (!topicsLoading && !sessionsLoading && !initialFetchDone.current) {
      initialFetchDone.current = true;
      // Fetch home dashboard intelligence on mount
      fetchProactiveSuggestion();
      const timer = setTimeout(() => {
        fetchWeakSkills();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [topicsLoading, sessionsLoading, fetchProactiveSuggestion, fetchWeakSkills]);

  // Tab-driven lazy loading for Roadmap & Trends
  useEffect(() => {
    if (activeTab === 'roadmap' && !careerIntelligence && !careerIntelligenceLoading) {
      fetchCareerIntelligence();
    }
    if (activeTab === 'trends' && !trendsData && !trendsLoading) {
      fetchTrendsAnalysis();
    }
  }, [activeTab, careerIntelligence, careerIntelligenceLoading, trendsData, trendsLoading, fetchCareerIntelligence, fetchTrendsAnalysis]);

  // Handler: Start session from Proactive Focus Suggestion
  const handleStartProactiveFocus = (suggestedPrompt: string, recommendedTopics: string[]) => {
    if (recommendedTopics && recommendedTopics.length > 0) {
      recommendedTopics.forEach(topicName => {
        const found = topics.find(t => t.name.toLowerCase() === topicName.toLowerCase());
        if (found && !found.isActive) {
          handleToggleTopic(found.id, false);
        }
      });
    }
    const prompt = suggestedPrompt || `Let's focus on today's AI/ML study recommendation.`;
    handleSelectPrompt(prompt);
  };

  // Handler: Ask Coach Directly "What should I focus on today?"
  const handleAskCoachWhatToFocusOn = () => {
    const activeTopicNames = topics.filter(t => t.isActive).map(t => t.name).join(', ');
    handleSelectPrompt(`What should I focus on today for my AI/ML engineering transition? My current active study topics are: ${activeTopicNames || 'Deep Learning & PyTorch'}.`);
  };

  // Handler: Drill Weak Skill
  const handlePracticeWeakTopic = (topic: string, suggestedPrompt: string) => {
    const prompt = suggestedPrompt || `I need more practice with ${topic}. Can you walk me through a foundational problem and quiz me step-by-step?`;
    handleSelectPrompt(prompt);
  };

  // Active study day adapter
  const studyDaysAdapter: StudyDay[] = useMemo(() => {
    if (studySessions.length > 0) {
      return studySessions.map(s => ({
        dayNumber: s.dayNumber,
        dateLabel: s.dateLabel,
        isToday: s.isToday,
        isYesterday: s.isYesterday,
        status: s.status,
        title: s.title,
        focusTopics: s.focusTopics,
        hoursLogged: s.hoursLogged,
        milestone: s.milestone,
        platform: s.platform,
        journalLogged: s.journalLogged
      }));
    }
    return DEFAULT_STUDY_SESSIONS.map(s => ({
      dayNumber: s.dayNumber,
      dateLabel: s.dateLabel,
      isToday: s.isToday,
      isYesterday: s.isYesterday,
      status: s.status,
      title: s.title,
      focusTopics: s.focusTopics,
      hoursLogged: s.hoursLogged,
      milestone: s.milestone,
      platform: s.platform,
      journalLogged: s.journalLogged
    }));
  }, [studySessions]);

  return (
    <div className="flex h-screen bg-[#040817] text-slate-100 overflow-hidden font-sans">
      
      {/* 1. Desktop Sidebar (Proportional rail: 3% of total screen) */}
      <div className="hidden lg:block w-[3%] min-w-[54px] max-w-[64px] h-full shrink-0">
        <Sidebar 
          activeTab={activeTab} 
          onSelectTab={setActiveTab} 
          userRole={userRole}
          user={currentUser}
          onOpenSignOutModal={() => setShowSignOutModal(true)}
          onOpenAuthModal={() => setShowAuthModal(true)}
        />
      </div>

      {/* 2. Main Content Viewport (Remaining workspace) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        
        {/* Top Header */}
        <Header 
          user={currentUser}
          userRole={userRole}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSignOutModal={() => setShowSignOutModal(true)}
          onOpenAuthModal={() => setShowAuthModal(true)}
          onGoogleSignIn={handleGoogleSignIn}
          onNavigateTab={(tab, targetId) => {
            setActiveTab(tab);
            if (targetId) {
              setTimeout(() => {
                const el = document.getElementById(targetId);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  el.classList.add('ring-2', 'ring-[#00F0FF]', 'ring-offset-2', 'ring-offset-[#0B0F19]', 'transition-all', 'duration-300');
                  setTimeout(() => {
                    el.classList.remove('ring-2', 'ring-[#00F0FF]', 'ring-offset-2', 'ring-offset-[#0B0F19]');
                  }, 2200);
                }
              }, 200);
            }
          }}
          onOpenMobileMenu={() => setShowMobileMenu(prev => !prev)}
          topics={topics}
          sessions={sessions}
          projects={projects}
        />

        {/* Global Firestore Sync Error Banner */}
        {syncError && (
          <div className="bg-rose-500/15 border-b border-rose-500/30 px-4 py-2 flex items-center justify-between text-xs text-rose-300 font-mono">
            <span>⚠️ {syncError}</span>
            <button 
              onClick={() => setSyncError(null)}
              className="text-slate-400 hover:text-white px-2 py-0.5 rounded cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Ambient Top Loading Indicator during Data Synchronization */}
        {(isAuthLoading || topicsLoading || sessionsLoading) && (
          <div className="h-0.5 w-full bg-[#070e20] overflow-hidden relative z-30 shrink-0" role="progressbar" aria-label="Loading content" aria-busy="true">
            <div className="h-full bg-gradient-to-r from-transparent via-[#00F0FF] to-[#3B82F6] animate-pulse w-full shadow-[0_0_8px_#00F0FF]" />
          </div>
        )}

        {/* Scrollable Dashboard View Body */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 space-y-6 pb-24 lg:pb-8">
          
          {/* Initial Authenticated State & Content Loading Indicator */}
          {isAuthLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] h-full w-full py-16">
              <LoadingState 
                message="Synchronizing AI/ML Journal..." 
                subMessage="Loading learning tracks, career telemetry, and session memories."
                variant="ai"
                size="lg"
              />
            </div>
          ) : (
            <>
          {/* TAB: DASHBOARD / HOME (Modern 3-Column Futuristic Layout) */}
          {(activeTab === 'dashboard' || activeTab === 'home') && (
            <DashboardView 
              onContinueLearning={handleSelectPrompt}
              onWatchOverview={() => setActiveTab('curriculum')}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onAICoachPrompt={handleSelectPrompt}
              topics={topics}
              sessions={sessions}
            />
          )}

          {/* TAB: PROJECTS / PORTFOLIO */}
          {(activeTab === 'projects' || activeTab === 'portfolio') && (
            <React.Suspense fallback={<AnalyticsSkeleton />}>
              <PortfolioView 
                projects={projects}
                onDiscussProjectPrompt={handleSelectPrompt}
                onUpdateProjectStatus={handleUpdateProjectStatus}
              />
            </React.Suspense>
          )}

          {/* TAB: AI COACH */}
          {(activeTab === 'aicoach' || activeTab === 'coach') && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <ProactiveCoachSuggestion 
                suggestion={proactiveSuggestion}
                loading={proactiveLoading}
                onRefresh={fetchProactiveSuggestion}
                onSelectFocus={handleStartProactiveFocus}
                onAskCoachDirectly={handleAskCoachWhatToFocusOn}
              />
              <AICoachChat 
                conversation={conversation}
                activeTopics={topics.filter(t => t.isActive)}
                isGenerating={isGenerating}
                isSummarizing={isSummarizing}
                onSendMessage={handleSendMessage}
                onCompleteSession={handleCompleteSession}
                onResetConversation={handleResetConversation}
                generationConfig={generationConfig}
                onUpdateConfig={setGenerationConfig}
                error={chatError}
              />
            </div>
          )}

          {/* TAB: CURRICULUM / LEARN */}
          {(activeTab === 'curriculum' || activeTab === 'learn') && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <CurriculumSection 
                careerData={careerData}
                onSelectPlatform={(platformId) => handleSelectPrompt(`Tell me more about the courses and learning roadmap for ${platformId}.`)}
              />
              <DailyStudyTrack 
                currentDay={2}
                studySessions={studyDaysAdapter}
                onSelectDayPrompt={handleSelectPrompt}
                onToggleStatus={handleToggleStudyStatus}
                onStartDayCoach={(day) => handleSelectPrompt(`Let's begin today's Day ${day.dayNumber} focus: ${day.title}. Topics: ${day.focusTopics.join(', ')}.`)}
              />
            </div>
          )}

          {/* TAB: JOURNAL */}
          {activeTab === 'journal' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <LearningTimeline 
                sessions={sessions}
                onStartSessionPrompt={handleSelectPrompt}
                isLoading={sessionsLoading}
                onUpdateSessionLocation={handleUpdateSessionLocation}
              />
            </div>
          )}

          {/* TAB: ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <AchievementsView onStartChallenge={handleSelectPrompt} />
          )}

          {/* TAB: ADVANCED ANALYTICS */}
          {activeTab === 'analytics' && (
            <React.Suspense fallback={<AnalyticsSkeleton />}>
              <AnalyticsView 
                sessions={sessions}
                topics={topics}
                skills={skills}
                careerData={careerData}
                learningStats={learningStats}
                onOpenCoachPrompt={handleSelectPrompt}
                isLoading={sessionsLoading}
              />
            </React.Suspense>
          )}

          {/* TAB: FOCUS TOPICS / EXPLORE */}
          {(activeTab === 'focustopics' || activeTab === 'explore') && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <TopicManager 
                topics={topics}
                isLoading={topicsLoading}
                onToggleTopic={handleToggleTopic}
                onAddTopic={handleAddTopic}
                onDeleteTopic={handleDeleteTopic}
              />
              <React.Suspense fallback={<AnalyticsSkeleton />}>
                <ExploreView 
                  topics={topics}
                  onSelectTopicPrompt={handleSelectPrompt}
                  onAddTopic={handleAddTopic}
                />
              </React.Suspense>
            </div>
          )}

          {/* TAB: GOALS / SMART STUDY PLANNER */}
          {(activeTab === 'goals' || activeTab === 'planner') && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <SmartStudyPlanner 
                goals={goals}
                studySessions={studySessions}
                onToggleGoal={handleToggleGoal}
                onAddGoal={handleAddGoal}
                onAskCoachAboutGoal={(goalTitle) => handleSelectPrompt(`Hello Coach! Help me design a focused study plan and hands-on coding exercises for my goal: "${goalTitle}".`)}
              />
              <DailyStudyTrack 
                currentDay={2}
                studySessions={studyDaysAdapter}
                onSelectDayPrompt={handleSelectPrompt}
                onToggleStatus={handleToggleStudyStatus}
                onStartDayCoach={(day) => handleSelectPrompt(`Let's begin today's Day ${day.dayNumber} focus: ${day.title}. Topics: ${day.focusTopics.join(', ')}.`)}
              />
            </div>
          )}

          {/* TAB: ROADMAP */}
          {activeTab === 'roadmap' && (
            <React.Suspense fallback={<AnalyticsSkeleton />}>
              <RoadmapView 
                careerData={careerData}
                onSelectMilestonePrompt={handleSelectPrompt}
                careerIntelligence={careerIntelligence}
                isLoadingIntelligence={careerIntelligenceLoading}
                onRefreshIntelligence={fetchCareerIntelligence}
              />
            </React.Suspense>
          )}

          {/* TAB: TRENDS & INTELLIGENCE */}
          {activeTab === 'trends' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <TrendsView 
                trendsData={trendsData}
                loading={trendsLoading}
                totalSessionsCount={sessions.length}
                onRefresh={fetchTrendsAnalysis}
                onStartSession={() => handleSelectPrompt('Let us begin a new AI/ML study session based on my recent learning trends.')}
              />
            </div>
          )}

          {/* TAB: PROGRESS & COMPETENCY */}
          {activeTab === 'progress' && (
            <React.Suspense fallback={<AnalyticsSkeleton />}>
              <ProgressView 
                careerData={careerData}
                sessions={sessions}
                topics={topics}
                skills={skills}
                goals={goals}
                learningStats={learningStats}
                onOpenCoachPrompt={handleSelectPrompt}
                onToggleGoal={handleToggleGoal}
                onUpdateSkillLevel={handleUpdateSkillLevel}
                isLoading={sessionsLoading}
              />
            </React.Suspense>
          )}

          {/* TAB: RESOURCES */}
          {activeTab === 'resources' && (
            <React.Suspense fallback={<AnalyticsSkeleton />}>
              <ResourcesView />
            </React.Suspense>
          )}

          {/* TAB: COMMUNITY */}
          {activeTab === 'community' && (
            <React.Suspense fallback={<AnalyticsSkeleton />}>
              <CommunityView 
                currentUser={currentUser}
                onOpenAuthModal={() => setShowAuthModal(true)}
                onAskCoachFromCommunity={handleSelectPrompt}
              />
            </React.Suspense>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <React.Suspense fallback={<AnalyticsSkeleton />}>
              <SettingsView 
                currentUser={currentUser}
                generationConfig={generationConfig}
                onUpdateConfig={setGenerationConfig}
                onOpenAuthModal={() => setShowAuthModal(true)}
                onOpenSignOutModal={() => setShowSignOutModal(true)}
                onClearLocalHistory={() => setSessions([])}
                onShowToast={showToast}
                onClose={() => setActiveTab('dashboard')}
              />
            </React.Suspense>
          )}

          {/* TAB: ADMIN COMMAND CENTER (RBAC) */}
          {activeTab === 'admin' && (
            <React.Suspense fallback={<AnalyticsSkeleton />}>
              <AdminDashboardView 
                currentUser={currentUser}
                userRole={userRole}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            </React.Suspense>
          )}
            </>
          )}
        </main>

        {/* 3. Mobile Bottom Navigation Bar */}
        <div className="lg:hidden">
          <BottomNavBar 
            activeTab={activeTab} 
            onSelectTab={setActiveTab} 
            onOpenMobileMenu={() => setShowMobileMenu(prev => !prev)}
            isMenuOpen={showMobileMenu}
          />
        </div>
      </div>

      {/* 4. Mobile Drawer Overlay */}
      <MobileDrawer 
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        activeTab={activeTab}
        userRole={userRole}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setShowMobileMenu(false);
        }}
      />

      {/* 5. Modals (Auth, SignOut, Summary) */}
      <React.Suspense fallback={null}>
        {showAuthModal && (
          <AuthModal 
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onGoogleSignIn={handleGoogleSignIn}
            isAuthenticating={isAuthenticating}
            error={authError}
          />
        )}

        {showSignOutModal && (
          <SignOutModal 
            isOpen={showSignOutModal}
            onClose={() => setShowSignOutModal(false)}
            onConfirmSignOut={handleSignOut}
            isSigningOut={isSigningOut}
          />
        )}

        {showSummaryModal && activeSummary && (
          <SessionSummaryModal 
            isOpen={showSummaryModal}
            onClose={() => setShowSummaryModal(false)}
            summary={activeSummary}
            topics={summaryTopics}
            initialLocation={activeSummaryLocation}
            onUpdateLocation={handleUpdateSummaryLocation}
          />
        )}
      </React.Suspense>
    </div>
  );
}
