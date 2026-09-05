import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Award, 
  Trash2, 
  Save, 
  BookmarkCheck, 
  X, 
  ArrowRight 
} from 'lucide-react';

export type SuccessType = 
  | 'save'
  | 'update'
  | 'delete'
  | 'goal_complete'
  | 'journal_create'
  | 'custom';

export interface ToastNotification {
  id: string;
  type: SuccessType;
  title: string;
  message?: string;
  durationMs?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextType {
  toasts: ToastNotification[];
  showToast: (toast: Omit<ToastNotification, 'id'>) => string;
  dismissToast: (id: string) => void;
  notifySave: (item: string, details?: string) => void;
  notifyUpdate: (item: string, details?: string) => void;
  notifyDelete: (item: string) => void;
  notifyGoalComplete: (goalTitle: string, reward?: string) => void;
  notifyJournalCreated: (topicTitle: string, onView?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastNotification = { ...toast, id };
    
    setToasts(prev => [newToast, ...prev.slice(0, 4)]);

    const duration = toast.durationMs ?? 4500;
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }

    return id;
  }, [dismissToast]);

  const notifySave = useCallback((item: string, details?: string) => {
    showToast({
      type: 'save',
      title: 'Saved Successfully',
      message: details || `Your changes to ${item} have been securely synced.`
    });
  }, [showToast]);

  const notifyUpdate = useCallback((item: string, details?: string) => {
    showToast({
      type: 'update',
      title: 'Updated Successfully',
      message: details || `${item} has been refreshed with your new settings.`
    });
  }, [showToast]);

  const notifyDelete = useCallback((item: string) => {
    showToast({
      type: 'delete',
      title: 'Deleted Successfully',
      message: `${item} was removed from your active workspace.`
    });
  }, [showToast]);

  const notifyGoalComplete = useCallback((goalTitle: string, reward?: string) => {
    showToast({
      type: 'goal_complete',
      title: 'Milestone Completed! 🎯',
      message: reward || `Great work! You achieved: "${goalTitle}". Momentum logged to your career analytics.`,
      durationMs: 6000
    });
  }, [showToast]);

  const notifyJournalCreated = useCallback((topicTitle: string, onView?: () => void) => {
    showToast({
      type: 'journal_create',
      title: 'Reflection Journal Created ✍️',
      message: `Synthesized new deep reflection entry for "${topicTitle}".`,
      actionLabel: onView ? 'View Entry' : undefined,
      onAction: onView,
      durationMs: 5500
    });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{
      toasts,
      showToast,
      dismissToast,
      notifySave,
      notifyUpdate,
      notifyDelete,
      notifyGoalComplete,
      notifyJournalCreated
    }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

// Toast Container View (Fixed in bottom-right / top-right of the screen)
export const ToastContainer: React.FC<{
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

// Single Toast Notification Item
const ToastItem: React.FC<{
  toast: ToastNotification;
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = toast.durationMs ?? 4500;
    if (duration <= 0) return;

    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [toast.durationMs]);

  const getToastStyle = () => {
    switch (toast.type) {
      case 'save':
        return {
          icon: <Save className="w-4 h-4 text-emerald-300" />,
          border: 'border-emerald-500/50',
          bg: 'bg-[#061814]/95',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
          progressBar: 'bg-emerald-400'
        };
      case 'journal_create':
        return {
          icon: <BookmarkCheck className="w-4 h-4 text-cyan-300" />,
          border: 'border-cyan-500/50',
          bg: 'bg-[#061524]/95',
          glow: 'shadow-[0_0_20px_rgba(0,240,255,0.25)]',
          progressBar: 'bg-cyan-400'
        };
      case 'goal_complete':
        return {
          icon: <Award className="w-4 h-4 text-amber-300" />,
          border: 'border-amber-500/50',
          bg: 'bg-[#1c1404]/95',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
          progressBar: 'bg-amber-400'
        };
      case 'delete':
        return {
          icon: <Trash2 className="w-4 h-4 text-rose-300" />,
          border: 'border-rose-500/50',
          bg: 'bg-[#1a080c]/95',
          glow: 'shadow-[0_0_20px_rgba(244,63,94,0.25)]',
          progressBar: 'bg-rose-400'
        };
      case 'update':
      default:
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-cyan-300" />,
          border: 'border-cyan-500/50',
          bg: 'bg-[#070e24]/95',
          glow: 'shadow-[0_0_20px_rgba(0,240,255,0.2)]',
          progressBar: 'bg-cyan-400'
        };
    }
  };

  const style = getToastStyle();

  return (
    <div 
      className={`pointer-events-auto p-3.5 sm:p-4 rounded-xl border backdrop-blur-md transition-all duration-200 ease-out animate-in slide-in-from-right-4 fade-in ${style.bg} ${style.border} ${style.glow} text-slate-100 flex flex-col gap-2 relative overflow-hidden`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded-lg bg-white/10 shrink-0 mt-0.5">
            {style.icon}
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide font-mono flex items-center gap-1.5">
              {toast.title}
            </div>
            {toast.message && (
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {toast.onAction && toast.actionLabel && (
        <div className="pt-1 flex justify-end">
          <button
            onClick={() => {
              toast.onAction?.();
              onDismiss();
            }}
            className="flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>{toast.actionLabel}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Auto-dismiss progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden">
        <div 
          className={`h-full ${style.progressBar} transition-all duration-100 linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Inline Success Banner
export const SuccessBanner: React.FC<{
  title: string;
  message?: string;
  onDismiss?: () => void;
  className?: string;
}> = ({ title, message, onDismiss, className = '' }) => {
  return (
    <div className={`p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-100 flex items-center justify-between gap-3 shadow-md ${className}`}>
      <div className="flex items-center gap-2.5">
        <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold font-mono text-emerald-200">{title}</div>
          {message && <div className="text-[11px] text-emerald-300/90">{message}</div>}
        </div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 text-emerald-400 hover:text-emerald-100 rounded transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
