import { AIProviderFactory } from "./factory";
import { db } from "../db";

export class QuizGeneratorService {
  static async generateQuizFromMaterial(params: {
    materialTitle: string;
    materialContent: string;
    count?: number;
    studentId?: string;
  }): Promise<any> {
    const provider = AIProviderFactory.create();
    const count = params.count || 5;

    const prompt = `
You are an expert curriculum developer. Generate an interactive 5-question multiple choice quiz directly based on the study content below.

Material Title: "${params.materialTitle}"
Study Text:
"""
${params.materialContent}
"""

Requirements:
- Create exactly ${count} multiple choice questions.
- Every question must be fully answered by, or highly relevant to, the study text.
- Provide exactly 4 options.
- The "correctAnswer" must match exactly one of the values in "options".
- Provide an "explanation" clarifying why the answer is correct and providing context from the material.

You MUST return a JSON object with this exact structure:
{
  "title": "A short descriptive quiz title",
  "questions": [
    {
      "questionText": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The exact correct option string",
      "explanation": "Detailed explanation grounded in the text"
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
            title: { type: "STRING" },
            questions: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  questionText: { type: "STRING" },
                  options: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                  },
                  correctAnswer: { type: "STRING" },
                  explanation: { type: "STRING" }
                },
                required: ["questionText", "options", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["title", "questions"]
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
        operation: 'QUIZ_GENERATION',
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
          promptVersion: "QUIZ_GENERATOR_V1"
        }
      };
    } catch (err: any) {
      const latency = Date.now() - start;
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Failed to generate quiz from material through AI:", err);
      
      db.addAIGenerationLog({
        studentId: params.studentId,
        operation: 'QUIZ_GENERATION',
        provider: provider.name,
        model: provider.model,
        status: 'failed',
        latencyMs: latency,
        errorType: errorMsg.substring(0, 100)
      });
      
      throw err;
    }
  }
}
