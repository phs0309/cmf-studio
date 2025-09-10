import React from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

const logoUrl = 'data:image/png;base64,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';

interface HeaderProps {
  onNavigateBack: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateBack }) => {
  return (
    <header className="py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={logoUrl} alt="AI CMF Designer Logo" className="h-8" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              AI CMF Designer
            </h1>
            <p className="text-sm text-gray-600">
              Instantly visualize new Color, Material, and Finish combinations for your products.
            </p>
          </div>
        </div>
        <button
          onClick={onNavigateBack}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          aria-label="Back to menu"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Menu
        </button>
      </div>
    </header>
  );
};
