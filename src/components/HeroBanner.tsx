import React from 'react';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { CircuitBrainIllustration } from './CircuitBrainIllustration';

interface HeroBannerProps {
  onContinueLearning?: () => void;
  onWatchOverview?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onContinueLearning,
  onWatchOverview
}) => {
  const handleScrollToCoach = () => {
    if (onContinueLearning) {
      onContinueLearning();
    } else {
      const coach = document.querySelector('#ai-coach-section');
      coach?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="hero-banner"
      className="w-full rounded-2xl bg-gradient-to-r from-[#131826] via-[#161D2F] to-[#1A2238] border border-[#1E293B] p-6 sm:p-7 relative overflow-hidden shadow-2xl"
    >
      {/* Background ambient lighting matching Image #2 */}
      <div className="absolute top-0 right-1/4 w-96 h-64 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-64 bg-[#6366f1]/12 rounded-full blur-3xl pointer-events-none" />

      {/* Top Right: AI Coach Online Pill matching Image #2 */}
      <div className="absolute top-4 sm:top-5 right-4 sm:right-6 flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E1424]/90 border border-cyan-400/40 text-[10px] font-mono font-bold tracking-wider text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.25)] backdrop-blur-md z-20">
        <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_#10b981]" />
        <span>AI COACH • ONLINE</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        
        {/* Left Text Content */}
        <div className="max-w-xl space-y-3">
          
          {/* Eyebrow */}
          <div className="text-[11px] sm:text-xs font-mono font-semibold tracking-wider text-[#00F0FF] uppercase flex items-center gap-1.5">
            <span>BUILD SKILLS TODAY. SHAPE TOMORROW.</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-white tracking-tight leading-tight">
            AI/ML Learning &amp; <br className="hidden sm:inline" />Career Journal
          </h1>

          {/* Sub-Navigation Line */}
          <div className="text-xs sm:text-sm font-medium text-cyan-300 flex items-center gap-2">
            <span>Learning</span>
            <span className="text-slate-500">•</span>
            <span>Practice</span>
            <span className="text-slate-500">•</span>
            <span>Build</span>
            <span className="text-slate-500">•</span>
            <span>Career</span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed max-w-lg">
            Your intelligent companion for structured learning, real-world projects, and a successful AI/ML career.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2 flex-wrap sm:flex-nowrap">
            <button
              id="continue-learning-hero-btn"
              onClick={handleScrollToCoach}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] via-[#3b82f6] to-[#00F0FF] hover:from-[#4f46e5] hover:to-[#38bdf8] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all cursor-pointer hover:scale-[1.02]"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="watch-overview-hero-btn"
              onClick={() => {
                if (onWatchOverview) {
                  onWatchOverview();
                } else {
                  const el = document.querySelector('#curriculum-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-[#1A1F2E] hover:bg-[#252D3F] border border-[#1E293B] text-[#CBD5E1] hover:text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-cyan-300 fill-cyan-300" />
              <span>Watch Overview</span>
            </button>
          </div>

        </div>

        {/* Right Illustration Container */}
        <div className="flex justify-center lg:justify-end shrink-0 pt-2 lg:pt-0">
          <CircuitBrainIllustration size="lg" showKeywords={true} showPlatform={true} />
        </div>

      </div>

    </section>
  );
};

