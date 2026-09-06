import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Bell, 
  Mail,
  Moon,
  Sun,
  ChevronDown, 
  LogOut, 
  LogIn,
  ShieldCheck, 
  User as UserIcon,
  Sparkles,
  Menu,
  BrainCircuit,
  Activity,
  X,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  Trash2,
  BookOpen,
  Layers,
  Cpu,
  FolderGit2,
  ArrowRight,
  CornerDownLeft
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { UserRole, Topic, JournalSession, ProjectItem, JournalLocation } from '../types';
import { NotificationPopover, INITIAL_NOTIFICATIONS } from './NotificationPopover';
import { reverseGeocode, getGoogleMapsUrl } from '../lib/googleMaps';
import { LocationPickerModal } from './LocationPickerModal';

export interface SearchItem {
  id: string;
  title: string;
  category: 'Learning Module' | 'Focus Area' | 'Recent Activity' | 'Journal Entry' | 'Project';
  description: string;
  targetTab: string;
  targetSectionId?: string;
  badgeColor: string;
  dateOrMeta?: string;
}

interface HeaderProps {
  user: User | null;
  userRole?: UserRole;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenSignOutModal: () => void;
  onOpenAuthModal?: () => void;
  onGoogleSignIn?: () => Promise<void>;
  onNavigateTab?: (tab: string, targetId?: string) => void;
  onOpenMobileMenu?: () => void;
  topics?: Topic[];
  sessions?: JournalSession[];
  projects?: ProjectItem[];
  onUpdateSessionLocation?: (sessionId: string, location: JournalLocation | null) => Promise<void> | void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  userRole = 'user',
  theme = 'dark',
  onToggleTheme,
  onOpenSignOutModal,
  onOpenAuthModal,
  onGoogleSignIn,
  onNavigateTab,
  onOpenMobileMenu,
  topics = [],
  sessions = [],
  projects = [],
  onUpdateSessionLocation
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [isFullMapPickerOpen, setIsFullMapPickerOpen] = useState(false);
  const [detectedPlace, setDetectedPlace] = useState('');
  const [isTaggingSaving, setIsTaggingSaving] = useState(false);
  const [locationState, setLocationState] = useState<{
    status: 'idle' | 'detecting' | 'active' | 'denied' | 'not_detected';
    coords: { lat: number; lng: number; accuracy?: number } | null;
    timestamp: number | null;
    errorMsg: string | null;
  }>({
    status: 'idle',
    coords: null,
    timestamp: null,
    errorMsg: null,
  });

  const locationRef = useRef<HTMLDivElement>(null);

  // The current active / most recent session
  const currentSession = useMemo(() => {
    return sessions && sessions.length > 0 ? sessions[0] : null;
  }, [sessions]);

