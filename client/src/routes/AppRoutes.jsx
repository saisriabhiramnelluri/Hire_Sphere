import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

import AdminDashboard from '../pages/admin/Dashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageDrives from '../pages/admin/ManageDrives';
import Analytics from '../pages/admin/Analytics';
import AdminNotifications from '../pages/admin/Notifications';
import AdminSettings from '../pages/admin/Settings';
import AdminReports from '../pages/admin/Reports';
import AdminAnnouncements from '../pages/admin/Announcements';

import StudentDashboard from '../pages/student/Dashboard';
import StudentProfile from '../pages/student/Profile';
import EditProfile from '../pages/student/EditProfile';
import BrowseDrives from '../pages/student/BrowseDrives';
import DriveDetails from '../pages/student/DriveDetails';
import MyApplications from '../pages/student/MyApplications';
import MyOffers from '../pages/student/MyOffers';
import StudentNotifications from '../pages/student/Notifications';
import StudentInterviews from '../pages/student/MyInterviews';
import StudentTests from '../pages/student/MyTests';
import TestInstructions from '../pages/student/TestInstructions';
import TakeTest from '../pages/student/TakeTest';
import TestResult from '../pages/student/TestResult';

import RecruiterDashboard from '../pages/recruiter/Dashboard';
import RecruiterProfile from '../pages/recruiter/CompanyProfile';
import CreateDrive from '../pages/recruiter/CreateDrive';
import EditDrive from '../pages/recruiter/EditDrive';
import MyDrives from '../pages/recruiter/MyDrives';
import RecruiterDriveDetails from '../pages/recruiter/DriveDetails';
import ViewApplicants from '../pages/recruiter/ViewApplicants';
import RecruiterNotifications from '../pages/recruiter/Notifications';
import RecruiterInterviews from '../pages/recruiter/Interviews';
import MyTests from '../pages/recruiter/MyTests';
import TestDesigner from '../pages/recruiter/TestDesigner';
import TestResults from '../pages/recruiter/TestResults';

// Public Pages
import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';
import FAQ from '../pages/public/FAQ';
import Privacy from '../pages/public/Privacy';
import Terms from '../pages/public/Terms';

// Interview Room
import InterviewRoom from '../pages/interview/InterviewRoom';

const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Interview Room - accessible by both student and recruiter */}
        <Route
          path="/interview/:roomId"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['student', 'recruiter']}>
                <InterviewRoom />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<ManageUsers />} />
                  <Route path="drives" element={<ManageDrives />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="notifications" element={<AdminNotifications />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="announcements" element={<AdminAnnouncements />} />
                </Routes>
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/*"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['student']}>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="profile" element={<StudentProfile />} />
                  <Route path="profile/edit" element={<EditProfile />} />
                  <Route path="drives" element={<BrowseDrives />} />
                  <Route path="drives/:id" element={<DriveDetails />} />
                  <Route path="applications" element={<MyApplications />} />
                  <Route path="interviews" element={<StudentInterviews />} />
                  <Route path="tests" element={<StudentTests />} />
                  <Route path="tests/:submissionId/instructions" element={<TestInstructions />} />
                  <Route path="tests/:submissionId/take" element={<TakeTest />} />
                  <Route path="tests/:submissionId/result" element={<TestResult />} />
                  <Route path="offers" element={<MyOffers />} />
                  <Route path="notifications" element={<StudentNotifications />} />
                </Routes>
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/*"
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['recruiter']}>
                <Routes>
                  <Route path="dashboard" element={<RecruiterDashboard />} />
                  <Route path="profile" element={<RecruiterProfile />} />
                  <Route path="create-drive" element={<CreateDrive />} />
                  <Route path="drives" element={<MyDrives />} />
                  <Route path="drives/:id" element={<RecruiterDriveDetails />} />
                  <Route path="drives/:id/edit" element={<EditDrive />} />
                  <Route path="drives/:id/applicants" element={<ViewApplicants />} />
                  <Route path="interviews" element={<RecruiterInterviews />} />
                  <Route path="tests" element={<MyTests />} />
                  <Route path="tests/create" element={<TestDesigner />} />
                  <Route path="tests/:id/edit" element={<TestDesigner />} />
                  <Route path="tests/:testId/results" element={<TestResults />} />
                  <Route path="notifications" element={<RecruiterNotifications />} />
                </Routes>
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />

        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;
