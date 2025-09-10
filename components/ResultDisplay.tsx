import React from 'react';

interface ResultDisplayProps {
  originalImageUrls: string[];
  generatedImageUrl: string | null;
}

const ImageCard: React.FC<{ title: string; imageUrl: string | null; isGenerated?: boolean }> = ({ title, imageUrl, isGenerated = false }) => (
  <div className="flex flex-col gap-4">
    <h3 className={`text-xl font-semibold text-center ${isGenerated ? 'text-blue-600' : 'text-gray-800'}`}>{title}</h3>
    <div className="aspect-square w-full bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-200/80 shadow-sm">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
      ) : (
        <div className="flex items-center justify-center h-full p-4">
            <p className="text-gray-500 text-center">
              {isGenerated ? "AI result will appear here" : "Upload an image to see it here"}
            </p>
        </div>
      )}
    </div>
  </div>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImageUrls, generatedImageUrl }) => {
  const hasOriginals = originalImageUrls.length > 0;

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">Design Comparison</h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10 items-start">
        <div>
          <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">Original(s)</h3>
          <div className="grid grid-cols-2 gap-4 bg-gray-100 p-4 rounded-lg border border-gray-200/80 min-h-[100px]">
            {hasOriginals ? (
              originalImageUrls.map((url, index) => (
                <div key={index} className="aspect-square bg-white rounded-md overflow-hidden border border-gray-200">
                  <img src={url} alt={`Original ${index + 1}`} className="w-full h-full object-contain" />
                </div>
              ))
            ) : (
              <div className="col-span-2 aspect-square bg-white rounded-md border border-gray-200 flex items-center justify-center p-4">
                <p className="text-gray-500 text-center">Your uploaded images will appear here</p>
              </div>
            )}
          </div>
        </div>
        <ImageCard title="AI Generated" imageUrl={generatedImageUrl} isGenerated />
      </div>
    </div>
  );
};