export const metadata = { title: "Dashboard | MoneyFlow" };

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Navbar from "@/components/layout/navbar";
import { Toaster } from "sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/login");
  if (!session.user.isSetupDone) redirect("/setup");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  return (
    <div className="flex min-h-[calc(100dvh-97px)] flex-col bg-transparent">
      <Navbar
        username={user?.username ?? user?.name ?? null}
        email={user?.email ?? null}
        image={user?.image ?? session.user.image ?? null}
        incomeType={user?.incomeType ?? "SALARIED"}
      />

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1">
        {children}
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#050505",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#ffffff",
            borderRadius: "14px",
          },
          classNames: {
            success: "!border-white/20",
            error: "!border-white/20",
            warning: "!border-white/20",
          },
        }}
      />
    </div>
  );
}
