"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { login, resetPassword } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  function openReset() {
    setResetEmail(email);
    setResetError("");
    setResetSent(false);
    setShowReset(true);
  }

  function closeReset() {
    setShowReset(false);
    setResetError("");
    setResetSent(false);
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setResetError("");
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/user-not-found") {
        setResetError("Nie znaleziono konta z tym adresem.");
      } else if (code === "auth/invalid-email") {
        setResetError("Nieprawidłowy adres email.");
      } else {
        setResetError("Błąd wysyłania. Spróbuj ponownie.");
      }
    } finally {
      setResetLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      document.cookie = "session=1; path=/; max-age=2592000; SameSite=Strict";
      router.replace("/reader");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setError("Nieprawidłowy email lub hasło.");
      } else if (code === "auth/operation-not-allowed") {
        setError("Logowanie emailem nie jest włączone.");
      } else {
        setError((err as Error)?.message ?? "Błąd logowania.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <label
          className="text-footnote"
          style={{ display: "block", marginBottom: 6, color: "var(--color-label-secondary)", fontWeight: 500 }}
        >
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="adres@email.com"
          required
          className="input"
        />
      </div>

      <div>
        <label
          className="text-footnote"
          style={{ display: "block", marginBottom: 6, color: "var(--color-label-secondary)", fontWeight: 500 }}
        >
          Hasło
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Hasło"
            required
            className="input"
            style={{ paddingRight: 48 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            style={{
              position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: "var(--color-label-tertiary)",
              display: "flex", alignItems: "center",
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <button
          type="button"
          className="btn-ghost"
          style={{ fontSize: 14, padding: "2px 6px" }}
          onClick={openReset}
        >
          Zapomniałeś hasła?
        </button>
      </div>

      {error && (
        <p
          className="text-footnote"
          style={{
            color: "var(--color-accent-red)",
            background: "rgba(255,59,48,0.08)",
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
          }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
        style={{ width: "100%", marginTop: 8 }}
      >
        {loading ? "Logowanie…" : "Zaloguj się"}
      </button>

      <p className="text-subheadline text-center" style={{ color: "var(--color-label-secondary)", marginTop: 4 }}>
        Nie masz konta?{" "}
        <Link
          href="/register"
          style={{ color: "var(--color-accent)", fontWeight: 500, textDecoration: "none" }}
        >
          Zarejestruj się
        </Link>
      </p>

      {showReset && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeReset(); }}
        >
          <div className="modal modal-enter">
            <h2 className="text-title3" style={{ marginBottom: 8 }}>Odzyskaj hasło</h2>
            <p className="text-subheadline" style={{ color: "var(--color-label-secondary)", marginBottom: 20 }}>
              Wpisz adres email powiązany z kontem. Wyślemy link do resetowania hasła.
            </p>

            {resetSent ? (
              <>
                <p
                  className="text-footnote"
                  style={{
                    color: "var(--color-accent-green)",
                    background: "rgba(52,199,89,0.10)",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    marginBottom: 16,
                  }}
                >
                  Sprawdź skrzynkę email — wysłaliśmy link do resetowania hasła.
                </p>
                <button type="button" className="btn-primary" style={{ width: "100%" }} onClick={closeReset}>
                  Zamknij
                </button>
              </>
            ) : (
              <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="adres@email.com"
                  required
                  className="input"
                  autoFocus
                />
                {resetError && (
                  <p
                    className="text-footnote"
                    style={{
                      color: "var(--color-accent-red)",
                      background: "rgba(255,59,48,0.08)",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    {resetError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={resetLoading || !resetEmail}
                  className="btn-primary"
                  style={{ width: "100%" }}
                >
                  {resetLoading ? "Wysyłanie…" : "Wyślij link"}
                </button>
                <button type="button" className="btn-secondary" style={{ width: "100%" }} onClick={closeReset}>
                  Anuluj
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
