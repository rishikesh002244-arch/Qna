"use client";

import React from "react";
import { useAuthStore } from "@/store/Auth";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function RegisterPage() {
  const { createAccount, login } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName")?.toString().trim();
    const lastName = formData.get("lastName")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();

    if (!firstName || !lastName || !email || !password) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    setError("");

    const response = await createAccount(`${firstName} ${lastName}`, email, password);
    if (!response.success && response.error) {
      setError(response.error.message || "Failed to create account.");
      setIsLoading(false);
      return;
    }

    // Auto-login after creation
    const loginResponse = await login(email, password);
    if (!loginResponse.success && loginResponse.error) {
      setError(loginResponse.error.message || "Account created, but failed to log in automatically.");
    }
    setIsLoading(false);
  };

  return (
    <div className="relative rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
        <p className="text-xs text-slate-400">Join QnA Hub to ask questions and share knowledge</p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="John"
              required
              className="mt-1"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Doe"
              required
              className="mt-1"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            required
            className="mt-1"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            required
            className="mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-600 hover:to-indigo-600 disabled:opacity-50 transition duration-200"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-cyan-400 font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
