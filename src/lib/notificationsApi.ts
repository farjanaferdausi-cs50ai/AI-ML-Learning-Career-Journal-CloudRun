import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, sanitizePayload } from './firebase';
import type { UserNotificationSettings, NotificationDispatchResult } from '../types';

export const DEFAULT_NOTIFICATION_SETTINGS: UserNotificationSettings = {
  userId: '',
  slack: {
    enabled: false,
    webhookUrl: '',
    lastTestStatus: undefined,
    lastTestError: undefined
  },
  discord: {
    enabled: false,
    webhookUrl: '',
    lastTestStatus: undefined,
    lastTestError: undefined
  },
  email: {
    enabled: false,
    emailAddress: '',
    lastTestStatus: undefined,
    lastTestError: undefined
  },
  triggers: {
    milestone: true,
    friction: true,
    dailyStreak: true
  },
  quietHours: {
    enabled: true,
    startHour: 22, // 10 PM
    endHour: 8     // 8 AM
  },
  dailyRateLimit: 5,
  updatedAt: Date.now()
};

/**
 * Fetch notification settings for the given user from Firestore (or server fallback).
 */
export async function fetchNotificationSettings(userId: string, idToken?: string): Promise<UserNotificationSettings> {
  if (!userId) return { ...DEFAULT_NOTIFICATION_SETTINGS };

  // 1. Try Firestore document first
  try {
    const docRef = doc(db, 'users', userId, 'profile', 'notifications');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...data,
        userId
      };
    }
  } catch (err) {
    console.warn('Firestore fetch notifications warning:', err);
  }

  // 2. Try Server API
  try {
    const res = await fetch(`/api/notifications/settings?userId=${encodeURIComponent(userId)}`, {
      headers: {
        'Accept': 'application/json',
        ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
      }
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          ...DEFAULT_NOTIFICATION_SETTINGS,
          ...json.data,
          userId
        };
      }
    }
  } catch (err) {
    console.warn('Server settings fetch warning:', err);
  }

  return { ...DEFAULT_NOTIFICATION_SETTINGS, userId };
}

/**
 * Persist notification settings to Firestore and sync to server.
 */
export async function saveNotificationSettings(
  userId: string, 
  settings: UserNotificationSettings,
  idToken?: string
): Promise<void> {
  if (!userId) return;

  const payload = sanitizePayload({
    ...settings,
    userId,
    updatedAt: Date.now()
  });

  // 1. Write to Firestore subcollection /users/{userId}/profile/notifications
  try {
    const docRef = doc(db, 'users', userId, 'profile', 'notifications');
    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    console.warn('Firestore save notifications warning:', err);
  }

  // 2. Sync with server for server-side evaluation & caching
  try {
    await fetch('/api/notifications/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify({
        userId,
        settings: payload
      })
    });
  } catch (err) {
    console.warn('Server settings sync warning:', err);
  }
}

/**
 * Send a verified test notification through the backend.
 */
export async function testNotificationChannel(
  channel: 'slack' | 'discord' | 'email',
  targetUrlOrEmail: string,
  idToken?: string
): Promise<{ success: boolean; message: string; statusCode?: number }> {
  try {
    const res = await fetch('/api/notifications/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify({
        channel,
        target: targetUrlOrEmail
      })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return {
        success: false,
        message: json.error || `Server returned error (${res.status})`
      };
    }

    return {
      success: json.data?.success ?? true,
      message: json.data?.message || 'Test notification sent successfully.',
      statusCode: json.data?.statusCode
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network error while contacting notification service.'
    };
  }
}

/**
 * Dispatch notifications for a completed journal entry.
 * Non-blocking: returns result without failing caller.
 */
export async function dispatchJournalNotifications(params: {
  userId: string;
  summary: any;
  topics: string[];
  settings?: UserNotificationSettings;
  idToken?: string;
}): Promise<NotificationDispatchResult> {
  try {
    const res = await fetch('/api/notifications/dispatch-entry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(params.idToken ? { 'Authorization': `Bearer ${params.idToken}` } : {})
      },
      body: JSON.stringify({
        userId: params.userId,
        summary: params.summary,
        topics: params.topics,
        settings: params.settings
      })
    });

    if (!res.ok) {
      return {
        triggered: false,
        suppressedReason: `Server error status ${res.status}`
      };
    }

    const json = await res.json();
    return json.data || { triggered: false };
  } catch (err: any) {
    console.warn('Dispatch notification warning (non-blocking):', err?.message);
    return {
      triggered: false,
      suppressedReason: 'network_error'
    };
  }
}
