import { useEffect, useMemo, useRef, useState } from "react";
import { createAuthenticatedSocket } from "../services/socket.js";
import { WEBRTC_PEER_CONFIG } from "../services/webrtc.config.js";

function describeMediaAccessError(reason) {
  const name = reason?.name ?? "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return [
      "The browser blocked camera/microphone access.",
      'Click the lock or site-settings icon beside the URL, allow Camera & Microphone, then use “Try again” below.',
      "On Windows: Settings → Privacy & security → Camera / Microphone — ensure browser access is on.",
    ].join(" ");
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera or microphone was found. Plug one in or select a virtual device in your OS.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "The camera/microphone is in use by another app. Close other apps (Teams, Zoom, etc.) and try again.";
  }
  if (name === "SecurityError" || name === "NotSupportedError") {
    return "Media access isn’t allowed in this context. Use https://localhost (or plain http://localhost) from a normal browser tab, not a file path.";
  }
  if (reason?.message) {
    return `Could not open camera/microphone: ${reason.message}`;
  }
  return "Could not open camera/microphone. Check browser permissions and try again.";
}

/** Busy device: try mic-only then cam-only before giving up. */
async function acquireLocalMediaWithFallback() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    return { stream, notice: "" };
  } catch (first) {
    const busy =
      first.name === "NotReadableError" || first.name === "TrackStartError";
    if (!busy) throw first;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      return {
        stream,
        notice:
          "Camera wasn’t available (often in use elsewhere). You’re joined with microphone only — close Teams, Zoom, or other camera apps and use “Try again” for video.",
      };
    } catch {
      // continue
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      return {
        stream,
        notice:
          "Microphone wasn’t available (often in use elsewhere). You’re joined with camera only — close other apps using the mic and use “Try again” for audio.",
      };
    } catch {
      throw first;
    }
  }
}

/**
 * Manages Socket.IO signaling, WebRTC peer connections, and chat for one room.
 */
export function useRoomSession(roomId) {
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const selfIdRef = useRef("");

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [error, setError] = useState("");
  const [mediaNotice, setMediaNotice] = useState("");
  const [mediaRetryKey, setMediaRetryKey] = useState(0);

  const roomLink = useMemo(
    () => `${window.location.origin}/room/${roomId}`,
    [roomId]
  );

  const ensurePeerConnection = (peerId) => {
    if (peerConnectionsRef.current.has(peerId)) {
      return peerConnectionsRef.current.get(peerId);
    }

    const pc = new RTCPeerConnection(WEBRTC_PEER_CONFIG);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteStreams((prev) => ({ ...prev, [peerId]: stream }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("signal:ice", {
          targetPeerId: peerId,
          candidate: event.candidate,
        });
      }
    };

    peerConnectionsRef.current.set(peerId, pc);
    return pc;
  };

  useEffect(() => {
    const peerConnections = peerConnectionsRef.current;

    const setup = async () => {
      setError("");
      setMediaNotice("");
      try {
        const { stream, notice } = await acquireLocalMediaWithFallback();
        localStreamRef.current = stream;
        setLocalStream(stream);
        if (notice) setMediaNotice(notice);
        const hasMic = stream.getAudioTracks().length > 0;
        const hasCam = stream.getVideoTracks().length > 0;
        setIsMicOn(hasMic);
        setIsCamOn(hasCam);
      } catch (err) {
        const msg = describeMediaAccessError(err);
        const triedFallback =
          err.name === "NotReadableError" || err.name === "TrackStartError";
        setError(
          triedFallback
            ? `${msg} Already tried microphone-only and camera-only. Quit apps that reserve the mic/camera (Teams, Zoom, OBS, Skype — check system tray too), unplug/replug USB devices, then use “Try again”.`
            : msg
        );
        return;
      }

      const socket = createAuthenticatedSocket();
      socketRef.current = socket;

      socket.on("room:error", ({ message }) => setError(message));

      socket.on("room:joined", async ({ peers, selfId: socketUserId }) => {
        selfIdRef.current = socketUserId;
        for (const peerId of peers) {
          const pc = ensurePeerConnection(peerId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("signal:offer", { targetPeerId: peerId, sdp: offer });
        }
      });

      socket.on("room:user-joined", async ({ peerId }) => {
        ensurePeerConnection(peerId);
      });

      socket.on("room:user-left", ({ peerId }) => {
        const pc = peerConnectionsRef.current.get(peerId);
        if (pc) {
          pc.close();
          peerConnectionsRef.current.delete(peerId);
        }
        setRemoteStreams((prev) => {
          const next = { ...prev };
          delete next[peerId];
          return next;
        });
      });

      socket.on("signal:offer", async ({ fromPeerId, targetPeerId, sdp }) => {
        if (targetPeerId !== selfIdRef.current && selfIdRef.current) return;
        const pc = ensurePeerConnection(fromPeerId);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("signal:answer", { targetPeerId: fromPeerId, sdp: answer });
      });

      socket.on("signal:answer", async ({ fromPeerId, targetPeerId, sdp }) => {
        if (targetPeerId !== selfIdRef.current && selfIdRef.current) return;
        const pc = ensurePeerConnection(fromPeerId);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      });

      socket.on("signal:ice", async ({ fromPeerId, targetPeerId, candidate }) => {
        if (targetPeerId !== selfIdRef.current && selfIdRef.current) return;
        const pc = ensurePeerConnection(fromPeerId);
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      });

      socket.on("chat:message", (message) => {
        setMessages((prev) => [...prev, message]);
      });

      socket.emit("room:join", { roomId });
    };

    setup();

    return () => {
      socketRef.current?.disconnect();
      peerConnections.forEach((pc) => pc.close());
      peerConnections.clear();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [roomId, mediaRetryKey]);

  const retryMediaAccess = () => setMediaRetryKey((k) => k + 1);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    socketRef.current?.emit("chat:send", { message: chatInput.trim() });
    setChatInput("");
  };

  const toggleMic = () => {
    if (!localStreamRef.current?.getAudioTracks().length) return;
    const next = !isMicOn;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
    setIsMicOn(next);
  };

  const toggleCam = () => {
    if (!localStreamRef.current?.getVideoTracks().length) return;
    const next = !isCamOn;
    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
    setIsCamOn(next);
  };

  return {
    localStream,
    remoteStreams,
    messages,
    chatInput,
    setChatInput,
    isMicOn,
    isCamOn,
    error,
    mediaNotice,
    roomLink,
    sendMessage,
    toggleMic,
    toggleCam,
    retryMediaAccess,
  };
}
