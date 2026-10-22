import React, { useState, useEffect, useRef } from "react";
import { LearningDomain, Assessment, AssessmentResult, AssessmentTemplate } from "../types";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Clock, 
  ShieldAlert, 
  Lock, 
  ArrowRight,
  ChevronRight,
  Check,
  Sparkles
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
      setTimeLeft((newAssessment.timeLimitMinutes || 15) * 60);
    } catch (err) {
      console.error("Failed to start assessment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async (autoReason?: string) => {
    if (!assessment) return;
    setLoading(true);
    try {
      const res = await onSubmitAssessment(assessment.id, answers, autoReason);
      setResult(res);
    } catch (err) {
      console.error("Failed to submit assessment:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitRef = useRef(handleSubmit);
  submitRef.current = handleSubmit;

  // Proctoring tab listener sync
  useEffect(() => {
    const isActive = Boolean(assessment && !result);
    if (onAssessmentStatusChange) {
      onAssessmentStatusChange(isActive, (reason) => {
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
      <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-[#1B1B1B] border border-[#2C2C2C] rounded-2xl min-h-[440px]">
        <div className="w-12 h-12 rounded-xl bg-[#C47C4A] text-white flex items-center justify-center shadow-md">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="font-semibold text-[#F3EEE6] text-base">
            {assessment ? "Evaluating and grading exam submission..." : "Preparing diagnostic examination..."}
          </h3>
          <p className="text-[#A8A29E] text-xs">
            Calculating mastery scores and generating diagnostic rubrics.
          </p>
        </div>
      </div>
    );
  }

  // --- Step 1: Selection Screen (Domain or Official Exam) ---
  if (!assessment) {
    return (
      <div className="space-y-8" id="assessment-selection">
        <div className="border-b border-[#2C2C2C] pb-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#C47C4A] font-semibold uppercase tracking-wider">Examination Workspace</span>
            {enableStrictProctoring && (
              <>
                <span className="text-[#444444]" aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5 text-[#6D927A] font-medium">
                  <Lock size={12} /> Proctoring Active
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[#F3EEE6] tracking-tight">
            Competency Examination
          </h1>
          <p className="text-[#A8A29E] text-sm">
            Select a faculty-scheduled examination board or choose a syllabus topic to launch an adaptive evaluation.
          </p>
        </div>

        {/* Official Faculty Scheduled Exams */}
        {templates.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-semibold text-[#A8A29E] uppercase tracking-wider">
                Scheduled Faculty Exams
              </h2>
              <span className="text-xs font-mono text-[#D7B87B]">Formal Syllabus Credit</span>
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
                    className={`p-5 rounded-xl border text-left transition-all cursor-pointer space-y-3 ${
                      isDeadlinePassed
                        ? "border-[#2C2C2C] bg-[#1E1E1E] opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "border-[#C47C4A] bg-[#222222] ring-1 ring-[#C47C4A]/40"
                        : "border-[#2C2C2C] bg-[#1B1B1B] hover:border-[#383838] hover:bg-[#202020]"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#D7B87B] block">
                          Official Examination
                        </span>
                        <h3 className="font-semibold text-[#F3EEE6] text-base">{tmpl.title}</h3>
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 bg-[#C47C4A] text-white rounded-full flex items-center justify-center text-xs">
                          <Check size={13} />
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[#A8A29E] text-xs line-clamp-2 leading-relaxed">{tmpl.description}</p>
                    
                    <div className="flex items-center gap-3 pt-3 text-xs text-[#78716C] font-mono border-t border-[#262626]">
                      <span className="flex items-center gap-1 text-[#D6D0C7]">
                        <Clock size={12} className="text-[#C47C4A]" /> {tmpl.timeLimitMinutes} min limit
                      </span>
                      <span className="text-[#444444]" aria-hidden="true">·</span>
                      <span>{tmpl.questions?.length || 0} Questions</span>
                      {tmpl.deadline && (
                        <>
                          <span className="text-[#444444]" aria-hidden="true">·</span>
                          <span className={isDeadlinePassed ? "text-[#D96B6B]" : "text-[#D7B87B]"}>
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-semibold text-[#A8A29E] uppercase tracking-wider">
              Self-Paced Diagnostic Domains
            </h2>
            <span className="text-xs font-mono text-[#78716C]">Adaptive Assessments</span>
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
                  className={`p-5 rounded-xl border text-left cursor-pointer transition-all space-y-2.5 ${
                    isSelected 
                      ? "border-[#C47C4A] bg-[#222222] ring-1 ring-[#C47C4A]/40" 
                      : "border-[#2C2C2C] bg-[#1B1B1B] hover:border-[#383838] hover:bg-[#202020]"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-[#F3EEE6] text-sm sm:text-base">{dom.name}</h3>
                    {isSelected && (
                      <span className="w-5 h-5 bg-[#C47C4A] text-white rounded-full flex items-center justify-center text-xs">
                        <Check size={13} />
                      </span>
                    )}
                  </div>
                  <p className="text-[#A8A29E] text-xs line-clamp-2 leading-relaxed">{dom.description}</p>
                  {dom.deadline && (
                    <div className="text-xs font-mono text-[#78716C] pt-2 border-t border-[#262626]">
                      Target: {dom.deadline}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Question Generation Option */}
        {selectedDomain && !selectedTemplateId && (
          <div className="p-4 bg-[#222222] border border-[#2C2C2C] rounded-xl space-y-1.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input 
                type="checkbox" 
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="w-4 h-4 rounded text-[#C47C4A] border-[#2C2C2C] bg-[#1E1E1E]"
              />
              <span className="font-medium text-[#F3EEE6] text-xs sm:text-sm flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#D7B87B]" />
                Synthesize customized diagnostic questions using AI Engine
              </span>
            </label>
            <p className="text-[#A8A29E] text-xs pl-6 leading-relaxed">
              Dynamically tailors questions to the specific topics and competency levels of this syllabus track.
            </p>
          </div>
        )}

        {/* Proctoring Notice */}
        {enableStrictProctoring && (
          <div className="p-4 bg-[#222222] border border-[#2C2C2C] rounded-xl flex items-start gap-3 text-xs text-[#D6D0C7]">
            <ShieldAlert size={16} className="text-[#D7B87B] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block text-[#F3EEE6]">Academic Integrity Policy</span>
              <span className="text-[#A8A29E]">Navigating away, closing the window, or switching browser tabs during an examination session will submit your active responses for final grading.</span>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[#2C2C2C] flex justify-end">
          <button
            type="button"
            disabled={!selectedDomain && !selectedTemplateId}
            onClick={handleStart}
            className="btn-copper-primary text-xs"
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
    const studentAnswers = result.assessment?.answers || answers || {};
    const answeredCount = Object.values(studentAnswers).filter(val => typeof val === 'string' && val.trim().length > 0).length;
    const totalQuestions = result.assessment?.questions?.length || 1;
    const completionPercent = Math.round((answeredCount / totalQuestions) * 100);

    return (
      <div className="space-y-8" id="assessment-results">
        {/* Results Banner */}
        <div className="border border-[#2C2C2C] rounded-2xl p-7 text-center space-y-5 bg-[#1B1B1B]">
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#6D927A]">
              Evaluation Complete & Committed
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#F3EEE6] tracking-tight">
              Assessment Results
            </h1>
            <p className="text-[#A8A29E] text-sm max-w-lg mx-auto leading-relaxed">
              Your responses have been verified against academic rubrics and committed to your personalized learning profile.
            </p>
          </div>

          {result.autoSubmittedReason && (
            <div className="p-3 bg-[#D96B6B]/15 border border-[#D96B6B]/30 rounded-xl text-[#D96B6B] text-xs font-medium max-w-md mx-auto">
              Auto-submitted via Proctoring Monitor: {result.autoSubmittedReason}
            </div>
          )}

          {/* Side-by-side metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-2">
            <div className="p-5 bg-[#222222] rounded-xl border border-[#2C2C2C]">
              <div className="text-4xl font-bold text-[#C47C4A] font-mono tabular-nums">
                {result.overallScore}%
              </div>
              <span className="text-xs font-mono font-medium text-[#A8A29E] uppercase tracking-wider block mt-1.5">
                Mastery Score
              </span>
            </div>
            <div className="p-5 bg-[#222222] rounded-xl border border-[#2C2C2C]">
              <div className="text-4xl font-bold text-[#F3EEE6] font-mono tabular-nums">
                {completionPercent}%
              </div>
              <span className="text-xs font-mono font-medium text-[#A8A29E] uppercase tracking-wider block mt-1.5">
                Completed ({answeredCount}/{totalQuestions})
              </span>
            </div>
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-semibold text-[#F3EEE6]">Topic Competency Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(result.topicBreakdown).map((topic: any) => {
              const score = topic.percentage;
              let badgeColor = "text-[#D96B6B]";
              let badgeText = "Needs Focus";
              let barColor = "bg-[#D96B6B]";

              if (score >= 80) {
                badgeColor = "text-[#6D927A]";
                badgeText = "Proficient";
                barColor = "bg-[#6D927A]";
              } else if (score >= 50) {
                badgeColor = "text-[#D7B87B]";
                badgeText = "Moderate";
                barColor = "bg-[#D7B87B]";
              }

              return (
                <div key={topic.competencyId} className="p-5 bg-[#1B1B1B] rounded-xl border border-[#2C2C2C] space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium text-[#F3EEE6] text-base leading-snug">{topic.competencyName}</h3>
                    <span className={`text-xs font-mono font-medium ${badgeColor}`}>
                      {badgeText}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-[#A8A29E]">
                      <span>Correct: {topic.correct}/{topic.total}</span>
                      <span className="font-semibold text-[#F3EEE6] tabular-nums">{score}%</span>
                    </div>
                    <div className="w-full bg-[#262626] h-1.5 rounded-full overflow-hidden">
                      <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Solutions Review */}
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-semibold text-[#F3EEE6]">Detailed Question Review</h2>
          <div className="space-y-4">
            {assessment.questions.map((q, idx) => {
              const studentAns = (assessment.answers[q.id] || answers[q.id] || "").trim();
              const correctAns = (q.correctAnswer || "").trim();
              const isCorrect = studentAns.length > 0 && studentAns.toLowerCase() === correctAns.toLowerCase();

              return (
                <div key={q.id} className="p-6 bg-[#1B1B1B] rounded-xl border border-[#2C2C2C] space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-semibold text-[#C47C4A] uppercase tracking-wider">Question {idx + 1}</span>
                      <h4 className="font-serif font-semibold text-[#F3EEE6] text-base leading-relaxed">
                        {q.questionText}
                      </h4>
                    </div>
                    {isCorrect ? (
                      <span className="text-[#6D927A] text-xs font-mono font-medium shrink-0 flex items-center gap-1.5">
                        <CheckCircle2 size={15} /> Correct
                      </span>
                    ) : (
                      <span className="text-[#D96B6B] text-xs font-mono font-medium shrink-0 flex items-center gap-1.5">
                        <XCircle size={15} /> Incorrect
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const isCorrectOpt = opt.trim().toLowerCase() === correctAns.toLowerCase();
                      const isStudentOpt = opt.trim().toLowerCase() === studentAns.toLowerCase();

                      let optStyle = "border-[#2C2C2C] bg-[#222222] text-[#D6D0C7]";
                      if (isCorrectOpt) {
                        optStyle = "border-[#6D927A]/50 bg-[#6D927A]/15 text-[#F3EEE6] font-semibold";
                      } else if (isStudentOpt && !isCorrectOpt) {
                        optStyle = "border-[#D96B6B]/50 bg-[#D96B6B]/15 text-[#F3EEE6]";
                      }

                      return (
                        <div key={oIdx} className={`p-3 rounded-lg border flex items-center justify-between ${optStyle}`}>
                          <span className="leading-relaxed">{opt}</span>
                          {isCorrectOpt && (
                            <span className="text-[11px] font-mono font-medium text-[#6D927A] ml-2 shrink-0">
                              Correct answer
                            </span>
                          )}
                          {!isCorrectOpt && isStudentOpt && (
                            <span className="text-[11px] font-mono font-medium text-[#D96B6B] ml-2 shrink-0">
                              Your answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="p-3.5 bg-[#222222] border border-[#2C2C2C] rounded-lg text-xs space-y-1">
                      <span className="font-semibold text-[#F3EEE6] block">Rubric Explanation</span>
                      <p className="text-[#A8A29E] leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Row */}
        <div className="pt-4 border-t border-[#2C2C2C] flex flex-col sm:flex-row gap-3 justify-between">
          <button
            type="button"
            onClick={() => {
              setAssessment(null);
              setResult(null);
              setAnswers({});
              setSelectedDomain("");
              setSelectedTemplateId("");
            }}
            className="btn-charcoal-secondary text-xs"
          >
            Take Another Assessment
          </button>

          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="btn-copper-primary text-xs"
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
      <div className="bg-[#1B1B1B] border border-[#2C2C2C] text-[#F3EEE6] p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#C47C4A]">
            {assessment.title || "Academic Examination"}
          </span>
          <h2 className="text-base sm:text-lg font-serif font-semibold text-[#F3EEE6]">
            Question {currentQuestionIdx + 1} of {assessment.questions.length} ({answeredCount} answered)
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {enableStrictProctoring && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-[#D7B87B]">
              <ShieldAlert size={14} /> Monitored Session
            </span>
          )}

          <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-mono font-bold tabular-nums ${
            timeWarning 
              ? "bg-[#D96B6B] text-white" 
              : "bg-[#282828] border border-[#383838] text-[#F3EEE6]"
          }`}>
            <Clock size={14} className={timeWarning ? "text-white" : "text-[#C47C4A]"} />
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
            className={`w-9 h-9 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer shrink-0 ${
              idx === currentQuestionIdx
                ? "bg-[#C47C4A] text-white ring-2 ring-[#C47C4A]/40"
                : answers[q.id]
                ? "bg-[#6D927A]/20 text-[#6D927A] border border-[#6D927A]/40"
                : "bg-[#222222] text-[#A8A29E] border border-[#2C2C2C] hover:border-[#383838]"
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="bg-[#1B1B1B] border border-[#2C2C2C] rounded-xl p-6 sm:p-7 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold text-[#C47C4A] uppercase tracking-wider">
              Difficulty: {currentQ.difficulty}
            </span>
            <h3 className="text-base sm:text-lg font-serif font-semibold text-[#F3EEE6] leading-relaxed">
              {currentQ.questionText}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = answers[currentQ.id] === opt;
              return (
                <div
                  key={oIdx}
                  onClick={() => handleSelectAnswer(currentQ.id, opt)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-sm min-h-[48px] ${
                    isSelected
                      ? "border-[#C47C4A] bg-[#C47C4A]/10 text-[#F3EEE6] font-semibold ring-1 ring-[#C47C4A]/40"
                      : "border-[#2C2C2C] bg-[#222222] hover:border-[#383838] text-[#D6D0C7]"
                  }`}
                >
                  <span className="pr-3 leading-relaxed">{opt}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? "border-[#C47C4A] bg-[#C47C4A] text-white" : "border-[#3E3E3E]"
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="pt-5 border-t border-[#2C2C2C] flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
              className={`btn-charcoal-secondary text-xs ${currentQuestionIdx === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              Previous
            </button>

            {isLastQuestion ? (
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="btn-copper-primary text-xs"
              >
                Submit Exam ({answeredCount}/{assessment.questions.length})
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentQuestionIdx(prev => Math.min(assessment.questions.length - 1, prev + 1))}
                className="btn-copper-primary text-xs"
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
