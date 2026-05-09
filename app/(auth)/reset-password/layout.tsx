import { Suspense } from "react";

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
    </div>
  }>
    {children}
  </Suspense>;
}