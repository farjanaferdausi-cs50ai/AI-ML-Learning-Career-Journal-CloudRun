import React from 'react';

/**
 * WaveBackground component for the AI Coach panel.
 * Recreates the smooth flowing indigo/blue 3D fluid wave gradient from the reference image.
 * Color range: Deep indigo/blue (#1e24c9, #2b2ff0) to vibrant periwinkle/cobalt (#5b62fa, #7a82fb).
 */
export const WaveBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden select-none rounded-3xl ${className}`}
      aria-hidden="true"
    >
      {/* 1. Base Tone: Rich Indigo to Vibrant Blue Gradient matching reference */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #2b2ff0 0%, #3d42f8 35%, #4e54fa 70%, #686efc 100%)'
        }}
      />

      {/* 2. Soft Ambient Radial Horizon Glows (Illuminating center and top-right periwinkle highlights) */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 45%, rgba(107, 111, 251, 0.45) 0%, rgba(59, 66, 246, 0.25) 50%, transparent 80%),
            radial-gradient(circle at 85% 15%, rgba(135, 140, 255, 0.4) 0%, transparent 60%),
            radial-gradient(circle at 10% 85%, rgba(30, 36, 201, 0.6) 0%, transparent 65%)
          `
        }}
      />

      {/* 3. Layered 3D Organic Waves (SVG Curves with subtle soft drop shadows & layered transparency) */}
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 1440 900" 
        preserveAspectRatio="none"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Top-Right Soft Wave Gradient 1 */}
          <linearGradient id="topWaveGrad1" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7e85fc" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#4f56f8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2b2ff0" stopOpacity="0.05" />
          </linearGradient>

          {/* Top-Right Upper Fluid Wave Gradient 2 */}
          <linearGradient id="topWaveGrad2" x1="100%" y1="0%" x2="30%" y2="80%">
            <stop offset="0%" stopColor="#8f95fd" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#5b62fa" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#3035f2" stopOpacity="0.0" />
          </linearGradient>

          {/* Top Center Flowing Wave */}
          <linearGradient id="topCenterWaveGrad" x1="45%" y1="0%" x2="55%" y2="100%">
            <stop offset="0%" stopColor="#757dfc" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3035f2" stopOpacity="0.05" />
          </linearGradient>

          {/* Bottom-Left Wave Gradient 1 */}
          <linearGradient id="bottomWaveGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e24c9" stopOpacity="0.65" />
            <stop offset="45%" stopColor="#383ef6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6067fa" stopOpacity="0.0" />
          </linearGradient>

          {/* Bottom Center Crest Wave Gradient 2 */}
          <linearGradient id="bottomWaveGrad2" x1="20%" y1="100%" x2="70%" y2="30%">
            <stop offset="0%" stopColor="#252be8" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#4950f8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7b82fc" stopOpacity="0.0" />
          </linearGradient>

          {/* Soft 3D Shadow for Wave Layer 1 */}
          <filter id="softWaveShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="16" />
            <feOffset dx="0" dy="12" result="offsetblur" />
            <feFlood floodColor="#12168a" floodOpacity="0.35" />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Top Wave Shadow Filter */}
          <filter id="topWaveShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="14" />
            <feOffset dx="-8" dy="14" result="offsetblur" />
            <feFlood floodColor="#181d9e" floodOpacity="0.3" />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gentle Highlights on Wave Crests */}
          <linearGradient id="waveHighlightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="40%" stopColor="#a4a9fe" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Top-Right Deep Wave Layer 1 */}
        <path 
          d="M 1440 0 L 780 0 C 810 90, 830 140, 890 160 C 970 185, 1040 130, 1140 140 C 1240 150, 1310 250, 1340 340 C 1370 420, 1420 480, 1440 500 Z" 
          fill="url(#topWaveGrad1)"
          filter="url(#topWaveShadow)"
        />

        {/* Top-Right Secondary Overlay Wave Layer 2 */}
        <path 
          d="M 1440 0 L 920 0 C 940 70, 990 120, 1080 120 C 1190 120, 1260 210, 1310 290 C 1360 370, 1400 420, 1440 450 Z" 
          fill="url(#topWaveGrad2)"
        />

        {/* Top Center Flowing Tongue Wave (matching reference image top dips) */}
        <path 
          d="M 600 0 L 820 0 C 800 100, 770 160, 720 170 C 670 180, 640 130, 620 90 C 605 60, 600 20, 600 0 Z" 
          fill="url(#topCenterWaveGrad)"
          filter="url(#softWaveShadow)"
        />

        {/* Bottom-Left Primary Fluid Wave */}
        <path 
          d="M 0 900 L 0 460 C 40 490, 90 560, 110 650 C 130 730, 200 780, 310 790 C 440 800, 520 730, 600 740 C 680 750, 730 830, 770 900 Z" 
          fill="url(#bottomWaveGrad1)"
          filter="url(#softWaveShadow)"
        />

        {/* Bottom Center Secondary Flowing Wave */}
        <path 
          d="M 0 900 L 0 620 C 60 640, 150 710, 260 740 C 370 770, 480 730, 560 760 C 630 790, 680 870, 710 900 Z" 
          fill="url(#bottomWaveGrad2)"
        />

        {/* Bottom Right Crest Wave Dip */}
        <path 
          d="M 520 900 C 560 840, 640 780, 750 800 C 860 820, 930 890, 970 900 Z" 
          fill="url(#bottomWaveGrad1)"
          opacity="0.6"
        />

        {/* Soft Organic Crest Highlight Lines for 3D Silk/Fluid depth */}
        <path 
          d="M 800 5 C 830 90, 860 145, 920 160 C 1000 185, 1070 135, 1160 145 C 1260 155, 1320 250, 1350 340 C 1380 420, 1420 480, 1440 495" 
          stroke="url(#waveHighlightGrad)" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          opacity="0.5"
        />

        <path 
          d="M 10 465 C 50 495, 100 565, 120 655 C 140 735, 210 785, 320 795 C 450 805, 530 735, 610 745 C 690 755, 740 835, 780 900" 
          stroke="url(#waveHighlightGrad)" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          opacity="0.45"
        />
      </svg>

      {/* 4. Subtle Outer Card Rim Refraction (Clean Glass Border & Inner Glow) */}
      <div className="absolute inset-0 rounded-3xl border border-indigo-300/35 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_0_24px_rgba(107,111,251,0.15)]" />
    </div>
  );
};
