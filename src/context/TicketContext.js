"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { syncTicketToZoho } from "@/actions/zohoSync";


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
      let ticketsData = JSON.parse(savedTickets);
      
      // ONE-TIME MIGRATION: Convert old 101-110 numbering to 1-10 sequence
      // This is to address the user's request to start from 1 instead of 101
      const needsFix = ticketsData.some(t => t.ticketNo === "101" || t.ticketNo === "105");
      if (needsFix) {
          ticketsData = ticketsData.map(t => {
              const num = parseInt(t.ticketNo, 10);
              if (num >= 101 && num <= 110) {
                  const newNum = String(num - 100);
                  return { ...t, id: newNum, ticketNo: newNum };
              }
              return t;
          });
          localStorage.setItem("tickets", JSON.stringify(ticketsData));
      }

      setTickets(ticketsData);
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
      id: "1",
      ticketNo: "1",
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
      id: "2",
      ticketNo: "2",
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
      id: "3",
      ticketNo: "3",
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
      id: "4",
      ticketNo: "4",
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

  const getNextTicketNumber = useCallback(() => {
    if (tickets.length === 0) return 1;
    const maxId = tickets.reduce((max, t) => {
        const num = parseInt(t.ticketNo, 10);
        return !isNaN(num) && num > max ? num : max;
    }, 0);
    return maxId + 1;
  }, [tickets]);

  const addTicket = async (ticketData) => {
    const nextNo = getNextTicketNumber();
    const newTicket = {
      ...ticketData,
      id: String(Date.now()), // Unique ID for Zoho/Database
      ticketNo: String(nextNo), // Sequential No for User
      status: "Requested",
      history: [{ action: "Created", date: new Date().toISOString(), user: "System" }]
    };
    
    // 1. Update State First
    setTickets((prev) => [newTicket, ...prev]);
    
    // 2. Sync to Zoho (Async)
    // 2. Sync to Zoho (Wait for it)
    try {
        const result = await syncTicketToZoho(newTicket, "INSERT");
        if (result.success) console.log("Zoho Sync Success for Ticket #", nextNo);
        else console.error("Zoho Sync Failed for Ticket #", nextNo, result.error);
    } catch (err) {
        console.error("Zoho Sync Error for Ticket #", nextNo, err);
    }

    return newTicket;
  };

  const updateTicket = async (id, updates) => {
    // 1. Calculate the updated ticket first
    let updatedTicketToSync = null;

    setTickets((prev) => {
      const newList = prev.map(t => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          updatedTicketToSync = updated; // Capture it
          return updated;
        }
        return t;
      });
      return newList;
    });

    // 2. Call sync AFTER state update logic
    if (updatedTicketToSync) {
        console.log("Triggering Zoho Update for Ticket No:", updatedTicketToSync.ticketNo);
        try {
            const res = await syncTicketToZoho(updatedTicketToSync, "UPDATE");
            if (res.success) console.log("Zoho Update Success #", updatedTicketToSync.id);
            else console.error("Zoho Update Failed #", updatedTicketToSync.id, res.error);
        } catch (err) {
            console.error("Zoho Update Exception:", err);
        }
    }
  };

  const deleteTicket = async (id) => {
    const ticketToDelete = tickets.find(t => t.id === id);
    setTickets((prev) => prev.filter(t => t.id !== id));
    
    if (ticketToDelete) {
      syncTicketToZoho({ id }, "DELETE").catch(err => 
        console.error("Zoho Sync Failed on Delete:", err)
      );
    }
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
      getNextTicketNumber,
      isLoaded 
    }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  return useContext(TicketContext);
}
