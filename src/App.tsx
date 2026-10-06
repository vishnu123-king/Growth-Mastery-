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
  Activity, LogOut, Briefcase, BookOpen, Sparkles, ChevronRight, Sun, Moon, Globe, UserCog, AlertCircle, ShieldAlert,
  Menu, X
} from "lucide-react";
import { AuthPage } from "./components/AuthPage";
import { apiFetch } from "./lib/api";
import logoUrl from "./assets/images/growth_mastery_logo_purple_1791037785600.jpg";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("courses");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
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
    setIsMobileMenuOpen(false);
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

  // Reusable navigation items renderer for both Desktop Sidebar and Mobile Drawer
  const renderNavLinks = (isMobileDrawer: boolean = false) => (
    <nav className={`flex-grow ${isMobileDrawer ? 'p-4' : 'p-5'} space-y-1`}>
      <div className="px-3.5 py-1 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
        Navigation
      </div>

      {/* 1. ADMIN ROLE NAVIGATION */}
      {currentUser.role === "admin" && (
        <>
          <button
            type="button"
            onClick={() => handleTabClick("admin")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
              activeTab === "admin" 
                ? "bg-indigo-600 text-white shadow-xs" 
                : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
            }`}
          >
            <UserCog size={16} />
            <span>Admin Governance</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick("teacher")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
              activeTab === "teacher" 
                ? "bg-indigo-600 text-white shadow-xs" 
                : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
            }`}
          >
            <Briefcase size={16} />
            <span>Teacher Portal</span>
          </button>
        </>
      )}

      {/* 2. TEACHER ROLE NAVIGATION */}
      {currentUser.role === "teacher" && (
        <button
          type="button"
          onClick={() => handleTabClick("teacher")}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
            activeTab === "teacher" 
              ? "bg-indigo-600 text-white shadow-xs" 
              : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
          }`}
        >
          <Briefcase size={16} />
          <span>Instructor Gradebook</span>
        </button>
      )}

      {/* 3. CORE COMMON NAVIGATION */}
      <button
        type="button"
        onClick={() => handleTabClick("courses")}
        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
          activeTab === "courses" 
            ? "bg-indigo-600 text-white shadow-xs" 
            : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
        }`}
      >
        <BookOpen size={16} />
        <span>Course Directory</span>
      </button>

      <button
        type="button"
        onClick={() => handleTabClick("dashboard")}
        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
          activeTab === "dashboard" 
            ? "bg-indigo-600 text-white shadow-xs" 
            : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
        }`}
      >
        <LayoutDashboard size={16} />
        <span>Learning Progress</span>
      </button>

      <button
        type="button"
        onClick={() => handleTabClick("assessment")}
        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
          activeTab === "assessment" 
            ? "bg-indigo-600 text-white shadow-xs" 
            : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
        }`}
      >
        <BookMarked size={16} />
        <span>Diagnostic Assessment</span>
      </button>

      <button
        type="button"
        onClick={() => handleTabClick("skill-gaps")}
        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
          activeTab === "skill-gaps" 
            ? "bg-indigo-600 text-white shadow-xs" 
            : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
        }`}
      >
        <TrendingUp size={16} />
        <span>Skills & Gap Matrix</span>
      </button>

      <button
        type="button"
        onClick={() => handleTabClick("recommendations")}
        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
          activeTab === "recommendations" 
            ? "bg-indigo-600 text-white shadow-xs" 
            : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
        }`}
      >
        <Award size={16} />
        <span>Recommended Actions</span>
      </button>

      {/* Supplemental Tooling tabs */}
      <div className="pt-3 px-3.5 py-1 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
        Adaptive Utilities
      </div>

      {features.enableFreePracticeSources && (
        <button
          type="button"
          onClick={() => handleTabClick("practice-sources")}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
            activeTab === "practice-sources" 
              ? "bg-indigo-600 text-white shadow-xs" 
              : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
          }`}
        >
          <Globe size={16} />
          <span>Practice Resources</span>
        </button>
      )}

      {features.enableAIQuizStudio && (
        <button
          type="button"
          onClick={() => handleTabClick("quiz")}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
            activeTab === "quiz" 
              ? "bg-indigo-600 text-white shadow-xs" 
              : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
          }`}
        >
          <Sparkles size={16} />
          <span>Document Quiz Studio</span>
        </button>
      )}

      {features.enableAITutor && (
        <button
          type="button"
          onClick={() => handleTabClick("ai-tutor")}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
            activeTab === "ai-tutor" 
              ? "bg-indigo-600 text-white shadow-xs" 
              : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
          }`}
        >
          <MessageSquare size={16} />
          <span>AI Study Tutor</span>
        </button>
      )}

      {currentUser.role === "admin" && (
        <button
          type="button"
          onClick={() => handleTabClick("ai-telemetry")}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
            activeTab === "ai-telemetry" 
              ? "bg-indigo-600 text-white shadow-xs" 
              : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/40"
          }`}
        >
          <Activity size={16} />
          <span>Inference Telemetry</span>
        </button>
      )}
    </nav>
  );

  const isEnrolledInAny = currentUser?.enrolledCourseIds && currentUser.enrolledCourseIds.length > 0;
  const isStudent = currentUser?.role === "student";

  const renderLockedUnenrolledView = (tabName: string, description: string) => (
    <div className="p-8 sm:p-12 text-center bg-white dark:bg-[#151C28] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm max-w-2xl mx-auto space-y-6 my-6 sm:my-10 fade-in">
      <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800/60 shadow-xs">
        <AlertCircle size={32} />
      </div>
      <div className="space-y-3">
        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/30">
          Learning Path Locked
        </span>
        <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-white tracking-tight pt-1">
          {tabName} Locked
        </h2>
        <p className="text-stone-600 dark:text-stone-300 text-sm max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      <div className="pt-2">
        <button
          type="button"
          onClick={() => handleTabClick("courses")}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mx-auto min-h-[44px]"
        >
          <BookOpen size={14} />
          <span>Explore Course Directory & Enroll</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#0B0F17] flex font-sans text-stone-900 dark:text-stone-100 selection:bg-indigo-600 selection:text-white" id="application-container">
      
      {/* ==================================================================== */}
      {/* MOBILE DRAWER (SLIDE-OUT MENU FOR <= 1024px VIEWPORTS)               */}
      {/* ==================================================================== */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div 
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-[#151C28] border-r border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col transform transition-transform duration-250 ease-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Mobile Drawer Header with Close Button */}
        <div className="p-4 border-b border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
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
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role Badge in Drawer */}
        <div className="px-4 pt-3">
          <span className={`inline-flex text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${roleConfig.bg}`}>
            {roleConfig.label}
          </span>
        </div>

        {/* Navigation items scrollable list */}
        <div className="flex-1 overflow-y-auto">
          {renderNavLinks(true)}
        </div>

        {/* Focus Settings in Drawer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 space-y-2 bg-stone-50/50 dark:bg-stone-900/20">
          <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            <Settings size={12} />
            <span>Focus Settings</span>
          </div>
          <textarea
            rows={2}
            placeholder="e.g. Hands-on algorithms..."
            value={learningPreferences}
            onChange={(e) => setLearningPreferences(e.target.value)}
            className="w-full p-2 bg-white dark:bg-[#192231] border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="button"
            disabled={savingPrefs}
            onClick={handleUpdatePreferences}
            className="w-full py-2 bg-stone-900 hover:bg-stone-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold rounded-lg min-h-[44px] flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {savingPrefs ? "Saving..." : "Apply Profile"}
          </button>
        </div>

        {/* User Account & Logout in Drawer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 bg-stone-50 dark:bg-stone-900/40 pb-safe">
          <div className="truncate min-w-0">
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block truncate">{currentUser.name}</span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 block truncate">{currentUser.email}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            title="Sign out of platform"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* DESKTOP SIDEBAR (>= 1024px VIEWPORTS)                                */}
      {/* ==================================================================== */}
      <aside className="hidden lg:flex lg:w-64 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-[#151C28] flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
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

        {/* Desktop Navigation Links */}
        {renderNavLinks(false)}

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

      {/* ==================================================================== */}
      {/* 3. WIDE VIEWPORT CONTINUOUS CANVAS                                  */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Responsive Header (Mobile & Desktop) */}
        <header className="h-14 sm:h-16 border-b border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#151C28] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Hamburger Button for Mobile (<1024px) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40 text-stone-700 dark:text-stone-200 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            {/* Mobile Brand Identity */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-700 via-indigo-600 to-blue-500 p-0.5 shadow-xs flex items-center justify-center shrink-0">
                <img 
                  src={logoUrl} 
                  alt="Growth Mastery Logo" 
                  className="w-full h-full object-cover rounded-[5px]" 
                />
              </div>
              <span className="font-bold text-stone-900 dark:text-stone-100 tracking-tight text-xs font-serif truncate max-w-[130px] sm:max-w-none">
                Growth Mastery
              </span>
            </div>

            {/* Desktop Breadcrumbs */}
            <div className="hidden lg:flex items-center gap-3">
              <h2 className="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest font-mono">
                Workspace
              </h2>
              <span className="text-stone-300 dark:text-stone-700">/</span>
              <span className="text-sm font-bold text-stone-900 dark:text-stone-100 capitalize">
                {activeTab.replace("-", " ")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Online Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium text-[11px] uppercase tracking-wider font-mono">Active</span>
            </div>

            {/* Theme toggle control with 44px minimum tap target */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title={themeMode === 'dark' ? "Switch to White Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme mode"
            >
              {themeMode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        {/* 14. Edge-to-edge customizable layout section */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-[#FAF9F5] dark:bg-[#0B0F17]">
          
          {/* Strict single-tab proctoring warning block */}
          {showAssessmentWarning && (
            <div className="m-4 sm:m-8 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 shadow-2xs fade-in">
              <ShieldAlert className="text-rose-600 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Academic Integrity Warning</span>
                <p className="text-xs text-rose-700 leading-relaxed">{assessmentWarningReason}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAssessmentWarning(false)} 
                className="text-rose-400 hover:text-rose-700 font-bold ml-auto min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          )}

          {/* Main content container with responsive padding and mobile bottom clearance */}
          <div className="p-4 sm:p-6 lg:p-10 max-w-6xl w-full mx-auto space-y-6 sm:space-y-10 pb-28 lg:pb-10">
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
              !isEnrolledInAny && isStudent ? (
                renderLockedUnenrolledView("Learning Progress Dashboard", "Your learning progress dashboard tracks diagnostic scores, study statistics, and weak areas. To activate progress analytics, please select and enroll in a course from our directory.")
              ) : (
                <Dashboard 
                  summary={summary || { overallCompetency: 0, topicScores: [], assessmentHistory: [], quizHistory: [], streakDays: 0, completedResourcesCount: 0 }} 
                  recommendations={recommendations} 
                  userName={currentUser.name}
                  onNavigate={setActiveTab}
                  onCompleteRec={handleCompleteRec}
                />
              )
            )}

            {activeTab === "assessment" && (
              !isEnrolledInAny && isStudent ? (
                renderLockedUnenrolledView("Diagnostic Assessment Centre", "Adaptive diagnostic exams and formal syllabus evaluations are custom-tailored to specific learning paths. Enroll in a course now to launch assessments.")
              ) : (
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
              )
            )}

            {activeTab === "skill-gaps" && (
              !isEnrolledInAny && isStudent ? (
                renderLockedUnenrolledView("Skills & Gap Matrix", "The competency gap matrix traces your evaluated strengths and weaknesses across all course topics. Enroll in a course to unlock your skill gap tracker.")
              ) : (
                <SkillGapTracker 
                  skillGaps={skillGaps}
                  domains={domains}
                  onNavigateToAssessment={() => setActiveTab("assessment")}
                  onPracticeGap={handlePracticeGap}
                />
              )
            )}

            {activeTab === "recommendations" && (
              !isEnrolledInAny && isStudent ? (
                renderLockedUnenrolledView("Remediation Recommendations", "AI study recommendations and tailored reference modules are synthesized from your diagnostic results. Select a course and complete an evaluation to generate study resources.")
              ) : (
                <RecommendationsList 
                  recommendations={recommendations}
                  onCompleteRec={handleCompleteRec}
                  onNavigateToAssessment={() => setActiveTab("assessment")}
                />
              )
            )}

            {activeTab === "quiz" && features.enableAIQuizStudio && (
              !isEnrolledInAny && isStudent ? (
                renderLockedUnenrolledView("AI Document Quiz Studio", "The AI quiz studio generates tailored diagnostic checks from study documents and lecture notes. Enroll in a learning path to begin practicing topics.")
              ) : (
                <MaterialQuizFlow 
                  materials={materials}
                  onUploadMaterial={handleUploadMaterial}
                  onGenerateQuiz={handleGenerateQuiz}
                  onSubmitQuiz={handleSubmitQuiz}
                  onNavigateToDashboard={() => setActiveTab("dashboard")}
                />
              )
            )}

            {activeTab === "ai-tutor" && features.enableAITutor && (
              !isEnrolledInAny && isStudent ? (
                renderLockedUnenrolledView("AI Study Tutor", "The interactive AI study tutor requires an active syllabus context to provide targeted academic coaching. Please select and enroll in a course.")
              ) : (
                <AITutor />
              )
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

      {/* ==================================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR (FIXED THUMB ZONE FOR <= 1024px)        */}
      {/* ==================================================================== */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#151C28]/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 lg:hidden pb-safe shadow-lg"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {/* Courses */}
          <button
            type="button"
            onClick={() => handleTabClick("courses")}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeTab === "courses" 
                ? "text-indigo-600 dark:text-indigo-400 font-bold" 
                : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <BookOpen size={18} />
            <span className="text-[10px] mt-1 tracking-tight">Courses</span>
          </button>

          {/* Progress / Dashboard */}
          <button
            type="button"
            onClick={() => handleTabClick("dashboard")}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeTab === "dashboard" 
                ? "text-indigo-600 dark:text-indigo-400 font-bold" 
                : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="text-[10px] mt-1 tracking-tight">Progress</span>
          </button>

          {/* Exams */}
          <button
            type="button"
            onClick={() => handleTabClick("assessment")}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors relative ${
              activeTab === "assessment" 
                ? "text-indigo-600 dark:text-indigo-400 font-bold" 
                : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <div className={`p-1 rounded-full ${activeTab === "assessment" ? "bg-indigo-50 dark:bg-indigo-950/60" : ""}`}>
              <BookMarked size={18} />
            </div>
            <span className="text-[10px] tracking-tight">Exams</span>
          </button>

          {/* Skills Matrix */}
          <button
            type="button"
            onClick={() => handleTabClick("skill-gaps")}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeTab === "skill-gaps" 
                ? "text-indigo-600 dark:text-indigo-400 font-bold" 
                : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <TrendingUp size={18} />
            <span className="text-[10px] mt-1 tracking-tight">Skills</span>
          </button>

          {/* More Menu Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              ["recommendations", "practice-sources", "quiz", "ai-tutor", "ai-telemetry", "admin", "teacher"].includes(activeTab)
                ? "text-indigo-600 dark:text-indigo-400 font-bold" 
                : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
            aria-label="More navigation items and settings"
          >
            <Menu size={18} />
            <span className="text-[10px] mt-1 tracking-tight">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
