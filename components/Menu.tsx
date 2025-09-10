import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface MenuProps {
  onStartDesigner: (type: 'premium' | 'free') => void;
  onNavigateToAdmin: () => void;
}

export const Menu: React.FC<MenuProps> = ({ onStartDesigner, onNavigateToAdmin }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans p-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          AI CMF Designer
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Upload a product image, choose a material and color, and let AI generate a new design concept. CMF (Color, Material, Finish) design made easy.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
          <button
            onClick={() => onStartDesigner('premium')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-blue-900 bg-blue-200 hover:bg-blue-300 focus:ring-4 focus:ring-blue-300 font-bold rounded-lg text-base px-6 py-3.5 text-center transition-colors duration-200 shadow-sm"
          >
            <SparklesIcon className="w-5 h-5" />
            라오닉스 CMF 디자인 하기
          </button>
          <button
            onClick={() => onStartDesigner('free')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-black bg-gray-300 hover:bg-gray-400 focus:ring-4 focus:ring-gray-300 font-bold rounded-lg text-base px-6 py-3.5 text-center transition-colors duration-200 shadow-sm"
          >
             <SparklesIcon className="w-5 h-5" />
            무료 CMF 디자인 체험하기
          </button>
        </div>
      </div>
       <footer className="absolute bottom-0 text-center py-6 text-gray-500 text-sm space-y-2">
        <button onClick={onNavigateToAdmin} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Admin Panel</button>
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
};