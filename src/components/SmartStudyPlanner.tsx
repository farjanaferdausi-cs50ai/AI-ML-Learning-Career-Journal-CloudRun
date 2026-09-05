import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Sparkles, 
  Calendar, 
  Target, 
  Flame, 
  ArrowRight, 
  Check, 
  Clock, 
  Layers,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import type { GoalItem, StudySessionItem } from '../types';

interface SmartStudyPlannerProps {
  goals: GoalItem[];
  studySessions?: StudySessionItem[];
  onToggleGoal: (goalId: string, completed: boolean) => void;
  onAddGoal: (title: string, category: 'weekly' | 'milestone' | 'career') => Promise<void> | void;
  onAskCoachAboutGoal?: (goalTitle: string) => void;
  isCompact?: boolean;
}

export const SmartStudyPlanner: React.FC<SmartStudyPlannerProps> = ({
  goals,
  studySessions = [],
  onToggleGoal,
  onAddGoal,
  onAskCoachAboutGoal,
  isCompact = false
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<'weekly' | 'milestone' | 'career'>('weekly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'weekly' | 'milestone'>('all');

  // Close add goal form on Escape key
  useEffect(() => {
    if (!isAdding) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAdding(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAdding]);

  // Filter goals
  const filteredGoals = goals.filter(g => {
    if (selectedFilter === 'all') return true;
    return g.category === selectedFilter;
  });

  const weeklyGoals = goals.filter(g => g.category === 'weekly');
  const completedWeekly = weeklyGoals.filter(g => g.completed).length;
  const totalWeekly = weeklyGoals.length;
  const weeklyProgress = totalWeekly > 0 ? Math.round((completedWeekly / totalWeekly) * 100) : 0;

  // Active today tasks (derived from active study sessions or pending weekly goals)
  const todayTasks = goals.filter(g => !g.completed).slice(0, 3);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAddGoal(newGoalTitle.trim(), newGoalCategory);
      setNewGoalTitle('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to create goal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = async (presetTitle: string, category: 'weekly' | 'milestone' = 'weekly') => {
    try {
      await onAddGoal(presetTitle, category);
    } catch (err) {
      console.error('Failed to add preset goal:', err);
    }
  };

  return (
    <section 
      id="smart-study-planner"
      className="w-full rounded-2xl bg-[#060e22] border border-[#14264f] p-5 shadow-xl space-y-5 relative overflow-hidden"
    >
      {/* Background glow element */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#00F0FF]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#122247] relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0b244d] to-[#041229] border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <Target className="w-5 h-5 drop-shadow-[0_0_8px_#00F0FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide font-mono uppercase">
                Smart Study Planner
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-semibold">
                Weekly Sprint
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Personalized weekly objectives &amp; daily tasks for AI/ML career mastery
            </p>
          </div>
        </div>

        {/* Action button & progress pill */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#091533] border border-[#1a2d59] text-xs font-mono">
            <span className="text-slate-400">Weekly Progress:</span>
            <span className="text-[#00F0FF] font-bold">{completedWeekly}/{totalWeekly} ({weeklyProgress}%)</span>
          </div>

          <button
            onClick={() => setIsAdding(prev => !prev)}
            aria-expanded={isAdding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#00F0FF] hover:from-blue-500 hover:to-cyan-300 text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] cursor-pointer"
          >
            {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{isAdding ? 'Cancel' : 'Add Weekly Goal'}</span>
          </button>
        </div>
      </div>

      {/* Goal Creation Form (Accordion Dropdown) */}
      {isAdding && (
        <form 
          onSubmit={handleCreateGoal}
          className="p-4 rounded-xl bg-[#091533] border border-[#00F0FF]/40 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#00F0FF] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Define New Target Goal</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Stored in real-time Firestore</span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="e.g. Practice PyTorch Multi-Head Attention 3x this week"
              maxLength={150}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050b1a] border border-[#1a2d59] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] font-sans"
              autoFocus
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">Category:</span>
                {(['weekly', 'milestone', 'career'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewGoalCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono capitalize transition-all cursor-pointer ${
                      newGoalCategory === cat
                        ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/60 font-bold'
                        : 'bg-[#060c1d] text-slate-400 border border-[#142347] hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={!newGoalTitle.trim() || isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-[#00F0FF] hover:bg-cyan-300 text-black font-mono text-xs font-bold disabled:opacity-40 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.4)]"
              >
                {isSubmitting ? 'Saving...' : 'Save Goal to Firestore'}
              </button>
            </div>
          </div>

          {/* Quick Preset Ideas for Farjana */}
          <div className="pt-2 border-t border-[#14244a] flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-slate-400">Quick ideas:</span>
            {[
              'Practice PyTorch 3x this week',
              'Implement Scaled Dot-Product Attention test suite',
              'Synthesize HR talent heuristics into dense vector RAG',
              'Deploy FastAPI inference service on Cloud Run'
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setNewGoalTitle(preset)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#070f24] hover:bg-[#0c1a3b] border border-[#162752] text-cyan-300 hover:text-white transition-all cursor-pointer truncate max-w-[260px]"
              >
                + {preset}
              </button>
            ))}
          </div>
        </form>
      )}

      {/* Progress Bar Ribbon */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Weekly Sprint Completion</span>
          </span>
          <span className="text-[#00F0FF] font-bold">{weeklyProgress}% Achieved</span>
        </div>
        <div className="w-full h-2.5 bg-[#071024] rounded-full overflow-hidden border border-[#132349] p-0.5">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-[#00F0FF] rounded-full transition-all duration-500 shadow-[0_0_10px_#00F0FF]"
            style={{ width: `${Math.max(5, weeklyProgress)}%` }}
          />
        </div>
      </div>

      {/* Two Column Layout: Today's Tasks vs Weekly Goals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left Column: Today's Focus Tasks */}
        <div className="p-4 rounded-xl bg-[#071126] border border-[#15254d] space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#122044]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Today&apos;s Active Tasks
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-300">
                {todayTasks.length} pending
              </span>
            </div>

            {todayTasks.length === 0 ? (
              <div className="p-4 rounded-lg bg-[#050b1a] border border-[#142347] text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">
                  All today&apos;s pending tasks completed!
                </p>
                <p className="text-[10px] text-slate-400">
                  Add more weekly goals above or launch an AI Coach session to review progress.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-lg bg-[#050c1f] border border-[#152750] hover:border-cyan-500/40 transition-all flex items-center justify-between gap-2.5 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => onToggleGoal(task.id, true)}
                        className="w-5 h-5 rounded-md border border-slate-600 group-hover:border-cyan-400 flex items-center justify-center text-transparent hover:text-cyan-400 transition-all cursor-pointer shrink-0"
                        title="Mark Complete"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                      <div className="min-w-0">
                        <p className="text-xs text-white font-medium truncate group-hover:text-cyan-200">
                          {task.title}
                        </p>
                        <span className="text-[9px] font-mono text-slate-400 uppercase">
                          Category: {task.category}
                        </span>
                      </div>
                    </div>

                    {onAskCoachAboutGoal && (
                      <button
                        onClick={() => onAskCoachAboutGoal(task.title)}
                        className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded bg-[#091736] hover:bg-[#0f2452] border border-cyan-500/30 text-[10px] font-mono text-cyan-300 flex items-center gap-1 transition-all cursor-pointer shrink-0"
                        title="Ask Coach about this goal"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Coach</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Daily focus synced with study sessions</span>
            <span className="text-emerald-400">● Live Sync</span>
          </div>
        </div>

        {/* Right Column: Complete Weekly Goal Tracker */}
        <div className="p-4 rounded-xl bg-[#071126] border border-[#15254d] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#122044]">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#00F0FF]" />
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Weekly &amp; Milestone Goals
              </h3>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1">
              {(['all', 'weekly', 'milestone'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase transition-all cursor-pointer ${
                    selectedFilter === filter
                      ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/50 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Goal List */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filteredGoals.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 font-mono">
                No goals in this category. Click &quot;Add Weekly Goal&quot; above to create one.
              </p>
            ) : (
              filteredGoals.map((goal) => (
                <div
                  key={goal.id}
                  className={`p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2.5 ${
                    goal.completed
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : 'bg-[#050c1f] border-[#152750] text-slate-200 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={() => onToggleGoal(goal.id, !goal.completed)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                        goal.completed
                          ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                          : 'border-slate-600 hover:border-cyan-400'
                      }`}
                      title={goal.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    >
                      {goal.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <p className={`text-xs truncate ${goal.completed ? 'line-through opacity-75 text-emerald-200' : 'font-medium text-white'}`}>
                        {goal.title}
                      </p>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">
                        {goal.category} {goal.completed && '• Completed'}
                      </span>
                    </div>
                  </div>

                  {onAskCoachAboutGoal && !goal.completed && (
                    <button
                      onClick={() => onAskCoachAboutGoal(goal.title)}
                      className="px-2 py-1 rounded bg-[#091736] hover:bg-[#0f2452] border border-cyan-500/30 text-[10px] font-mono text-cyan-300 flex items-center gap-1 transition-all cursor-pointer shrink-0"
                      title="Practice this goal with AI Coach"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span className="hidden sm:inline">Practice</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
