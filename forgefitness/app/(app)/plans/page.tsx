import { ArrowRight, CheckCircle2 } from "lucide-react";
import { workoutPlans } from "@/lib/mock-data";

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
          Workout plans
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              Structured training templates
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Start with opinionated plans and later connect them to Supabase for
              user-created programming, saved sessions, and progress analytics.
            </p>
          </div>
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Create custom plan
          </button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        {workoutPlans.map((plan) => (
          <article
            key={plan.id}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{plan.level}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {plan.name}
                </h3>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                {plan.schedule}
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              {plan.description}
            </p>

            <div className="mt-6 space-y-3">
              {plan.focus.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>

            <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
              Open plan details
              <ArrowRight className="h-4 w-4" />
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
