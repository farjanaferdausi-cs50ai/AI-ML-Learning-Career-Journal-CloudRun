export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface GenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  candidateCount?: number;
  thinkingLevel?: 'minimal' | 'low' | 'medium' | 'high' | string;
}

export interface SessionSummary {
  whatWasLearned: string[];
  whatWasWorkedOn: string;
  whatWasDifficult: string;
  whatWasAccomplished: string;
  keyTakeaway: string;
  actionableGoalTomorrow: string;
  careerTransitionProgressNote: string;
}

export interface JournalLocation {
  lat: number;
  lng: number;
  placeName: string;
  addedAt?: number;
}

export interface JournalSession {
  id?: string;
  userId: string;
  conversation: ChatMessage[];
  summary: SessionSummary;
  topics: string[];
  createdAt: number;
  difficulty?: 'Introductory' | 'Intermediate' | 'Advanced' | 'Mastery';
  location?: JournalLocation;
}

export interface Topic {
  id: string;
  name: string;
  createdAt: number;
  isActive: boolean;
}

export interface LearningPlatform {
  id: string;
  name: string;
  role: string;
  focus: string;
  status: 'In Progress' | 'Active' | 'Completed';
  progressPercentage: number;
  badgeColor: string;
  link?: string;
}

export interface CareerProgressData {
  currentStage: string;
  currentRole?: string;
  targetRole: string;
  missionTagline?: string;
  yearsInHR: number;
  learningPlatforms: LearningPlatform[];
  weeklyGoals: string[];
  achievements: string[];
  updatedAt: number;
}

// User Profile Data
export interface UserProfileData {
  userId: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  currentStage: string;
  targetRole: string;
  yearsInHR: number;
  updatedAt: number;
}

// Learning Progress Overview Stats
export interface LearningProgressStats {
  userId: string;
  progressPercentage: number;
  lessonsCompleted: number;
  totalLessons: number;
  totalProjects: number;
  projectsThisMonth: number;
  skillsMasteryPercentage: number;
  strongSkillsCount: number;
  currentStreakDays: number;
  bestStreakDays: number;
  updatedAt: number;
}

// Course / Platform Module Item
export interface CourseItem {
  id: string;
  userId: string;
  name: string;
  role: string;
  focus: string;
  status: 'In Progress' | 'Active' | 'Completed';
  progressPercentage: number;
  badgeColor: string;
  link?: string;
  updatedAt: number;
}

// Skill Matrix Item
export interface SkillItem {
  id: string;
  userId: string;
  skill: string;
  level: number;
  category: 'Fundamentals' | 'Theory' | 'Core ML' | 'Gen AI' | 'Cloud Engineering' | 'Projects' | string;
  platform: string;
  verified: boolean;
  updatedAt: number;
}

// Portfolio Project Item
export interface ProjectItem {
  id: string;
  userId: string;
  title: string;
  role: string;
  status: string;
  statusColor: string;
  description: string;
  stack: string[];
  achievements: string[];
  prompt: string;
  githubUrl?: string;
  liveUrl?: string;
  updatedAt: number;
}

// Goal Item
export interface GoalItem {
  id: string;
  userId: string;
  title: string;
  category: 'weekly' | 'milestone' | 'career';
  targetDate?: string;
  completed: boolean;
  completedAt?: number;
  createdAt: number;
}

// Daily Study Track Session Item
export interface StudySessionItem {
  id: string;
  userId: string;
  dayNumber: number;
  dateLabel: string;
  isToday: boolean;
  isYesterday: boolean;
  status: 'completed' | 'in_progress' | 'upcoming';
  title: string;
  focusTopics: string[];
  hoursLogged: number;
  milestone: string;
  platform: string;
  journalLogged: boolean;
  completedAt?: number;
  createdAt: number;
}

// AI Recommendation Item
export interface AIRecommendationItem {
  id: string;
  userId: string;
  title: string;
  category: string;
  advice: string;
  actionableSteps: string[];
  relatedTopics: string[];
  createdAt: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  category: 'ai_coach' | 'milestone' | 'curriculum' | 'journal' | 'system';
  timestamp: string;
  read: boolean;
  actionTab?: string;
  actionTargetId?: string;
  actionLabel?: string;
}

