import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoSparkles, IoWarning } from 'react-icons/io5';
import Button from '../common/Button';
import Input from '../common/Input';
import Dropdown from '../common/Dropdown';
import { testService } from '../../services/testService';
import toast from 'react-hot-toast';

const AIQuestionModal = ({ isOpen, onClose, onQuestionsGenerated }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        jobDescription: '',
        difficultyLevel: 'medium',
        questionCount: 5,
        questionType: 'mcq',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.jobDescription.trim()) {
            toast.error('Please enter a job description');
            return;
        }

        try {
            setLoading(true);
            const response = await testService.generateAIQuestions(formData);

            if (response.success && response.data?.questions) {
                toast.success(`Generated ${response.data.questions.length} questions!`);
                onQuestionsGenerated(response.data.questions);
                onClose();
                // Reset form
                setFormData({
                    jobDescription: '',
                    difficultyLevel: 'medium',
                    questionCount: 5,
                    questionType: 'mcq',
                });
            } else {
                throw new Error('Failed to generate questions');
            }
        } catch (error) {
            console.error('AI Generation error:', error);
            toast.error(error.response?.data?.message || 'Failed to generate questions. Please try again.');
        } finally {
            setLoading(false);
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
                    className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-primary-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                                <IoSparkles className="text-white text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-primary-900">AI Question Generator</h2>
                                <p className="text-sm text-primary-500">Generate questions automatically</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
                        >
                            <IoClose size={24} className="text-primary-500" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Job Description */}
                        <div>
                            <label className="block text-sm font-medium text-primary-700 mb-2">
                                Job Description *
                            </label>
                            <textarea
                                value={formData.jobDescription}
                                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                                className="input-field min-h-[120px] resize-none"
                                placeholder="Enter the job description or key skills you want questions about...

Example: Frontend Developer with 2+ years of React experience, proficiency in JavaScript/TypeScript, CSS, and REST APIs."
                                required
                            />
                        </div>

                        {/* Question Type */}
                        <Dropdown
                            label="Question Type"
                            value={formData.questionType}
                            onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                            options={[
                                { value: 'mcq', label: 'Multiple Choice Questions (MCQ)' },
                                { value: 'coding', label: 'Coding Challenges' },
                            ]}
                        />

                        {/* Difficulty and Count */}
                        <div className="grid grid-cols-2 gap-4">
                            <Dropdown
                                label="Difficulty Level"
                                value={formData.difficultyLevel}
                                onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                                options={[
                                    { value: 'easy', label: 'Easy' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'hard', label: 'Hard' },
                                ]}
                            />
                            <Input
                                label="Number of Questions"
                                type="number"
                                min={1}
                                max={10}
                                value={formData.questionCount}
                                onChange={(e) => setFormData({ ...formData, questionCount: parseInt(e.target.value) || 1 })}
                            />
                        </div>

                        {/* Info Note */}
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                            <IoWarning className="text-amber-500 text-xl flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">
                                Generated questions are AI-created suggestions. Please review and edit them before publishing your test.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                loading={loading}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                icon={<IoSparkles />}
                            >
                                {loading ? 'Generating...' : 'Generate Questions'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AIQuestionModal;
