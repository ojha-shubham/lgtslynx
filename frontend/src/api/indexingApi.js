const API_BASE = import.meta.env.VITE_API_URL;

export const submitIndexingJob = async (payload) => {
  if (payload.file) {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("pingGSC", payload.pingGSC);
    formData.append("updateSitemap", payload.updateSitemap);

    const res = await fetch(`${API_BASE}/indexing/submit`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to upload CSV");
    }

    return res.json();
  }

  const res = await fetch(`${API_BASE}/indexing/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to submit indexing job");
  }

  return res.json();
};

export const getIndexingLogs = async (jobId) => {
  const res = await fetch(`${API_BASE}/indexing/logs/${jobId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch logs");
  }

  return res.json();
};

export const fetchIndexingLogs = getIndexingLogs;

export const generateContentStrategy = async (payload) => {
  const res = await fetch(`${API_BASE}/content/strategy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to generate content strategy");
  }

  return res.json();
};


export const getDashboardData = async () => {
  try {
    const res = await fetch(`${API_BASE}/indexing/dashboard`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch dashboard data");
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const verifyGscConnection = async (domain) => {
  try {
    const query = domain ? `?domain=${encodeURIComponent(domain)}` : "";

    const res = await fetch(`${API_BASE}/indexing/verify-access${query}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to verify connection");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const getSavedConnectionStatus = async () => {
  try {
    const res = await fetch(`${API_BASE}/indexing/status`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch status");
    return await res.json();
  } catch (error) {
    console.error(error);
    return { success: false, sites: [] };
  }
};

export const downloadReport = async () => {
  const res = await fetch(`${API_BASE}/indexing/export`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to download report");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Lynx-Report-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

export const refillCredits = async () => {
  const res = await fetch(`${API_BASE}/indexing/refill`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Refill failed");
  return data;
};