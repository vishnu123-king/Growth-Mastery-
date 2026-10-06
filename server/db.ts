import fs from "fs";
import path from "path";
import crypto from "crypto";
import { 
  User, 
  UserRole,
  LearningDomain, 
  Competency, 
  Question, 
  Assessment, 
  AssessmentResult, 
  AssessmentTemplate,
  SkillGap, 
  LearningResource, 
  Recommendation, 
  Material, 
  Quiz, 
  QuizAttempt,
  ProgressSummary,
  QuizQuestion,
  AIGenerationLog,
  AITutorConversation,
  FeatureFlags,
  StudentAssessmentReport
} from "../src/types";

const DB_PATH = path.join(process.cwd(), "db.json");

export interface DatabaseSchema {
  users: User[];
  domains: LearningDomain[];
  competencies: Competency[];
  questions: Question[];
  assessmentTemplates: AssessmentTemplate[];
  assessments: Assessment[];
  assessmentResults: AssessmentResult[];
  skillGaps: SkillGap[];
  learningResources: LearningResource[];
  recommendations: Recommendation[];
  materials: Material[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  aiGenerationLogs: AIGenerationLog[];
  aiTutorConversations: AITutorConversation[];
  featureFlags: FeatureFlags;
}

const hashPassword = (pwd: string) => crypto.createHash("sha256").update(pwd).digest("hex");

const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableAIAssessments: true,
  enableAITutor: true,
  enableAIQuizStudio: true,
  enableStrictProctoring: true,
  enableFreePracticeSources: true,
  enableStudentRegistration: true,
  enablePeerDiscussions: true
};

const DEFAULT_USERS: User[] = [
  {
    id: "admin-root",
    email: "admin@skillgap.ai",
    name: "System Administrator",
    role: "admin",
    passwordHash: hashPassword("admin123"),
    createdAt: new Date().toISOString(),
    learningPreferences: "Full admin privileged access to curriculum, exams, and settings."
  },
  {
    id: "teacher-1",
    email: "teacher@skillgap.ai",
    name: "Prof. Sarah Jenkins",
    role: "teacher",
    passwordHash: hashPassword("teacher123"),
    createdAt: new Date().toISOString(),
    learningPreferences: "Senior Curriculum Director & Assessment Specialist"
  },
  {
    id: "student-demo",
    email: "dhivyabharathikarthi07@gmail.com",
    name: "Demo Student",
    role: "student",
    passwordHash: hashPassword("student123"),
    createdAt: new Date().toISOString(),
    learningPreferences: "I prefer step-by-step documentation, interactive quizzes, and short video tutorials."
  },
  {
    id: "student-darika",
    email: "darika@gmail.com",
    name: "Darika",
    role: "student",
    passwordHash: hashPassword("student123"),
    createdAt: new Date().toISOString(),
    learningPreferences: "I prefer interactive assessments and coding sandbox projects."
  }
];

const DEFAULT_DOMAINS: LearningDomain[] = [
  {
    id: "domain-python",
    name: "Python Programming",
    description: "Master Python fundamentals, control flow, functions, object-oriented design, and robust exception handling.",
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    instructor: "Prof. Sarah Jenkins",
    status: "active",
    enrolledStudentsCount: 28
  },
  {
    id: "domain-webdev",
    name: "Full-Stack Web Development",
    description: "Learn HTML/CSS layouts, modern JavaScript, frontend React application development, backend Express APIs, and databases.",
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    instructor: "Alex Rivera",
    status: "active",
    enrolledStudentsCount: 34
  },
  {
    id: "domain-dsa",
    name: "Data Structures & Algorithms",
    description: "Asymptotic notation, arrays, linked lists, binary search trees, sorting, recursion, dynamic programming, and graphs.",
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    instructor: "Dr. Marcus Vance",
    status: "active",
    enrolledStudentsCount: 19
  }
];

const DEFAULT_COMPETENCIES: Competency[] = [
  // Python Competencies
  { id: "comp-py-fund", domainId: "domain-python", name: "Python Basics & Variables", description: "Variables, primitive data types (integers, strings, booleans, floats), and core mathematical operators." },
  { id: "comp-py-flow", domainId: "domain-python", name: "Control Flow & Loops", description: "Conditional statements (if-elif-else) and loop structures (for, while) with break/continue." },
  { id: "comp-py-func", domainId: "domain-python", name: "Functions & Scope", description: "Defining functions, arguments (*args, **kwargs), return values, scope rules (LEGB), and lambda expressions." },
  { id: "comp-py-oop", domainId: "domain-python", name: "Object-Oriented Programming (OOP)", description: "Classes, object instantiation, constructors, inheritance, polymorphism, and encapsulation." },
  { id: "comp-py-exceptions", domainId: "domain-python", name: "Exception & File Handling", description: "Robust exception handling (try-except-finally) and reading/writing text/JSON files securely." },

  // WebDev Competencies
  { id: "comp-web-htmlcss", domainId: "domain-webdev", name: "HTML & CSS Layouts", description: "Semantic tags, box model, layouts using Flexbox/CSS Grid, and mobile-first responsive design." },
  { id: "comp-web-js", domainId: "domain-webdev", name: "JavaScript Basics (ES6+)", description: "Variables (let/const), arrow functions, array methods (map/filter/reduce), promises, async/await, and DOM manipulation." },
  { id: "comp-web-react", domainId: "domain-webdev", name: "React Components & Hooks", description: "Functional components, props, state management (useState), lifecycle handling (useEffect), and custom hooks." },
  { id: "comp-web-backend", domainId: "domain-webdev", name: "Backend APIs & Express", description: "Creating web servers with Express, RESTful endpoints, routing, parsing request bodies, and CORS." },
  { id: "comp-web-db", domainId: "domain-webdev", name: "Database & SQL Foundations", description: "Relational database design, table schemas, primary/foreign keys, and basic SQL commands (SELECT, INSERT, JOIN)." },

  // DSA Competencies
  { id: "comp-dsa-complexity", domainId: "domain-dsa", name: "Time & Space Complexity", description: "Big-O notation, asymptotic analysis, worst-case, best-case, and amortized runtime." },
  { id: "comp-dsa-arrays", domainId: "domain-dsa", name: "Arrays & Strings", description: "Sliding window, two-pointer techniques, prefix sums, and string matching algorithms." },
  { id: "comp-dsa-trees", domainId: "domain-dsa", name: "Trees & Binary Search", description: "Binary tree traversals (inorder, preorder, postorder), binary search trees, and heap properties." }
];

