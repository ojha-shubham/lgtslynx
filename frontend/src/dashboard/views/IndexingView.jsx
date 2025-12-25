import { useState, useRef, useEffect } from "react";
import Card from "../components/Card";
import { 
  FaLink, 
  FaCloudUploadAlt,
  FaPaperPlane,
  FaSyncAlt,
  FaWallet,
  FaTerminal
} from "react-icons/fa";
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
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

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
      pushLog("error", "URL or CSV file is required to start.");
      return;
    }

    setLogs([]);
    setLoading(true);

    try {
      pushLog("info", "Establishing secure connection to indexing node...");
      
      const res = await submitIndexingJob({
        url,
        file,
        pingGSC,
        updateSitemap,
      });

      if (res.creditsLeft !== undefined) setCredits(res.creditsLeft);

      if (res.mode === "bulk") {
        pushLog("info", `Batch request received. Processing ${res.count} URLs.`);
        
        if (res.submittedUrls?.length > 0) {
          res.submittedUrls.forEach((subUrl, index) => {
            setTimeout(() => {
              pushLog("success", `Authorized: ${subUrl}`);
            }, index * 50);
          });
          
          setTimeout(() => {
             pushLog("success", "Handover to worker complete.");
             setLoading(false);
             setFile(null);
             const fileInput = document.getElementById('file-upload');
             if(fileInput) fileInput.value = "";
          }, res.submittedUrls.length * 50 + 500);
        } else {
            setLoading(false);
        }
        return;
      }

      const jobId = res.jobId;
      pollRef.current = setInterval(async () => {
        const logRes = await fetchIndexingLogs(jobId);
        setLogs(logRes.logs || []);

        if (["submitted", "signals_sent", "failed", "done"].includes(logRes.status)) {
          clearInterval(pollRef.current);
          setLoading(false);
          setUrl("");
        }
      }, 1500);

    } catch (err) {
      pushLog("error", err.message || "Protocol error: Connection timed out.");
      setLoading(false);
    }
  };

  const handleRefill = async () => {
    try {
      setLoading(true);
      const res = await refillCredits();
      setCredits(res.credits);
      pushLog("success", "Credits sync complete.");
    } catch (err) {
      pushLog("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-8xl mx-auto pb-8 px-4">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Indexing Control Center</h1>
            <p className="text-slate-500 text-[11px] uppercase font-bold tracking-widest">v2.4.0 Live Monitor</p>
        </div>
        
        <div className="bg-slate-900 px-4 py-2 rounded-xl shadow-lg flex items-center gap-4 border border-slate-700">
            <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Credits</span>
                <span className="text-lg font-bold text-accent font-mono leading-none">{credits !== null ? credits : "000"}</span>
            </div>
            <button onClick={handleRefill} className="bg-accent/10 hover:bg-accent/20 text-accent p-2 rounded-lg transition-all">
                <FaWallet size={16} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        <div className="lg:col-span-5 h-full">
            <Card className="p-6 space-y-5 bg-white border border-slate-200 shadow-sm flex flex-col">
                <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 block">Target URL</label>
                    <div className="relative">
                        <FaLink className="absolute left-3 top-3.5 text-slate-400 size-3.5" />
                        <input 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://domain.com/path"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all outline-none text-slate-700"
                        />
                    </div>
                </div>

                <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-slate-100"></div>
                    <span className="flex-shrink-0 mx-4 text-[10px] text-slate-400 font-bold uppercase">or bundle</span>
                    <div className="flex-grow border-t border-slate-100"></div>
                </div>

                <label htmlFor="file-upload" className={`group flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${file ? "border-accent bg-accent/5" : "border-slate-200 hover:border-accent/40 hover:bg-slate-50"}`}>
                    <FaCloudUploadAlt className={`w-7 h-7 mb-2 ${file ? "text-accent" : "text-slate-400 group-hover:text-accent"}`} />
                    <p className="text-xs text-slate-600 px-4 text-center truncate w-full font-medium">
                        {file ? file.name : "Drop dataset (.csv)"}
                    </p>
                    <input id="file-upload" type="file" className="hidden" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
                </label>

                <div className="space-y-3">
                    <Toggle label="Google Signal Injection" active={pingGSC} onClick={() => setPingGSC(!pingGSC)} />
                    <Toggle label="Sitemap.xml Sync" active={updateSitemap} onClick={() => setUpdateSitemap(!updateSitemap)} />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-sm text-white shadow-lg transition-all transform active:scale-[0.97] flex items-center justify-center gap-3
                    ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-accent hover:shadow-accent/30"}`}
                >
                    {loading ? <FaSyncAlt className="animate-spin size-4" /> : <FaPaperPlane className="size-4" />}
                    {loading ? "EXECUTING..." : "START INDEXING"}
                </button>
            </Card>
        </div>

        <div className="lg:col-span-7 h-full">
            <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden h-[490px]">
                <div className="bg-slate-800/50 px-5 py-3.5 flex justify-between items-center border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <FaTerminal size={12} /> System Terminal
                        </span>
                    </div>
                    {loading && <span className="text-[10px] font-bold text-accent animate-pulse">● LIVE_AGENT</span>}
                </div>

                <div className="flex-1 overflow-y-auto p-5 font-mono text-[12px] scroll-smooth custom-scrollbar">
                    {!logs.length ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-700">
                            <FaTerminal size={40} className="mb-4 opacity-10" />
                            <p className="text-xs uppercase tracking-tighter">Awaiting instruction input...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-3 animate-fade-in text-slate-300">
                                    <span className="text-slate-600 shrink-0 select-none">[{log.time}]</span>
                                    <span className={`font-bold shrink-0 uppercase text-[11px] ${
                                        log.type === 'success' ? 'text-green-400' : 
                                        log.type === 'error' ? 'text-red-400' : 
                                        log.type === 'warning' ? 'text-yellow-400' : 'text-accent'
                                    }`}>
                                        {log.type}:
                                    </span>
                                    <span className="leading-relaxed opacity-90 break-words">{log.message}</span>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex gap-2 text-accent mt-2 items-center">
                                    <span className="animate-bounce text-lg">_</span>
                                    <span className="text-[10px] font-bold uppercase tracking-tight opacity-50">Processing...</span>
                                </div>
                            )}
                            <div ref={logsEndRef} />
                        </div>
                    )}
                </div>

                <div className="bg-slate-800/30 px-5 py-2 border-t border-slate-800 flex justify-between items-center shrink-0">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">Node: primary-in-01</span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">Process: UTF-8</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, active, onClick }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{label}</span>
            <button 
                onClick={onClick}
                className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${active ? 'bg-accent' : 'bg-slate-300'}`}
            >
                <div className={`bg-white w-3 h-3 rounded-full shadow-sm transform duration-300 ${active ? 'translate-x-5' : ''}`}></div>
            </button>
        </div>
    );
}