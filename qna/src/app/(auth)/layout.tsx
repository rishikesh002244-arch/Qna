"use client";

import React from "react";
import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuthStore();
  const router = useRouter();

  React.useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  if (session) {
    return null;
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-8">{children}</div>
    </div>
  );
};

export default AuthLayout;
