import { Router, Request, Response } from 'express';
import { AccessCodeService } from '../services/accessCodeService';
import { ApiResponse } from '../models/types';

const router = Router();
const accessCodeService = new AccessCodeService();

// GET /api/access-codes (Admin only)
router.get('/', async (req: Request, res: Response) => {
  try {
    const codes = await accessCodeService.getAll();
    
    res.json({
      success: true,
      data: codes
    } as ApiResponse<typeof codes>);
  } catch (error) {
    console.error('Error fetching access codes:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

// POST /api/access-codes/validate
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Access code is required'
      } as ApiResponse<null>);
    }

    const isValid = await accessCodeService.validate(code);
    
    res.json({
      success: true,
      data: { isValid }
    } as ApiResponse<{ isValid: boolean }>);
  } catch (error) {
    console.error('Error validating access code:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

// POST /api/access-codes
router.post('/', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid access code is required'
      } as ApiResponse<null>);
    }

    const created = await accessCodeService.create(code);
    
    if (!created) {
      return res.status(400).json({
        success: false,
        error: 'Access code already exists'
      } as ApiResponse<null>);
    }

    res.status(201).json({
      success: true,
      data: { message: 'Access code created successfully', code }
    } as ApiResponse<{ message: string; code: string }>);
  } catch (error) {
    console.error('Error creating access code:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
});

// DELETE /api/access-codes/:code
router.delete('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Access code is required'
      } as ApiResponse<null>);
    }

    await accessCodeService.delete(code);
    
    res.json({
      success: true,
      data: { message: 'Access code deleted successfully' }
    } as ApiResponse<{ message: string }>);
  } catch (error) {
    console.error('Error deleting access code:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    } as ApiResponse<null>);
  }
});

export default router;