import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Load environment variables
dotenv.config();

// Import routes
import recommendationsRouter from './routes/recommendations';
import submissionsRouter from './routes/submissions';
import accessCodesRouter from './routes/accessCodes';

// Import database connection (this will initialize the database)
import { database } from './database/connection';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : (process.env.CLIENT_URL || 'http://localhost:5173'),
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = process.env.NODE_ENV === 'production' 
  ? '/tmp/uploads' 
  : join(__dirname, '..', 'uploads');

if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  // Try multiple possible paths for the frontend dist folder
  const possiblePaths = [
    join(__dirname, '..', '..', 'dist'),           // /opt/render/project/dist
    join(__dirname, '..', '..', '..', 'dist'),     // /opt/render/project/src/dist
    join(__dirname, '..', '..', '..', '..', 'dist') // /opt/render/project/dist
  ];
  
  let frontendPath = '';
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      frontendPath = path;
      console.log(`✅ Found frontend files at: ${frontendPath}`);
      break;
    } else {
      console.log(`❌ Frontend files not found at: ${path}`);
    }
  }
  
  if (frontendPath) {
    app.use(express.static(frontendPath));
  } else {
    console.error('⚠️ Frontend files not found in any expected location');
  }
}

// API Routes
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/access-codes', accessCodesRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'CMF Studio API'
    }
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'File too large. Maximum size is 10MB.'
    });
  }

  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler - serve frontend for client-side routing in production
app.use('*', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    // Try multiple possible paths for index.html
    const possibleIndexPaths = [
      join(__dirname, '..', '..', 'dist', 'index.html'),
      join(__dirname, '..', '..', '..', 'dist', 'index.html'),
      join(__dirname, '..', '..', '..', '..', 'dist', 'index.html')
    ];
    
    let indexPath = '';
    for (const path of possibleIndexPaths) {
      if (existsSync(path)) {
        indexPath = path;
        break;
      }
    }
    
    if (indexPath) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({
        success: false,
        error: 'Frontend not found'
      });
    }
  } else {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found'
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CMF Studio API server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  try {
    await database.close();
    console.log('📦 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

export default app;