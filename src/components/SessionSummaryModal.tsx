import React, { useEffect, useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  Lightbulb, 
  Target, 
  Compass, 
  Award, 
  Copy, 
  Check, 
  BookmarkCheck,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Edit2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SessionSummary, JournalLocation } from '../types';
import { LocationPickerModal } from './LocationPickerModal';
import { LocationBadge } from './LocationBadge';

interface SessionSummaryModalProps {
  summary: SessionSummary;
  topics: string[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmSave?: () => void;
  isSaving?: boolean;
  initialLocation?: JournalLocation | null;
  onUpdateLocation?: (location: JournalLocation | null) => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  summary,
  topics,
  isOpen,
  onClose,
  onConfirmSave,
  isSaving = false,
  initialLocation,
  onUpdateLocation
}) => {
  const [copied, setCopied] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<JournalLocation | null>(initialLocation || null);

  useEffect(() => {
    setCurrentLocation(initialLocation || null);
  }, [initialLocation, isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Trigger festive confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f3ff', '#00ff66', '#9d4edd', '#ff70a6']
        });
      } catch (e) {
        // Safe confetti catch
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLocationSelected = (loc: JournalLocation | null) => {
    setCurrentLocation(loc);
    if (onUpdateLocation) {
      onUpdateLocation(loc);
    }
  };

  const handleCopyMarkdown = () => {
    const locationStr = currentLocation ? `\n**Study Location:** ${currentLocation.placeName} (${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)})` : '';
    const md = `# AI/ML Learning & Career Journal - Session Summary
**Date:** ${new Date().toLocaleDateString()}
**Active Topics:** ${topics.join(', ') || 'AI/ML Engineering'}${locationStr}

## 🎯 Key Takeaway
${summary.keyTakeaway}

## 🚀 Career Transition Progress Note
${summary.careerTransitionProgressNote}

## 📚 What Was Learned
${Array.isArray(summary.whatWasLearned) ? summary.whatWasLearned.map(item => `- ${item}`).join('\n') : summary.whatWasLearned}

## 🛠️ What Was Worked On
${summary.whatWasWorkedOn}

## ⚡ What Was Accomplished
${summary.whatWasAccomplished}

## 🧩 What Was Difficult
${summary.whatWasDifficult}

## 🎯 Actionable Goal for Tomorrow
${summary.actionableGoalTomorrow}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] glass-panel-glow rounded-2xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,243,255,0.25)] border border-cyan-400/50">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#0a1428] border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,255,102,0.4)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2 text-3d-silver">
                <span>Session Synthesized Successfully</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-3d-emerald">
                  Completed
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                AI/ML Learning & Career Transition Record
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Key Takeaway Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/80 to-[#0e1d3a] border border-cyan-400/50 shadow-inner">
            <div className="flex items-center gap-2 text-cyan-300 font-bold mb-1.5 text-xs font-mono uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-cyan-400" />
              <span>Core Key Takeaway</span>
            </div>
            <p className="text-slate-100 font-medium leading-relaxed">
              {summary.keyTakeaway}
            </p>
          </div>

          {/* Career Transition Note */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/70 to-slate-900 border border-violet-500/40 shadow-inner">
            <div className="flex items-center gap-2 text-violet-300 font-bold mb-1.5 text-xs font-mono uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <span>Career Transition Progress Note (HR → AI/ML)</span>
            </div>
            <p className="text-slate-200 leading-relaxed">
              {summary.careerTransitionProgressNote}
            </p>
          </div>

          {/* What was learned & Accomplished Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Learned */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-2 text-xs font-mono uppercase">
                <CheckCircle className="w-4 h-4" />
                <span>What Was Learned</span>
              </div>
              <ul className="space-y-1.5 text-slate-300">
                {Array.isArray(summary.whatWasLearned) ? (
                  summary.whatWasLearned.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-mono mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li>{summary.whatWasLearned}</li>
                )}
              </ul>
            </div>

            {/* Accomplished */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-2 text-xs font-mono uppercase">
                <Award className="w-4 h-4" />
                <span>What Was Accomplished</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {summary.whatWasAccomplished}
              </p>
            </div>
          </div>

          {/* Worked On & Difficulties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-300 font-bold mb-1.5 text-xs font-mono uppercase">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>What Was Worked On</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {summary.whatWasWorkedOn}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1.5 text-xs font-mono uppercase">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Friction Point / What Was Difficult</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {summary.whatWasDifficult}
              </p>
            </div>
          </div>

          {/* Study Location Tagging (Optional) */}
          <div className="p-3.5 rounded-xl bg-[#09132e]/90 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-[#00F0FF]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-white block">
                  Study Session Location
                </span>
                <span className="text-[10px] text-slate-400">
                  {currentLocation 
                    ? `Tagged: ${currentLocation.placeName}` 
                    : 'Optional: Pin where you studied (library, lab, home, cafe)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentLocation ? (
                <>
                  <LocationBadge location={currentLocation} />
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(prev => !prev)}
                    aria-expanded={isLocationModalOpen}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/40 text-cyan-300 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(prev => !prev)}
                  aria-expanded={isLocationModalOpen}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span>+ Add Location</span>
                </button>
              )}
            </div>
          </div>

          {/* Actionable Goal for Tomorrow */}
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
            <div className="flex items-center gap-2 text-emerald-300 font-bold mb-1.5 text-xs font-mono uppercase tracking-wider">
              <Target className="w-4 h-4 text-[#00ff66]" />
              <span>Actionable Goal for Tomorrow</span>
            </div>
            <p className="text-slate-100 font-medium">
              {summary.actionableGoalTomorrow}
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#0a1428] border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Markdown' : 'Copy as Markdown'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs font-mono tracking-wider shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all cursor-pointer flex items-center gap-2"
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Saved to Learning Timeline</span>
          </button>
        </div>

      </div>

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        initialLocation={currentLocation}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={handleLocationSelected}
      />
    </div>
  );
};
