import React, { useEffect } from 'react';
import { 
  Home, 
  Map, 
  BookOpen, 
  Compass, 
  Bot, 
  BarChart2, 
  Activity,
  Target,
  TrendingUp,
  FolderGit2, 
  BookText, 
  Layers, 
  Users, 
  Settings, 
  Sparkles, 
  BrainCircuit,
  ArrowRight,
  Quote,
  X,
  ShieldCheck
} from 'lucide-react';
import type { UserRole } from '../types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenUpgradeModal?: () => void;
  userRole?: UserRole;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onOpenUpgradeModal,
  userRole = 'user'
}) => {
  const baseNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'analytics', label: 'Advanced Analytics', icon: Activity },
    { id: 'planner', label: 'Smart Study Planner', icon: Target },
    { id: 'roadmap', label: 'Roadmap', icon: Map },
    { id: 'coach', label: 'AI Coach', icon: Bot },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'progress', label: 'Progress & Competency', icon: BarChart2 },
    { id: 'trends', label: 'Trends & Insights', icon: TrendingUp },
    { id: 'portfolio', label: 'Portfolio', icon: FolderGit2 },
    { id: 'journal', label: 'Learning Journal', icon: BookText },
    { id: 'resources', label: 'Resource Library', icon: Layers },
    { id: 'community', label: 'Community Hub', icon: Users },
    { id: 'settings', label: 'System & Config', icon: Settings },
  ];

  const navItems = userRole === 'admin'
    ? [...baseNavItems, { id: 'admin', label: 'Admin Command Center', icon: ShieldCheck }]
    : baseNavItems;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-[#050b18] border-r border-[#142347] flex flex-col justify-between h-full z-10 overflow-y-auto shadow-2xl animate-in slide-in-from-left duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-[#121c33] flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleItemClick('home')}
            className="flex items-center gap-2.5 text-left cursor-pointer group rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00A3FF]"
            aria-label="Return to Home Dashboard"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0c244d] to-[#041026] border border-[#00A3FF]/50 flex items-center justify-center shadow-[0_0_12px_rgba(0,163,255,0.25)] group-hover:border-[#00A3FF] transition-all">
              <BrainCircuit className="w-4 h-4 text-[#00A3FF] drop-shadow-[0_0_8px_#00A3FF]" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-tight leading-tight group-hover:text-cyan-300 transition-colors">
                AI/ML Journal
              </h2>
              <p className="text-[9px] text-[#00A3FF] font-mono leading-tight">
                Navigation Menu
              </p>
            </div>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#091124] text-slate-400 hover:text-white border border-[#182647] cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="p-3 flex-1 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ease-out group relative cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#00A3FF] focus-visible:outline-none ${
                  isActive
                    ? 'bg-[#00A3FF]/15 text-[#00A3FF] font-semibold border-r-2 border-[#00A3FF] translate-x-0.5'
                    : 'text-slate-300 hover:text-white hover:bg-[#0c162e] hover:translate-x-0.5'
                }`}
              >
                <Icon 
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    isActive ? 'text-[#00A3FF] drop-shadow-[0_0_8px_#00A3FF] scale-105' : 'text-slate-400 group-hover:text-slate-200'
                  }`} 
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Card */}
        <div className="p-3.5 border-t border-[#121c33] bg-[#030712] space-y-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#18113d] via-[#101535] to-[#0a1e3a] border border-[#00A3FF]/30 relative overflow-hidden">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
              <span className="text-[#00F0FF]">Upgrade to Pro</span>
              <Sparkles className="w-3 h-3 text-purple-400" />
            </div>
            <p className="text-[10px] text-slate-300 mb-2 leading-relaxed">
              Unlock advanced AI tools &amp; mentor guidance.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenUpgradeModal?.();
              }}
              className="w-full py-1.5 px-2 rounded-lg bg-gradient-to-r from-purple-600 to-[#00A3FF] text-white font-semibold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View Settings</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="text-[9px] font-mono text-slate-400 text-center">
            © 2026 AI/ML Learning Journal
          </div>
        </div>

      </div>
    </div>
  );
};
