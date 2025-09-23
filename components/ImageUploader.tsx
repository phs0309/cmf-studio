import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImagesUpload: (files: File[]) => void;
  onImageRemove?: (index: number) => void;
  previewUrls: (string | null)[];
  imageDescription: string;
  onImageDescriptionChange: (description: string) => void;
  productName: string;
  onProductNameChange: (name: string) => void;
  productPurpose: string;
  onProductPurposeChange: (purpose: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImagesUpload, 
  onImageRemove, 
  previewUrls, 
  imageDescription, 
  onImageDescriptionChange,
  productName,
  onProductNameChange,
  productPurpose,
  onProductPurposeChange
}) => {
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
      
      {/* Product Information Section */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">제품 정보</h3>
        
        {/* Product Name */}
        <div className="space-y-2">
          <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">
            제품명 <span className="text-red-500">*</span>
          </label>
          <input
            id="product-name"
            type="text"
            value={productName}
            onChange={(e) => onProductNameChange(e.target.value)}
            placeholder="예: iPhone 15 케이스, 무선 이어폰, 노트북"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Product Purpose */}
        <div className="space-y-2">
          <label htmlFor="product-purpose" className="block text-sm font-medium text-gray-700">
            타겟, 목적 <span className="text-red-500">*</span>
          </label>
          <input
            id="product-purpose"
            type="text"
            value={productPurpose}
            onChange={(e) => onProductPurposeChange(e.target.value)}
            placeholder="예: 20-30대 직장인을 위한 휴대폰 보호, 학생용 음악 감상, 게이머용 헤드셋"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </div>


        {/* Image Description */}
        <div className="space-y-2">
          <label htmlFor="image-description" className="block text-sm font-medium text-gray-700">
            추가 설명 (선택사항)
          </label>
          <textarea
            id="image-description"
            value={imageDescription}
            onChange={(e) => onImageDescriptionChange(e.target.value)}
            placeholder="특별한 요구사항이나 추가 설명을 입력해주세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
};