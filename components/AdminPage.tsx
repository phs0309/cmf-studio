import React, { useState, useEffect, useCallback } from 'react';
import { RecommendedDesign, Submission } from '../services/apiService';
import * as api from '../services/apiService';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { TrashIcon } from './icons/TrashIcon';

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

    const handleAddRecommendation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRecFile || !newRecTitle || !newRecDesc || !newRecAccessCode) return;

        const form = e.target as HTMLFormElement;
        const newRec = await api.addRecommendation({ title: newRecTitle, description: newRecDesc, access_code: newRecAccessCode }, newRecFile);
        
        setRecommendations(prev => [newRec, ...prev]);

        setNewRecFile(null);
        setNewRecTitle('');
        setNewRecDesc('');
        if (codes.length > 0) {
            setNewRecAccessCode(codes[0]);
        }
        form.reset(); // Clears the file input
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Manage Recommendations */}
                            <div className="space-y-6 bg-white p-8 rounded-xl border border-gray-200/80 shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-900">Manage Recommendations</h2>
                                {/* Add Form */}
                                <form onSubmit={handleAddRecommendation} className="p-4 border rounded-lg space-y-3">
                                    <h3 className="font-medium">Add New Recommendation</h3>
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