"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface SidebarProps {
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

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? "U";

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-full flex-col"
      style={{
        width: "288px",
        backgroundColor: "#131b2e",
        borderRight: "2px solid #ffffff",
        zIndex: 50,
        paddingTop: "80px",
      }}
    >
      <nav className="flex-1 px-4 space-y-2 pt-6">
        {navItems.map(({ href, path, label, icon }) => {
          const isActive =
            path === "dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 24px",
                border: "2px solid transparent",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "all 0.15s ease",
                ...(isActive
                  ? {
                      backgroundColor: "#D946EF",
                      color: "#ffffff",
                      boxShadow: "4px 4px 0px 0px #34D399",
                    }
                  : {
                      color: "#c7c4d7",
                    }),
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.borderColor = "#ffffff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                }
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

      {/* User Section */}
      <div
        style={{
          padding: "16px",
          borderTop: "2px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
            backgroundColor: "rgba(30,41,59,0.5)",
            border: "2px solid rgba(255,255,255,0.15)",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              backgroundColor: "#D946EF",
              border: "2px solid #ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontFamily: "JetBrains Mono",
              fontSize: "12px",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: "JetBrains Mono",
                fontSize: "11px",
                fontWeight: 500,
                color: "#dae2fd",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                letterSpacing: "0.05em",
              }}
            >
              {user.name || "USER"}
            </p>
            <p
              style={{
                fontFamily: "JetBrains Mono",
                fontSize: "10px",
                color: "#908fa0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#908fa0",
              display: "flex",
              alignItems: "center",
              padding: "4px",
              transition: "color 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#ffb4ab";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#908fa0";
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
