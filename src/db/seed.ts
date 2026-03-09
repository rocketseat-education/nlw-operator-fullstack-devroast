import { faker } from "@faker-js/faker";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { analysisItems, roasts } from "./schema";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const db = drizzle(databaseUrl, { casing: "snake_case" });

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "go",
  "rust",
  "ruby",
  "php",
  "c",
  "csharp",
  "swift",
  "kotlin",
  "sql",
  "html",
  "css",
] as const;

const CODE_SNIPPETS: Record<string, string[]> = {
  javascript: [
    `eval(prompt("enter code"))
document.write(response)
// trust the user lol`,
    `if (x == true) { return true; }
else if (x == false) { return false; }
else { return !false; }`,
    `var total = 0;
for (var i = 0; i < items.length; i++) {
  total = total + items[i].price;
}
return total;`,
    `function sleep(ms) {
  var start = new Date().getTime();
  while (new Date().getTime() < start + ms);
}`,
    `try {
  doSomething();
} catch (e) {
  // TODO: handle error
}`,
    `const arr = [1,2,3,4,5];
const result = [];
for (let i = 0; i < arr.length; i++) {
  if (arr[i] > 2) {
    result.push(arr[i] * 2);
  }
}`,
    `document.getElementById("btn").onclick = function() {
  document.getElementById("output").innerHTML = document.getElementById("input").value;
}`,
    `async function getData() {
  const res = await fetch("/api/data");
  const json = await res.json();
  return json;
}`,
  ],
  typescript: [
    `const data: any = fetchData();
const result: any = processData(data);
console.log(result as any);`,
    `interface User {
  name: string;
  age: number;
  email: string;
}

function getUser(id: number): Promise<User> {
  return fetch(\`/api/users/\${id}\`).then(r => r.json());
}`,
    `type Status = "active" | "inactive" | "pending";

function updateStatus(userId: string, status: Status): void {
  // @ts-ignore
  db.users.update({ status }, { where: { id: userId } });
}`,
    `export function calculateDiscount(price: number, discount: number) {
  if (discount < 0 || discount > 100) return price;
  return price - (price * discount) / 100;
}`,
  ],
  python: [
    `import os
os.system("rm -rf /")  # clean up temp files`,
    `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)`,
    `result = []
for i in range(len(data)):
    for j in range(len(data[i])):
        if data[i][j] > threshold:
            result.append(data[i][j])`,
    `try:
    value = int(input("Enter a number: "))
    print(10 / value)
except:
    pass`,
    `class User:
    def __init__(self, name, email, age):
        self.name = name
        self.email = email
        self.age = age

    def __str__(self):
        return f"{self.name} ({self.email})"`,
  ],
  java: [
    `public static void sort(int[] arr) {
    for (int i = 0; i < arr.length; i++) {
        for (int j = 0; j < arr.length - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
    `public String reverseString(String s) {
    String result = "";
    for (int i = s.length() - 1; i >= 0; i--) {
        result += s.charAt(i);
    }
    return result;
}`,
    `Map<String, Object> config = new HashMap<>();
config.put("host", "localhost");
config.put("port", 3306);
config.put("password", "admin123");`,
  ],
  go: [
    `func handler(w http.ResponseWriter, r *http.Request) {
    body, _ := io.ReadAll(r.Body)
    var data map[string]interface{}
    json.Unmarshal(body, &data)
    fmt.Fprintf(w, "ok")
}`,
    `func sum(numbers []int) int {
    total := 0
    for _, n := range numbers {
        total += n
    }
    return total
}`,
  ],
  rust: [
    `fn main() {
    let mut v: Vec<i32> = Vec::new();
    for i in 0..100 {
        v.push(i);
    }
    println!("{:?}", v);
}`,
    `fn divide(a: f64, b: f64) -> f64 {
    a / b // panics on b = 0
}`,
  ],
  ruby: [
    `def process_data(data)
  result = []
  data.each do |item|
    result << item.transform if item.valid?
  end
  result
end`,
  ],
  php: [
    `<?php
$conn = mysqli_connect("localhost", "root", "", "mydb");
$name = $_GET['name'];
$result = mysqli_query($conn, "SELECT * FROM users WHERE name = '$name'");
?>`,
    `<?php
function factorial($n) {
    if ($n <= 1) return 1;
    return $n * factorial($n - 1);
}
echo factorial(10);
?>`,
  ],
  c: [
    `#include <stdio.h>
int main() {
    char buffer[10];
    gets(buffer);
    printf("%s\\n", buffer);
    return 0;
}`,
    `void swap(int *a, int *b) {
    *a = *a ^ *b;
    *b = *a ^ *b;
    *a = *a ^ *b;
}`,
  ],
  csharp: [
    `public async Task<List<User>> GetUsers()
{
    var users = await _context.Users
        .Include(u => u.Orders)
        .ThenInclude(o => o.Items)
        .ToListAsync();
    return users;
}`,
  ],
  swift: [
    `func fetchData(completion: @escaping (Result<[Item], Error>) -> Void) {
    URLSession.shared.dataTask(with: url) { data, _, error in
        guard let data = data else { return }
        let items = try? JSONDecoder().decode([Item].self, from: data)
        completion(.success(items ?? []))
    }.resume()
}`,
  ],
  kotlin: [
    `fun processItems(items: List<Item>): List<Result> {
    return items
        .filter { it.isValid }
        .map { it.transform() }
        .sortedBy { it.priority }
}`,
  ],
  sql: [
    `SELECT * FROM users WHERE name LIKE '%' + @search + '%'
ORDER BY created_at DESC
-- TODO: add pagination`,
    `SELECT u.*, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id
HAVING COUNT(o.id) > 5`,
  ],
  html: [
    `<div onclick="handleClick()" style="color: red; font-size: 14px; margin: 10px; padding: 5px;">
  <font size="3"><b>Click me!</b></font>
  <marquee>Welcome to my website!</marquee>
</div>`,
  ],
  css: [
    `.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}`,
    `* {
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
}`,
  ],
};

const ROAST_QUOTES = [
  "this code looks like it was written during a power outage... in 2005.",
  "I've seen better code generated by a cat walking on a keyboard.",
  "did you write this with your eyes closed or was that intentional?",
  "this code is a monument to human perseverance in the face of logic.",
  "somewhere, a computer science professor just felt a chill down their spine.",
  "this is what happens when you copy from Stack Overflow with your eyes closed.",
  "I'd roast this code, but it already burned itself.",
  "this code doesn't just have bugs, it's a whole ecosystem.",
  "congratulations, you've invented a new kind of technical debt.",
  "even the compiler feels sorry for you.",
  "not bad! but also not good. it's in that painful middle ground.",
  "this code works the way a broken clock tells time — occasionally correct.",
  "I've reviewed worse, but I had to think really hard to remember when.",
  "at least you used semicolons. that's... something.",
  "the variable naming convention here is 'random keyboard smash', right?",
  "this code has more red flags than a communist parade.",
  "clean, readable, well-structured. just kidding.",
  "this is actually... decent? I'm suspicious.",
  "solid fundamentals here. someone actually paid attention in class.",
  "wait, this is genuinely good code. are you sure you wrote this?",
  "impressive. clean, idiomatic, and well-thought-out. rare find.",
  "this code sparks joy. Marie Kondo would approve.",
  "I came here to roast, but this code roasted my expectations instead.",
  "professionally written. this is what production code should look like.",
  "this function is tighter than my deadline. well done.",
  "honestly, this is better than most code I review professionally.",
];

const ANALYSIS_TITLES = {
  critical: [
    "SQL injection vulnerability",
    "using eval() on user input",
    "hardcoded credentials",
    "buffer overflow risk",
    "no input validation",
    "unsafe deserialization",
    "race condition detected",
    "memory leak potential",
    "unhandled promise rejection",
    "using deprecated API",
    "no error handling",
    "infinite loop risk",
    "XSS vulnerability",
    "insecure random generation",
  ],
  warning: [
    "using var instead of const/let",
    "imperative loop pattern",
    "magic numbers without constants",
    "deeply nested conditionals",
    "function too long",
    "missing type annotations",
    "callback hell detected",
    "redundant type assertion",
    "unnecessary any type",
    "console.log left in code",
    "no early return pattern",
    "mutation of function parameters",
    "string concatenation in loop",
    "missing null check",
  ],
  good: [
    "clear naming conventions",
    "single responsibility principle",
    "proper error handling",
    "good use of destructuring",
    "consistent code style",
    "effective use of generics",
    "clean function composition",
    "proper use of async/await",
    "well-structured data flow",
    "good separation of concerns",
    "idiomatic language usage",
    "efficient algorithm choice",
  ],
};

const ANALYSIS_DESCRIPTIONS = {
  critical: [
    "this is a security vulnerability that could allow attackers to execute arbitrary code or access sensitive data.",
    "this pattern is dangerous in production and should be refactored immediately before deployment.",
    "this could lead to data loss or corruption under concurrent access patterns.",
    "this exposes the application to well-known attack vectors. fix this before shipping.",
    "this will crash in production under edge cases. add proper validation and error handling.",
  ],
  warning: [
    "not a dealbreaker, but this pattern makes the code harder to maintain and reason about.",
    "consider refactoring to a more idiomatic approach for better readability.",
    "this works, but there's a cleaner way to express the same logic.",
    "this could become a problem as the codebase grows. address it sooner rather than later.",
    "modern language features offer better alternatives. consider updating this pattern.",
  ],
  good: [
    "this is well-written and follows established best practices. keep it up.",
    "clean, readable, and maintainable. this is how it should be done.",
    "this shows a solid understanding of the language and its idioms.",
    "good choice here. this makes the code easier to test and extend.",
    "this pattern makes the intent clear and the code self-documenting.",
  ],
};

function getVerdict(score: number) {
  if (score <= 2) return "needs_serious_help" as const;
  if (score <= 4) return "rough_around_edges" as const;
  if (score <= 6) return "decent_code" as const;
  if (score <= 8) return "solid_work" as const;
  return "exceptional" as const;
}

function getCodeForLanguage(language: string): string {
  const snippets = CODE_SNIPPETS[language];
  if (snippets && snippets.length > 0) {
    return faker.helpers.arrayElement(snippets);
  }

  return faker.helpers.arrayElement(Object.values(CODE_SNIPPETS).flat());
}

function generateAnalysisItems(score: number) {
  const itemCount = faker.number.int({ min: 2, max: 6 });
  const items: {
    severity: "critical" | "warning" | "good";
    title: string;
    description: string;
    order: number;
  }[] = [];

  for (let i = 0; i < itemCount; i++) {
    let severity: "critical" | "warning" | "good";

    if (score <= 3) {
      severity = faker.helpers.weightedArrayElement([
        { value: "critical" as const, weight: 5 },
        { value: "warning" as const, weight: 3 },
        { value: "good" as const, weight: 1 },
      ]);
    } else if (score <= 6) {
      severity = faker.helpers.weightedArrayElement([
        { value: "critical" as const, weight: 1 },
        { value: "warning" as const, weight: 5 },
        { value: "good" as const, weight: 3 },
      ]);
    } else {
      severity = faker.helpers.weightedArrayElement([
        { value: "warning" as const, weight: 2 },
        { value: "good" as const, weight: 6 },
      ]);
    }

    items.push({
      severity,
      title: faker.helpers.arrayElement(ANALYSIS_TITLES[severity]),
      description: faker.helpers.arrayElement(ANALYSIS_DESCRIPTIONS[severity]),
      order: i,
    });
  }

  return items;
}

async function seed() {
  console.log("Cleaning existing data...");
  await db.delete(analysisItems);
  await db.delete(roasts);

  console.log("Seeding database with 100 roasts...");

  // Weight scores toward lower values for a more interesting leaderboard
  const scores = Array.from({ length: 100 }, () => {
    const raw = faker.helpers.weightedArrayElement([
      { value: faker.number.float({ min: 0.5, max: 2.5 }), weight: 3 },
      { value: faker.number.float({ min: 2.5, max: 5.0 }), weight: 4 },
      { value: faker.number.float({ min: 5.0, max: 7.5 }), weight: 2 },
      { value: faker.number.float({ min: 7.5, max: 10.0 }), weight: 1 },
    ]);
    return Math.round(raw * 10) / 10;
  });

  let totalItems = 0;

  for (const score of scores) {
    const language = faker.helpers.arrayElement(LANGUAGES);
    const code = getCodeForLanguage(language);
    const lineCount = code.split("\n").length;
    const verdict = getVerdict(score);
    const roastMode = faker.datatype.boolean({ probability: 0.6 });
    const roastQuote = roastMode
      ? faker.helpers.arrayElement(ROAST_QUOTES)
      : null;
    const suggestedFix = faker.datatype.boolean({ probability: 0.7 })
      ? `// improved version\n${code.replace(/var /g, "const ").replace(/== /g, "=== ")}`
      : null;

    const [roast] = await db
      .insert(roasts)
      .values({
        code,
        language,
        lineCount,
        roastMode,
        score,
        verdict,
        roastQuote,
        suggestedFix,
        createdAt: faker.date.recent({ days: 30 }),
      })
      .returning({ id: roasts.id });

    const items = generateAnalysisItems(score);
    totalItems += items.length;

    await db.insert(analysisItems).values(
      items.map((item) => ({
        roastId: roast.id,
        severity: item.severity,
        title: item.title,
        description: item.description,
        order: item.order,
      })),
    );
  }

  console.log(`Seeded 100 roasts with ${totalItems} analysis items.`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
