import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IoArrowForward,
    IoArrowBack,
    IoTime,
    IoWarning,
    IoCode,
    IoPlay,
    IoCheckmarkCircle,
    IoList,
    IoVideocam,
    IoShield,
} from 'react-icons/io5';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import CodeEditor from '../../components/test/CodeEditor';
import { testService } from '../../services/testService';
import toast from 'react-hot-toast';

const TakeTest = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(true);
    const [submission, setSubmission] = useState(null);
    const [test, setTest] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [answers, setAnswers] = useState({});
    const [codeSubmissions, setCodeSubmissions] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [runningCode, setRunningCode] = useState(false);
    const [codeOutput, setCodeOutput] = useState('');
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Code editor state
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');

    const timerRef = useRef(null);
    const MAX_TAB_SWITCHES = 5;

    useEffect(() => {
        startTest();
        setupAntiCheating();

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            cleanupAntiCheating();
        };
    }, [submissionId]);

    // Anti-cheating setup
    const setupAntiCheating = () => {
        // Prevent copy/paste/cut
        document.addEventListener('copy', preventCopyPaste);
        document.addEventListener('paste', preventCopyPaste);
        document.addEventListener('cut', preventCopyPaste);

        // Prevent right-click
        document.addEventListener('contextmenu', preventContextMenu);

        // Prevent keyboard shortcuts
        document.addEventListener('keydown', preventShortcuts);

        // Fullscreen change detection
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

        // Check if in fullscreen
        setIsFullscreen(!!document.fullscreenElement);
    };

    const cleanupAntiCheating = () => {
        document.removeEventListener('copy', preventCopyPaste);
        document.removeEventListener('paste', preventCopyPaste);
        document.removeEventListener('cut', preventCopyPaste);
        document.removeEventListener('contextmenu', preventContextMenu);
        document.removeEventListener('keydown', preventShortcuts);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };

    const preventCopyPaste = (e) => {
        // Block copy/paste everywhere including code editor
        e.preventDefault();
        toast.error('Copy/Paste is disabled during the test');
        testService.recordProctoringEvent(submissionId, 'copy_paste_attempt');
    };

    const preventContextMenu = (e) => {
        e.preventDefault();
        toast.error('Right-click is disabled during the test');
    };

    const preventShortcuts = (e) => {
        // Block Ctrl/Cmd + C, V, X, S, P, PrintScreen
        if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 's', 'p', 'a'].includes(e.key.toLowerCase())) {
            // Allow in code editor textarea
            if (e.target.tagName === 'TEXTAREA') {
                return;
            }
            e.preventDefault();
            toast.error('Keyboard shortcuts are disabled');
        }
        // Block PrintScreen
        if (e.key === 'PrintScreen') {
            e.preventDefault();
            toast.error('Screenshots are not allowed');
            testService.recordProctoringEvent(submissionId, 'screenshot_attempt');
        }
        // Block F12 (DevTools)
        if (e.key === 'F12') {
            e.preventDefault();
        }
    };

    const handleFullscreenChange = () => {
        const inFullscreen = !!document.fullscreenElement;
        setIsFullscreen(inFullscreen);

        if (!inFullscreen && !submitting && submission?.status === 'in_progress') {
            setShowWarning(true);
            toast.error('⚠️ Stay in fullscreen mode! Re-entering in 3 seconds...');
            testService.recordProctoringEvent(submissionId, 'fullscreen_exit');

            // Update tab switch count as a violation
            setTabSwitchCount(prev => prev + 1);

            // Aggressive re-entry with countdown
            let countdown = 3;
            const interval = setInterval(() => {
                countdown--;
                if (countdown > 0) {
                    toast(`Returning to fullscreen in ${countdown}...`, { icon: '⏰' });
                }
            }, 1000);

            setTimeout(() => {
                clearInterval(interval);
                setShowWarning(false);
                document.documentElement.requestFullscreen?.().catch(() => {
                    toast.error('Please enable fullscreen mode to continue the test');
                });
            }, 3000);
        }
    };

    // Tab switch detection with auto-terminate
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.hidden && test?.settings?.preventTabSwitch) {
                const newCount = tabSwitchCount + 1;
                setTabSwitchCount(newCount);
                testService.recordProctoringEvent(submissionId, 'tab_switch');

                if (newCount >= MAX_TAB_SWITCHES) {
                    toast.error('⛔ Test terminated due to excessive tab switching!');
                    await handleForceSubmit();
                } else {
                    setShowWarning(true);
                    toast.error(`⚠️ Warning ${newCount}/${MAX_TAB_SWITCHES}: Tab switch detected!`);
                    setTimeout(() => setShowWarning(false), 3000);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [test, submissionId, tabSwitchCount]);

    const startTest = async () => {
        try {
            setLoading(true);
            const response = await testService.startTest(submissionId);
            if (response.success) {
                setSubmission(response.data.submission);
                setTest(response.data.test);

                // Calculate time remaining
                const startedAt = new Date(response.data.submission.startedAt);
                const duration = response.data.test.duration * 60; // in seconds
                const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
                const remaining = Math.max(0, duration - elapsed);
                setTimeRemaining(remaining);

                // Restore previous answers
                const savedAnswers = {};
                response.data.submission.mcqAnswers?.forEach((a) => {
                    savedAnswers[a.questionIndex] = a.selectedOption;
                });
                setAnswers(savedAnswers);

                const savedCode = {};
                response.data.submission.codeSubmissions?.forEach((c) => {
                    savedCode[c.questionIndex] = {
                        code: c.code,
                        language: c.language,
                        result: c.testCaseResults,
                    };
                });
                setCodeSubmissions(savedCode);

                // Start timer
                startTimer(remaining);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to start test');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const startTimer = (initialTime) => {
        let time = initialTime;
        timerRef.current = setInterval(() => {
            time -= 1;
            setTimeRemaining(time);
            if (time <= 0) {
                clearInterval(timerRef.current);
                handleAutoSubmit();
            }
        }, 1000);
    };

    const handleAutoSubmit = async () => {
        toast.error('Time\'s up! Auto-submitting...');
        await handleForceSubmit();
    };

    const handleForceSubmit = async () => {
        try {
            setSubmitting(true);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            cleanupAntiCheating();

            // Exit fullscreen
            if (document.fullscreenElement) {
                document.exitFullscreen?.();
            }

            const response = await testService.finalizeTest(submissionId);
            if (response.success) {
                navigate(`/student/tests/${submissionId}/result`);
            }
        } catch (error) {
            console.error('Force submit error:', error);
            navigate('/student/tests');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSelectOption = async (questionIndex, optionIndex) => {
        setAnswers({ ...answers, [questionIndex]: optionIndex });
        try {
            await testService.submitMcqAnswer(submissionId, questionIndex, optionIndex);
        } catch (error) {
            console.error('Failed to save answer:', error);
        }
    };

    const handleRunCode = async () => {
        const question = test.questions[currentQuestionIndex];
        if (!code.trim()) {
            toast.error('Please write some code first');
            return;
        }

        try {
            setRunningCode(true);
            const response = await testService.runCode(code, language, question.sampleInput || '');
            if (response.success) {
                setCodeOutput(response.data.result.stdout || response.data.result.stderr || 'No output');
            }
        } catch (error) {
            setCodeOutput(`Error: ${error.message}`);
        } finally {
            setRunningCode(false);
        }
    };

    const handleSubmitCode = async () => {
        if (!code.trim()) {
            toast.error('Please write some code first');
            return;
        }

        try {
            setRunningCode(true);
            const response = await testService.submitCode(submissionId, currentQuestionIndex, code, language);
            if (response.success) {
                setCodeSubmissions({
                    ...codeSubmissions,
                    [currentQuestionIndex]: {
                        code,
                        language,
                        result: response.data.testCaseResults,
                        totalPassed: response.data.totalPassed,
                        totalTestCases: response.data.totalTestCases,
                    },
                });
                toast.success(`Passed ${response.data.totalPassed}/${response.data.totalTestCases} test cases`);
            }
        } catch (error) {
            toast.error('Failed to submit code');
        } finally {
            setRunningCode(false);
        }
    };

    const handleSubmitTest = async () => {
        if (!confirm('Are you sure you want to submit? You cannot change answers after submission.')) {
            return;
        }

        try {
            setSubmitting(true);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            const response = await testService.finalizeTest(submissionId);
            if (response.success) {
                toast.success('Test submitted successfully!');
                navigate(`/student/tests/${submissionId}/result`);
            }
        } catch (error) {
            toast.error('Failed to submit test');
        } finally {
            setSubmitting(false);
        }
    };

    // Load saved code when switching to coding question
    useEffect(() => {
        const question = test?.questions?.[currentQuestionIndex];
        if (question?.type === 'coding') {
            const saved = codeSubmissions[currentQuestionIndex];
            if (saved) {
                setCode(saved.code);
                setLanguage(saved.language);
            } else {
                setCode('');
                setLanguage('python');
            }
            setCodeOutput('');
        }
    }, [currentQuestionIndex, test]);

    if (loading) {
        return <Loader fullScreen />;
    }

    const currentQuestion = test?.questions?.[currentQuestionIndex];
    const totalQuestions = test?.questions?.length || 0;
    const isWarningTime = timeRemaining < 300; // Last 5 minutes

    return (
        <div className="min-h-screen bg-primary-50">
            {/* Header */}
            <div className={`sticky top-0 z-10 px-6 py-3 flex items-center justify-between ${isWarningTime ? 'bg-red-500 text-white' : 'bg-white shadow'
                }`}>
                <div>
                    <h1 className="font-semibold text-lg">{test?.title}</h1>
                    <p className="text-sm opacity-75">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className={`flex items-center gap-2 text-lg font-mono font-bold ${isWarningTime ? 'animate-pulse' : ''
                        }`}>
                        {isWarningTime && <IoWarning size={20} />}
                        <IoTime size={20} />
                        <span>{formatTime(timeRemaining)}</span>
                    </div>
                    <Button
                        variant={isWarningTime ? 'secondary' : 'primary'}
                        onClick={handleSubmitTest}
                        loading={submitting}
                    >
                        Submit Test
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Question Navigator */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-4 sticky top-20">
                            <h3 className="font-semibold text-primary-900 mb-4">Questions</h3>
                            <div className="grid grid-cols-5 gap-2">
                                {test?.questions?.map((q, index) => {
                                    const isAnswered = q.type === 'mcq'
                                        ? answers[index] !== undefined
                                        : codeSubmissions[index] !== undefined;
                                    const isCurrent = index === currentQuestionIndex;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentQuestionIndex(index)}
                                            className={`w-10 h-10 rounded-lg font-medium text-sm flex items-center justify-center transition-colors ${isCurrent
                                                ? 'bg-secondary-500 text-white'
                                                : isAnswered
                                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                                                }`}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-4 text-xs text-primary-500 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 bg-green-100 border border-green-300 rounded"></span>
                                    <span>Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-4 h-4 bg-primary-100 rounded"></span>
                                    <span>Not Answered</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="lg:col-span-3">
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-lg shadow"
                        >
                            {currentQuestion && (
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`badge ${currentQuestion.type === 'mcq' ? 'badge-success' : 'badge-warning'}`}>
                                            {currentQuestion.type === 'mcq' ? <IoList size={14} /> : <IoCode size={14} />}
                                            {currentQuestion.type.toUpperCase()}
                                        </span>
                                        <span className="text-sm text-primary-500">
                                            {currentQuestion.points || 1} points
                                        </span>
                                    </div>

                                    <h2 className="text-lg font-semibold text-primary-900 mb-2">
                                        {currentQuestion.title || `Question ${currentQuestionIndex + 1}`}
                                    </h2>

                                    {currentQuestion.type === 'mcq' ? (
                                        <>
                                            <p className="text-primary-700 mb-6 whitespace-pre-wrap">
                                                {currentQuestion.question}
                                            </p>

                                            <div className="space-y-3">
                                                {currentQuestion.options?.map((option, oIndex) => (
                                                    <label
                                                        key={oIndex}
                                                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${answers[currentQuestionIndex] === oIndex
                                                            ? 'border-secondary-500 bg-secondary-50'
                                                            : 'border-primary-200 hover:border-primary-300'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`question-${currentQuestionIndex}`}
                                                            checked={answers[currentQuestionIndex] === oIndex}
                                                            onChange={() => handleSelectOption(currentQuestionIndex, oIndex)}
                                                            className="sr-only"
                                                        />
                                                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${answers[currentQuestionIndex] === oIndex
                                                            ? 'border-secondary-500 bg-secondary-500'
                                                            : 'border-primary-300'
                                                            }`}>
                                                            {answers[currentQuestionIndex] === oIndex && (
                                                                <span className="w-2 h-2 bg-white rounded-full"></span>
                                                            )}
                                                        </span>
                                                        <span className="text-primary-800">{option.text}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="prose max-w-none mb-6">
                                                <div className="bg-primary-50 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm">
                                                    {currentQuestion.problemStatement}
                                                </div>
                                            </div>

                                            {currentQuestion.sampleInput && (
                                                <div className="grid grid-cols-2 gap-4 mb-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-primary-700 mb-1">
                                                            Sample Input
                                                        </label>
                                                        <pre className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                                                            {currentQuestion.sampleInput}
                                                        </pre>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-primary-700 mb-1">
                                                            Sample Output
                                                        </label>
                                                        <pre className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                                                            {currentQuestion.sampleOutput}
                                                        </pre>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Language Selector */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-primary-700 mb-2">
                                                    Select Language
                                                </label>
                                                <select
                                                    value={language}
                                                    onChange={(e) => setLanguage(e.target.value)}
                                                    className="input-field w-48"
                                                >
                                                    <option value="python">Python</option>
                                                    <option value="javascript">JavaScript</option>
                                                    <option value="java">Java</option>
                                                    <option value="cpp">C++</option>
                                                </select>
                                            </div>

                                            {/* Code Editor with Syntax Highlighting */}
                                            <CodeEditor
                                                code={code}
                                                onChange={setCode}
                                                language={language}
                                                onRun={handleRunCode}
                                                onSubmit={handleSubmitCode}
                                                running={runningCode}
                                                submitting={runningCode}
                                                output={codeOutput}
                                                testResults={codeSubmissions[currentQuestionIndex]?.result}
                                            />
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex justify-between items-center p-4 border-t bg-primary-50 rounded-b-lg">
                                <Button
                                    variant="secondary"
                                    icon={<IoArrowBack />}
                                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                    disabled={currentQuestionIndex === 0}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-primary-600">
                                    {currentQuestionIndex + 1} / {totalQuestions}
                                </span>
                                <Button
                                    variant="secondary"
                                    onClick={() => setCurrentQuestionIndex(Math.min(totalQuestions - 1, currentQuestionIndex + 1))}
                                    disabled={currentQuestionIndex === totalQuestions - 1}
                                >
                                    Next <IoArrowForward className="ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default TakeTest;
