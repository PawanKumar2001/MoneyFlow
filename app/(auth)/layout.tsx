export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative z-10 flex min-h-[calc(100dvh-73px)] items-center justify-center px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex w-full max-w-md flex-col items-center">
        {/* Branding */}
        <div className="mb-4 text-center sm:mb-5">
          <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#080808]/95 shadow-2xl shadow-black/30 sm:h-11 sm:w-11">
            <img
              src="/favicon.png"
              alt="MoneyFlow"
              className="h-6.5 w-6.5 rounded-xl sm:h-7 sm:w-7"
            />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            MoneyFlow
          </h1>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Know exactly where your money goes.
          </p>
        </div>

        {/* Form */}
        <div className="w-full">{children}</div>
      </div>
    </main>
  );
}
