import { Router, Request, Response } from 'express';
import { RecommendationService } from '../services/recommendationService';
import { FileUploadService } from '../services/fileUploadService';
import { ApiResponse, AddRecommendationRequest } from '../models/types';

const router = Router();
const recommendationService = new RecommendationService();
const fileUploadService = new FileUploadService();
const upload = fileUploadService.getMulterConfig();

// GET /api/recommendations?accessCode=CODE
router.get('/', async (req: Request, res: Response) => {
  try {
    const { accessCode } = req.query;
    
    if (!accessCode) {
      return res.status(400).json({
        success: false,
        error: 'Access code is required'
      } as ApiResponse<null>);
    }

    const designs = await recommendationService.getByAccessCode(accessCode as string);
    
    res.json({
      success: true,
      data: designs
    } as ApiResponse<typeof designs>);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

// GET /api/recommendations/all (Admin only)
router.get('/all', async (req: Request, res: Response) => {
  try {
    const designs = await recommendationService.getAll();
    
    res.json({
      success: true,
      data: designs
    } as ApiResponse<typeof designs>);
  } catch (error) {
    console.error('Error fetching all recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

// POST /api/recommendations
router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Image file is required'
      } as ApiResponse<null>);
    }

    const { title, description, access_code } = req.body as AddRecommendationRequest;
    
    if (!title || !description || !access_code) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, and access_code are required'
      } as ApiResponse<null>);
    }

    const imageUrl = fileUploadService.getFileUrl(req.file.filename, req);
    const newDesign = await recommendationService.create(
      { title, description, access_code },
      imageUrl
    );

    res.status(201).json({
      success: true,
      data: newDesign
    } as ApiResponse<typeof newDesign>);
  } catch (error) {
    console.error('Error creating recommendation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

// DELETE /api/recommendations/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        error: 'Valid recommendation ID is required'
      } as ApiResponse<null>);
    }

    await recommendationService.delete(Number(id));
    
    res.json({
      success: true,
      data: { message: 'Recommendation deleted successfully' }
    } as ApiResponse<{ message: string }>);
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    } as ApiResponse<null>);
  }
});

export default router;