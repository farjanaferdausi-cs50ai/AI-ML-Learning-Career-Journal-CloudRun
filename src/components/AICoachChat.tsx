import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  Bot, 
  User as UserIcon, 
  AlertCircle, 
  Sliders, 
  BrainCircuit,
  FileText,
  HelpCircle,
  FolderGit2,
  Compass,
  ArrowRight,
  Star,
  MessageSquare,
  X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DynamicAIBrain } from './DynamicAIBrain';
import { playSendSound } from '../utils/sound';
import { AICoachLoading } from './common/LoadingState';
import { ErrorState } from './common/ErrorState';
import type { ChatMessage, Topic, GenerationConfig } from '../types';

export interface AICoachChatProps {
  conversation: ChatMessage[];
  activeTopics: Topic[];
  isGenerating: boolean;
  isSummarizing: boolean;
  onSendMessage: (text: string) => Promise<void>;
  onCompleteSession: () => Promise<void>;
  onResetConversation: () => void;
  generationConfig?: GenerationConfig;
  onUpdateConfig?: (config: GenerationConfig) => void;
  error?: string | null;
}

const QUICK_ACTIONS = [
  {
    id: 'hr-analogy',
    title: 'HR-to-AI/ML Analogy',
    desc: 'Explain complex AI/ML concepts with real-world scenarios.',
    prompt: 'Explain how Transformer Self-Attention works using an intuitive analogy to corporate talent allocation and cross-functional HR routing.',
    icon: FileText,
    color: '#22d3ee',
    bg: 'bg-cyan-950/30',
    border: 'border-cyan-500/30'
  },
  {
    id: 'ostad-pytorch',
    title: 'Ostad-e-PyTorch Check-in',
    desc: 'Track progress & clear your doubts.',
    prompt: "I'm practicing PyTorch model training today. Can we review the backpropagation step and how loss gradients guide weight updates?",
    icon: HelpCircle,
    color: '#a855f7',
    bg: 'bg-purple-950/30',
    border: 'border-purple-500/30'
  },
  {
    id: 'code-portfolio',
    title: 'Code/Alpha Portfolio',
    desc: 'Build real projects with expert guidance.',
    prompt: 'Help me design an end-to-end NLP project architecture with Gemini and Cloud Run for my CodeAlpha practical portfolio.',
    icon: FolderGit2,
    color: '#10b981',
    bg: 'bg-emerald-950/30',
    border: 'border-emerald-500/30'
  },
  {
    id: 'career-strategy',
    title: 'Career Transition Strategy',
    desc: 'Get personalized roadmap & career insights.',
    prompt: 'What are the 3 strongest strategic advantages my 14+ years of HR experience give me when interviewing for AI/ML Engineer roles?',
    icon: Compass,
    color: '#f59e0b',
    bg: 'bg-amber-950/30',
    border: 'border-amber-500/30'
  }
];

