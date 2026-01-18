import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DashboardClient } from "@/components/layout/dashboard-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Create profile object from NextAuth session
  const profile = {
    id: session.user.id || session.user.email || "unknown",
    email: session.user.email || "",
    name: session.user.name || "User",
    avatar_url: session.user.image || null,
    role: "ADMIN" as const,
    group_id: null,
    created_at: new Date().toISOString(),
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
