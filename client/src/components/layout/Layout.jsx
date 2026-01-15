/**
 * Layout Component
 * Main layout wrapper with responsive sidebar support
 */
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../../hooks/useAuth';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth pages - no layout at all
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].some(
    (path) => location.pathname.startsWith(path)
  );

  // Public pages - show children without sidebar/navbar
  const isPublicPage = ['/', '/about', '/contact', '/faq', '/privacy', '/terms'].includes(
    location.pathname
  );

  // Auth pages or public pages - render without layout
  if (isAuthPage || isPublicPage) {
    return <div className="min-h-screen flex flex-col">{children}</div>;
  }

  // Not authenticated and not on public page - show simple layout
  if (!isAuthenticated) {
    return <div className="min-h-screen flex flex-col">{children}</div>;
  }

  // Authenticated user on dashboard pages - show full layout with sidebar
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 bg-primary-50 w-full min-w-0">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
