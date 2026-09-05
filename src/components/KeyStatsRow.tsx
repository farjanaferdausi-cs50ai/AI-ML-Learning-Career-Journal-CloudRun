import React from 'react';
import { 
  BookOpen, 
  FolderGit2, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  Award 
} from 'lucide-react';
import { DashboardCardsSkeleton } from './common/LoadingState';

interface KeyStatsRowProps {
  isLoading?: boolean;
  progressPercentage?: number;
  lessonsCompleted?: number;
  totalLessons?: number;
  totalProjects?: number;
  projectsThisMonth?: number;
  skillsMasteryPercentage?: number;
  strongSkillsCount?: number;
  currentStreakDays?: number;
  bestStreakDays?: number;
}

export const KeyStatsRow: React.FC<KeyStatsRowProps> = ({
  isLoading = false,
  progressPercentage = 72,
  lessonsCompleted = 48,
  totalLessons = 67,
  totalProjects = 14,
  projectsThisMonth = 4,
  skillsMasteryPercentage = 78,
  strongSkillsCount = 12,
  currentStreakDays = 12,
  bestStreakDays = 18,
}) => {
  if (isLoading) {
    return (
      <section id="key-stats-row" className="w-full select-none">
        <DashboardCardsSkeleton count={4} />
      </section>
    );
  }

  return (
    <section id="key-stats-row" className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 select-none">
      
      {/* 1. Learning Progress Card */}
      <div className="rounded-xl bg-[#060d1f] border border-[#142347] p-4 relative overflow-hidden shadow-lg hover:border-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200 ease-out group">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors duration-150">Learning Progress</span>
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.2)] group-hover:scale-110 transition-transform duration-200">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[11px] text-slate-400">Overall Progress</span>
              <span className="text-xs font-bold text-cyan-300 font-mono">{progressPercentage}%</span>
            </div>
            {/* Cyan Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-[#0a1630] overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_8px_#00F0FF] transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#121f3d] text-[11px]">
            <span className="text-slate-400">Lessons Completed</span>
            <span className="font-semibold text-white font-mono">{lessonsCompleted} / {totalLessons}</span>
          </div>
        </div>
      </div>

      {/* 2. Projects Built Card */}
      <div className="rounded-xl bg-[#060d1f] border border-[#142347] p-4 relative overflow-hidden shadow-lg hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200 ease-out group">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors duration-150">Projects Built</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform duration-200">
            <FolderGit2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] text-slate-400 mb-0.5">Total Projects</div>
            <div className="text-xl font-bold text-white font-mono tracking-tight">{totalProjects}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium mt-1">
              <span className="text-slate-400">This Month:</span>
              <span className="font-bold font-mono">+{projectsThisMonth}</span>
            </div>
          </div>

          {/* Sparkline Visual */}
          <div className="w-20 h-10 pb-1 group-hover:scale-105 transition-transform duration-200 origin-bottom-right">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 80 30" fill="none">
              <defs>
                <linearGradient id="projectGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 25 Q 15 22, 30 18 T 55 12 T 80 4"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 0 25 Q 15 22, 30 18 T 55 12 T 80 4 L 80 30 L 0 30 Z"
                fill="url(#projectGrad)"
              />
              <circle cx="80" cy="4" r="3" fill="#10b981" className="animate-pulse shadow-[0_0_6px_#10b981]" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Skills Mastery Card */}
      <div className="rounded-xl bg-[#060d1f] border border-[#142347] p-4 relative overflow-hidden shadow-lg hover:border-purple-500/40 hover:-translate-y-0.5 transition-all duration-200 ease-out group">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors duration-150">Skills Mastery</span>
          <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform duration-200">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[11px] text-slate-400">Average Mastery</span>
              <span className="text-xs font-bold text-purple-300 font-mono">{skillsMasteryPercentage}%</span>
            </div>
            {/* Purple Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-[#0a1630] overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-400 shadow-[0_0_8px_#a855f7] transition-all duration-500"
                style={{ width: `${skillsMasteryPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#121f3d] text-[11px]">
            <span className="text-slate-400">Strong Skills</span>
            <span className="font-semibold text-white font-mono">{strongSkillsCount} Core Proficiencies</span>
          </div>
        </div>
      </div>

      {/* 4. Study Streak Card */}
      <div className="rounded-xl bg-[#060d1f] border border-[#142347] p-4 relative overflow-hidden shadow-lg hover:border-amber-500/40 hover:-translate-y-0.5 transition-all duration-200 ease-out group">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors duration-150">Study Streak</span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform duration-200">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] text-slate-400 mb-0.5">Study Journey</div>
            <div className="text-xl font-bold text-amber-300 font-mono tracking-tight flex items-center gap-1">
              <span>Day 2</span>
              <span className="text-xs font-sans text-amber-400/90 font-normal">(Today)</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Started: <span className="text-emerald-400 font-semibold font-mono">Day 1 (Yesterday)</span>
            </div>
          </div>

          {/* Mini Day Tracker Bar Chart */}
          <div className="flex items-end gap-1.5 h-8 pb-1">
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-2.5 h-6 rounded-t-sm bg-emerald-400 shadow-[0_0_6px_#10b981]" title="Day 1 (Yesterday): Completed" />
              <span className="text-[8px] font-mono text-emerald-400">D1</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-2.5 h-8 rounded-t-sm bg-cyan-400 shadow-[0_0_8px_#00F0FF] animate-pulse" title="Day 2 (Today): Active" />
              <span className="text-[8px] font-mono text-cyan-300 font-bold">D2</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-2 h-4 rounded-t-sm bg-slate-700" title="Day 3: Upcoming" />
              <span className="text-[8px] font-mono text-slate-500">D3</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-2 h-3 rounded-t-sm bg-slate-700" title="Day 4: Upcoming" />
              <span className="text-[8px] font-mono text-slate-500">D4</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};
