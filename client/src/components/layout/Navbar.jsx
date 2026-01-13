import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoNotifications,
  IoMenu,
  IoClose,
  IoLogOut,
  IoPersonCircle,
  IoSettings,
  IoCheckmarkCircle,
  IoArrowForward
} from 'react-icons/io5';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { getInitials, formatDate } from '../../utils/helpers';

const Navbar = () => {
  const { user, profile, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotification();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const getProfileRoute = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin/settings';
      case 'student':
        return '/student/profile';
      case 'recruiter':
        return '/recruiter/profile';
      default:
        return '/';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'drive_approval_pending':
        return '📋';
      case 'recruiter_approval_pending':
        return '👔';
      case 'drive_announcement':
        return '📢';
      case 'application_update':
        return '📝';
      case 'offer_received':
        return '🎉';
      default:
        return '🔔';
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    setShowNotifications(false);

    // Navigate based on notification type or actionUrl
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else if (notification.type === 'drive_approval_pending') {
      navigate('/admin/drives');
    } else {
      navigate(`/${user?.role}/notifications`);
    }
  };

  // Get unread notifications for dropdown (max 5)
  const unreadNotifications = notifications
    .filter(n => !n.isRead)
    .slice(0, 5);

  return (
    <nav className="bg-white border-b border-primary-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="text-xl font-bold text-primary-900">HireSphere</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="relative p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <IoNotifications size={24} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-primary-200 overflow-hidden"
                  >
                    <div className="p-4 border-b border-primary-200 flex justify-between items-center">
                      <h3 className="font-semibold text-primary-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {unreadNotifications.length === 0 ? (
                        <div className="p-8 text-center text-primary-500">
                          <IoNotifications className="mx-auto mb-2" size={32} />
                          No new notifications
                        </div>
                      ) : (
                        <div className="divide-y divide-primary-100">
                          {unreadNotifications.map((notification) => (
                            <div
                              key={notification._id}
                              onClick={() => handleNotificationClick(notification)}
                              className="p-4 hover:bg-primary-50 cursor-pointer transition-colors"
                            >
                              <div className="flex items-start space-x-3">
                                <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium text-primary-900 truncate">
                                      {notification.title}
                                    </p>
                                    {notification.priority === 'high' && (
                                      <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full" />
                                    )}
                                  </div>
                                  <p className="text-xs text-primary-600 mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-primary-400">
                                      {formatDate(notification.createdAt)}
                                    </span>
                                    {(notification.type === 'drive_approval_pending' ||
                                      notification.type === 'recruiter_approval_pending') && (
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center">
                                          <IoArrowForward size={12} className="mr-1" />
                                          Action Required
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-primary-200 bg-primary-50">
                      <button
                        onClick={() => {
                          navigate(`/${user?.role}/notifications`);
                          setShowNotifications(false);
                        }}
                        className="w-full text-center text-sm text-secondary-600 font-medium hover:text-secondary-700 py-2"
                      >
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-2 p-2 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-secondary-500 text-white rounded-full flex items-center justify-center font-medium">
                  {profile
                    ? (profile.firstName
                      ? getInitials(profile.firstName, profile.lastName)
                      : (profile.contactPerson?.firstName
                        ? getInitials(profile.contactPerson.firstName, profile.contactPerson.lastName)
                        : (profile.companyName?.charAt(0) || 'R').toUpperCase()))
                    : user?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-medium text-primary-900">
                  {profile
                    ? (profile.firstName
                      ? `${profile.firstName} ${profile.lastName}`
                      : (profile.contactPerson?.firstName
                        ? `${profile.contactPerson.firstName} ${profile.contactPerson.lastName}`
                        : (profile.companyName || 'Recruiter')))
                    : user?.email}
                </span>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-primary-200 overflow-hidden"
                  >
                    <div className="p-4 border-b border-primary-200">
                      <p className="text-sm font-medium text-primary-900">
                        {profile
                          ? (profile.firstName
                            ? `${profile.firstName} ${profile.lastName}`
                            : (profile.contactPerson?.firstName
                              ? `${profile.contactPerson.firstName} ${profile.contactPerson.lastName}`
                              : (profile.companyName || 'Recruiter')))
                          : user?.email}
                      </p>
                      <p className="text-xs text-primary-500 capitalize">{user?.role}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          navigate(getProfileRoute());
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <IoPersonCircle size={20} />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate(`/${user?.role}/settings`);
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <IoSettings size={20} />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <IoLogOut size={20} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

