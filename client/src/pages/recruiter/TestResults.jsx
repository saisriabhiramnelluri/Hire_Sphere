import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IoArrowBack,
    IoCheckmarkCircle,
    IoCloseCircle,
    IoTime,
    IoPerson,
    IoDocumentText,
    IoEye,
    IoDownload,
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import { testService } from '../../services/testService';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TestResults = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [test, setTest] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    useEffect(() => {
        fetchData();
    }, [testId]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch test details
            try {
                const testRes = await testService.getTestById(testId);
                if (testRes.success) {
                    setTest(testRes.data.test);
                }
            } catch (err) {
                console.error('Error fetching test:', err);
            }

            // Fetch submissions
            try {
                const subRes = await testService.getTestSubmissions(testId);
                if (subRes.success) {
                    setSubmissions(subRes.data.submissions || []);
                }
            } catch (err) {
                console.error('Error fetching submissions:', err);
            }
        } catch (error) {
            console.error('fetchData error:', error);
            toast.error(error.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            scheduled: 'badge-info',
            in_progress: 'badge-warning',
            submitted: 'badge-success',
            evaluated: 'badge-success',
            expired: 'badge-danger',
        };
        return badges[status] || 'badge-info';
    };

    const formatTime = (seconds) => {
        if (!seconds) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    if (loading) {
        return <Loader fullScreen />;
    }

    return (
        <div className="space-y-6">
            <FadeIn>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/recruiter/tests')}
                        className="p-2 hover:bg-primary-100 rounded-lg"
                    >
                        <IoArrowBack size={24} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-primary-900">Test Results</h1>
                        <p className="text-primary-600 mt-1">{test?.title}</p>
                    </div>
                </div>
            </FadeIn>

            {/* Test Stats */}
            <FadeIn delay={0.1}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <div className="text-center">
                            <p className="text-sm text-primary-500">Total Attempts</p>
                            <p className="text-2xl font-bold text-primary-900">
                                {test?.statistics?.totalAttempts || 0}
                            </p>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <p className="text-sm text-primary-500">Average Score</p>
                            <p className="text-2xl font-bold text-primary-900">
                                {test?.statistics?.averageScore || 0}%
                            </p>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <p className="text-sm text-primary-500">Highest Score</p>
                            <p className="text-2xl font-bold text-green-600">
                                {test?.statistics?.highestScore || 0}%
                            </p>
                        </div>
                    </Card>
                    <Card>
                        <div className="text-center">
                            <p className="text-sm text-primary-500">Lowest Score</p>
                            <p className="text-2xl font-bold text-red-600">
                                {test?.statistics?.lowestScore || 0}%
                            </p>
                        </div>
                    </Card>
                </div>
            </FadeIn>

            {/* Submissions Table */}
            <FadeIn delay={0.2}>
                <Card title="All Submissions">
                    {submissions.length === 0 ? (
                        <div className="text-center py-12">
                            <IoDocumentText className="mx-auto text-primary-300 mb-4" size={48} />
                            <p className="text-primary-600">No submissions yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium text-primary-600">Student</th>
                                        <th className="text-left py-3 px-4 font-medium text-primary-600">Status</th>
                                        <th className="text-left py-3 px-4 font-medium text-primary-600">Score</th>
                                        <th className="text-left py-3 px-4 font-medium text-primary-600">Time Spent</th>
                                        <th className="text-left py-3 px-4 font-medium text-primary-600">Submitted</th>
                                        <th className="text-left py-3 px-4 font-medium text-primary-600">Result</th>
                                        <th className="text-right py-3 px-4 font-medium text-primary-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map((sub, index) => (
                                        <motion.tr
                                            key={sub._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b hover:bg-primary-50"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                                                        <IoPerson className="text-secondary-600" size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-primary-900">
                                                            {sub.studentId?.firstName} {sub.studentId?.lastName}
                                                        </p>
                                                        <p className="text-xs text-primary-500">{sub.studentId?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`badge ${getStatusBadge(sub.status)}`}>
                                                    {sub.status?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {sub.status === 'submitted' || sub.status === 'evaluated' ? (
                                                    <span className="font-semibold">
                                                        {sub.scores?.totalScore}/{sub.scores?.maxScore}
                                                        <span className="text-primary-500 text-sm ml-1">
                                                            ({sub.scores?.percentage}%)
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="text-primary-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="flex items-center gap-1 text-primary-600">
                                                    <IoTime size={14} />
                                                    {formatTime(sub.timeSpent)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-primary-600">
                                                {sub.submittedAt ? formatDate(sub.submittedAt) : '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                {sub.status === 'submitted' || sub.status === 'evaluated' ? (
                                                    sub.scores?.passed ? (
                                                        <span className="flex items-center gap-1 text-green-600">
                                                            <IoCheckmarkCircle size={16} /> Passed
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-red-600">
                                                            <IoCloseCircle size={16} /> Failed
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="text-primary-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    icon={<IoEye />}
                                                    onClick={() => setSelectedSubmission(sub)}
                                                    disabled={sub.status === 'scheduled'}
                                                >
                                                    View
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </FadeIn>

            {/* Detailed View Modal */}
            {selectedSubmission && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedSubmission(null)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-primary-900">
                                    {selectedSubmission.studentId?.firstName} {selectedSubmission.studentId?.lastName}
                                </h2>
                                <p className="text-primary-600 text-sm">{selectedSubmission.studentId?.email}</p>
                            </div>
                            <Button variant="secondary" onClick={() => setSelectedSubmission(null)}>
                                Close
                            </Button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Scores */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-primary-50 rounded-lg p-4 text-center">
                                    <p className="text-sm text-primary-500">Total Score</p>
                                    <p className="text-xl font-bold">{selectedSubmission.scores?.percentage || 0}%</p>
                                </div>
                                <div className="bg-primary-50 rounded-lg p-4 text-center">
                                    <p className="text-sm text-primary-500">MCQ Score</p>
                                    <p className="text-xl font-bold">
                                        {selectedSubmission.scores?.mcqScore}/{selectedSubmission.scores?.mcqTotal}
                                    </p>
                                </div>
                                <div className="bg-primary-50 rounded-lg p-4 text-center">
                                    <p className="text-sm text-primary-500">Coding Score</p>
                                    <p className="text-xl font-bold">
                                        {selectedSubmission.scores?.codingScore}/{selectedSubmission.scores?.codingTotal}
                                    </p>
                                </div>
                                <div className="bg-primary-50 rounded-lg p-4 text-center">
                                    <p className="text-sm text-primary-500">Time Spent</p>
                                    <p className="text-xl font-bold">{formatTime(selectedSubmission.timeSpent)}</p>
                                </div>
                            </div>

                            {/* Proctoring */}
                            {selectedSubmission.proctoring?.tabSwitchCount > 0 && (
                                <div className={`p-4 rounded-lg ${selectedSubmission.proctoring?.flagged ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                                    <p className="font-medium text-primary-900">Proctoring Notes</p>
                                    <p className="text-sm">Tab switches: {selectedSubmission.proctoring.tabSwitchCount}</p>
                                    {selectedSubmission.proctoring.flagged && (
                                        <p className="text-sm text-red-600 mt-1">⚠️ Flagged: {selectedSubmission.proctoring.flagReason}</p>
                                    )}
                                </div>
                            )}

                            {/* MCQ Answers */}
                            {selectedSubmission.mcqAnswers?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-primary-900 mb-3">MCQ Answers</h3>
                                    <div className="space-y-2">
                                        {selectedSubmission.mcqAnswers.map((ans, i) => (
                                            <div key={i} className="flex items-center justify-between p-2 bg-primary-50 rounded">
                                                <span>Question {ans.questionIndex + 1}</span>
                                                <span className={ans.isCorrect ? 'text-green-600' : 'text-red-600'}>
                                                    {ans.isCorrect ? '✓ Correct' : '✗ Incorrect'} ({ans.pointsEarned} pts)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Code Submissions */}
                            {selectedSubmission.codeSubmissions?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-primary-900 mb-3">Code Submissions</h3>
                                    <div className="space-y-4">
                                        {selectedSubmission.codeSubmissions.map((code, i) => (
                                            <div key={i} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium">Question {code.questionIndex + 1}</span>
                                                    <span className="badge badge-info">{code.language}</span>
                                                </div>
                                                <div className="flex gap-2 mb-2">
                                                    {code.testCaseResults?.map((tc, j) => (
                                                        <span
                                                            key={j}
                                                            className={`px-2 py-1 rounded text-xs ${tc.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                                        >
                                                            TC {j + 1}: {tc.passed ? '✓' : '✗'}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="text-sm text-primary-600">
                                                    Passed: {code.totalPassed}/{code.totalTestCases} • Points: {code.pointsEarned}
                                                </p>
                                                <details className="mt-2">
                                                    <summary className="cursor-pointer text-sm text-secondary-600">View Code</summary>
                                                    <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded text-xs overflow-auto max-h-48">
                                                        {code.code}
                                                    </pre>
                                                </details>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default TestResults;
