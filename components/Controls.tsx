import React from 'react';
import { MATERIALS } from '../constants';
import { SparklesIcon } from './icons/SparklesIcon';

interface ControlsProps {
  material: string;
  setMaterial: (material: string) => void;
  color: string;
  setColor: (color: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isReady: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  material,
  setMaterial,
  color,
  setColor,
  onGenerate,
  isLoading,
  isReady,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="material" className="block text-base font-medium text-gray-800 mb-2">
          소재 및 마감
        </label>
        <select
          id="material"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          className="w-full bg-gray-100 border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 text-base"
        >
          {MATERIALS.map((mat) => (
            <option key={mat} value={mat}>
              {mat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="color" className="block text-base font-medium text-gray-800 mb-2">
          기본 색상
        </label>
        <div className="flex items-center gap-3">
          <input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="p-1 h-12 w-12 block bg-white border border-gray-300 cursor-pointer rounded-lg"
          />
          <input
             type="text"
             value={color}
             onChange={(e) => setColor(e.target.value)}
             className="w-full bg-gray-100 border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 font-mono text-base"
          />
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={!isReady || isLoading}
        className="w-full flex items-center justify-center gap-2 text-blue-900 bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed focus:ring-4 focus:ring-blue-200 font-bold rounded-lg text-base px-5 py-3.5 text-center transition-colors duration-200"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            생성 중...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5" />
            디자인 생성하기
          </>
        )}
      </button>
    </div>
  );
};