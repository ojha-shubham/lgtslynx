const API_BASE = "https://vigilant-journey-65q46wx54qhwpv-5000.app.github.dev/api";

export const submitIndexingJob = async (payload) => {
  const res = await fetch(`${API_BASE}/indexing/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to submit indexing job");
  }

  return res.json();
};

export const fetchIndexingLogs = async (jobId) => {
  const res = await fetch(`${API_BASE}/indexing/logs/${jobId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch logs");
  }

  return res.json();
};

export const generateContentStrategy = async (payload) => {
  const res = await fetch(`${API_BASE}/content/strategy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to generate content strategy");
  }

  return res.json();
};