import { useState } from "react";

const TONES = ["professional", "casual", "friendly", "persuasive", "neutral"];

// Per-type initial state. When the type changes we reset to this.
const INITIAL = {
  blog: {
    contentType: "blog",
    topic: "",
    audience: "",
    wordCount: 500,
    tone: "professional",
    seoFocus: "",
    expertiseLevel: "intermediate",
  },
  email: {
    contentType: "email",
    purpose: "",
    recipientContext: "",
    keyPoints: "",
    tone: "professional",
    urgency: "normal",
    cta: "",
  },
  story: {
    contentType: "story",
    genre: "fantasy",
    characters: "",
    setting: "",
    length: "short",
    style: "descriptive",
    audience: "",
    mood: "hopeful",
  },
  social: {
    contentType: "social",
    product: "",
    platform: "x",
    goal: "awareness",
    tone: "casual",
    cta: "",
  },
};

export default function ContentForm({ onSubmit, loading }) {
  const [form, setForm] = useState(INITIAL.blog);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const changeType = (e) => {
    const next = e.target.value;
    setForm(INITIAL[next]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Coerce numeric fields for the schema
    const payload = { ...form };
    if (payload.wordCount !== undefined) payload.wordCount = Number(payload.wordCount);
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="content-form">
      <label>
        Content Type
        <select value={form.contentType} onChange={changeType}>
          <option value="blog">Blog Post</option>
          <option value="email">Email</option>
          <option value="story">Story</option>
          <option value="social">Social Media</option>
        </select>
      </label>

      {form.contentType === "blog" && (
        <>
          <label>Topic
            <input value={form.topic} onChange={update("topic")} required />
          </label>
          <label>Target Audience
            <input value={form.audience} onChange={update("audience")} required />
          </label>
          <label>Word Count
            <input type="number" min="100" max="3000"
              value={form.wordCount} onChange={update("wordCount")} required />
          </label>
          <label>Tone
            <select value={form.tone} onChange={update("tone")}>
              {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label>SEO Focus <small>(comma-separated keywords, optional)</small>
            <input value={form.seoFocus} onChange={update("seoFocus")} />
          </label>
          <label>Expertise Level
            <select value={form.expertiseLevel} onChange={update("expertiseLevel")}>
              {["beginner", "intermediate", "expert"].map((l) =>
                <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
        </>
      )}

      {form.contentType === "email" && (
        <>
          <label>Purpose
            <input value={form.purpose} onChange={update("purpose")} required />
          </label>
          <label>Recipient Context
            <input value={form.recipientContext} onChange={update("recipientContext")} required />
          </label>
          <label>Key Points
            <textarea rows={3} value={form.keyPoints} onChange={update("keyPoints")} required />
          </label>
          <label>Tone
            <select value={form.tone} onChange={update("tone")}>
              {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label>Urgency
            <select value={form.urgency} onChange={update("urgency")}>
              {["low", "normal", "high"].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </label>
          <label>Call to Action <small>(optional)</small>
            <input value={form.cta} onChange={update("cta")} />
          </label>
        </>
      )}

      {form.contentType === "story" && (
        <>
          <label>Genre
            <select value={form.genre} onChange={update("genre")}>
              {["fantasy", "sci-fi", "mystery", "romance", "literary", "horror", "adventure"]
                .map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label>Characters
            <input value={form.characters} onChange={update("characters")}
              placeholder="e.g. a lonely dragon, a curious librarian" required />
          </label>
          <label>Setting
            <input value={form.setting} onChange={update("setting")}
              placeholder="e.g. a floating library at dusk" required />
          </label>
          <label>Length
            <select value={form.length} onChange={update("length")}>
              {["short", "medium", "long"].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <label>Style
            <select value={form.style} onChange={update("style")}>
              {["descriptive", "minimalist", "dialogue-heavy", "poetic"].map((s) =>
                <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>Target Audience
            <input value={form.audience} onChange={update("audience")} required />
          </label>
          <label>Mood
            <select value={form.mood} onChange={update("mood")}>
              {["hopeful", "dark", "whimsical", "tense", "melancholic", "uplifting"]
                .map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
        </>
      )}

      {form.contentType === "social" && (
        <>
          <label>Product / Service
            <input value={form.product} onChange={update("product")} required />
          </label>
          <label>Platform
            <select value={form.platform} onChange={update("platform")}>
              {["x", "linkedin", "instagram", "facebook", "tiktok", "threads"]
                .map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label>Goal
            <select value={form.goal} onChange={update("goal")}>
              {["awareness", "engagement", "traffic", "conversion", "community"]
                .map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label>Tone
            <select value={form.tone} onChange={update("tone")}>
              {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label>Call to Action <small>(optional)</small>
            <input value={form.cta} onChange={update("cta")} />
          </label>
        </>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Generating…" : "Generate"}
      </button>
    </form>
  );
}
