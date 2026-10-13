export default function OutputEditor({ value, onChange, warnings }) {
  return (
    <div className="output-editor">
      {warnings?.length > 0 && (
        <ul className="warnings">
          {warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={18}
        style={{ width: "100%", fontFamily: "monospace" }}
        placeholder="Your generated content will appear here…"
      />
    </div>
  );
}
