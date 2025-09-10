# AI CMF Designer 🎨

**Professional CMF (Color, Material, Finish) design tool powered by Google Gemini AI**

Upload product images, select materials and colors, and generate stunning CMF design variations with AI assistance.

## 🚀 Features

- **AI-Powered Design Generation**: Google Gemini integration for realistic CMF transformations
- **Multi-Image Support**: Upload up to 3 product images for comprehensive design generation
- **Premium Access System**: Code-based access to curated design recommendations
- **Database Storage**: Persistent storage for user submissions and design data
- **Admin Dashboard**: Full management interface for recommendations, codes, and submissions
- **Material Library**: 10+ professional materials (Metal, Wood, Plastic, etc.)
- **Color Customization**: Full color picker with hex code support

## 🛠 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Google Gemini API** for AI generation

### Backend
- **Node.js + Express** API server
- **SQLite** database with full schema
- **Multer** for file uploads
- **TypeScript** for type safety

## 📦 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/ai-cmf-designer.git
cd ai-cmf-designer
```

### 2. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Copy and configure environment variables
cp .env.example .env.local
# Edit .env.local and add your Gemini API key
```

### 3. Backend Setup
```bash
# Install server dependencies
cd server
npm install

# Copy and configure server environment
cp .env.example .env
# Edit .env if needed (defaults should work for development)
cd ..
```

### 4. Development
```bash
# Run both frontend and backend simultaneously
npm run dev:full

# Or run separately:
# Terminal 1: Frontend (http://localhost:5173)
npm run dev

# Terminal 2: Backend (http://localhost:3001)
npm run server:dev
```

## 🔧 Environment Variables

### Frontend (.env.local)
```bash
GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://localhost:3001/api
```

### Backend (server/.env)
```bash
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## 🗄 Database Schema

The application uses SQLite with the following structure:

- **access_codes**: Premium access code management
- **recommended_designs**: Curated CMF design recommendations
- **submissions**: User-generated designs and feedback
- **submission_images**: Original images associated with submissions

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in deployment platform

### Backend (Railway/Heroku/VPS)
1. Build the server: `npm run server:build`
2. Deploy with: `npm run server:start`
3. Ensure database persistence in production environment

## 🎯 Usage

### For Users
1. **Free Mode**: Basic CMF generation with uploaded images
2. **Premium Mode**: Access code required for curated recommendations
3. **Design Generation**: Select material, color, and generate AI designs
4. **Submission**: Send designs to Raonix for feedback

### For Admins
- Access admin panel to manage:
  - Design recommendations
  - Access codes
  - User submissions

## 🔐 Security Features

- File upload validation (images only, size limits)
- SQL injection protection with prepared statements
- CORS configuration for secure cross-origin requests
- Environment variable protection for sensitive data

## 📱 API Endpoints

```
GET    /api/recommendations?accessCode=CODE  # Get recommendations
POST   /api/recommendations                  # Add recommendation (admin)
DELETE /api/recommendations/:id              # Delete recommendation

GET    /api/submissions                      # Get all submissions (admin)
POST   /api/submissions                      # Submit design
DELETE /api/submissions/:id                  # Delete submission

GET    /api/access-codes                     # Get all codes (admin)
POST   /api/access-codes/validate            # Validate access code
POST   /api/access-codes                     # Add access code
DELETE /api/access-codes/:code               # Delete access code

GET    /api/health                           # Health check
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Live Demo**: [Your deployed URL]
- **API Documentation**: [Your API docs URL]
- **GitHub Issues**: [Report bugs and feature requests]

---

**Powered by Google Gemini AI** | Built with ❤️ for professional CMF design