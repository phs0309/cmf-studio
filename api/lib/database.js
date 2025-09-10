// Vercel KV 또는 Upstash Redis를 사용한 간단한 데이터베이스
// 실제로는 Vercel KV를 설정해야 하지만, 여기서는 메모리 기반 Mock DB 사용

// 메모리 기반 데이터 저장 (Vercel Functions는 상태가 유지되지 않으므로 실제로는 외부 DB 필요)
let mockData = {
  recommendations: [
    {
      id: 1,
      title: 'Sporty Red Sneaker',
      description: 'A vibrant red sneaker concept in a glossy, durable plastic finish.',
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ab?q=80&w=800&auto=format&fit=crop',
      access_code: 'RAONIX-2024',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Elegant Blue Headphones',
      description: 'Sleek blue headphones with a matte aluminum finish.',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
      access_code: 'RAONIX-2024',
      created_at: new Date().toISOString()
    }
  ],
  accessCodes: ['RAONIX-2024', 'PREMIUM-USER', 'DEMO-ACCESS'],
  submissions: []
};

let nextId = 3;

export const db = {
  // Recommendations
  getRecommendationsByAccessCode: (accessCode) => {
    return mockData.recommendations.filter(r => r.access_code === accessCode);
  },
  
  getAllRecommendations: () => {
    return [...mockData.recommendations];
  },
  
  addRecommendation: (data, imageUrl) => {
    const newRec = {
      id: nextId++,
      ...data,
      image_url: imageUrl,
      created_at: new Date().toISOString()
    };
    mockData.recommendations.push(newRec);
    return newRec;
  },
  
  deleteRecommendation: (id) => {
    const index = mockData.recommendations.findIndex(r => r.id === id);
    if (index > -1) {
      mockData.recommendations.splice(index, 1);
      return true;
    }
    return false;
  },
  
  // Access Codes
  getValidCodes: () => {
    return [...mockData.accessCodes];
  },
  
  validateCode: (code) => {
    return mockData.accessCodes.includes(code.trim());
  },
  
  addCode: (code) => {
    if (!mockData.accessCodes.includes(code)) {
      mockData.accessCodes.push(code);
      return true;
    }
    return false;
  },
  
  deleteCode: (code) => {
    const index = mockData.accessCodes.indexOf(code);
    if (index > -1) {
      mockData.accessCodes.splice(index, 1);
      return true;
    }
    return false;
  },
  
  // Submissions
  getAllSubmissions: () => {
    return [...mockData.submissions];
  },
  
  addSubmission: (data, originalImages) => {
    const newSubmission = {
      id: nextId++,
      access_code: data.access_code,
      comment: data.comment,
      generated_image_url: data.generated_image_url,
      original_images: originalImages,
      created_at: new Date().toISOString()
    };
    mockData.submissions.push(newSubmission);
    return newSubmission;
  }
};