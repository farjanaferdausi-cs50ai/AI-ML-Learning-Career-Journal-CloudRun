import React from 'react';
import { DashboardCenterContent } from './DashboardCenterContent';
import { DashboardRightSidebar } from './DashboardRightSidebar';
import type { Topic, JournalSession } from '../types';

interface DashboardViewProps {
  onContinueLearning?: (prompt?: string) => void;
  onWatchOverview?: () => void;
  onNavigateTab?: (tab: string) => void;
  onAICoachPrompt?: (prompt: string) => void;
  topics?: Topic[];
  sessions?: JournalSession[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onContinueLearning,
  onWatchOverview,
  onNavigateTab,
  onAICoachPrompt,
  topics = [],
  sessions = []
}) => {
  return (
    <div className="w-full mx-auto">
      {/* 3-Column Proportional Layout: Sidebar (3%), Main Content (87%), AI Assistant (10%) */}
      <div className="flex flex-col xl:flex-row gap-4 xl:gap-5 items-start w-full">
        
        {/* Main Content Area: Takes 87% of total screen width (89.7% of the 97% workspace) */}
        <div className="w-full xl:w-[89.7%] min-w-0">
          <DashboardCenterContent 
            onContinueLearning={onContinueLearning}
            onWatchOverview={onWatchOverview}
            onNavigateTab={onNavigateTab}
            topics={topics}
            sessions={sessions}
          />
        </div>

        {/* AI Assistant Right Panel: Takes 10% of total screen width (10.3% of the 97% workspace) */}
        <div className="w-full xl:w-[10.3%] xl:min-w-[170px] min-w-0 xl:sticky xl:top-4 space-y-3 shrink-0">
          <DashboardRightSidebar 
            onAICoachPrompt={onAICoachPrompt || onContinueLearning}
            onNavigateTab={onNavigateTab}
            sessions={sessions}
          />
        </div>

      </div>
    </div>
  );
};
