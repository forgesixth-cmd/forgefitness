import { AuthForm } from "@/components/auth/auth-form";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#fff7ed_0%,_#f8fafc_100%)] px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_35px_120px_rgba(15,23,42,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="bg-slate-950 px-8 py-10 text-slate-100 sm:px-10">
          <p className="text-sm font-semibold tracking-[0.28em] text-amber-200">
            FORGEFITNESS
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-white">
            Sign in and pick up your training where you left off.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
            This screen now uses the live Supabase browser client, so once your
            public project keys are set you can sign in immediately.
          </p>
        </section>
        <section className="px-4 py-4 sm:px-6 sm:py-6 lg:px-2 lg:py-2">
          <AuthForm mode="sign-in" />
        </section>
      </div>
    </main>
  );
}
