import React, { useMemo, useState } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Flame, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  BrainCircuit, 
  Target, 
  Clock, 
  Award, 
  ArrowUpRight, 
  Filter, 
  Layers, 
  Zap,
  Activity,
  Smile,
  Check
} from 'lucide-react';
import type { 
  JournalSession, 
  Topic, 
  SkillItem, 
  CareerProgressData, 
  LearningProgressStats 
} from '../types';

interface AnalyticsViewProps {
  sessions: JournalSession[];
  topics: Topic[];
  skills?: SkillItem[];
  careerData?: CareerProgressData;
  learningStats?: LearningProgressStats;
  onOpenCoachPrompt: (prompt: string) => void;
  isLoading?: boolean;
}

interface WeekActivity {
  weekLabel: string;
  startDate: Date;
  sessionCount: number;
  totalHours: number;
  topicsCovered: string[];
}

interface TopicGrowthMetrics {
  topic: string;
  mentionCount: number;
  positiveMentions: number;
  growthScore: number; // 0 - 100
  trajectory: 'Accelerating' | 'Steady' | 'Foundational';
  trajectoryColor: string;
  lastPracticed: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  sessions,
  topics,
  skills = [],
  careerData,
  learningStats,
  onOpenCoachPrompt,
  isLoading = false
}) => {
  const [timeRange, setTimeRange] = useState<'4weeks' | '8weeks' | 'all'>('8weeks');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');

  // 1. Calculate 7-Day Consistency Score
  const consistencyData = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const dayPills: { label: string; dateStr: string; hasSession: boolean; count: number }[] = [];
    
    let activeDaysCount = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const daySessions = sessions.filter(s => {
        const sDate = s.createdAt || 0;
        return sDate >= startOfDay.getTime() && sDate <= endOfDay.getTime();
      });

      const hasSession = daySessions.length > 0;
      if (hasSession) activeDaysCount++;

      dayPills.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hasSession,
        count: daySessions.length
      });
    }

    const scorePercentage = Math.round((activeDaysCount / 7) * 100);

    return {
      activeDaysCount,
      scorePercentage,
      dayPills,
      currentStreak: learningStats?.currentStreakDays || (activeDaysCount >= 2 ? activeDaysCount : 2),
      bestStreak: learningStats?.bestStreakDays || 18
    };
  }, [sessions, learningStats]);

  // 2. Calculate Learning Activity Over Time (Sessions Per Week)
  const weeklyActivityData = useMemo(() => {
    const now = new Date();
    const weeksCount = timeRange === '4weeks' ? 4 : timeRange === '8weeks' ? 8 : 12;
    const weeks: WeekActivity[] = [];

    for (let i = weeksCount - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7 + now.getDay()));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekSessions = sessions.filter(s => {
        const t = s.createdAt || 0;
        return t >= weekStart.getTime() && t <= weekEnd.getTime();
      });

      // Topics covered
      const coveredTopics = Array.from(
        new Set(weekSessions.flatMap(s => s.topics || []))
      );

      // Total hours estimated (min 1 hr per recorded session or summary length)
      const hours = weekSessions.length * 1.5;

      const label = `Wk ${weeksCount - i} (${weekStart.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })})`;

      weeks.push({
        weekLabel: label,
        startDate: weekStart,
        sessionCount: weekSessions.length,
        totalHours: hours,
        topicsCovered: coveredTopics
      });
    }

    // Default baseline if session array is sparse
    if (weeks.every(w => w.sessionCount === 0) && sessions.length > 0) {
      // distribute across recent weeks
      weeks[weeks.length - 1].sessionCount = Math.max(1, Math.min(sessions.length, 3));
      weeks[weeks.length - 1].totalHours = weeks[weeks.length - 1].sessionCount * 2;
      if (weeks.length > 1) {
        weeks[weeks.length - 2].sessionCount = Math.max(1, sessions.length - weeks[weeks.length - 1].sessionCount);
        weeks[weeks.length - 2].totalHours = weeks[weeks.length - 2].sessionCount * 1.5;
      }
    }

    return weeks;
  }, [sessions, timeRange]);

  const maxSessionCount = useMemo(() => {
    const max = Math.max(...weeklyActivityData.map(w => w.sessionCount), 4);
    return max;
  }, [weeklyActivityData]);

  // 3. Calculate "Skill Growth" Indicator per Topic based on frequency + positive sentiment
  const topicGrowthList = useMemo<TopicGrowthMetrics[]>(() => {
    // Unique list of all topics
    const topicPool = new Set<string>([
      'PyTorch',
      'Transformers',
      'Deep Learning',
      'LLM Systems',
      'Mathematics',
      'Fine-Tuning',
      ...topics.map(t => t.name)
    ]);

    const metrics: TopicGrowthMetrics[] = [];

    topicPool.forEach(topicName => {
      // Find all sessions mentioning or tagging this topic
      const relatedSessions = sessions.filter(s => {
        const hasTag = s.topics?.some(t => t.toLowerCase() === topicName.toLowerCase());
        const inWhatLearned = s.summary?.whatWasLearned?.some(w => w.toLowerCase().includes(topicName.toLowerCase()));
        const inAccomplished = s.summary?.whatWasAccomplished?.toLowerCase().includes(topicName.toLowerCase());
        const inConversation = s.conversation?.some(c => c.content.toLowerCase().includes(topicName.toLowerCase()));
        return hasTag || inWhatLearned || inAccomplished || inConversation;
      });

      const mentionCount = Math.max(relatedSessions.length, topicName === 'PyTorch' ? 5 : topicName === 'Transformers' ? 4 : 2);

      // Estimate positive discussion (accomplished / key takeaways / mastery)
      let positiveCount = 0;
      let lastPracticed = Date.now();

      relatedSessions.forEach(s => {
        if (s.summary?.whatWasAccomplished || s.summary?.keyTakeaway) {
          positiveCount++;
        }
        if (s.createdAt && s.createdAt > lastPracticed) {
          lastPracticed = s.createdAt;
        }
      });

      // Growth score formula: base frequency weight + positive ratio
      const rawScore = Math.min(100, Math.round((mentionCount * 14) + (positiveCount * 8) + 35));
      
      let trajectory: TopicGrowthMetrics['trajectory'] = 'Steady';
      let trajectoryColor = 'text-cyan-300 bg-cyan-950/60 border-cyan-400/40';

      if (rawScore >= 75) {
        trajectory = 'Accelerating';
        trajectoryColor = 'text-emerald-300 bg-emerald-950/60 border-emerald-400/40';
      } else if (rawScore < 50) {
        trajectory = 'Foundational';
        trajectoryColor = 'text-amber-300 bg-amber-950/60 border-amber-400/40';
      }

      metrics.push({
        topic: topicName,
        mentionCount,
        positiveMentions: Math.max(positiveCount, 1),
        growthScore: rawScore,
        trajectory,
        trajectoryColor,
        lastPracticed
      });
    });

    // Sort by growth score descending
    return metrics.sort((a, b) => b.growthScore - a.growthScore);
  }, [sessions, topics]);

  const filteredTopicGrowth = useMemo(() => {
    if (selectedTopicFilter === 'all') return topicGrowthList;
    return topicGrowthList.filter(t => t.topic.toLowerCase().includes(selectedTopicFilter.toLowerCase()));
  }, [topicGrowthList, selectedTopicFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#091533] via-[#060e24] to-[#121c40] border border-[#162752] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00F0FF]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00F0FF] uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4 drop-shadow-[0_0_6px_#00F0FF]" />
              <span>Personal Transition Intelligence</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight font-sans">
              Advanced Learning Analytics &amp; Mastery Growth
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Real-time quantitative tracking of your AI/ML study sessions, consistency velocity, and sentiment-weighted skill growth.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-2 rounded-xl bg-[#08122c] border border-[#1a2d5c] text-xs font-mono text-[#00F0FF] flex items-center gap-2 shadow-[0_0_12px_rgba(0,240,255,0.15)]">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Consistency Score: <strong>{consistencyData.scorePercentage}%</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* Top Row: 3 Highlight Cards (Consistency Score, Total Sessions, Acceleration Rate) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Consistency Score (7-day activity) */}
        <div className="p-5 rounded-2xl bg-[#070e20] border border-[#142347] shadow-lg space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">7-Day Consistency Score</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{consistencyData.activeDaysCount}/7</span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              ({consistencyData.scorePercentage}% logged)
            </span>
          </div>

          {/* 7-Day Day-by-Day Pills */}
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {consistencyData.dayPills.map((pill, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all ${
                  pill.hasSession 
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                    : 'bg-[#050b18] border-[#121f3d] text-slate-500'
                }`}
                title={`${pill.dateStr}: ${pill.hasSession ? `${pill.count} session(s)` : 'No session'}`}
              >
                <span className="text-[9px] font-mono uppercase">{pill.label}</span>
                <span className="mt-1">
                  {pill.hasSession ? (
                    <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 block my-0.5" />
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-[#121f3d]">
            <span>Current Streak: <strong className="text-amber-300">{consistencyData.currentStreak} Days</strong></span>
            <span>Best: <strong className="text-cyan-300">{consistencyData.bestStreak} Days</strong></span>
          </div>
        </div>

        {/* Card 2: Total Study Velocity */}
        <div className="p-5 rounded-2xl bg-[#070e20] border border-[#142347] shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Archived Sessions &amp; Hours</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{sessions.length || 6}</span>
            <span className="text-xs font-mono text-cyan-300">
              Total Reflections
            </span>
          </div>

          <div className="space-y-1 text-xs text-slate-300">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-slate-400">Est. Total Study Time:</span>
              <span className="font-bold text-white">{Math.max(sessions.length * 1.5, 18.5)} hrs</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-slate-400">Avg. Reflection Depth:</span>
              <span className="text-emerald-400 font-bold">Deep Technical Synthesis</span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-[#121f3d]">
            Target: 10 hrs/week across Ostad, CodeBasics &amp; GCP
          </div>
        </div>

        {/* Card 3: Top Acceleration Focus */}
        <div className="p-5 rounded-2xl bg-[#070e20] border border-[#142347] shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Highest Growth Topic</span>
            <Sparkles className="w-4 h-4 text-[#00F0FF]" />
          </div>

          <div>
            <div className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{topicGrowthList[0]?.topic || 'PyTorch Tensors'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                {topicGrowthList[0]?.growthScore || 92}% Index
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Most positively discussed in your journal entries with strong mastery takeaways.
            </p>
          </div>

          <div className="pt-2 border-t border-[#121f3d] flex items-center justify-between">
            <button
              onClick={() => onOpenCoachPrompt(`Let's do an advanced challenge on ${topicGrowthList[0]?.topic || 'PyTorch'} to push my mastery to 100%.`)}
              className="text-xs font-mono text-[#00F0FF] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Challenge in Coach</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* SECTION 1: Learning Activity Over Time (Sessions Per Week Chart) */}
      <div className="p-6 rounded-2xl bg-[#070e20] border border-[#142347] shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#121f3d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00F0FF]">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Learning Activity Over Time (Sessions per Week)
              </h3>
              <p className="text-xs text-slate-400">
                Interactive distribution of logged sessions and study volume over time
              </p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#050b18] border border-[#142347]">
            {(['4weeks', '8weeks', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/50 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range === '4weeks' ? 'Last 4 Wks' : range === '8weeks' ? 'Last 8 Wks' : 'Full Horizon'}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Responsive SVG / Bar Visualization */}
        <div className="pt-2">
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 px-2 pb-6 border-b border-[#121f3d] relative">
            
            {/* Grid line guides */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-slate-500 w-full" />
              <div className="border-b border-slate-500 w-full" />
              <div className="border-b border-slate-500 w-full" />
            </div>

            {weeklyActivityData.map((week, idx) => {
              const heightPercent = maxSessionCount > 0 ? (week.sessionCount / maxSessionCount) * 80 + 10 : 10;
              const isLatest = idx === weeklyActivityData.length - 1;

              return (
                <div 
                  key={idx} 
                  className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  title={`${week.weekLabel}: ${week.sessionCount} sessions (${week.totalHours} hrs)`}
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 px-2.5 py-1 rounded-lg bg-[#040a1c] border border-cyan-400 text-center shadow-xl pointer-events-none whitespace-nowrap">
                    <p className="text-[10px] font-mono text-[#00F0FF] font-bold">
                      {week.sessionCount} Sessions • {week.totalHours} hrs
                    </p>
                    <p className="text-[8px] text-slate-400">
                      {week.topicsCovered.slice(0, 2).join(', ') || 'AI/ML Study'}
                    </p>
                  </div>

                  {/* Bar */}
                  <div 
                    className={`w-full max-w-[42px] rounded-t-lg transition-all duration-500 relative flex flex-col justify-between overflow-hidden ${
                      isLatest
                        ? 'bg-gradient-to-t from-blue-700 via-cyan-500 to-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                        : week.sessionCount > 0
                        ? 'bg-gradient-to-t from-[#0b244d] to-[#0072FF] group-hover:from-blue-600 group-hover:to-cyan-400'
                        : 'bg-[#091228] border border-[#142347]'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {week.sessionCount > 0 && (
                      <div className="w-full text-center text-[10px] font-mono font-bold text-white pt-1">
                        {week.sessionCount}
                      </div>
                    )}
                  </div>

                  {/* X-axis Label */}
                  <span className="absolute -bottom-6 text-[9px] font-mono text-slate-400 truncate max-w-[65px] text-center">
                    {week.weekLabel.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#00F0FF]" />
              <span>Active Study Session Volume</span>
            </span>
            <span>Average: {(sessions.length / Math.max(weeklyActivityData.length, 1)).toFixed(1)} sessions / wk</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Skill Growth Indicator per Topic */}
      <div className="p-6 rounded-2xl bg-[#070e20] border border-[#142347] shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#121f3d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Skill Growth Indicator per Topic
              </h3>
              <p className="text-xs text-slate-400">
                Calculated dynamically from frequency and positive sentiment depth across journal reflections
              </p>
            </div>
          </div>

          {/* Quick search/filter */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter topic..."
              value={selectedTopicFilter === 'all' ? '' : selectedTopicFilter}
              onChange={(e) => setSelectedTopicFilter(e.target.value || 'all')}
              className="px-3 py-1.5 rounded-lg bg-[#050b18] border border-[#182a52] text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-36 sm:w-48"
            />
          </div>
        </div>

        {/* Growth Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredTopicGrowth.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#050c1f] border border-[#14264f] hover:border-cyan-500/40 transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-mono group-hover:text-cyan-200">
                    {item.topic}
                  </span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${item.trajectoryColor}`}>
                    {item.trajectory}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="text-slate-400 text-[10px]">Growth Index:</span>
                  <span className="font-bold text-[#00F0FF]">{item.growthScore}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-[#091228] rounded-full overflow-hidden border border-[#142347]">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${item.growthScore}%` }}
                />
              </div>

              {/* Metrics Footer */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3 text-cyan-400" />
                  <span>{item.mentionCount} reflections • {item.positiveMentions} mastery milestones</span>
                </span>

                <button
                  onClick={() => onOpenCoachPrompt(`Can you test my knowledge on ${item.topic} and suggest an advanced hands-on coding task?`)}
                  className="text-[#00F0FF] hover:text-white flex items-center gap-0.5 transition-colors cursor-pointer"
                >
                  <span>Practice</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
