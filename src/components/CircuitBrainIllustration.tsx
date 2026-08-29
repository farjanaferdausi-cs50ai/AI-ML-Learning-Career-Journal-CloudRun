import React from 'react';

interface CircuitBrainProps {
  size?: 'sm' | 'md' | 'lg';
  showKeywords?: boolean;
  showPlatform?: boolean;
}

export const CircuitBrainIllustration: React.FC<CircuitBrainProps> = ({
  size = 'lg',
  showKeywords = true,
  showPlatform = true
}) => {
  const isSmall = size === 'sm';
  const isMedium = size === 'md';

  return (
    <div className={`relative flex items-center justify-center select-none ${
      isSmall 
        ? 'w-44 h-40' 
        : isMedium 
        ? 'w-64 h-56' 
        : 'w-[320px] sm:w-[380px] lg:w-[420px] h-[240px] sm:h-[260px]'
    }`}>
      
      {/* 1. Ambient Dynamic Cyan/Blue Neon Radial Glow behind image */}
      <div className="absolute inset-0 bg-radial-at-c from-[#00F0FF]/30 via-[#0072FF]/20 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />
      <div className="absolute w-3/4 h-3/4 bg-radial-at-c from-[#00F0FF]/20 via-[#6366f1]/15 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* 2. Outer Rotating Cyber Ring Animation (behind the static brain image) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full animate-[spin_24s_linear_infinite] opacity-60"
        >
          <defs>
            <linearGradient id="orbitRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0072FF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <circle
            cx="150"
            cy="150"
            r="125"
            stroke="url(#orbitRingGrad)"
            strokeWidth="1.2"
            strokeDasharray="6 8 18 8"
            fill="none"
          />
          <circle cx="150" cy="25" r="2.5" fill="#00F0FF" className="drop-shadow-[0_0_6px_#00F0FF]" />
          <circle cx="275" cy="150" r="2" fill="#ffffff" />
          <circle cx="150" cy="275" r="2.5" fill="#38bdf8" />
          <circle cx="25" cy="150" r="2" fill="#00F0FF" />
        </svg>
      </div>

      {/* 3. High-Resolution Static Brain Asset with Cyan/Blue Neon Ambient Drop Shadow & Glass Glow */}
      <div className={`relative z-10 flex items-center justify-center ${
        isSmall ? 'w-32 h-32' : isMedium ? 'w-48 h-48' : 'w-56 sm:w-64 h-56 sm:h-64'
      }`}>
        <picture className="w-full h-full flex items-center justify-center">
          <source srcSet="/cyber_brain.webp" type="image/webp" />
          <img
            src="/cyber_circuit_brain.jpg"
            alt="AI/ML Neural Circuit Brain"
            loading="eager"
            decoding="async"
            className="w-full h-full object-contain rounded-2xl filter drop-shadow-[0_0_24px_rgba(0,240,255,0.55)] drop-shadow-[0_0_40px_rgba(0,114,255,0.35)] transition-transform duration-300 hover:scale-[1.02]"
          />
        </picture>

        {/* Delicate Glass Rim / Cyber Border Outline Sheen */}
        <div className="absolute inset-0 rounded-2xl border border-cyan-400/20 pointer-events-none shadow-[inset_0_0_16px_rgba(0,240,255,0.15)]" />
      </div>

      {/* 4. Vertical Glowing Keywords on Right (LEARN, BUILD, SOLVE, CREATE, IMPACT) */}
      {showKeywords && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-20 text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-right select-none pr-1">
          <span className="text-[#00F0FF] drop-shadow-[0_0_8px_#00F0FF]">LEARN</span>
          <span className="text-cyan-300 drop-shadow-[0_0_6px_#38bdf8]">BUILD</span>
          <span className="text-blue-400 drop-shadow-[0_0_6px_#60a5fa]">SOLVE</span>
          <span className="text-indigo-300 drop-shadow-[0_0_6px_#818cf8]">CREATE</span>
          <span className="text-purple-400 drop-shadow-[0_0_8px_#c084fc]">IMPACT</span>
        </div>
      )}

      {/* 5. Floating Glass Card: "Next Gen Skills for a Smarter World" */}
      {showKeywords && (
        <div className="absolute bottom-1 right-0 z-20 px-2.5 py-1.5 rounded-lg bg-[#070e24]/90 border border-cyan-400/40 text-[9px] font-mono text-cyan-200 shadow-[0_0_16px_rgba(0,240,255,0.25)] backdrop-blur-md hidden sm:block text-left leading-tight">
          <div className="text-slate-300">Next Gen</div>
          <div className="text-[#00F0FF] font-bold">Skills for a</div>
          <div className="text-purple-300">Smarter World</div>
        </div>
      )}

    </div>
  );
};
