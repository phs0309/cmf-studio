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
      const { accessCode } = req.query;
      
      if (accessCode) {
        // 특정 액세스 코드의 추천 디자인 조회
        const recommendations = db.getRecommendationsByAccessCode(accessCode);
        return res.json({
          success: true,
          data: recommendations
        });
      } else {
        // 모든 추천 디자인 조회 (관리자용)
        const recommendations = db.getAllRecommendations();
        return res.json({
          success: true,
          data: recommendations
        });
      }
    }
    
    if (req.method === 'POST') {
      const { title, description, access_code, image_url } = req.body;
      
      if (!title || !description || !access_code || !image_url) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
      
      const newRecommendation = db.addRecommendation(
        { title, description, access_code },
        image_url
      );
      
      return res.status(201).json({
        success: true,
        data: newRecommendation
      });
    }
    
    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          error: 'Valid ID required'
        });
      }
      
      const deleted = db.deleteRecommendation(Number(id));
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Recommendation not found'
        });
      }
      
      return res.json({
        success: true,
        data: { message: 'Deleted successfully' }
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