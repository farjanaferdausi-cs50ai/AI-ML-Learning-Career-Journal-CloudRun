import React, { useState } from 'react';
import { 
  Activity, 
  ArrowRight, 
  GraduationCap, 
  Code2, 
  Cloud, 
  FolderGit2,
  Layers,
  Sparkles
} from 'lucide-react';
import type { CareerProgressData, LearningPlatform } from '../types';

interface CurriculumSectionProps {
  careerData?: CareerProgressData;
  onSelectPlatform?: (platformId: string) => void;
}

export const CurriculumSection: React.FC<CurriculumSectionProps> = ({
  careerData,
  onSelectPlatform
}) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // Real Learning Platforms: Ostad, CodeBasics, Google Cloud Gen AI Academy, CodeAlpha
  const defaultPlatforms = [
    {
      id: 'ostad',
      name: 'Ostad',
      role: 'Structured Learning',
      badge: 'PROGRESS',
      badgeColor: '#22d3ee',
      focus: 'Live Masterclasses, PyTorch & AI/ML Tracks',
      percentage: 82,
      iconType: 'ostad'
    },
    {
      id: 'codebasics',
      name: 'CodeBasics',
      role: 'Fundamentals',
      badge: 'ACTIVE',
      badgeColor: '#10b981',
      focus: 'Python, Math, Statistics & ML Foundations',
      percentage: 88,
      iconType: 'codebasics'
    },
    {
      id: 'google-cloud',
      name: 'Google Cloud Gen AI Academy',
      role: 'Cloud & AI',
      badge: 'TRENDING',
      badgeColor: '#8b5cf6',
      focus: 'Vertex AI, Generative AI & Cloud Run Deployment',
      percentage: 75,
      iconType: 'google-cloud'
    },
    {
      id: 'codealpha',
      name: 'CodeAlpha',
      role: 'Practical Projects',
      badge: 'ACTIVE',
      badgeColor: '#f43f5e',
      focus: 'End-to-End AI/ML Engineering & Portfolio Projects',
      percentage: 70,
      iconType: 'codealpha'
    }
  ];

  const getPlatformIcon = (type: string) => {
    switch (type) {
      case 'ostad':
        return (
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <GraduationCap className="w-4 h-4" />
          </div>
        );
      case 'codebasics':
        return (
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <Code2 className="w-4 h-4" />
          </div>
        );
      case 'google-cloud':
        return (
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
            <Cloud className="w-4 h-4" />
          </div>
        );
      case 'codealpha':
        return (
          <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
            <FolderGit2 className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
            <Layers className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <section id="curriculum-section" className="w-full space-y-3 select-none">
      
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-[#00F0FF]">
            <Activity className="w-4 h-4" />
          </div>
          <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white font-mono">
            MULTI-PLATFORM AI/ML CURRICULUM
          </h2>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
            4 ACTIVE PLATFORMS
          </span>
        </div>

        <button
          onClick={() => {
            const el = document.getElementById('curriculum-card-ostad');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Cards in a Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {defaultPlatforms.map((platform) => {
          const isSelected = selectedCard === platform.id;
          return (
            <div
              key={platform.id}
              id={`curriculum-card-${platform.id}`}
              onClick={() => {
                setSelectedCard(isSelected ? null : platform.id);
                onSelectPlatform?.(platform.id);
              }}
              className={`rounded-xl p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between h-44 hover:scale-[1.01] ${
                isSelected
                  ? 'border-cyan-400 bg-[#0c1638] shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                  : 'bg-[#070e24] border-[#142347] hover:border-cyan-500/40 hover:bg-[#0a1433]'
              }`}
            >
              {/* Card Top */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    {getPlatformIcon(platform.iconType)}
                    <div>
                      <h3 className="text-xs font-bold text-white line-clamp-1">
                        {platform.name}
                      </h3>
                      <div className="text-[10px] font-mono text-slate-400">
                        {platform.role}
                      </div>
                    </div>
                  </div>

                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                    style={{
                      backgroundColor: `${platform.badgeColor}18`,
                      color: platform.badgeColor,
                      border: `1px solid ${platform.badgeColor}40`
                    }}
                  >
                    {platform.badge}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mt-1">
                  {platform.focus}
                </p>
              </div>

              {/* Progress Bar Bottom */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Mastery</span>
                  <span className="font-bold" style={{ color: platform.badgeColor }}>
                    {platform.percentage}%
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-[#101b38] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${platform.percentage}%`,
                      backgroundColor: platform.badgeColor,
                      boxShadow: `0 0 10px ${platform.badgeColor}`
                    }}
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
};
