"use client";

import { login } from "@/services/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("admin");
  const [password, setPassword] = useState("Admin@12345");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!userId.trim()) {
      setError("User ID is required.");
      return;
    }

    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await login({
        user_id: userId.trim(),
        password,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-slate-800">
          AMS Login
        </h1>

        <p className="mb-8 mt-2 text-center text-gray-500">
          Audit Management System
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            className="w-full rounded border p-3"
            placeholder="User ID"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            disabled={loading}
          />

          <input
            className="w-full rounded border p-3"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleLogin();
              }
            }}
          />

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}