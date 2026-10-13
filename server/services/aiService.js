import OpenAI from "openai";

let client;
function getClient() {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in server/.env");
    }
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export async function generateContent(prompt) {
  try {
    const res = await getClient().chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are Ghostwriter, a professional content assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });
    return res.choices[0]?.message?.content?.trim() ?? "";
  } catch (err) {
    // Log the raw provider error — this is what actually tells us what's wrong.
    console.error(
      "[aiService] OpenAI error:",
      "status=" + (err.status ?? "?"),
      "code=" + (err.code ?? err.error?.code ?? "?"),
      "type=" + (err.type ?? err.error?.type ?? "?"),
      "msg=" + (err.message ?? "")
    );

    const status = err.status || 500;
    const code = err.code || err.error?.code;

    // More precise user-facing messages
    let userMessage;
    if (code === "insufficient_quota") {
      userMessage = "OpenAI account has no credit. Add billing at platform.openai.com.";
    } else if (code === "rate_limit_exceeded" || status === 429) {
      userMessage = "Too many requests — wait a minute and try again.";
    } else if (status === 401) {
      userMessage = "AI provider authentication failed (check OPENAI_API_KEY).";
    } else if (status === 404) {
      userMessage = "Model not found on this account. Check AI_MODEL in .env.";
    } else {
      userMessage = "AI generation failed. Please retry.";
    }

    const wrapped = new Error(userMessage);
    wrapped.status = status;
    wrapped.code = code;
    wrapped.cause = err;             // keep the original for debugging
    throw wrapped;
  }
}
