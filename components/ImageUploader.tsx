import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { ExampleImages } from './ExampleImages';

interface ImageUploaderProps {
  onImagesUpload: (files: File[]) => void;
  onExampleImageSelect: (imagePath: string) => void;
  onImageRemove?: (index: number) => void;
  previewUrls: (string | null)[];
  imageDescription: string;
  onImageDescriptionChange: (description: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesUpload, onExampleImageSelect, onImageRemove, previewUrls, imageDescription, onImageDescriptionChange }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 3);
      onImagesUpload(filesArray);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files).slice(0, 3);
      onImagesUpload(filesArray);
    }
  }, [onImagesUpload]);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
    
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
    
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const hasImages = previewUrls.some(url => url !== null);

  return (
    <div className="w-full space-y-6">
      <label
        htmlFor="dropzone-file"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`flex justify-center items-center w-full min-h-64 border rounded-lg cursor-pointer transition-colors duration-300 relative overflow-hidden ${isDragging ? 'border-blue-500 bg-blue-50' : 'bg-gray-100 border-gray-300 hover:border-gray-400'}`}
      >
        {hasImages ? (
          <div className="w-full p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {previewUrls.map((url, index) => (
                url ? (
                  <div key={index} className="aspect-square bg-gray-50 rounded-lg overflow-hidden relative group">
                    <img src={url} alt={`제품 미리보기 ${index + 1}`} className="w-full h-full object-cover" />
                    {onImageRemove && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onImageRemove(index);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ) : null
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-2">
            <UploadIcon className="w-12 h-12 mb-4 text-gray-500" />
            <p className="mb-2 text-lg text-gray-600">
              <span className="font-semibold text-blue-600">클릭하여 업로드</span> 또는 드래그
            </p>
            <p className="text-sm text-gray-500 mb-1">최대 3개의 이미지를 업로드할 수 있습니다</p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
          </div>
        )}
        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" multiple />
      </label>
      
      {/* Image Description Input */}
      <div className="space-y-2">
        <label htmlFor="image-description" className="block text-sm font-medium text-gray-700">
          이미지 설명 (선택사항)
        </label>
        <textarea
          id="image-description"
          value={imageDescription}
          onChange={(e) => onImageDescriptionChange(e.target.value)}
          placeholder="제품에 대한 설명을 입력해주세요 (예: 스마트폰 케이스, 무선 이어폰 등)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
          rows={3}
        />
      </div>
      
      {/* Example Images Section */}
      <ExampleImages onImageSelect={onExampleImageSelect} />
    </div>
  );
};