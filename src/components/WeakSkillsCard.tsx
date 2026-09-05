import React from 'react';
import { AlertCircle, ArrowUpRight, Flame, Dumbbell, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { WeakSkillItem } from '../types';

interface WeakSkillsCardProps {
  weakSkills: WeakSkillItem[];
  overallDiagnosis?: string;
  loading: boolean;
  onRefresh: () => void;
  onPracticeTopic: (topic: string, suggestedPrompt: string) => void;
}

export const WeakSkillsCard: React.FC<WeakSkillsCardProps> = ({
  weakSkills,
  overallDiagnosis,
  loading,
  onRefresh,
  onPracticeTopic
}) => {
  return (
    <div 
      id="weak-skills-detection-card"
      className="rounded-2xl bg-gradient-to-br from-[#0c1429]/90 to-[#060b18]/90 border border-amber-500/30 p-5 sm:p-6 shadow-[0_0_20px_rgba(245,158,11,0.06)] mb-6 transition-all duration-300 hover:border-amber-500/50 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-semibold">
                Needs More Practice • Weak-Skill Detection
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Identified Concept Friction Points
            </h3>
          </div>
        </div>

        <button
          id="refresh-weak-skills-btn"
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 rounded-xl bg-[#141f3b]/80 hover:bg-[#1a2c54] border border-[#233560] text-slate-400 hover:text-amber-400 transition-all duration-200 cursor-pointer disabled:opacity-50"
          title="Re-analyze past sessions for difficult topics"
          aria-label="Re-analyze weak skills"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 py-2 animate-pulse">
          <div className="h-14 bg-slate-800/60 rounded-xl" />
          <div className="h-14 bg-slate-800/40 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-3">
          {overallDiagnosis && (
            <p className="text-xs text-slate-300 leading-relaxed bg-[#0b1328]/60 p-3 rounded-xl border border-[#142347]">
              <span className="text-amber-300 font-medium font-mono text-[11px]">Coach Insight: </span>
              {overallDiagnosis}
            </p>
          )}

          {weakSkills.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#091124] border border-[#142347] text-center text-xs text-slate-400">
              No recurring friction points detected! All analyzed topics have high mastery ratings.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {weakSkills.map((item) => (
                <div
                  key={item.id}
                  id={`weak-skill-${item.id}`}
                  className="p-3.5 rounded-xl bg-[#0a152d]/80 hover:bg-[#0f1d3d] border border-amber-500/20 hover:border-amber-500/40 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                        {item.topic}
                      </h4>
                      <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <Flame className="w-2.5 h-2.5 text-amber-400" />
                        {item.struggleCount}x noted
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2 mb-3">
                      {item.difficultySummary}
                    </p>
                  </div>

                  <button
                    id={`practice-weak-skill-${item.id}-btn`}
                    onClick={() => onPracticeTopic(item.topic, item.suggestedPracticePrompt)}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 font-mono text-[11px] font-medium flex items-center justify-between gap-1 transition-all duration-150 cursor-pointer active:scale-98"
                  >
                    <span className="truncate">Drill with AI Coach</span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
