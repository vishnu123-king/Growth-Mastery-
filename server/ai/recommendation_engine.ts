import { AIProviderFactory } from "./factory";
import { db } from "../db";

export class RecommendationEngineService {
  static async generateRecommendations(params: {
    studentId: string;
    gaps: Array<{ competencyId: string; level: string; score: number }>;
    resources: Array<{ id: string; title: string; description: string; url: string; competencyId: string }>;
    learningPreferences?: string;
  }): Promise<any> {
    const provider = AIProviderFactory.create();

    // Map gaps to list
    const gapsStr = params.gaps
      .map(g => `- Competency ID: "${g.competencyId}" (Level: ${g.level}, Score: ${g.score}%)`)
      .join("\n");

    // Map resources to list
    const resourcesStr = params.resources
      .map(r => `- Resource ID: "${r.id}", Title: "${r.title}", URL: "${r.url}", CompetencyID: "${r.competencyId}"`)
      .join("\n");

    const prompt = `
You are an expert personalized tutor. Your task is to recommend study pathways from the available learning resources database below.

Student ID: "${params.studentId}"
Current Skill Gaps:
${gapsStr}

Available Real Resources in Database (DO NOT INVENT URLS! YOU MUST ONLY SELECT FROM THIS LIST):
${resourcesStr}

Student Preferences:
"${params.learningPreferences || "No specific style provided"}"

Select the most urgent resources matching the student's weakest competencies. 
For each selection, write a highly descriptive explanation ("reason") explaining why this resource matches their score and learning style, and assign a priority ("High" for Weak gaps, "Medium" for Moderate gaps, "Low" for Strong gaps).

You MUST return a JSON object with this exact structure:
{
  "recommendations": [
    {
      "competency_id": "The associated competency ID",
      "competencyName": "A readable title for the competency",
      "resourceId": "The exact selected Resource ID from the list",
      "customTitle": "A customized friendly title for the student",
      "customDescription": "A encouraging, helpful study description",
      "customUrl": "The EXACT matching resource URL from the selected item",
      "reason": "Clear explanation of why this specific guide is recommended",
      "priority": "High, Medium, or Low"
    }
  ]
}

Return ONLY raw JSON. Do not wrap it in markdown block quotes (e.g. \`\`\`json). Start directly with { and end with }.
`;

    const start = Date.now();
    try {
      const response = await provider.generate(prompt, {
        temperature: 0.2,
        responseSchema: {
          type: "OBJECT",
          properties: {
            recommendations: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  competency_id: { type: "STRING" },
                  competencyName: { type: "STRING" },
                  resourceId: { type: "STRING" },
                  customTitle: { type: "STRING" },
                  customDescription: { type: "STRING" },
                  customUrl: { type: "STRING" },
                  reason: { type: "STRING" },
                  priority: { type: "STRING" }
                },
                required: ["competency_id", "competencyName", "resourceId", "customTitle", "customDescription", "customUrl", "reason", "priority"]
              }
            }
          },
          required: ["recommendations"]
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
        operation: 'RECOMMENDATION_GENERATION',
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
          promptVersion: "RECOMMENDATION_ENGINE_V1"
        }
      };
    } catch (err: any) {
      const latency = Date.now() - start;
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Failed to generate recommendations through AI:", err);
      
      const provider = AIProviderFactory.create();
      db.addAIGenerationLog({
        studentId: params.studentId,
        operation: 'RECOMMENDATION_GENERATION',
        provider: provider.name,
        model: provider.model,
        status: 'failed',
        latencyMs: latency,
        errorType: errorMsg.substring(0, 100)
      });

      // Fallback: Deterministically select resources from DB that map to active gaps
      const fallbackRecs = [];
      const weakGaps = params.gaps.filter(g => g.level === "Weak" || g.level === "Moderate");
      
      for (const gap of weakGaps) {
        const matchingRes = params.resources.find(r => r.competencyId === gap.competencyId);
        if (matchingRes) {
          fallbackRecs.push({
            competency_id: gap.competencyId,
            competencyName: matchingRes.title,
            resourceId: matchingRes.id,
            customTitle: `Self-Study Guide: ${matchingRes.title}`,
            customDescription: `Study this conceptual guide to bolster your proficiency. Description: ${matchingRes.description}`,
            customUrl: matchingRes.url,
            reason: `Automatically recommended because your competency level is ${gap.level} (${gap.score}%).`,
            priority: gap.level === "Weak" ? "High" : "Medium"
          });
        }
      }

      return {
        data: { recommendations: fallbackRecs },
        metadata: {
          provider: "fallback",
          model: "deterministic-mapping",
          latencyMs: 0,
          timestamp: new Date().toISOString(),
          promptVersion: "RECOMMENDATION_ENGINE_V1"
        }
      };
    }
  }
}
