"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { TicketProvider } from "@/context/TicketContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
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
              <AppContent>{children}</AppContent>
            </TicketProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

function AppContent({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== "/login") {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, pathname, router]);

  // Handle protected routes
  if (loading) return null;

  if (!isAuthenticated && pathname !== "/login") {
    return null; // Will redirect via useEffect
  }

  // If on login page, just show the page without sidebar
  if (pathname === "/login") {
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
