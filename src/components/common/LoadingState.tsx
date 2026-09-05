import React from 'react';
import { 
  Loader2, 
  BrainCircuit, 
  Sparkles, 
  BookOpen, 
  Layers, 
  BarChart2,
  FolderGit2
} from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  variant?: 'spinner' | 'pulse' | 'ai' | 'dots';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  subMessage,
  size = 'md',
  variant = 'spinner',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'py-4 min-h-[100px]',
    md: 'py-8 min-h-[180px]',
    lg: 'py-12 min-h-[260px]',
    full: 'py-20 min-h-[400px] h-full'
  }[size];

  return (
    <div 
      className={`w-full flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-[#070e20]/60 border border-[#142347]/80 backdrop-blur-sm ${sizeClasses} ${className}`}
      role="status"
      aria-live="polite"
    >
      {variant === 'ai' ? (
        <div className="relative mb-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/20 to-purple-600/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.25)] animate-pulse">
            <BrainCircuit className="w-6 h-6 text-[#00F0FF] animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <Sparkles className="w-4 h-4 text-purple-400 absolute -top-1 -right-1 animate-bounce" />
        </div>
      ) : variant === 'dots' ? (
        <div className="flex items-center gap-2 mb-3.5">
          <span className="w-3 h-3 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-3 h-3 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      ) : (
        <div className="relative mb-3.5">
          <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin" />
        </div>
      )}

      <h4 className="text-xs sm:text-sm font-bold font-mono text-slate-200 tracking-wide">
        {message}
      </h4>

      {subMessage && (
        <p className="text-[11px] text-slate-400 max-w-sm mt-1 leading-relaxed">
          {subMessage}
        </p>
      )}
    </div>
  );
};

// 1. Skeleton for Dashboard Key Stats Cards
export const DashboardCardsSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx}
          className="rounded-xl bg-[#060d1f] border border-[#142347] p-4 relative overflow-hidden space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-3.5 bg-slate-800 rounded w-28" />
            <div className="w-7 h-7 rounded-lg bg-slate-800/80" />
          </div>
          <div className="space-y-2">
            <div className="h-6 bg-slate-800/90 rounded w-20" />
            <div className="w-full h-1.5 rounded-full bg-slate-800" />
          </div>
          <div className="pt-2 border-t border-[#121f3d] flex justify-between">
            <div className="h-3 bg-slate-800/60 rounded w-20" />
            <div className="h-3 bg-slate-800/60 rounded w-12" />
          </div>
        </div>
      ))}
    </div>
  );
};

// 2. Skeleton for Journal Entries & Timeline Items
export const TimelineSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx}
          className="rounded-xl bg-[#070e24] border border-[#142347] p-4.5 sm:p-5 space-y-3.5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-4 bg-slate-800 rounded w-16" />
              <div className="h-4 bg-slate-800/70 rounded w-20" />
            </div>
            <div className="h-3 bg-slate-800/60 rounded w-24" />
          </div>

          <div className="space-y-2">
            <div className="h-5 bg-slate-800 rounded w-3/4" />
            <div className="h-3.5 bg-slate-800/70 rounded w-full" />
            <div className="h-3.5 bg-slate-800/50 rounded w-5/6" />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#121f3d]">
            <div className="h-5 bg-slate-800/80 rounded-md w-16" />
            <div className="h-5 bg-slate-800/80 rounded-md w-20" />
            <div className="h-5 bg-slate-800/80 rounded-md w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

// 3. Skeleton for Curriculum Section (2x2 Platform Grid)
export const CurriculumSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-[#070e20] border border-[#142347] space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-4 bg-slate-800 rounded w-36" />
          <div className="h-3 bg-slate-800/60 rounded w-56" />
        </div>
        <div className="h-6 bg-slate-800 rounded-lg w-20" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-[#060c1c] border border-[#121f3d] space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 bg-slate-800 rounded w-28" />
                <div className="h-2.5 bg-slate-800/60 rounded w-20" />
              </div>
            </div>
            <div className="h-2.5 bg-slate-800/60 rounded w-full" />
            <div className="h-1.5 bg-slate-800 rounded-full w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Skeleton for AI Coach Generating / Thinking
export const AICoachLoading: React.FC<{ message?: string }> = ({ 
  message = 'AI/ML Coach is reasoning...' 
}) => {
  return (
    <div className="flex items-start gap-3 justify-start animate-in fade-in duration-200">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-700 border border-violet-400/50 flex items-center justify-center shrink-0 animate-pulse">
        <BrainCircuit className="w-4 h-4 text-violet-200" />
      </div>
      <div className="rounded-2xl rounded-tl-xs p-3.5 bg-[#1A1F2E] border border-cyan-500/30 flex items-center gap-3 shadow-[0_0_12px_rgba(0,240,255,0.15)]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-xs font-mono text-cyan-200 font-medium">
          {message}
        </span>
      </div>
    </div>
  );
};

// 5. Skeleton for Analytics & Progress View
export const AnalyticsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 rounded-2xl bg-[#091533] border border-[#162752]" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-[#070e20] border border-[#142347] space-y-2">
            <div className="h-3 bg-slate-800 rounded w-24" />
            <div className="h-7 bg-slate-800 rounded w-16" />
            <div className="h-2.5 bg-slate-800/60 rounded w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#070e20] border border-[#142347] h-64" />
        <div className="p-6 rounded-2xl bg-[#070e20] border border-[#142347] h-64" />
      </div>
    </div>
  );
};

// 6. Skeleton for Topic Badges in TopicManager
export const TopicSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="flex flex-wrap gap-2 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx}
          className="h-8 rounded-lg bg-slate-800/80 border border-slate-700/50 w-24"
        />
      ))}
    </div>
  );
};
