"use client";

import { usePortalUsers } from "@/context/PortalUserContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Lock, Mail, AlertCircle } from "lucide-react";

export default function PortalSetupPage() {
  const { portalUsers, activatePortalUser, isLoaded } = usePortalUsers();
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for context to be loaded
    if (!isLoaded) return;

    const invitationToken = searchParams.get("token");
    if (invitationToken) {
      // Use setImmediate-like behavior or just do it once
      setToken(prev => prev !== invitationToken ? invitationToken : prev);
      
      const foundUser = portalUsers.find(u => u.invitationToken === invitationToken);
      if (foundUser) {
        if (foundUser.status === "active") {
          setError("This invitation has already been used. Please login instead.");
        } else {
          setUser(foundUser);
          setError("");
        }
      } else {
        setError("Invalid or expired invitation link.");
      }
    } else {
      setError("No invitation token provided.");
    }
    setLoading(false);
  }, [searchParams, portalUsers, isLoaded]);

  // Fix the quote error at line 101 (now line numbers shifted slightly)
  // I'll use a separate chunk or just replace the whole section if needed.

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Activate portal user
    const activatedUser = activatePortalUser(token, password);
    
    if (activatedUser) {
        setSuccess(true);
        // Add a small delay so user sees success message, then auto-login
        setTimeout(() => {
            // Transform portal user to auth user format if needed, but Context usually expects just the user object
            // Just ensure it has what AuthContext expects
            login({ ...activatedUser, isPortalUser: true });
            router.push("/"); 
        }, 1500); 
    } else {
        setError("Failed to activate user. Please try again or contact support.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="mt-4 text-slate-400 font-medium animate-pulse">Initializing Portal</div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 font-['Outfit']">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Account Verified</h2>
          <p className="text-slate-400 mb-8 text-lg">
            Your secure gateway is now active. We&apos;re preparing your workspace...
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-400 font-semibold italic">
             <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
             <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
             <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
             <span className="ml-2">Redirecting to Dashboard</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 font-['Outfit']">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Invalid Access</h2>
          <p className="text-slate-400 mb-8">{error}</p>
          
          <div className="flex flex-col gap-4">
            <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-slate-800 hover:bg-slate-750 text-white rounded-2xl font-bold transition-all border border-slate-700 active:scale-[0.98]"
            >
                Retry Validation
            </button>
            <button
                onClick={() => router.push("/login")}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
            >
                Return to Login
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800/50 text-left">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Diagnostic Data</p>
            <div className="bg-black/40 rounded-xl p-4 font-mono text-[10px] text-blue-400/80 break-all border border-blue-500/5">
                <p>U_ID: {user?.id || 'NULL'}</p>
                <p>TKN: {token || 'MISSING'}</p>
                <p>AUTH_STAT: {portalUsers.length} NODES</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] p-4 font-['Outfit'] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-2xl mb-6">
            <div className="w-full h-full bg-[#020617] rounded-[22px] flex items-center justify-center">
                <Lock className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Portal Gateway</h1>
          <p className="text-slate-400 text-lg">Secure your credentials to begin</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-[32px] shadow-2xl p-8 md:p-10">
          {user && (
            <div className="mb-8 p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">Authorizing Access For</p>
                <p className="text-white font-medium truncate">{user.email}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 ml-1">New Password</label>
              <div className="relative group">
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <p className="text-[10px] text-slate-500 flex items-center gap-1.5 ml-1">
                <CheckCircle className={`w-3 h-3 ${password.length >= 6 ? 'text-blue-500' : 'text-slate-700'}`} />
                Security requirement: Minimum 6 characters
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 ml-1">Confirm Identity</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-sm text-red-400 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] mt-2 overflow-hidden relative group"
            >
              <span className="relative z-10">Activate Secure Portal</span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
            <p className="text-slate-500 text-sm">
              Already have an active key?{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-slate-600 text-xs font-medium uppercase tracking-[0.2em]">
          End-to-End Encrypted Authentication
        </p>
      </div>
    </div>
  );
}
