"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  ShoppingCart, 
  Settings, 
  CheckCircle,
  Menu,
  X,
  Activity,
  Monitor,
  Wrench,
  Brush,
  Users,
  LogOut,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { usePortalUsers } from "@/context/PortalUserContext";

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const { sidebarLayout } = useSettings();
  const { logout, user } = useAuth();
  const { getUserModules } = usePortalUsers();

  // Get allowed modules if user is a portal user
  const allowedModules = user?.isPortalUser ? getUserModules(user.id) : null;

  const iconMap = {
    entry: PlusCircle,
    it: Monitor,
    edp: ClipboardList,
    maintenance: Wrench,
    requested: Activity,
    assigned: Users,
    completed: ClipboardList,
    closed: CheckCircle,
    total: LayoutDashboard
  };

  const menuSections = [
    { category: "Main", items: [{ name: "Dashboard", href: "/", icon: LayoutDashboard }] },
    { category: "Record & Reports", items: sidebarLayout.map(item => ({
        name: item.name,
        href: item.href,
        icon: iconMap[item.id] || ClipboardList
    }))},
    { category: "Admin", items: [
        { name: "Users", href: "/users", icon: Users },
        { name: "Settings", href: "/settings", icon: Settings },
    ]}
  ];

  // Filter sections based on permissions
  const filteredSections = menuSections.map(section => {
    // If regular user (not portal), show everything
    if (!user?.isPortalUser) return section;

    // Filter items for portal users
    const filteredItems = section.items.filter(item => {
      // Check if item route is in allowed modules
      // Allowed modules is an array of module objects { route: "...", ... }
      return allowedModules.some(module => {
        // If module requires exact match (most do), check exact equality
        if (module.exact) {
          return module.route === item.href;
        }
        
        // precise match or sub-route match (e.g. /tickets/new matches /tickets/new)
        // Also handle the case where module.route is the base of item.href
        return module.route === item.href || (module.route !== "/" && item.href.startsWith(module.route));
      });
    });

    return { ...section, items: filteredItems };
  }).filter(section => section.items.length > 0); // Remove empty sections

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full shadow-lg text-gray-700 dark:text-gray-200"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-72 bg-slate-900 dark:bg-black text-white transition-transform duration-300 ease-in-out shadow-2xl",
          !isOpen && "-translate-x-full lg:translate-x-0 lg:w-20 lg:hover:w-72 group" // Collapsible on desktop
        )}
      >
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                    <span className="font-bold text-lg">Z</span>
                </div>
                <span className={cn("ml-3 font-bold text-lg tracking-wide whitespace-nowrap transition-opacity duration-300", 
                    !isOpen && "lg:opacity-0 lg:group-hover:opacity-100 lg:hidden lg:group-hover:block"
                )}>
                    Ticketing System
                </span>
            </div>

            {/* Menu */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
                {filteredSections.map((section, idx) => (
                    <div key={idx}>
                         <div className={cn("px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider transition-opacity duration-300",
                             !isOpen && "lg:opacity-0 lg:group-hover:opacity-100 lg:hidden lg:group-hover:block"
                         )}>
                             {section.category}
                         </div>
                         <div className="space-y-1">
                             {section.items.map((item) => {
                                 const Icon = item.icon;
                                 const isActive = pathname === item.href;
                                 return (
                                     <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group/item relative overflow-hidden",
                                            isActive 
                                                ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                        )}
                                     >
                                         <Icon className={cn("w-5 h-5 shrink-0 transition-transform duration-200", isActive && "scale-110")} />
                                         <span className={cn("ml-3 font-medium whitespace-nowrap transition-all duration-300", 
                                             !isOpen && "lg:opacity-0 lg:absolute lg:left-14 lg:group-hover:opacity-100 lg:group-hover:static lg:hidden lg:group-hover:block"
                                         )}>
                                             {item.name}
                                         </span>
                                         {isActive && (
                                             <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse lg:hidden lg:group-hover:block"/>
                                         )}
                                     </Link>
                                 );
                             })}
                         </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700/50">
                <button 
                  onClick={logout}
                  className={cn(
                    "flex items-center w-full px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-red-400 transition-colors",
                )}>
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span className={cn("ml-3 font-medium whitespace-nowrap transition-all duration-300", 
                        !isOpen && "lg:opacity-0 lg:group-hover:opacity-100 lg:hidden lg:group-hover:block"
                    )}>
                        Logout
                    </span>
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content Padding/Margin Adjuster */}
      <div className={cn("transition-all duration-300", isOpen ? "lg:ml-72" : "lg:ml-20")} />
    </>
  );
}
