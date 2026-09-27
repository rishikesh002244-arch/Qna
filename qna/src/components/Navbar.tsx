"use client";

import Link from "next/link";
import React from "react";
import { useAuthStore } from "@/store/Auth";
import { avatars } from "@/models/client/config";
import slugify from "@/utils/slugify";
import { useRouter, useSearchParams } from "next/navigation";
import { IconSearch, IconPlus, IconLogout } from "@tabler/icons-react";

const Navbar = () => {
  const { user, session, logout } = useAuthStore();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get("search") || "");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/");
    }
  };

  const userName = user?.name || "User";
  const reputation = user?.prefs?.reputation ?? 0;
  const avatarUrl = user ? String(avatars.getInitials(userName, 32, 32)) : "";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white font-bold shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            Q
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
            QnA<span className="text-cyan-400">Hub</span>
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md items-center relative">
          <IconSearch className="absolute left-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none transition duration-200"
          />
        </form>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/questions/ask"
            className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-cyan-500 transition duration-200"
          >
            <IconPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Ask Question</span>
          </Link>

          {session && user ? (
            <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
              <Link
                href={`/users/${user.$id}/${slugify(userName)}`}
                className="flex items-center gap-2 rounded-xl p-1.5 text-slate-200 hover:bg-slate-900 transition duration-200"
              >
                <picture>
                  <img src={avatarUrl} alt={userName} className="h-7 w-7 rounded-lg" />
                </picture>
                <div className="hidden sm:block text-left text-xs">
                  <p className="font-semibold leading-tight text-slate-200">{userName}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Rep: {reputation}</p>
                </div>
              </Link>

              <button
                onClick={() => logout()}
                title="Log Out"
                aria-label="Log Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
              >
                <IconLogout className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-slate-800 pl-3 text-xs font-semibold">
              <Link
                href="/login"
                className="rounded-xl px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-900 transition duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-slate-200 hover:bg-slate-700 transition duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
