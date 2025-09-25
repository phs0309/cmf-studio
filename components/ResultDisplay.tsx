import React, { useState } from 'react';
import { ImageModal } from './ImageModal';

interface ResultDisplayProps {
  generatedImageUrls: string[];
  onImportToCMFEdit?: (imageUrl: string, imageIndex: number) => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ generatedImageUrls, onImportToCMFEdit }) => {
  const [modalImage, setModalImage] = useState<{ url: string; title: string } | null>(null);
  
  console.log('ResultDisplay - generatedImageUrls:', generatedImageUrls);
  
  const hasGenerated = generatedImageUrls.length > 0;

  const openModal = (url: string, title: string) => {
    setModalImage({ url, title });
  };

  const closeModal = () => {
    setModalImage(null);
  };

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">🎨 AI 디자인 결과</h2>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-200/80">
          {hasGenerated ? (
            generatedImageUrls.map((url, index) => (
              <div 
                key={index} 
                className="aspect-square bg-white rounded-xl overflow-hidden border border-blue-200 relative group hover:shadow-2xl transition-all duration-300"
              >
                <img 
                  src={`data:image/png;base64,${url}`} 
                  alt={`Generated Design ${index + 1}`} 
                  className="w-full h-full object-contain cursor-pointer hover:scale-110 transition-transform duration-300" 
                  onClick={() => openModal(`data:image/png;base64,${url}`, `AI Generated Design ${index + 1}`)}
                />
                
                {/* Import to CMF Edit Button */}
                {onImportToCMFEdit && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onImportToCMFEdit(`data:image/png;base64,${url}`, index);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg flex items-center gap-2 transform scale-95 group-hover:scale-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      CMF 수정하기
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full aspect-video bg-white rounded-xl border border-blue-200 flex flex-col items-center justify-center p-8">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-gray-500 text-center text-lg">AI가 생성한 디자인이 여기에 표시됩니다</p>
              <p className="text-gray-400 text-center text-sm mt-2">잠시만 기다려주세요...</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Image Modal */}
      {modalImage && (
        <ImageModal
          isOpen={true}
          onClose={closeModal}
          imageUrl={modalImage.url}
          title={modalImage.title}
        />
      )}
    </div>
  );
};