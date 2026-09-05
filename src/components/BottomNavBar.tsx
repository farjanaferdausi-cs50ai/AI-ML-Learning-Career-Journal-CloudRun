import React from 'react';
import { 
  Home, 
  Map, 
  BookOpen, 
  Bot, 
  BarChart2, 
  Menu
} from 'lucide-react';

interface BottomNavBarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMobileMenu: () => void;
  isMenuOpen?: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenMobileMenu,
  isMenuOpen = false
}) => {
  const quickTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'roadmap', label: 'Roadmap', icon: Map },
    { id: 'coach', label: 'AI Coach', icon: Bot },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: BarChart2 },
  ];

  const handleTabClick = (id: string) => {
    onSelectTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav 
      id="mobile-bottom-navigation"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050b18]/95 backdrop-blur-lg border-t border-[#142347] px-1 sm:px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
    >
      {quickTabs.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            id={`bottom-nav-${item.id}`}
            onClick={() => handleTabClick(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1.5 sm:px-2 rounded-xl transition-all duration-200 ease-out cursor-pointer min-w-[52px] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:outline-none ${
              isActive
                ? 'text-[#00F0FF] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c162e]'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform duration-200 ease-out ${isActive ? 'scale-110 drop-shadow-[0_0_8px_#00F0FF]' : 'group-hover:scale-105'}`} />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]" aria-hidden="true" />
              )}
            </div>
            <span className={`text-[10px] font-medium mt-0.5 tracking-tight ${isActive ? 'font-bold text-cyan-300' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Menu / More Drawer Opener */}
      <button
        id="bottom-nav-menu"
        onClick={onOpenMobileMenu}
        aria-expanded={isMenuOpen}
        className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1.5 sm:px-2 rounded-xl transition-all duration-200 ease-out cursor-pointer min-w-[52px] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:outline-none ${
          isMenuOpen
            ? 'text-[#00F0FF] bg-[#0c162e] border border-[#00F0FF]/40 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
            : 'text-slate-400 hover:text-cyan-300 hover:bg-[#0c162e]'
        }`}
        aria-label="Toggle Full Navigation Menu"
      >
        <Menu className="w-5 h-5 transition-transform duration-200 hover:scale-105" />
        <span className="text-[10px] font-medium mt-0.5 tracking-tight">
          Menu
        </span>
      </button>
    </nav>
  );
};
