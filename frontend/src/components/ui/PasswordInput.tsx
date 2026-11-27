"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { evaluatePasswordStrength } from "@/lib/authUtils";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  showStrength?: boolean;
  className?: string;
  iconSize?: "sm" | "md";
}

/**
 * Password field with visibility toggle and optional real-time strength meter.
 */
export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  name,
  placeholder = "••••••••••••",
  required = false,
  autoComplete = "current-password",
  showStrength = false,
  className,
  iconSize = "md",
}) => {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? evaluatePasswordStrength(value) : null;

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Lock
          className={cn(
            "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none",
            iconSize === "sm" ? "w-4 h-4" : "w-5 h-5"
          )}
        />
        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={cn(
            "w-full pr-11 rounded-xl border border-brand-100 dark:border-slate-800 bg-[#f7fbff] dark:bg-navy-950 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition",
            iconSize === "sm" ? "pl-10 py-2.5" : "pl-11 py-3",
            className
          )}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {showStrength && strength && value.length > 0 && (
        <div className="space-y-1">
          <div className="grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={cn(
                  "h-1 rounded-full transition-colors",
                  strength.score >= step ? strength.colorClass : "bg-slate-200 dark:bg-slate-800"
                )}
              />
            ))}
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Password strength: <span className="font-semibold">{strength.label}</span>
          </p>
        </div>
      )}
    </div>
  );
};
