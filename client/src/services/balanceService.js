const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api`;

export async function getTripBalances(tripId) {
  const token = localStorage.getItem("cash_token");

  if (!token) {
    throw new Error("Please log in again.");
  }

  const response = await fetch(`${API_URL}/trips/${tripId}/balances`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch trip balances.");
  }

  return data;
}
