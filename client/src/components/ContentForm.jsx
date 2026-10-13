import { useState } from "react";

export default function ContentForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    contentType: "blog",
    topic: "",
    purpose: "",
    audience: "",
    tone: "professional",
    length: "medium",
  });

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="content-form">
      <label>
        Content Type
        <select value={form.contentType} onChange={update("contentType")}>
          <option value="blog">Blog Post</option>
          <option value="email">Email</option>
        </select>
      </label>

      <label>
        Topic
        <input value={form.topic} onChange={update("topic")} placeholder="Topic" required />
      </label>

      <label>
        Purpose
        <input value={form.purpose} onChange={update("purpose")} placeholder="Purpose" required />
      </label>

      <label>
        Audience
        <input value={form.audience} onChange={update("audience")} placeholder="Audience" required />
      </label>

      <label>
        Tone
        <select value={form.tone} onChange={update("tone")}>
          {["professional", "casual", "friendly", "persuasive", "neutral"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>

      <label>
        Length
        <select value={form.length} onChange={update("length")}>
          {["short", "medium", "long"].map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Generating…" : "Generate"}
      </button>
    </form>
  );
}
