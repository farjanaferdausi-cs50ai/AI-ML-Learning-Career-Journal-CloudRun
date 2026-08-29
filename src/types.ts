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

export interface JournalSession {
  id?: string;
  userId: string;
  conversation: ChatMessage[];
  summary: SessionSummary;
  topics: string[];
  createdAt: number;
  difficulty?: 'Introductory' | 'Intermediate' | 'Advanced' | 'Mastery';
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
  targetRole: string;
  yearsInHR: number;
  learningPlatforms: LearningPlatform[];
  weeklyGoals: string[];
  achievements: string[];
  updatedAt: number;
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

