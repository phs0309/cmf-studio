import { db } from './lib/database.js';

export default function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const submissions = db.getAllSubmissions();
      return res.json({
        success: true,
        data: submissions
      });
    }
    
    if (req.method === 'POST') {
      const { access_code, comment, generated_image_url, original_images = [] } = req.body;
      
      if (!access_code || !generated_image_url) {
        return res.status(400).json({
          success: false,
          error: 'Access code and generated image URL required'
        });
      }
      
      const submissionData = {
        access_code,
        comment: comment || '',
        generated_image_url
      };
      
      const newSubmission = db.addSubmission(submissionData, original_images);
      
      return res.status(201).json({
        success: true,
        data: newSubmission
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