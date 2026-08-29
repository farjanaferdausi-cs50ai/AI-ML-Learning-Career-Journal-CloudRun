import React from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Flame, 
  Clock, 
  BookOpen, 
  Target,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import type { CareerProgressData, JournalSession, Topic } from '../types';

interface ProgressViewProps {
  careerData: CareerProgressData;
  sessions: JournalSession[];
  topics: Topic[];
  onOpenCoachPrompt: (prompt: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  careerData,
  sessions,
  topics,
  onOpenCoachPrompt
}) => {
  const activeTopicsCount = topics.filter(t => t.isActive).length;
  const completedSessionsCount = sessions.length;

  const skillMatrix = [
    { skill: 'Python & Data Engineering', level: 90, category: 'Fundamentals', platform: 'CodeBasics' },
    { skill: 'Linear Algebra & Statistics', level: 85, category: 'Theory', platform: 'CodeBasics' },
    { skill: 'Deep Learning & PyTorch', level: 82, category: 'Core ML', platform: 'Ostad' },
    { skill: 'Transformers & Scaled Attention', level: 78, category: 'Gen AI', platform: 'Ostad / Research' },
    { skill: 'Google Cloud Vertex AI & Run', level: 75, category: 'Cloud Engineering', platform: 'Google Cloud Gen AI Academy' },
    { skill: 'Production AI Portfolio', level: 70, category: 'Projects', platform: 'CodeAlpha' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#091533] via-[#060e24] to-[#121c40] border border-[#162752] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A3FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00A3FF] uppercase tracking-wider mb-1">
              <BarChart2 className="w-4 h-4" />
              <span>Career Transition Tracker</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI/ML Mastery Progress & Analytics
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Detailed tracking of study sessions, verified competencies, and your journey from 14+ years HR leadership to AI/ML Engineer.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-xl bg-[#091228] border border-[#1a2d5c] text-xs font-mono text-[#00F0FF] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>Overall Transition: 82% Ready</span>
            </span>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#070e20] border border-[#142347] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Completed Sessions</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{completedSessionsCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Reflections archived in Firestore</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#070e20] border border-[#142347] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Active Focus Topics</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{activeTopicsCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Live concepts in active study</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#070e20] border border-[#142347] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Study Platforms</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">4</div>
          <div className="text-[11px] text-slate-400 mt-1">Ostad, CodeBasics, GCP, CodeAlpha</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#070e20] border border-[#142347] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono">Target Position</span>
            <Award className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div className="text-sm font-bold text-white mt-1">AI/ML Engineer</div>
          <div className="text-[11px] text-cyan-400 font-mono mt-1">Transition Score: 82%</div>
        </div>
      </div>

      {/* Competency Skill Matrix */}
      <div className="p-6 rounded-2xl bg-[#070e20] border border-[#142347] shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#121f3d]">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="text-sm font-bold text-white">Technical Competency Breakdown</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Target Competency Benchmarks</span>
        </div>

        <div className="space-y-4">
          {skillMatrix.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{item.skill}</span>
                  <span className="px-2 py-0.5 rounded bg-[#0b1633] border border-[#1a2d59] text-[10px] font-mono text-cyan-300">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                    via {item.platform}
                  </span>
                </div>
                <span className="font-mono font-bold text-[#00F0FF]">{item.level}%</span>
              </div>

              <div className="w-full h-2 bg-[#091124] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0072FF] to-[#00F0FF] rounded-full transition-all duration-500"
                  style={{ width: `${item.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[#121f3d] flex justify-end">
          <button
            onClick={() => onOpenCoachPrompt('Evaluate my technical readiness for an AI/ML Engineer role and identify the highest-priority gap to close.')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0072FF]/20 hover:bg-[#0072FF]/40 border border-[#0072FF]/50 text-xs font-mono font-semibold text-[#00F0FF] hover:text-white transition-all cursor-pointer"
          >
            <span>Request Readiness Assessment from Coach</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
