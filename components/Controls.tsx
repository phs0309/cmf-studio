import React from 'react';
import { FINISHES, MaterialColorSet } from '../constants';
import { SparklesIcon } from './icons/SparklesIcon';
import { MaterialColorSets } from './MaterialColorSets';

interface ControlsProps {
  materialColorSets: MaterialColorSet[];
  onAddSet: () => void;
  onRemoveSet: (id: string) => void;
  onUpdateSet: (id: string, updates: Partial<MaterialColorSet>) => void;
  finish: string;
  setFinish: (finish: string) => void;
  description: string;
  setDescription: (description: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isReady: boolean;
  isLimitReached?: boolean;
  finishEnabled: boolean;
  setFinishEnabled: (enabled: boolean) => void;
  descriptionEnabled: boolean;
  setDescriptionEnabled: (enabled: boolean) => void;
  onAIRecommendMaterial?: (setId: string) => void;
  onAIRecommendColor?: (setId: string) => void;
  onAIRecommendFinish?: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  materialColorSets,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  finish,
  setFinish,
  description,
  setDescription,
  onGenerate,
  isLoading,
  isReady,
  isLimitReached = false,
  finishEnabled,
  setFinishEnabled,
  descriptionEnabled,
  setDescriptionEnabled,
  onAIRecommendMaterial,
  onAIRecommendColor,
  onAIRecommendFinish,
}) => {
  return (
    <div className="space-y-6">
      {/* Material-Color Sets */}
      <MaterialColorSets
        sets={materialColorSets}
        onAddSet={onAddSet}
        onRemoveSet={onRemoveSet}
        onUpdateSet={onUpdateSet}
        onAIRecommendMaterial={onAIRecommendMaterial}
        onAIRecommendColor={onAIRecommendColor}
      />

      {/* 마감 섹션 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label htmlFor="finish" className="text-base font-medium text-gray-800">
            마감
          </label>
          <div className="flex items-center gap-2">
            {onAIRecommendFinish && (
              <button
                onClick={onAIRecommendFinish}
                disabled={!finishEnabled}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI 추천
              </button>
            )}
            <button
              type="button"
              onClick={() => setFinishEnabled(!finishEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                finishEnabled ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  finishEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
        <select
          id="finish"
          value={finish}
          onChange={(e) => setFinish(e.target.value)}
          disabled={!finishEnabled}
          className={`w-full border-gray-300 text-gray-900 rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-3 text-base ${
            finishEnabled ? 'bg-gray-100' : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
        >
          {FINISHES.map((finishOption) => (
            <option key={finishOption} value={finishOption}>
              {finishOption}
            </option>
          ))}
        </select>
      </div>

      {/* 추가 설명 섹션 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label htmlFor="description" className="text-base font-medium text-gray-800">
            추가 설명
          </label>
          <button
            type="button"
            onClick={() => setDescriptionEnabled(!descriptionEnabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              descriptionEnabled ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                descriptionEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={descriptionEnabled ? "예: 가운데 A 로고를 그려줘" : "추가 설명이 비활성화되었습니다"}
          disabled={!descriptionEnabled}
          className={`w-full border-gray-300 text-gray-900 rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-3 text-base resize-none ${
            descriptionEnabled ? 'bg-gray-100' : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
          rows={3}
        />
      </div>

      <button
        onClick={onGenerate}
        disabled={!isReady || isLoading || isLimitReached}
        className="w-full flex items-center justify-center gap-2 text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed focus:ring-4 focus:ring-purple-200 font-bold rounded-xl text-base px-5 py-3.5 text-center transition-all duration-200 shadow-lg hover:shadow-xl"
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