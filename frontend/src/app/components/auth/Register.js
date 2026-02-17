"use client";

import { useState } from "react";
import { UserPlus, AlertTriangle, Bell } from "lucide-react";

export function Register({ onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    (async () => {
      try {
        const res = await fetch("http://127.0.0.1:8001/register", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({name, email, password}),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Registration failed");
        }

        const user = await res.json();
        localStorage.setItem("user", JSON.stringify(user));

        setSuccess(`Registered as ${user.email}`);
        setError(null);

        setTimeout(() => window.location.reload(), 700);
      } catch (err) {
        setError(err.message);
        setSuccess(null);
      }
    })();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Create account</h1>

      {error && (
        <div className="flex gap-3 bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md"><AlertTriangle/><div>{error}</div></div>
      )}

      {success && (
        <div className="flex gap-3 bg-green-900/50 border border-green-700 text-green-300 p-3 rounded-md"><Bell/><div>{success}</div></div>
      )}

      <input type="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md" required/>

      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md" required/>

      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md" required/>

      <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md" required/>

      <button className="w-full flex justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold"><UserPlus/>Register</button>

      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <button type="button" onClick={onSwitchToLogin} className="text-blue-400 hover:text-blue-300 font-semibold">Login</button>
      </p>
    </form>
  );
}
