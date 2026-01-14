"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Edit, 
  Eye, 
  Settings, 
  X, 
  ChevronLeft,
  ChevronRight, 
  ChevronDown,
  XCircle,
  MoreHorizontal,
  Copy, 
  Trash2,
  Printer,
  Download,
  ArrowUp,
  ArrowDown,
  Search
} from "lucide-react";
import { useTickets } from "@/context/TicketContext";
import { sendEmail } from "@/actions/emailActions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

const HeaderCell = ({ label, columnKey, width, sortConfig, onSort, onGroup, onHide }) => {
    return (
      <th className={`px-4 py-3 whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 select-none bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 ${width ? width : ''}`}>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 p-1.5 rounded -ml-1.5 transition-colors group">
                      <span>{label}</span>
                      {sortConfig?.key === columnKey && (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600"/> : <ArrowDown className="w-3.5 h-3.5 text-blue-600"/>
                      )}
                      <ChevronDown className="w-3 h-3 text-gray-300 group-hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-lg" align="start">
                  <div className="p-2">
                      <div className="relative">
                          <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-gray-400"/>
                          <input 
                              placeholder="Search..." 
                              className="w-full pl-7 pr-2 py-1 text-xs border rounded bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:border-blue-500"
                              onClick={(e) => e.stopPropagation()}
                          />
                      </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onSort(columnKey, 'asc')} className="cursor-pointer">
                      <ArrowUp className="w-3.5 h-3.5 mr-2 text-gray-500"/> Sort Ascending
                  </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => onSort(columnKey, 'desc')} className="cursor-pointer">
                      <ArrowDown className="w-3.5 h-3.5 mr-2 text-gray-500"/> Sort Descending
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onGroup(columnKey, 'asc')} className="cursor-pointer">
                      <Settings className="w-3.5 h-3.5 mr-2 text-gray-500"/> Group By Ascending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onGroup(columnKey, 'desc')} className="cursor-pointer">
                      <Settings className="w-3.5 h-3.5 mr-2 text-gray-500"/> Group By Descending
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onHide(columnKey)} className="text-red-500 cursor-pointer">
                      <Eye className="w-3.5 h-3.5 mr-2"/> Hide Column
                  </DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
      </th>
    );
};

