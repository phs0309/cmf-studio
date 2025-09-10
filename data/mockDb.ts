export interface RecommendedDesign {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  accessCode: string;
}

export interface Submission {
  id: number;
  accessCode: string;
  comment: string;
  originalImageUrls: string[];
  generatedImageUrl: string;
  timestamp: Date;
}

export interface AddSubmissionData {
  accessCode: string;
  comment: string;
  originalImageFiles: File[];
  generatedImageUrl: string;
}

// --- LocalStorage Persistence Layer ---

const REC_KEY = 'cmf_recommendations';
const CODES_KEY = 'cmf_valid_codes';
const SUBMISSIONS_KEY = 'cmf_submissions';
const NEXT_REC_ID_KEY = 'cmf_next_rec_id';
const NEXT_SUB_ID_KEY = 'cmf_next_sub_id';

// --- Data Stores (In-memory cache, hydrated from localStorage) ---

let recommendedDesigns: RecommendedDesign[] = [];
let validCodes: string[] = [];
let submissions: Submission[] = [];
let nextRecId: number;
let nextSubmissionId: number;

// --- Initial (Default) Data ---

const initialRecommendedDesigns: RecommendedDesign[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ab?q=80&w=800&auto=format&fit=crop',
    title: 'Sporty Red Sneaker',
    description: 'A vibrant red sneaker concept in a glossy, durable plastic finish, perfect for an athletic look.',
    accessCode: 'RAONIX-2024',
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
    title: 'Minimalist Watch',
    description: 'Featuring a brushed aluminum casing and a simple face, this watch embodies modern elegance.',
    accessCode: 'RAONIX-2024',
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
    title: 'Classic Headphones',
    description: 'Experience timeless design with these headphones in a matte black, soft-touch rubber finish.',
    accessCode: 'CMF-DESIGN-PRO',
  },
];
const initialValidCodes: string[] = ['RAONIX-2024', 'CMF-DESIGN-PRO', 'VIP-ACCESS'];

// --- Utility Functions ---

const fileToDataURL = (file: File): Promise<string> => 
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const getNextId = (key: string, initialValue: number): (() => number) => {
    let nextId = parseInt(localStorage.getItem(key) || `${initialValue}`, 10);
    localStorage.setItem(key, `${nextId}`);
    return () => {
        const id = nextId++;
        localStorage.setItem(key, `${nextId}`);
        return id;
    };
};

const getNextRecId = getNextId(NEXT_REC_ID_KEY, initialRecommendedDesigns.length + 1);
const getNextSubmissionId = getNextId(NEXT_SUB_ID_KEY, 1);


// --- Data Hydration & Persistence ---

function loadFromStorage() {
    try {
        const storedRecs = localStorage.getItem(REC_KEY);
        recommendedDesigns = storedRecs ? JSON.parse(storedRecs) : initialRecommendedDesigns;
        
        const storedCodes = localStorage.getItem(CODES_KEY);
        validCodes = storedCodes ? JSON.parse(storedCodes) : initialValidCodes;

        const storedSubmissions = localStorage.getItem(SUBMISSIONS_KEY);
        submissions = storedSubmissions 
            ? JSON.parse(storedSubmissions).map((s: Submission) => ({ ...s, timestamp: new Date(s.timestamp) })) 
            : [];
        
        // Persist initial data if it wasn't there
        if (!storedRecs) localStorage.setItem(REC_KEY, JSON.stringify(recommendedDesigns));
        if (!storedCodes) localStorage.setItem(CODES_KEY, JSON.stringify(validCodes));
        if (!storedSubmissions) localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));

    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        // Fallback to initial data
        recommendedDesigns = initialRecommendedDesigns;
        validCodes = initialValidCodes;
        submissions = [];
    }
}

// Initialize data on module load
loadFromStorage();

const saveRecommendations = () => localStorage.setItem(REC_KEY, JSON.stringify(recommendedDesigns));
const saveCodes = () => localStorage.setItem(CODES_KEY, JSON.stringify(validCodes));
const saveSubmissions = () => localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));

// --- Public API ---

export const getAllRecommendations = () => [...recommendedDesigns];

// FIX: Export a getter for valid codes to be used by the apiService, as the `validCodes` array is not exported.
export const getAllValidCodes = () => [...validCodes];

export const addRecommendation = async (recData: Omit<RecommendedDesign, 'id' | 'imageUrl'>, imageFile: File): Promise<RecommendedDesign> => {
  const imageUrl = await fileToDataURL(imageFile);
  const newRec = { ...recData, id: getNextRecId(), imageUrl };
  recommendedDesigns.push(newRec);
  saveRecommendations();
  return newRec;
};

export const deleteRecommendation = (id: number) => {
  recommendedDesigns = recommendedDesigns.filter(rec => rec.id !== id);
  saveRecommendations();
};

export const addCode = (code: string) => {
  if (!validCodes.includes(code)) {
    validCodes.push(code);
    saveCodes();
    return true;
  }
  return false;
}

export const deleteCode = (code: string) => {
  // Filter out the associated recommendations
  recommendedDesigns = recommendedDesigns.filter(rec => rec.accessCode !== code);
  saveRecommendations();
  
  // Filter out the code itself
  validCodes = validCodes.filter(c => c !== code);
  saveCodes();
}

export const addSubmission = async (submissionData: AddSubmissionData): Promise<Submission> => {
  const originalImageUrls = await Promise.all(submissionData.originalImageFiles.map(fileToDataURL));
  
  const newSubmission: Submission = {
    id: getNextSubmissionId(),
    accessCode: submissionData.accessCode,
    comment: submissionData.comment,
    originalImageUrls: originalImageUrls,
    generatedImageUrl: submissionData.generatedImageUrl,
    timestamp: new Date(),
  };
  submissions.push(newSubmission);
  saveSubmissions();
  
  console.log("New Submission Added:", newSubmission);
  console.log("All Submissions:", submissions);
  return newSubmission;
};

export const getAllSubmissions = () => [...submissions];

export const cleanupBlobUrls = () => {
  // This is no longer necessary for persistent data, as we use Data URLs.
  // Kept as a no-op to avoid breaking imports.
};