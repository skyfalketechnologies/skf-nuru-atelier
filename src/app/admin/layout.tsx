"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) return <>{children}</>;

  return (
    <div className="min-h-screen">
      <AdminSidebar />
      <div className="md:pl-72">
        <div className="mx-auto max-w-7xl px-0">{children}</div>
      </div>
    </div>
  );
}

