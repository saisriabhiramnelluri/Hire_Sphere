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
├── client/                          # React Frontend
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── assets/                  # Images and static files
│   │   ├── components/
│   │   │   ├── animations/          # Animation components
│   │   │   │   └── FadeIn.jsx
│   │   │   ├── common/              # Reusable UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Dropdown.jsx
│   │   │   │   ├── FileUpload.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   └── DraggableHiringPipeline.jsx
│   │   │   ├── interview/           # Interview components
│   │   │   │   └── VideoRoom.jsx
│   │   │   ├── layout/              # Layout components
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── DashboardLayout.jsx
│   │   │   └── test/                # Test-related components
│   │   │       ├── AIQuestionModal.jsx
│   │   │       ├── CodeEditor.jsx
│   │   │       ├── MCQQuestion.jsx
│   │   │       ├── TestReviewModal.jsx
│   │   │       └── Timer.jsx
│   │   ├── context/                 # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useSocket.js
│   │   │   └── useDebounce.js
│   │   ├── pages/
│   │   │   ├── admin/               # Admin pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── ManageUsers.jsx
│   │   │   │   ├── ManageDrives.jsx
│   │   │   │   ├── Analytics.jsx
│   │   │   │   ├── Reports.jsx
│   │   │   │   ├── Settings.jsx
│   │   │   │   ├── Notifications.jsx
│   │   │   │   ├── OfferManagement.jsx
│   │   │   │   └── EligibilityRules.jsx
│   │   │   ├── auth/                # Authentication pages
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── ForgotPassword.jsx
│   │   │   ├── interview/           # Interview pages
│   │   │   │   └── InterviewRoom.jsx
│   │   │   ├── public/              # Public pages
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── About.jsx
│   │   │   │   └── Contact.jsx
│   │   │   ├── recruiter/           # Recruiter pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── CompanyProfile.jsx
│   │   │   │   ├── CreateDrive.jsx
│   │   │   │   ├── EditDrive.jsx
│   │   │   │   ├── MyDrives.jsx
│   │   │   │   ├── DriveDetails.jsx
│   │   │   │   ├── ViewApplicants.jsx
│   │   │   │   ├── TestDesigner.jsx
│   │   │   │   ├── TestResults.jsx
│   │   │   │   ├── MyTests.jsx
│   │   │   │   ├── Interviews.jsx
│   │   │   │   ├── OfferManagement.jsx
│   │   │   │   └── Notifications.jsx
│   │   │   └── student/             # Student pages
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Profile.jsx
│   │   │       ├── EditProfile.jsx
│   │   │       ├── BrowseDrives.jsx
│   │   │       ├── DriveDetails.jsx
│   │   │       ├── MyApplications.jsx
│   │   │       ├── ApplicationStatus.jsx
│   │   │       ├── MyTests.jsx
│   │   │       ├── TakeTest.jsx
│   │   │       ├── TestInstructions.jsx
│   │   │       ├── TestResult.jsx
│   │   │       ├── MyInterviews.jsx
│   │   │       ├── MyOffers.jsx
│   │   │       ├── ResumeManager.jsx
│   │   │       └── Notifications.jsx
│   │   ├── routes/                  # Route configurations
│   │   │   ├── AppRoutes.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/                # API service modules
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   ├── driveService.js
│   │   │   ├── applicationService.js
│   │   │   ├── testService.js
│   │   │   ├── interviewService.js
│   │   │   ├── offerService.js
│   │   │   └── uploadService.js
│   │   ├── styles/                  # Global styles
│   │   │   └── index.css
│   │   ├── utils/                   # Utility functions
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── config/                  # Configuration files
│   │   │   ├── db.js                # MongoDB connection
│   │   │   ├── cloudinary.js        # Cloudinary setup
│   │   │   ├── firebase.js          # Firebase setup
│   │   │   └── socket.js            # Socket.IO setup
│   │   ├── controllers/             # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── studentController.js
│   │   │   ├── recruiterController.js
│   │   │   ├── adminController.js
│   │   │   ├── driveController.js
│   │   │   ├── applicationController.js
│   │   │   ├── testController.js
│   │   │   ├── submissionController.js
│   │   │   ├── interviewController.js
│   │   │   ├── offerController.js
│   │   │   ├── notificationController.js
│   │   │   └── analyticsController.js
│   │   ├── middleware/              # Custom middleware
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   ├── uploadMiddleware.js
│   │   │   ├── rateLimitMiddleware.js
│   │   │   └── validationMiddleware.js
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Student.js
│   │   │   ├── Recruiter.js
│   │   │   ├── Drive.js
│   │   │   ├── Application.js
│   │   │   ├── Test.js
│   │   │   ├── TestSubmission.js
│   │   │   ├── Question.js
│   │   │   ├── Interview.js
│   │   │   ├── Offer.js
│   │   │   ├── Notification.js
│   │   │   ├── Document.js
│   │   │   └── AuditLog.js
│   │   ├── routes/                  # API routes
│   │   │   ├── index.js             # Route aggregator
│   │   │   ├── authRoutes.js
│   │   │   ├── studentRoutes.js
│   │   │   ├── recruiterRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── driveRoutes.js
│   │   │   ├── applicationRoutes.js
│   │   │   ├── testRoutes.js
│   │   │   ├── submissionRoutes.js
│   │   │   ├── interviewRoutes.js
│   │   │   ├── offerRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   └── uploadRoutes.js
│   │   ├── services/                # Business logic services
│   │   │   ├── aiService.js         # Google Gemini AI
│   │   │   ├── emailService.js
│   │   │   ├── eligibilityService.js
│   │   │   ├── codeExecutionService.js
│   │   │   ├── notificationService.js
│   │   │   ├── reportService.js
│   │   │   └── fileService.js
│   │   ├── utils/                   # Utility functions
│   │   │   ├── responseHandler.js
│   │   │   └── helpers.js
│   │   ├── validators/              # Input validators
│   │   │   ├── authValidator.js
│   │   │   ├── userValidator.js
│   │   │   └── driveValidator.js
│   │   ├── jobs/                    # Background jobs
│   │   │   └── scheduler.js
│   │   ├── seeds/                   # Database seeders
│   │   │   └── seedData.js
│   │   └── app.js                   # Express app setup
│   ├── server.js                    # Entry point
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

## License

MIT License

## Author

Developed as a comprehensive solution for campus placement management.
