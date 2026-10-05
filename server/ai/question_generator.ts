import { AIProviderFactory } from "./factory";
import { db } from "../db";

export class QuestionGeneratorService {
  static async generateQuestions(params: {
    domainId: string;
    domainName: string;
    competencies: Array<{ id: string; name: string }>;
    count: number;
    difficulty: string;
    studentId?: string;
  }): Promise<any> {
    const provider = AIProviderFactory.create();
    
    const compsStr = params.competencies.map(c => `ID: "${c.id}" for competency "${c.name}"`).join("\n");
    
    const prompt = `
Generate a structured diagnostic multiple choice question set specifically about the exact technical concepts, syntax, rules, and programming mechanics of the course "${params.domainName}".
Generate exactly ${params.count} questions.
Target difficulty level: ${params.difficulty}.

The competencies being assessed are:
${compsStr}

CRITICAL: Every single question must be strictly and specifically about "${params.domainName}" (e.g., if the course is Python Variables, test variable assignment, naming rules, data types, mutability, scope, or references in Python. Do not generate generic questions).

Ensure each question matches exactly one of the competency IDs listed above.
Provide exactly 4 distinct, clear options per question.
Ensure the "correct_option" exactly matches one of the values in the "options" array.
Provide a clear "explanation" explaining why the answer is correct and analyzing potential misconceptions.

You MUST return a JSON object with this exact schema:
{
  "domain": "${params.domainId}",
  "assessment_type": "diagnostic",
  "questions": [
    {
      "question_text": "A clear, realistic technical question text",
      "question_type": "mcq",
      "options": ["Option A string", "Option B string", "Option C string", "Option D string"],
      "correct_option": "The exact string corresponding to the correct answer",
      "explanation": "In-depth explanation of the solution and concept",
      "competency_id": "The exact competency ID that this question assesses",
      "difficulty": "beginner, intermediate, or advanced"
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
            domain: { type: "STRING" },
            assessment_type: { type: "STRING" },
            questions: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  question_text: { type: "STRING" },
                  question_type: { type: "STRING" },
                  options: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                  },
                  correct_option: { type: "STRING" },
                  explanation: { type: "STRING" },
                  competency_id: { type: "STRING" },
                  difficulty: { type: "STRING" }
                },
                required: ["question_text", "question_type", "options", "correct_option", "explanation", "competency_id", "difficulty"]
              }
            }
          },
          required: ["domain", "assessment_type", "questions"]
        }
      });

      // Simple cleaning in case model ignores responseSchema/mimeType block overrides
      let cleanText = response.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```json/i, "").replace(/```$/, "").trim();
      }

      const parsed = JSON.parse(cleanText);
      const latency = Date.now() - start;

      // Log to Telemetry Monitor Database
      db.addAIGenerationLog({
        studentId: params.studentId,
        operation: 'QUESTION_GENERATION',
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
          promptVersion: "QUESTION_GENERATOR_V1"
        }
      };
    } catch (err: any) {
      const latency = Date.now() - start;
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Failed to generate questions through AI:", err);
      
      db.addAIGenerationLog({
        studentId: params.studentId,
        operation: 'QUESTION_GENERATION',
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
