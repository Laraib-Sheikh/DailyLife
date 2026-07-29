"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : session?.user?.email?.[0].toUpperCase() ?? "U";

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ callbackUrl: "/login" });
  };

  const cardBase: React.CSSProperties = {
    backgroundColor: "rgba(30,41,59,0.7)",
    backdropFilter: "blur(20px)",
    border: "2px solid #ffffff",
    padding: "24px",
  };

  return (
    <div className="fade-in" style={{ maxWidth: "720px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ borderBottom: "2px solid #ffffff", paddingBottom: "16px", marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "clamp(32px,5vw,48px)", letterSpacing: "-0.02em", color: "#dae2fd", textTransform: "uppercase" }}>
          Settings
        </h1>
        <p style={{ fontFamily: "Inter", fontSize: "16px", color: "#908fa0", marginTop: "4px" }}>
          Manage your account
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Profile */}
        <div style={cardBase}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "2px solid rgba(255,255,255,0.1)", paddingBottom: "16px", marginBottom: "20px" }}>
            <span className="material-symbols-outlined" style={{ color: "#D946EF", fontSize: "18px" }}>person</span>
            <h2 style={{ fontFamily: "JetBrains Mono", fontSize: "12px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#dae2fd" }}>Profile</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "64px", height: "64px",
                backgroundColor: "#D946EF",
                border: "2px solid #ffffff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "JetBrains Mono", fontSize: "20px", fontWeight: 700, color: "#ffffff",
                flexShrink: 0,
                boxShadow: "4px 4px 0 0 #34D399",
              }}
            >
              {initials}
            </div>
            <div>
              <p style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: "20px", color: "#dae2fd" }}>
                {session?.user?.name ?? "User"}
              </p>
              <p style={{ fontFamily: "JetBrains Mono", fontSize: "12px", color: "#908fa0", marginTop: "4px", letterSpacing: "0.05em" }}>
                {session?.user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Account */}
        <div style={cardBase}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "2px solid rgba(255,255,255,0.1)", paddingBottom: "16px", marginBottom: "20px" }}>
            <span className="material-symbols-outlined" style={{ color: "#34D399", fontSize: "18px" }}>shield</span>
            <h2 style={{ fontFamily: "JetBrains Mono", fontSize: "12px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#dae2fd" }}>Account</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", backgroundColor: "rgba(6,14,32,0.5)", border: "2px solid rgba(255,255,255,0.1)" }}>
              <div>
                <p style={{ fontFamily: "JetBrains Mono", fontSize: "12px", color: "#dae2fd", letterSpacing: "0.05em" }}>Session Status</p>
                <p style={{ fontFamily: "Inter", fontSize: "13px", color: "#908fa0", marginTop: "2px" }}>You are currently signed in</p>
              </div>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: "10px", padding: "4px 10px", backgroundColor: "rgba(52,211,153,0.1)", border: "2px solid #34D399", color: "#34D399", letterSpacing: "0.08em" }}>
                ACTIVE
              </span>
            </div>
            <button
              onClick={() => toast("Password change coming soon!", { icon: "🚧" })}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px", backgroundColor: "rgba(6,14,32,0.5)",
                border: "2px solid rgba(255,255,255,0.1)", cursor: "pointer",
                transition: "all 0.15s", textAlign: "left",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#c0c1ff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              <div>
                <p style={{ fontFamily: "JetBrains Mono", fontSize: "12px", color: "#dae2fd", letterSpacing: "0.05em" }}>Change Password</p>
                <p style={{ fontFamily: "Inter", fontSize: "13px", color: "#908fa0", marginTop: "2px" }}>Update your login credentials</p>
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#908fa0" }}>arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <div style={{ ...cardBase, borderColor: "rgba(255,180,171,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "2px solid rgba(255,180,171,0.2)", paddingBottom: "16px", marginBottom: "20px" }}>
            <span className="material-symbols-outlined" style={{ color: "#ffb4ab", fontSize: "18px" }}>logout</span>
            <h2 style={{ fontFamily: "JetBrains Mono", fontSize: "12px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ffb4ab" }}>Danger Zone</h2>
          </div>
          <p style={{ fontFamily: "Inter", fontSize: "14px", color: "#908fa0", marginBottom: "16px" }}>
            You&apos;ll be redirected to the login page after signing out.
          </p>
          <button
            onClick={handleSignOut}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "12px 24px", backgroundColor: "rgba(255,180,171,0.1)",
              border: "2px solid rgba(255,180,171,0.4)", color: "#ffb4ab",
              fontFamily: "JetBrains Mono", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0 0 #ffb4ab"; (e.currentTarget as HTMLElement).style.transform = "translate(-2px,-2px)"; } }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "translate(0,0)"; }}
          >
            {loading
              ? <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>progress_activity</span>
              : <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>logout</span>
            }
            {loading ? "SIGNING OUT..." : "Sign Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
