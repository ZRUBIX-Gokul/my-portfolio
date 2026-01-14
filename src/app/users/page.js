"use client";

import { useTickets } from "@/context/TicketContext";
import { useState } from "react";
import { Trash2, UserPlus } from "lucide-react";

export default function UserManagementPage() {
  const { users, addUser, deleteUser } = useTickets();
  const [formData, setFormData] = useState({ name: "", email: "", role: "Staff", department: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      addUser(formData);
      setFormData({ name: "", email: "", role: "Staff", department: "" });
      alert("User added successfully!");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add User Form */}
        <div className="lg:col-span-1">
             <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm">
                 <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5" /> Add New User
                 </h2>
                 <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input 
                            className="w-full p-2 border rounded bg-transparent" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            required
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input 
                            className="w-full p-2 border rounded bg-transparent" 
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            required
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Role</label>
                         <select 
                            className="w-full p-2 border rounded bg-transparent"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value})}
                         >
                             <option value="Staff">Staff</option>
                             <option value="Requester">Requester</option>
                             <option value="Admin">Admin</option>
                         </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Department</label>
                        <input 
                            className="w-full p-2 border rounded bg-transparent" 
                            value={formData.department}
                            onChange={e => setFormData({...formData, department: e.target.value})}
                            placeholder="e.g. IT, HR, Maintenance"
                        />
                     </div>
                     <button type="submit" className="w-full py-2 bg-black dark:bg-white text-white dark:text-black rounded font-medium hover:opacity-90">
                         Add User
                     </button>
                 </form>
             </div>
        </div>

        {/* User List */}
         <div className="lg:col-span-2">
             <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                 <div className="p-4 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700">
                     <h2 className="font-semibold">Existing Users</h2>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 dark:bg-zinc-900 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Dept</th>
                                <th className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, i) => (
                                <tr key={i} className="border-b border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                    <td className="px-6 py-4 font-medium">{u.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-xs border ${u.role === 'Staff' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{u.department}</td>
                                    <td className="px-6 py-4">
                                        <button 
                                            className="text-red-500 hover:text-red-700 transition-colors" 
                                            title="Delete User"
                                            onClick={() => {
                                                if(confirm(`Are you sure you want to remove ${u.name}?`)) {
                                                    deleteUser(u.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
}
