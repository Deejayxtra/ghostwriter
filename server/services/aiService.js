import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateContent(prompt) {
  try {
    const res = await client.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are Ghostwriter, a professional content assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });
    return res.choices[0]?.message?.content?.trim() ?? "";
  } catch (err) {
    // Normalize provider errors into something the UI can show
    const status = err.status || 500;
    const message =
      status === 401 ? "AI provider authentication failed." :
      status === 429 ? "Rate limit reached. Please try again shortly." :
      "AI generation failed. Please retry.";
    const wrapped = new Error(message);
    wrapped.status = status;
    throw wrapped;
  }
}
