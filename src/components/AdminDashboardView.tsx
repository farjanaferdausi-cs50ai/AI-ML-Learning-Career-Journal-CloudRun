import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  UserCheck, 
  Activity, 
  BookOpen, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ArrowUpRight, 
  UserX, 
  Clock, 
  Calendar, 
  FileText,
  Lock,
  ChevronRight,
  Shield,
  History,
  Sparkles
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { AdminUserItem, AdminDashboardStats, AdminAuditLog, UserRole } from '../types';
import { fetchAdminStats, fetchAdminUsers, changeUserRole, fetchAdminAuditLogs } from '../lib/adminApi';
import { useToast } from './common/SuccessFeedback';

interface AdminDashboardViewProps {
  currentUser: User | null;
  userRole?: UserRole;
  onNavigateTab?: (tab: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  userRole = 'user',
  onNavigateTab
}) => {
  const { showToast } = useToast();

  // Data states
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  
  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [activeTabSection, setActiveTabSection] = useState<'users' | 'audit' | 'stats'>('users');

  // Confirmation Modal state for role change
  const [pendingChangeUser, setPendingChangeUser] = useState<AdminUserItem | null>(null);
  const [targetRoleToAssign, setTargetRoleToAssign] = useState<UserRole | null>(null);
  const [isSubmittingRoleChange, setIsSubmittingRoleChange] = useState(false);

  // Close role change confirmation modal on Escape key
  useEffect(() => {
    if (!pendingChangeUser) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPendingChangeUser(null);
        setTargetRoleToAssign(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pendingChangeUser]);

  // Load all dashboard data
  const loadDashboardData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const [statsData, usersData, logsData] = await Promise.all([
        fetchAdminStats(),
        fetchAdminUsers(),
        fetchAdminAuditLogs()
      ]);

      setStats(statsData);
      setUsers(usersData);
      setAuditLogs(logsData);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setError(err?.message || 'Failed to retrieve administrative data. Please check your credentials.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (userRole === 'admin') {
      loadDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [userRole, loadDashboardData]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Role filter
      if (roleFilter !== 'all' && user.role !== roleFilter) {
        return false;
      }
      // Search filter (name or email)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = user.displayName?.toLowerCase().includes(q);
        const matchesEmail = user.email?.toLowerCase().includes(q);
        const matchesStage = user.currentStage?.toLowerCase().includes(q);
        return Boolean(matchesName || matchesEmail || matchesStage);
      }
      return true;
    });
  }, [users, roleFilter, searchQuery]);

  // Handler to open confirmation modal
  const handleInitiateRoleChange = (user: AdminUserItem, newRole: UserRole) => {
    if (user.userId === currentUser?.uid) {
      showToast({
        title: 'Action Restricted',
        message: 'You cannot demote or alter your own active administrator session.',
        type: 'custom'
      });
      return;
    }
    setPendingChangeUser(user);
    setTargetRoleToAssign(newRole);
  };

  // Confirm and execute role change
  const handleConfirmRoleChange = async () => {
    if (!pendingChangeUser || !targetRoleToAssign) return;

    setIsSubmittingRoleChange(true);
    try {
      const result = await changeUserRole(pendingChangeUser.userId, targetRoleToAssign);

      // Optimistically update local users state
      setUsers(prev => prev.map(u => {
        if (u.userId === pendingChangeUser.userId) {
          return { ...u, role: targetRoleToAssign };
        }
        return u;
      }));

      // Refresh stats & audit logs in background
      fetchAdminStats().then(s => setStats(s)).catch(() => {});
      fetchAdminAuditLogs().then(l => setAuditLogs(l)).catch(() => {});

      showToast({
        title: 'Role Updated Successfully',
        message: `${pendingChangeUser.displayName || pendingChangeUser.email} has been ${targetRoleToAssign === 'admin' ? 'promoted to Administrator' : 'demoted to User'}.`,
        type: 'update'
      });

      setPendingChangeUser(null);
      setTargetRoleToAssign(null);
    } catch (err: any) {
      console.error('Role change error:', err);
      showToast({
        title: 'Role Update Failed',
        message: err?.message || 'Could not update user role. Check server permissions.',
        type: 'custom'
      });
    } finally {
      setIsSubmittingRoleChange(false);
    }
  };

  // Format timestamps cleanly
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '—';
    try {
      return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  const formatRelativeTime = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 5) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(timestamp);
  };

  // =========================================================================
  // ACCESS DENIED VIEW (For non-admin callers)
  // =========================================================================
  if (userRole !== 'admin') {
    return (
      <div id="admin-access-denied-view" className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
          Access Denied: Administrator Role Required
        </h2>
        
        <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          The Admin Command Center is restricted to verified system administrators. Your current account (<span className="text-cyan-400 font-mono text-xs">{currentUser?.email || 'Guest'}</span>) does not have administrator privileges.
        </p>

        <div className="flex items-center gap-3">
          <button
            id="admin-denied-return-home-btn"
            onClick={() => onNavigateTab?.('home')}
            className="px-5 py-2.5 rounded-xl bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 border border-[#00F0FF]/50 text-[#00F0FF] hover:text-white text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(0,240,255,0.2)] cursor-pointer active:scale-95"
          >
            Return to Dashboard
          </button>
          <button
            id="admin-denied-open-coach-btn"
            onClick={() => onNavigateTab?.('coach')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-mono transition-all cursor-pointer"
          >
            Open AI Coach
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ADMIN DASHBOARD MAIN INTERFACE
  // =========================================================================
  return (
    <div id="admin-dashboard-view" className="p-3 sm:p-5 lg:p-7 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & Context Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#10172A] via-[#131B30] to-[#0D1424] p-4 sm:p-6 rounded-2xl border border-[#00F0FF]/30 shadow-[0_0_25px_rgba(0,240,255,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F0FF]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/20 border border-[#00F0FF]/60 flex items-center justify-center text-[#00F0FF]">
              <ShieldCheck className="w-5 h-5 drop-shadow-[0_0_6px_#00F0FF]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Admin Command & RBAC Center
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold tracking-wider">
              VERIFIED ADMIN
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Manage user accounts, assign system roles with automated audit logs, and monitor cross-platform journal metrics.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2.5 z-10">
          <button
            id="admin-refresh-data-btn"
            onClick={() => loadDashboardData(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-mono transition-all duration-150 cursor-pointer active:scale-95 disabled:opacity-50"
            title="Refresh dashboard stats and user table"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Sync Live'}</span>
          </button>
        </div>
      </div>

      {/* Error state banner if fetching failed */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Data Load Warning:</span> {error}
          </div>
          <button
            onClick={() => loadDashboardData()}
            className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[11px] underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Users */}
        <div className="p-4 rounded-xl bg-[#131826] border border-[#1E293B] hover:border-cyan-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Total Users</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {isLoading ? '...' : (stats?.totalUsers ?? users.length)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Registered accounts
          </div>
        </div>

        {/* Active Users This Week */}
        <div className="p-4 rounded-xl bg-[#131826] border border-[#1E293B] hover:border-emerald-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Active This Week</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {isLoading ? '...' : (stats?.activeUsersThisWeek ?? 1)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Studied within last 7 days
          </div>
        </div>

        {/* Total Journal Sessions */}
        <div className="p-4 rounded-xl bg-[#131826] border border-[#1E293B] hover:border-indigo-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Total Journal Entries</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 font-mono">
            {isLoading ? '...' : (stats?.totalJournalEntries ?? 0)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Coaching & study logs
          </div>
        </div>

        {/* Role Ratio (Admins vs Users) */}
        <div className="p-4 rounded-xl bg-[#131826] border border-[#1E293B] hover:border-purple-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Role Distribution</span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white font-mono flex items-center gap-2">
            <span className="text-emerald-400">{stats?.adminCount ?? 1} Admins</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300">{stats?.userCount ?? 0} Users</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            RBAC governance
          </div>
        </div>

      </div>

      {/* Navigation Sub-Tabs: User Directory vs. Audit Trail */}
      <div className="flex items-center gap-2 border-b border-[#1E293B] pb-2">
        <button
          id="admin-tab-users"
          onClick={() => setActiveTabSection('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
            activeTabSection === 'users'
              ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Management ({filteredUsers.length})</span>
        </button>

        <button
          id="admin-tab-audit"
          onClick={() => setActiveTabSection('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
            activeTabSection === 'audit'
              ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* SECTION 1: USER MANAGEMENT DIRECTORY */}
      {activeTabSection === 'users' && (
        <div className="space-y-4">
          
          {/* Controls Bar: Search & Role Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#131826] p-3 rounded-xl border border-[#1E293B]">
            
            {/* Search bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="admin-user-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user by name, email, or career track..."
                className="w-full bg-[#0B0F19] border border-[#1E293B] focus:border-[#00F0FF] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 font-mono outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto font-mono text-xs">
              <span className="text-slate-500 text-[11px] mr-1 hidden md:inline">Filter:</span>
              <button
                id="admin-filter-all"
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  roleFilter === 'all'
                    ? 'bg-slate-700 text-white font-bold border border-slate-600'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                All ({users.length})
              </button>
              <button
                id="admin-filter-admins"
                onClick={() => setRoleFilter('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  roleFilter === 'admin'
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/50'
                    : 'bg-slate-800/60 text-slate-400 hover:text-emerald-400'
                }`}
              >
                Admins ({users.filter(u => u.role === 'admin').length})
              </button>
              <button
                id="admin-filter-users"
                onClick={() => setRoleFilter('user')}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  roleFilter === 'user'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/50'
                    : 'bg-slate-800/60 text-slate-400 hover:text-cyan-400'
                }`}
              >
                Users ({users.filter(u => u.role === 'user').length})
              </button>
            </div>

          </div>

          {/* User Table (Desktop & Tablet) */}
          <div className="hidden md:block rounded-xl border border-[#1E293B] bg-[#0F1422] overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono divide-y divide-[#1E293B]">
                <thead className="bg-[#131826] text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 font-bold">User Identity</th>
                    <th className="px-4 py-3.5 font-bold">Role</th>
                    <th className="px-4 py-3.5 font-bold">Registered</th>
                    <th className="px-4 py-3.5 font-bold">Last Active</th>
                    <th className="px-4 py-3.5 font-bold text-center">Sessions</th>
                    <th className="px-4 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                          <span>Loading user directory...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        No users found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSelf = user.userId === currentUser?.uid;
                      const isAdmin = user.role === 'admin';

                      return (
                        <tr key={user.userId} className="hover:bg-[#151B2E] transition-colors">
                          
                          {/* User Identity */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              {user.photoURL ? (
                                <img
                                  src={user.photoURL}
                                  alt={user.displayName}
                                  loading="lazy"
                                  decoding="async"
                                  width={32}
                                  height={32}
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-8 rounded-full object-cover border border-[#1E293B] shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  {user.displayName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-bold text-white truncate flex items-center gap-1.5">
                                  <span>{user.displayName || 'Unnamed User'}</span>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="px-4 py-3.5">
                            {isAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-[10px]">
                                <ShieldCheck className="w-3 h-3" />
                                <span>admin</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">
                                <UserCheck className="w-3 h-3 text-slate-400" />
                                <span>user</span>
                              </span>
                            )}
                          </td>

                          {/* Created Date */}
                          <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                            {formatDate(user.createdAt)}
                          </td>

                          {/* Last Active */}
                          <td className="px-4 py-3.5 text-slate-300 text-[11px]">
                            {formatRelativeTime(user.lastActiveAt)}
                          </td>

                          {/* Total Sessions */}
                          <td className="px-4 py-3.5 text-center font-bold text-cyan-400">
                            {user.totalSessionsCount ?? 0}
                          </td>

                          {/* Action Button */}
                          <td className="px-4 py-3.5 text-right">
                            {isSelf ? (
                              <span className="text-[10px] text-slate-500 italic">
                                Active Session
                              </span>
                            ) : isAdmin ? (
                              <button
                                id={`demote-user-btn-${user.userId}`}
                                onClick={() => handleInitiateRoleChange(user, 'user')}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 hover:text-white text-[11px] font-mono transition-all cursor-pointer active:scale-95"
                                title="Demote to standard user"
                              >
                                Demote to User
                              </button>
                            ) : (
                              <button
                                id={`promote-user-btn-${user.userId}`}
                                onClick={() => handleInitiateRoleChange(user, 'admin')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 hover:text-white text-[11px] font-mono transition-all cursor-pointer active:scale-95 shadow-sm"
                                title="Promote to administrator"
                              >
                                Promote to Admin
                              </button>
                            )}
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Cards (Mobile Responsive) */}
          <div className="block md:hidden space-y-3">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                <RefreshCw className="w-5 h-5 animate-spin text-cyan-400 mx-auto mb-2" />
                <span>Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-slate-500 font-mono text-xs bg-[#131826] rounded-xl border border-[#1E293B]">
                No users found.
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isSelf = user.userId === currentUser?.uid;
                const isAdmin = user.role === 'admin';

                return (
                  <div key={user.userId} className="p-4 rounded-xl bg-[#131826] border border-[#1E293B] space-y-3 font-mono text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            loading="lazy"
                            decoding="async"
                            width={32}
                            height={32}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-[#1E293B] shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold shrink-0">
                            {user.displayName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate flex items-center gap-1">
                            <span>{user.displayName || 'User'}</span>
                            {isSelf && (
                              <span className="px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[8px] font-bold">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                        </div>
                      </div>

                      {/* Role Badge */}
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[9px] font-bold">
                          admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[9px]">
                          user
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-2 border-t border-[#1E293B]">
                      <div>
                        <span className="text-slate-500">Joined:</span> {formatDate(user.createdAt)}
                      </div>
                      <div>
                        <span className="text-slate-500">Active:</span> {formatRelativeTime(user.lastActiveAt)}
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">Total Sessions:</span> <span className="text-cyan-400 font-bold">{user.totalSessionsCount ?? 0}</span>
                      </div>
                    </div>

                    {/* Mobile Action */}
                    {!isSelf && (
                      <div className="pt-2 border-t border-[#1E293B]">
                        {isAdmin ? (
                          <button
                            onClick={() => handleInitiateRoleChange(user, 'user')}
                            className="w-full py-2 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold cursor-pointer"
                          >
                            Demote to User
                          </button>
                        ) : (
                          <button
                            onClick={() => handleInitiateRoleChange(user, 'admin')}
                            className="w-full py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold cursor-pointer"
                          >
                            Promote to Admin
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* SECTION 2: SECURITY AUDIT TRAIL */}
      {activeTabSection === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Immutable Admin Audit Trail</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Logged to /admin_audit_log via Admin SDK
            </span>
          </div>

          <div className="rounded-xl border border-[#1E293B] bg-[#0F1422] overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono divide-y divide-[#1E293B]">
                <thead className="bg-[#131826] text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-bold">Timestamp</th>
                    <th className="px-4 py-3 font-bold">Action</th>
                    <th className="px-4 py-3 font-bold">Admin Actor</th>
                    <th className="px-4 py-3 font-bold">Target User</th>
                    <th className="px-4 py-3 font-bold">Role Mutation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No administrative audit logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => {
                      const isPromote = log.action === 'PROMOTE_TO_ADMIN';
                      const isDemote = log.action === 'DEMOTE_TO_USER';

                      return (
                        <tr key={log.id} className="hover:bg-[#151B2E] transition-colors">
                          <td className="px-4 py-3 text-slate-400 text-[11px] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-3">
                            {isPromote ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                PROMOTE_TO_ADMIN
                              </span>
                            ) : isDemote ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                                DEMOTE_TO_USER
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                                {log.action}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-300 font-bold truncate max-w-[180px]">
                            {log.adminEmail || log.adminUid}
                          </td>
                          <td className="px-4 py-3 text-cyan-400 truncate max-w-[180px]">
                            {log.targetUserEmail || log.targetUserId}
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-[11px]">
                            <span className="text-slate-500">{log.previousRole || 'user'}</span>
                            <span className="mx-1.5 text-cyan-400">→</span>
                            <span className="font-bold text-white">{log.newRole || 'admin'}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR ROLE ELEVATION / DEMOTION */}
      {pendingChangeUser && targetRoleToAssign && (
        <div 
          id="admin-role-change-modal" 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => {
            setPendingChangeUser(null);
            setTargetRoleToAssign(null);
          }}
        >
          <div 
            className="w-full max-w-md bg-[#131826] border border-[#1E293B] rounded-2xl p-6 shadow-2xl space-y-4 font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  targetRoleToAssign === 'admin' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {targetRoleToAssign === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Confirm Role Mutation
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Role-Based Access Control
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPendingChangeUser(null);
                  setTargetRoleToAssign(null);
                }}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description Body */}
            <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1E293B] text-xs text-slate-300 space-y-2">
              <p>
                Are you sure you want to change role permissions for:
              </p>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="font-bold text-white">{pendingChangeUser.displayName || 'Unnamed User'}</div>
                <div className="text-[11px] text-cyan-400">{pendingChangeUser.email}</div>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span>Current Role: <strong className="text-slate-400 uppercase">{pendingChangeUser.role}</strong></span>
                <span>Target Role: <strong className={targetRoleToAssign === 'admin' ? 'text-emerald-400 uppercase' : 'text-cyan-400 uppercase'}>{targetRoleToAssign}</strong></span>
              </div>
            </div>

            {targetRoleToAssign === 'admin' ? (
              <p className="text-[11px] text-emerald-400/90 leading-relaxed">
                Notice: Granting administrator rights allows this user to view cross-user metrics, list all accounts, and assign roles.
              </p>
            ) : (
              <p className="text-[11px] text-amber-400/90 leading-relaxed">
                Notice: Demoting this user will revoke their access to the Admin Command Center and all administrative API endpoints.
              </p>
            )}

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPendingChangeUser(null);
                  setTargetRoleToAssign(null);
                }}
                disabled={isSubmittingRoleChange}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="admin-confirm-role-btn"
                type="button"
                onClick={handleConfirmRoleChange}
                disabled={isSubmittingRoleChange}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50 ${
                  targetRoleToAssign === 'admin'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                }`}
              >
                {isSubmittingRoleChange ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Role Change</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
