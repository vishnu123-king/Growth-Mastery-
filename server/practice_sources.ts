import { FreePracticeSource } from "../src/types";

export const DEFAULT_PRACTICE_SOURCES: FreePracticeSource[] = [
  // --- Algorithms & Data Structures ---
  {
    id: "src-leetcode-free",
    name: "LeetCode Free Problem Set",
    category: "Algorithms & Data Structures",
    provider: "LeetCode",
    description: "Access over 2,000 free algorithmic coding problems categorized by data structures (Arrays, Linked Lists, Trees, Graphs, Dynamic Programming) with an interactive online compiler and automated test suites.",
    url: "https://leetcode.com/problemset/all/",
    difficulty: "All Levels",
    cost: "100% Free Tier",
    features: [
      "In-browser multi-language IDE",
      "Automated test runner with edge cases",
      "Global discussion solutions",
      "Runtime & memory percentile benchmarks"
    ],
    recommendedTopics: ["Arrays", "Two Pointers", "Binary Search", "Trees", "Dynamic Programming"],
    badge: "Most Popular",
    interactive: true,
    requiresAccount: false
  },
  {
    id: "src-neetcode",
    name: "NeetCode Practice Roadmap",
    category: "Algorithms & Data Structures",
    provider: "NeetCode",
    description: "A structured, curated roadmap of the most important LeetCode-style algorithm problems grouped by pattern, accompanied by free video walkthroughs and clean Python/C++/Java solutions.",
    url: "https://neetcode.io/practice",
    difficulty: "Beginner to Advanced",
    cost: "100% Free",
    features: [
      "Visual pattern dependency roadmap",
      "Free step-by-step video solutions",
      "Code template sandbox",
      "Interactive progress checkmarks"
    ],
    recommendedTopics: ["Sliding Window", "Graph Traversals", "Backtracking", "Heaps", "Intervals"],
    badge: "Curated Roadmap",
    interactive: true,
    requiresAccount: false
  },
  {
    id: "src-hackerrank",
    name: "HackerRank Practice Domains",
    category: "Algorithms & Data Structures",
    provider: "HackerRank",
    description: "Sharpen programming skills through domain-specific practice tracks including Problem Solving, Python, C++, Java, and Data Structures with structured scoring and skill badges.",
    url: "https://www.hackerrank.com/domains",
    difficulty: "All Levels",
    cost: "100% Free",
    features: [
      "Domain skill badges and certificates",
      "Automated hidden test case evaluation",
      "Leaderboards & community forums",
      "Step-by-step problem difficulty progression"
    ],
    recommendedTopics: ["Recursion", "Sorting", "Greedy Algorithms", "Bit Manipulation"],
    badge: "Skill Badges",
    interactive: true,
    requiresAccount: true
  },
  {
    id: "src-codewars",
    name: "Codewars Kata Sandbox",
    category: "Algorithms & Data Structures",
    provider: "Codewars",
    description: "Level up your coding skills through martial-arts styled martial-rank challenges called 'kata'. Solve real problem units with automated TDD test harnesses and compare your code with community refactorings.",
    url: "https://www.codewars.com",
    difficulty: "All Levels",
    cost: "100% Free & Open",
    features: [
      "Test-Driven Development (TDD) environment",
      "Peer code review after passing",
      "50+ programming languages supported",
      "Kyū ranking progression ladder"
    ],
    recommendedTopics: ["String Parsing", "Higher-Order Functions", "Object Manipulation", "Refactoring"],
    badge: "TDD Practice",
    interactive: true,
    requiresAccount: true
  },
  {
    id: "src-project-euler",
    name: "Project Euler",
    category: "Algorithms & Data Structures",
    provider: "Project Euler Community",
    description: "A legendary collection of challenging mathematical and computer programming problems designed to push your mathematical intuition and algorithmic efficiency to their limits.",
    url: "https://projecteuler.net",
    difficulty: "Intermediate to Advanced",
    cost: "100% Free",
    features: [
      "Deep mathematical problem formulations",
      "Language-agnostic challenges",
      "Private discussion forum unlocked per solved problem",
      "Focus on O(1) and logarithmic time efficiency"
    ],
    recommendedTopics: ["Number Theory", "Combinatorics", "Prime Factorization", "Dynamic Math Optimization"],
    badge: "Math & Logic",
    interactive: false,
    requiresAccount: true
  },
  {
    id: "src-geeksforgeeks-practice",
    name: "GeeksforGeeks Practice Portal",
    category: "Algorithms & Data Structures",
    provider: "GeeksforGeeks",
    description: "Extensive archive of topic-wise practice problems, company interview questions (FAANG/MNCs), and editorial explanations with online compiler support.",
    url: "https://www.geeksforgeeks.org/practice/",
    difficulty: "Beginner to Advanced",
    cost: "100% Free Access",
    features: [
      "Company-wise problem tags",
      "Detailed editorial explanations",
      "Code snippet run in 10+ languages",
      "Topic-wise difficulty filters"
    ],
    recommendedTopics: ["Linked Lists", "Stacks & Queues", "Binary Trees", "Graphs"],
    badge: "Interview Archive",
    interactive: true,
    requiresAccount: false
  },

  // --- Web Development ---
  {
    id: "src-freecodecamp",
    name: "freeCodeCamp Curriculum",
    category: "Web Development",
    provider: "freeCodeCamp.org",
    description: "World-renowned 100% free non-profit platform offering thousands of interactive coding challenges and verified certifications in Responsive Web Design, JavaScript Algorithms, and Front End Libraries.",
    url: "https://www.freecodecamp.org/learn",
    difficulty: "Beginner Friendly",
    cost: "100% Free Non-Profit",
    features: [
      "Zero installation browser IDE",
      "Real-time visual preview frame",
      "Official free industry certifications",
      "Active global community discord"
    ],
    recommendedTopics: ["HTML5 & Semantic Markup", "CSS Flexbox & Grid", "DOM Manipulation", "JavaScript ES6+"],
    badge: "Verified Certifications",
    interactive: true,
    requiresAccount: false
  },
  {
    id: "src-the-odin-project",
    name: "The Odin Project",
    category: "Web Development",
    provider: "The Odin Project",
    description: "An open-source, hands-on curriculum that teaches modern full-stack web development from scratch using real local developer tooling (Git, VS Code, Node.js, React).",
    url: "https://www.theodinproject.com",
    difficulty: "Beginner to Intermediate",
    cost: "100% Free & Open Source",
    features: [
      "Teaches real local developer workflows",
      "Portfolio project-based milestones",
      "Curated industry best practices",
      "Thriving Discord mentorship community"
    ],
    recommendedTopics: ["Git Version Control", "Node.js Backends", "React Components", "RESTful Routing"],
    badge: "Portfolio Projects",
    interactive: false,
    requiresAccount: false
  },
  {
    id: "src-frontend-mentor",
    name: "Frontend Mentor Challenges",
    category: "Web Development",
    provider: "Frontend Mentor",
    description: "Improve your front-end coding skills by building realistic, production-ready website user interfaces based on professional Figma design specifications.",
    url: "https://www.frontendmentor.io/challenges",
    difficulty: "All Levels",
    cost: "Free Community Tier",
    features: [
      "Professional UI design assets provided",
      "Automated screenshot diff comparison",
      "Real-world HTML/CSS/JS practice",
      "Community peer code reviews"
    ],
    recommendedTopics: ["Responsive Layouts", "Accessibility (a11y)", "Tailwind / CSS Modules", "Stateful UI"],
    badge: "Real-world UI Designs",
    interactive: false,
    requiresAccount: true
  },
  {
    id: "src-css-battle",
    name: "CSS Battle",
    category: "Web Development",
    provider: "CSSBattle.dev",
    description: "A fun, competitive visual CSS code-golfing game. Write HTML & CSS to visually duplicate 100+ target shapes and designs with the fewest possible characters and pixel precision.",
    url: "https://cssbattle.dev",
    difficulty: "All Levels",
    cost: "100% Free",
    features: [
      "Instant visual side-by-side diff slider",
      "Character count optimization metrics",
      "Daily target challenges",
      "Global developer leaderboards"
    ],
    recommendedTopics: ["CSS Positioning", "Borders & Radii", "CSS Gradients", "Box Shadows & Transforms"],
    badge: "Interactive Game",
    interactive: true,
    requiresAccount: false
  },

  // --- Python & Scripting ---
  {
    id: "src-exercism-python",
    name: "Exercism Python Track",
    category: "Python & Scripting",
    provider: "Exercism Foundation",
    description: "100% free, open-source programming practice with 140+ carefully crafted Python exercises, automated CLI or browser test suites, and free human mentor code reviews.",
    url: "https://exercism.org/tracks/python",
    difficulty: "Beginner to Intermediate",
    cost: "100% Free Open Source",
    features: [
      "Automated Unit Tests for every exercise",
      "Free volunteer mentor code feedback",
      "Browser IDE or CLI sync with your local machine",
      "Concept syllabus learning tree"
    ],
    recommendedTopics: ["List Comprehensions", "Generators & Iterators", "Decorators", "Classes & Dunder Methods"],
    badge: "Free Mentor Reviews",
    interactive: true,
    requiresAccount: true
  },
  {
    id: "src-futurecoder",
    name: "FutureCoder Python Course",
    category: "Python & Scripting",
    provider: "futurecoder.io",
    description: "A 100% free, open-source interactive course that teaches Python from zero to mastery. Features an integrated live debugger, visual execution frame, and intelligent hints.",
    url: "https://futurecoder.io",
    difficulty: "Beginner Friendly",
    cost: "100% Free & Open Source",
    features: [
      "Integrated Python visualizer",
      "Step-by-step code execution tracing",
      "Zero account required to start coding",
      "Helpful semantic error explainers"
    ],
    recommendedTopics: ["Variables", "Nested Loops", "Functions & Scope", "Dictionaries & Sets"],
    badge: "Interactive Visualizer",
    interactive: true,
    requiresAccount: false
  },
  {
    id: "src-python-principles",
    name: "Python Principles Practice",
    category: "Python & Scripting",
    provider: "Python Principles",
    description: "Master foundational Python programming through bite-sized, interactive coding challenges that run directly in your browser with immediate feedback.",
    url: "https://pythonprinciples.com/challenges/",
    difficulty: "Beginner Friendly",
    cost: "100% Free Challenges",
    features: [
      "Bite-sized problem descriptions",
      "Automated verification engine",
      "No setup or libraries required",
      "Clear explanation tips"
    ],
    recommendedTopics: ["Conditionals", "Type Conversion", "String Indexing", "Lists"],
    badge: "Bite-Sized Challenges",
    interactive: true,
    requiresAccount: false
  },

  // --- Databases & SQL ---
  {
    id: "src-sqlbolt",
    name: "SQLBolt Interactive Lessons",
    category: "Databases & SQL",
    provider: "SQLBolt",
    description: "A series of interactive lessons and exercises designed to quickly teach you SQL right inside your browser with a live SQL query engine and immediate table results.",
    url: "https://sqlbolt.com",
    difficulty: "Beginner Friendly",
    cost: "100% Free",
    features: [
      "Live interactive SQLite query execution",
      "Table dataset visualizer",
      "Immediate query validation feedback",
      "Clean step-by-step explanations"
    ],
    recommendedTopics: ["SELECT Queries", "WHERE Constraints", "JOINs (INNER, LEFT, FULL)", "Aggregates (COUNT, SUM)"],
    badge: "Hands-on SQL",
    interactive: true,
    requiresAccount: false
  },
  {
    id: "src-sqlzoo",
    name: "SQLZoo Practice Sandboxes",
    category: "Databases & SQL",
    provider: "SQLZoo",
    description: "Comprehensive interactive SQL tutorial and challenge platform with real database sandboxes covering everything from foundational SELECT queries to complex nested subqueries and window functions.",
    url: "https://sqlzoo.net",
    difficulty: "All Levels",
    cost: "100% Free",
    features: [
      "Real SQL sandbox execution",
      "Interactive assessment quizzes",
      "Multi-table relationship datasets",
      "Complex nested subqueries support"
    ],
    recommendedTopics: ["Subqueries", "GROUP BY & HAVING", "Self JOINs", "Window Functions (RANK, PARTITION)"],
    badge: "Comprehensive SQL",
    interactive: true,
    requiresAccount: false
  },
  {
    id: "src-select-star-sql",
    name: "Select Star SQL",
    category: "Databases & SQL",
    provider: "Select Star SQL",
    description: "An interactive book that teaches SQL using a real-world dataset (Texas Death Row executions). Focuses on practical data analysis and analytical query craftsmanship.",
    url: "https://selectstarsql.com",
    difficulty: "Beginner to Intermediate",
    cost: "100% Free & Open",
    features: [
      "Authentic real-world dataset",
      "Data analysis perspective",
      "Interactive query playground",
      "Explanatory problem framing"
    ],
    recommendedTopics: ["Data Exploration", "Complex Aggregations", "Conditional Aggregation", "Subquery Joins"],
    badge: "Real Dataset",
    interactive: true,
    requiresAccount: false
  },

  // --- CS Fundamentals & System Design ---
  {
    id: "src-cs50-harvard",
    name: "CS50x Problem Sets & Sandbox",
    category: "System Design & CS Fundamentals",
    provider: "Harvard University",
    description: "Harvard University's legendary introduction to computer science. Practice solving rigorous problem sets in C, Python, SQL, and Web Development using Harvard's cloud VS Code sandbox.",
    url: "https://cs50.harvard.edu/x/",
    difficulty: "Beginner to Advanced",
    cost: "100% Free OpenCourseWare",
    features: [
      "Rigorous university-level problem sets",
      "Custom automated testing suite (check50)",
      "Style evaluation tool (style50)",
      "Free online CS50 Codespace cloud sandbox"
    ],
    recommendedTopics: ["Memory Management & Pointers", "Data Structures (Tries, Hash Tables)", "Algorithms", "Web Architecture"],
    badge: "Harvard Curriculum",
    interactive: true,
    requiresAccount: false
  },
  {
    id: "src-system-design-primer",
    name: "System Design Primer Exercises",
    category: "System Design & CS Fundamentals",
    provider: "Donne Martin / Open Source",
    description: "Massive open-source interactive GitHub resource for learning how to design large-scale systems. Includes step-by-step interview exercises, architecture blueprints, and Anki flashcards.",
    url: "https://github.com/donnemartin/system-design-primer",
    difficulty: "Intermediate to Advanced",
    cost: "100% Free & Open Source",
    features: [
      "Complete visual system architecture diagrams",
      "Step-by-step solution blueprints",
      "Interview question design walkthroughs",
      "Scalability & caching design patterns"
    ],
    recommendedTopics: ["Horizontal Scaling", "Load Balancing", "Database Sharding & Replication", "Caching (Redis/Memcached)", "Message Queues"],
    badge: "Architecture Masterclass",
    interactive: false,
    requiresAccount: false
  },
  {
    id: "src-cryptopals",
    name: "Cryptopals Crypto Challenges",
    category: "System Design & CS Fundamentals",
    provider: "Cryptopals Team",
    description: "A famous series of practical programming exercises that teach real-world cryptography by writing code to implement ciphers and execute real cryptographic attacks.",
    url: "https://cryptopals.com",
    difficulty: "Intermediate to Advanced",
    cost: "100% Free",
    features: [
      "Hands-on vulnerability exploitation",
      "Language-agnostic implementation",
      "Progressive 8-set challenge path",
      "Practical applied security engineering"
    ],
    recommendedTopics: ["XOR Ciphers", "Block Cipher Modes (AES-ECB, CBC)", "Hash Collisions", "Public Key Crypto (RSA, Diffie-Hellman)"],
    badge: "Security & Crypto",
    interactive: false,
    requiresAccount: false
  }
];

