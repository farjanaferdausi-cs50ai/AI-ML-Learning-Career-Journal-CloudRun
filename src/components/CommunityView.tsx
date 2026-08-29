import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Sparkles, 
  Heart, 
  Share2, 
  Send, 
  CheckCircle2, 
  Globe, 
  ShieldCheck, 
  Flame,
  Check
} from 'lucide-react';
import type { User } from 'firebase/auth';

interface CommunityViewProps {
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onAskCoachFromCommunity: (prompt: string) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  currentUser,
  onOpenAuthModal,
  onAskCoachFromCommunity
}) => {
  const [newPostText, setNewPostText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [posts, setPosts] = useState([
    {
      id: 'post-1',
      author: 'Farjana Ferdausi',
      role: 'Career Switcher (14+ yrs HR -> AI/ML)',
      time: '2 hours ago',
      content: 'Just implemented Multi-Head Attention from scratch in PyTorch! The biggest breakthrough was understanding how queries, keys, and values are transformed via linear projections before computing the scaled dot-product. Connecting HR talent mapping to attention weights really solidified the intuition!',
      likes: 12,
      isLiked: false,
      replies: 4,
      tag: 'Milestone',
      coachPrompt: 'How do I optimize the PyTorch Multi-Head Attention class to support key-value caching during autoregressive decoding?'
    },
    {
      id: 'post-2',
      author: 'Tanvir Ahmed',
      role: 'Ostad AI/ML Fellow',
      time: '5 hours ago',
      content: 'For anyone preparing for the Google Cloud Gen AI Academy certification: make sure you deeply understand Vertex AI Model Garden endpoints and how to mount Secret Manager secrets securely in Cloud Run containers without baking env vars into the image.',
      likes: 8,
      isLiked: false,
      replies: 2,
      tag: 'GCP Tips',
      coachPrompt: 'What are the best practices for setting up least-privilege IAM service accounts for Cloud Run and Vertex AI?'
    },
    {
      id: 'post-3',
      author: 'Rahim Chowdhury',
      role: 'CodeBasics ML Learner',
      time: 'Yesterday',
      content: 'Reminder: When working with probability distributions in ML, pay close attention to numerical stability. Always use log-sum-exp tricks and log-softmax instead of raw softmax + log to avoid underflow with small float32 numbers.',
      likes: 19,
      isLiked: true,
      replies: 7,
      tag: 'Math & Code',
      coachPrompt: 'Can you demonstrate the mathematical proof and PyTorch implementation of the LogSumExp trick for numerical stability?'
    }
  ]);

  const handleToggleLike = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1,
          isLiked: !p.isLiked
        };
      }
      return p;
    }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost = {
      id: `post-${Date.now()}`,
      author: currentUser?.displayName || 'Farjana Ferdausi',
      role: 'AI/ML Engineer in Training',
      time: 'Just now',
      content: newPostText.trim(),
      likes: 0,
      isLiked: false,
      replies: 0,
      tag: 'Reflection',
      coachPrompt: `Discuss the following community insight with the AI Coach: "${newPostText.trim()}"`
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#091533] via-[#060e24] to-[#121c40] border border-[#162752] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A3FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00A3FF] uppercase tracking-wider mb-1">
              <Users className="w-4 h-4" />
              <span>AI/ML Transition Network & Peer Study Group</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI/ML Engineering Community Hub
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Connect with fellow engineers, Ostad cohort peers, and career switchers. Share daily study breakthroughs, PyTorch debugging tips, and project reviews.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-[#091228] border border-[#1a2d5c] text-xs font-mono text-cyan-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>Live Study Group</span>
            </span>
          </div>
        </div>
      </div>

      {/* Share / Post Card */}
      <div className="p-5 rounded-2xl bg-[#070e20] border border-[#142347] shadow-lg">
        <form onSubmit={handleCreatePost} className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Share a Study Milestone or Learning Breakthrough</span>
          </div>

          <textarea
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="What breakthrough did you achieve in PyTorch, math foundations, or your portfolio today? Share with the community..."
            rows={3}
            className="w-full p-3 rounded-xl bg-[#091124] border border-[#182647] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00F0FF] transition-all resize-none font-sans"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-slate-500">
              Posts are synchronized with your AI/ML Journal feed
            </span>

            <button
              type="submit"
              disabled={!newPostText.trim()}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#0072FF] to-[#00F0FF] hover:from-[#005cd6] hover:to-[#00d4e0] disabled:opacity-30 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,114,255,0.3)] transition-all cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Post Update</span>
            </button>
          </div>
        </form>
      </div>

      {/* Community Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-5 rounded-2xl bg-[#070e20] border border-[#142347] hover:border-[#00F0FF]/30 transition-all shadow-md space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-[#00F0FF] flex items-center justify-center text-white text-xs font-bold font-mono">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{post.author}</span>
                    <span className="px-2 py-0.5 rounded bg-[#0b1633] border border-[#1a2d59] text-[9px] font-mono text-cyan-300">
                      {post.tag}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {post.role} • {post.time}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onAskCoachFromCommunity(post.coachPrompt)}
                className="text-[11px] font-mono text-[#00F0FF] hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0a1636] border border-[#1b2f63] hover:border-[#00F0FF]/50 transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Discuss with Coach</span>
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              {post.content}
            </p>

            {/* Expanded Discussion Replies */}
            {expandedReplies[post.id] && (
              <div className="mt-2 p-3 rounded-xl bg-[#070e22] border border-[#182a52] text-xs font-mono space-y-2 animate-in fade-in duration-150">
                <div className="text-[11px] text-[#00F0FF] font-bold">Discussion Thread</div>
                <div className="text-[11px] text-slate-300 bg-[#09122c] p-2 rounded-lg border border-[#16254a]">
                  <span className="font-bold text-slate-200">Coach Gemini:</span> Excellent observation on attention weights. Cross-attention layers in Transformers follow identical mathematical mechanics, where queries originate from the decoder and key-value pairs from the encoder.
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-[#121f3d] flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleToggleLike(post.id)}
                  className={`flex items-center gap-1 transition-colors cursor-pointer ${
                    post.isLiked ? 'text-pink-400' : 'hover:text-slate-200'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-pink-400' : ''}`} />
                  <span>{post.likes}</span>
                </button>

                <button
                  onClick={() => setExpandedReplies(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                  className="flex items-center gap-1 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{post.replies} Replies</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setCopiedId(post.id);
                  setTimeout(() => setCopiedId(null), 2000);
                }}
                className="flex items-center gap-1 hover:text-cyan-300 transition-colors cursor-pointer text-[11px]"
              >
                {copiedId === post.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
