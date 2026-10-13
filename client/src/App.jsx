import { useState } from "react";
import ContentForm from "./components/ContentForm";
import OutputEditor from "./components/OutputEditor";
import ExportBar from "./components/ExportBar";
import { requestGeneration } from "./api/generate";
import "./App.css";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = async (form) => {
    setLoading(true);
    setError(null);
    setWarnings([]);
    try {
      const data = await requestGeneration(form);
      setOutput(data.text ?? "");
      setWarnings(data.warnings ?? []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app">
      <h1>Ghostwriter</h1>
      <ContentForm onSubmit={handleSubmit} loading={loading} />
      {error && <p className="error">⚠ {error}</p>}
      <OutputEditor value={output} onChange={setOutput} warnings={warnings} />
      {output && <ExportBar text={output} />}
    </main>
  );
}
