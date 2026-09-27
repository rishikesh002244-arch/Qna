"use client";

import React from "react";
import { useAuthStore } from "@/store/Auth";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginPage() {
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    const loginResponse = await login(email, password);
    if (!loginResponse.success && loginResponse.error) {
      setError(loginResponse.error.message || "Failed to log in.");
    }
    setIsLoading(false);
  };

  return (
    <div className="relative rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
        <p className="text-xs text-slate-400">Sign in to your QnA account to continue</p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="mt-1"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-600 hover:to-indigo-600 disabled:opacity-50 transition duration-200"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-cyan-400 font-semibold hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
