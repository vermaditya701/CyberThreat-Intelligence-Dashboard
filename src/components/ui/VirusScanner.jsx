"use client";
import { useState } from "react";

export default function VirusScanner() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Scan error:", err);
      setResult({ error: "Scan failed. Please check the server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 p-4 rounded-xl mt-6">
      <h2 className="text-xl font-semibold mb-3">🧪 URL Virus Scanner</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="w-full bg-zinc-800 text-white p-2 rounded"
          placeholder="Enter a URL to scan"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleScan}
          disabled={loading}
        >
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>

      {result && (
        <div className="text-sm bg-zinc-800 p-3 rounded overflow-x-auto max-h-60">
          <pre className="text-white">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
