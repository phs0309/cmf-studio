// API Configuration - Render Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-app-name.onrender.com/api';

// Types
export interface RecommendedDesign {
  id: number;
  title: string;
  description: string;
  image_url: string;
  access_code: string;
  created_at: string;
}

export interface Submission {
  id: number;
  access_code: string;
  comment: string;
  generated_image_url: string;
  created_at: string;
  original_images: string[];
}

export interface AddSubmissionData {
  accessCode: string;
  comment: string;
  originalImageFiles: File[];
  generatedImageUrl: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper function for API calls
const apiCall = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const result: ApiResponse<T> = await response.json();
  
  if (!result.success || !response.ok) {
    throw new Error(result.error || 'API call failed');
  }
  
  return result.data as T;
};

// Helper function for file uploads
const uploadFiles = async <T>(
  endpoint: string,
  formData: FormData
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  const result: ApiResponse<T> = await response.json();
  
  if (!result.success || !response.ok) {
    throw new Error(result.error || 'Upload failed');
  }
  
  return result.data as T;
};

// Recommendations API
export const getRecommendedDesigns = async (accessCode: string): Promise<RecommendedDesign[]> => {
  return apiCall<RecommendedDesign[]>(`/recommendations?accessCode=${encodeURIComponent(accessCode)}`);
};

export const getAllRecommendations = async (): Promise<RecommendedDesign[]> => {
  return apiCall<RecommendedDesign[]>('/recommendations/all');
};

export const addRecommendation = async (
  recData: Omit<RecommendedDesign, 'id' | 'image_url' | 'created_at'>, 
  imageFile: File
): Promise<RecommendedDesign> => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('title', recData.title);
  formData.append('description', recData.description);
  formData.append('access_code', recData.access_code);
  
  return uploadFiles<RecommendedDesign>('/recommendations', formData);
};

export const deleteRecommendation = async (id: number): Promise<void> => {
  await apiCall(`/recommendations/${id}`, { method: 'DELETE' });
};

// Access Codes API
export const getValidCodes = async (): Promise<string[]> => {
  const codes = await apiCall<{ code: string }[]>('/access-codes');
  return codes.filter(c => c).map(c => c.code);
};

export const addCode = async (code: string): Promise<boolean> => {
  try {
    await apiCall('/access-codes', {
      method: 'POST',
      body: JSON.stringify({ code: code.trim() }),
    });
    return true;
  } catch (error) {
    if ((error as Error).message.includes('already exists')) {
      return false;
    }
    throw error;
  }
};

export const deleteCode = async (code: string): Promise<void> => {
  await apiCall(`/access-codes/${encodeURIComponent(code)}`, { method: 'DELETE' });
};

export const validateCode = async (code: string): Promise<boolean> => {
  try {
    const result = await apiCall<{ isValid: boolean }>('/access-codes/validate', {
      method: 'POST',
      body: JSON.stringify({ code: code.trim() }),
    });
    return result.isValid;
  } catch (error) {
    return false;
  }
};

// Submissions API
export const addSubmission = async (submissionData: AddSubmissionData): Promise<Submission> => {
  const formData = new FormData();
  
  // Add text data
  formData.append('access_code', submissionData.accessCode);
  formData.append('comment', submissionData.comment);
  
  // Add generated image as base64
  formData.append('generated_image_base64', submissionData.generatedImageUrl);
  
  // Add original images
  submissionData.originalImageFiles.forEach((file, index) => {
    formData.append('originalImages', file);
  });
  
  return uploadFiles<Submission>('/submissions', formData);
};

export const getAllSubmissions = async (): Promise<Submission[]> => {
  return apiCall<Submission[]>('/submissions');
};

// Cleanup function (no longer needed for database version)
export const cleanupBlobUrls = () => {
  // No-op for database version
};