import { AIProviderFactory } from "./factory";

export class AITutorService {
  static async getChatResponse(params: {
    history: Array<{ role: 'user' | 'model'; content: string }>;
    message: string;
    learningPreferences?: string;
    domainName?: string;
    weakCompetencies?: string[];
  }): Promise<string> {
    const provider = AIProviderFactory.create();

    const historyStr = params.history
      .slice(-6) // Keep last 6 messages for focused context
      .map(m => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
      .join("\n");

    const prompt = `
You are an expert AI Computer Science Tutor.

CRITICAL DIRECTIVE:
Directly, accurately, and concisely answer the student's specific question.
Do NOT output generic unsolicited lectures, unrelated monologues, or pre-scripted textbook intros.
Focus directly on the student's latest question or message.

Student's Latest Message:
"${params.message}"

Context (use only if directly relevant to their question):
- Subject Track: ${params.domainName || "Computer Science"}
- Student's Weak Areas: ${params.weakCompetencies?.length ? params.weakCompetencies.join(", ") : "None specified"}
- Learning Preference: ${params.learningPreferences || "Direct, clear, practical"}

Guidelines:
1. Direct Answer First: Answer their exact question in the opening sentence.
2. Concrete Examples: If they ask for code or syntax, provide a clean, minimal code snippet demonstrating the solution.
3. Greetings: If they just say "hi", "hello", or introduce themselves, greet them warmly and ask what specific programming concept, challenge, or homework problem they want to work on.
4. Explanations: Explain the "why" and "how" concisely without overwhelming with unnecessary theory.
5. Engagement: End with one relevant follow-up question or offer to test their understanding.

Recent Conversation:
${historyStr}

Student: ${params.message}
Tutor:`;

    try {
      const response = await provider.generate(prompt, { temperature: 0.3 });
      return response;
    } catch (err) {
      console.error("AI Tutor Chat Error:", err);
      return "I'm currently having a brief connectivity hiccup with the AI model. Please try asking your question again in a moment, or practice with our Free Practice Sources while I reconnect!";
    }
  }
}
