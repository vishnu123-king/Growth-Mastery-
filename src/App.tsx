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
    return (localStorage.getItem("app_theme_mode") as 'light' | 'dark') || 'dark';
  });

  // Apply dark/light theme mode to both documentElement and body
  useEffect(() => {
    const isDark = themeMode === 'dark';
    if (isDark) {
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
      const [meRes, domRes, progRes, gapsRes, recRes, matRes, featRes, tmplRes] = await Promise.all([
        apiFetch("/api/v1/auth/me"),
        apiFetch("/api/v1/domains"),
        apiFetch("/api/v1/progress"),
        apiFetch("/api/v1/skill-gaps"),
        apiFetch("/api/v1/recommendations"),
        apiFetch("/api/v1/materials"),
        apiFetch("/api/v1/features"),
        apiFetch("/api/v1/assessment-templates")
      ]);

      const [me, doms, sum, gaps, recs, mats, feats, tmpls] = await Promise.all([
        meRes.json(),
        domRes.json(),
        progRes.json(),
        gapsRes.json(),
        recRes.json(),
        matRes.json(),
        featRes.json(),
        tmplRes.ok ? tmplRes.json() : []
      ]);

      setCurrentUser(me);
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
    admin: { label: "System Administrator", bg: "bg-[#D7B87B]/10 text-[#D7B87B] border border-[#D7B87B]/30" },
    teacher: { label: "Faculty Instructor", bg: "bg-[#6D927A]/10 text-[#6D927A] border border-[#6D927A]/30" },
    student: { label: "Student Scholar", bg: "bg-[#C47C4A]/10 text-[#C47C4A] border border-[#C47C4A]/30" }
  }[currentUser.role] || { label: "Learner", bg: "bg-[#222222] text-[#A8A29E] border border-[#2C2C2C]" };

  // Reusable navigation items renderer for both Desktop Sidebar and Mobile Drawer
  const renderNavLinks = (isMobileDrawer: boolean = false) => (
    <nav className={`flex-grow ${isMobileDrawer ? 'p-3' : 'p-4'} space-y-1`}>
      <div className="px-3 py-1.5 text-[11px] font-semibold text-[#78716C] uppercase tracking-wider font-mono">
        Navigation
      </div>

      {/* 1. ADMIN ROLE NAVIGATION */}
      {currentUser.role === "admin" && (
        <>
          <button
            type="button"
            onClick={() => handleTabClick("admin")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
              activeTab === "admin" 
                ? "bg-[#242424] text-[#F3EEE6] border-l-2 border-[#C47C4A] pl-2.5 font-semibold" 
                : "text-[#A8A29E] hover:text-[#F3EEE6] hover:bg-[#222222]"
            }`}
          >
            <UserCog size={16} className={activeTab === "admin" ? "text-[#C47C4A]" : "text-[#78716C]"} />
            <span>Admin Governance</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick("teacher")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
              activeTab === "teacher" 
                ? "bg-[#242424] text-[#F3EEE6] border-l-2 border-[#C47C4A] pl-2.5 font-semibold" 
                : "text-[#A8A29E] hover:text-[#F3EEE6] hover:bg-[#222222]"
            }`}
          >
            <Briefcase size={16} className={activeTab === "teacher" ? "text-[#C47C4A]" : "text-[#78716C]"} />
            <span>Teacher Portal</span>
          </button>
        </>
      )}

      {/* 2. TEACHER ROLE NAVIGATION */}
      {currentUser.role === "teacher" && (
        <button
          type="button"
          onClick={() => handleTabClick("teacher")}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
            activeTab === "teacher" 
              ? "bg-[#242424] text-[#F3EEE6] border-l-2 border-[#C47C4A] pl-2.5 font-semibold" 
              : "text-[#A8A29E] hover:text-[#F3EEE6] hover:bg-[#222222]"
          }`}
        >
          <Briefcase size={16} className={activeTab === "teacher" ? "text-[#C47C4A]" : "text-[#78716C]"} />
          <span>Instructor Gradebook</span>
        </button>
      )}

      {/* 3. CORE COMMON NAVIGATION */}
      <button
        type="button"
        onClick={() => handleTabClick("courses")}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
          activeTab === "courses" 
            ? "bg-[#242424] text-[#F3EEE6] border-l-2 border-[#C47C4A] pl-2.5 font-semibold" 
            : "text-[#A8A29E] hover:text-[#F3EEE6] hover:bg-[#222222]"
        }`}
      >
        <BookOpen size={16} className={activeTab === "courses" ? "text-[#C47C4A]" : "text-[#78716C]"} />
        <span>Course Directory</span>
      </button>

      <button
        type="button"
        onClick={() => handleTabClick("dashboard")}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
          activeTab === "dashboard" 
            ? "bg-[#242424] text-[#F3EEE6] border-l-2 border-[#C47C4A] pl-2.5 font-semibold" 
            : "text-[#A8A29E] hover:text-[#F3EEE6] hover:bg-[#222222]"
        }`}
      >
        <LayoutDashboard size={16} className={activeTab === "dashboard" ? "text-[#C47C4A]" : "text-[#78716C]"} />
        <span>Learning Progress</span>
      </button>

      <button
        type="button"
        onClick={() => handleTabClick("assessment")}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
          activeTab === "assessment" 
            ? "bg-[#242424] text-[#F3EEE6] border-l-2 border-[#C47C4A] pl-2.5 font-semibold" 
            : "text-[#A8A29E] hover:text-[#F3EEE6] hover:bg-[#222222]"
        }`}
      >
        <BookMarked size={16} className={activeTab === "assessment" ? "text-[#C47C4A]" : "text-[#78716C]"} />
        <span>Diagnostic Assessment</span>
      </button>

      <button
        type="button"
        onClick={() => handleTabClick("skill-gaps")}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
          activeTab === "skill-gaps" 
            ? "bg-[#242424] text-[#F3EEE6] border-l-2 border-[#C47C4A] pl-2.5 font-semibold" 
            : "text-[#A8A29E] hover:text-[#F3EEE6] hover:bg-[#222222]"
        }`}
      >
        <TrendingUp size={16} className={activeTab === "skill-gaps" ? "text-[#C47C4A]" : "text-[#78716C]"} />
        <span>Skills & Gap Matrix</span>
      </button>

      <button
        type="button"
        onClick={() => handleTabClick("recommendations")}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
          activeTab === "recommendations" 
            ? "bg-[#242424] text-[#F3EEE6] border-l-2 border-[#C47C4A] pl-2.5 font-semibold" 
            : "text-[#A8A29E] hover:text-[#F3EEE6] hover:bg-[#222222]"
        }`}
      >
        <Award size={16} className={activeTab === "recommendations" ? "text-[#C47C4A]" : "text-[#78716C]"} />
        <span>Recommended Actions</span>
      </button>

      {/* Supplemental Tooling tabs */}
      <div className="pt-4 px-3 py-1.5 text-[11px] font-semibold text-[#78716C] uppercase tracking-wider font-mono block">
        Adaptive Utilities
      </div>

      {features.enableFreePracticeSources && (
        <button
          type="button"
          onClick={() => handleTabClick("practice-sources")}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
            activeTab === "practice-sources" 
              ? "bg-[#242424] text-[#F3EEE6] border-l-2 border-[#C47C4A] pl-2.5 font-semibold" 
              : "text-[#A8A29E] hover:text-[#F3EEE6] hover:bg-[#222222]"
          }`}
        >
          <Globe size={16} className={activeTab === "practice-sources" ? "text-[#C47C4A]" : "text-[#78716C]"} />
          <span>Practice Resources</span>
        </button>
      )}

      {features.enableAIQuizStudio && (
        <button
          type="button"
          onClick={() => handleTabClick("quiz")}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
            activeTab === "quiz" 
              ? "bg-[#242424] text-[#F3EEE6] border-l-2 border-[#C47C4A] pl-2.5 font-semibold" 
              : "text-[#A8A29E] hover:text-[#F3EEE6] hover:bg-[#222222]"
          }`}
        >
          <Sparkles size={16} className={activeTab === "quiz" ? "text-[#C47C4A]" : "text-[#78716C]"} />
          <span>Document Quiz Studio</span>
        </button>
      )}

      {features.enableAITutor && (
        <button
          type="button"
          onClick={() => handleTabClick("ai-tutor")}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
            activeTab === "ai-tutor" 
              ? "bg-[#242424] text-[#F3EEE6] border-l-2 border-[#C47C4A] pl-2.5 font-semibold" 
              : "text-[#A8A29E] hover:text-[#F3EEE6] hover:bg-[#222222]"
          }`}
        >
          <MessageSquare size={16} className={activeTab === "ai-tutor" ? "text-[#C47C4A]" : "text-[#78716C]"} />
          <span>AI Study Tutor</span>
        </button>
      )}

      {currentUser.role === "admin" && (
        <button
          type="button"
          onClick={() => handleTabClick("ai-telemetry")}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 cursor-pointer min-h-[44px] ${
            activeTab === "ai-telemetry" 
              ? "bg-[#242424] text-[#F3EEE6] border-l-2 border-[#C47C4A] pl-2.5 font-semibold" 
              : "text-[#A8A29E] hover:text-[#F3EEE6] hover:bg-[#222222]"
          }`}
        >
          <Activity size={16} className={activeTab === "ai-telemetry" ? "text-[#C47C4A]" : "text-[#78716C]"} />
          <span>Inference Telemetry</span>
        </button>
      )}
    </nav>
  );

  const isEnrolledInAny = currentUser?.enrolledCourseIds && currentUser.enrolledCourseIds.length > 0;
  const isStudent = currentUser?.role === "student";

  const renderLockedUnenrolledView = (tabName: string, description: string) => (
    <div className="p-8 sm:p-12 text-center bg-[#1B1B1B] rounded-2xl border border-[#2C2C2C] max-w-2xl mx-auto space-y-6 my-6 sm:my-10 fade-in">
      <div className="w-14 h-14 bg-[#D7B87B]/10 text-[#D7B87B] rounded-xl flex items-center justify-center mx-auto border border-[#D7B87B]/30">
        <AlertCircle size={28} />
      </div>
      <div className="space-y-2.5">
        <span className="text-xs font-mono font-medium tracking-wider uppercase text-[#D7B87B]">
          Path Enrollment Required
        </span>
        <h2 className="text-2xl font-serif font-semibold text-[#F3EEE6] tracking-tight">
          {tabName} Locked
        </h2>
        <p className="text-[#A8A29E] text-sm max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      <div className="pt-2">
        <button
          type="button"
          onClick={() => handleTabClick("courses")}
          className="btn-copper-primary mx-auto"
        >
          <BookOpen size={15} />
          <span>Explore Course Directory & Enroll</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#151515] flex font-sans text-[#F3EEE6] selection:bg-[#C47C4A] selection:text-white" id="application-container">
      
      {/* ==================================================================== */}
      {/* MOBILE DRAWER (SLIDE-OUT MENU FOR <= 1024px VIEWPORTS)               */}
      {/* ==================================================================== */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div 
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#1B1B1B] border-r border-[#2C2C2C] shadow-2xl flex flex-col transform transition-transform duration-200 ease-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Mobile Drawer Header with Close Button */}
        <div className="p-4 border-b border-[#2C2C2C] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#242424] border border-[#2C2C2C] p-0.5 flex items-center justify-center shrink-0">
              <img 
                src={logoUrl} 
                alt="Growth Mastery Logo" 
                className="w-full h-full object-cover rounded-[6px]" 
              />
            </div>
            <div>
              <span className="font-bold text-[#F3EEE6] tracking-tight text-sm font-serif block">Growth Mastery</span>
              <span className="text-[11px] text-[#A8A29E] uppercase tracking-wider font-mono">Academic Portal</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-[#A8A29E] hover:text-[#F3EEE6] rounded-lg hover:bg-[#242424] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role Badge in Drawer */}
        <div className="px-4 pt-3 flex items-center justify-between">
          <span className={`inline-flex text-[11px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded ${roleConfig.bg}`}>
            {roleConfig.label}
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            className="px-2.5 py-1.5 rounded-lg border border-[#2C2C2C] text-[#F3EEE6] hover:bg-[#242424] transition-colors cursor-pointer flex items-center gap-1.5 min-h-[38px]"
            title={themeMode === 'dark' ? "Switch to White Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme mode"
          >
            {themeMode === 'dark' ? <Sun size={15} className="text-[#D7B87B]" /> : <Moon size={15} className="text-[#C47C4A]" />}
            <span className="text-xs font-semibold">{themeMode === 'dark' ? "White Mode" : "Dark Mode"}</span>
          </button>
        </div>

        {/* Navigation items scrollable list */}
        <div className="flex-1 overflow-y-auto">
          {renderNavLinks(true)}
        </div>

        {/* Focus Settings in Drawer */}
        <div className="p-4 border-t border-[#2C2C2C] space-y-2 bg-[#1B1B1B]">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider font-mono">
            <Settings size={12} className="text-[#C47C4A]" />
            <span>Focus Settings</span>
          </div>
          <textarea
            rows={2}
            placeholder="e.g. Algorithms & distributed state..."
            value={learningPreferences}
            onChange={(e) => setLearningPreferences(e.target.value)}
            className="w-full p-2 bg-[#222222] border border-[#2C2C2C] rounded-lg text-xs text-[#F3EEE6] focus:border-[#C47C4A]"
          />
          <button
            type="button"
            disabled={savingPrefs}
            onClick={handleUpdatePreferences}
            className="w-full py-2 bg-[#C47C4A] hover:bg-[#D18958] text-white text-xs font-semibold rounded-lg min-h-[44px] flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {savingPrefs ? "Saving..." : "Apply Profile"}
          </button>
        </div>

        {/* User Account & Logout in Drawer */}
        <div className="p-4 border-t border-[#2C2C2C] flex items-center justify-between gap-2 bg-[#181818] pb-safe">
          <div className="truncate min-w-0">
            <span className="text-xs font-medium text-[#F3EEE6] block truncate">{currentUser.name}</span>
            <span className="text-[11px] text-[#A8A29E] font-mono block truncate">{currentUser.email}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 text-[#A8A29E] hover:text-[#D96B6B] hover:bg-[#282828] rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
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
      <aside className="hidden lg:flex lg:w-64 border-r border-[#2C2C2C] bg-[#1B1B1B] flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-5 border-b border-[#2C2C2C]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#242424] border border-[#2C2C2C] p-0.5 flex items-center justify-center shrink-0">
              <img 
                src={logoUrl} 
                alt="Growth Mastery Logo" 
                className="w-full h-full object-cover rounded-[6px]" 
              />
            </div>
            <div>
              <span className="font-bold text-[#F3EEE6] tracking-tight text-sm font-serif block">Growth Mastery</span>
              <span className="text-[11px] text-[#A8A29E] uppercase tracking-wider font-mono">Academic Portal</span>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <span className={`inline-flex text-[11px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded ${roleConfig.bg}`}>
              {roleConfig.label}
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-[#2C2C2C] text-[#A8A29E] hover:text-[#F3EEE6] hover:bg-[#242424] transition-colors cursor-pointer flex items-center justify-center"
              title={themeMode === 'dark' ? "Switch to White Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme mode"
            >
              {themeMode === 'dark' ? <Sun size={14} className="text-[#D7B87B]" /> : <Moon size={14} className="text-[#C47C4A]" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        {renderNavLinks(false)}

        {/* Learning Preferences Form built right into Sidebar */}
        <div className="p-4 border-t border-[#2C2C2C] space-y-2 bg-[#1B1B1B]">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider font-mono">
            <Settings size={12} className="text-[#C47C4A]" />
            <span>Focus Settings</span>
          </div>
          <textarea
            rows={2}
            placeholder="e.g. Distributed algorithms..."
            value={learningPreferences}
            onChange={(e) => setLearningPreferences(e.target.value)}
            className="w-full p-2 bg-[#222222] border border-[#2C2C2C] rounded-lg text-xs text-[#F3EEE6] placeholder-[#78716C] focus:border-[#C47C4A]"
          />
          <button
            type="button"
            disabled={savingPrefs}
            onClick={handleUpdatePreferences}
            className="w-full py-2 bg-[#C47C4A] hover:bg-[#D18958] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {savingPrefs ? "Saving..." : "Apply Profile"}
          </button>
        </div>

        {/* User Account Session Info & Logout */}
        <div className="p-4 border-t border-[#2C2C2C] flex items-center justify-between gap-2 bg-[#181818]">
          <div className="truncate min-w-0">
            <span className="text-xs font-medium text-[#F3EEE6] block truncate">{currentUser.name}</span>
            <span className="text-[11px] text-[#A8A29E] font-mono block truncate">{currentUser.email}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 text-[#A8A29E] hover:text-[#D96B6B] hover:bg-[#282828] rounded-lg transition-colors cursor-pointer"
            title="Sign out of platform"
            aria-label="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* 3. WIDE VIEWPORT CONTINUOUS CANVAS                                  */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#151515]">
        
        {/* Responsive Header (Mobile & Desktop) */}
        <header className="h-14 sm:h-16 border-b border-[#2C2C2C] bg-[#1B1B1B] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Hamburger Button for Mobile (<1024px) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[#2C2C2C] hover:bg-[#242424] text-[#F3EEE6] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            {/* Mobile Brand Identity */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 rounded-lg bg-[#242424] border border-[#2C2C2C] p-0.5 flex items-center justify-center shrink-0">
                <img 
                  src={logoUrl} 
                  alt="Growth Mastery Logo" 
                  className="w-full h-full object-cover rounded-[5px]" 
                />
              </div>
              <span className="font-bold text-[#F3EEE6] tracking-tight text-sm font-serif truncate max-w-[130px] sm:max-w-none">
                Growth Mastery
              </span>
            </div>

            {/* Desktop Breadcrumbs */}
            <div className="hidden lg:flex items-center gap-3">
              <h2 className="text-xs font-semibold text-[#78716C] uppercase tracking-wider font-mono">
                Workspace
              </h2>
              <span className="text-[#3E3E3E]">/</span>
              <span className="text-sm font-medium text-[#F3EEE6] capitalize">
                {activeTab.replace("-", " ")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Online Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#A8A29E]">
              <span className="w-2 h-2 rounded-full bg-[#6D927A]"></span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#A8A29E]">System Online</span>
            </div>

            {/* Theme toggle control */}
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-lg border border-[#2C2C2C] hover:bg-[#242424] text-[#F3EEE6] transition-colors cursor-pointer min-h-[40px] inline-flex items-center gap-2 shadow-2xs"
              title={themeMode === 'dark' ? "Switch to White Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme mode"
            >
              {themeMode === 'dark' ? (
                <>
                  <Sun size={16} className="text-[#D7B87B]" />
                  <span className="text-xs font-semibold">White Mode</span>
                </>
              ) : (
                <>
                  <Moon size={16} className="text-[#C47C4A]" />
                  <span className="text-xs font-semibold">Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* 14. Edge-to-edge customizable layout section */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-[#151515]">
          
          {/* Strict single-tab proctoring warning block */}
          {showAssessmentWarning && (
            <div className="m-4 sm:m-8 p-4 bg-[#D96B6B]/15 border border-[#D96B6B]/35 rounded-xl flex items-start gap-3 shadow-2xs fade-in">
              <ShieldAlert className="text-[#D96B6B] shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#D96B6B] uppercase tracking-wider">Academic Integrity Notice</span>
                <p className="text-xs text-[#F3EEE6] leading-relaxed">{assessmentWarningReason}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAssessmentWarning(false)} 
                className="text-[#D96B6B] hover:text-white font-bold ml-auto min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          )}

          {/* Main content container with responsive padding and mobile bottom clearance */}
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8 pb-28 lg:pb-10">
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
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#1B1B1B]/95 backdrop-blur-xs border-t border-[#2C2C2C] lg:hidden pb-safe shadow-lg"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {/* Courses */}
          <button
            type="button"
            onClick={() => handleTabClick("courses")}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeTab === "courses" 
                ? "text-[#C47C4A] font-semibold" 
                : "text-[#A8A29E] hover:text-[#F3EEE6]"
            }`}
          >
            <BookOpen size={18} />
            <span className="text-[11px] mt-1 tracking-tight">Courses</span>
          </button>

          {/* Progress / Dashboard */}
          <button
            type="button"
            onClick={() => handleTabClick("dashboard")}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeTab === "dashboard" 
                ? "text-[#C47C4A] font-semibold" 
                : "text-[#A8A29E] hover:text-[#F3EEE6]"
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="text-[11px] mt-1 tracking-tight">Progress</span>
          </button>

          {/* Exams */}
          <button
            type="button"
            onClick={() => handleTabClick("assessment")}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors relative ${
              activeTab === "assessment" 
                ? "text-[#C47C4A] font-semibold" 
                : "text-[#A8A29E] hover:text-[#F3EEE6]"
            }`}
          >
            <BookMarked size={18} />
            <span className="text-[11px] mt-1 tracking-tight">Exams</span>
          </button>

          {/* Skills Matrix */}
          <button
            type="button"
            onClick={() => handleTabClick("skill-gaps")}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              activeTab === "skill-gaps" 
                ? "text-[#C47C4A] font-semibold" 
                : "text-[#A8A29E] hover:text-[#F3EEE6]"
            }`}
          >
            <TrendingUp size={18} />
            <span className="text-[11px] mt-1 tracking-tight">Skills</span>
          </button>

          {/* More Menu Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
              ["recommendations", "practice-sources", "quiz", "ai-tutor", "ai-telemetry", "admin", "teacher"].includes(activeTab)
                ? "text-[#C47C4A] font-semibold" 
                : "text-[#A8A29E] hover:text-[#F3EEE6]"
            }`}
            aria-label="More navigation items and settings"
          >
            <Menu size={18} />
            <span className="text-[11px] mt-1 tracking-tight">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
