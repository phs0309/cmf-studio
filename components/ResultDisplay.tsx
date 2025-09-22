import React, { useState } from 'react';
import { ImageModal } from './ImageModal';

interface ResultDisplayProps {
  generatedImageUrls: string[];
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ generatedImageUrls }) => {
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
                className="aspect-square bg-white rounded-xl overflow-hidden border border-blue-200 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105"
                onClick={() => openModal(`data:image/png;base64,${url}`, `AI Generated Design ${index + 1}`)}
              >
                <img 
                  src={`data:image/png;base64,${url}`} 
                  alt={`Generated Design ${index + 1}`} 
                  className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" 
                />
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