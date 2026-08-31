import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const ALLOWED_EXTENSIONS = new Set([
  ".html",
  ".htm",
  ".js",
  ".mjs",
  ".cjs",
  ".css",
  ".json",
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

const MAX_FILE_SIZE = 250000;
const MAX_TOTAL_CHARS = 180000;

function walk(dir) {
  const results = [];

  for (const entry of fs.readdirSync(dir, {
    withFileTypes: true
  })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        results.push(...walk(fullPath));
      }
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      continue;
    }

    try {
      const stat = fs.statSync(fullPath);

      if (stat.size <= MAX_FILE_SIZE) {
        results.push(fullPath);
      }
    } catch {}
  }

  return results;
}

function readProject() {
  const files = walk(ROOT);
  const output = [];
  let totalChars = 0;

  for (const file of files) {
    const relative = path.relative(ROOT, file);

    if (relative === "scripts/ai-audit.mjs") {
      continue;
    }

    try {
      const content = fs.readFileSync(file, "utf8");

      if (!content.trim()) {
        continue;
      }

      const remaining = MAX_TOTAL_CHARS - totalChars;

      if (remaining <= 0) {
        break;
      }

      const clipped = content.slice(0, remaining);

      output.push(
        `\n===== FILE: ${relative} =====\n` +
        clipped +
        `\n===== END FILE =====\n`
      );

      totalChars += clipped.length;
    } catch {}
  }

  return output.join("\n");
}

async function askAI(projectCode) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY غير موجود في Netlify."
    );
  }

  const prompt = `
أنت مهندس برمجيات خبير.

افحص مشروع "دجاج اليمامة" التالي فحصًا هندسيًا شاملًا.

لا تعدل أي ملف.
لا تعيد بناء المشروع.
لا تحذف أي وظيفة.

افحص:

- JavaScript
- HTML
- CSS
- الأزرار
- onclick
- event listeners
- التنقل بين الصفحات
- زر شراء
- صفحة الطلب
- سبب فقدان الألوان والتنسيق
- مسارات CSS
- مسارات JavaScript
- مسارات الصور
- localStorage
- المنتجات
- الطلبات
- admin.html
- camera.html
- chat.html
- order.html
- preview.html
- tracking.html
- index.html
- manifest.json
- مجلد js
- مجلد css
- مجلد assets
- GitHub Pages
- Netlify
- أخطاء Console المحتملة
- الملفات المفقودة
- الروابط الخاطئة
- مشاكل الهاتف
- مشاكل البنية
- المشاكل الأمنية

أعطني تقريرًا واضحًا:

# الحالة العامة

# الأخطاء الحرجة

# أخطاء JavaScript

# أخطاء HTML

# أخطاء CSS

# مشاكل الأزرار

# مشكلة زر شراء

# مشاكل الصفحات

# مشاكل الألوان والتنسيق

# مشاكل الهاتف

# مشاكل Netlify

# مشاكل GitHub Pages

# مشاكل الأمان

# الملفات التي تحتاج إصلاح

# خطة الإصلاح

لكل مشكلة اذكر:
الملف + المشكلة + السبب + الحل المقترح.

إذا لم تكن متأكدًا من شيء قل:
"تحتاج إلى اختبار".

ملفات المشروع:

${projectCode}
`;

  const response = await fetch(
    "https://api.gmi-serving.com/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },

      body: JSON.stringify({
        model: "openai/gpt-5.6",

        messages: [
          {
            role: "system",
            content:
              "You are a senior web software engineer and code auditor."
          },
          {
            role: "user",
            content: prompt
          }
        ],

        temperature: 0,
        max_tokens: 12000
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `GMI Cloud API ${response.status}: ${error}`
    );
  }

  const data = await response.json();

  const result =
    data?.choices?.[0]?.message?.content;

  if (!result) {
    throw new Error(
      "لم تصل نتيجة من GMI Cloud."
    );
  }

  return result;
}

async function main() {
  console.log("");
  console.log("================================");
  console.log(" دجاج اليمامة - AI CODE AUDITOR");
  console.log("================================");

  console.log("[1/3] قراءة المشروع...");

  const projectCode = readProject();

  if (!projectCode) {
    throw new Error(
      "لم يتم العثور على ملفات المشروع."
    );
  }

  console.log(
    `[OK] تم تجهيز ${projectCode.length} حرف.`
  );

  console.log("[2/3] إرسال الكود إلى GMI Cloud...");
  console.log("Model: openai/gpt-5.6");

  const report = await askAI(projectCode);

  console.log("[3/3] تقرير الذكاء الاصطناعي:");
  console.log("");
  console.log(report);

  console.log("");
  console.log("================================");
  console.log("انتهى الفحص بنجاح.");
  console.log("================================");
}

main().catch((error) => {
  console.error("");
  console.error("❌ فشل الفحص:");
  console.error(error.message);

  process.exit(1);
});
