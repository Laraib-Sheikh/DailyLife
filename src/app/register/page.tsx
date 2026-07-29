"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

const registerSchema = z
  .object({
    name: z.string().min(2, "Min 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: hasError ? "2px solid #ffb4ab" : "2px solid #ffffff",
  paddingBottom: "8px",
  color: "#dae2fd",
  fontFamily: "Inter",
  fontSize: "16px",
  outline: "none",
  transition: "border-color 0.15s",
});

const labelStyle: React.CSSProperties = {
  fontFamily: "JetBrains Mono",
  fontSize: "11px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#dae2fd",
};

export default function RegisterPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error?.toUpperCase() || "REGISTRATION FAILED");
      } else {
        toast.success("ACCOUNT CREATED");
        router.push("/login");
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
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "20%", right: "20%", width: "384px", height: "384px", backgroundColor: "#D946EF", borderRadius: "50%", filter: "blur(120px)", opacity: 0.1 }} />
        <div style={{ position: "absolute", bottom: "20%", left: "20%", width: "400px", height: "400px", backgroundColor: "#34D399", borderRadius: "50%", filter: "blur(130px)", opacity: 0.08 }} />
      </div>

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "440px", padding: "0 16px" }} className="fade-in">
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontSize: "48px", letterSpacing: "-0.02em", color: "#dae2fd", lineHeight: 1, marginBottom: "8px" }}>
            Neon<span style={{ color: "#34D399" }}>Notes</span>
          </h1>
          <p style={{ fontFamily: "JetBrains Mono", fontSize: "12px", letterSpacing: "0.1em", color: "#c7c4d7", textTransform: "uppercase" }}>
            Create Account
          </p>
        </div>

        <div
          style={{
            backgroundColor: "rgba(30,41,59,0.7)",
            backdropFilter: "blur(20px)",
            border: "2px solid #ffffff",
            padding: "32px",
            boxShadow: "8px 8px 0 0 #4edea3",
            transition: "box-shadow 0.3s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "12px 12px 0 0 #D946EF"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "8px 8px 0 0 #4edea3"; }}
        >
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label htmlFor="name" style={labelStyle}>Full Name</label>
              <input {...register("name")} id="name" type="text" placeholder="John Doe" style={inputStyle(!!errors.name)}
                onFocus={(e) => { if (!errors.name) (e.target as HTMLElement).style.borderBottomColor = "#34D399"; }}
                onBlur={(e) => { if (!errors.name) (e.target as HTMLElement).style.borderBottomColor = "#ffffff"; }}
              />
              {errors.name && <span style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#ffb4ab" }}>{errors.name.message}</span>}
            </div>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label htmlFor="email" style={labelStyle}>Email</label>
              <input {...register("email")} id="email" type="email" placeholder="you@domain.com" style={inputStyle(!!errors.email)}
                onFocus={(e) => { if (!errors.email) (e.target as HTMLElement).style.borderBottomColor = "#34D399"; }}
                onBlur={(e) => { if (!errors.email) (e.target as HTMLElement).style.borderBottomColor = "#ffffff"; }}
              />
              {errors.email && <span style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#ffb4ab" }}>{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label htmlFor="password" style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input {...register("password")} id="password" type={showPwd ? "text" : "password"} placeholder="••••••••" style={{ ...inputStyle(!!errors.password), paddingRight: "32px" }}
                  onFocus={(e) => { if (!errors.password) (e.target as HTMLElement).style.borderBottomColor = "#34D399"; }}
                  onBlur={(e) => { if (!errors.password) (e.target as HTMLElement).style.borderBottomColor = "#ffffff"; }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-60%)", background: "none", border: "none", cursor: "pointer", color: "#908fa0", display: "flex" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{showPwd ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
              {errors.password && <span style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#ffb4ab" }}>{errors.password.message}</span>}
            </div>

            {/* Confirm */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</label>
              <input {...register("confirmPassword")} id="confirmPassword" type={showPwd ? "text" : "password"} placeholder="••••••••" style={inputStyle(!!errors.confirmPassword)}
                onFocus={(e) => { if (!errors.confirmPassword) (e.target as HTMLElement).style.borderBottomColor = "#34D399"; }}
                onBlur={(e) => { if (!errors.confirmPassword) (e.target as HTMLElement).style.borderBottomColor = "#ffffff"; }}
              />
              {errors.confirmPassword && <span style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#ffb4ab" }}>{errors.confirmPassword.message}</span>}
            </div>

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
              onMouseEnter={(e) => { if (!loading) { (e.currentTarget as HTMLElement).style.transform = "translate(2px, 2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "2px 2px 0 0 #4edea3"; } }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translate(0,0)"; (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0 0 #4edea3"; }}
            >
              {loading
                ? <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>progress_activity</span>
                : <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>person_add</span>
              }
              {loading ? "CREATING..." : "Create Account"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "24px 0 16px" }}>
            <div style={{ flex: 1, height: "2px", backgroundColor: "#2d3449" }} />
            <span style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#464554", letterSpacing: "0.05em", textTransform: "uppercase" }}>Or</span>
            <div style={{ flex: 1, height: "2px", backgroundColor: "#2d3449" }} />
          </div>

          <p style={{ textAlign: "center", fontFamily: "JetBrains Mono", fontSize: "11px", color: "#908fa0", letterSpacing: "0.05em" }}>
            Have an account?{" "}
            <Link href="/login" style={{ color: "#34D399", textDecoration: "none" }}>SIGN IN →</Link>
          </p>
        </div>
      </div>

      <style>{`input::placeholder { color: #464554; }`}</style>
    </main>
  );
}
