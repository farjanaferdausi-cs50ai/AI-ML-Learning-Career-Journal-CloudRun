import React from 'react';
import { 
  Home, 
  Map, 
  BookOpen, 
  Compass, 
  Bot, 
  BarChart2, 
  FolderGit2, 
  BookText, 
  Layers, 
  Users, 
  Settings, 
  Sparkles, 
  BrainCircuit,
  ArrowRight,
  Quote
} from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onOpenUpgradeModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'home',
  onSelectTab,
  onOpenUpgradeModal
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, anchor: '#top' },
    { id: 'roadmap', label: 'Roadmap', icon: Map, anchor: '#career-transition-tracker' },
    { id: 'learn', label: 'Learn', icon: BookOpen, anchor: '#curriculum-section' },
    { id: 'explore', label: 'Explore', icon: Compass, anchor: '#topic-manager' },
    { id: 'coach', label: 'Coach', icon: Bot, anchor: '#ai-coach-section' },
    { id: 'progress', label: 'Progress', icon: BarChart2, anchor: '#role-target-bar' },
    { id: 'portfolio', label: 'Portfolio', icon: FolderGit2, anchor: '#curriculum-section' },
    { id: 'journal', label: 'Journal', icon: BookText, anchor: '#learning-timeline-section' },
    { id: 'resources', label: 'Resources', icon: Layers, anchor: '#curriculum-section' },
    { id: 'community', label: 'Community', icon: Users, anchor: '#ai-coach-section' },
    { id: 'settings', label: 'Settings', icon: Settings, anchor: '#toggle-hyperparams-btn' },
  ];

  const handleNavClick = (id: string, anchor: string) => {
    onSelectTab?.(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside className="w-56 xl:w-60 bg-[#050b18] border-r border-[#121c33] flex flex-col justify-between shrink-0 min-h-screen select-none sticky top-0 h-screen overflow-y-auto">
      
      {/* Top Section */}
      <div className="p-3.5 space-y-4">
        
        {/* Brand Logo Header */}
        <div className="flex items-center gap-2.5 px-1 py-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0c244d] to-[#041026] border border-[#00A3FF]/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,163,255,0.25)]">
            <BrainCircuit className="w-5 h-5 text-[#00A3FF] drop-shadow-[0_0_8px_#00A3FF]" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-white tracking-tight leading-tight">
              AI/ML Journal
            </h1>
            <p className="text-[9px] text-[#00A3FF] font-mono leading-tight">
              Career & Study Hub
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id, item.anchor)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative cursor-pointer ${
                  isActive
                    ? 'bg-[#00A3FF]/15 text-[#00A3FF] font-semibold shadow-[inset_0_0_12px_rgba(0,163,255,0.15)] border-r border-[#00A3FF]/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c162e]'
                }`}
              >
                {/* Active Left Accent Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#00A3FF] rounded-r shadow-[0_0_10px_#00A3FF]" />
                )}

                <Icon 
                  className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-[#00A3FF] drop-shadow-[0_0_8px_#00A3FF]' : 'text-slate-400 group-hover:text-slate-200'
                  }`} 
                />
                
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

      </div>

      {/* Bottom Section (Promotional Card & Quote) */}
      <div className="p-3.5 space-y-3 border-t border-[#121c33] bg-[#030712]">
        
        {/* Upgrade to Pro Card */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#18113d] via-[#101535] to-[#0a1e3a] border border-[#00A3FF]/30 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#00A3FF]/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
            <span className="text-[#00F0FF]">Upgrade to Pro</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          </div>

          <p className="text-[10px] text-slate-300 leading-relaxed mb-2.5">
            Unlock advanced AI tools, projects & personalized guidance.
          </p>

          <button
            onClick={() => onOpenUpgradeModal?.()}
            className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-[#00A3FF] hover:from-purple-500 hover:to-[#00F0FF] text-white font-semibold text-[10px] flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(0,163,255,0.4)] transition-all cursor-pointer"
          >
            <span>Upgrade Now</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Inspirational Quote Card */}
        <div className="p-2.5 rounded-lg bg-[#070e20] border border-[#142347] text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1 text-[#00A3FF]">
            <Quote className="w-3 h-3" />
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">AI Mindset</span>
          </div>
          <p className="italic text-slate-300 leading-tight text-[10px]">
            &quot;The best way to predict your future is to create it.&quot;
          </p>
        </div>

        {/* Footer Copyright */}
        <div className="text-[9px] font-mono text-slate-400 text-center pt-0.5">
          © 2026 AI/ML Learning Journal
        </div>

      </div>

    </aside>
  );
};
