import { useState, useRef, useEffect } from "react";
import Card from "../components/Card";
import { FaBolt, FaLink, FaFileUpload, FaCoins , FaPlusCircle} from "react-icons/fa";
import {
  submitIndexingJob,
  fetchIndexingLogs,
  getDashboardData,
  refillCredits,
} from "../../api/indexingApi";

export default function IndexingView() {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [pingGSC, setPingGSC] = useState(true);
  const [updateSitemap, setUpdateSitemap] = useState(true);

  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [credits, setCredits] = useState(null);

  const pollRef = useRef(null);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const data = await getDashboardData();
      if (data.success && data.stats) {
        setCredits(data.stats.credits);
      }
    } catch (err) {
      console.error("Failed to load credits");
    }
  };

  const pushLog = (type, message) => {
    setLogs((prev) => [
      ...prev,
      { type, message, time: new Date().toLocaleTimeString() },
    ]);
  };

  const handleSubmit = async () => {
    if (!url.trim() && !file) {
      pushLog("error", "Please provide a URL or upload a CSV file");
      return;
    }

    setLogs([]);
    setLoading(true);

    try {
      const res = await submitIndexingJob({
        url,
        file,
        pingGSC,
        updateSitemap,
      });

      if (res.creditsLeft !== undefined) {
        setCredits(res.creditsLeft);
      }

      if (res.mode === "bulk") {
        pushLog("info", `Bulk Process Started. Cost: ${res.count} Credits.`);

        if (res.submittedUrls && res.submittedUrls.length > 0) {
          res.submittedUrls.forEach((subUrl, index) => {
            setTimeout(() => {
              pushLog("success", `[QUEUED] ${subUrl}`);
            }, index * 150);
          });

          setTimeout(() => {
            pushLog("warning", "All URLs sent to background processor.");
            pushLog("info", "Check 'Recent Activity' on Dashboard for results.");
            setLoading(false);
            setFile(null);
            document.getElementById('csvInput').value = "";
          }, res.submittedUrls.length * 150 + 800);
        } else {
          setLoading(false);
        }
        return;
      }

      const jobId = res.jobId;
      pollRef.current = setInterval(async () => {
        const logRes = await fetchIndexingLogs(jobId);
        setLogs(logRes.logs || []);

        if (
          logRes.status === "submitted" ||
          logRes.status === "signals_sent" ||
          logRes.status === "failed" ||
          logRes.status === "done"
        ) {
          clearInterval(pollRef.current);
          setLoading(false);
          setUrl("");
        }
      }, 1500);

    } catch (err) {
      if (err.message && err.message.includes("Insufficient credits")) {
        pushLog("error", "INSUFFICIENT CREDITS! Please recharge.");
      } else {
        pushLog("error", err.message || "Something went wrong");
      }
      setLoading(false);
    }
  };

  const handleRefill = async () => {
    try {
      setLoading(true);
      const res = await refillCredits();
      setCredits(res.credits);
      pushLog("success", "💰 Account recharged with 50 Free Credits!");
    } catch (err) {
      pushLog("error", err.message);
    } finally {
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">OR</span></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Bulk Indexing (CSV)
            </label>
            <label className="flex items-center justify-center w-full border-2 border-dashed border-slate-200 rounded-lg p-4 cursor-pointer hover:border-accent hover:bg-slate-50 transition-all">
              <div className="flex flex-col items-center">
                <FaFileUpload className="text-slate-400 mb-2" size={20} />
                <span className="text-xs text-slate-500 font-medium">
                  {file ? file.name : "Click to upload CSV (one URL per row)"}
                </span>
              </div>
              <input
                id="csvInput"
                type="file"
                className="hidden"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pingGSC}
                onChange={() => setPingGSC(!pingGSC)}
                className="accent-accent"
              />
              <span className="text-sm font-medium">Ping Google Search Console</span>
            </label>

            <label className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={updateSitemap}
                onChange={() => setUpdateSitemap(!updateSitemap)}
                className="accent-accent"
              />
              <span className="text-sm font-medium">Update Sitemap.xml</span>
            </label>
          </div>
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-slate-400">Cost: 1 Credit per URL</span>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                <FaCoins className="text-yellow-500" />
                <span className="text-sm font-bold text-slate-700">
                  {credits !== null ? credits : "..."}
                </span>
              </div>

              <button
                onClick={handleRefill}
                title="Get Free Credits"
                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 flex items-center gap-1 transition-colors"
              >
                <FaPlusCircle /> Free Refill
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all
              ${loading ? "bg-accent/70 cursor-not-allowed" : "bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20"} text-white`}
          >
            <FaBolt className={loading ? "animate-pulse" : ""} />
            {loading ? "Processing..." : "Instant Submit"}
          </button>
        </div>
      </Card>

      {logs.length > 0 && (
        <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-sm max-h-80 overflow-y-auto shadow-2xl border border-slate-800">
          <div className="text-slate-500 mb-3 text-xs border-b border-slate-800 pb-2 flex justify-between">
            <span>&gt; server-console</span>
            {loading && <span className="animate-pulse text-accent">● LIVE</span>}
          </div>

          <div className="space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3 text-xs md:text-sm animate-fade-in">
                <span className="text-slate-600 shrink-0 select-none">[{log.time}]</span>
                <span className={
                  log.type === "success" ? "text-green-400 font-bold" :
                    log.type === "warning" ? "text-yellow-400" :
                      log.type === "error" ? "text-red-400 font-bold" : "text-blue-400"
                }>
                  {log.type.toUpperCase()}
                </span>
                <span className="break-all">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
