import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  IoVideocam
} from 'react-icons/io5';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';

const Sidebar = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotification();

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

  return (
    <aside className="w-64 bg-white border-r border-primary-200 min-h-screen sticky top-16">
      <nav className="p-4 space-y-1">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                ? 'bg-secondary-50 text-secondary-700 font-medium'
                : 'text-primary-600 hover:bg-primary-50 hover:text-primary-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center space-x-3"
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </motion.div>
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
    </aside>
  );
};

export default Sidebar;