const DEFAULT_RESOURCES: LearningResource[] = [
  // Python Resources
  {
    id: "res-py-fund-1",
    title: "Official Python Tutorial: Introduction",
    description: "Read the official Python introduction covering numbers, strings, and lists.",
    resourceType: "documentation",
    source: "python.org",
    url: "https://docs.python.org/3/tutorial/introduction.html",
    domainId: "domain-python",
    competencyId: "comp-py-fund",
    createdAt: new Date().toISOString()
  },
  {
    id: "res-py-flow-1",
    title: "Python Control Flow Guide",
    description: "Detailed walk-through of Python conditional statements and loop statements.",
    resourceType: "tutorial",
    source: "Real Python",
    url: "https://realpython.com/python-conditional-statements/",
    domainId: "domain-python",
    competencyId: "comp-py-flow",
    createdAt: new Date().toISOString()
  },
  {
    id: "res-py-func-1",
    title: "Defining Functions in Python",
    description: "Learn how to write clean, reusable modular functions, arguments, and return types.",
    resourceType: "article",
    source: "W3Schools",
    url: "https://www.w3schools.com/python/python_functions.asp",
    domainId: "domain-python",
    competencyId: "comp-py-func",
    createdAt: new Date().toISOString()
  },
  {
    id: "res-py-oop-1",
    title: "Introduction to OOP in Python",
    description: "Master OOP principles: classes, objects, inheritance, and encapsulation with coding exercises.",
    resourceType: "tutorial",
    source: "Real Python",
    url: "https://realpython.com/python3-object-oriented-programming/",
    domainId: "domain-python",
    competencyId: "comp-py-oop",
    createdAt: new Date().toISOString()
  },
  {
    id: "res-py-except-1",
    title: "Errors and Exceptions Handling in Python",
    description: "Master debugging and exceptions with Python's standard try-except blocks.",
    resourceType: "documentation",
    source: "python.org",
    url: "https://docs.python.org/3/tutorial/errors.html",
    domainId: "domain-python",
    competencyId: "comp-py-exceptions",
    createdAt: new Date().toISOString()
  },

  // WebDev Resources
  {
    id: "res-web-htmlcss-1",
    title: "A Complete Guide to Flexbox",
    description: "Deep dive into CSS Flexbox properties with comprehensive visual guides.",
    resourceType: "article",
    source: "CSS-Tricks",
    url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
    domainId: "domain-webdev",
    competencyId: "comp-web-htmlcss",
    createdAt: new Date().toISOString()
  },
  {
    id: "res-web-js-1",
    title: "MDN: JavaScript Async/Await",
    description: "A comprehensive guide to asynchronous programming using modern JavaScript Promises.",
    resourceType: "documentation",
    source: "MDN Web Docs",
    url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises",
    domainId: "domain-webdev",
    competencyId: "comp-web-js",
    createdAt: new Date().toISOString()
  },
  {
    id: "res-web-react-1",
    title: "React Official Docs: Managing State",
    description: "Learn how to think in React and manage complex states using standard built-in hooks.",
    resourceType: "documentation",
    source: "React Dev",
    url: "https://react.dev/learn/managing-state",
    domainId: "domain-webdev",
    competencyId: "comp-web-react",
    createdAt: new Date().toISOString()
  },
  {
    id: "res-web-express-1",
    title: "Building REST APIs with Express",
    description: "A step-by-step tutorial on setting up routes, handling requests, and responding with JSON.",
    resourceType: "tutorial",
    source: "LogRocket",
    url: "https://blog.logrocket.com/build-rest-api-node-express-typescript/",
    domainId: "domain-webdev",
    competencyId: "comp-web-backend",
    createdAt: new Date().toISOString()
  },
  {
    id: "res-web-db-1",
    title: "Intro to Relational Databases and SQL",
    description: "Learn how SQL works, how relationships are modeled, and standard JOIN query syntax.",
    resourceType: "video",
    source: "freeCodeCamp",
    url: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
    domainId: "domain-webdev",
    competencyId: "comp-web-db",
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_QUESTIONS: Question[] = [
  // Python - Basics (comp-py-fund)
  {
    id: "q-py-fund-1",
    assessmentId: "seed-pool",
    competencyId: "comp-py-fund",
    questionText: "What will be the output of `print(type(5 / 2))` in Python 3?",
    questionType: "mcq",
    options: ["<class 'int'>", "<class 'float'>", "<class 'double'>", "<class 'complex'>"],
    correctAnswer: "<class 'float'>",
    explanation: "In Python 3, the `/` operator performs float division, so `5 / 2` yields `2.5`, which is a float. Floor division `5 // 2` would yield an integer.",
    difficulty: "beginner"
  },
  {
    id: "q-py-fund-2",
    assessmentId: "seed-pool",
    competencyId: "comp-py-fund",
    questionText: "Which of the following is an invalid variable name in Python?",
    questionType: "mcq",
    options: ["_my_var", "myVar2", "2myVar", "my_var_abc"],
    correctAnswer: "2myVar",
    explanation: "Variable names in Python cannot start with a digit. They must start with a letter or an underscore.",
    difficulty: "beginner"
  },

  // Python - Control Flow (comp-py-flow)
  {
    id: "q-py-flow-1",
    assessmentId: "seed-pool",
    competencyId: "comp-py-flow",
    questionText: "What is the output of the following loop?\n```python\nfor i in range(1, 5):\n    if i == 3:\n        break\n    print(i, end='')\n```",
    questionType: "mcq",
    options: ["1234", "123", "12", "124"],
    correctAnswer: "12",
    explanation: "The loop iterates through 1, 2, 3, 4. When `i` equals 3, the `break` statement terminates the loop immediately. Hence, only 1 and 2 are printed.",
    difficulty: "intermediate"
  },
  {
    id: "q-py-flow-2",
    assessmentId: "seed-pool",
    competencyId: "comp-py-flow",
    questionText: "What does the `continue` statement do inside a loop in Python?",
    questionType: "mcq",
    options: [
      "Stops the loop completely",
      "Skips the rest of the current iteration and jumps to the next iteration",
      "Exits the current function",
      "Repeats the current iteration once more"
    ],
    correctAnswer: "Skips the rest of the current iteration and jumps to the next iteration",
    explanation: "The `continue` statement skips all remaining expressions inside the current loop iteration and moves the execution thread back to the loop's start for the next item.",
    difficulty: "beginner"
  },

  // Python - Functions (comp-py-func)
  {
    id: "q-py-func-1",
    assessmentId: "seed-pool",
    competencyId: "comp-py-func",
    questionText: "In Python, how is local/global scope evaluated when resolving variable names? (Order of evaluation)",
    questionType: "mcq",
    options: [
      "Global, Enclosing, Local, Built-in",
      "Local, Enclosing, Global, Built-in (LEGB)",
      "Local, Global, Built-in, Enclosing",
      "Built-in, Global, Enclosing, Local"
    ],
    correctAnswer: "Local, Enclosing, Global, Built-in (LEGB)",
    explanation: "Python looks up variables in the LEGB rule order: Local (L), Enclosing (E), Global (G), and Built-in (B).",
    difficulty: "intermediate"
  },
  {
    id: "q-py-func-2",
    assessmentId: "seed-pool",
    competencyId: "comp-py-func",
    questionText: "What is the output of this Python code?\n```python\nfunc = lambda x, y: x * y\nprint(func(4, 5))\n```",
    questionType: "mcq",
    options: ["9", "20", "44444", "Error"],
    correctAnswer: "20",
    explanation: "Lambda expressions are short anonymous functions. The lambda here accepts two variables, x and y, and returns their multiplication. 4 * 5 = 20.",
    difficulty: "intermediate"
  },

  // Python - OOP (comp-py-oop)
  {
    id: "q-py-oop-1",
    assessmentId: "seed-pool",
    competencyId: "comp-py-oop",
    questionText: "Which keyword or method represents Python's constructor in a class declaration?",
    questionType: "mcq",
    options: ["__init__", "constructor", "new", "init"],
    correctAnswer: "__init__",
    explanation: "The custom double-underscore method `__init__` acts as Python's initializer/constructor and runs automatically when an instance of a class is created.",
    difficulty: "beginner"
  },
  {
    id: "q-py-oop-2",
    assessmentId: "seed-pool",
    competencyId: "comp-py-oop",
    questionText: "How does multiple inheritance handle method resolution in Python?",
    questionType: "mcq",
    options: [
      "It raises a syntax error",
      "Using Method Resolution Order (MRO) via the C3 linearization algorithm",
      "By randomly selecting a parent method",
      "By always choosing the parent method that comes first alphabetically"
    ],
    correctAnswer: "Using Method Resolution Order (MRO) via the C3 linearization algorithm",
    explanation: "Python implements Method Resolution Order (MRO) calculated via the C3 Linearization algorithm to safely resolve overlapping attributes in multiple inheritance hierarchies.",
    difficulty: "advanced"
  },

  // Python - Exceptions (comp-py-exceptions)
  {
    id: "q-py-exc-1",
    assessmentId: "seed-pool",
    competencyId: "comp-py-exceptions",
    questionText: "Which block in Python always executes regardless of whether an exception was raised or handled?",
    questionType: "mcq",
    options: ["try", "except", "finally", "else"],
    correctAnswer: "finally",
    explanation: "The `finally` block is executed unconditionally after `try` and any `except`/`else` clauses, making it ideal for cleaning up resources such as database connections or file descriptors.",
    difficulty: "beginner"
  },

  // WebDev - HTML & CSS (comp-web-htmlcss)
  {
    id: "q-web-css-1",
    assessmentId: "seed-pool",
    competencyId: "comp-web-htmlcss",
    questionText: "Which CSS Flexbox property aligns items along the cross axis?",
    questionType: "mcq",
    options: ["justify-content", "align-items", "flex-direction", "flex-wrap"],
    correctAnswer: "align-items",
    explanation: "`justify-content` aligns flex items along the main axis, while `align-items` aligns flex items along the perpendicular cross axis.",
    difficulty: "beginner"
  },
  {
    id: "q-web-css-2",
    assessmentId: "seed-pool",
    competencyId: "comp-web-htmlcss",
    questionText: "In CSS Box Model, what is the correct order of components from outside to inside?",
    questionType: "mcq",
    options: [
      "Margin, Border, Padding, Content",
      "Border, Margin, Padding, Content",
      "Padding, Margin, Border, Content",
      "Content, Padding, Border, Margin"
    ],
    correctAnswer: "Margin, Border, Padding, Content",
    explanation: "From the outermost boundary inward: Margin (outer clear area), Border, Padding (space around content), and Content (text/image/elements).",
    difficulty: "beginner"
  },

  // WebDev - JS (comp-web-js)
  {
    id: "q-web-js-1",
    assessmentId: "seed-pool",
    competencyId: "comp-web-js",
    questionText: "What is the difference between `==` and `===` in JavaScript?",
    questionType: "mcq",
    options: [
      "There is no difference",
      "`==` checks value only with type coercion, while `===` checks both value and type strictly",
      "`===` converts types before comparing",
      "`==` is used for objects only"
    ],
    correctAnswer: "`==` checks value only with type coercion, while `===` checks both value and type strictly",
    explanation: "`==` performs abstract equality with implicit type conversion (e.g., `'5' == 5` is true), while strict equality `===` requires both operands to share the same type without coercion (`'5' === 5` is false).",
    difficulty: "beginner"
  },
  {
    id: "q-web-js-2",
    assessmentId: "seed-pool",
    competencyId: "comp-web-js",
    questionText: "What will `Promise.all([p1, p2])` do if `p1` rejects?",
    questionType: "mcq",
    options: [
      "Wait for p2 to complete before rejecting",
      "Reject immediately with p1's reason without waiting for p2 (fail-fast)",
      "Ignore p1 and resolve p2",
      "Return an array with null for p1"
    ],
    correctAnswer: "Reject immediately with p1's reason without waiting for p2 (fail-fast)",
    explanation: "`Promise.all()` is fail-fast: if any promise in the iterable rejects, the whole returned promise immediately rejects with that first rejection reason.",
    difficulty: "intermediate"
  },

  // WebDev - React (comp-web-react)
  {
    id: "q-web-react-1",
    assessmentId: "seed-pool",
    competencyId: "comp-web-react",
    questionText: "When does the cleanup function returned from `useEffect` run in React?",
    questionType: "mcq",
    options: [
      "Only when the entire browser window is refreshed",
      "Before the component unmounts and before re-running the effect on dependency change",
      "Immediately after every DOM repaint",
      "Only if an unhandled JavaScript error occurs"
    ],
    correctAnswer: "Before the component unmounts and before re-running the effect on dependency change",
    explanation: "React executes the cleanup function returned by `useEffect` before the component is removed from the UI (unmounted) and prior to re-running the effect whenever dependencies change.",
    difficulty: "intermediate"
  },

  // WebDev - Backend Express (comp-web-backend)
  {
    id: "q-web-be-1",
    assessmentId: "seed-pool",
    competencyId: "comp-web-backend",
    questionText: "In Express.js, what is the purpose of `express.json()` middleware?",
    questionType: "mcq",
    options: [
      "To automatically convert SQL queries to JSON",
      "To parse incoming HTTP request bodies with JSON payloads and populate `req.body`",
      "To encrypt responses with JSON Web Tokens",
      "To format server error logs in JSON"
    ],
    correctAnswer: "To parse incoming HTTP request bodies with JSON payloads and populate `req.body`",
    explanation: "`express.json()` is a built-in middleware based on body-parser that parses incoming requests with `Content-Type: application/json` and places the parsed object on `req.body`.",
    difficulty: "beginner"
  },

  // WebDev - DB & SQL (comp-web-db)
  {
    id: "q-web-db-1",
    assessmentId: "seed-pool",
    competencyId: "comp-web-db",
    questionText: "Which SQL clause is used to filter records based on an aggregate function (e.g., `COUNT(*) > 5`)?",
    questionType: "mcq",
    options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
    correctAnswer: "HAVING",
    explanation: "The `WHERE` clause filters rows before grouping/aggregation. The `HAVING` clause filters summarized groups after the `GROUP BY` aggregation has been applied.",
    difficulty: "intermediate"
  }
];

const DEFAULT_TEMPLATES: AssessmentTemplate[] = [
  {
    id: "template-py-midterm",
    domainId: "domain-python",
    title: "Python Core Competency & Logic Midterm",
    description: "Comprehensive timed evaluation assessing variables, functions, OOP patterns, and error handling with strict tab-locking.",
    timeLimitMinutes: 15,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    proctoringStrict: true,
    questions: DEFAULT_QUESTIONS.filter(q => q.competencyId.startsWith("comp-py")),
    createdBy: "Prof. Sarah Jenkins",
    createdAt: new Date().toISOString(),
    isPublished: true
  },
  {
    id: "template-web-fullstack",
    domainId: "domain-webdev",
    title: "Full-Stack Web Readiness Evaluation",
    description: "Standard industry readiness test covering React hooks, Flexbox, asynchronous JS, Express REST routes, and SQL.",
    timeLimitMinutes: 20,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    proctoringStrict: true,
    questions: DEFAULT_QUESTIONS.filter(q => q.competencyId.startsWith("comp-web")),
    createdBy: "Prof. Sarah Jenkins",
    createdAt: new Date().toISOString(),
    isPublished: true
  }
];

class Database {
  public data: DatabaseSchema = {
    users: [],
    domains: [],
    competencies: [],
    questions: [],
    assessmentTemplates: [],
    assessments: [],
    assessmentResults: [],
    skillGaps: [],
    learningResources: [],
    recommendations: [],
    materials: [],
    quizzes: [],
    quizAttempts: [],
    aiGenerationLogs: [],
    aiTutorConversations: [],
    featureFlags: DEFAULT_FEATURE_FLAGS
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, "utf-8").trim();
        if (fileContent.length > 5) {
          const parsed = JSON.parse(fileContent);
          this.data = {
            ...this.data,
            ...parsed
          };
        }
      }
    } catch (e) {
      console.error("Failed to load local DB, falling back to guaranteed defaults:", e);
    }

    // Ensure all seed data is fully populated and up to date
    this.ensureSeedData();
    this.save();
  }

  public save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write to DB path:", e);
    }
  }

  private ensureSeedData() {
    // 1. Users
    if (!this.data.users || this.data.users.length === 0) {
      this.data.users = [...DEFAULT_USERS];
    } else {
      // Ensure admin and demo accounts always exist
      DEFAULT_USERS.forEach(defU => {
        const found = this.data.users.find(u => u.email.toLowerCase() === defU.email.toLowerCase());
        if (!found) {
          this.data.users.push(defU);
        } else {
          // Sync role and password if not set
          if (!found.role) found.role = defU.role;
          if (!found.passwordHash) found.passwordHash = defU.passwordHash;
        }
      });
    }

    // 2. Domains
    if (!this.data.domains || this.data.domains.length === 0) {
      this.data.domains = [...DEFAULT_DOMAINS];
    } else {
      DEFAULT_DOMAINS.forEach(d => {
        if (!this.data.domains.some(existing => existing.id === d.id)) {
          this.data.domains.push(d);
        }
      });
    }

    // 3. Competencies
    if (!this.data.competencies || this.data.competencies.length === 0) {
      this.data.competencies = [...DEFAULT_COMPETENCIES];
    } else {
      DEFAULT_COMPETENCIES.forEach(c => {
        if (!this.data.competencies.some(existing => existing.id === c.id)) {
          this.data.competencies.push(c);
        }
      });
    }

    // 4. Learning Resources
    if (!this.data.learningResources || this.data.learningResources.length === 0) {
      this.data.learningResources = [...DEFAULT_RESOURCES];
    } else {
      DEFAULT_RESOURCES.forEach(r => {
        if (!this.data.learningResources.some(existing => existing.id === r.id)) {
          this.data.learningResources.push(r);
        }
      });
    }

    // 5. Questions
    if (!this.data.questions || this.data.questions.length === 0) {
      this.data.questions = [...DEFAULT_QUESTIONS];
    } else {
      DEFAULT_QUESTIONS.forEach(q => {
        if (!this.data.questions.some(existing => existing.id === q.id)) {
          this.data.questions.push(q);
        }
      });
    }

    // 6. Assessment Templates
    if (!this.data.assessmentTemplates || this.data.assessmentTemplates.length === 0) {
      this.data.assessmentTemplates = [...DEFAULT_TEMPLATES];
    }

    // 7. Feature Flags
    if (!this.data.featureFlags) {
      this.data.featureFlags = { ...DEFAULT_FEATURE_FLAGS };
    }

    // 8. Arrays safety
    if (!this.data.assessments) this.data.assessments = [];
    if (!this.data.assessmentResults) this.data.assessmentResults = [];
    if (!this.data.skillGaps) this.data.skillGaps = [];
    if (!this.data.recommendations) this.data.recommendations = [];
    if (!this.data.materials) this.data.materials = [];
    if (!this.data.quizzes) this.data.quizzes = [];
    if (!this.data.quizAttempts) this.data.quizAttempts = [];
    if (!this.data.aiGenerationLogs) this.data.aiGenerationLogs = [];
    if (!this.data.aiTutorConversations) this.data.aiTutorConversations = [];
  }

  // ==================== AUTH & USER MANAGEMENT ====================

  public getDemoUser(): User {
    const student = this.data.users.find(u => u.role === "student") || this.data.users[0];
    return student;
  }

  public getAllUsers(): User[] {
    return this.data.users.map(u => ({
      ...u,
      passwordHash: undefined // do not leak hashes in public list
    }));
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public registerUser(email: string, name: string, preferences: string, role: UserRole = "student"): User {
    const existing = this.getUserByEmail(email);
    if (existing) {
      existing.name = name;
      existing.learningPreferences = preferences;
      this.save();
      return existing;
    }
    const newUser: User = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      role,
      learningPreferences: preferences,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public registerWithPassword(email: string, name: string, password: string, preferences?: string, role: UserRole = "student"): User {
    const existing = this.getUserByEmail(email);
    if (existing) {
      throw new Error("Email is already registered in the platform");
    }
    const passwordHash = hashPassword(password);
    const newUser: User = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      role,
      learningPreferences: preferences || "I prefer interactive assessments.",
      passwordHash,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public loginWithPassword(email: string, password: string): User | undefined {
    const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return undefined;
    if (user.disabled) {
      throw new Error("This account has been disabled by the administrator.");
    }
    const incomingHash = hashPassword(password);
    if (user.passwordHash === incomingHash || (!user.passwordHash && password === "student123")) {
      return user;
    }
    return undefined;
  }

  public registerOrLoginGoogleUser(email: string, name: string): User {
    const existing = this.getUserByEmail(email);
    if (existing) {
      if (existing.disabled) {
        throw new Error("This account has been disabled by the administrator.");
      }
      return existing;
    }
    const newUser: User = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      role: "student",
      learningPreferences: "I prefer interactive assessments.",
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUserPreferences(userId: string, preferences: string): User | undefined {
    const user = this.getUserById(userId);
    if (user) {
      user.learningPreferences = preferences;
      this.save();
    }
    return user;
  }

  // Admin User CRUD Operations
  public adminCreateUser(params: { name: string; email: string; password?: string; role: UserRole; learningPreferences?: string }): User {
    const existing = this.getUserByEmail(params.email);
    if (existing) {
      throw new Error("A user with this email already exists");
    }
    const password = params.password || "welcome123";
    const newUser: User = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      email: params.email,
      name: params.name,
      role: params.role || "student",
      passwordHash: hashPassword(password),
      learningPreferences: params.learningPreferences || "Standard Curriculum",
      createdAt: new Date().toISOString(),
      disabled: false
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public adminUpdateUser(id: string, updates: Partial<User>): User {
    const user = this.getUserById(id);
    if (!user) throw new Error("User not found");

    if (updates.name !== undefined) user.name = updates.name;
    if (updates.email !== undefined) user.email = updates.email;
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.disabled !== undefined) user.disabled = updates.disabled;
    if (updates.featuresDisabled !== undefined) user.featuresDisabled = updates.featuresDisabled;
    if (updates.learningPreferences !== undefined) user.learningPreferences = updates.learningPreferences;

    this.save();
    return user;
  }

  public adminResetPassword(userId: string, newPassword: string): boolean {
    const user = this.getUserById(userId);
    if (!user) throw new Error("User not found");
    if (!newPassword || newPassword.length < 4) {
      throw new Error("Password must be at least 4 characters long");
    }
    user.passwordHash = hashPassword(newPassword);
    this.save();
    return true;
  }

  public adminDeleteUser(userId: string): boolean {
    const idx = this.data.users.findIndex(u => u.id === userId);
    if (idx === -1) return false;
    // Prevent deleting the root admin
    if (this.data.users[idx].email === "admin@skillgap.ai") {
      throw new Error("Cannot delete primary system administrator account");
    }
    this.data.users.splice(idx, 1);
    // Also clean up user's data
    this.data.assessments = this.data.assessments.filter(a => a.studentId !== userId);
    this.data.assessmentResults = this.data.assessmentResults.filter(ar => ar.studentId !== userId);
    this.data.skillGaps = this.data.skillGaps.filter(sg => sg.studentId !== userId);
    this.data.recommendations = this.data.recommendations.filter(r => r.studentId !== userId);
    this.save();
    return true;
  }

  // ==================== FEATURE FLAGS ====================

  public getFeatureFlags(): FeatureFlags {
    return this.data.featureFlags || DEFAULT_FEATURE_FLAGS;
  }

  public updateFeatureFlags(updates: Partial<FeatureFlags>): FeatureFlags {
    this.data.featureFlags = {
      ...this.data.featureFlags,
      ...updates
    };
    this.save();
    return this.data.featureFlags;
  }

  // ==================== DOMAINS / COURSES ====================

  public getDomains(): LearningDomain[] {
    return this.data.domains;
  }

  public getDomainById(id: string): LearningDomain | undefined {
    return this.data.domains.find(d => d.id === id);
  }

  public addDomain(params: { name: string; description: string; deadline?: string; instructor?: string; studentId?: string }): LearningDomain {
    const id = `domain-${Math.random().toString(36).substr(2, 7)}`;
    const newDomain: LearningDomain = {
      id,
      name: params.name,
      description: params.description,
      createdAt: new Date().toISOString(),
      deadline: params.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      instructor: params.instructor || "Curriculum Faculty",
      status: "active",
      enrolledStudentsCount: params.studentId ? 1 : 0,
      assignedStudentIds: params.studentId ? [params.studentId] : [],
      studentId: params.studentId
    };
    this.data.domains.push(newDomain);

    // Auto-create standard competencies for this course
    const baseName = params.name.trim();
    const comp1: Competency = {
      id: `comp-${id}-1`,
      domainId: id,
      name: `${baseName} Core Fundamentals`,
      description: `Core concepts, primary syntax, and architectural structure in ${baseName}.`
    };
    const comp2: Competency = {
      id: `comp-${id}-2`,
      domainId: id,
      name: `${baseName} Practical Applications`,
      description: `Hands-on development, implementation patterns, and workflows in ${baseName}.`
    };
    const comp3: Competency = {
      id: `comp-${id}-3`,
      domainId: id,
      name: `${baseName} Debugging & Best Practices`,
      description: `Error handling, performance optimization, and industry standards in ${baseName}.`
    };
    this.data.competencies.push(comp1, comp2, comp3);

    // Auto-create rich starter diagnostic questions for the course pool
    const q1: Question = {
      id: `q-${id}-1`,
      assessmentId: "",
      competencyId: comp1.id,
      questionText: `In ${baseName}, what is the recommended approach for initializing core structures and handling primary inputs?`,
      questionType: "mcq",
      options: [
        `Follow standardized type definitions and validate arguments before execution`,
        `Rely exclusively on global mutable variables across scopes`,
        `Disable runtime safety checks and suppression handlers`,
        `Hardcode environment configurations directly into module declarations`
      ],
      correctAnswer: `Follow standardized type definitions and validate arguments before execution`,
      explanation: `Validating inputs and adhering to standard type patterns ensures robustness and prevents unexpected runtime failures in ${baseName}.`,
      difficulty: "beginner"
    };

    const q2: Question = {
      id: `q-${id}-2`,
      assessmentId: "",
      competencyId: comp1.id,
      questionText: `Which of the following best characterizes scope and lifecycle management in ${baseName}?`,
      questionType: "mcq",
      options: [
        `Variables should be scoped as narrowly as practical to avoid unintentional side effects`,
        `All identifiers must reside in the global root namespace`,
        `Memory is never released until the host process completely shuts down`,
        `Lexical scoping is prohibited in modern system standards`
      ],
      correctAnswer: `Variables should be scoped as narrowly as practical to avoid unintentional side effects`,
      explanation: `Restricting scope to the minimum necessary block prevents namespace collisions and promotes modular code.`,
      difficulty: "beginner"
    };

    const q3: Question = {
      id: `q-${id}-3`,
      assessmentId: "",
      competencyId: comp2.id,
      questionText: `When implementing a production feature in ${baseName}, what is the best strategy for handling asynchronous operations or external I/O?`,
      questionType: "mcq",
      options: [
        `Utilize structured asynchronous handling with centralized catch/fallback handlers`,
        `Block the main application thread synchronously until the remote host responds`,
        `Ignore rejected promises or network connection timeouts entirely`,
        `Execute network requests inside an infinite synchronous polling loop`
      ],
      correctAnswer: `Utilize structured asynchronous handling with centralized catch/fallback handlers`,
      explanation: `Non-blocking asynchronous operations paired with robust error handling maintain responsiveness and fault tolerance.`,
      difficulty: "intermediate"
    };

    const q4: Question = {
      id: `q-${id}-4`,
      assessmentId: "",
      competencyId: comp2.id,
      questionText: `How does modularization benefit software architecture in ${baseName}?`,
      questionType: "mcq",
      options: [
        `It encapsulates specific responsibilities, simplifies testing, and encourages reuse`,
        `It drastically increases compilation overhead with zero organizational benefits`,
        `It forces all application logic into a single monolithic script`,
        `It prevents code maintainers from utilizing third-party libraries`
      ],
      correctAnswer: `It encapsulates specific responsibilities, simplifies testing, and encourages reuse`,
      explanation: `Modular decomposition allows teams to isolate concerns and unit test components independently.`,
      difficulty: "intermediate"
    };

    const q5: Question = {
      id: `q-${id}-5`,
      assessmentId: "",
      competencyId: comp3.id,
      questionText: `What is the primary objective of automated unit and integration tests in a ${baseName} workflow?`,
      questionType: "mcq",
      options: [
        `To rapidly detect regressions, verify expected behavior, and ensure release quality`,
        `To replace static documentation and remove the need for version control`,
        `To intentionally increase build execution latency for compliance audits`,
        `To obfuscate binary packages before publishing to package registries`
      ],
      correctAnswer: `To rapidly detect regressions, verify expected behavior, and ensure release quality`,
      explanation: `Automated testing gives engineers confidence that changes do not break existing functionality.`,
      difficulty: "advanced"
    };

    this.data.questions.push(q1, q2, q3, q4, q5);

    // Auto-create curated learning resources for this course
    const res1: LearningResource = {
      id: `res-${id}-1`,
      domainId: id,
      competencyId: comp1.id,
      title: `${baseName}: Official Comprehensive Guide & Documentation`,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(baseName)}`,
      resourceType: "documentation",
      source: "Curriculum Repository",
      description: `In-depth technical walkthrough covering key principles, structure, and foundational techniques for ${baseName}.`,
      createdAt: new Date().toISOString()
    };
    const res2: LearningResource = {
      id: `res-${id}-2`,
      domainId: id,
      competencyId: comp2.id,
      title: `${baseName}: Practical Production Patterns & Architecture`,
      url: `https://github.com/topics/${encodeURIComponent(baseName.toLowerCase().replace(/\s+/g, '-'))}`,
      resourceType: "article",
      source: "Developer Guides",
      description: `Explore battle-tested design patterns, modular architecture, and real-world implementation standards in ${baseName}.`,
      createdAt: new Date().toISOString()
    };
    this.data.learningResources.push(res1, res2);

    // If a student created it, enroll them immediately
    if (params.studentId) {
      const student = this.getUserById(params.studentId);
      if (student) {
        if (!student.enrolledCourseIds) student.enrolledCourseIds = [];
        if (!student.enrolledCourseIds.includes(id)) {
          student.enrolledCourseIds.push(id);
        }
      }
    }

    this.save();
    return newDomain;
  }

  public updateDomain(id: string, updates: Partial<LearningDomain>): LearningDomain {
    const domain = this.getDomainById(id);
    if (!domain) throw new Error("Course not found");
    Object.assign(domain, updates);
    this.save();
    return domain;
  }

  public assignStudentsToCourse(courseId: string, studentIds: string[]): LearningDomain {
    const domain = this.getDomainById(courseId);
    if (!domain) throw new Error("Course not found");
    domain.assignedStudentIds = studentIds;
    domain.enrolledStudentsCount = studentIds.length;
    
    // Also sync to users
    this.data.users.forEach(u => {
      if (u.role === "student") {
        if (!u.enrolledCourseIds) u.enrolledCourseIds = [];
        if (studentIds.includes(u.id)) {
          if (!u.enrolledCourseIds.includes(courseId)) {
            u.enrolledCourseIds.push(courseId);
          }
        } else {
          u.enrolledCourseIds = u.enrolledCourseIds.filter(cid => cid !== courseId);
        }
      }
    });

    this.save();
    return domain;
  }

  public assignStudentsToExam(templateId: string, studentIds: string[]): AssessmentTemplate {
    const template = this.getAssessmentTemplate(templateId);
    if (!template) throw new Error("Exam template not found");
    template.assignedStudentIds = studentIds;
    this.save();
    return template;
  }

  public deleteDomain(id: string): boolean {
    const idx = this.data.domains.findIndex(d => d.id === id);
    if (idx === -1) return false;
    this.data.domains.splice(idx, 1);
    this.save();
    return true;
  }

  // ==================== COMPETENCIES ====================

  public getCompetenciesByDomain(domainId: string): Competency[] {
    return this.data.competencies.filter(c => c.domainId === domainId);
  }

  public getCompetency(id: string): Competency | undefined {
    return this.data.competencies.find(c => c.id === id);
  }

  public addCompetency(params: { domainId: string; name: string; description: string }): Competency {
    const id = `comp-${Math.random().toString(36).substr(2, 7)}`;
    const newComp: Competency = {
      id,
      domainId: params.domainId,
      name: params.name,
      description: params.description
    };
    this.data.competencies.push(newComp);
    this.save();
    return newComp;
  }

  // ==================== QUESTIONS POOL ====================

  public getQuestionsForDomain(domainId: string): Question[] {
    const comps = this.getCompetenciesByDomain(domainId);
    const compIds = comps.map(c => c.id);
    return this.data.questions.filter(q => compIds.includes(q.competencyId));
  }

  public addQuestionToPool(q: Omit<Question, "id">): Question {
    const newQuestion: Question = {
      ...q,
      id: `q-${Math.random().toString(36).substr(2, 9)}`
    };
    this.data.questions.push(newQuestion);
    this.save();
    return newQuestion;
  }

  // ==================== ASSESSMENT TEMPLATES (TEACHER/ADMIN) ====================

  public getAssessmentTemplates(): AssessmentTemplate[] {
    return this.data.assessmentTemplates;
  }

  public getAssessmentTemplate(id: string): AssessmentTemplate | undefined {
    return this.data.assessmentTemplates.find(t => t.id === id);
  }

  public createAssessmentTemplate(params: {
    domainId: string;
    title: string;
    description: string;
    timeLimitMinutes: number;
    deadline?: string;
    proctoringStrict?: boolean;
    questions: Question[];
    createdBy?: string;
  }): AssessmentTemplate {
    const template: AssessmentTemplate = {
      id: `template-${Math.random().toString(36).substr(2, 8)}`,
      domainId: params.domainId,
      title: params.title,
      description: params.description,
      timeLimitMinutes: params.timeLimitMinutes || 15,
      deadline: params.deadline || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      proctoringStrict: params.proctoringStrict ?? true,
      questions: params.questions,
      createdBy: params.createdBy || "Administrator",
      createdAt: new Date().toISOString(),
      isPublished: true
    };
    this.data.assessmentTemplates.push(template);
    this.save();
    return template;
  }

  public updateAssessmentTemplate(id: string, updates: Partial<AssessmentTemplate>): AssessmentTemplate {
    const t = this.getAssessmentTemplate(id);
    if (!t) throw new Error("Assessment template not found");
    Object.assign(t, updates);
    this.save();
    return t;
  }

  public deleteAssessmentTemplate(id: string): boolean {
    const idx = this.data.assessmentTemplates.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.data.assessmentTemplates.splice(idx, 1);
    this.save();
    return true;
  }

  public getAssessmentSubmissions(): Array<any> {
    const results = this.data.assessmentResults || [];
    return results.map(res => {
      const student = this.getUserById(res.studentId);
      const assessment = this.data.assessments.find(a => a.id === res.assessmentId);
      const domain = assessment ? this.getDomainById(assessment.domainId) : undefined;
      
      let correctCount = 0;
      let totalCount = assessment?.questions?.length || 0;
      if (res.topicBreakdown) {
        Object.values(res.topicBreakdown).forEach((tb: any) => {
          correctCount += tb.correct || 0;
        });
      }

      return {
        id: res.id,
        assessmentId: res.assessmentId,
        studentId: res.studentId,
        studentName: student?.name || "Enrolled Student",
        studentEmail: student?.email || "student@skillgap.ai",
        assessmentTitle: assessment?.title || "Competency Assessment",
        courseName: domain?.name || "Curriculum Domain",
        score: res.overallScore,
        completedAt: res.completedAt,
        correctAnswers: correctCount,
        totalQuestions: totalCount,
        autoSubmittedReason: res.autoSubmittedReason || assessment?.autoSubmittedReason || null
      };
    }).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }

  // ==================== STUDENT ASSESSMENTS ====================

  public createAssessment(
    studentId: string, 
    domainId: string, 
    customQuestions?: Question[], 
    templateId?: string,
    timeLimitMinutes?: number,
    deadline?: string
  ): Assessment {
    let selectedQuestions: Question[] = [];
    let title = "Standard Competency Assessment";

    if (templateId) {
      const template = this.getAssessmentTemplate(templateId);
      if (template) {
        selectedQuestions = template.questions;
        title = template.title;
        timeLimitMinutes = template.timeLimitMinutes;
        deadline = template.deadline;
      }
    }

    const domain = this.getDomainById(domainId);
    if (domain && !title.includes(domain.name)) {
      title = `${domain.name} Skill Evaluation`;
    }

    if (selectedQuestions.length === 0) {
      if (customQuestions && customQuestions.length > 0) {
        selectedQuestions = customQuestions;
      } else {
        const comps = this.getCompetenciesByDomain(domainId);
        const pool = this.getQuestionsForDomain(domainId);
        
        comps.forEach(c => {
          const compQuestions = pool.filter(q => q.competencyId === c.id);
          const shuffled = [...compQuestions].sort(() => 0.5 - Math.random());
          selectedQuestions.push(...shuffled.slice(0, 2));
        });

        // If pool is small, add any questions available
        if (selectedQuestions.length === 0 && pool.length > 0) {
          selectedQuestions = [...pool].slice(0, 5);
        }

        // Safety fallback: if pool was empty, generate diagnostic questions
        if (selectedQuestions.length === 0) {
          const domName = domain?.name || "Curriculum Unit";
          selectedQuestions = [
            {
              id: `q-fb-${Math.random().toString(36).substr(2, 7)}`,
              assessmentId: "",
              competencyId: comps[0]?.id || "comp-core",
              questionText: `What is the recommended core design pattern when implementing modular services in ${domName}?`,
              questionType: "mcq",
              options: [
                `Encapsulate functionality into decoupled modules with explicit input validation`,
                `Declare all variables and procedures in a single global script`,
                `Bypass error handling and suppress warning traces`,
                `Hardcode environment configurations into source files`
              ],
              correctAnswer: `Encapsulate functionality into decoupled modules with explicit input validation`,
              explanation: `Modular encapsulation minimizes side effects and promotes maintainability.`,
              difficulty: "beginner"
            },
            {
              id: `q-fb-${Math.random().toString(36).substr(2, 7)}`,
              assessmentId: "",
              competencyId: comps[0]?.id || "comp-core",
              questionText: `How should runtime exceptions and external API timeouts be addressed in ${domName}?`,
              questionType: "mcq",
              options: [
                `Implement structured catch blocks with contextual logging and deterministic fallbacks`,
                `Allow unhandled exceptions to crash the application process immediately`,
                `Silence all error notifications and return corrupted payloads`,
                `Execute synchronous infinite loops awaiting network connectivity`
              ],
              correctAnswer: `Implement structured catch blocks with contextual logging and deterministic fallbacks`,
              explanation: `Defensive error boundaries preserve service availability and provide clear debugging traces.`,
              difficulty: "intermediate"
            },
            {
              id: `q-fb-${Math.random().toString(36).substr(2, 7)}`,
              assessmentId: "",
              competencyId: comps[0]?.id || "comp-core",
              questionText: `What is the primary benefit of automated unit testing in ${domName}?`,
              questionType: "mcq",
              options: [
                `Rapid regression detection and verification of expected component behavior`,
                `Replacing code documentation and git commit history`,
                `Artificially increasing compile time during deployments`,
                `Eliminating the need for static type checking`
              ],
              correctAnswer: `Rapid regression detection and verification of expected component behavior`,
              explanation: `Automated tests give confidence that modifications do not break existing business logic.`,
              difficulty: "intermediate"
            }
          ];
        }
      }
    }

    const assessmentId = `assess-${Math.random().toString(36).substr(2, 9)}`;
    const newAssessment: Assessment = {
      id: assessmentId,
      templateId,
      title,
      studentId,
      domainId,
      status: "started",
      startedAt: new Date().toISOString(),
      questions: selectedQuestions.map(q => ({ ...q, assessmentId })),
      answers: {},
      timeLimitMinutes: timeLimitMinutes || 15,
      deadline: deadline || domain?.deadline
    };

    this.data.assessments.push(newAssessment);
    this.save();
    return newAssessment;
  }

  public getAssessment(id: string): Assessment | undefined {
    return this.data.assessments.find(a => a.id === id);
  }

  public submitAssessment(assessmentId: string, studentAnswers: Record<string, string>, autoSubmittedReason?: string): AssessmentResult {
    const assessment = this.getAssessment(assessmentId);
    if (!assessment) {
      throw new Error("Assessment not found");
    }

    assessment.status = "completed";
    assessment.submittedAt = new Date().toISOString();
    assessment.answers = studentAnswers;
    if (autoSubmittedReason) {
      assessment.autoSubmittedReason = autoSubmittedReason;
    }

    let correctCount = 0;
    const totalCount = assessment.questions.length;
    const topicBreakdown: Record<string, { competencyId: string; competencyName: string; correct: number; total: number; percentage: number }> = {};

    assessment.questions.forEach(q => {
      const studentAnswer = (studentAnswers[q.id] || "").trim().toLowerCase();
      const correctAnswer = (q.correctAnswer || "").trim().toLowerCase();
      const isCorrect = studentAnswer.length > 0 && studentAnswer === correctAnswer;
      
      if (isCorrect) {
        correctCount++;
      }

      const comp = this.getCompetency(q.competencyId);
      const compName = comp ? comp.name : "Core Topic";

      if (!topicBreakdown[q.competencyId]) {
        topicBreakdown[q.competencyId] = {
          competencyId: q.competencyId,
          competencyName: compName,
          correct: 0,
          total: 0,
          percentage: 0
        };
      }

      topicBreakdown[q.competencyId].total++;
      if (isCorrect) {
        topicBreakdown[q.competencyId].correct++;
      }
    });

    const overallScore = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    assessment.score = overallScore;

    Object.keys(topicBreakdown).forEach(compId => {
      const tb = topicBreakdown[compId];
      tb.percentage = tb.total > 0 ? Math.round((tb.correct / tb.total) * 100) : 0;
    });

    const resultId = `result-${Math.random().toString(36).substr(2, 9)}`;
    const result: AssessmentResult = {
      id: resultId,
      assessmentId,
      studentId: assessment.studentId,
      overallScore,
      completedAt: new Date().toISOString(),
      topicBreakdown,
      autoSubmittedReason,
      assessment: assessment // include full assessment with answers revealed for review!
    };

    this.data.assessmentResults.push(result);

    // Save skill gaps and recommendations directly into database tables
    this.updateSkillGapsAndRecommendations(assessment.studentId, assessment.domainId, topicBreakdown);

    this.save();
    return result;
  }

  public updateSkillGapsAndRecommendations(
    studentId: string, 
    domainId: string, 
    topicBreakdown: Record<string, { competencyId: string; competencyName: string; correct: number; total: number; percentage: number }>
  ) {
    Object.keys(topicBreakdown).forEach(compId => {
      const tb = topicBreakdown[compId];
      const score = tb.percentage;

      let level: 'Weak' | 'Moderate' | 'Strong' = "Moderate";
      let priority: 'High' | 'Medium' | 'Low' = "Medium";
      let reason = "";

      if (score < 50) {
        level = "Weak";
        priority = "High";
        reason = `Scored ${score}% in ${tb.competencyName}. Critical competency gap requiring immediate review.`;
      } else if (score < 80) {
        level = "Moderate";
        priority = "Medium";
        reason = `Scored ${score}% in ${tb.competencyName}. Foundational understanding exists; recommended targeted exercises to reach mastery.`;
      } else {
        level = "Strong";
        priority = "Low";
        reason = `Scored ${score}% in ${tb.competencyName}. High proficiency demonstrated.`;
      }

      // 1. Update or Insert Skill Gap in this.data.skillGaps
      const existingGap = this.data.skillGaps.find(g => g.studentId === studentId && g.competencyId === compId);
      if (existingGap) {
        existingGap.score = score;
        existingGap.level = level;
        existingGap.priority = priority;
        existingGap.reason = reason;
        existingGap.updatedAt = new Date().toISOString();
      } else {
        this.data.skillGaps.push({
          id: `gap-${Math.random().toString(36).substr(2, 9)}`,
          studentId,
          competencyId: compId,
          competencyName: tb.competencyName,
          domainId,
          score,
          level,
          priority,
          reason,
          updatedAt: new Date().toISOString()
        });
      }

      // 2. Add Recommendations for Weak/Moderate competencies directly to this.data.recommendations
      if (level === "Weak" || level === "Moderate") {
        const matchingResources = this.data.learningResources.filter(r => r.competencyId === compId);
        matchingResources.forEach(res => {
          const alreadyRecommended = this.data.recommendations.some(r => r.studentId === studentId && r.resourceId === res.id);
          if (!alreadyRecommended) {
            this.data.recommendations.push({
              id: `rec-${Math.random().toString(36).substr(2, 9)}`,
              studentId,
              competencyId: compId,
              competencyName: tb.competencyName,
              resourceId: res.id,
              customTitle: res.title,
              customDescription: res.description,
              customUrl: res.url,
              reason: `Targeted to overcome your ${level.toLowerCase()} competency gap (${score}%) in ${tb.competencyName}.`,
              priority,
              createdAt: new Date().toISOString(),
              completed: false
            });
          }
        });
      }
    });

    this.save();
  }

  // ==================== SKILL GAPS & RECOMMENDATIONS ====================

  public getSkillGaps(studentId: string): SkillGap[] {
    return this.data.skillGaps.filter(g => g.studentId === studentId);
  }

  public getRecommendations(studentId: string): Recommendation[] {
    return this.data.recommendations.filter(r => r.studentId === studentId);
  }

  public getStudentAnalysis(): Array<any> {
    const students = this.data.users.filter(u => u.role === "student");
    return students.map(student => {
      const attempts = (this.data.assessmentResults || []).filter(r => r.studentId === student.id);
      const skillGaps = this.getSkillGaps(student.id);
      const recommendations = this.getRecommendations(student.id);

      const totalAttempts = attempts.length;
      const avgScore = totalAttempts > 0 
        ? Math.round(attempts.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / totalAttempts) 
        : 0;

      const weakGaps = skillGaps.filter(g => g.level === "Weak");
      const strongGaps = skillGaps.filter(g => g.level === "Strong");

      return {
        studentId: student.id,
        name: student.name,
        email: student.email,
        enrolledCoursesCount: student.enrolledCourseIds?.length || 0,
        attendedAssessmentsCount: totalAttempts,
        averageScore: avgScore,
        weakCompetenciesCount: weakGaps.length,
        strongCompetenciesCount: strongGaps.length,
        pendingRecommendationsCount: recommendations.filter(r => !r.completed).length,
        recentAttempts: attempts.slice(0, 5).map(a => ({
          assessmentId: a.assessmentId,
          score: a.overallScore,
          completedAt: a.completedAt
        }))
      };
    });
  }

  public resetStudentAssessments(studentId: string): boolean {
    this.data.assessmentResults = (this.data.assessmentResults || []).filter(r => r.studentId !== studentId);
    this.data.assessments = (this.data.assessments || []).filter(a => a.studentId !== studentId);
    this.data.skillGaps = (this.data.skillGaps || []).filter(g => g.studentId !== studentId);
    this.save();
    return true;
  }

  public completeRecommendation(recommendationId: string): boolean {
    const rec = this.data.recommendations.find(r => r.id === recommendationId);
    if (rec) {
      rec.completed = true;
      this.save();
      return true;
    }
    return false;
  }

  // ==================== MATERIALS & QUIZZES ====================

  public addMaterial(studentId: string, fileName: string, fileType: string, content: string): Material {
    const newMaterial: Material = {
      id: `mat-${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      fileName,
      fileType,
      content,
      processingStatus: "completed",
      createdAt: new Date().toISOString()
    };
    this.data.materials.push(newMaterial);
    this.save();
    return newMaterial;
  }

  public getMaterials(studentId: string): Material[] {
    return this.data.materials.filter(m => m.studentId === studentId);
  }

  public getMaterial(id: string): Material | undefined {
    return this.data.materials.find(m => m.id === id);
  }

  public createQuiz(studentId: string, materialId: string | undefined, title: string, questions: QuizQuestion[]): Quiz {
    const quizId = `quiz-${Math.random().toString(36).substr(2, 9)}`;
    const questionsWithIds = questions.map((q, idx) => ({
      ...q,
      id: `quiz-q-${quizId}-${idx}`,
      quizId
    }));

    const newQuiz: Quiz = {
      id: quizId,
      studentId,
      materialId,
      title,
      status: "completed",
      createdAt: new Date().toISOString(),
      questions: questionsWithIds
    };

    this.data.quizzes.push(newQuiz);
    this.save();
    return newQuiz;
  }

  public getQuizzes(studentId: string): Quiz[] {
    return this.data.quizzes.filter(q => q.studentId === studentId);
  }

  public getQuiz(id: string): Quiz | undefined {
    return this.data.quizzes.find(q => q.id === id);
  }

  public submitQuizAttempt(quizId: string, studentId: string, studentAnswers: Record<string, string>): QuizAttempt {
    const quiz = this.getQuiz(quizId);
    if (!quiz) throw new Error("Quiz not found");

    let correctCount = 0;
    quiz.questions.forEach(q => {
      const studentAns = (studentAnswers[q.id] || "").trim().toLowerCase();
      const correctAns = (q.correctAnswer || "").trim().toLowerCase();
      if (studentAns.length > 0 && studentAns === correctAns) {
        correctCount++;
      }
    });

    const score = quiz.questions.length > 0 ? Math.round((correctCount / quiz.questions.length) * 100) : 0;
    const attempt: QuizAttempt = {
      id: `attempt-${Math.random().toString(36).substr(2, 9)}`,
      quizId,
      studentId,
      score,
      answers: studentAnswers,
      startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      completedAt: new Date().toISOString()
    };

    this.data.quizAttempts.push(attempt);
    this.save();
    return attempt;
  }

  // ==================== PROGRESS & ACADEMIC REPORTS ====================

  public getProgressSummary(studentId: string): ProgressSummary {
    const gaps = this.getSkillGaps(studentId);
    const attempts = this.data.assessments.filter(a => a.studentId === studentId && a.status === "completed");
    const quizList = this.data.quizAttempts.filter(qa => qa.studentId === studentId);
    const recs = this.getRecommendations(studentId);

    const topicScores = gaps.map(g => ({
      competencyId: g.competencyId,
      competencyName: g.competencyName,
      score: g.score,
      level: g.level
    }));

    const avgCompetency = topicScores.length > 0
      ? Math.round(topicScores.reduce((acc, curr) => acc + curr.score, 0) / topicScores.length)
      : (attempts.length > 0 ? Math.round(attempts.reduce((a, b) => a + (b.score || 0), 0) / attempts.length) : 0);

    const assessmentHistory = attempts.map(att => {
      const domain = this.getDomainById(att.domainId);
      return {
        id: att.id,
        domainName: att.title || domain?.name || "Skill Evaluation",
        score: att.score || 0,
        date: att.submittedAt || att.startedAt
      };
    }).reverse();

    const quizHistory = quizList.map(qa => {
      const q = this.getQuiz(qa.quizId);
      return {
        id: qa.id,
        quizTitle: q?.title || "Quiz Evaluation",
        score: qa.score,
        date: qa.completedAt
      };
    }).reverse();

    return {
      overallCompetency: avgCompetency,
      topicScores,
      assessmentHistory,
      quizHistory,
      streakDays: attempts.length > 0 ? Math.min(attempts.length + 1, 7) : 0,
      completedResourcesCount: recs.filter(r => r.completed).length
    };
  }

  // User-wise Assessment Reports for Admin & Teachers
  public getStudentAssessmentReports(): StudentAssessmentReport[] {
    const students = this.data.users.filter(u => u.role === "student");
    return students.map(student => {
      const studentAssessments = this.data.assessments.filter(a => a.studentId === student.id && a.status === "completed");
      const avg = studentAssessments.length > 0
        ? Math.round(studentAssessments.reduce((acc, curr) => acc + (curr.score || 0), 0) / studentAssessments.length)
        : 0;

      const gaps = this.getSkillGaps(student.id);
      const weakCount = gaps.filter(g => g.level === "Weak").length;
      const strongCount = gaps.filter(g => g.level === "Strong").length;

      const attempts = studentAssessments.map(a => {
        const result = this.data.assessmentResults.find(ar => ar.assessmentId === a.id);
        return {
          assessment: a,
          result
        };
      }).reverse();

      return {
        student: { ...student, passwordHash: undefined },
        assessmentCount: studentAssessments.length,
        averageScore: avg,
        lastAssessmentDate: studentAssessments[studentAssessments.length - 1]?.submittedAt,
        weakTopicsCount: weakCount,
        strongTopicsCount: strongCount,
        attempts
      };
    });
  }

  public getSingleStudentReport(studentId: string): StudentAssessmentReport | null {
    const student = this.getUserById(studentId);
    if (!student) return null;

    const studentAssessments = this.data.assessments.filter(a => a.studentId === student.id && a.status === "completed");
    const avg = studentAssessments.length > 0
      ? Math.round(studentAssessments.reduce((acc, curr) => acc + (curr.score || 0), 0) / studentAssessments.length)
      : 0;

    const gaps = this.getSkillGaps(student.id);
    const weakCount = gaps.filter(g => g.level === "Weak").length;
    const strongCount = gaps.filter(g => g.level === "Strong").length;

    const attempts = studentAssessments.map(a => {
      const result = this.data.assessmentResults.find(ar => ar.assessmentId === a.id);
      return {
        assessment: a,
        result
      };
    }).reverse();

    return {
      student: { ...student, passwordHash: undefined },
      assessmentCount: studentAssessments.length,
      averageScore: avg,
      lastAssessmentDate: studentAssessments[studentAssessments.length - 1]?.submittedAt,
      weakTopicsCount: weakCount,
      strongTopicsCount: strongCount,
      attempts
    };
  }

  // ==================== LOGS & TELEMETRY ====================

  public addAIGenerationLog(log: Omit<AIGenerationLog, "id" | "createdAt">) {
    this.data.aiGenerationLogs.push({
      ...log,
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    });
    // Keep max 200 logs
    if (this.data.aiGenerationLogs.length > 200) {
      this.data.aiGenerationLogs.shift();
    }
    this.save();
  }

  public getAIGenerationLogs(): AIGenerationLog[] {
    return [...this.data.aiGenerationLogs].reverse();
  }

  // ==================== AI TUTOR CONVERSATIONS ====================

  public getAITutorConversations(studentId: string): AITutorConversation[] {
    return this.data.aiTutorConversations.filter(c => c.studentId === studentId);
  }

  public getAITutorConversation(id: string): AITutorConversation | undefined {
    return this.data.aiTutorConversations.find(c => c.id === id);
  }

  public createAITutorConversation(studentId: string, title: string, domainId?: string, competencyId?: string): AITutorConversation {
    const newConv: AITutorConversation = {
      id: `conv-${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      domainId,
      competencyId,
      title,
      createdAt: new Date().toISOString(),
      messages: []
    };
    this.data.aiTutorConversations.push(newConv);
    this.save();
    return newConv;
  }

  public addAITutorMessage(conversationId: string, role: 'user' | 'model', content: string): AITutorConversation | undefined {
    const conv = this.getAITutorConversation(conversationId);
    if (conv) {
      conv.messages.push({
        id: `msg-${Math.random().toString(36).substr(2, 9)}`,
        conversationId,
        role,
        content,
        timestamp: new Date().toISOString()
      });
      this.save();
    }
    return conv;
  }
}

export const db = new Database();
