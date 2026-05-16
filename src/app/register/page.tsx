import RegisterForm from "@/components/auth/RegisterForm";
import { Rss } from "lucide-react";

export default function RegisterPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-secondary)",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              width: 80, height: 80,
              borderRadius: 20,
              background: "var(--color-accent)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
              boxShadow: "var(--shadow-md)",
            }}
          >
            <Rss size={40} color="white" />
          </div>
          <h1 className="text-large-title" style={{ color: "var(--color-label)", marginBottom: 8 }}>
            RSS Reader
          </h1>
          <p className="text-subheadline" style={{ color: "var(--color-label-secondary)" }}>
            Utwórz nowe konto
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--color-bg-primary)",
            borderRadius: "var(--radius-xl)",
            padding: 28,
            boxShadow: "var(--shadow-md)",
          }}
        >
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
