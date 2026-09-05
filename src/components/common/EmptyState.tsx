import React from 'react';
import { 
  BookOpen, 
  FolderGit2, 
  TrendingUp, 
  Award, 
  Target, 
  BarChart2, 
  Sparkles, 
  Layers, 
  Search, 
  Plus, 
  ArrowRight,
  RefreshCw,
  Compass
} from 'lucide-react';

export type EmptyStateVariant = 
  | 'journal'
  | 'projects'
  | 'progress'
  | 'skills'
  | 'goals'
  | 'analytics'
  | 'recommendations'
  | 'topics'
  | 'search'
  | 'custom';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'custom',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon,
  className = '',
  compact = false
}) => {
  // Preset defaults for each variant
  const getVariantConfig = () => {
    switch (variant) {
      case 'journal':
        return {
          icon: <BookOpen className="w-6 h-6 text-cyan-400" />,
          badge: 'Empty Journal',
          title: title || 'No Journal Reflections Yet',
          description: description || 'Start your first AI/ML learning session with the AI Coach to automatically synthesize and archive your daily study reflections.',
          actionLabel: actionLabel || 'Start Study Reflection',
          actionIcon: <Sparkles className="w-3.5 h-3.5" />
        };
      case 'projects':
        return {
          icon: <FolderGit2 className="w-6 h-6 text-emerald-400" />,
          badge: 'Portfolio Ready',
          title: title || 'No Projects Tracked Yet',
          description: description || 'Add your hands-on machine learning projects, Transformers from scratch, or RAG systems to build an industry-ready portfolio.',
          actionLabel: actionLabel || 'Explore Project Ideas',
          actionIcon: <Plus className="w-3.5 h-3.5" />
        };
      case 'progress':
        return {
          icon: <TrendingUp className="w-6 h-6 text-cyan-400" />,
          badge: 'Fresh Start',
          title: title || 'No Learning Progress Logged',
          description: description || 'Begin engaging with the multi-platform curriculum across Google Cloud, Ostad, CodeBasics, and CodeAlpha to track your mastery.',
          actionLabel: actionLabel || 'Explore Curriculum',
          actionIcon: <Compass className="w-3.5 h-3.5" />
        };
      case 'skills':
        return {
          icon: <Award className="w-6 h-6 text-purple-400" />,
          badge: 'Competency Matrix',
          title: title || 'No Skill Benchmarks Verified',
          description: description || 'Complete practice sessions in PyTorch, Linear Algebra, and LLM Engineering to generate your verified AI/ML skill ratings.',
          actionLabel: actionLabel || 'Test Skills with Coach',
          actionIcon: <ArrowRight className="w-3.5 h-3.5" />
        };
      case 'goals':
        return {
          icon: <Target className="w-6 h-6 text-rose-400" />,
          badge: 'Milestone Tracker',
          title: title || 'No Active Goals Set',
          description: description || 'Set your target transition milestones from HR leadership to AI/ML Engineer to keep your daily focus structured.',
          actionLabel: actionLabel || 'Set Milestone Goal',
          actionIcon: <Plus className="w-3.5 h-3.5" />
        };
      case 'analytics':
        return {
          icon: <BarChart2 className="w-6 h-6 text-blue-400" />,
          badge: 'Analytics Engine',
          title: title || 'No Analytics Data Available',
          description: description || 'As you log daily study time and complete interactive coaching dialogues, detailed trend charts and velocity metrics will appear here.',
          actionLabel: actionLabel || 'Start First Session',
          actionIcon: <Sparkles className="w-3.5 h-3.5" />
        };
      case 'recommendations':
        return {
          icon: <Sparkles className="w-6 h-6 text-amber-400" />,
          badge: 'AI Coach Guidance',
          title: title || 'No Active Recommendations',
          description: description || 'Ask your AI Coach a question or select a focus topic to receive tailored learning paths and code challenge suggestions.',
          actionLabel: actionLabel || 'Ask AI Coach',
          actionIcon: <Sparkles className="w-3.5 h-3.5" />
        };
      case 'topics':
        return {
          icon: <Layers className="w-6 h-6 text-sky-400" />,
          badge: 'Focus Topics',
          title: title || 'No Study Topics Selected',
          description: description || 'Add or enable topics like Deep Learning, PyTorch, or Transformers to guide your AI Coach towards specific subjects.',
          actionLabel: actionLabel || 'Add Study Topic',
          actionIcon: <Plus className="w-3.5 h-3.5" />
        };
      case 'search':
        return {
          icon: <Search className="w-6 h-6 text-slate-400" />,
          badge: 'Search Results',
          title: title || 'No Matching Records Found',
          description: description || 'No entries matched your search criteria. Try adjusting your query keywords or clearing active filters.',
          actionLabel: actionLabel || 'Clear Search Filters',
          actionIcon: <RefreshCw className="w-3.5 h-3.5" />
        };
      default:
        return {
          icon: icon || <Compass className="w-6 h-6 text-cyan-400" />,
          badge: 'Notice',
          title: title || 'Nothing to Display',
          description: description || 'There is currently no data to display in this view.',
          actionLabel: actionLabel,
          actionIcon: <ArrowRight className="w-3.5 h-3.5" />
        };
    }
  };

  const config = getVariantConfig();

  return (
    <div 
      className={`w-full flex flex-col items-center justify-center text-center rounded-2xl bg-[#070e24]/80 border border-[#142347] relative overflow-hidden select-none transition-all duration-200 ${
        compact ? 'p-5 min-h-[140px]' : 'p-8 sm:p-10 min-h-[220px]'
      } ${className}`}
    >
      {/* Soft Background Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md">
        {/* Icon Container */}
        <div className="w-12 h-12 rounded-2xl bg-[#0b1633] border border-[#1a2d5c] flex items-center justify-center mb-3 shadow-[0_0_16px_rgba(0,240,255,0.15)] transition-transform duration-200 hover:scale-105">
          {icon || config.icon}
        </div>

        {/* Badge */}
        {config.badge && (
          <span className="px-2 py-0.5 rounded-md bg-[#0e1c40] border border-[#1c356e] text-[10px] font-mono text-cyan-300 font-semibold mb-1.5">
            {config.badge}
          </span>
        )}

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-white tracking-wide mb-1">
          {config.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-5">
          {config.description}
        </p>

        {/* Action Buttons */}
        {(onAction || onSecondaryAction) && (
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {onAction && config.actionLabel && (
              <button
                onClick={onAction}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-semibold text-xs shadow-[0_0_14px_rgba(0,240,255,0.3)] hover:shadow-[0_0_18px_rgba(0,240,255,0.5)] transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none cursor-pointer"
              >
                {config.actionIcon}
                <span>{config.actionLabel}</span>
              </button>
            )}

            {onSecondaryAction && secondaryActionLabel && (
              <button
                onClick={onSecondaryAction}
                className="px-3.5 py-2 rounded-xl bg-[#0e172e] hover:bg-[#152347] border border-[#1d2f5a] hover:border-slate-400 text-slate-300 hover:text-white font-mono text-xs transition-all duration-200 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none cursor-pointer"
              >
                <span>{secondaryActionLabel}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
