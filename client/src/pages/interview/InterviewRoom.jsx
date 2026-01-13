import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    IoMic,
    IoMicOff,
    IoVideocam,
    IoVideocamOff,
    IoCall,
    IoExpand,
    IoContract,
    IoPeople,
    IoTime,
    IoDesktop,
} from 'react-icons/io5';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useAuth } from '../../hooks/useAuth';
import { interviewService } from '../../services/interviewService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const InterviewRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [elapsed, setElapsed] = useState(0);

    const localVideoRef = useRef(null);
    const containerRef = useRef(null);

    const userName = user?.name || user?.email?.split('@')[0] || 'User';
    const userId = user?._id;

    const {
        localStream,
        remoteStreams,
        participants,
        isConnected,
        isAudioEnabled,
        isVideoEnabled,
        isScreenSharing,
        error,
        joinRoom,
        leaveRoom,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
    } = useWebRTC(roomId, userId, userName);

    // Fetch interview details
    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const response = await interviewService.getInterviewByRoom(roomId);
                if (response.success) {
                    setInterview(response.data.interview);
                }
            } catch (err) {
                toast.error('Interview not found or unauthorized');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        fetchInterview();
    }, [roomId, navigate]);

    // Connect local video
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Timer
    useEffect(() => {
        let interval;
        if (isConnected) {
            interval = setInterval(() => {
                setElapsed((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isConnected]);

    // Join room when interview is loaded
    useEffect(() => {
        if (interview && !isConnected && !loading) {
            joinRoom();
        }
    }, [interview, isConnected, loading, joinRoom]);

    const handleLeaveCall = () => {
        leaveRoom();
        toast.success('You left the interview');
        navigate(-1);
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return <Loader fullScreen />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Unable to Join</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-secondary-500 rounded-lg hover:bg-secondary-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const remoteStreamEntries = Object.entries(remoteStreams);

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-gray-900 flex flex-col"
        >
            {/* Header */}
            <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
                <div>
                    <h1 className="text-white font-semibold text-lg">
                        {interview?.title || 'Interview Room'}
                    </h1>
                    <p className="text-gray-400 text-sm">
                        {interview?.driveId?.companyName} - {interview?.type?.toUpperCase()} Interview
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-400">
                        <IoPeople size={18} />
                        <span>{participants.length + 1}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                        <IoTime size={18} />
                        <span>{formatTime(elapsed)}</span>
                    </div>
                    {isConnected && (
                        <span className="flex items-center gap-2 text-green-400">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Connected
                        </span>
                    )}
                </div>
            </div>

            {/* Video Grid */}
            <div className="flex-1 p-4 overflow-hidden">
                <div
                    className={`h-full grid gap-4 ${remoteStreamEntries.length === 0
                        ? 'grid-cols-1'
                        : remoteStreamEntries.length === 1
                            ? 'grid-cols-2'
                            : remoteStreamEntries.length <= 4
                                ? 'grid-cols-2 grid-rows-2'
                                : 'grid-cols-3 grid-rows-2'
                        }`}
                >
                    {/* Local Video */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-gray-800 rounded-2xl overflow-hidden"
                    >
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg text-white text-sm">
                            You {!isVideoEnabled && '(Camera Off)'}
                        </div>
                        {!isVideoEnabled && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                <div className="w-24 h-24 bg-secondary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Remote Videos */}
                    {remoteStreamEntries.map(([socketId, stream]) => (
                        <RemoteVideo
                            key={socketId}
                            stream={stream}
                            participant={participants.find((p) => p.socketId === socketId)}
                        />
                    ))}

                    {/* Waiting for participants */}
                    {remoteStreamEntries.length === 0 && (
                        <div className="flex items-center justify-center bg-gray-800 rounded-2xl">
                            <div className="text-center text-gray-400">
                                <IoPeople size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Waiting for others to join...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 px-6 py-4">
                <div className="flex items-center justify-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleAudio}
                        className={`p-4 rounded-full ${isAudioEnabled
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                    >
                        {isAudioEnabled ? <IoMic size={24} /> : <IoMicOff size={24} />}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleVideo}
                        className={`p-4 rounded-full ${isVideoEnabled
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                    >
                        {isVideoEnabled ? <IoVideocam size={24} /> : <IoVideocamOff size={24} />}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleScreenShare}
                        className={`p-4 rounded-full ${isScreenSharing
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-700 text-white hover:bg-gray-600'
                            }`}
                        title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                    >
                        <IoDesktop size={24} />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleFullScreen}
                        className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600"
                    >
                        {isFullScreen ? <IoContract size={24} /> : <IoExpand size={24} />}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleLeaveCall}
                        className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600"
                    >
                        <IoCall size={24} className="rotate-[135deg]" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

// Remote Video Component
const RemoteVideo = ({ stream, participant }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-gray-800 rounded-2xl overflow-hidden"
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg text-white text-sm">
                {participant?.userName || 'Participant'}
            </div>
        </motion.div>
    );
};

export default InterviewRoom;
