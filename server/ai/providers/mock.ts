import { LLMProvider, GenerateOptions } from "../base";
import { generateDirectTutorAnswer } from "../tutor_answer_engine";

export class MockProvider implements LLMProvider {
  name = "mock";
  model: string;

  constructor(modelName: string) {
    this.model = modelName || "offline-intelligent-engine";
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    const lower = prompt.toLowerCase();

    // 1. Direct AI Tutor Chat Question Answering
    if (
      prompt.includes("Computer Science Tutor") || 
      prompt.includes("Recent Conversation:") ||
      prompt.includes("Chat History:") || 
      prompt.includes("Student:") || 
      prompt.includes("Tutor:")
    ) {
      let studentMessage = "";
      const studentIndex = prompt.lastIndexOf("Student:");
      if (studentIndex !== -1) {
        const tutorIndex = prompt.indexOf("Tutor:", studentIndex);
        if (tutorIndex !== -1) {
          studentMessage = prompt.substring(studentIndex + 8, tutorIndex).trim();
        } else {
          studentMessage = prompt.substring(studentIndex + 8).trim();
        }
      } else {
        studentMessage = prompt;
      }

      let domainName = "Computer Science";
      let weakCompetencies: string[] = [];
      const trackMatch = prompt.match(/Subject Track:\s*([^\n]+)/);
      if (trackMatch) domainName = trackMatch[1].trim();
      const weakMatch = prompt.match(/Weak Areas:\s*([^\n]+)/);
      if (weakMatch && !weakMatch[1].includes("None")) {
        weakCompetencies = weakMatch[1].split(",").map(s => s.trim());
      }

      return generateDirectTutorAnswer(studentMessage, { domainName, weakCompetencies });
    }

    // 2. Diagnostic Assessment / Question Generation
    if (lower.includes("assessment") || lower.includes("diagnostic") || lower.includes("question_text")) {
      let domain = "Python Core";
      if (lower.includes("web") || lower.includes("html") || lower.includes("css")) {
        domain = "Web Development";
      }

      const countMatch = prompt.match(/(\d+)\s+questions/);
      const count = countMatch ? parseInt(countMatch[1]) : 5;

      const questions = [];
      const names = lower.includes("web")
        ? [
            { q: "Which HTML5 tag is used to specify a footer for a document or section?", o: ["<bottom>", "<footer>", "<section>", "<aside>"], c: "<footer>", comp: "html-basics" },
            { q: "What does CSS stand for?", o: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], c: "Cascading Style Sheets", comp: "css-styling" },
            { q: "Which method is used in JS to select an element by its ID?", o: ["document.getElementById()", "document.selectId()", "document.queryId()", "window.getId()"], c: "document.getElementById()", comp: "dom-api" },
            { q: "Which Express method handles HTTP GET requests?", o: ["app.post()", "app.get()", "app.route()", "app.fetch()"], c: "app.get()", comp: "express-routing" }
          ]
        : [
            { q: "Which keyword is used to define a function in Python?", o: ["func", "define", "def", "function"], c: "def", comp: "funcs" },
            { q: "What is the correct syntax to output 'Hello World' in Python?", o: ["print('Hello World')", "echo 'Hello World'", "p('Hello World')", "console.log('Hello World')"], c: "print('Hello World')", comp: "vars" },
            { q: "Which of the following is used to inherit a class in Python?", o: ["class Child(Parent):", "class Child extends Parent:", "class Child implements Parent:", "class Child -> Parent:"], c: "class Child(Parent):", comp: "oop-inheritance" },
            { q: "How do you start a 'for' loop in Python?", o: ["for x in y:", "for (x=0; x<y; x++)", "foreach x in y", "loop x through y"], c: "for x in y:", comp: "loops" }
          ];

      for (let i = 0; i < count; i++) {
        const template = names[i % names.length];
        questions.push({
          question_text: `${template.q}`,
          question_type: "mcq",
          options: template.o,
          correct_option: template.c,
          explanation: `This explains ${template.q}. It covers the core concept of ${template.comp}.`,
          competency_id: template.comp,
          difficulty: i % 2 === 0 ? "intermediate" : "beginner"
        });
      }

      return JSON.stringify({
        domain: domain,
        assessment_type: "diagnostic",
        questions: questions,
        generation_metadata: {
          provider: "mock",
          model: this.model,
          timestamp: new Date().toISOString()
        }
      });
    }

    // 3. Quiz Generation from material content
    if (lower.includes("quiz_generation") || lower.includes("quiz") || lower.includes("material")) {
      const questions = [
        {
          questionText: "Based on the provided material, what is the primary architectural goal of model-independent AI?",
          options: [
            "To allow easy model and provider switching without altering frontend components",
            "To lock the application to a single vendor exclusively",
            "To require hardcoded questions in the client bundle",
            "To prevent the server from running in production modes"
          ],
          correctAnswer: "To allow easy model and provider switching without altering frontend components",
          explanation: "Model-independent architecture abstracts vendor APIs into a standard interface so configuration controls which provider handles prompts."
        },
        {
          questionText: "Which component represents the entry point for evaluating competencies and identifying skill gaps?",
          options: [
            "Dashboard and Progress Tracker",
            "Competency Gap Analyzer",
            "Diagnostic Question Generator Service",
            "Mock Provider Router"
          ],
          correctAnswer: "Competency Gap Analyzer",
          explanation: "The Gap Analyzer inspects assessment performance history to segment competencies into Weak, Moderate, or Strong."
        }
      ];

      return JSON.stringify({
        title: "AI-Generated Concept Quiz",
        questions: questions
      });
    }

    // 4. Skill Gap Analysis
    if (lower.includes("skill_gaps") || lower.includes("gap") || lower.includes("weakest")) {
      return JSON.stringify({
        skill_gaps: [
          {
            competency_id: "funcs",
            level: "Weak",
            priority: "High",
            reason: "The student struggled with defining modular block structures and parameter defaults on diagnostic evaluations.",
            recommended_action: "Complete the Functions & Modules interactive lesson and try a targeted practice quiz."
          },
          {
            competency_id: "oop-inheritance",
            level: "Moderate",
            priority: "Medium",
            reason: "The student correctly instantiated parent frames but failed to configure superclass method overriding in nested declarations.",
            recommended_action: "Review method override guidelines and construct parent-child class structures in the playground."
          }
        ]
      });
    }

    // 5. Recommendation Engine
    if (lower.includes("recommendation") || lower.includes("resources")) {
      return JSON.stringify({
        recommendations: [
          {
            competency_id: "funcs",
            competencyName: "Functions & Scope",
            customTitle: "Deep Dive into Modular Functions",
            customDescription: "A comprehensive guide on Python function declarations, scope containment, keyword arguments, and lambda syntax.",
            customUrl: "https://docs.python.org/3/tutorial/controlflow.html#defining-functions",
            reason: "Recommended based on weak score (< 50%) in modular structures.",
            priority: "High"
          }
        ]
      });
    }

    // 6. Generic Fallback: Extract message and answer directly
    let fallbackMsg = "";
    const studentIdx = prompt.lastIndexOf("Student:");
    if (studentIdx !== -1) {
      fallbackMsg = prompt.substring(studentIdx + 8).trim();
    } else {
      fallbackMsg = prompt;
    }
    return generateDirectTutorAnswer(fallbackMsg);
  }
}
