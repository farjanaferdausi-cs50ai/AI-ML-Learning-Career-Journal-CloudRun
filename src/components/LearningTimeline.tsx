import React, { useState, useEffect, useRef } from 'react';
import { 
  BookText, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Edit3, 
  Bookmark, 
  MoreHorizontal,
  ArrowRight,
  Sparkles,
  Camera,
  X,
  Loader2,
  RotateCcw,
  Cpu,
  Brain,
  HelpCircle,
  TrendingUp,
  Plus,
  MapPin,
  ExternalLink,
  Share2
} from 'lucide-react';
import type { JournalSession, TimelineSearchResult, JournalLocation } from '../types';
import { TimelineSkeleton } from './common/LoadingState';
import { EmptyState } from './common/EmptyState';
import { ErrorState } from './common/ErrorState';
import { LocationBadge } from './LocationBadge';
import { LocationPickerModal } from './LocationPickerModal';
import { getGoogleMapsUrl } from '../lib/googleMaps';

interface LearningTimelineProps {
  sessions: JournalSession[];
  onStartSessionPrompt?: (prompt: string) => void;
  isLoading?: boolean;
  onUpdateSessionLocation?: (sessionId: string, location: JournalLocation | null) => Promise<void>;
}

// Sample fallback sessions matching reference mockup if none in database yet
const DEFAULT_SAMPLE_SESSIONS: JournalSession[] = [
  {
    id: 'session-sample-1',
    userId: 'sample',
    createdAt: new Date('2025-05-28T14:45:00').getTime(),
    topics: ['Deep Learning', 'PyTorch', 'Transformers', 'LLM Systems'],
    location: {
      lat: 37.7749,
      lng: -122.4194,
      placeName: 'AI Research Lab & Study Hub, San Francisco, CA'
    },
    conversation: [],
    summary: {
      keyTakeaway: 'Self-attention dynamically weights token relevance similar to strategic talent allocation across cross-functional enterprise units.',
      whatWasWorkedOn: 'Transformer architecture & self-attention mechanics in PyTorch',
      whatWasDifficult: 'Positional encoding and QKV matrix dimension projections',
      whatWasAccomplished: 'Built single-head attention from scratch and validated output dimensions',
      actionableGoalTomorrow: 'Implement multi-head attention and test with real sentence vectors',
      careerTransitionProgressNote: 'Bridged human talent routing analogies to query-key-value token routing.',
      whatWasLearned: [
        'Scaled Dot-Product Attention',
        'Multi-Head Attention mechanism',
        'Transformer architecture',
        'Positional encoding',
        'FlashAttention-2 and GQA'
      ]
    }
  },
  {
    id: 'session-sample-2',
    userId: 'sample',
    createdAt: new Date('2025-05-27T10:15:00').getTime(),
    topics: ['Python', 'Math', 'Statistics'],
    conversation: [],
    summary: {
      keyTakeaway: 'Explored Probability Distributions and their applications in ML decision boundaries and Bayesian priors.',
      whatWasWorkedOn: 'Gaussian distributions, Bayes Theorem & maximum likelihood estimation',
      whatWasDifficult: 'Variance-covariance matrix manipulation in multidimensional feature space',
      whatWasAccomplished: 'Implemented naive Bayes classifier in Python from mathematical equations',
      actionableGoalTomorrow: 'Review gradient descent optimization calculus and loss surfaces',
      careerTransitionProgressNote: 'Strong intuitive grasp of probabilistic risk assessment from 14+ years of talent risk modeling.',
      whatWasLearned: [
        'Gaussian Distributions & Normal Curve',
        'Bayesian Inference & Priors',
        'Maximum Likelihood Estimation'
      ]
    }
  },
  {
    id: 'session-sample-3',
    userId: 'sample',
    createdAt: new Date('2025-05-26T09:00:00').getTime(),
    topics: ['Data Science', 'Pandas', 'Visualization'],
    conversation: [],
    summary: {
      keyTakeaway: 'Mastered Pandas data aggregation and feature engineering workflows on complex tabular datasets.',
      whatWasWorkedOn: 'Data wrangling on Kaggle HR attrition dataset',
      whatWasDifficult: 'MultiIndex grouping aggregations and pivot reshaping',
      whatWasAccomplished: 'Built clean exploratory data analysis (EDA) pipeline with Seaborn & Plotly',
      actionableGoalTomorrow: 'Train baseline logistic regression on prepared features',
      careerTransitionProgressNote: 'Applied 14+ years of attrition domain knowledge directly to feature selection and hypothesis testing.',
      whatWasLearned: [
        'Pandas GroupBy & Pivot Tables',
        'Missing value imputation strategies',
        'Correlation heatmaps & feature significance'
      ]
    }
  }
];

