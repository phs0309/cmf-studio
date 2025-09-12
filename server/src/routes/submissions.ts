import { Router, Request, Response } from 'express';
import { SubmissionService } from '../services/submissionService';
import { FileUploadService } from '../services/fileUploadService';
import { ApiResponse, AddSubmissionRequest } from '../models/types';

const router = Router();
const submissionService = new SubmissionService();
const fileUploadService = new FileUploadService();
const upload = fileUploadService.getMulterConfig();

// GET /api/submissions (Admin only)
router.get('/', async (req: Request, res: Response) => {
  try {
    const submissions = await submissionService.getAll();
    
    res.json({
      success: true,
      data: submissions
    } as ApiResponse<typeof submissions>);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

// POST /api/submissions
router.post('/', upload.array('originalImages', 3), async (req: Request, res: Response) => {
  try {
    console.log('=== Submission Request Started ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request files:', req.files ? (req.files as any[]).length : 0);
    
    const { access_code, comment, generated_image_base64 } = req.body;
    
    console.log('Access code:', access_code);
    console.log('Comment:', comment ? 'present' : 'empty');
    console.log('Generated image base64:', generated_image_base64 ? `${generated_image_base64.substring(0, 50)}...` : 'missing');
    
    if (!access_code || !generated_image_base64) {
      console.log('Missing required fields - access_code:', !!access_code, 'generated_image_base64:', !!generated_image_base64);
      return res.status(400).json({
        success: false,
        error: 'Access code and generated image are required'
      } as ApiResponse<null>);
    }

    console.log('=== Saving generated image ===');
    // Save the generated image (base64)
    const generatedImageFilename = fileUploadService.saveBase64Image(
      generated_image_base64, 
      'generated'
    );
    console.log('Generated image filename:', generatedImageFilename);
    
    const generatedImageUrl = fileUploadService.getFileUrl(generatedImageFilename, req);
    console.log('Generated image URL:', generatedImageUrl);

    console.log('=== Processing original images ===');
    // Process original images
    const originalImageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      console.log('Found', req.files.length, 'original images');
      for (const file of req.files) {
        const imageUrl = fileUploadService.getFileUrl(file.filename, req);
        originalImageUrls.push(imageUrl);
        console.log('Original image URL:', imageUrl);
      }
    }

    const submissionData: AddSubmissionRequest = {
      access_code,
      comment: comment || '',
      generated_image_url: generatedImageUrl
    };
    
    console.log('=== Creating submission in database ===');
    console.log('Submission data:', submissionData);
    console.log('Original image URLs:', originalImageUrls);

    const newSubmission = await submissionService.create(submissionData, originalImageUrls);
    
    console.log('=== Submission created successfully ===');
    console.log('New submission ID:', newSubmission.id);

    res.status(201).json({
      success: true,
      data: newSubmission
    } as ApiResponse<typeof newSubmission>);
  } catch (error) {
    console.error('=== ERROR in submission route ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error object:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    } as ApiResponse<null>);
  }
});

// DELETE /api/submissions/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        error: 'Valid submission ID is required'
      } as ApiResponse<null>);
    }

    await submissionService.delete(Number(id));
    
    res.json({
      success: true,
      data: { message: 'Submission deleted successfully' }
    } as ApiResponse<{ message: string }>);
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    } as ApiResponse<null>);
  }
});

export default router;