export default function TicketMasterDetail({ title = "All Tickets", filterDept = null, filterStatus = null }) {
  const { tickets, users, updateTicket, deleteTicket, addTicket } = useTickets();
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // --- STATE: SELECTION ---
  const [selectedIds, setSelectedIds] = useState(new Set());

  // --- STATE: SORTING & GROUPING ---
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); // { key: 'ticketNo', direction: 'asc' }
  const [groupConfig, setGroupConfig] = useState({ key: null, direction: 'asc' }); // { key: 'status', direction: 'asc' }
  const [expandedGroups, setExpandedGroups] = useState(new Set()); 

  // --- STATE: MODALS ---
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // --- STATE: TEMP DATA ---
  const [actionRemarks, setActionRemarks] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [editData, setEditData] = useState({});

  // --- STATE: COLUMNS ---
  const [visibleColumns, setVisibleColumns] = useState({
      status: true,
      ticketNo: true,
      ticketDate: true,
      requestedBy: true,
      requestedDept: true,
      toDept: true,
      assignedTo: true,
      assignedDate: true,
      description: true
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // --- SCROLL LOCK ---
  useEffect(() => {
      if (isDetailOpen || isEditing || isAssignOpen || isCompleteOpen) {
          document.body.style.overflow = 'hidden';
      } else {
          document.body.style.overflow = 'auto';
      }
      return () => { document.body.style.overflow = 'auto'; };
  }, [isDetailOpen, isEditing, isAssignOpen, isCompleteOpen]);

  // --- HELPERS ---
  const toggleColumn = (key) => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  // const notify = (msg) => alert(msg);
  const selectedTicket = tickets.find(t => t.id === selectedTicketId);
  const staffMembers = users.filter(u => u.role === "Staff");
  
  const getColLabel = (key) => {
      const labels = {
          status: "Ticket Status",
          ticketNo: "Ticket No",
          ticketDate: "Ticket Date",
          requestedBy: "Requested By",
          department: "Requested Dept",
          toDept: "To Dept",
          assignedTo: "Assigned To",
          assignedDate: "Assigned Date",
          description: "Description"
      };
      return labels[key] || key;
  };

  // --- HANDLERS: SORT/GROUP ---
  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
  };

  const handleGroup = (key, direction) => {
    setGroupConfig({ key, direction });
    setExpandedGroups(new Set()); 
  };

  const clearSort = () => setSortConfig({ key: null, direction: 'asc' });
  const clearGroup = () => setGroupConfig({ key: null, direction: 'asc' });

  const toggleGroup = (groupKey) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) newExpanded.delete(groupKey);
    else newExpanded.add(groupKey);
    setExpandedGroups(newExpanded);
  };

  const handleHideColumn = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: false }));
  };

  // --- LOGIC: DATA PROCESSING ---
  const processedData = useMemo(() => {
    let data = tickets.filter(t => {
      // 1. Department Filter
      let deptMatch = true;
      if (filterDept) {
        if (filterDept === "ICT") {
          deptMatch = (t.toDept === "ICT" || t.toDept === "IT");
        } else {
          deptMatch = (t.toDept === filterDept);
        }
      }

      // 2. Status Filter
      let statusMatch = true;
      if (filterStatus) {
        statusMatch = (t.status === filterStatus);
      }

      return deptMatch && statusMatch;
    });

    const sorter = (a, b, key, dir) => {
        if (!key) return 0;
        const valA = a[key] ? String(a[key]).toLowerCase() : "";
        const valB = b[key] ? String(b[key]).toLowerCase() : "";
        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
    };

    if (groupConfig.key) {
       const groups = {};
       data.forEach(item => {
           const groupVal = item[groupConfig.key] || "Uncategorized";
           if (!groups[groupVal]) groups[groupVal] = [];
           groups[groupVal].push(item);
       });

       const groupKeys = Object.keys(groups).sort((a,b) => {
           const valA = a.toLowerCase();
           const valB = b.toLowerCase();
           if (valA < valB) return groupConfig.direction === 'asc' ? -1 : 1;
           if (valA > valB) return groupConfig.direction === 'asc' ? 1 : -1;
           return 0;
       });

       groupKeys.forEach(key => {
           if (sortConfig.key) {
               groups[key].sort((a, b) => sorter(a, b, sortConfig.key, sortConfig.direction));
           }
       });

       return { isGrouped: true, groupKeys, groups, totalCount: data.length };
    } else {
       if (sortConfig.key) {
           data = [...data].sort((a, b) => sorter(a, b, sortConfig.key, sortConfig.direction));
       }
       return { isGrouped: false, data, totalCount: data.length };
    }
  }, [tickets, filterDept, filterStatus, sortConfig, groupConfig]);

  // --- SELECTION HANDLERS ---
  const allFlatIds = useMemo(() => {
      if (processedData.isGrouped) {
          return Object.values(processedData.groups).flat().map(t => t.id);
      }
      return processedData.data.map(t => t.id);
  }, [processedData]);

  const handleSelectAll = (e) => {
      if (e.target.checked) setSelectedIds(new Set(allFlatIds));
      else setSelectedIds(new Set());
  };

  const handleSelectRow = (id, e) => {
      if(e) e.stopPropagation();
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) newSelected.delete(id);
      else newSelected.add(id);
      setSelectedIds(newSelected);
  };

  // --- BULK/SINGLE ACTIONS ---
  const handleEditStart = (ticket, e) => {
      if (e && e.stopPropagation) e.stopPropagation();
      setSelectedTicketId(ticket.id); 
      setEditData({ ...ticket });
      setIsEditing(true);
  };
  const handleEditSave = () => { updateTicket(selectedTicketId, editData); setIsEditing(false); /* notify("Updated!"); */ };
  const handleDelete = (id, e) => {
      if (e && e.stopPropagation) e.stopPropagation();
      if(confirm("Delete ticket?")) { deleteTicket(id); if(selectedTicketId === id) setSelectedTicketId(null); /* notify("Deleted."); */ }
  };
  const handleDuplicate = (ticket, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if(confirm(`Duplicate Ticket #${ticket.ticketNo}?`)) {
        const { id, ticketNo, history, ...rest } = ticket; 
        addTicket({ ...rest, description: `${rest.description} (Copy)`, ticketDate: new Date().toISOString().split('T')[0] });
        /* notify("Duplicated."); */
    }
  };
  
  const handleBulkDelete = () => { if(confirm(`Delete ${selectedIds.size} items?`)) { selectedIds.forEach(id => deleteTicket(id)); setSelectedIds(new Set()); } };
  const handleBulkDuplicate = () => { 
      if(confirm(`Duplicate ${selectedIds.size} items?`)) {
          selectedIds.forEach(id => {
              const t = tickets.find(x => x.id === id);
              if(t) { const {id:_, ticketNo, history, ...rest} = t; addTicket({...rest, description: `${rest.description} (Copy)`, ticketDate: new Date().toISOString().split('T')[0]}); }
          });
          setSelectedIds(new Set());
      }
  };
  const handleBulkPrint = () => window.print();
  const closeDetail = () => { setIsDetailOpen(false); setSelectedTicketId(null); };
  const handleAssignStart = (ticket) => { 
      setSelectedTicketId(ticket.id); 
      setEditData({ ...ticket, status: 'Assigned', assignedDate: new Date().toISOString().split('T')[0] }); 
      setIsAssignOpen(true); 
  };
  const handleAssignSave = () => { 
      updateTicket(selectedTicketId, editData); 
      setIsAssignOpen(false); 
      /* notify("Assigned Successfully!"); */ 
  };

  const handleCompleteStart = (ticket) => { 
      setSelectedTicketId(ticket.id); 
      setEditData({ ...ticket, status: 'Completed', completedOn: new Date().toISOString().split('T')[0] }); 
      setIsCompleteOpen(true); 
  };
  const handleCompleteSave = () => { 
      updateTicket(selectedTicketId, editData); 
      setIsCompleteOpen(false); 
      /* notify("Completed Successfully!"); */ 
  };

  const navigateDetail = (dir) => {
      const currentIndex = allFlatIds.indexOf(selectedTicketId);
      if (currentIndex === -1) return;
      const nextIndex = currentIndex + dir;
      if (nextIndex >= 0 && nextIndex < allFlatIds.length) {
          setSelectedTicketId(allFlatIds[nextIndex]);
      }
  };


  return (
    <div className="flex relative h-[calc(100vh-100px)] overflow-hidden bg-white dark:bg-zinc-900 cursor-default flex-col">
      
      {/* 1. TOP BAR: TITLE & TOOLBAR */}
      <div className="flex-none border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 z-10 p-4">
           {/* NEW BULK ACTIONS (Top Left) */}
           {selectedIds.size > 0 && (
               <div className="flex items-center gap-2 mb-4 animation-fade-in flex-wrap">
                    <button onClick={() => {
                       const first = tickets.find(t => selectedIds.has(t.id));
                       if(first) handleEditStart(first);
                    }} className="px-3 py-1.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer shadow-sm">
                       <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={handleBulkDuplicate} className="px-3 py-1.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer shadow-sm">
                       <Copy className="w-3.5 h-3.5" /> Duplicate
                    </button>
                    <button onClick={handleBulkDelete} className="px-3 py-1.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded text-xs font-semibold flex items-center gap-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer shadow-sm">
                       <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                           <button className="px-3 py-1.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer shadow-sm">
                               Print <ChevronDown className="w-3.5 h-3.5" />
                           </button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent className="bg-white">
                           <DropdownMenuItem onClick={handleBulkPrint} className="cursor-pointer">Print Selected</DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                           <button className="px-3 py-1.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer shadow-sm">
                               Export <ChevronDown className="w-3.5 h-3.5" />
                           </button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent className="bg-white">
                           <DropdownMenuItem className="cursor-pointer">Export as PDF</DropdownMenuItem>
                           <DropdownMenuItem className="cursor-pointer">Export as Excel</DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
               </div>
           )}

           <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                    {/* Columns Toggle */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 cursor-pointer transition-colors" title="Column Visibility">
                                <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl p-2" align="start">
                            <div className="px-2 py-1.5 font-semibold text-sm text-gray-900 dark:text-white border-b dark:border-zinc-800 mb-2">
                                Display Columns
                            </div>
                            <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {Object.keys(visibleColumns).map(key => (
                                    <div 
                                        key={key} 
                                        className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-md cursor-pointer group transition-colors"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleColumn(key);
                                        }}
                                    >
                                        <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${visibleColumns[key] ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-zinc-700'}`}>
                                            {visibleColumns[key] && <div className="w-2 h-2 bg-white rounded-sm" />}
                                        </div>
                                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                                            {getColLabel(key)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white border-l pl-4 border-gray-200 dark:border-zinc-700 flex items-center">
                        {title}
                    </h2>

                    {/* FILTER CHIPS (Bordered, with Close, Toggle Arrow) */}
                    {(sortConfig.key || groupConfig.key) && (
                        <div className="flex items-center gap-2 ml-2">
                             {/* SORT CHIP */}
                            {sortConfig.key && (
                                <div className="flex items-center gap-2 px-2 py-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded text-xs font-medium shadow-sm">
                                    <span className="text-gray-500 dark:text-gray-400 uppercase font-bold text-[10px] tracking-wider">SORTING</span>
                                    <span className="text-gray-700 dark:text-gray-200 font-semibold">{getColLabel(sortConfig.key)}</span>
                                    <button 
                                        onClick={() => handleSort(sortConfig.key, sortConfig.direction === 'asc' ? 'desc' : 'asc')}
                                        className="hover:bg-gray-100 dark:hover:bg-zinc-700 p-0.5 rounded cursor-pointer transition-colors"
                                        title="Toggle Sort Direction"
                                    >
                                        {sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600"/> : <ArrowDown className="w-3.5 h-3.5 text-blue-600"/>}
                                    </button>
                                    <button onClick={clearSort} className="hover:text-red-500 ml-1 cursor-pointer transition-colors" title="Clear Sort">
                                        <X className="w-4 h-4 opacity-70 hover:opacity-100" />
                                    </button>
                                </div>
                            )}

                             {/* GROUP CHIP */}
                            {groupConfig.key && (
                                <div className="flex items-center gap-2 px-2 py-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded text-xs font-medium shadow-sm">
                                     <span className="text-gray-500 dark:text-gray-400 uppercase font-bold text-[10px] tracking-wider">GROUPING</span>
                                     <span className="text-gray-700 dark:text-gray-200 font-semibold">{getColLabel(groupConfig.key)}</span>
                                     <button 
                                        onClick={() => handleGroup(groupConfig.key, groupConfig.direction === 'asc' ? 'desc' : 'asc')}
                                        className="hover:bg-gray-100 dark:hover:bg-zinc-700 p-0.5 rounded cursor-pointer transition-colors"
                                        title="Toggle Group Direction"
                                     >
                                        {groupConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600"/> : <ArrowDown className="w-3.5 h-3.5 text-blue-600"/>}
                                    </button>
                                    <button onClick={clearGroup} className="hover:text-red-500 ml-1 cursor-pointer transition-colors" title="Clear Grouping">
                                        <X className="w-4 h-4 opacity-70 hover:opacity-100" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
              </div>
              
           </div>
      </div>
      
      {/* 2. TABLE AREA */}
      <div className="flex-1 overflow-auto bg-white dark:bg-zinc-900 w-full relative">
         <table className="w-full min-w-max text-sm text-left border-collapse table-auto">
             <thead className="sticky top-0 z-20">
                 <tr className="bg-white dark:bg-zinc-900">
                     <th className="px-4 py-3 w-[40px] bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
                         <input type="checkbox" className="w-4 h-4 cursor-pointer" onChange={handleSelectAll} checked={allFlatIds.length > 0 && selectedIds.size === allFlatIds.length} />
                     </th>
                     <th className="px-4 py-3 w-[50px] bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800"></th> 
                     <th className="px-4 py-3 w-[90px] bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">Assign</th>
                     <th className="px-4 py-3 w-[90px] bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">Modify</th>
                     <th className="px-4 py-3 w-[90px] bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">Complete</th>
                     
                     {visibleColumns.status && <HeaderCell label="Ticket Status" columnKey="status" sortConfig={sortConfig} onSort={handleSort} onGroup={handleGroup} onHide={handleHideColumn} />}
                     {visibleColumns.ticketNo && <HeaderCell label="Ticket No" columnKey="ticketNo" sortConfig={sortConfig} onSort={handleSort} onGroup={handleGroup} onHide={handleHideColumn} />}
                     {visibleColumns.ticketDate && <HeaderCell label="Ticket Date" columnKey="ticketDate" sortConfig={sortConfig} onSort={handleSort} onGroup={handleGroup} onHide={handleHideColumn} />}
                     {visibleColumns.requestedBy && <HeaderCell label="Requested By" columnKey="requestedBy" sortConfig={sortConfig} onSort={handleSort} onGroup={handleGroup} onHide={handleHideColumn} />}
                     {visibleColumns.requestedDept && <HeaderCell label="Requested Dept" columnKey="department" sortConfig={sortConfig} onSort={handleSort} onGroup={handleGroup} onHide={handleHideColumn} />}
                     {visibleColumns.toDept && <HeaderCell label="To Dept" columnKey="toDept" sortConfig={sortConfig} onSort={handleSort} onGroup={handleGroup} onHide={handleHideColumn} />}
                     {visibleColumns.assignedTo && <HeaderCell label="Assigned To" columnKey="assignedTo" sortConfig={sortConfig} onSort={handleSort} onGroup={handleGroup} onHide={handleHideColumn} />}
                     {visibleColumns.assignedDate && <HeaderCell label="Assigned Date" columnKey="assignedDate" sortConfig={sortConfig} onSort={handleSort} onGroup={handleGroup} onHide={handleHideColumn} />}
                     {visibleColumns.description && <HeaderCell label="Work Order Description" columnKey="description" width="min-w-[300px]" sortConfig={sortConfig} onSort={handleSort} onGroup={handleGroup} onHide={handleHideColumn} />}
                 </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                 {/* NO DATA STATE */}
                 {(!processedData.isGrouped && processedData.data.length === 0) || (processedData.isGrouped && processedData.groupKeys.length === 0) && (
                     <tr><td colSpan={20} className="p-8 text-center text-gray-500">No tickets found</td></tr>
                 )}

                 {/* FLAT LIST RENDER */}
                 {!processedData.isGrouped && processedData.data.map(t => (
                    <TicketRow 
                        key={t.id} 
                        ticket={t} 
                        isSelected={selectedIds.has(t.id)} 
                        onSelect={handleSelectRow}
                        onClick={() => { setSelectedTicketId(t.id); setIsDetailOpen(true); }}
                        visibleColumns={visibleColumns}
                        onEdit={handleEditStart}
                        onDuplicate={handleDuplicate}
                        onDelete={handleDelete}
                        onAssign={() => handleAssignStart(t)}
                        onComplete={() => handleCompleteStart(t)}
                    />
                 ))}

                 {/* GROUPED RENDER */}
                 {processedData.isGrouped && processedData.groupKeys.map(groupKey => {
                     const groupItems = processedData.groups[groupKey];
                     const isCollapsed = expandedGroups.has(groupKey);

                     return (
                         <React.Fragment key={`group-section-${groupKey}`}>
                             <tr key={`group-${groupKey}`} className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-800">
                                 <td colSpan={20} className="px-4 py-2 cursor-pointer select-none" onClick={() => toggleGroup(groupKey)}>
                                     <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                                         {isCollapsed ? <ChevronRight className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                                         <span className="text-sm">{groupKey}</span>
                                         <span className="text-xs text-gray-500 font-normal">({groupItems.length})</span>
                                     </div>
                                 </td>
                             </tr>
                             {!isCollapsed && groupItems.map(t => (
                                 <TicketRow 
                                    key={t.id} 
                                    ticket={t} 
                                    isSelected={selectedIds.has(t.id)} 
                                    onSelect={handleSelectRow}
                                    onClick={() => { setSelectedTicketId(t.id); setIsDetailOpen(true); }}
                                    visibleColumns={visibleColumns}
                                    onEdit={handleEditStart}
                                    onDuplicate={handleDuplicate}
                                    onDelete={handleDelete}
                                    onAssign={() => handleAssignStart(t)}
                                    onComplete={() => handleCompleteStart(t)}
                                />
                             ))}
                         </React.Fragment>
                     );
                 })}
             </tbody>
         </table>
      </div>

      {/* FOOTER */}
      <div className="flex-none p-3 border-t border-gray-200 bg-white dark:bg-zinc-900 z-10 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records: {processedData.totalCount}</span>
      </div>

      {/* DRAWER & MODALS (Kept minimal for brevity but functional logic persists) */}
      {/* 4. DETAIL DRAWER (IMAGE MATCHED TABLE LAYOUT) */}
      <div className={`fixed inset-y-0 right-0 w-[550px] bg-white dark:bg-zinc-900 shadow-2xl z-[70] transform transition-transform duration-300 border-l border-gray-200 dark:border-zinc-800 ${isDetailOpen && selectedTicketId ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedTicket && (
              <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
                  {/* Drawer Header: Nav + Actions */}
                  <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                      <div className="flex gap-1.5">
                          <button 
                            disabled={allFlatIds.indexOf(selectedTicketId) <= 0}
                            onClick={() => navigateDetail(-1)}
                            className="p-1.5 border border-gray-200 dark:border-zinc-700 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                          >
                              <ChevronLeft className="w-4 h-4 text-gray-500" />
                          </button>
                          <button 
                            disabled={allFlatIds.indexOf(selectedTicketId) >= allFlatIds.length - 1}
                            onClick={() => navigateDetail(1)}
                            className="p-1.5 border border-gray-200 dark:border-zinc-700 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                          >
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                          </button>
                      </div>
                      <div className="flex items-center gap-2">
                          <button onClick={(e) => handleEditStart(selectedTicket, e)} className="px-3 py-1.5 border border-gray-200 dark:border-zinc-700 rounded text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer">
                              <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button onClick={(e) => handleDuplicate(selectedTicket, e)} className="px-3 py-1.5 border border-gray-200 dark:border-zinc-700 rounded text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer">
                              <Copy className="w-3.5 h-3.5" /> Duplicate
                          </button>
                          <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="px-3 py-1.5 border border-gray-200 dark:border-zinc-700 rounded text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer">
                                        More <ChevronDown className="w-3.5 h-3.5" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white border">
                                    <DropdownMenuItem onClick={() => window.print()} className="cursor-pointer font-medium"><Printer className="w-3.5 h-3.5 mr-2"/> Print Details</DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer font-medium text-red-600" onClick={(e) => handleDelete(selectedTicket.id, e)}><Trash2 className="w-3.5 h-3.5 mr-2"/> Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                          </DropdownMenu>
                          <button onClick={closeDetail} className="ml-2 hover:bg-gray-100 p-1 rounded-full transition-colors cursor-pointer">
                              <X className="w-5 h-5 text-gray-400" />
                          </button>
                      </div>
                  </div>

                  {/* Drawer Content: Table-like list */}
                  <div className="flex-1 overflow-auto custom-scrollbar">
                      <table className="w-full text-sm border-collapse">
                          <tbody>
                              {[
                                  { label: "Ticket No", value: selectedTicket.ticketNo },
                                  { label: "Ticket Date", value: selectedTicket.ticketDate },
                                  { label: "Requested By", value: selectedTicket.requestedBy },
                                  { label: "Requested Dept", value: selectedTicket.department },
                                  { label: "To Dept", value: selectedTicket.toDept },
                                  { label: "Work Order Description", value: selectedTicket.description },
                                  { label: "Eqt. Code Scan", value: selectedTicket.eqtCode || "-" },
                                  { label: "Priority", value: selectedTicket.priority || "High" },
                                  { label: "Assigned To", value: selectedTicket.assignedTo || "-" },
                                  { label: "Assigned Date", value: selectedTicket.assignedDate || "-" },
                                  { label: "Completed By", value: selectedTicket.completedBy || "-" },
                                  { label: "Completed On", value: selectedTicket.completedOn || "-" },
                                  { label: "Ticket status", value: (
                                       <span className={`font-semibold ${
                                          selectedTicket.status === 'Requested' ? 'text-red-500' : 
                                          selectedTicket.status === 'Assigned' ? 'text-blue-600' : 
                                          selectedTicket.status === 'Completed' ? 'text-green-600' : 
                                          'text-slate-600'
                                       }`}>
                                           {selectedTicket.status}
                                       </span>
                                  )},
                                  { label: "Remarks", value: selectedTicket.remarks || "-" },
                              ].map((row, idx) => (
                                  <tr key={idx} className="border-b border-gray-100 dark:border-zinc-800 last:border-0 hover:bg-gray-50/30 dark:hover:bg-zinc-800/10 transition-colors">
                                      <td className="w-[180px] p-3 text-gray-600 dark:text-gray-400 font-medium bg-gray-50/50 dark:bg-zinc-900/50 border-r border-gray-100 dark:border-zinc-800">
                                          {row.label}
                                      </td>
                                      <td className="p-3 text-gray-900 dark:text-gray-100 font-semibold align-top whitespace-pre-wrap">
                                          {row.value}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}
      </div>
       {isDetailOpen && selectedTicketId && <div onClick={closeDetail} className="fixed inset-0 bg-black/20 z-40"></div>}

       {/* Edit Modal Placeholders - Logic is hooked up above via onEditStart */}
      {/* Full Feature Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                       <Edit className="w-5 h-5 text-blue-600"/> Modify Ticket #{editData.ticketNo}
                  </h3>
                  <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-6 h-6" />
                  </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ticket Date</label>
                          <input 
                              type="date"
                              value={editData.ticketDate || ''}
                              onChange={e => setEditData({ ...editData, ticketDate: e.target.value })}
                              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
                          <select 
                              value={editData.status || ''}
                              onChange={e => setEditData({ ...editData, status: e.target.value })}
                              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                              <option value="Requested">Requested</option>
                              <option value="Assigned">Assigned</option>
                              <option value="Completed">Completed</option>
                              <option value="Closed">Closed</option>
                          </select>
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Requested By</label>
                          <input 
                              type="text"
                              value={editData.requestedBy || ''}
                              onChange={e => setEditData({ ...editData, requestedBy: e.target.value })}
                              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</label>
                          <input 
                              type="text"
                              value={editData.department || ''}
                              onChange={e => setEditData({ ...editData, department: e.target.value })}
                              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">To Dept</label>
                          <select 
                              value={editData.toDept || ''}
                              onChange={e => setEditData({ ...editData, toDept: e.target.value })}
                              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="Bio-Medical">Bio-Medical</option>
                            <option value="ICT">ICT</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="House Keeping">House Keeping</option>
                          </select>
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</label>
                          <select 
                              value={editData.priority || ''}
                              onChange={e => setEditData({ ...editData, priority: e.target.value })}
                              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                          </select>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned To</label>
                          <select 
                            value={editData.assignedTo || ''}
                            onChange={e => setEditData({ ...editData, assignedTo: e.target.value })}
                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="">Unassigned</option>
                            {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                          </select>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                          <textarea 
                              rows={4}
                              value={editData.description || ''}
                              onChange={e => setEditData({ ...editData, description: e.target.value })}
                              className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                          />
                      </div>
                  </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3 bg-gray-50 dark:bg-zinc-800/50">
                  <button 
                      onClick={() => setIsEditing(false)} 
                      className="px-6 py-2.5 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm font-semibold hover:bg-white transition-colors cursor-pointer"
                  >
                      Cancel
                  </button>
                  <button 
                      onClick={handleEditSave} 
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-shadow shadow-md cursor-pointer"
                  >
                      Save Changes
                  </button>
              </div>
          </div>
        </div>
      )}

      {/* Assign Modal (Filtered for assignment only) */}
      {isAssignOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">Assign Ticket</h3>
                  <button onClick={() => setIsAssignOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-6 h-6" />
                  </button>
              </div>
              <div className="p-6 space-y-4">
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assign To Staff</label>
                      <select 
                        value={editData.assignedTo || ''}
                        onChange={e => setEditData({ ...editData, assignedTo: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select Staff...</option>
                        {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                      </select>
                  </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3 bg-gray-50 dark:bg-zinc-800/50">
                  <button onClick={() => setIsAssignOpen(false)} className="px-6 py-2 border rounded-lg hover:bg-white cursor-pointer transition-colors">Cancel</button>
                  <button onClick={handleAssignSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer shadow-md">Submit Assignment</button>
              </div>
          </div>
        </div>
      )}

      {/* Complete Modal (Filtered for completion details only) */}
      {isCompleteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">Complete Ticket</h3>
                  <button onClick={() => setIsCompleteOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-6 h-6" />
                  </button>
              </div>
              <div className="p-6 space-y-4">
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completion Remarks</label>
                      <textarea 
                          rows={4}
                          value={editData.remarks || ''}
                          onChange={e => setEditData({ ...editData, remarks: e.target.value })}
                          placeholder="What was the solution?"
                          className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      />
                  </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3 bg-gray-50 dark:bg-zinc-800/50">
                  <button onClick={() => setIsCompleteOpen(false)} className="px-6 py-2 border rounded-lg hover:bg-white cursor-pointer transition-colors">Cancel</button>
                  <button onClick={handleCompleteSave} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 cursor-pointer shadow-md">Confirm Completion</button>
              </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

// --- SUB-COMPONENT: TICKET ROW (To reduce render complexity) ---
function TicketRow({ ticket: t, isSelected, onSelect, onClick, visibleColumns, onEdit, onDuplicate, onDelete, onAssign, onComplete }) {
    return (
        <tr 
            onClick={onClick}
            className={`cursor-pointer transition-colors border-b last:border-0 border-gray-100 dark:border-zinc-800 
                ${isSelected ? 'bg-blue-50 dark:bg-zinc-800' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'}
            `}
        >
             <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                 <input type="checkbox" className="w-4 h-4 cursor-pointer" checked={isSelected} onChange={(e) => onSelect(t.id, e)} />
             </td>

             <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-gray-200 rounded-full text-gray-400 cursor-pointer">
                            <MoreHorizontal className="w-4 h-4"/>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-white border shadow-lg">
                        <DropdownMenuItem onClick={(e) => onEdit(t, e)} className="cursor-pointer"><Edit className="w-4 h-4 mr-2"/> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => onDuplicate(t, e)} className="cursor-pointer"><Copy className="w-4 h-4 mr-2"/> Duplicate</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => onDelete(t.id, e)} className="text-red-600 cursor-pointer"><Trash2 className="w-4 h-4 mr-2"/> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
             </td>

             <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                 <button onClick={onAssign} disabled={t.status === 'Completed' || t.status === 'Assigned'} className={`px-3 py-1 text-xs border rounded w-full ${t.status === 'Assigned' || t.status === 'Completed' ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50 cursor-pointer'}`}>Assign</button>
             </td>
             <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                 <button onClick={(e)=>onEdit(t,e)} disabled={t.status === 'Closed'} className="px-3 py-1 text-xs border rounded w-full bg-white text-amber-600 hover:bg-amber-50 cursor-pointer">Modify</button>
             </td>
             <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                 <button onClick={onComplete} disabled={t.status !== 'Assigned'} className={`px-3 py-1 text-xs border rounded w-full ${t.status !== 'Assigned' ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-white text-green-600 hover:bg-green-50 cursor-pointer'}`}>Complete</button>
             </td>

             {visibleColumns.status && (
                  <td className="px-4 py-3">
                      <span className={`font-medium ${
                          t.status === 'Requested' ? 'text-red-500' : 
                          t.status === 'Assigned' ? 'text-blue-600' : 
                          t.status === 'Completed' ? 'text-green-600' : 
                          'text-slate-600'
                      }`}>
                          {t.status}
                      </span>
                  </td>
             )}
             {visibleColumns.ticketNo && <td className="px-4 py-3 font-mono text-gray-600">#{t.ticketNo}</td>}
             {visibleColumns.ticketDate && <td className="px-4 py-3 text-gray-600">{t.ticketDate}</td>}
             {visibleColumns.requestedBy && <td className="px-4 py-3 font-medium">{t.requestedBy}</td>}
             {visibleColumns.requestedDept && <td className="px-4 py-3 text-gray-600">{t.department}</td>}
             {visibleColumns.toDept && <td className="px-4 py-3 text-gray-600">{t.toDept}</td>}
             {visibleColumns.assignedTo && <td className="px-4 py-3 text-gray-600">{t.assignedTo || "-"}</td>}
             {visibleColumns.assignedDate && <td className="px-4 py-3 text-gray-600">{t.assignedDate || "-"}</td>}
             {visibleColumns.description && <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{t.description}</td>}
        </tr>
    );
}
