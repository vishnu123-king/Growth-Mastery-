import React, { useState } from "react";
import { Recommendation } from "../types";
import { 
  Inbox, 
  ArrowUpRight,
  Sparkles,
  BookOpen,
  Check,
  CheckCircle2,
  Compass,
  Flame,
  Clock,
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
    <div className="space-y-6" id="recommendations-view">
      {/* Editorial Hero Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/15 border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
              <Compass size={13} className="text-amber-200" />
              <span>Adaptive Study Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
              Remediation Pathways
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
              Curated study assignments synthesized automatically from your diagnostic performance to target critical skill gaps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/15 border border-white/20 rounded-xl px-4 py-3 backdrop-blur-xs text-center min-w-[100px]">
              <span className="block text-2xl font-bold text-white font-mono">{activeCount}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200">Pending</span>
            </div>
            <div className="bg-white/15 border border-white/20 rounded-xl px-4 py-3 backdrop-blur-xs text-center min-w-[100px]">
              <span className="block text-2xl font-bold text-white font-mono">{completedCount}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200">Mastered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Filter Bar & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilterMode('active')}
            className={`py-2 px-3.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              filterMode === 'active' 
                ? "bg-amber-600 text-white font-bold shadow-xs" 
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            <Flame size={13} />
            <span>Active Target ({activeCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('completed')}
            className={`py-2 px-3.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              filterMode === 'completed' 
                ? "bg-indigo-650 text-white font-bold shadow-xs" 
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
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
                ? "bg-stone-900 text-white font-bold shadow-xs" 
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            <Layers size={13} />
            <span>All Lessons ({recommendations.length})</span>
          </button>
        </div>

        <button 
          type="button"
          onClick={onNavigateToAssessment}
          className="text-xs font-bold text-indigo-700 hover:text-indigo-900 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1"
        >
          <span>Refresh via New Exam</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      {/* Recommendations Cards Layout */}
      {filteredRecs.length === 0 ? (
        <div className="p-12 sm:p-16 bg-white border border-stone-200 rounded-2xl text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <Inbox size={26} />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-bold text-stone-900 text-base">
              {filterMode === 'active' ? "All active recommendations completed!" : "No completed lessons yet"}
            </h3>
            <p className="text-stone-500 text-xs leading-relaxed">
              {filterMode === 'active'
                ? "You have completed all currently assigned lessons. Take an assessment or diagnostic quiz to update your skill profile."
                : "Mark study items complete as you finish reviewing them to build your mastery timeline."}
            </p>
          </div>
          {filterMode === 'active' && (
            <button 
              type="button"
              onClick={onNavigateToAssessment}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              Take Assessment Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredRecs.map((rec) => {
            const isHigh = rec.priority === "High";

            return (
              <div 
                key={rec.id}
                className={`rounded-2xl border flex flex-col justify-between transition-all relative overflow-hidden ${
                  rec.completed 
                    ? "bg-stone-50/80 border-stone-200 opacity-80" 
                    : isHigh
                      ? "bg-white border-rose-200 hover:border-rose-300 shadow-xs hover:shadow-md"
                      : "bg-white border-stone-200 hover:border-stone-300 shadow-xs hover:shadow-md"
                }`}
              >
                {/* Top color indicator stripe */}
                <div className={`h-1.5 w-full ${
                  rec.completed 
                    ? "bg-indigo-600" 
                    : isHigh 
                      ? "bg-rose-500" 
                      : "bg-amber-500"
                }`} />

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-stone-700 truncate max-w-[170px] uppercase tracking-wider">
                        {rec.competencyName}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isHigh 
                          ? "bg-rose-100 text-rose-800" 
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {rec.priority} Priority
                      </span>
                    </div>

                    <h3 className="font-bold text-stone-900 text-sm leading-snug hover:text-indigo-600 transition-colors">
                      {rec.customTitle || "Targeted Skill Reference Module"}
                    </h3>

                    <p className="text-stone-600 text-xs line-clamp-3 leading-relaxed">
                      {rec.customDescription || "Complete this tailored unit to address foundational competency gaps identified in your latest evaluation."}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Reasoning note - flat left-border accent, no full border-box */}
                    <div className="pl-3 border-l-2 border-amber-500/60 py-1 space-y-1">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider font-mono">
                        <Sparkles size={11} className="text-amber-500" />
                        <span>Diagnostic Reason</span>
                      </div>
                      <p className="text-stone-600 dark:text-stone-300 text-xs leading-relaxed font-sans italic">
                        {rec.reason}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                      {rec.customUrl ? (
                        <a 
                          href={rec.customUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1 group"
                        >
                          <span>Open Material</span>
                          <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                      ) : (
                        <span className="text-stone-400 text-[11px] font-medium flex items-center gap-1">
                          <BookOpen size={12} />
                          <span>Self-directed</span>
                        </span>
                      )}

                      <button 
                        type="button"
                        onClick={() => onCompleteRec(rec.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          rec.completed 
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100/50" 
                            : "bg-stone-900 hover:bg-indigo-600 text-white shadow-2xs"
                        }`}
                      >
                        {rec.completed ? (
                          <>
                            <Check size={12} className="stroke-[3]" />
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
