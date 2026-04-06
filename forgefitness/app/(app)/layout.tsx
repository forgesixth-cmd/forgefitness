import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  ClipboardList,
  LayoutDashboard,
  UserCircle2,
} from "lucide-react";
import { AuthGate } from "@/components/auth/auth-gate";
import { SignOutButton } from "@/components/auth/sign-out-button";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/plans", label: "Plans", icon: ClipboardList },
  { href: "/log", label: "Workout Log", icon: Activity },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <div className="min-h-screen bg-[linear-gradient(180deg,_#f5f7fb_0%,_#edf2f7_100%)] text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <aside className="hidden w-72 shrink-0 rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-slate-100 shadow-[0_24px_70px_rgba(15,23,42,0.18)] lg:block">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-300 font-semibold text-slate-950">
                FF
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.24em] text-amber-200">
                  FORGEFITNESS
                </p>
                <p className="text-xs text-slate-400">Performance workspace</p>
              </div>
            </Link>

            <nav className="mt-10 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-10 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Training rhythm
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">4 of 5</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Weekly plan completion is on track. Keep Thursday available for
                recovery and mobility.
              </p>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="rounded-[2rem] border border-slate-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    ForgeFitness v1 foundation
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                    Build your training system
                  </h1>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/plans"
                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    View workout plans
                  </Link>
                  <SignOutButton />
                </div>
              </div>
            </header>

            <main className="flex-1 py-6">{children}</main>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
