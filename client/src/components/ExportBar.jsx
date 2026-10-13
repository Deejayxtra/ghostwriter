import { jsPDF } from "jspdf";

export default function ExportBar({ text }) {
  const download = (content, filename, mime) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const lines = doc.splitTextToSize(text, 500);
    doc.text(lines, 40, 60);
    doc.save("ghostwriter.pdf");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  return (
    <div className="export-bar">
      <button onClick={copy} disabled={!text}>Copy</button>
      <button onClick={() => download(text, "ghostwriter.txt", "text/plain")} disabled={!text}>TXT</button>
      <button onClick={() => download(text, "ghostwriter.md", "text/markdown")} disabled={!text}>MD</button>
      <button onClick={toPdf} disabled={!text}>PDF</button>
    </div>
  );
}
