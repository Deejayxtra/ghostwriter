const LENGTH_HINT = {
  short: "about 150 words",
  medium: "about 400 words",
  long: "about 800 words",
};

function blogPrompt(d) {
  return [
    `Write a blog post about: ${d.topic}.`,
    `Target audience: ${d.audience}.`,
    `Length: approximately ${d.wordCount} words.`,
    `Tone: ${d.tone}.`,
    `Expertise level: ${d.expertiseLevel}.`,
    d.seoFocus ? `SEO focus keywords: ${d.seoFocus}.` : "",
    "",
    "Structure the post with these sections, using markdown headings:",
    "1. A compelling title (H1)",
    "2. An engaging introduction",
    "3. Body with 2-4 sub-sections (H2)",
    "4. A conclusion with a takeaway",
    "",
    "Return only the finished blog post — no preamble, no explanations.",
  ].filter(Boolean).join("\n");
}

function emailPrompt(d) {
  return [
    `Write an email.`,
    `Purpose: ${d.purpose}.`,
    `Recipient context: ${d.recipientContext}.`,
    `Key points to cover: ${d.keyPoints}.`,
    `Tone: ${d.tone}.`,
    `Urgency: ${d.urgency}.`,
    d.cta ? `Call to action: ${d.cta}.` : "",
    "",
    "Return the output in this exact format:",
    "Subject: <subject line>",
    "",
    "<email body>",
    "",
    "No markdown, no code fences, no extra commentary.",
  ].filter(Boolean).join("\n");
}

function storyPrompt(d) {
  return [
    `Write a short story.`,
    `Genre: ${d.genre}.`,
    `Characters: ${d.characters}.`,
    `Setting: ${d.setting}.`,
    `Length: ${LENGTH_HINT[d.length] ?? d.length}.`,
    `Style: ${d.style}.`,
    `Target audience: ${d.audience}.`,
    `Mood: ${d.mood}.`,
    "",
    "Follow a proper narrative arc: setup, rising action, climax, resolution.",
    "Return only the story text — no title unless the genre calls for one, no preamble.",
  ].join("\n");
}

function socialPrompt(d) {
  const platformNotes = {
    x: "Keep each post under 280 characters. 1-3 short posts, use 2-4 hashtags.",
    linkedin: "Professional, thoughtful. 1 longer post (100-200 words) with a hook line and 3-5 hashtags.",
    instagram: "Visual, friendly. 1 caption under 150 words, 5-10 hashtags, include emoji guidance in [brackets].",
    facebook: "Conversational. 1 post under 100 words, minimal hashtags.",
    tiktok: "Punchy, trend-aware. 1 short caption + 3 hook ideas for a video, 5-8 hashtags.",
    threads: "Casual, conversational. 1 short post, minimal hashtags.",
  };
  return [
    `Create social media posts for: ${d.product}.`,
    `Platform: ${d.platform}.`,
    `Goal: ${d.goal}.`,
    `Tone: ${d.tone}.`,
    d.cta ? `Call to action: ${d.cta}.` : "",
    "",
    `Platform guidance: ${platformNotes[d.platform]}`,
    "Return only the post(s) and hashtags — no explanations.",
  ].filter(Boolean).join("\n");
}

export function buildPrompt(data) {
  switch (data.contentType) {
    case "blog":   return blogPrompt(data);
    case "email":  return emailPrompt(data);
    case "story":  return storyPrompt(data);
    case "social": return socialPrompt(data);
    default:       throw new Error(`Unknown contentType: ${data.contentType}`);
  }
}
