import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  BookOpen, 
  Cloud, 
  Terminal, 
  Award,
  ChevronRight,
  TrendingUp,
  Quote
} from 'lucide-react';
import type { CareerProgressData, LearningPlatform } from '../types';

interface CareerTransitionTrackerProps {
  careerData: CareerProgressData;
  activeTopicNames: string[];
}

export const CareerTransitionTracker: React.FC<CareerTransitionTrackerProps> = ({
  careerData,
  activeTopicNames
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const getPlatformIcon = (id: string) => {
    switch (id) {
      case 'ostad':
        return <Layers className="w-4 h-4 text-cyan-400" />;
      case 'codebasics':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'google-cloud':
        return <Cloud className="w-4 h-4 text-violet-400" />;
      case 'codealpha':
        return <Terminal className="w-4 h-4 text-pink-400" />;
      default:
        return <Compass className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <section id="career-transition-tracker" className="w-full space-y-4">
      {/* Visual Career Bridge Ribbon */}
      <div className="glass-panel-glow rounded-2xl p-4 sm:p-5 relative overflow-hidden">
        {/* Ambient background light flare */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-cyan-500/10 via-violet-600/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          
          {/* Transition Origin & Destination */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
            {/* Origin Node */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Origin</div>
                <div className="text-xs sm:text-sm font-bold text-slate-200 text-3d-silver">14+ Years in HR</div>
              </div>
            </div>

            {/* Glowing Connector Node */}
            <div className="flex items-center gap-1 text-cyan-400">
              <div className="w-6 sm:w-10 h-0.5 bg-gradient-to-r from-amber-500/60 via-cyan-400 to-emerald-400" />
              <ArrowRight className="w-4 h-4 animate-pulse text-cyan-300" />
            </div>

            {/* Destination Node */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-cyan-950/40 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,243,255,0.15)]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00f3ff] shadow-[0_0_10px_#00f3ff] animate-ping" />
              <div>
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">Target Milestone</div>
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 text-3d-cyan">
                  <span>AI/ML Engineer</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Current Stage Indicator */}
          <div className="flex items-center gap-3">
            <div className="text-left sm:text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Current Focus Track</div>
              <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 lg:justify-end text-3d-emerald">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>{careerData.currentStage}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Motivational Transition Insight Quote */}
        <div className="mt-4 pt-3.5 border-t border-cyan-500/15 flex items-start gap-2.5 text-xs text-slate-300">
          <Quote className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="text-violet-300 font-semibold text-3d-violet">AI Coach Transition Memo:</span>{' '}
            Your 14+ years of HR leadership give you unprecedented mastery in complex systems and decision topologies. In AI/ML engineering, high-level structural intuition is the exact catalyst that turns raw code into scalable production intelligence.
          </p>
        </div>
      </div>

      {/* Concurrent Learning Platforms Dashboard */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-slate-200 flex items-center gap-1.5 text-3d-silver">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Multi-Platform AI/ML Curriculum</span>
            </h2>
            <span className="text-[10px] font-mono text-cyan-400/80 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30">
              4 Active Tracks
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Concurrent Learning Matrix
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {careerData.learningPlatforms.map((platform) => {
            const isSelected = selectedPlatform === platform.id;
            return (
              <div
                key={platform.id}
                id={`platform-card-${platform.id}`}
                onClick={() => setSelectedPlatform(isSelected ? null : platform.id)}
                className={`glass-panel rounded-xl p-3.5 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/60 ${
                  isSelected 
                    ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.2)] bg-[#0c1830]' 
                    : 'border-slate-800/80 hover:bg-[#0c1830]/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-700/60">
                      {getPlatformIcon(platform.id)}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-white">
                        {platform.name}
                      </h3>
                      <div className="text-[10px] font-mono text-slate-400">
                        {platform.role}
                      </div>
                    </div>
                  </div>
                  
                  <span 
                    className="text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold"
                    style={{
                      backgroundColor: `${platform.badgeColor}15`,
                      color: platform.badgeColor,
                      border: `1px solid ${platform.badgeColor}40`
                    }}
                  >
                    {platform.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-3">
                  {platform.focus}
                </p>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Curriculum Mastery</span>
                    <span className="font-semibold" style={{ color: platform.badgeColor }}>
                      {platform.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${platform.progressPercentage}%`,
                        backgroundColor: platform.badgeColor,
                        boxShadow: `0 0 8px ${platform.badgeColor}`
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
