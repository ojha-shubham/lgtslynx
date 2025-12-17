import { useState, useRef } from "react";
import Card from "../components/Card";
import { FaBolt, FaLink } from "react-icons/fa";
import {
  submitIndexingJob,
  fetchIndexingLogs,
} from "../../api/indexingApi";

export default function IndexingView() {
  const [url, setUrl] = useState("");
  const [pingGSC, setPingGSC] = useState(true);
  const [updateSitemap, setUpdateSitemap] = useState(true);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const pollRef = useRef(null);

  const pushLog = (type, message) => {
    setLogs((prev) => [
      ...prev,
      { type, message, time: new Date().toLocaleTimeString() },
    ]);
  };

  const handleSubmit = async () => {
    if (!url.trim()) {
      pushLog("error", "Invalid URL provided");
      return;
    }

    setLogs([]);
    setLoading(true);

    try {
      const { jobId } = await submitIndexingJob({
        url,
        pingGSC,
        updateSitemap,
      });

      pollRef.current = setInterval(async () => {
        const res = await fetchIndexingLogs(jobId);
        setLogs(res.logs || []);

        if (
          res.status === "submitted" || res.status === "signals_sent" ||          res.status === "failed"
        ) {
          clearInterval(pollRef.current);
          setLoading(false);
        }
      }, 1500);
    } catch (err) {
      pushLog("error", err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <FaBolt className="text-accent" />
          Fast Indexing Module
        </h1>
        <p className="text-slate-500 mt-1">
          Trigger indexing signals & monitor server output
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Target URL
            </label>

            <div className="flex border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-accent/40">
              <span className="px-3 py-2 bg-slate-100 text-slate-600 text-sm border-r flex items-center gap-2">
                <FaLink size={12} />
                https://
              </span>

              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com/new-page"
                className="flex-1 px-3 py-2 outline-none text-sm text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={pingGSC}
                onChange={() => setPingGSC(!pingGSC)}
                className="accent-accent"
              />
              <span className="text-sm font-medium">
                Ping Google Search Console
              </span>
            </label>

            <label className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={updateSitemap}
                onChange={() => setUpdateSitemap(!updateSitemap)}
                className="accent-accent"
              />
              <span className="text-sm font-medium">
                Update Sitemap.xml
              </span>
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2
              ${
                loading
                  ? "bg-accent/70 cursor-not-allowed"
                  : "bg-accent hover:bg-accent/90"
              } text-white`}
          >
            <FaBolt className={loading ? "animate-pulse" : ""} />
            {loading ? "Processing…" : "Instant Submit"}
          </button>
        </div>
      </Card>

      {logs.length > 0 && (
        <div className="bg-black text-slate-200 rounded-xl p-4 font-mono text-sm max-h-64 overflow-y-auto">
          <div className="text-slate-500 mb-3">
            &gt; <span className="text-accent">server-console</span>
          </div>

          {logs.map((log, i) => (
            <div key={i} className="flex gap-2 mb-1">
              <span className="text-slate-500">[{log.time}]</span>

              <span
                className={
                  log.type === "success"
                    ? "text-green-400"
                    : log.type === "warning"
                    ? "text-yellow-400"
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
    </div>
  );
}