const SUGGESTED_QUERIES = [
  'When did I struggle with backpropagation or QKV projections?',
  'Show me everything about Transformers & Self-Attention',
  'What did I learn about Bayes and Probability?',
  'How did I apply my 14+ years of HR experience to ML?'
];

// In-memory cache for AI Search queries to avoid duplicate API requests
const aiSearchQueryCache = new Map<string, TimelineSearchResult>();

export const LearningTimeline: React.FC<LearningTimelineProps> = ({
  sessions,
  onStartSessionPrompt,
  isLoading = false,
  onUpdateSessionLocation
}) => {
  // Use real sessions if available, otherwise display sample mock sessions
  const activeSessionsList = React.useMemo(() => {
    return sessions.length > 0 ? sessions : DEFAULT_SAMPLE_SESSIONS;
  }, [sessions]);

  const [expandedId, setExpandedId] = useState<string | null>(() => 
    activeSessionsList.length > 0 ? (activeSessionsList[0].id || 'session-sample-1') : null
  );

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchResult, setAiSearchResult] = useState<TimelineSearchResult | null>(null);
  const [aiSearchError, setAiSearchError] = useState<string | null>(null);
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => new Set(['session-sample-1']));

  // Pagination limit state for large session histories
  const [visibleCount, setVisibleCount] = useState(10);

  // Location management on timeline sessions
  const [locationModalSession, setLocationModalSession] = useState<JournalSession | null>(null);

  // Three-dot options menu state for individual sessions
  const [openMenuSessionId, setOpenMenuSessionId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle outside click to close session three-dot menu
  useEffect(() => {
    if (!openMenuSessionId) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuSessionId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuSessionId]);

  // Close three-dot menu, expanded card, or location modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (openMenuSessionId) {
          setOpenMenuSessionId(null);
        } else if (locationModalSession) {
          setLocationModalSession(null);
        } else if (expandedId) {
          setExpandedId(null);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openMenuSessionId, locationModalSession, expandedId]);

  // Debounce search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const allTopics = React.useMemo(() => {
    return Array.from(new Set(activeSessionsList.flatMap(s => s.topics || [])));
  }, [activeSessionsList]);

  // Perform AI Search with client caching and duplicate request prevention
  const handlePerformAiSearch = async (queryToSearch?: string) => {
    const q = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!q || isAiSearching) return;

    // Check client-side query cache first (0ms instant response)
    const cacheKey = `${q.toLowerCase()}-${activeSessionsList.length}`;
    if (aiSearchQueryCache.has(cacheKey)) {
      const cached = aiSearchQueryCache.get(cacheKey)!;
      setAiSearchResult(cached);
      setAiSearchError(null);
      if (cached.relevantSessionIds && cached.relevantSessionIds.length > 0) {
        setExpandedId(cached.relevantSessionIds[0]);
      }
      return;
    }

    setIsAiSearching(true);
    setAiSearchError(null);

    try {
      // Prepare lightweight summaries payload (no raw chat transcripts to minimize payload size & latency)
      const lightweightSessions = activeSessionsList.map(s => ({
        id: s.id,
        createdAt: s.createdAt,
        topics: s.topics || [],
        summary: {
          keyTakeaway: s.summary?.keyTakeaway,
          whatWasWorkedOn: s.summary?.whatWasWorkedOn,
          whatWasDifficult: s.summary?.whatWasDifficult,
          whatWasAccomplished: s.summary?.whatWasAccomplished,
          whatWasLearned: s.summary?.whatWasLearned,
          careerTransitionProgressNote: s.summary?.careerTransitionProgressNote,
          actionableGoalTomorrow: s.summary?.actionableGoalTomorrow
        }
      }));

      const res = await fetch('/api/timeline/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          sessions: lightweightSessions
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        // Cache result for 0ms subsequent lookups
        aiSearchQueryCache.set(cacheKey, json.data);
        setAiSearchResult(json.data);
        // If matches found, auto-expand the top ranked session for immediate insight
        if (json.data.relevantSessionIds && json.data.relevantSessionIds.length > 0) {
          setExpandedId(json.data.relevantSessionIds[0]);
        }
      } else {
        throw new Error(json.error || 'Failed to synthesize search');
      }
    } catch (err: any) {
      console.warn('AI search proxy encountered an issue, switching to local keyword ranking:', err);
      setAiSearchError(err?.message || 'AI service temporarily unavailable. Using keyword filter.');
      
      // Fallback local keyword matching
      const qLower = q.toLowerCase();
      const matched = activeSessionsList.filter(s => 
        s.summary?.keyTakeaway?.toLowerCase().includes(qLower) ||
        s.summary?.whatWasWorkedOn?.toLowerCase().includes(qLower) ||
        s.summary?.whatWasDifficult?.toLowerCase().includes(qLower) ||
        s.topics?.some(t => t.toLowerCase().includes(qLower))
      );

      const fallbackResult: TimelineSearchResult = {
        query: q,
        answer: matched.length > 0
          ? `Found ${matched.length} journal entry(s) referencing "${q}". Top takeaway: ${matched[0].summary?.keyTakeaway || 'Review notes below.'}`
          : `No matching sessions found yet for "${q}" — keep journaling!`,
        relevantSessionIds: matched.map(m => m.id),
        relevanceExplanation: 'Filtered via keyword alignment.'
      };

      aiSearchQueryCache.set(cacheKey, fallbackResult);
      setAiSearchResult(fallbackResult);
      if (matched.length > 0) {
        setExpandedId(matched[0].id);
      }
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleClearAiSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setAiSearchResult(null);
    setAiSearchError(null);
    setVisibleCount(10);
  };

  // Determine sessions to display (Memoized for optimal render performance)
  const displayedSessions: JournalSession[] = React.useMemo(() => {
    if (aiSearchResult) {
      if (aiSearchResult.relevantSessionIds && aiSearchResult.relevantSessionIds.length > 0) {
        const idMap = new Map(activeSessionsList.map(s => [s.id, s]));
        const ranked: JournalSession[] = [];
        aiSearchResult.relevantSessionIds.forEach(id => {
          const found = idMap.get(id);
          if (found) ranked.push(found);
        });
        return ranked;
      }
      return [];
    }

    const queryLower = debouncedQuery.toLowerCase();
    return activeSessionsList.filter((s, idx) => {
      const matchesSearch = 
        !queryLower ||
        s.summary?.keyTakeaway?.toLowerCase().includes(queryLower) ||
        s.summary?.whatWasWorkedOn?.toLowerCase().includes(queryLower) ||
        s.topics?.some(t => t.toLowerCase().includes(queryLower));

      const matchesTopic = 
        selectedTopic === 'All Topics' ||
        s.topics?.includes(selectedTopic);

      const matchesDay = 
        dayFilter === 'all' ||
        (dayFilter === 'day2' && idx === 0) ||
        (dayFilter === 'day1' && idx === 1);

      return matchesSearch && matchesTopic && matchesDay;
    });
  }, [aiSearchResult, activeSessionsList, debouncedQuery, selectedTopic, dayFilter]);

  const isAiResultActive = !!aiSearchResult;
  const visibleSessions = React.useMemo(() => {
    return displayedSessions.slice(0, visibleCount);
  }, [displayedSessions, visibleCount]);

  const getDayBadgeInfo = (index: number, session: JournalSession) => {
    if (isAiResultActive) {
      return { 
        label: `MATCH #${index + 1}`, 
        sub: 'RANKED', 
        bg: 'bg-cyan-950/90 text-cyan-300 border-cyan-400/60 shadow-[0_0_10px_rgba(0,240,255,0.35)]' 
      };
    }

    if (index === 0) {
      return { label: 'DAY 2', sub: 'TODAY', bg: 'bg-cyan-950/90 text-cyan-300 border-cyan-400/50 shadow-[0_0_8px_rgba(0,240,255,0.3)]' };
    } else if (index === 1) {
      return { label: 'DAY 1', sub: 'YESTERDAY', bg: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]' };
    } else {
      const dayNum = Math.max(1, activeSessionsList.length - index);
      return { label: `DAY ${dayNum}`, sub: 'COMPLETED', bg: 'bg-purple-950/80 text-purple-300 border-purple-500/40' };
    }
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getTagColor = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes('deep learning')) return 'text-blue-300 border-blue-500/40 bg-blue-950/40';
    if (t.includes('pytorch')) return 'text-cyan-300 border-cyan-500/40 bg-cyan-950/40';
    if (t.includes('transformer')) return 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40';
    if (t.includes('llm')) return 'text-amber-300 border-amber-500/40 bg-amber-950/40';
    if (t.includes('python')) return 'text-blue-300 border-blue-500/40 bg-blue-950/40';
    if (t.includes('math')) return 'text-cyan-300 border-cyan-500/40 bg-cyan-950/40';
    if (t.includes('stat')) return 'text-purple-300 border-purple-500/40 bg-purple-950/40';
    return 'text-purple-300 border-purple-500/40 bg-purple-950/40';
  };

  const getNodeColor = (index: number) => {
    if (index === 0) return 'border-cyan-400 text-cyan-400 shadow-[0_0_8px_#00f3ff]';
    if (index === 1) return 'border-purple-400 text-purple-400 shadow-[0_0_8px_#a855f7]';
    return 'border-blue-400 text-blue-400 shadow-[0_0_8px_#3b82f6]';
  };

  if (isLoading) {
    return (
      <section id="learning-timeline-section" className="w-full space-y-4 select-none">
        <div className="flex items-center justify-between border-b border-[#142347] pb-3">
          <div className="flex items-center gap-2">
            <BookText className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-mono font-bold text-white tracking-wide">
              DAILY REFLECTION TIMELINE
            </h2>
          </div>
          <span className="text-xs font-mono text-cyan-300">Syncing journal archives...</span>
        </div>
        <TimelineSkeleton count={3} />
      </section>
    );
  }

  return (
    <section id="learning-timeline-section" className="w-full space-y-4 select-none">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-[#00F0FF]">
            <BookText className="w-4 h-4" />
          </div>
          <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white font-mono">
            LEARNING JOURNAL &amp; TIMELINE
          </h2>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
            {activeSessionsList.length} JOURNALS
          </span>
        </div>

        {/* Day Filter Pills & Topics Filter */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {!isAiResultActive && (
            <>
              {/* Day Filter Pills */}
              <div className="flex items-center gap-1 bg-[#070e24] p-0.5 rounded-lg border border-[#18264e]">
                <button
                  id="filter-all-days"
                  onClick={() => setDayFilter('all')}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-all duration-200 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none cursor-pointer ${
                    dayFilter === 'all'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Days
                </button>
                <button
                  id="filter-day-2"
                  onClick={() => setDayFilter('day2')}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-all duration-200 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none cursor-pointer ${
                    dayFilter === 'day2'
                      ? 'bg-cyan-500/25 text-cyan-300 font-bold border border-cyan-400/60 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                      : 'text-slate-400 hover:text-cyan-300'
                  }`}
                >
                  Day 2 (Today)
                </button>
                <button
                  id="filter-day-1"
                  onClick={() => setDayFilter('day1')}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-all duration-200 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none cursor-pointer ${
                    dayFilter === 'day1'
                      ? 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-400/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : 'text-slate-400 hover:text-emerald-300'
                  }`}
                >
                  Day 1 (Yesterday)
                </button>
              </div>

              {/* Topic Dropdown */}
              <div className="relative">
                <select
                  id="timeline-topic-select"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#070e24] border border-[#18264e] text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200 cursor-pointer pr-6"
                >
                  <option value="All Topics">All Topics</option>
                  {allTopics.map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {isAiResultActive && (
            <button
              id="clear-ai-search-header-btn"
              onClick={handleClearAiSearch}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-xs font-mono flex items-center gap-1.5 hover:bg-cyan-900/50 transition-all duration-200 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Search / Show All</span>
            </button>
          )}
        </div>
      </div>

      {/* AI-POWERED SEARCH BAR */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#070e24] via-[#0b1638] to-[#070e24] p-3 sm:p-4 border border-cyan-500/30 shadow-[0_4px_24px_rgba(0,240,255,0.08)] space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          
          {/* Search Input Box */}
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-cyan-400 pointer-events-none">
              <Sparkles className="w-4 h-4 animate-pulse text-[#00F0FF]" />
            </div>
            <input
              id="timeline-ai-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  handlePerformAiSearch();
                }
              }}
              placeholder="Ask about your learning history... (e.g. 'When did I struggle with backpropagation?')"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#050b1a]/90 border border-cyan-500/30 text-xs sm:text-sm font-mono text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-inner transition-all duration-200"
            />
            {searchQuery && (
              <button
                id="clear-search-input-btn"
                onClick={() => {
                  setSearchQuery('');
                  if (aiSearchResult) setAiSearchResult(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1 rounded transition-all duration-150 active:scale-90"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Button: Ask AI */}
          <button
            id="submit-ai-search-btn"
            onClick={() => handlePerformAiSearch()}
            disabled={isAiSearching || !searchQuery.trim()}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center justify-center gap-2 transition-all duration-200 ease-out cursor-pointer shrink-0 ${
              isAiSearching || !searchQuery.trim()
                ? 'bg-cyan-950/40 text-cyan-500/50 border border-cyan-900/40 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-[0_0_16px_rgba(0,240,255,0.35)] border border-cyan-300/40 hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none'
            }`}
          >
            {isAiSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Ask AI Search</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-cyan-400" />
            <span>Try asking:</span>
          </span>
          {SUGGESTED_QUERIES.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(chip);
                handlePerformAiSearch(chip);
              }}
              className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#07122e] hover:bg-cyan-950/70 border border-[#172957] hover:border-cyan-400/50 text-slate-300 hover:text-cyan-200 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none cursor-pointer truncate max-w-[260px] sm:max-w-none"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING STATE */}
      {isAiSearching && (
        <div className="p-4 rounded-2xl bg-[#070e24]/90 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.15)] flex flex-col items-center justify-center gap-2.5 py-6 animate-pulse">
          <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-[#00F0FF]" />
            <span>Gemini AI is analyzing journal archives &amp; synthesizing timeline insights...</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono text-center max-w-md">
            Synthesizing key takeaways, learning milestones, and technical friction points across your authenticated history.
          </p>
        </div>
      )}

      {/* AI SEARCH ERROR */}
      {aiSearchError && (
        <ErrorState
          type="ai_gemini"
          inline
          title="Timeline Search Notice"
          message={aiSearchError}
          retryLabel="Retry Search"
          onRetry={() => handlePerformAiSearch()}
          onDismiss={() => setAiSearchError(null)}
        />
      )}

      {/* AI SYNTHESIS ANSWER CARD */}
      {aiSearchResult && !isAiSearching && (
        <div className="rounded-2xl bg-gradient-to-b from-[#070e24] to-[#040817] border border-cyan-400/60 shadow-[0_0_28px_rgba(0,240,255,0.16)] p-4 sm:p-5 space-y-3">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#142347] pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-cyan-950/90 text-cyan-300 border border-cyan-400/60 shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>AI KNOWLEDGE SYNTHESIS</span>
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-500/40">
                GEMINI 3.7 FLASH REASONING
              </span>
              {aiSearchResult.matchedTopics && aiSearchResult.matchedTopics.map((top, tIdx) => (
                <span key={tIdx} className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                  #{top}
                </span>
              ))}
            </div>

            <button
              id="clear-ai-search-card-btn"
              onClick={handleClearAiSearch}
              className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors self-start sm:self-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Show All Timeline Entries ({activeSessionsList.length})</span>
            </button>
          </div>

          {/* User Query Query Echo */}
          <div className="text-xs font-mono text-cyan-300/80 font-medium">
            Inquiry: &ldquo;<span className="text-slate-200">{aiSearchResult.query}</span>&rdquo;
          </div>

          {/* Synthesized Answer Box */}
          <div className="p-3.5 rounded-xl bg-[#09132e]/90 border border-cyan-500/30 text-slate-100 text-xs sm:text-sm leading-relaxed space-y-2 shadow-inner font-sans">
            <p className="font-medium text-slate-100 whitespace-pre-line">
              {aiSearchResult.answer}
            </p>
            {aiSearchResult.relevanceExplanation && (
              <div className="text-[10px] font-mono text-cyan-400/90 pt-1 border-t border-[#15244f] flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-cyan-400" />
                <span>{aiSearchResult.relevanceExplanation}</span>
              </div>
            )}
          </div>

          {/* Results Summary Subtitle */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>
              {displayedSessions.length > 0
                ? `Showing ${displayedSessions.length} ranked matching session card(s) below:`
                : 'No matching sessions found for this specific inquiry.'}
            </span>
            {displayedSessions.length > 0 && (
              <span className="text-cyan-400">Click any card below to expand full details</span>
            )}
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {displayedSessions.length === 0 && !isAiSearching && (
        <EmptyState
          variant={searchQuery ? 'search' : 'journal'}
          title={searchQuery ? `No matching entries for "${searchQuery}"` : 'No Journal Entries Found'}
          description={
            searchQuery
              ? 'Try adjusting your search terms, filtering by a different topic, or start a new reflection session with your AI Coach.'
              : 'Complete your first coaching dialogue or save a deep reflection entry to populate your timeline.'
          }
          actionLabel={searchQuery ? 'Clear Filter' : 'Start First Journal Entry'}
          onAction={searchQuery ? handleClearAiSearch : () => onStartSessionPrompt?.('Today I want to reflect on my AI/ML progress')}
          secondaryActionLabel={searchQuery && onStartSessionPrompt ? 'Ask AI Coach About This' : undefined}
          onSecondaryAction={searchQuery && onStartSessionPrompt ? () => onStartSessionPrompt(searchQuery) : undefined}
        />
      )}

      {/* VERTICAL TIMELINE CONTAINER */}
      {displayedSessions.length > 0 && (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#00F0FF] via-purple-500 to-blue-500">
          
          {visibleSessions.map((session, index) => {
            const id = session.id || `session-${index}`;
            const isExpanded = expandedId === id;
            const isBookmarked = bookmarkedIds.has(id);

            const dateStr = session.createdAt 
              ? new Date(session.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) + ' • ' + new Date(session.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
              : 'May 28, 2025 • 2:45 PM';

            return (
              <div key={id} className="relative group">
                
                {/* Timeline Dot Marker */}
                <div 
                  className={`absolute -left-6 top-3.5 w-3.5 h-3.5 rounded-full bg-[#050b18] border-2 transition-transform group-hover:scale-125 ${getNodeColor(index)}`}
                />

                {/* Journal Card */}
                <div 
                  id={`timeline-card-${id}`}
                  className={`rounded-xl transition-all duration-200 ease-out border ${
                    isExpanded 
                      ? 'bg-[#070d22] border-cyan-400/70 shadow-[0_0_24px_rgba(0,240,255,0.18)]' 
                      : 'bg-[#070e24] border-[#142347] hover:border-cyan-500/40 hover:bg-[#0a1433] hover:-translate-y-0.5'
                  }`}
                >
                  
                  {/* Header Row */}
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : id)}
                    className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1.5 flex-1">
                      
                      {/* Date, Day Badge & Tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Prominent Day / Match Badge */}
                        {(() => {
                          const badgeInfo = getDayBadgeInfo(index, session);
                          return (
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all duration-200 ${badgeInfo.bg}`}>
                              <span>{badgeInfo.label}</span>
                              <span className="opacity-80 text-[8px]">({badgeInfo.sub})</span>
                            </span>
                          );
                        })()}

                        <span className="text-xs font-mono text-slate-300 font-semibold">
                          {dateStr}
                        </span>

                        {session.topics && session.topics.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className={`text-[9px] font-mono font-medium px-2 py-0.5 rounded border transition-colors duration-150 ${getTagColor(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}

                        {/* Location Tag Badge (if location is attached) */}
                        {session.location && (
                          <LocationBadge location={session.location} size="sm" />
                        )}
                      </div>

                      {/* Summary Headline */}
                      <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-cyan-200 transition-colors duration-150">
                        {session.summary?.keyTakeaway || session.summary?.whatWasWorkedOn || 'AI/ML Study & Coaching Reflection'}
                      </h3>
                    </div>

                    {/* Actions on Right */}
                    <div className="flex items-center gap-3 self-end sm:self-center text-slate-400 text-xs font-mono">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(prev => prev === id ? null : id);
                        }}
                        className="hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none rounded px-1"
                        title={isExpanded ? "Collapse Notes" : "View Notes"}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isExpanded ? "Hide" : "Notes"}</span>
                      </button>

                      <button
                        onClick={(e) => toggleBookmark(id, e)}
                        className={`flex items-center gap-1 cursor-pointer transition-all duration-150 active:scale-90 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none rounded px-1 ${
                          isBookmarked ? 'text-cyan-400 font-bold' : 'hover:text-cyan-300'
                        }`}
                        title="Bookmark"
                      >
                        <Bookmark className={`w-3.5 h-3.5 transition-transform duration-150 ${isBookmarked ? 'fill-cyan-400 scale-110' : ''}`} />
                        <span className="hidden sm:inline">Bookmark</span>
                      </button>

                      <div className="relative" ref={openMenuSessionId === id ? menuRef : null}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuSessionId(prev => prev === id ? null : id);
                          }}
                          aria-expanded={openMenuSessionId === id}
                          aria-label="Session options menu"
                          className={`cursor-pointer p-1 rounded transition-all duration-150 active:scale-90 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                            openMenuSessionId === id 
                              ? 'bg-slate-800 text-cyan-300' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                          }`}
                          title="Session Options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {openMenuSessionId === id && (
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-[#0F172A] border border-[#1E293B] shadow-2xl p-1.5 z-30 animate-in fade-in duration-150 text-xs font-mono"
                          >
                            <div className="flex items-center justify-between px-2 py-1 text-[10px] text-slate-400 border-b border-[#1E293B] mb-1">
                              <span>Session Options</span>
                              <button
                                type="button"
                                onClick={() => setOpenMenuSessionId(null)}
                                className="p-0.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                                aria-label="Close menu"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuSessionId(null);
                                setExpandedId(prev => prev === id ? null : id);
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors text-left cursor-pointer"
                            >
                              <span>{isExpanded ? 'Hide Notes & Details' : 'View Notes & Details'}</span>
                              <Edit3 className="w-3 h-3 text-cyan-400" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                toggleBookmark(id, e);
                                setOpenMenuSessionId(null);
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors text-left cursor-pointer"
                            >
                              <span>{isBookmarked ? 'Remove Bookmark' : 'Bookmark Entry'}</span>
                              <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-cyan-400 text-cyan-400' : 'text-slate-400'}`} />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuSessionId(null);
                                setLocationModalSession(session);
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors text-left cursor-pointer"
                            >
                              <span>{session.location ? 'Update Study Venue' : 'Tag Study Venue'}</span>
                              <MapPin className="w-3 h-3 text-cyan-400" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuSessionId(null);
                                const text = `AI/ML Career Transition Journal\nDate: ${new Date(session.createdAt).toLocaleDateString()}\nKey Takeaway: ${session.summary?.keyTakeaway || 'N/A'}\nAccomplished: ${session.summary?.whatWasAccomplished || 'N/A'}`;
                                navigator.clipboard?.writeText(text);
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors text-left cursor-pointer"
                            >
                              <span>Copy Summary</span>
                              <Share2 className="w-3 h-3 text-cyan-400" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-5 pt-1 border-t border-[#121c38] space-y-4 bg-[#050a1c]">
                      
                      {/* KEY INSIGHT Callout Box */}
                      <div className="p-3.5 rounded-xl bg-[#09112a] border border-purple-500/40 space-y-1.5 shadow-inner">
                        <div className="flex items-center gap-1.5 text-purple-300 font-bold text-[10px] font-mono uppercase tracking-wider">
                          <Camera className="w-3.5 h-3.5 text-purple-400" />
                          <span>KEY INSIGHT</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                          {session.summary?.keyTakeaway || 'No key takeaway recorded.'}
                        </p>
                      </div>

                      {/* Transition Reflection Note (if present) */}
                      {session.summary?.careerTransitionProgressNote && (
                        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                          <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[10px] font-mono uppercase tracking-wider">
                            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                            <span>CAREER TRANSITION BRIDGE (HR ➔ AI/ML)</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {session.summary.careerTransitionProgressNote}
                          </p>
                        </div>
                      )}

                      {/* Two Columns: WHAT I LEARNED & NEXT STEPS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* WHAT I LEARNED */}
                        <div className="space-y-2 p-3 rounded-xl bg-[#070e24] border border-[#142347]">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] font-mono uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>WHAT I LEARNED</span>
                          </div>

                          <div className="space-y-1.5">
                            {(Array.isArray(session.summary?.whatWasLearned) 
                              ? session.summary.whatWasLearned 
                              : [
                                  'Scaled Dot-Product Attention',
                                  'Multi-Head Attention mechanism',
                                  'Transformer architecture',
                                  'Positional encoding',
                                  'FlashAttention-2 and GQA'
                                ]
                            ).map((item, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* NEXT STEPS / ACTIONABLE GOAL */}
                        <div className="space-y-2 p-3 rounded-xl bg-[#070e24] border border-[#142347]">
                          <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[10px] font-mono uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ACTIONABLE NEXT STEPS</span>
                          </div>

                          <div className="space-y-1.5">
                            {session.summary?.actionableGoalTomorrow ? (
                              <div className="flex items-center gap-2 text-xs text-slate-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                <span>{session.summary.actionableGoalTomorrow}</span>
                              </div>
                            ) : (
                              [
                                'Implement a mini Transformer',
                                'Experiment with different attention heads',
                                'Read "Attention is All You Need" paper',
                                'Test with real dataset in PyTorch'
                              ].map((step, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                  <span>{step}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                      </div>

                      {/* STUDY VENUE & LOCATION DETAILS (if tagged or editable) */}
                      {(session.location || onUpdateSessionLocation) && (
                        <div className="p-3 rounded-xl bg-[#09122c] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-[#00F0FF]">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-mono font-bold text-white block">
                                Study Venue &amp; Location
                              </span>
                              <span className="text-[11px] text-slate-300 font-sans">
                                {session.location 
                                  ? `${session.location.placeName} (${session.location.lat.toFixed(4)}°, ${session.location.lng.toFixed(4)}°)`
                                  : 'No physical location tagged for this session.'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            {session.location && (
                              <a
                                href={getGoogleMapsUrl(session.location)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/40 text-cyan-300 text-xs font-mono flex items-center gap-1 transition-colors"
                              >
                                <span>View on Google Maps</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}

                            {onUpdateSessionLocation && (
                              <button
                                onClick={() => setLocationModalSession(session)}
                                className="px-2.5 py-1 rounded-lg bg-[#070e24] hover:bg-[#0e1d42] border border-[#182a52] hover:border-cyan-400/40 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <MapPin className="w-3 h-3 text-[#00F0FF]" />
                                <span>{session.location ? 'Change' : '+ Add Location'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Collapse / Close option */}
                      <div className="flex items-center justify-end pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(null);
                          }}
                          className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-[#070e24] hover:bg-[#0e1d42] border border-[#182a52] hover:border-slate-500 transition-colors cursor-pointer"
                          aria-label="Collapse session details"
                        >
                          <X className="w-3 h-3" />
                          <span>Collapse Details</span>
                        </button>
                      </div>

                    </div>
                  )}

                </div>

              </div>
            );
          })}

          {displayedSessions.length > visibleSessions.length && (
            <div className="pt-2 flex justify-center">
              <button
                id="timeline-load-more-btn"
                onClick={() => setVisibleCount(prev => prev + 10)}
                className="px-4 py-2 rounded-xl bg-[#0b1638] border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-mono font-semibold flex items-center gap-2 shadow-lg transition-all duration-200 ease-out active:scale-95 cursor-pointer"
              >
                <span>Load More Entries ({displayedSessions.length - visibleSessions.length} remaining)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      )}

      {/* Bottom Link: View All Journals */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <button
          onClick={() => {
            handleClearAiSearch();
            const el = document.getElementById('learning-timeline-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-all duration-200 ease-out hover:translate-x-0.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none rounded px-2 py-1 cursor-pointer group"
        >
          <span>View All Journals ({activeSessionsList.length}) •</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </button>

        <p className="text-xs text-slate-400 font-medium text-center pt-1">
          You&apos;re doing great! Keep learning, keep building, keep growing! 🚀
        </p>
      </div>

      {/* Location Picker Modal for Timeline item */}
      {locationModalSession && (
        <LocationPickerModal
          isOpen={!!locationModalSession}
          initialLocation={locationModalSession.location || null}
          onClose={() => setLocationModalSession(null)}
          onSelectLocation={async (loc) => {
            if (onUpdateSessionLocation && locationModalSession) {
              await onUpdateSessionLocation(locationModalSession.id, loc);
            }
            setLocationModalSession(null);
          }}
        />
      )}

    </section>
  );
};
