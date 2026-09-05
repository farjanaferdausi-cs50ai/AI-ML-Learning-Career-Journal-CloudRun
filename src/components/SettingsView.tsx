import React from 'react';
import { 
  Settings, 
  Sliders, 
  Key, 
  Cpu, 
  ShieldCheck, 
  Database, 
  Trash2, 
  Sparkles, 
  RefreshCw,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  X
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { GenerationConfig } from '../types';
import type { ToastNotification } from './common/SuccessFeedback';
import { NotificationSettingsCard } from './NotificationSettingsCard';

interface SettingsViewProps {
  currentUser: User | null;
  generationConfig: GenerationConfig;
  onUpdateConfig: (config: GenerationConfig) => void;
  onOpenAuthModal: () => void;
  onOpenSignOutModal: () => void;
  onClearLocalHistory: () => void;
  onShowToast?: (toast: Omit<ToastNotification, 'id'>) => void;
  onClose?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  generationConfig,
  onUpdateConfig,
  onOpenAuthModal,
  onOpenSignOutModal,
  onClearLocalHistory,
  onShowToast,
  onClose
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#091533] via-[#060e24] to-[#121c40] border border-[#162752] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A3FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00A3FF] uppercase tracking-wider mb-1">
              <Settings className="w-4 h-4" />
              <span>System & Model Configuration</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Application Settings & AI Hyperparameters
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Customize model temperature, reasoning thinking depth, Firestore persistence modes, and external notification alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-[#091228] border border-[#1a2d5c] text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Security Rules Active</span>
            </span>

            {onClose && (
              <button
                id="close-settings-view-btn"
                onClick={onClose}
                className="p-2 rounded-xl bg-[#091228] hover:bg-[#152347] border border-[#1a2d5c] hover:border-cyan-400/50 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono"
                aria-label="Close Settings and return to Dashboard"
                title="Close Settings (Esc)"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* External Notifications Card */}
      <NotificationSettingsCard 
        currentUser={currentUser}
        onShowToast={onShowToast}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Hyperparameters Card */}
        <div className="p-6 rounded-2xl bg-[#070e20] border border-[#142347] shadow-lg space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#121f3d]">
            <Sliders className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="text-sm font-bold text-white">AI Coach Generation Hyperparameters</h3>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Temperature (Creativity vs. Determinism)</span>
              <span className="text-[#00F0FF] font-bold">{generationConfig.temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.5"
              step="0.05"
              value={generationConfig.temperature}
              onChange={(e) => onUpdateConfig({ ...generationConfig, temperature: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-[#0e1633] rounded-lg appearance-none cursor-pointer accent-[#00F0FF]"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0.0 (Strict Code & Math)</span>
              <span>0.7 (Default)</span>
              <span>1.5 (Creative Strategy)</span>
            </div>
          </div>

          {/* Top-P */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Top-P (Nucleus Sampling)</span>
              <span className="text-[#00F0FF] font-bold">{generationConfig.topP}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={generationConfig.topP}
              onChange={(e) => onUpdateConfig({ ...generationConfig, topP: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-[#0e1633] rounded-lg appearance-none cursor-pointer accent-[#00F0FF]"
            />
          </div>

          {/* Thinking Level */}
          <div className="space-y-2">
            <label className="block text-xs font-mono text-slate-300">
              Thinking Level (Deep Reasoning Ladder)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => onUpdateConfig({ ...generationConfig, thinkingLevel: level })}
                  className={`py-2 rounded-xl border text-xs font-mono capitalize transition-all cursor-pointer ${
                    generationConfig.thinkingLevel === level
                      ? 'bg-[#0072FF]/20 border-[#00F0FF] text-[#00F0FF] font-bold shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                      : 'bg-[#091124] border-[#182647] text-slate-400 hover:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Model Status */}
          <div className="p-3 rounded-xl bg-[#0a1229] border border-[#162752] text-xs font-mono text-slate-300 space-y-1">
            <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>Resilient Model Fallback Ladder</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Primary: <span className="text-cyan-300">gemini-3.6-flash</span> → <span className="text-slate-400">gemini-3.1-flash-lite</span> → <span className="text-slate-400">gemini-3.7-flash</span>
            </div>
          </div>
        </div>

        {/* Account & Data Management Card */}
        <div className="p-6 rounded-2xl bg-[#070e20] border border-[#142347] shadow-lg space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#121f3d]">
            <Database className="w-4 h-4 text-[#00A3FF]" />
            <h3 className="text-sm font-bold text-white">Account & Cloud Firestore Persistence</h3>
          </div>

          {/* User Status */}
          <div className="p-4 rounded-xl bg-[#091124] border border-[#182647] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Authentication State</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                currentUser ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {currentUser ? 'Firebase Authenticated' : 'Guest Mode (Local State)'}
              </span>
            </div>

            {currentUser ? (
              <div className="pt-2 border-t border-[#121f3d] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{currentUser.displayName}</div>
                  <div className="text-[11px] font-mono text-slate-400">{currentUser.email}</div>
                </div>
                <button
                  onClick={onOpenSignOutModal}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#121f3d] flex items-center justify-between">
                <span className="text-xs text-slate-300">Sign in to sync your reflections across devices.</span>
                <button
                  onClick={onOpenAuthModal}
                  className="px-3 py-1.5 rounded-lg bg-[#0072FF]/20 hover:bg-[#0072FF]/40 border border-[#0072FF]/50 text-[#00F0FF] text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>

          {/* Database Specs */}
          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="flex items-center justify-between py-1.5 border-b border-[#121f3d]">
              <span className="text-slate-400">Database ID</span>
              <span className="text-slate-200">ai-studio-ac80d254</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#121f3d]">
              <span className="text-slate-400">Security Model</span>
              <span className="text-emerald-400">Owner-Bound Isolated Paths</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#121f3d]">
              <span className="text-slate-400">API Proxy Security</span>
              <span className="text-emerald-400">Server-Side Secret Manager</span>
            </div>
          </div>

          {/* Reset Action */}
          <div className="pt-2">
            <button
              onClick={onClearLocalHistory}
              className="w-full py-2 px-3 rounded-xl bg-[#140e24] hover:bg-[#201338] border border-purple-500/30 text-purple-300 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Active Dialogue & Refresh Workspace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
