// apps/web/app/(protected)/layout.tsx

import localFont from "next/font/local";
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar";
import { AppSidebar, FloatingSidebarTrigger } from "~/components/layout/app-sidebar";

const latin = localFont({
  src: "../fonts/linter.woff2",
  weight: "400",
  style: "normal",
  variable: "--latin",
});

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${latin.variable} ${latin.className}`}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="relative">
          <FloatingSidebarTrigger />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
