"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      router.replace("/auth/sign-in");
      return;
    }

    const supabase = getSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);

      if (!data.session) {
        router.replace(`/auth/sign-in?next=${encodeURIComponent(pathname)}`);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);

      if (!nextSession) {
        router.replace(`/auth/sign-in?next=${encodeURIComponent(pathname)}`);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
            Secure area
          </p>
          <p className="mt-3 text-xl font-semibold text-slate-950">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div>
          <p className="text-xl font-semibold text-slate-950">
            Redirecting to sign in...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
