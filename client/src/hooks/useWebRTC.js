import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ],
};

export const useWebRTC = (roomId, userId, userName) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({});
    const [participants, setParticipants] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [error, setError] = useState(null);

    const socketRef = useRef(null);
    const peerConnectionsRef = useRef({});
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const originalVideoTrackRef = useRef(null);

    // Initialize media stream
    const initializeMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user',
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            });
            localStreamRef.current = stream;
            originalVideoTrackRef.current = stream.getVideoTracks()[0];
            setLocalStream(stream);
            return stream;
        } catch (err) {
            console.error('Failed to get media devices:', err);
            setError('Failed to access camera/microphone. Please check permissions.');
            throw err;
        }
    }, []);

    // Create peer connection for a remote user
    const createPeerConnection = useCallback((remoteSocketId) => {
        const peerConnection = new RTCPeerConnection(ICE_SERVERS);

        // Add local tracks to peer connection
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStreamRef.current);
            });
        }

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current?.emit('ice-candidate', {
                    candidate: event.candidate,
                    to: remoteSocketId,
                    from: socketRef.current.id,
                });
            }
        };

        // Handle remote stream
        peerConnection.ontrack = (event) => {
            const [remoteStream] = event.streams;
            setRemoteStreams((prev) => ({
                ...prev,
                [remoteSocketId]: remoteStream,
            }));
        };

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
            console.log(`Peer ${remoteSocketId} state:`, peerConnection.connectionState);
        };

        peerConnectionsRef.current[remoteSocketId] = peerConnection;
        return peerConnection;
    }, []);

    // Initialize WebRTC and Socket.IO
    const joinRoom = useCallback(async () => {
        try {
            // Initialize media first
            await initializeMedia();

            // Connect to Socket.IO
            socketRef.current = io(SOCKET_URL, {
                transports: ['websocket'],
            });

            socketRef.current.on('connect', () => {
                console.log('Connected to signaling server');
                setIsConnected(true);

                // Join the room
                socketRef.current.emit('join-room', {
                    roomId,
                    userId,
                    userName,
                });
            });

            // Handle existing users in room
            socketRef.current.on('existing-users', async (users) => {
                console.log('Existing users:', users);
                setParticipants(users);

                // Create offers for each existing user
                for (const user of users) {
                    const pc = createPeerConnection(user.socketId);
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);

                    socketRef.current.emit('offer', {
                        offer,
                        to: user.socketId,
                        from: socketRef.current.id,
                    });
                }
            });

            // Handle new user joining
            socketRef.current.on('user-joined', async ({ socketId, userId: uid, userName: uname }) => {
                console.log('User joined:', uname);
                setParticipants((prev) => [...prev, { socketId, userId: uid, userName: uname }]);
            });

            // Handle incoming offer
            socketRef.current.on('offer', async ({ offer, from }) => {
                console.log('Received offer from:', from);
                const pc = createPeerConnection(from);
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socketRef.current.emit('answer', {
                    answer,
                    to: from,
                    from: socketRef.current.id,
                });
            });

            // Handle incoming answer
            socketRef.current.on('answer', async ({ answer, from }) => {
                console.log('Received answer from:', from);
                const pc = peerConnectionsRef.current[from];
                if (pc) {
                    await pc.setRemoteDescription(new RTCSessionDescription(answer));
                }
            });

            // Handle incoming ICE candidate
            socketRef.current.on('ice-candidate', async ({ candidate, from }) => {
                const pc = peerConnectionsRef.current[from];
                if (pc) {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                }
            });

            // Handle user leaving
            socketRef.current.on('user-left', ({ socketId }) => {
                console.log('User left:', socketId);
                setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
                setRemoteStreams((prev) => {
                    const updated = { ...prev };
                    delete updated[socketId];
                    return updated;
                });

                // Close peer connection
                if (peerConnectionsRef.current[socketId]) {
                    peerConnectionsRef.current[socketId].close();
                    delete peerConnectionsRef.current[socketId];
                }
            });

            socketRef.current.on('disconnect', () => {
                setIsConnected(false);
            });

        } catch (err) {
            console.error('Failed to join room:', err);
            setError(err.message);
        }
    }, [roomId, userId, userName, initializeMedia, createPeerConnection]);

    // Leave room and cleanup
    const leaveRoom = useCallback(() => {
        // Stop local stream
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        // Stop screen sharing stream
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        // Close all peer connections
        Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
        peerConnectionsRef.current = {};

        // Disconnect socket
        if (socketRef.current) {
            socketRef.current.emit('leave-room', { roomId });
            socketRef.current.disconnect();
        }

        setLocalStream(null);
        setRemoteStreams({});
        setParticipants([]);
        setIsConnected(false);
        setIsScreenSharing(false);
    }, [roomId]);

    // Toggle audio
    const toggleAudio = useCallback(() => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    }, []);

    // Toggle video
    const toggleVideo = useCallback(() => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    }, []);

    // Toggle screen sharing
    const toggleScreenShare = useCallback(async () => {
        try {
            if (!isScreenSharing) {
                // Start screen sharing
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        cursor: 'always',
                    },
                    audio: false,
                });

                screenStreamRef.current = screenStream;
                const screenTrack = screenStream.getVideoTracks()[0];

                // Replace video track in all peer connections
                Object.values(peerConnectionsRef.current).forEach((pc) => {
                    const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(screenTrack);
                    }
                });

                // Update local stream for preview
                const newStream = new MediaStream([
                    ...localStreamRef.current.getAudioTracks(),
                    screenTrack,
                ]);
                setLocalStream(newStream);
                setIsScreenSharing(true);

                // Handle when user stops sharing from browser UI
                screenTrack.onended = () => {
                    stopScreenShare();
                };
            } else {
                stopScreenShare();
            }
        } catch (err) {
            console.error('Screen sharing error:', err);
            setIsScreenSharing(false);
        }
    }, [isScreenSharing]);

    // Stop screen sharing helper
    const stopScreenShare = useCallback(async () => {
        // Stop screen stream
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((track) => track.stop());
            screenStreamRef.current = null;
        }

        // Restore camera video track
        if (originalVideoTrackRef.current) {
            // Replace screen track with camera track in all peer connections
            Object.values(peerConnectionsRef.current).forEach((pc) => {
                const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
                if (sender && originalVideoTrackRef.current) {
                    sender.replaceTrack(originalVideoTrackRef.current);
                }
            });

            // Update local stream
            const newStream = new MediaStream([
                ...localStreamRef.current.getAudioTracks(),
                originalVideoTrackRef.current,
            ]);
            setLocalStream(newStream);
        }

        setIsScreenSharing(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            leaveRoom();
        };
    }, [leaveRoom]);

    return {
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
    };
};

export default useWebRTC;
