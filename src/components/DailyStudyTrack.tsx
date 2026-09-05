import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Flame, 
  BookOpen, 
  PlusCircle, 
  Check, 
  Target,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';

export interface StudyDay {
  dayNumber: number;
  dateLabel: string;
  isToday: boolean;
  isYesterday: boolean;
  status: 'completed' | 'in_progress' | 'upcoming';
  title: string;
  focusTopics: string[];
  hoursLogged: number;
  milestone: string;
  platform: string;
  journalLogged: boolean;
}

interface DailyStudyTrackProps {
  currentDay?: number;
  studySessions?: StudyDay[];
  onSelectDay?: (day: StudyDay) => void;
  onStartDayCoach?: (day: StudyDay) => void;
  onSelectDayPrompt?: (prompt: string) => void;
  onToggleStatus?: (dayNumber: number, newStatus: 'completed' | 'in_progress' | 'upcoming') => void;
  onAddDay?: (title: string, topics: string[]) => void;
}

const INITIAL_STUDY_DAYS: StudyDay[] = [
  {
    dayNumber: 1,
    dateLabel: 'Yesterday (Day 1)',
    isToday: false,
    isYesterday: true,
    status: 'completed',
    title: 'AI/ML App Launch & Math Foundations',
    focusTopics: ['Python for AI', 'Linear Algebra', 'Gaussian Distribution', 'GCP Setup'],
    hoursLogged: 3.5,
    milestone: 'Initialized Career Transition Journal & completed CodeBasics math module',
    platform: 'CodeBasics & Google Cloud',
    journalLogged: true
  },
  {
    dayNumber: 2,
    dateLabel: 'Today (Day 2)',
    isToday: true,
    isYesterday: false,
    status: 'in_progress',
    title: 'Deep Learning & Self-Attention Mechanics',
    focusTopics: ['PyTorch Tensors', 'Scaled Dot-Product Attention', 'QKV Dimension Projections'],
    hoursLogged: 2.5,
    milestone: 'Constructed single-head self-attention layer & verified tensor shapes',
    platform: 'Ostad & CodeAlpha',
    journalLogged: true
  },
  {
    dayNumber: 3,
    dateLabel: 'Tomorrow (Day 3)',
    isToday: false,
    isYesterday: false,
    status: 'upcoming',
    title: 'Multi-Head Attention & Transformer Encoders',
    focusTopics: ['Multi-Head Projections', 'LayerNorm & Residuals', 'Positional Encoding'],
    hoursLogged: 0,
    milestone: 'Assemble 4-head attention block and run test sentence forward pass',
    platform: 'Ostad AI/ML Masterclass',
    journalLogged: false
  },
  {
    dayNumber: 4,
    dateLabel: 'Day 4 (Upcoming)',
    isToday: false,
    isYesterday: false,
    status: 'upcoming',
    title: 'Transformer Decoders & Autoregressive Gen',
    focusTopics: ['Causal Masking', 'KV Caching', 'Greedy vs Beam Search'],
    hoursLogged: 0,
    milestone: 'Implement causal decoding mask and generate tokens step-by-step',
    platform: 'Google Cloud Gen AI Academy',
    journalLogged: false
  },
  {
    dayNumber: 5,
    dateLabel: 'Day 5 (Upcoming)',
    isToday: false,
    isYesterday: false,
    status: 'upcoming',
    title: 'Fine-Tuning & Parameter-Efficient LoRA',
    focusTopics: ['PEFT / LoRA', 'Hugging Face Transformers', 'Quantization QLoRA'],
    hoursLogged: 0,
    milestone: 'Fine-tune small open-weight LLM on custom domain instruction dataset',
    platform: 'CodeAlpha & Ostad',
    journalLogged: false
  },
  {
    dayNumber: 6,
    dateLabel: 'Day 6 (Upcoming)',
    isToday: false,
    isYesterday: false,
    status: 'upcoming',
    title: 'End-to-End AI/ML Portfolio Application',
    focusTopics: ['FastAPI Backend', 'PyTorch Inference API', 'Docker Container'],
    hoursLogged: 0,
    milestone: 'Package sentiment reasoning model as a production containerized API',
    platform: 'CodeAlpha Applied Projects',
    journalLogged: false
  },
  {
    dayNumber: 7,
    dateLabel: 'Day 7 (Upcoming)',
    isToday: false,
    isYesterday: false,
    status: 'upcoming',
    title: 'Cloud Deployment & Weekly Milestone Review',
    focusTopics: ['Google Cloud Run', 'Vertex AI Endpoints', 'Weekly Reflection'],
    hoursLogged: 0,
    milestone: 'Deploy live API to Cloud Run and complete week 1 portfolio summary',
    platform: 'Google Cloud Gen AI Academy',
    journalLogged: false
  }
];

