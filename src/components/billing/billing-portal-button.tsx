"use client";

import { useState } from "react";
import { ArrowUpRight, Loader2 } from "lucide-react";

export function BillingPortalButton() {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function openPortal() {
    setState("loading");
    setMessage(null);

    const response = await fetch("/api/billing/portal", { method: "POST" });
    const payload = (await response.json()) as { url?: string; message?: string; code?: string };

    if (payload.url) {
      window.location.assign(payload.url);
      return;
    }

    setState("error");
    setMessage(payload.message ?? "Portal indisponível. Crie uma assinatura primeiro.");
  }

  return (
    <div className="billing-portal-action">
      <button className="secondary-button" disabled={state === "loading"} onClick={openPortal} type="button">
        {state === "loading" ? <Loader2 className="spin" size={17} /> : null}
        Portal do cliente
        <ArrowUpRight size={16} />
      </button>
      {message && (
        <p aria-live="polite" className="form-message error">
          {message}
        </p>
      )}
    </div>
  );
}
