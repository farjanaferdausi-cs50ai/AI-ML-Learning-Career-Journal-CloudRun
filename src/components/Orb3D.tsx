import React from 'react';
import brainOrbImg from '../assets/images/ai_brain_orb_1787939443258.jpg';

interface Orb3DProps {
  isThinking?: boolean;
  size?: 'sm' | 'md' | 'lg';
  statusText?: string;
}

export const Orb3D: React.FC<Orb3DProps> = ({ 
  isThinking = false, 
  size = 'md',
  statusText
}) => {
  const sizeMap = {
    sm: 'w-28 h-28',
    md: 'w-40 h-40',
    lg: 'w-52 h-52'
  };

  const sphereSizeMap = {
    sm: 'w-22 h-22',
    md: 'w-32 h-32',
    lg: 'w-44 h-44'
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-3 select-none">
      {/* Soft Emerald Shiny Ambient Glow Aura escaping beyond the sphere edge */}
      <div 
        className={`absolute rounded-full filter blur-2xl transition-all duration-700 pointer-events-none ${
          isThinking 
            ? 'bg-gradient-to-tr from-[#00ff66] via-[#059669] to-[#00f3ff] opacity-85 scale-140 shadow-[0_0_50px_#00ff66]' 
            : 'bg-gradient-to-tr from-[#00ff66] via-[#059669] to-[#047857] opacity-65 scale-115 shadow-[0_0_35px_#00ff66]'
        } ${sizeMap[size]}`} 
      />

      {/* Main Container */}
      <div className={`relative flex items-center justify-center ${sizeMap[size]}`}>
        
        {/* 💫 ROTATING OUTER RING (Emerald Neon 3D Metallic Glow with Glowing Dot) */}
        <div 
          className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-700 pointer-events-none ${
            isThinking ? 'animate-spin' : 'animate-spin-slow'
          }`}
          style={{ 
            animationDuration: isThinking ? '4s' : '18s',
            borderTopColor: '#c6ffdd', // 3D metallic light sheen on top arc
            borderRightColor: isThinking ? 'rgba(0, 255, 102, 0.95)' : 'rgba(0, 255, 102, 0.75)',
            borderBottomColor: isThinking ? 'rgba(0, 255, 102, 0.95)' : 'rgba(0, 255, 102, 0.75)',
            borderLeftColor: isThinking ? 'rgba(0, 255, 102, 0.95)' : 'rgba(0, 255, 102, 0.75)',
            background: 'radial-gradient(circle at 30% 30%, rgba(0, 255, 102, 0.12), transparent 70%)',
            boxShadow: isThinking
              ? '0 0 32px rgba(0, 255, 102, 0.75), 0 0 14px rgba(0, 255, 102, 0.9), inset 0 0 16px rgba(0, 255, 102, 0.4), inset 1px 1px 4px rgba(220, 255, 235, 0.95), 0 8px 24px rgba(0, 0, 0, 0.5)'
              : '0 0 24px rgba(0, 255, 102, 0.55), 0 0 10px rgba(0, 255, 102, 0.75), inset 0 0 12px rgba(0, 255, 102, 0.3), inset 1px 1px 3px rgba(200, 255, 220, 0.8), 0 6px 18px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Glowing emerald photon node orbiting outer edge */}
          <div 
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#00ff66]" 
            style={{ 
              boxShadow: '0 0 12px #00ff66, 0 0 6px #c6ffdd, 0 0 2px #ffffff',
              background: 'radial-gradient(circle at 35% 35%, #ffffff, #00ff66 70%)'
            }}
            aria-hidden="true"
          />
        </div>

        {/* 🔮 STATIC CENTER: Fixed Glass Sphere with Glowing Green AI Brain */}
        <div 
          className={`relative rounded-full flex items-center justify-center overflow-hidden z-10 transition-transform duration-500 ${sphereSizeMap[size]} ${
            isThinking ? 'scale-105' : 'scale-100'
          }`}
          style={{
            border: '1.5px solid rgba(0, 255, 102, 0.65)',
            boxShadow: isThinking
              ? '0 0 35px rgba(0, 255, 102, 0.8), 0 0 16px rgba(0, 255, 102, 0.95), inset 0 0 20px rgba(0, 255, 102, 0.5), inset 2px 2px 6px rgba(255, 255, 255, 0.85), 0 10px 30px rgba(0, 0, 0, 0.6)'
              : '0 0 25px rgba(0, 255, 102, 0.6), 0 0 12px rgba(0, 255, 102, 0.8), inset 0 0 15px rgba(0, 255, 102, 0.35), inset 2px 2px 4px rgba(255, 255, 255, 0.75), 0 8px 24px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* STATIC AI Brain Image (Does NOT rotate or animate - stays completely still and upright) */}
          <img 
            src={brainOrbImg} 
            alt="AI Brain in Glass Sphere"
            className="w-full h-full object-cover object-center rounded-full pointer-events-none select-none"
            style={{
              filter: isThinking 
                ? 'drop-shadow(0 0 14px rgba(0, 255, 102, 0.7)) brightness(1.08) contrast(1.05)' 
                : 'drop-shadow(0 0 10px rgba(0, 255, 102, 0.5)) brightness(1.02) contrast(1.03)'
            }}
            loading="eager"
            referrerPolicy="no-referrer"
          />

          {/* 🌟 Glass Refraction & Upper-Left Specular Highlight Layer */}
          <div 
            className="absolute top-1 left-2 w-3/5 h-2/5 rounded-full bg-gradient-to-b from-white/80 via-white/20 to-transparent transform -rotate-25 pointer-events-none filter blur-[0.3px]" 
            aria-hidden="true"
          />

          {/* Upper Glass Rim White Arc */}
          <div 
            className="absolute top-0 inset-x-4 h-1.5 rounded-full bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none filter blur-[0.2px]" 
            aria-hidden="true"
          />

          {/* Inner Emerald Vignette Edge Blend */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none shadow-[inset_0_0_14px_rgba(0,255,102,0.45)]"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Status Text Indicator */}
      {statusText && (
        <div className="mt-3 flex items-center gap-2 text-xs font-mono tracking-wider uppercase">
          <span className={`inline-block w-2 h-2 rounded-full ${isThinking ? 'bg-[#00ff66] animate-ping' : 'bg-[#00ff66] shadow-[0_0_8px_#00ff66]'}`} />
          <span className={isThinking ? 'text-[#00ff66] font-semibold text-3d-emerald' : 'text-emerald-300'}>
            {statusText}
          </span>
        </div>
      )}
    </div>
  );
};

