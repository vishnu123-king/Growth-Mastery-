import React from "react";
import { ProgressSummary, Recommendation } from "../types";
import { 
  ArrowRight, CheckCircle2, Calendar, ArrowUpRight, 
  Sparkles, Globe, Target
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

  return (
    <div className="space-y-8" id="student-dashboard">
      
      {/* 1. HERO / PRIMARY SECTION - Charcoal & Copper */}
      <div className="bg-[#1B1B1B] border border-[#2C2C2C] text-[#F3EEE6] rounded-2xl p-6 sm:p-8 lg:p-9 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#D7B87B]">
              <Sparkles size={14} className="text-[#D7B87B]" />
              <span>Diagnostic Learning Engine</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-semibold tracking-tight text-[#F3EEE6] leading-tight">
              Welcome back, {userName || "Scholar"}
            </h1>
            
            <p className="text-sm text-[#D6D0C7] leading-relaxed">
              Overall evaluated mastery level is at <strong className="text-[#F3EEE6] font-semibold">{summary?.overallCompetency || 0}%</strong>. Currently tracking <span className="text-[#D7B87B] font-semibold">{activeWeakGaps.length} target areas</span> requiring focused review.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onNavigate("assessment")}
              className="btn-copper-primary text-xs"
            >
              <Target size={15} />
              <span>Start Assessment</span>
            </button>
            
            <button
              type="button"
              onClick={() => onNavigate("skill-gaps")}
              className="btn-charcoal-secondary text-xs"
            >
              <span>Verify Skill Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DASHBOARD INFORMATION HIERARCHY (4 Inline Metric Pillars) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2 border-t border-[#2C2C2C]">
        <div className="space-y-1.5 p-2">
          <span className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider block font-mono">Overall Progress</span>
          <div className="text-2xl sm:text-3xl font-bold text-[#F3EEE6] font-mono tracking-tight tabular-nums">
            {summary?.overallCompetency || 0}%
          </div>
          <div className="w-full bg-[#262626] h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-[#C47C4A] h-full rounded-full transition-all" 
              style={{ width: `${Math.min(summary?.overallCompetency || 0, 100)}%` }} 
            />
          </div>
        </div>

        <div className="space-y-1.5 border-l border-[#2C2C2C] pl-4 sm:pl-6 p-2">
          <span className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider block font-mono">Study Streak</span>
          <div className="text-2xl sm:text-3xl font-bold text-[#F3EEE6] font-mono tracking-tight tabular-nums flex items-baseline gap-1.5">
            <span>{summary?.streakDays || 0}</span>
            <span className="text-xs font-medium text-[#A8A29E] uppercase tracking-wider font-sans">Days active</span>
          </div>
          <p className="text-xs text-[#78716C] mt-1 font-mono truncate">Continuous evaluation</p>
        </div>

        <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-[#2C2C2C] pt-3 sm:pt-0 sm:pl-6 p-2">
          <span className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider block font-mono">Unresolved Gaps</span>
          <div className="text-2xl sm:text-3xl font-bold text-[#D7B87B] font-mono tracking-tight tabular-nums">
            {activeWeakGaps.length}
          </div>
          <button 
            type="button" 
            onClick={() => onNavigate("skill-gaps")}
            className="text-xs font-medium text-[#C47C4A] hover:text-[#D18958] mt-1 block cursor-pointer"
          >
            Track focus areas →
          </button>
        </div>

        <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-[#2C2C2C] pt-3 sm:pt-0 pl-4 sm:pl-6 p-2">
          <span className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider block font-mono">Completed Units</span>
          <div className="text-2xl sm:text-3xl font-bold text-[#6D927A] font-mono tracking-tight tabular-nums">
            {summary?.completedResourcesCount || 0}
          </div>
          <button 
            type="button" 
            onClick={() => onNavigate("recommendations")}
            className="text-xs font-medium text-[#C47C4A] hover:text-[#D18958] mt-1 block cursor-pointer"
          >
            Review remediation →
          </button>
        </div>
      </div>

      {/* 3. ASYMMETRICAL 2-COLUMN SECTION (65% / 35% composition) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
        
        {/* Left Column - Diagnostic Matrix & Recommendations Stream */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Competency Matrix */}
          <div className="p-6 bg-[#1B1B1B] border border-[#2C2C2C] rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
              <div>
                <h3 className="text-lg font-semibold text-[#F3EEE6] font-serif">Competency Dashboard Matrix</h3>
                <p className="text-xs text-[#A8A29E]">Tested topic rubrics with real-time performance weights</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("skill-gaps")}
                className="text-xs text-[#C47C4A] hover:text-[#D18958] font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Full Skill Index</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="divide-y divide-[#262626]">
              {(!summary?.topicScores || summary.topicScores.length === 0) ? (
                <div className="py-6 text-[#A8A29E] text-xs">
                  No diagnostics parsed yet. Complete your first course assessment to initialize metrics.
                </div>
              ) : (
                summary.topicScores.slice(0, 5).map((topic) => {
                  const isStrong = topic.score >= 80;
                  const isModerate = topic.score >= 50 && topic.score < 80;
                  return (
                    <div key={topic.competencyId} className="py-3.5 flex items-center justify-between gap-6 transition-all px-2 rounded-lg hover:bg-[#202020]">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm text-[#F3EEE6] truncate block">
                          {topic.competencyName}
                        </span>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="w-32 bg-[#282828] rounded-full h-1.5 overflow-hidden shrink-0">
                            <div 
                              className={`h-full rounded-full ${
                                isStrong ? "bg-[#6D927A]" : isModerate ? "bg-[#D7B87B]" : "bg-[#D96B6B]"
                              }`} 
                              style={{ width: `${Math.min(topic.score, 100)}%` }} 
                            />
                          </div>
                          <span className="text-xs font-mono font-medium text-[#A8A29E] tabular-nums">{topic.score}%</span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className={`text-xs font-mono font-medium ${
                          isStrong 
                            ? "text-[#6D927A]" 
                            : isModerate 
                              ? "text-[#D7B87B]" 
                              : "text-[#D96B6B]"
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

          {/* Adaptive recommendation feed */}
          <div className="p-6 bg-[#1B1B1B] border border-[#2C2C2C] rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
              <div>
                <h3 className="text-lg font-semibold text-[#F3EEE6] font-serif">Adaptive Study Recommendations</h3>
                <p className="text-xs text-[#A8A29E]">Targeted actions aligned with measured performance gaps</p>
              </div>
              <button 
                type="button"
                onClick={() => onNavigate("recommendations")}
                className="text-xs text-[#C47C4A] hover:text-[#D18958] font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({activeRecommendations.length})</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {activeRecommendations.length === 0 ? (
              <div className="py-6 text-[#A8A29E] text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#6D927A]" />
                <span>All adaptive lessons completed. Re-evaluate with an assessment to update recommendations.</span>
              </div>
            ) : (
              <div className="divide-y divide-[#262626]">
                {activeRecommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className={rec.priority === "High" ? "text-[#D96B6B]" : "text-[#D7B87B]"}>
                          {rec.priority} Priority
                        </span>
                        <span className="text-[#444444]" aria-hidden="true">·</span>
                        <span className="text-[#A8A29E]">{rec.competencyName}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#F3EEE6]">
                        {rec.customTitle || "Remedial Concept Unit"}
                      </h4>
                      <p className="text-xs text-[#A8A29E] leading-relaxed">
                        {rec.customDescription || "Complete this reading lesson to improve competency."}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                      {rec.customUrl && (
                        <a
                          href={rec.customUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-charcoal-secondary text-xs"
                        >
                          <span>Review</span>
                          <ArrowUpRight size={13} />
                        </a>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => onCompleteRec(rec.id)}
                        className="text-xs font-medium text-[#A8A29E] hover:text-[#F3EEE6] cursor-pointer"
                      >
                        Mark Done
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Timeline feeds & Quick tool launches */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Recent Evaluations Timeline */}
          <div className="p-6 bg-[#1B1B1B] border border-[#2C2C2C] rounded-2xl space-y-4">
            <h3 className="text-base font-semibold text-[#F3EEE6] font-serif border-b border-[#2C2C2C] pb-3">
              Diagnostic Activity Feed
            </h3>

            {(!summary?.assessmentHistory || summary.assessmentHistory.length === 0) && (!summary?.quizHistory || summary.quizHistory.length === 0) ? (
              <p className="text-[#A8A29E] text-xs py-2">No active timeline data tracked yet.</p>
            ) : (
              <div className="space-y-3.5">
                {(summary.assessmentHistory || []).slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="font-medium text-[#F3EEE6]">{item.domainName}</div>
                      <div className="text-xs text-[#78716C] flex items-center gap-1.5 font-mono">
                        <Calendar size={11} />
                        <span>{item.date}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-[#F3EEE6] font-mono tabular-nums">{item.score}%</div>
                      <span className={`text-[11px] font-mono block ${
                        item.score >= 80 ? "text-[#6D927A]" : item.score >= 50 ? "text-[#D7B87B]" : "text-[#D96B6B]"
                      }`}>
                        {item.score >= 80 ? "Pass" : item.score >= 50 ? "Review" : "Focus"}
                      </span>
                    </div>
                  </div>
                ))}

                {(summary.quizHistory || []).slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 text-xs pt-3 border-t border-[#262626]">
                    <div className="space-y-1">
                      <div className="font-medium text-[#F3EEE6] truncate max-w-[170px]">{item.quizTitle}</div>
                      <div className="text-[11px] text-[#A8A29E] font-mono">Quiz · {item.date}</div>
                    </div>
                    <div className="text-right shrink-0 font-mono font-medium text-[#F3EEE6] tabular-nums">
                      {item.score}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick study launchers in refined charcoal */}
          <div className="p-6 bg-[#1B1B1B] border border-[#2C2C2C] rounded-2xl space-y-4">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A8A29E]">
              Workspace Launchers
            </h4>

            {/* Document Quiz Studio Launch button */}
            <div className="p-4 bg-[#222222] border border-[#2C2C2C] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#D7B87B]">Concept Studio</span>
                <Sparkles size={14} className="text-[#D7B87B]" />
              </div>
              <div>
                <h5 className="font-semibold text-sm text-[#F3EEE6]">Document Quiz Studio</h5>
                <p className="text-xs text-[#A8A29E] leading-relaxed mt-1">
                  Upload notes or reference documents to synthesize diagnostic test questions.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => onNavigate("quiz")}
                className="btn-charcoal-secondary w-full text-xs"
              >
                Launch Studio
              </button>
            </div>

            {/* Curated practice launchers */}
            <div className="p-4 bg-[#222222] border border-[#2C2C2C] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#C47C4A]">Technical Labs</span>
                <Globe size={14} className="text-[#C47C4A]" />
              </div>
              <div>
                <h5 className="font-semibold text-sm text-[#F3EEE6]">Adaptive Practice Resources</h5>
                <p className="text-xs text-[#A8A29E] leading-relaxed mt-1">
                  Access free interactive playgrounds, IDE sandboxes, and documentation.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => onNavigate("practice-sources")}
                className="btn-charcoal-secondary w-full text-xs"
              >
                Browse Resources
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
