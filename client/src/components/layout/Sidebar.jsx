/**
 * Sidebar Component
 * Navigation sidebar for authenticated users
 * Hidden on mobile, visible on large screens by default
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoGrid,
  IoDocuments,
  IoBriefcase,
  IoPersonAdd,
  IoPeople,
  IoStatsChart,
  IoSettings,
  IoPerson,
  IoMail,
  IoTrophy,
  IoNotifications,
  IoVideocam,
  IoClose
} from 'react-icons/io5';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotification();

  // Menu items based on user role
  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { path: '/admin/dashboard', icon: IoGrid, label: 'Dashboard' },
          { path: '/admin/users', icon: IoPeople, label: 'Manage Users' },
          { path: '/admin/drives', icon: IoBriefcase, label: 'Manage Drives' },
          { path: '/admin/notifications', icon: IoNotifications, label: 'Notifications', badge: unreadCount },
          { path: '/admin/analytics', icon: IoStatsChart, label: 'Analytics' },
          { path: '/admin/reports', icon: IoDocuments, label: 'Reports' },
          { path: '/admin/announcements', icon: IoMail, label: 'Announcements' },
          { path: '/admin/settings', icon: IoSettings, label: 'Settings' },
        ];
      case 'student':
        return [
          { path: '/student/dashboard', icon: IoGrid, label: 'Dashboard' },
          { path: '/student/profile', icon: IoPerson, label: 'My Profile' },
          { path: '/student/drives', icon: IoBriefcase, label: 'Browse Drives' },
          { path: '/student/applications', icon: IoDocuments, label: 'My Applications' },
          { path: '/student/interviews', icon: IoVideocam, label: 'My Interviews' },
          { path: '/student/tests', icon: IoDocuments, label: 'My Tests' },
          { path: '/student/offers', icon: IoTrophy, label: 'My Offers' },
          { path: '/student/notifications', icon: IoMail, label: 'Notifications' },
        ];
      case 'recruiter':
        return [
          { path: '/recruiter/dashboard', icon: IoGrid, label: 'Dashboard' },
          { path: '/recruiter/profile', icon: IoPerson, label: 'Company Profile' },
          { path: '/recruiter/drives', icon: IoBriefcase, label: 'My Drives' },
          { path: '/recruiter/create-drive', icon: IoPersonAdd, label: 'Create Drive' },
          { path: '/recruiter/interviews', icon: IoVideocam, label: 'Interviews' },
          { path: '/recruiter/tests', icon: IoDocuments, label: 'My Tests' },
          { path: '/recruiter/notifications', icon: IoMail, label: 'Notifications' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  // Sidebar content (shared between desktop and mobile)
  const sidebarContent = (
    <nav className="p-4 space-y-1">
      {menuItems.map((item, index) => (
        <NavLink
          key={index}
          to={item.path}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${isActive
              ? 'bg-secondary-50 text-secondary-700 font-medium'
              : 'text-primary-600 hover:bg-primary-50 hover:text-primary-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center space-x-3">
                <item.icon size={20} />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar - always visible on large screens */}
      <aside className="hidden lg:block w-64 bg-white border-r border-primary-200 min-h-screen sticky top-16 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar - slides in from left */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            />

            {/* Slide-out menu */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="lg:hidden fixed top-0 left-0 w-64 h-full bg-white z-50 shadow-xl"
            >
              {/* Close button */}
              <div className="flex items-center justify-between p-4 border-b border-primary-200">
                <span className="text-lg font-semibold text-primary-900">Menu</span>
                <button
                  onClick={onClose}
                  className="p-2 text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded-lg"
                >
                  <IoClose size={24} />
                </button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
