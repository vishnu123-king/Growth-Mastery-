import React, { useState } from "react";
import { Material, Quiz, QuizAttempt } from "../types";
import { 
  Upload, 
  Loader2, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Clock, 
  RotateCcw,
  Plus,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Layers,
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
    setCustomTitle(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setPasteContent(text || "");
    };
    reader.readAsText(file);
  };

  // Submit Study Material
  const handleAddMaterial = async () => {
    if (!pasteContent.trim()) return;
    setLoading(true);
    try {
      const title = customTitle.trim() || `Study Notes ${new Date().toLocaleDateString()}`;
      await onUploadMaterial(title, pasteContent);
      setPasteContent("");
      setCustomTitle("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Trigger AI Quiz Generation
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
      <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-white border border-stone-200 rounded-2xl min-h-[420px] shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div className="text-center space-y-1.5 max-w-sm mx-auto">
          <h3 className="font-bold text-stone-900 text-base">
            {activeStep === 'materials' ? "Analyzing material & extracting concepts..." : "Evaluating answers & computing score..."}
          </h3>
          <p className="text-stone-500 text-xs leading-relaxed">
            Synthesizing comprehension questions and diagnostic mastery breakdowns.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="material-quiz-flow">
      {/* Step 1: Study Material Dashboard & Generator */}
      {activeStep === 'materials' && (
        <div className="space-y-6">
          {/* Editorial Hero */}
          <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-purple-900 rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-violet-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
                  <FileCheck size={13} className="text-violet-300" />
                  <span>Document Studio</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
                  Document Quiz Studio
                </h1>
                <p className="text-violet-200 text-xs sm:text-sm leading-relaxed">
                  Upload textbook excerpts, course readings, or lecture notes to auto-generate personalized comprehension checks.
                </p>
              </div>

              <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 backdrop-blur-xs text-center shrink-0">
                <span className="block text-2xl font-bold text-white font-mono">{materials.length}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-violet-200">Documents Saved</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Upload New Material */}
            <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-stone-900 border-b border-stone-100 pb-3">
                <Upload size={16} className="text-violet-600" />
                <span>Upload Study Document</span>
              </div>

              {fileError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg font-medium">
                  {fileError}
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Document Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Computer Architecture Chapter 4"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Upload File (.txt, .md, .pdf)</label>
                  <input
                    type="file"
                    accept=".txt,.md,.json,.pdf"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-violet-600 file:text-white hover:file:bg-violet-700 cursor-pointer bg-stone-50 border border-stone-300 rounded-xl p-1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Or Paste Notes Directly</label>
                  <textarea
                    rows={4}
                    placeholder="Paste lecture notes or code documentation here..."
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    className="w-full p-3.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white"
                  />
                </div>

                <button
                  type="button"
                  disabled={!pasteContent.trim()}
                  onClick={handleAddMaterial}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus size={14} />
                  <span>Save to Document Library</span>
                </button>
              </div>
            </div>

            {/* Right Column: Existing Materials */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Saved Documents ({materials.length})
                </h3>
                <span className="text-[11px] text-stone-400">Ready for instant generation</span>
              </div>

              {materials.length === 0 ? (
                <div className="p-16 border border-dashed border-stone-300 rounded-2xl text-center space-y-2 bg-white">
                  <FileText className="w-10 h-10 text-stone-300 mx-auto" />
                  <h4 className="font-bold text-stone-800 text-sm">No study documents added yet</h4>
                  <p className="text-stone-400 text-xs max-w-xs mx-auto">
                    Upload your first document or paste lecture notes to generate custom quiz questions.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {materials.map((mat) => (
                    <div 
                      key={mat.id}
                      className="p-5 bg-white border border-stone-200 rounded-2xl shadow-xs hover:border-stone-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                          <FileText size={16} className="text-violet-600" />
                          <span>{mat.fileName}</span>
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-stone-400">
                          <span>{new Date(mat.createdAt).toLocaleDateString()}</span>
                          <span>·</span>
                          <span className="font-medium text-stone-600 font-mono">{mat.content.length} chars</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleGenerate(mat.id)}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
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
          <div className="bg-stone-900 text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
                Document Quiz
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Question {currentIdx + 1} of {quiz.questions.length}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setActiveStep('materials')}
              className="text-xs text-stone-300 hover:text-white underline cursor-pointer self-start sm:self-auto"
            >
              Exit to Library
            </button>
          </div>

          {quiz.questions[currentIdx] && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">
                  Comprehension Evaluation
                </span>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 whitespace-pre-wrap leading-relaxed">
                  {quiz.questions[currentIdx].questionText}
                </h3>
              </div>

              <div className="space-y-3">
                {quiz.questions[currentIdx].options.map((opt, oIdx) => {
                  const isSelected = quizAnswers[quiz.questions[currentIdx].id] === opt;
                  return (
                    <div
                      key={oIdx}
                      onClick={() => setQuizAnswers(prev => ({ ...prev, [quiz.questions[currentIdx].id]: opt }))}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs sm:text-sm font-medium ${
                        isSelected
                          ? "border-violet-600 bg-violet-50 text-violet-950 font-bold shadow-xs ring-1 ring-violet-500/20"
                          : "border-stone-200 bg-white hover:border-stone-300 text-stone-800"
                      }`}
                    >
                      <span>{opt}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? "border-violet-600 bg-violet-600 text-white" : "border-stone-300"
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-5 border-t border-stone-100 flex items-center justify-between gap-4">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                    currentIdx === 0
                      ? "text-stone-300 cursor-not-allowed"
                      : "bg-white hover:bg-stone-50 border border-stone-300 text-stone-700"
                  }`}
                >
                  Previous
                </button>

                {currentIdx === quiz.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                    className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
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
          <div className="bg-white border border-stone-200 rounded-2xl p-7 text-center space-y-3 shadow-xs relative overflow-hidden">
            <div className="h-1.5 bg-violet-600 absolute top-0 left-0 right-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700">
              Evaluation Completed
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
              Comprehension Score
            </h1>
            <div className="text-5xl font-extrabold text-violet-900 font-mono pt-1">
              {attempt.score}%
            </div>
            <p className="text-stone-500 text-xs">
              Answered <strong className="text-stone-800">{quiz.questions.filter(q => (quizAnswers[q.id] || "").trim().toLowerCase() === (q.correctAnswer || "").trim().toLowerCase()).length}</strong> of <strong className="text-stone-800">{quiz.questions.length}</strong> questions correctly.
            </p>
          </div>

          {/* Question Review */}
          <div className="space-y-3.5">
            <h3 className="text-sm font-bold text-stone-900">Question-by-Question Review</h3>
            {quiz.questions.map((q, idx) => {
              const studentAns = (quizAnswers[q.id] || "").trim();
              const correctAns = (q.correctAnswer || "").trim();
              const isCorrect = studentAns.toLowerCase() === correctAns.toLowerCase();

              return (
                <div key={q.id} className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">Question {idx + 1}</span>
                      <h4 className="font-bold text-stone-900 text-sm leading-relaxed">{q.questionText}</h4>
                    </div>
                    {isCorrect ? (
                      <span className="text-emerald-700 text-xs font-semibold shrink-0">
                        Correct
                      </span>
                    ) : (
                      <span className="text-rose-700 text-xs font-semibold shrink-0">
                        Incorrect
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1.5">
                    <div className="text-stone-600"><strong className="text-stone-800">Your answer:</strong> {studentAns || "(Not answered)"}</div>
                    <div className="text-emerald-700 font-semibold"><strong>Correct answer:</strong> {correctAns}</div>
                    {q.explanation && <p className="text-stone-600 pt-1.5 border-t border-stone-200 font-sans leading-relaxed">{q.explanation}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-between">
            <button
              type="button"
              onClick={() => setActiveStep('materials')}
              className="px-5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              Back to Documents
            </button>
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
