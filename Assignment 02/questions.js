/**
 * Question Bank for the Interactive Quiz Application
 * Contains diverse, high-quality questions across multiple domains
 */
const QUESTION_BANK = [
  {
    id: 1,
    category: "Web Development",
    difficulty: "Medium",
    question: "Which CSS pseudo-class matches an element if any of its descendants match the given selector?",
    options: [
      { id: "A", text: ":is()" },
      { id: "B", text: ":has()" },
      { id: "C", text: ":where()" },
      { id: "D", text: ":focus-within" }
    ],
    correctAnswer: "B",
    explanation: "The ':has()' pseudo-class represents an element if any relative selector passed as an argument matches at least one element. It is often referred to as the 'parent selector'."
  },
  {
    id: 2,
    category: "JavaScript",
    difficulty: "Easy",
    question: "What is the result of `typeof NaN` in JavaScript?",
    options: [
      { id: "A", text: "'undefined'" },
      { id: "B", text: "'number'" },
      { id: "C", text: "'nan'" },
      { id: "D", text: "'object'" }
    ],
    correctAnswer: "B",
    explanation: "In JavaScript, NaN stands for 'Not-a-Number', but its data type is actually a primitive 'number' representing an invalid mathematical operation result."
  },
  {
    id: 3,
    category: "Web Architecture",
    difficulty: "Medium",
    question: "What does the 'S' in HTTPS signify, and what protocol provides it?",
    options: [
      { id: "A", text: "Speed (HTTP/2 Multiplexing)" },
      { id: "B", text: "Secure (TLS/SSL Encryption)" },
      { id: "C", text: "Standard (W3C Validation)" },
      { id: "D", text: "Socket (WebSocket Protocol)" }
    ],
    correctAnswer: "B",
    explanation: "HTTPS stands for Hypertext Transfer Protocol Secure. The communication protocol is encrypted using Transport Layer Security (TLS) or formerly Secure Sockets Layer (SSL)."
  },
  {
    id: 4,
    category: "HTML5 & Standards",
    difficulty: "Easy",
    question: "Which HTML5 element should be used to define standalone self-contained content such as a blog post or news story?",
    options: [
      { id: "A", text: "<section>" },
      { id: "B", text: "<article>" },
      { id: "C", text: "<aside>" },
      { id: "D", text: "<main>" }
    ],
    correctAnswer: "B",
    explanation: "The '<article>' HTML element represents a complete, self-contained composition in a document, page, application, or site, which is independently distributable or reusable."
  },
  {
    id: 5,
    category: "Computer Science",
    difficulty: "Hard",
    question: "What is the average time complexity of searching an element in a balanced Binary Search Tree (AVL or Red-Black)?",
    options: [
      { id: "A", text: "O(1)" },
      { id: "B", text: "O(n)" },
      { id: "C", text: "O(log n)" },
      { id: "D", text: "O(n log n)" }
    ],
    correctAnswer: "C",
    explanation: "In a balanced binary search tree, the height is guaranteed to be O(log n), making lookup, insertion, and deletion all run in logarithmic time O(log n)."
  },
  {
    id: 6,
    category: "JavaScript",
    difficulty: "Medium",
    question: "What will `[1, 2, 3] + [4, 5, 6]` evaluate to in JavaScript?",
    options: [
      { id: "A", text: "[1, 2, 3, 4, 5, 6]" },
      { id: "B", text: "'1,2,34,5,6'" },
      { id: "C", text: "NaN" },
      { id: "D", text: "TypeError" }
    ],
    correctAnswer: "B",
    explanation: "The '+' operator converts both arrays to primitive strings ('1,2,3' and '4,5,6') and concatenates them into '1,2,34,5,6'."
  },
  {
    id: 7,
    category: "Cloud & DevOps",
    difficulty: "Easy",
    question: "Which HTTP status code is returned when a requested resource is permanently moved to a new URL?",
    options: [
      { id: "A", text: "301 Moved Permanently" },
      { id: "B", text: "302 Found (Temporary)" },
      { id: "C", text: "404 Not Found" },
      { id: "D", text: "410 Gone" }
    ],
    correctAnswer: "A",
    explanation: "HTTP 301 Moved Permanently tells clients and search engine crawlers that the resource now resides permanently at the URI indicated in the Location header."
  },
  {
    id: 8,
    category: "CSS",
    difficulty: "Medium",
    question: "In CSS Grid, which property is a shorthand for defining both grid-template-rows and grid-template-columns?",
    options: [
      { id: "A", text: "grid-area" },
      { id: "B", text: "grid-template" },
      { id: "C", text: "grid-auto-flow" },
      { id: "D", text: "grid-placement" }
    ],
    correctAnswer: "B",
    explanation: "The 'grid-template' CSS property is a shorthand for setting 'grid-template-rows', 'grid-template-columns', and 'grid-template-areas' in a single declaration."
  },
  {
    id: 9,
    category: "Cybersecurity",
    difficulty: "Hard",
    question: "Which web vulnerability occurs when an attacker tricks an authenticated user's browser into executing unwanted actions on another trusted site?",
    options: [
      { id: "A", text: "Cross-Site Scripting (XSS)" },
      { id: "B", text: "Cross-Site Request Forgery (CSRF)" },
      { id: "C", text: "SQL Injection (SQLi)" },
      { id: "D", text: "Server-Side Request Forgery (SSRF)" }
    ],
    correctAnswer: "B",
    explanation: "CSRF exploits the trust a web application has in the victim user's browser by causing unauthorized commands to be transmitted with the user's valid session cookies."
  },
  {
    id: 10,
    category: "Web APIs",
    difficulty: "Medium",
    question: "Which modern Web API allows web apps to detect when an element enters or exits the browser's viewport without polling scroll events?",
    options: [
      { id: "A", text: "ResizeObserver" },
      { id: "B", text: "IntersectionObserver" },
      { id: "C", text: "MutationObserver" },
      { id: "D", text: "PerformanceObserver" }
    ],
    correctAnswer: "B",
    explanation: "IntersectionObserver asynchronously observes changes in the intersection of a target element with an ancestor element or top-level document viewport, ideal for lazy loading."
  },
  {
    id: 11,
    category: "Git & Version Control",
    difficulty: "Easy",
    question: "What Git command creates a new branch and immediately switches your working directory to it?",
    options: [
      { id: "A", text: "git checkout -b <branch-name>" },
      { id: "B", text: "git branch -m <branch-name>" },
      { id: "C", text: "git merge <branch-name>" },
      { id: "D", text: "git pull -c <branch-name>" }
    ],
    correctAnswer: "A",
    explanation: "'git checkout -b <name>' (or modern 'git switch -c <name>') creates the specified branch and switches HEAD to it in one command."
  },
  {
    id: 12,
    category: "Performance",
    difficulty: "Medium",
    question: "Which Core Web Vital measures the visual stability of a webpage and prevents unexpected content jumping?",
    options: [
      { id: "A", text: "Largest Contentful Paint (LCP)" },
      { id: "B", text: "Interaction to Next Paint (INP)" },
      { id: "C", text: "Cumulative Layout Shift (CLS)" },
      { id: "D", text: "First Input Delay (FID)" }
    ],
    correctAnswer: "C",
    explanation: "Cumulative Layout Shift (CLS) measures the sum total of all individual layout shift scores for every unexpected layout shift that occurs during the lifespan of a page."
  }
];
