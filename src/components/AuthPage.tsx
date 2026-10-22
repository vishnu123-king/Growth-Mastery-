import React, { useState, useEffect } from "react";
import { KeyRound, Mail, User as UserIcon, LogIn, AlertCircle, CheckCircle, Shield, Briefcase, GraduationCap, Sparkles, Sun, Moon } from "lucide-react";
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
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem("app_theme_mode") as 'light' | 'dark') || 'dark';
  });

  const toggleTheme = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
    localStorage.setItem("app_theme_mode", next);
  };

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
    <div className="min-h-screen bg-[#151515] flex flex-col items-center justify-center p-4 selection:bg-[#C47C4A] selection:text-white relative">
      {/* Theme Toggle Button in Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="px-3 py-1.5 rounded-lg border border-[#2C2C2C] bg-[#1B1B1B] hover:bg-[#242424] text-[#F3EEE6] transition-colors cursor-pointer min-h-[40px] inline-flex items-center gap-2 shadow-2xs"
          title={themeMode === 'dark' ? "Switch to White Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme mode"
        >
          {themeMode === 'dark' ? (
            <>
              <Sun size={15} className="text-[#D7B87B]" />
              <span className="text-xs font-semibold">White Mode</span>
            </>
          ) : (
            <>
              <Moon size={15} className="text-[#C47C4A]" />
              <span className="text-xs font-semibold">Dark Mode</span>
            </>
          )}
        </button>
      </div>

      <div className="w-full max-w-[440px] bg-[#1B1B1B] border border-[#2C2C2C] rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* Subtle Top Copper Accent Strip */}
        <div className="h-1 bg-[#C47C4A] w-full" />

        {/* Brand Header */}
        <div className="p-7 pb-5 border-b border-[#2C2C2C] text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#242424] border border-[#2C2C2C] p-0.5 flex items-center justify-center shrink-0">
              <img 
                src={logoUrl} 
                alt="Growth Mastery Logo" 
                className="w-full h-full object-cover rounded-[10px]" 
              />
            </div>
            <div className="text-left">
              <span className="font-semibold text-lg text-[#F3EEE6] tracking-tight font-serif block">Growth Mastery</span>
              <span className="text-xs text-[#A8A29E] uppercase tracking-wider font-mono">Academic Diagnostic Engine</span>
            </div>
          </div>
          <p className="text-xs text-[#A8A29E] max-w-xs mx-auto leading-relaxed">
            Competency evaluation, AI-synthesized exams, and personalized skill-gap mastery.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#2C2C2C] text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(""); setSuccess(""); }}
            className={`flex-1 py-3 text-center transition-all cursor-pointer ${
              !isRegister
                ? "text-[#F3EEE6] border-b-2 border-[#C47C4A] font-semibold bg-[#222222]"
                : "text-[#A8A29E] hover:text-[#F3EEE6] hover:bg-[#202020]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(""); setSuccess(""); }}
            className={`flex-1 py-3 text-center transition-all cursor-pointer ${
              isRegister
                ? "text-[#F3EEE6] border-b-2 border-[#C47C4A] font-semibold bg-[#222222]"
                : "text-[#A8A29E] hover:text-[#F3EEE6] hover:bg-[#202020]"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Quick Demo Access Bar */}
        {!isRegister && (
          <div className="p-4 bg-[#222222] border-b border-[#2C2C2C]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#A8A29E] mb-2 font-mono">
              <span className="uppercase tracking-wider">Quick Workspace Preview</span>
              <span className="text-[11px] text-[#78716C] font-normal">Click to sign in</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("vishnutech10@gmail.com", "vishnu12@#3")}
                className="p-2.5 bg-[#1B1B1B] hover:bg-[#282828] border border-[#2C2C2C] rounded-xl text-left transition-all cursor-pointer hover:border-[#C47C4A] group"
              >
                <div className="flex items-center gap-1.5 text-[#F3EEE6] text-xs font-semibold group-hover:text-[#C47C4A]">
                  <GraduationCap size={14} className="text-[#C47C4A]" />
                  <span>Student</span>
                </div>
                <div className="text-[11px] text-[#A8A29E] truncate mt-0.5 font-mono">Learner portal</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin("teacher@skillgap.ai", "teacher123")}
                className="p-2.5 bg-[#1B1B1B] hover:bg-[#282828] border border-[#2C2C2C] rounded-xl text-left transition-all cursor-pointer hover:border-[#6D927A] group"
              >
                <div className="flex items-center gap-1.5 text-[#F3EEE6] text-xs font-semibold group-hover:text-[#6D927A]">
                  <Briefcase size={14} className="text-[#6D927A]" />
                  <span>Teacher</span>
                </div>
                <div className="text-[11px] text-[#A8A29E] truncate mt-0.5 font-mono">Gradebook</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin("admin@skillgap.ai", "admin123")}
                className="p-2.5 bg-[#1B1B1B] hover:bg-[#282828] border border-[#2C2C2C] rounded-xl text-left transition-all cursor-pointer hover:border-[#D7B87B] group"
              >
                <div className="flex items-center gap-1.5 text-[#F3EEE6] text-xs font-semibold group-hover:text-[#D7B87B]">
                  <Shield size={14} className="text-[#D7B87B]" />
                  <span>Admin</span>
                </div>
                <div className="text-[11px] text-[#A8A29E] truncate mt-0.5 font-mono">System control</div>
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-[#D96B6B]/15 border border-[#D96B6B]/35 rounded-xl p-3.5 text-[#D96B6B] text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-[#D96B6B]" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-[#6D927A]/15 border border-[#6D927A]/35 rounded-xl p-3.5 text-[#6D927A] text-xs flex items-start gap-2.5">
              <CheckCircle size={16} className="shrink-0 mt-0.5 text-[#6D927A]" />
              <span className="font-medium leading-relaxed">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#F3EEE6]">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-[#78716C]" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#222222] border border-[#2C2C2C] rounded-xl text-xs text-[#F3EEE6] placeholder-[#78716C] focus:border-[#C47C4A] transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#F3EEE6]">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 bg-[#222222] border border-[#2C2C2C] rounded-xl text-xs font-semibold text-[#F3EEE6] focus:border-[#C47C4A] cursor-pointer"
                  >
                    <option value="student">Student / Learner</option>
                    <option value="teacher">Instructor / Faculty</option>
                    <option value="admin">Administrator / Lead</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#F3EEE6]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#78716C]" />
                <input
                  type="email"
                  required
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#222222] border border-[#2C2C2C] rounded-xl text-xs text-[#F3EEE6] placeholder-[#78716C] focus:border-[#C47C4A] transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#F3EEE6]">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-[#78716C]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#222222] border border-[#2C2C2C] rounded-xl text-xs text-[#F3EEE6] placeholder-[#78716C] focus:border-[#C47C4A] transition-all font-medium font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-copper-primary w-full text-xs mt-2"
            >
              <LogIn size={15} />
              <span>{loading ? "Processing..." : isRegister ? "Create Student Account" : "Sign In to Platform"}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#2C2C2C]"></div>
            <span className="flex-shrink mx-3 text-xs font-mono font-medium text-[#78716C] uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-[#2C2C2C]"></div>
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="btn-charcoal-secondary w-full text-xs"
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

      <div className="mt-6 text-center text-xs text-[#78716C] font-mono">
        Growth Mastery Academic Assessment Platform
      </div>
    </div>
  );
}
