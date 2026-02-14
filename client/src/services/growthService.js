import { API_URL } from "../lib/api";
import { getToken } from "../lib/auth";

const headers = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

export async function fetchGrowth() {
  const res = await fetch(`${API_URL}/api/growth`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch growth");
  const data = await res.json();
  return data.growth;
}

export async function applyGrowthAction(actionType, metadata = {}) {
  const res = await fetch(`${API_URL}/api/growth/apply-action`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ actionType, metadata }),
  });
  if (!res.ok) throw new Error("Growth update failed");
  return res.json();
}
