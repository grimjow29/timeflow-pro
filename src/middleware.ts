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

  // Then check Supabase auth (MODE DEMO: skip si clé invalide)
  let supabaseUser = null;
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Valider que les clés existent et sont au bon format
    if (url && anonKey && url !== "" && anonKey.startsWith("eyJ")) {
      const supabase = createServerClient(url, anonKey, {
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
      });

      const { data: { user } } = await supabase.auth.getUser();
      supabaseUser = user;
    }
  } catch {
    // Supabase error - continue with demo check
    console.warn("[MODE DEMO] Middleware - Supabase non disponible");
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
