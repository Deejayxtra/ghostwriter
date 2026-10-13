const LENGTH_HINT = {
  short: "about 150 words",
  medium: "about 400 words",
  long: "about 800 words",
};

export function buildPrompt({ contentType, topic, purpose, audience, tone, length }) {
  return [
    `Write a ${contentType} about: ${topic}.`,
    `Purpose: ${purpose}.`,
    `Target audience: ${audience}.`,
    `Tone: ${tone}.`,
    `Length: ${LENGTH_HINT[length] ?? length}.`,
    `Return only the finished ${contentType} — no preamble, no explanations.`,
  ].join("\n");
}
