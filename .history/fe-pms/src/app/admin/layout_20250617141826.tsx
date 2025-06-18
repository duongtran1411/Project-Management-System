import Sidebar from "@/components/common/layout/dashboard/Sidebar/Sidebar";
import SidebarNavAntD from "@/components/common/layout/dashboard/Sidebar/SidebarNav";
import Header from "@/components/common/layout/dashboard/Header/Header";
import Footer from "@/components/common/layout/dashboard/Footer/Footer";
import SidebarProvider from "@/components/common/layout/dashboard/SidebarProvider";
import SidebarOverlay from "@/components/common/layout/dashboard/Sidebar/SidebarOverlay";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarWidth = 250; // hoặc đúng width của Sidebar bạn

  return (
    <SidebarProvider>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{ width: sidebarWidth, flexShrink: 0 }}>
          <Sidebar>
            <SidebarNavAntD />
          </Sidebar>
        </div>
        <div style={{ flex: 1, background: "#f5f5f5" }}>
          <Header />
          <div
            style={{
              margin: 24,
              background: "#fff",
              borderRadius: 8,
              minHeight: 280,
              padding: 24,
            }}
          >
            {children}
          </div>
          <Footer />
        </div>
      </div>
      <SidebarOverlay />
    </SidebarProvider>
  );
}
