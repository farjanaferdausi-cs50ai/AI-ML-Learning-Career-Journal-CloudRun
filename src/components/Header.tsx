import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  LogOut, 
  ShieldCheck, 
  User as UserIcon,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { NotificationPopover, INITIAL_NOTIFICATIONS } from './NotificationPopover';

interface HeaderProps {
  user: User | null;
  onOpenSignOutModal: () => void;
  onOpenAuthModal?: () => void;
  onNavigateTab?: (tab: string, targetId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  onOpenSignOutModal,
  onOpenAuthModal,
  onNavigateTab
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aiml_journal_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((n: { read: boolean }) => !n.read).length;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_NOTIFICATIONS.filter(n => !n.read).length;
  });
  const [searchVal, setSearchVal] = useState('');

  // Keep unread count in sync when popover changes or when storage event fires
  useEffect(() => {
    const updateCount = () => {
      try {
        const saved = localStorage.getItem('aiml_journal_notifications');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setUnreadCount(parsed.filter((n: { read: boolean }) => !n.read).length);
          }
        }
      } catch {
        // silent
      }
    };

    window.addEventListener('storage', updateCount);
    // Also periodic sync if popover modifies localStorage
    const interval = setInterval(updateCount, 1500);
    return () => {
      window.removeEventListener('storage', updateCount);
      clearInterval(interval);
    };
  }, []);

  const displayName = user?.displayName || 'Farjana';
  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Farjana';
  const userPhoto = user?.photoURL;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    const timeline = document.querySelector('#learning-timeline-section');
    timeline?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050b18]/90 backdrop-blur-md border-b border-[#121c33] px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between select-none">
      
      {/* 1. Left: Page Title & Subtitle */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5 leading-tight">
            <span>AI/ML Learning Journal</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-mono leading-tight">
            Learning &amp; Career Journal
          </p>
        </div>
      </div>

      {/* 2. Center: Search Bar with ⌘K Badge */}
      <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-6">
        <form onSubmit={handleSearchSubmit} className="w-full relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search anything..."
            className="w-full pl-9 pr-12 py-1.5 rounded-xl bg-[#091124] border border-[#182647] text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] focus:shadow-[0_0_12px_rgba(0,240,255,0.25)] transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#101b38] border border-[#20315a] text-[10px] font-mono text-slate-400 pointer-events-none">
            ⌘ K
          </div>
        </form>
      </div>

      {/* 3. Right: Notifications & User Profile */}
      <div className="flex items-center gap-3.5">
        
        {/* Notification Bell with Dropdown Popover */}
        <div className="relative">
          <button
            id="notifications-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
              showNotifications 
                ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_16px_rgba(0,240,255,0.3)]' 
                : 'bg-[#091124] border-[#182647] text-slate-300 hover:text-white hover:border-[#00F0FF]/50'
            }`}
            aria-label="Notifications"
            aria-haspopup="dialog"
            aria-expanded={showNotifications}
          >
            <Bell className="w-4 h-4" />
            {/* Dynamic Badge Count */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_#f43f5e] animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Interactive Notifications Popover */}
          <NotificationPopover
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            onNavigateTab={onNavigateTab}
          />
        </div>

        {/* User Profile Pill */}

        {user ? (
          <div className="relative">
            <button
              id="user-profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1 sm:pr-2.5 rounded-xl bg-[#091124] hover:bg-[#0e1a38] border border-[#182647] transition-all cursor-pointer"
            >
              {/* Circular Avatar */}
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-[#00F0FF]/60 shadow-sm"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-[#00F0FF] flex items-center justify-center text-white text-xs font-bold font-mono">
                  {firstName.charAt(0)}
                </div>
              )}

              <div className="hidden sm:block text-left">
                <div className="text-[10px] text-slate-400 leading-none">
                  Welcome back,
                </div>
                <div className="text-xs font-bold text-white flex items-center gap-1 leading-tight mt-0.5">
                  <span>{firstName}</span>
                </div>
                <div className="text-[9px] font-mono text-[#00F0FF] leading-none">
                  AI/ML Engineer
                </div>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#070e20] border border-[#182a52] shadow-2xl p-2 z-50 animate-in fade-in duration-100 text-xs font-mono">
                <div className="px-3 py-2 border-b border-[#142347] mb-1">
                  <div className="font-bold text-white">{displayName}</div>
                  <div className="text-[10px] text-[#00F0FF]">AI/ML Engineer</div>
                  <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenSignOutModal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            id="google-signin-nav-btn"
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-[#00F0FF]/30 hover:from-purple-600/50 hover:to-[#00F0FF]/50 border border-[#00F0FF]/40 text-cyan-200 text-xs font-semibold font-mono transition-all cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.2)]"
          >
            <UserIcon className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Connect Account</span>
          </button>
        )}

      </div>

    </header>
  );
};
