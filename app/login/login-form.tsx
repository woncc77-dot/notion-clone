"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");
  const message = searchParams.get("message");
  const [submitting, setSubmitting] = useState(false);
  const initialError = useMemo(() => {
    if (authError !== "auth") return null;
    if (message) return message;
    return "로그인에 실패했습니다. 다시 시도해 주세요.";
  }, [authError, message]);
  const [error, setError] = useState<string | null>(initialError);

  async function signInWithGoogle() {
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>Google 계정으로 워크스페이스에 접속하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive mb-4" role="alert">
            {error}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          className="w-full"
          disabled={submitting}
          onClick={() => void signInWithGoogle()}
        >
          {submitting ? "연결 중..." : "Google로 계속"}
        </Button>
      </CardFooter>
    </Card>
  );
}
