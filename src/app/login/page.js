"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Phone, Lock, ArrowRight, CheckCircle2, Loader2, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1: Mobile, 2: OTP
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid mobile number");
      return;
    }
    setIsLoading(true);
    setError("");
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 4) {
      setError("Please enter the 4-digit OTP");
      return;
    }
    
    setIsLoading(true);
    setError("");

    // Simulate Verification
    setTimeout(() => {
      setIsLoading(false);
      if (otpValue === "1234") { // Mock OTP
        login({ phone, name: "Gokul User", role: "Manager" });
      } else {
        setError("Invalid OTP. Try '1234'");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-white/20 overflow-hidden backdrop-blur-xl">
          <div className="p-8 pb-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-6 shadow-lg shadow-blue-500/30">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to your dashboard securely</p>
          </div>

          <div className="p-8 pt-0">
            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-6 animate-in slide-in-from-left duration-300">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Mobile Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      placeholder="Enter 10 digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-zinc-800 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl outline-none transition-all text-lg font-medium tracking-wide"
                    />
                  </div>
                  {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Send OTP <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-8 animate-in slide-in-from-right duration-300">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Code sent to {phone}
                  </div>
                  <button onClick={() => setStep(1)} className="block w-full text-xs text-blue-500 hover:underline">Change number?</button>
                </div>

                <div className="flex justify-between gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-16 h-16 text-center text-3xl font-bold bg-gray-50 dark:bg-zinc-800 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all"
                    />
                  ))}
                </div>

                {error && <p className="text-red-500 text-center text-sm font-medium">{error}</p>}

                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black dark:bg-white dark:text-black text-white rounded-2xl py-4 font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify & Login"}
                  </button>
                  <button 
                    type="button"
                    className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors"
                    onClick={handleSendOtp}
                  >
                    Didn&apos;t receive code? Resend
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        <p className="text-center mt-8 text-gray-400 text-sm">
          By continuing, you agree to our <span className="text-blue-500 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-blue-500 hover:underline cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
