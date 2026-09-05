import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  ArrowRight, 
  Sparkles, 
  Flame, 
  Clock, 
  Award, 
  Target, 
  CheckCircle2, 
  BookOpen, 
  Cpu, 
  Layers, 
  BrainCircuit, 
  Compass, 
  ChevronRight,
  TrendingUp,
  Activity,
  Code,
  Check,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  BookText,
  Lock,
  MoreHorizontal,
  Flag,
  X
} from 'lucide-react';
import { DynamicAIBrain } from './DynamicAIBrain';
import { SkillsRadarChart } from './SkillsRadarChart';
import type { Topic, JournalSession } from '../types';

interface DashboardCenterContentProps {
  onContinueLearning?: (prompt?: string) => void;
  onWatchOverview?: () => void;
  onNavigateTab?: (tab: string) => void;
  topics?: Topic[];
  sessions?: JournalSession[];
}

export const DashboardCenterContent: React.FC<DashboardCenterContentProps> = ({
  onContinueLearning,
  onWatchOverview,
  onNavigateTab,
  topics = [],
  sessions = []
}) => {
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [showSummaryMenu, setShowSummaryMenu] = useState(false);
  const [showSkillsMenu, setShowSkillsMenu] = useState(false);
  const summaryMenuRef = useRef<HTMLDivElement>(null);
  const skillsMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside and on Escape key
  useEffect(() => {
    if (!showSummaryMenu && !showSkillsMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (summaryMenuRef.current && !summaryMenuRef.current.contains(e.target as Node)) {
        setShowSummaryMenu(false);
      }
      if (skillsMenuRef.current && !skillsMenuRef.current.contains(e.target as Node)) {
        setShowSkillsMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSummaryMenu(false);
        setShowSkillsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSummaryMenu, showSkillsMenu]);
  const [customTopics, setCustomTopics] = useState<Array<{ name: string; dotColor: string }>>([
    { name: 'Transformers', dotColor: 'bg-purple-400' },
    { name: 'LLMs', dotColor: 'bg-pink-400' },
    { name: 'MLOps', dotColor: 'bg-cyan-400' },
    { name: 'Time Series', dotColor: 'bg-emerald-400' },
    { name: 'Computer Vision', dotColor: 'bg-rose-400' },
    { name: 'Reinforcement Learning', dotColor: 'bg-blue-400' },
    { name: 'NLP', dotColor: 'bg-amber-400' }
  ]);

  // Close Add Topic modal on Escape key
  useEffect(() => {
    if (!showAddTopicModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddTopicModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showAddTopicModal]);

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    setCustomTopics(prev => [...prev, { name: newTopicName.trim(), dotColor: 'bg-cyan-400' }]);
    setNewTopicName('');
    setShowAddTopicModal(false);
  };

  // 5-Step AI Mastery Study Plan Tracker matching reference
  const studyPlanSteps = [
    { num: 1, title: 'Foundations of ML', status: 'completed' },
    { num: 2, title: 'Supervised Learning', status: 'completed' },
    { num: 3, title: 'Deep Learning', status: 'in-progress' },
    { num: 4, title: 'MLOps & Deployment', status: 'locked' },
    { num: 5, title: 'Advanced Topics & Research', status: 'locked' },
  ];

  // Recent Learning Activity
  const recentActivities = [
    {
      id: 'act-1',
      title: 'Completed Module: Transformers & Attention Mechanism',
      timeAgo: '2 hours ago',
      icon: Cpu,
      iconColor: 'text-blue-400',
      bgGlow: 'bg-blue-500/15 border-blue-500/30'
    },
    {
      id: 'act-2',
      title: 'Built Mini Project: Sentiment Analysis with LSTM',
      timeAgo: '5 hours ago',
      icon: Code,
      iconColor: 'text-purple-400',
      bgGlow: 'bg-purple-500/15 border-purple-500/30'
    },
    {
      id: 'act-3',
      title: 'Studied: Backpropagation & Optimization',
      timeAgo: 'Yesterday',
      icon: Layers,
      iconColor: 'text-cyan-400',
      bgGlow: 'bg-cyan-500/15 border-cyan-500/30'
    },
    {
      id: 'act-4',
      title: 'Completed: PyTorch Basics Tutorial',
      timeAgo: '2 days ago',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      bgGlow: 'bg-emerald-500/15 border-emerald-500/30'
    },
    {
      id: 'act-5',
      title: 'Read Paper: Attention Is All You Need',
      timeAgo: '3 days ago',
      icon: BookOpen,
      iconColor: 'text-amber-400',
      bgGlow: 'bg-amber-500/15 border-amber-500/30'
    }
  ];

  // Current Focus Areas
  const focusAreas = [
    { 
      name: 'Deep Learning Mastery', 
      progress: 75, 
      color: 'from-blue-600 to-cyan-400'
    },
    { 
      name: 'MLOps & Deployment', 
      progress: 60, 
      color: 'from-purple-600 to-indigo-400'
    },
    { 
      name: 'Generative AI', 
      progress: 45, 
      color: 'from-cyan-500 to-teal-400'
    },
    { 
      name: 'LLM Fine-tuning', 
      progress: 30, 
      color: 'from-amber-500 to-orange-400'
    }
  ];

  // Learning Journal Timeline
  const journalTimeline = [
    {
      id: 'tl-1',
      date: 'May 20, 2024',
      text: 'Finished Neural Networks module and implemented a CNN.',
      dotColor: 'bg-blue-400 ring-blue-500/40'
    },
    {
      id: 'tl-2',
      date: 'May 18, 2024',
      text: 'Studied gradient descent variants. Noted key insights.',
      dotColor: 'bg-purple-400 ring-purple-500/40'
    },
    {
      id: 'tl-3',
      date: 'May 16, 2024',
      text: 'Built end-to-end ML pipeline for tabular data.',
      dotColor: 'bg-amber-400 ring-amber-500/40'
    },
    {
      id: 'tl-4',
      date: 'May 14, 2024',
      text: 'Explored Hugging Face datasets and fine-tuned a model.',
      dotColor: 'bg-slate-400 ring-slate-500/40'
    }
  ];

  // Recent Achievements (Hexagonal Badges)
  const achievements = [
    {
      id: 'ach-1',
      title: 'Consistent Learner',
      desc: '12 day streak achieved!',
      badgeColor: 'bg-purple-600/30 border-purple-500/60 text-purple-300',
      icon: Flame,
      glow: 'shadow-[0_0_12px_rgba(168,85,247,0.35)]'
    },
    {
      id: 'ach-2',
      title: 'Module Master',
      desc: 'Completed 45 modules.',
      badgeColor: 'bg-blue-600/30 border-blue-500/60 text-blue-300',
      icon: Award,
      glow: 'shadow-[0_0_12px_rgba(59,130,246,0.35)]'
    },
    {
      id: 'ach-3',
      title: 'Code Builder',
      desc: 'Built 10+ projects.',
      badgeColor: 'bg-emerald-600/30 border-emerald-500/60 text-emerald-300',
      icon: Code,
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.35)]'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-5 select-none w-full">
      
      {/* ========================================================= */}
      {/* 1. COMPACT HERO SECTION                                   */}
      {/* ========================================================= */}
      <section 
        id="hero-banner-section"
        className="w-full rounded-2xl bg-gradient-to-r from-[#0B0F19] via-[#111728] to-[#161F36] border border-[#1E293B] p-5 sm:p-6 relative overflow-hidden shadow-xl"
      >
        {/* Subtle background neon glow */}
        <div className="absolute -top-10 right-1/4 w-80 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center relative z-10">
          
          {/* Left Hero Content: Title, Subtitle, 3 Progress Stats, 2 Buttons */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-[10px] font-mono font-bold text-[#00F0FF] tracking-wider uppercase">
                Career Transition Track
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                14+ yrs HR → AI/ML Engineering
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
              AI/ML Learning &amp; Career Journal
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
              Track your AI/ML journey, build expertise, and advance your career with clarity and purpose.
            </p>

            {/* Three Progress Stats in a Row */}
            <div className="flex items-center gap-4 pt-2">
              {/* Stat 1: 19/75 Modules */}
              <div className="space-y-1 min-w-[100px]">
                <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-white font-mono">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>19/75</span>
                  <span className="text-xs text-slate-400 font-normal font-sans">Modules</span>
                </div>
                <div className="w-28 h-1.5 rounded-full bg-[#131826] overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500 w-[25%] shadow-[0_0_6px_#3b82f6]" />
                </div>
              </div>

              {/* Stat 2: 45/45 Completed */}
              <div className="space-y-1 min-w-[100px]">
                <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-white font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>45/45</span>
                  <span className="text-xs text-slate-400 font-normal font-sans">Completed</span>
                </div>
                <div className="w-28 h-1.5 rounded-full bg-[#131826] overflow-hidden">
                  <div className="h-full rounded-full bg-purple-500 w-[100%] shadow-[0_0_6px_#a855f7]" />
                </div>
              </div>

              {/* Stat 3: Circular Donut Ring 60% Overall Progress */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-[#1E293B]">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#1E293B" strokeWidth="3" />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15" 
                      fill="none" 
                      stroke="#8B5CF6" 
                      strokeWidth="3" 
                      strokeDasharray="94.2" 
                      strokeDashoffset="37.68" 
                      strokeLinecap="round" 
                      className="filter drop-shadow-[0_0_4px_#8B5CF6]" 
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-white font-mono">60%</span>
                </div>
                <div className="text-[11px] font-medium text-slate-300 leading-tight">
                  Overall<br />Progress
                </div>
              </div>
            </div>

            {/* Two Buttons: Watch Overview + Purple Resume Learning */}
            <div className="flex items-center gap-3 pt-3">
              <button
                id="hero-watch-overview-btn"
                onClick={() => {
                  if (onWatchOverview) onWatchOverview();
                  else onNavigateTab?.('learn');
                }}
                className="px-4 py-2 rounded-full bg-[#131826] hover:bg-[#1E293B] border border-[#1E293B] hover:border-slate-400 text-slate-200 hover:text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5 text-slate-300 fill-slate-300" />
                <span>Watch Overview</span>
              </button>

              <button
                id="hero-resume-learning-btn"
                onClick={() => onContinueLearning?.('Can you review my Deep Learning progress and recommend today\'s optimal coding exercise?')}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_18px_rgba(168,85,247,0.5)] transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Resume Learning</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Right Hero: Glowing 3D Neural Brain Hologram on Circular Energy Platform */}
          <div className="lg:col-span-5 flex items-center justify-center relative min-h-[190px]">
            <div className="relative flex items-center justify-center scale-90 sm:scale-100">
              <DynamicAIBrain size="md" />
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. ROW OF 5 EQUAL-WIDTH METRIC CARDS WITH SOFT GLOW       */}
      {/* ========================================================= */}
      <section id="progress-overview-cards" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* Card 1: Learning Progress 60% */}
        <div className="p-3.5 rounded-2xl bg-[#0B0F19] border border-[#1E293B] hover:border-cyan-500/40 transition-all duration-200 shadow-md flex flex-col justify-between group">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <BookOpen className="w-3 h-3" />
            </div>
            <span className="text-[11px] font-medium text-slate-300 truncate">Learning Progress</span>
          </div>
          
          <div className="flex items-end justify-between my-2">
            <div className="text-xl font-extrabold text-white font-mono">60%</div>
            {/* Neon blue sparkline curve */}
            <svg className="w-14 h-7 overflow-visible shrink-0" viewBox="0 0 56 28">
              <path d="M 2 22 Q 14 24 24 16 T 42 8 T 54 3" fill="none" stroke="#00F0FF" strokeWidth="2.5" strokeLinecap="round" filter="drop-shadow(0 0 4px #00F0FF)" />
              <circle cx="54" cy="3" r="2.5" fill="#00F0FF" />
            </svg>
          </div>

          <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Upward trend</span>
          </div>
        </div>

        {/* Card 2: Study Streak 12 Days */}
        <div className="p-3.5 rounded-2xl bg-[#0B0F19] border border-[#1E293B] hover:border-purple-500/40 transition-all duration-200 shadow-md flex flex-col justify-between group">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-400 shrink-0">
              <Flame className="w-3 h-3 fill-purple-400" />
            </div>
            <span className="text-[11px] font-medium text-slate-300 truncate">Study Streak</span>
          </div>

          <div className="flex items-end justify-between my-2">
            <div className="text-xl font-extrabold text-white font-mono">12 Days</div>
            {/* Neon purple sparkline curve */}
            <svg className="w-14 h-7 overflow-visible shrink-0" viewBox="0 0 56 28">
              <path d="M 2 24 Q 14 20 26 14 T 44 7 T 54 2" fill="none" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" filter="drop-shadow(0 0 4px #A855F7)" />
              <circle cx="54" cy="2" r="2.5" fill="#A855F7" />
            </svg>
          </div>

          <div className="text-[10px] font-mono text-purple-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Upward trend</span>
          </div>
        </div>

        {/* Card 3: Daily Activity 4.2 hrs */}
        <div className="p-3.5 rounded-2xl bg-[#0B0F19] border border-[#1E293B] hover:border-cyan-500/40 transition-all duration-200 shadow-md flex flex-col justify-between group">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Clock className="w-3 h-3" />
            </div>
            <span className="text-[11px] font-medium text-slate-300 truncate">Daily Activity</span>
          </div>

          <div className="flex items-end justify-between my-2">
            <div className="text-xl font-extrabold text-white font-mono">4.2 hrs</div>
            {/* Neon cyan sparkline curve */}
            <svg className="w-14 h-7 overflow-visible shrink-0" viewBox="0 0 56 28">
              <path d="M 2 20 Q 16 22 28 12 T 44 6 T 54 2" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" filter="drop-shadow(0 0 4px #38BDF8)" />
              <circle cx="54" cy="2" r="2.5" fill="#38BDF8" />
            </svg>
          </div>

          <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Upward trend</span>
          </div>
        </div>

        {/* Card 4: Skills Mastery 68% */}
        <div className="p-3.5 rounded-2xl bg-[#0B0F19] border border-[#1E293B] hover:border-violet-500/40 transition-all duration-200 shadow-md flex flex-col justify-between group">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-violet-500/15 border border-violet-400/30 flex items-center justify-center text-violet-400 shrink-0">
              <Target className="w-3 h-3" />
            </div>
            <span className="text-[11px] font-medium text-slate-300 truncate">Skills Mastery</span>
          </div>

          <div className="flex items-end justify-between my-2">
            <div className="text-xl font-extrabold text-white font-mono">68%</div>
            {/* Neon violet sparkline curve */}
            <svg className="w-14 h-7 overflow-visible shrink-0" viewBox="0 0 56 28">
              <path d="M 2 23 Q 14 22 26 13 T 44 8 T 54 3" fill="none" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" filter="drop-shadow(0 0 4px #C084FC)" />
              <circle cx="54" cy="3" r="2.5" fill="#C084FC" />
            </svg>
          </div>

          <div className="text-[10px] font-mono text-violet-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Upward trend</span>
          </div>
        </div>

        {/* Card 5: Goals Progress 80% */}
        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[#0B0F19] border border-[#1E293B] hover:border-emerald-500/40 transition-all duration-200 shadow-md flex flex-col justify-between group">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Flag className="w-3 h-3" />
            </div>
            <span className="text-[11px] font-medium text-slate-300 truncate">Goals Progress</span>
          </div>

          <div className="flex items-end justify-between my-2">
            <div className="text-xl font-extrabold text-white font-mono">80%</div>
            {/* Neon green sparkline curve */}
            <svg className="w-14 h-7 overflow-visible shrink-0" viewBox="0 0 56 28">
              <path d="M 2 22 Q 16 18 28 12 T 44 5 T 54 2" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" filter="drop-shadow(0 0 4px #10B981)" />
              <circle cx="54" cy="2" r="2.5" fill="#10B981" />
            </svg>
          </div>

          <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Upward trend</span>
          </div>
        </div>

      </section>

      {/* ========================================================= */}
      {/* 3. THREE-COLUMN MIDDLE SECTION                            */}
      {/* Col 1: Recent Learning Activity                           */}
      {/* Col 2: Current Focus Areas                                */}
      {/* Col 3: Learning Journal Timeline                          */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column: Recent Learning Activity */}
        <div id="recent-activity-section" className="rounded-2xl bg-[#0B0F19] border border-[#1E293B] p-4 shadow-xl space-y-3 flex flex-col justify-between scroll-mt-20">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[#1E293B]">
              <h2 className="text-xs font-bold text-white tracking-tight">Recent Learning Activity</h2>
              <button 
                onClick={() => onNavigateTab?.('journal')}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {recentActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div 
                    key={act.id}
                    className="p-2.5 rounded-xl bg-[#131826] border border-[#1E293B] hover:border-cyan-500/30 transition-all flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg ${act.bgGlow} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-3.5 h-3.5 ${act.iconColor}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-white truncate">
                          {act.title}
                        </div>
                        <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                          {act.timeAgo}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Column: Current Focus Areas */}
        <div id="focus-areas-section" className="rounded-2xl bg-[#0B0F19] border border-[#1E293B] p-4 shadow-xl space-y-3 flex flex-col justify-between scroll-mt-20">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[#1E293B]">
              <h2 className="text-xs font-bold text-white tracking-tight">Current Focus Areas</h2>
              <button
                onClick={() => onNavigateTab?.('learn')}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {focusAreas.map((area, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-white">{area.name}</span>
                    <span className="font-bold text-white font-mono text-[11px]">{area.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#131826] overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${area.color} transition-all duration-500`}
                      style={{ width: `${area.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Learning Journal Timeline */}
        <div id="journal-timeline-section" className="rounded-2xl bg-[#0B0F19] border border-[#1E293B] p-4 shadow-xl space-y-3 flex flex-col justify-between scroll-mt-20">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-[#1E293B]">
              <h2 className="text-xs font-bold text-white tracking-tight">Learning Journal Timeline</h2>
              <button
                onClick={() => onNavigateTab?.('journal')}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3 pt-2 relative before:absolute before:left-2 before:top-3 before:bottom-3 before:w-[2px] before:border-l-2 before:border-dashed before:border-[#1E293B]">
              {journalTimeline.map((entry) => (
                <div key={entry.id} className="relative pl-6 space-y-0.5 group">
                  {/* Timeline Dot with matching color */}
                  <div className={`absolute left-1 top-1.5 w-2.5 h-2.5 rounded-full ${entry.dotColor} ring-2 group-hover:scale-125 transition-all`} />

                  <div className="text-[10px] font-mono text-slate-400">
                    {entry.date}
                  </div>

                  <p className="text-[11px] text-slate-200 leading-snug group-hover:text-cyan-300 transition-colors">
                    {entry.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* ========================================================= */}
      {/* 4. FULL-WIDTH AI MASTERY STUDY PLAN PROGRESS TRACKER      */}
      {/* ========================================================= */}
      <section id="study-plan-section" className="rounded-2xl bg-[#0B0F19] border border-[#1E293B] p-5 shadow-xl space-y-5">
        
        <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
          <h2 className="text-sm font-bold text-white tracking-tight">AI Mastery Study Plan</h2>
          <button
            onClick={() => onNavigateTab?.('learn')}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Plan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Connected Horizontal Steps with Line */}
        <div className="relative pt-2 pb-1">
          {/* Connecting line behind circles */}
          <div className="absolute top-[22px] left-[10%] right-[10%] h-0.5 bg-[#1E293B] -z-0">
            {/* Green completed segment up to step 2/3 */}
            <div className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-purple-500 w-[50%]" />
          </div>

          <div className="grid grid-cols-5 gap-2 relative z-10">
            {studyPlanSteps.map((step) => {
              const isCompleted = step.status === 'completed';
              const isInProgress = step.status === 'in-progress';
              const isLocked = step.status === 'locked';

              return (
                <div key={step.num} className="flex flex-col items-center text-center space-y-1.5">
                  {/* Circle Indicator */}
                  {isCompleted && (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                      {step.num}
                    </div>
                  )}

                  {isInProgress && (
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-purple-600 border-2 border-purple-400 flex items-center justify-center text-white font-mono font-bold text-xs shadow-[0_0_14px_rgba(168,85,247,0.8)] animate-pulse">
                        {step.num}
                      </div>
                      {/* Pulse ring */}
                      <div className="absolute -inset-1 rounded-full border border-purple-400/50 animate-ping pointer-events-none" />
                    </div>
                  )}

                  {isLocked && (
                    <div className="w-8 h-8 rounded-full bg-[#131826] border border-[#1E293B] flex items-center justify-center text-slate-500">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {/* Step Title */}
                  <div className={`text-xs font-semibold max-w-[130px] leading-tight ${
                    isInProgress ? 'text-white font-bold' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                  }`}>
                    {step.title}
                  </div>

                  {/* Status label */}
                  <div className="text-[10px] font-mono">
                    {isCompleted && <span className="text-emerald-400">Completed</span>}
                    {isInProgress && <span className="text-purple-400 font-bold">In Progress</span>}
                    {isLocked && <span className="text-slate-500">Locked</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* ========================================================= */}
      {/* 5. BOTTOM SECTION: 4 BALANCED CARDS                       */}
      {/* Card 1: Active Focus Topics (with + Add Topic)            */}
      {/* Card 2: Weekly Learning Summary (4 metrics)               */}
      {/* Card 3: Skills Radar (circular radar chart)               */}
      {/* Card 4: Recent Achievements (hexagonal badges)            */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Card 1: Active Focus Topics */}
        <div className="rounded-2xl bg-[#0B0F19] border border-[#1E293B] p-4 shadow-xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
              <h2 className="text-xs font-bold text-white tracking-tight">Active Focus Topics</h2>
              <button
                id="add-topic-btn"
                onClick={() => setShowAddTopicModal(prev => !prev)}
                className={`px-2.5 py-1 rounded-full border text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                  showAddTopicModal 
                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                    : 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/25'
                }`}
                aria-expanded={showAddTopicModal}
              >
                {showAddTopicModal ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                <span>{showAddTopicModal ? 'Close' : 'Add Topic'}</span>
              </button>
            </div>

            {/* Tags with colored dots */}
            <div className="flex flex-wrap gap-2 pt-2">
              {customTopics.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => onContinueLearning?.(`Provide an in-depth explanation and coding exercise for "${topic.name}".`)}
                  className="px-2.5 py-1 rounded-full bg-[#131826] border border-[#1E293B] hover:border-slate-500 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${topic.dotColor}`} />
                  <span>{topic.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Weekly Learning Summary */}
        <div className="rounded-2xl bg-[#0B0F19] border border-[#1E293B] p-4 shadow-xl space-y-3 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#1E293B] relative">
              <h2 className="text-xs font-bold text-white tracking-tight">Weekly Learning Summary</h2>
              
              <div className="relative" ref={summaryMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowSummaryMenu(prev => !prev)}
                  aria-expanded={showSummaryMenu}
                  aria-label="Weekly Learning Summary Options"
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                    showSummaryMenu 
                      ? 'bg-slate-800 text-cyan-300' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showSummaryMenu && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-[#0F172A] border border-[#1E293B] shadow-2xl p-1.5 z-30 animate-in fade-in duration-150 text-xs font-mono">
                    <div className="flex items-center justify-between px-2 py-1 text-[10px] text-slate-400 border-b border-[#1E293B] mb-1">
                      <span>Summary Options</span>
                      <button
                        type="button"
                        onClick={() => setShowSummaryMenu(false)}
                        className="p-0.5 rounded text-slate-400 hover:text-white transition-colors"
                        aria-label="Close menu"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSummaryMenu(false);
                        onNavigateTab?.('analytics');
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors text-left cursor-pointer"
                    >
                      <span>View Full Analytics</span>
                      <ChevronRight className="w-3 h-3 text-cyan-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSummaryMenu(false);
                        onNavigateTab?.('curriculum');
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors text-left cursor-pointer"
                    >
                      <span>View Learning Tracks</span>
                      <ChevronRight className="w-3 h-3 text-cyan-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {/* Study Time */}
              <div className="p-2.5 rounded-xl bg-[#131826] border border-[#1E293B] space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Clock className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] text-slate-400">Study Time</span>
                </div>
                <div className="text-sm font-extrabold text-white font-mono">18.6 hrs</div>
                {/* Mini trend curve */}
                <svg className="w-12 h-3" viewBox="0 0 48 12">
                  <path d="M 2 10 Q 12 11 20 6 T 36 4 T 46 2" fill="none" stroke="#A855F7" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Modules */}
              <div className="p-2.5 rounded-xl bg-[#131826] border border-[#1E293B] space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <BookOpen className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] text-slate-400">Modules</span>
                </div>
                <div className="text-sm font-extrabold text-white font-mono">8</div>
                <div className="text-[9px] text-emerald-400 font-mono flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" /> 14%
                </div>
              </div>

              {/* Projects */}
              <div className="p-2.5 rounded-xl bg-[#131826] border border-[#1E293B] space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Award className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] text-slate-400">Projects</span>
                </div>
                <div className="text-sm font-extrabold text-white font-mono">2</div>
                <div className="text-[9px] text-emerald-400 font-mono flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" /> 33%
                </div>
              </div>

              {/* Practice Problems */}
              <div className="p-2.5 rounded-xl bg-[#131826] border border-[#1E293B] space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Code className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] text-slate-400">Practice Problems</span>
                </div>
                <div className="text-sm font-extrabold text-white font-mono">62</div>
                <div className="text-[9px] text-emerald-400 font-mono flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" /> 18%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Skills Bar & Line Chart */}
        <div className="rounded-2xl bg-[#0B0F19] border border-[#1E293B] p-4 shadow-xl space-y-2 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#1E293B] relative">
              <h2 className="text-xs font-bold text-white tracking-tight">Skills Proficiency</h2>
              
              <div className="relative" ref={skillsMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowSkillsMenu(prev => !prev)}
                  aria-expanded={showSkillsMenu}
                  aria-label="Skills Proficiency Options"
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                    showSkillsMenu 
                      ? 'bg-slate-800 text-cyan-300' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showSkillsMenu && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-[#0F172A] border border-[#1E293B] shadow-2xl p-1.5 z-30 animate-in fade-in duration-150 text-xs font-mono">
                    <div className="flex items-center justify-between px-2 py-1 text-[10px] text-slate-400 border-b border-[#1E293B] mb-1">
                      <span>Skills Options</span>
                      <button
                        type="button"
                        onClick={() => setShowSkillsMenu(false)}
                        className="p-0.5 rounded text-slate-400 hover:text-white transition-colors"
                        aria-label="Close menu"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSkillsMenu(false);
                        onNavigateTab?.('analytics');
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors text-left cursor-pointer"
                    >
                      <span>Detailed Breakdown</span>
                      <ChevronRight className="w-3 h-3 text-cyan-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSkillsMenu(false);
                        onNavigateTab?.('roadmap');
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1E293B] transition-colors text-left cursor-pointer"
                    >
                      <span>Transition Roadmap</span>
                      <ChevronRight className="w-3 h-3 text-cyan-400" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center py-0.5">
              <SkillsRadarChart size={190} />
            </div>
          </div>
        </div>

        {/* Card 4: Recent Achievements */}
        <div className="rounded-2xl bg-[#0B0F19] border border-[#1E293B] p-4 shadow-xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
              <h2 className="text-xs font-bold text-white tracking-tight">Recent Achievements</h2>
              <button
                onClick={() => onNavigateTab?.('achievements')}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5 pt-2">
              {achievements.map((ach) => {
                const Icon = ach.icon;
                return (
                  <div 
                    key={ach.id}
                    className="p-2.5 rounded-xl bg-[#131826] border border-[#1E293B] hover:border-slate-600 transition-all flex items-center gap-3"
                  >
                    {/* Modern Hexagonal Badge Icon */}
                    <div className={`w-8 h-8 rounded-lg ${ach.badgeColor} flex items-center justify-center shrink-0 ${ach.glow}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">
                        {ach.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {ach.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </section>

      {/* Add Topic Modal */}
      {showAddTopicModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowAddTopicModal(false)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl bg-[#0E1424] border border-[#1E293B] p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Add New Focus Topic</h3>
              <button
                type="button"
                onClick={() => setShowAddTopicModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddTopic} className="space-y-3">
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="e.g. Diffusion Models, CUDA, LangChain..."
                className="w-full px-3 py-2 rounded-xl bg-[#131826] border border-[#1E293B] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#00F0FF]"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTopicModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#131826] text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTopicName.trim()}
                  className="px-4 py-1.5 rounded-lg bg-[#00F0FF] text-slate-950 font-bold text-xs hover:bg-cyan-300 disabled:opacity-40 cursor-pointer"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
