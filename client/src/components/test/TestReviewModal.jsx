import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoClose,
    IoSchool,
    IoWarning,
    IoCheckmarkCircle,
    IoBookOutline,
    IoTrendingUp,
    IoRocket,
} from 'react-icons/io5';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { testService } from '../../services/testService';
import toast from 'react-hot-toast';

const TestReviewModal = ({ isOpen, onClose, submissionId }) => {
    const [loading, setLoading] = useState(true);
    const [review, setReview] = useState(null);

    useEffect(() => {
        if (isOpen && submissionId) {
            fetchReview();
        }
    }, [isOpen, submissionId]);

    const fetchReview = async () => {
        try {
            setLoading(true);
            const response = await testService.getAITestReview(submissionId);
            if (response.success) {
                setReview(response.data);
            }
        } catch (error) {
            console.error('AI Review error:', error);
            toast.error(error.response?.data?.message || 'Failed to generate review');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-700 border-green-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-primary-100 bg-gradient-to-r from-blue-500 to-purple-500">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <IoSchool className="text-white text-xl" />
                            </div>
                            <div className="text-white">
                                <h2 className="text-xl font-bold">AI Test Review</h2>
                                <p className="text-sm text-white/80">
                                    {review?.testTitle || 'Analyzing your performance...'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <IoClose size={24} className="text-white" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader />
                                <span className="ml-3 text-primary-600">Analyzing your test results...</span>
                            </div>
                        ) : review?.analysis ? (
                            <div className="space-y-6">
                                {/* Overall Assessment */}
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                                    <p className="text-primary-800">{review.analysis.overallAssessment}</p>
                                </div>

                                {/* Weak Areas */}
                                {review.analysis.weakAreas?.length > 0 && (
                                    <div>
                                        <h3 className="flex items-center gap-2 text-lg font-semibold text-primary-900 mb-3">
                                            <IoWarning className="text-amber-500" />
                                            Weak Areas
                                        </h3>
                                        <div className="space-y-2">
                                            {review.analysis.weakAreas.map((area, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-3 rounded-lg border ${getSeverityColor(area.severity)}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">{area.topic}</span>
                                                        <span className="text-xs uppercase px-2 py-1 rounded-full bg-white/50">
                                                            {area.severity}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm mt-1 opacity-80">{area.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Focus Topics */}
                                {review.analysis.focusTopics?.length > 0 && (
                                    <div>
                                        <h3 className="flex items-center gap-2 text-lg font-semibold text-primary-900 mb-3">
                                            <IoBookOutline className="text-blue-500" />
                                            Focus Topics
                                        </h3>
                                        <div className="grid gap-3">
                                            {review.analysis.focusTopics.map((topic, index) => (
                                                <div
                                                    key={index}
                                                    className="p-3 bg-blue-50 rounded-lg border border-blue-100"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-blue-800">{topic.topic}</span>
                                                        <span className="text-xs text-blue-600">{topic.estimatedTime}</span>
                                                    </div>
                                                    <p className="text-sm text-blue-700 mt-1">{topic.reason}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Practice Recommendations */}
                                {review.analysis.practiceRecommendations?.length > 0 && (
                                    <div>
                                        <h3 className="flex items-center gap-2 text-lg font-semibold text-primary-900 mb-3">
                                            <IoTrendingUp className="text-green-500" />
                                            Practice Recommendations
                                        </h3>
                                        <div className="space-y-3">
                                            {review.analysis.practiceRecommendations.map((rec, index) => (
                                                <div
                                                    key={index}
                                                    className="p-3 bg-green-50 rounded-lg border border-green-100"
                                                >
                                                    <h4 className="font-medium text-green-800">{rec.title}</h4>
                                                    <p className="text-sm text-green-700 mt-1">{rec.description}</p>
                                                    {rec.resources?.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {rec.resources.map((resource, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                                                                >
                                                                    {resource}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Next Steps */}
                                {review.analysis.nextSteps?.length > 0 && (
                                    <div>
                                        <h3 className="flex items-center gap-2 text-lg font-semibold text-primary-900 mb-3">
                                            <IoRocket className="text-purple-500" />
                                            Next Steps
                                        </h3>
                                        <div className="space-y-2">
                                            {review.analysis.nextSteps.map((step, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100"
                                                >
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white text-sm flex items-center justify-center">
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-purple-800">{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-primary-500">
                                Unable to generate review. Please try again.
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-primary-100">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="w-full"
                        >
                            Close
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TestReviewModal;
