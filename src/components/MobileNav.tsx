"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface MobileNavProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

const navItems = [
  { href: "/dashboard", path: "dashboard", label: "All Notes", icon: "description" },
  { href: "/dashboard/reminders", path: "reminders", label: "Reminders", icon: "notifications_active" },
  { href: "/dashboard/tags", path: "tags", label: "Tags", icon: "sell" },
  { href: "/dashboard/settings", path: "settings", label: "Settings", icon: "settings" },
];

export default function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? "U";

  return (
    <>
      {/* Top Header */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between"
        style={{
          height: "64px",
          padding: "0 16px",
          background: "rgba(30,41,59,0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "2px solid #ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            className="material-symbols-outlined"
            style={{ color: "#D946EF", fontSize: "24px" }}
          >
            note_stack
          </span>
          <span
            style={{
              fontFamily: "Space Grotesk",
              fontWeight: 700,
              fontSize: "18px",
              letterSpacing: "-0.02em",
              color: "#dae2fd",
            }}
          >
            NEON<span style={{ color: "#34D399" }}>NOTES</span>
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          style={{
            background: "none",
            border: "2px solid #ffffff",
            padding: "6px",
            cursor: "pointer",
            color: "#dae2fd",
            display: "flex",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            menu
          </span>
        </button>
      </header>

      {/* Drawer */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          onClick={() => setOpen(false)}
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <div
            style={{
              width: "288px",
              height: "100%",
              backgroundColor: "#131b2e",
              borderRight: "2px solid #ffffff",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 16px",
                borderBottom: "2px solid rgba(255,255,255,0.1)",
              }}
            >
              <span
                style={{
                  fontFamily: "Space Grotesk",
                  fontWeight: 700,
                  fontSize: "18px",
                  color: "#dae2fd",
                  letterSpacing: "-0.02em",
                }}
              >
                NEON<span style={{ color: "#34D399" }}>NOTES</span>
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "2px solid rgba(255,255,255,0.3)",
                  padding: "4px",
                  cursor: "pointer",
                  color: "#dae2fd",
                  display: "flex",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  close
                </span>
              </button>
            </div>

            <nav style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {navItems.map(({ href, path, label, icon }) => {
                const isActive =
                  path === "dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 20px",
                      border: "2px solid transparent",
                      fontFamily: "JetBrains Mono",
                      fontSize: "12px",
                      fontWeight: 500,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                      ...(isActive
                        ? { backgroundColor: "#D946EF", color: "#fff", boxShadow: "4px 4px 0 0 #34D399" }
                        : { color: "#c7c4d7", borderColor: "transparent" }),
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                      {icon}
                    </span>
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div style={{ padding: "16px", borderTop: "2px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: "#D946EF",
                    border: "2px solid #fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "JetBrains Mono",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#dae2fd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.name || "USER"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px",
                  border: "2px solid rgba(255,180,171,0.3)",
                  backgroundColor: "transparent",
                  color: "#ffb4ab",
                  fontFamily: "JetBrains Mono",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
