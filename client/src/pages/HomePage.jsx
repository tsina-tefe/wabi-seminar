import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoomApi, joinRoomApi } from "../api/room.api.js";
import { useAuth } from "../context/useAuth.js";

export default function HomePage() {
  const [roomIdInput, setRoomIdInput] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const createRoom = async () => {
    setError("");
    setCreating(true);
    try {
      const data = await createRoomApi();
      navigate(`/room/${data.roomId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = async () => {
    if (!roomIdInput.trim()) return;
    setError("");
    setJoining(true);
    try {
      const roomId = roomIdInput.trim();
      await joinRoomApi(roomId);
      navigate(`/room/${roomId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Welcome, {user?.name}</h1>
            <p className="text-slate-300">Create or join a seminar room</p>
          </div>
          <button className="text-sm text-red-300 hover:text-red-200" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <section className="bg-slate-900 border border-slate-700 rounded p-4">
            <h2 className="font-medium mb-3">Create Room</h2>
            <button
              onClick={createRoom}
              disabled={creating}
              className="w-full p-3 rounded bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create New Room"}
            </button>
          </section>
          <section className="bg-slate-900 border border-slate-700 rounded p-4">
            <h2 className="font-medium mb-3">Join Room</h2>
            <input
              className="w-full p-3 rounded bg-slate-800 border border-slate-700 mb-2"
              placeholder="Enter room ID"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
            />
            <button
              onClick={joinRoom}
              disabled={joining}
              className="w-full p-3 rounded bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60"
            >
              {joining ? "Joining..." : "Join"}
            </button>
          </section>
        </div>
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>
    </main>
  );
}
