import React from 'react';
import { 
  Map, 
  CheckCircle2, 
  Clock, 
  Circle, 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  Code2, 
  Cloud, 
  FolderGit2,
  BrainCircuit,
  Award
} from 'lucide-react';
import type { CareerProgressData, CareerIntelligenceData } from '../types';
import { CurriculumSkeleton } from './common/LoadingState';
import { CareerIntelligenceCard } from './CareerIntelligenceCard';

interface RoadmapViewProps {
  careerData: CareerProgressData;
  onSelectMilestonePrompt: (prompt: string) => void;
  careerIntelligence?: CareerIntelligenceData | null;
  isLoadingIntelligence?: boolean;
  onRefreshIntelligence?: () => void;
  isLoading?: boolean;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  careerData,
  onSelectMilestonePrompt,
  careerIntelligence,
  isLoadingIntelligence = false,
  onRefreshIntelligence,
  isLoading = false
}) => {
  if (isLoading) {
    return <CurriculumSkeleton />;
  }
  const roadmapStages = [
    {
      phase: 'Phase 1: Foundations',
      title: 'Mathematics, Python & Core ML Intuitions',
      status: 'Mastered',
      statusColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      progress: 100,
      description: 'Matrix calculus, vector spaces, gradient descent algorithms, loss landscapes, and Python data structures via CodeBasics.',
      milestones: [
        'Linear Algebra (SVD, Eigenvalues, Matrix Factorization)',
        'Probability, Bayes Rule & Maximum Likelihood Estimation (MLE)',
        'NumPy & Pandas Vectorized Operations for Tabular Datasets',
        'Scikit-learn Pipelines: Regression, Decision Trees, Ensemble Models'
      ],
      prompt: 'Test my mathematical intuition on how eigenvalues and eigenvectors relate to Principal Component Analysis (PCA).'
    },
    {
      phase: 'Phase 2: Deep Learning',
      title: 'Neural Networks & PyTorch Engineering',
      status: 'In Progress',
      statusColor: 'text-[#00F0FF] border-[#00F0FF]/30 bg-[#00F0FF]/10',
      progress: 85,
      description: 'Deep neural networks from scratch, backpropagation calculus, PyTorch tensor manipulation, autograd, and GPU optimization via Ostad.',
      milestones: [
        'Custom torch.nn.Module layers and forward/backward passes',
        'Optimizers: SGD with momentum, RMSprop, and AdamW weight decay',
        'Convolutional Networks (CNNs) & Residual Networks (ResNet)',
        'Custom Dataset, DataLoader, and GPU batching pipelines'
      ],
      prompt: 'Let us do a deep dive into PyTorch autograd engine: explain how computational graphs are constructed and how grad_fn works.'
    },
    {
      phase: 'Phase 3: Transformers & LLMs',
      title: 'Modern Generative AI & Attention Architectures',
      status: 'Active Focus',
      statusColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
      progress: 75,
      description: 'Scaled dot-product attention, multi-head projections, positional encodings, Hugging Face Transformers, LoRA/QLoRA fine-tuning, and RAG architectures.',
      milestones: [
        'From-scratch PyTorch Multi-Head Attention & Transformer block',
        'Rotary Positional Embeddings (RoPE) and KV-cache mechanisms',
        'Parameter-Efficient Fine-Tuning (PEFT): LoRA, QLoRA with BitsAndBytes',
        'Retrieval-Augmented Generation (RAG) with Vector Databases (Chroma/Qdrant)'
      ],
      prompt: 'Walk me through implementing KV-caching step-by-step for a causal decoder-only Transformer.'
    },
    {
      phase: 'Phase 4: Cloud MLOps & Production',
      title: 'Google Cloud Vertex AI & Serverless Deployment',
      status: 'Active Focus',
      statusColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
      progress: 70,
      description: 'Containerized inference microservices on Google Cloud Run, Vertex AI Model Garden, Secret Manager security, and CI/CD pipelines via Google Cloud Gen AI Academy.',
      milestones: [
        'Docker containerization of Gemini API and PyTorch inference servers',
        'Deploying auto-scaling stateless services to Google Cloud Run',
        'Google Cloud Secret Manager dynamic credential injection',
        'Evaluation benchmarks: latency, throughput, token efficiency, and Hallucination metrics'
      ],
      prompt: 'How do I architect a zero-downtime canary deployment on Google Cloud Run for an AI inference microservice?'
    },
    {
      phase: 'Phase 5: Career Transition & Portfolio',
      title: 'Domain Synthesis: 14+ Yrs HR Leadership to AI/ML Engineer',
      status: 'Accelerating',
      statusColor: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
      progress: 65,
      description: 'Deploying end-to-end talent intelligence systems, publishing technical case studies, and interviewing for Senior AI/ML Engineering roles.',
      milestones: [
        'Live Full-Stack AI/ML Career Transition & Technical Journal',
        'Talent & HR Algorithmic Intelligence Engine with Hybrid RAG',
        'Technical write-ups and GitHub repository open-sourcing',
        'Mock technical interviews & system design portfolio reviews'
      ],
      prompt: 'Help me refine my 60-second elevator pitch explaining my transition from 14+ years of HR leadership to AI/ML Engineering.'
    }
  ];

  return (
    <div id="roadmap-section" className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#091533] via-[#060e24] to-[#121c40] border border-[#162752] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A3FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00A3FF] uppercase tracking-wider mb-1">
              <Map className="w-4 h-4" />
              <span>Structured Career Roadmap</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              14+ Years HR Leadership → AI/ML Engineer Roadmap
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Track multi-phase progression across mathematics, deep learning, modern generative AI architectures, and cloud deployment.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#081024] p-3 rounded-xl border border-[#182a57]">
            <Award className="w-5 h-5 text-[#00F0FF]" />
            <div>
              <div className="text-xs font-bold text-white">Target Position</div>
              <div className="text-[10px] font-mono text-cyan-300">AI/ML Engineer</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Career Intelligence Engine */}
      <CareerIntelligenceCard 
        careerData={careerIntelligence || null}
        loading={isLoadingIntelligence}
        onRefresh={onRefreshIntelligence || (() => {})}
        onDiscussProjectWithCoach={onSelectMilestonePrompt}
      />

      {/* Roadmap Phase Timeline */}
      <div className="space-y-4">
        {roadmapStages.map((stage, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-[#070e20] border border-[#142347] hover:border-[#00F0FF]/40 transition-all shadow-lg space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  {stage.phase}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {stage.title}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-semibold ${stage.statusColor}`}>
                  {stage.status}
                </span>
                <span className="text-xs font-mono font-bold text-[#00F0FF]">{stage.progress}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-[#091124] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0072FF] to-[#00F0FF] rounded-full transition-all duration-500"
                style={{ width: `${stage.progress}%` }}
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {stage.description}
            </p>

            {/* Milestones Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-[#121f3d]">
              {stage.milestones.map((m, mIdx) => (
                <div key={mIdx} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                  <span>{m}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-3 border-t border-[#121f3d] flex justify-end">
              <button
                onClick={() => onSelectMilestonePrompt(stage.prompt)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0072FF]/20 hover:bg-[#0072FF]/40 border border-[#0072FF]/50 text-xs font-mono font-semibold text-[#00F0FF] hover:text-white transition-all cursor-pointer shadow-[0_0_10px_rgba(0,114,255,0.2)]"
              >
                <span>Practice Milestone with Coach</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
