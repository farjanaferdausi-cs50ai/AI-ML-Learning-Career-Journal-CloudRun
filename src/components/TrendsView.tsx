import React from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Award, 
  Zap, 
  ArrowUpRight, 
  CheckCircle2, 
  Compass, 
  BookOpen, 
  RefreshCw,
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';
import { JournalTrendsAnalysis } from '../types';

interface TrendsViewProps {
  trendsData: JournalTrendsAnalysis | null;
  loading: boolean;
  totalSessionsCount: number;
  onRefresh: () => void;
  onStartSession: () => void;
}

export const TrendsView: React.FC<TrendsViewProps> = ({
  trendsData,
  loading,
  totalSessionsCount,
  onRefresh,
  onStartSession
}) => {
  return (
    <div id="trends-view-container" className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#142347]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#00F0FF] font-semibold">
              AI Journal Analytics
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Trajectory Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#00F0FF]" />
            <span>Learning Trends &amp; Trajectory Insights</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Synthesizing historical study session notes and journal takeaways over time to measure momentum in your 14+ year HR to AI/ML engineering transition.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="refresh-trends-btn"
            onClick={onRefresh}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#09152e] hover:bg-[#0f2147] border border-[#00F0FF]/30 text-cyan-200 hover:text-white font-mono text-xs flex items-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00F0FF]' : ''}`} />
            <span>{loading ? 'Analyzing...' : 'Re-analyze Trends'}</span>
          </button>

          <button
            id="trends-new-session-btn"
            onClick={onStartSession}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00A3FF] to-[#00F0FF] text-[#030a1c] font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Start New Session</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6 py-6 animate-pulse">
          <div className="h-28 bg-slate-800/60 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-800/40 rounded-2xl" />
            <div className="h-64 bg-slate-800/40 rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* 1. EXECUTIVE SUMMARY HERO CARD */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1a3b]/95 via-[#081229]/95 to-[#040817]/95 border border-[#00F0FF]/30 p-5 sm:p-6 shadow-[0_0_25px_rgba(0,240,255,0.06)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.25)]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Executive Trajectory Synthesis
                  </h3>
                  <p className="text-[11px] font-mono text-cyan-300/80">
                    Based on {trendsData?.totalSessionsAnalyzed || totalSessionsCount} recorded study sessions &amp; journal entries
                  </p>
                </div>
              </div>

              {/* Velocity Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-xs font-mono text-[#00F0FF]">
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span className="capitalize font-bold">Velocity: {trendsData?.velocityTrend || 'Accelerating'}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal bg-[#071024]/70 p-4 rounded-xl border border-[#142347]">
              {trendsData?.overallSummary || 
                'Your learning trajectory shows disciplined momentum across Deep Learning, PyTorch, and Transformers, with strong retention of foundational concepts.'}
            </p>

            {trendsData?.recentConsistencyNote && (
              <div className="mt-3 flex items-center gap-2 text-xs text-purple-300 font-mono">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>{trendsData.recentConsistencyNote}</span>
              </div>
            )}
          </div>

          {/* 2. NATURAL-LANGUAGE INSIGHTS STREAM */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#071024]/90 border border-[#142347]">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Key Natural-Language Insights
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {(trendsData?.insights || []).map((insight, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#091530]/80 border border-[#162a56] flex items-start gap-3 hover:border-[#00F0FF]/40 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] text-[11px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. TOP TOPICS & HOURS LOGGED */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Topic Distribution */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#071024]/90 border border-[#142347]">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#00F0FF]" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Topic Focus &amp; Time Logged
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Estimated Breakdown</span>
              </div>

              <div className="space-y-3.5">
                {(trendsData?.topTopics || []).map((t, idx) => {
                  const maxHours = 20;
                  const barWidth = Math.min(100, Math.max(15, (t.hoursLogged / maxHours) * 100));
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{t.name}</span>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-slate-400">{t.count} sessions</span>
                          <span className="text-[#00F0FF] font-bold">{t.hoursLogged} hrs</span>
                        </div>
                      </div>

                      <div className="w-full h-2.5 bg-[#030814] rounded-full overflow-hidden p-0.5 border border-[#15254d]">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-[#00F0FF] transition-all duration-700"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strengths & Growth Opportunities */}
            <div className="space-y-4">
              {/* Strengths */}
              <div className="p-4 rounded-xl bg-[#081530]/90 border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">
                    Validated Engineering Strengths
                  </h4>
                </div>
                <div className="space-y-2">
                  {(trendsData?.strengthsIdentified || []).map((str, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Growth Opportunities */}
              <div className="p-4 rounded-xl bg-[#0c1630]/90 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2.5">
                  <Award className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">
                    Next Growth Levers
                  </h4>
                </div>
                <div className="space-y-2">
                  {(trendsData?.growthOpportunities || []).map((opp, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                      <span>{opp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
