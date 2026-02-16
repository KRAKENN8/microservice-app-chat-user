"use client";

import { Auth } from "./components/auth/Auth";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-6">
        <Auth />
      </div>
    </div>
  );
}
