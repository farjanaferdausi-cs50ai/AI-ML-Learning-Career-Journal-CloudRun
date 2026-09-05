import React from 'react';
import { Sparkles, Target, ArrowRight, RefreshCw, MessageSquare, Compass, CheckCircle2 } from 'lucide-react';
import { ProactiveFocusSuggestion } from '../types';

interface ProactiveCoachSuggestionProps {
  suggestion: ProactiveFocusSuggestion | null;
  loading: boolean;
  onRefresh: () => void;
  onSelectFocus: (suggestedPrompt: string, topics: string[]) => void;
  onAskCoachDirectly: () => void;
}

export const ProactiveCoachSuggestion: React.FC<ProactiveCoachSuggestionProps> = ({
  suggestion,
  loading,
  onRefresh,
  onSelectFocus,
  onAskCoachDirectly
}) => {
  return (
    <div 
      id="proactive-coach-suggestion-card"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#09152e]/90 via-[#070f22]/90 to-[#040817]/90 border border-[#00F0FF]/30 p-5 sm:p-6 shadow-[0_0_25px_rgba(0,240,255,0.08)] mb-6 transition-all duration-300 hover:border-[#00F0FF]/50"
    >
      {/* Background glow accents */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.25)]">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#00F0FF] font-semibold">
                AI Coach • Today's Strategic Focus
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Live Intelligence
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>{suggestion?.focusTitle || 'Daily AI/ML Mastery Target'}</span>
            </h3>
          </div>
        </div>

        <button
          id="refresh-proactive-suggestion-btn"
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-xl bg-[#0e1c38]/80 hover:bg-[#142952] border border-[#1e3a6e]/50 text-slate-300 hover:text-[#00F0FF] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          title="Refresh AI Coach Daily Focus"
          aria-label="Refresh AI Coach Suggestion"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#00F0FF]' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
        </button>
      </div>

      {/* Content Body */}
      {loading ? (
        <div className="py-4 space-y-3 animate-pulse">
          <div className="h-4 bg-slate-800 rounded-lg w-5/6" />
          <div className="h-4 bg-slate-800/60 rounded-lg w-4/6" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 bg-slate-800 rounded-md w-24" />
            <div className="h-6 bg-slate-800 rounded-md w-28" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main AI Coach Suggestion Text */}
          <div className="p-3.5 rounded-xl bg-[#0a1428]/60 border border-[#16274a]/60">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {suggestion?.suggestion || 
                'Analyze your recent PyTorch and Transformer progress. Focus today on deep multi-head attention math and tensor broadcasting geometry.'}
            </p>
            {suggestion?.reasoning && (
              <div className="mt-2.5 pt-2.5 border-t border-[#132242] flex items-start gap-2 text-[11px] text-cyan-300/80">
                <Target className="w-3.5 h-3.5 text-[#00F0FF] shrink-0 mt-0.5" />
                <span className="italic leading-snug">
                  <strong className="text-cyan-200 not-italic font-medium">Why today: </strong> 
                  {suggestion.reasoning}
                </span>
              </div>
            )}
          </div>

          {/* Recommended Topics Tag Chips */}
          {suggestion?.recommendedTopics && suggestion.recommendedTopics.length > 0 && (
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-[11px] font-mono text-slate-400">Target topics:</span>
              {suggestion.recommendedTopics.map((topic, i) => (
                <span 
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-[#00F0FF]/10 text-cyan-300 border border-[#00F0FF]/25 shadow-sm"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#00F0FF]" />
                  {topic}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 pt-1">
            <button
              id="start-session-with-focus-btn"
              onClick={() => {
                const prompt = suggestion?.suggestedPrompt || 'What should I focus on today?';
                const topics = suggestion?.recommendedTopics || ['Deep Learning', 'PyTorch'];
                onSelectFocus(prompt, topics);
              }}
              className="flex-1 min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#00A3FF] to-[#00F0FF] text-[#030a1c] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(0,240,255,0.3)] hover:shadow-[0_0_24px_rgba(0,240,255,0.5)] transition-all duration-200 cursor-pointer active:scale-98"
            >
              <Compass className="w-4 h-4 text-[#030a1c]" />
              <span>Start Session with this Focus</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="ask-coach-focus-query-btn"
              onClick={onAskCoachDirectly}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-[#0c1a36] hover:bg-[#132752] border border-[#00F0FF]/30 text-cyan-200 hover:text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-98"
              title="Ask AI Coach directly: 'What should I focus on today?'"
            >
              <MessageSquare className="w-4 h-4 text-[#00F0FF]" />
              <span>Ask Coach: "What should I focus on today?"</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
