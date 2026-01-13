import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IoNotifications,
    IoCheckmarkDone,
    IoTrash,
    IoMailOpen,
    IoCheckmarkCircle,
    IoClose
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import { useNotification } from '../../context/NotificationContext';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Notifications = () => {
    const navigate = useNavigate();
    const {
        notifications,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications
    } = useNotification();

    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const filteredNotifications = notifications.filter((notif) => {
        if (filter === 'unread') return !notif.isRead;
        if (filter === 'read') return notif.isRead;
        return true;
    });

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'drive_announcement':
                return '📢';
            case 'drive_approval_pending':
                return '📋';
            case 'recruiter_approval_pending':
                return '👔';
            case 'application_update':
                return '📝';
            case 'interview_schedule':
                return '📅';
            case 'offer_received':
                return '🎉';
            default:
                return '🔔';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'border-l-4 border-l-red-500 bg-red-50';
            case 'medium':
                return 'border-l-4 border-l-yellow-500 bg-yellow-50';
            default:
                return 'border-l-4 border-l-blue-500 bg-blue-50';
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }

        // Navigate based on notification type
        if (notification.type === 'drive_approval_pending') {
            navigate('/admin/drives');
        } else if (notification.type === 'recruiter_approval_pending') {
            navigate('/admin/drives');
        } else if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    return (
        <div className="space-y-6">
            <FadeIn>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900">Notifications</h1>
                        <p className="text-primary-600 mt-1">Stay updated with pending approvals and activities</p>
                    </div>
                    <Button
                        icon={<IoCheckmarkDone />}
                        variant="secondary"
                        onClick={markAllAsRead}
                    >
                        Mark All Read
                    </Button>
                </div>
            </FadeIn>

            <FadeIn delay={0.1}>
                <Card>
                    <div className="flex space-x-2 mb-6 border-b border-primary-200">
                        {['all', 'unread', 'read'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-4 py-2 font-medium transition-colors capitalize ${filter === tab
                                    ? 'text-secondary-600 border-b-2 border-secondary-600'
                                    : 'text-primary-600 hover:text-primary-900'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <Loader />
                    ) : filteredNotifications.length === 0 ? (
                        <div className="text-center py-12">
                            <IoNotifications className="mx-auto text-primary-300 mb-4" size={64} />
                            <p className="text-primary-600">No notifications to display</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredNotifications.map((notification, index) => (
                                <motion.div
                                    key={notification._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 rounded-lg transition-all cursor-pointer hover:shadow-md ${notification.isRead
                                        ? 'bg-white border border-primary-200'
                                        : getPriorityColor(notification.priority)
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3 flex-1">
                                            <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h3 className="font-semibold text-primary-900">
                                                        {notification.title}
                                                    </h3>
                                                    {!notification.isRead && (
                                                        <span className="w-2 h-2 bg-secondary-500 rounded-full" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-primary-700 mb-2">{notification.message}</p>
                                                <div className="flex items-center space-x-4 text-xs text-primary-500">
                                                    <span>{formatDate(notification.createdAt)}</span>
                                                    {notification.priority === 'high' && (
                                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                                                            High Priority
                                                        </span>
                                                    )}
                                                    {(notification.type === 'drive_approval_pending' || notification.type === 'recruiter_approval_pending') && (
                                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                                                            Action Required
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 ml-4" onClick={(e) => e.stopPropagation()}>
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <IoMailOpen size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    deleteNotification(notification._id);
                                                    toast.success('Notification deleted');
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <IoTrash size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </Card>
            </FadeIn>
        </div>
    );
};

export default Notifications;
