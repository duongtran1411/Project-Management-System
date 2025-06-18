"use client";

import Footer from "@/components/homepage/Footer";
import Header from "@/components/homepage/Header";
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto bg-white">
        <Header />
        {children}
        <Footer />
      </div>
    </div>
  );
}
