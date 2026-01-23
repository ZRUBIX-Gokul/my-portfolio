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
      setToken(invitationToken);
      // Find user by token
      const foundUser = portalUsers.find(u => u.invitationToken === invitationToken);
      if (foundUser) {
        if (foundUser.status === "active") {
          setError("This invitation has already been used. Please login instead.");
        } else {
          setUser(foundUser);
          // Clear any previous error just in case
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-950 p-4">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Activated!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your account has been successfully set up. You will be redirected to the login page shortly.
          </p>
          <div className="animate-pulse text-blue-600 font-medium">Redirecting...</div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-950 p-4">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          
          <div className="bg-gray-100 dark:bg-zinc-900 p-3 rounded text-left text-xs font-mono text-gray-500 mb-6 overflow-hidden max-h-40 overflow-y-auto">
             <p><strong>Debug Info:</strong></p>
             <p>URL Token: {token}</p>
             <p>Users Loaded: {portalUsers.length}</p>
             <div className="mt-2 text-[10px] border-t pt-2">
                <p><strong>Available Tokens in Store:</strong></p>
                {portalUsers.map((u, i) => (
                    <p key={i} className={u.invitationToken === token ? "text-green-600 font-bold" : ""}>
                        {i+1}. {u.invitationToken} ({u.status})
                    </p>
                ))}
             </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
                Refresh Data
            </button>
            <button
                onClick={() => router.push("/login")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
                Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-950 p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Set Up Your Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Create a password to access the ticketing system</p>
        </div>

        {user && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-900 dark:text-white">{user.email}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Create Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Re-enter your password"
              className="w-full p-3 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Activate Account
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:underline font-medium"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
