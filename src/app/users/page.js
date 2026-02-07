"use client";

import { useTickets } from "@/context/TicketContext";
import { usePortalUsers } from "@/context/PortalUserContext";
import { useState } from "react";
import { Trash2, UserPlus, Mail, Shield, CheckCircle, Clock, XCircle, Plus, Edit, Copy, ExternalLink } from "lucide-react";
import { sendEmail } from "@/actions/emailActions";

export default function UserManagementPage() {
  const { users, addUser, deleteUser } = useTickets();
  const { 
    portalUsers, 
    permissionSets, 
    availableModules,
    addPortalUser, 
    deletePortalUser, 
    updatePortalUserPermission,
    addPermissionSet,
    deletePermissionSet,
    updatePermissionSet
  } = usePortalUsers();
  
  const [formData, setFormData] = useState({ name: "", email: "", role: "Staff", department: "" });
  const [portalFormData, setPortalFormData] = useState({ email: "", permission: "customer" });
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [activeTab, setActiveTab] = useState("users"); // "users", "portal", "permissions"
  
  // Permission Set Form
  const [editingId, setEditingId] = useState(null);
  const [permissionFormData, setPermissionFormData] = useState({
    name: "",
    description: "",
    modules: {}
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      addUser(formData);
      setFormData({ name: "", email: "", role: "Staff", department: "" });
      alert("User added successfully!");
    }
  };

  const handlePortalUserSubmit = async (e) => {
    e.preventDefault();
    if (portalFormData.email) {
      const existingUser = portalUsers.find(u => u.email === portalFormData.email);
      if (existingUser) {
        alert("This email is already registered as a portal user!");
        return;
      }

      const { user, invitationToken } = addPortalUser(portalFormData.email, portalFormData.permission);
      const invitationLink = `${window.location.origin}/portal/setup?token=${invitationToken}`;
      
      const permissionSet = permissionSets.find(p => p.id === portalFormData.permission);
      
      try {
        await sendEmail({
          to: portalFormData.email,
          subject: "Invitation: Set Up Your Ticketing System Account",
          html: `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; background-color: #f8fafc; color: #1e293b; line-height: 1.5;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                <div style="background-color: #2563eb; padding: 32px; text-align: center;">
                  <div style="width: 48px; height: 48px; background-color: rgba(255, 255, 255, 0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                    <span style="font-size: 24px; font-weight: bold; color: white;">Z</span>
                  </div>
                  <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Ticketing System</h1>
                </div>
                
                <div style="padding: 40px 32px;">
                  <h2 style="margin-top: 0; font-size: 20px; font-weight: 700; color: #0f172a;">Account Invitation</h2>
                  <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">Hello there,</p>
                  <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">
                    You have been invited to join the Ticketing System portal. Your account has been pre-configured with <strong>${permissionSet?.name}</strong> permissions.
                  </p>
                  
                  <div style="margin: 32px 0; text-align: center;">
                    <a href="${invitationLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 10px; text-decoration: none; transition: background-color 0.2s;">
                      Set Up Your Account
                    </a>
                  </div>
                  
                  <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 32px;">
                    Or copy and paste this link in your browser:
                  </p>
                  <div style="background-color: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 12px; color: #2563eb; word-break: break-all; text-align: center; border: 1px solid #e2e8f0;">
                    ${invitationLink}
                  </div>
                </div>
                
                <div style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                  <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                    This is an automated message. Please do not reply to this email.
                  </p>
                </div>
              </div>
            </div>
          `
        });
        setTimeout(() => {
            alert("Portal user invited successfully!\n\nIMPORTANT: Since this is a demo running on client-side storage, please open the invitation link in THIS SAME BROWSER. Opening it in a different browser or incognito window will result in an 'Invalid Invitation' error because the user data is not shared.");
        }, 100);
      } catch (error) {
        console.error("Failed to send invitation email:", error);
        setTimeout(() => {
            alert("Portal user created but failed to send invitation email. \n\nLink: " + invitationLink);
        }, 100);
      }

      setPortalFormData({ email: "", permission: "customer" });
      setShowPortalModal(false);
    }
  };

  const handlePermissionSetSubmit = (e) => {
    e.preventDefault();
    if (permissionFormData.name) {
      if (editingId) {
        updatePermissionSet(editingId, {
          name: permissionFormData.name,
          description: permissionFormData.description,
          modules: permissionFormData.modules
        });
        alert("Permission set updated successfully!");
      } else {
        addPermissionSet(permissionFormData.name, permissionFormData.description, permissionFormData.modules);
        alert("Permission set created successfully!");
      }
      setPermissionFormData({ name: "", description: "", modules: {} });
      setEditingId(null);
      setShowPermissionModal(false);
    }
  };

  const startEditPermission = (set) => {
    setEditingId(set.id);
    setPermissionFormData({
      name: set.name,
      description: set.description,
      modules: JSON.parse(JSON.stringify(set.modules)) // Deep copy
    });
    setShowPermissionModal(true);
  };

  const toggleModulePermission = (moduleId, permission) => {
    setPermissionFormData(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleId]: {
          ...prev.modules[moduleId],
          [permission]: !prev.modules[moduleId]?.[permission]
        }
      }
    }));
  };

  const getStatusBadge = (status) => {
    const styles = {
      invited: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", icon: Clock },
      active: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", icon: CheckCircle },
      suspended: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: XCircle }
    };
    const style = styles[status] || styles.invited;
    const Icon = style.icon;
    
    return (
      <span className={`px-2 py-0.5 rounded text-xs border ${style.bg} ${style.border} ${style.text} flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        
        {/* Tab Switcher */}
        <div className="flex gap-2 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "users" 
                ? "bg-white dark:bg-zinc-700 shadow-sm" 
                : "hover:bg-gray-200 dark:hover:bg-zinc-700"
            }`}
          >
            Internal Users
          </button>
          <button
            onClick={() => setActiveTab("portal")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "portal" 
                ? "bg-white dark:bg-zinc-700 shadow-sm" 
                : "hover:bg-gray-200 dark:hover:bg-zinc-700"
            }`}
          >
            Portal Users
          </button>
          <button
            onClick={() => setActiveTab("permissions")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "permissions" 
                ? "bg-white dark:bg-zinc-700 shadow-sm" 
                : "hover:bg-gray-200 dark:hover:bg-zinc-700"
            }`}
          >
            Permissions
          </button>
        </div>
      </div>

      {/* Internal Users Section */}
      {activeTab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
      )}

      {/* Portal Users Section */}
      {activeTab === "portal" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowPortalModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Portal User
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700">
              <h2 className="font-semibold">Portal Users ({portalUsers.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-zinc-900 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Permission Profile</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Invited At</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portalUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No portal users yet. Click &quot;Add Portal User&quot; to invite someone.
                      </td>
                    </tr>
                  ) : (
                    portalUsers.map((user) => {
                      const profile = permissionSets.find(p => p.id === user.permissionProfile);
                      return (
                        <tr key={user.id} className="border-b border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                          <td className="px-6 py-4 font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {user.email}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={user.permissionProfile}
                              onChange={(e) => updatePortalUserPermission(user.id, e.target.value)}
                              className="px-2 py-1 border rounded text-xs bg-transparent"
                            >
                              {permissionSets.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(user.status)}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(user.invitedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {/* Action: Copy Link (for Invited users) */}
                              {user.status === "invited" && (
                                <>
                                  <button
                                    className="text-blue-500 hover:text-blue-700 transition-colors bg-blue-50 p-1.5 rounded-md"
                                    title="Copy Invitation Link"
                                    onClick={() => {
                                      const link = `${window.location.origin}/portal/setup?token=${user.invitationToken}`;
                                      navigator.clipboard.writeText(link);
                                      alert("Link copied to clipboard! \n\nPaste this in THIS browser to set up the account.");
                                    }}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  <button
                                    className="text-green-600 hover:text-green-800 transition-colors bg-green-50 p-1.5 rounded-md"
                                    title="Complete Setup Now"
                                    onClick={() => {
                                      const link = `/portal/setup?token=${user.invitationToken}`;
                                      window.open(link, '_blank');
                                    }}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              
                              <button 
                                className="text-red-500 hover:text-red-700 transition-colors bg-red-50 p-1.5 rounded-md" 
                                title="Delete Portal User"
                                onClick={() => {
                                  if(confirm(`Are you sure you want to remove ${user.email}?`)) {
                                    deletePortalUser(user.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Section */}
      {activeTab === "permissions" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowPermissionModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Permission
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissionSets.map((set) => (
              <div key={set.id} className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{set.name}</h3>
                    {set.isDefault && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1 inline-block">Default</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                     <button
                        onClick={() => startEditPermission(set)}
                        className="text-gray-400 hover:text-blue-600 p-1 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Permission"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    {!set.isDefault && (
                      <button
                        onClick={() => {
                          const result = deletePermissionSet(set.id);
                          if (!result.success) {
                            alert(result.message);
                          }
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Delete Permission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{set.description}</p>
                <div className="text-xs text-gray-500">
                  <strong>{Object.keys(set.modules).length}</strong> modules configured
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Portal User Modal */}
      {showPortalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Add Portal User
              </h3>
              <button onClick={() => setShowPortalModal(false)} className="text-gray-400 hover:text-red-500">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handlePortalUserSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input 
                  type="email"
                  placeholder="Enter email address"
                  className="w-full p-2.5 border rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={portalFormData.email}
                  onChange={e => setPortalFormData({...portalFormData, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Permission Profile</label>
                <select 
                  className="w-full p-2.5 border rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                  value={portalFormData.permission}
                  onChange={e => setPortalFormData({...portalFormData, permission: e.target.value})}
                >
                  {permissionSets.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  {permissionSets.find(p => p.id === portalFormData.permission)?.description}
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowPortalModal(false)} 
                  className="flex-1 px-6 py-2.5 border rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-md"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Permission Set Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  {editingId ? "Edit Permission Set" : "Configure Permissions"}
                </h3>
                <p className="text-gray-500 text-sm mt-1">Define granular access controls for this role</p>
              </div>
              <button 
                onClick={() => {
                  setShowPermissionModal(false);
                  setEditingId(null);
                  setPermissionFormData({ name: "", description: "", modules: {} });
                }} 
                className="text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-zinc-800 p-2 rounded-full hover:bg-red-50 transition-all"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <form onSubmit={handlePermissionSetSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Basic Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Permission Set Name</label>
                    <input 
                      type="text"
                      placeholder="e.g., Senior Supervisors"
                      className="w-full p-3 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none transition-all" 
                      value={permissionFormData.name}
                      onChange={e => setPermissionFormData({...permissionFormData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                    <input 
                      type="text"
                      placeholder="Brief description of this role's purpose"
                      className="w-full p-3 border border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none transition-all" 
                      value={permissionFormData.description}
                      onChange={e => setPermissionFormData({...permissionFormData, description: e.target.value})}
                    />
                  </div>
                </div>

                {/* Permissions Matrix */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Module Permissions</h4>
                    <span className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-medium border border-blue-100">
                      {availableModules.length} Modules Available
                    </span>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-zinc-900">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50/80 dark:bg-zinc-800/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200 dark:border-zinc-700">
                          <tr>
                            <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 w-1/4">Module Name</th>
                            {['Access', 'View', 'Edit', 'Delete', 'More'].map((header) => (
                              <th key={header} className="px-6 py-4 text-center font-semibold text-gray-600 dark:text-gray-300 w-[15%]">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                          {availableModules.map((module) => {
                            const isAccessEnabled = permissionFormData.modules[module.id]?.access;
                            
                            return (
                              <tr key={module.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                <td className="px-6 py-4">
                                  <div className="font-medium text-gray-900 dark:text-white">{module.name}</div>
                                  <div className="text-xs text-gray-400 font-mono mt-0.5">{module.route}</div>
                                </td>
                                
                                {/* Access Toggle - Master Control */}
                                <td className="px-6 py-4">
                                  <div className="flex justify-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={permissionFormData.modules[module.id]?.access || false}
                                        onChange={() => toggleModulePermission(module.id, 'access')}
                                      />
                                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 dark:peer-focus:ring-blue-900/30 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 shadow-sm"></div>
                                    </label>
                                  </div>
                                </td>

                                {/* Other Permissions - Dependent on Access */}
                                {['view', 'edit', 'delete', 'more'].map((permission) => (
                                  <td key={permission} className="px-6 py-4">
                                    <div className={`flex justify-center transition-opacity duration-200 ${!isAccessEnabled ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                          type="checkbox" 
                                          className="sr-only peer"
                                          checked={permissionFormData.modules[module.id]?.[permission] || false}
                                          onChange={() => toggleModulePermission(module.id, permission)}
                                          disabled={!isAccessEnabled}
                                        />
                                        <div className={`w-9 h-5 ${isAccessEnabled ? 'bg-gray-200' : 'bg-gray-100'} peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-500`}></div>
                                      </label>
                                    </div>
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 backdrop-blur-sm flex gap-4 justify-end shrink-0">
                <button 
                  type="button"
                  onClick={() => {
                    setShowPermissionModal(false);
                    setEditingId(null);
                    setPermissionFormData({ name: "", description: "", modules: {} });
                  }} 
                  className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-100 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm"
                >
                  {editingId ? "Update Permission Set" : "Create Permission Set"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
