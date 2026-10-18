import { useEffect, useState } from "react";
import { getTripBalances } from "../services/balanceService";

function formatRupees(amountPaise) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountPaise / 100);
}

export default function TripBalances({ tripId, refreshKey = 0 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadBalances() {
      setLoading(true);
      setError("");

      try {
        const result = await getTripBalances(tripId);

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load balances.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (tripId) {
      loadBalances();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [tripId, refreshKey, retry]);

  if (loading) {
    return <section className="balances-section">Loading balances...</section>;
  }

  if (error) {
    return (
      <section className="balances-section">
        <h3>Trip balances</h3>
        <p role="alert">{error}</p>
        <button type="button" onClick={() => setRetry((value) => value + 1)}>
          Retry
        </button>
      </section>
    );
  }

  if (!data) return null;

  return (
    <section className="balances-section">
      <h3>Trip balances</h3>

      <div className="balances-summary">
        <p>
          <strong>Total expenses:</strong>{" "}
          {formatRupees(data.totalExpensesPaise)}
        </p>
        <p>
          <strong>Number of expenses:</strong> {data.expenseCount}
        </p>
      </div>

      <h4>Member balances</h4>

      <div className="balance-list">
        {data.balances.map((member) => (
          <div className="balance-row" key={member.userId}>
            <span>{member.username}</span>
            <span className={`balance-amount ${member.status}`}>
              {member.balancePaise > 0
                ? `Gets back ${formatRupees(member.balancePaise)}`
                : member.balancePaise < 0
                  ? `Owes ${formatRupees(-member.balancePaise)}`
                  : "Settled"}
            </span>
          </div>
        ))}
      </div>

      <h4>Minimum suggested settlements</h4>

      {data.settlements.length === 0 ? (
        <p>Everyone is settled up!</p>
      ) : (
        <div className="settlement-list">
          {data.settlements.map((settlement, index) => (
            <div
              className="settlement-row"
              key={`${settlement.fromUserId}-${settlement.toUserId}-${index}`}
            >
              <span>
                <strong>{settlement.fromUsername}</strong>
                {" pays "}
                <strong>{settlement.toUsername}</strong>
              </span>
              <strong>{formatRupees(settlement.amountPaise)}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
