import React, { useState, useEffect } from "react";
import { User, UserRole, LearningDomain, AssessmentTemplate, FeatureFlags, StudentAssessmentReport, Question } from "../types";
import { apiFetch } from "../lib/api";
import { 
  Users, 
  BookOpen, 
  FileCheck, 
  Award, 
  Settings2, 
  Plus, 
  Trash2, 
  Edit3, 
  Key, 
  Check, 
  X, 
  Clock, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  ToggleLeft, 
  ToggleRight,
  Send,
  UserPlus,
  Loader2,
  Sparkles,
  Search,
  BarChart3
} from "lucide-react";

interface AdminConsoleProps {
  currentUser: User;
  onRefreshData?: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({ currentUser, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'assessments' | 'reports' | 'features'>('overview');
  
  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<LearningDomain[]>([]);
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [reports, setReports] = useState<StudentAssessmentReport[]>([]);
  const [features, setFeatures] = useState<FeatureFlags>({
    enableAIAssessments: true,
    enableAITutor: true,
    enableAIQuizStudio: true,
    enableStrictProctoring: true,
    enableFreePracticeSources: true,
    enableStudentRegistration: true,
    enablePeerDiscussions: true
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Filter & Search states
  const [userSearch, setUserSearch] = useState<string>("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [reportSearch, setReportSearch] = useState<string>("");

  // Notification banners
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Modal States
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUserData, setNewUserData] = useState({ name: "", email: "", password: "", role: "student" as UserRole });
  
  const [showEditUserModal, setShowEditUserModal] = useState<boolean>(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [editUserData, setEditUserData] = useState({ name: "", email: "", role: "student" as UserRole, password: "" });

  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");

  const [showAddCourseModal, setShowAddCourseModal] = useState<boolean>(false);
  const [newCourseData, setNewCourseData] = useState({ name: "", description: "", deadline: "", instructor: "" });

  const [showAddAssessmentModal, setShowAddAssessmentModal] = useState<boolean>(false);
  const [newAssessmentData, setNewAssessmentData] = useState<{
    title: string;
    description: string;
    domainId: string;
    timeLimitMinutes: number;
    deadline: string;
    proctoringStrict: boolean;
    questions: Question[];
  }>({
    title: "",
    description: "",
    domainId: "",
    timeLimitMinutes: 15,
    deadline: "",
    proctoringStrict: true,
    questions: []
  });

  const [showAssignCourseModal, setShowAssignCourseModal] = useState<boolean>(false);
  const [selectedCourseForAssign, setSelectedCourseForAssign] = useState<LearningDomain | null>(null);
  const [selectedStudentIdsForCourse, setSelectedStudentIdsForCourse] = useState<string[]>([]);

  const [showAssignExamModal, setShowAssignExamModal] = useState<boolean>(false);
  const [selectedExamForAssign, setSelectedExamForAssign] = useState<AssessmentTemplate | null>(null);
  const [selectedStudentIdsForExam, setSelectedStudentIdsForExam] = useState<string[]>([]);

  const [inspectStudentReport, setInspectStudentReport] = useState<StudentAssessmentReport | null>(null);

  const showNotification = (msg: string, isError = false) => {
    if (isError) setErrorMsg(msg);
    else setSuccessMsg(msg);
    setTimeout(() => {
      setErrorMsg("");
      setSuccessMsg("");
    }, 4500);
  };

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, coursesRes, templatesRes, reportsRes, featuresRes] = await Promise.all([
        apiFetch("/api/v1/users"),
        apiFetch("/api/v1/domains"),
        apiFetch("/api/v1/assessment-templates"),
        apiFetch("/api/v1/reports/students"),
        apiFetch("/api/v1/features")
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (templatesRes.ok) setTemplates(await templatesRes.json());
      if (reportsRes.ok) setReports(await reportsRes.json());
      if (featuresRes.ok) setFeatures(await featuresRes.json());
    } catch (err: any) {
      console.error("Admin data fetch error:", err);
      showNotification("Failed to refresh records", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  // Handlers for User Management
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/api/v1/auth/register-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserData)
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create user account");
      }
      showNotification(`Account created for ${newUserData.name}.`);
      setShowAddUserModal(false);
      setNewUserData({ name: "", email: "", password: "", role: "student" });
      fetchAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    try {
      const res = await apiFetch(`/api/v1/users/${selectedUserForEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editUserData)
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to update profile");
      }
      showNotification(`Updated profile for ${editUserData.name}.`);
      setShowEditUserModal(false);
      fetchAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword || !newPassword.trim()) return;
    try {
      const res = await apiFetch(`/api/v1/users/${selectedUserForPassword.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to reset password");
      }
      showNotification(`Password updated for ${selectedUserForPassword.name}.`);
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleToggleUserDisabled = async (user: User) => {
    const action = user.disabled ? "enable" : "disable";
    try {
      const res = await apiFetch(`/api/v1/users/${user.id}/${action}`, { method: "POST" });
      if (!res.ok) throw new Error(`Failed to ${action} user`);
      showNotification(`User account ${user.disabled ? "enabled" : "disabled"}.`);
      fetchAllAdminData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (confirm(`Permanently remove account for ${name}?`)) {
      try {
        const res = await apiFetch(`/api/v1/users/${userId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete user account");
        showNotification(`User account deleted.`);
        fetchAllAdminData();
      } catch (err: any) {
        showNotification(err.message, true);
      }
    }
  };

  // Handlers for Course Management
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/api/v1/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourseData)
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to add course");
      }
      showNotification(`Course "${newCourseData.name}" added.`);
      setShowAddCourseModal(false);
      setNewCourseData({ name: "", description: "", deadline: "", instructor: "" });
      fetchAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleUpdateCourseDeadline = async (courseId: string, deadline: string) => {
    try {
      const res = await apiFetch(`/api/v1/courses/${courseId}/deadline`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deadline })
      });
      if (res.ok) {
        showNotification("Course deadline updated.");
        fetchAllAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleSaveCourseAssignment = async () => {
    if (!selectedCourseForAssign) return;
    try {
      const res = await apiFetch(`/api/v1/courses/${selectedCourseForAssign.id}/assign-students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: selectedStudentIdsForCourse })
      });
      if (!res.ok) throw new Error("Failed to assign student cohort");
      showNotification(`Assigned students to ${selectedCourseForAssign.name}.`);
      setShowAssignCourseModal(false);
      fetchAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm("Delete this course and its associated competency sets?")) {
      try {
        const res = await apiFetch(`/api/v1/courses/${courseId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete course");
        showNotification("Course removed.");
        fetchAllAdminData();
        if (onRefreshData) onRefreshData();
      } catch (err: any) {
        showNotification(err.message, true);
      }
    }
  };

  // Handlers for Assessment Template Management
  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/api/v1/assessment-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAssessmentData,
          questions: newAssessmentData.questions.length > 0 ? newAssessmentData.questions : undefined
        })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create assessment");
      }
      showNotification(`Exam "${newAssessmentData.title}" created.`);
      setShowAddAssessmentModal(false);
      setNewAssessmentData({
        title: "",
        description: "",
        domainId: "",
        timeLimitMinutes: 15,
        deadline: "",
        proctoringStrict: true,
        questions: []
      });
      fetchAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleSaveExamAssignment = async () => {
    if (!selectedExamForAssign) return;
    try {
      const res = await apiFetch(`/api/v1/assessment-templates/${selectedExamForAssign.id}/assign-students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: selectedStudentIdsForExam })
      });
      if (!res.ok) throw new Error("Failed to assign students to exam");
      showNotification(`Assigned students to ${selectedExamForAssign.title}.`);
      setShowAssignExamModal(false);
      fetchAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm("Delete this scheduled examination?")) {
      try {
        const res = await apiFetch(`/api/v1/assessment-templates/${templateId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete exam");
        showNotification("Examination deleted.");
        fetchAllAdminData();
        if (onRefreshData) onRefreshData();
      } catch (err: any) {
        showNotification(err.message, true);
      }
    }
  };

  // Feature Toggles Handler
  const handleToggleFeature = async (featureKey: keyof FeatureFlags) => {
    const updatedFeatures = { ...features, [featureKey]: !features[featureKey] };
    try {
      const res = await apiFetch("/api/v1/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFeatures)
      });
      if (res.ok) {
        setFeatures(updatedFeatures);
        showNotification(`Feature flag "${featureKey}" updated.`);
        if (onRefreshData) onRefreshData();
      }
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered reports
  const filteredReports = reports.filter(r => {
    return r.student.name.toLowerCase().includes(reportSearch.toLowerCase()) || r.student.email.toLowerCase().includes(reportSearch.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-3">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-slate-500 text-xs font-semibold">Synchronizing administrator governance console...</p>
      </div>
    );
  }

  const allStudents = users.filter(u => u.role === "student");

  return (
    <div className="space-y-7 min-h-full" id="admin-console-root">
      {/* Notifications */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between font-semibold fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg("")} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between font-semibold fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg("")} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px] uppercase tracking-wider">
              Governance Console
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">{currentUser.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            System Administration
          </h1>
        </div>

        <button
          type="button"
          onClick={fetchAllAdminData}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
        >
          <RefreshCw size={13} />
          <span>Sync Records</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold overflow-x-auto gap-1">
        {[
          { id: 'overview', label: 'Platform Overview', icon: BarChart3 },
          { id: 'users', label: `Accounts (${users.length})`, icon: Users },
          { id: 'courses', label: `Courses (${courses.length})`, icon: BookOpen },
          { id: 'assessments', label: `Scheduled Exams (${templates.length})`, icon: FileCheck },
          { id: 'reports', label: `Student Marks (${reports.length})`, icon: Award },
          { id: 'features', label: 'Runtime Telemetry', icon: Settings2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3.5 transition-all cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? "border-purple-600 text-purple-800 dark:text-purple-400 font-extrabold bg-purple-50/90 dark:bg-purple-950/30 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
            >
              <Icon size={15} className={isActive ? "text-purple-600" : "text-slate-400"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 pl-5 rounded-xl border-l-4 border-purple-500 bg-purple-50/30 dark:bg-purple-950/10 space-y-1.5 shadow-2xs">
              <div className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Total Accounts</div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">{users.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {users.filter(u => u.role === 'student').length} students · {users.filter(u => u.role === 'teacher').length} faculty
              </div>
            </div>

            <div className="p-4 pl-5 rounded-xl border-l-4 border-blue-500 bg-blue-50/30 dark:bg-blue-950/10 space-y-1.5 shadow-2xs">
              <div className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Active Courses</div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">{courses.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Enrolled cohorts</div>
            </div>

            <div className="p-4 pl-5 rounded-xl border-l-4 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-1.5 shadow-2xs">
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Scheduled Exams</div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">{templates.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Proctored assessments</div>
            </div>

            <div className="p-4 pl-5 rounded-xl border-l-4 border-amber-500 bg-amber-50/30 dark:bg-amber-950/10 space-y-1.5 shadow-2xs">
              <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Proctoring Lock</div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {features.enableStrictProctoring ? "Active" : "Off"}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Single-tab continuity</div>
            </div>
          </div>

          {/* HIGH-DENSITY ADMINISTRATIVE DASHBOARD GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            
            {/* Left Side: Alerts & Feed (Span 8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Student Intervention Alerts */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#151C28] border border-slate-200 dark:border-stone-800/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Student Intervention Alerts</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Enrolled learners currently falling below the 75% performance benchmark.</p>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg self-start sm:self-auto shrink-0">
                    {reports.filter(r => r.averageScore < 75).length} Alerts Active
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-stone-800/40">
                  {reports.filter(r => r.averageScore < 75).length === 0 ? (
                    <div className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center font-medium">
                      All active student scores are currently above the 75% academic threshold.
                    </div>
                  ) : (
                    reports.filter(r => r.averageScore < 75).slice(0, 3).map(alert => (
                      <div key={alert.student.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{alert.student.name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-stone-500 block truncate">{alert.student.email}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">{alert.averageScore}% average</span>
                            <span className="text-[9px] text-slate-400 dark:text-stone-500 block">{alert.weakTopicsCount} weak competencies</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setInspectStudentReport(alert);
                              setActiveTab('reports');
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Diagnose
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Activity Ledger */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#151C28] border border-slate-200 dark:border-stone-800/80 shadow-xs space-y-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Platform Activity</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Real-time chronicle of student registrations, assessments, and system telemetry checks.</p>
                </div>

                <div className="space-y-3.5">
                  {[
                    { id: 1, text: "New Student registered to platform", detail: `${users.filter(u => u.role === 'student').slice(-1)[0]?.name || "John Doe"} (${users.filter(u => u.role === 'student').slice(-1)[0]?.email || "student@skillgap.ai"})`, time: "Just now" },
                    { id: 2, text: "Scheduled Exam Board status checked", detail: `${templates[0]?.title || "Python Programming Midterm"} assignment updated`, time: "12 mins ago" },
                    { id: 3, text: "Syllabus Track created", detail: `${courses[0]?.name || "Python Programming"} initialized for cohorts`, time: "2 hours ago" },
                    { id: 4, text: "Strict Proctoring Single-Tab continuity verified", detail: "Self-proctored learning diagnostic engine state check passed", time: "System-wide" }
                  ].map(activity => (
                    <div key={activity.id} className="flex items-start gap-3.5 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-1.5 shrink-0" />
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 dark:text-white truncate">{activity.text}</span>
                          <span className="text-[10px] text-slate-400 dark:text-stone-500 shrink-0 font-mono">{activity.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{activity.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Side: Insights & Performance (Span 4) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* AI Platform Insights Area */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50/50 to-indigo-50/20 dark:from-purple-950/10 dark:to-indigo-950/5 border border-purple-200/50 dark:border-purple-900/20 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <Sparkles size={16} />
                  <h3 className="text-sm font-bold">AI Platform Insights</h3>
                </div>

                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#0B0F17]/60 border border-purple-100/40 dark:border-purple-950/40 space-y-1.5">
                    <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest block">System Diagnostics</span>
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans font-medium">
                      "18% of active students are showing difficulty with Python exception handling."
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                      Recommended Action: Assign targeted practice resources in Exception Control.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#0B0F17]/60 border border-purple-100/40 dark:border-purple-950/40 space-y-1.5">
                    <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest block">Curriculum Alignment</span>
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans font-medium">
                      "Object-Oriented polymorphism tracks are showing high student mastery velocity."
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                      Insight: Perfect for peer-to-peer student tutoring modules.
                    </p>
                  </div>
                </div>
              </div>

              {/* Platform Activity & Health */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#151C28] border border-slate-200 dark:border-stone-800/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Platform Activity & Health</h3>
                
                <div className="space-y-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-stone-800/30">
                    <span>AI Engine Status</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Online
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-stone-800/30">
                    <span>Average AI Latency</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">420 ms</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-stone-800/30">
                    <span>Database Engine</span>
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Swarm S-1
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>Proctoring Mode</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Tab-Locked</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB 2: USERS & PASSWORDS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs w-60 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="py-1.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer text-slate-700"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Instructors</option>
                <option value="admin">Administrators</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus size={14} />
              <span>Create Account</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Courses</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => {
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-400">{user.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          user.role === 'admin' ? "bg-purple-100 text-purple-800" :
                          user.role === 'teacher' ? "bg-emerald-100 text-emerald-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {user.disabled ? (
                          <span className="inline-block text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                            Disabled
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium tabular-nums">
                        {user.enrolledCourseIds ? `${user.enrolledCourseIds.length} Courses` : "All open"}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForEdit(user);
                            setEditUserData({ name: user.name, email: user.email, role: user.role, password: "" });
                            setShowEditUserModal(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Edit User"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForPassword(user);
                            setShowPasswordModal(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Reset Password"
                        >
                          <Key size={14} />
                        </button>

                        {user.email !== "admin@skillgap.ai" && (
                          <button
                            type="button"
                            onClick={() => handleToggleUserDisabled(user)}
                            className={`p-1.5 rounded-lg cursor-pointer ${
                              user.disabled ? "text-emerald-700 hover:bg-emerald-50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            }`}
                            title={user.disabled ? "Enable Account" : "Disable Account"}
                          >
                            {user.disabled ? <UserCheck size={14} /> : <UserX size={14} />}
                          </button>
                        )}

                        {user.email !== "admin@skillgap.ai" && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COURSES & ASSIGN STUDENTS */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Manage course directory, deadlines, and cohort enrollments.
            </div>
            <button
              type="button"
              onClick={() => setShowAddCourseModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <div key={course.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 hover:border-slate-300 shadow-xs transition-colors flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{course.name}</h3>
                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      title="Delete Course"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">{course.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="text-slate-500 flex items-center justify-between font-medium">
                    <span className="font-bold text-slate-700">Instructor:</span>
                    <span>{course.instructor || "Faculty Instructor"}</span>
                  </div>

                  <div className="text-slate-500 flex items-center justify-between gap-2 font-medium">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Calendar size={12} /> Deadline:
                    </span>
                    <input
                      type="date"
                      defaultValue={course.deadline || ""}
                      onChange={(e) => handleUpdateCourseDeadline(course.id, e.target.value)}
                      className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none text-slate-700"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourseForAssign(course);
                      setSelectedStudentIdsForCourse(course.assignedStudentIds || allStudents.map(s => s.id));
                      setShowAssignCourseModal(true);
                    }}
                    className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <UserPlus size={13} />
                    <span>Assign Students ({course.enrolledStudentsCount || course.assignedStudentIds?.length || 0})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EXAMS & ASSIGN STUDENTS */}
      {activeTab === 'assessments' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-stone-800/40">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Scheduled Board Examinations</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure timed examinations with tab-lock proctoring policies and target student assignments.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddAssessmentModal(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus size={14} />
              <span>Create Assessment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates.map(tmpl => {
              const domain = courses.find(c => c.id === tmpl.domainId);
              return (
                <div key={tmpl.id} className="bg-white dark:bg-[#151C28] border border-slate-200 dark:border-stone-800/80 rounded-2xl p-5 space-y-4 hover:border-slate-300 dark:hover:border-stone-700 shadow-2xs transition-all relative flex flex-col justify-between">
                  
                  {/* Delete Button top right */}
                  <div className="absolute top-4 right-4">
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(tmpl.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg cursor-pointer transition-colors"
                      title="Delete Exam"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {/* 1. Assessment Title & Header */}
                    <div className="space-y-1 pr-6">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight leading-snug">
                        {tmpl.title}
                      </h3>
                      <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold font-mono tracking-wider">
                        Course: {domain?.name || "General Curriculum"}
                      </div>
                    </div>

                    {/* 2. Description */}
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-sans line-clamp-2">
                      {tmpl.description}
                    </p>

                    {/* 3. Due Date Callout */}
                    <div className="flex items-center gap-1.5 py-0.5 text-xs">
                      <Calendar size={13} className="text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold text-slate-900 dark:text-white">Due Date:</span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium bg-purple-50/50 dark:bg-purple-950/10 px-2 py-0.5 rounded-md text-[11px]">
                        {tmpl.deadline || "Ongoing / Open"}
                      </span>
                    </div>

                    {/* 4. Duration, Proctoring & Question Counts (Unboxed metadata separator style) */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-500 dark:text-stone-400 text-[11px] font-mono pt-3 border-t border-slate-100 dark:border-stone-800/40">
                      <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <Clock size={11} className="text-purple-600 dark:text-purple-400" /> {tmpl.timeLimitMinutes}m
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <ShieldAlert size={11} className="text-purple-600 dark:text-purple-400" /> Locked
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{tmpl.questions?.length || 0} Qs</span>
                    </div>
                  </div>

                  {/* 5. CTA Action (Subtle secondary outline button) */}
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedExamForAssign(tmpl);
                        setSelectedStudentIdsForExam(tmpl.assignedStudentIds || allStudents.map(s => s.id));
                        setShowAssignExamModal(true);
                      }}
                      className="w-full py-2 bg-transparent hover:bg-purple-50/20 dark:hover:bg-purple-950/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30 hover:border-purple-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send size={13} />
                      <span>Assign Cohort ({tmpl.assignedStudentIds?.length || "All"})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: STUDENT MARKS & GRADEBOOKS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Student examination records, average grade calculations, and answer transcripts.
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student marks..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs w-60 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Exams Completed</th>
                  <th className="py-3 px-4">Average Grade</th>
                  <th className="py-3 px-4">Identified Gaps</th>
                  <th className="py-3 px-4">Last Graded Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map(rep => (
                  <tr key={rep.student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{rep.student.name}</div>
                      <div className="text-[11px] text-slate-400">{rep.student.email}</div>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums font-semibold text-slate-700">
                      {rep.assessmentCount}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-xs font-extrabold px-2.5 py-0.5 rounded-full tabular-nums ${
                        rep.averageScore >= 80 ? "bg-emerald-100 text-emerald-800" :
                        rep.averageScore >= 50 ? "bg-blue-100 text-blue-800" :
                        "bg-rose-100 text-rose-800"
                      }`}>
                        {rep.averageScore}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-rose-700 font-bold">
                      {rep.weakTopicsCount} Topics
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-400 tabular-nums">
                      {rep.lastAssessmentDate ? new Date(rep.lastAssessmentDate).toLocaleDateString() : "No attempts"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectStudentReport(rep)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold cursor-pointer shadow-2xs"
                      >
                        Inspect Transcript
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: FEATURE TOGGLES */}
      {activeTab === 'features' && (
        <div className="space-y-4 max-w-2xl">
          <div className="text-xs text-slate-500">
            Runtime capability flags and security policy governance.
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-xs">
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm block">Strict Tab-Lock Proctoring</span>
                <span className="text-slate-500 text-xs">Auto-submit exam if student switches tab or minimizes window.</span>
              </div>
              <button type="button" onClick={() => handleToggleFeature('enableStrictProctoring')} className="cursor-pointer">
                {features.enableStrictProctoring ? <ToggleRight size={36} className="text-purple-600" /> : <ToggleLeft size={36} className="text-slate-300" />}
              </button>
            </div>
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm block">AI Dynamic Question Generation</span>
                <span className="text-slate-500 text-xs">Allow diagnostic multiple-choice question generation.</span>
              </div>
              <button type="button" onClick={() => handleToggleFeature('enableAIAssessments')} className="cursor-pointer">
                {features.enableAIAssessments ? <ToggleRight size={36} className="text-purple-600" /> : <ToggleLeft size={36} className="text-slate-300" />}
              </button>
            </div>
            <div className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm block">AI Computer Science Tutor</span>
                <span className="text-slate-500 text-xs">Interactive assistant grounded in student weak competencies.</span>
              </div>
              <button type="button" onClick={() => handleToggleFeature('enableAITutor')} className="cursor-pointer">
                {features.enableAITutor ? <ToggleRight size={36} className="text-purple-600" /> : <ToggleLeft size={36} className="text-slate-300" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      {/* MODAL: ASSIGN STUDENTS TO COURSE */}
      {showAssignCourseModal && selectedCourseForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Enrollment Manager</span>
                <h3 className="font-bold text-slate-900 text-base">Assign to {selectedCourseForAssign.name}</h3>
              </div>
              <button type="button" onClick={() => setShowAssignCourseModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
              {allStudents.map(student => {
                const isSelected = selectedStudentIdsForCourse.includes(student.id);
                return (
                  <label key={student.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs cursor-pointer hover:border-purple-400 shadow-2xs">
                    <div>
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <div className="text-[10px] text-slate-400">{student.email}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudentIdsForCourse(prev => [...prev, student.id]);
                        } else {
                          setSelectedStudentIdsForCourse(prev => prev.filter(id => id !== student.id));
                        }
                      }}
                      className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAssignCourseModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCourseAssignment}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm"
              >
                Save Enrollments ({selectedStudentIdsForCourse.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN STUDENTS TO EXAM */}
      {showAssignExamModal && selectedExamForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Exam Scheduler</span>
                <h3 className="font-bold text-slate-900 text-base">Assign Cohort: {selectedExamForAssign.title}</h3>
              </div>
              <button type="button" onClick={() => setShowAssignExamModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
              {allStudents.map(student => {
                const isSelected = selectedStudentIdsForExam.includes(student.id);
                return (
                  <label key={student.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs cursor-pointer hover:border-purple-400 shadow-2xs">
                    <div>
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <div className="text-[10px] text-slate-400">{student.email}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudentIdsForExam(prev => [...prev, student.id]);
                        } else {
                          setSelectedStudentIdsForExam(prev => prev.filter(id => id !== student.id));
                        }
                      }}
                      className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAssignExamModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveExamAssignment}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm"
              >
                Save Exam Assignments ({selectedStudentIdsForExam.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Create User Account</h3>
              <button type="button" onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="jane@university.edu"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Instructor / Faculty</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {showEditUserModal && selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Edit User Profile</h3>
              <button type="button" onClick={() => setShowEditUserModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editUserData.name}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editUserData.email}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={editUserData.role}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Instructor / Faculty</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {showPasswordModal && selectedUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Reset Password</h3>
              <button type="button" onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-xs text-slate-600">
                Set a new password for <strong className="text-slate-900">{selectedUserForPassword.name}</strong>.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD COURSE */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Add Course to Directory</h3>
              <button type="button" onClick={() => setShowAddCourseModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Computer Networks & Distributed Systems"
                  value={newCourseData.name}
                  onChange={(e) => setNewCourseData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Brief curriculum overview..."
                  value={newCourseData.description}
                  onChange={(e) => setNewCourseData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Instructor</label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. Alan Turing"
                    value={newCourseData.instructor}
                    onChange={(e) => setNewCourseData(prev => ({ ...prev, instructor: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={newCourseData.deadline}
                    onChange={(e) => setNewCourseData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ASSESSMENT */}
      {showAddAssessmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Create Scheduled Examination</h3>
              <button type="button" onClick={() => setShowAddAssessmentModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Exam Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Final Exam: Software Engineering"
                  value={newAssessmentData.title}
                  onChange={(e) => setNewAssessmentData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Course Domain *</label>
                <select
                  required
                  value={newAssessmentData.domainId}
                  onChange={(e) => setNewAssessmentData(prev => ({ ...prev, domainId: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="">Select course domain...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Exam Description</label>
                <textarea
                  rows={2}
                  placeholder="Instructions for students..."
                  value={newAssessmentData.description}
                  onChange={(e) => setNewAssessmentData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Limit (Mins)</label>
                  <input
                    type="number"
                    min={5}
                    value={newAssessmentData.timeLimitMinutes}
                    onChange={(e) => setNewAssessmentData(prev => ({ ...prev, timeLimitMinutes: parseInt(e.target.value) || 15 }))}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={newAssessmentData.deadline}
                    onChange={(e) => setNewAssessmentData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAssessmentModal(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Create Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSPECT TRANSCRIPT */}
      {inspectStudentReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Student Academic Transcript</h3>
                <p className="text-xs text-slate-500">{inspectStudentReport.student.name} ({inspectStudentReport.student.email})</p>
              </div>
              <button type="button" onClick={() => setInspectStudentReport(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase">Average Score</div>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">{inspectStudentReport.averageScore}%</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase">Exams Taken</div>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">{inspectStudentReport.assessmentCount}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase">Weak Topics</div>
                <div className="text-2xl font-extrabold text-rose-700 tabular-nums">{inspectStudentReport.weakTopicsCount}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Topic Competency Breakdown</h4>
              <div className="space-y-2">
                {inspectStudentReport.topicBreakdowns.map((t, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{t.competencyName}</span>
                      <div className="text-[11px] text-slate-400">{t.domainName}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold tabular-nums text-slate-800">{t.score}%</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.score >= 80 ? "bg-emerald-100 text-emerald-800" : t.score >= 50 ? "bg-blue-100 text-blue-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {t.score >= 80 ? "Proficient" : t.score >= 50 ? "Moderate" : "Needs Focus"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectStudentReport(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
