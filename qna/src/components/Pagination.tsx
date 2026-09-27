"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

interface PaginationProps {
  className?: string;
  limit: number;
  total: number;
}

const Pagination = ({ className, total, limit }: PaginationProps) => {
  const searchParams = useSearchParams();
  const pageStr = searchParams.get("page") || "1";
  const currentPage = Math.max(1, parseInt(pageStr, 10) || 1);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const router = useRouter();
  const pathname = usePathname();

  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", `${newPage}`);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  return (
    <div className={`flex items-center justify-center gap-4 py-4 text-sm font-medium ${className || ""}`}>
      <button
        className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition duration-200"
        onClick={() => changePage(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        ← Previous
      </button>
      <span className="text-slate-400">
        Page <span className="font-semibold text-slate-200">{currentPage}</span> of{" "}
        <span className="font-semibold text-slate-200">{totalPages}</span>
      </span>
      <button
        className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition duration-200"
        onClick={() => changePage(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
