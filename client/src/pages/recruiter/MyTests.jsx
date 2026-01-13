import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IoAdd,
    IoCreate,
    IoTrash,
    IoEye,
    IoCheckmarkCircle,
    IoDocumentText,
    IoStatsChart,
    IoCalendar,
    IoPeople,
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import AssignTestModal from '../../components/test/AssignTestModal';
import { testService } from '../../services/testService';
import toast from 'react-hot-toast';

const MyTests = () => {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);

    const handleAssignStudents = (test) => {
        setSelectedTest(test);
        setShowAssignModal(true);
    };

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const response = await testService.getRecruiterTests();
            if (response.success) {
                setTests(response.data.tests || []);
            }
        } catch (error) {
            toast.error('Failed to fetch tests');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this test?')) return;
        try {
            await testService.deleteTest(id);
            toast.success('Test deleted');
            fetchTests();
        } catch (error) {
            toast.error('Failed to delete test');
        }
    };

    const handlePublish = async (id) => {
        try {
            await testService.publishTest(id);
            toast.success('Test published');
            fetchTests();
        } catch (error) {
            toast.error(error.message || 'Failed to publish test');
        }
    };

    const filteredTests = tests.filter((test) => {
        if (filter === 'draft') return test.status === 'draft';
        if (filter === 'published') return test.status === 'published';
        return true;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft':
                return 'badge-warning';
            case 'published':
                return 'badge-success';
            case 'archived':
                return 'badge-info';
            default:
                return 'badge-info';
        }
    };

    const getTypeBadge = (type) => {
        switch (type) {
            case 'aptitude':
                return 'bg-blue-100 text-blue-700';
            case 'technical':
                return 'bg-purple-100 text-purple-700';
            case 'mixed':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return <Loader fullScreen />;
    }

    return (
        <div className="space-y-6">
            <FadeIn>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900">My Tests</h1>
                        <p className="text-primary-600 mt-1">Manage your assessment tests</p>
                    </div>
                    <Button
                        icon={<IoAdd />}
                        onClick={() => navigate('/recruiter/tests/create')}
                    >
                        Create New Test
                    </Button>
                </div>
            </FadeIn>

            {/* Filter Tabs */}
            <FadeIn delay={0.1}>
                <div className="flex gap-2">
                    {['all', 'draft', 'published'].map((tab) => (
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
                {filteredTests.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <IoDocumentText className="mx-auto text-primary-300 mb-4" size={64} />
                            <p className="text-primary-600 mb-4">No tests created yet</p>
                            <Button icon={<IoAdd />} onClick={() => navigate('/recruiter/tests/create')}>
                                Create Your First Test
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {filteredTests.map((test, index) => (
                            <motion.div
                                key={test._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card>
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-lg font-semibold text-primary-900">{test.title}</h3>
                                                <span className={`badge ${getStatusBadge(test.status)}`}>
                                                    {test.status}
                                                </span>
                                                <span className={`px-2 py-0.5 text-xs rounded ${getTypeBadge(test.type)}`}>
                                                    {test.type}
                                                </span>
                                            </div>

                                            <p className="text-sm text-primary-600 mb-3 line-clamp-2">
                                                {test.description || 'No description'}
                                            </p>

                                            <div className="flex flex-wrap gap-4 text-sm text-primary-500">
                                                <span className="flex items-center gap-1">
                                                    <IoDocumentText size={16} />
                                                    {test.inlineQuestions?.length || 0} Questions
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <IoCalendar size={16} />
                                                    {test.duration} mins
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <IoStatsChart size={16} />
                                                    {test.statistics?.totalAttempts || 0} Attempts
                                                </span>
                                                {test.statistics?.averageScore > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        Avg: {test.statistics.averageScore}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 items-start">
                                            {test.status === 'draft' && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    icon={<IoCheckmarkCircle />}
                                                    onClick={() => handlePublish(test._id)}
                                                >
                                                    Publish
                                                </Button>
                                            )}
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                icon={<IoCreate />}
                                                onClick={() => navigate(`/recruiter/tests/${test._id}/edit`)}
                                            >
                                                Edit
                                            </Button>
                                            {test.status === 'published' && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    icon={<IoPeople />}
                                                    onClick={() => handleAssignStudents(test)}
                                                >
                                                    Assign
                                                </Button>
                                            )}
                                            {test.status === 'published' && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    icon={<IoEye />}
                                                    onClick={() => navigate(`/recruiter/tests/${test._id}/results`)}
                                                >
                                                    Results
                                                </Button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(test._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                title="Delete"
                                            >
                                                <IoTrash size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </FadeIn>

            {/* Assign Test Modal */}
            <AssignTestModal
                isOpen={showAssignModal}
                onClose={() => {
                    setShowAssignModal(false);
                    setSelectedTest(null);
                }}
                test={selectedTest}
                onSuccess={fetchTests}
            />
        </div>
    );
};

export default MyTests;
