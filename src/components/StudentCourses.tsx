import React, { useState } from "react";
import { LearningDomain, AssessmentTemplate, User } from "../types";
import { Calendar, Clock, Plus, Loader2, ArrowRight, BookOpen, CheckCircle2, Sparkles, UserCheck, ChevronRight, AlertCircle } from "lucide-react";
import { apiFetch } from "../lib/api";

interface StudentCoursesProps {
  courses: LearningDomain[];
  onStartAssessment: (domainId: string, templateId?: string) => void;
  templates?: AssessmentTemplate[];
  currentUser?: User | null;
  onRefreshData?: () => void;
}

export const StudentCourses: React.FC<StudentCoursesProps> = ({
  courses = [],
  onStartAssessment,
  templates = [],
  currentUser,
  onRefreshData
}) => {
  const [selectedCourse, setSelectedCourse] = useState<LearningDomain | null>(courses[0] || null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTrack, setNewTrack] = useState({
    name: "",
    description: "",
    deadline: ""
  });
  const [creatingTrack, setCreatingTrack] = useState<boolean>(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 4000);
  };

  const handleCreateCustomTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrack.name.trim() || !newTrack.description.trim()) {
      showStatus("Please provide both course title and description");
      return;
    }

    setCreatingTrack(true);
    try {
      const res = await apiFetch("/api/v1/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTrack.name.trim(),
          description: newTrack.description.trim(),
          deadline: newTrack.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          instructor: "Self-Paced Learning Track"
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create study track");
      }

      const created = await res.json();
      showStatus(`Created custom track "${created.name}".`);
      setShowCreateModal(false);
      setNewTrack({ name: "", description: "", deadline: "" });
      setSelectedCourse(created);

      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      showStatus(err.message || "Failed to create study track");
    } finally {
      setCreatingTrack(false);
    }
  };

  const handleToggleEnrollment = async (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEnrollingId(courseId);
    try {
      const res = await apiFetch(`/api/v1/courses/${courseId}/enroll`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        showStatus(data.enrolled ? "Enrolled in course successfully." : "Unenrolled from course.");
        if (onRefreshData) onRefreshData();
      }
    } catch (err: any) {
      console.error("Enrollment error:", err);
    } finally {
      setEnrollingId(null);
    }
  };

  const isEnrolled = (course: LearningDomain) => {
    if (!currentUser) return true;
    if (currentUser.enrolledCourseIds?.includes(course.id)) return true;
    if (course.assignedStudentIds?.includes(currentUser.id)) return true;
    return false;
  };

  return (
    <div className="space-y-10" id="student-courses-view">
      
      {/* Dynamic inline notification - Flat, no rounded box wrappers */}
      {statusMessage && (
        <div className="p-4 bg-indigo-50 dark:bg-[#1e2736] border-b border-indigo-200 dark:border-stone-800 text-indigo-900 dark:text-indigo-200 text-xs font-semibold flex items-center justify-between fade-in">
          <span>{statusMessage}</span>
          <button type="button" onClick={() => setStatusMessage("")} className="text-indigo-500 hover:text-indigo-700">✕</button>
        </div>
      )}

      {/* 3. COHESIVE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-stone-200/60 dark:border-stone-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight">
            Curriculum Directory
          </h1>
          <div className="text-xs text-stone-500 flex items-center gap-2 mt-1.5">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {courses.length} Active Syllabus Tracks
            </span>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <span>Self-directed study and instructor-curated formal pathways</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 min-h-[44px]"
        >
          <Plus size={14} />
          <span>New Custom Track</span>
        </button>
      </div>

      {/* 10. ASYMMETRICAL 2-COLUMN VIEW (40% / 60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Course list feed (No card blocks, clean dividers) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono px-1">
            Learning Paths
          </h3>

          <div className="divide-y divide-stone-200/60 dark:divide-stone-800 border-t border-b border-stone-200/60 dark:border-stone-800">
            {courses.length === 0 ? (
              <div className="py-8 text-stone-400 text-xs">
                No active courses compiled yet.
              </div>
            ) : (
              courses.map(course => {
                const isSelected = selectedCourse?.id === course.id;
                const enrolled = isEnrolled(course);

                return (
                  <div
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className={`py-5 px-3 transition-colors cursor-pointer flex flex-col justify-between gap-2.5 rounded-lg ${
                      isSelected
                        ? "bg-indigo-50/60 dark:bg-indigo-900/10 font-bold"
                        : "hover:bg-stone-50/40 dark:hover:bg-stone-800/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h4 className={`font-bold text-sm leading-snug transition-colors ${
                        isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-stone-900 dark:text-stone-100"
                      }`}>
                        {course.name}
                      </h4>

                      <button
                        type="button"
                        onClick={(e) => handleToggleEnrollment(course.id, e)}
                        disabled={enrollingId === course.id}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded transition-all cursor-pointer ${
                          enrolled
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs"
                        }`}
                      >
                        {enrollingId === course.id ? "..." : enrolled ? "Enrolled" : "Enroll"}
                      </button>
                    </div>

                    <p className="text-stone-500 dark:text-stone-400 text-xs line-clamp-2 leading-relaxed font-sans">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono mt-1 pt-2 border-t border-stone-100/50 dark:border-stone-800/20">
                      <span className="truncate max-w-[130px]">
                        {course.instructor || "Faculty Instructor"}
                      </span>
                      {course.deadline && (
                        <span className="shrink-0 flex items-center gap-1 text-[10px]">
                          <Calendar size={11} /> {course.deadline}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Course details rendering directly */}
        <div className="lg:col-span-7 space-y-8">
          {selectedCourse ? (
            (() => {
              const enrolled = isEnrolled(selectedCourse);
              return (
                <div className="space-y-8">
                  {/* Selected syllabus meta section */}
                  <div className="space-y-3.5 border-b border-stone-200/60 dark:border-stone-800 pb-6">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <BookOpen size={13} />
                        <span>Syllabus & Competency Rubrics</span>
                        <span className="text-stone-300 dark:text-stone-700">·</span>
                        <span className="text-stone-500 dark:text-stone-400 font-normal">{selectedCourse.instructor || "Faculty Director"}</span>
                      </div>
                      <div>
                        {enrolled ? (
                          <span className="px-2.5 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-lg">
                            Enrolled
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[10px] font-bold text-stone-500 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
                            Unenrolled
                          </span>
                        )}
                      </div>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
                      {selectedCourse.name}
                    </h2>
                    
                    <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed font-sans">
                      {selectedCourse.description}
                    </p>
                    
                    {selectedCourse.deadline && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-mono font-medium">
                        <Calendar size={12} className="text-stone-400" />
                        <span>Target completion deadline: {selectedCourse.deadline}</span>
                      </div>
                    )}
                  </div>

                  {/* Conditional state based on enrollment */}
                  {!enrolled ? (
                    <div className="bg-amber-50/50 dark:bg-amber-950/10 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-amber-200/60 dark:border-amber-900/20">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                          <AlertCircle size={13} />
                          <span>Path Locked</span>
                        </div>
                        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          Enroll to Unlock Course Resources
                        </h3>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed max-w-md font-sans">
                          You are currently not enrolled in this learning path. Enroll now to take academic diagnostics, launch assigned proctored exams, trace your skill competency matrices, and seek dynamic study guidance from the AI Tutor.
                        </p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={(e) => handleToggleEnrollment(selectedCourse.id, e)}
                        disabled={enrollingId === selectedCourse.id}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 w-full sm:w-auto min-h-[44px]"
                      >
                        <span>{enrollingId === selectedCourse.id ? "Enrolling..." : "Enroll in Learning Path"}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Assessment launch bar - unboxed flat design banner */}
                      <div className="bg-indigo-50/70 dark:bg-indigo-900/10 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-indigo-100 dark:border-indigo-900/20">
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                            <Sparkles size={13} />
                            <span>Dynamic Diagnostics</span>
                          </div>
                          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                            Evaluate Topic Understanding
                          </h3>
                          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed max-w-md font-sans">
                            Take an evaluation for this course to generate skill-gap matrix scores and personalized remediation recommendations.
                          </p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => onStartAssessment(selectedCourse.id)}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 w-full sm:w-auto min-h-[44px]"
                        >
                          <span>Evaluate Concept</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>

                      {/* Scheduled Formal Exams Table */}
                      {templates.filter(t => t.domainId === selectedCourse.id).length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-stone-400">
                              Assigned Examination Boards
                            </h3>
                            <span className="text-[10px] text-stone-400 font-mono uppercase">Strict Single-Tab</span>
                          </div>

                          <div className="divide-y divide-stone-100 dark:divide-stone-800">
                            {templates.filter(t => t.domainId === selectedCourse.id).map(tmpl => (
                              <div key={tmpl.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                                <div className="space-y-1">
                                  <span className="font-bold text-stone-900 dark:text-stone-100 text-sm block">{tmpl.title}</span>
                                  <div className="flex items-center gap-2.5 text-stone-500 dark:text-stone-400 text-[11px] font-mono">
                                    <span className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
                                      <Clock size={11} className="text-indigo-500" /> {tmpl.timeLimitMinutes} min limit
                                    </span>
                                    <span>·</span>
                                    <span>{tmpl.questions?.length || 0} questions</span>
                                    {tmpl.deadline && (
                                      <>
                                        <span>·</span>
                                        <span className="text-amber-700 dark:text-amber-400 font-medium">Due {tmpl.deadline}</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => onStartAssessment(selectedCourse.id, tmpl.id)}
                                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs shrink-0"
                                >
                                  Start Exam
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="py-16 text-center text-stone-400 dark:text-stone-500 text-xs">
              <BookOpen className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto mb-2" />
              <span>Select a course from the catalog to review dynamic diagnostics and scheduled examinations.</span>
            </div>
          )}
        </div>
      </div>

      {/* CREATE CUSTOM STUDY TRACK DIALOG POPUP */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs fade-in">
          <div className="bg-white dark:bg-[#151C28] border border-stone-200 dark:border-stone-800 p-6 sm:p-8 max-w-md w-full rounded-2xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/80 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base font-serif">New Custom Study Track</h3>
                <p className="text-[11px] text-stone-500">Configure customized concepts and evaluation rubrics</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCreateModal(false)} 
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomTrack} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">Track title</label>
                <input
                  type="text"
                  required
                  value={newTrack.name}
                  onChange={(e) => setNewTrack(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Python Complexity & Structures"
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-[#192231] border border-stone-300 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">Objectives & syllabus notes</label>
                <textarea
                  rows={3}
                  required
                  value={newTrack.description}
                  onChange={(e) => setNewTrack(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Syllabus goals..."
                  className="w-full p-3 bg-stone-50 dark:bg-[#192231] border border-stone-300 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">Target completion date</label>
                <input
                  type="date"
                  value={newTrack.deadline}
                  onChange={(e) => setNewTrack(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-[#192231] border border-stone-300 dark:border-stone-800 rounded-xl text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex justify-end gap-3.5 pt-3 border-t border-stone-100 dark:border-stone-800/80">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTrack}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {creatingTrack ? <Loader2 size={13} className="animate-spin" /> : null}
                  <span>Create Track</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
