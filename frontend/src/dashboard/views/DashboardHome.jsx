import React, { useEffect, useState } from "react";
import { 
  FaBolt, 
  FaCheckCircle, 
  FaClock, 
  FaChartLine, 
  FaExternalLinkAlt,
  FaSpinner,
  FaExclamationTriangle
} from "react-icons/fa";

// Internal Components & API
import Card from "../components/Card";
import { getDashboardData } from "../../api/indexingApi";

export default function DashboardHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        setLoading(true);
        const res = await getDashboardData();
        if (isMounted) {
          if (res.success) {
            setData(res);
          } else {
            setError("Failed to fetch dashboard statistics.");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Dashboard API Error:", err);
          setError("Connection error. Please try again later.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStats();
    return () => { isMounted = false; };
  }, []);

  // Helper: Time Formatter
  const formatTime = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading UI
  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-slate-400 gap-3">
        <FaSpinner className="animate-spin text-blue-500" size={32} />
        <span className="font-medium">Loading your dashboard...</span>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-red-500 gap-3">
        <FaExclamationTriangle size={32} />
        <p className="font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-slate-100 rounded-md text-slate-700 hover:bg-slate-200 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // Data Parsing with Fallbacks
  const statsData = data?.stats || { totalIndexed: 0, pending: 0, failed: 0, credits: 0 };
  const recentActivity = data?.recentActivity || [];
  
  const totalAttempts = statsData.totalIndexed + statsData.failed;
  const successRate = totalAttempts > 0 
    ? Math.round((statsData.totalIndexed / totalAttempts) * 100) 
    : 100;

  const statsConfig = [
    { 
      label: "Total Indexed", 
      value: statsData.totalIndexed.toLocaleString(), 
      icon: FaCheckCircle, 
      color: "text-green-600", 
      bg: "bg-green-100" 
    },
    { 
      label: "Pending Jobs", 
      value: statsData.pending.toString(), 
      icon: FaClock, 
      color: "text-amber-600", 
      bg: "bg-amber-100" 
    },
    { 
      label: "Credits Left", 
      value: statsData.credits?.toLocaleString() || "0", 
      icon: FaBolt, 
      color: "text-blue-600", 
      bg: "bg-blue-100" 
    },
    { 
      label: "Success Rate", 
      value: `${successRate}%`, 
      icon: FaChartLine, 
      color: "text-purple-600", 
      bg: "bg-purple-100" 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4 sm:px-6">
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-2 text-lg">
          Real-time insights into your indexing performance.
        </p>
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Recent Activity Table */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border border-slate-100 shadow-sm h-full">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Recent Activity</h3>
              <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
            </div>
            
            <div className="divide-y divide-slate-100">
              {recentActivity.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-400">No activity recorded yet.</p>
                </div>
              ) : (
                recentActivity.map((job) => (
                  <div key={job._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 
                        ${job.status === 'done' ? 'bg-green-500' : 
                          job.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'}`} 
                      />
                      <div className="truncate">
                        <a 
                          href={job.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-sm font-medium text-slate-700 hover:text-blue-600 flex items-center gap-1.5"
                        >
                          {job.url} <FaExternalLinkAlt size={10} className="opacity-40" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0 ml-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter
                        ${job.status === 'done' ? 'bg-green-100 text-green-700' : 
                          job.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {job.status}
                      </span>
                      <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                        {formatTime(job.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          
          {/* System Status Card */}
          <Card className="p-6 bg-slate-900 text-white relative overflow-hidden border-0 shadow-xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <h3 className="font-bold text-lg">System Health</h3>
              <div className="flex items-center gap-2 mt-1 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs text-green-400 font-mono uppercase tracking-widest">Active</span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                  <span className="text-slate-400">Google API</span>
                  <span className="font-mono text-green-400">99.8%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Avg. Speed</span>
                  <span className="font-mono text-blue-400">1.2s</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Tips Card */}
          <Card className="p-6 border-l-4 border-blue-500 bg-white shadow-sm">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
              <span className="text-lg">💡</span> Pro Tip
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enable <strong>Auto-Index</strong> in your settings to automatically submit new blog posts from your RSS feed.
            </p>
          </Card>

        </div>
      </div>
    </div>
  );
}
