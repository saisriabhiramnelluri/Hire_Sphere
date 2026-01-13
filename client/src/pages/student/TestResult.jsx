import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IoArrowBack,
    IoCheckmarkCircle,
    IoCloseCircle,
    IoTime,
    IoTrophy,
    IoCode,
    IoList,
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import FadeIn from '../../components/animations/FadeIn';
import { testService } from '../../services/testService';
import toast from 'react-hot-toast';

const TestResult = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submission, setSubmission] = useState(null);

    useEffect(() => {
        fetchResult();
    }, [submissionId]);

    const fetchResult = async () => {
        try {
            setLoading(true);
            const response = await testService.getSubmissionReport(submissionId);
            if (response.success) {
                setSubmission(response.data.submission);
            }
        } catch (error) {
            toast.error('Failed to fetch results');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    if (loading) {
        return <Loader fullScreen />;
    }

    const test = submission?.testId;
    const scores = submission?.scores || {};

    return (
        <div className="space-y-6">
            <FadeIn>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/student/tests')}
                        className="p-2 hover:bg-primary-100 rounded-lg"
                    >
                        <IoArrowBack size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900">Test Results</h1>
                        <p className="text-primary-600 mt-1">{test?.title}</p>
                    </div>
                </div>
            </FadeIn>

            {/* Score Card */}
            <FadeIn delay={0.1}>
                <Card>
                    <div className="text-center py-6">
                        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${scores.passed ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                            {scores.passed ? (
                                <IoTrophy size={48} className="text-green-600" />
                            ) : (
                                <IoCloseCircle size={48} className="text-red-600" />
                            )}
                        </div>
                        <h2 className="text-4xl font-bold text-primary-900 mb-2">
                            {scores.percentage}%
                        </h2>
                        <p className={`text-lg font-medium ${scores.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {scores.passed ? 'Passed' : 'Not Passed'}
                        </p>
                        <p className="text-primary-500 mt-1">
                            Passing: {test?.passingPercentage || 50}%
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
                        <div className="text-center">
                            <p className="text-sm text-primary-500">Total Score</p>
                            <p className="text-xl font-bold text-primary-900">
                                {scores.totalScore}/{scores.maxScore}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-primary-500">MCQ Score</p>
                            <p className="text-xl font-bold text-primary-900">
                                {scores.mcqScore}/{scores.mcqTotal}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-primary-500">Coding Score</p>
                            <p className="text-xl font-bold text-primary-900">
                                {scores.codingScore}/{scores.codingTotal}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-primary-500">Time Spent</p>
                            <p className="text-xl font-bold text-primary-900">
                                {formatTime(submission?.timeSpent || 0)}
                            </p>
                        </div>
                    </div>
                </Card>
            </FadeIn>

            {/* Question-wise Results */}
            <FadeIn delay={0.2}>
                <Card title="Question Breakdown">
                    <div className="space-y-4">
                        {test?.inlineQuestions?.map((question, index) => {
                            const mcqAnswer = submission?.mcqAnswers?.find(a => a.questionIndex === index);
                            const codeSubmission = submission?.codeSubmissions?.find(c => c.questionIndex === index);

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-4 border rounded-lg"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="badge badge-info">Q{index + 1}</span>
                                            <span className={`badge ${question.type === 'mcq' ? 'badge-success' : 'badge-warning'}`}>
                                                {question.type === 'mcq' ? <IoList size={14} /> : <IoCode size={14} />}
                                                {question.type.toUpperCase()}
                                            </span>
                                            <span className="text-sm font-medium text-primary-900">
                                                {question.title || `Question ${index + 1}`}
                                            </span>
                                        </div>
                                        <div>
                                            {question.type === 'mcq' ? (
                                                mcqAnswer ? (
                                                    <span className={`flex items-center gap-1 text-sm ${mcqAnswer.isCorrect ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {mcqAnswer.isCorrect ? (
                                                            <><IoCheckmarkCircle /> Correct</>
                                                        ) : (
                                                            <><IoCloseCircle /> Incorrect</>
                                                        )}
                                                        <span className="ml-2 font-medium">
                                                            ({mcqAnswer.pointsEarned}/{question.points || 1} pts)
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="text-primary-400 text-sm">Not Answered</span>
                                                )
                                            ) : (
                                                codeSubmission ? (
                                                    <span className="text-sm text-primary-700">
                                                        <span className={codeSubmission.totalPassed === codeSubmission.totalTestCases ? 'text-green-600' : 'text-yellow-600'}>
                                                            {codeSubmission.totalPassed}/{codeSubmission.totalTestCases} passed
                                                        </span>
                                                        <span className="ml-2 font-medium">
                                                            ({codeSubmission.pointsEarned} pts)
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="text-primary-400 text-sm">Not Submitted</span>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* Show code submission details */}
                                    {codeSubmission && (
                                        <div className="mt-3 p-3 bg-primary-50 rounded">
                                            <div className="flex items-center gap-2 text-sm text-primary-600 mb-2">
                                                <span>Language: {codeSubmission.language}</span>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                {codeSubmission.testCaseResults?.map((tc, i) => (
                                                    <span
                                                        key={i}
                                                        className={`px-2 py-1 rounded text-xs ${tc.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                            }`}
                                                    >
                                                        TC {i + 1}: {tc.passed ? '✓' : '✗'}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </Card>
            </FadeIn>

            {/* Proctoring Info */}
            {submission?.proctoring?.flagged && (
                <FadeIn delay={0.3}>
                    <Card className="border-red-200 bg-red-50">
                        <div className="flex items-center gap-3 text-red-700">
                            <IoCloseCircle size={24} />
                            <div>
                                <p className="font-semibold">Proctoring Alert</p>
                                <p className="text-sm">
                                    Tab switches detected: {submission.proctoring.tabSwitchCount}
                                    {submission.proctoring.flagReason && ` - ${submission.proctoring.flagReason}`}
                                </p>
                            </div>
                        </div>
                    </Card>
                </FadeIn>
            )}

            <FadeIn delay={0.4}>
                <div className="flex justify-center">
                    <Button
                        variant="secondary"
                        icon={<IoArrowBack />}
                        onClick={() => navigate('/student/tests')}
                    >
                        Back to My Tests
                    </Button>
                </div>
            </FadeIn>
        </div>
    );
};

export default TestResult;
