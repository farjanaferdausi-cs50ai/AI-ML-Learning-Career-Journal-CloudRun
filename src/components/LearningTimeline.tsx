import React, { useState } from 'react';
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
  Camera
} from 'lucide-react';
import type { JournalSession } from '../types';

interface LearningTimelineProps {
  sessions: JournalSession[];
  onStartSessionPrompt?: (prompt: string) => void;
}

// Sample fallback sessions matching reference mockup if none in database yet
const DEFAULT_SAMPLE_SESSIONS: JournalSession[] = [
  {
    id: 'session-sample-1',
    userId: 'sample',
    createdAt: new Date('2025-05-28T14:45:00').getTime(),
    topics: ['Deep Learning', 'PyTorch', 'Transformers', 'LLM Systems'],
    conversation: [],
    summary: {
      keyTakeaway: 'Self-attention dynamically weights token relevance similar to strategic talent allocation...',
      whatWasWorkedOn: 'Transformer architecture & self-attention mechanics in PyTorch',
      whatWasDifficult: 'Positional encoding and QKV matrix dimension projections',
      whatWasAccomplished: 'Built single-head attention from scratch',
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
      keyTakeaway: 'Explored Probability Distributions and their applications in ML...',
      whatWasWorkedOn: 'Gaussian distributions, Bayes Theorem & maximum likelihood estimation',
      whatWasDifficult: 'Variance-covariance matrix manipulation',
      whatWasAccomplished: 'Implemented naive Bayes classifier in Python',
      actionableGoalTomorrow: 'Review gradient descent optimization calculus',
      careerTransitionProgressNote: 'Strong intuitive grasp of probabilistic risk assessment from compensation modeling.',
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
      keyTakeaway: 'Mastered Pandas data aggregation and feature engineering workflows...',
      whatWasWorkedOn: 'Data wrangling on Kaggle HR attrition dataset',
      whatWasDifficult: 'MultiIndex grouping aggregations',
      whatWasAccomplished: 'Built clean EDA pipeline with Seaborn & Plotly',
      actionableGoalTomorrow: 'Train baseline logistic regression on prepared features',
      careerTransitionProgressNote: 'Applied 14+ years of attrition domain knowledge directly to feature selection.',
      whatWasLearned: [
        'Pandas GroupBy & Pivot Tables',
        'Missing value imputation strategies',
        'Correlation heatmaps & feature significance'
      ]
    }
  }
];

export const LearningTimeline: React.FC<LearningTimelineProps> = ({
  sessions,
  onStartSessionPrompt
}) => {
  // Use real sessions if available, otherwise display sample mock sessions
  const activeSessionsList = sessions.length > 0 ? sessions : DEFAULT_SAMPLE_SESSIONS;

  const [expandedId, setExpandedId] = useState<string | null>(
    activeSessionsList.length > 0 ? (activeSessionsList[0].id || 'session-sample-1') : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(['session-sample-1']));

  const allTopics = Array.from(
    new Set(activeSessionsList.flatMap(s => s.topics || []))
  );

  const filteredSessions = activeSessionsList.filter(s => {
    const matchesSearch = 
      !searchQuery ||
      s.summary?.keyTakeaway?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.topics?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTopic = 
      selectedTopic === 'All Topics' ||
      s.topics?.includes(selectedTopic);

    return matchesSearch && matchesTopic;
  });

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

  return (
    <section id="learning-timeline-section" className="w-full space-y-4 select-none">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-[#00F0FF]">
            <BookText className="w-4 h-4" />
          </div>
          <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white font-mono">
            LEARNING JOURNAL
          </h2>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
            {activeSessionsList.length} JOURNALS
          </span>
        </div>

        {/* Search & Topic Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search journal..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#070e24] border border-[#18264e] text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 w-40 sm:w-48"
            />
          </div>

          <div className="relative">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#070e24] border border-[#18264e] text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer pr-6"
            >
              <option value="All Topics">All Topics</option>
              {allTopics.map((t, idx) => (
                <option key={idx} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vertical Timeline Container */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#00F0FF] via-purple-500 to-blue-500">
        
        {filteredSessions.map((session, index) => {
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
              <div className={`rounded-xl transition-all duration-200 border ${
                isExpanded 
                  ? 'bg-[#070d22] border-cyan-400/70 shadow-[0_0_24px_rgba(0,240,255,0.18)]' 
                  : 'bg-[#070e24] border-[#142347] hover:border-cyan-500/40 hover:bg-[#0a1433]'
              }`}>
                
                {/* Header Row */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : id)}
                  className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1.5 flex-1">
                    
                    {/* Date & Tags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-300 font-semibold">
                        {dateStr}
                      </span>

                      {session.topics && session.topics.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className={`text-[9px] font-mono font-medium px-2 py-0.5 rounded border ${getTagColor(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Summary Headline */}
                    <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-cyan-200 transition-colors">
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
                      className="hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                      title={isExpanded ? "Collapse Notes" : "View Notes"}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isExpanded ? "Hide" : "Notes"}</span>
                    </button>

                    <button
                      onClick={(e) => toggleBookmark(id, e)}
                      className={`flex items-center gap-1 cursor-pointer transition-colors ${
                        isBookmarked ? 'text-cyan-400 font-bold' : 'hover:text-cyan-300'
                      }`}
                      title="Bookmark"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-cyan-400' : ''}`} />
                      <span className="hidden sm:inline">Bookmark</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(prev => prev === id ? null : id);
                      }}
                      className="hover:text-slate-200 cursor-pointer p-1 rounded"
                      title="Toggle Session Details"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
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
                        {session.summary?.keyTakeaway}
                      </p>
                    </div>

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

                      {/* NEXT STEPS */}
                      <div className="space-y-2 p-3 rounded-xl bg-[#070e24] border border-[#142347]">
                        <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[10px] font-mono uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>NEXT STEPS</span>
                        </div>

                        <div className="space-y-1.5">
                          {[
                            'Implement a mini Transformer',
                            'Experiment with different attention heads',
                            'Read "Attention is All You Need" again',
                            'Try building a project with real dataset',
                            'Write a journal reflection'
                          ].map((step, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>
          );
        })}

      </div>

      {/* Bottom Link: View All Journals */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => {
            const el = document.getElementById('learning-timeline-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>View All Journals ({activeSessionsList.length} indexed)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </section>
  );
};
