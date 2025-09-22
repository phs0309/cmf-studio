import React from 'react';
import { MATERIALS } from '../constants';
import { CMYKColorPicker } from './CMYKColorPicker';
import { TrashIcon } from './icons/TrashIcon';
import { MaterialColorSet } from '../constants';

interface MaterialColorSetsProps {
  sets: MaterialColorSet[];
  onAddSet: () => void;
  onRemoveSet: (id: string) => void;
  onUpdateSet: (id: string, updates: Partial<MaterialColorSet>) => void;
  onAIRecommendMaterial?: (setId: string) => void;
  onAIRecommendColor?: (setId: string) => void;
}

export const MaterialColorSets: React.FC<MaterialColorSetsProps> = ({
  sets,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onAIRecommendMaterial,
  onAIRecommendColor,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">소재 & 색상 세트</h3>
        <button
          onClick={onAddSet}
          disabled={sets.length >= 3}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          세트 추가 ({sets.length}/3)
        </button>
      </div>

      <div className="space-y-4">
        {sets.map((set, index) => (
          <div
            key={set.id}
            className={`border rounded-lg p-4 transition-all ${
              set.enabled ? 'border-purple-200 bg-purple-50/50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-purple-600 rounded-full">
                  {index + 1}
                </span>
                <h4 className="font-medium text-gray-900">세트 {index + 1}</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateSet(set.id, { enabled: !set.enabled })}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    set.enabled ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      set.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                {sets.length > 1 && (
                  <button
                    onClick={() => onRemoveSet(set.id)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className={`space-y-4 ${!set.enabled ? 'opacity-50' : ''}`}>
              {/* 소재 선택 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">소재</label>
                  {onAIRecommendMaterial && (
                    <button
                      onClick={() => onAIRecommendMaterial(set.id)}
                      disabled={!set.enabled}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      AI 추천
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {MATERIALS.map((material) => (
                    <div
                      key={material.name}
                      onClick={() => set.enabled && onUpdateSet(set.id, { material: material.name })}
                      className={`cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                        set.material === material.name 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${
                        !set.enabled ? 'cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="p-2">
                        <div className="flex items-center space-x-2">
                          <img
                            src={material.thumbnail}
                            alt={material.name}
                            className="w-8 h-8 rounded object-cover border border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-xs font-medium truncate ${
                              set.material === material.name ? 'text-purple-900' : 'text-gray-900'
                            }`}>
                              {material.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 색상 선택 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">색상</label>
                  {onAIRecommendColor && (
                    <button
                      onClick={() => onAIRecommendColor(set.id)}
                      disabled={!set.enabled}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      AI 추천
                    </button>
                  )}
                </div>
                <CMYKColorPicker
                  value={set.color}
                  onChange={(color) => onUpdateSet(set.id, { color })}
                  disabled={!set.enabled}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};