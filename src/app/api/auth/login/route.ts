export const dynamic = "force-dynamic";

import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  createSignedSession,
  isValidEmail,
  isValidPassword,
  sanitizeInput,
  checkRateLimit,
  resetRateLimit,
} from "@/lib/session-security";

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0] : "unknown";

    // Check rate limit
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Trop de tentatives. Réessayez dans ${rateCheck.retryAfter} secondes.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Reset rate limit on successful validation
    resetRateLimit(clientIp);

    const cookieStore = await cookies();

    // Create user session from provided credentials
    // Note: This is DEMO mode - real authentication via Azure AD
    // should be implemented for production use
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    const userName = sanitizedEmail.split("@")[0].replace(/[._]/g, " ");
    const formattedName = userName
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const sessionData = {
      user: {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        email: sanitizedEmail,
        name: formattedName,
        avatar_url: null,
        role: "ADMIN" as const,
        group_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      isDemo: true, // Flag to indicate this is demo mode
    };

    // Create signed session to prevent tampering
    const signedSession = createSignedSession(sessionData);

    cookieStore.set("tf_session", signedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({ success: true, user: sessionData.user });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la connexion" },
      { status: 500 }
    );
  }
}
