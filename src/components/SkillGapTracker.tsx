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
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-slate-200 dark:border-stone-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Competency Gap & Skill Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-stone-400 mt-1">
            Real-time evaluation of strengths and weak areas identified across your coursework.
          </p>
        </div>
        
        <button 
          type="button"
          onClick={onNavigateToAssessment}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 min-h-[44px] flex items-center justify-center"
        >
          Retake Assessment
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-[#151C28] border border-rose-200 dark:border-rose-900/40 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Skills Needing Focus</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">{weakCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center shadow-xs">
            <TrendingDown size={20} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#151C28] border border-blue-200 dark:border-blue-900/40 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Moderate Mastery</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">{moderateCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 flex items-center justify-center shadow-xs">
            <AlertTriangle size={18} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#151C28] border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Proficient Topics</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">{strongCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-center shadow-xs">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-3.5 bg-white dark:bg-[#151C28] border border-slate-200 dark:border-stone-800 rounded-xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center text-xs shadow-xs">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-stone-300 font-bold shrink-0">
          <Filter size={14} className="text-indigo-600 dark:text-indigo-400" />
          <span>Filter by:</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
          {/* Filter by Domain */}
          <select 
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-[#192231] border border-slate-300 dark:border-stone-700 rounded-lg text-xs font-medium text-slate-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[40px]"
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
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-[#192231] border border-slate-300 dark:border-stone-700 rounded-lg text-xs font-medium text-slate-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[40px]"
          >
            <option value="all">All Mastery Levels</option>
            <option value="weak">Weak (&lt; 50%)</option>
            <option value="moderate">Moderate (50% - 79%)</option>
            <option value="strong">Proficient (&ge; 80%)</option>
          </select>
        </div>

        <span className="text-slate-400 dark:text-stone-500 text-xs sm:ml-auto font-medium">
          Showing {filteredGaps.length} of {skillGaps.length}
        </span>
      </div>

      {/* Skill Gaps Grid */}
      {filteredGaps.length === 0 ? (
        <div className="p-16 bg-white dark:bg-[#151C28] border border-slate-200 dark:border-stone-800 rounded-2xl text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-stone-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">No skill gaps matching filter</h3>
            <p className="text-slate-500 dark:text-stone-400 text-xs max-w-sm mx-auto">
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
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all bg-white dark:bg-[#151C28] ${
                  isWeak 
                    ? "border-rose-200 dark:border-rose-900/40 shadow-xs" 
                    : isStrong 
                      ? "border-emerald-200 dark:border-emerald-900/40 shadow-xs" 
                      : "border-blue-200 dark:border-blue-900/40 shadow-xs"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">{domainName}</span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{gap.competencyName}</h3>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold shadow-2xs border ${
                      isStrong
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50"
                        : isWeak
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/50"
                        : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/50"
                    }`}>
                      {gap.level}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500 dark:text-stone-400">Evaluated Score</span>
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums">{gap.score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#0B0F17] h-2.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-stone-800">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          isStrong ? "bg-emerald-500" : isWeak ? "bg-rose-500" : "bg-blue-500"
                        }`} 
                        style={{ width: `${gap.score}%` }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-stone-800/70 space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0E141E] border border-slate-100 dark:border-stone-800/60 space-y-1">
                    <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block font-mono">Diagnostic Insight</span>
                    <p className="text-slate-600 dark:text-stone-300 leading-relaxed text-xs font-sans">
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
