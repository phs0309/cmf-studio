import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Controls } from './components/Controls';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { generateCmfDesign } from './services/geminiService';
import { MATERIALS } from './constants';
import { ChevronLeftIcon } from './components/icons/ChevronLeftIcon';

const App: React.FC = () => {
  const [designerStep, setDesignerStep] = useState<1 | 2>(1);
  const [freeUsageCount, setFreeUsageCount] = useState<number>(0);


  // Designer states
  const [originalImages, setOriginalImages] = useState<Array<{ file: File | null; previewUrl: string | null }>>(
    Array.from({ length: 3 }, () => ({ file: null, previewUrl: null }))
  );
  const [material, setMaterial] = useState<string>(MATERIALS[0]);
  const [color, setColor] = useState<string>('#007aff'); // Apple-like blue
  const [description, setDescription] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize free usage count from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('cmf-free-usage-count');
    if (savedCount) {
      setFreeUsageCount(parseInt(savedCount, 10));
    }
  }, []);


  const handleImagesUpload = (files: File[]) => {
    // Clean up existing URLs
    originalImages.forEach(image => {
      if (image.previewUrl) {
        URL.revokeObjectURL(image.previewUrl);
      }
    });

    const newImages = Array.from({ length: 3 }, () => ({ file: null, previewUrl: null }));
    files.forEach((file, index) => {
      if (index < 3) {
        const previewUrl = URL.createObjectURL(file);
        newImages[index] = { file, previewUrl };
      }
    });
    
    setOriginalImages(newImages);
    setGeneratedImage(null);
    setError(null);
  };
  
  useEffect(() => {
    return () => {
      originalImages.forEach(image => {
        if (image.previewUrl) {
          URL.revokeObjectURL(image.previewUrl);
        }
      });
    };
  }, [originalImages]);


  const handleGenerate = useCallback(async () => {
    const uploadedFiles = originalImages.map(img => img.file).filter((file): file is File => file !== null);

    if (uploadedFiles.length === 0) {
      setError('Please upload at least one product image.');
      return;
    }

    // Check free usage limit
    if (freeUsageCount >= 4) {
      setError('무료 체험 횟수(4회)를 모두 사용하셨습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const newImageBase64 = await generateCmfDesign(uploadedFiles, material, color, description);
      setGeneratedImage(`data:image/png;base64,${newImageBase64}`);
      
      // Increment free usage count
      const newCount = freeUsageCount + 1;
      setFreeUsageCount(newCount);
      localStorage.setItem('cmf-free-usage-count', newCount.toString());
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImages, material, color, description, userAccessCode, freeUsageCount]);
  
  const handleRedo = () => {
    setOriginalImages(Array.from({ length: 3 }, () => ({ file: null, previewUrl: null })));
    setGeneratedImage(null);
    setError(null);
    setMaterial(MATERIALS[0]);
    setColor('#007aff');
    setDescription('');
    setDesignerStep(1);
  };


  const isReadyToGenerate = originalImages.some(img => img.file !== null);
  const originalImageUrls = originalImages.map(img => img.previewUrl).filter((url): url is string => url !== null);
  const showResults = (generatedImage || (designerStep === 2 && isReadyToGenerate)) && !isLoading;
  
  const goToNextStep = () => setDesignerStep(2);
  const goToPrevStep = () => setDesignerStep(1);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-12">
        {designerStep === 1 && (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-6 bg-white p-8 rounded-xl border border-gray-200/80 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">CMF 디자인 하기</h2>
                        <p className="text-base text-gray-600">최대 3개의 제품 이미지를 업로드할 수 있습니다 (예: 다른 각도).</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">무료 체험</p>
                        <p className="text-lg font-semibold text-blue-600">
                            {freeUsageCount}/4회 사용
                        </p>
                        {freeUsageCount >= 4 && (
                            <p className="text-xs text-red-500 mt-1">체험 횟수 소진</p>
                        )}
                    </div>
                </div>
                <div className="pt-4">
                    <ImageUploader
                        onImagesUpload={handleImagesUpload}
                        previewUrls={originalImages.map(img => img.previewUrl)}
                    />
                </div>
                 <div className="pt-6 text-right">
                    <button
                        onClick={goToNextStep}
                        disabled={!isReadyToGenerate}
                        className="inline-flex items-center justify-center gap-2 text-blue-900 bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed focus:ring-4 focus:ring-blue-300 font-bold rounded-lg text-base px-6 py-3 text-center transition-colors duration-200"
                        >
                        다음 단계 &rarr;
                    </button>
                </div>
            </div>
          </div>
        )}
        
        {designerStep === 2 && (
            <>
                <div className="max-w-5xl mx-auto">
                    <div className="space-y-6 bg-white p-8 rounded-xl border border-gray-200/80 shadow-sm">
                         <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-semibold text-gray-900">2. 사용자 정의 및 생성</h2>
                            <button
                                onClick={goToPrevStep}
                                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                aria-label="이미지 업로드로 돌아가기"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                                이전
                            </button>
                        </div>
                        <Controls
                        material={material}
                        setMaterial={setMaterial}
                        color={color}
                        setColor={setColor}
                        description={description}
                        setDescription={setDescription}
                        onGenerate={handleGenerate}
                        isLoading={isLoading}
                        isReady={isReadyToGenerate}
                        isLimitReached={freeUsageCount >= 4}
                        />
                    </div>
                </div>

                {error && (
                <div className="max-w-5xl mx-auto mt-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                    <p>{error}</p>
                </div>
                )}

                {isLoading && (
                <div className="mt-16 flex flex-col items-center justify-center">
                    <Loader />
                    <p className="mt-4 text-lg text-gray-700">AI가 제품을 재디자인 중입니다...</p>
                    <p className="text-sm text-gray-500">잠시만 기다려주세요.</p>
                </div>
                )}
                
                {showResults && (
                <>
                    <ResultDisplay originalImageUrls={originalImageUrls} generatedImageUrl={generatedImage} />
                    {generatedImage && (
                        <div className="max-w-5xl mx-auto mt-8 flex justify-center gap-4">
                            <button
                                onClick={handleRedo}
                                className="text-black bg-gray-300 hover:bg-gray-400 focus:ring-4 focus:ring-gray-300 font-bold rounded-lg text-base px-6 py-3 text-center transition-colors duration-200"
                            >
                                다시 하기
                            </button>
                        </div>
                    )}
                </>
                )}
            </>
        )}

      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Gemini API 제공</p>
      </footer>
    </div>
  );
};

export default App;