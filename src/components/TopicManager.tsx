import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  X, 
  Check, 
  AlertCircle, 
  Target,
  Layers,
  Cpu,
  Share2,
  Terminal,
  Sliders,
  Variable
} from 'lucide-react';
import type { Topic } from '../types';
import { TopicSkeleton } from './common/LoadingState';
import { EmptyState } from './common/EmptyState';
import { ErrorState } from './common/ErrorState';

interface TopicManagerProps {
  topics: Topic[];
  onToggleTopic: (topicId: string, currentActive: boolean) => void;
  onAddTopic: (name: string) => Promise<void>;
  onDeleteTopic: (topicId: string) => Promise<void>;
  isLoading?: boolean;
}

// Preset color and icon mapping for core topics
const getTopicStyling = (name: string, index: number) => {
  const lower = name.toLowerCase();

  if (lower.includes('deep learning')) {
    return {
      color: '#3b82f6',
      icon: <span className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_6px_#3b82f6]" />,
      border: 'border-blue-500/50',
      bg: 'bg-blue-950/40',
      text: 'text-blue-200'
    };
  }
  if (lower.includes('pytorch')) {
    return {
      color: '#f43f5e',
      icon: <span className="text-[10px] font-bold text-rose-400">✕</span>,
      border: 'border-rose-500/50',
      bg: 'bg-rose-950/40',
      text: 'text-rose-200'
    };
  }
  if (lower.includes('transformer')) {
    return {
      color: '#a855f7',
      icon: <Share2 className="w-3 h-3 text-purple-400" />,
      border: 'border-purple-500/50',
      bg: 'bg-purple-950/40',
      text: 'text-purple-200'
    };
  }
  if (lower.includes('llm') || lower.includes('system')) {
    return {
      color: '#10b981',
      icon: <Terminal className="w-3 h-3 text-emerald-400" />,
      border: 'border-emerald-500/50',
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-200'
    };
  }
  if (lower.includes('fine-tuning') || lower.includes('lora')) {
    return {
      color: '#f59e0b',
      icon: <Sliders className="w-3 h-3 text-amber-400" />,
      border: 'border-amber-500/50',
      bg: 'bg-amber-950/40',
      text: 'text-amber-200'
    };
  }
  if (lower.includes('math') || lower.includes('statistic')) {
    return {
      color: '#06b6d4',
      icon: <Variable className="w-3 h-3 text-cyan-400" />,
      border: 'border-cyan-500/50',
      bg: 'bg-cyan-950/40',
      text: 'text-cyan-200'
    };
  }

  // Alternating palette for custom topics
  const palettes = [
    { color: '#38bdf8', icon: <Cpu className="w-3 h-3 text-sky-400" />, border: 'border-sky-500/50', bg: 'bg-sky-950/40', text: 'text-sky-200' },
    { color: '#c084fc', icon: <Layers className="w-3 h-3 text-violet-400" />, border: 'border-violet-500/50', bg: 'bg-violet-950/40', text: 'text-violet-200' },
    { color: '#34d399', icon: <Check className="w-3 h-3 text-teal-400" />, border: 'border-teal-500/50', bg: 'bg-teal-950/40', text: 'text-teal-200' },
  ];

  return palettes[index % palettes.length];
};

export const TopicManager: React.FC<TopicManagerProps> = ({
  topics,
  onToggleTopic,
  onAddTopic,
  onDeleteTopic,
  isLoading = false
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Close add topic form on Escape key
  useEffect(() => {
    if (!isAdding) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAdding(false);
        setNewTopicName('');
        setErrorMsg('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAdding]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTopicName.trim();
    if (!trimmed) {
      setErrorMsg('Topic name cannot be empty');
      return;
    }

    if (topics.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('Topic already exists in your matrix');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      await onAddTopic(trimmed);
      setNewTopicName('');
      setIsAdding(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to add topic');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = topics.filter(t => t.isActive).length;

  return (
    <section id="topic-manager" className="w-full space-y-3 select-none">
      
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
            <Target className="w-4 h-4" />
          </div>
          <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white">
            ACTIVE STUDY FOCUS TOPICS
          </h2>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
            {activeCount} ACTIVE
          </span>
        </div>

        {/* Add Custom Topic Button */}
        <button
          id="add-custom-topic-btn"
          onClick={() => {
            setIsAdding(prev => !prev);
            if (isAdding) {
              setNewTopicName('');
              setErrorMsg('');
            }
          }}
          aria-expanded={isAdding}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer ${
            isAdding
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
              : 'bg-[#0e1633] hover:bg-[#152047] border-[#22356b] text-cyan-300 hover:text-cyan-200'
          }`}
        >
          {isAdding ? <X className="w-3.5 h-3.5 text-cyan-400" /> : <Plus className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{isAdding ? 'Close' : '+ Add Custom Topic'}</span>
        </button>
      </div>

      {/* Inline Add Topic Input Form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="p-3 rounded-xl bg-[#091024] border border-cyan-400/50 space-y-2">
          <div className="flex items-center gap-2">
            <input
              id="new-topic-input"
              type="text"
              autoFocus
              value={newTopicName}
              onChange={(e) => {
                setNewTopicName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. Reinforcement Learning, LoRA Fine-Tuning, CUDA Kernels..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-[#060a17] border border-cyan-500/30 text-xs font-mono text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              maxLength={40}
            />
            
            <button
              id="save-new-topic-btn"
              type="submit"
              disabled={submitting || !newTopicName.trim()}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs font-mono transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving...' : 'Add'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewTopicName('');
                setErrorMsg('');
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-[11px] text-red-400 font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </form>
      )}

      {/* Topic Chips Row or Skeleton / Empty State */}
      {isLoading ? (
        <TopicSkeleton count={6} />
      ) : topics.length === 0 ? (
        <EmptyState
          variant="topics"
          compact
          title="No Active Study Topics"
          description="Add machine learning and deep learning topics to focus your AI coaching dialogues."
          actionLabel="+ Add First Topic"
          onAction={() => setIsAdding(prev => !prev)}
        />
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {topics.map((topic, idx) => {
            const isActive = topic.isActive;
            const style = getTopicStyling(topic.name, idx);

            return (
              <div
                key={topic.id || `topic-${topic.name}-${idx}`}
                id={`topic-chip-${topic.id || idx}`}
                className={`group relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? `${style.bg} ${style.border} ${style.text} shadow-[0_0_12px_rgba(0,0,0,0.5)]`
                    : 'bg-[#090e1e] border-[#151f3d] text-slate-400 opacity-60 hover:opacity-100 hover:border-[#223363]'
                }`}
              >
                {/* Click to Toggle */}
                <button
                  type="button"
                  onClick={() => onToggleTopic(topic.id, isActive)}
                  className="flex items-center gap-2 text-left cursor-pointer focus:outline-none"
                >
                  {style.icon}
                  <span className="font-semibold">{topic.name}</span>
                </button>

                {/* Delete 'X' Button on Hover */}
                <button
                  type="button"
                  id={`delete-topic-${topic.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTopic(topic.id);
                  }}
                  title={`Remove topic "${topic.name}"`}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-all cursor-pointer ml-1"
                  aria-label={`Delete ${topic.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

    </section>
  );
};
