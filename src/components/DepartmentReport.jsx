"use client";

import { useTickets } from "@/context/TicketContext";

export default function DepartmentReportPage({ deptName, title }) {
  const { tickets } = useTickets();
  
  // Filter for this specific department
  // Normalize checking (handle IT/ICT differences if any)
  const filteredTickets = tickets.filter(t => {
      if (deptName === "ICT" && (t.toDept === "ICT" || t.toDept === "IT")) return true;
      return t.toDept === deptName;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title} Report</h1>
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
         {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No tickets found for {title}.
            </div>
         ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Ticket No</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3">Requester</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTickets.map((t, index) => (
                            <tr key={index} className="border-b border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200">
                                <td className="px-6 py-4 font-medium">{t.ticketNo}</td>
                                <td className="px-6 py-4">{t.ticketDate}</td>
                                <td className="px-6 py-4 truncate max-w-xs">{t.description || '-'}</td>
                                <td className="px-6 py-4">{t.requestedBy}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                        ${t.status === 'Requested' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 
                                        t.status === 'Assigned' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 
                                        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'}`}>
                                        {t.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
         )}
      </div>
    </div>
  );
}
