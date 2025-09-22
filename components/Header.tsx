import React, { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  onNavigate?: (page: 'home' | 'cmf-editor' | 'blueprint-to-cmf') => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCreateDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreateClick = (type: 'cmf-editor' | 'blueprint-to-cmf') => {
    setIsCreateDropdownOpen(false);
    if (onNavigate) {
      onNavigate(type);
    }
  };

  return (
    <header className="py-4 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-sm backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate && onNavigate('home')} 
              className="flex items-center"
            >
              <img src="/logos/logo.png" alt="CMF Vision Logo" className="h-10 cursor-pointer hover:opacity-80 transition-opacity" />
            </button>
          </div>
          
          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center justify-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            {/* Create Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
                className="flex items-center gap-1 text-indigo-900 hover:text-indigo-700 font-bold transition-colors"
              >
                Create
                <svg 
                  className={`w-4 h-4 transition-transform ${isCreateDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {isCreateDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => handleCreateClick('cmf-editor')}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">CMF 수정</div>
                    <div className="text-xs text-gray-500 mt-1">기존 제품의 색상, 소재, 마감 수정</div>
                  </button>
                  <button
                    onClick={() => handleCreateClick('blueprint-to-cmf')}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                  >
                    <div className="font-medium">스케치를 CMF로</div>
                    <div className="text-xs text-gray-500 mt-1">스케치를 실제 제품으로 변환</div>
                  </button>
                </div>
              )}
            </div>
            
            <a href="#" className="text-indigo-900 hover:text-indigo-700 font-bold transition-colors">Tutorial</a>
            <a href="#" className="text-indigo-900 hover:text-indigo-700 font-bold transition-colors">Library</a>
            <a href="#" className="text-indigo-900 hover:text-indigo-700 font-bold transition-colors">Price</a>
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-slate-800 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
