"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export function AppShell({ children }) {
  const pathname = usePathname();
  // list of simple pages that don't need the dashboard layout
  const isAuthPage = pathname.startsWith("/login");

  if (isAuthPage) {
      return (
        <main className="w-full min-h-screen bg-[#0d0e12]">
            {children}
        </main>
      );
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full max-w-[100vw] overflow-x-hidden">
        <Header />
        <main className="flex-1 p-6 md:p-8 pt-6">
          {children}
        </main>
      </div>
    </>
  );
}
