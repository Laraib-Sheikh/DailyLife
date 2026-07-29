import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "NeonNotes — Your Daily Notes",
  description: "Write your daily notes, set reminders, and stay organized.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&family=Space+Grotesk:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ backgroundColor: "#0b1326", color: "#dae2fd" }}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#131b2e",
                color: "#dae2fd",
                border: "2px solid #ffffff",
                borderRadius: "0",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "12px",
                letterSpacing: "0.05em",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
