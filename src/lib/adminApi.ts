import { auth } from './firebase';
import type { AdminUserItem, AdminDashboardStats, AdminAuditLog } from '../types';

/**
 * Retrieve the current user's Firebase ID token for Authorization header.
 */
export async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return {};
    const token = await currentUser.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  } catch (err) {
    console.warn('Failed to retrieve Firebase ID token:', err);
    return {
      'Content-Type': 'application/json'
    };
  }
}

/**
 * Fetch verified server-side identity and role.
 */
export async function fetchServerIdentity(): Promise<{
  uid: string | null;
  email: string | null;
  role: 'admin' | 'user';
  isBootstrappedAdmin: boolean;
  isAuthenticated: boolean;
}> {
  try {
    const headers = await getAuthHeader();
    const res = await fetch('/api/auth/me', { headers });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
    return {
      uid: null,
      email: null,
      role: 'user',
      isBootstrappedAdmin: false,
      isAuthenticated: false
    };
  } catch (err: any) {
    console.warn('fetchServerIdentity error:', err?.message);
    return {
      uid: null,
      email: null,
      role: 'user',
      isBootstrappedAdmin: false,
      isAuthenticated: false
    };
  }
}

/**
 * Fetch aggregate statistics for the Admin Dashboard.
 */
export async function fetchAdminStats(): Promise<AdminDashboardStats> {
  const headers = await getAuthHeader();
  const res = await fetch('/api/admin/stats', { headers });
  
  if (res.status === 401 || res.status === 403) {
    throw new Error('Access Denied: You do not have administrator permissions.');
  }
  
  if (!res.ok) {
    throw new Error(`Failed to load admin stats (HTTP ${res.status})`);
  }
  
  const data = await res.json();
  if (data.success && data.data) {
    return data.data;
  }
  throw new Error(data.error || 'Failed to parse admin statistics');
}

/**
 * Fetch all registered users with their roles and activity metrics.
 */
export async function fetchAdminUsers(): Promise<AdminUserItem[]> {
  const headers = await getAuthHeader();
  const res = await fetch('/api/admin/users', { headers });
  
  if (res.status === 401 || res.status === 403) {
    throw new Error('Access Denied: Administrator role required to view the user directory.');
  }
  
  if (!res.ok) {
    throw new Error(`Failed to load users (HTTP ${res.status})`);
  }
  
  const data = await res.json();
  if (data.success && Array.isArray(data.data)) {
    return data.data;
  }
  throw new Error(data.error || 'Failed to fetch user list');
}

/**
 * Promote or demote a user role via the secure backend API.
 */
export async function changeUserRole(targetUserId: string, newRole: 'admin' | 'user'): Promise<{
  success: boolean;
  message: string;
  previousRole?: string;
  newRole?: string;
}> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/admin/users/${encodeURIComponent(targetUserId)}/role`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ role: newRole })
  });
  
  if (res.status === 401 || res.status === 403) {
    throw new Error('Access Denied: Only verified administrators can promote or demote users.');
  }
  
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || `Failed to update role to ${newRole}`);
  }
  
  return data.data || { success: true, message: 'Role updated successfully' };
}

/**
 * Fetch recent admin audit logs.
 */
export async function fetchAdminAuditLogs(): Promise<AdminAuditLog[]> {
  const headers = await getAuthHeader();
  const res = await fetch('/api/admin/audit-logs', { headers });
  
  if (res.status === 401 || res.status === 403) {
    throw new Error('Access Denied: Administrator permissions required.');
  }
  
  if (!res.ok) {
    throw new Error(`Failed to load audit logs (HTTP ${res.status})`);
  }
  
  const data = await res.json();
  if (data.success && Array.isArray(data.data)) {
    return data.data;
  }
  return [];
}
