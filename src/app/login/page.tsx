import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { SkyLogo } from "@/components/brand/sky-logo";

export default function LoginPage() {
  return (
    <main className="auth-screen">
      <Link className="auth-logo-link" href="/">
        <SkyLogo />
      </Link>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </main>
  );
}
