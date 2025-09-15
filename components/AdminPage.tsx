import React, { useState, useEffect, useCallback } from 'react';
import { RecommendedDesign, Submission } from '../services/apiService';
import * as api from '../services/apiService';
import { testApi, testPostApi } from '../services/apiService';
import { generateCmfDesign } from '../services/geminiService';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface AdminPageProps {
    onNavigateBack: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigateBack }) => {
    const [recommendations, setRecommendations] = useState<RecommendedDesign[]>([]);
    const [codes, setCodes] = useState<string[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [newRecFile, setNewRecFile] = useState<File | null>(null);
    const [newRecTitle, setNewRecTitle] = useState('');
    const [newRecDesc, setNewRecDesc] = useState('');
    const [newRecAccessCode, setNewRecAccessCode] = useState<string>('');
    const [newCode, setNewCode] = useState('');
    
    // New AI synthesis fields
    const [useAiSynthesis, setUseAiSynthesis] = useState(false);
    const [designPrompt, setDesignPrompt] = useState('');
    const [designRationale, setDesignRationale] = useState('');
    const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [recs, codesData, subs] = await Promise.all([
                api.getAllRecommendations(),
                api.getValidCodes(),
                api.getAllSubmissions(),
            ]);
            setRecommendations(recs.sort((a, b) => b.id - a.id));
            setCodes(codesData);
            setSubmissions(subs.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
            if (codesData.length > 0 && newRecAccessCode === '') {
                setNewRecAccessCode(codesData[0]);
            }
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    }, [newRecAccessCode]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleGenerateAiImage = async () => {
        if (!newRecFile || !designPrompt.trim()) {
            alert('업로드된 이미지와 디자인 프롬프트가 필요합니다.');
            return;
        }

        setIsGeneratingAi(true);
        try {
            const imageBase64 = await generateCmfDesign([newRecFile], '플라스틱', '#007aff', designPrompt);
            setAiGeneratedImage(`data:image/png;base64,${imageBase64}`);
        } catch (err) {
            console.error('AI 이미지 생성 실패:', err);
            alert('AI 이미지 생성에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const dataURLtoFile = (dataurl: string, filename: string): File => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type: mime});
    };

    const handleAddRecommendation = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let fileToUse = newRecFile;
        
        // If using AI synthesis and AI image is generated, use that instead
        if (useAiSynthesis && aiGeneratedImage) {
            fileToUse = dataURLtoFile(aiGeneratedImage, 'ai-generated.png');
        }
        
        if (!fileToUse || !newRecTitle || !newRecDesc || !newRecAccessCode) return;

        let finalDescription = newRecDesc;
        if (useAiSynthesis && designRationale.trim()) {
            finalDescription += `\n\n디자인 근거: ${designRationale}`;
        }

        const form = e.target as HTMLFormElement;
        const newRec = await api.addRecommendation({ 
            title: newRecTitle, 
            description: finalDescription, 
            access_code: newRecAccessCode 
        }, fileToUse);
        
        setRecommendations(prev => [newRec, ...prev]);

        // Reset form
        setNewRecFile(null);
        setNewRecTitle('');
        setNewRecDesc('');
        setUseAiSynthesis(false);
        setDesignPrompt('');
        setDesignRationale('');
        setAiGeneratedImage(null);
        if (codes.length > 0) {
            setNewRecAccessCode(codes[0]);
        }
        form.reset();
    };
    
    const handleDeleteRecommendation = async (id: number) => {
        if(window.confirm('Are you sure you want to delete this recommendation? This cannot be undone.')) {
            await api.deleteRecommendation(id);
            setRecommendations(prev => prev.filter(r => r.id !== id));
        }
    };

    const handleAddCode = async (e: React.FormEvent) => {
        e.preventDefault();
        const codeToAdd = newCode.trim();
        if (!codeToAdd) return;
        
        try {
            const success = await api.addCode(codeToAdd);
            if (success) {
                setCodes(prev => [...prev, codeToAdd]);
                setNewCode('');
                alert(`Code "${codeToAdd}" added successfully!`);
            } else {
                alert(`Code "${codeToAdd}" already exists.`);
            }
        } catch (error) {
            console.error('Error adding code:', error);
            alert(`Failed to add code: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleDeleteCode = async (code: string) => {
        if(window.confirm(`Are you sure you want to delete the code "${code}"? All recommendations associated with this code will also be deleted. This cannot be undone.`)) {
            await api.deleteCode(code);
            
            setCodes(prev => prev.filter(c => c !== code));
            setRecommendations(prev => prev.filter(r => r.accessCode !== code));

            const remainingCodes = codes.filter(c => c !== code);
            if (remainingCodes.length > 0) {
                 setNewRecAccessCode(remainingCodes[0]);
            } else {
                 setNewRecAccessCode('');
            }
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 font-sans">
             <header className="py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Admin Panel
                    </h1>
                     <button
                        onClick={onNavigateBack}
                        className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        aria-label="Back to menu"
                        >
                        <ChevronLeftIcon className="w-4 h-4" />
                        Back to Menu
                    </button>
                </div>
            </header>
            <main className="container mx-auto px-4 py-12">
                {loading ? (
                     <div className="text-center py-10">
                        <p className="text-gray-500">Loading admin data...</p>
                    </div>
                ) : (
                    <>
                        {/* API Test Section */}
                        <div className="mb-8 bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                            <h2 className="text-lg font-semibold text-yellow-800 mb-4">API Connectivity Test</h2>
                            <div className="flex gap-3">
                                <button
                                    onClick={async () => {
                                        console.log('Testing GET API...');
                                        await testApi();
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Test GET API
                                </button>
                                <button
                                    onClick={async () => {
                                        console.log('Testing POST API...');
                                        await testPostApi();
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Test POST API
                                </button>
                            </div>
                            <p className="text-sm text-yellow-700 mt-3">
                                Open browser console (F12) to see detailed API test results.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Manage Recommendations */}
                            <div className="space-y-6 bg-white p-8 rounded-xl border border-gray-200/80 shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-900">Manage Recommendations</h2>
                                {/* Add Form */}
                                <form onSubmit={handleAddRecommendation} className="p-4 border rounded-lg space-y-3">
                                    <h3 className="font-medium">Add New Recommendation</h3>
                                    
                                    {/* AI Synthesis Toggle */}
                                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                                        <input 
                                            type="checkbox" 
                                            id="use-ai" 
                                            checked={useAiSynthesis}
                                            onChange={e => setUseAiSynthesis(e.target.checked)}
                                            className="rounded"
                                        />
                                        <label htmlFor="use-ai" className="text-sm font-medium text-purple-800">
                                            AI 합성 기능 사용
                                        </label>
                                        <SparklesIcon className="w-4 h-4 text-purple-600" />
                                    </div>

                                    <div>
                                        <label htmlFor="rec-image" className="sr-only">Image File</label>
                                        <input 
                                            id="rec-image" 
                                            type="file" 
                                            onChange={e => setNewRecFile(e.target.files ? e.target.files[0] : null)} 
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                                            accept="image/png, image/jpeg, image/webp" 
                                            required 
                                        />
                                    </div>

                                    {/* AI Synthesis Fields */}
                                    {useAiSynthesis && (
                                        <div className="space-y-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                            <div>
                                                <label htmlFor="design-prompt" className="block text-sm font-medium text-gray-700 mb-1">
                                                    디자이너 의도 프롬프트
                                                </label>
                                                <textarea 
                                                    id="design-prompt"
                                                    value={designPrompt} 
                                                    onChange={e => setDesignPrompt(e.target.value)} 
                                                    placeholder="예: 미래적이고 세련된 느낌으로 메탈릭 소재를 적용하여 프리미엄한 느낌을 강조해줘"
                                                    className="w-full bg-white border-gray-300 rounded-md p-2 text-sm" 
                                                    rows={3} 
                                                    required={useAiSynthesis}
                                                />
                                            </div>

                                            <button 
                                                type="button"
                                                onClick={handleGenerateAiImage}
                                                disabled={isGeneratingAi || !newRecFile || !designPrompt.trim()}
                                                className="w-full flex items-center justify-center gap-2 text-purple-900 bg-purple-200 hover:bg-purple-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed font-bold rounded-lg text-sm px-4 py-2 text-center transition-colors"
                                            >
                                                {isGeneratingAi ? (
                                                    <>
                                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        AI 이미지 생성 중...
                                                    </>
                                                ) : (
                                                    <>
                                                        <SparklesIcon className="w-4 h-4" />
                                                        AI 이미지 생성
                                                    </>
                                                )}
                                            </button>

                                            {aiGeneratedImage && (
                                                <div className="mt-3">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">생성된 AI 이미지:</p>
                                                    <img src={aiGeneratedImage} alt="AI Generated" className="w-full max-w-xs mx-auto rounded-lg border" />
                                                </div>
                                            )}

                                            <div>
                                                <label htmlFor="design-rationale" className="block text-sm font-medium text-gray-700 mb-1">
                                                    디자인 근거 설명
                                                </label>
                                                <textarea 
                                                    id="design-rationale"
                                                    value={designRationale} 
                                                    onChange={e => setDesignRationale(e.target.value)} 
                                                    placeholder="이 디자인을 선택한 이유와 CMF 적용 근거를 설명해주세요..."
                                                    className="w-full bg-white border-gray-300 rounded-md p-2 text-sm" 
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <input type="text" value={newRecTitle} onChange={e => setNewRecTitle(e.target.value)} placeholder="Title" className="w-full bg-gray-100 border-gray-300 rounded-md p-2 text-sm" required />
                                    <textarea value={newRecDesc} onChange={e => setNewRecDesc(e.target.value)} placeholder="Description" className="w-full bg-gray-100 border-gray-300 rounded-md p-2 text-sm" rows={2} required />
                                    <div>
                                        <label htmlFor="rec-code" className="sr-only">Access Code</label>
                                        <select id="rec-code" value={newRecAccessCode} onChange={e => setNewRecAccessCode(e.target.value)} className="w-full bg-gray-100 border-gray-300 rounded-md p-2 text-sm" required disabled={codes.length === 0}>
                                            {codes.length === 0 ? (
                                                <option>Please add an access code first</option>
                                            ) : (
                                                codes.map(code => <option key={code} value={code}>{code}</option>)
                                            )}
                                        </select>
                                    </div>
                                    <button type="submit" className="w-full text-blue-900 bg-blue-200 hover:bg-blue-300 font-bold rounded-lg text-sm px-4 py-2 text-center transition-colors">Add Recommendation</button>
                                </form>
                                {/* List */}
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                    {recommendations.map(rec => (
                                        <div key={rec.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <img src={rec.image_url} alt={rec.title} className="w-12 h-12 object-cover rounded-md bg-gray-200 flex-shrink-0" />
                                                <div className="overflow-hidden">
                                                    <p className="font-semibold text-sm truncate">{rec.title}</p>
                                                    <p className="text-xs text-gray-500 truncate">{rec.description}</p>
                                                    <p className="text-xs text-blue-600 font-mono bg-blue-100 px-1.5 py-0.5 rounded-full inline-block mt-1">{rec.access_code}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteRecommendation(rec.id)} aria-label={`Delete ${rec.title}`} className="flex-shrink-0 ml-2 p-1">
                                                <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-600"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Manage Codes */}
                            <div className="space-y-6 bg-white p-8 rounded-xl border border-gray-200/80 shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-900">Manage Access Codes</h2>
                                {/* Add Form */}
                                <form onSubmit={handleAddCode} className="p-4 border rounded-lg space-y-3">
                                    <h3 className="font-medium">Add New Code</h3>
                                    <input type="text" value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="New access code" className="w-full bg-gray-100 border-gray-300 rounded-md p-2 text-sm font-mono" required />
                                    <button type="submit" className="w-full text-blue-900 bg-blue-200 hover:bg-blue-300 font-bold rounded-lg text-sm px-4 py-2 text-center transition-colors">Add Code</button>
                                </form>
                                {/* List */}
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                    {codes.map(code => (
                                        <div key={code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                            <p className="font-mono text-sm">{code}</p>
                                            <button onClick={() => handleDeleteCode(code)} aria-label={`Delete ${code}`} className="flex-shrink-0 ml-2 p-1">
                                                <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-600"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Customer Submissions Section */}
                        <div className="mt-12">
                            <div className="space-y-6 bg-white p-8 rounded-xl border border-gray-200/80 shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-900">고객 제출물</h2>
                                {submissions.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">아직 제출된 디자인이 없습니다.</p>
                                ) : (
                                    <div className="space-y-6 max-h-[48rem] overflow-y-auto pr-3">
                                        {submissions.map(sub => (
                                            <div key={sub.id} className="p-4 border rounded-lg bg-gray-50/80">
                                                <div className="flex justify-between items-center mb-3 border-b pb-2">
                                                    <p className="font-semibold">Access Code: <span className="font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">{sub.access_code}</span></p>
                                                    <p className="text-sm text-gray-500">{new Date(sub.created_at).toLocaleString()}</p>
                                                </div>
                                                
                                                {sub.comment && (
                                                    <blockquote className="mb-4 p-3 bg-white border-l-4 border-blue-300 text-gray-800 rounded-r-lg">
                                                        <p className="whitespace-pre-wrap">{sub.comment}</p>
                                                    </blockquote>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="font-medium text-center mb-2 text-gray-700">Original Image(s)</h4>
                                                        <div className={`grid ${sub.original_images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 bg-gray-200 p-2 rounded-lg`}>
                                                            {sub.original_images.map((url, index) => (
                                                                <a href={url} target="_blank" rel="noopener noreferrer" key={index} className="block aspect-square">
                                                                    <img src={url} alt={`Original ${index + 1}`} className="w-full h-full object-contain bg-white rounded" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-center mb-2 text-gray-700">Generated Image</h4>
                                                        <div className="bg-gray-200 p-2 rounded-lg aspect-square">
                                                            <a href={sub.generated_image_url} target="_blank" rel="noopener noreferrer">
                                                                <img src={sub.generated_image_url} alt="Generated" className="w-full h-full object-contain bg-white rounded" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};