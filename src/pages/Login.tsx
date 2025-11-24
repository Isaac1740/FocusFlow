import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";   // ✅ IMPORT API URL

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const toggleTheme = (): void => {
    document.documentElement.classList.toggle("dark");
    localStorage.theme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  };

  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    if (user_id) navigate("/");
  }, [navigate]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ⬇⬇⬇ UPDATED URL ⬇⬇⬇
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!data.success) {
        alert(data.message);
        return;
      }

      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("username", data.username);
      localStorage.setItem("email", data.email);

      alert("Login successful!");
      navigate("/");
    } catch (err) {
      setLoading(false);
      alert("Error connecting to the server.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 bg-white/20 dark:bg-gray-800 text-white p-2 rounded-full shadow-md hover:scale-105 transition"
      >
        🌗
      </button>

      <div className="backdrop-blur-lg bg-white/20 dark:bg-gray-800/40 p-10 rounded-2xl shadow-2xl w-full max-w-md text-white border border-white/20">
        <h2 className="text-3xl font-bold text-center mb-8">
          Welcome Back 👋
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/30 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/30 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-white/80">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="text-indigo-300 hover:text-indigo-100 underline transition"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
