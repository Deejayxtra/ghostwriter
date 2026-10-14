export function processOutput(raw, contentType) {
  const warnings = [];
  let text = (raw ?? "").trim();

  if (!text) {
    warnings.push("Model returned empty output.");
    return { text, warnings };
  }

  if (contentType === "email" && !/^subject:/im.test(text)) {
    warnings.push("Email is missing a 'Subject:' line.");
  }

  if (contentType === "blog" && !/^#\s/m.test(text)) {
    warnings.push("Blog post is missing a top-level title (H1).");
  }

  if (contentType === "social" && !/#\w/.test(text)) {
    warnings.push("Social post has no hashtags.");
  }

  return { text, warnings };
}
