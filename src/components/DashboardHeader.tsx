"use client";

import { useState } from "react";

export default function DashboardHeader() {
  const [search, setSearch] = useState("");

  return (
    <header
      className="hidden md:flex"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "80px",
        background: "rgba(30,41,59,0.7)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "2px solid #ffffff",
        zIndex: 40,
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          className="material-symbols-outlined"
          style={{ color: "#D946EF", fontSize: "28px" }}
        >
          note_stack
        </span>
        <span
          style={{
            fontFamily: "Space Grotesk",
            fontWeight: 700,
            fontSize: "22px",
            letterSpacing: "-0.02em",
            color: "#dae2fd",
          }}
        >
          NEON<span style={{ color: "#34D399" }}>NOTES</span>
        </span>
      </div>

      {/* Search + Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            backgroundColor: "#222a3d",
            border: "2px solid #ffffff",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ color: "#34D399", fontSize: "18px" }}
          >
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SYSTEM SEARCH..."
            style={{
              background: "none",
              border: "none",
              outline: "none",
              color: "#dae2fd",
              fontFamily: "JetBrains Mono",
              fontSize: "12px",
              letterSpacing: "0.05em",
              width: "180px",
            }}
          />
        </div>
        <div
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "#c0c1ff",
            border: "2px solid #ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0px 0px #D946EF";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ color: "#1000a9", fontSize: "20px" }}
          >
            person
          </span>
        </div>
      </div>
    </header>
  );
}
