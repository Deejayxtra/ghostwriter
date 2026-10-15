import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import generateRouter from "../routes/generate.js";
import * as aiService from "../services/aiService.js";

// Build a fresh app for each test file — no server.listen, no port binding.
const app = express();
app.use(express.json());
app.use("/api", generateRouter);

describe("POST /api/generate — validation", () => {
  it("rejects an unknown content type", async () => {
    const res = await request(app)
      .post("/api/generate")
      .send({ contentType: "podcast" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(res.body.details).toHaveProperty("contentType");
  });

  it("rejects an incomplete blog request", async () => {
    const res = await request(app)
      .post("/api/generate")
      .send({ contentType: "blog", topic: "only topic" });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty("audience");
    expect(res.body.details).toHaveProperty("tone");
  });

  it("rejects an incomplete story request", async () => {
    const res = await request(app)
      .post("/api/generate")
      .send({ contentType: "story", genre: "fantasy" });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty("characters");
    expect(res.body.details).toHaveProperty("setting");
    expect(res.body.details).toHaveProperty("length");
    expect(res.body.details).toHaveProperty("audience");
  });

  it("rejects an invalid tone enum", async () => {
    const res = await request(app).post("/api/generate").send({
      contentType: "blog",
      topic: "x",
      audience: "y",
      wordCount: 400,
      tone: "shouty",
      expertiseLevel: "intermediate",
    });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty("tone");
  });
});

describe("POST /api/generate — happy path", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns blog content from the service", async () => {
    vi.spyOn(aiService, "generateContent").mockResolvedValue(
      "# Remote Work\n\nAn introduction.\n\n## Section\nBody that is long enough to be plausible."
    );

    const res = await request(app).post("/api/generate").send({
      contentType: "blog",
      topic: "Remote work productivity",
      audience: "developers",
      wordCount: 400,
      tone: "casual",
      seoFocus: "focus, deep work",
      expertiseLevel: "intermediate",
    });

    expect(res.status).toBe(200);
    expect(res.body.text).toContain("# Remote Work");
    expect(res.body.contentType).toBe("blog");
    expect(Array.isArray(res.body.warnings)).toBe(true);
  });

  it("returns email content with a Subject line", async () => {
    vi.spyOn(aiService, "generateContent").mockResolvedValue(
      "Subject: Meeting reschedule\n\nHi Alex,\n\nLet's find a new time.\n\nBest,\nSam"
    );

    const res = await request(app).post("/api/generate").send({
      contentType: "email",
      purpose: "reschedule a meeting",
      recipientContext: "a busy client",
      keyPoints: "apologize, propose two slots",
      tone: "professional",
      urgency: "normal",
      cta: "reply with your preferred slot",
    });

    expect(res.status).toBe(200);
    expect(res.body.text).toMatch(/^Subject:/m);
    expect(res.body.contentType).toBe("email");
    // postProcess should NOT warn — subject line is present
    expect(res.body.warnings).toEqual([]);
  });

  it("warns when an email lacks a Subject line", async () => {
    vi.spyOn(aiService, "generateContent").mockResolvedValue(
      "Hi Alex,\n\nJust following up.\n\nSam"
    );

    const res = await request(app).post("/api/generate").send({
      contentType: "email",
      purpose: "follow up",
      recipientContext: "client",
      keyPoints: "check in",
      tone: "friendly",
      urgency: "low",
    });

    expect(res.status).toBe(200);
    expect(res.body.warnings).toContain("Email is missing a 'Subject:' line.");
  });

  it("warns when social output has no hashtags", async () => {
    vi.spyOn(aiService, "generateContent").mockResolvedValue(
      "Check out our new product — it helps you focus."
    );

    const res = await request(app).post("/api/generate").send({
      contentType: "social",
      product: "FocusApp",
      platform: "x",
      goal: "awareness",
      tone: "casual",
    });

    expect(res.status).toBe(200);
    expect(res.body.warnings).toContain("Social post has no hashtags.");
  });

  it("warns when the model returns empty output", async () => {
    vi.spyOn(aiService, "generateContent").mockResolvedValue("");

    const res = await request(app).post("/api/generate").send({
      contentType: "story",
      genre: "fantasy",
      characters: "a dragon",
      setting: "a tower",
      length: "short",
      style: "poetic",
      audience: "children",
      mood: "whimsical",
    });

    expect(res.status).toBe(200);
    expect(res.body.warnings).toContain("Model returned empty output.");
  });
});

describe("POST /api/generate — error handling", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("maps a provider 401 to a 401 response", async () => {
    const err = new Error("authentication failed");
    err.status = 401;
    err.code = "invalid_api_key";
    vi.spyOn(aiService, "generateContent").mockRejectedValue(err);

    const res = await request(app).post("/api/generate").send({
      contentType: "blog",
      topic: "x",
      audience: "y",
      wordCount: 400,
      tone: "casual",
      expertiseLevel: "beginner",
    });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("invalid_api_key");
  });

  it("maps a 429 insufficient_quota to a helpful message", async () => {
    const err = new Error("no credits");
    err.status = 429;
    err.code = "credit_balance_exhausted";
    // Simulate what aiService does after wrapping
    const wrapped = new Error("OpenAI account has no credits. Add billing at platform.openai.com.");
    wrapped.status = 429;
    wrapped.code = "credit_balance_exhausted";
    vi.spyOn(aiService, "generateContent").mockRejectedValue(wrapped);

    const res = await request(app).post("/api/generate").send({
      contentType: "blog",
      topic: "x",
      audience: "y",
      wordCount: 400,
      tone: "casual",
      expertiseLevel: "beginner",
    });

    expect(res.status).toBe(429);
    expect(res.body.code).toBe("credit_balance_exhausted");
    expect(res.body.error).toMatch(/credit|billing/i);
  });
});