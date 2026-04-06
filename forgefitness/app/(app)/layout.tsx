import type { ReactNode } from "react";
import Link from "next/link";
import { UserCircle2 } from "lucide-react";
import { AuthGate } from "@/components/auth/auth-gate";
import { SignOutButton } from "@/components/auth/sign-out-button";

const navigation = [
  { href: "/dashboard", label: "Overview" },
  { href: "/check-in", label: "Check-In" },
  { href: "/nutrition", label: "Nutrition" },
  { href: "/training", label: "Training" },
  { href: "/open-gym", label: "Open Gym" },
  { href: "/mobility", label: "Mobility" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <div className="min-h-screen bg-[var(--forge-ink)]">
        <header className="sticky top-0 z-20 border-b-[3px] border-[var(--forge-red)] bg-[var(--forge-ink)]">
          <div className="flex items-stretch overflow-x-auto">
            <Link
              href="/dashboard"
              className="shrink-0 border-r border-[var(--forge-border)] px-5 py-4 font-[family-name:var(--font-archivo-black)] text-2xl tracking-[0.35em] text-[var(--forge-white)]"
            >
              FORGE
            </Link>
            <nav className="flex min-w-max flex-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 border-r border-[var(--forge-border)] px-5 py-4 font-[family-name:var(--font-archivo-black)] text-[11px] uppercase tracking-[0.32em] text-[var(--forge-dim)] transition hover:text-[var(--forge-white)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex shrink-0 items-center gap-3 border-l border-[var(--forge-border)] px-4">
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 text-sm text-[var(--forge-silver)] hover:text-[var(--forge-white)]"
              >
                <UserCircle2 className="h-4 w-4" />
                Profile
              </Link>
              <SignOutButton />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1400px] px-5 py-6 sm:px-7 lg:px-8">
          <main>{children}</main>
        </div>
      </div>
    </AuthGate>
  );
}
