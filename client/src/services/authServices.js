const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api`;

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("cash_token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export function loginUser(username, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function getTrips() {
  return apiRequest("/trips");
}

export function createTrip(name, description = "") {
  return apiRequest("/trips", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

export function joinTrip(groupCode) {
  return apiRequest("/trips/join", {
    method: "POST",
    body: JSON.stringify({ groupCode }),
  });
}

export function registerUser(username, email, password) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  });
}
