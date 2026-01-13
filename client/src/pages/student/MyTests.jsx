import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IoPlay,
    IoCheckmarkCircle,
    IoTime,
    IoDocumentText,
    IoCalendar,
    IoBusiness,
    IoCloseCircle,
    IoHourglass,
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import { testService } from '../../services/testService';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const StudentTests = () => {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const response = await testService.getStudentTests();
            if (response.success) {
                setSubmissions(response.data.submissions || []);
            }
        } catch (error) {
            toast.error('Failed to fetch tests');
        } finally {
            setLoading(false);
        }
    };

    const filteredSubmissions = submissions.filter((s) => {
        if (filter === 'scheduled') return s.status === 'scheduled';
        if (filter === 'completed') return s.status === 'submitted' || s.status === 'evaluated';
        return true;
    });

    const getStatusConfig = (status) => {
        const config = {
            scheduled: {
                icon: <IoCalendar size={16} />,
                class: 'badge-info',
                label: 'Scheduled',
            },
            in_progress: {
                icon: <IoHourglass size={16} />,
                class: 'badge-warning',
                label: 'In Progress',
            },
            submitted: {
                icon: <IoCheckmarkCircle size={16} />,
                class: 'badge-success',
                label: 'Submitted',
            },
            evaluated: {
                icon: <IoCheckmarkCircle size={16} />,
                class: 'badge-success',
                label: 'Evaluated',
            },
            expired: {
                icon: <IoCloseCircle size={16} />,
                class: 'badge-danger',
                label: 'Expired',
            },
        };
        return config[status] || config.scheduled;
    };

    const canStartTest = (submission) => {
        if (submission.status !== 'scheduled') return false;
        const now = new Date();
        const scheduledAt = new Date(submission.scheduledAt);
        const expiresAt = submission.expiresAt ? new Date(submission.expiresAt) : null;

        // Can start if current time is after scheduled time and before expiry
        if (now < scheduledAt) return false;
        if (expiresAt && now > expiresAt) return false;
        return true;
    };

    const handleStartTest = (submissionId) => {
        navigate(`/student/tests/${submissionId}/instructions`);
    };

    const handleViewResult = (submissionId) => {
        navigate(`/student/tests/${submissionId}/result`);
    };

    if (loading) {
        return <Loader fullScreen />;
    }

    return (
        <div className="space-y-6">
            <FadeIn>
                <div>
                    <h1 className="text-3xl font-bold text-primary-900">My Tests</h1>
                    <p className="text-primary-600 mt-1">View and take your scheduled assessments</p>
                </div>
            </FadeIn>

            {/* Filter Tabs */}
            <FadeIn delay={0.1}>
                <div className="flex gap-2">
                    {['all', 'scheduled', 'completed'].map((tab) => (
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

            {/* Tests List */}
            <FadeIn delay={0.2}>
                {filteredSubmissions.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <IoDocumentText className="mx-auto text-primary-300 mb-4" size={64} />
                            <p className="text-primary-600">No tests scheduled</p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredSubmissions.map((submission, index) => {
                            const statusConfig = getStatusConfig(submission.status);
                            const canStart = canStartTest(submission);
                            const test = submission.testId;

                            return (
                                <motion.div
                                    key={submission._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className={submission.status === 'in_progress' ? 'border-2 border-yellow-500' : ''}>
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold text-primary-900">
                                                        {test?.title || 'Assessment'}
                                                    </h3>
                                                    <span className={`badge ${statusConfig.class} flex items-center gap-1`}>
                                                        {statusConfig.icon} {statusConfig.label}
                                                    </span>
                                                    <span className={`px-2 py-0.5 text-xs rounded ${test?.type === 'aptitude' ? 'bg-blue-100 text-blue-700' :
                                                        test?.type === 'technical' ? 'bg-purple-100 text-purple-700' :
                                                            'bg-green-100 text-green-700'
                                                        }`}>
                                                        {test?.type}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-primary-600 mb-3 line-clamp-2">
                                                    {test?.description || 'Complete this assessment within the given time.'}
                                                </p>

                                                <div className="flex flex-wrap gap-4 text-sm text-primary-500">
                                                    <span className="flex items-center gap-1">
                                                        <IoBusiness size={16} />
                                                        {submission.scheduledBy?.companyName || 'Company'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <IoTime size={16} />
                                                        {test?.duration || 60} mins
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <IoCalendar size={16} />
                                                        {formatDate(submission.scheduledAt)}
                                                    </span>
                                                    {submission.expiresAt && (
                                                        <span className="text-red-500">
                                                            Expires: {formatDate(submission.expiresAt)}
                                                        </span>
                                                    )}
                                                </div>

                                                {(submission.status === 'submitted' || submission.status === 'evaluated') && (
                                                    <div className="mt-3 p-2 bg-primary-50 rounded-lg">
                                                        <div className="flex items-center gap-4 text-sm">
                                                            <span>
                                                                <strong>Score:</strong> {submission.scores?.totalScore}/{submission.scores?.maxScore}
                                                            </span>
                                                            <span>
                                                                <strong>Percentage:</strong> {submission.scores?.percentage}%
                                                            </span>
                                                            <span className={submission.scores?.passed ? 'text-green-600' : 'text-red-600'}>
                                                                {submission.scores?.passed ? '✓ Passed' : '✗ Not Passed'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2 items-start">
                                                {submission.status === 'scheduled' && (
                                                    <Button
                                                        icon={<IoPlay />}
                                                        onClick={() => handleStartTest(submission._id)}
                                                        disabled={!canStart}
                                                    >
                                                        {canStart ? 'Start Test' : 'Not Yet'}
                                                    </Button>
                                                )}
                                                {submission.status === 'in_progress' && (
                                                    <Button
                                                        icon={<IoPlay />}
                                                        onClick={() => handleStartTest(submission._id)}
                                                    >
                                                        Continue
                                                    </Button>
                                                )}
                                                {(submission.status === 'submitted' || submission.status === 'evaluated') && (
                                                    <Button
                                                        variant="secondary"
                                                        icon={<IoDocumentText />}
                                                        onClick={() => handleViewResult(submission._id)}
                                                    >
                                                        View Result
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
        </div>
    );
};

export default StudentTests;
