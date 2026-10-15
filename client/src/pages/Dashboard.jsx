import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/authContext";
import { createTrip, getTrips, joinTrip } from "../services/authServices";

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
                  <div className="trip-icon">✈</div>

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
      </section>
    </main>
  );
}
