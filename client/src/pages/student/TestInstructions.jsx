import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IoCheckmarkCircle,
    IoWarning,
    IoVideocam,
    IoMic,
    IoDesktop,
    IoTime,
    IoDocument,
    IoShield,
    IoEye,
    IoLockClosed,
    IoPlay,
} from 'react-icons/io5';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { testService } from '../../services/testService';
import toast from 'react-hot-toast';

const TestInstructions = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submission, setSubmission] = useState(null);
    const [test, setTest] = useState(null);
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [micEnabled, setMicEnabled] = useState(false);
    const [permissionsChecked, setPermissionsChecked] = useState(false);
    const [agreedToRules, setAgreedToRules] = useState(false);
    const [starting, setStarting] = useState(false);

    const videoRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        fetchTestDetails();
        return () => {
            // Cleanup camera stream
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [submissionId]);

    const fetchTestDetails = async () => {
        try {
            setLoading(true);
            const response = await testService.getStudentTests();
            if (response.success) {
                const sub = response.data.submissions.find(s => s._id === submissionId);
                if (sub) {
                    setSubmission(sub);
                    setTest(sub.testId);
                } else {
                    toast.error('Test not found');
                    navigate('/student/tests');
                }
            }
        } catch (error) {
            toast.error('Failed to fetch test details');
            navigate('/student/tests');
        } finally {
            setLoading(false);
        }
    };

    const requestPermissions = async () => {
        try {
            // Request camera and microphone
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            setCameraEnabled(true);
            setMicEnabled(true);
            setPermissionsChecked(true);
            toast.success('Camera and microphone enabled');
        } catch (error) {
            console.error('Permission denied:', error);
            toast.error('Camera and microphone access is required for this test');
        }
    };

    const enterFullscreenAndStart = async () => {
        if (!agreedToRules) {
            toast.error('Please agree to the test rules');
            return;
        }

        if (!permissionsChecked) {
            toast.error('Please enable camera and microphone first');
            return;
        }

        setStarting(true);

        try {
            // Request fullscreen
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                await elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                await elem.msRequestFullscreen();
            }

            // Navigate to test
            navigate(`/student/tests/${submissionId}/take`, {
                state: {
                    cameraStream: true,
                    fromInstructions: true
                }
            });
        } catch (error) {
            console.error('Fullscreen error:', error);
            // Still proceed even if fullscreen fails
            navigate(`/student/tests/${submissionId}/take`, {
                state: {
                    cameraStream: true,
                    fromInstructions: true
                }
            });
        }
    };

    const rules = [
        {
            icon: <IoEye size={24} />,
            title: 'Continuous Monitoring',
            description: 'Your webcam and microphone will record throughout the test. AI-powered proctoring is actively monitoring your session.',
            critical: true,
        },
        {
            icon: <IoDesktop size={24} />,
            title: 'Tab Switching Detection',
            description: 'Switching tabs or windows more than 5 times will result in automatic test termination. Each switch is logged.',
            critical: true,
        },
        {
            icon: <IoShield size={24} />,
            title: 'Single Person Policy',
            description: 'Only you should be visible in the camera frame. Detection of another person will terminate the test immediately.',
            critical: true,
        },
        {
            icon: <IoLockClosed size={24} />,
            title: 'No Copy/Paste',
            description: 'Copy, paste, and keyboard shortcuts are disabled. Any attempt to copy questions or paste answers will be flagged.',
            critical: true,
        },
        {
            icon: <IoDocument size={24} />,
            title: 'No Screenshots',
            description: 'Screen capture, screenshot tools, and recording software are prohibited. This is actively monitored.',
            critical: true,
        },
        {
            icon: <IoTime size={24} />,
            title: 'Time Limit',
            description: `You have ${test?.duration || 60} minutes to complete this test. The timer starts once you begin and cannot be paused.`,
            critical: false,
        },
        {
            icon: <IoWarning size={24} />,
            title: 'Browser Restrictions',
            description: 'Do not minimize, resize, or close the browser window. The test must remain in fullscreen mode.',
            critical: false,
        },
        {
            icon: <IoCheckmarkCircle size={24} />,
            title: 'Answer Submission',
            description: 'Your answers are auto-saved. Ensure you submit the test before the timer ends.',
            critical: false,
        },
    ];

    if (loading) {
        return <Loader fullScreen />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 text-white">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold mb-2">{test?.title}</h1>
                    <p className="text-primary-200 text-lg">Please read all instructions carefully before starting</p>
                </motion.div>

                {/* Test Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-primary-300 text-sm">Duration</p>
                            <p className="text-2xl font-bold">{test?.duration} mins</p>
                        </div>
                        <div>
                            <p className="text-primary-300 text-sm">Questions</p>
                            <p className="text-2xl font-bold">{test?.inlineQuestions?.length || 0}</p>
                        </div>
                        <div>
                            <p className="text-primary-300 text-sm">Total Marks</p>
                            <p className="text-2xl font-bold">{test?.totalMarks || 100}</p>
                        </div>
                        <div>
                            <p className="text-primary-300 text-sm">Passing</p>
                            <p className="text-2xl font-bold">{test?.passingPercentage || 50}%</p>
                        </div>
                    </div>
                </motion.div>

                {/* Camera/Mic Check */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8"
                >
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <IoVideocam /> System Check
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Camera Preview */}
                        <div className="relative">
                            <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                {cameraEnabled ? (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <IoVideocam size={48} className="text-primary-500" />
                                    </div>
                                )}
                            </div>
                            {cameraEnabled && (
                                <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                    LIVE
                                </div>
                            )}
                        </div>

                        {/* Permission Status */}
                        <div className="space-y-4">
                            <div className={`flex items-center gap-3 p-3 rounded-lg ${cameraEnabled ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                <IoVideocam size={24} />
                                <div className="flex-1">
                                    <p className="font-medium">Camera</p>
                                    <p className="text-sm text-primary-300">
                                        {cameraEnabled ? 'Enabled and working' : 'Not enabled'}
                                    </p>
                                </div>
                                {cameraEnabled && <IoCheckmarkCircle size={24} className="text-green-400" />}
                            </div>

                            <div className={`flex items-center gap-3 p-3 rounded-lg ${micEnabled ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                <IoMic size={24} />
                                <div className="flex-1">
                                    <p className="font-medium">Microphone</p>
                                    <p className="text-sm text-primary-300">
                                        {micEnabled ? 'Enabled and working' : 'Not enabled'}
                                    </p>
                                </div>
                                {micEnabled && <IoCheckmarkCircle size={24} className="text-green-400" />}
                            </div>

                            {!permissionsChecked && (
                                <Button
                                    onClick={requestPermissions}
                                    className="w-full bg-secondary-500 hover:bg-secondary-600"
                                >
                                    Enable Camera & Microphone
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Rules */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8"
                >
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <IoWarning className="text-yellow-400" /> Test Rules & Regulations
                    </h2>

                    <div className="space-y-4">
                        {rules.map((rule, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.05 }}
                                className={`flex gap-4 p-4 rounded-lg ${rule.critical ? 'bg-red-500/20 border border-red-500/30' : 'bg-white/5'
                                    }`}
                            >
                                <div className={`${rule.critical ? 'text-red-400' : 'text-secondary-400'}`}>
                                    {rule.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold flex items-center gap-2">
                                        {rule.title}
                                        {rule.critical && (
                                            <span className="text-xs bg-red-500 px-2 py-0.5 rounded">CRITICAL</span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-primary-300 mt-1">{rule.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Agreement & Start */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
                >
                    <label className="flex items-start gap-3 cursor-pointer mb-6">
                        <input
                            type="checkbox"
                            checked={agreedToRules}
                            onChange={(e) => setAgreedToRules(e.target.checked)}
                            className="mt-1 w-5 h-5 rounded"
                        />
                        <span className="text-sm">
                            I have read and understood all the rules. I agree to be monitored throughout the test
                            and understand that any violation will result in immediate test termination and
                            potential disqualification from the recruitment process.
                        </span>
                    </label>

                    <div className="flex gap-4">
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/student/tests')}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={enterFullscreenAndStart}
                            disabled={!agreedToRules || !permissionsChecked || starting}
                            loading={starting}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            icon={<IoPlay />}
                        >
                            Enter Fullscreen & Start Test
                        </Button>
                    </div>

                    {(!agreedToRules || !permissionsChecked) && (
                        <p className="text-center text-yellow-400 text-sm mt-4">
                            {!permissionsChecked
                                ? '⚠️ Please enable camera and microphone first'
                                : '⚠️ Please agree to the test rules to continue'
                            }
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default TestInstructions;
