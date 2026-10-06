import React from "react";
import { ProgressSummary, Recommendation } from "../types";
import { 
  ArrowRight, CheckCircle2, Calendar, ExternalLink, ArrowUpRight, 
  TrendingDown, Sparkles, Globe, Flame, Award, Target, BookOpen, Clock
} from "lucide-react";

interface DashboardProps {
  summary: ProgressSummary;
  recommendations: Recommendation[];
  userName?: string;
  onNavigate: (tab: string) => void;
  onCompleteRec: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  summary, 
  recommendations = [], 
  userName,
  onNavigate,
  onCompleteRec
}) => {
  const activeWeakGaps = (summary?.topicScores || []).filter(t => t.level === "Weak");
  const activeRecommendations = (recommendations || []).filter(r => !r.completed);
  const primaryRecommendation = activeRecommendations[0];

  return (
    <div className="space-y-10" id="student-dashboard">
      
      {/* 1. HERO / PRIMARY SECTION */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-blue-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 relative overflow-hidden">
        {/* Editorial Background Geometry */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-indigo-500/10 rounded-full translate-y-1/2 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-2.5 sm:space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
              <Sparkles size={13} className="text-amber-300" />
              <span>Diagnostic Learning Engine</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-white leading-tight">
              Welcome back, {userName || "Scholar"}
            </h1>
            
            <p className="text-xs sm:text-sm lg:text-base text-indigo-100/90 leading-relaxed font-sans">
              Your overall evaluated mastery level is at <strong className="text-white font-bold">{summary?.overallCompetency || 0}%</strong>. Currently tracking <span className="text-amber-300 font-bold">{activeWeakGaps.length} target areas</span> needing diagnostic focus.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onNavigate("assessment")}
              className="px-5 sm:px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-sans min-h-[44px]"
            >
              <Target size={15} />
              <span>Start Assessment</span>
            </button>
            
            <button
              type="button"
              onClick={() => onNavigate("skill-gaps")}
              className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-semibold transition-colors cursor-pointer min-h-[44px] flex items-center justify-center text-center"
            >
              <span>Verify Skill Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DASHBOARD INFORMATION HIERARCHY (Inline metrics, no card containers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-4 border-t border-stone-200/60 dark:border-stone-800/80">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block font-mono">Overall Progress</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-mono tracking-tight">
            {summary?.overallCompetency || 0}%
          </div>
          <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all" 
              style={{ width: `${Math.min(summary?.overallCompetency || 0, 100)}%` }} 
            />
          </div>
        </div>

        <div className="space-y-1 border-l border-stone-200 dark:border-stone-800 pl-4 sm:pl-6">
          <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block font-mono">Study Streak</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-mono tracking-tight flex items-baseline gap-1">
            <span>{summary?.streakDays || 0}</span>
            <span className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider font-sans">Days active</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 mt-2 font-sans truncate">Daily momentum</p>
        </div>

        <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-stone-200 dark:border-stone-800 pt-3 sm:pt-0 sm:pl-6">
          <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block font-mono">Unresolved Gaps</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-mono tracking-tight">
            {activeWeakGaps.length}
          </div>
          <button 
            type="button" 
            onClick={() => onNavigate("skill-gaps")}
            className="text-[10px] sm:text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 mt-2 block hover:underline"
          >
            Track focus areas →
          </button>
        </div>

        <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-stone-200 dark:border-stone-800 pt-3 sm:pt-0 pl-4 sm:pl-6">
          <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block font-mono">Completed Units</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-mono tracking-tight">
            {summary?.completedResourcesCount || 0}
          </div>
          <button 
            type="button" 
            onClick={() => onNavigate("recommendations")}
            className="text-[10px] sm:text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 mt-2 block hover:underline"
          >
            Review remediation →
          </button>
        </div>
      </div>

      {/* 3. ASYMMETRICAL 2-COLUMN SECTION (65% / 35% composition) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
        
        {/* Left Column - Diagnostic Matrix & Recommendations Stream */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Competency Matrix - Rendered directly on page as a clean list table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800/80 pb-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif">Competency Dashboard Matrix</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Tested topic rubrics with real-time performance weights</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("skill-gaps")}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Full Skill Index</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {(!summary?.topicScores || summary.topicScores.length === 0) ? (
                <div className="py-6 text-stone-400 text-xs">
                  No diagnostics parsed yet. Complete your first course assessment to initialize metrics.
                </div>
              ) : (
                summary.topicScores.slice(0, 5).map((topic) => {
                  const isStrong = topic.score >= 80;
                  const isModerate = topic.score >= 50 && topic.score < 80;
                  return (
                    <div key={topic.competencyId} className="py-4 flex items-center justify-between gap-6 transition-all hover:bg-stone-50/40 dark:hover:bg-stone-900/10 px-2 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate block">
                          {topic.competencyName}
                        </span>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="w-32 bg-stone-200 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden shrink-0">
                            <div 
                              className={`h-full rounded-full ${
                                isStrong ? "bg-emerald-500" : isModerate ? "bg-indigo-500" : "bg-rose-500"
                              }`} 
                              style={{ width: `${Math.min(topic.score, 100)}%` }} 
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-300">{topic.score}%</span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className={`text-xs font-bold ${
                          isStrong 
                            ? "text-emerald-700" 
                            : isModerate 
                              ? "text-indigo-600 dark:text-indigo-400" 
                              : "text-rose-700"
                        }`}>
                          {topic.level}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Core recommendation feed - No cards, inline list items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800/80 pb-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif">Adaptive Study Recommendations</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Targeted actions aligned with measured performance gaps</p>
              </div>
              <button 
                type="button"
                onClick={() => onNavigate("recommendations")}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Curriculum ({activeRecommendations.length})</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {activeRecommendations.length === 0 ? (
              <div className="py-6 text-stone-500 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>All adaptive lessons completed! Re-evaluate with an assessment to update recommendations.</span>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {activeRecommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          rec.priority === "High" ? "bg-rose-100 text-rose-800" : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                        }`}>
                          {rec.priority} Priority
                        </span>
                        <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">{rec.competencyName}</span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {rec.customTitle || "Remedial Concept Unit"}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
                        {rec.customDescription || "Complete this reading lesson to improve competency."}
                      </p>
                    </div>

                    <div className="flex items-center gap-3.5 shrink-0 self-start sm:self-auto">
                      {rec.customUrl && (
                        <a
                          href={rec.customUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-2xs"
                        >
                          <span>Review</span>
                          <ArrowUpRight size={13} />
                        </a>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => onCompleteRec(rec.id)}
                        className="text-xs font-bold text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 underline cursor-pointer"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Timeline feeds & Quick tool launches */}
        <div className="lg:col-span-4 space-y-10 border-l border-stone-200/60 dark:border-stone-800/80 pl-0 lg:pl-8">
          
          {/* Recent Evaluations Timeline */}
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif border-b border-stone-200 dark:border-stone-800 pb-3">
              Diagnostic Activity Feed
            </h3>

            {(!summary?.assessmentHistory || summary.assessmentHistory.length === 0) && (!summary?.quizHistory || summary.quizHistory.length === 0) ? (
              <p className="text-stone-400 text-xs py-2">No active timeline data tracked yet.</p>
            ) : (
              <div className="space-y-4">
                {(summary.assessmentHistory || []).slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="font-bold text-stone-900 dark:text-stone-100">{item.domainName}</div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-1.5 font-mono">
                        <Calendar size={11} />
                        <span>{item.date}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-stone-900 dark:text-stone-100 font-mono">{item.score}%</div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                        item.score >= 80 ? "text-emerald-600" : item.score >= 50 ? "text-indigo-600 dark:text-indigo-400" : "text-rose-600"
                      }`}>
                        {item.score >= 80 ? "Pass" : item.score >= 50 ? "Review" : "Focus"}
                      </span>
                    </div>
                  </div>
                ))}

                {(summary.quizHistory || []).slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 text-xs pt-3 border-t border-stone-100 dark:border-stone-800/50">
                    <div className="space-y-1">
                      <div className="font-bold text-stone-900 dark:text-stone-100 truncate max-w-[170px]">{item.quizTitle}</div>
                      <div className="text-[10px] text-violet-600 font-bold uppercase tracking-wider font-mono">Document Quiz · {item.date}</div>
                    </div>
                    <div className="text-right shrink-0 font-mono font-bold text-stone-900 dark:text-stone-100">
                      {item.score}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick study launchers without nested cards (Unboxed flat visual highlights) */}
          <div className="space-y-4 pt-4 border-t border-stone-200/60 dark:border-stone-800/80">
            <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">
              Workspace Launchers
            </h4>

            {/* Document Quiz Studio Launch button */}
            <div className="p-5 bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-200">Concept Sandbox</span>
                <Sparkles size={15} />
              </div>
              <div>
                <h5 className="font-bold text-sm">Document Quiz Studio</h5>
                <p className="text-[11px] text-violet-100 leading-relaxed mt-1">
                  Upload lecture drafts or codebase manuals to synthesize self-evaluation quizzes.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => onNavigate("quiz")}
                className="w-full py-2 bg-white text-indigo-950 hover:bg-violet-50 text-[11px] font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Launch Quiz Studio
              </button>
            </div>

            {/* Curated practice launchers */}
            <div className="p-5 bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-200">Interactive IDEs</span>
                <Globe size={15} />
              </div>
              <div>
                <h5 className="font-bold text-sm">Adaptive Practice Labs</h5>
                <p className="text-[11px] text-sky-100 leading-relaxed mt-1">
                  Connect to browser compilers, query consoles, and isolated technical sandboxes.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => onNavigate("practice-sources")}
                className="w-full py-2 bg-white text-blue-950 hover:bg-sky-50 text-[11px] font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Browse Playgrounds
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
