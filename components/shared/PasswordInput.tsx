"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export default function PasswordInput({ className, disabled, ...props }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        disabled={disabled}
        className={cn("pr-11", className)}
        {...props}
      />

      <button
        type="button"
        onClick={() => setShow((value) => !value)}
        disabled={disabled}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-colors hover:border-white/10 hover:bg-white/[0.06] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/10 disabled:pointer-events-none disabled:opacity-50"
      >
        {show ? (
          <EyeOff className="h-4 w-4" strokeWidth={2.2} />
        ) : (
          <Eye className="h-4 w-4" strokeWidth={2.2} />
        )}
      </button>
    </div>
  );
}
