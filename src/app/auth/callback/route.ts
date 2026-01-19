import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error_description = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/dashboard";

  // Log for debugging
  console.log("Auth callback received:", {
    hasCode: !!code,
    error_description,
    origin
  });

  // If there's an error from the OAuth provider
  if (error_description) {
    console.error("OAuth error:", error_description);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description)}`);
  }

  if (code) {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.redirect(`${origin}/login?error=auth_initialization_failed`);
    }
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("Exchange result:", {
      success: !!data?.session,
      error: error?.message
    });

    if (!error && data?.session) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    if (error) {
      console.error("Session exchange error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/login?error=no_code_received`);
}
