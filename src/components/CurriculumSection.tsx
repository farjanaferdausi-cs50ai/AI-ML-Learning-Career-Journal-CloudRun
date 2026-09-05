import React, { useState } from 'react';
import { 
  Activity, 
  ArrowRight, 
  GraduationCap, 
  Cloud, 
  Terminal,
  BookOpen,
  Layers,
  Sparkles
} from 'lucide-react';
import type { CareerProgressData } from '../types';
import { CurriculumSkeleton } from './common/LoadingState';
import { EmptyState } from './common/EmptyState';

interface CurriculumSectionProps {
  careerData?: CareerProgressData;
  onSelectPlatform?: (platformId: string) => void;
  isLoading?: boolean;
}

export const CurriculumSection: React.FC<CurriculumSectionProps> = ({
  careerData,
  onSelectPlatform,
  isLoading = false
}) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  if (isLoading) {
    return <CurriculumSkeleton />;
  }

  // Exact 2x2 Layout:
  // ROW 1: 1. Google Cloud Gen AI Academy, 2. CodeBasics
  // ROW 2: 3. CodeAlpha, 4. Ostad
  const defaultPlatforms = [
    {
      id: 'google-cloud',
      name: 'Google Cloud Gen AI Academy',
      role: 'Vertex AI & Cloud Architecture',
      badge: 'TRENDING',
      badgeColor: '#a855f7',
      focus: 'Generative AI, Vertex AI Pipelines & Cloud Run Deployment',
      percentage: 71,
      iconType: 'google-cloud'
    },
    {
      id: 'codebasics',
      name: 'CodeBasics',
      role: 'Data Science & Analytics',
      badge: 'ACTIVE',
      badgeColor: '#10b981',
      focus: 'Data Science & Analytics learning platform, Python, ML Math & Neural Networks',
      percentage: 85,
      iconType: 'codebasics'
    },
    {
      id: 'codealpha',
      name: 'CodeAlpha',
      role: 'Applied Projects & Internship',
      badge: 'ACTIVE',
      badgeColor: '#f43f5e',
      focus: 'Real-world project-based internship and applied AI/ML practice platform',
      percentage: 80,
      iconType: 'codealpha'
    },
    {
      id: 'ostad',
      name: 'Ostad',
      role: 'Live Skills Bootcamp',
      badge: 'PROGRESS',
      badgeColor: '#00F0FF',
      focus: 'Tech skills bootcamp & live AI/ML masterclass platform with live mentor review',
      percentage: 78,
      iconType: 'ostad'
    }
  ];

  const getPlatformIcon = (type: string) => {
    switch (type) {
      case 'google-cloud':
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.25)] shrink-0">
            <Cloud className="w-4 h-4" />
          </div>
        );
      case 'codebasics':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)] shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
        );
      case 'codealpha':
        return (
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)] shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
        );
      case 'ostad':
        return (
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.25)] shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <section id="curriculum-section" className="w-full space-y-3.5 select-none">
      
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.2)]">
            <Activity className="w-4 h-4" />
          </div>
          <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white font-mono">
            MULTI-PLATFORM AI/ML CURRICULUM
          </h2>
          <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/40 shadow-[0_0_8px_rgba(0,240,255,0.15)]">
            4 ACTIVE PLATFORMS
          </span>
        </div>

        <button
          onClick={() => {
            const el = document.getElementById('curriculum-card-ostad');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-all duration-200 ease-out hover:translate-x-0.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* 2x2 Grid Layout: 2 Cards per Row, 2 Rows Total */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {defaultPlatforms.map((platform, idx) => {
          const isSelected = selectedCard === platform.id;
          return (
            <div
              key={platform.id}
              id={`curriculum-card-${platform.id}`}
              tabIndex={0}
              role="button"
              aria-pressed={isSelected}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedCard(isSelected ? null : platform.id);
                  onSelectPlatform?.(platform.id);
                }
              }}
              onClick={() => {
                setSelectedCard(isSelected ? null : platform.id);
                onSelectPlatform?.(platform.id);
              }}
              className={`rounded-xl p-4 border transition-all duration-200 ease-out cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden group hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                isSelected
                  ? 'border-cyan-400 bg-[#0c1638] shadow-[0_0_22px_rgba(0,240,255,0.3)] scale-[1.01]'
                  : 'bg-[#070e24] border-[#142347] hover:border-cyan-500/50 hover:bg-[#0a1433]'
              }`}
            >
              {/* Card Top: Icon, Titles, and Status Badge */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getPlatformIcon(platform.iconType)}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          0{idx + 1}.
                        </span>
                        <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-100 transition-colors">
                          {platform.name}
                        </h3>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                        {platform.role}
                      </div>
                    </div>
                  </div>

                  {platform.badge && (
                    <span
                      className="text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0"
                      style={{
                        backgroundColor: `${platform.badgeColor}18`,
                        color: platform.badgeColor,
                        border: `1px solid ${platform.badgeColor}40`
                      }}
                    >
                      {platform.badge}
                    </span>
                  )}
                </div>

                {/* Short Platform Description */}
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 pt-0.5">
                  {platform.focus}
                </p>
              </div>

              {/* Progress Bar & Percentage Bottom */}
              <div className="pt-2 border-t border-[#121f3d] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <span>Mastery Level</span>
                  </span>
                  <span className="text-sm font-bold font-mono" style={{ color: platform.badgeColor }}>
                    {platform.percentage}%
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-[#0d1733] border border-[#162752] overflow-hidden p-[1px]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${platform.percentage}%`,
                      backgroundColor: platform.badgeColor,
                      boxShadow: `0 0 12px ${platform.badgeColor}`
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
