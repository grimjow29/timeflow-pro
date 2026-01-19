import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Check for demo session
function getDemoSession(request: NextRequest) {
  const demoSessionCookie = request.cookies.get("tf_session");
  if (!demoSessionCookie?.value) return null;

  try {
    const session = JSON.parse(demoSessionCookie.value);
    if (session.expires && session.expires > Date.now()) {
      return session.user;
    }
  } catch {
    return null;
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Check demo session first
  const demoUser = getDemoSession(request);

  // Then check Supabase auth
  let supabaseUser = null;
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    supabaseUser = user;
  } catch {
    // Supabase error - continue with demo check
  }

  const isAuthenticated = !!demoUser || !!supabaseUser;
  const pathname = request.nextUrl.pathname;

  // Protected routes
  if (!isAuthenticated && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect logged in users from login to dashboard
  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect root
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
