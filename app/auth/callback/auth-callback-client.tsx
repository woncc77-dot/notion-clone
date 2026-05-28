"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("로그인 처리 중...");

  useEffect(() => {
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      const msg = errorDescription
        ? decodeURIComponent(errorDescription)
        : "로그인에 실패했습니다.";
      router.replace(`/login?error=auth&message=${encodeURIComponent(msg)}`);
      return;
    }

    if (!code) {
      router.replace("/login?error=auth");
      return;
    }

    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
        code
      );

      if (cancelled) return;

      if (exchangeError) {
        router.replace(
          `/login?error=auth&message=${encodeURIComponent(exchangeError.message)}`
        );
        return;
      }

      router.replace(next);
      router.refresh();
    })().catch(() => {
      if (!cancelled) router.replace("/login?error=auth");
    });

    return () => {
      cancelled = true;
      setMessage("로그인 처리 중...");
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

