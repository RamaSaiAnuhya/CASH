import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, X } from "lucide-react";

import { useAuth } from "../context/authContext";
import { createTrip, getTrips, joinTrip } from "../services/authServices";

import ExpenseForm from "../components/ExpenseForm.jsx";
import ExpenseList from "../components/ExpenseList.jsx";
import {
  getTripExpenses,
  createTripExpense,
  updateTripExpense,
  deleteTripExpense,
} from "../services/expenseService.js";

import TripBalances from "../components/TripBalances";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Trips list
  const [trips, setTrips] = useState([]);
  const [tripName, setTripName] = useState("");
  const [groupCode, setGroupCode] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Selected trip + expenses
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expenseError, setExpenseError] = useState("");

  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);
  const [balancesRefreshKey, setBalancesRefreshKey] = useState(0);

  const [activeTab, setActiveTab] = useState("EXPENSES");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [modalError, setModalError] = useState("");

  const loadTrips = useCallback(async () => {
    try {
      const data = await getTrips();
      setTrips(data.trips || []);
      setError("");
    } catch (err) {
      setError(err.message || "Could not load trips.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const refreshBalances = () => setBalancesRefreshKey((k) => k + 1);

  async function openTrip(trip) {
    setSelectedTrip(trip);
    setExpenses([]);
    setExpenseError("");
    setExpensesLoading(true);

    try {
      const result = await getTripExpenses(trip.id);
      setExpenses(result);
    } catch (err) {
      setExpenseError(err.message || "Failed to load expenses.");
    } finally {
      setExpensesLoading(false);
    }
  }

  function closeTrip() {
    setSelectedTrip(null);
    setExpenses([]);
    setExpenseError("");
    setEditingExpense(null);
    setShowAddExpense(false);
    setModalError("");
    setActiveTab("EXPENSES");
  }

  async function handleCreateExpense(expenseData) {
    setModalError("");
    try {
      const created = await createTripExpense(selectedTrip.id, expenseData);
      setExpenses((current) => [created, ...current]);
      refreshBalances();
      setShowAddExpense(false);
    } catch (err) {
      setModalError(err.message || "Could not add expense.");
    }
  }

  async function handleUpdateExpense(expenseData) {
    if (!editingExpense) return;
    setModalError("");
    try {
      const updated = await updateTripExpense(
        selectedTrip.id,
        editingExpense.id,
        expenseData,
      );
      setExpenses((current) =>
        current.map((e) => (e.id === editingExpense.id ? updated : e)),
      );
      refreshBalances();
      setEditingExpense(null);
    } catch (err) {
      setModalError(err.message || "Could not update expense.");
    }
  }

  async function handleDeleteExpense(expense) {
    if (
      !window.confirm(`Delete "${expense.name}"? This action cannot be undone.`)
    )
      return;

    setDeletingExpenseId(expense.id);
    setExpenseError("");
    try {
      await deleteTripExpense(selectedTrip.id, expense.id);
      setExpenses((current) => current.filter((e) => e.id !== expense.id));
      if (editingExpense?.id === expense.id) setEditingExpense(null);
      refreshBalances();
    } catch (err) {
      setExpenseError(err.message || "Could not delete expense.");
    } finally {
      setDeletingExpenseId(null);
    }
  }

  function openAddModal() {
    setModalError("");
    setShowAddExpense(true);
  }

  function openEditModal(expense) {
    setModalError("");
    setEditingExpense(expense);
  }

  function closeModals() {
    setShowAddExpense(false);
    setEditingExpense(null);
    setModalError("");
  }

  const tabClass = (tab) =>
    `pb-3 text-xs font-bold transition-all flex items-center gap-2 ${
      activeTab === tab
        ? "active text-emerald-800"
        : "text-slate-500 hover:text-slate-800"
    }`;

  async function handleJoinTrip(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!groupCode.trim()) {
      setError("Enter a group code.");
      return;
    }

    setJoining(true);

    try {
      const data = await joinTrip(groupCode.trim());

      setGroupCode("");
      setSuccess(data.message || "Joined trip successfully!");

      await loadTrips();
    } catch (err) {
      setError(err.message || "Could not join trip.");
    } finally {
      setJoining(false);
    }
  }

  async function handleCreateTrip(event) {
    event.preventDefault();

    const trimmedName = tripName.trim();

    if (!trimmedName) {
      setError("Enter a trip name.");
      return;
    }

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const data = await createTrip(trimmedName);
      setTripName("");
      setSuccess("Trip created successfully.");
      await loadTrips();
      // Only works if your createTrip service returns { trip }.
      // Otherwise the new trip simply appears in the list.
      if (data?.trip) openTrip(data.trip);
    } catch (err) {
      setError(err.message || "Could not create trip.");
    } finally {
      setCreating(false);
    }
  }

  const [copiedCode, setCopiedCode] = useState(null);

  async function handleCopyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      // setSuccess(`Copied group code: ${code}`);
      setError("");
      setCopiedCode(code);
      setTimeout(() => {
        setCopiedCode(null);
      }, 3000);
    } catch {
      setError("Could not copy automatically. Please copy the code manually.");
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const expenseMembers = (selectedTrip?.members || [])
    .map((member) => {
      const memberUser = member.user || member;

      return {
        userId: member.userId ?? memberUser.id,
        username: memberUser.username,
      };
    })
    .filter(
      (member) =>
        Number.isSafeInteger(Number(member.userId)) &&
        Number(member.userId) > 0 &&
        typeof member.username === "string",
    )
    .map((member) => ({
      userId: Number(member.userId),
      username: member.username,
    }));

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <span className="brand">CASH.</span>

        <div className="header-right">
          <span className="user-label">{user?.username || "User"}</span>

          <button
            type="button"
            className="secondary-button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </header>

      <section className="dashboard-content">
        {!selectedTrip && (
          <>
            <div className="welcome-section">
              <p className="eyebrow">YOUR SPACE</p>
              <h1>Hey, {user?.username || "there"}!</h1>
              <p className="muted">
                Create a trip or join your friends using a group code.
              </p>
            </div>

            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            {success && <p className="success-message">{success}</p>}

            <div className="card">
              <div className="create-trip-card">
                <div>
                  <p className="eyebrow">START A GROUP</p>
                  <h2>Create a trip</h2>
                  <p className="muted">
                    Start a new trip and share its code with your friends.
                  </p>
                </div>

                <form className="trip-form" onSubmit={handleCreateTrip}>
                  <label htmlFor="tripName">Trip name</label>
                  <input
                    id="tripName"
                    value={tripName}
                    onChange={(event) => setTripName(event.target.value)}
                    placeholder="e.g. Goa Trip"
                    maxLength={100}
                    required
                  />

                  <button type="submit" disabled={creating}>
                    {creating ? "Creating..." : "+ Create trip"}
                  </button>
                </form>
              </div>

              <div className="create-trip-card join-trip-card">
                <div>
                  <p className="eyebrow">JOIN YOUR FRIENDS</p>
                  <h2>Join a trip</h2>
                  <p className="muted">
                    Enter the group code shared by the trip creator.
                  </p>
                </div>

                <form className="trip-form" onSubmit={handleJoinTrip}>
                  <label htmlFor="groupCode">Group code</label>
                  <input
                    id="groupCode"
                    value={groupCode}
                    onChange={(event) =>
                      setGroupCode(event.target.value.toUpperCase())
                    }
                    placeholder="e.g. GOA7K2"
                    maxLength={15}
                    autoCapitalize="characters"
                    required
                  />

                  <button type="submit" disabled={joining}>
                    {joining ? "Joining..." : "Join trip"}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}

        {selectedTrip ? (
          <section className="trip-expenses">
            <button
              type="button"
              className="secondary-button"
              onClick={closeTrip}
            >
              ← Back to trips
            </button>
            <h2>{selectedTrip.name}</h2>

            {(error || expenseError) && (
              <p className="error-message" role="alert">
                {error || expenseError}
              </p>
            )}
            {success && <p className="success-message">{success}</p>}

            <div
              className="group-code-section"
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <p>Group code: {selectedTrip.groupCode}</p>
              <button
                type="button"
                className="secondary-button"
                onClick={() => handleCopyCode(selectedTrip.groupCode)}
              >
                {copiedCode === selectedTrip.groupCode
                  ? "Copied!"
                  : "Copy code"}
              </button>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                type="button"
                className="secondary-button"
                onClick={openAddModal}
              >
                + Add expense
              </button>
            </div>

            <div className="tab-buttons" style={{ marginTop: "20px" }}>
              <button
                type="button"
                data-tab="EXPENSES"
                onClick={() => setActiveTab("EXPENSES")}
                className={tabClass("EXPENSES")}
              >
                <span>Expenses</span>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-600 font-bold ml-2">
                  ({expenses.length})
                </span>
              </button>

              <button
                type="button"
                data-tab="BALANCES"
                onClick={() => setActiveTab("BALANCES")}
                className={tabClass("BALANCES")}
              >
                <span>Balances</span>
              </button>
            </div>

            {activeTab === "EXPENSES" &&
              (expensesLoading ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                  <p className="text-xs text-slate-500 font-medium">
                    Loading expenses...
                  </p>
                </div>
              ) : (
                <ExpenseList
                  expenses={expenses}
                  onEdit={openEditModal}
                  onDelete={handleDeleteExpense}
                  deletingExpenseId={deletingExpenseId}
                />
              ))}

            {activeTab === "BALANCES" && (
              <TripBalances
                tripId={selectedTrip.id}
                refreshKey={balancesRefreshKey}
              />
            )}

            {(showAddExpense || editingExpense) && (
              <div
                className="modal-overlay"
                role="dialog"
                aria-modal="true"
                onClick={closeModals}
              >
                <div
                  className="modal-container"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h2 className="modal-title">
                      {editingExpense ? "Edit expense" : "Add expense"}
                    </h2>
                    <button
                      type="button"
                      onClick={closeModals}
                      aria-label="Close"
                      className="modal-close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {modalError && (
                    <p role="alert" className="modal-error">
                      {modalError}
                    </p>
                  )}

                  {editingExpense ? (
                    <ExpenseForm
                      members={expenseMembers}
                      expenseToEdit={editingExpense}
                      onUpdate={handleUpdateExpense}
                      onCancel={closeModals}
                    />
                  ) : (
                    <ExpenseForm
                      members={expenseMembers}
                      onCreate={handleCreateExpense}
                      onCancel={closeModals}
                    />
                  )}
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="trips-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR GROUPS</p>
                <h2>Your trips</h2>
              </div>

              <span className="trip-count">
                {trips.length} {trips.length === 1 ? "trip" : "trips"}
              </span>
            </div>

            {loading ? (
              <p className="muted">Loading trips...</p>
            ) : trips.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✦</div>
                <h3>No trips yet</h3>
                <p className="muted">
                  Create a trip or join one with a group code.
                </p>
              </div>
            ) : (
              <div className="trips-grid">
                {trips.map((trip) => (
                  <article className="trip-card" key={trip.id}>
                    <div className="trip-card-header">
                      <div className="trip-icon">✈</div>
                      <button type="button" onClick={() => openTrip(trip)}>
                        View expenses
                      </button>
                    </div>

                    <h3>{trip.name}</h3>

                    <p className="muted">
                      {trip.creatorId === user?.id
                        ? "Created by you"
                        : "Shared with you"}
                    </p>

                    <div className="group-code">
                      <span>{trip.groupCode}</span>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleCopyCode(trip.groupCode)}
                      >
                        {copiedCode === trip.groupCode
                          ? "Copied!"
                          : "Copy code"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
