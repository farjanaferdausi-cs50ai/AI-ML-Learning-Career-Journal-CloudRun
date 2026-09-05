import React, { useState } from 'react';
import brainOrbImg from '../assets/images/ai_brain_orb.webp';

export interface DynamicAIBrainProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isThinking?: boolean;
  className?: string;
  showEnergyWaves?: boolean;
  showOrbits?: boolean;
  showParticles?: boolean;
  statusText?: string;
}

const DynamicAIBrainComponent: React.FC<DynamicAIBrainProps> = ({
  size = 'lg',
  isThinking = false,
  className = '',
  showEnergyWaves = true,
  showOrbits = true,
  showParticles = true,
  statusText
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Dimensions mapping for crisp responsive scaling
  const containerSizeMap = {
    xs: 'w-24 h-24',
    sm: 'w-32 h-32',
    md: 'w-48 h-48 sm:w-52 sm:h-52',
    lg: 'w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80',
    xl: 'w-80 h-80 sm:w-96 sm:h-96'
  };

  const innerSphereSizeMap = {
    xs: 'w-16 h-16',
    sm: 'w-22 h-22',
    md: 'w-32 h-32 sm:w-36 sm:h-36',
    lg: 'w-44 h-44 sm:w-52 sm:h-52 lg:w-56 lg:h-56',
    xl: 'w-56 h-56 sm:w-64 sm:h-64'
  };

  // Orbit rotation speeds (faster when thinking/active)
  const orbitSpeed = isThinking ? '6s' : '18s';
  const secondaryOrbitSpeed = isThinking ? '8s' : '24s';

  return (
    <div 
      className={`relative flex flex-col items-center justify-center select-none pointer-events-none ${containerSizeMap[size]} ${className}`}
      aria-label="AI/ML Neural Processor Centerpiece"
    >
      {/* ========================================================= */}
      {/* 1. SOFT AMBIENT GLOW BACKDROP (Deep Cyan, Electric Violet, Rose) */}
      {/* ========================================================= */}
      <div 
        className={`absolute inset-4 rounded-full filter blur-2xl sm:blur-3xl transition-all duration-700 pointer-events-none ${
          isThinking 
            ? 'bg-gradient-to-tr from-[#00F0FF]/35 via-[#10B981]/30 to-[#8B5CF6]/30 opacity-95 scale-125' 
            : 'bg-gradient-to-tr from-[#00F0FF]/25 via-[#10B981]/20 to-[#8B5CF6]/20 opacity-75 scale-105'
        }`}
      />
      <div 
        className="absolute w-3/5 h-3/5 rounded-full bg-radial-at-c from-[#00F0FF]/30 via-[#10B981]/15 to-transparent filter blur-xl pointer-events-none" 
      />

      {/* ========================================================= */}
      {/* 2. RADIATING ENERGY PULSE WAVES (Gentle, Outward Soft Waves) */}
      {/* ========================================================= */}
      {showEnergyWaves && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Energy Wave 1 - Cyan / Emerald */}
          <div 
            className="absolute rounded-full border border-cyan-400/30 bg-radial from-cyan-400/10 to-transparent animate-energy-wave-1"
            style={{
              width: '60%',
              height: '60%',
              animationDuration: isThinking ? '2.5s' : '4.5s'
            }}
          />
          {/* Energy Wave 2 - Violet / Emerald (Offset Phase) */}
          <div 
            className="absolute rounded-full border border-emerald-400/25 bg-radial from-emerald-500/8 to-transparent animate-energy-wave-2"
            style={{
              width: '60%',
              height: '60%',
              animationDuration: isThinking ? '2.5s' : '4.5s',
              animationDelay: isThinking ? '1.25s' : '2.25s'
            }}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. 3D GLOWING ROTATING ORBITAL RINGS (Kept Exactly As They Are) */}
      {/* ========================================================= */}
      {showOrbits && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          
          {/* ORBIT RING 1: Primary Elliptical Glowing Ring (Tilted -25 deg) */}
          <div 
            className="absolute w-full h-full flex items-center justify-center"
            style={{ transform: 'rotate(-25deg)' }}
          >
            <div 
              className="relative w-[90%] h-[90%] rounded-full border border-dashed border-cyan-400/40 animate-spin-linear"
              style={{
                animationDuration: orbitSpeed,
                boxShadow: '0 0 15px rgba(0, 240, 255, 0.25), inset 0 0 15px rgba(0, 240, 255, 0.15)',
                borderTopColor: '#00F0FF',
                borderRightColor: 'rgba(0, 240, 255, 0.6)',
                borderBottomColor: 'rgba(16, 185, 129, 0.4)',
                borderLeftColor: 'rgba(139, 92, 246, 0.5)'
              }}
            >
              {/* Photon Node 1: Electric Cyan Orbiting Bead with Trail */}
              <div 
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-300"
                style={{
                  boxShadow: '0 0 14px #00F0FF, 0 0 6px #FFFFFF, 0 0 24px rgba(0, 240, 255, 0.8)',
                  background: 'radial-gradient(circle at 35% 35%, #FFFFFF, #00F0FF 75%)'
                }}
              />
              {/* Secondary Micro Photon on Ring 1 */}
              <div 
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400 opacity-80"
                style={{
                  boxShadow: '0 0 10px #10B981, 0 0 4px #FFFFFF'
                }}
              />
            </div>
          </div>

          {/* ORBIT RING 2: Secondary Counter-Rotating Ring (Tilted +35 deg) */}
          <div 
            className="absolute w-full h-full flex items-center justify-center"
            style={{ transform: 'rotate(35deg)' }}
          >
            <div 
              className="relative w-[78%] h-[78%] rounded-full border border-dotted border-violet-400/35 animate-spin-reverse-linear"
              style={{
                animationDuration: secondaryOrbitSpeed,
                boxShadow: '0 0 12px rgba(139, 92, 246, 0.2), inset 0 0 12px rgba(139, 92, 246, 0.1)',
                borderTopColor: '#C084FC',
                borderRightColor: 'rgba(236, 72, 153, 0.5)',
                borderBottomColor: 'rgba(139, 92, 246, 0.3)',
                borderLeftColor: 'rgba(0, 240, 255, 0.4)'
              }}
            >
              {/* Photon Node 2: Violet/Magenta Spark */}
              <div 
                className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-pink-400"
                style={{
                  boxShadow: '0 0 12px #EC4899, 0 0 6px #FFFFFF',
                  background: 'radial-gradient(circle at 35% 35%, #FFFFFF, #EC4899 75%)'
                }}
              />
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 4. FLOATING SYNAPSE PARTICLES */}
      {/* ========================================================= */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <span 
            className="absolute top-[16%] left-[20%] w-1.5 h-1.5 rounded-full bg-cyan-300 animate-synapse-blink" 
            style={{ animationDelay: '0s', boxShadow: '0 0 8px #00F0FF' }}
          />
          <span 
            className="absolute top-[24%] right-[18%] w-1.5 h-1.5 rounded-full bg-violet-400 animate-synapse-blink" 
            style={{ animationDelay: '0.8s', boxShadow: '0 0 8px #A855F7' }}
          />
          <span 
            className="absolute bottom-[22%] left-[22%] w-1.5 h-1.5 rounded-full bg-emerald-400 animate-synapse-blink" 
            style={{ animationDelay: '1.4s', boxShadow: '0 0 8px #10B981' }}
          />
          <span 
            className="absolute bottom-[18%] right-[22%] w-1.5 h-1.5 rounded-full bg-pink-400 animate-synapse-blink" 
            style={{ animationDelay: '2.1s', boxShadow: '0 0 8px #EC4899' }}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. HORIZONTAL SUBTLE LIGHT RAYS BEHIND / ACROSS THE SPHERE */}
      {/* ========================================================= */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
        {/* Horizontal Laser Flare 1 */}
        <div 
          className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent animate-light-ray-pulse"
          style={{
            boxShadow: '0 0 12px rgba(0, 240, 255, 0.7), 0 0 4px #FFFFFF'
          }}
        />
        {/* Upper Offset Flare */}
        <div 
          className="absolute w-4/5 h-[1.5px] -translate-y-8 bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent animate-light-ray-drift"
          style={{
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)'
          }}
        />
        {/* Lower Offset Flare */}
        <div 
          className="absolute w-4/5 h-[1.5px] translate-y-8 bg-gradient-to-r from-transparent via-violet-400/60 to-transparent animate-light-ray-drift"
          style={{
            boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)',
            animationDelay: '1.5s'
          }}
        />
      </div>

      {/* ========================================================= */}
      {/* 6. CENTERPIECE: PROVIDED NEURAL CIRCUIT GLASS SPHERE BRAIN */}
      {/* ========================================================= */}
      <div 
        className={`relative z-10 flex items-center justify-center ${innerSphereSizeMap[size]} animate-brain-breathe`}
      >
        {/* Glass Sphere Framing Container with Prismatic Edge Highlights */}
        <div 
          className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden transition-transform duration-500"
          style={{
            border: '1.5px solid rgba(0, 240, 255, 0.55)',
            boxShadow: isThinking
              ? '0 0 35px rgba(0, 240, 255, 0.75), 0 0 20px rgba(16, 185, 129, 0.8), inset 0 0 24px rgba(0, 240, 255, 0.4), 0 8px 32px rgba(0, 0, 0, 0.7)'
              : '0 0 24px rgba(0, 240, 255, 0.55), 0 0 14px rgba(16, 185, 129, 0.6), inset 0 0 18px rgba(0, 240, 255, 0.3), 0 6px 24px rgba(0, 0, 0, 0.6)'
          }}
        >
          {/* High-Resolution Optimized Glass Neural Brain Image Asset */}
          {!imageLoaded && (
            <div 
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#051126] via-[#082245] to-[#041021] animate-pulse flex items-center justify-center pointer-events-none"
              aria-hidden="true"
            >
              <div className="w-8 h-8 rounded-full border border-cyan-400/30 border-t-cyan-400 animate-spin" />
            </div>
          )}
          <picture className="w-full h-full">
            <source srcSet="/ai_brain_orb.webp" type="image/webp" />
            <source srcSet="/ai_brain_orb.jpg" type="image/jpeg" />
            <img 
              src={brainOrbImg} 
              alt="AI/ML Neural Glass Sphere Brain"
              width={512}
              height={512}
              className={`w-full h-full object-cover object-center rounded-full select-none pointer-events-none transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{
                filter: isThinking 
                  ? 'drop-shadow(0 0 16px rgba(0, 255, 150, 0.7)) brightness(1.08) contrast(1.06)' 
                  : 'drop-shadow(0 0 10px rgba(0, 255, 150, 0.5)) brightness(1.03) contrast(1.04)'
              }}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              referrerPolicy="no-referrer"
              draggable={false}
            />
          </picture>

          {/* 🌟 Glass Refraction & Upper-Left Specular Sheen Arc */}
          <div 
            className="absolute top-1 left-2 w-3/5 h-2/5 rounded-full bg-gradient-to-b from-white/75 via-white/15 to-transparent transform -rotate-25 pointer-events-none filter blur-[0.3px]" 
            aria-hidden="true"
          />

          {/* Upper Glass Rim White Highlight Arc */}
          <div 
            className="absolute top-0 inset-x-4 h-1.5 rounded-full bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none filter blur-[0.2px]" 
            aria-hidden="true"
          />

          {/* Inner Cyan/Emerald Edge Blend Vignette */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none shadow-[inset_0_0_16px_rgba(0,240,255,0.4)]"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7. CIRCULAR HOLOGRAPHIC ENERGY PLATFORM WITH LIGHT RINGS  */}
      {/* ========================================================= */}
      <div className="absolute -bottom-6 sm:-bottom-8 inset-x-0 flex flex-col items-center justify-center pointer-events-none z-0">
        <svg 
          viewBox="0 0 320 80" 
          className="w-full max-w-[280px] sm:max-w-[340px] h-14 sm:h-18 overflow-visible"
        >
          <defs>
            <linearGradient id="platformRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
              <stop offset="25%" stopColor="#00F0FF" stopOpacity="0.9" />
              <stop offset="75%" stopColor="#A855F7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
            </linearGradient>
            <filter id="platformGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outermost Concentric Energy Ring */}
          <ellipse cx="160" cy="40" rx="140" ry="24" fill="none" stroke="url(#platformRingGrad)" strokeWidth="1.5" filter="url(#platformGlow)" opacity="0.7" strokeDasharray="6,4" />
          
          {/* Inner Concentric Ring 1 (Cyan) */}
          <ellipse cx="160" cy="40" rx="108" ry="18" fill="none" stroke="#00F0FF" strokeWidth="2" filter="url(#platformGlow)" opacity="0.85" />
          
          {/* Inner Concentric Ring 2 (Purple) */}
          <ellipse cx="160" cy="40" rx="72" ry="12" fill="none" stroke="#A855F7" strokeWidth="2.5" filter="url(#platformGlow)" opacity="0.9" />

          {/* Innermost Core Disc Glow */}
          <ellipse cx="160" cy="40" rx="42" ry="7" fill="#00F0FF" opacity="0.35" filter="url(#platformGlow)" />

          {/* Platform Vertical Energy Projections */}
          <line x1="85" y1="40" x2="85" y2="12" stroke="#00F0FF" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
          <line x1="235" y1="40" x2="235" y2="12" stroke="#A855F7" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
        </svg>
        
        {/* Horizontal energy glow haze */}
        <div className="w-48 h-3 rounded-full bg-gradient-to-r from-transparent via-[#00F0FF]/40 to-transparent blur-md -mt-5" />
      </div>

      {/* ========================================================= */}
      {/* 8. STATUS TEXT / BADGE (Optional) */}
      {/* ========================================================= */}
      {statusText && (
        <div className="mt-2.5 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#070e24]/90 border border-cyan-400/35 text-[10px] sm:text-[11px] font-mono text-cyan-300 shadow-[0_0_14px_rgba(0,240,255,0.25)] backdrop-blur-md">
          <span 
            className={`w-2 h-2 rounded-full ${
              isThinking 
                ? 'bg-[#00F0FF] animate-ping' 
                : 'bg-[#10B981] shadow-[0_0_8px_#10B981]'
            }`} 
          />
          <span className="font-semibold tracking-wider uppercase">{statusText}</span>
        </div>
      )}
    </div>
  );
};

export const DynamicAIBrain = React.memo(DynamicAIBrainComponent);
