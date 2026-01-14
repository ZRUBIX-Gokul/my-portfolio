"use client";

import { 
  FileQuestion, 
  Users, 
  CheckCircle,
  Activity,
  Monitor,
  Wrench,
  Brush
} from "lucide-react";
import { useTickets } from "@/context/TicketContext";

export default function Dashboard() {
  const { getStats } = useTickets();
  const { totalRequested, totalWIP, totalCompleted, deptStats } = getStats();

  const stats = [
    {
      title: "Requested",
      count: totalRequested,
      icon: FileQuestion,
      color: "bg-[#FF7163]", 
      textColor: "text-white"
    },
    {
      title: "Work In Progress",
      count: totalWIP,
      icon: Users,
      color: "bg-[#BEA6FC]",
      textColor: "text-white"
    },
    {
      title: "Completed",
      count: totalCompleted,
      icon: CheckCircle,
      color: "bg-[#3FDBB6]",
      textColor: "text-white"
    }
  ];

  const departmentStatsDisplay = [
    { name: "Bio-Medical", icon: Activity, ...deptStats["Bio-Medical"] },
    { name: "ICT", icon: Monitor, ...deptStats["ICT"] },
    { name: "Maintenance", icon: Wrench, ...deptStats["Maintenance"] },
    { name: "House Keeping", icon: Brush, ...deptStats["House Keeping"] },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Ticketing Dashboard</h1>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-xl p-6 shadow-sm transition-all hover:shadow-md`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-4xl font-bold ${stat.textColor} mb-2`}>{stat.count}</p>
                <p className={`text-sm font-medium ${stat.textColor} opacity-90`}>{stat.title}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <stat.icon className={`h-8 w-8 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Department Wise Status */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Department Status (This Month)</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {departmentStatsDisplay.map((dept, i) => (
                <div key={i} className="bg-white dark:bg-zinc-800 border dark:border-zinc-700 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gray-100 dark:bg-zinc-700 rounded-lg">
                            <dept.icon className="h-5 w-5 text-gray-900 dark:text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{dept.name}</h3>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-zinc-700/50 rounded-md">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Requested</span>
                            <span className="font-mono font-bold text-gray-900 dark:text-white">{dept.req}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-zinc-700/50 rounded-md">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Assigned</span>
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{dept.ass}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-zinc-700/50 rounded-md">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Completed</span>
                            <span className="font-mono font-bold text-green-600 dark:text-green-400">{dept.comp}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
