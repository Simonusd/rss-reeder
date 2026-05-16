"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  message, confirmLabel = "Usuń", onConfirm, onCancel,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="modal-overlay fixed inset-0 z-[10000] flex items-center justify-center"
      onClick={onCancel}
    >
      <div
        className="modal modal-enter"
        style={{ maxWidth: 360 }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          className="text-body mb-6"
          style={{ color: "var(--color-label)", textAlign: "center" }}
        >
          {message}
        </p>
        <div
          style={{
            borderTop: "1px solid var(--color-separator)",
            display: "flex",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "14px",
              fontSize: 17,
              fontWeight: 400,
              color: "var(--color-accent)",
              background: "transparent",
              border: "none",
              borderRight: "1px solid var(--color-separator)",
              cursor: "pointer",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            Anuluj
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "14px",
              fontSize: 17,
              fontWeight: 600,
              color: "var(--color-accent-red)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,59,48,0.06)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
