import React from 'react';

/**
 * AppMarbleBackground component
 * Creates a vivid, highly saturated, glossy deep purple liquid-marble swirl texture
 * with electric violet/magenta streams and glossy reflective highlights matching the reference image.
 */
export const AppMarbleBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Base Rich Ultraviolet & Royal Purple Liquid Canvas */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #16002c 0%, #290050 20%, #440082 45%, #6300b8 65%, #340063 85%, #180030 100%)'
        }}
      />

      {/* 2. Saturated Marbled Swirl SVG Vector Art */}
      <svg 
        className="absolute inset-0 w-full h-full object-cover" 
        viewBox="0 0 1920 1080" 
        preserveAspectRatio="none"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Saturated Deep Royal Violet Stream */}
          <linearGradient id="marbleRoyalViolet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f008f" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#7b00db" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#9a10f0" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#2a004d" stopOpacity="1" />
          </linearGradient>

          {/* Electric Neon Magenta-Violet Stream */}
          <linearGradient id="marbleNeonElectric" x1="5%" y1="0%" x2="95%" y2="100%">
            <stop offset="0%" stopColor="#8000ff" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#b026ff" stopOpacity="1" />
            <stop offset="50%" stopColor="#d938ff" stopOpacity="0.95" />
            <stop offset="75%" stopColor="#ff4df5" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#6700c7" stopOpacity="0.95" />
          </linearGradient>

          {/* High-Chroma Magenta Swirl Ribbon */}
          <linearGradient id="marbleMagentaRibbon" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#310059" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#9300e8" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#cf24fc" stopOpacity="1" />
            <stop offset="85%" stopColor="#6e00ba" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#22003d" stopOpacity="1" />
          </linearGradient>

          {/* Glossy White/Pink Specular Filament Reflection */}
          <linearGradient id="marbleGlossSpecular" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="20%" stopColor="#ffe6fd" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#f778ff" stopOpacity="0.8" />
            <stop offset="75%" stopColor="#c738ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>

          {/* Pure Specular Core Streak */}
          <linearGradient id="marblePureCoreStreak" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="30%" stopColor="#ffa6fd" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#df4eff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7a00d1" stopOpacity="0.1" />
          </linearGradient>

          {/* Neon Bloom Glow Filter for glossy reflections */}
          <filter id="marbleGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Deep Fluid Shadow Filter */}
          <filter id="marbleFluidShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="16" />
            <feOffset dx="-6" dy="12" result="offsetblur" />
            <feFlood floodColor="#0d001c" floodOpacity="0.8" />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- Background Fluid Mass 1 (Upper Left Swirling Mantle) --- */}
        <path 
          d="M -120 -80 
             C 320 40, 520 280, 380 560 
             C 240 760, 60 840, -120 920 Z" 
          fill="url(#marbleRoyalViolet)"
          filter="url(#marbleFluidShadow)"
        />

        {/* --- Vivid Flowing Swirl Ribbon (Top Center to Right Flank) --- */}
        <path 
          d="M 180 -120 
             C 680 100, 880 420, 800 780 
             C 740 1060, 540 1180, 280 1240 
             L 940 1240 
             C 1220 1060, 1340 680, 1240 340 
             C 1140 80, 880 -70, 620 -120 Z" 
          fill="url(#marbleMagentaRibbon)"
        />

        {/* --- Main S-Curve Neon Tongue (Center Stage Electric Stream) --- */}
        <path 
          d="M 680 -120 
             C 1020 160, 1180 460, 1080 840 
             C 1000 1080, 850 1160, 680 1240 
             L 1200 1240 
             C 1440 1040, 1540 660, 1440 280 
             C 1360 40, 1120 -80, 960 -120 Z" 
          fill="url(#marbleNeonElectric)"
          filter="url(#marbleFluidShadow)"
        />

        {/* --- Secondary Electric Waves (Right Horizon) --- */}
        <path 
          d="M 1280 -120 
             C 1580 200, 1780 540, 1680 920 
             C 1600 1120, 1480 1180, 1380 1240 
             L 2100 1240 
             L 2100 -120 Z" 
          fill="url(#marbleRoyalViolet)"
        />

        {/* --- Concentric Marbled Ripples (Bottom-Left Swirl Whirpool) --- */}
        {/* Outer Vibrant Ring */}
        <path 
          d="M -60 620 
             C 150 580, 290 680, 310 840 
             C 330 1000, 180 1150, -60 1180 Z" 
          fill="none" 
          stroke="url(#marbleNeonElectric)" 
          strokeWidth="46" 
          strokeLinecap="round"
        />

        {/* Middle Glossy Ring */}
        <path 
          d="M -60 720 
             C 90 690, 200 760, 210 880 
             C 220 1010, 110 1100, -60 1120 Z" 
          fill="none" 
          stroke="url(#marbleMagentaRibbon)" 
          strokeWidth="24" 
          strokeLinecap="round"
        />

        {/* Inner Specular Crest */}
        <path 
          d="M -60 740 
             C 80 720, 180 780, 190 890 
             C 200 990, 100 1070, -60 1090 Z" 
          fill="none" 
          stroke="url(#marbleGlossSpecular)" 
          strokeWidth="8" 
          strokeLinecap="round"
          filter="url(#marbleGlowFilter)"
        />

        {/* Center Whirlpool Core Ripple */}
        <path 
          d="M -60 830 
             C 20 810, 90 850, 100 920 
             C 110 990, 50 1040, -60 1060 Z" 
          fill="none" 
          stroke="url(#marblePureCoreStreak)" 
          strokeWidth="6" 
          strokeLinecap="round"
        />

        {/* --- High-Gloss Liquid Metal Specular Highlights & Reflection Filaments --- */}
        {/* Specular Ridge 1: Bold Center Left Reflection */}
        <path 
          d="M 360 -60 
             C 740 160, 900 480, 810 840 
             C 740 1090, 570 1170, 410 1240" 
          stroke="url(#marbleGlossSpecular)" 
          strokeWidth="6" 
          strokeLinecap="round"
          fill="none"
          filter="url(#marbleGlowFilter)"
        />
        {/* Pure White Core on Ridge 1 */}
        <path 
          d="M 360 -60 
             C 740 160, 900 480, 810 840 
             C 740 1090, 570 1170, 410 1240" 
          stroke="#ffffff" 
          strokeWidth="2" 
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />

        {/* Specular Ridge 2: Sharp S-Curve Reflection */}
        <path 
          d="M 540 -60 
             C 880 150, 1040 440, 970 780 
             C 910 1040, 770 1150, 630 1240" 
          stroke="url(#marbleGlossSpecular)" 
          strokeWidth="5" 
          strokeLinecap="round"
          fill="none"
          filter="url(#marbleGlowFilter)"
        />
        <path 
          d="M 540 -60 
             C 880 150, 1040 440, 970 780 
             C 910 1040, 770 1150, 630 1240" 
          stroke="#ffffff" 
          strokeWidth="1.75" 
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />

        {/* Specular Ridge 3: Electric Magenta Gloss Streak */}
        <path 
          d="M 840 -60 
             C 1120 180, 1280 520, 1190 860 
             C 1120 1070, 990 1170, 860 1240" 
          stroke="url(#marblePureCoreStreak)" 
          strokeWidth="7" 
          strokeLinecap="round"
          fill="none"
          filter="url(#marbleGlowFilter)"
        />
        <path 
          d="M 840 -60 
             C 1120 180, 1280 520, 1190 860 
             C 1120 1070, 990 1170, 860 1240" 
          stroke="#ffffff" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />

        {/* Specular Ridge 4: Upper-Left Swirl Gloss Crest */}
        <path 
          d="M 60 -60 
             C 340 70, 480 270, 390 490 
             C 300 660, 150 740, 0 800" 
          stroke="url(#marbleGlossSpecular)" 
          strokeWidth="4" 
          strokeLinecap="round"
          fill="none"
          filter="url(#marbleGlowFilter)"
        />

        {/* Specular Ridge 5: Right Flow Gloss Crest */}
        <path 
          d="M 1160 -60 
             C 1420 160, 1600 500, 1500 840 
             C 1420 1060, 1290 1160, 1170 1240" 
          stroke="url(#marbleGlossSpecular)" 
          strokeWidth="5" 
          strokeLinecap="round"
          fill="none"
          filter="url(#marbleGlowFilter)"
        />
        <path 
          d="M 1160 -60 
             C 1420 160, 1600 500, 1500 840 
             C 1420 1060, 1290 1160, 1170 1240" 
          stroke="#ffffff" 
          strokeWidth="1.5" 
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Specular Ridge 6: Far Right Deep Specular Ribbon */}
        <path 
          d="M 1520 -60 
             C 1780 200, 1940 560, 1850 900 
             C 1780 1080, 1650 1160, 1530 1240" 
          stroke="url(#marblePureCoreStreak)" 
          strokeWidth="4.5" 
          strokeLinecap="round"
          fill="none"
        />

        {/* High-Gloss Liquid Specular Nodes & Droplets */}
        <ellipse cx="660" cy="270" rx="22" ry="14" transform="rotate(-25 660 270)" fill="url(#marbleGlossSpecular)" filter="url(#marbleGlowFilter)" />
        <ellipse cx="660" cy="270" rx="10" ry="5" transform="rotate(-25 660 270)" fill="#ffffff" opacity="0.9" />

        <ellipse cx="1160" cy="360" rx="24" ry="15" transform="rotate(35 1160 360)" fill="url(#marbleGlossSpecular)" filter="url(#marbleGlowFilter)" />
        <ellipse cx="1160" cy="360" rx="11" ry="6" transform="rotate(35 1160 360)" fill="#ffffff" opacity="0.9" />

        <ellipse cx="420" cy="710" rx="20" ry="12" transform="rotate(-40 420 710)" fill="url(#marbleGlossSpecular)" filter="url(#marbleGlowFilter)" />
        <ellipse cx="420" cy="710" rx="8" ry="4" transform="rotate(-40 420 710)" fill="#ffffff" opacity="0.85" />
      </svg>

      {/* 3. Intense Electric Magenta & Ultraviolet Radial Blooms */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 18% 18%, rgba(176, 38, 255, 0.4) 0%, rgba(176, 38, 255, 0) 50%),
            radial-gradient(circle at 82% 28%, rgba(217, 56, 255, 0.35) 0%, rgba(217, 56, 255, 0) 50%),
            radial-gradient(circle at 48% 75%, rgba(255, 77, 245, 0.3) 0%, rgba(255, 77, 245, 0) 55%),
            radial-gradient(circle at 12% 88%, rgba(199, 56, 255, 0.35) 0%, rgba(199, 56, 255, 0) 45%)
          `,
          mixBlendMode: 'screen'
        }}
      />
    </div>
  );
};

