"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, AlertTriangle, Bell } from "lucide-react";

export function Login({ onSwitchToRegister }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:8001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Login failed");
      }

      const user = await res.json();
      localStorage.setItem("user", JSON.stringify(user));

      setSuccess(`Logged in as ${user.name}`);
      setError(null);

      router.push("/chat"); 
    } catch (err) {
      setError(err.message);
      setSuccess(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Welcome back</h1>
      <p className="text-center text-gray-400">
        Sign in to your account
      </p>

      {error && (
        <div className="flex gap-3 bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md">
          <AlertTriangle />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="flex gap-3 bg-green-900/50 border border-green-700 text-green-300 p-3 rounded-md">
          <Bell />
          <div>{success}</div>
        </div>
      )}

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md"
          required
        />
      </div>

      <button className="w-full flex justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold">
        <LogIn />
        Login
      </button>

      <p className="text-center text-sm text-gray-400">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-blue-400 hover:text-blue-300 font-semibold"
        >
          Register
        </button>
      </p>
    </form>
  );
}
