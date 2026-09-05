import React from 'react';

const HolographicBackgroundComponent: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden select-none rounded-2xl ${className}`}
      aria-hidden="true"
    >
      {/* 1. Base Tone: Deep Blue to Teal-Cyan Multi-stop Gradient (Matching Reference Image) */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160deg, #020c1b 0%, #051a30 25%, #072a47 50%, #052038 75%, #020f20 100%)'
        }}
      />

      {/* 2. Inner Radial Depth Glows */}
      <div 
        className="absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(ellipse at 50% 30%, rgba(0, 243, 255, 0.22) 0%, rgba(0, 162, 255, 0.10) 45%, transparent 70%),
            radial-gradient(circle at 10% 20%, rgba(0, 210, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(0, 243, 255, 0.18) 0%, transparent 55%)
          `
        }}
      />

      {/* 3. Subtle Cybernetic Dot Grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(rgba(0, 243, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* 4. Glassmorphism Card Reflection Frame (Upper-Left Diagonal Sheen & Prismatic Edges) */}
      <div className="absolute inset-0 rounded-2xl border border-cyan-400/40 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),inset_0_0_20px_rgba(0,243,255,0.1)]">
        
        {/* Upper-Left Glossy Diagonal Reflection Sheen */}
        <div 
          className="absolute top-0 left-0 w-2/3 h-1/2 rounded-tl-2xl bg-gradient-to-br from-white/[0.14] via-cyan-300/[0.04] to-transparent pointer-events-none"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 0 100%)'
          }}
        />

        {/* Holographic Edge Light Strips */}
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />
        <div className="absolute bottom-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        <div className="absolute left-0 inset-y-8 w-[1px] bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent" />
        <div className="absolute right-0 inset-y-8 w-[1px] bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent" />

        {/* Prismatic Corner Glow Refractions */}
        <div className="absolute bottom-1 left-1 w-20 h-20 bg-gradient-to-tr from-cyan-400/25 via-teal-400/10 to-transparent rounded-bl-2xl filter blur-sm" />
        <div className="absolute top-1 right-1 w-20 h-20 bg-gradient-to-bl from-cyan-400/25 via-blue-400/10 to-transparent rounded-tr-2xl filter blur-sm" />
      </div>

      {/* 5. Glowing Circuit-Line Pattern (Radiating from the center where the Orbit Sphere sits) */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-45" 
        viewBox="0 0 1200 800" 
        preserveAspectRatio="xMidYMid slice"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glowing Cyan Trace Gradient */}
          <linearGradient id="panelCircuitCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f3ff" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#00c8ff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.15" />
          </linearGradient>

          {/* Soft Node Glow Filter */}
          <filter id="panelCircuitNodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Central Complex Branching Circuit Traces */}
        <g stroke="url(#panelCircuitCyanGrad)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          {/* North-bound Branching Traces */}
          <path d="M 600 300 L 600 220 L 570 190 L 570 140 L 550 120" />
          <path d="M 600 260 L 630 230 L 630 170 L 660 140 L 660 90" />
          <path d="M 585 240 L 540 240 L 510 210 L 510 150" />
          <path d="M 615 240 L 660 240 L 690 210 L 690 160" />

          {/* East-bound Branching Traces */}
          <path d="M 680 350 L 760 350 L 790 320 L 860 320 L 890 350 L 960 350" />
          <path d="M 680 370 L 740 370 L 770 400 L 850 400 L 880 380 L 950 380" />
          <path d="M 660 330 L 720 290 L 800 290 L 830 260 L 910 260" />
          <path d="M 660 390 L 730 430 L 810 430 L 840 470 L 930 470" />

          {/* South-bound Branching Traces */}
          <path d="M 600 420 L 600 500 L 630 530 L 630 600 L 650 620" />
          <path d="M 600 460 L 570 490 L 570 560 L 540 590 L 540 640" />
          <path d="M 585 480 L 530 480 L 500 520 L 500 580" />
          <path d="M 615 480 L 670 480 L 700 520 L 700 570" />

          {/* West-bound Branching Traces */}
          <path d="M 520 350 L 440 350 L 410 320 L 340 320 L 310 350 L 240 350" />
          <path d="M 520 370 L 460 370 L 430 400 L 350 400 L 320 380 L 250 380" />
          <path d="M 540 330 L 480 290 L 400 290 L 370 260 L 290 260" />
          <path d="M 540 390 L 470 430 L 390 430 L 360 470 L 270 470" />

          {/* Diagonal Feeder Lines */}
          <path d="M 660 310 L 720 250 L 810 250 L 860 200 L 940 200" />
          <path d="M 540 310 L 480 250 L 390 250 L 340 200 L 260 200" />
          <path d="M 660 410 L 720 470 L 800 470 L 850 530 L 930 530" />
          <path d="M 540 410 L 480 470 L 400 470 L 350 530 L 270 530" />
        </g>

        {/* Synaptic Circuit Nodes (Glow Dots at trace endpoints & junctions) */}
        <g fill="#00f3ff" filter="url(#panelCircuitNodeGlow)">
          {/* North Nodes */}
          <circle cx="550" cy="120" r="4.5" />
          <circle cx="660" cy="90" r="5" />
          <circle cx="510" cy="150" r="4" />
          <circle cx="690" cy="160" r="4" />
          <circle cx="570" cy="140" r="3.5" />
          <circle cx="630" cy="170" r="3.5" />

          {/* East Nodes */}
          <circle cx="960" cy="350" r="5.5" />
          <circle cx="950" cy="380" r="4.5" />
          <circle cx="910" cy="260" r="5" />
          <circle cx="930" cy="470" r="4.5" />
          <circle cx="940" cy="200" r="4.5" />
          <circle cx="930" cy="530" r="4.5" />

          {/* South Nodes */}
          <circle cx="650" cy="620" r="5" />
          <circle cx="540" cy="640" r="5" />
          <circle cx="500" cy="580" r="4" />
          <circle cx="700" cy="570" r="4" />

          {/* West Nodes */}
          <circle cx="240" cy="350" r="5.5" />
          <circle cx="250" cy="380" r="4.5" />
          <circle cx="290" cy="260" r="5" />
          <circle cx="270" cy="470" r="4.5" />
          <circle cx="260" cy="200" r="4.5" />
          <circle cx="270" cy="530" r="4.5" />
        </g>

        {/* Bright Glowing White Core in Nodes for High Metallic Glass Feel */}
        <g fill="#ffffff" opacity="0.95">
          <circle cx="550" cy="120" r="1.8" />
          <circle cx="660" cy="90" r="2" />
          <circle cx="960" cy="350" r="2.2" />
          <circle cx="910" cy="260" r="2" />
          <circle cx="650" cy="620" r="2" />
          <circle cx="540" cy="640" r="2" />
          <circle cx="240" cy="350" r="2.2" />
          <circle cx="290" cy="260" r="2" />
        </g>
      </svg>

      {/* 6. Subtle Sparkle / Star Accent Icons in Corners (Matching Reference Image) */}
      {/* Bottom Right Sparkle Star Duo */}
      <div className="absolute bottom-5 right-5 sm:bottom-7 sm:right-7 flex items-end gap-2 pointer-events-none">
        {/* Primary 4-Point Holographic Sparkle Star */}
        <svg 
          className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-200 opacity-80 animate-pulse" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          style={{ filter: 'drop-shadow(0 0 10px rgba(0,243,255,0.8))' }}
        >
          <path d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z" />
        </svg>
        
        {/* Secondary Smaller Companion Sparkle Star */}
        <svg 
          className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300 opacity-65 animate-pulse" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          style={{ 
            animationDelay: '1.2s',
            filter: 'drop-shadow(0 0 8px rgba(0,243,255,0.7))' 
          }}
        >
          <path d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z" />
        </svg>
      </div>

      {/* Top Left Sparkle Accent */}
      <div className="absolute top-14 left-6 pointer-events-none">
        <svg 
          className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-200 opacity-55 animate-pulse" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          style={{ 
            animationDelay: '0.8s',
            filter: 'drop-shadow(0 0 8px rgba(0,243,255,0.6))' 
          }}
        >
          <path d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z" />
        </svg>
      </div>

      {/* Top Right Sparkle Accent */}
      <div className="absolute top-16 right-8 pointer-events-none">
        <svg 
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 opacity-50 animate-pulse" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          style={{ 
            animationDelay: '1.8s',
            filter: 'drop-shadow(0 0 6px rgba(0,243,255,0.5))' 
          }}
        >
          <path d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z" />
        </svg>
      </div>

    </div>
  );
};

export const HolographicBackground = React.memo(HolographicBackgroundComponent);
