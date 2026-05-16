"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface MenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface Props {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!mounted) return null;

  const top = Math.min(y, window.innerHeight - items.length * 36 - 16);
  const left = Math.min(x, window.innerWidth - 180);

  return createPortal(
    <div
      ref={ref}
      style={{
        position: "fixed",
        top,
        left,
        zIndex: 9999,
        background: "var(--color-material-thick)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-separator)",
        boxShadow: "var(--shadow-md)",
        padding: "4px 0",
        minWidth: 160,
        animation: "modalIn 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {items.map((item, i) => (
        <button
          key={item.label}
          onClick={() => { item.onClick(); onClose(); }}
          style={{
            width: "100%",
            textAlign: "left",
            padding: "8px 16px",
            fontSize: 14,
            color: item.danger ? "var(--color-accent-red)" : "var(--color-label)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            borderTop: i > 0 ? "1px solid var(--color-separator)" : "none",
            transition: "background 0.1s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.05)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          {item.label}
        </button>
      ))}
    </div>,
    document.body
  );
}
