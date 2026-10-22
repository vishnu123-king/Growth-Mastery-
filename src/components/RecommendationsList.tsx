import React, { useState } from "react";
import { Recommendation } from "../types";
import { 
  Inbox, 
  ArrowUpRight, 
  BookOpen, 
  Check, 
  Compass, 
  Flame, 
  CheckCircle2, 
  Layers 
} from "lucide-react";

interface RecommendationsListProps {
  recommendations: Recommendation[];
  onCompleteRec: (id: string) => void;
  onNavigateToAssessment: () => void;
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({
  recommendations,
  onCompleteRec,
  onNavigateToAssessment
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'completed'>('active');

  const filteredRecs = recommendations.filter(rec => {
    if (filterMode === 'active') return !rec.completed;
    if (filterMode === 'completed') return rec.completed;
    return true;
  });

  const activeCount = recommendations.filter(r => !r.completed).length;
  const completedCount = recommendations.filter(r => r.completed).length;

  return (
    <div className="space-y-8" id="recommendations-view">
      {/* Editorial Header Banner */}
      <div className="bg-[#1B1B1B] border border-[#2C2C2C] rounded-2xl p-6 sm:p-7 text-[#F3EEE6] relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#D7B87B]">
              <Compass size={13} className="text-[#D7B87B]" />
              <span>Adaptive Study Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight text-[#F3EEE6]">
              Remediation Pathways
            </h1>
            <p className="text-sm text-[#D6D0C7] leading-relaxed">
              Targeted study units synthesized automatically from your diagnostic performance to resolve specific competency gaps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#222222] border border-[#2C2C2C] rounded-xl px-4 py-3 text-center min-w-[100px]">
              <span className="block text-2xl font-bold text-[#D7B87B] font-mono tabular-nums">{activeCount}</span>
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#A8A29E]">Pending</span>
            </div>
            <div className="bg-[#222222] border border-[#2C2C2C] rounded-xl px-4 py-3 text-center min-w-[100px]">
              <span className="block text-2xl font-bold text-[#6D927A] font-mono tabular-nums">{completedCount}</span>
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#A8A29E]">Mastered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Filter Bar & Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1B1B1B] p-2.5 rounded-xl border border-[#2C2C2C]">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setFilterMode('active')}
            className={`py-2 px-3.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              filterMode === 'active' 
                ? "bg-[#C47C4A] text-white font-semibold" 
                : "text-[#A8A29E] hover:text-[#F3EEE6] hover:bg-[#222222]"
            }`}
          >
            <Flame size={13} />
            <span>Active Targets ({activeCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('completed')}
            className={`py-2 px-3.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              filterMode === 'completed' 
                ? "bg-[#C47C4A] text-white font-semibold" 
                : "text-[#A8A29E] hover:text-[#F3EEE6] hover:bg-[#222222]"
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Completed ({completedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`py-2 px-3.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              filterMode === 'all' 
                ? "bg-[#282828] text-white font-semibold" 
                : "text-[#A8A29E] hover:text-[#F3EEE6] hover:bg-[#222222]"
            }`}
          >
            <Layers size={13} />
            <span>All Lessons ({recommendations.length})</span>
          </button>
        </div>

        <button 
          type="button"
          onClick={onNavigateToAssessment}
          className="text-xs font-semibold text-[#C47C4A] hover:text-[#D18958] px-3 py-1.5 rounded-lg hover:bg-[#222222] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Refresh via New Exam</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      {/* Recommendations Cards Layout */}
      {filteredRecs.length === 0 ? (
        <div className="p-12 sm:p-16 bg-[#1B1B1B] border border-[#2C2C2C] rounded-2xl text-center space-y-4">
          <div className="w-14 h-14 bg-[#222222] text-[#D7B87B] rounded-2xl flex items-center justify-center mx-auto border border-[#2C2C2C]">
            <Inbox size={26} />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-semibold text-[#F3EEE6] text-base">
              {filterMode === 'active' ? "All active recommendations completed" : "No completed lessons yet"}
            </h3>
            <p className="text-[#A8A29E] text-xs leading-relaxed">
              {filterMode === 'active'
                ? "You have completed all currently assigned lessons. Take a diagnostic assessment to update your skill profile."
                : "Mark study items complete as you finish reviewing them to build your mastery timeline."}
            </p>
          </div>
          {filterMode === 'active' && (
            <button 
              type="button"
              onClick={onNavigateToAssessment}
              className="btn-copper-primary text-xs"
            >
              Take Assessment Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecs.map((rec) => {
            const isHigh = rec.priority === "High";

            return (
              <div 
                key={rec.id}
                className={`rounded-xl border flex flex-col justify-between transition-all bg-[#1B1B1B] ${
                  rec.completed 
                    ? "border-[#2C2C2C] opacity-75" 
                    : isHigh
                      ? "border-[#D96B6B]/40 hover:border-[#D96B6B]/70"
                      : "border-[#2C2C2C] hover:border-[#383838]"
                }`}
              >
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs font-mono">
                      <span className="text-[#A8A29E] truncate max-w-[170px] uppercase tracking-wider">
                        {rec.competencyName}
                      </span>
                      <span className={isHigh ? "text-[#D96B6B] font-semibold" : "text-[#D7B87B]"}>
                        {rec.priority} Priority
                      </span>
                    </div>

                    <h3 className="font-semibold text-[#F3EEE6] text-sm leading-snug">
                      {rec.customTitle || "Targeted Skill Reference Module"}
                    </h3>

                    <p className="text-[#A8A29E] text-xs line-clamp-3 leading-relaxed">
                      {rec.customDescription || "Complete this tailored unit to address foundational competency gaps identified in your latest evaluation."}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="pl-3 border-l-2 border-[#C47C4A]/50 py-1 space-y-0.5">
                      <div className="text-[11px] font-mono font-medium text-[#78716C] uppercase tracking-wider">
                        Diagnostic Insight
                      </div>
                      <p className="text-[#D6D0C7] text-xs leading-relaxed italic">
                        {rec.reason}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#262626] text-xs">
                      {rec.customUrl ? (
                        <a 
                          href={rec.customUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[#C47C4A] hover:text-[#D18958] font-semibold inline-flex items-center gap-1 group"
                        >
                          <span>Open Material</span>
                          <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                      ) : (
                        <span className="text-[#78716C] text-xs font-mono flex items-center gap-1">
                          <BookOpen size={12} />
                          <span>Self-directed</span>
                        </span>
                      )}

                      <button 
                        type="button"
                        onClick={() => onCompleteRec(rec.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                          rec.completed 
                            ? "bg-[#6D927A]/15 text-[#6D927A] border border-[#6D927A]/30" 
                            : "btn-charcoal-secondary text-xs"
                        }`}
                      >
                        {rec.completed ? (
                          <>
                            <Check size={12} />
                            <span>Completed</span>
                          </>
                        ) : (
                          <span>Mark Mastered</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
