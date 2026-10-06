import React, { useState, useEffect } from "react";
import { KeyRound, Mail, User as UserIcon, LogIn, AlertCircle, CheckCircle, Shield, Briefcase, GraduationCap, Sparkles } from "lucide-react";
import { apiFetch } from "../lib/api";
import { UserRole } from "../types";
import logoUrl from "../assets/images/growth_mastery_logo_purple_1791037785600.jpg";

interface AuthPageProps {
  onAuthSuccess: (user: any) => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<UserRole>("student");
  const [preferences, setPreferences] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Listen for Google OAuth messages
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost")) {
        return;
      }
      if (event.data?.type === "OAUTH_AUTH_SUCCESS" && event.data?.userId) {
        localStorage.setItem("competency_user_id", event.data.userId);
        localStorage.removeItem("explicit_logout");
        setSuccess("Signed in with Google successfully.");
        setTimeout(() => {
          apiFetch("/api/v1/auth/me")
            .then(res => res.json())
            .then(user => {
              onAuthSuccess(user);
            });
        }, 800);
      }
    };
    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [onAuthSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email || !password || (isRegister && !name)) {
      setError("Please complete all required fields.");
      setLoading(false);
      return;
    }

    const endpoint = isRegister ? "/api/v1/auth/register-credentials" : "/api/v1/auth/login-credentials";
    const bodyPayload = isRegister ? { email, name, password, preferences, role } : { email, password };

    try {
      const res = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || "Authentication request failed");
      }

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      localStorage.setItem("competency_user_id", data.id);
      localStorage.removeItem("explicit_logout");
      setSuccess(isRegister ? "Account created successfully." : "Welcome back.");
      
      setTimeout(() => {
        onAuthSuccess(data);
      }, 400);
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await apiFetch("/api/v1/auth/login-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: demoPass })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Login failed");
      }
      const user = await res.json();
      localStorage.setItem("competency_user_id", user.id);
      localStorage.removeItem("explicit_logout");
      setSuccess(`Signed in as ${user.name}`);
      setTimeout(() => onAuthSuccess(user), 300);
    } catch (e: any) {
      setError(e.message || "Failed to sign in demo profile");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccess("");
    try {
      const originParam = encodeURIComponent(window.location.origin);
      const res = await apiFetch(`/api/v1/auth/google/url?origin=${originParam}`);
      if (!res.ok) {
        throw new Error("Failed to get Google Sign-In authorization URL");
      }
      const { url } = await res.json();
      
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;
      
      const authWindow = window.open(
        url,
        "google_oauth_popup",
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );

      if (!authWindow) {
        setError("Popup blocked. Please enable popups to continue with Google.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to initialize Google Sign-In");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-4 selection:bg-indigo-600 selection:text-white relative">
      <div className="w-full max-w-[440px] bg-white border border-stone-300 rounded-2xl shadow-lg overflow-hidden relative z-10">
        {/* Top Accent Strip */}
        <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-amber-500 w-full" />

        {/* Brand Header */}
        <div className="p-7 pb-5 border-b border-stone-100 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-violet-500 p-0.5 shadow-xs flex items-center justify-center shrink-0">
              <img 
                src={logoUrl} 
                alt="Growth Mastery Logo" 
                className="w-full h-full object-cover rounded-[10px]" 
              />
            </div>
            <div className="text-left">
              <span className="font-bold text-lg text-stone-900 tracking-tight font-serif block">Growth Mastery</span>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider font-mono">Academic Diagnostic Engine</span>
            </div>
          </div>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Competency evaluation, AI-synthesized exams, and personalized skill-gap mastery.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(""); setSuccess(""); }}
            className={`flex-1 py-3 text-center transition-all cursor-pointer ${
              !isRegister
                ? "text-indigo-950 border-b-2 border-indigo-600 font-bold bg-indigo-50/40"
                : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(""); setSuccess(""); }}
            className={`flex-1 py-3 text-center transition-all cursor-pointer ${
              isRegister
                ? "text-indigo-950 border-b-2 border-indigo-600 font-bold bg-indigo-50/40"
                : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Quick Demo Access Bar */}
        {!isRegister && (
          <div className="p-4 bg-stone-50/80 border-b border-stone-200">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 mb-2">
              <span className="uppercase tracking-wider">Quick Workspace Preview</span>
              <span className="text-[10px] text-stone-400 font-normal">Click to sign in</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("vishnutech10@gmail.com", "vishnu12@#3")}
                className="p-2.5 bg-white hover:bg-indigo-50/80 border border-stone-200 rounded-xl text-left transition-all cursor-pointer shadow-2xs hover:border-indigo-300 group"
              >
                <div className="flex items-center gap-1.5 text-stone-900 text-xs font-bold group-hover:text-indigo-700">
                  <GraduationCap size={14} className="text-indigo-600" />
                  <span>Student</span>
                </div>
                <div className="text-[10px] text-stone-500 truncate mt-0.5 font-medium">Learner portal</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin("teacher@skillgap.ai", "teacher123")}
                className="p-2.5 bg-white hover:bg-emerald-50/80 border border-stone-200 rounded-xl text-left transition-all cursor-pointer shadow-2xs hover:border-emerald-300 group"
              >
                <div className="flex items-center gap-1.5 text-stone-900 text-xs font-bold group-hover:text-emerald-700">
                  <Briefcase size={14} className="text-emerald-600" />
                  <span>Teacher</span>
                </div>
                <div className="text-[10px] text-stone-500 truncate mt-0.5 font-medium">Gradebook</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin("admin@skillgap.ai", "admin123")}
                className="p-2.5 bg-white hover:bg-purple-50/80 border border-stone-200 rounded-xl text-left transition-all cursor-pointer shadow-2xs hover:border-purple-300 group"
              >
                <div className="flex items-center gap-1.5 text-stone-900 text-xs font-bold group-hover:text-purple-700">
                  <Shield size={14} className="text-purple-600" />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-stone-500 truncate mt-0.5 font-medium">System control</div>
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-rose-800 text-xs flex items-start gap-2.5 shadow-2xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-800 text-xs flex items-start gap-2.5 shadow-2xs">
              <CheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              <span className="font-medium leading-relaxed">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                  >
                    <option value="student">Student / Learner</option>
                    <option value="teacher">Instructor / Faculty</option>
                    <option value="admin">Administrator / Lead</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  required
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <LogIn size={15} />
              <span>{loading ? "Processing..." : isRegister ? "Create Student Account" : "Sign In to Platform"}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.09 14.97 0 12 0 7.354 0 3.307 2.67 1.242 6.58l4.024 3.185z" />
              <path fill="#4285F4" d="M23.818 12.273c0-.818-.073-1.609-.209-2.373H12v4.5h6.618c-.287 1.509-1.136 2.786-2.418 3.645l3.755 2.91c2.195-2.023 3.863-5.005 3.863-8.682z" />
              <path fill="#FBBC05" d="M5.266 14.235L1.242 17.42A11.966 11.966 0 0 0 12 24c2.97 0 5.64-.99 7.455-2.682l-3.755-2.91a7.114 7.114 0 0 1-3.7 1.082 7.078 7.078 0 0 1-6.734-5.255z" />
              <path fill="#34A853" d="M12 4.909c1.936 0 3.682.668 5.045 1.973l3.51-3.51C18.364 1.341 15.422.5 12 .5A11.966 11.966 0 0 0 .045 12h5.221a7.078 7.078 0 0 1 6.734-7.091z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-stone-500 font-medium">
        Growth Mastery Academic Assessment Platform
      </div>
    </div>
  );
}
