# HireSphere

A comprehensive campus placement management system built with the MERN stack. HireSphere streamlines the entire recruitment process by connecting students, recruiters, and placement administrators on a unified platform with AI-powered features.

## Features

### For Students
- **Profile Management**: Complete academic profile with resume uploads to Firebase Storage
- **Drive Discovery**: Browse and apply to eligible placement drives with real-time eligibility checking
- **Application Tracking**: Monitor application status through the entire hiring pipeline
- **Online Assessments**: Take MCQ and coding tests with a built-in code editor and auto-evaluation
- **Video Interviews**: Join live video interviews with screen sharing capabilities
- **AI Resume Suggestions**: Get AI-powered ATS compatibility analysis and improvement recommendations
- **AI Test Review**: Receive personalized feedback on test performance with weak area identification
- **Offer Management**: View and respond to placement offers with digital offer letters

### For Recruiters
- **Company Profile**: Manage company information with logo uploads via Cloudinary
- **Drive Management**: Create and publish placement drives with detailed job descriptions
- **Custom Hiring Pipeline**: Configure multi-stage selection processes (screening, aptitude, technical, HR)
- **Applicant Screening**: Review applications with bulk actions for shortlisting and rejection
- **Test Designer**: Create MCQ and coding assessments with AI-powered question generation
- **AI Resume Scoring**: Evaluate candidates with AI-generated match scores and skill analysis
- **Interview Scheduling**: Schedule video interviews with integrated room management
- **Offer Letters**: Generate and send digital offer letters to selected candidates

### For Administrators
- **Dashboard Analytics**: View placement statistics and drive metrics
- **User Management**: Manage student and recruiter accounts with verification workflows
- **Drive Approval**: Review and approve placement drives before publication
- **System Configuration**: Configure platform settings and eligibility criteria

### AI-Powered Features
- **Resume Analysis**: Parse uploaded PDF resumes and provide ATS compatibility scores
- **Resume Suggestions**: Section-by-section feedback with actionable improvement tips
- **Resume Scoring**: Match candidate profiles against job requirements
- **Question Generation**: AI-generated MCQ and coding questions based on topics and difficulty
- **Test Performance Review**: Personalized analysis of weak areas and study recommendations

## Tech Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- Framer Motion for animations
- React Hot Toast for notifications
- Tailwind CSS for styling
- Axios for API communication

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads

### Cloud Services
- Firebase Storage for resume storage
- Cloudinary for image uploads
- Google Gemini AI for AI features

### Real-Time Features
- Socket.IO for live notifications
- WebRTC for video interviews

## Installation

### Prerequisites
- Node.js 18+
- MongoDB database
- Firebase project with Storage enabled
- Cloudinary account
- Google Gemini API key

### Environment Variables

#### Server (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_STORAGE_BUCKET=your_storage_bucket
GEMINI_API_KEY=your_gemini_api_key
```

#### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/hiresphere.git
cd hiresphere
```

2. Install server dependencies
```bash
cd server
npm install
```

3. Install client dependencies
```bash
cd ../client
npm install
```

4. Start the development servers
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

5. Access the application at `http://localhost:5173`

## Project Structure

```
hiresphere/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components by role
│   │   ├── services/       # API service modules
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Custom middleware
│   │   └── config/         # Configuration files
│   └── ...
└── README.md
```

## API Endpoints

### Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout

### Students
- GET /api/student/profile - Get student profile
- PATCH /api/student/profile - Update profile
- POST /api/student/resume - Upload resume
- GET /api/student/drives - Get eligible drives
- GET /api/student/resume-analysis - Get AI resume analysis

### Recruiters
- GET /api/recruiter/profile - Get recruiter profile
- POST /api/recruiter/drives - Create placement drive
- GET /api/recruiter/drives/:id/applicants - Get applicants

### Drives
- GET /api/drives - List all drives
- GET /api/drives/:id - Get drive details
- POST /api/applications - Apply to drive

### Tests
- POST /api/tests - Create test
- POST /api/tests/generate-questions - AI question generation
- GET /api/submissions/:id/ai-review - AI test review

### Applications
- GET /api/applications/:id/ai-score - AI resume scoring

## License

MIT License

## Author

Developed as a comprehensive solution for campus placement management.
