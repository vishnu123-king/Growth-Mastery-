import React, { useState } from "react";
import { Material, Quiz, QuizAttempt } from "../types";
import { 
  Upload, 
  Loader2, 
  ChevronRight, 
  FileText, 
  Plus, 
  Sparkles, 
  FileCheck 
} from "lucide-react";

interface MaterialQuizFlowProps {
  materials: Material[];
  onUploadMaterial: (name: string, content: string) => Promise<Material>;
  onGenerateQuiz: (materialId: string) => Promise<Quiz>;
  onSubmitQuiz: (quizId: string, answers: Record<string, string>) => Promise<QuizAttempt>;
  onNavigateToDashboard: () => void;
}

export const MaterialQuizFlow: React.FC<MaterialQuizFlowProps> = ({
  materials,
  onUploadMaterial,
  onGenerateQuiz,
  onSubmitQuiz,
  onNavigateToDashboard
}) => {
  const [activeStep, setActiveStep] = useState<'materials' | 'quiz' | 'result'>('materials');
  
  // Material Upload Form
  const [pasteContent, setPasteContent] = useState<string>("");
  const [customTitle, setCustomTitle] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  
  const [loading, setLoading] = useState<boolean>(false);
  const [, setActiveMaterialId] = useState<string>("");

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);

  // File Upload Helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFileError("File size exceeds 2MB limit.");
      return;
    }

    setFileError("");
    setCustomTitle(file.name.replace(/\.[^/.]+$/, ""));

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPasteContent(content);
    };
    reader.readAsText(file);
  };

  const handleAddMaterial = async () => {
    if (!pasteContent.trim()) return;
    setLoading(true);
    try {
      const name = customTitle.trim() || `Study Notes (${new Date().toLocaleDateString()})`;
      await onUploadMaterial(name, pasteContent);
      setPasteContent("");
      setCustomTitle("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Generate Quiz
  const handleGenerate = async (matId: string) => {
    setLoading(true);
    setActiveMaterialId(matId);
    try {
      const generatedQuiz = await onGenerateQuiz(matId);
      setQuiz(generatedQuiz);
      setCurrentIdx(0);
      setQuizAnswers({});
      setAttempt(null);
      setActiveStep('quiz');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Submit Quiz Answering
  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    setLoading(true);
    try {
      const finalAttempt = await onSubmitQuiz(quiz.id, quizAnswers);
      setAttempt(finalAttempt);
      setActiveStep('result');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-[#1B1B1B] border border-[#2C2C2C] rounded-2xl min-h-[420px]">
        <div className="w-12 h-12 rounded-xl bg-[#C47C4A] text-white flex items-center justify-center shadow-md">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div className="text-center space-y-1.5 max-w-sm mx-auto">
          <h3 className="font-semibold text-[#F3EEE6] text-base">
            {activeStep === 'materials' ? "Analyzing material & extracting concepts..." : "Evaluating answers & computing score..."}
          </h3>
          <p className="text-[#A8A29E] text-xs leading-relaxed">
            Synthesizing comprehension questions and diagnostic mastery breakdowns.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="material-quiz-flow">
      {/* Step 1: Study Material Dashboard & Generator */}
      {activeStep === 'materials' && (
        <div className="space-y-8">
          {/* Editorial Header */}
          <div className="bg-[#1B1B1B] border border-[#2C2C2C] rounded-2xl p-6 sm:p-7 text-[#F3EEE6] relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#D7B87B]">
                  <FileCheck size={14} className="text-[#D7B87B]" />
                  <span>Document Studio</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight text-[#F3EEE6]">
                  Document Quiz Studio
                </h1>
                <p className="text-sm text-[#D6D0C7] leading-relaxed">
                  Upload textbook excerpts, course readings, or lecture notes to auto-generate customized comprehension evaluations.
                </p>
              </div>

              <div className="bg-[#222222] border border-[#2C2C2C] rounded-xl px-5 py-3 text-center shrink-0">
                <span className="block text-2xl font-bold text-[#F3EEE6] font-mono tabular-nums">{materials.length}</span>
                <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#A8A29E]">Saved Documents</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Upload New Material */}
            <div className="lg:col-span-5 bg-[#1B1B1B] border border-[#2C2C2C] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#F3EEE6] border-b border-[#2C2C2C] pb-3">
                <Upload size={16} className="text-[#C47C4A]" />
                <span>Upload Study Document</span>
              </div>

              {fileError && (
                <div className="p-3 bg-[#D96B6B]/15 border border-[#D96B6B]/35 text-[#D96B6B] text-xs rounded-lg font-medium">
                  {fileError}
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#F3EEE6] mb-1">Document Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Distributed Consensus Chapter 2"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#222222] border border-[#2C2C2C] rounded-lg text-xs text-[#F3EEE6] placeholder-[#78716C] focus:border-[#C47C4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F3EEE6] mb-1">Select File (.txt, .md, .pdf)</label>
                  <input
                    type="file"
                    accept=".txt,.md,.json,.pdf"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-[#A8A29E] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#2C2C2C] file:text-[#F3EEE6] hover:file:bg-[#383838] cursor-pointer bg-[#222222] border border-[#2C2C2C] rounded-lg p-1.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F3EEE6] mb-1">Or Paste Notes Directly</label>
                  <textarea
                    rows={4}
                    placeholder="Paste lecture notes or reference text here..."
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    className="w-full p-3 bg-[#222222] border border-[#2C2C2C] rounded-lg text-xs text-[#F3EEE6] placeholder-[#78716C] focus:border-[#C47C4A]"
                  />
                </div>

                <button
                  type="button"
                  disabled={!pasteContent.trim()}
                  onClick={handleAddMaterial}
                  className="btn-copper-primary w-full text-xs"
                >
                  <Plus size={14} />
                  <span>Save to Document Library</span>
                </button>
              </div>
            </div>

            {/* Right Column: Existing Materials */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-semibold text-[#A8A29E] uppercase tracking-wider">
                  Saved Documents ({materials.length})
                </h3>
                <span className="text-xs font-mono text-[#78716C]">Ready for instant quiz generation</span>
              </div>

              {materials.length === 0 ? (
                <div className="p-16 border border-[#2C2C2C] rounded-2xl text-center space-y-2 bg-[#1B1B1B]">
                  <FileText className="w-10 h-10 text-[#78716C] mx-auto" />
                  <h4 className="font-semibold text-[#F3EEE6] text-sm">No study documents added yet</h4>
                  <p className="text-[#A8A29E] text-xs max-w-xs mx-auto">
                    Upload your first document or paste lecture notes to generate custom quiz questions.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {materials.map((mat) => (
                    <div 
                      key={mat.id}
                      className="p-5 bg-[#1B1B1B] border border-[#2C2C2C] rounded-xl hover:border-[#383838] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <h4 className="font-semibold text-[#F3EEE6] text-base flex items-center gap-2">
                          <FileText size={16} className="text-[#C47C4A]" />
                          <span>{mat.fileName}</span>
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-[#78716C] font-mono">
                          <span>{new Date(mat.createdAt).toLocaleDateString()}</span>
                          <span className="text-[#444444]" aria-hidden="true">·</span>
                          <span>{mat.content.length} characters</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleGenerate(mat.id)}
                        className="btn-copper-primary text-xs shrink-0"
                      >
                        <Sparkles size={13} />
                        <span>Generate Quiz</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Active Quiz Runner */}
      {activeStep === 'quiz' && quiz && (
        <div className="space-y-6" id="active-quiz-view">
          <div className="bg-[#1B1B1B] border border-[#2C2C2C] text-[#F3EEE6] p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#C47C4A]">
                Document Quiz
              </span>
              <h2 className="text-base sm:text-lg font-serif font-semibold text-[#F3EEE6]">
                Question {currentIdx + 1} of {quiz.questions.length}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setActiveStep('materials')}
              className="text-xs font-mono text-[#A8A29E] hover:text-[#F3EEE6] cursor-pointer"
            >
              Exit to Library
            </button>
          </div>

          {quiz.questions[currentIdx] && (
            <div className="bg-[#1B1B1B] border border-[#2C2C2C] rounded-xl p-6 sm:p-7 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-semibold text-[#C47C4A] uppercase tracking-wider">
                  Comprehension Check
                </span>
                <h3 className="text-base sm:text-lg font-serif font-semibold text-[#F3EEE6] leading-relaxed">
                  {quiz.questions[currentIdx].questionText}
                </h3>
              </div>

              <div className="space-y-2.5">
                {quiz.questions[currentIdx].options.map((opt, oIdx) => {
                  const isSelected = quizAnswers[quiz.questions[currentIdx].id] === opt;
                  return (
                    <div
                      key={oIdx}
                      onClick={() => setQuizAnswers(prev => ({ ...prev, [quiz.questions[currentIdx].id]: opt }))}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-sm ${
                        isSelected
                          ? "border-[#C47C4A] bg-[#C47C4A]/10 text-[#F3EEE6] font-semibold ring-1 ring-[#C47C4A]/40"
                          : "border-[#2C2C2C] bg-[#222222] hover:border-[#383838] text-[#D6D0C7]"
                      }`}
                    >
                      <span>{opt}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? "border-[#C47C4A] bg-[#C47C4A] text-white" : "border-[#3E3E3E]"
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-5 border-t border-[#2C2C2C] flex items-center justify-between gap-4">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  className={`btn-charcoal-secondary text-xs ${currentIdx === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  Previous
                </button>

                {currentIdx === quiz.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="btn-copper-primary text-xs"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx(prev => Math.min(quiz.questions.length - 1, prev + 1))}
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
      )}

      {/* Step 3: Graded Quiz Results */}
      {activeStep === 'result' && attempt && quiz && (
        <div className="space-y-6" id="quiz-result-view">
          <div className="bg-[#1B1B1B] border border-[#2C2C2C] rounded-2xl p-7 text-center space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#6D927A]">
              Evaluation Completed
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[#F3EEE6] tracking-tight">
              Comprehension Score
            </h1>
            <div className="text-5xl font-bold text-[#C47C4A] font-mono tabular-nums pt-1">
              {attempt.score}%
            </div>
            <p className="text-[#A8A29E] text-xs font-mono">
              Answered <strong className="text-[#F3EEE6]">{quiz.questions.filter(q => (quizAnswers[q.id] || "").trim().toLowerCase() === (q.correctAnswer || "").trim().toLowerCase()).length}</strong> of <strong className="text-[#F3EEE6]">{quiz.questions.length}</strong> questions correctly.
            </p>
          </div>

          {/* Question Review */}
          <div className="space-y-4">
            <h3 className="text-base font-serif font-semibold text-[#F3EEE6]">Question-by-Question Review</h3>
            {quiz.questions.map((q, idx) => {
              const studentAns = (quizAnswers[q.id] || "").trim();
              const correctAns = (q.correctAnswer || "").trim();
              const isCorrect = studentAns.toLowerCase() === correctAns.toLowerCase();

              return (
                <div key={q.id} className="p-5 bg-[#1B1B1B] rounded-xl border border-[#2C2C2C] space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-semibold text-[#C47C4A] uppercase tracking-wider">Question {idx + 1}</span>
                      <h4 className="font-serif font-semibold text-[#F3EEE6] text-sm leading-relaxed">{q.questionText}</h4>
                    </div>
                    {isCorrect ? (
                      <span className="text-[#6D927A] text-xs font-mono font-medium shrink-0">
                        Correct
                      </span>
                    ) : (
                      <span className="text-[#D96B6B] text-xs font-mono font-medium shrink-0">
                        Incorrect
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 bg-[#222222] border border-[#2C2C2C] rounded-lg text-xs space-y-1.5">
                    <div className="text-[#D6D0C7]"><strong>Your response:</strong> {studentAns || "(No answer selected)"}</div>
                    <div className="text-[#6D927A] font-medium"><strong>Correct answer:</strong> {correctAns}</div>
                    {q.explanation && <p className="text-[#A8A29E] pt-1.5 border-t border-[#2C2C2C] leading-relaxed">{q.explanation}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#2C2C2C] flex justify-between">
            <button
              type="button"
              onClick={() => setActiveStep('materials')}
              className="btn-charcoal-secondary text-xs"
            >
              Back to Documents
            </button>
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="btn-copper-primary text-xs"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
