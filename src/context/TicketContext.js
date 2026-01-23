"use client";

import { createContext, useContext, useState, useEffect } from "react";

const TicketContext = createContext();

export function TicketProvider({ children }) {
  // Initialize state with lazy initializer to read from localStorage immediately if possible (client-side)
  // or use effects. For Next.js (SSR), we usually start empty and sync in useEffect.
  
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initial Data (only if localStorage is empty)
  const initialUsers = [
    { id: "1", name: "Admin User", email: "admin@tenxhealth.in", role: "Admin", department: "IT" },
    { id: "2", name: "Sanjay", email: "sanjay@tenxhealth.in", role: "Staff", department: "Biomedical" },
    { id: "3", name: "Nithilla", email: "nithilla@tenxhealth.in", role: "Requester", department: "HR" },
    { id: "4", name: "StarGokul", email: "gokul@tenxhealth.in", role: "Staff", department: "Maintenance" },
    { id: "5", name: "John Doe", email: "john@tenxhealth.in", role: "Staff", department: "ICT" }
  ];

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedTickets = localStorage.getItem("tickets");
    const savedUsers = localStorage.getItem("users");

    if (savedTickets) {
      setTickets(JSON.parse(savedTickets));
    } else {
      setTickets(initialTickets);
    }

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      setUsers(initialUsers);
    }
    setIsLoaded(true);
  }, []);

  // Initial Tickets for Demo/Testing
  const initialTickets = [
    {
      id: "101",
      ticketNo: "101",
      ticketDate: new Date().toISOString().split('T')[0],
      requestedBy: "Nithilla",
      department: "HR",
      toDept: "ICT",
      description: "Internet connection is slow in HR cabin",
      priority: "High",
      status: "Requested",
      history: []
    },
    {
      id: "102",
      ticketNo: "102",
      ticketDate: new Date().toISOString().split('T')[0],
      requestedBy: "Sanjay",
      department: "Biomedical",
      toDept: "Maintenance",
      description: "AC leaking in Lab 2",
      priority: "Medium",
      status: "Assigned",
      assignedTo: "StarGokul",
      assignedDate: new Date().toISOString().split('T')[0],
      history: []
    },
    {
      id: "103",
      ticketNo: "103",
      ticketDate: new Date().toISOString().split('T')[0],
      requestedBy: "Admin User",
      department: "IT",
      toDept: "Bio-Medical",
      description: "X-Ray machine calibration required",
      priority: "Critical",
      status: "Requested",
      history: []
    },
    {
      id: "104",
      ticketNo: "104",
      ticketDate: new Date().toISOString().split('T')[0],
      requestedBy: "John Doe",
      department: "ICT",
      toDept: "ICT",
      description: "Server backup failed",
      priority: "High",
      status: "Completed",
      assignedTo: "John Doe",
      assignedDate: new Date().toISOString().split('T')[0],
      completedBy: "John Doe",
      completedOn: new Date().toISOString().split('T')[0],
      history: []
    }
  ];

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("tickets", JSON.stringify(tickets));
    }
  }, [tickets, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, [users, isLoaded]);

  // --- Actions ---

  const getNextTicketNumber = () => {
    if (tickets.length === 0) return 1;
    // Extract numbers from IDs assuming format "1", "2", etc.
    // If mixed formats exist, this might be tricky, but we'll enforce numeric IDs now.
    const maxId = tickets.reduce((max, t) => {
        const num = parseInt(t.ticketNo, 10);
        return !isNaN(num) && num > max ? num : max;
    }, 0);
    return maxId + 1;
  };

  const addTicket = (ticketData) => {
    const nextNo = getNextTicketNumber();
    const newTicket = {
      ...ticketData,
      id: String(Date.now()), // Internal unique ID
      ticketNo: String(nextNo), // Display ID (1, 2, 3...)
      status: "Requested",
      history: [{ action: "Created", date: new Date().toISOString(), user: "System" }]
    };
    setTickets((prev) => [newTicket, ...prev]);
  };

  const updateTicket = (id, updates) => {
    setTickets((prev) => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTicket = (id) => {
    setTickets((prev) => prev.filter(t => t.id !== id));
  };

  const addUser = (userData) => {
    const newUser = { ...userData, id: String(Date.now()) };
    setUsers(prev => [...prev, newUser]);
  };

  const deleteUser = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const getStats = () => {
    const totalRequested = tickets.filter(t => t.status === "Requested").length;
    const totalWIP = tickets.filter(t => t.status === "Assigned" || t.status === "Work in progress").length;
    const totalCompleted = tickets.filter(t => t.status === "Completed" || t.status === "Closed").length;

    const deptStats = {
      "Bio-Medical": { req: 0, ass: 0, comp: 0 },
      "ICT": { req: 0, ass: 0, comp: 0 },
      "Maintenance": { req: 0, ass: 0, comp: 0 },
      "House Keeping": { req: 0, ass: 0, comp: 0 },
    };

    tickets.forEach(t => {
      let deptKey = t.toDept;
      if (deptKey === "IT" || deptKey === "IT (ICT)") deptKey = "ICT";
      
      if (deptStats[deptKey]) {
        if (t.status === "Requested") deptStats[deptKey].req += 1;
        if (t.status === "Assigned" || t.status === "Work in progress") deptStats[deptKey].ass += 1;
        if (t.status === "Completed" || t.status === "Closed") deptStats[deptKey].comp += 1;
      }
    });

    return { totalRequested, totalWIP, totalCompleted, deptStats };
  };

  return (
    <TicketContext.Provider value={{ 
      tickets, 
      users, 
      addTicket, 
      updateTicket, 
      deleteTicket, 
      addUser, 
      deleteUser,
      getStats,
      getNextTicketNumber 
    }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  return useContext(TicketContext);
}
