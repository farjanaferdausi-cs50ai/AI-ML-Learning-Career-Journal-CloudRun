import React from 'react';
import { 
  Layers, 
  BookOpen, 
  ExternalLink, 
  GraduationCap, 
  Terminal,
  Bookmark
} from 'lucide-react';

export const ResourcesView: React.FC = () => {
  const resourceCategories = [
    {
      title: 'Foundational Textbooks & Papers',
      icon: BookOpen,
      iconColor: 'text-[#00F0FF]',
      items: [
        {
          name: 'Attention Is All You Need',
          authors: 'Vaswani et al., 2017',
          description: 'The seminal paper introducing the Transformer architecture, scaled dot-product attention, and multi-head projections.',
          type: 'Research Paper',
          tag: 'Essential',
          url: 'https://arxiv.org/abs/1706.03762'
        },
        {
          name: 'Deep Learning Book',
          authors: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
          description: 'Comprehensive theoretical foundations covering linear algebra, probability, deep feedforward networks, and regularization.',
          type: 'Textbook',
          tag: 'Theory',
          url: 'https://www.deeplearningbook.org/'
        },
        {
          name: 'FlashAttention: Fast and Memory-Efficient Exact Attention',
          authors: 'Tri Dao et al., 2022 / 2023',
          description: 'IO-aware exact attention algorithm making LLMs faster by reducing memory reads/writes between GPU HBM and SRAM.',
          type: 'Research Paper',
          tag: 'Systems',
          url: 'https://arxiv.org/abs/2205.14135'
        }
      ]
    },
    {
      title: 'Official Platform Learning Portals',
      icon: GraduationCap,
      iconColor: 'text-purple-400',
      items: [
        {
          name: 'Ostad AI/ML Masterclass Portal',
          authors: 'Ostad Bangladesh',
          description: 'Live interactive mentor sessions, code assignments, and weekly milestone submissions.',
          type: 'Curriculum',
          tag: 'Structured',
          url: 'https://ostad.app/'
        },
        {
          name: 'CodeBasics Python & ML Mastery',
          authors: 'Dhaval Patel',
          description: 'In-depth mathematical intuitions for machine learning algorithms, NumPy, Pandas, and statistics.',
          type: 'Course Library',
          tag: 'Fundamentals',
          url: 'https://codebasics.io/'
        },
        {
          name: 'Google Cloud Gen AI Academy & Vertex AI',
          authors: 'Google Cloud Skills Boost',
          description: 'Hands-on Qwiklabs on Vertex AI, Gemini API integration, and serverless Cloud Run container deployment.',
          type: 'Cloud Lab',
          tag: 'Cloud & AI',
          url: 'https://www.cloudskillsboost.google/'
        }
      ]
    },
    {
      title: 'Technical Tooling & Libraries',
      icon: Terminal,
      iconColor: 'text-emerald-400',
      items: [
        {
          name: 'PyTorch Official Documentation & Tutorials',
          authors: 'PyTorch Foundation',
          description: 'Complete API reference for torch.nn, torch.autograd, torch.cuda, and Distributed Data Parallel (DDP).',
          type: 'Documentation',
          tag: 'Framework',
          url: 'https://pytorch.org/docs/stable/index.html'
        },
        {
          name: 'Hugging Face Transformers & PEFT',
          authors: 'Hugging Face',
          description: 'State-of-the-art model hubs, LoRA/QLoRA parameter-efficient fine-tuning tools, and tokenizers.',
          type: 'Library',
          tag: 'Open-Source',
          url: 'https://huggingface.co/docs/transformers/index'
        },
        {
          name: 'Google Gen AI SDK (@google/genai)',
          authors: 'Google DeepMind',
          description: 'Unified TypeScript & Python SDK for Gemini 3.6 Flash, Gemini 3.1 Flash Lite, and Live API streaming.',
          type: 'API SDK',
          tag: 'Production',
          url: 'https://ai.google.dev/gemini-api/docs'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#091533] via-[#060e24] to-[#101b3d] border border-[#162752] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F0FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00F0FF] uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              <span>Curated Resource Library</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Essential AI/ML Engineering References &amp; Documentation
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Bookmarked academic papers, core framework references, and platform links supporting your career transition.
            </p>
          </div>

          <span className="px-3 py-1 rounded-xl bg-[#091228] border border-[#1a2d5c] text-xs font-mono text-cyan-300 flex items-center gap-1.5 self-start md:self-auto">
            <Bookmark className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>9 Verified References</span>
          </span>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {resourceCategories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div key={idx} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Icon className={`w-4 h-4 ${cat.iconColor}`} />
                <span>{cat.title}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cat.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="p-4 rounded-xl bg-[#060c1d] border border-[#132244] hover:border-[#00F0FF]/40 transition-all flex flex-col justify-between group shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-[#091430] border border-[#1a2d59] text-[10px] font-mono text-cyan-300 font-semibold">
                          {item.tag}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{item.type}</span>
                      </div>

                      <h4 className="text-xs font-bold text-white leading-tight group-hover:text-[#00F0FF] transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {item.authors}
                      </p>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#121f3d] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        ● Verified Link
                      </span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-[#00F0FF] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Access</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
