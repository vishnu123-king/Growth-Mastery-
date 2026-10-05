import { AIProviderFactory } from "./factory";
import { db } from "../db";

export class SkillGapAnalyzerService {
  static async analyzeSkillGaps(params: {
    studentId: string;
    domainId: string;
    assessmentScores: Array<{ competencyId: string; name: string; score: number }>;
    learningPreferences?: string;
  }): Promise<any> {
    const provider = AIProviderFactory.create();

    const scoresStr = params.assessmentScores
      .map(s => `- Competency ID "${s.competencyId}" ("${s.name}"): Score is ${s.score}%`)
      .join("\n");

    const prompt = `
You are an expert AI learning counselor and data scientist. Analyze the student's competency performance score patterns to construct an in-depth Skill Gap Analysis report.

Student ID: "${params.studentId}"
Domain: "${params.domainId}"
Current Assessment Evidence:
${scoresStr}

Student Learning Preferences:
"${params.learningPreferences || "No specific style provided"}"

Rules for level & priority classification:
- Score < 50%: Level must be "Weak". Priority must be "High".
- Score 50% - 79%: Level must be "Moderate". Priority must be "Medium".
- Score >= 80%: Level must be "Strong". Priority must be "Low".

For each competency, formulate a custom "reason" grounded in their score and preferences, explaining what specific concepts they need to focus on next. Recommend a concrete "recommended_action".

You MUST return a JSON object with this exact structure:
{
  "skill_gaps": [
    {
      "competency_id": "Exact competency ID from input list",
      "level": "Weak", "Moderate", or "Strong",
      "priority": "High", "Medium", or "Low",
      "reason": "Detailed qualitative insight explaining what specific concepts they failed or grasped and how it relates to their preferences.",
      "recommended_action": "A clear self-study guideline"
    }
  ]
}

Return ONLY raw JSON. Do not wrap it in markdown block quotes (e.g. \`\`\`json). Start directly with { and end with }.
`;

    const start = Date.now();
    try {
      const response = await provider.generate(prompt, {
        temperature: 0.15,
        responseSchema: {
          type: "OBJECT",
          properties: {
            skill_gaps: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  competency_id: { type: "STRING" },
                  level: { type: "STRING" },
                  priority: { type: "STRING" },
                  reason: { type: "STRING" },
                  recommended_action: { type: "STRING" }
                },
                required: ["competency_id", "level", "priority", "reason", "recommended_action"]
              }
            }
          },
          required: ["skill_gaps"]
        }
      });

      let cleanText = response.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```json/i, "").replace(/```$/, "").trim();
      }

      const parsed = JSON.parse(cleanText);
      const latency = Date.now() - start;

      db.addAIGenerationLog({
        studentId: params.studentId,
        operation: 'SKILL_GAP_ANALYSIS',
        provider: provider.name,
        model: provider.model,
        status: 'success',
        latencyMs: latency
      });

      return {
        data: parsed,
        metadata: {
          provider: provider.name,
          model: provider.model,
          latencyMs: latency,
          timestamp: new Date().toISOString(),
          promptVersion: "SKILL_GAP_ANALYZER_V1"
        }
      };
    } catch (err: any) {
      const latency = Date.now() - start;
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Failed to run skill gap analyzer through AI:", err);
      
      const provider = AIProviderFactory.create();
      db.addAIGenerationLog({
        studentId: params.studentId,
        operation: 'SKILL_GAP_ANALYSIS',
        provider: provider.name,
        model: provider.model,
        status: 'failed',
        latencyMs: latency,
        errorType: errorMsg.substring(0, 100)
      });

      // Fallback in case of model error to guarantee operational continuity
      const fallbackGaps = params.assessmentScores.map(score => {
        const isWeak = score.score < 50;
        const isMod = score.score >= 50 && score.score < 80;
        return {
          competency_id: score.competencyId,
          level: isWeak ? "Weak" : (isMod ? "Moderate" : "Strong"),
          priority: isWeak ? "High" : (isMod ? "Medium" : "Low"),
          reason: `Auto-evaluated score of ${score.score}% in ${score.name}. Further self-study is advised to address concept proficiency.`,
          recommended_action: `Review core guidelines for ${score.name} and try solving hands-on challenges.`
        };
      });

      return {
        data: { skill_gaps: fallbackGaps },
        metadata: {
          provider: "fallback",
          model: "static-thresholds",
          latencyMs: 0,
          timestamp: new Date().toISOString(),
          promptVersion: "SKILL_GAP_ANALYZER_V1"
        }
      };
    }
  }
}