export const DailyStudyTrack: React.FC<DailyStudyTrackProps> = ({
  currentDay = 2,
  studySessions,
  onSelectDay,
  onStartDayCoach,
  onSelectDayPrompt,
  onToggleStatus,
  onAddDay
}) => {
  const [internalDays, setInternalDays] = useState<StudyDay[]>(INITIAL_STUDY_DAYS);
  const days = (studySessions && studySessions.length > 0) ? studySessions : internalDays;
  const [selectedDay, setSelectedDay] = useState<StudyDay>(days[1] || days[0] || INITIAL_STUDY_DAYS[1]); // Default to Day 2 (Today)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDayTitle, setNewDayTitle] = useState('');
  const [newDayTopics, setNewDayTopics] = useState('');

  // Close add modal on Escape key
  React.useEffect(() => {
    if (!showAddModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal]);
  React.useEffect(() => {
    if (days.length > 0) {
      const match = days.find(d => d.dayNumber === selectedDay.dayNumber);
      if (match) {
        setSelectedDay(match);
      } else {
        setSelectedDay(days[0]);
      }
    }
  }, [days]);

  const completedCount = days.filter(d => d.status === 'completed').length;
  const inProgressCount = days.filter(d => d.status === 'in_progress').length;
  const totalHours = days.reduce((acc, d) => acc + d.hoursLogged, 0);

  const handleToggleStatus = (dayNumber: number) => {
    const current = days.find(d => d.dayNumber === dayNumber);
    const nextStatus = (current?.status === 'completed' ? 'in_progress' : current?.status === 'in_progress' ? 'completed' : 'in_progress') as StudyDay['status'];
    
    if (onToggleStatus) {
      onToggleStatus(dayNumber, nextStatus);
    }
    
    setInternalDays(prev => prev.map(d => {
      if (d.dayNumber !== dayNumber) return d;
      const updated = { ...d, status: nextStatus };
      if (selectedDay.dayNumber === dayNumber) {
        setSelectedDay(updated);
      }
      return updated;
    }));
  };

  const handleAddDay = () => {
    if (!newDayTitle.trim()) return;
    const parsedTopics = newDayTopics.split(',').map(t => t.trim()).filter(Boolean);
    
    if (onAddDay) {
      onAddDay(newDayTitle, parsedTopics);
    }
    
    const nextDayNum = days.length + 1;
    const newDayItem: StudyDay = {
      dayNumber: nextDayNum,
      dateLabel: `Day ${nextDayNum} (Planned)`,
      isToday: false,
      isYesterday: false,
      status: 'upcoming',
      title: newDayTitle,
      focusTopics: parsedTopics,
      hoursLogged: 0,
      milestone: `Day ${nextDayNum} learning milestone target`,
      platform: 'Self-Directed & AI Coach',
      journalLogged: false
    };
    setInternalDays(prev => [...prev, newDayItem]);
    setSelectedDay(newDayItem);
    setNewDayTitle('');
    setNewDayTopics('');
    setShowAddModal(false);
  };

  return (
    <section id="daily-study-track" className="w-full rounded-2xl bg-[#060d1f] border border-[#142347] p-4 sm:p-5 shadow-xl space-y-4 select-none">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#121f3d]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 flex items-center justify-center text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.25)]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white font-mono">
                DAILY AI/ML STUDY TRACK
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400/40 animate-pulse">
                DAY 2 ACTIVE (TODAY)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Track progression day-by-day: Day 1 (Yesterday) • Day 2 (Today) • Day 3+ (Upcoming)
            </p>
          </div>
        </div>

        {/* Quick Stats on Right */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#091329] border border-[#18284e] text-xs font-mono">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-slate-400">Streak:</span>
            <span className="text-amber-300 font-bold">2 Days</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#091329] border border-[#18284e] text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Logged:</span>
            <span className="text-cyan-300 font-bold">{totalHours} hrs</span>
          </div>

          <button
            onClick={() => setShowAddModal(prev => !prev)}
            aria-expanded={showAddModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold transition-all cursor-pointer"
            title="Add Day Goal"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Day</span>
          </button>
        </div>
      </div>

      {/* Horizontal Day-by-Day Ribbon / Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {days.map((day) => {
          const isSelected = selectedDay.dayNumber === day.dayNumber;
          const isCompleted = day.status === 'completed';
          const isInProgress = day.status === 'in_progress';

          return (
            <div
              key={day.dayNumber}
              onClick={() => {
                setSelectedDay(day);
                onSelectDay?.(day);
              }}
              className={`rounded-xl p-2.5 sm:p-3 border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden group ${
                isSelected
                  ? 'bg-[#0a1535] border-cyan-400 shadow-[0_0_18px_rgba(0,240,255,0.25)] scale-[1.02]'
                  : day.isToday
                  ? 'bg-[#08122c] border-cyan-500/50 hover:border-cyan-400 hover:bg-[#0a1535]'
                  : day.isYesterday
                  ? 'bg-[#060f26] border-emerald-500/40 hover:border-emerald-400'
                  : 'bg-[#060c1d] border-[#142347] hover:border-slate-500/50 hover:bg-[#081024]'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold font-mono ${
                    day.isToday ? 'text-cyan-300' : day.isYesterday ? 'text-emerald-300' : 'text-slate-300'
                  }`}>
                    DAY {day.dayNumber}
                  </span>
                </div>

                {/* Status Indicator */}
                {isCompleted ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-400">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                ) : isInProgress ? (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shadow-[0_0_8px_#00F0FF]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                )}
              </div>

              {/* Subtitle / Timeline Tag */}
              <div>
                <div className="text-[10px] font-mono font-medium truncate text-slate-400">
                  {day.isYesterday ? 'Yesterday' : day.isToday ? 'Today (Active)' : `Day ${day.dayNumber}`}
                </div>
                <div className="text-[11px] font-semibold text-white line-clamp-1 leading-snug mt-0.5 group-hover:text-cyan-200">
                  {day.title}
                </div>
              </div>

              {/* Bottom Metrics Pill */}
              <div className="flex items-center justify-between pt-1 border-t border-[#121c38] text-[9px] font-mono">
                <span className={isCompleted ? 'text-emerald-400 font-bold' : isInProgress ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                  {isCompleted ? 'Done' : isInProgress ? 'Active' : 'Planned'}
                </span>
                <span className="text-slate-400">
                  {day.hoursLogged > 0 ? `${day.hoursLogged}h` : '90m'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Expanded Detail Card */}
      {selectedDay && (
        <div className="rounded-xl bg-[#070e24] border border-cyan-500/30 p-4 relative overflow-hidden transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#121f3d]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-400/40">
                  DAY {selectedDay.dayNumber} DETAILS
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {selectedDay.dateLabel}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  selectedDay.status === 'completed'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : selectedDay.status === 'in_progress'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-400/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-700'
                }`}>
                  {selectedDay.status === 'completed' ? 'COMPLETED' : selectedDay.status === 'in_progress' ? 'IN PROGRESS (TODAY)' : 'UPCOMING'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                {selectedDay.title}
              </h3>
            </div>

            {/* Actions for Selected Day */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleStatus(selectedDay.dayNumber)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedDay.status === 'completed'
                    ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{selectedDay.status === 'completed' ? 'Mark In Progress' : 'Mark Completed'}</span>
              </button>

              {(onStartDayCoach || onSelectDayPrompt) && (
                <button
                  onClick={() => {
                    if (onStartDayCoach) {
                      onStartDayCoach(selectedDay);
                    } else if (onSelectDayPrompt) {
                      onSelectDayPrompt(`Hello Coach! Help me with my Day ${selectedDay.dayNumber} study track objective: "${selectedDay.title}". Let's dive into ${selectedDay.focusTopics.join(', ')}.`);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Coach Day {selectedDay.dayNumber}</span>
                </button>
              )}
            </div>
          </div>

          {/* Details Body */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs">
            {/* Focus Topics */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Focus Topics Covered</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedDay.focusTopics.map((topic, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-[#09132a] border border-[#182a52] text-[11px] font-mono text-cyan-200">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Milestone */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Day Milestone Target</span>
              <p className="text-slate-300 leading-relaxed font-medium">
                {selectedDay.milestone}
              </p>
            </div>

            {/* Platform & Hours */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Platform & Time</span>
              <div className="flex items-center justify-between text-slate-300 font-mono pt-0.5">
                <span>{selectedDay.platform}</span>
                <span className="text-cyan-300 font-bold">{selectedDay.hoursLogged > 0 ? `${selectedDay.hoursLogged} hours` : 'Estimated: 90 min'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Day Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="w-full max-w-md rounded-2xl bg-[#070e24] border border-cyan-400/50 p-5 space-y-4 shadow-[0_0_30px_rgba(0,240,255,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#142347]">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>PLAN NEXT STUDY DAY (DAY {days.length + 1})</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-mono">Day Objective / Title</label>
                <input
                  type="text"
                  value={newDayTitle}
                  onChange={(e) => setNewDayTitle(e.target.value)}
                  placeholder="e.g. Multi-Head Attention & Transformer Encoders"
                  className="w-full px-3 py-2 rounded-lg bg-[#050b1a] border border-[#18284e] text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-mono">Topics (comma separated)</label>
                <input
                  type="text"
                  value={newDayTopics}
                  onChange={(e) => setNewDayTopics(e.target.value)}
                  placeholder="PyTorch, Scaled Dot-Product, Ostad Module"
                  className="w-full px-3 py-2 rounded-lg bg-[#050b1a] border border-[#18284e] text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#142347]">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg border border-[#18284e] text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDay}
                disabled={!newDayTitle.trim()}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-mono text-xs font-bold disabled:opacity-50 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.3)]"
              >
                Add to Study Track
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
