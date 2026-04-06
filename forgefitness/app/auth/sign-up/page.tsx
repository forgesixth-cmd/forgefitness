import { AuthForm } from "@/components/auth/auth-form";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] px-4 py-12">
      <AuthForm mode="sign-up" />
    </main>
  );
}
