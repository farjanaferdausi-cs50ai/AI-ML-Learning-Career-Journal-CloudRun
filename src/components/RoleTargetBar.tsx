import React from 'react';
import { Star, Rocket, ArrowRight, BarChart2 } from 'lucide-react';

interface RoleTargetBarProps {
  currentRole?: string;
  targetRole?: string;
  missionTagline?: string;
}

export const RoleTargetBar: React.FC<RoleTargetBarProps> = ({
  currentRole = 'AI/ML Learner',
  targetRole = 'AI/ML Engineer',
  missionTagline = 'Skills Today, Opportunities Tomorrow'
}) => {
  return (
    <section 
      id="role-target-bar"
      className="w-full rounded-xl bg-gradient-to-r from-[#060c1d] via-[#09122a] to-[#0c183a] border border-[#142347] px-4 sm:px-6 py-3 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs select-none"
    >
      {/* Left & Middle: Role Transition Ribbon */}
      <div className="flex items-center gap-3 sm:gap-5 flex-wrap sm:flex-nowrap">
        
        {/* Your Role */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-950/70 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.3)]">
            <Star className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
          </div>
          <div>
            <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
              YOUR ROLE
            </div>
            <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
              {currentRole}
            </div>
          </div>
        </div>

        {/* Transition Arrow */}
        <div className="flex items-center text-purple-400 px-1">
          <ArrowRight className="w-4 h-4 text-purple-400 animate-pulse" />
        </div>

        {/* Target Position */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/70 border border-cyan-400/40 flex items-center justify-center text-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.3)]">
            <Rocket className="w-3.5 h-3.5 text-[#00F0FF]" />
          </div>
          <div>
            <div className="text-[9px] font-mono text-[#00F0FF] uppercase tracking-wider">
              TARGET POSITION
            </div>
            <div className="text-xs sm:text-sm font-bold text-cyan-200 tracking-wide">
              {targetRole}
            </div>
          </div>
        </div>

        {/* Study Track Day Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#081538] border border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
          <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-ping" />
          <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase">
            STUDY TRACK: DAY 2 (TODAY)
          </span>
        </div>

      </div>

      {/* Right Side: Mission Level Up */}
      <div className="flex items-center gap-3 border-t sm:border-t-0 border-[#142347] pt-2 sm:pt-0">
        <div className="text-left sm:text-right">
          <div className="text-xs font-bold text-cyan-300 tracking-wide font-mono uppercase">
            MISSION: LEVEL UP!
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            {missionTagline}
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-[#07132b] border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
          <BarChart2 className="w-4 h-4 text-[#00F0FF]" />
        </div>
      </div>

    </section>
  );
};

