import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { RoleTargetBar } from './components/RoleTargetBar';
import { CurriculumSection } from './components/CurriculumSection';
import { TopicManager } from './components/TopicManager';
import { AICoachChat } from './components/AICoachChat';
import { LearningTimeline } from './components/LearningTimeline';
import { RoadmapView } from './components/RoadmapView';
import { ExploreView } from './components/ExploreView';
import { PortfolioView } from './components/PortfolioView';
import { ResourcesView } from './components/ResourcesView';
import { CommunityView } from './components/CommunityView';
import { SettingsView } from './components/SettingsView';
import { ProgressView } from './components/ProgressView';
import { SessionSummaryModal } from './components/SessionSummaryModal';
import { SignOutModal } from './components/SignOutModal';
import { AuthModal } from './components/AuthModal';
import { 
  subscribeToAuth, 
  signInWithGoogle, 
  signOutUser,
  fetchUserTopics,
  addFirestoreTopic,
  deleteFirestoreTopic,
  updateFirestoreTopicStatus,
  saveJournalSession,
  fetchUserSessions,
  fetchCareerProgress,
  DEFAULT_CAREER_PROGRESS,
  DEFAULT_INITIAL_TOPICS
} from './lib/firebase';
import type { 
  ChatMessage, 
  SessionSummary, 
  JournalSession, 
  Topic, 
  CareerProgressData,
  GenerationConfig
} from './types';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('home');

  // Topics State
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  // Career Progress State
  const [careerData, setCareerData] = useState<CareerProgressData>(DEFAULT_CAREER_PROGRESS);

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

  // 1. Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      
      if (user) {
        await loadUserData(user.uid);
      } else {
        loadGuestData();
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper to deduplicate topics by name
  const deduplicateTopics = (list: Topic[]): Topic[] => {
    const seen = new Set<string>();
    return list.filter(item => {
      const key = item.name ? item.name.trim().toLowerCase() : item.id;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Helper to load user Firestore collections
  const loadUserData = async (uid: string) => {
    setTopicsLoading(true);
    setSessionsLoading(true);
    try {
      const [userTopics, userSessions, userCareer] = await Promise.all([
        fetchUserTopics(uid),
        fetchUserSessions(uid),
        fetchCareerProgress(uid)
      ]);
      setTopics(deduplicateTopics(userTopics));
      setSessions(userSessions);
      setCareerData(userCareer);
    } catch (err) {
      console.error('Error loading Firestore data:', err);
    } finally {
      setTopicsLoading(false);
      setSessionsLoading(false);
    }
  };

  // Helper to load guest data
  const loadGuestData = async () => {
    try {
      const res = await fetch('/api/topics');
      if (res.headers.get('content-type')?.includes('application/json')) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setTopics(deduplicateTopics(json.data));
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Default reference topics
    const referenceTopics = [
      'Deep Learning',
      'PyTorch',
      'Transformers',
      'LLM Systems',
      'Fine-Tuning',
      'Mathematics'
    ];

    setTopics(referenceTopics.map((name, i) => ({
      id: `topic-${i}`,
      name,
      createdAt: Date.now() + i,
      isActive: true
    })));
  };

  // Sign In Handler
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const user = await signInWithGoogle();
      setCurrentUser(user);
      setShowAuthModal(false);
      await loadUserData(user.uid);
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
      loadGuestData();
    } catch (err: any) {
      console.error('Sign Out error:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  // Topic Handlers (Toggle, Add, Delete)
  const handleToggleTopic = async (topicId: string, currentActive: boolean) => {
    const updated = topics.map(t => t.id === topicId ? { ...t, isActive: !currentActive } : t);
    setTopics(updated);

    if (currentUser) {
      try {
        await updateFirestoreTopicStatus(currentUser.uid, topicId, !currentActive);
      } catch (e) {
        console.error('Failed to sync topic status to Firestore:', e);
      }
    }
  };

  const handleAddTopic = async (name: string) => {
    if (currentUser) {
      const newTopic = await addFirestoreTopic(currentUser.uid, name);
      setTopics(prev => [...prev, newTopic]);
    } else {
      try {
        const res = await fetch('/api/topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
        const json = await res.json();
        if (json.success && json.data?.topic) {
          setTopics(prev => [...prev, json.data.topic]);
          return;
        }
      } catch (err) {
        // Fallback
      }

      const fallbackTopic: Topic = {
        id: `local-${Date.now()}`,
        name,
        createdAt: Date.now(),
        isActive: true
      };
      setTopics(prev => [...prev, fallbackTopic]);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    setTopics(prev => prev.filter(t => t.id !== topicId));

    if (currentUser) {
      try {
        await deleteFirestoreTopic(currentUser.uid, topicId);
      } catch (e) {
        console.error('Failed to delete topic from Firestore:', e);
      }
    } else {
      try {
        await fetch(`/api/topics/${topicId}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Failed to delete topic from server:', e);
      }
    }
  };

  // AI Coach Messaging
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

  // Complete Session & Summarize
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
        setSessions(prev => [{ ...newSession, id: savedId, userId: currentUser.uid }, ...prev]);
      } else {
        await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSession)
        });
        setSessions(prev => [{ ...newSession, id: `local-${Date.now()}`, userId: 'guest' }, ...prev]);
      }

    } catch (err: any) {
      console.error('Error completing session:', err);
      setChatError(err?.message || 'Failed to complete session summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleResetConversation = () => {
    if (window.confirm('Reset current dialogue? (Any uncompleted session will be cleared)')) {
      setConversation([]);
      setChatError(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#030914] text-slate-100 flex relative overflow-x-hidden selection:bg-[#0072FF]/40 selection:text-[#00F0FF]">
      
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenUpgradeModal={() => setActiveTab('settings')}
      />

      {/* 2. Main Dashboard Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#030914] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0072FF]/5 via-transparent to-transparent">
        
        {/* Top Header */}
        <Header
          user={currentUser}
          onOpenSignOutModal={() => setShowSignOutModal(true)}
          onOpenAuthModal={() => setShowAuthModal(true)}
          onNavigateTab={(tab, targetId) => {
            setActiveTab(tab);
            if (targetId) {
              setTimeout(() => {
                const el = document.getElementById(targetId);
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 120);
            }
          }}
        />

        {/* Dynamic Route View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* 1. Home / Default Full Dashboard View */}
          {activeTab === 'home' && (
            <>
              {/* Section 1: Hero Banner */}
              <HeroBanner
                onContinueLearning={() => {
                  const el = document.querySelector('#ai-coach-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              />

              {/* Section 2: Role / Target Position Bar */}
              <RoleTargetBar
                currentRole="AI/ML Learner"
                targetRole="AI/ML Engineer"
              />

              {/* Section 3: Multi-Platform Curriculum Section */}
              <CurriculumSection
                careerData={careerData}
              />

              {/* Section 4: Active Study Focus Topics */}
              <TopicManager
                topics={topics}
                onToggleTopic={handleToggleTopic}
                onAddTopic={handleAddTopic}
                onDeleteTopic={handleDeleteTopic}
                isLoading={topicsLoading}
              />

              {/* Section 5: AI Coach Panel */}
              <AICoachChat
                conversation={conversation}
                activeTopics={topics}
                isGenerating={isGenerating}
                isSummarizing={isSummarizing}
                onSendMessage={handleSendMessage}
                onCompleteSession={handleCompleteSession}
                onResetConversation={handleResetConversation}
                generationConfig={generationConfig}
                onUpdateConfig={setGenerationConfig}
                error={chatError}
              />

              {/* Section 6: Learning Journal Timeline */}
              <LearningTimeline
                sessions={sessions}
                onStartSessionPrompt={(prompt) => handleSendMessage(prompt)}
              />
            </>
          )}

          {/* 2. Roadmap View */}
          {activeTab === 'roadmap' && (
            <RoadmapView
              careerData={careerData}
              onSelectMilestonePrompt={(prompt) => {
                setActiveTab('coach');
                handleSendMessage(prompt);
              }}
            />
          )}

          {/* 3. Learn / Curriculum Focus View */}
          {activeTab === 'learn' && (
            <div className="space-y-6">
              <CurriculumSection careerData={careerData} />
              <TopicManager
                topics={topics}
                onToggleTopic={handleToggleTopic}
                onAddTopic={handleAddTopic}
                onDeleteTopic={handleDeleteTopic}
                isLoading={topicsLoading}
              />
            </div>
          )}

          {/* 4. Explore View */}
          {activeTab === 'explore' && (
            <ExploreView
              topics={topics}
              onSelectTopicPrompt={(prompt) => {
                setActiveTab('coach');
                handleSendMessage(prompt);
              }}
              onAddTopic={(name) => handleAddTopic(name)}
            />
          )}

          {/* 5. Coach View */}
          {activeTab === 'coach' && (
            <div className="space-y-6">
              <TopicManager
                topics={topics}
                onToggleTopic={handleToggleTopic}
                onAddTopic={handleAddTopic}
                onDeleteTopic={handleDeleteTopic}
                isLoading={topicsLoading}
              />
              <AICoachChat
                conversation={conversation}
                activeTopics={topics}
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

          {/* 6. Progress / Analytics View */}
          {activeTab === 'progress' && (
            <ProgressView
              careerData={careerData}
              sessions={sessions}
              topics={topics}
              onOpenCoachPrompt={(prompt) => {
                setActiveTab('coach');
                handleSendMessage(prompt);
              }}
            />
          )}

          {/* 7. Portfolio View */}
          {activeTab === 'portfolio' && (
            <PortfolioView
              onDiscussProjectPrompt={(prompt) => {
                setActiveTab('coach');
                handleSendMessage(prompt);
              }}
            />
          )}

          {/* 8. Journal / Timeline View */}
          {activeTab === 'journal' && (
            <div className="space-y-6">
              <LearningTimeline
                sessions={sessions}
                onStartSessionPrompt={(prompt) => {
                  setActiveTab('coach');
                  handleSendMessage(prompt);
                }}
              />
            </div>
          )}

          {/* 9. Resources View */}
          {activeTab === 'resources' && (
            <ResourcesView />
          )}

          {/* 10. Community View */}
          {activeTab === 'community' && (
            <CommunityView
              currentUser={currentUser}
              onOpenAuthModal={() => setShowAuthModal(true)}
              onAskCoachFromCommunity={(prompt) => {
                setActiveTab('coach');
                handleSendMessage(prompt);
              }}
            />
          )}

          {/* 11. Settings View */}
          {activeTab === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              generationConfig={generationConfig}
              onUpdateConfig={setGenerationConfig}
              onOpenAuthModal={() => setShowAuthModal(true)}
              onOpenSignOutModal={() => setShowSignOutModal(true)}
              onClearLocalHistory={handleResetConversation}
            />
          )}

        </main>

      </div>

      {/* Modals */}
      {activeSummary && (
        <SessionSummaryModal
          isOpen={showSummaryModal}
          summary={activeSummary}
          topics={summaryTopics}
          onClose={() => {
            setShowSummaryModal(false);
            setConversation([]);
          }}
        />
      )}

      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirmSignOut={handleSignOut}
        isSigningOut={isSigningOut}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onGoogleSignIn={handleGoogleSignIn}
        isAuthenticating={isAuthenticating}
        error={authError}
      />

    </div>
  );
}
