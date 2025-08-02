# LLM Output Format Guide

This document defines the required output format for all LLM responses in this project.

## ✅ General Principles

- Use **clear headings** (H2 `##`, H3 `###`) to structure answers logically
- Prefer **bullet points**, **tables**, and **code blocks** for clarity
- Use **concise explanations**, followed by examples when needed
- Format consistently and avoid long unstructured paragraphs

---

## 🧱 Structure Template

### 📌 Summary

- A quick answer or definition
- Highlight key ideas in 1–3 lines

### ✅ Detailed Explanation (if applicable)

Use bullet points or short paragraphs:
- What it is
- Why it matters
- Common use cases or risks

### 🔧 Example (Code)

Use fenced code blocks with the correct language label:

\`\`\`ts
const result = formatDate(new Date(), 'dd. MMMM yyyy', 'de');
\`\`\`

Explain what the code does, if not obvious.

### 📊 Comparison Tables (Optional)

| Feature      | Option A | Option B |
|--------------|----------|----------|
| Speed        | Fast     | Moderate |
| Accuracy     | High     | Medium   |

### 🔍 Notes and Caveats

- Mention any assumptions or limitations
- Include "Gotchas" that might confuse users

---

## 💬 Language Style

- Use neutral, professional tone
- Use emojis sparingly for sections (like ✅ or 📌) if allowed
- Use second person ("you") where it makes sense
- Avoid unnecessary filler like "Sure!" or "Of course!"

---

## 🧪 Output Example

> **Prompt:** Format the date `2025-08-01` in German locale using full month name

### 📌 Answer

```ts
const result = formatDate(new Date('2025-08-01'), 'dd. MMMM yyyy', 'de');
console.log(result); // "01. August 2025"
