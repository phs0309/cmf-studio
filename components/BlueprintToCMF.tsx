import React, { useState, useCallback } from 'react';
import { ImageUploader } from './ImageUploader';
import { Controls } from './Controls';
import { ResultDisplay } from './ResultDisplay';
import { Loader } from './Loader';
import { generateCmfDesign } from '../services/geminiService';
import { MATERIALS, FINISHES, MaterialColorSet } from '../constants';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface BlueprintToCMFProps {
  onNavigateHome: () => void;
}

export const BlueprintToCMF: React.FC<BlueprintToCMFProps> = ({ onNavigateHome }) => {
  // Image states
  const [originalImages, setOriginalImages] = useState<Array<{ file: File | null; previewUrl: string | null }>>(
    Array.from({ length: 3 }, () => ({ file: null, previewUrl: null }))
  );
  const [imageDescription, setImageDescription] = useState<string>('');
  
  // CMF states
  const [materialColorSets, setMaterialColorSets] = useState<MaterialColorSet[]>([
    { id: '1', material: MATERIALS[0].name, color: '#007aff', enabled: true }
  ]);
  const [finish, setFinish] = useState<string>(FINISHES[0]);
  const [description, setDescription] = useState<string>('');
  
  // Result states
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [designExplanation, setDesignExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Toggle states
  const [finishEnabled, setFinishEnabled] = useState<boolean>(false);
  const [descriptionEnabled, setDescriptionEnabled] = useState<boolean>(false);

  const handleImagesUpload = (files: File[]) => {
    const newImages = [...originalImages];
    let addedCount = 0;
    
    files.forEach((file) => {
      const emptyIndex = newImages.findIndex(img => img.file === null);
      if (emptyIndex !== -1 && addedCount < 3) {
        const previewUrl = URL.createObjectURL(file);
        newImages[emptyIndex] = { file, previewUrl };
        addedCount++;
      }
    });
    
    setOriginalImages(newImages);
    setGeneratedImages([]);
    setDesignExplanation('');
    setError(null);
  };

  const handleExampleImageSelect = async (imagePath: string) => {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const fileName = imagePath.split('/').pop() || 'blueprint.jpg';
      const file = new File([blob], fileName, { type: blob.type });
      
      handleImagesUpload([file]);
    } catch (error) {
      console.error('Error loading example image:', error);
      setError('예시 이미지를 불러오는데 실패했습니다.');
    }
  };

  const handleImageRemove = (index: number) => {
    const newImages = [...originalImages];
    if (newImages[index].previewUrl) {
      URL.revokeObjectURL(newImages[index].previewUrl!);
    }
    newImages[index] = { file: null, previewUrl: null };
    setOriginalImages(newImages);
    setGeneratedImages([]);
    setDesignExplanation('');
    setError(null);
  };

  // Material-Color set management
  const addMaterialColorSet = () => {
    if (materialColorSets.length < 3) {
      const newSet: MaterialColorSet = {
        id: Date.now().toString(),
        material: MATERIALS[0].name,
        color: '#007aff',
        enabled: true
      };
      setMaterialColorSets([...materialColorSets, newSet]);
    }
  };

  const removeMaterialColorSet = (id: string) => {
    if (materialColorSets.length > 1) {
      setMaterialColorSets(materialColorSets.filter(set => set.id !== id));
    }
  };

  const updateMaterialColorSet = (id: string, updates: Partial<MaterialColorSet>) => {
    setMaterialColorSets(materialColorSets.map(set => 
      set.id === id ? { ...set, ...updates } : set
    ));
  };

  // AI recommendation handlers
  const handleAIRecommendMaterial = async (setId: string) => {
    const blueprintMaterials = MATERIALS.filter(m => 
      m.name.includes('Metal') || m.name.includes('Plastic') || m.name.includes('Carbon')
    );
    
    const randomMaterial = blueprintMaterials[Math.floor(Math.random() * blueprintMaterials.length)];
    
    updateMaterialColorSet(setId, { 
      material: randomMaterial?.name || MATERIALS[0].name,
      enabled: true 
    });
    
    alert(`🎨 AI 추천: ${randomMaterial?.name}\n\n설계도 구현에 적합한 실용적인 소재입니다. 내구성과 제조 효율성을 고려하여 선택되었습니다.`);
  };

  const handleAIRecommendColor = async (setId: string) => {
    const professionalColors = [
      '#2C3E50', // Dark Blue
      '#34495E', // Dark Gray
      '#7F8C8D', // Gray
      '#95A5A6', // Light Gray
      '#BDC3C7', // Silver
      '#ECF0F1', // Light Silver
      '#E74C3C', // Red (accent)
      '#3498DB'  // Blue (accent)
    ];
    
    const randomColor = professionalColors[Math.floor(Math.random() * professionalColors.length)];
    
    updateMaterialColorSet(setId, { 
      color: randomColor,
      enabled: true 
    });
    
    alert(`🎨 AI 추천 색상: ${randomColor}\n\n전문적이고 실용적인 색상으로 제품의 기능성을 강조합니다.`);
  };

  const handleAIRecommendFinish = async () => {
    const functionalFinishes = ['Matte', 'Brushed', 'Textured'];
    const randomFinish = functionalFinishes[Math.floor(Math.random() * functionalFinishes.length)];
    
    setFinish(randomFinish);
    setFinishEnabled(true);
    
    alert(`🎨 AI 추천 마감: ${randomFinish}\n\n설계도 기반 제품에 적합한 기능적 마감으로 내구성과 실용성을 제공합니다.`);
  };

  const handleGenerate = useCallback(async () => {
    const uploadedFiles = originalImages.map(img => img.file).filter((file): file is File => file !== null);

    if (uploadedFiles.length === 0) {
      setError('설계도 이미지를 업로드해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setDesignExplanation('');

    try {
      const enabledSets = materialColorSets.filter(set => set.enabled);
      const materials = enabledSets.map(set => set.material);
      const colors = enabledSets.map(set => set.color);
      
      // Enhanced prompt for blueprint to CMF conversion
      const blueprintDescription = `Convert this blueprint/technical drawing into a realistic product visualization. Apply the specified materials and colors to create a professional product rendering. ${description}`;
      
      const result = await generateCmfDesign(uploadedFiles, materials, colors, blueprintDescription);
      setGeneratedImages(result.images);
      setDesignExplanation(result.explanation);
      
    } catch (err) {
      console.error(err);
      let errorMessage = 'An unknown error occurred. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('Timeout')) {
          errorMessage = '처리 시간이 너무 오래 걸립니다. 이미지 크기를 줄이거나 더 간단한 설정으로 다시 시도해주세요.';
        } else if (err.message.includes('API_KEY')) {
          errorMessage = 'AI 서비스 설정에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
        } else if (err.message.includes('failed to fetch') || err.message.includes('network')) {
          errorMessage = '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [originalImages, materialColorSets, description]);

  const handleReset = () => {
    setOriginalImages(Array.from({ length: 3 }, () => ({ file: null, previewUrl: null })));
    setGeneratedImages([]);
    setDesignExplanation('');
    setError(null);
    setMaterialColorSets([{ id: '1', material: MATERIALS[0].name, color: '#007aff', enabled: true }]);
    setFinish(FINISHES[0]);
    setDescription('');
    setImageDescription('');
    setFinishEnabled(false);
    setDescriptionEnabled(false);
  };

  const isReadyToGenerate = originalImages.some(img => img.file !== null);
  const originalImageUrls = originalImages.map(img => img.previewUrl).filter((url): url is string => url !== null);
  const showResults = (generatedImages.length > 0 || isReadyToGenerate) && !isLoading;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors mb-4"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          홈으로 돌아가기
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">설계도를 CMF로</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          기술 도면이나 설계도를 실제 제품 비주얼로 변환하고<br />
          원하는 색상, 소재, 마감을 적용해보세요
        </p>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-6 bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-pink-300/70">
        <h2 className="text-2xl font-semibold text-gray-900">1. 설계도 업로드</h2>
        <div className="space-y-4">
          <p className="text-base text-gray-600">기술 도면, CAD 파일, 스케치 등을 업로드해주세요 (최대 3개).</p>
          <ImageUploader
            onImagesUpload={handleImagesUpload}
            onExampleImageSelect={handleExampleImageSelect}
            onImageRemove={handleImageRemove}
            previewUrls={originalImages.map(img => img.previewUrl)}
            imageDescription={imageDescription}
            onImageDescriptionChange={setImageDescription}
          />
        </div>
      </div>

      {/* Controls Section */}
      {isReadyToGenerate && (
        <div className="space-y-6 bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-pink-300/70">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">2. CMF 디자인 설정</h2>
            <p className="text-sm text-gray-600">실제 제품으로 구현할 소재, 색상, 마감을 설정하세요</p>
          </div>
          <Controls
            materialColorSets={materialColorSets}
            onAddSet={addMaterialColorSet}
            onRemoveSet={removeMaterialColorSet}
            onUpdateSet={updateMaterialColorSet}
            finish={finish}
            setFinish={setFinish}
            description={description}
            setDescription={setDescription}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            isReady={isReadyToGenerate}
            isLimitReached={false}
            finishEnabled={finishEnabled}
            setFinishEnabled={setFinishEnabled}
            descriptionEnabled={descriptionEnabled}
            setDescriptionEnabled={setDescriptionEnabled}
            onAIRecommendMaterial={handleAIRecommendMaterial}
            onAIRecommendColor={handleAIRecommendColor}
            onAIRecommendFinish={handleAIRecommendFinish}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-16 flex flex-col items-center justify-center">
          <Loader />
          <p className="mt-4 text-lg text-gray-700">설계도를 실제 제품으로 변환 중입니다...</p>
          <p className="text-sm text-gray-500">AI 처리에 2-5분 정도 소요됩니다.</p>
          <p className="text-xs text-gray-400 mt-2">복잡한 설계도는 처리 시간이 더 걸릴 수 있습니다.</p>
        </div>
      )}
      
      {showResults && (
        <>
          <ResultDisplay originalImageUrls={originalImageUrls} generatedImageUrls={generatedImages} />
          
          {/* Design Explanation */}
          {designExplanation && generatedImages.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  🎨 설계도 변환 분석
                </h3>
                <div className="bg-white/80 rounded-xl p-6 shadow-sm">
                  <p className="text-blue-800 leading-relaxed text-base whitespace-pre-line">
                    {designExplanation}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {generatedImages.length > 0 && (
            <div className="flex justify-center gap-4">
              <button
                onClick={handleReset}
                className="text-gray-700 bg-white/90 hover:bg-white border border-gray-200 hover:border-gray-300 focus:ring-4 focus:ring-purple-200 font-bold rounded-xl text-base px-6 py-3 text-center transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
              >
                다시 하기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};