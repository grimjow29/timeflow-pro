import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Session secret - must match the one in session-security.ts
const SESSION_SECRET = process.env.SESSION_SECRET || "timeflow-demo-secret-key-2024-change-in-production";

/**
 * Verify HMAC signature using Web Crypto API (Edge compatible)
 */
async function verifySignature(data: string, signature: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SESSION_SECRET);
    const dataBuffer = encoder.encode(data);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, dataBuffer);
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return computedSignature === signature;
  } catch {
    return false;
  }
}

/**
 * Check for demo session with signature verification
 * Returns { user, shouldDeleteCookie } to handle invalid sessions
 */
async function getDemoSession(request: NextRequest): Promise<{ user: unknown; shouldDeleteCookie: boolean }> {
  const demoSessionCookie = request.cookies.get("tf_session");
  if (!demoSessionCookie?.value) return { user: null, shouldDeleteCookie: false };

  try {
    const sessionValue = demoSessionCookie.value;

    // Check if it's a signed session (new format: base64.signature)
    if (sessionValue.includes(".")) {
      const [base64Data, signature] = sessionValue.split(".");

      // Verify signature
      const isValid = await verifySignature(base64Data, signature);
      if (!isValid) {
        console.warn("Invalid session signature detected - will delete cookie");
        return { user: null, shouldDeleteCookie: true };
      }

      // Parse session data
      const jsonData = atob(base64Data);
      const session = JSON.parse(jsonData);

      if (session.expires && session.expires > Date.now()) {
        return { user: session.user, shouldDeleteCookie: false };
      } else {
        // Session expired
        return { user: null, shouldDeleteCookie: true };
      }
    } else {
      // Legacy format (plain JSON) - reject and delete for security
      console.warn("Legacy unsigned session detected - will delete cookie");
      return { user: null, shouldDeleteCookie: true };
    }
  } catch (error) {
    console.error("Session parsing error:", error);
    return { user: null, shouldDeleteCookie: true };
  }
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Check demo session first (with signature verification)
  const { user: demoUser, shouldDeleteCookie } = await getDemoSession(request);

  // Delete invalid/expired session cookie
  if (shouldDeleteCookie) {
    response.cookies.delete("tf_session");
  }

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
