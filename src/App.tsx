import { useState, useEffect, useRef } from "react";
import { 
  LearningDomain, ProgressSummary, SkillGap, Recommendation, Material, Assessment, 
  AssessmentResult, AssessmentTemplate, Quiz, QuizAttempt, User, FeatureFlags 
} from "./types";
import { Dashboard } from "./components/Dashboard";
import { AssessmentFlow } from "./components/AssessmentFlow";
import { MaterialQuizFlow } from "./components/MaterialQuizFlow";
import { SkillGapTracker } from "./components/SkillGapTracker";
import { RecommendationsList } from "./components/RecommendationsList";
import { AITutor } from "./components/AITutor";
import { AIPerformanceHub } from "./components/AIPerformanceHub";
import { FreePracticeSources } from "./components/FreePracticeSources";
import { AdminConsole } from "./components/AdminConsole";
import { TeacherPortal } from "./components/TeacherPortal";
import { StudentCourses } from "./components/StudentCourses";
import { 
  LayoutDashboard, BookMarked, TrendingUp, Award, Settings, Loader2, MessageSquare, 
  Activity, LogOut, Briefcase, BookOpen, Sparkles, ChevronRight, Sun, Moon, Globe, UserCog, AlertCircle, ShieldAlert
} from "lucide-react";
import { AuthPage } from "./components/AuthPage";
import { apiFetch } from "./lib/api";
import logoUrl from "./assets/images/growth_mastery_logo_purple_1791037785600.jpg";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("courses");
  const [loading, setLoading] = useState<boolean>(true);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem("app_theme_mode") as 'light' | 'dark') || 'light';
  });

  // Apply dark/light theme mode
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
    localStorage.setItem("app_theme_mode", themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Core synchronized application state
  const [domains, setDomains] = useState<LearningDomain[]>([]);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [features, setFeatures] = useState<FeatureFlags>({
    enableAIAssessments: true,
    enableAITutor: true,
    enableAIQuizStudio: true,
    enableStrictProctoring: true,
    enableFreePracticeSources: true,
    enableStudentRegistration: true,
    enablePeerDiscussions: true
  });

  // User details
  const [learningPreferences, setLearningPreferences] = useState<string>("");
  const [savingPrefs, setSavingPrefs] = useState<boolean>(false);
  const [practiceAssessment, setPracticeAssessment] = useState<Assessment | null>(null);

  // Proctoring and tab-locking state
  const [isAssessmentActive, setIsAssessmentActive] = useState<boolean>(false);
  const forceSubmitRef = useRef<((reason?: string) => void) | null>(null);
  const [showAssessmentWarning, setShowAssessmentWarning] = useState<boolean>(false);
  const [assessmentWarningReason, setAssessmentWarningReason] = useState<string>("");

  const handleTabClick = (targetTab: string) => {
    if (isAssessmentActive) {
      if (forceSubmitRef.current) {
        forceSubmitRef.current("Dashboard navigation attempt during active examination");
      }
      setAssessmentWarningReason("You navigated away from an active examination. Academic integrity standards require single-tab continuity.");
      setShowAssessmentWarning(true);
      setActiveTab("assessment");
    } else {
      setActiveTab(targetTab);
    }
  };

  // Browser window/tab proctoring listener
  useEffect(() => {
    if (!isAssessmentActive || !features.enableStrictProctoring) return;

    const handleWindowFocusLoss = () => {
      if (document.hidden || !document.hasFocus()) {
        if (forceSubmitRef.current) {
          forceSubmitRef.current("Focus loss or window minimize detected");
        }
        setAssessmentWarningReason("Window focus loss or browser tab switch was detected while an examination was in progress.");
        setShowAssessmentWarning(true);
      }
    };

    window.addEventListener("blur", handleWindowFocusLoss);
    document.addEventListener("visibilitychange", handleWindowFocusLoss);

    return () => {
      window.removeEventListener("blur", handleWindowFocusLoss);
      document.removeEventListener("visibilitychange", handleWindowFocusLoss);
    };
  }, [isAssessmentActive, features.enableStrictProctoring]);

  // Initial user session and data initialization
  useEffect(() => {
    async function initUser() {
      try {
        const storedUid = localStorage.getItem("competency_user_id");
        const explicitLogout = localStorage.getItem("explicit_logout");

        if (explicitLogout === "true") {
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        const res = await apiFetch("/api/v1/auth/me");
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
          localStorage.setItem("competency_user_id", user.id);
        } else if (storedUid) {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Session verification failed:", err);
      } finally {
        setLoading(false);
      }
    }
    initUser();
  }, []);

  // Fetch all domain & curriculum data once user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    async function initData() {
      try {
        setLoading(true);
        const meRes = await apiFetch("/api/v1/auth/me");
        if (!meRes.ok) {
          setLoading(false);
          return;
        }
        const me = await meRes.json();
        setCurrentUser(me);

        const [domRes, progRes, gapsRes, recRes, matRes, featRes, tmplRes] = await Promise.all([
          apiFetch("/api/v1/domains"),
          apiFetch("/api/v1/progress"),
          apiFetch("/api/v1/skill-gaps"),
          apiFetch("/api/v1/recommendations"),
          apiFetch("/api/v1/materials"),
          apiFetch("/api/v1/features"),
          apiFetch("/api/v1/assessment-templates")
        ]);

        const [doms, sum, gaps, recs, mats, feats, tmpls] = await Promise.all([
          domRes.json(),
          progRes.json(),
          gapsRes.json(),
          recRes.json(),
          matRes.json(),
          featRes.json(),
          tmplRes.ok ? tmplRes.json() : []
        ]);

        setDomains(doms || []);
        setSummary(sum || null);
        setSkillGaps(gaps || []);
        setRecommendations(recs || []);
        setMaterials(mats || []);
        setTemplates(tmpls || []);
        if (feats) setFeatures(feats);
        setLearningPreferences(me.learningPreferences || "");

        // Set default view based strictly on role
        if (me.role === "admin") {
          setActiveTab("admin");
        } else if (me.role === "teacher") {
          setActiveTab("teacher");
        } else {
          setActiveTab("courses");
        }
      } catch (err) {
        console.error("Failed to fetch startup curriculum profile:", err);
      } finally {
        setLoading(false);
      }
    }

    initData();
  }, [currentUser?.id]);

  const handleLogout = async () => {
    try {
      await apiFetch("/api/v1/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem("competency_user_id");
    localStorage.setItem("explicit_logout", "true");
    setCurrentUser(null);
    setDomains([]);
    setSummary(null);
    setSkillGaps([]);
    setRecommendations([]);
    setMaterials([]);
    setTemplates([]);
    setActiveTab("courses");
  };

  // Helper: Refresh all state
  const refreshAllState = async () => {
    try {
      const [domRes, progRes, gapsRes, recRes, matRes, featRes, tmplRes] = await Promise.all([
        apiFetch("/api/v1/domains"),
        apiFetch("/api/v1/progress"),
        apiFetch("/api/v1/skill-gaps"),
        apiFetch("/api/v1/recommendations"),
        apiFetch("/api/v1/materials"),
        apiFetch("/api/v1/features"),
        apiFetch("/api/v1/assessment-templates")
      ]);

      const [doms, sum, gaps, recs, mats, feats, tmpls] = await Promise.all([
        domRes.json(),
        progRes.json(),
        gapsRes.json(),
        recRes.json(),
        matRes.json(),
        featRes.json(),
        tmplRes.ok ? tmplRes.json() : []
      ]);

      setDomains(doms || []);
      setSummary(sum || null);
      setSkillGaps(gaps || []);
      setRecommendations(recs || []);
      setMaterials(mats || []);
      setTemplates(tmpls || []);
      if (feats) setFeatures(feats);
    } catch (err) {
      console.error("Error refreshing curriculum dashboard state:", err);
    }
  };

  // Preferences update
  const handleUpdatePreferences = async () => {
    setSavingPrefs(true);
    try {
      const res = await apiFetch("/api/v1/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learningPreferences })
      });
      if (res.ok) {
        await refreshAllState();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingPrefs(false);
    }
  };

  // Assessment flow controllers
  const handleStartAssessment = async (domainId: string, aiGenerated: boolean, templateId?: string): Promise<Assessment> => {
    const res = await apiFetch("/api/v1/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domainId, aiGenerated, templateId })
    });
    if (!res.ok) throw new Error("Failed to initialize assessment unit");
    return res.json();
  };

  const handleStartExamFromCourses = async (domainId: string, templateId?: string) => {
    try {
      setLoading(true);
      const newAssessment = await handleStartAssessment(domainId, false, templateId);
      setPracticeAssessment(newAssessment);
      setActiveTab("assessment");
    } catch (e) {
      console.error("Failed to start assessment from course:", e);
      setActiveTab("assessment");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssessment = async (assessmentId: string, answers: Record<string, string>, autoSubmittedReason?: string): Promise<AssessmentResult> => {
    const res = await apiFetch(`/api/v1/assessments/${assessmentId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, autoSubmittedReason })
    });
    if (!res.ok) throw new Error("Grading submission failed");
    const result = await res.json();
    await refreshAllState();
    return result;
  };

  // Recommendation complete controller
  const handleCompleteRec = async (id: string) => {
    try {
      const res = await apiFetch(`/api/v1/recommendations/${id}/complete`, { method: "POST" });
      if (res.ok) {
        setRecommendations(prev => prev.map(r => r.id === id ? { ...r, completed: true } : r));
        await refreshAllState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Material upload controller
  const handleUploadMaterial = async (name: string, content: string): Promise<Material> => {
    const res = await apiFetch("/api/v1/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: name, content })
    });
    if (!res.ok) throw new Error("Document upload failed");
    const newMaterial = await res.json();
    await refreshAllState();
    return newMaterial;
  };

  // Quiz generation and submit controller
  const handleGenerateQuiz = async (materialId: string): Promise<Quiz> => {
    const res = await apiFetch("/api/v1/quizzes/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId })
    });
    if (!res.ok) throw new Error("Quiz generation error");
    return res.json();
  };

  const handleSubmitQuiz = async (quizId: string, answers: Record<string, string>): Promise<QuizAttempt> => {
    const res = await apiFetch(`/api/v1/quizzes/${quizId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers })
    });
    if (!res.ok) throw new Error("Quiz submission failed");
    const attemptResult = await res.json();
    await refreshAllState();
    return attemptResult;
  };

  // Practice specific weak area callback
  const handlePracticeGap = async (competencyId: string) => {
    try {
      const res = await apiFetch("/api/v1/practice/weak-areas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competencyId })
      });
      if (res.ok) {
        const customAssessment = await res.json();
        setPracticeAssessment(customAssessment);
        setActiveTab("assessment");
      }
    } catch (e) {
      console.error("Failed to generate targeted weak-area practice:", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAF9F5] dark:bg-[#0B0F17] space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <div className="text-center">
          <p className="text-stone-800 dark:text-stone-200 font-semibold text-sm">Growth Mastery Platform</p>
          <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">Synchronizing personalized curriculum & diagnostics...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  const roleConfig = {
    admin: { label: "System Administrator", bg: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300" },
    teacher: { label: "Faculty Instructor", bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300" },
    student: { label: "Student Scholar", bg: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300" }
  }[currentUser.role] || { label: "Learner", bg: "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300" };

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#0B0F17] flex font-sans text-stone-900 dark:text-stone-100 selection:bg-indigo-600 selection:text-white" id="application-container">
      
      {/* 13. SIDEBAR / STRUCTURAL COLUMN */}
      <aside className="w-64 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-[#151C28] flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-stone-100 dark:border-stone-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 p-0.5 shadow-xs flex items-center justify-center shrink-0">
              <img 
                src={logoUrl} 
                alt="Growth Mastery Logo" 
                className="w-full h-full object-cover rounded-[6px]" 
              />
            </div>
            <div>
              <span className="font-bold text-stone-900 dark:text-stone-100 tracking-tight text-sm block">Growth Mastery</span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-widest font-mono">Academic Portal</span>
            </div>
          </div>
          
          <div className="mt-3">
            <span className={`inline-flex text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${roleConfig.bg}`}>
              {roleConfig.label}
            </span>
          </div>
        </div>

        {/* Navigation chrome layout */}
        <nav className="flex-grow p-5 space-y-1.5">
          <div className="px-3.5 py-1 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
            Navigation
          </div>

          {/* 1. ADMIN ROLE NAVIGATION */}
          {currentUser.role === "admin" && (
            <>
              <button
                type="button"
                onClick={() => handleTabClick("admin")}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer ${
                  activeTab === "admin" 
                    ? "bg-indigo-600 text-white shadow-xs" 
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
                }`}
              >
                <UserCog size={15} />
                <span>Admin Governance</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick("teacher")}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer ${
                  activeTab === "teacher" 
                    ? "bg-indigo-600 text-white shadow-xs" 
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
                }`}
              >
                <Briefcase size={15} />
                <span>Teacher Portal</span>
              </button>
            </>
          )}

          {/* 2. TEACHER ROLE NAVIGATION */}
          {currentUser.role === "teacher" && (
            <button
              type="button"
              onClick={() => handleTabClick("teacher")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer ${
                activeTab === "teacher" 
                  ? "bg-indigo-600 text-white shadow-xs" 
                  : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
              }`}
            >
              <Briefcase size={15} />
              <span>Instructor Gradebook</span>
            </button>
          )}

          {/* 3. STUDENT & COMMON NAVIGATION */}
          <button
            type="button"
            onClick={() => handleTabClick("courses")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer ${
              activeTab === "courses" 
                ? "bg-indigo-600 text-white shadow-xs" 
                : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
            }`}
          >
            <BookOpen size={15} />
            <span>Course Directory</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick("dashboard")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer ${
              activeTab === "dashboard" 
                ? "bg-indigo-600 text-white shadow-xs" 
                : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
            }`}
          >
            <LayoutDashboard size={15} />
            <span>Learning Progress</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick("assessment")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer ${
              activeTab === "assessment" 
                ? "bg-indigo-600 text-white shadow-xs" 
                : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
            }`}
          >
            <BookMarked size={15} />
            <span>Diagnostic Assessment</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick("skill-gaps")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer ${
              activeTab === "skill-gaps" 
                ? "bg-indigo-600 text-white shadow-xs" 
                : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
            }`}
          >
            <TrendingUp size={15} />
            <span>Skills & Gap Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick("recommendations")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer ${
              activeTab === "recommendations" 
                ? "bg-indigo-600 text-white shadow-xs" 
                : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
            }`}
          >
            <Award size={15} />
            <span>Recommended Actions</span>
          </button>

          {/* Supplemental Tooling tabs */}
          <div className="pt-4 px-3.5 py-1 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
            Adaptive Utilities
          </div>

          {features.enableFreePracticeSources && (
            <button
              type="button"
              onClick={() => handleTabClick("practice-sources")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer ${
                activeTab === "practice-sources" 
                  ? "bg-indigo-600 text-white shadow-xs" 
                  : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
              }`}
            >
              <Globe size={15} />
              <span>Practice Resources</span>
            </button>
          )}

          {features.enableAIQuizStudio && (
            <button
              type="button"
              onClick={() => handleTabClick("quiz")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer ${
                activeTab === "quiz" 
                  ? "bg-indigo-600 text-white shadow-xs" 
                  : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
              }`}
            >
              <Sparkles size={15} />
              <span>Document Quiz Studio</span>
            </button>
          )}

          {features.enableAITutor && (
            <button
              type="button"
              onClick={() => handleTabClick("ai-tutor")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer ${
                activeTab === "ai-tutor" 
                  ? "bg-indigo-600 text-white shadow-xs" 
                  : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
              }`}
            >
              <MessageSquare size={15} />
              <span>AI Study Tutor</span>
            </button>
          )}

          {currentUser.role === "admin" && (
            <button
              type="button"
              onClick={() => handleTabClick("ai-telemetry")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer ${
                activeTab === "ai-telemetry" 
                  ? "bg-indigo-600 text-white shadow-xs" 
                  : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
              }`}
            >
              <Activity size={15} />
              <span>Inference Telemetry</span>
            </button>
          )}
        </nav>

        {/* Learning Preferences Form built right into Sidebar */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 space-y-2.5 bg-transparent">
          <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            <Settings size={12} />
            <span>Focus Settings</span>
          </div>
          <textarea
            rows={2}
            placeholder="e.g. Hands-on algorithms..."
            value={learningPreferences}
            onChange={(e) => setLearningPreferences(e.target.value)}
            className="w-full p-2 bg-white dark:bg-[#192231] border border-stone-200 dark:border-stone-800 rounded-lg text-[11px] text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="button"
            disabled={savingPrefs}
            onClick={handleUpdatePreferences}
            className="w-full py-1.5 bg-stone-900 hover:bg-stone-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {savingPrefs ? "Saving..." : "Apply Profile"}
          </button>
        </div>

        {/* User Account Session Info & Logout */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
          <div className="truncate min-w-0">
            <span className="text-[11px] font-bold text-stone-900 dark:text-stone-100 block truncate">{currentUser.name}</span>
            <span className="text-[9px] text-stone-400 dark:text-stone-500 block truncate">{currentUser.email}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
            title="Sign out of platform"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* 3. WIDE VIEWPORT CONTINUOUS CANVAS */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Full width flat header */}
        <header className="h-16 border-b border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#151C28] px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest font-mono">
              Workspace
            </h2>
            <span className="text-stone-300 dark:text-stone-700">/</span>
            <span className="text-sm font-bold text-stone-900 dark:text-stone-100 capitalize">
              {activeTab.replace("-", " ")}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Online Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium text-[11px] uppercase tracking-wider font-mono">Diagnostics Active</span>
            </div>

            {/* Theme toggle control */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
              title={themeMode === 'dark' ? "Switch to White Mode" : "Switch to Dark Mode"}
            >
              {themeMode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* 14. Edge-to-edge customizable layout section */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-[#FAF9F5] dark:bg-[#0B0F17]">
          
          {/* Strict single-tab proctoring warning block */}
          {showAssessmentWarning && (
            <div className="m-8 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 shadow-2xs fade-in">
              <ShieldAlert className="text-rose-600 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Academic Integrity Warning</span>
                <p className="text-xs text-rose-700 leading-relaxed">{assessmentWarningReason}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAssessmentWarning(false)} 
                className="text-rose-400 hover:text-rose-700 font-bold ml-auto"
              >
                ✕
              </button>
            </div>
          )}

          <div className="p-8 sm:p-10 max-w-6xl w-full mx-auto space-y-10">
            {activeTab === "admin" && currentUser.role === "admin" && (
              <AdminConsole 
                currentUser={currentUser} 
                onRefreshData={refreshAllState} 
              />
            )}

            {activeTab === "teacher" && (currentUser.role === "teacher" || currentUser.role === "admin") && (
              <TeacherPortal 
                currentUser={currentUser} 
                onRefreshData={refreshAllState} 
              />
            )}

            {activeTab === "courses" && (
              <StudentCourses 
                courses={domains}
                onStartAssessment={handleStartExamFromCourses}
                templates={templates}
                currentUser={currentUser}
                onRefreshData={refreshAllState}
              />
            )}

            {activeTab === "dashboard" && (
              <Dashboard 
                summary={summary || { overallCompetency: 0, topicScores: [], assessmentHistory: [], quizHistory: [], streakDays: 0, completedResourcesCount: 0 }} 
                recommendations={recommendations} 
                userName={currentUser.name}
                onNavigate={setActiveTab}
                onCompleteRec={handleCompleteRec}
              />
            )}

            {activeTab === "assessment" && (
              <AssessmentFlow 
                domains={domains}
                onStartAssessment={handleStartAssessment}
                onSubmitAssessment={handleSubmitAssessment}
                onNavigateToDashboard={() => setActiveTab("dashboard")}
                initialAssessment={practiceAssessment}
                onClearInitialAssessment={() => setPracticeAssessment(null)}
                onAssessmentStatusChange={(active, forceSubmitFn) => {
                  setIsAssessmentActive(active);
                  forceSubmitRef.current = forceSubmitFn || null;
                }}
                enableStrictProctoring={features.enableStrictProctoring}
              />
            )}

            {activeTab === "skill-gaps" && (
              <SkillGapTracker 
                skillGaps={skillGaps}
                domains={domains}
                onNavigateToAssessment={() => setActiveTab("assessment")}
                onPracticeGap={handlePracticeGap}
              />
            )}

            {activeTab === "recommendations" && (
              <RecommendationsList 
                recommendations={recommendations}
                onCompleteRec={handleCompleteRec}
                onNavigateToAssessment={() => setActiveTab("assessment")}
              />
            )}

            {activeTab === "quiz" && features.enableAIQuizStudio && (
              <MaterialQuizFlow 
                materials={materials}
                onUploadMaterial={handleUploadMaterial}
                onGenerateQuiz={handleGenerateQuiz}
                onSubmitQuiz={handleSubmitQuiz}
                onNavigateToDashboard={() => setActiveTab("dashboard")}
              />
            )}

            {activeTab === "ai-tutor" && features.enableAITutor && (
              <AITutor />
            )}

            {activeTab === "practice-sources" && features.enableFreePracticeSources && (
              <FreePracticeSources />
            )}

            {activeTab === "ai-telemetry" && currentUser.role === "admin" && (
              <AIPerformanceHub />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
