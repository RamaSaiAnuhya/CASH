import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/authContext";
import { createTrip, getTrips, joinTrip } from "../services/authServices";

import ExpenseForm from "../components/ExpenseForm.jsx";
import ExpenseList from "../components/ExpenseList.jsx";
import {
  getTripExpenses,
  createTripExpense,
} from "../services/expenseService.js";

import TripBalances from "../components/TripBalances";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [tripName, setTripName] = useState("");
  const [groupCode, setGroupCode] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  async function handleCreateTrip(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!tripName.trim()) {
      setError("Enter a trip name.");
      return;
    }

    setCreating(true);

    try {
      const data = await createTrip(tripName.trim());

      setTripName("");
      setSuccess(`Trip created! Group code: ${data.trip.groupCode}`);

      await loadTrips();
    } catch (err) {
      setError(err.message || "Could not create trip.");
    } finally {
      setCreating(false);
    }
  }

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

  async function handleCopyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      setSuccess(`Copied group code: ${code}`);
      setError("");
    } catch {
      setError("Could not copy automatically. Please copy the code manually.");
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expenseError, setExpenseError] = useState("");

  async function openTrip(trip) {
    console.log("Selected trip:", trip);
    console.log("Trip members:", trip.members);

    setSelectedTrip(trip);
    setExpenses([]);
    setExpenseError("");
    setExpensesLoading(true);

    try {
      const result = await getTripExpenses(trip.id);
      setExpenses(result);
    } catch (error) {
      setExpenseError(error.message);
    } finally {
      setExpensesLoading(false);
    }
  }

  async function handleCreateExpense(expenseData) {
    const createdExpense = await createTripExpense(
      selectedTrip.id,
      expenseData,
    );

    setExpenses((current) => [createdExpense, ...current]);
  }

  function closeTrip() {
    setSelectedTrip(null);
    setExpenses([]);
    setExpenseError("");
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

        {success && (
          <p className="success-message" role="status">
            {success}
          </p>
        )}
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

        {selectedTrip ? (
          <section className="trip-expenses">
            <button type="button" onClick={closeTrip}>
              ← Back to trips
            </button>
            <h2>{selectedTrip.name}</h2>
            <p>Group code: {selectedTrip.groupCode}</p>
            <ExpenseForm
              members={expenseMembers}
              onCreate={handleCreateExpense}
            />
            {expenseError && (
              <p className="form-error" role="alert">
                {expenseError}
              </p>
            )}
            {expensesLoading ? (
              <p className="muted">Loading expenses...</p>
            ) : (
              <ExpenseList expenses={expenses} />
            )}
            <TripBalances
              tripId={selectedTrip.id}
              refreshKey={expenses.length}
            />
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
                        Copy code
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
