"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("INVALID CREDENTIALS");
      } else {
        toast.success("SESSION INITIALIZED");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("SYSTEM ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0b1326",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background blobs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "25%",
            width: "384px",
            height: "384px",
            backgroundColor: "#8083ff",
            borderRadius: "50%",
            filter: "blur(120px)",
            opacity: 0.2,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "25%",
            right: "25%",
            width: "500px",
            height: "500px",
            backgroundColor: "#ddb7ff",
            borderRadius: "50%",
            filter: "blur(150px)",
            opacity: 0.15,
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "440px",
          padding: "0 16px",
        }}
        className="fade-in"
      >
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1
            style={{
              fontFamily: "Space Grotesk",
              fontWeight: 700,
              fontSize: "48px",
              letterSpacing: "-0.02em",
              color: "#dae2fd",
              lineHeight: 1,
              marginBottom: "8px",
            }}
          >
            Neon<span style={{ color: "#34D399" }}>Notes</span>
          </h1>
          <p
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.1em",
              color: "#c7c4d7",
              textTransform: "uppercase",
            }}
          >
            Secure Access
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: "rgba(30,41,59,0.7)",
            backdropFilter: "blur(20px)",
            border: "2px solid #ffffff",
            padding: "32px",
            boxShadow: "8px 8px 0 0 #4edea3",
            transition: "box-shadow 0.3s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "12px 12px 0 0 #D946EF";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "8px 8px 0 0 #4edea3";
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label
                htmlFor="email"
                style={{ fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#dae2fd" }}
              >
                Email
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                placeholder="you@domain.com"
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  borderBottom: errors.email ? "2px solid #ffb4ab" : "2px solid #ffffff",
                  paddingBottom: "8px",
                  color: "#dae2fd",
                  fontFamily: "Inter",
                  fontSize: "16px",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => {
                  if (!errors.email) (e.target as HTMLElement).style.borderBottomColor = "#34D399";
                }}
                onBlur={(e) => {
                  if (!errors.email) (e.target as HTMLElement).style.borderBottomColor = "#ffffff";
                }}
              />
              {errors.email && (
                <span style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#ffb4ab", letterSpacing: "0.05em" }}>
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label
                  htmlFor="password"
                  style={{ fontFamily: "JetBrains Mono", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#dae2fd" }}
                >
                  Password
                </label>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  {...register("password")}
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    borderBottom: errors.password ? "2px solid #ffb4ab" : "2px solid #ffffff",
                    paddingBottom: "8px",
                    paddingRight: "32px",
                    color: "#dae2fd",
                    fontFamily: "Inter",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => {
                    if (!errors.password) (e.target as HTMLElement).style.borderBottomColor = "#34D399";
                  }}
                  onBlur={(e) => {
                    if (!errors.password) (e.target as HTMLElement).style.borderBottomColor = "#ffffff";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    transform: "translateY(-60%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#908fa0",
                    display: "flex",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    {showPwd ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.password && (
                <span style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#ffb4ab", letterSpacing: "0.05em" }}>
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                backgroundColor: "#D946EF",
                color: "#dae2fd",
                fontFamily: "JetBrains Mono",
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "16px",
                border: "2px solid #ffffff",
                boxShadow: "4px 4px 0 0 #4edea3",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "8px",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.transform = "translate(2px, 2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "2px 2px 0 0 #4edea3";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translate(0, 0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0 0 #4edea3";
              }}
            >
              {loading ? (
                <span className="material-symbols-outlined" style={{ fontSize: "16px", animation: "spin 1s linear infinite" }}>
                  progress_activity
                </span>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>login</span>
              )}
              {loading ? "INITIALIZING..." : "Initialize Session"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "24px 0" }}>
            <div style={{ flex: 1, height: "2px", backgroundColor: "#2d3449" }} />
            <span style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#464554", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Or
            </span>
            <div style={{ flex: 1, height: "2px", backgroundColor: "#2d3449" }} />
          </div>

          {/* Register link */}
          <p style={{ textAlign: "center", fontFamily: "JetBrains Mono", fontSize: "11px", color: "#908fa0", letterSpacing: "0.05em" }}>
            No account?{" "}
            <Link
              href="/register"
              style={{ color: "#34D399", textDecoration: "none", transition: "color 0.15s" }}
            >
              REGISTER NOW →
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #464554; }
      `}</style>
    </main>
  );
}
