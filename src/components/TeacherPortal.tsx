import React, { useState, useEffect } from "react";
import { User, LearningDomain, AssessmentTemplate, StudentAssessmentReport, Question } from "../types";
import { apiFetch } from "../lib/api";
import { 
  BookOpen, 
  FileCheck, 
  Award, 
  Users, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Loader2,
  Sparkles,
  RotateCcw,
  Activity,
  Briefcase
} from "lucide-react";

interface TeacherPortalProps {
  currentUser: User;
  onRefreshData?: () => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({ currentUser, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<'assessments' | 'courses' | 'gradebook' | 'submissions' | 'analysis'>('assessments');
  const [courses, setCourses] = useState<LearningDomain[]>([]);
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [reports, setReports] = useState<StudentAssessmentReport[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [studentAnalysis, setStudentAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Notification banner state
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Create exam modal
  const [showCreateExamModal, setShowCreateExamModal] = useState<boolean>(false);
  const [creatingExam, setCreatingExam] = useState<boolean>(false);
  const [newExam, setNewExam] = useState<{
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
    timeLimitMinutes: 20,
    deadline: "",
    proctoringStrict: true,
    questions: []
  });

  // Delete Exam modal
  const [examToDelete, setExamToDelete] = useState<{ id: string; title: string } | null>(null);

  // Inspect Student Modal
  const [selectedStudentReport, setSelectedStudentReport] = useState<StudentAssessmentReport | null>(null);

  const showNotification = (msg: string, isError = false) => {
    if (isError) setErrorMsg(msg);
    else setSuccessMsg(msg);
    setTimeout(() => {
      setErrorMsg("");
      setSuccessMsg("");
    }, 4500);
  };

  const fetchPortalData = async () => {
    setLoading(true);
    try {
      const [coursesRes, templatesRes, reportsRes, subsRes, analysisRes] = await Promise.all([
        apiFetch("/api/v1/domains"),
        apiFetch("/api/v1/assessment-templates"),
        apiFetch("/api/v1/reports/students"),
        apiFetch("/api/v1/teacher/submissions"),
        apiFetch("/api/v1/teacher/student-analysis")
      ]);

      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (templatesRes.ok) setTemplates(await templatesRes.json());
      if (reportsRes.ok) setReports(await reportsRes.json());
      if (subsRes.ok) setSubmissions(await subsRes.json());
      if (analysisRes.ok) setStudentAnalysis(await analysisRes.json());
    } catch (err: any) {
      console.error("Failed to load teacher portal data:", err);
      showNotification("Failed to refresh records", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  const handleCreateExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.title.trim() || !newExam.domainId) {
      showNotification("Please provide both exam title and course domain", true);
      return;
    }

    setCreatingExam(true);
    try {
      const res = await apiFetch("/api/v1/assessment-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newExam,
          questions: newExam.questions.length > 0 ? newExam.questions : undefined
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create examination");
      }

      showNotification(`Exam "${newExam.title}" scheduled successfully.`);
      setShowCreateExamModal(false);
      setNewExam({
        title: "",
        description: "",
        domainId: "",
        timeLimitMinutes: 20,
        deadline: "",
        proctoringStrict: true,
        questions: []
      });
      fetchPortalData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      showNotification(err.message || "Failed to schedule exam", true);
    } finally {
      setCreatingExam(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!examToDelete) return;
    try {
      const res = await apiFetch(`/api/v1/assessment-templates/${examToDelete.id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete exam");
      showNotification(`Deleted examination "${examToDelete.title}".`);
      setExamToDelete(null);
      fetchPortalData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      showNotification(err.message || "Failed to delete exam", true);
    }
  };

  const handleStudentControl = async (studentId: string, action: string, studentName: string) => {
    try {
      const res = await apiFetch("/api/v1/teacher/student-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, action })
      });
      if (res.ok) {
        showNotification(`Assessment records reset for ${studentName}. Student may now retake assigned exams.`);
        fetchPortalData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err: any) {
      showNotification(err.message || "Failed to perform remediation action", true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-500 text-xs font-semibold">Synchronizing instructor portal records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-7 min-h-full" id="teacher-portal-root">
      {/* Alert Notifications */}
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
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Briefcase size={12} /> Faculty Portal
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Instructor: {currentUser.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Instructor Gradebook & Exam Manager
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchPortalData}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw size={13} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setNewExam({
                title: "",
                description: "",
                domainId: courses[0]?.id || "",
                timeLimitMinutes: 20,
                deadline: "",
                proctoringStrict: true,
                questions: []
              });
              setShowCreateExamModal(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} />
            <span>Schedule Examination</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold overflow-x-auto gap-1">
        {[
          { id: 'assessments', label: `Scheduled Exams (${templates.length})`, icon: FileCheck },
          { id: 'courses', label: `Course Syllabi (${courses.length})`, icon: BookOpen },
          { id: 'gradebook', label: `Gradebook (${reports.length})`, icon: Award },
          { id: 'submissions', label: `Submissions Audit (${submissions.length})`, icon: Activity },
          { id: 'analysis', label: `Student Remediation (${studentAnalysis.length})`, icon: Users }
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
                  ? "border-emerald-600 text-emerald-800 dark:text-emerald-400 font-extrabold bg-emerald-50/90 dark:bg-emerald-950/30 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
            >
              <Icon size={15} className={isActive ? "text-emerald-600" : "text-slate-400"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Scheduled Exams */}
      {activeTab === 'assessments' && (
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="p-16 border border-dashed border-slate-300 rounded-2xl text-center space-y-2 bg-white">
              <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No scheduled examinations yet</h3>
              <p className="text-slate-400 text-xs">Create your first faculty examination to assess student mastery.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(tmpl => {
                const domain = courses.find(c => c.id === tmpl.domainId);
                return (
                  <div key={tmpl.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 hover:border-slate-300 shadow-xs transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {domain?.name || "Course Assessment"}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base">{tmpl.title}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExamToDelete({ id: tmpl.id, title: tmpl.title })}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Exam"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                      {tmpl.description || "Faculty structured assessment unit."}
                    </p>
                    
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                      <span className="flex items-center gap-1.5"><Clock size={13} className="text-emerald-600" /> {tmpl.timeLimitMinutes} min limit</span>
                      <span className="flex items-center gap-1.5"><Calendar size={13} className="text-emerald-600" /> Due: {tmpl.deadline || "Ongoing"}</span>
                      <span className="flex items-center gap-1.5"><FileCheck size={13} className="text-emerald-600" /> {tmpl.questions?.length || 0} Questions</span>
                      <span className="flex items-center gap-1.5">
                        <ShieldAlert size={13} className={tmpl.proctoringStrict ? "text-emerald-700" : "text-slate-400"} /> 
                        Proctor: {tmpl.proctoringStrict ? "Enforced" : "Off"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Courses */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(c => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 hover:border-slate-300 shadow-xs transition-colors flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{c.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0">
                      Active
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">{c.description}</p>
                </div>
                
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {c.deadline ? `Due ${c.deadline}` : "Self-paced"}
                  </span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {c.enrolledStudentsCount || 0} enrolled
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Gradebook */}
      {activeTab === 'gradebook' && (
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Completed Exams</th>
                  <th className="py-3 px-4">Average Grade</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400">
                      No student exam reports found.
                    </td>
                  </tr>
                ) : (
                  reports.map(rep => (
                    <tr key={rep.student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{rep.student.name}</div>
                        <div className="text-[11px] text-slate-400">{rep.student.email}</div>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums font-semibold text-slate-700">{rep.assessmentCount}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-xs font-extrabold px-2.5 py-0.5 rounded-full tabular-nums ${
                          rep.averageScore >= 80 
                            ? "bg-emerald-100 text-emerald-800" 
                            : rep.averageScore >= 50 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-rose-100 text-rose-800"
                        }`}>
                          {rep.averageScore}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentReport(rep)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold cursor-pointer shadow-2xs"
                        >
                          Inspect Transcript
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Exam Submissions */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Exam</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Status / Proctoring</th>
                  <th className="py-3 px-4 text-right">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                      No student exam submissions recorded yet.
                    </td>
                  </tr>
                ) : (
                  submissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{sub.studentName}</div>
                        <div className="text-[11px] text-slate-400">{sub.studentEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{sub.assessmentTitle}</td>
                      <td className="py-3.5 px-4 text-slate-600">{sub.courseName}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-xs font-extrabold px-2.5 py-0.5 rounded-full tabular-nums ${
                          sub.score >= 80 
                            ? "bg-emerald-100 text-emerald-800" 
                            : sub.score >= 50 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-rose-100 text-rose-800"
                        }`}>
                          {sub.score}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {sub.autoSubmittedReason ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Auto-Submitted (Focus Loss)
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Verified Normal
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] text-right tabular-nums font-medium">
                        {new Date(sub.completedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Student Analysis & Remediation */}
      {activeTab === 'analysis' && (
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student Profile</th>
                  <th className="py-3 px-4">Attended Exams</th>
                  <th className="py-3 px-4">Average Score</th>
                  <th className="py-3 px-4">Competency Breakdown</th>
                  <th className="py-3 px-4 text-right">Remediation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentAnalysis.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 text-xs">
                      No student records found.
                    </td>
                  </tr>
                ) : (
                  studentAnalysis.map(sa => (
                    <tr key={sa.studentId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{sa.name}</div>
                        <div className="text-[11px] text-slate-400">{sa.email}</div>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums font-semibold text-slate-700">{sa.attendedAssessmentsCount} completed</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-xs font-extrabold px-2.5 py-0.5 rounded-full tabular-nums ${
                          sa.averageScore >= 80 
                            ? "bg-emerald-100 text-emerald-800" 
                            : sa.averageScore >= 50 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-rose-100 text-rose-800"
                        }`}>
                          {sa.averageScore}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                            {sa.weakCompetenciesCount} Weak
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {sa.strongCompetenciesCount} Proficient
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleStudentControl(sa.studentId, "reset_assessments", sa.name)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          title="Reset student assessment history to permit clean retake"
                        >
                          <RotateCcw size={12} />
                          <span>Reset Attempts</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCHEDULE EXAM MODAL */}
      {showCreateExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Schedule Faculty Examination</h3>
                <p className="text-xs text-slate-500">Configure questions, timer, and academic integrity policies</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCreateExamModal(false)} 
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExamSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Exam Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Midterm: Algorithms & Data Structures"
                  value={newExam.title}
                  onChange={(e) => setNewExam(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Domain *</label>
                <select
                  required
                  value={newExam.domainId}
                  onChange={(e) => setNewExam(prev => ({ ...prev, domainId: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="">Select course domain...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instructions / Description</label>
                <textarea
                  rows={2}
                  placeholder="Official instructions for students taking this timed exam..."
                  value={newExam.description}
                  onChange={(e) => setNewExam(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Limit (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={newExam.timeLimitMinutes}
                    onChange={(e) => setNewExam(prev => ({ ...prev, timeLimitMinutes: parseInt(e.target.value) || 20 }))}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Submission Deadline</label>
                  <input
                    type="date"
                    value={newExam.deadline}
                    onChange={(e) => setNewExam(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newExam.proctoringStrict}
                    onChange={(e) => setNewExam(prev => ({ ...prev, proctoringStrict: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-amber-900">
                    Enforce Tab-Lock Academic Continuity (Auto-submit on focus loss)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateExamModal(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingExam}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {creatingExam ? <Loader2 size={13} className="animate-spin" /> : null}
                  <span>Schedule Exam</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE EXAM CONFIRMATION DIALOG */}
      {examToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Delete Examination</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">"{examToDelete.title}"</strong>? This will remove all scheduled sessions for this exam.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setExamToDelete(null)}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExam}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT STUDENT REPORT DIALOG */}
      {selectedStudentReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Student Academic Transcript</h3>
                <p className="text-xs text-slate-500">{selectedStudentReport.student.name} ({selectedStudentReport.student.email})</p>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedStudentReport(null)} 
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase">Average Score</div>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">{selectedStudentReport.averageScore}%</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase">Exams Taken</div>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">{selectedStudentReport.assessmentCount}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase">Weak Topics</div>
                <div className="text-2xl font-extrabold text-rose-700 tabular-nums">{selectedStudentReport.weakTopicsCount}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Topic Competency Breakdown</h4>
              <div className="space-y-2">
                {selectedStudentReport.topicBreakdowns.map((t, idx) => (
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
                onClick={() => setSelectedStudentReport(null)}
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
