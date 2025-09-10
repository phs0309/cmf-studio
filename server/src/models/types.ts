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

export interface AccessCode {
  id: number;
  code: string;
  created_at: string;
  is_active: boolean;
}

export interface AddRecommendationRequest {
  title: string;
  description: string;
  access_code: string;
}

export interface AddSubmissionRequest {
  access_code: string;
  comment: string;
  generated_image_url: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}