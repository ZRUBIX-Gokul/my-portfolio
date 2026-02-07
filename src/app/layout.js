"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { TicketProvider } from "@/context/TicketContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { PortalUserProvider, usePortalUsers } from "@/context/PortalUserContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <title>Ticketing System</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-black dark:text-white`}
      >
        <AuthProvider>
          <SettingsProvider>
            <TicketProvider>
              <PortalUserProvider>
                <AppContent>{children}</AppContent>
              </PortalUserProvider>
            </TicketProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

function AppContent({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const { getUserModules, isLoaded: portalLoaded } = usePortalUsers();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== "/login" && !pathname.startsWith("/portal/setup")) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, pathname, router]);

  // Route guarding for Portal Users
  useEffect(() => {
    if (!loading && portalLoaded && isAuthenticated && user?.isPortalUser) {
      // Don't guard public or setup routes
      if (pathname === "/login" || pathname.startsWith("/portal/setup")) return;

      const allowedModules = getUserModules(user.id);
      
      // Check if current pathname is allowed
      const isAllowed = allowedModules.some(module => {
        if (module.exact) {
          return module.route === pathname;
        }
        return pathname.startsWith(module.route) && module.route !== "/";
      });

      // Special case for dashboard: if "/" is not explicitly allowed, check if any other module is allowed
      if (pathname === "/" && !isAllowed && allowedModules.length > 0) {
        // Redirect to the first allowed module
        router.replace(allowedModules[0].route);
        return;
      }

      // If not allowed and not already redirecting from dashboard
      if (!isAllowed && pathname !== "/") {
         // Redirect to dashboard (which will then redirect to first allowed if needed) or login
         router.replace("/");
      }
    }
  }, [pathname, user, isAuthenticated, loading, portalLoaded, getUserModules, router]);

  // Handle protected routes
  if (loading || (isAuthenticated && user?.isPortalUser && !portalLoaded)) return null;

  if (!isAuthenticated && pathname !== "/login" && !pathname.startsWith("/portal/setup")) {
    return null; // Will redirect via useEffect
  }

  // If on login page or portal setup, just show the page without sidebar
  if (pathname === "/login" || pathname === "/portal/setup" || pathname.startsWith("/portal/setup")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[var(--user-bg-color)] dark:bg-zinc-950 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8 transition-all duration-300 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
