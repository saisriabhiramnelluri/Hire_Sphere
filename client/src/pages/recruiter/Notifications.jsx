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
            case 'application_update':
                return '📝';
            case 'offer_response':
                return '💼';
            case 'drive_approval_pending':
                return '⏳';
            case 'interview_schedule':
                return '📅';
            case 'general':
                return '📢';
            default:
                return '🔔';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'border-l-red-500';
            case 'medium':
                return 'border-l-yellow-500';
            case 'low':
                return 'border-l-green-500';
            default:
                return 'border-l-primary-300';
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }

        // Navigate based on notification type
        if (notification.type === 'application_update' && notification.relatedEntity?.entityId) {
            navigate(`/recruiter/drives/${notification.relatedEntity.entityId}/applicants`);
        } else if (notification.type === 'offer_response' && notification.relatedEntity?.entityId) {
            navigate(`/recruiter/drives`);
        } else if (notification.type === 'drive_approval_pending') {
            navigate('/recruiter/drives');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            toast.success('All notifications marked as read');
        } catch {
            toast.error('Failed to mark all as read');
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            await deleteNotification(id);
            toast.success('Notification deleted');
        } catch {
            toast.error('Failed to delete notification');
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) {
        return <Loader fullScreen />;
    }

    return (
        <div className="space-y-6">
            <FadeIn>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900">Notifications</h1>
                        <p className="text-primary-600 mt-1">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="secondary"
                            icon={<IoCheckmarkDone />}
                            onClick={handleMarkAllAsRead}
                        >
                            Mark All as Read
                        </Button>
                    )}
                </div>
            </FadeIn>

            <FadeIn delay={0.1}>
                <div className="flex gap-2 mb-4">
                    {['all', 'unread', 'read'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === f
                                    ? 'bg-secondary-500 text-white'
                                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </FadeIn>

            <FadeIn delay={0.2}>
                {filteredNotifications.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <IoNotifications className="mx-auto text-primary-300 mb-4" size={64} />
                            <p className="text-primary-600">
                                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification, index) => (
                            <motion.div
                                key={notification._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => handleNotificationClick(notification)}
                                className={`bg-white rounded-lg border-l-4 ${getPriorityColor(notification.priority)} 
                  shadow-sm hover:shadow-md transition-all cursor-pointer p-4 
                  ${!notification.isRead ? 'bg-secondary-50/30' : ''}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-semibold ${!notification.isRead ? 'text-primary-900' : 'text-primary-700'}`}>
                                                    {notification.title}
                                                </h3>
                                                {!notification.isRead && (
                                                    <span className="w-2 h-2 bg-secondary-500 rounded-full"></span>
                                                )}
                                            </div>
                                            <p className="text-primary-600 text-sm mt-1">{notification.message}</p>
                                            <p className="text-xs text-primary-400 mt-2">
                                                {formatDate(notification.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!notification.isRead && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notification._id);
                                                }}
                                                className="p-2 text-primary-400 hover:text-secondary-500 hover:bg-secondary-50 rounded-lg transition-colors"
                                                title="Mark as read"
                                            >
                                                <IoMailOpen size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => handleDelete(e, notification._id)}
                                            className="p-2 text-primary-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
            </FadeIn>
        </div>
    );
};

export default Notifications;
