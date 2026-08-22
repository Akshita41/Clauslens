import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The middleware already redirects unauthenticated users, but a layout that
  // assumes a user without checking is one refactor away from leaking.
  if (!user) redirect("/login");

  return (
    <AppShell
      email={user.email ?? ""}
      name={(user.user_metadata?.full_name as string) || null}
    >
      {children}
    </AppShell>
  );
}