  // Real browser Geolocation API request (ONLY on user click, never on load)
  const requestBrowserLocation = () => {
    if (typeof window === 'undefined' || !navigator || !navigator.geolocation) {
      setLocationState({
        status: 'not_detected',
        coords: null,
        timestamp: Date.now(),
        errorMsg: 'Geolocation is not supported by your browser.'
      });
      return;
    }

    setLocationState(prev => ({
      ...prev,
      status: 'detecting',
      errorMsg: null
    }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;
        setLocationState({
          status: 'active',
          coords: { lat, lng, accuracy },
          timestamp: pos.timestamp || Date.now(),
          errorMsg: null
        });

        try {
          const place = await reverseGeocode(lat, lng);
          setDetectedPlace(place);
        } catch {
          setDetectedPlace(`${lat.toFixed(4)}°, ${lng.toFixed(4)}°`);
        }
      },
      (err) => {
        if (err.code === 1 || err.code === err.PERMISSION_DENIED) {
          setLocationState({
            status: 'denied',
            coords: null,
            timestamp: Date.now(),
            errorMsg: 'Permission Denied: Location access was blocked in browser settings.'
          });
        } else {
          setLocationState({
            status: 'not_detected',
            coords: null,
            timestamp: Date.now(),
            errorMsg: err.message || 'Location could not be determined.'
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleLocationToggle = () => {
    setShowLocation(prev => {
      const next = !prev;
      if (next) {
        setShowNotifications(false);
        setShowProfileMenu(false);
        // Explicitly trigger geolocation only at the moment user clicks this icon
        requestBrowserLocation();
      }
      return next;
    });
  };

  const handleTagCurrentEntry = async () => {
    if (!currentSession?.id || !locationState.coords) return;
    setIsTaggingSaving(true);
    try {
      const newLoc: JournalLocation = {
        lat: locationState.coords.lat,
        lng: locationState.coords.lng,
        placeName: detectedPlace.trim() || `${locationState.coords.lat.toFixed(4)}°, ${locationState.coords.lng.toFixed(4)}°`
      };
      if (onUpdateSessionLocation) {
        await onUpdateSessionLocation(currentSession.id, newLoc);
      }
    } finally {
      setIsTaggingSaving(false);
    }
  };

  const handleRemoveCurrentLocation = async () => {
    if (!currentSession?.id || !onUpdateSessionLocation) return;
    setIsTaggingSaving(true);
    try {
      await onUpdateSessionLocation(currentSession.id, null);
    } finally {
      setIsTaggingSaving(false);
    }
  };
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Comprehensive searchable index covering Learning Modules, Focus Areas, Recent Activities, Journal Entries, and Projects
  const allSearchItems = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [
      // 1. Learning Modules
      {
        id: 'mod-transformers',
        title: 'Transformers & Attention Mechanism',
        category: 'Learning Module',
        description: 'Self-attention, multi-head attention, positional encoding, encoder-decoder architectures',
        targetTab: 'curriculum',
        targetSectionId: 'study-plan-section',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        dateOrMeta: 'Curriculum • Ostad / PyTorch'
      },
      {
        id: 'mod-foundations',
        title: 'Foundations of ML',
        category: 'Learning Module',
        description: 'Linear algebra, calculus, probability, Python data science stack',
        targetTab: 'curriculum',
        targetSectionId: 'study-plan-section',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        dateOrMeta: 'Curriculum • Completed'
      },
      {
        id: 'mod-supervised',
        title: 'Supervised Learning',
        category: 'Learning Module',
        description: 'Regression, classification, decision trees, random forests, SVMs',
        targetTab: 'curriculum',
        targetSectionId: 'study-plan-section',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        dateOrMeta: 'Curriculum • Completed'
      },
      {
        id: 'mod-deep-learning',
        title: 'Deep Learning',
        category: 'Learning Module',
        description: 'Neural architectures, backpropagation, CNNs, RNNs, PyTorch basics',
        targetTab: 'curriculum',
        targetSectionId: 'study-plan-section',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        dateOrMeta: 'Curriculum • In Progress'
      },
      {
        id: 'mod-mlops',
        title: 'MLOps & Deployment',
        category: 'Learning Module',
        description: 'Model packaging, Docker, Cloud Run APIs, latency tracking & monitoring',
        targetTab: 'curriculum',
        targetSectionId: 'study-plan-section',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        dateOrMeta: 'Curriculum • Locked'
      },
      {
        id: 'mod-advanced',
        title: 'Advanced Topics & Research',
        category: 'Learning Module',
        description: 'Diffusion models, multi-modal reasoning, agentic workflows, RLHF',
        targetTab: 'curriculum',
        targetSectionId: 'study-plan-section',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        dateOrMeta: 'Curriculum • Research'
      },
      {
        id: 'plat-codebasics',
        title: 'CodeBasics: Python & Data Engineering',
        category: 'Learning Module',
        description: 'Core foundations, NumPy, Pandas, data wrangling',
        targetTab: 'curriculum',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        dateOrMeta: 'Platform Track'
      },
      {
        id: 'plat-ostad',
        title: 'Ostad: Structured AI/ML Curriculum',
        category: 'Learning Module',
        description: 'End-to-end Machine Learning pipelines, model deployment, and live mentor sessions',
        targetTab: 'curriculum',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        dateOrMeta: 'Platform Track'
      },
      {
        id: 'plat-gcp',
        title: 'Google Cloud Gen AI Academy',
        category: 'Learning Module',
        description: 'Vertex AI, Gemini models, embeddings, RAG architectures, and Cloud Run',
        targetTab: 'curriculum',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        dateOrMeta: 'Platform Track'
      },
      {
        id: 'plat-codealpha',
        title: 'CodeAlpha: Hands-on Projects',
        category: 'Learning Module',
        description: 'Applied NLP architectures, computer vision prototypes, and production APIs',
        targetTab: 'curriculum',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        dateOrMeta: 'Platform Track'
      },

      // 2. Focus Area Topics
      {
        id: 'focus-dl-mastery',
        title: 'Deep Learning Mastery',
        category: 'Focus Area',
        description: 'PyTorch neural architectures, optimization algorithms (75% progress)',
        targetTab: 'dashboard',
        targetSectionId: 'focus-areas-section',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        dateOrMeta: 'Focus Area • 75%'
      },
      {
        id: 'focus-mlops',
        title: 'MLOps & Deployment',
        category: 'Focus Area',
        description: 'Cloud Run production services, model packaging & containerization (60% progress)',
        targetTab: 'dashboard',
        targetSectionId: 'focus-areas-section',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        dateOrMeta: 'Focus Area • 60%'
      },
      {
        id: 'focus-genai',
        title: 'Generative AI',
        category: 'Focus Area',
        description: 'LLM agents, prompt engineering, Gemini API integrations (45% progress)',
        targetTab: 'dashboard',
        targetSectionId: 'focus-areas-section',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        dateOrMeta: 'Focus Area • 45%'
      },
      {
        id: 'focus-llm-finetuning',
        title: 'LLM Fine-tuning',
        category: 'Focus Area',
        description: 'LoRA, QLoRA, parameter-efficient fine-tuning on domain data (30% progress)',
        targetTab: 'dashboard',
        targetSectionId: 'focus-areas-section',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        dateOrMeta: 'Focus Area • 30%'
      },

      // 3. Recent Activity Items
      {
        id: 'act-transformers',
        title: 'Completed Module: Transformers & Attention Mechanism',
        category: 'Recent Activity',
        description: 'Finished self-attention coding lab • Ostad & PyTorch',
        targetTab: 'dashboard',
        targetSectionId: 'recent-activity-section',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        dateOrMeta: 'Activity • 2 hours ago'
      },
      {
        id: 'act-sentiment-lstm',
        title: 'Built Mini Project: Sentiment Analysis with LSTM',
        category: 'Recent Activity',
        description: 'PyTorch recurrent neural network for customer sentiment classification',
        targetTab: 'dashboard',
        targetSectionId: 'recent-activity-section',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        dateOrMeta: 'Activity • 5 hours ago'
      },
      {
        id: 'act-backprop',
        title: 'Studied: Backpropagation & Optimization',
        category: 'Recent Activity',
        description: 'Chain rule derivations and AdamW optimizer convergence analysis',
        targetTab: 'dashboard',
        targetSectionId: 'recent-activity-section',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        dateOrMeta: 'Activity • Yesterday'
      },
      {
        id: 'act-pytorch-basics',
        title: 'Completed: PyTorch Basics Tutorial',
        category: 'Recent Activity',
        description: 'Tensors, autograd, and simple neural net training loop',
        targetTab: 'dashboard',
        targetSectionId: 'recent-activity-section',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        dateOrMeta: 'Activity • 2 days ago'
      },
      {
        id: 'act-attention-paper',
        title: 'Read Paper: Attention Is All You Need',
        category: 'Recent Activity',
        description: 'Vaswani et al. foundational paper analysis & architecture breakdown',
        targetTab: 'dashboard',
        targetSectionId: 'recent-activity-section',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        dateOrMeta: 'Activity • 3 days ago'
      },

      // 4. Journal Timeline Entries
      {
        id: 'tl-cnn',
        title: 'Finished Neural Networks module and implemented a CNN.',
        category: 'Journal Entry',
        description: 'Computer vision architecture & convolutional filters implementation',
        targetTab: 'dashboard',
        targetSectionId: 'journal-timeline-section',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        dateOrMeta: 'Journal • May 20, 2024'
      },
      {
        id: 'tl-gradient-descent',
        title: 'Studied gradient descent variants. Noted key insights.',
        category: 'Journal Entry',
        description: 'SGD, Momentum, RMSprop, and Adam convergence rates',
        targetTab: 'dashboard',
        targetSectionId: 'journal-timeline-section',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        dateOrMeta: 'Journal • May 18, 2024'
      },
      {
        id: 'tl-ml-pipeline',
        title: 'Built end-to-end ML pipeline for tabular data.',
        category: 'Journal Entry',
        description: 'Preprocessing, cross-validation, feature importance, and scikit-learn pipelines',
        targetTab: 'dashboard',
        targetSectionId: 'journal-timeline-section',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        dateOrMeta: 'Journal • May 16, 2024'
      },
      {
        id: 'tl-huggingface',
        title: 'Explored Hugging Face datasets and fine-tuned a model.',
        category: 'Journal Entry',
        description: 'Tokenization, transfer learning, and evaluation metrics with Hugging Face',
        targetTab: 'dashboard',
        targetSectionId: 'journal-timeline-section',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        dateOrMeta: 'Journal • May 14, 2024'
      },

      // 5. Portfolio Projects
      {
        id: 'proj-journal',
        title: 'AI/ML Career Transition & Technical Journal',
        category: 'Project',
        description: 'Full-Stack AI Engineering with Gemini API fallback ladder, Firebase Auth, and Firestore',
        targetTab: 'projects',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        dateOrMeta: 'Project • Live & Active'
      },
      {
        id: 'proj-talent',
        title: 'Talent & HR Algorithmic Intelligence Engine',
        category: 'Project',
        description: 'RAG & Hybrid Search bridging 14+ years of HR talent management into computational vector retrieval',
        targetTab: 'projects',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        dateOrMeta: 'Project • In Development'
      },
      {
        id: 'proj-multimodal-hr',
        title: 'Multi-Modal HR Document Summarizer & Embeddings',
        category: 'Project',
        description: 'Document processing pipeline analyzing resumes and JD matches with embeddings',
        targetTab: 'projects',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        dateOrMeta: 'Project • Planned'
      }
    ];

    // Dynamic Topics from props
    if (topics && topics.length > 0) {
      topics.forEach(t => {
        if (!items.some(i => i.title.toLowerCase() === t.name.toLowerCase())) {
          items.push({
            id: `topic-${t.id}`,
            title: t.name,
            category: 'Focus Area',
            description: `Curated study focus topic (${t.isActive ? 'Active Study' : 'Saved Track'})`,
            targetTab: 'focustopics',
            badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
            dateOrMeta: 'Topic Manager'
          });
        }
      });
    }

    // Dynamic Sessions from props
    if (sessions && sessions.length > 0) {
      sessions.forEach(s => {
        const sessionTitle = s.topics?.length ? `${s.topics.join(', ')} Session` : (s.summary?.whatWasLearned?.[0] || 'AI/ML Study Session');
        const sessionDesc = s.summary?.keyTakeaway || s.summary?.whatWasWorkedOn || 'Study session with AI Coach';
        items.push({
          id: `session-${s.id || s.createdAt}`,
          title: sessionTitle,
          category: 'Journal Entry',
          description: sessionDesc,
          targetTab: 'journal',
          targetSectionId: 'learning-timeline-section',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dateOrMeta: `Journal • ${new Date(s.createdAt).toLocaleDateString()}`
        });
      });
    }

    // Dynamic Projects from props
    if (projects && projects.length > 0) {
      projects.forEach(p => {
        if (!items.some(i => i.title.toLowerCase() === p.title.toLowerCase())) {
          items.push({
            id: `project-${p.id}`,
            title: p.title,
            category: 'Project',
            description: p.description || p.role || 'Portfolio Project',
            targetTab: 'projects',
            badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
            dateOrMeta: `Project • ${p.status || 'Active'}`
          });
        }
      });
    }

    return items;
  }, [topics, sessions, projects]);

  // Filter matching results based on user search query
  const matchingResults = useMemo(() => {
    const q = searchVal.trim().toLowerCase();
    if (!q) return [];

    const terms = q.split(/\s+/).filter(Boolean);

    return allSearchItems
      .filter((item) => {
        const itemText = `${item.title} ${item.description} ${item.category} ${item.dateOrMeta || ''}`.toLowerCase();
        return terms.every(term => itemText.includes(term));
      })
      .slice(0, 8); // Top 8 most relevant matches
  }, [searchVal, allSearchItems]);

  // Navigation & selection handler
  const handleSelectResult = (item: SearchItem) => {
    setIsDropdownOpen(false);
    setIsMobileSearchOpen(false);
    setSearchVal('');
    searchInputRef.current?.blur();
    mobileSearchInputRef.current?.blur();
    
    if (onNavigateTab) {
      onNavigateTab(item.targetTab, item.targetSectionId);
    }
  };

  // Keyboard navigation inside search inputs
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsDropdownOpen(true);
      if (matchingResults.length > 0) {
        setSelectedIndex(prev => (prev + 1) % matchingResults.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsDropdownOpen(true);
      if (matchingResults.length > 0) {
        setSelectedIndex(prev => (prev - 1 + matchingResults.length) % matchingResults.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (matchingResults.length > 0) {
        const item = matchingResults[selectedIndex] || matchingResults[0];
        handleSelectResult(item);
      } else if (searchVal.trim()) {
        const timeline = document.querySelector('#learning-timeline-section');
        timeline?.scrollIntoView({ behavior: 'smooth' });
        setIsDropdownOpen(false);
        setIsMobileSearchOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setIsMobileSearchOpen(false);
      searchInputRef.current?.blur();
      mobileSearchInputRef.current?.blur();
    }
  };

  // Global ⌘K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsDropdownOpen(true);
        if (window.innerWidth >= 768) {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        } else {
          setIsMobileSearchOpen(true);
          setTimeout(() => {
            mobileSearchInputRef.current?.focus();
            mobileSearchInputRef.current?.select();
          }, 60);
        }
      }
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsMobileSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCategoryIcon = (category: SearchItem['category']) => {
    switch (category) {
      case 'Learning Module':
        return BookOpen;
      case 'Focus Area':
        return Layers;
      case 'Recent Activity':
        return Cpu;
      case 'Journal Entry':
        return Activity;
      case 'Project':
        return FolderGit2;
      default:
        return Search;
    }
  };

  // Close menus on outside click and on Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      
      // Notifications outside click
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        const notifBtn = document.getElementById('notifications-btn');
        if (!notifBtn?.contains(target)) {
          setShowNotifications(false);
        }
      }

      // Location outside click
      if (locationRef.current && !locationRef.current.contains(target)) {
        const locBtn = document.getElementById('header-location-btn');
        if (!locBtn?.contains(target)) {
          setShowLocation(false);
        }
      }

      // Profile menu outside click
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        const profileBtn = document.getElementById('user-profile-btn');
        if (!profileBtn?.contains(target)) {
          setShowProfileMenu(false);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowProfileMenu(false);
        setShowLocation(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
    const interval = setInterval(updateCount, 1500);
    return () => {
      window.removeEventListener('storage', updateCount);
      clearInterval(interval);
    };
  }, []);

  const displayName = user?.displayName || 'Farjana Ferdausi';
  const userPhoto = user?.photoURL;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchingResults.length > 0) {
      const selectedItem = matchingResults[selectedIndex] || matchingResults[0];
      handleSelectResult(selectedItem);
    } else if (searchVal.trim()) {
      const timeline = document.querySelector('#learning-timeline-section');
      timeline?.scrollIntoView({ behavior: 'smooth' });
      setIsDropdownOpen(false);
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0F19]/95 backdrop-blur-md border-b border-[#1E293B]/80 px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between select-none">
      
      {/* 1. Left: Brand Title */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {onOpenMobileMenu && (
          <button
            id="mobile-header-menu-btn"
            onClick={onOpenMobileMenu}
            className="md:hidden min-w-[40px] min-h-[40px] flex items-center justify-center p-2 rounded-xl bg-[#131826] border border-[#1E293B] text-[#CBD5E1] hover:text-[#00F0FF] hover:border-cyan-400/50 transition-all cursor-pointer"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => onNavigateTab?.('home')}
          className="flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00F0FF] rounded-xl transition-all"
          aria-label="Return to Home Dashboard"
          title="Return to Home Dashboard"
        >
          <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-[#1E293B] to-[#131826] border border-[#00F0FF]/60 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.25)] shrink-0 group-hover:border-[#00F0FF] group-hover:shadow-[0_0_16px_rgba(0,240,255,0.4)] transition-all">
            <BrainCircuit className="w-4.5 h-4.5 text-[#00F0FF] drop-shadow-[0_0_8px_#00F0FF]" />
          </div>

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5 leading-tight truncate group-hover:text-cyan-200 transition-colors">
              <span>AI/ML Learning &amp; Career Journal</span>
            </h1>
            <p className="text-[9px] text-[#00F0FF] font-mono leading-tight truncate">
              Farjana Ferdausi • 14+ yrs HR → AI/ML Engineering
            </p>
          </div>
        </button>
      </div>

      {/* 2. Center: Search Bar with "Search topics, projects, notes..." */}
      <div 
        ref={searchContainerRef}
        className="hidden md:flex items-center justify-center flex-1 max-w-lg mx-4 lg:mx-8 relative"
      >
        <form onSubmit={handleSearchSubmit} className="w-full relative">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              setIsDropdownOpen(true);
              setSelectedIndex(0);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search topics, projects, notes..."
            aria-label="Search topics, projects, notes"
            className="w-full pl-9 pr-18 py-2 rounded-xl bg-[#131826] border border-[#1E293B] text-xs font-mono text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] focus:shadow-[0_0_12px_rgba(0,240,255,0.25)] transition-all"
          />

          {searchVal && (
            <button
              type="button"
              onClick={() => {
                setSearchVal('');
                setIsDropdownOpen(false);
                searchInputRef.current?.focus();
              }}
              className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md cursor-pointer transition-colors"
              aria-label="Clear search input"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#1A1F2E] border border-[#1E293B] text-[10px] font-mono text-[#94A3B8] pointer-events-none select-none flex items-center gap-0.5">
            <span>⌘</span><span>K</span>
          </div>
        </form>

        {/* Dropdown Menu for Matching Results */}
        {isDropdownOpen && (
          <div 
            id="search-results-dropdown"
            className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-[#0d1424]/98 backdrop-blur-xl border border-cyan-500/30 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_24px_rgba(0,240,255,0.12)] overflow-hidden z-50 text-xs font-mono animate-in fade-in duration-150"
          >
            {/* When query is empty, show Quick Suggested Searches */}
            {!searchVal.trim() && (
              <div className="p-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]/70 mb-2.5 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Quick Suggested Topics</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">⌘K</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'Transformers & Attention', query: 'Transformers' },
                    { label: 'Deep Learning Mastery', query: 'Deep Learning' },
                    { label: 'Sentiment LSTM Project', query: 'Sentiment' },
                    { label: 'MLOps & Deployment', query: 'MLOps' },
                    { label: 'Talent & HR AI Engine', query: 'Talent' },
                    { label: 'Journal Timeline', query: 'Journal' },
                  ].map(s => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => {
                        setSearchVal(s.query);
                        searchInputRef.current?.focus();
                      }}
                      className="px-2.5 py-2 rounded-lg bg-[#141B2D] border border-[#1E293B] text-[11px] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-[#1A233A] text-left cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <span className="truncate">{s.label}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* When searchVal has matches */}
            {searchVal.trim() && matchingResults.length > 0 && (
              <div>
                <div className="px-3.5 py-2 bg-[#12192B]/80 border-b border-[#1E293B] flex items-center justify-between text-[11px] text-slate-400">
                  <span>{matchingResults.length} result{matchingResults.length > 1 ? 's' : ''} for "{searchVal}"</span>
                  <span className="text-[10px] text-slate-500">Press ↵ to open</span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#1E293B]/40 p-1">
                  {matchingResults.map((item, idx) => {
                    const IconComponent = getCategoryIcon(item.category);
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`p-2.5 rounded-lg cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected 
                            ? 'bg-[#18233C] border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.15)]' 
                            : 'hover:bg-[#141C30] border border-transparent'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${item.badgeColor}`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-slate-200 text-xs truncate">
                              {item.title}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono shrink-0 ${item.badgeColor}`}>
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {item.description}
                          </p>
                          {item.dateOrMeta && (
                            <p className="text-[10px] text-cyan-400/70 mt-0.5">
                              {item.dateOrMeta}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-1 text-[10px] text-cyan-400 mt-1 opacity-80">
                          <span className="capitalize">{item.targetTab}</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* When searchVal has NO matches */}
            {searchVal.trim() && matchingResults.length === 0 && (
              <div className="p-4 text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <span>No results found for <span className="text-cyan-300 font-bold">"{searchVal}"</span></span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Try searching for:
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                  {['Transformers', 'Deep Learning', 'Sentiment', 'MLOps', 'Journal'].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setSearchVal(suggestion);
                        setIsDropdownOpen(true);
                        searchInputRef.current?.focus();
                      }}
                      className="px-2 py-0.5 rounded-lg bg-[#131826] border border-[#1E293B] text-[10px] font-mono text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/10 cursor-pointer transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Keyboard shortcut footer bar */}
            <div className="px-3 py-1.5 bg-[#0A0F1D] border-t border-[#1E293B] flex items-center justify-between text-[10px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="px-1 py-0.5 rounded bg-[#131826] border border-[#1E293B] text-[9px]">↑</span>
                  <span className="px-1 py-0.5 rounded bg-[#131826] border border-[#1E293B] text-[9px]">↓</span>
                  <span>navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="px-1 py-0.5 rounded bg-[#131826] border border-[#1E293B] text-[9px]">↵</span>
                  <span>select</span>
                </span>
              </div>
              <span className="flex items-center gap-1">
                <span className="px-1 py-0.5 rounded bg-[#131826] border border-[#1E293B] text-[9px]">esc</span>
                <span>close</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Right: Location Status, Notification Bell, Message Icon, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Mobile Search Button (Visible on mobile) */}
        <button
          type="button"
          onClick={() => {
            setIsMobileSearchOpen(true);
            setTimeout(() => mobileSearchInputRef.current?.focus(), 60);
          }}
          className="md:hidden min-w-[38px] min-h-[38px] flex items-center justify-center p-2 rounded-xl bg-[#131826] border border-[#1E293B] text-[#CBD5E1] hover:text-[#00F0FF] hover:border-cyan-400/50 transition-all cursor-pointer"
          aria-label="Open search dialog"
          title="Search (⌘K)"
        >
          <Search className="w-4 h-4" />
        </button>
        
        {/* Location Status & Tag Popover (Directly to the left of notification bell) */}
        <div className="relative" ref={locationRef}>
          <button
            id="header-location-btn"
            type="button"
            onClick={handleLocationToggle}
            className={`relative min-w-[38px] min-h-[38px] flex items-center justify-center p-2 rounded-xl border transition-all duration-200 ease-out cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:outline-none ${
              showLocation 
                ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_16px_rgba(0,240,255,0.3)]' 
                : 'bg-[#131826] border-[#1E293B] text-[#CBD5E1] hover:text-[#00F0FF] hover:border-[#00F0FF]/50 hover:bg-[#1A2338]'
            }`}
            aria-label="Tag Location on Journal Entry"
            aria-haspopup="dialog"
            aria-expanded={showLocation}
            title={currentSession?.location ? `Tagged Location: ${currentSession.location.placeName}` : "Tag Study Session Location"}
          >
            <MapPin className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
            
            {/* Status indicator badge */}
            {currentSession?.location ? (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
            ) : locationState.status === 'active' ? (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00F0FF]" />
            ) : locationState.status === 'denied' ? (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_#f43f5e]" />
            ) : locationState.status === 'detecting' ? (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            ) : null}
          </button>

          {/* Location Popover Panel */}
          {showLocation && (
            <div 
              id="header-location-panel"
              className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#131826] border border-[#1E293B] shadow-2xl p-4 z-50 animate-in fade-in duration-150 text-xs font-mono"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-[#1E293B] mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF]">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white tracking-wide uppercase text-[11px] block">
                      Study Session Location
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Tag current journal entry
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLocation(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close location panel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Current Session Indicator */}
              <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-[#1E293B] mb-3">
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3" />
                  <span>Current Journal Entry</span>
                </div>
                {currentSession ? (
                  <div>
                    <div className="text-white text-xs font-semibold line-clamp-1">
                      {currentSession.summary?.whatWasWorkedOn || currentSession.topics?.[0] || 'AI/ML Study Reflection'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(currentSession.createdAt).toLocaleDateString()} • {currentSession.topics.slice(0, 2).join(', ') || 'AI/ML'}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-[11px]">
                    No saved journal entry yet. Location will be ready to tag when you complete an AI Coach session.
                  </div>
                )}
              </div>

              {/* Existing Tagged Location on Current Session (if any) */}
              {currentSession?.location && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 mb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Currently Tagged Venue
                    </span>
                    <a
                      href={getGoogleMapsUrl(currentSession.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-cyan-300 hover:underline flex items-center gap-1"
                    >
                      <span>Google Maps</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="text-white font-medium text-xs break-words">
                    📍 {currentSession.location.placeName}
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>{currentSession.location.lat.toFixed(4)}°, {currentSession.location.lng.toFixed(4)}°</span>
                    <button
                      type="button"
                      onClick={handleRemoveCurrentLocation}
                      disabled={isTaggingSaving}
                      className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Live Geolocation Detection State */}
              <div className="space-y-2.5 mb-3">
                {locationState.status === 'detecting' && (
                  <div className="p-3 rounded-lg bg-[#0c1322] border border-cyan-500/30 flex items-center gap-2.5 text-cyan-300">
                    <Loader2 className="w-4 h-4 animate-spin text-[#00F0FF] shrink-0" />
                    <div>
                      <div className="font-bold text-xs text-white">Detecting Device GPS...</div>
                      <div className="text-[10px] text-slate-400">Requesting browser Geolocation permission</div>
                    </div>
                  </div>
                )}

                {locationState.status === 'active' && locationState.coords && (
                  <div className="p-2.5 rounded-lg bg-[#0c1322] border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between text-cyan-300">
                      <span className="font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Detected GPS Location
                      </span>
                      {locationState.coords.accuracy != null && (
                        <span className="text-[10px] text-slate-400 font-mono">±{Math.round(locationState.coords.accuracy)}m</span>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Venue / Place Name:</label>
                      <input
                        type="text"
                        value={detectedPlace}
                        onChange={(e) => setDetectedPlace(e.target.value)}
                        placeholder="e.g. MIT Stata Center / Home Study Lab"
                        className="w-full bg-[#131826] border border-[#1E293B] focus:border-[#00F0FF] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Lat: {locationState.coords.lat.toFixed(4)}°</span>
                      <span>Lng: {locationState.coords.lng.toFixed(4)}°</span>
                    </div>

                    {/* Tag Button */}
                    {currentSession && (
                      <button
                        type="button"
                        onClick={handleTagCurrentEntry}
                        disabled={isTaggingSaving}
                        className="w-full mt-1.5 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-[#00F0FF] to-cyan-500 hover:from-cyan-400 hover:to-cyan-600 text-[#040817] font-bold text-xs transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                      >
                        {isTaggingSaving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving to Firestore...</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Tag to Current Journal Entry</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {locationState.status === 'denied' && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 space-y-1.5 text-rose-400">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Permission Denied</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      Location access was blocked in browser settings. You can still manually search and tag any study venue using the Interactive Map Picker.
                    </p>
                  </div>
                )}

                {locationState.status === 'not_detected' && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-amber-400">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Location Not Detected</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      {locationState.errorMsg || 'Unable to determine GPS coordinates.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons: Refresh GPS & Open Full Map Picker */}
              <div className="space-y-1.5 pt-2 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={requestBrowserLocation}
                  disabled={locationState.status === 'detecting'}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#0c1322] hover:bg-[#1A2338] border border-[#1E293B] hover:border-cyan-500/40 text-cyan-300 hover:text-white transition-all cursor-pointer text-[11px] font-mono font-medium disabled:opacity-50"
                >
                  <RotateCw className={`w-3 h-3 ${locationState.status === 'detecting' ? 'animate-spin' : ''}`} />
                  <span>{locationState.status === 'detecting' ? 'Detecting GPS...' : 'Re-Detect GPS Location'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowLocation(false);
                    setIsFullMapPickerOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 hover:border-cyan-500 text-cyan-200 hover:text-white transition-all cursor-pointer text-[11px] font-mono font-medium"
                >
                  <MapPin className="w-3 h-3 text-[#00F0FF]" />
                  <span>Open Full Map & Location Picker</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Email/Envelope Notifications & Messages Icon (with badge showing 3) */}
        <div className="relative" ref={notificationsRef}>
          <button
            id="notifications-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications(prev => !prev);
              setShowProfileMenu(false);
            }}
            className={`relative min-w-[38px] min-h-[38px] flex items-center justify-center p-2 rounded-xl border transition-all duration-200 ease-out cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:outline-none ${
              showNotifications 
                ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_16px_rgba(0,240,255,0.3)]' 
                : 'bg-[#131826] border-[#1E293B] text-[#CBD5E1] hover:text-white hover:border-[#00F0FF]/50 hover:bg-[#1A2338]'
            }`}
            aria-label="Email & Notifications"
            title="Email & Notifications (3 new)"
            aria-haspopup="dialog"
            aria-expanded={showNotifications}
          >
            <Mail className="w-4 h-4 text-cyan-300 transition-transform duration-200 hover:scale-110" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_#f43f5e] animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <NotificationPopover
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            onNavigateTab={onNavigateTab}
          />
        </div>

        {/* User Profile Card: Farjana Ferdausi – Mastery Level 4 */}
        <div className="relative" ref={profileMenuRef}>
          <button
            id="user-profile-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowProfileMenu(prev => !prev);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 min-h-[38px] px-2.5 py-1 rounded-xl bg-[#131826] hover:bg-[#1A2338] border border-[#1E293B] hover:border-cyan-500/40 transition-all cursor-pointer shadow-sm group"
            aria-expanded={showProfileMenu}
            aria-haspopup="menu"
          >
            {/* Small Avatar */}
            {userPhoto ? (
              <img
                src={userPhoto}
                alt="Farjana Ferdausi"
                loading="lazy"
                decoding="async"
                width={28}
                height={28}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-[#00F0FF]/60 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-[#00F0FF] flex items-center justify-center text-white text-[10px] font-bold font-mono shrink-0 shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                FF
              </div>
            )}

            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight">
                Farjana Ferdausi
              </div>
              <div className="text-[10px] font-mono text-[#00F0FF] leading-tight font-medium">
                Mastery Level 4
              </div>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-200 ${showProfileMenu ? 'rotate-180 text-cyan-300' : ''}`} />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#131826] border border-[#1E293B] shadow-2xl p-3 z-50 animate-in fade-in duration-150 text-xs font-mono">
              <div className="pb-2 border-b border-[#1E293B] mb-2 flex items-start justify-between">
                <div>
                  <div className="font-bold text-white">Farjana Ferdausi</div>
                  <div className="text-[10px] text-[#00F0FF]">Mastery Level 4 • AI/ML Engineer</div>
                  <div className="text-[10px] text-[#94A3B8] truncate">{user?.email || 'farjana.rafi1983@gmail.com'}</div>
                </div>
                <button
                  type="button"
                  id="close-header-profile-btn"
                  onClick={() => setShowProfileMenu(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close profile menu"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {userRole === 'admin' && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigateTab?.('admin');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 mb-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Dashboard</span>
                </button>
              )}

              {user ? (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenSignOutModal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onGoogleSignIn ? onGoogleSignIn() : onOpenAuthModal?.();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#00F0FF] hover:bg-cyan-500/10"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In with Google</span>
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Search Modal Overlay */}
      {isMobileSearchOpen && (
        <div 
          id="mobile-search-overlay"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-4 flex flex-col md:hidden animate-in fade-in duration-150"
        >
          <div className="bg-[#0D1424] border border-cyan-500/40 rounded-2xl p-3.5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center gap-2 pb-3 border-b border-[#1E293B]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchVal}
                  onChange={(e) => {
                    setSearchVal(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Search topics, projects, notes..."
                  aria-label="Mobile search input"
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#131826] border border-[#1E293B] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                {searchVal && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchVal('');
                      mobileSearchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-2 rounded-xl bg-[#141C30] border border-[#1E293B] text-slate-400 hover:text-white cursor-pointer"
                aria-label="Close mobile search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Results */}
            <div className="overflow-y-auto flex-1 mt-2.5 space-y-1.5">
              {searchVal.trim() && matchingResults.length > 0 && (
                matchingResults.map((item) => {
                  const IconComponent = getCategoryIcon(item.category);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectResult(item)}
                      className="p-2.5 rounded-xl bg-[#131A2D] hover:bg-[#1A243D] border border-[#1E293B] flex items-start gap-3 cursor-pointer transition-colors"
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${item.badgeColor}`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-200 text-xs truncate">
                            {item.title}
                          </span>
                          <span className={`text-[9px] px-1 rounded border font-mono shrink-0 ${item.badgeColor}`}>
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 mt-1 shrink-0" />
                    </div>
                  );
                })
              )}

              {searchVal.trim() && matchingResults.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 font-mono">
                  No matching results found for "{searchVal}"
                </div>
              )}

              {!searchVal.trim() && (
                <div className="p-1">
                  <div className="text-[11px] text-slate-400 mb-2 font-mono flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Quick Suggestions</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { label: 'Transformers & Attention', query: 'Transformers' },
                      { label: 'Deep Learning Mastery', query: 'Deep Learning' },
                      { label: 'Sentiment LSTM Project', query: 'Sentiment' },
                      { label: 'MLOps & Deployment', query: 'MLOps' },
                      { label: 'Talent & HR AI Engine', query: 'Talent' },
                    ].map(s => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => {
                          setSearchVal(s.query);
                          mobileSearchInputRef.current?.focus();
                        }}
                        className="px-3 py-2 rounded-lg bg-[#141B2D] border border-[#1E293B] text-xs text-slate-300 text-left flex items-center justify-between cursor-pointer"
                      >
                        <span>{s.label}</span>
                        <ArrowRight className="w-3 h-3 text-cyan-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Interactive Map Picker Modal */}
      {isFullMapPickerOpen && (
        <LocationPickerModal
          isOpen={isFullMapPickerOpen}
          initialLocation={currentSession?.location || (locationState.coords ? {
            lat: locationState.coords.lat,
            lng: locationState.coords.lng,
            placeName: detectedPlace || 'Current Location'
          } : null)}
          onClose={() => setIsFullMapPickerOpen(false)}
          onSelectLocation={async (loc) => {
            if (currentSession?.id && onUpdateSessionLocation) {
              await onUpdateSessionLocation(currentSession.id, loc);
            }
            setIsFullMapPickerOpen(false);
          }}
        />
      )}

    </header>
  );
};

