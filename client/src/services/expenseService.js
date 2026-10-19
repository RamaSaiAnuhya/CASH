const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api`;

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("cash_token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

export async function getTripExpenses(tripId) {
  const data = await apiRequest(`/trips/${tripId}/expenses`);
  return data.expenses;
}

export async function createTripExpense(tripId, expense) {
  const data = await apiRequest(`/trips/${tripId}/expenses`, {
    method: "POST",
    body: JSON.stringify(expense),
  });

  return data.expense;
}

export async function updateTripExpense(tripId, expenseId, expense) {
  const data = await apiRequest(`/trips/${tripId}/expenses/${expenseId}`, {
    method: "PATCH",
    body: JSON.stringify(expense),
  });

  return data.expense;
}

export async function deleteTripExpense(tripId, expenseId) {
  return apiRequest(`/trips/${tripId}/expenses/${expenseId}`, {
    method: "DELETE",
  });
}
