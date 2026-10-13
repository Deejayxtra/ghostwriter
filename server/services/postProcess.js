export function processOutput(raw, contentType) {
  if (!raw || raw.trim().length < 20) {
    throw Object.assign(new Error("Generated content was too short."), { status: 502 });
  }

  // Strip common markdown fences if the model wraps output
  let text = raw.replace(/^```[\w]*\n?|```$/gm, "").trim();

  const warnings = [];
  if (contentType === "email" && !/^subject:/im.test(text)) {
    warnings.push("No subject line detected.");
  }
  if (contentType === "blog" && !/^#|\n#/.test(text)) {
    warnings.push("No headings detected.");
  }

  return { text, warnings };
}
