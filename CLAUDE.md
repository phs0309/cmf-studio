# CMF Studio - AI-Powered Color, Material, Finish Design Tool

## Overview
CMF Studio is an AI-powered design tool that helps users redesign products by changing their Color, Material, and Finish (CMF) properties using Google's Gemini AI. The application features a React frontend with TypeScript and an Express.js backend with SQLite database storage.

## Architecture

### Frontend (React + TypeScript + Vite)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6.2.0
- **UI**: Custom Tailwind-style components
- **AI Integration**: Google Gemini API via `@google/genai`
- **Main Entry**: `App.tsx`

### Backend (Express + SQLite + TypeScript)
- **Server**: Express.js with TypeScript
- **Database**: SQLite with environment-specific storage
  - Development: File-based (`data/cmf_studio.db`)
  - Production: In-memory (`:memory:`)
- **File Uploads**: Multer middleware
- **Main Entry**: `server/src/index.ts`

### Database Schema
- `access_codes`: Premium user access management
- `recommended_designs`: Raonix design recommendations
- `submissions`: User submissions to Raonix with images and comments

## Key Features
1. **Free Mode**: Basic CMF design generation
2. **Premium Mode**: Access to Raonix recommendations + submission capability
3. **Multi-image Upload**: Support for up to 3 product images
4. **Material & Color Selection**: Various material options with custom color picker
5. **Admin Panel**: Manage access codes and view submissions

## Development Commands

### Setup
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install
```

### Development
```bash
# Start both frontend and backend concurrently
npm run dev:full

# Start frontend only
npm run dev

# Start backend only
npm run server:dev
```

### Build & Deployment
```bash
# Build frontend
npm run build

# Build backend
npm run server:build

# Start production server
npm run server:start
```

### Database Management
The database initializes automatically on server start. Schema is defined in `server/src/database/schema.ts`.

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://your-app-name.onrender.com/api
API_KEY=your_gemini_api_key
```

### Backend (server/.env)
```
PORT=3001
CLIENT_URL=https://your-frontend-url.com
NODE_ENV=production
RENDER=true
```

## File Structure
```
ai-cmf-designer/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── services/          # API service layer
│   └── constants.ts       # App constants
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── database/      # Database connection & schema
│   │   └── index.ts       # Server entry point
│   └── uploads/           # File upload directory
└── dist/                  # Built frontend assets
```

## API Endpoints

### Recommendations
- `GET /api/recommendations/:accessCode` - Get recommended designs
- `POST /api/recommendations` - Create recommendation (admin)

### Submissions
- `GET /api/submissions` - Get all submissions (admin)
- `POST /api/submissions` - Create new submission

### Access Codes
- `GET /api/access-codes` - Get all access codes (admin)
- `POST /api/access-codes` - Create access code (admin)
- `POST /api/access-codes/validate` - Validate access code

## Deployment Notes

### Render Platform
- Uses in-memory SQLite database for production
- TypeScript and build dependencies moved to `dependencies` (not `devDependencies`)
- Automatic schema initialization on startup
- File uploads stored in `/tmp/uploads`

### Common Issues
1. **Schema loading errors**: Ensure `schema.ts` is properly compiled to `schema.js`
2. **Database permissions**: Production uses in-memory database to avoid filesystem issues
3. **Build dependencies**: Keep TypeScript and Vite in main dependencies for Render

## Development Guidelines
1. Follow existing TypeScript conventions
2. Use existing component patterns and styling
3. Maintain error handling consistency
4. Test both free and premium user flows
5. Validate file uploads and API responses

## Common Tasks
- **Add new material**: Update `constants.ts` MATERIALS array
- **Modify schema**: Edit `server/src/database/schema.ts` 
- **Add API endpoint**: Create route in `server/src/routes/`
- **Update UI**: Modify components in `src/components/`