export const AICoachChat: React.FC<AICoachChatProps> = ({
  conversation,
  activeTopics,
  isGenerating,
  isSummarizing,
  onSendMessage,
  onCompleteSession,
  onResetConversation,
  generationConfig = { 
    temperature: 0.7, 
    topP: 0.95, 
    topK: 40, 
    candidateCount: 1,
    thinkingLevel: 'medium' 
  },
  onUpdateConfig,
  error
}) => {
  const [inputText, setInputText] = useState('');
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [tempConfig, setTempConfig] = useState<GenerationConfig>({
    temperature: generationConfig.temperature ?? 0.7,
    topP: generationConfig.topP ?? 0.95,
    topK: generationConfig.topK ?? 40,
    candidateCount: generationConfig.candidateCount ?? 1,
    thinkingLevel: generationConfig.thinkingLevel ?? 'medium'
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Close Config Drawer on Escape
  useEffect(() => {
    if (!showConfigDrawer) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowConfigDrawer(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showConfigDrawer]);

  // Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isGenerating]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isGenerating || isSummarizing) return;

    playSendSound();
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await onSendMessage(trimmed);
  };

  const activeTopicNames = activeTopics.filter(t => t.isActive).map(t => t.name);

  return (
    <div 
      id="ai-coach-section" 
      className="w-full h-full min-h-full rounded-2xl bg-[#131826] border border-[#1E293B] overflow-hidden flex flex-col shadow-2xl relative"
    >
      
      {/* 1. Header Row */}
      <div className="p-4 sm:p-5 bg-[#0E1424] border-b border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
        
        {/* Left: Bot Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-0.5 flex items-center justify-center shadow-[0_0_12px_rgba(79,142,247,0.35)]">
            <div className="w-full h-full bg-[#131826] rounded-[10px] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-[#00F0FF]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                AI/ML Career &amp; Technical Coach
              </h2>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                BETA 1.0
              </span>
            </div>
            
            <p className="text-[10px] text-[#94A3B8] font-medium flex items-center gap-1.5 mt-0.5">
              <span>Personalized AI Guidance for</span>
              <span className="text-[#00F0FF] font-semibold flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-[#00F0FF] text-[#00F0FF]" /> Farjana
              </span>
              <span>•</span>
              <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                ★ 4.8/5
              </span>
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Config Hyperparameters Button */}
          <button
            id="toggle-hyperparams-btn"
            onClick={() => setShowConfigDrawer(prev => !prev)}
            aria-expanded={showConfigDrawer}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-200 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:outline-none cursor-pointer ${
              showConfigDrawer 
                ? 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]' 
                : 'bg-[#1A1F2E] text-[#CBD5E1] hover:text-white border-[#1E293B] hover:bg-[#252D3F] hover:border-cyan-500/40'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Config</span>
          </button>

          {conversation.length > 0 && (
            <>
              <button
                id="reset-chat-btn"
                onClick={onResetConversation}
                disabled={isGenerating || isSummarizing}
                title="Reset Dialogue"
                className="p-1.5 rounded-lg bg-[#1A1F2E] text-[#94A3B8] hover:text-white border border-[#1E293B] hover:border-slate-500 transition-all duration-200 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none cursor-pointer disabled:opacity-40"
              >
                <RotateCcw className="w-4 h-4 transition-transform duration-200 hover:-rotate-45" />
              </button>

              <button
                id="complete-session-btn"
                onClick={onCompleteSession}
                disabled={isGenerating || isSummarizing || conversation.length < 2}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs font-mono shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none cursor-pointer disabled:opacity-40"
              >
                {isSummarizing ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete Session</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

      </div>

      {/* 2. Hyperparameters Drawer */}
      {showConfigDrawer && (
        <div className="px-5 py-3 bg-[#0E1424] border-b border-[#1E293B] text-xs font-mono animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#00F0FF] font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Gemini 3.7 Flash Reasoning Configuration</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#94A3B8]">gemini-3.7-flash • thinking_level: &quot;medium&quot;</span>
              <button
                type="button"
                onClick={() => setShowConfigDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close configuration drawer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#CBD5E1]">thinking_level</span>
                <span className="text-[#00F0FF] font-bold">{tempConfig.thinkingLevel || 'medium'}</span>
              </div>
              <select
                value={tempConfig.thinkingLevel || 'medium'}
                onChange={(e) => {
                  const val = e.target.value;
                  const next = { ...tempConfig, thinkingLevel: val };
                  setTempConfig(next);
                  onUpdateConfig?.(next);
                }}
                className="w-full px-2 py-1 rounded bg-[#131826] border border-[#1E293B] text-cyan-200 text-xs focus:outline-none"
              >
                <option value="minimal">minimal</option>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#CBD5E1]">temperature</span>
                <span className="text-[#00F0FF] font-bold">{tempConfig.temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.0"
                step="0.05"
                value={tempConfig.temperature}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const next = { ...tempConfig, temperature: val };
                  setTempConfig(next);
                  onUpdateConfig?.(next);
                }}
                className="w-full h-1.5 bg-[#1E293B] rounded appearance-none cursor-pointer accent-cyan-400 mt-2"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#CBD5E1]">top_p</span>
                <span className="text-[#00F0FF] font-bold">{tempConfig.topP}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.01"
                value={tempConfig.topP}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const next = { ...tempConfig, topP: val };
                  setTempConfig(next);
                  onUpdateConfig?.(next);
                }}
                className="w-full h-1.5 bg-[#1E293B] rounded appearance-none cursor-pointer accent-cyan-400 mt-2"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#CBD5E1]">top_k</span>
                <span className="text-[#00F0FF] font-bold">{tempConfig.topK}</span>
              </div>
              <input
                type="number"
                min="1"
                max="100"
                value={tempConfig.topK}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 40;
                  const next = { ...tempConfig, topK: val };
                  setTempConfig(next);
                  onUpdateConfig?.(next);
                }}
                className="w-full px-2 py-1 rounded bg-[#131826] border border-[#1E293B] text-cyan-200 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#CBD5E1]">candidate_count</span>
                <span className="text-[#00F0FF] font-bold">{tempConfig.candidateCount}</span>
              </div>
              <input
                type="number"
                min="1"
                max="4"
                value={tempConfig.candidateCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 1;
                  const next = { ...tempConfig, candidateCount: val };
                  setTempConfig(next);
                  onUpdateConfig?.(next);
                }}
                className="w-full px-2 py-1 rounded bg-[#131826] border border-[#1E293B] text-cyan-200 text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Active Context Row */}
      {activeTopicNames.length > 0 && (
        <div className="px-5 py-2 bg-[#0E1424] border-b border-[#1E293B] flex items-center gap-2 overflow-x-auto select-none">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] tracking-wider shrink-0 font-bold">
            ACTIVE CONTEXT:
          </span>
          <div className="flex items-center gap-2 flex-nowrap">
            {Array.from(new Set(activeTopicNames)).map((name, idx) => (
              <span 
                key={`active-context-${name}-${idx}`} 
                className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-[#1A1F2E] border border-[#1E293B] text-[#00F0FF] whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4. Main Content Area */}
      <div className="p-5 flex-1 overflow-y-auto">
        
        {/* If no conversation yet -> Show Reference Image Layout with Dynamic Animated Brain */}
        {conversation.length === 0 ? (
          <div className="space-y-4">
            
            {/* Dynamic Animated Brain Centerpiece */}
            <div className="flex flex-col items-center justify-center py-2 relative">
              <DynamicAIBrain 
                size="md" 
                showEnergyWaves={true}
                showOrbits={true}
                showParticles={true}
                statusText="AI/ML Coach Online"
              />
            </div>

            {/* Coach Speech Bubble Greeting matching Reference Image */}
            <div className="flex items-start gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-700 border border-violet-400/50 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                <Bot className="w-4 h-4 text-violet-100" />
              </div>

              <div className="max-w-[90%] rounded-2xl rounded-tl-xs p-4 bg-[#1A1F2E] border border-[#1E293B] text-[#F1F5F9] shadow-md">
                <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-white/10 text-[10px] font-mono">
                  <span className="text-purple-300 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>Coach AI</span>
                  </span>
                  <span className="text-[#94A3B8] font-mono">09:30 AM</span>
                </div>

                <p className="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed font-normal">
                  Good morning, Farjana! 🚀 Ready for today&apos;s learning adventure?
                </p>
              </div>
            </div>

            {/* 4 Quick Prompt Suggestion Chips (2x2 Grid) matching Reference Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {[
                { label: 'Explain Transformers', prompt: 'Explain the Transformer architecture step-by-step with attention mechanisms and real-world analogies.' },
                { label: 'Help with PyTorch', prompt: 'Help me understand and write PyTorch tensors, autograd, and custom neural network training loops.' },
                { label: 'Suggest Next Topic', prompt: 'Based on my current active topics (Deep Learning, PyTorch, Transformers), what should I study next in my AI/ML roadmap?' },
                { label: 'Review My Progress', prompt: 'Review my career transition progress from HR to AI/ML Engineering and highlight my key milestones.' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    playSendSound();
                    onSendMessage(item.prompt);
                  }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-[#1A1F2E] hover:bg-[#252D3F] border border-[#1E293B] hover:border-[#00F0FF]/50 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:outline-none text-xs text-[#CBD5E1] hover:text-[#00F0FF] cursor-pointer shadow-sm group"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#00F0FF] group-hover:scale-110 transition-transform duration-200 shrink-0" />
                  <span className="font-medium truncate">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Action Cards (HR-to-AI/ML Analogy, Check-in, Portfolio, Strategy) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#1E293B]">
              {QUICK_ACTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      playSendSound();
                      onSendMessage(item.prompt);
                    }}
                    className="p-3 rounded-xl bg-[#1A1F2E] hover:bg-[#252D3F] border border-[#1E293B] hover:border-cyan-400/50 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none group cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="p-1 rounded-md transition-transform duration-200 group-hover:scale-110"
                        style={{ backgroundColor: `${item.color}20`, color: item.color }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#00F0FF] transition-colors duration-150">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] group-hover:text-[#CBD5E1] leading-relaxed transition-colors duration-150">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Active Conversation Stream */
          <div className="space-y-4 max-w-4xl mx-auto py-2">
            {conversation.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-700 border border-violet-400/50 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-violet-100" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed transition-all shadow-md ${
                      isUser
                        ? 'bg-[#0C2A54] border border-[#00F0FF]/50 text-white rounded-tr-xs'
                        : 'bg-[#1A1F2E] border border-[#1E293B] text-[#F1F5F9] rounded-tl-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-white/10 text-[10px] font-mono">
                      <span className={isUser ? 'text-[#00F0FF] font-semibold' : 'text-purple-300 font-semibold flex items-center gap-1'}>
                        {!isUser && <Sparkles className="w-3 h-3 text-purple-400" />}
                        {isUser ? 'Farjana' : 'AI/ML Coach'}
                      </span>
                      <span className="text-[#94A3B8]">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    {isUser ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <div className="markdown-content prose prose-invert max-w-none text-xs sm:text-sm space-y-2">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 border border-cyan-400/50 flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon className="w-4 h-4 text-cyan-100" />
                    </div>
                  )}
                </div>
              );
            })}

            {isGenerating && (
              <AICoachLoading message="AI/ML Coach is reasoning..." />
            )}

            {isSummarizing && (
              <AICoachLoading message="Synthesizing session takeaways into your learning journal..." />
            )}

            {error && (
              <ErrorState
                type={error.toLowerCase().includes('network') ? 'network' : 'ai_gemini'}
                inline
                title="AI Coach Notice"
                message={error}
                retryLabel="Retry Message"
                onRetry={() => {
                  if (conversation.length > 0 && conversation[conversation.length - 1].role === 'user') {
                    onSendMessage(conversation[conversation.length - 1].content);
                  }
                }}
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

      </div>

      {/* 5. Chat Input Bar */}
      <div className="p-4 bg-[#0E1424] border-t border-[#1E293B]">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          
          <div className="flex-1 relative rounded-xl bg-[#0B0F19] border border-[#1E293B] focus-within:border-[#00F0FF] transition-all">
            <textarea
              ref={textareaRef}
              id="coach-chat-input"
              rows={1}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isGenerating || isSummarizing}
              placeholder="Ask your AI/ML Coach anything..."
              className="w-full px-4 py-3 bg-transparent text-[#F1F5F9] placeholder-[#64748B] text-xs sm:text-sm resize-none focus:outline-none max-h-36 font-normal leading-relaxed"
            />
            <div className="px-4 pb-1.5 flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
              <span>Press Enter to send • Shift+Enter for new line</span>
              <span className="text-[#00F0FF]/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Gemini 3.6 Flash
              </span>
            </div>
          </div>

          <button
            id="send-message-btn"
            type="submit"
            disabled={!inputText.trim() || isGenerating || isSummarizing}
            className="w-11 h-11 rounded-full bg-gradient-to-r from-[#0072FF] to-[#00F0FF] hover:from-[#005cd6] hover:to-[#00d4e0] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 text-white flex items-center justify-center shadow-[0_0_16px_rgba(0,114,255,0.5)] hover:shadow-[0_0_20px_rgba(0,240,255,0.7)] transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:outline-none cursor-pointer shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 text-white drop-shadow-[0_0_4px_rgba(0,0,0,0.5)] transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>

        </form>
      </div>

    </div>
  );
};