export interface TimelineSearchResult {
  query: string;
  answer: string;
  relevantSessionIds: string[];
  relevanceExplanation?: string;
  matchedTopics?: string[];
}

// Proactive Coach Suggestion Data
export interface ProactiveFocusSuggestion {
  focusTitle: string;
  suggestion: string;
  recommendedTopics: string[];
  suggestedPrompt: string;
  reasoning: string;
  generatedAt: number;
}

// Weak-Skill Detection Item
export interface WeakSkillItem {
  id: string;
  topic: string;
  struggleCount: number;
  difficultySummary: string;
  suggestedPracticePrompt: string;
  lastEncounteredDate?: string;
}

// Missing Skill Area for Target Role
export interface MissingSkillArea {
  category: string;
  skills: string[];
  importance: 'Essential' | 'Recommended' | 'Advanced';
  whyNeeded: string;
}

// Suggested Next Project Idea
export interface SuggestedProjectIdea {
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Production-Ready';
  description: string;
  keyTechnologies: string[];
  learningOutcomes: string[];
  suggestedPrompt: string;
}

// Career Intelligence Response
export interface CareerIntelligenceData {
  estimatedProgressPercentage: number;
  targetRole: string;
  missingSkillAreas: MissingSkillArea[];
  suggestedNextProject: SuggestedProjectIdea;
  strategicHRAdvantage: string;
  generatedAt: number;
}

// AI Journal Trends Analysis
export interface JournalTrendsAnalysis {
  overallSummary: string;
  insights: string[];
  topTopics: { name: string; count: number; hoursLogged: number }[];
  velocityTrend: 'accelerating' | 'consistent' | 'needs_boost';
  recentConsistencyNote: string;
  strengthsIdentified: string[];
  growthOpportunities: string[];
  totalSessionsAnalyzed: number;
  generatedAt: number;
}

// Role-Based Access Control (RBAC) & Admin Dashboard Types
export type UserRole = 'user' | 'admin';

export interface AppUserAccount {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt?: number;
  lastActiveAt?: number;
  currentStage?: string;
  targetRole?: string;
}

export interface AdminUserItem {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  createdAt: number;
  lastActiveAt: number;
  totalSessionsCount?: number;
  currentStage?: string;
  targetRole?: string;
}

export interface AdminAuditLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  targetUserId: string;
  targetUserEmail: string;
  action: 'PROMOTE_TO_ADMIN' | 'DEMOTE_TO_USER' | 'VIEW_USER_DATA' | 'REFRESH_STATS' | string;
  previousRole?: string;
  newRole?: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsersThisWeek: number;
  totalJournalEntries: number;
  totalSessions: number;
  adminCount: number;
  userCount: number;
}

// External Notification System (Slack / Discord / Email)
export interface NotificationChannelConfig {
  enabled: boolean;
  webhookUrl?: string; // For Slack or Discord (HTTPS validated)
  emailAddress?: string; // For Email
  lastTestStatus?: 'success' | 'failed';
  lastTestError?: string;
  lastTestAt?: number;
}

export interface NotificationTriggerPreferences {
  milestone: boolean;       // Significant accomplishments / mastery breakthrough
  friction: boolean;        // High blocker / friction points where nudge helps
  dailyStreak: boolean;     // Daily goal / streak completed
}

export interface NotificationQuietHours {
  enabled: boolean;
  startHour: number; // 0-23 (default 22 for 10 PM)
  endHour: number;   // 0-23 (default 8 for 8 AM)
  timeZone?: string;
}

export interface UserNotificationSettings {
  userId: string;
  slack: NotificationChannelConfig;
  discord: NotificationChannelConfig;
  email: NotificationChannelConfig;
  triggers: NotificationTriggerPreferences;
  quietHours: NotificationQuietHours;
  dailyRateLimit?: number; // max notifications per day (default 5)
  updatedAt?: number;
}

export interface NotificationDispatchResult {
  triggered: boolean;
  reasons?: string[];
  channelsAttempted?: string[];
  delivered?: { channel: string; success: boolean; message: string; statusCode?: number }[];
  suppressedReason?: string; // e.g., 'quiet_hours' or 'daily_rate_limit_exceeded' or 'no_channels_enabled'
}

