import { Router } from "express";
import { contentRequestSchema } from "../schemas/contentSchema.js";
import { buildPrompt } from "../prompts/templates.js";
import { generateContent } from "../services/aiService.js";
import { processOutput } from "../services/postProcess.js";

const router = Router();

router.post("/generate", async (req, res) => {
  const parsed = contentRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const prompt = buildPrompt(parsed.data);
    const raw = await generateContent(prompt);
    const { text, warnings } = processOutput(raw, parsed.data.contentType);
    res.json({ text, warnings, contentType: parsed.data.contentType });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

export default router;
