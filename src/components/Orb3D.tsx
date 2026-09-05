import React from 'react';
import { DynamicAIBrain } from './DynamicAIBrain';

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
  return (
    <div className="relative flex flex-col items-center justify-center p-2 select-none">
      <DynamicAIBrain 
        size={size}
        isThinking={isThinking}
        statusText={statusText}
        showEnergyWaves={true}
        showOrbits={true}
        showParticles={true}
      />
    </div>
  );
};


