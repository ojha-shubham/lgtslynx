import { useState } from "react";
import Card from "../components/Card";
import { FaMagic, FaBrain } from "react-icons/fa";
import { generateContentStrategy } from "../../api/indexingApi";

export default function ContentStrategistView() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);

  const clusters = [
    { name: "Technical SEO", count: 12 },
    { name: "Content Marketing", count: 8 },
    { name: "Backlink Strategies", count: 5 },
  ];

  const generateStrategy = async () => {
    if (!keyword.trim()) {
      setLogs([
        {
          type: "error",
          message: "Keyword / niche is required",
          time: new Date().toLocaleTimeString(),
        },
      ]);
      return;
    }

    setLogs([]);
    setResult(null);
    setLoading(true);

    try {
      const res = await generateContentStrategy({ keyword });

      setLogs(res.logs || []);
      setResult(res.result || null);
    } catch (err) {
      setLogs([
        {
          type: "error",
          message: err.message,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT PANEL */}
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <FaMagic className="text-accent" />
            AI Content Strategist
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Generate high-ranking content ideas using Gemini.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Target Keyword / Niche
          </label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. Sustainable Coffee"
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none
                       focus:ring-2 focus:ring-accent"
          />
        </div>

        <button
          onClick={generateStrategy}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition ${loading
            ? "bg-slate-400 cursor-not-allowed text-white"
            : "bg-accent hover:bg-accent/90 text-white"
            }`}
        >
          {loading ? "Generating…" : "Generate Strategy"}
        </button>

        <div className="border-t pt-4">
          <p className="text-xs font-semibold text-slate-400 mb-3">
            YOUR EXISTING CLUSTERS
          </p>

          <div className="space-y-2">
            {clusters.map((c) => (
              <div
                key={c.name}
                className="flex justify-between items-center
                           bg-accent/10 rounded-lg px-3 py-2 text-sm"
              >
                <span className="text-slate-700">{c.name}</span>
                <span className="text-xs bg-white border border-accent
                                 text-accent rounded px-2 py-0.5">
                  {c.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="lg:col-span-2 p-6 h-[520px] flex flex-col">
        <div className="flex-1 overflow-y-auto pr-1">
          {!logs.length && !result && (
            <div
              className="h-full border-2 border-dashed border-accent/40
                   flex flex-col items-center justify-center
                   rounded-xl text-center text-slate-400"
            >
              <FaBrain className="text-4xl mb-4 text-accent" />
              <p className="max-w-md text-sm">
                Enter a niche to generate an AI-powered content strategy.
              </p>
            </div>
          )}

          {logs.length > 0 && (
            <div className="bg-black text-slate-200 rounded-xl p-4 font-mono text-sm mb-4 max-h-60 overflow-y-auto">
              <div className="text-slate-500 mb-2">
                &gt; <span className="text-accent">gemini-console</span>
              </div>

              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 mb-1">
                  <span className="text-slate-500">[{log.time}]</span>
                  <span
                    className={
                      log.type === "success"
                        ? "text-green-400"
                        : log.type === "error"
                          ? "text-red-400"
                          : "text-blue-400"
                    }
                  >
                    {log.type.toUpperCase()}
                  </span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          )}

          {result && (
            <div>
              <h3 className="font-semibold mb-3 text-slate-800">
                Generated Content Plan
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-slate-700">Pillar Article</p>
                  <p className="border-l-4 border-accent bg-white rounded px-4 py-2">
                    {result.pillar}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-slate-700">Topic Clusters</p>
                  <ul className="space-y-2">
                    {(result.clusters || []).map((c, i) => (
                      <li
                        key={i}
                        className="border-l-4 border-accent bg-white rounded px-4 py-2"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-medium text-slate-700">Content Calendar</p>
                  <ul className="space-y-2">
                    {(result.calendar || result.calender || []).map((c, i) => (
                      <li
                        key={i}
                        className="border-l-4 border-accent bg-white rounded px-4 py-2"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
