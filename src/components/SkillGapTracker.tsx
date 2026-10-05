import React, { useState } from "react";
import { SkillGap, LearningDomain } from "../types";
import { 
  BookOpen, 
  Filter, 
  Loader2, 
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles
} from "lucide-react";

interface SkillGapTrackerProps {
  skillGaps: SkillGap[];
  domains: LearningDomain[];
  onNavigateToAssessment: () => void;
  onPracticeGap?: (competencyId: string) => void;
}

export const SkillGapTracker: React.FC<SkillGapTrackerProps> = ({
  skillGaps,
  domains,
  onNavigateToAssessment,
  onPracticeGap
}) => {
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterDomain, setFilterDomain] = useState<string>("all");
  const [practicingId, setPracticingId] = useState<string | null>(null);

  const handlePractice = async (compId: string) => {
    if (!onPracticeGap) return;
    setPracticingId(compId);
    try {
      await onPracticeGap(compId);
    } finally {
      setPracticingId(null);
    }
  };

  // Filtering Logic
  const filteredGaps = skillGaps.filter(gap => {
    const matchesLevel = filterLevel === "all" || gap.level.toLowerCase() === filterLevel.toLowerCase();
    const matchesDomain = filterDomain === "all" || gap.domainId === filterDomain;
    return matchesLevel && matchesDomain;
  });

  const weakCount = skillGaps.filter(g => g.level === "Weak").length;
  const moderateCount = skillGaps.filter(g => g.level === "Moderate").length;
  const strongCount = skillGaps.filter(g => g.level === "Strong").length;

  return (
    <div className="space-y-7" id="skill-gap-tracker">
      {/* Header with summary stats */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Competency Gap & Skill Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time evaluation of strengths and weak areas identified across your coursework.
          </p>
        </div>
        
        <button 
          type="button"
          onClick={onNavigateToAssessment}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
        >
          Retake Assessment
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Skills Needing Focus</span>
            <div className="text-2xl font-extrabold text-rose-950 tabular-nums">{weakCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
            <TrendingDown size={20} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Moderate Mastery</span>
            <div className="text-2xl font-extrabold text-blue-950 tabular-nums">{moderateCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs">
            <AlertTriangle size={18} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Proficient Topics</span>
            <div className="text-2xl font-extrabold text-emerald-950 tabular-nums">{strongCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap gap-3 items-center text-xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold">
          <Filter size={14} className="text-indigo-600" />
          <span>Filter by:</span>
        </div>

        {/* Filter by Domain */}
        <select 
          value={filterDomain}
          onChange={(e) => setFilterDomain(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Domains & Courses</option>
          {domains.map(dom => (
            <option key={dom.id} value={dom.id}>{dom.name}</option>
          ))}
        </select>

        {/* Filter by Level */}
        <select 
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Mastery Levels</option>
          <option value="weak">Weak (&lt; 50%)</option>
          <option value="moderate">Moderate (50% - 79%)</option>
          <option value="strong">Proficient (&ge; 80%)</option>
        </select>

        <span className="text-slate-400 text-xs ml-auto font-medium">
          Showing {filteredGaps.length} of {skillGaps.length}
        </span>
      </div>

      {/* Skill Gaps Grid */}
      {filteredGaps.length === 0 ? (
        <div className="p-16 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-sm">No skill gaps matching filter</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              {skillGaps.length === 0 
                ? "Complete a course assessment to map your personal competency baseline."
                : "No competencies match the selected criteria. Try adjusting your filters."}
            </p>
          </div>
          {skillGaps.length === 0 && (
            <button 
              type="button"
              onClick={onNavigateToAssessment}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Take First Assessment
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGaps.map((gap) => {
            const domainName = domains.find(d => d.id === gap.domainId)?.name || "General Track";
            const isWeak = gap.level === "Weak";
            const isStrong = gap.level === "Strong";

            return (
              <div 
                key={gap.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                  isWeak 
                    ? "bg-gradient-to-b from-white to-rose-50/30 border-rose-200/90 shadow-xs" 
                    : isStrong 
                      ? "bg-gradient-to-b from-white to-emerald-50/30 border-emerald-200/90 shadow-xs" 
                      : "bg-gradient-to-b from-white to-blue-50/30 border-blue-200/90 shadow-xs"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{domainName}</span>
                      <h3 className="font-bold text-slate-900 text-base">{gap.competencyName}</h3>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold shadow-2xs ${
                      isStrong
                        ? "bg-emerald-100 text-emerald-800"
                        : isWeak
                        ? "bg-rose-100 text-rose-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {gap.level}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Evaluated Score</span>
                      <span className="font-bold text-slate-900 tabular-nums">{gap.score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          isStrong ? "bg-emerald-500" : isWeak ? "bg-rose-500" : "bg-blue-500"
                        }`} 
                        style={{ width: `${gap.score}%` }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
                  <div className="pl-3 border-l-2 border-indigo-500/50 py-1 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-mono">Diagnostic Insight</span>
                    <p className="text-slate-600 dark:text-stone-300 leading-relaxed text-xs font-sans italic">
                      {gap.reason}
                    </p>
                  </div>

                  {onPracticeGap && (
                    <button
                      type="button"
                      onClick={() => handlePractice(gap.competencyId)}
                      disabled={practicingId !== null}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {practicingId === gap.competencyId ? (
                        <>
                          <Loader2 size={13} className="animate-spin text-white" />
                          <span>Generating targeted practice quiz...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          <span>Practice this topic</span>
                          <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
