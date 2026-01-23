"use client";

import { createContext, useContext, useState, useEffect } from "react";

const PortalUserContext = createContext();

export function PortalUserProvider({ children }) {
  const [portalUsers, setPortalUsers] = useState([]);
  const [permissionSets, setPermissionSets] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Available modules in the system
  const availableModules = [
    { id: "dashboard", name: "Dashboard", route: "/", exact: true },
    { id: "ticket_entry", name: "Ticket Entry Form", route: "/tickets/new", exact: true },
    { id: "all_tickets", name: "All Tickets", route: "/tickets", exact: true },
    { id: "biomedical_tickets", name: "Bio-Medical Tickets", route: "/tickets/biomedical", exact: true },
    { id: "ict_tickets", name: "ICT Tickets", route: "/tickets/ict", exact: true },
    { id: "maintenance_tickets", name: "Maintenance Tickets", route: "/tickets/maintenance", exact: true },
    { id: "housekeeping_tickets", name: "House Keeping Tickets", route: "/tickets/housekeeping", exact: true },
    { id: "reports", name: "Reports", route: "/reports", exact: true },
    { id: "it_report", name: "IT Report", route: "/reports/it", exact: true },
    { id: "biomedical_report", name: "Bio-Medical Report", route: "/reports/biomedical", exact: true },
    { id: "maintenance_report", name: "Maintenance Report", route: "/reports/maintenance", exact: true },
    { id: "housekeeping_report", name: "House Keeping Report", route: "/reports/housekeeping", exact: true },
    { id: "users", name: "User Management", route: "/users", exact: true },
    { id: "settings", name: "Settings", route: "/settings", exact: true },
    { id: "purchases", name: "Purchases", route: "/purchases", exact: true }
  ];

  // Default Customer permission set
  const defaultPermissionSet = {
    id: "customer",
    name: "Customer",
    description: "This is the default profile having only add and view permission.",
    isDefault: true,
    modules: {
      ticket_entry: { access: true, view: true, edit: false, delete: false, more: false },
      all_tickets: { access: true, view: true, edit: false, delete: false, more: false }
    }
  };

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedPortalUsers = localStorage.getItem("portalUsers");
    const savedPermissionSets = localStorage.getItem("permissionSets");
    
    if (savedPortalUsers) {
      setPortalUsers(JSON.parse(savedPortalUsers));
    }
    
    if (savedPermissionSets) {
      const sets = JSON.parse(savedPermissionSets);
      // Always ensure default customer exists
      const hasCustomer = sets.some(s => s.id === "customer");
      if (!hasCustomer) {
        setPermissionSets([defaultPermissionSet, ...sets]);
      } else {
        setPermissionSets(sets);
      }
    } else {
      setPermissionSets([defaultPermissionSet]);
    }
    
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("portalUsers", JSON.stringify(portalUsers));
      localStorage.setItem("permissionSets", JSON.stringify(permissionSets));
    }
  }, [portalUsers, permissionSets, isLoaded]);

  // Permission Set Management
  const addPermissionSet = (name, description, modules) => {
    const newSet = {
      id: String(Date.now()),
      name,
      description,
      isDefault: false,
      modules,
      createdAt: new Date().toISOString()
    };
    setPermissionSets(prev => [...prev, newSet]);
    return newSet;
  };

  const updatePermissionSet = (id, updates) => {
    setPermissionSets(prev => prev.map(set => 
      set.id === id ? { ...set, ...updates } : set
    ));
  };

  const deletePermissionSet = (id) => {
    // Cannot delete default customer
    if (id === "customer") return false;
    
    // Check if any portal user is using this permission set
    const usersWithPermission = portalUsers.filter(u => u.permissionProfile === id);
    if (usersWithPermission.length > 0) {
      return { 
        success: false, 
        message: `Cannot delete. ${usersWithPermission.length} user(s) are using this permission set.` 
      };
    }
    
    setPermissionSets(prev => prev.filter(set => set.id !== id));
    return { success: true };
  };

  const getPermissionSet = (id) => {
    return permissionSets.find(s => s.id === id);
  };

  // Portal User Management
  const addPortalUser = (email, permissionProfile) => {
    const invitationToken = generateInvitationToken();
    const newPortalUser = {
      id: String(Date.now()),
      email,
      permissionProfile,
      status: "invited",
      invitationToken,
      invitedAt: new Date().toISOString(),
      password: null,
      activatedAt: null
    };
    
    // Update state
    setPortalUsers(prev => {
        const updated = [...prev, newPortalUser];
        // Sync to LS immediately to avoid race conditions with alerts/navigation
        localStorage.setItem("portalUsers", JSON.stringify(updated));
        return updated;
    });
    
    return { user: newPortalUser, invitationToken };
  };

  const activatePortalUser = (token, password) => {
    let activatedUser = null;
    setPortalUsers(prev => {
        const updated = prev.map(user => {
            if (user.invitationToken === token && user.status === "invited") {
                const u = {
                ...user,
                password,
                status: "active",
                activatedAt: new Date().toISOString()
                };
                activatedUser = u;
                return u;
            }
            return user;
        });
        localStorage.setItem("portalUsers", JSON.stringify(updated));
        return updated;
    });
    return activatedUser;
  };

  const updatePortalUserPermission = (userId, newPermissionProfile) => {
    setPortalUsers(prev => {
        const updated = prev.map(user => 
            user.id === userId ? { ...user, permissionProfile: newPermissionProfile } : user
        );
        localStorage.setItem("portalUsers", JSON.stringify(updated));
        return updated;
    });
  };

  const deletePortalUser = (userId) => {
    setPortalUsers(prev => {
        const updated = prev.filter(user => user.id !== userId);
        localStorage.setItem("portalUsers", JSON.stringify(updated));
        return updated;
    });
  };

  const verifyPortalUserLogin = (email, password) => {
    const user = portalUsers.find(u => u.email === email && u.status === "active");
    if (user && user.password === password) {
      return { success: true, user };
    }
    return { success: false, message: "Invalid credentials" };
  };

  // Check if user has permission for a specific module and action
  const hasPermission = (userId, moduleId, action) => {
    const user = portalUsers.find(u => u.id === userId);
    if (!user) return false;
    
    const permissionSet = getPermissionSet(user.permissionProfile);
    if (!permissionSet) return false;
    
    const modulePermissions = permissionSet.modules[moduleId];
    if (!modulePermissions) return false;
    
    return modulePermissions[action] === true;
  };

  // Get all accessible modules for a user
  const getUserModules = (userId) => {
    const user = portalUsers.find(u => u.id === userId);
    if (!user) return [];
    
    const permissionSet = getPermissionSet(user.permissionProfile);
    if (!permissionSet) return [];
    
    return Object.keys(permissionSet.modules)
      .filter(moduleId => permissionSet.modules[moduleId].access)
      .map(moduleId => {
        const module = availableModules.find(m => m.id === moduleId);
        return {
          ...module,
          permissions: permissionSet.modules[moduleId]
        };
      });
  };

  function generateInvitationToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  return (
    <PortalUserContext.Provider value={{ 
      portalUsers,
      permissionSets,
      availableModules,
      addPortalUser,
      activatePortalUser,
      updatePortalUserPermission,
      deletePortalUser,
      verifyPortalUserLogin,
      addPermissionSet,
      updatePermissionSet,
      deletePermissionSet,
      getPermissionSet,
      hasPermission,
      getUserModules,
      isLoaded
    }}>
      {children}
    </PortalUserContext.Provider>
  );
}

export function usePortalUsers() {
  return useContext(PortalUserContext);
}