class PracticeSourcesStore {
  private sources: FreePracticeSource[] = [...DEFAULT_PRACTICE_SOURCES];

  public getAll(filters?: {
    category?: string;
    search?: string;
    difficulty?: string;
  }): FreePracticeSource[] {
    let result = [...this.sources];

    if (filters?.category && filters.category !== "All") {
      result = result.filter(s => s.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters?.difficulty && filters.difficulty !== "All") {
      result = result.filter(s => s.difficulty.toLowerCase() === filters.difficulty!.toLowerCase());
    }

    if (filters?.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q) ||
        s.recommendedTopics.some(t => t.toLowerCase().includes(q)) ||
        s.category.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public getById(id: string): FreePracticeSource | undefined {
    return this.sources.find(s => s.id === id);
  }

  public getCategories(): Array<{ name: string; count: number }> {
    const counts: Record<string, number> = {};
    for (const s of this.sources) {
      counts[s.category] = (counts[s.category] || 0) + 1;
    }
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }

  public addSource(source: Omit<FreePracticeSource, "id">): FreePracticeSource {
    const newSource: FreePracticeSource = {
      ...source,
      id: `src-custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    };
    this.sources.unshift(newSource);
    return newSource;
  }

  public deleteSource(id: string): boolean {
    const initialLen = this.sources.length;
    this.sources = this.sources.filter(s => s.id !== id);
    return this.sources.length < initialLen;
  }
}

export const practiceSourcesStore = new PracticeSourcesStore();
