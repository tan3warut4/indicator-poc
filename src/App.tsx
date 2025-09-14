import React, { useState } from "react";
import { FormulaEditor } from "./FormulaEditor";

export default function App() {
  const [html, setHtml] = useState<string>("");

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Indicator Formula POC</h1>

      <FormulaEditor value={html} onChange={setHtml} />

      <h3 style={{ marginTop: 24 }}>Serialized HTML</h3>
      <pre
        style={{
          background: "#0f172a",
          color: "white",
          padding: 12,
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        {html}
      </pre>
    </div>
  );
}