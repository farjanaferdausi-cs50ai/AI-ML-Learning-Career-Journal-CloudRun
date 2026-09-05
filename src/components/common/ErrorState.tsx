import React from 'react';
import { 
  WifiOff, 
  Database, 
  Bot, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  RotateCcw,
  ArrowRight,
  HelpCircle,
  X
} from 'lucide-react';

export type ErrorStateType = 
  | 'network'
  | 'firestore'
  | 'ai_gemini'
  | 'auth'
  | 'invalid_data'
  | 'timeout'
  | 'generic';

interface ErrorStateProps {
  type?: ErrorStateType;
  title?: string;
  message?: string;
  technicalDetails?: string;
  onRetry?: () => void;
  retryLabel?: string;
  onDismiss?: () => void;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  inline?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'generic',
  title,
  message,
  technicalDetails,
  onRetry,
  retryLabel = 'Retry',
  onDismiss,
  secondaryAction,
  inline = false,
  className = ''
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: <WifiOff className="w-5 h-5 text-amber-400" />,
          badge: 'Network Connection Issue',
          defaultTitle: 'Connection Interrupted',
          defaultMessage: 'Unable to reach cloud services. Please check your internet connection and try again.',
          badgeColor: 'bg-amber-950/60 border-amber-500/40 text-amber-300'
        };
      case 'firestore':
        return {
          icon: <Database className="w-5 h-5 text-rose-400" />,
          badge: 'Cloud Sync Notice',
          defaultTitle: 'Cloud Storage Synchronizing',
          defaultMessage: 'Could not sync with Cloud Firestore. Your changes are safely retained in your current local session.',
          badgeColor: 'bg-rose-950/60 border-rose-500/40 text-rose-300'
        };
      case 'ai_gemini':
        return {
          icon: <Bot className="w-5 h-5 text-purple-400" />,
          badge: 'AI Coach Status',
          defaultTitle: 'AI Coach Momentarily Unavailable',
          defaultMessage: 'The AI model took longer than expected to respond. You can retry with a single click.',
          badgeColor: 'bg-purple-950/60 border-purple-500/40 text-purple-300'
        };
      case 'auth':
        return {
          icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
          badge: 'Authentication Notice',
          defaultTitle: 'Sign-In Required',
          defaultMessage: 'Your authentication session expired or encountered an issue. Please sign in with Google to continue.',
          badgeColor: 'bg-red-950/60 border-red-500/40 text-red-300'
        };
      case 'timeout':
        return {
          icon: <Clock className="w-5 h-5 text-amber-400" />,
          badge: 'Request Timeout',
          defaultTitle: 'Operation Took Too Long',
          defaultMessage: 'The requested operation did not complete in time. Please verify connectivity and retry.',
          badgeColor: 'bg-amber-950/60 border-amber-500/40 text-amber-300'
        };
      case 'invalid_data':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
          badge: 'Input Format Notice',
          defaultTitle: 'Please Check Your Input',
          defaultMessage: 'Some required fields were missing or formatted incorrectly. Please review and try again.',
          badgeColor: 'bg-orange-950/60 border-orange-500/40 text-orange-300'
        };
      default:
        return {
          icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
          badge: 'System Notice',
          defaultTitle: 'Something Needs Attention',
          defaultMessage: 'An unexpected issue occurred while processing your request. Please try again.',
          badgeColor: 'bg-rose-950/60 border-rose-500/40 text-rose-300'
        };
    }
  };

  const config = getErrorConfig();
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  if (inline) {
    return (
      <div 
        className={`p-3 sm:p-3.5 rounded-xl bg-[#1a0f1b]/95 border border-rose-500/40 text-slate-200 text-xs flex items-center justify-between gap-3 shadow-lg ${className}`}
        role="alert"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-500/30 text-rose-400 shrink-0">
            {config.icon}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-rose-200 truncate">{displayTitle}</div>
            <div className="text-[11px] text-slate-300 line-clamp-1">{displayMessage}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono font-semibold text-xs transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{retryLabel}</span>
            </button>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-2xl bg-[#0e0a19] border border-rose-900/40 relative overflow-hidden shadow-xl select-none ${className}`}
      role="alert"
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-950/70 border border-rose-500/40 flex items-center justify-center mb-3 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
        {config.icon}
      </div>

      <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-semibold mb-2 ${config.badgeColor}`}>
        {config.badge}
      </span>

      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight mb-1">
        {displayTitle}
      </h3>

      <p className="text-xs text-slate-300 max-w-md leading-relaxed mb-5">
        {displayMessage}
      </p>

      {technicalDetails && (
        <details className="w-full max-w-md mb-4 text-left">
          <summary className="text-[11px] font-mono text-slate-400 hover:text-slate-200 cursor-pointer flex items-center gap-1 select-none">
            <HelpCircle className="w-3 h-3" />
            <span>Technical details</span>
          </summary>
          <div className="mt-2 p-2.5 rounded-lg bg-[#05060d] border border-slate-800 text-[10px] font-mono text-slate-400 overflow-x-auto">
            {technicalDetails}
          </div>
        </details>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-mono font-semibold text-xs shadow-[0_0_14px_rgba(244,63,94,0.3)] transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{retryLabel}</span>
          </button>
        )}

        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="px-3.5 py-2 rounded-xl bg-[#141026] hover:bg-[#1f1a38] border border-slate-700 text-slate-300 hover:text-white font-mono text-xs transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <span>{secondaryAction.label}</span>
          </button>
        )}
      </div>
    </div>
  );
};
