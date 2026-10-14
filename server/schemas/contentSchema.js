import { z } from "zod";

const tones = ["professional", "casual", "friendly", "persuasive", "neutral"];
const lengths = ["short", "medium", "long"];

const blogSchema = z.object({
  contentType: z.literal("blog"),
  topic: z.string().min(1).max(300),
  audience: z.string().min(1).max(300),
  wordCount: z.coerce.number().int().min(100).max(3000).default(500),
  tone: z.enum(tones),
  seoFocus: z.string().max(200).optional().default(""),
  expertiseLevel: z.enum(["beginner", "intermediate", "expert"]).default("intermediate"),
});

const emailSchema = z.object({
  contentType: z.literal("email"),
  purpose: z.string().min(1).max(300),
  recipientContext: z.string().min(1).max(500),
  keyPoints: z.string().min(1).max(1000),
  tone: z.enum(tones),
  urgency: z.enum(["low", "normal", "high"]).default("normal"),
  cta: z.string().max(200).optional().default(""),
});

const storySchema = z.object({
  contentType: z.literal("story"),
  genre: z.enum(["fantasy", "sci-fi", "mystery", "romance", "literary", "horror", "adventure"]),
  characters: z.string().min(1).max(500),
  setting: z.string().min(1).max(500),
  length: z.enum(lengths),
  style: z.enum(["descriptive", "minimalist", "dialogue-heavy", "poetic"]).default("descriptive"),
  audience: z.string().min(1).max(300),
  mood: z.enum(["hopeful", "dark", "whimsical", "tense", "melancholic", "uplifting"]).default("hopeful"),
});

const socialSchema = z.object({
  contentType: z.literal("social"),
  product: z.string().min(1).max(300),
  platform: z.enum(["x", "linkedin", "instagram", "facebook", "tiktok", "threads"]),
  goal: z.enum(["awareness", "engagement", "traffic", "conversion", "community"]),
  tone: z.enum(tones),
  cta: z.string().max(200).optional().default(""),
});

export const contentRequestSchema = z.discriminatedUnion("contentType", [
  blogSchema,
  emailSchema,
  storySchema,
  socialSchema,
]);
