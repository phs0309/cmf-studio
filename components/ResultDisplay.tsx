import React, { useState } from 'react';
import { ImageModal } from './ImageModal';

interface ResultDisplayProps {
  originalImageUrls: string[];
  generatedImageUrls: string[];
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImageUrls, generatedImageUrls }) => {
  const [modalImage, setModalImage] = useState<{ url: string; title: string } | null>(null);
  
  console.log('ResultDisplay - originalImageUrls:', originalImageUrls);
  console.log('ResultDisplay - generatedImageUrls:', generatedImageUrls);
  
  const hasOriginals = originalImageUrls.length > 0;
  const hasGenerated = generatedImageUrls.length > 0;

  const openModal = (url: string, title: string) => {
    setModalImage({ url, title });
  };

  const closeModal = () => {
    setModalImage(null);
  };

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">Design Comparison</h2>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10 items-start">
        {/* Original Images */}
        <div>
          <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">Original(s)</h3>
          <div className="grid grid-cols-2 gap-4 bg-gray-100 p-4 rounded-lg border border-gray-200/80 min-h-[200px]">
            {hasOriginals ? (
              originalImageUrls.map((url, index) => (
                <div 
                  key={index} 
                  className="aspect-square bg-white rounded-md overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => openModal(url, `Original Image ${index + 1}`)}
                >
                  <img src={url} alt={`Original ${index + 1}`} className="w-full h-full object-contain hover:scale-105 transition-transform" />
                </div>
              ))
            ) : (
              <div className="col-span-2 aspect-square bg-white rounded-md border border-gray-200 flex items-center justify-center p-4">
                <p className="text-gray-500 text-center">Your uploaded images will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Generated Images */}
        <div>
          <h3 className="text-xl font-semibold text-center text-blue-600 mb-4">AI Generated</h3>
          <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-200/80 min-h-[200px]">
            {hasGenerated ? (
              generatedImageUrls.map((url, index) => (
                <div 
                  key={index} 
                  className="aspect-square bg-white rounded-md overflow-hidden border border-blue-200 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => openModal(`data:image/png;base64,${url}`, `AI Generated Image ${index + 1}`)}
                >
                  <img 
                    src={`data:image/png;base64,${url}`} 
                    alt={`Generated ${index + 1}`} 
                    className="w-full h-full object-contain hover:scale-105 transition-transform" 
                  />
                </div>
              ))
            ) : (
              <div className="col-span-2 aspect-square bg-white rounded-md border border-blue-200 flex items-center justify-center p-4">
                <p className="text-gray-500 text-center">AI results will appear here</p>
              </div>
            )}
          </div>
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