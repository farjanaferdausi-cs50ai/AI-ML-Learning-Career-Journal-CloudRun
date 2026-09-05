import React from 'react';
import { 
  Award, 
  Flame, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Trophy, 
  Star, 
  Target, 
  Clock, 
  BookOpen, 
  Cpu, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface AchievementsViewProps {
  onStartChallenge?: (prompt: string) => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  onStartChallenge
}) => {
  const earnedBadges = [
    {
      id: 'b1',
      title: '12-Day Study Streak',
      desc: 'Maintained continuous daily AI/ML learning sessions for 12 straight days.',
      icon: Flame,
      category: 'Consistency',
      color: 'from-orange-500 to-amber-500',
      earnedDate: 'May 29, 2026',
      progress: 100
    },
    {
      id: 'b2',
      title: 'Module Master (Level 4)',
      desc: 'Successfully completed 15 core Deep Learning & Neural Network modules.',
      icon: Award,
      category: 'Curriculum',
      color: 'from-cyan-500 to-blue-500',
      earnedDate: 'May 27, 2026',
      progress: 100
    },
    {
      id: 'b3',
      title: 'Model Deployer',
      desc: 'Built and deployed a real-time Fraud Detection ML API with FastAPI.',
      icon: Zap,
      category: 'Engineering',
      color: 'from-purple-500 to-indigo-500',
      earnedDate: 'May 20, 2026',
      progress: 100
    },
    {
      id: 'b4',
      title: 'PyTorch Practitioner',
      desc: 'Implemented custom PyTorch Dataset, DataLoader, and Training Loop.',
      icon: Cpu,
      category: 'Frameworks',
      color: 'from-emerald-500 to-teal-500',
      earnedDate: 'May 15, 2026',
      progress: 100
    }
  ];

  const inProgressBadges = [
    {
      id: 'b5',
      title: 'Transformer Architect',
      desc: 'Implement Self-Attention, Multi-Head Attention, and LayerNorm from scratch.',
      icon: Sparkles,
      category: 'LLMs',
      color: 'from-indigo-500 to-cyan-500',
      current: 4,
      target: 5,
      unit: 'Submodules',
      progress: 80
    },
    {
      id: 'b6',
      title: 'MLOps Master',
      desc: 'Set up automated CI/CD model evaluation and containerized deployment.',
      icon: Target,
      category: 'Production',
      color: 'from-rose-500 to-pink-500',
      current: 2,
      target: 5,
      unit: 'Pipelines',
      progress: 40
    },
    {
      id: 'b7',
      title: '30-Day Milestone Streak',
      desc: 'Reach a full 30-day streak of daily engineering journal reflections.',
      icon: Trophy,
      category: 'Habits',
      color: 'from-amber-500 to-yellow-500',
      current: 12,
      target: 30,
      unit: 'Days',
      progress: 40
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#0E1424] border border-[#1E293B] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold mb-1 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>Farjana&apos;s Milestones &amp; Badges</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Achievements &amp; Honors
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Tracking your progress, streaks, and engineering competencies as you transition to AI/ML.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#131826] border border-[#1E293B] text-center min-w-[90px]">
              <div className="text-lg font-bold text-amber-300 font-mono">4</div>
              <div className="text-[10px] font-mono text-slate-400">Unlocked</div>
            </div>
            <div className="p-3 rounded-xl bg-[#131826] border border-[#1E293B] text-center min-w-[90px]">
              <div className="text-lg font-bold text-cyan-300 font-mono">3</div>
              <div className="text-[10px] font-mono text-slate-400">In Progress</div>
            </div>
            <div className="p-3 rounded-xl bg-[#131826] border border-[#1E293B] text-center min-w-[90px]">
              <div className="text-lg font-bold text-purple-300 font-mono">12</div>
              <div className="text-[10px] font-mono text-slate-400">Streak Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Unlocked Badges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Unlocked Badges (4)</h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">All Verified</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {earnedBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div 
                key={badge.id}
                className="p-4 rounded-xl bg-[#0E1424] border border-[#1E293B] hover:border-emerald-500/40 transition-all shadow-lg flex items-start gap-4"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${badge.color} flex items-center justify-center text-white shrink-0 shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate">{badge.title}</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-mono text-emerald-300 font-bold">
                      EARNED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {badge.desc}
                  </p>
                  <div className="text-[9px] font-mono text-slate-500 pt-1">
                    Earned on {badge.earnedDate}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges In Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">In Progress Badges (3)</h2>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">Active Goals</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {inProgressBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div 
                key={badge.id}
                className="p-4 rounded-xl bg-[#0E1424] border border-[#1E293B] hover:border-cyan-500/40 transition-all shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${badge.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-300">{badge.progress}%</span>
                </div>

                <div>
                  <div className="text-xs font-bold text-white">{badge.title}</div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                    {badge.desc}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="w-full h-1.5 rounded-full bg-[#131826] overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${badge.color}`}
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 text-right">
                    {badge.current} / {badge.target} {badge.unit}
                  </div>
                </div>

                <button
                  onClick={() => onStartChallenge?.(`Help me complete requirements for the "${badge.title}" achievement.`)}
                  className="w-full py-1.5 rounded-lg bg-[#131826] hover:bg-[#1A2338] border border-[#1E293B] text-[10px] font-mono text-slate-300 hover:text-cyan-300 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Work On Badge</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
