"use client";

import { useTickets } from "@/context/TicketContext";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { addTicketToSheet } from "@/actions/sheetActions";
import { sendEmail } from "@/actions/emailActions";

export default function NewTicketPage() {
  const { addTicket, users, getNextTicketNumber } = useTickets();
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [nextId, setNextId] = useState("");

  // Since context loads async from localStorage, we should use an effect to get the number
  useEffect(() => {
      if (getNextTicketNumber) {
        setNextId(String(getNextTicketNumber()));
      }
  }, [getNextTicketNumber]);

  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      ticketDate: new Date().toISOString().split('T')[0],
      priority: "Low",
      status: "Requested", 
    }
  });

  const requesters = users.filter(u => u.role === "Requester" || u.role === "Admin");
  
  const onSubmit = async (data) => {
    // Determine To Dept based on Work Order Type Selection if needed, or just use input
    // Assuming simple mapping for this demo
    
    const timestampId = String(Date.now());
    const newTicket = {
      ...data,
      id: data.ticketNo || timestampId, // Using timestamp as internal ID
      ticketNo: nextId,
      status: "Requested",
      logs: [{ action: "Created", date: new Date().toISOString(), user: "System" }],
      ticketDate: new Date().toISOString().split('T')[0]
    };
    
    // 1. Add to Local Context (Instant)
    addTicket(newTicket);

    // 2. Sync to Google Sheet
    addTicketToSheet(newTicket).then(res => {
        if (!res.success) {
            console.error("Google Sheet Sync Error:", res.error);
            alert("Google Sheet Sync Failed: " + res.error);
        }
    });

    // 3. Send Email Notification to Department Staff
    const deptStaff = users.find(u => u.department === newTicket.toDept && u.role === "Staff");
    if (deptStaff && deptStaff.email) {
        sendEmail({
            to: deptStaff.email,
            subject: `New Ticket Requested: #${newTicket.ticketNo}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2563eb;">New Support Request</h2>
                    <p>Hello <strong>${deptStaff.name}</strong>,</p>
                    <p>A new ticket has been requested for your department.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p><strong>Ticket No:</strong> #${newTicket.ticketNo}</p>
                    <p><strong>Date:</strong> ${newTicket.ticketDate}</p>
                    <p><strong>From:</strong> ${newTicket.requestedBy} (${newTicket.department})</p>
                    <p><strong>Priority:</strong> <span style="color: ${newTicket.priority === 'High' ? 'red' : 'inherit'}; font-weight: bold;">${newTicket.priority}</span></p>
                    <p><strong>Description:</strong> ${newTicket.description}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 0.8em; color: #666;">This is an automated notification from the Ticketing System.</p>
                </div>
            `
        }).catch(err => console.error("New Ticket Email Error:", err));
    }

    setSuccess(true);
    setTimeout(() => {
        setSuccess(false);
        router.push("/tickets");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Ticket Application</h1>
         {success && (
            <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-md transition-all">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Ticket Added! Redirecting...</span>
            </div>
         )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm space-y-6">
          
          {/* Section 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ticket Number</label>
                 <input 
                    value={nextId}
                    readOnly
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 cursor-not-allowed font-mono font-bold"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ticket Date</label>
                 <input 
                    type="date"
                    {...register("ticketDate")} 
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 dark:text-white"
                 />
              </div>
          </div>

          {/* Section 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Requested By</label>
                 <select 
                    {...register("requestedBy", { required: true })}
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 dark:text-white"
                 >
                    <option value="">Select Requester</option>
                    {requesters.map(u => (
                        <option key={u.id} value={u.name}>{u.name} ({u.department})</option>
                    ))}
                 </select>
              </div>
              
              <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department (Requester Dept)</label>
                 <select 
                    {...register("department", { required: true })}
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 dark:text-white"
                 >
                     <option value="">Select Department</option>
                     <option value="Biomedical">Biomedical</option>
                     <option value="IT">IT</option>
                     <option value="HR">HR</option>
                     <option value="Admin">Admin</option>
                 </select>
              </div>
          </div>

           {/* Section 3 */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To Dept (Work Order Type)</label>
                 <select 
                    {...register("toDept", { required: true })}
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 dark:text-white"
                 >
                    <option value="">Select Target Dept</option>
                    <option value="Bio-Medical">Bio-Medical</option>
                    <option value="ICT">ICT</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="House Keeping">House Keeping</option>
                 </select>
              </div>
              
              <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                 <select 
                    {...register("priority")}
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 dark:text-white"
                 >
                     <option value="High">High</option>
                     <option value="Medium">Medium</option>
                     <option value="Low">Low</option>
                 </select>
              </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
             <textarea 
                {...register("description")}
                rows={4}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 dark:text-white"
                placeholder="Describe the issue details..."
             />
          </div>

          <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => reset()}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-700"
              >
                  Reset
              </button>
              <button 
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-md hover:opacity-90 transition-opacity"
              >
                  Submit Ticket
              </button>
          </div>

      </form>
    </div>
  );
}
