"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "~/hooks/api/auth/index";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p>Loading session...</p>
      </div>
    );
  }
  return user ? <>{children}</> : null;
}

export default function ProtectLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<div>Loading layout...</div>}>
      <AuthGuard>{children}</AuthGuard>
    </Suspense>
  );
}