"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { register } from "@/lib/auth";

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password);
      document.cookie = "session=1; path=/; max-age=2592000; SameSite=Strict";
      router.replace("/reader");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd rejestracji.");
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
          <span style={{ color: "var(--color-label-tertiary)", fontWeight: 400, marginLeft: 8 }}>
            (min. 6 znaków)
          </span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Hasło"
            required
            minLength={6}
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
        {loading ? "Rejestracja…" : "Zarejestruj się"}
      </button>

      <p className="text-subheadline text-center" style={{ color: "var(--color-label-secondary)", marginTop: 4 }}>
        Masz już konto?{" "}
        <Link
          href="/login"
          style={{ color: "var(--color-accent)", fontWeight: 500, textDecoration: "none" }}
        >
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}
