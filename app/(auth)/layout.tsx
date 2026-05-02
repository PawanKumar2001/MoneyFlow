export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-10 flex min-h-[calc(100vh-69px)] flex-col items-center justify-center p-4 sm:p-6">
      {/* Branding */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            MoneyFlow
          </h1>
        </div>
        <p className="text-slate-400 text-sm md:text-base tracking-wide">
          Know exactly where your money goes.
        </p>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm sm:max-w-md">
        {children}
      </div>
    </div>
  );
}