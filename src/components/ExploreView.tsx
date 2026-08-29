import React from 'react';
import { 
  Compass, 
  Search, 
  Sparkles, 
  ExternalLink, 
  BookOpen, 
  Cpu, 
  Network, 
  BrainCircuit, 
  Flame,
  ArrowRight
} from 'lucide-react';
import type { Topic } from '../types';

interface ExploreViewProps {
  topics: Topic[];
  onSelectTopicPrompt: (prompt: string) => void;
  onAddTopic: (name: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  topics,
  onSelectTopicPrompt,
  onAddTopic
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const exploreDomains = [
    {
      category: 'deep-learning',
      title: 'Deep Learning & PyTorch',
      badge: 'Core ML',
      badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      description: 'Backpropagation, PyTorch tensors, autograd engine, loss functions, optimizers (AdamW, SGD), and custom dataset Loaders.',
      prompt: 'Can you walk me through writing a custom PyTorch training loop with mixed-precision (torch.cuda.amp) and gradient clipping?',
      tags: ['PyTorch', 'Autograd', 'CUDA', 'Optimization']
    },
    {
      category: 'transformers',
      title: 'Transformers & Multi-Head Attention',
      badge: 'Architecture',
      badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
      description: 'Self-attention math, scaled dot-product, positional embeddings (RoPE, ALiBi), KV-cache, and FlashAttention speedups.',
      prompt: 'Explain the mathematical difference between standard Scaled Dot-Product Attention and FlashAttention v2 with kernel fusion.',
      tags: ['Attention', 'RoPE', 'KV-Cache', 'FlashAttention']
    },
    {
      category: 'llm-systems',
      title: 'LLM Systems, Fine-Tuning & RAG',
      badge: 'Gen AI',
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      description: 'LoRA, QLoRA parameter-efficient fine tuning, RLHF, DPO, Vector embeddings, chunking strategies, and hybrid semantic retrieval.',
      prompt: 'Explain step-by-step how to set up QLoRA with Hugging Face PEFT and BitsAndBytes for fine-tuning on a single GPU.',
      tags: ['LoRA', 'QLoRA', 'RAG', 'Vector Search']
    },
    {
      category: 'cloud-deploy',
      title: 'Google Cloud & Vertex AI Deployment',
      badge: 'Cloud Engineering',
      badgeColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
      description: 'Deploying serverless Gen AI APIs with Google Cloud Run, Vertex AI Model Garden endpoints, Docker containers, and Secret Manager.',
      prompt: 'How do I build and deploy an Express + Gemini API TypeScript service on Google Cloud Run with Secret Manager authentication?',
      tags: ['Vertex AI', 'Cloud Run', 'GCP', 'Docker']
    },
    {
      category: 'math-foundations',
      title: 'Mathematics & Statistical Modeling',
      badge: 'Theory',
      badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      description: 'Linear Algebra (SVD, Eigenvalues), Multivariate Calculus (Jacobians, Hessians), Probability Distributions, and Bayes Theorem.',
      prompt: 'Break down the mathematical proof of why we divide by sqrt(d_k) in Scaled Dot-Product Attention to prevent vanishing gradients.',
      tags: ['Linear Algebra', 'Calculus', 'Probability', 'Bayes']
    },
    {
      category: 'career-strategy',
      title: 'HR to AI/ML Career Transition Insights',
      badge: 'Career Strategy',
      badgeColor: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
      description: 'Translating 14+ years of organizational talent management, human behavior modeling, and workforce optimization into algorithmic modeling.',
      prompt: 'How can I frame 14+ years of HR leadership as a competitive advantage when applying for AI/ML Engineering roles?',
      tags: ['HR to AI', 'Portfolio', 'Resume', 'Transition']
    }
  ];

  const filteredDomains = exploreDomains.filter(domain => {
    const matchesCategory = selectedCategory === 'all' || domain.category === selectedCategory;
    const matchesSearch = domain.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      domain.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      domain.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0a1532] via-[#071026] to-[#0d1c44] border border-[#162752] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F0FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00F0FF] uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              <span>Explore AI/ML Knowledge Base</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Curated AI/ML Study Domains & Deep-Dives
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Explore foundational pillars and advanced paradigms. Click any domain to launch an interactive learning dialogue with your AI/ML Coach.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, math, models..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#091124] border border-[#1b2b52] text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00F0FF] transition-all w-52 sm:w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Domain Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDomains.map((domain, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-[#070e20] border border-[#142347] hover:border-[#00F0FF]/50 transition-all flex flex-col justify-between group shadow-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold ${domain.badgeColor}`}>
                  {domain.badge}
                </span>
                <span className="text-[10px] font-mono text-slate-500">Domain {i + 1}</span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-[#00F0FF] transition-colors flex items-center gap-1.5">
                {domain.title}
              </h3>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {domain.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mt-3.5">
                {domain.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-[#0b1633] border border-[#1a2d59] text-[10px] font-mono text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#121f3d] flex items-center justify-between">
              <button
                onClick={() => onAddTopic(domain.tags[0])}
                className="text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                + Track Topic
              </button>

              <button
                onClick={() => onSelectTopicPrompt(domain.prompt)}
                className="flex items-center gap-1 text-xs font-mono font-semibold text-[#00F0FF] hover:text-white transition-colors cursor-pointer"
              >
                <span>Study with Coach</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
