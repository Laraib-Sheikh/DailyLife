import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import DashboardHeader from "@/components/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div style={{ backgroundColor: "#0b1326", minHeight: "100vh" }}>
      <Sidebar user={session.user} />
      <MobileNav user={session.user} />
      <DashboardHeader />

      {/* Main content area */}
      <div
        style={{
          paddingLeft: "288px",
          paddingTop: "80px",
        }}
        className="md-content"
      >
        <style>{`
          @media (max-width: 767px) {
            .md-content {
              padding-left: 0 !important;
              padding-top: 64px !important;
            }
          }
        `}</style>
        <main
          style={{
            padding: "32px 24px",
            minHeight: "calc(100vh - 80px)",
            position: "relative",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
