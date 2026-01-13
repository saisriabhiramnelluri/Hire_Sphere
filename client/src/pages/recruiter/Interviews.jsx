import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IoVideocam,
    IoCalendar,
    IoTime,
    IoPerson,
    IoCheckmarkCircle,
    IoCloseCircle,
    IoPlay,
    IoEnter,
    IoTrash,
    IoCreate,
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import Modal from '../../components/common/Modal';
import Dropdown from '../../components/common/Dropdown';
import { useModal } from '../../hooks/useModal';
import { interviewService } from '../../services/interviewService';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const RecruiterInterviews = () => {
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [roomIdInput, setRoomIdInput] = useState('');
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [feedbackData, setFeedbackData] = useState({
        rating: 3,
        notes: '',
        recommendation: 'neutral',
    });
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    const { isOpen: isJoinModalOpen, open: openJoinModal, close: closeJoinModal } = useModal();
    const { isOpen: isFeedbackModalOpen, open: openFeedbackModal, close: closeFeedbackModal } = useModal();

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            const response = await interviewService.getRecruiterInterviews();
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

    const handleCancelInterview = async (id) => {
        if (!confirm('Are you sure you want to cancel this interview?')) return;
        try {
            await interviewService.cancelInterview(id, 'Cancelled by recruiter');
            toast.success('Interview cancelled');
            fetchInterviews();
        } catch (error) {
            toast.error('Failed to cancel interview');
        }
    };

    const handleOpenFeedback = (interview) => {
        setSelectedInterview(interview);
        setFeedbackData({
            rating: interview.feedback?.rating || 3,
            notes: interview.feedback?.notes || '',
            recommendation: interview.feedback?.recommendation || 'neutral',
        });
        openFeedbackModal();
    };

    const handleSubmitFeedback = async () => {
        if (!selectedInterview) return;
        setSubmittingFeedback(true);
        try {
            await interviewService.submitFeedback(selectedInterview._id, feedbackData);
            toast.success('Feedback submitted');
            closeFeedbackModal();
            fetchInterviews();
        } catch (error) {
            toast.error('Failed to submit feedback');
        } finally {
            setSubmittingFeedback(false);
        }
    };

    const isInterviewNow = (interview) => {
        const scheduledTime = new Date(interview.scheduledAt);
        const now = new Date();
        const diffMinutes = Math.abs((scheduledTime - now) / (1000 * 60));
        return diffMinutes <= 15 && interview.status === 'scheduled';
    };

    const recommendationOptions = [
        { value: 'strongly_hire', label: 'Strongly Hire' },
        { value: 'hire', label: 'Hire' },
        { value: 'neutral', label: 'Neutral' },
        { value: 'no_hire', label: 'No Hire' },
        { value: 'strongly_no_hire', label: 'Strongly No Hire' },
    ];

    if (loading) {
        return <Loader fullScreen />;
    }

    return (
        <div className="space-y-6">
            <FadeIn>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900">Interview Schedule</h1>
                        <p className="text-primary-600 mt-1">Manage and conduct interviews</p>
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
                                                        <IoPerson className="mr-2 text-primary-400" />
                                                        {interview.studentId?.firstName} {interview.studentId?.lastName}
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
                                                    <>
                                                        <Button
                                                            icon={<IoVideocam />}
                                                            onClick={() => handleJoinInterview(interview.roomId)}
                                                        >
                                                            Start Interview
                                                        </Button>
                                                        <button
                                                            onClick={() => handleCancelInterview(interview._id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                            title="Cancel Interview"
                                                        >
                                                            <IoTrash size={20} />
                                                        </button>
                                                    </>
                                                )}
                                                {interview.status === 'completed' && (
                                                    <Button
                                                        icon={<IoCreate />}
                                                        variant="secondary"
                                                        onClick={() => handleOpenFeedback(interview)}
                                                    >
                                                        {interview.feedback ? 'View Feedback' : 'Add Feedback'}
                                                    </Button>
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
                        Enter a Room ID to join an ongoing interview session.
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

            {/* Feedback Modal */}
            <Modal isOpen={isFeedbackModalOpen} onClose={closeFeedbackModal} title="Interview Feedback" size="lg">
                {selectedInterview && (
                    <div className="space-y-4">
                        <div className="bg-primary-50 rounded-lg p-4">
                            <p className="text-sm text-primary-600">Feedback for:</p>
                            <p className="font-semibold text-primary-900">
                                {selectedInterview.studentId?.firstName} {selectedInterview.studentId?.lastName}
                            </p>
                        </div>

                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-medium text-primary-700 mb-2">
                                Rating (1-5)
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setFeedbackData((prev) => ({ ...prev, rating: star }))}
                                        className={`text-3xl transition-transform hover:scale-110 ${star <= feedbackData.rating ? 'text-yellow-500' : 'text-gray-300'
                                            }`}
                                    >
                                        ⭐
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recommendation */}
                        <div>
                            <label className="block text-sm font-medium text-primary-700 mb-2">
                                Recommendation
                            </label>
                            <Dropdown
                                value={feedbackData.recommendation}
                                onChange={(e) => setFeedbackData((prev) => ({ ...prev, recommendation: e.target.value }))}
                                options={recommendationOptions}
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-primary-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                value={feedbackData.notes}
                                onChange={(e) => setFeedbackData((prev) => ({ ...prev, notes: e.target.value }))}
                                className="input-field min-h-[100px]"
                                placeholder="Detailed feedback about the interview..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="secondary" onClick={closeFeedbackModal}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitFeedback}
                                loading={submittingFeedback}
                                disabled={submittingFeedback}
                            >
                                Save Feedback
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default RecruiterInterviews;
