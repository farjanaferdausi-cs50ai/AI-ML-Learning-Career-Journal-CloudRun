import React, { useState } from 'react';
import { 
  FolderGit2, 
  ExternalLink, 
  Github, 
  Layers, 
  Sparkles, 
  Cpu, 
  Code2, 
  CheckCircle2, 
  ArrowUpRight,
  Database,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DashboardCardsSkeleton } from './common/LoadingState';
import { EmptyState } from './common/EmptyState';

import type { ProjectItem } from '../types';

interface PortfolioViewProps {
  projects?: ProjectItem[];
  onDiscussProjectPrompt: (prompt: string) => void;
  onUpdateProjectStatus?: (projectId: string, status: string, color?: string) => void;
  isLoading?: boolean;
}

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'ai-ml-journal',
    userId: 'default',
    title: 'AI/ML Career Transition & Technical Journal',
    role: 'Full-Stack AI Engineering',
    status: 'Live & Active',
    statusColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    description: 'End-to-end full-stack career transition journal integrating Google Gemini API with fallback ladders, Firebase Authentication, Cloud Firestore real-time state persistence, and responsive glassmorphism UI.',
    stack: ['TypeScript', 'React 18', 'Tailwind CSS', 'Node.js/Express', 'Gemini API', 'Firestore', 'Cloud Run'],
    achievements: [
      'Multi-model fallback ladder across Gemini 3.6 Flash and Gemini 3.1 Flash Lite with exponential backoff',
      'Owner-bound Firestore document isolation and real-time reflection persistence',
      'High-density dashboard with SVG circuit illustrations and interactive prompt matrix'
    ],
    prompt: 'Can you help me formulate bullet points for my AI/ML Career Transition Journal project on my resume and GitHub README?',
    updatedAt: Date.now()
  },
  {
    id: 'rag-talent-intelligence',
    userId: 'default',
    title: 'Talent & HR Algorithmic Intelligence Engine',
    role: 'RAG & Hybrid Search',
    status: 'In Development',
    statusColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    description: 'Bridging 14+ years of HR talent management into computational vector retrieval. Converts job architecture, competency matrices, and employee retention factors into dense embeddings for semantic skill matching.',
    stack: ['PyTorch', 'Hugging Face', 'Qdrant / ChromaDB', 'LangChain', 'FastAPI', 'Docker'],
    achievements: [
      'Custom domain chunking preserving hierarchical organizational job families',
      'Hybrid BM25 + dense cosine similarity retrieval pipeline for multi-competency scoring',
      'HR policy compliance safeguards preventing gender and demographic bias'
    ],
    prompt: 'Help me architect the retrieval pipeline for the Talent Intelligence Engine using hybrid dense-sparse vector search.',
    updatedAt: Date.now()
  },
  {
    id: 'pytorch-attention-from-scratch',
    userId: 'default',
    title: 'PyTorch Multi-Head Attention & Transformer From Scratch',
    role: 'Core Deep Learning',
    status: 'Completed',
    statusColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    description: 'Clean from-scratch implementation of the Transformer architecture following Vaswani et al. Scaled dot-product attention, multi-head projection layers, layer normalization, and autoregressive causal masking.',
    stack: ['Python', 'PyTorch', 'NumPy', 'Matplotlib', 'Weights & Biases'],
    achievements: [
      'Explicit tensor dimensional transformations [B, T, C] -> [B, NH, T, HS]',
      'Rotary Positional Embeddings (RoPE) and causal triangular attention masking',
      'Trained character-level Shakespeare language model achieving low cross-entropy validation loss'
    ],
    prompt: 'Explain how to write a unit test suite verifying that causal masking in my PyTorch Multi-Head Attention block never leaks future tokens.',
    updatedAt: Date.now()
  },
  {
    id: 'gcp-vertex-deployer',
    userId: 'default',
    title: 'GCP Vertex AI & Cloud Run Serverless Inference Pipeline',
    role: 'MLOps & Cloud',
    status: 'Completed',
    statusColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    description: 'Automated CI/CD deployment blueprint packaging containerized Gen AI microservices to Google Cloud Run with Secret Manager and IAM least-privilege service accounts.',
    stack: ['Google Cloud Run', 'Vertex AI', 'Docker', 'Secret Manager', 'Google Cloud IAM', 'GitHub Actions'],
    achievements: [
      'Sub-second container cold-starts using optimized alpine base images',
      'Zero hardcoded API secrets with dynamic Secret Manager mounting',
      'Automated health checks, structured logging, and concurrency scaling up to 80 req/instance'
    ],
    prompt: 'What are the top MLOps interview questions regarding Cloud Run deployment, latency optimization, and Secret Manager access?',
    updatedAt: Date.now()
  }
];

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  projects: propProjects,
  onDiscussProjectPrompt,
  onUpdateProjectStatus,
  isLoading = false
}) => {
  const projects = (propProjects && propProjects.length > 0) ? propProjects : DEFAULT_PROJECTS;
  const [expandedSpecs, setExpandedSpecs] = useState<Record<string, boolean>>({});

  const toggleSpecs = (id: string) => {
    setExpandedSpecs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-[#081026] border border-[#142347]">
          <DashboardCardsSkeleton count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d1633] via-[#081024] to-[#121c3b] border border-[#162752] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A3FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00A3FF] uppercase tracking-wider mb-1">
              <FolderGit2 className="w-4 h-4" />
              <span>Farjana Ferdausi — AI/ML Portfolio</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Real-World AI/ML Engineering Projects
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Practical, production-grade applications demonstrating deep learning architectures, cloud deployment, and domain-bridging talent intelligence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-[#091228] border border-[#1a2d5c] text-xs font-mono text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>4 Production Assets</span>
            </span>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((project) => (
          <div
            key={project.id}
            className="p-6 rounded-2xl bg-[#070e20] border border-[#142347] hover:border-[#00F0FF]/40 transition-all flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-semibold ${project.statusColor}`}>
                  {project.status}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{project.role}</span>
              </div>

              <h3 className="text-base font-bold text-white tracking-tight">
                {project.title}
              </h3>

              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                {project.description}
              </p>

              {/* Achievements / Key Highlights */}
              <div className="mt-4 space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Key Technical Deliverables:</div>
                {project.achievements.map((ach, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00F0FF] shrink-0 mt-0.5" />
                    <span>{ach}</span>
                  </div>
                ))}
              </div>

              {/* Stack Tags */}
              <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-[#121f3d]">
                {project.stack.map((item) => (
                  <span
                    key={item}
                    className="px-2 py-0.5 rounded bg-[#0b1633] border border-[#1a2d59] text-[10px] font-mono text-slate-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Expanded Specs Section */}
            {expandedSpecs[project.id] && (
              <div className="mt-3 p-3 rounded-xl bg-[#070e22] border border-cyan-500/20 text-xs font-mono space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-[11px] text-[#00F0FF] font-bold">
                  <span>Architecture &amp; Specs</span>
                  <span className="text-[10px] text-slate-400">Project #{project.id}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                  <div className="p-2 rounded-lg bg-[#0b1633] border border-[#162750]">
                    <div className="text-slate-400">Target Latency:</div>
                    <div className="font-bold text-cyan-300">&lt; 180ms p95</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0b1633] border border-[#162750]">
                    <div className="text-slate-400">Deployment Target:</div>
                    <div className="font-bold text-indigo-300">Google Cloud Run</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 mt-5 border-t border-[#121f3d] flex items-center justify-between">
              <button
                onClick={() => toggleSpecs(project.id)}
                className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <span>Specs &amp; Architecture</span>
                {expandedSpecs[project.id] ? (
                  <ChevronUp className="w-3.5 h-3.5 text-cyan-300" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={() => onDiscussProjectPrompt(project.prompt)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0072FF]/20 hover:bg-[#0072FF]/40 border border-[#0072FF]/50 text-xs font-mono font-semibold text-[#00F0FF] hover:text-white transition-all cursor-pointer shadow-[0_0_12px_rgba(0,114,255,0.3)]"
              >
                <span>Discuss with Coach</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
