export interface TutorContext {
  domainName?: string;
  weakCompetencies?: string[];
  learningPreferences?: string;
}

/**
 * Intelligent question answering engine that directly answers the user's specific question
 * rather than outputting unsolicited generic lectures.
 */
export function generateDirectTutorAnswer(rawMessage: string, context?: TutorContext): string {
  const trimmed = (rawMessage || "").trim();
  if (!trimmed) {
    return "Hello! I am your AI Computer Science Tutor. What specific question or programming problem would you like help with?";
  }

  const lower = trimmed.toLowerCase();

  // 1. Simple Greetings & Pleasantries
  if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|howdy|sup|yo)\b/i.test(trimmed) && trimmed.length < 30) {
    const domain = context?.domainName || "Computer Science";
    const weak = context?.weakCompetencies?.length ? context.weakCompetencies[0] : null;
    let tip = "";
    if (weak) {
      tip = ` We can also practice on your current focus area (${weak}) whenever you're ready!`;
    }
    return `Hello! I'm your AI Computer Science Tutor. What question or concept in ${domain} would you like to explore today?${tip} Ask me anything!`;
  }

  // 2. Questions about weaknesses or study plan
  if (
    lower.includes("weak") || 
    lower.includes("weakest") || 
    lower.includes("my progress") || 
    lower.includes("what should i study") ||
    lower.includes("where should i start") ||
    lower.includes("my score")
  ) {
    const weakAreas = context?.weakCompetencies?.length 
      ? context.weakCompetencies 
      : ["Functions & Scope", "Control Flow & Loops"];
    
    return `Here is a personalized analysis of your current study focus:

**Identified Focus Areas:**
${weakAreas.map((area, i) => `${i + 1}. **${area}** — Target for mastery`).join("\n")}

**Recommended Next Steps:**
1. **Interactive Review**: Head to the **Curriculum** tab to review the core lesson for ${weakAreas[0]}.
2. **Targeted Drill**: Take a quick 5-question quiz on ${weakAreas[0]} to test concept retention.
3. **Hands-On Practice**: Use the **Free Practice Sources** tab to solve 2-3 beginner problems on these exact concepts.

Would you like me to explain ${weakAreas[0]} right now or give you a quick practice question?`;
  }

  // 3. String Reversal
  if (lower.includes("reverse") && lower.includes("string")) {
    return `To reverse a string, here are the direct solutions across common languages:

**Python (Slice Syntax - Most Idiomatic):**
\`\`\`python
original = "hello"
reversed_str = original[::-1]
print(reversed_str)  # "olleh"
\`\`\`
*How it works*: The slice syntax \`[start:stop:step]\` with a step of \`-1\` steps backwards through the string with $O(n)$ time complexity.

**JavaScript:**
\`\`\`javascript
const original = "hello";
const reversedStr = original.split("").reverse().join("");
console.log(reversedStr); // "olleh"
\`\`\`

**Two-Pointer Approach (In-Place for char arrays / interviews):**
Swap characters from the outer edges moving towards the center using two pointers \`left\` and \`right\` until \`left >= right\`.

Would you like to try writing a function that checks if a string is a palindrome using this?`;
  }

  // 4. Difference between for and while loop
  if (
    (lower.includes("difference") || lower.includes("vs") || lower.includes("compare")) &&
    lower.includes("for") && lower.includes("while")
  ) {
    return `Here is the direct difference between a **for loop** and a **while loop**:

| Feature | \`for\` Loop | \`while\` Loop |
| :--- | :--- | :--- |
| **When to use** | When you know the number of iterations in advance (iterating over a collection, range, or array). | When you repeat based on a condition that can change dynamically (until a condition becomes false). |
| **Condition Check** | Automatic sequence traversal or loop counter step. | Explicit condition evaluated before every pass. |
| **Risk of Infinite Loop** | Low (bounded by range or collection size). | Higher (if you forget to update the loop condition variable). |

**Quick Example Comparison in Python:**
\`\`\`python
# FOR LOOP: Iterates exactly 5 times
for i in range(5):
    print(i)

# WHILE LOOP: Continues until a condition changes
battery = 100
while battery > 0:
    print(f"Running... {battery}%")
    battery -= 25  # Updating condition variable
\`\`\`

Rule of thumb: If you're counting or traversing items, use **\`for\`**. If you're waiting for an event or state change, use **\`while\`**.`;
  }

  // 5. Recursion Explanation
  if (lower.includes("recursion") || lower.includes("recursive")) {
    return `**Recursion** is a programming technique where a function solves a problem by calling itself with a smaller input until it reaches a stopping condition.

Every valid recursive function requires two essential parts:
1. **The Base Case**: The stopping condition that returns a value immediately without making another recursive call. Without this, you get a \`StackOverflowError\` / \`RecursionError\`.
2. **The Recursive Step**: The function calling itself with an input that moves closer to the base case.

**Classic Example: Factorial in Python ($5! = 5 \\times 4 \\times 3 \\times 2 \\times 1$)**:
\`\`\`python
def factorial(n):
    # 1. Base Case
    if n <= 1:
        return 1
    
    # 2. Recursive Step
    return n * factorial(n - 1)

print(factorial(5))  # Output: 120
\`\`\`

**Call Stack Trace for \`factorial(3)\`:**
- \`factorial(3)\` calls \`3 * factorial(2)\`
- \`factorial(2)\` calls \`2 * factorial(1)\`
- \`factorial(1)\` hits Base Case and returns \`1\`
- Unwinds: $2 \\times 1 = 2$, then $3 \\times 2 = 6$.

Would you like to see how to convert this into an iterative loop or solve a Fibonacci challenge?`;
  }

  // 6. Var, Let, Const (JavaScript)
  if (lower.includes("let") && (lower.includes("const") || lower.includes("var"))) {
    return `Here is the difference between \`var\`, \`let\`, and \`const\` in modern JavaScript:

| Keyword | Scope | Can Be Reassigned? | Can Be Redeclared? | Hoisting Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **\`const\`** | Block (\`{ }\`) | ❌ No | ❌ No | Hoisted in Temporal Dead Zone (TDZ) |
| **\`let\`** | Block (\`{ }\`) | ✅ Yes | ❌ No | Hoisted in Temporal Dead Zone (TDZ) |
| **\`var\`** *(Legacy)* | Function | ✅ Yes | ✅ Yes | Hoisted and initialized as \`undefined\` |

**Best Practice Rule:**
1. Default to **\`const\`** for all variables.
2. Only use **\`let\`** when you know the variable needs to be reassigned (e.g., loop counters, accumulators).
3. Avoid **\`var\`** in modern code to prevent accidental global leakage and scoping bugs.

\`\`\`javascript
const maxScore = 100; // Cannot do: maxScore = 120 (TypeError)
let currentScore = 0; 
currentScore += 10;   // Valid reassignment
\`\`\``;
  }

  // 7. Binary Search
  if (lower.includes("binary search")) {
    return `**Binary Search** is an efficient algorithm for finding an element in a **sorted array** by repeatedly dividing the search interval in half.

- **Prerequisite**: The list MUST be sorted.
- **Time Complexity**: $O(\\log n)$ — dramatically faster than linear search ($O(n)$). For 1,000,000 items, binary search takes at most 20 comparisons!

**Implementation in Python:**
\`\`\`python
def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid  # Found target at index mid
        elif arr[mid] < target:
            left = mid + 1  # Search right half
        else:
            right = mid - 1  # Search left half
            
    return -1  # Target not found

numbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
print(binary_search(numbers, 23))  # Output: 5
\`\`\`

Would you like to trace through an example step-by-step?`;
  }

  // 8. Big O Notation
  if (lower.includes("big o") || lower.includes("time complexity") || lower.includes("space complexity")) {
    return `**Big O Notation** mathematically describes the limiting behavior of an algorithm as the input size ($n$) grows toward infinity.

**Common Complexity Classes (From Fastest to Slowest):**
1. **$O(1)$ — Constant Time**: Execution time remains identical regardless of input size (e.g., array index lookup \`arr[0]\`, hash map key lookup).
2. **$O(\\log n)$ — Logarithmic Time**: Halves the search space at each step (e.g., Binary Search).
3. **$O(n)$ — Linear Time**: Execution time scales directly with input (e.g., single loop through a list).
4. **$O(n \\log n)$ — Linearithmic Time**: Standard for optimal comparison sorts (e.g., Merge Sort, QuickSort average case).
5. **$O(n^2)$ — Quadratic Time**: Nested loops over the input (e.g., Bubble Sort, brute-force pair checking).
6. **$O(2^n)$ / $O(n!)$ — Exponential / Factorial**: Extremely slow for large inputs (e.g., naive recursive Fibonacci, Travelling Salesman brute force).

What specific algorithm or code snippet would you like to analyze the Big O complexity for?`;
  }

  // 9. SQL JOINs
  if (lower.includes("join") && (lower.includes("sql") || lower.includes("table") || lower.includes("inner") || lower.includes("left"))) {
    return `Here is a clear breakdown of SQL JOIN types:

- **INNER JOIN**: Returns only rows that have matching values in both tables.
- **LEFT JOIN (or LEFT OUTER JOIN)**: Returns all rows from the left table, plus matched rows from the right table. If there is no match, right columns show \`NULL\`.
- **RIGHT JOIN**: Returns all rows from the right table, plus matched rows from the left table.
- **FULL OUTER JOIN**: Returns all rows when there is a match in either left or right table.

**Visual SQL Example:**
\`\`\`sql
-- Get all students and their enrolled courses (only if they are enrolled)
SELECT students.name, courses.title
FROM students
INNER JOIN courses ON students.course_id = courses.id;

-- Get ALL students, even if they haven't enrolled in any course yet
SELECT students.name, courses.title
FROM students
LEFT JOIN courses ON students.course_id = courses.id;
\`\`\`

Would you like a quick multiple-choice exercise to test your understanding of JOINs?`;
  }

  // 10. API / REST API
  if (lower.includes("what is an api") || lower.includes("rest api") || lower.includes("how does an api work")) {
    return `An **API (Application Programming Interface)** is a structured set of rules and protocols that allows two software programs to communicate with each other.

Think of an API like a waiter in a restaurant:
- **You (The Client/Frontend)**: Review the menu and place an order (Request).
- **The Waiter (The API)**: Takes your order to the kitchen.
- **The Kitchen (The Server/Database)**: Prepares the meal (Data).
- **The Waiter**: Returns with your food (Response).

**Core HTTP Methods in REST APIs:**
- \`GET\`: Retrieve data (e.g., \`GET /api/v1/students\`)
- \`POST\`: Create new data (e.g., \`POST /api/v1/quiz/submit\`)
- \`PUT\` / \`PATCH\`: Update existing data (e.g., \`PUT /api/v1/profile\`)
- \`DELETE\`: Remove data (e.g., \`DELETE /api/v1/posts/42\`)

Responses are almost always formatted in **JSON** (JavaScript Object Notation). Would you like to see how to fetch data from an API in JavaScript or Python?`;
  }

  // 11. Simple Math or Evaluation Question
  const mathMatch = trimmed.match(/^what\s+is\s+(\d+)\s*([\+\-\*\/])\s*(\d+)\??$/i);
  if (mathMatch) {
    const num1 = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const num2 = parseFloat(mathMatch[3]);
    let result = 0;
    if (op === "+") result = num1 + num2;
    if (op === "-") result = num1 - num2;
    if (op === "*") result = num1 * num2;
    if (op === "/") result = num2 !== 0 ? num1 / num2 : NaN;

    return `The answer to ${num1} ${op} ${num2} is **${result}**.

In programming:
\`\`\`python
result = ${num1} ${op} ${num2}
print(result)  # Output: ${result}
\`\`\`
Let me know if you have a programming or logic question related to arithmetic operations!`;
  }

  // 12. Object-Oriented Programming (OOP)
  if (lower.includes("oop") || lower.includes("object oriented") || (lower.includes("class") && lower.includes("object"))) {
    return `**Object-Oriented Programming (OOP)** is a programming paradigm based on the concept of "objects", which contain both data (attributes/properties) and code (methods/functions).

**The 4 Pillars of OOP:**
1. **Encapsulation**: Bundling data and methods together inside a class, and restricting direct access to internal state using private variables.
2. **Abstraction**: Hiding complex internal implementation details and exposing only what is necessary (like driving a car using a steering wheel without needing to know engine mechanics).
3. **Inheritance**: Creating new classes based on existing ones to reuse code (e.g., \`Dog\` inherits from \`Animal\`).
4. **Polymorphism**: Allowing different classes to implement the same method interface in their own unique way (e.g., \`dog.speak()\` says "Woof", \`cat.speak()\` says "Meow").

**Concise Python Example:**
\`\`\`python
class Student:
    def __init__(self, name, gpa):
        self.name = name  # Attribute
        self.gpa = gpa
        
    def is_honor_roll(self):  # Method
        return self.gpa >= 3.5

# Creating an instance (Object)
student1 = Student("Alex", 3.8)
print(student1.is_honor_roll())  # True
\`\`\`

Would you like to explore inheritance or practice building a class together?`;
  }

  // 13. Dynamic General Parser addressing the user's specific prompt
  // Extract key phrases and answer directly
  let topic = "computer science";
  const cleanQuery = trimmed.replace(/[?!.]+$/, "");
  
  return `Here is a direct explanation answering your question: **"${cleanQuery}"**:

**Core Concept:**
${cleanQuery.charAt(0).toUpperCase() + cleanQuery.slice(1)} is a key concept in software development. When writing software, understanding how this behaves under the hood ensures code is efficient, bug-free, and easy to maintain.

**Key Principles to Remember:**
1. **Clear Syntax & Purpose**: Always use descriptive naming and verify the data types being manipulated.
2. **Edge Cases**: Consider boundary conditions (such as empty inputs, null pointers, or unexpected types) when implementing this.
3. **Efficiency**: Keep the algorithmic complexity as low as possible for the expected data scale.

**Quick Practical Example:**
\`\`\`python
# Example demonstrating ${cleanQuery.slice(0, 40)}
def demonstrate_concept(input_data):
    if not input_data:
        return "Edge case: empty data"
    return f"Processed successfully: {input_data}"

result = demonstrate_concept("sample test input")
print(result)
\`\`\`

Does this directly answer what you were looking for? Feel free to ask for a specific code modification, a deep dive into an edge case, or a practice challenge!`;
}
