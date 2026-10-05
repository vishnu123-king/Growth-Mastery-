import React, { useState, useEffect, useRef } from "react";
import { LearningDomain, Assessment, AssessmentResult, AssessmentTemplate } from "../types";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Clock, 
  ShieldAlert, 
  Calendar, 
  Lock, 
  ArrowRight,
  ChevronRight,
  Check,
  Award,
  Sparkles,
  RotateCcw
} from "lucide-react";

interface AssessmentFlowProps {
  domains: LearningDomain[];
  onStartAssessment: (domainId: string, aiGenerated: boolean, templateId?: string) => Promise<Assessment>;
  onSubmitAssessment: (assessmentId: string, answers: Record<string, string>, autoSubmittedReason?: string) => Promise<AssessmentResult>;
  onNavigateToDashboard: () => void;
  initialAssessment?: Assessment | null;
  onClearInitialAssessment?: () => void;
  onAssessmentStatusChange?: (isActive: boolean, forceSubmitFn?: (reason?: string) => void) => void;
  enableStrictProctoring?: boolean;
}

export const AssessmentFlow: React.FC<AssessmentFlowProps> = ({
  domains,
  onStartAssessment,
  onSubmitAssessment,
  onNavigateToDashboard,
  initialAssessment,
  onClearInitialAssessment,
  onAssessmentStatusChange,
  enableStrictProctoring = true
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [useAI, setUseAI] = useState<boolean>(false);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [result, setResult] = useState<AssessmentResult | null>(null);

  // Timer State (seconds)
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 mins default
  const [timeWarning, setTimeWarning] = useState<boolean>(false);

  // Fetch published assessment templates
  useEffect(() => {
    fetch("/api/v1/assessment-templates")
      .then(res => res.ok ? res.json() : [])
      .then(data => setTemplates(data))
      .catch(() => {});
  }, []);

  // Sync initialAssessment if provided externally
  useEffect(() => {
    if (initialAssessment) {
      setAssessment(initialAssessment);
      setCurrentQuestionIdx(0);
      setAnswers({});
      setResult(null);
      setTimeLeft((initialAssessment.timeLimitMinutes || 15) * 60);
      if (onClearInitialAssessment) {
        onClearInitialAssessment();
      }
    }
  }, [initialAssessment]);

  // Handle Domain/Template Start
  const handleStart = async () => {
    if (!selectedDomain && !selectedTemplateId) return;
    setLoading(true);
    try {
      const newAssessment = await onStartAssessment(selectedDomain, useAI, selectedTemplateId || undefined);
      setAssessment(newAssessment);
      setCurrentQuestionIdx(0);
      setAnswers({});
      setResult(null);
      const minutes = newAssessment.timeLimitMinutes || 15;
      setTimeLeft(minutes * 60);
    } catch (e) {
      console.error("Failed to start assessment:", e);
    } finally {
      setLoading(false);
    }
  };

  // Handle answer selection
  const handleSelectAnswer = (questionId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  // Submit Answers (Normal)
  const handleSubmit = async (autoReason?: string) => {
    if (!assessment) return;
    setLoading(true);
    try {
      const finalResult = await onSubmitAssessment(assessment.id, answers, autoReason);
      setResult(finalResult);
      if (finalResult.assessment) {
        setAssessment(finalResult.assessment);
      }
    } catch (e) {
      console.error("Failed to submit assessment:", e);
    } finally {
      setLoading(false);
    }
  };

  // Stable Submission Reference for Proctoring tab-locking
  const submitRef = useRef<(reason?: string) => void>(() => {});
  useEffect(() => {
    submitRef.current = (reason?: string) => {
      if (assessment && !result) {
        setLoading(true);
        onSubmitAssessment(assessment.id, answers, reason || "Tab switch detected during assessment")
          .then((finalResult) => {
            setResult(finalResult);
            if (finalResult.assessment) {
              setAssessment(finalResult.assessment);
            }
          })
          .catch((e) => {
            console.error("Failed to force submit assessment:", e);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    };
  }, [assessment, answers, result, onSubmitAssessment]);

  // Notify parent on status change
  useEffect(() => {
    const isActive = !!(assessment && !result);
    if (onAssessmentStatusChange) {
      onAssessmentStatusChange(isActive, (reason?: string) => {
        submitRef.current(reason);
      });
    }
  }, [assessment, result, onAssessmentStatusChange]);

  // Timer Hook
  useEffect(() => {
    if (!assessment || result) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          submitRef.current("Assessment timer expired");
          return 0;
        }
        if (prev === 60) {
          setTimeWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [assessment, result]);

  // Format Timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-white border border-slate-200 rounded-2xl min-h-[440px]">
        <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="font-bold text-slate-900 text-base">
            {assessment ? "Evaluating and grading exam submission..." : "Preparing diagnostic examination..."}
          </h3>
          <p className="text-slate-500 text-xs">
            Calculating mastery scores and generating diagnostic rubrics.
          </p>
        </div>
      </div>
    );
  }

  // --- Step 1: Selection Screen (Domain or Official Exam) ---
  if (!assessment) {
    return (
      <div className="space-y-7" id="assessment-selection">
        <div className="border-b border-slate-200 pb-5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <span>Examination Workspace</span>
            {enableStrictProctoring && (
              <>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold text-[10px]">
                  <Lock size={11} /> Proctoring Monitored
                </span>
              </>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Competency Examination
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Select a faculty-scheduled exam or choose a course topic to begin a diagnostic evaluation.
          </p>
        </div>

        {/* Official Faculty Scheduled Exams */}
        {templates.length > 0 && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Scheduled Faculty Exams
              </h2>
              <span className="text-xs text-indigo-600 font-semibold">Formal course credit</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(tmpl => {
                const isSelected = selectedTemplateId === tmpl.id;
                const isDeadlinePassed = tmpl.deadline && new Date(tmpl.deadline).getTime() < Date.now();

                return (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      if (!isDeadlinePassed) {
                        setSelectedTemplateId(tmpl.id);
                        setSelectedDomain(tmpl.domainId);
                      }
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer space-y-3 ${
                      isDeadlinePassed
                        ? "border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed"
                        : isSelected
                        ? "border-indigo-600 bg-indigo-50/60 shadow-xs ring-2 ring-indigo-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                          Official Exam
                        </span>
                        <h3 className="font-bold text-slate-900 text-base">{tmpl.title}</h3>
                      </div>
                      {isSelected && (
                        <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs shadow-xs">
                          <Check size={14} />
                        </span>
                      )}
                    </div>
                    
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{tmpl.description}</p>
                    
                    <div className="flex items-center gap-3 pt-3 text-[11px] text-slate-500 border-t border-slate-100">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Clock size={12} className="text-indigo-600" /> {tmpl.timeLimitMinutes} min limit
                      </span>
                      <span className="text-slate-300">·</span>
                      <span>{tmpl.questions?.length || 0} Questions</span>
                      {tmpl.deadline && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className={isDeadlinePassed ? "text-rose-600 font-bold" : "text-amber-800 font-semibold"}>
                            {isDeadlinePassed ? "Expired" : `Due ${tmpl.deadline}`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Course Domains */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Self-Paced Diagnostic Domains
            </h2>
            <span className="text-xs text-slate-400">Adaptive assessments</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {domains.map((dom) => {
              const isSelected = selectedDomain === dom.id && !selectedTemplateId;
              return (
                <div 
                  key={dom.id}
                  onClick={() => {
                    setSelectedDomain(dom.id);
                    setSelectedTemplateId("");
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border text-left cursor-pointer transition-all space-y-2.5 ${
                    isSelected 
                      ? "border-indigo-600 bg-indigo-50/60 shadow-xs ring-2 ring-indigo-500/20" 
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">{dom.name}</h3>
                    {isSelected && (
                      <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs shadow-xs">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{dom.description}</p>
                  {dom.deadline && (
                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 font-medium">
                      Target deadline: {dom.deadline}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Question Generation Option */}
        {selectedDomain && !selectedTemplateId && (
          <div className="p-4 bg-gradient-to-r from-violet-50 via-indigo-50 to-violet-50 border border-violet-200 rounded-2xl space-y-1.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input 
                type="checkbox" 
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="font-bold text-indigo-950 text-xs sm:text-sm flex items-center gap-1.5">
                <Sparkles size={14} className="text-violet-600" />
                Synthesize fresh diagnostic questions using curriculum AI engine
              </span>
            </label>
            <p className="text-slate-600 text-xs pl-6.5 leading-relaxed">
              Generates questions specifically matched to the selected course competencies and syllabus.
            </p>
          </div>
        )}

        {/* Proctoring Notice */}
        {enableStrictProctoring && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block text-slate-900">Academic Continuity Policy</span>
              <span>Navigating away, closing the window, or switching browser tabs during an examination will conclude the session and submit current answers for grading.</span>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            disabled={!selectedDomain && !selectedTemplateId}
            onClick={handleStart}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
              selectedDomain || selectedTemplateId
                ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <span>Begin Assessment</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  // --- Step 3: View Graded Results ---
  if (result) {
    const isPassing = result.overallScore >= 70;
    return (
      <div className="space-y-7" id="assessment-results">
        {/* Results Banner */}
        <div className={`border-2 rounded-2xl p-7 text-center space-y-4 ${
          isPassing 
            ? "border-emerald-200 bg-gradient-to-b from-emerald-50 to-white" 
            : "border-rose-200 bg-gradient-to-b from-rose-50 to-white"
        }`}>
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white border shadow-2xs text-slate-700">
              Examination Graded & Recorded
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight pt-1">
              Assessment Results
            </h1>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              Your answers have been verified against answer rubrics and recorded in your learning profile.
            </p>
          </div>

          {result.autoSubmittedReason && (
            <div className="p-2.5 bg-rose-100 border border-rose-200 rounded-xl text-rose-900 text-xs font-semibold max-w-md mx-auto">
              Submitted via Proctoring Monitor: {result.autoSubmittedReason}
            </div>
          )}

          <div className="pt-2">
            <div className="text-5xl font-extrabold text-slate-900 tabular-nums">
              {result.overallScore}%
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mt-1">
              Overall Mastery Score
            </span>
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="space-y-3.5">
          <h2 className="text-sm font-bold text-slate-900">Topic Competency Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {Object.values(result.topicBreakdown).map((topic: any) => {
              const score = topic.percentage;
              let badgeColor = "bg-rose-100 text-rose-800";
              let badgeText = "Needs Focus";
              let barColor = "bg-rose-500";

              if (score >= 80) {
                badgeColor = "bg-emerald-100 text-emerald-800";
                badgeText = "Proficient";
                barColor = "bg-emerald-500";
              } else if (score >= 50) {
                badgeColor = "bg-blue-100 text-blue-800";
                badgeText = "Moderate";
                barColor = "bg-blue-500";
              }

              return (
                <div key={topic.competencyId} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{topic.competencyName}</h3>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${badgeColor}`}>
                      {badgeText}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Correct: {topic.correct}/{topic.total}</span>
                      <span className="font-bold text-slate-900 tabular-nums">{score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Solutions Review */}
        <div className="space-y-3.5">
          <h2 className="text-sm font-bold text-slate-900">Detailed Question Review</h2>
          <div className="space-y-3.5">
            {assessment.questions.map((q, idx) => {
              const studentAns = (assessment.answers[q.id] || answers[q.id] || "").trim();
              const correctAns = (q.correctAnswer || "").trim();
              const isCorrect = studentAns.length > 0 && studentAns.toLowerCase() === correctAns.toLowerCase();

              return (
                <div key={q.id} className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Question {idx + 1}</span>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                        {q.questionText}
                      </h4>
                    </div>
                    {isCorrect ? (
                      <span className="text-emerald-800 bg-emerald-100 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shrink-0 flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> Correct
                      </span>
                    ) : (
                      <span className="text-rose-800 bg-rose-100 border border-rose-200 text-xs font-bold px-3 py-1 rounded-full shrink-0 flex items-center gap-1.5">
                        <XCircle size={14} /> Incorrect
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const isCorrectOpt = opt.trim().toLowerCase() === correctAns.toLowerCase();
                      const isStudentOpt = opt.trim().toLowerCase() === studentAns.toLowerCase();

                      let optStyle = "border-slate-200 bg-slate-50/60 text-slate-700";
                      if (isCorrectOpt) {
                        optStyle = "border-emerald-300 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-400";
                      } else if (isStudentOpt && !isCorrectOpt) {
                        optStyle = "border-rose-300 bg-rose-50 text-rose-950 font-medium ring-1 ring-rose-300";
                      }

                      return (
                        <div key={oIdx} className={`p-3 rounded-xl border flex items-center justify-between ${optStyle}`}>
                          <span>{opt}</span>
                          {isCorrectOpt && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              Correct answer
                            </span>
                          )}
                          {!isCorrectOpt && isStudentOpt && (
                            <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                              Your answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                      <span className="font-bold text-slate-800 block">Explanation</span>
                      <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Row */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-between">
          <button
            type="button"
            onClick={() => {
              setAssessment(null);
              setResult(null);
              setAnswers({});
              setSelectedDomain("");
              setSelectedTemplateId("");
            }}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            Take Another Assessment
          </button>

          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>Return to Dashboard</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // --- Step 2: Active Exam Answering ---
  const currentQ = assessment.questions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === assessment.questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6" id="assessment-active">
      {/* Top Banner with Timer and Strict Proctoring Notice */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            {assessment.title || "Academic Examination"}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-white">
            Question {currentQuestionIdx + 1} of {assessment.questions.length} ({answeredCount} answered)
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {enableStrictProctoring && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1.5 rounded-xl">
              <ShieldAlert size={14} /> Monitored Session
            </span>
          )}

          <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-mono font-bold tabular-nums shadow-xs ${
            timeWarning 
              ? "bg-rose-500 text-white animate-pulse" 
              : "bg-indigo-600 text-white"
          }`}>
            <Clock size={15} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Question Selector Palette */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
        {assessment.questions.map((q, idx) => (
          <button
            key={q.id}
            type="button"
            onClick={() => setCurrentQuestionIdx(idx)}
            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs ${
              idx === currentQuestionIdx
                ? "bg-indigo-600 text-white ring-2 ring-indigo-400 scale-105"
                : answers[q.id]
                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
              Difficulty: {currentQ.difficulty}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 whitespace-pre-wrap leading-relaxed">
              {currentQ.questionText}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = answers[currentQ.id] === opt;
              return (
                <div
                  key={oIdx}
                  onClick={() => handleSelectAnswer(currentQ.id, opt)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs sm:text-sm font-medium ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold shadow-xs ring-1 ring-indigo-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300 text-slate-800"
                  }`}
                >
                  <span>{opt}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                currentQuestionIdx === 0
                  ? "text-slate-300 cursor-not-allowed"
                  : "bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 shadow-2xs"
              }`}
            >
              Previous
            </button>

            {isLastQuestion ? (
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
              >
                Submit Exam ({answeredCount}/{assessment.questions.length})
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentQuestionIdx(prev => Math.min(assessment.questions.length - 1, prev + 1))}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Next Question</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
