import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu,
  Home, 
  List, 
  Settings, 
  User as UserIcon,
  X,
  BookOpen, 
  Bot, 
  FolderGit2, 
  BookText, 
  Award,
  Activity, 
  Compass, 
  Map, 
  BrainCircuit,
  ShieldCheck,
  Sliders,
  LogOut,
  LogIn
} from 'lucide-react';
import type { UserRole } from '../types';
import type { User } from 'firebase/auth';

interface SidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onOpenUpgradeModal?: () => void;
  userRole?: UserRole;
  user?: User | null;
  onOpenSignOutModal?: () => void;
  onOpenAuthModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'home',
  onSelectTab,
  userRole = 'user',
  user = null,
  onOpenSignOutModal,
  onOpenAuthModal
}) => {
  // 1. Boolean toggle states for Hamburger menu, Settings panel, and Profile panel
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Refs for outside click detection
  const settingsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close opened menus/panels on Escape key & outside clicks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setIsSettingsOpen(false);
        setIsProfileOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      // Settings flyout outside click
      if (settingsRef.current && !settingsRef.current.contains(target)) {
        const btn = document.getElementById('sidebar-nav-settings');
        if (!btn?.contains(target)) {
          setIsSettingsOpen(false);
        }
      }

      // Profile flyout outside click
      if (profileRef.current && !profileRef.current.contains(target)) {
        const btn = document.getElementById('sidebar-nav-user');
        if (!btn?.contains(target)) {
          setIsProfileOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Full navigation items for expanded drawer
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'aicoach', label: 'AI Coach', icon: Bot },
    { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
    { id: 'journal', label: 'Journal', icon: BookText },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'focustopics', label: 'Focus Topics', icon: Compass },
    { id: 'goals', label: 'Goals', icon: Map },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab?.(id);
    setIsDrawerOpen(false);
    setIsSettingsOpen(false);
    setIsProfileOpen(false);
    const mainEl = document.getElementById('main-content-area');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isHomeActive = activeTab === 'home' || activeTab === 'dashboard';
  const isListActive = ['journal', 'curriculum', 'learn', 'projects', 'portfolio', 'focustopics'].includes(activeTab);
  const isSettingsActive = activeTab === 'settings';

  return (
    <>
      {/* ==================================================================== */}
      {/* THIN VERTICAL ICON-ONLY SIDEBAR ON FAR LEFT (NO TEXT LABELS)        */}
      {/* Elevated to z-[60] so hamburger & all icons stay interactive on top  */}
      {/* ==================================================================== */}
      <aside 
        className="w-full min-w-[54px] h-full min-h-screen bg-[#0B0F19] border-r border-[#1E293B]/80 flex flex-col justify-between items-center py-4 select-none shrink-0 relative z-[60] transition-all"
        aria-label="Navigation Sidebar"
      >
        {/* Top Section: Hamburger + Core Nav Icons */}
        <div className="flex flex-col items-center gap-5 w-full">
          
          {/* Hamburger Menu Icon at Top (☰ / ✕ Toggle) */}
          <button
            id="sidebar-hamburger-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsDrawerOpen(prev => !prev);
              setIsSettingsOpen(false);
              setIsProfileOpen(false);
            }}
            aria-expanded={isDrawerOpen}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 shadow-sm ${
              isDrawerOpen
                ? 'bg-[#00F0FF]/20 border border-[#00F0FF] text-[#00F0FF] shadow-[0_0_14px_rgba(0,240,255,0.4)]'
                : 'bg-[#131826]/80 hover:bg-[#1E293B] border border-[#1E293B] hover:border-cyan-400/40 text-slate-300 hover:text-[#00F0FF]'
            }`}
            aria-label={isDrawerOpen ? "Close navigation menu" : "Open navigation menu"}
            title={isDrawerOpen ? "Close All Views (Esc)" : "Toggle All Views"}
          >
            {isDrawerOpen ? (
              <X className="w-5 h-5 text-cyan-300 transition-transform duration-200 rotate-90" />
            ) : (
              <Menu className="w-5 h-5 transition-transform duration-200" />
            )}
          </button>

          {/* Divider */}
          <div className="w-8 h-[1px] bg-[#1E293B]/80" />

          {/* Icon 1: Home (Soft blue highlight on active Home icon) */}
          <button
            id="sidebar-nav-home"
            onClick={() => handleNavClick('dashboard')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 relative group ${
              isHomeActive
                ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/50 shadow-[0_0_14px_rgba(0,240,255,0.35)]'
                : 'text-slate-400 hover:text-white hover:bg-[#131826] border border-transparent hover:border-slate-800'
            }`}
            aria-label="Dashboard"
            title="Dashboard"
          >
            <Home className="w-5 h-5" />
            {isHomeActive && (
              <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
            )}
          </button>

          {/* Icon 2: List */}
          <button
            id="sidebar-nav-list"
            onClick={() => handleNavClick('journal')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 relative group ${
              isListActive
                ? 'bg-purple-500/15 text-purple-300 border border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-[#131826] border border-transparent hover:border-slate-800'
            }`}
            aria-label="Learning Journal & Lists"
            title="Journal & Activities"
          >
            <List className="w-5 h-5" />
            {isListActive && (
              <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-purple-400 shadow-[0_0_8px_#c084fc]" />
            )}
          </button>

          {/* Icon 3: Settings (Gear ⚙️) - Toggles Settings Flyout Panel */}
          <div className="relative">
            <button
              id="sidebar-nav-settings"
              onClick={(e) => {
                e.stopPropagation();
                setIsSettingsOpen(prev => !prev);
                setIsProfileOpen(false);
                setIsDrawerOpen(false);
              }}
              aria-expanded={isSettingsOpen}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 relative group ${
                isSettingsOpen || isSettingsActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_14px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-[#131826] border border-transparent hover:border-slate-800'
              }`}
              aria-label="Settings"
              title="Settings & Configuration"
            >
              <Settings className={`w-5 h-5 transition-transform duration-200 ${isSettingsOpen ? 'rotate-90 text-cyan-300' : ''}`} />
              {(isSettingsOpen || isSettingsActive) && (
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-cyan-400 shadow-[0_0_8px_#00F0FF]" />
              )}
            </button>

            {/* Quick Settings Flyout Panel */}
            {isSettingsOpen && (
              <div
                ref={settingsRef}
                id="sidebar-settings-popover"
                className="fixed top-24 left-[58px] lg:left-[68px] z-50 w-80 max-w-[calc(100vw-5rem)] rounded-2xl bg-[#0B0F19]/98 border border-[#1E293B] shadow-[0_16px_48px_rgba(0,0,0,0.8),0_0_24px_rgba(0,240,255,0.18)] p-4 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 text-xs font-mono select-none"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-3">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <div className="p-1 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF]">
                      <Settings className="w-4 h-4" />
                    </div>
                    <span>Settings &amp; Config</span>
                  </div>
                  <button
                    id="close-sidebar-settings-btn"
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                    aria-label="Close Settings panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body Details */}
                <div className="space-y-3 mb-4 text-slate-300">
                  <div className="p-2.5 rounded-xl bg-[#131826] border border-[#1E293B] space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">AI Model:</span>
                      <span className="text-cyan-300 font-bold">Gemini 3.6 Flash</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Fallback Ladder:</span>
                      <span className="text-emerald-400">Active (3-Tier)</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Persistence:</span>
                      <span className="text-slate-200">Cloud Firestore</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[10px]">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    <span>Owner-bound Firestore rules active</span>
                  </div>
                </div>

                {/* Action button to open full page */}
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    handleNavClick('settings');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/40 text-[#00F0FF] text-xs font-bold transition-all cursor-pointer group"
                >
                  <span>Open Full Settings Page</span>
                  <Sliders className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Section: Circular User Profile Icon (Initials "FF") */}
        <div className="flex flex-col items-center gap-3 w-full relative">
          <button
            id="sidebar-nav-user"
            onClick={(e) => {
              e.stopPropagation();
              setIsProfileOpen(prev => !prev);
              setIsSettingsOpen(false);
              setIsDrawerOpen(false);
            }}
            aria-expanded={isProfileOpen}
            className={`w-10 h-10 rounded-full p-[1.5px] transition-all cursor-pointer active:scale-95 ${
              isProfileOpen
                ? 'bg-gradient-to-tr from-[#00F0FF] via-purple-500 to-pink-500 ring-2 ring-[#00F0FF] shadow-[0_0_16px_rgba(0,240,255,0.45)] scale-105'
                : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.3)] hover:scale-105'
            }`}
            aria-label="User Profile"
            title="Farjana Ferdausi - Mastery Level 4"
          >
            <div className="w-full h-full rounded-full bg-[#0B0F19] flex items-center justify-center text-white font-mono text-xs font-bold hover:bg-transparent transition-colors">
              FF
            </div>
          </button>

          {/* Profile Flyout Menu */}
          {isProfileOpen && (
            <div
              ref={profileRef}
              id="sidebar-profile-popover"
              className="fixed bottom-4 left-[58px] lg:left-[68px] z-50 w-72 max-w-[calc(100vw-5rem)] rounded-2xl bg-[#0B0F19]/98 border border-[#1E293B] shadow-[0_16px_48px_rgba(0,0,0,0.8),0_0_24px_rgba(0,240,255,0.18)] p-4 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 text-xs font-mono select-none"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-[#1E293B] mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-[#00F0FF] flex items-center justify-center text-white text-[11px] font-bold font-mono shadow-[0_0_8px_rgba(0,240,255,0.3)] shrink-0">
                    FF
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white leading-tight">Farjana Ferdausi</div>
                    <div className="text-[10px] text-[#00F0FF] leading-tight">Mastery Level 4</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                      {user?.email || 'farjana.rafi1983@gmail.com'}
                    </div>
                  </div>
                </div>
                <button
                  id="close-sidebar-profile-btn"
                  onClick={() => setIsProfileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                  aria-label="Close Profile panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Menu Links */}
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleNavClick('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#131826] transition-all cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Profile &amp; Settings</span>
                </button>

                {userRole === 'admin' && (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleNavClick('admin');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Dashboard</span>
                  </button>
                )}

                {user ? (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onOpenSignOutModal?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onOpenAuthModal?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#00F0FF] hover:bg-cyan-500/10 transition-all cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </aside>

      {/* ==================================================================== */}
      {/* EXPANDED FLYOUT DRAWER (Opened via Hamburger Menu)                  */}
      {/* ==================================================================== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            id="sidebar-drawer-backdrop"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Content - Positioned next to the left rail */}
          <div 
            id="sidebar-drawer-content"
            className="fixed top-0 bottom-0 left-[54px] lg:left-[64px] w-72 max-w-[calc(100vw-4.5rem)] bg-[#0B0F19] border-r border-[#1E293B] shadow-2xl p-5 flex flex-col justify-between z-50 animate-in slide-in-from-left duration-200"
          >
            
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#1E293B] mb-4">
                <button
                  type="button"
                  onClick={() => handleNavClick('home')}
                  className="flex items-center gap-2.5 text-left cursor-pointer group rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                  aria-label="Return to Home Dashboard"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1E293B] to-[#131826] border border-[#00F0FF]/60 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.3)] group-hover:border-[#00F0FF] transition-all">
                    <BrainCircuit className="w-4.5 h-4.5 text-[#00F0FF]" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white tracking-tight leading-tight group-hover:text-cyan-300 transition-colors">
                      AI/ML Learning Journal
                    </h2>
                    <p className="text-[10px] text-[#00F0FF] font-mono">
                      Farjana Ferdausi
                    </p>
                  </div>
                </button>

                <button
                  id="close-sidebar-drawer-btn"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-[#131826] border border-[#1E293B] text-slate-400 hover:text-white cursor-pointer transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {allNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id || (item.id === 'dashboard' && activeTab === 'home');
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#131826] text-[#00F0FF] font-semibold border border-[#00F0FF]/60 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                          : 'text-slate-400 hover:text-white hover:bg-[#131826]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#00F0FF]' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Info */}
            <div className="pt-4 border-t border-[#1E293B] text-[10px] font-mono text-slate-500">
              <div className="text-slate-300 font-bold mb-0.5">Farjana Ferdausi</div>
              <div>Mastery Level 4 • AI/ML Engineer</div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
