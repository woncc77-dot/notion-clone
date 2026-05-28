import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Suspense
        fallback={
          <div className="w-full max-w-md h-48 rounded-lg border border-border animate-pulse bg-muted" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
