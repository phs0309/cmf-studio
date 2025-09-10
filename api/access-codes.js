import { db } from './lib/database.js';

export default function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const codes = db.getValidCodes();
      return res.json({
        success: true,
        data: codes.map(code => ({ code }))
      });
    }
    
    if (req.method === 'POST') {
      const { code } = req.body;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Valid code required'
        });
      }
      
      const added = db.addCode(code.trim());
      
      if (!added) {
        return res.status(400).json({
          success: false,
          error: 'Code already exists'
        });
      }
      
      return res.status(201).json({
        success: true,
        data: { message: 'Code added successfully', code }
      });
    }
    
    if (req.method === 'DELETE') {
      const { code } = req.query;
      
      if (!code) {
        return res.status(400).json({
          success: false,
          error: 'Code required'
        });
      }
      
      const deleted = db.deleteCode(code);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Code not found'
        });
      }
      
      return res.json({
        success: true,
        data: { message: 'Code deleted successfully' }
      });
    }
    
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}