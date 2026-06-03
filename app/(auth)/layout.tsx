export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative z-10 flex min-h-[calc(100dvh-112px)] flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex w-full max-w-md flex-col items-center">
        {/* Branding */}
        <div className="mb-5 text-center sm:mb-6">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#080808]/95 shadow-2xl shadow-black/30 sm:h-12 sm:w-12">
            <img
              src="/favicon.png"
              alt="MoneyFlow"
              className="h-7 w-7 rounded-xl sm:h-8 sm:w-8"
            />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            MoneyFlow
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Know exactly where your money goes.
          </p>
        </div>

        {/* Form */}
        <div className="w-full">{children}</div>
      </div>
    </main>
  );
}
