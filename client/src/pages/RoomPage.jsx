import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import VideoTile from "../components/VideoTile";
import { useRoomSession } from "../hooks/useRoomSession";

export default function RoomPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
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
  } = useRoomSession(roomId);

  const leaveRoom = () => {
    navigate("/");
  };

  const hasLocalAudio = Boolean(localStream?.getAudioTracks?.().length);
  const hasLocalVideo = Boolean(localStream?.getVideoTracks?.().length);

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-4">
        <section className="lg:col-span-7 bg-slate-800 border border-slate-700 rounded-xl p-4 min-w-0">
          <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold">Room: {roomId}</h1>
              <p className="text-sm text-slate-300">
                Signed in as {user?.name}
              </p>
            </div>
            <button
              className="text-sm text-indigo-300 hover:text-indigo-200"
              onClick={() => navigator.clipboard.writeText(roomLink)}
            >
              Copy room link
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <VideoTile title="You" stream={localStream} muted />
            {Object.entries(remoteStreams).map(([peerId, stream]) => (
              <VideoTile
                key={peerId}
                title={`Peer ${peerId}`}
                stream={stream}
              />
            ))}
          </div>

          {mediaNotice && (
            <p className="text-amber-200/90 text-sm mt-3 border border-amber-700/50 bg-amber-950/30 rounded-lg p-3">
              {mediaNotice}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:pointer-events-none"
              onClick={toggleMic}
              disabled={!hasLocalAudio}
              title={
                !hasLocalAudio ? "No microphone in this session" : undefined
              }
            >
              {!hasLocalAudio ? "No mic" : isMicOn ? "Mute" : "Unmute"}
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:pointer-events-none"
              onClick={toggleCam}
              disabled={!hasLocalVideo}
              title={!hasLocalVideo ? "No camera in this session" : undefined}
            >
              {!hasLocalVideo
                ? "No camera"
                : isCamOn
                  ? "Camera Off"
                  : "Camera On"}
            </button>
            <button
              className="px-4 py-2 rounded bg-red-500 hover:bg-red-400"
              onClick={leaveRoom}
            >
              Leave Room
            </button>
          </div>
          {error && (
            <div className="mt-3 space-y-2">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                type="button"
                className="text-sm px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                onClick={retryMediaAccess}
              >
                Try again
              </button>
            </div>
          )}
        </section>

        <aside className="lg:col-span-5 min-w-0 bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col h-[75vh]">
          <h2 className="font-medium mb-3">Live Chat</h2>
          <div className="flex-1 overflow-auto space-y-2 mb-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-slate-900 border border-slate-700 rounded p-2"
              >
                <p className="text-xs text-slate-400">{msg.user?.name}</p>
                <p className="text-sm wrap-break-words">{msg.message}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 min-w-0 shrink-0">
            <input
              className="min-w-0 flex-1 p-2 rounded bg-slate-900 border border-slate-700"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type message"
            />
            <button
              type="button"
              className="shrink-0 px-4 py-2 rounded bg-indigo-500 hover:bg-indigo-400"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
