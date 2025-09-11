// API Configuration - Force relative API URL for production
const getApiBaseUrl = () => {
  // Always use relative path in production to avoid CORS issues
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return '/api';
  }
  // Use environment variable or relative path as fallback
  return import.meta.env.VITE_API_URL || '/api';
};

const API_BASE_URL = getApiBaseUrl();

// Debug: Log the API URL being used
console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 VITE_API_URL env var:', import.meta.env.VITE_API_URL);
console.log('🔧 Window location:', typeof window !== 'undefined' ? window.location.href : 'N/A');

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
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log(`🌐 API Call: ${options.method || 'GET'} ${fullUrl}`);
  console.log('📤 Request options:', options);
  
  try {
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error('❌ HTTP Error:', response.status, response.statusText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result: ApiResponse<T> = await response.json();
    console.log('📄 Response data:', result);
    
    if (!result.success) {
      throw new Error(result.error || 'API call failed');
    }
    
    return result.data as T;
  } catch (error) {
    console.error('🚨 Fetch Error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server');
    }
    throw error;
  }
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

// Test API connectivity
export const testApi = async (): Promise<boolean> => {
  try {
    await apiCall('/test');
    console.log('✅ API test successful');
    return true;
  } catch (error) {
    console.error('❌ API test failed:', error);
    return false;
  }
};

// Test POST API
export const testPostApi = async (): Promise<boolean> => {
  try {
    await apiCall('/test', {
      method: 'POST',
      body: JSON.stringify({ test: 'data' })
    });
    console.log('✅ POST API test successful');
    return true;
  } catch (error) {
    console.error('❌ POST API test failed:', error);
    return false;
  }
};