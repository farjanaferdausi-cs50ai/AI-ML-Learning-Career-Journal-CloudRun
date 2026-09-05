import React from 'react';
import { 
  Zap, 
  Target, 
  Calendar, 
  FileEdit, 
  BookMarked, 
  UploadCloud, 
  FolderGit2, 
  Bot,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface QuickActionsFocusRowProps {
  onNewJournalEntry?: () => void;
  onAddStudyNote?: () => void;
  onUploadResource?: () => void;
  onTrackProject?: () => void;
  onAskAICoach?: () => void;
}

export const QuickActionsFocusRow: React.FC<QuickActionsFocusRowProps> = ({
  onNewJournalEntry,
  onAddStudyNote,
  onUploadResource,
  onTrackProject,
  onAskAICoach
}) => {
  const weeklyDays = [
    { day: 'M', active: true, height: 'h-7' },
    { day: 'T', active: true, height: 'h-9' },
    { day: 'W', active: true, height: 'h-8' },
    { day: 'T', active: true, height: 'h-10' },
    { day: 'F', active: true, height: 'h-9' },
    { day: 'S', active: false, height: 'h-3' },
    { day: 'S', active: false, height: 'h-3' }
  ];

  return (
    <section id="quick-actions-focus-row" className="w-full grid grid-cols-1 md:grid-cols-3 gap-3.5 select-none">
      
      {/* 1. Quick Actions Card */}
      <div className="rounded-xl bg-[#060d1f] border border-[#142347] p-4 flex flex-col justify-between shadow-lg hover:border-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200 ease-out">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1 rounded bg-amber-500/10 text-amber-400">
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
            QUICK ACTIONS
          </h3>
        </div>

        {/* 5 Action Icons in a Row */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1">
          <button
            id="quick-action-journal"
            onClick={onNewJournalEntry}
            className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 min-h-[44px] rounded-lg bg-[#091329] border border-[#18284e] hover:border-cyan-400/50 hover:bg-[#0e1e40] text-slate-300 hover:text-cyan-300 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none cursor-pointer group"
            title="New Journal Entry"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-cyan-950/60 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform duration-200 shadow-[0_0_8px_rgba(0,240,255,0.2)] shrink-0">
              <FileEdit className="w-3.5 h-3.5" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-medium text-center leading-tight truncate w-full">Journal</span>
          </button>

          <button
            id="quick-action-note"
            onClick={onAddStudyNote}
            className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 min-h-[44px] rounded-lg bg-[#091329] border border-[#18284e] hover:border-purple-400/50 hover:bg-[#0e1e40] text-slate-300 hover:text-purple-300 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none cursor-pointer group"
            title="Add Study Note"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-purple-950/60 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform duration-200 shadow-[0_0_8px_rgba(168,85,247,0.2)] shrink-0">
              <BookMarked className="w-3.5 h-3.5" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-medium text-center leading-tight truncate w-full">Note</span>
          </button>

          <button
            id="quick-action-resource"
            onClick={onUploadResource}
            className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 min-h-[44px] rounded-lg bg-[#091329] border border-[#18284e] hover:border-emerald-400/50 hover:bg-[#0e1e40] text-slate-300 hover:text-emerald-300 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none cursor-pointer group"
            title="Upload Resource"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-emerald-950/60 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform duration-200 shadow-[0_0_8px_rgba(16,185,129,0.2)] shrink-0">
              <UploadCloud className="w-3.5 h-3.5" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-medium text-center leading-tight truncate w-full">Resource</span>
          </button>

          <button
            id="quick-action-project"
            onClick={onTrackProject}
            className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 min-h-[44px] rounded-lg bg-[#091329] border border-[#18284e] hover:border-blue-400/50 hover:bg-[#0e1e40] text-slate-300 hover:text-blue-300 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none cursor-pointer group"
            title="Track Project"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-blue-950/60 flex items-center justify-center text-blue-300 group-hover:scale-110 transition-transform duration-200 shadow-[0_0_8px_rgba(59,130,246,0.2)] shrink-0">
              <FolderGit2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-medium text-center leading-tight truncate w-full">Project</span>
          </button>

          <button
            id="quick-action-coach"
            onClick={onAskAICoach}
            className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 min-h-[44px] rounded-lg bg-[#091329] border border-[#18284e] hover:border-amber-400/50 hover:bg-[#0e1e40] text-slate-300 hover:text-amber-300 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none cursor-pointer group"
            title="Ask AI Coach"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-amber-950/60 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform duration-200 shadow-[0_0_8px_rgba(245,158,11,0.2)] shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-medium text-center leading-tight truncate w-full">Coach</span>
          </button>
        </div>
      </div>

      {/* 2. Today's Focus Card */}
      <div className="rounded-xl bg-[#060d1f] border border-[#142347] p-4 flex items-center justify-between gap-3 shadow-lg hover:border-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200 ease-out">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
              <Target className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider truncate">
              DAY 2 FOCUS (TODAY)
            </h3>
          </div>

          <div className="space-y-1 text-xs text-slate-300 pl-0.5">
            <div className="flex items-center gap-1.5 truncate hover:text-cyan-300 transition-colors duration-150 cursor-pointer">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
              <span className="truncate">Transformer Architecture</span>
            </div>
            <div className="flex items-center gap-1.5 truncate hover:text-purple-300 transition-colors duration-150 cursor-pointer">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
              <span className="truncate">Multi-Head Attention</span>
            </div>
            <div className="flex items-center gap-1.5 truncate hover:text-blue-300 transition-colors duration-150 cursor-pointer">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
              <span className="truncate">Positional Encoding</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono pt-0.5">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Est. Time: 90 min</span>
          </div>
        </div>

        {/* Circular Progress Indicator */}
        <div className="relative w-18 h-18 shrink-0 flex items-center justify-center group hover:scale-105 transition-transform duration-200">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            {/* Background Ring */}
            <path
              className="text-[#0e1a38]"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Progress Stroke */}
            <path
              className="text-[#00F0FF] transition-all duration-500 ease-out"
              strokeDasharray="60, 100"
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              style={{ filter: 'drop-shadow(0 0 4px #00F0FF)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-white font-mono leading-none">60%</span>
            <span className="text-[8px] text-cyan-300 font-mono uppercase tracking-tighter">Done</span>
          </div>
        </div>
      </div>

      {/* 3. Weekly Learning Goal Card */}
      <div className="rounded-xl bg-[#060d1f] border border-[#142347] p-4 flex flex-col justify-between shadow-lg hover:border-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200 ease-out">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-purple-500/10 text-purple-400">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              WEEKLY GOAL
            </h3>
          </div>
          <div className="text-xs font-bold text-cyan-300 font-mono">
            5 / 7 <span className="text-[10px] text-slate-400 font-normal">Days</span>
          </div>
        </div>

        {/* 7 Days Bar Chart */}
        <div className="flex items-end justify-between gap-1.5 pt-2 px-1">
          {weeklyDays.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 group cursor-pointer">
              <div className="w-full flex items-end justify-center h-10">
                <div 
                  className={`w-full max-w-[14px] rounded-t-sm transition-all duration-200 ease-out group-hover:scale-y-110 origin-bottom ${
                    item.active 
                      ? `${item.height} bg-gradient-to-t from-blue-600 to-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.4)] group-hover:shadow-[0_0_12px_#00F0FF]` 
                      : `${item.height} bg-[#101b38] group-hover:bg-[#18284e]`
                  }`}
                />
              </div>
              <span className={`text-[10px] font-mono font-medium transition-colors duration-150 ${item.active ? 'text-cyan-300 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
