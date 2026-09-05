import React from 'react';
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Cpu, 
  Compass, 
  Briefcase,
  RefreshCw,
  Award
} from 'lucide-react';
import { CareerIntelligenceData } from '../types';

interface CareerIntelligenceCardProps {
  careerData: CareerIntelligenceData | null;
  loading: boolean;
  onRefresh: () => void;
  onDiscussProjectWithCoach: (prompt: string) => void;
}

export const CareerIntelligenceCard: React.FC<CareerIntelligenceCardProps> = ({
  careerData,
  loading,
  onRefresh,
  onDiscussProjectWithCoach
}) => {
  const progressPercent = careerData?.estimatedProgressPercentage || 74;

  return (
    <div 
      id="career-intelligence-module"
      className="rounded-2xl bg-gradient-to-br from-[#0a1226]/95 via-[#070e20]/95 to-[#040817]/95 border border-[#00A3FF]/30 p-5 sm:p-6 shadow-[0_0_30px_rgba(0,163,255,0.08)] mb-6 transition-all duration-300 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A3FF]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0c244d] to-[#041026] border border-[#00A3FF]/50 flex items-center justify-center text-[#00A3FF] shadow-[0_0_15px_rgba(0,163,255,0.25)]">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#00A3FF] font-semibold">
                Career Intelligence &amp; Role Readiness
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                Target: {careerData?.targetRole || 'AI/ML Engineer'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              AI/ML Engineering Readiness &amp; Gap Analysis
            </h3>
          </div>
        </div>

        <button
          id="refresh-career-intelligence-btn"
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-xl bg-[#0f1d3b]/80 hover:bg-[#152a57] border border-[#1e386d] text-slate-300 hover:text-[#00A3FF] transition-all duration-200 cursor-pointer disabled:opacity-50"
          title="Recalculate Career Transition Intelligence"
          aria-label="Refresh Career Intelligence"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#00A3FF]' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 py-3 animate-pulse">
          <div className="h-8 bg-slate-800/80 rounded-xl w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-slate-800/50 rounded-xl" />
            <div className="h-32 bg-slate-800/50 rounded-xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. OVERALL PROGRESS BAR */}
          <div className="p-4 rounded-xl bg-[#081229]/80 border border-[#142347]">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
              <span className="text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#00F0FF]" />
                Estimated Overall Progress toward <strong className="text-white">"AI/ML Engineer"</strong>
              </span>
              <span className="text-[#00F0FF] font-mono text-base font-bold">
                {progressPercent}%
              </span>
            </div>

            {/* Custom progress gauge */}
            <div className="w-full h-3.5 bg-[#030814] rounded-full overflow-hidden p-0.5 border border-[#16274e] relative">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-[#00A3FF] to-[#00F0FF] transition-all duration-1000 shadow-[0_0_12px_rgba(0,240,255,0.5)] relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
              <span>Foundations &amp; Python (100%)</span>
              <span>Deep Learning &amp; PyTorch (80%)</span>
              <span>Production MLOps &amp; LLMs (60%)</span>
              <span className="text-cyan-300 font-semibold">Interview Ready ({progressPercent}%)</span>
            </div>
          </div>

          {/* 2. STRATEGIC HR ADVANTAGE BANNER */}
          {careerData?.strategicHRAdvantage && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 via-[#0b1633]/60 to-[#08132b]/60 border border-purple-500/30 flex items-start gap-3">
              <Award className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-purple-200 tracking-wide uppercase font-mono">
                  14+ Years HR Strategic Advantage
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {careerData.strategicHRAdvantage}
                </p>
              </div>
            </div>
          )}

          {/* 3. MISSING SKILL AREAS & SUGGESTED NEXT PROJECT (2 COLUMNS) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Missing Skill Areas */}
            <div className="p-4 rounded-xl bg-[#071126]/90 border border-[#15254d] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Uncovered Skill Areas for Target Role
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {(careerData?.missingSkillAreas || []).map((area, idx) => (
                    <div 
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#091530] border border-[#182a55]"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-cyan-200">
                          {area.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          area.importance === 'Essential'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : area.importance === 'Recommended'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {area.importance}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {area.skills.map((s, si) => (
                          <span key={si} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0e214d] text-slate-300 border border-[#1e3975]">
                            {s}
                          </span>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-400 italic">
                        {area.whyNeeded}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggested Next Project Idea */}
            {careerData?.suggestedNextProject && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#0c1c3d] via-[#091630] to-[#050e21] border border-[#00F0FF]/30 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00F0FF]/10 rounded-full blur-xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#00F0FF]" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Recommended Next Project
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {careerData.suggestedNextProject.difficulty}
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-white text-[#00F0FF] mb-1.5">
                    {careerData.suggestedNextProject.title}
                  </h5>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {careerData.suggestedNextProject.description}
                  </p>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {careerData.suggestedNextProject.keyTechnologies.map((tech, ti) => (
                      <span 
                        key={ti}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#00A3FF]/15 text-cyan-200 border border-[#00A3FF]/30"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Learning outcomes */}
                  <div className="space-y-1 mb-4">
                    {careerData.suggestedNextProject.learningOutcomes.map((outcome, oi) => (
                      <div key={oi} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3 h-3 text-[#00F0FF] shrink-0 mt-0.5" />
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  id="discuss-next-project-coach-btn"
                  onClick={() => onDiscussProjectWithCoach(careerData.suggestedNextProject.suggestedPrompt)}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#00A3FF] to-[#00F0FF] text-[#030a1c] font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-200 cursor-pointer active:scale-98"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Discuss &amp; Scaffold Project with AI Coach</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
