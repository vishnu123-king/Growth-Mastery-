import React, { useState } from "react";
import { LearningDomain, AssessmentTemplate, User } from "../types";
import { Calendar, Clock, Plus, Loader2, ArrowRight, BookOpen, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
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
    <div className="space-y-8" id="student-courses-view">
      
      {/* Dynamic inline notification */}
      {statusMessage && (
        <div className="p-3.5 bg-[#222222] border border-[#C47C4A]/40 text-[#F3EEE6] text-xs font-medium rounded-xl flex items-center justify-between fade-in">
          <span>{statusMessage}</span>
          <button type="button" onClick={() => setStatusMessage("")} className="text-[#A8A29E] hover:text-[#F3EEE6] ml-3">✕</button>
        </div>
      )}

      {/* 1. Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#2C2C2C] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[#F3EEE6] tracking-tight">
            Curriculum Directory
          </h1>
          <div className="text-sm text-[#A8A29E] flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="font-mono text-xs font-semibold text-[#D7B87B]">
              {courses.length} Active Tracks
            </span>
            <span className="text-[#444444]" aria-hidden="true">·</span>
            <span>Structured learning paths, diagnostic rubrics, and formal assessments</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="btn-copper-primary text-xs shrink-0"
        >
          <Plus size={15} />
          <span>New Custom Track</span>
        </button>
      </div>

      {/* 2. Asymmetrical 2-Column Desktop Grid (5 Cols Feed / 7 Cols Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Learning Paths List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A8A29E]">
              Learning Paths
            </h2>
            <span className="text-xs font-mono text-[#78716C]">{courses.length} tracks</span>
          </div>

          <div className="space-y-2.5">
            {courses.length === 0 ? (
              <div className="p-8 text-center border border-[#2C2C2C] rounded-xl bg-[#1B1B1B] text-[#A8A29E] text-xs">
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
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? "bg-[#222222] border-[#C47C4A]/60 ring-1 ring-[#C47C4A]/30"
                        : "bg-[#1B1B1B] border-[#2C2C2C] hover:border-[#3A3A3A] hover:bg-[#1E1E1E]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className={`text-base font-semibold leading-snug transition-colors ${
                        isSelected ? "text-[#C47C4A]" : "text-[#F3EEE6]"
                      }`}>
                        {course.name}
                      </h3>

                      <button
                        type="button"
                        onClick={(e) => handleToggleEnrollment(course.id, e)}
                        disabled={enrollingId === course.id}
                        className={`text-xs font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer shrink-0 ${
                          enrolled
                            ? "bg-[#6D927A]/15 text-[#6D927A] border border-[#6D927A]/30 hover:bg-[#6D927A]/25"
                            : "bg-[#282828] hover:bg-[#C47C4A] hover:text-white text-[#F3EEE6] border border-[#3A3A3A]"
                        }`}
                      >
                        {enrollingId === course.id ? "..." : enrolled ? "Enrolled" : "Enroll"}
                      </button>
                    </div>

                    <p className="text-[#A8A29E] text-xs line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-[#78716C] font-mono pt-2 border-t border-[#262626]">
                      <span className="truncate max-w-[150px]">
                        {course.instructor || "Faculty Director"}
                      </span>
                      {course.deadline && (
                        <span className="shrink-0 flex items-center gap-1.5 text-xs text-[#A8A29E]">
                          <Calendar size={12} className="text-[#78716C]" />
                          <span>{course.deadline}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Course Workspace Details */}
        <div className="lg:col-span-7">
          {selectedCourse ? (
            (() => {
              const enrolled = isEnrolled(selectedCourse);
              const assignedTemplates = templates.filter(t => t.domainId === selectedCourse.id);

              return (
                <div className="p-6 sm:p-7 bg-[#1B1B1B] border border-[#2C2C2C] rounded-2xl space-y-6">
                  
                  {/* Selected Syllabus Meta */}
                  <div className="space-y-3 border-b border-[#2C2C2C] pb-5">
                    <div className="flex items-center justify-between gap-2 text-xs font-mono">
                      <div className="flex items-center gap-2 text-[#A8A29E] flex-wrap">
                        <BookOpen size={14} className="text-[#C47C4A]" />
                        <span className="uppercase tracking-wider font-semibold">Syllabus Overview</span>
                        <span className="text-[#444444]" aria-hidden="true">·</span>
                        <span>{selectedCourse.instructor || "Faculty Director"}</span>
                      </div>
                      <div>
                        {enrolled ? (
                          <span className="text-xs font-mono font-medium text-[#6D927A] flex items-center gap-1">
                            <CheckCircle2 size={13} />
                            <span>Enrolled</span>
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-medium text-[#D7B87B]">
                            Not Enrolled
                          </span>
                        )}
                      </div>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#F3EEE6] tracking-tight leading-snug">
                      {selectedCourse.name}
                    </h2>
                    
                    <p className="text-[#D6D0C7] text-sm leading-relaxed">
                      {selectedCourse.description}
                    </p>
                    
                    {selectedCourse.deadline && (
                      <div className="inline-flex items-center gap-2 text-xs font-mono text-[#A8A29E] pt-1">
                        <Calendar size={13} className="text-[#78716C]" />
                        <span>Completion Target: {selectedCourse.deadline}</span>
                      </div>
                    )}
                  </div>

                  {/* Primary Next Action State */}
                  {!enrolled ? (
                    <div className="p-5 rounded-xl bg-[#222222] border border-[#D7B87B]/30 space-y-4">
                      <div className="space-y-1">
                        <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#D7B87B] flex items-center gap-1.5">
                          <AlertCircle size={14} />
                          <span>Course Enrollment Required</span>
                        </div>
                        <h3 className="text-sm font-semibold text-[#F3EEE6]">
                          Activate Diagnostics & Exam Access
                        </h3>
                        <p className="text-xs text-[#A8A29E] leading-relaxed">
                          Enroll in this syllabus track to launch dynamic diagnostic evaluations, complete proctored examinations, track skill gap matrices, and receive AI study recommendations.
                        </p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={(e) => handleToggleEnrollment(selectedCourse.id, e)}
                        disabled={enrollingId === selectedCourse.id}
                        className="btn-copper-primary w-full sm:w-auto text-xs"
                      >
                        <span>{enrollingId === selectedCourse.id ? "Enrolling..." : "Enroll in Learning Path"}</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Dynamic Diagnostics Banner */}
                      <div className="p-5 rounded-xl bg-[#222222] border border-[#2C2C2C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#C47C4A] flex items-center gap-1.5">
                            <Sparkles size={14} />
                            <span>Adaptive Diagnostics</span>
                          </div>
                          <h3 className="text-sm font-semibold text-[#F3EEE6]">
                            Evaluate Concept Mastery
                          </h3>
                          <p className="text-xs text-[#A8A29E] leading-relaxed max-w-md">
                            Run a topic evaluation to measure competency, surface target gaps, and generate individualized study steps.
                          </p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => onStartAssessment(selectedCourse.id)}
                          className="btn-copper-primary whitespace-nowrap shrink-0 text-xs w-full sm:w-auto"
                        >
                          <span>Evaluate Concept</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>

                      {/* Scheduled Examination Boards */}
                      {assignedTemplates.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-2">
                            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A8A29E]">
                              Assigned Examination Boards
                            </h3>
                            <span className="text-xs font-mono text-[#78716C]">Proctored Sessions</span>
                          </div>

                          <div className="divide-y divide-[#262626]">
                            {assignedTemplates.map(tmpl => (
                              <div key={tmpl.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div className="space-y-1">
                                  <span className="font-semibold text-[#F3EEE6] text-sm block">{tmpl.title}</span>
                                  <div className="flex items-center gap-2 text-[#A8A29E] text-xs font-mono flex-wrap">
                                    <span className="flex items-center gap-1">
                                      <Clock size={12} className="text-[#C47C4A]" /> {tmpl.timeLimitMinutes} min limit
                                    </span>
                                    <span className="text-[#444444]" aria-hidden="true">·</span>
                                    <span>{tmpl.questions?.length || 0} questions</span>
                                    {tmpl.deadline && (
                                      <>
                                        <span className="text-[#444444]" aria-hidden="true">·</span>
                                        <span className="text-[#D7B87B]">Due {tmpl.deadline}</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => onStartAssessment(selectedCourse.id, tmpl.id)}
                                  className="btn-charcoal-secondary text-xs shrink-0 self-start sm:self-center"
                                >
                                  <span>Start Exam</span>
                                  <ArrowRight size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="p-12 text-center border border-[#2C2C2C] rounded-2xl bg-[#1B1B1B] text-[#A8A29E] text-xs">
              <BookOpen className="w-8 h-8 text-[#78716C] mx-auto mb-2" />
              <span>Select a learning track from the left panel to review syllabus contents and assessments.</span>
            </div>
          )}
        </div>
      </div>

      {/* CREATE CUSTOM STUDY TRACK DIALOG POPUP */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 fade-in">
          <div className="bg-[#1B1B1B] border border-[#2C2C2C] p-6 sm:p-7 max-w-md w-full rounded-2xl shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
              <div>
                <h3 className="font-semibold text-[#F3EEE6] text-base font-serif">New Custom Study Track</h3>
                <p className="text-xs text-[#A8A29E] mt-0.5">Define study concepts and custom evaluation rubrics</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCreateModal(false)} 
                className="text-[#A8A29E] hover:text-[#F3EEE6] p-1 cursor-pointer"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomTrack} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#F3EEE6]">Track Title</label>
                <input
                  type="text"
                  required
                  value={newTrack.name}
                  onChange={(e) => setNewTrack(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Distributed Computing & Algorithms"
                  className="w-full px-3 py-2 bg-[#222222] border border-[#2C2C2C] rounded-lg text-xs text-[#F3EEE6] focus:border-[#C47C4A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#F3EEE6]">Objectives & Syllabus Scope</label>
                <textarea
                  rows={3}
                  required
                  value={newTrack.description}
                  onChange={(e) => setNewTrack(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Summary of topics, learning goals, and key competencies..."
                  className="w-full p-3 bg-[#222222] border border-[#2C2C2C] rounded-lg text-xs text-[#F3EEE6] focus:border-[#C47C4A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#F3EEE6]">Target Completion Date</label>
                <input
                  type="date"
                  value={newTrack.deadline}
                  onChange={(e) => setNewTrack(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#222222] border border-[#2C2C2C] rounded-lg text-xs text-[#F3EEE6] focus:border-[#C47C4A]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#2C2C2C]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-charcoal-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTrack}
                  className="btn-copper-primary text-xs"
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
