import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DashboardClient } from "@/components/layout/dashboard-client";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("tf_session");
  if (!sessionCookie?.value) return null;

  try {
    const sessionValue = sessionCookie.value;

    // Handle signed session format (base64.signature)
    if (sessionValue.includes(".")) {
      const [base64Data] = sessionValue.split(".");
      const jsonData = Buffer.from(base64Data, "base64").toString("utf-8");
      const session = JSON.parse(jsonData);

      if (session.expires && session.expires > Date.now()) {
        return session.user;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check session
  const sessionUser = await getSession();

  if (sessionUser) {
    const profile = {
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name,
      avatar_url: sessionUser.avatar_url,
      role: sessionUser.role as "ADMIN" | "MANAGER" | "EMPLOYEE" | "VALIDATOR",
      group_id: sessionUser.group_id,
      created_at: sessionUser.created_at,
      updated_at: sessionUser.updated_at,
    };

    return (
      <DashboardClient>
        <div className="flex h-screen bg-background">
          <Sidebar user={profile} />
          <main className="flex-1 flex flex-col min-w-0">
            <Header user={profile} />
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </main>
        </div>
      </DashboardClient>
    );
  }

  // Fallback to Supabase auth
  const supabase = await createClient();
  if (!supabase) {
    redirect("/login");
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: dbProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = dbProfile || {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
    avatar_url: user.user_metadata?.avatar_url || null,
    role: "EMPLOYEE" as const,
    group_id: null,
    created_at: user.created_at,
    updated_at: new Date().toISOString(),
  };

  return (
    <DashboardClient>
      <div className="flex h-screen bg-background">
        <Sidebar user={profile} />
        <main className="flex-1 flex flex-col min-w-0">
          <Header user={profile} />
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </main>
      </div>
    </DashboardClient>
  );
}
