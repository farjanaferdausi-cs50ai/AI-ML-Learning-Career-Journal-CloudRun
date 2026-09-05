import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell,
  Mail,
  Sparkles, 
  Award, 
  BookOpen, 
  BookMarked,
  CheckCheck, 
  Trash2, 
  X, 
  ExternalLink, 
  BellOff,
  Clock,
  ArrowRight
} from 'lucide-react';
import type { AppNotification } from '../types';

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'AI Coach Synthesis Ready',
    description: 'Generated deep architecture notes and practical code snippets for PyTorch neural network layers.',
    category: 'ai_coach',
    timestamp: '10m ago',
    read: false,
    actionTab: 'coach',
    actionTargetId: 'ai-coach-section',
    actionLabel: 'Open AI Coach'
  },
  {
    id: 'notif-2',
    title: '14-Day Study Streak Unlocked',
    description: 'Fantastic momentum! You have completed 14 consecutive study days in your AI/ML transition.',
    category: 'milestone',
    timestamp: '2h ago',
    read: false,
    actionTab: 'roadmap',
    actionTargetId: 'roadmap-section',
    actionLabel: 'View Milestones'
  },
  {
    id: 'notif-3',
    title: 'Google Cloud Gen AI Academy Updated',
    description: 'New module on Multimodal Gemini APIs & Prompt Engineering added to your curriculum.',
    category: 'curriculum',
    timestamp: '1d ago',
    read: false,
    actionTab: 'learn',
    actionTargetId: 'curriculum-section',
    actionLabel: 'View Curriculum'
  },
  {
    id: 'notif-4',
    title: 'Journal Session Saved',
    description: 'Summary recorded for "Transformers & Self-Attention Mechanisms" in your career journal.',
    category: 'journal',
    timestamp: '2d ago',
    read: true,
    actionTab: 'home',
    actionTargetId: 'learning-timeline-section',
    actionLabel: 'View Journal'
  }
];

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string, targetId?: string) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('aiml_journal_notifications');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Save to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem('aiml_journal_notifications', JSON.stringify(notifications));
    } catch {
      // silent
    }
  }, [notifications]);

  // Click outside and ESC listener
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRef.current && !popoverRef.current.contains(target)) {
        // Also ensure not clicking the trigger button itself
        const bellBtn = document.getElementById('notifications-btn');
        if (bellBtn && bellBtn.contains(target)) return;
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.read;
    return true;
  });

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleResetSampleNotifications = () => {
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  const handleItemClick = (notif: AppNotification) => {
    handleMarkAsRead(notif.id);
    if (onNavigateTab && notif.actionTab) {
      onNavigateTab(notif.actionTab, notif.actionTargetId);
      onClose();
    } else if (notif.actionTargetId) {
      const el = document.getElementById(notif.actionTargetId);
      el?.scrollIntoView({ behavior: 'smooth' });
      onClose();
    }
  };

  if (!isOpen) return null;

  const getCategoryBadge = (category: AppNotification['category']) => {
    switch (category) {
      case 'ai_coach':
        return {
          label: 'AI Coach',
          icon: <Sparkles className="w-3 h-3 text-[#00F0FF]" />,
          bg: 'bg-[#00F0FF]/10 border-[#00F0FF]/30 text-[#00F0FF]'
        };
      case 'milestone':
        return {
          label: 'Milestone',
          icon: <Award className="w-3 h-3 text-amber-400" />,
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        };
      case 'curriculum':
        return {
          label: 'Curriculum',
          icon: <BookOpen className="w-3 h-3 text-purple-400" />,
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-300'
        };
      case 'journal':
        return {
          label: 'Journal',
          icon: <BookMarked className="w-3 h-3 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        };
      default:
        return {
          label: 'System',
          icon: <Bell className="w-3 h-3 text-blue-400" />,
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-300'
        };
    }
  };

  return (
    <div
      ref={popoverRef}
      id="notifications-popover"
      className="absolute right-0 top-full mt-2.5 w-[340px] sm:w-[400px] max-w-[calc(100vw-2rem)] rounded-2xl bg-[#070e22]/98 border border-[#1a2b54] shadow-[0_16px_48px_rgba(0,0,0,0.7),0_0_24px_rgba(0,240,255,0.15)] backdrop-blur-xl z-50 overflow-hidden text-xs font-mono select-none animate-in fade-in zoom-in-95 duration-150"
    >
      {/* 1. Header Bar */}
      <div className="p-4 border-b border-[#142347] flex items-center justify-between bg-gradient-to-r from-[#0a132c] to-[#080f24]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/25 text-[#00F0FF]">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">Email &amp; Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 border border-pink-500/40 text-pink-300">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">AI/ML transition milestones, alerts &amp; messages</p>
          </div>
        </div>

        <button
          id="close-notifications-btn"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          aria-label="Close notifications panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Filter Tabs & Quick Actions */}
      <div className="px-4 py-2 bg-[#091228]/80 border-b border-[#121f3f] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            id="filter-all-notifs"
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            id="filter-unread-notifs"
            onClick={() => setActiveFilter('unread')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              activeFilter === 'unread'
                ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-bold'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              id="mark-all-read-btn"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-[10px] text-cyan-300 hover:text-white transition-colors cursor-pointer"
              title="Mark all notifications as read"
            >
              <CheckCheck className="w-3 h-3" />
              <span>Mark all read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              id="clear-all-notifs-btn"
              onClick={handleClearAll}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Clear all notifications"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Notification List Body */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-[#101d3b] p-2 space-y-1 custom-scrollbar">
        {filteredNotifications.length === 0 ? (
          <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-[#0c1633] border border-[#182850] flex items-center justify-center text-slate-500 mb-3">
              <BellOff className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">
              {activeFilter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs mt-1 leading-relaxed">
              {activeFilter === 'unread' 
                ? "You're completely caught up with all AI/ML milestones and study summaries."
                : "New synthesis summaries and curriculum progress alerts will appear here."}
            </p>
            {notifications.length === 0 && (
              <button
                id="reset-sample-notifs-btn"
                onClick={handleResetSampleNotifications}
                className="mt-4 px-3 py-1.5 rounded-xl bg-[#091530] hover:bg-[#0f214c] border border-cyan-500/30 text-cyan-300 text-[10px] transition-all cursor-pointer"
              >
                Restore sample notifications
              </button>
            )}
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const categoryMeta = getCategoryBadge(item.category);
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`group relative p-3 rounded-xl transition-all cursor-pointer flex flex-col gap-1.5 ${
                  item.read 
                    ? 'bg-transparent hover:bg-[#0c1633]/60 text-slate-400' 
                    : 'bg-[#0b1738]/80 hover:bg-[#0e1d47] border border-[#00F0FF]/25 shadow-[0_0_12px_rgba(0,240,255,0.06)] text-slate-200'
                }`}
              >
                {/* Top row: Category Badge, Timestamp, and Unread Dot */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] border font-bold ${categoryMeta.bg}`}>
                      {categoryMeta.icon}
                      <span>{categoryMeta.label}</span>
                    </span>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_6px_#00F0FF] animate-pulse" />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{item.timestamp}</span>
                    <button
                      onClick={(e) => handleDeleteNotification(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-rose-400 hover:bg-rose-500/10 transition-all ml-1 cursor-pointer"
                      title="Dismiss notification"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className={`text-xs font-bold leading-snug ${item.read ? 'text-slate-300' : 'text-white group-hover:text-[#00F0FF] transition-colors'}`}>
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                {item.actionLabel && (
                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="inline-flex items-center gap-1 text-[#00F0FF] font-semibold group-hover:underline">
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                    {!item.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(item.id, e)}
                        className="text-[9px] text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Footer */}
      <div className="p-2.5 bg-[#050b18] border-t border-[#121f3f] text-center text-[10px] text-slate-400 flex items-center justify-between px-4">
        <span>Farjana&apos;s AI/ML Journey Stream</span>
        <span className="text-cyan-400/80">Real-time alerts</span>
      </div>
    </div>
  );
};
