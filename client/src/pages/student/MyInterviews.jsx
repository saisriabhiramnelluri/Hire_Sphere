import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IoVideocam,
    IoCalendar,
    IoTime,
    IoBusiness,
    IoCheckmarkCircle,
    IoCloseCircle,
    IoPlay,
    IoEnter,
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import Modal from '../../components/common/Modal';
import { useModal } from '../../hooks/useModal';
import { interviewService } from '../../services/interviewService';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MyInterviews = () => {
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [roomIdInput, setRoomIdInput] = useState('');
    const { isOpen: isJoinModalOpen, open: openJoinModal, close: closeJoinModal } = useModal();

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            const response = await interviewService.getStudentInterviews();
            if (response.success) {
                setInterviews(response.data.interviews || []);
            }
        } catch (error) {
            toast.error('Failed to fetch interviews');
        } finally {
            setLoading(false);
        }
    };

    const filteredInterviews = interviews.filter((interview) => {
        if (filter === 'upcoming') return interview.status === 'scheduled';
        if (filter === 'completed') return interview.status === 'completed';
        return true;
    });

    const getStatusBadge = (status) => {
        const config = {
            scheduled: { class: 'badge-info', icon: <IoCalendar size={14} /> },
            ongoing: { class: 'badge-warning', icon: <IoPlay size={14} /> },
            completed: { class: 'badge-success', icon: <IoCheckmarkCircle size={14} /> },
            cancelled: { class: 'badge-danger', icon: <IoCloseCircle size={14} /> },
        };
        return config[status] || config.scheduled;
    };

    const canJoinInterview = (interview) => {
        if (interview.status !== 'scheduled') return false;
        const scheduledTime = new Date(interview.scheduledAt);
        const now = new Date();
        const diffMinutes = (scheduledTime - now) / (1000 * 60);
        // Can join 5 minutes before scheduled time
        return diffMinutes <= 5;
    };

    const handleJoinInterview = (roomId) => {
        navigate(`/interview/${roomId}`);
    };

    const handleJoinWithRoomId = () => {
        if (!roomIdInput.trim()) {
            toast.error('Please enter a Room ID');
            return;
        }
        navigate(`/interview/${roomIdInput.trim()}`);
        closeJoinModal();
    };

    const isInterviewNow = (interview) => {
        const scheduledTime = new Date(interview.scheduledAt);
        const now = new Date();
        const diffMinutes = Math.abs((scheduledTime - now) / (1000 * 60));
        return diffMinutes <= 15 && interview.status === 'scheduled';
    };

    if (loading) {
        return <Loader fullScreen />;
    }

    return (
        <div className="space-y-6">
            <FadeIn>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900">My Interviews</h1>
                        <p className="text-primary-600 mt-1">View and join your scheduled interviews</p>
                    </div>
                    <Button
                        icon={<IoEnter />}
                        onClick={openJoinModal}
                        variant="secondary"
                    >
                        Join with Room ID
                    </Button>
                </div>
            </FadeIn>

            {/* Filter Tabs */}
            <FadeIn delay={0.1}>
                <div className="flex gap-2">
                    {['all', 'upcoming', 'completed'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === tab
                                    ? 'bg-secondary-500 text-white'
                                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </FadeIn>

            {/* Interviews List */}
            <FadeIn delay={0.2}>
                {filteredInterviews.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <IoVideocam className="mx-auto text-primary-300 mb-4" size={64} />
                            <p className="text-primary-600">No interviews scheduled</p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredInterviews.map((interview, index) => {
                            const statusBadge = getStatusBadge(interview.status);
                            const isNow = isInterviewNow(interview);
                            const canJoin = canJoinInterview(interview);

                            return (
                                <motion.div
                                    key={interview._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className={isNow ? 'border-2 border-green-500 shadow-lg' : ''}>
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-primary-900">
                                                        {interview.title}
                                                    </h3>
                                                    <span className={`badge ${statusBadge.class} flex items-center gap-1`}>
                                                        {statusBadge.icon} {interview.status}
                                                    </span>
                                                    {isNow && (
                                                        <span className="badge badge-success animate-pulse">
                                                            🔴 Live Now
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div className="flex items-center text-primary-600">
                                                        <IoBusiness className="mr-2 text-primary-400" />
                                                        {interview.driveId?.companyName}
                                                    </div>
                                                    <div className="flex items-center text-primary-600">
                                                        <IoCalendar className="mr-2 text-primary-400" />
                                                        {formatDate(interview.scheduledAt)}
                                                    </div>
                                                    <div className="flex items-center text-primary-600">
                                                        <IoTime className="mr-2 text-primary-400" />
                                                        {new Date(interview.scheduledAt).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </div>
                                                    <div className="flex items-center text-primary-600">
                                                        <IoVideocam className="mr-2 text-primary-400" />
                                                        {interview.duration} mins
                                                    </div>
                                                </div>

                                                <div className="mt-3 text-xs text-primary-500">
                                                    <span className="font-medium">Room ID:</span>{' '}
                                                    <code className="bg-primary-100 px-2 py-0.5 rounded">{interview.roomId}</code>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                {interview.status === 'scheduled' && (
                                                    <Button
                                                        icon={<IoVideocam />}
                                                        onClick={() => handleJoinInterview(interview.roomId)}
                                                        disabled={!canJoin}
                                                        variant={canJoin ? 'primary' : 'secondary'}
                                                    >
                                                        {canJoin ? 'Join Now' : 'Waiting...'}
                                                    </Button>
                                                )}
                                                {interview.status === 'completed' && interview.feedback && (
                                                    <span className="text-sm text-primary-600">
                                                        Rating: {'⭐'.repeat(interview.feedback.rating || 0)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </FadeIn>

            {/* Join with Room ID Modal */}
            <Modal isOpen={isJoinModalOpen} onClose={closeJoinModal} title="Join Interview">
                <div className="space-y-4">
                    <p className="text-primary-600">
                        Enter the Room ID shared in your interview notification to join the video call.
                    </p>
                    <Input
                        label="Room ID"
                        value={roomIdInput}
                        onChange={(e) => setRoomIdInput(e.target.value)}
                        placeholder="Enter room ID (e.g., a1b2c3d4)"
                        icon={<IoVideocam />}
                    />
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={closeJoinModal}>
                            Cancel
                        </Button>
                        <Button icon={<IoPlay />} onClick={handleJoinWithRoomId}>
                            Join Interview
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MyInterviews;
