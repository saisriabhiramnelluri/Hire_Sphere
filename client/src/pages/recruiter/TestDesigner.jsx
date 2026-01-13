import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IoAdd,
    IoTrash,
    IoSave,
    IoCheckmarkCircle,
    IoArrowBack,
    IoCode,
    IoList,
    IoSparkles,
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import FadeIn from '../../components/animations/FadeIn';
import Loader from '../../components/common/Loader';
import { testService } from '../../services/testService';
import AIQuestionModal from '../../components/test/AIQuestionModal';
import toast from 'react-hot-toast';

const TestDesigner = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [testData, setTestData] = useState({
        title: '',
        description: '',
        instructions: '',
        type: 'aptitude',
        duration: 60,
        totalMarks: 100,
        passingPercentage: 50,
        inlineQuestions: [],
        settings: {
            shuffleQuestions: false,
            shuffleOptions: false,
            showResults: true,
            preventTabSwitch: true,
        },
        status: 'draft',
    });

    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [showAIModal, setShowAIModal] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            fetchTest();
        }
    }, [id]);

    const fetchTest = async () => {
        try {
            setLoading(true);
            const response = await testService.getTestById(id);
            if (response.success) {
                setTestData(response.data.test);
            }
        } catch (error) {
            toast.error('Failed to fetch test');
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = (type) => {
        const newQuestion = {
            type,
            title: '',
            points: 1,
            order: testData.inlineQuestions.length,
        };

        if (type === 'mcq') {
            newQuestion.question = '';
            newQuestion.options = [
                { text: '', isCorrect: true },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
            ];
        } else {
            newQuestion.problemStatement = '';
            newQuestion.sampleInput = '';
            newQuestion.sampleOutput = '';
            newQuestion.testCases = [
                { input: '', expectedOutput: '', isHidden: false, points: 1 },
            ];
        }

        setTestData({
            ...testData,
            inlineQuestions: [...testData.inlineQuestions, newQuestion],
        });
        setCurrentQuestion(testData.inlineQuestions.length);
    };

    const handleAIQuestionsGenerated = (questions) => {
        const startOrder = testData.inlineQuestions.length;
        const questionsWithOrder = questions.map((q, index) => ({
            ...q,
            order: startOrder + index,
        }));
        setTestData({
            ...testData,
            inlineQuestions: [...testData.inlineQuestions, ...questionsWithOrder],
        });
    };

    const handleUpdateQuestion = (index, field, value) => {
        const updated = [...testData.inlineQuestions];
        updated[index] = { ...updated[index], [field]: value };
        setTestData({ ...testData, inlineQuestions: updated });
    };

    const handleUpdateOption = (qIndex, oIndex, field, value) => {
        const updated = [...testData.inlineQuestions];
        if (field === 'isCorrect' && value) {
            // Only one correct answer for MCQ
            updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
                ...opt,
                isCorrect: i === oIndex,
            }));
        } else {
            updated[qIndex].options[oIndex][field] = value;
        }
        setTestData({ ...testData, inlineQuestions: updated });
    };

    const handleAddOption = (qIndex) => {
        const updated = [...testData.inlineQuestions];
        updated[qIndex].options.push({ text: '', isCorrect: false });
        setTestData({ ...testData, inlineQuestions: updated });
    };

    const handleRemoveOption = (qIndex, oIndex) => {
        const updated = [...testData.inlineQuestions];
        updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex);
        setTestData({ ...testData, inlineQuestions: updated });
    };

    const handleAddTestCase = (qIndex) => {
        const updated = [...testData.inlineQuestions];
        updated[qIndex].testCases.push({
            input: '',
            expectedOutput: '',
            isHidden: false,
            points: 1,
        });
        setTestData({ ...testData, inlineQuestions: updated });
    };

    const handleUpdateTestCase = (qIndex, tIndex, field, value) => {
        const updated = [...testData.inlineQuestions];
        updated[qIndex].testCases[tIndex][field] = value;
        setTestData({ ...testData, inlineQuestions: updated });
    };

    const handleRemoveTestCase = (qIndex, tIndex) => {
        const updated = [...testData.inlineQuestions];
        updated[qIndex].testCases = updated[qIndex].testCases.filter((_, i) => i !== tIndex);
        setTestData({ ...testData, inlineQuestions: updated });
    };

    const handleRemoveQuestion = (index) => {
        const updated = testData.inlineQuestions.filter((_, i) => i !== index);
        setTestData({ ...testData, inlineQuestions: updated });
        if (currentQuestion === index) {
            setCurrentQuestion(null);
        } else if (currentQuestion > index) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSave = async (publish = false) => {
        if (!testData.title) {
            toast.error('Please enter a test title');
            return;
        }

        if (testData.inlineQuestions.length === 0) {
            toast.error('Please add at least one question');
            return;
        }

        try {
            setSaving(true);
            const dataToSave = {
                ...testData,
                status: publish ? 'published' : 'draft',
            };

            let response;
            if (isEditMode) {
                response = await testService.updateTest(id, dataToSave);
            } else {
                response = await testService.createTest(dataToSave);
            }

            if (response.success) {
                toast.success(publish ? 'Test published!' : 'Test saved as draft');
                navigate('/recruiter/tests');
            }
        } catch (error) {
            toast.error('Failed to save test');
        } finally {
            setSaving(false);
        }
    };

    const calculateTotalMarks = () => {
        return testData.inlineQuestions.reduce((sum, q) => {
            if (q.type === 'mcq') {
                return sum + (q.points || 1);
            } else {
                return sum + (q.testCases?.reduce((s, tc) => s + (tc.points || 1), 0) || 0);
            }
        }, 0);
    };

    if (loading) {
        return <Loader fullScreen />;
    }

    return (
        <div className="space-y-6">
            <FadeIn>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-primary-100 rounded-lg"
                        >
                            <IoArrowBack size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-primary-900">
                                {isEditMode ? 'Edit Test' : 'Create Test'}
                            </h1>
                            <p className="text-primary-600 mt-1">Design your assessment</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            icon={<IoSave />}
                            onClick={() => handleSave(false)}
                            loading={saving}
                        >
                            Save Draft
                        </Button>
                        <Button
                            icon={<IoCheckmarkCircle />}
                            onClick={() => handleSave(true)}
                            loading={saving}
                        >
                            Publish
                        </Button>
                    </div>
                </div>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Test Details */}
                <FadeIn delay={0.1} className="lg:col-span-1">
                    <Card title="Test Details">
                        <div className="space-y-4">
                            <Input
                                label="Test Title"
                                value={testData.title}
                                onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                                placeholder="e.g., Aptitude Assessment Round 1"
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-primary-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={testData.description}
                                    onChange={(e) => setTestData({ ...testData, description: e.target.value })}
                                    className="input-field min-h-[80px]"
                                    placeholder="Brief description of the test..."
                                />
                            </div>

                            <Dropdown
                                label="Test Type"
                                value={testData.type}
                                onChange={(e) => setTestData({ ...testData, type: e.target.value })}
                                options={[
                                    { value: 'aptitude', label: 'Aptitude (MCQ)' },
                                    { value: 'technical', label: 'Technical (Coding)' },
                                    { value: 'mixed', label: 'Mixed (Both)' },
                                ]}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Duration (mins)"
                                    type="number"
                                    value={testData.duration}
                                    onChange={(e) => setTestData({ ...testData, duration: parseInt(e.target.value) })}
                                />
                                <Input
                                    label="Passing %"
                                    type="number"
                                    value={testData.passingPercentage}
                                    onChange={(e) => setTestData({ ...testData, passingPercentage: parseInt(e.target.value) })}
                                />
                            </div>

                            <div className="bg-primary-50 rounded-lg p-4">
                                <p className="text-sm text-primary-600">
                                    <strong>Total Questions:</strong> {testData.inlineQuestions.length}
                                </p>
                                <p className="text-sm text-primary-600">
                                    <strong>Total Marks:</strong> {calculateTotalMarks()}
                                </p>
                            </div>

                            {/* Settings */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-primary-700">Settings</label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={testData.settings.shuffleQuestions}
                                        onChange={(e) =>
                                            setTestData({
                                                ...testData,
                                                settings: { ...testData.settings, shuffleQuestions: e.target.checked },
                                            })
                                        }
                                        className="rounded"
                                    />
                                    <span className="text-sm">Shuffle Questions</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={testData.settings.preventTabSwitch}
                                        onChange={(e) =>
                                            setTestData({
                                                ...testData,
                                                settings: { ...testData.settings, preventTabSwitch: e.target.checked },
                                            })
                                        }
                                        className="rounded"
                                    />
                                    <span className="text-sm">Detect Tab Switching</span>
                                </label>
                            </div>
                        </div>
                    </Card>
                </FadeIn>

                {/* Questions Panel */}
                <FadeIn delay={0.2} className="lg:col-span-2">
                    <Card title="Questions">
                        <div className="space-y-4">
                            {/* Add Question Buttons */}
                            <div className="flex gap-3 flex-wrap">
                                <Button
                                    variant="secondary"
                                    icon={<IoList />}
                                    onClick={() => handleAddQuestion('mcq')}
                                >
                                    Add MCQ
                                </Button>
                                <Button
                                    variant="secondary"
                                    icon={<IoCode />}
                                    onClick={() => handleAddQuestion('coding')}
                                >
                                    Add Coding Question
                                </Button>
                                <Button
                                    onClick={() => setShowAIModal(true)}
                                    icon={<IoSparkles />}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                                >
                                    AI Generate
                                </Button>
                            </div>

                            {/* Question List */}
                            {testData.inlineQuestions.length === 0 ? (
                                <div className="text-center py-12 text-primary-400">
                                    <IoList size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No questions added yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {testData.inlineQuestions.map((q, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={`border rounded-lg p-4 ${currentQuestion === index
                                                ? 'border-secondary-500 bg-secondary-50'
                                                : 'border-primary-200'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div
                                                    className="flex-1 cursor-pointer"
                                                    onClick={() => setCurrentQuestion(currentQuestion === index ? null : index)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="badge badge-info">
                                                            Q{index + 1}
                                                        </span>
                                                        <span className={`badge ${q.type === 'mcq' ? 'badge-success' : 'badge-warning'}`}>
                                                            {q.type.toUpperCase()}
                                                        </span>
                                                        <span className="text-sm text-primary-600">
                                                            {q.type === 'mcq' ? `${q.points || 1} pts` : `${q.testCases?.length || 0} test cases`}
                                                        </span>
                                                    </div>
                                                    <p className="text-primary-800 mt-1">
                                                        {q.title || q.question?.substring(0, 50) || 'Untitled question...'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveQuestion(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <IoTrash size={18} />
                                                </button>
                                            </div>

                                            {/* Expanded Question Editor */}
                                            {currentQuestion === index && (
                                                <div className="space-y-4 border-t pt-4">
                                                    <Input
                                                        label="Question Title"
                                                        value={q.title}
                                                        onChange={(e) => handleUpdateQuestion(index, 'title', e.target.value)}
                                                        placeholder="Brief title for the question"
                                                    />

                                                    {q.type === 'mcq' ? (
                                                        <>
                                                            <div>
                                                                <label className="block text-sm font-medium text-primary-700 mb-2">
                                                                    Question Text
                                                                </label>
                                                                <textarea
                                                                    value={q.question}
                                                                    onChange={(e) => handleUpdateQuestion(index, 'question', e.target.value)}
                                                                    className="input-field min-h-[80px]"
                                                                    placeholder="Enter your question..."
                                                                />
                                                            </div>

                                                            <Input
                                                                label="Points"
                                                                type="number"
                                                                value={q.points}
                                                                onChange={(e) => handleUpdateQuestion(index, 'points', parseInt(e.target.value))}
                                                            />

                                                            <div>
                                                                <label className="block text-sm font-medium text-primary-700 mb-2">
                                                                    Options (Select correct answer)
                                                                </label>
                                                                <div className="space-y-2">
                                                                    {q.options?.map((opt, oIndex) => (
                                                                        <div key={oIndex} className="flex items-center gap-2">
                                                                            <input
                                                                                type="radio"
                                                                                name={`correct-${index}`}
                                                                                checked={opt.isCorrect}
                                                                                onChange={() => handleUpdateOption(index, oIndex, 'isCorrect', true)}
                                                                                className="text-green-500"
                                                                            />
                                                                            <input
                                                                                type="text"
                                                                                value={opt.text}
                                                                                onChange={(e) => handleUpdateOption(index, oIndex, 'text', e.target.value)}
                                                                                className="input-field flex-1"
                                                                                placeholder={`Option ${oIndex + 1}`}
                                                                            />
                                                                            {q.options.length > 2 && (
                                                                                <button
                                                                                    onClick={() => handleRemoveOption(index, oIndex)}
                                                                                    className="p-1 text-red-500"
                                                                                >
                                                                                    <IoTrash size={16} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleAddOption(index)}
                                                                    className="mt-2 text-sm text-secondary-500 hover:text-secondary-600"
                                                                >
                                                                    + Add Option
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div>
                                                                <label className="block text-sm font-medium text-primary-700 mb-2">
                                                                    Problem Statement
                                                                </label>
                                                                <textarea
                                                                    value={q.problemStatement}
                                                                    onChange={(e) => handleUpdateQuestion(index, 'problemStatement', e.target.value)}
                                                                    className="input-field min-h-[120px] font-mono text-sm"
                                                                    placeholder="Describe the problem..."
                                                                />
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-primary-700 mb-2">
                                                                        Sample Input
                                                                    </label>
                                                                    <textarea
                                                                        value={q.sampleInput}
                                                                        onChange={(e) => handleUpdateQuestion(index, 'sampleInput', e.target.value)}
                                                                        className="input-field font-mono text-sm"
                                                                        placeholder="5 3"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-primary-700 mb-2">
                                                                        Sample Output
                                                                    </label>
                                                                    <textarea
                                                                        value={q.sampleOutput}
                                                                        onChange={(e) => handleUpdateQuestion(index, 'sampleOutput', e.target.value)}
                                                                        className="input-field font-mono text-sm"
                                                                        placeholder="8"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium text-primary-700 mb-2">
                                                                    Test Cases
                                                                </label>
                                                                <div className="space-y-2">
                                                                    {q.testCases?.map((tc, tIndex) => (
                                                                        <div key={tIndex} className="flex items-start gap-2 p-2 bg-primary-50 rounded">
                                                                            <span className="text-xs text-primary-500 pt-2">#{tIndex + 1}</span>
                                                                            <input
                                                                                type="text"
                                                                                value={tc.input}
                                                                                onChange={(e) => handleUpdateTestCase(index, tIndex, 'input', e.target.value)}
                                                                                className="input-field flex-1 text-sm font-mono"
                                                                                placeholder="Input"
                                                                            />
                                                                            <input
                                                                                type="text"
                                                                                value={tc.expectedOutput}
                                                                                onChange={(e) => handleUpdateTestCase(index, tIndex, 'expectedOutput', e.target.value)}
                                                                                className="input-field flex-1 text-sm font-mono"
                                                                                placeholder="Expected Output"
                                                                            />
                                                                            <label className="flex items-center gap-1 text-xs">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={tc.isHidden}
                                                                                    onChange={(e) => handleUpdateTestCase(index, tIndex, 'isHidden', e.target.checked)}
                                                                                />
                                                                                Hidden
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                value={tc.points}
                                                                                onChange={(e) => handleUpdateTestCase(index, tIndex, 'points', parseInt(e.target.value))}
                                                                                className="input-field w-16 text-sm"
                                                                                placeholder="Pts"
                                                                            />
                                                                            <button
                                                                                onClick={() => handleRemoveTestCase(index, tIndex)}
                                                                                className="p-1 text-red-500"
                                                                            >
                                                                                <IoTrash size={16} />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleAddTestCase(index)}
                                                                    className="mt-2 text-sm text-secondary-500 hover:text-secondary-600"
                                                                >
                                                                    + Add Test Case
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </FadeIn>
            </div>

            {/* AI Question Generation Modal */}
            <AIQuestionModal
                isOpen={showAIModal}
                onClose={() => setShowAIModal(false)}
                onQuestionsGenerated={handleAIQuestionsGenerated}
            />
        </div>
    );
};

export default TestDesigner;
