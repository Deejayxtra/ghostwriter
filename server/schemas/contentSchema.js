import { z } from "zod";

export const contentRequestSchema = z.object({
  contentType: z.enum(["blog", "email"]),
  topic: z.string().min(1).max(300),
  purpose: z.string().min(1).max(300),
  audience: z.string().min(1).max(300),
  tone: z.enum(["professional", "casual", "friendly", "persuasive", "neutral"]),
  length: z.enum(["short", "medium", "long"]),
});
