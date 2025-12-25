import { useState, useEffect } from "react";
import Card from "../components/Card";
import {
    FaCopy,
    FaCheckCircle,
    FaGoogle,
    FaShieldAlt,
    FaExclamationTriangle,
    FaGlobe
} from "react-icons/fa";
import { verifyGscConnection, getSavedConnectionStatus } from "../../api/indexingApi";

export default function SettingsView() {
    const [copied, setCopied] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [status, setStatus] = useState("pending");
    const [verifiedDomains, setVerifiedDomains] = useState([]);
    const [loading, setLoading] = useState(true);

    const [targetDomain, setTargetDomain] = useState("");

    const SERVICE_EMAIL = "indexing-bot@lgtslynx.iam.gserviceaccount.com";

    useEffect(() => {
        checkSavedStatus();
    }, []);

    const checkSavedStatus = async () => {
        try {
            const data = await getSavedConnectionStatus();
            if (data.success && data.sites.length > 0) {
                setStatus("success");
                setVerifiedDomains(data.sites);
                if (data.sites.length > 0) setTargetDomain(data.sites[0]);
            } else {
                setStatus("pending");
            }
        } catch (error) {
            console.error("Error checking status:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(SERVICE_EMAIL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleVerify = async () => {
        if (!targetDomain.trim()) {
            alert("Please enter your website URL first (e.g., https://myshop.com)");
            return;
        }

        setVerifying(true);
        setStatus("pending");
        setVerifiedDomains([]);

        try {
            const data = await verifyGscConnection(targetDomain);

            if (data.success && data.sites && data.sites.length > 0) {
                setStatus("success");
                setVerifiedDomains(data.sites);
            } else {
                setStatus("error");
            }
        } catch (err) {
            console.error("Verification failed", err);
            setStatus("error");
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return <div className="p-10 text-center text-slate-500 animate-pulse">Checking connection status...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">

            <div>
                <h1 className="text-2xl font-bold text-slate-800">Project Settings</h1>
                <p className="text-slate-500 mt-1">Connect your Google Search Console to enable Bulk Indexing.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <Card className="lg:col-span-2 p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <FaGoogle size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Google Indexing API</h2>
                            <p className="text-sm text-slate-500">Service Account Connection</p>
                        </div>
                        <div className="ml-auto">
                            {status === "success" ? (
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <FaCheckCircle /> Connected
                                </span>
                            ) : (
                                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                                    Not Connected
                                </span>
                            )}
                        </div>
                    </div>

                    {status === "error" && (
                        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg flex gap-3 text-sm animate-fade-in">
                            <FaExclamationTriangle className="mt-0.5 shrink-0" />
                            <div>
                                <p className="font-bold">Verification Failed.</p>
                                <p className="mt-1">
                                    Possible reasons:<br />
                                    1. You haven't added the Service Email as <strong>Owner</strong> in GSC.<br />
                                    2. The URL you entered doesn't match the GSC property exactly.
                                </p>
                            </div>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="mb-6 bg-green-50 border border-green-100 p-4 rounded-lg animate-fade-in">
                            <p className="text-sm text-green-800 font-bold mb-2 flex items-center gap-2">
                                <FaGlobe /> Verified Domains:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {verifiedDomains.map((domain, i) => (
                                    <span key={i} className="text-xs font-mono text-green-700 bg-white px-2 py-1 rounded border border-green-200">
                                        {domain}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                            <h3 className="font-semibold text-slate-700 text-sm mb-2">Step 1: Copy Service Email</h3>
                            <div className="flex gap-2">
                                <code className="flex-1 bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-600 font-mono overflow-hidden text-ellipsis">
                                    {SERVICE_EMAIL}
                                </code>
                                <button
                                    onClick={copyToClipboard}
                                    className={`px-4 py-2 rounded font-medium text-sm transition-all ${copied ? "bg-green-500 text-white" : "bg-slate-800 text-white hover:bg-slate-700"}`}
                                >
                                    {copied ? "Copied!" : <div className="flex items-center gap-2"><FaCopy /> Copy</div>}
                                </button>
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                            <h3 className="font-semibold text-slate-700 text-sm mb-2">Step 2: Add to Google Search Console</h3>
                            <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2 ml-1">
                                <li>Go to <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Google Search Console</a>.</li>
                                <li>Select your property (website).</li>
                                <li>Go to <strong>Settings</strong> &gt; <strong>Users and permissions</strong>.</li>
                                <li>Click <strong>Add User</strong>, paste the email above, and select <strong>Owner</strong> permission.</li>
                            </ol>
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Step 3: Enter Domain & Verify</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={targetDomain}
                                    onChange={(e) => setTargetDomain(e.target.value)}
                                    placeholder="https://your-site.com"
                                    className="flex-1 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                                <button
                                    onClick={handleVerify}
                                    disabled={verifying}
                                    className={`px-6 rounded-lg font-bold text-white transition-all whitespace-nowrap ${verifying ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                >
                                    {verifying ? "Checking..." : "Verify Now"}
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 ml-1">
                                *Enter the exact URL property as shown in GSC (e.g., https://socialstech.com)
                            </p>
                        </div>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="p-6 bg-blue-50 border-blue-100">
                        <FaShieldAlt className="text-blue-500 text-3xl mb-3" />
                        <h3 className="font-bold text-slate-800 mb-2">Secure Verification</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Google requires you to explicitly claim your domain. This ensures that only you can see and manage indexing for your websites.
                        </p>
                    </Card>
                </div>

            </div>
        </div>
    );
}