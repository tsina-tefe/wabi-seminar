import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi, registerApi } from "../api/auth.api.js";
import { useAuth } from "../context/useAuth.js";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = isLogin
        ? await loginApi({ email: form.email, password: form.password })
        : await registerApi(form);
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h1 className="text-2xl font-semibold mb-2">WabiSeminar Live</h1>
        <p className="text-slate-300 mb-6">Simple real-time meeting MVP</p>
        <form onSubmit={onSubmit} className="space-y-3">
          {!isLogin && (
            <input
              className="w-full p-3 rounded bg-slate-900 border border-slate-700"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
            />
          )}
          <input
            className="w-full p-3 rounded bg-slate-900 border border-slate-700"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            required
          />
          <input
            className="w-full p-3 rounded bg-slate-900 border border-slate-700"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            required
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full p-3 rounded bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </form>
        <button
          type="button"
          className="mt-4 text-indigo-300 hover:text-indigo-200"
          onClick={() => setIsLogin((v) => !v)}
        >
          {isLogin ? "Need an account? Register" : "Already registered? Login"}
        </button>
      </div>
    </main>
  );
}
