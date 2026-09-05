import React, { useEffect } from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSignOut: () => Promise<void>;
  isSigningOut?: boolean;
}

export const SignOutModal: React.FC<SignOutModalProps> = ({
  isOpen,
  onClose,
  onConfirmSignOut,
  isSigningOut = false
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md glass-panel-glow rounded-2xl p-6 border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <LogOut className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-base font-bold text-white mb-1.5">
          Sign Out of AI/ML Command Center?
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          Your saved study topics and historical sessions are safely synchronized to Firebase Firestore. You can sign back in at any time with your Google account.
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={isSigningOut}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirmSignOut}
            disabled={isSigningOut}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer flex items-center gap-1.5"
          >
            {isSigningOut ? 'Signing out...' : 'Confirm Sign Out'}
          </button>
        </div>

      </div>
    </div>
  );
};
