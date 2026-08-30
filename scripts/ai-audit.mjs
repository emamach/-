import fs from "fs";
import path from "path";
import process from "process";

const ROOT = process.cwd();

const ALLOWED_EXTENSIONS = new Set([
  ".html",
  ".htm",
  ".js",
  ".mjs",
  ".cjs",
  ".css",
  ".json",
  ".md",
  ".txt",
  ".xml",
  ".svg"
]);

const IGNORED_DIRS = new Set([
  ".git",
  ".github",
  "node_modules",
  ".netlify",
  "dist",
  "build",
  "coverage",
  "vendor"
]);

const MAX_FILE_SIZE = 250_000;
const MAX_TOTAL_CHARS = 180_000;

function walk(dir) {
  const results = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        results.push(...walk(fullPath));
      }
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) continue;

    try {
      const stat = fs.statSync(fullPath);

      if (stat.size > MAX_FILE_SIZE) {
        continue;
      }

      results.push(fullPath);
    } catch {
      // تجاهل الملفات التي لا يمكن قراءتها
    }
  }

  return results;
}

function readProject() {
  const files = walk(ROOT);
  let totalChars = 0;
  const output = [];

  for (const file of files) {
    const relative = path.relative(ROOT, file);

    if (relative === "scripts/ai-audit.mjs") {
      continue;
    }

    let content;

    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }

    if (!content.trim()) continue;

    const remaining = MAX_TOTAL_CHARS - totalChars;

    if (remaining <= 0) break;

    const clipped = content.slice(0, remaining);

    output.push(
      `\n===== FILE: ${relative} =====\n${clipped}\n===== END FILE =====\n`
    );

    totalChars += clipped.length;
  }

  return output.join("\n");
}

async function callOpenAI(projectCode) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY غير موجود في Netlify Environment Variables."
    );
  }

  const prompt = `
أنت مهندس برمجيات خبير في تدقيق وإصلاح تطبيقات الويب.

هذا مشروع متجر ويب عربي باسم "دجاج اليمامة".

أريد منك إجراء تدقيق هندسي شامل للكود المرفق.

لا تعدّل الملفات الآن.
لا تخترع ملفات غير موجودة.
لا تفترض وجود React أو Node إذا لم يكن موجودًا.

افحص بالتحديد:

1. أخطاء JavaScript.
2. أخطاء HTML.
3. أخطاء CSS.
4. الأزرار التي ليس لها وظائف صحيحة.
5. مشاكل onclick وevent listeners.
6. مشاكل التنقل بين الصفحات.
7. مشكلة زر شراء.
8. سبب ظهور الصفحات بدون التنسيق أو الألوان.
9. مسارات CSS وJavaScript والصور.
10. localStorage وsessionStorage.
11. بيانات المنتجات.
12. نظام الطلب.
13. صفحات:
   index.html
   admin.html
   camera.html
   chat.html
   order.html
   preview.html
   tracking.html
14. manifest.json.
15. التوافق مع GitHub Pages وNetlify.
16. أخطاء المسارات النسبية.
17. مشاكل تحميل الملفات.
18. أخطاء قد تظهر في Console.
19. مشاكل التصميم على الهاتف.
20. مشاكل البنية العامة للمشروع.
21. أي كود مكرر أو متعارض.
22. أي وظائف تعتمد على ملفات غير موجودة.
23. أي روابط أو أزرار تشير إلى صفحات غير موجودة.
24. أي أخطاء أمنية واضحة، خصوصًا كشف مفاتيح API.

أريد النتيجة بصيغة منظمة:

# التقرير العام

## الأخطاء الحرجة
رقم + الملف + المشكلة + السبب + الحل المقترح.

## أخطاء JavaScript

## أخطاء HTML

## أخطاء CSS

## مشاكل التنقل

## مشاكل زر شراء

## مشاكل الصفحات

## مشاكل الهاتف

## مشاكل البنية

## مشاكل الأمان

## الملفات التي تحتاج تعديل

ثم في النهاية:

# خطة الإصلاح

رتب الإصلاحات من الأخطر إلى الأقل خطورة.

مهم جدًا:
لا تقل إن الكود صحيح لمجرد عدم وجود الخطأ بشكل واضح.
إذا كانت هناك مشكلة محتملة، اذكرها على أنها "تحتاج اختبار".

الكود:
${projectCode}
`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-5.6-luna",
      input: prompt,
      max_output_tokens: 12000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI API Error ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();

  if (data.output_text) {
    return data.output_text;
  }

  const text = [];

  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text") {
        text.push(content.text);
      }
    }
  }

  return text.join("\n");
}

async function main() {
  console.log("==========================================");
  console.log(" دجاج اليمامة - AI CODE AUDITOR");
  console.log("==========================================");

  console.log("\n[1/3] قراءة ملفات المشروع...");

  const projectCode = readProject();

  if (!projectCode.trim()) {
    throw new Error("لم يتم العثور على ملفات قابلة للفحص.");
  }

  console.log(
    `[OK] تم تجهيز ${projectCode.length.toLocaleString()} حرف من الكود.`
  );

  console.log("\n[2/3] إرسال المشروع إلى OpenAI...");
  console.log("يرجى الانتظار...");

  const report = await callOpenAI(projectCode);

  console.log("\n[3/3] نتيجة الفحص:");
  console.log("\n");
  console.log(report);

  console.log("\n==========================================");
  console.log("انتهى الفحص.");
  console.log("==========================================");
}

main().catch((error) => {
  console.error("\n❌ فشل AI Auditor:");
  console.error(error.message);
  process.exit(1);
});
