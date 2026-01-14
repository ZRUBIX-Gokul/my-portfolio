"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [fontFamily, setFontFamily] = useState("'Geist Sans', sans-serif");
  const [backgroundColor, setBackgroundColor] = useState("#f9fafb");
  const [sidebarLayout, setSidebarLayout] = useState([
    { id: "entry", name: "Ticket Entry Form", href: "/tickets/new", type: "form" },
    { id: "it", name: "IT Ticket Report", href: "/reports/it", type: "report" },
    { id: "maintenance", name: "Maintenance Ticket Report", href: "/reports/maintenance", type: "report" },
    { id: "requested", name: "Requested Tickets Report", href: "/reports/requested", type: "report" },
    { id: "assigned", name: "Assigned Tickets Report", href: "/reports/assigned", type: "report" },
    { id: "completed", name: "Completed Tickets Report", href: "/reports/completed", type: "report" },
    { id: "closed", name: "Closed Tickets Report", href: "/reports/closed", type: "report" },
    { id: "total", name: "Total Tickets Report", href: "/tickets", type: "report" },
  ]);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("app_settings");
    const defaultLayout = [
      { id: "entry", name: "Ticket Entry Form", href: "/tickets/new", type: "form" },
      { id: "it", name: "IT Ticket Report", href: "/reports/it", type: "report" },
      { id: "maintenance", name: "Maintenance Ticket Report", href: "/reports/maintenance", type: "report" },
      { id: "requested", name: "Requested Tickets Report", href: "/reports/requested", type: "report" },
      { id: "assigned", name: "Assigned Tickets Report", href: "/reports/assigned", type: "report" },
      { id: "completed", name: "Completed Tickets Report", href: "/reports/completed", type: "report" },
      { id: "closed", name: "Closed Tickets Report", href: "/reports/closed", type: "report" },
      { id: "total", name: "Total Tickets Report", href: "/tickets", type: "report" },
    ];

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.fontFamily) setFontFamily(parsed.fontFamily);
        if (parsed.backgroundColor) setBackgroundColor(parsed.backgroundColor);
        
        // Merge saved layout with default layout to ensure new items (like 'closed') are added
        if (parsed.sidebarLayout) {
          const currentLayout = parsed.sidebarLayout.filter(i => i.id !== "edp");
          
          // Find items in defaultLayout that are missing from currentLayout
          const missingItems = defaultLayout.filter(
            defItem => !currentLayout.some(curItem => curItem.id === defItem.id)
          );
          
          setSidebarLayout([...currentLayout, ...missingItems]);
        } else {
          setSidebarLayout(defaultLayout);
        }
      } catch (e) {
        console.error("Failed to parse settings", e);
        setSidebarLayout(defaultLayout);
      }
    } else {
      setSidebarLayout(defaultLayout);
    }
    setMounted(true);
  }, []);

  // Save to localStorage when settings change AFTER initial mount
  useEffect(() => {
    if (!mounted) return;
    const settings = { theme, fontFamily, backgroundColor, sidebarLayout };
    localStorage.setItem("app_settings", JSON.stringify(settings));
  }, [theme, fontFamily, backgroundColor, sidebarLayout, mounted]);

  const value = {
    theme,
    setTheme,
    fontFamily,
    setFontFamily,
    backgroundColor,
    setBackgroundColor,
    sidebarLayout,
    setSidebarLayout,
    mounted // Useful for child components to know if they can use settings safely
  };

  return (
    <SettingsContext.Provider value={value}>
      <div 
        style={{ 
          "--user-font-family": mounted ? fontFamily : "'Geist Sans', sans-serif", 
          "--user-bg-color": mounted ? backgroundColor : "#f9fafb",
          fontFamily: "var(--user-font-family)" 
        }}
        className={mounted && theme === "dark" ? "dark" : ""}
      >
        {children}
      </div>
    </SettingsContext.Provider>
  );
};
