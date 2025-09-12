import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  index: number;
  onImageUpload: (file: File, index: number) => void;
  previewUrl: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ index, onImageUpload, previewUrl }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0], index);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0], index);
    }
  }, [onImageUpload, index]);

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

  return (
    <div className="w-full">
      <label
        htmlFor={`dropzone-file-${index}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`flex justify-center items-center w-full aspect-square border rounded-lg cursor-pointer transition-colors duration-300 relative overflow-hidden ${isDragging ? 'border-blue-500 bg-blue-50' : 'bg-gray-100 border-gray-300 hover:border-gray-400'}`}
      >
        {previewUrl ? (
          <img src={previewUrl} alt={`제품 미리보기 ${index + 1}`} className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-2">
            <UploadIcon className="w-8 h-8 mb-3 text-gray-500" />
            <p className="mb-2 text-sm text-gray-600">
              <span className="font-semibold text-blue-600">업로드</span> 또는 드래그
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
          </div>
        )}
        <input id={`dropzone-file-${index}`} type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
      </label>
    </div>
  );
};