import React from 'react';
import { DynamicAIBrain } from './DynamicAIBrain';

interface CircuitBrainProps {
  size?: 'sm' | 'md' | 'lg';
  showKeywords?: boolean;
  showPlatform?: boolean;
  isThinking?: boolean;
}

const CircuitBrainIllustrationComponent: React.FC<CircuitBrainProps> = ({
  size = 'lg',
  showKeywords = true,
  showPlatform = true,
  isThinking = false
}) => {
  const isSmall = size === 'sm';
  const isMedium = size === 'md';

  return (
    <div 
      className={`relative flex items-center justify-center select-none ${
        isSmall 
          ? 'w-36 h-36 sm:w-44 sm:h-44' 
          : isMedium 
          ? 'w-64 h-64' 
          : 'w-[300px] sm:w-[380px] lg:w-[430px] h-[260px] sm:h-[300px]'
      }`}
    >
      {/* 1. Volumetric Ambient Glow & Background Bloom (Electric Cyan & Neon Blue) */}
      <div 
        className="absolute inset-0 bg-radial-at-c from-[#00F0FF]/25 via-[#0072FF]/15 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow" 
        style={{ transform: 'scale(1.15)' }}
      />
      <div 
        className="absolute w-3/4 h-3/4 bg-radial-at-c from-[#00F0FF]/20 via-[#8b5cf6]/10 to-transparent rounded-full blur-2xl pointer-events-none" 
      />

      {/* 2. Hexagonal / Isometric Pedestal Base */}
      {showPlatform && (
        <div className="absolute bottom-0 inset-x-0 flex justify-center items-end pointer-events-none z-0">
          <svg
            viewBox="0 0 400 100"
            className="w-4/5 h-16 overflow-visible opacity-90"
            style={{ filter: 'drop-shadow(0 0 16px rgba(0, 240, 255, 0.4))' }}
          >
            <defs>
              <linearGradient id="pedestalBaseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0" />
                <stop offset="25%" stopColor="#00F0FF" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.95" />
                <stop offset="75%" stopColor="#0072FF" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="pedestalSurfaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#081432" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#030814" stopOpacity="0.98" />
              </linearGradient>
            </defs>

            {/* Floor Ambient Reflection Ellipse */}
            <ellipse cx="200" cy="55" rx="140" ry="24" fill="#00F0FF" opacity="0.15" />
            <ellipse cx="200" cy="55" rx="90" ry="16" fill="#0072FF" opacity="0.22" />

            {/* Hexagonal Isometric Base Platform */}
            <polygon
              points="200,20 340,55 200,88 60,55"
              fill="url(#pedestalSurfaceGrad)"
              stroke="url(#pedestalBaseGrad)"
              strokeWidth="1.6"
            />

            {/* Concentric Step Tracks on Pedestal */}
            <polygon
              points="200,30 310,55 200,78 90,55"
              fill="none"
              stroke="#00F0FF"
              strokeWidth="1.0"
              strokeDasharray="4 3"
              opacity="0.75"
            />

            {/* Glowing Solder Micro-Vias */}
            <circle cx="200" cy="55" r="2.8" fill="#FFFFFF" />
            <circle cx="165" cy="52" r="2.0" fill="#00F0FF" />
            <circle cx="235" cy="52" r="2.0" fill="#00F0FF" />
            <circle cx="130" cy="58" r="1.8" fill="#38bdf8" />
            <circle cx="270" cy="58" r="1.8" fill="#38bdf8" />
          </svg>
        </div>
      )}

      {/* 3. Transparent, Dynamic Animated Vector SVG AI Brain Centerpiece */}
      <div className="relative z-10 flex items-center justify-center">
        <DynamicAIBrain 
          size={isSmall ? 'sm' : isMedium ? 'md' : 'lg'} 
          isThinking={isThinking}
          showEnergyWaves={true}
          showOrbits={true}
          showParticles={true}
        />
      </div>

      {/* 4. Vertical Glowing Action Keywords (Right Side for Hero Banner) */}
      {showKeywords && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-20 text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-right select-none pr-1">
          <span className="text-[#00F0FF] drop-shadow-[0_0_8px_#00F0FF]">LEARN</span>
          <span className="text-cyan-300 drop-shadow-[0_0_8px_#38bdf8]">BUILD</span>
          <span className="text-[#0072FF] drop-shadow-[0_0_8px_#0072FF]">SOLVE</span>
          <span className="text-cyan-200 drop-shadow-[0_0_6px_#38bdf8]">CREATE</span>
          <span className="text-blue-400 drop-shadow-[0_0_6px_#60a5fa]">IMPACT</span>
        </div>
      )}

      {/* 5. Floating Glass Badge: "Next Gen Skills for a Smarter World" */}
      {showKeywords && (
        <div className="absolute bottom-1 right-0 z-20 px-2.5 py-1.5 rounded-lg bg-[#070e24]/90 border border-cyan-400/40 text-[9px] font-mono text-cyan-200 shadow-[0_0_16px_rgba(0,240,255,0.25)] backdrop-blur-md hidden sm:block text-left leading-tight">
          <div className="text-slate-400">Next Gen</div>
          <div className="text-[#00F0FF] font-bold drop-shadow-[0_0_4px_rgba(0,240,255,0.5)]">Skills for a</div>
          <div className="text-cyan-300">Smarter World</div>
        </div>
      )}
    </div>
  );
};

export const CircuitBrainIllustration = React.memo(CircuitBrainIllustrationComponent);

