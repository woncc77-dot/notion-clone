import { Suspense } from "react";
import AuthCallbackClient from "./auth-callback-client";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <p className="text-sm text-muted-foreground">로그인 처리 중...</p>
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}

