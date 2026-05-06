"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Mail, Shield, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!configured) {
      setState("error");
      setMessage("Supabase ainda não está configurado neste ambiente.");
      return;
    }

    setState("loading");
    setMessage(null);

    try {
      const supabase = createClient();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
        router.replace(next);
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      setState("success");
      setMessage("Conta criada. Confirme o email se o Supabase exigir verificação.");
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir o acesso. Tente novamente.",
      );
    }
  }

  async function handleGoogle() {
    if (!configured) {
      setState("error");
      setMessage("Supabase ainda não está configurado neste ambiente.");
      return;
    }

    setState("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setState("error");
      setMessage(error.message);
    }
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">{mode === "login" ? "Acesso protegido" : "Criar conta"}</p>
      <h1>{mode === "login" ? "Entre no cockpit" : "Ative o seu radar"}</h1>
      <p className="auth-copy">
        {mode === "login"
          ? "Login obrigatório para controlar quota, histórico e assinatura."
          : "Comece com 5 pesquisas grátis por dia e desbloqueie ilimitado quando precisar."}
      </p>

      <button className="oauth-button" onClick={handleGoogle} type="button">
        <Shield size={18} />
        Continuar com Google
      </button>

      <div className="divider">ou</div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <label>
            <span>Nome</span>
            <input
              autoComplete="name"
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Rodrigo"
              value={fullName}
            />
          </label>
        )}
        <label>
          <span>Email</span>
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@empresa.com"
            required
            type="email"
            value={email}
          />
        </label>
        <label>
          <span>Senha</span>
          <input
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo 8 caracteres"
            required
            type="password"
            value={password}
          />
        </label>

        {message && (
          <p className={`form-message ${state === "error" ? "error" : "success"}`}>
            {message}
          </p>
        )}

        <button className="primary-button" disabled={state === "loading"} type="submit">
          {mode === "login" ? <Mail size={18} /> : <UserPlus size={18} />}
          {state === "loading"
            ? "A processar"
            : mode === "login"
              ? "Entrar"
              : "Criar conta"}
          <ArrowRight size={18} />
        </button>
      </form>

      <p className="auth-switch">
        {mode === "login" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
        <Link href={mode === "login" ? "/signup" : "/login"}>
          {mode === "login" ? "Criar conta" : "Entrar"}
        </Link>
      </p>
    </section>
  );
}
