import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="py-4 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-sm backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <img src="/logos/logo.png" alt="CMF Vision Logo" className="h-10 cursor-pointer hover:opacity-80 transition-opacity" />
            </a>
          </div>
          
          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-slate-900 hover:text-slate-700 font-bold transition-colors">Create</a>
            <a href="#" className="text-slate-900 hover:text-slate-700 font-bold transition-colors">Tutorial</a>
            <a href="#" className="text-slate-900 hover:text-slate-700 font-bold transition-colors">Library</a>
            <a href="#" className="text-slate-900 hover:text-slate-700 font-bold transition-colors">Price</a>
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
