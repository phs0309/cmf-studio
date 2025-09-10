// FIX: Update imports to use getter functions instead of directly accessing data arrays from the mock DB.
import { 
  RecommendedDesign,
  Submission,
  AddSubmissionData,
  addRecommendation as dbAddRecommendation,
  deleteRecommendation as dbDeleteRecommendation,
  getAllRecommendations as dbGetAllRecommendations,
  addCode as dbAddCode,
  deleteCode as dbDeleteCode,
  addSubmission as dbAddSubmission,
  getAllSubmissions as dbGetAllSubmissions,
  cleanupBlobUrls as dbCleanupBlobUrls,
  getAllValidCodes as dbGetAllValidCodes,
} from '../data/mockDb';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// FIX: Use the imported `dbGetAllRecommendations` function to get data, resolving the error.
export const getRecommendedDesigns = async (accessCode: string): Promise<RecommendedDesign[]> => {
  await delay(800); // Simulate fetching data
  return dbGetAllRecommendations().filter(r => r.accessCode === accessCode);
};

export const getAllRecommendations = async (): Promise<RecommendedDesign[]> => {
    await delay(400); // Simulate admin fetch
    return dbGetAllRecommendations();
};

export const addRecommendation = async (recData: Omit<RecommendedDesign, 'id' | 'imageUrl'>, imageFile: File): Promise<RecommendedDesign> => {
    await delay(500);
    return dbAddRecommendation(recData, imageFile);
};

export const deleteRecommendation = async (id: number): Promise<void> => {
    await delay(300);
    dbDeleteRecommendation(id);
};

// FIX: Use the imported `dbGetAllValidCodes` function to get data, resolving the error.
export const getValidCodes = async (): Promise<string[]> => {
  await delay(400);
  return dbGetAllValidCodes();
};

export const addCode = async (code: string): Promise<boolean> => {
  await delay(300);
  return dbAddCode(code);
};

export const deleteCode = async (code: string): Promise<void> => {
  await delay(200);
  dbDeleteCode(code);
};

// FIX: Use the imported `dbGetAllValidCodes` function to get data, resolving the error.
export const validateCode = async (code: string): Promise<boolean> => {
  await delay(500); // Simulate validating code
  return dbGetAllValidCodes().includes(code.trim());
};

export const addSubmission = async (submissionData: AddSubmissionData): Promise<Submission> => {
    await delay(1000); // Simulate sending data
    return dbAddSubmission(submissionData);
};

export const getAllSubmissions = async (): Promise<Submission[]> => {
    await delay(600);
    return dbGetAllSubmissions();
};

export const cleanupBlobUrls = () => {
  dbCleanupBlobUrls();
}