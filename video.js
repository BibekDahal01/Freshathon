document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const preCallSection = document.getElementById('pre-call');
    const videoConferenceSection = document.querySelector('.video-conference');
    const startConsultationBtn = document.getElementById('start-consultation');
    const joinConsultationBtn = document.getElementById('join-consultation');
    const toggleVideoBtn = document.getElementById('toggle-video');
    const toggleMicBtn = document.getElementById('toggle-mic');
    const toggleScreenBtn = document.getElementById('toggle-screen');
    const endCallBtn = document.getElementById('end-call');
    const toggleChatBtn = document.getElementById('toggle-chat');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendMessageBtn = document.getElementById('send-message');
    const copyMeetingIdBtn = document.getElementById('copy-meeting-id');
    const meetingIdElement = document.getElementById('meeting-id');
    const meetingTimer = document.getElementById('meeting-timer');
    const cameraSelect = document.getElementById('camera-select');
    const micSelect = document.getElementById('mic-select');
    const speakerSelect = document.getElementById('speaker-select');
    const testSpeakerBtn = document.getElementById('test-speaker');
    const cameraPreview = document.getElementById('camera-preview');
    const localVideo = document.getElementById('local-video');
    const remoteVideo = document.getElementById('remote-video');
    const meetingCodeInput = document.getElementById('meeting-code');
    
    // State variables
    let localStream;
    let remoteStream;
    let peer;
    let currentCall;
    let screenStream;
    let meetingStartTime;
    let timerInterval;
    let isVideoOn = true;
    let isMicOn = true;
    let isScreenSharing = false;
    let isChatOpen = true;
    
    // Initialize the application
    function init() {
        // Hide video conference section initially
        videoConferenceSection.style.display = 'none';
        
        // Generate a random meeting ID
        meetingIdElement.textContent = generateMeetingId();
        
        // Set up event listeners
        setupEventListeners();
        
        // Get user media devices
        getMediaDevices();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        startConsultationBtn.addEventListener('click', startConsultation);
        joinConsultationBtn.addEventListener('click', joinConsultation);
        toggleVideoBtn.addEventListener('click', toggleVideo);
        toggleMicBtn.addEventListener('click', toggleMic);
        toggleScreenBtn.addEventListener('click', toggleScreenShare);
        endCallBtn.addEventListener('click', endCall);
        toggleChatBtn.addEventListener('click', toggleChat);
        closeSidebarBtn.addEventListener('click', toggleSidebar);
        sendMessageBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
        copyMeetingIdBtn.addEventListener('click', copyMeetingId);
        testSpeakerBtn.addEventListener('click', testSpeaker);
        
        // Device selection changes
        cameraSelect.addEventListener('change', updateCamera);
        micSelect.addEventListener('change', updateMic);
        speakerSelect.addEventListener('change', updateSpeaker);
    }
    
    // Generate a random meeting ID
    function generateMeetingId() {
        const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const numbers = '23456789';
        let id = 'HG-';
        
        // Add 4 random letters
        for (let i = 0; i < 4; i++) {
            id += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        
        id += '-';
        
        // Add 4 random numbers
        for (let i = 0; i < 4; i++) {
            id += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        
        return id;
    }
    
    // Get user media devices
    async function getMediaDevices() {
        try {
            // Get camera and microphone
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            // Display camera preview
            cameraPreview.srcObject = stream;
            localStream = stream;
            
            // Populate camera select
            const devices = await navigator.mediaDevices.enumerateDevices();
            populateDeviceOptions(cameraSelect, 'videoinput', devices);
            populateDeviceOptions(micSelect, 'audioinput', devices);
            populateDeviceOptions(speakerSelect, 'audiooutput', devices);
            
        } catch (err) {
            console.error('Error accessing media devices:', err);
            alert('Could not access camera or microphone. Please check your permissions.');
        }
    }
    
    // Populate device selection dropdowns
    function populateDeviceOptions(selectElement, kind, devices) {
        const filteredDevices = devices.filter(device => device.kind === kind);
        
        selectElement.innerHTML = `<option value="">Select ${kind.replace('input', '').replace('output', '')}</option>`;
        
        filteredDevices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `${kind.replace('input', '').replace('output', '')} ${selectElement.length}`;
            selectElement.appendChild(option);
        });
    }
    
    // Update camera
    async function updateCamera() {
        const deviceId = cameraSelect.value;
        if (!deviceId) return;
        
        try {
            const constraints = {
                video: { deviceId: { exact: deviceId } },
                audio: isMicOn
            };
            
            await updateMediaStream(constraints);
        } catch (err) {
            console.error('Error updating camera:', err);
        }
    }
    
    // Update microphone
    async function updateMic() {
        const deviceId = micSelect.value;
        if (!deviceId) return;
        
        try {
            const constraints = {
                video: isVideoOn,
                audio: { deviceId: { exact: deviceId } }
            };
            
            await updateMediaStream(constraints);
        } catch (err) {
            console.error('Error updating microphone:', err);
        }
    }
    
    // Update media stream with new constraints
    async function updateMediaStream(constraints) {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Stop previous stream
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        
        // Update local stream
        localStream = stream;
        cameraPreview.srcObject = stream;
        
        if (currentCall) {
            // Replace tracks in the ongoing call
            replaceTrackInCall('video', stream.getVideoTracks()[0]);
            replaceTrackInCall('audio', stream.getAudioTracks()[0]);
        }
    }
    
    // Replace a specific track in the ongoing call
    function replaceTrackInCall(kind, newTrack) {
        const sender = currentCall.peerConnection.getSenders().find(
            s => s.track.kind === kind
        );
        if (sender) sender.replaceTrack(newTrack);
    }
    
    // Update speaker (limited browser support)
    function updateSpeaker() {
        const deviceId = speakerSelect.value;
        if (!deviceId) return;
        
        // Note: This API is not widely supported yet
        if ('setSinkId' in remoteVideo) {
            remoteVideo.setSinkId(deviceId)
                .then(() => console.log('Speaker updated'))
                .catch(err => console.error('Error updating speaker:', err));
        } else {
            console.warn('Speaker selection not supported in this browser');
        }
    }
    
    // Test speaker
    function testSpeaker() {
        // In a real app, you would play a test sound
        alert('Playing test sound through selected speaker');
    }
    
    // Start a new consultation
    async function startConsultation() {
        try {
            // Initialize PeerJS
            peer = new Peer();
            
            peer.on('open', (id) => {
                console.log('Peer connected with ID:', id);
                
                // Show video conference section
                preCallSection.style.display = 'none';
                videoConferenceSection.style.display = 'block';
                
                // Start local video
                localVideo.srcObject = localStream;
                
                // Start meeting timer
                startMeetingTimer();
                
                // In a real app, you would connect to a signaling server
                // and wait for participants to join
                simulateDoctorJoin();
            });
            
            peer.on('call', (call) => {
                call.answer(localStream);
                currentCall = call;
                
                call.on('stream', (stream) => {
                    remoteVideo.srcObject = stream;
                    remoteStream = stream;
                });
                
                call.on('close', endCall);
                call.on('error', (err) => {
                    console.error('Call error:', err);
                    endCall();
                });
            });
            
            peer.on('error', (err) => {
                console.error('Peer error:', err);
                alert('Connection error. Please try again.');
            });
            
        } catch (err) {
            console.error('Error starting consultation:', err);
            alert('Could not start consultation. Please try again.');
        }
    }
    
    // Join an existing consultation
    function joinConsultation() {
        const meetingCode = meetingCodeInput.value.trim();
        
        if (!meetingCode) {
            alert('Please enter a meeting ID');
            return;
        }
        
        try {
            // Initialize PeerJS
            peer = new Peer();
            
            peer.on('open', (id) => {
                console.log('Peer connected with ID:', id);
                
                // Show video conference section
                preCallSection.style.display = 'none';
                videoConferenceSection.style.display = 'block';
                
                // Start local video
                localVideo.srcObject = localStream;
                
                // Start meeting timer
                startMeetingTimer();
                
                // In a real app, you would connect to the host's stream
                // using the meeting code
                simulateCallHost(meetingCode);
            });
            
            peer.on('error', (err) => {
                console.error('Peer error:', err);
                alert('Connection error. Please try again.');
            });
            
        } catch (err) {
            console.error('Error joining consultation:', err);
            alert('Could not join consultation. Please check the meeting ID and try again.');
        }
    }
    
    // Simulate doctor joining (for demo purposes)
    function simulateDoctorJoin() {
        setTimeout(() => {
            // In a real app, this would be the actual remote stream
            remoteVideo.srcObject = new MediaStream();
            
            // Add a system message to chat
            addSystemMessage('Dr. Smith has joined the consultation');
        }, 2000);
    }
    
    // Simulate calling host (for demo purposes)
    function simulateCallHost(meetingCode) {
        setTimeout(() => {
            // In a real app, this would be the actual host's stream
            remoteVideo.srcObject = new MediaStream();
            
            // Add system messages to chat
            addSystemMessage(`Connected to meeting ${meetingCode}`);
            addSystemMessage('Dr. Smith is in the consultation');
        }, 2000);
    }
    
    // Toggle video on/off
    function toggleVideo() {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                isVideoOn = !videoTrack.enabled;
                videoTrack.enabled = isVideoOn;
                
                // Update button appearance
                toggleVideoBtn.innerHTML = isVideoOn ? 
                    '<i class="fas fa-video"></i>' : 
                    '<i class="fas fa-video-slash"></i>';
                toggleVideoBtn.classList.toggle('btn-active', isVideoOn);
                
                // Add system message
                addSystemMessage(`Video turned ${isVideoOn ? 'on' : 'off'}`);
            }
        }
    }
    
    // Toggle microphone on/off
    function toggleMic() {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                isMicOn = !audioTrack.enabled;
                audioTrack.enabled = isMicOn;
                
                // Update button appearance
                toggleMicBtn.innerHTML = isMicOn ? 
                    '<i class="fas fa-microphone"></i>' : 
                    '<i class="fas fa-microphone-slash"></i>';
                toggleMicBtn.classList.toggle('btn-active', isMicOn);
                
                // Add system message
                addSystemMessage(`Microphone turned ${isMicOn ? 'on' : 'off'}`);
            }
        }
    }
    
    // Toggle screen sharing
    async function toggleScreenShare() {
        try {
            if (!isScreenSharing) {
                // Start screen sharing
                screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                });
                
                // Replace the video track with screen share
                const videoTrack = screenStream.getVideoTracks()[0];
                const sender = currentCall.peerConnection.getSenders().find(
                    s => s.track.kind === 'video'
                );
                if (sender) sender.replaceTrack(videoTrack);
                
                // Show screen share on local video
                localVideo.srcObject = screenStream;
                
                isScreenSharing = true;
                toggleScreenBtn.innerHTML = '<i class="fas fa-stop"></i>';
                toggleScreenBtn.classList.add('btn-active');
                addSystemMessage('Started screen sharing');
                
                // Handle when user stops screen sharing
                videoTrack.onended = () => {
                    if (isScreenSharing) {
                        toggleScreenShare();
                    }
                };
            } else {
                // Stop screen sharing
                screenStream.getTracks().forEach(track => track.stop());
                
                // Restore camera video
                const videoTrack = localStream.getVideoTracks()[0];
                const sender = currentCall.peerConnection.getSenders().find(
                    s => s.track.kind === 'video'
                );
                if (sender) sender.replaceTrack(videoTrack);
                
                localVideo.srcObject = localStream;
                isScreenSharing = false;
                toggleScreenBtn.innerHTML = '<i class="fas fa-desktop"></i>';
                toggleScreenBtn.classList.remove('btn-active');
                addSystemMessage('Stopped screen sharing');
            }
        } catch (err) {
            console.error('Error toggling screen share:', err);
            if (err.name !== 'NotAllowedError') {
                alert('Could not start screen sharing. Please try again.');
            }
        }
    }
    
    // Toggle chat sidebar
    function toggleChat() {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            sidebar.style.transform = 'translateX(0)';
            toggleChatBtn.innerHTML = '<i class="fas fa-comment-slash"></i>';
        } else {
            sidebar.style.transform = 'translateX(100%)';
            toggleChatBtn.innerHTML = '<i class="fas fa-comment"></i>';
        }
    }
    
    // Toggle sidebar (mobile view)
    function toggleSidebar() {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            sidebar.style.transform = 'translateX(0)';
        } else {
            sidebar.style.transform = 'translateX(100%)';
        }
    }
    
    // Send chat message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            // Add message to chat
            addMessage('You', message, 'sent');
            
            // In a real app, you would send this to the other participant
            // via your signaling server or WebRTC data channel
            
            // Clear input
            chatInput.value = '';
        }
    }
    
    // Add message to chat UI
    function addMessage(sender, text, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.innerHTML = `
            <div class="message-sender">${sender}</div>
            <div class="message-content">${text}</div>
            <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Add system message to chat
    function addSystemMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message system';
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Copy meeting ID to clipboard
    function copyMeetingId() {
        const meetingId = meetingIdElement.textContent;
        navigator.clipboard.writeText(meetingId)
            .then(() => {
                const originalText = copyMeetingIdBtn.innerHTML;
                copyMeetingIdBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyMeetingIdBtn.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Could not copy meeting ID:', err);
            });
    }
    
    // Start meeting timer
    function startMeetingTimer() {
        meetingStartTime = new Date();
        updateMeetingTimer();
        timerInterval = setInterval(updateMeetingTimer, 1000);
    }
    
    // Update meeting timer display
    function updateMeetingTimer() {
        const now = new Date();
        const diff = now - meetingStartTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        meetingTimer.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // End the current call
    function endCall() {
        // Stop all media tracks
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
        }
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
        }
        
        // Close peer connection
        if (peer) {
            peer.destroy();
        }
        
        // Clear timer
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        // Reset UI
        preCallSection.style.display = 'block';
        videoConferenceSection.style.display = 'none';
        localVideo.srcObject = null;
        remoteVideo.srcObject = null;
        
        // Reset state
        currentCall = null;
        isVideoOn = true;
        isMicOn = true;
        isScreenSharing = false;
        
        // Add system message
        addSystemMessage('Consultation ended');
    }
    
    // Initialize the app
    init();
});