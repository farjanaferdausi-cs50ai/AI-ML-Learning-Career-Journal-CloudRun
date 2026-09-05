import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Code2, 
  BookOpen, 
  HelpCircle, 
  Compass, 
  Wrench,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Zap,
  Terminal,
  Brain,
  X
} from 'lucide-react';
import type { JournalSession } from '../types';

interface DashboardRightSidebarProps {
  onAICoachPrompt?: (prompt: string) => void;
  onNavigateTab?: (tab: string) => void;
  sessions?: JournalSession[];
}

export const DashboardRightSidebar: React.FC<DashboardRightSidebarProps> = ({
  onAICoachPrompt,
  onNavigateTab,
  sessions = []
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [showMoreToolsModal, setShowMoreToolsModal] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    if (!showMoreToolsModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMoreToolsModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showMoreToolsModal]);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    if (onAICoachPrompt) {
      onAICoachPrompt(quickInput.trim());
    }
    setQuickInput('');
  };

  const handleActionClick = (prompt: string) => {
    if (onAICoachPrompt) {
      onAICoachPrompt(prompt);
    }
  };

  // 5 Explicit Tool Buttons requested by user
  const aiTools = [
    {
      id: 'explain',
      label: 'Explain a Concept',
      desc: 'Deep-dive into architectures & math',
      icon: HelpCircle,
      iconColor: 'text-[#00F0FF] bg-cyan-500/10 border-cyan-500/30',
      prompt: 'Explain the mathematical intuition behind multi-head scaled dot-product self-attention with a step-by-step example.'
    },
    {
      id: 'debug',
      label: 'Debug My Code',
      desc: 'Trace tensor shapes & PyTorch bugs',
      icon: Code2,
      iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      prompt: 'Help me debug a PyTorch tensor dimension mismatch error during backpropagation in my custom model training loop.'
    },
    {
      id: 'resources',
      label: 'Suggest Resources',
      desc: 'Curated papers, repos & tutorials',
      icon: BookOpen,
      iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      prompt: 'Suggest the top 3 production-grade open-source GitHub repositories and papers to study Deep Learning transformer architectures.'
    },
    {
      id: 'career',
      label: 'Career Guidance',
      desc: 'Translate HR leadership to AI/ML impact',
      icon: Compass,
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      prompt: 'As a career transitioner from 14+ years in HR to AI/ML engineering, how can I best frame my systemic problem-solving and leadership skills in AI technical interviews?'
    },
    {
      id: 'more',
      label: 'More Tools',
      desc: 'Architecture review, mock interview & quiz',
      icon: Wrench,
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      isSpecial: true
    }
  ];

  const additionalTools = [
    {
      name: 'System Design Architecture Review',
      prompt: 'Review an end-to-end ML inference pipeline system design with model registry, feature store, and latency SLA of <50ms.'
    },
    {
      name: 'Generate Technical Practice Quiz',
      prompt: 'Generate a 5-question multiple choice technical quiz on PyTorch optimization and gradient descent variants.'
    },
    {
      name: 'Simulate AI/ML Interview Question',
      prompt: 'Act as a Senior AI Staff Engineer conducting a technical coding and ML system interview. Ask me the first question.'
    },
    {
      name: 'Code Refactoring & PEP-8 Review',
      prompt: 'Analyze my Python code for computational performance, memory leaks, vectorization opportunities, and PEP-8 compliance.'
    }
  ];

  return (
    <div className="space-y-4 select-none w-full">
      
      {/* ========================================================= */}
      {/* GEMINI AI ASSISTANT CARD                                 */}
      {/* ========================================================= */}
      <div 
        id="gemini-ai-assistant-widget"
        className="rounded-2xl bg-gradient-to-b from-[#0B0F19] to-[#121728] border border-[#1E293B] hover:border-cyan-500/40 p-3 xl:p-2.5 shadow-2xl relative overflow-hidden transition-all duration-200"
      >
        {/* Soft background ambient glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header & Status */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#1E293B] relative z-10">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-400/40 flex items-center justify-center text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.25)] shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-white tracking-tight flex items-center gap-1 truncate">
                <span>Gemini AI</span>
                <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
              </h2>
              <div className="flex items-center gap-1 text-[8.5px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981] shrink-0" />
                <span className="truncate">Online • Gemini 3.7</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab?.('coach')}
            className="p-1 rounded-lg bg-[#131826] hover:bg-[#1E293B] text-slate-400 hover:text-cyan-300 border border-[#1E293B] transition-all cursor-pointer shrink-0 ml-1"
            title="Open Full AI Coach"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Greeting Message Box */}
        <div className="mt-2.5 p-2 rounded-xl bg-[#131826]/90 border border-[#1E293B] relative z-10">
          <p className="text-[11px] text-slate-200 leading-snug font-sans">
            &ldquo;Ready to code, <strong className="text-white font-semibold">Farjana</strong>?&rdquo;
          </p>
        </div>

        {/* 5 Requested Tool Buttons */}
        <div className="mt-2.5 space-y-1.5 relative z-10">
          <div className="space-y-1.5">
            {aiTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    if (tool.isSpecial) {
                      setShowMoreToolsModal(prev => !prev);
                    } else if (tool.prompt) {
                      handleActionClick(tool.prompt);
                    }
                  }}
                  className="w-full p-2 rounded-xl bg-[#131826] hover:bg-[#1A2238] border border-[#1E293B] hover:border-cyan-400/40 text-left transition-all duration-150 flex items-center justify-between group cursor-pointer"
                  aria-expanded={tool.isSpecial ? showMoreToolsModal : undefined}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${tool.iconColor}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {tool.label}
                      </div>
                      <div className="text-[8.5px] text-slate-400 truncate">
                        {tool.desc}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Full-width purple pill button: "✦ Ask Gemini" */}
        <button
          onClick={() => {
            if (quickInput.trim()) {
              handleActionClick(quickInput.trim());
              setQuickInput('');
            } else {
              onNavigateTab?.('coach');
            }
          }}
          className="mt-2.5 w-full py-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[11px] tracking-wide shadow-[0_0_14px_rgba(168,85,247,0.4)] border border-purple-400/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
        >
          <span>✦ Ask Gemini</span>
        </button>

        {/* Quick Question Input Form */}
        <form onSubmit={handleQuickSubmit} className="mt-2 relative z-10">
          <div className="relative">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Ask AI/ML..."
              className="w-full pl-2.5 pr-8 py-1.5 rounded-xl bg-[#131826] border border-[#1E293B] text-[11px] font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
            />
            <button
              type="submit"
              disabled={!quickInput.trim()}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-[#00F0FF] text-slate-950 hover:bg-cyan-300 disabled:opacity-30 disabled:hover:bg-[#00F0FF] transition-all cursor-pointer disabled:cursor-not-allowed"
              title="Send question to AI Coach"
            >
              <Send className="w-2.5 h-2.5" />
            </button>
          </div>
        </form>

      </div>

      {/* ========================================================= */}
      {/* DAILY LEARNING INTELLIGENCE INSIGHT                       */}
      {/* ========================================================= */}
      <div 
        id="daily-intelligence-widget"
        className="rounded-2xl bg-[#0B0F19] border border-[#1E293B] p-3 xl:p-2.5 shadow-xl space-y-2"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-bold text-white">Daily Learning Tip</h3>
          </div>
          <span className="text-[9px] font-mono text-cyan-400 font-semibold">Active Module</span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          &ldquo;When writing PyTorch custom layers, inherit from <code className="text-cyan-300 font-mono text-[10px] bg-[#131826] px-1 py-0.5 rounded">nn.Module</code> and override <code className="text-cyan-300 font-mono text-[10px] bg-[#131826] px-1 py-0.5 rounded">forward()</code>. Autograd will compute backward passes automatically!&rdquo;
        </p>

        <button
          onClick={() => handleActionClick('Explain PyTorch autograd graph computation and how backward() works under the hood')}
          className="w-full py-1.5 rounded-xl bg-[#131826] hover:bg-[#1E293B] border border-[#1E293B] text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 cursor-pointer transition-all"
        >
          <span>Deep Dive Into Autograd</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* More Tools Modal */}
      {showMoreToolsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowMoreToolsModal(false)}
        >
          <div 
            className="w-full max-w-md rounded-2xl bg-[#0E1424] border border-[#1E293B] p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Additional AI/ML Assistant Tools</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMoreToolsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {additionalTools.map((tool, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setShowMoreToolsModal(false);
                    handleActionClick(tool.prompt);
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#131826] hover:bg-[#1E293B] border border-[#1E293B] hover:border-cyan-400/40 text-left transition-all text-xs text-slate-200 hover:text-white flex items-center justify-between group cursor-pointer"
                >
                  <span className="font-medium">{tool.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300" />
                </button>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowMoreToolsModal(false)}
                className="px-3 py-1.5 rounded-lg bg-[#131826] text-xs text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
