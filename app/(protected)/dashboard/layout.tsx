export const metadata = { title: "Dashboard" };
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

  console.log("incomeType:", user?.incomeType);

  return (
    <div className="min-h-[calc(100vh-69px)] bg-slate-950">
      <Navbar
        username={user?.username ?? user?.name ?? null}
        email={user?.email ?? null}
        image={user?.image ?? session.user.image ?? null}
        incomeType={user?.incomeType ?? "SALARIED"}
      />

      <main className="relative z-10 mx-auto max-w-7xl">
        {children}
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1e293b",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
          },
        }}
      />
    </div>
  );
}