import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    const msg = errorDescription
      ? decodeURIComponent(errorDescription)
      : "로그인에 실패했습니다.";
    const redirect = new URL("/login", url.origin);
    redirect.searchParams.set("error", "auth");
    redirect.searchParams.set("message", msg);
    return NextResponse.redirect(redirect);
  }

  if (!code) {
    const redirect = new URL("/login", url.origin);
    redirect.searchParams.set("error", "auth");
    return NextResponse.redirect(redirect);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const redirect = new URL("/login", url.origin);
    redirect.searchParams.set("error", "auth");
    redirect.searchParams.set("message", "서버 환경 변수가 설정되지 않았습니다.");
    return NextResponse.redirect(redirect);
  }

  const response = NextResponse.redirect(new URL(next, url.origin));

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.headers
          .getSetCookie?.()
          ?.map((c) => {
            const [nameValue] = c.split(";");
            const [name, ...rest] = nameValue.split("=");
            return { name, value: rest.join("=") };
          }) ?? [];
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  );

  if (exchangeError) {
    const redirect = new URL("/login", url.origin);
    redirect.searchParams.set("error", "auth");
    redirect.searchParams.set("message", exchangeError.message);
    return NextResponse.redirect(redirect);
  }

  return response;
}

