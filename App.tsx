import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Controls } from './components/Controls';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { generateCmfDesign } from './services/geminiService';
import { MATERIALS } from './constants';
import { Menu } from './components/Menu';
import { ChevronLeftIcon } from './components/icons/ChevronLeftIcon';
import { CodeEntryModal } from './components/CodeEntryModal';
import { getRecommendedDesigns, addSubmission } from './services/apiService';
import type { RecommendedDesign } from './services/apiService';
import { RecommendationCard } from './components/RecommendationCard';
import { AdminPage } from './components/AdminPage';
import { SubmissionModal } from './components/SubmissionModal';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'menu' | 'designer' | 'admin'>('menu');
  const [designerStep, setDesignerStep] = useState<1 | 2>(1);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [userAccessCode, setUserAccessCode] = useState<string | null>(null);
  
  // Recommendations state
  const [recommendations, setRecommendations] = useState<RecommendedDesign[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState<boolean>(false);

  // Submission Modal state
  const [showSubmissionModal, setShowSubmissionModal] = useState<boolean>(false);


  // Designer states
  const [originalImages, setOriginalImages] = useState<Array<{ file: File | null; previewUrl: string | null }>>(
    Array.from({ length: 3 }, () => ({ file: null, previewUrl: null }))
  );
  const [material, setMaterial] = useState<string>(MATERIALS[0]);
  const [color, setColor] = useState<string>('#007aff'); // Apple-like blue
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch recommendations based on access code
  useEffect(() => {
    if (currentPage === 'designer' && designerStep === 1 && userAccessCode) {
      setRecommendationsLoading(true);
      getRecommendedDesigns(userAccessCode)
        .then(setRecommendations)
        .catch(err => console.error("Failed to fetch recommendations", err))
        .finally(() => setRecommendationsLoading(false));
    }
  }, [currentPage, designerStep, userAccessCode]);

  const handleImageUpload = (file: File, index: number) => {
    if (originalImages[index].previewUrl) {
        URL.revokeObjectURL(originalImages[index].previewUrl!);
    }

    const newImages = [...originalImages];
    const previewUrl = URL.createObjectURL(file);
    newImages[index] = { file, previewUrl };
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

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const newImageBase64 = await generateCmfDesign(uploadedFiles, material, color);
      setGeneratedImage(`data:image/png;base64,${newImageBase64}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImages, material, color]);
  
  const handleRedo = () => {
    setOriginalImages(Array.from({ length: 3 }, () => ({ file: null, previewUrl: null })));
    setGeneratedImage(null);
    setError(null);
    setMaterial(MATERIALS[0]);
    setColor('#007aff');
    setDesignerStep(1);
  };

  const handleSendSubmission = async (comment: string) => {
    const originalImageFiles = originalImages.map(img => img.file).filter((file): file is File => file !== null);

    if (!userAccessCode || !generatedImage || originalImageFiles.length === 0) {
      throw new Error("Missing required data for submission.");
    }
    
    await addSubmission({
      accessCode: userAccessCode,
      comment: comment,
      originalImageFiles: originalImageFiles,
      generatedImageUrl: generatedImage,
    });
    
    setShowSubmissionModal(false);
    alert('성공적으로 라오닉스에게 전송되었습니다!');
  };


  const isReadyToGenerate = originalImages.some(img => img.file !== null);
  const originalImageUrls = originalImages.map(img => img.previewUrl).filter((url): url is string => url !== null);
  const showResults = (generatedImage || (designerStep === 2 && isReadyToGenerate)) && !isLoading;
  
  const navigateToDesigner = () => {
    setCurrentPage('designer');
    setDesignerStep(1);
    setOriginalImages(Array.from({ length: 3 }, () => ({ file: null, previewUrl: null })));
    setGeneratedImage(null);
    setError(null);
  };
  const navigateToMenu = () => {
      setCurrentPage('menu');
  };
  const navigateToAdmin = () => {
      setCurrentPage('admin');
  }
  const goToNextStep = () => setDesignerStep(2);
  const goToPrevStep = () => setDesignerStep(1);

  const handleStartDesigner = (type: 'premium' | 'free') => {
      if (type === 'premium') {
          setShowCodeModal(true);
      } else {
          setUserAccessCode(null);
          setRecommendations([]);
          navigateToDesigner();
      }
  };
  
  const handleCodeSuccess = (code: string) => {
      setShowCodeModal(false);
      setUserAccessCode(code);
      navigateToDesigner();
  }


  if (currentPage === 'menu') {
    return (
        <>
            <Menu onStartDesigner={handleStartDesigner} onNavigateToAdmin={navigateToAdmin} />
            {showCodeModal && <CodeEntryModal onClose={() => setShowCodeModal(false)} onSuccess={handleCodeSuccess} />}
        </>
    );
  }

  if (currentPage === 'admin') {
      return <AdminPage onNavigateBack={navigateToMenu} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header onNavigateBack={navigateToMenu} />
      <main className="container mx-auto px-4 py-12">
        {designerStep === 1 && (
          <div className="max-w-5xl mx-auto space-y-8">
            {userAccessCode && (
              <div className="bg-white p-8 rounded-xl border border-gray-200/80 shadow-sm">
                  <h2 className="text-2xl font-semibold text-gray-900">라오닉스의 추천</h2>
                  <p className="mt-2 text-base text-gray-600">라오닉스가 추천하는 CMF 디자인으로 영감을 받아보세요.</p>
                  {recommendationsLoading ? (
                      <div className="grid grid-cols-1 gap-8 pt-4">
                          {/* Skeleton Loaders */}
                          {[...Array(3)].map((_, i) => (
                              <div key={i} className="bg-white rounded-lg border border-gray-200/80">
                                  <div className="aspect-[4/3] md:aspect-[3/2] lg:aspect-[5/3] bg-gray-200 rounded-t-lg animate-pulse"></div>
                                  <div className="p-6 space-y-2">
                                      <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 gap-8 pt-4">
                          {recommendations.map(rec => <RecommendationCard key={rec.id} {...rec} />)}
                      </div>
                  )}
              </div>
            )}
            
            <div className="space-y-6 bg-white p-8 rounded-xl border border-gray-200/80 shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900">직접 CMF 디자인 하기</h2>
                <p className="text-base text-gray-600">최대 3개의 제품 이미지를 업로드할 수 있습니다 (예: 다른 각도).</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
                    {originalImages.map((image, index) => (
                        <ImageUploader
                            key={index}
                            index={index}
                            onImageUpload={handleImageUpload}
                            previewUrl={image.previewUrl}
                        />
                    ))}
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
                        onGenerate={handleGenerate}
                        isLoading={isLoading}
                        isReady={isReadyToGenerate}
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
                            {userAccessCode && (
                                <button
                                    onClick={() => setShowSubmissionModal(true)}
                                    className="text-blue-900 bg-blue-200 hover:bg-blue-300 focus:ring-4 focus:ring-blue-200 font-bold rounded-lg text-base px-6 py-3 text-center transition-colors duration-200"
                                >
                                    라오닉스에게 보내기
                                </button>
                            )}
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
      {showSubmissionModal && (
        <SubmissionModal 
            onClose={() => setShowSubmissionModal(false)}
            onSubmit={handleSendSubmission}
        />
      )}
    </div>
  );
};

export default App;