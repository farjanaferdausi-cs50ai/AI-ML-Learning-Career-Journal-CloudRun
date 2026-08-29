import React from 'react';
import { Sparkles, BrainCircuit, ShieldCheck, ArrowRight, Layers, LogIn, X } from 'lucide-react';
import { Orb3D } from './Orb3D';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => Promise<void>;
  isAuthenticating: boolean;
  error?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onGoogleSignIn,
  isAuthenticating,
  error
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel-glow rounded-3xl p-6 sm:p-8 border border-cyan-400/50 shadow-[0_0_60px_rgba(0,243,255,0.3)] text-center overflow-hidden">
        
        {/* Background glow flares */}
        <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-cyan-500/20 filter blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-violet-600/20 filter blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Central Orb */}
        <Orb3D size="sm" isThinking={isAuthenticating} />

        {/* Header */}
        <div className="mt-2 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-[11px] font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI/ML Career Command Center</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            AI/ML Learning & Career Journal
          </h2>
          <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
            Welcome to Farjana Ferdausi&apos;s personal command center for tracking the transformative journey from 14+ years in HR to AI/ML engineering.
          </p>
        </div>

        {/* Journey Badge */}
        <div className="my-5 p-3 rounded-2xl bg-[#060c1d] border border-cyan-500/20 text-left text-xs space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
            <span>Career Transition Track</span>
            <span className="text-emerald-400 font-semibold">Active Matrix</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-slate-200 text-xs">
            <span className="text-amber-400">14+ Years in HR</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[#00f3ff]">AI/ML Engineer</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Concurrent Studies: Ostad • CodeBasics • Google Cloud Gen AI Academy • CodeAlpha
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono">
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <div className="space-y-3">
          <button
            id="google-signin-btn"
            onClick={onGoogleSignIn}
            disabled={isAuthenticating}
            className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.01] cursor-pointer disabled:opacity-50"
          >
            {/* Google G SVG */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>{isAuthenticating ? 'Connecting via Firebase...' : 'Continue with Google Account'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-slate-400 hover:text-cyan-300 text-xs font-mono transition-colors"
          >
            Explore Journal in Guest Mode
          </button>
        </div>

        {/* Security Footer */}
        <div className="mt-5 pt-3 border-t border-cyan-500/15 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Firebase Auth • User Data Isolated via Firestore Rules</span>
        </div>

      </div>
    </div>
  );
};
