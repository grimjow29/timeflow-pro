import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    // Create user session from provided credentials
    const userName = email.split("@")[0].replace(/[._]/g, " ");
    const formattedName = userName
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const sessionData = {
      user: {
        id: `user-${Date.now()}`,
        email: email,
        name: formattedName,
        avatar_url: null,
        role: "ADMIN",
        group_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    cookieStore.set("tf_session", JSON.stringify(sessionData), {
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
