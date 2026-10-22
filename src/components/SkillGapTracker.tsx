import React, { useState } from "react";
import { SkillGap, LearningDomain } from "../types";
import { 
  BookOpen, 
  Filter, 
  Loader2, 
  TrendingDown,
  CheckCircle2,
  AlertTriangle
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
    <div className="space-y-8" id="skill-gap-tracker">
      {/* Header with summary stats */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#2C2C2C] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[#F3EEE6] tracking-tight">
            Competency Gap & Skill Matrix
          </h1>
          <p className="text-sm text-[#A8A29E] mt-1">
            Real-time evaluation of strengths and weak areas identified across your coursework.
          </p>
        </div>
        
        <button 
          type="button"
          onClick={onNavigateToAssessment}
          className="btn-copper-primary text-xs shrink-0"
        >
          Retake Assessment
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#1B1B1B] border border-[#2C2C2C] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#D96B6B]">Skills Needing Focus</span>
            <div className="text-3xl font-bold font-mono text-[#F3EEE6] tabular-nums">{weakCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#D96B6B]/15 text-[#D96B6B] flex items-center justify-center">
            <TrendingDown size={20} />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#1B1B1B] border border-[#2C2C2C] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#D7B87B]">Moderate Mastery</span>
            <div className="text-3xl font-bold font-mono text-[#F3EEE6] tabular-nums">{moderateCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#D7B87B]/15 text-[#D7B87B] flex items-center justify-center">
            <AlertTriangle size={18} />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#1B1B1B] border border-[#2C2C2C] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#6D927A]">Proficient Topics</span>
            <div className="text-3xl font-bold font-mono text-[#F3EEE6] tabular-nums">{strongCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#6D927A]/15 text-[#6D927A] flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-[#1B1B1B] border border-[#2C2C2C] rounded-xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center text-xs">
        <div className="flex items-center gap-1.5 text-[#F3EEE6] font-semibold shrink-0">
          <Filter size={14} className="text-[#C47C4A]" />
          <span>Filter By:</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
          {/* Filter by Domain */}
          <select 
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-[#222222] border border-[#2C2C2C] rounded-lg text-xs font-medium text-[#F3EEE6] focus:border-[#C47C4A] min-h-[40px]"
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
            className="w-full sm:w-auto px-3 py-2 bg-[#222222] border border-[#2C2C2C] rounded-lg text-xs font-medium text-[#F3EEE6] focus:border-[#C47C4A] min-h-[40px]"
          >
            <option value="all">All Mastery Levels</option>
            <option value="weak">Weak (&lt; 50%)</option>
            <option value="moderate">Moderate (50% - 79%)</option>
            <option value="strong">Proficient (&ge; 80%)</option>
          </select>
        </div>

        <span className="text-[#A8A29E] text-xs sm:ml-auto font-mono">
          Showing {filteredGaps.length} of {skillGaps.length}
        </span>
      </div>

      {/* Skill Gaps Grid */}
      {filteredGaps.length === 0 ? (
        <div className="p-16 bg-[#1B1B1B] border border-[#2C2C2C] rounded-2xl text-center space-y-3">
          <BookOpen className="w-10 h-10 text-[#78716C] mx-auto" />
          <div className="space-y-1">
            <h3 className="font-semibold text-[#F3EEE6] text-sm">No skill gaps matching filter</h3>
            <p className="text-[#A8A29E] text-xs max-w-sm mx-auto">
              {skillGaps.length === 0 
                ? "Complete a course assessment to map your personal competency baseline."
                : "No competencies match the selected criteria. Try adjusting your filters."}
            </p>
          </div>
          {skillGaps.length === 0 && (
            <button 
              type="button"
              onClick={onNavigateToAssessment}
              className="btn-copper-primary text-xs"
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
                className="p-5 rounded-xl border border-[#2C2C2C] flex flex-col justify-between space-y-4 bg-[#1B1B1B]"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono font-semibold text-[#78716C] uppercase tracking-wider">{domainName}</span>
                      <h3 className="font-semibold text-[#F3EEE6] text-base">{gap.competencyName}</h3>
                    </div>

                    <span className={`text-xs font-mono font-medium ${
                      isStrong
                        ? "text-[#6D927A]"
                        : isWeak
                        ? "text-[#D96B6B]"
                        : "text-[#D7B87B]"
                    }`}>
                      {gap.level}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#A8A29E]">Evaluated Score</span>
                      <span className="font-semibold text-[#F3EEE6] tabular-nums">{gap.score}%</span>
                    </div>
                    <div className="w-full bg-[#262626] h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          isStrong ? "bg-[#6D927A]" : isWeak ? "bg-[#D96B6B]" : "bg-[#D7B87B]"
                        }`} 
                        style={{ width: `${gap.score}%` }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#262626] space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#222222] border border-[#2C2C2C] space-y-1">
                    <span className="text-xs font-mono font-semibold text-[#C47C4A] uppercase tracking-wider block">Diagnostic Insight</span>
                    <p className="text-[#D6D0C7] leading-relaxed text-xs">
                      {gap.reason}
                    </p>
                  </div>

                  {onPracticeGap && (
                    <button
                      type="button"
                      onClick={() => handlePractice(gap.competencyId)}
                      disabled={practicingId !== null}
                      className="btn-copper-primary w-full text-xs"
                    >
                      {practicingId === gap.competencyId ? (
                        <>
                          <Loader2 size={13} className="animate-spin text-white" />
                          <span>Generating targeted practice quiz...</span>
                        </>
                      ) : (
                        <span>Practice this topic</span>
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
