import { useEffect, useState } from "react";

export default function ExpenseForm({
  members,
  onCreate,
  onUpdate,
  expenseToEdit,
  onCancel,
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState("");
  const [participantIds, setParticipantIds] = useState([]);
  const [sharingMode, setSharingMode] = useState("EQUAL");
  const [exactShares, setExactShares] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (expenseToEdit) {
      setName(expenseToEdit.name);
      setAmount((expenseToEdit.amountPaise / 100).toFixed(2));
      setPayerId(String(expenseToEdit.payerId));
      setParticipantIds(
        expenseToEdit.participants.map((p) => Number(p.userId)),
      );
      setSharingMode(expenseToEdit.sharingMode || "EQUAL");

      const savedShares = {};
      expenseToEdit.participants.forEach((p) => {
        savedShares[p.userId] = (p.sharePaise / 100).toFixed(2);
      });
      setExactShares(savedShares);
    } else {
      setName("");
      setAmount("");
      setPayerId("");
      setParticipantIds([]);
      setSharingMode("EQUAL");
      setExactShares({});
    }

    setError("");
  }, [expenseToEdit]);

  function toggleParticipant(userId) {
    setParticipantIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  }

  function handleExactShareChange(userId, value) {
    setExactShares((current) => ({
      ...current,
      [userId]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const numericAmount = Number(amount);
    const amountPaise = Math.round(numericAmount * 100);
    const numericPayerId = Number(payerId);

    if (!trimmedName) {
      setError("Enter an expense name.");
      return;
    }

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !Number.isSafeInteger(amountPaise)
    ) {
      setError("Enter a valid amount.");
      return;
    }

    if (!Number.isSafeInteger(numericPayerId) || numericPayerId <= 0) {
      setError("Select who paid.");
      return;
    }

    if (participantIds.length === 0) {
      setError("Select at least one participant.");
      return;
    }

    let participantShares = [];

    if (sharingMode === "EXACT") {
      participantShares = participantIds.map((userId) => ({
        userId,
        sharePaise: Math.round(Number(exactShares[userId]) * 100),
      }));

      if (
        participantShares.some(
          (share) =>
            !Number.isSafeInteger(share.sharePaise) || share.sharePaise <= 0,
        )
      ) {
        setError("Enter a valid positive share for every participant.");
        return;
      }

      const sharesTotal = participantShares.reduce(
        (sum, share) => sum + share.sharePaise,
        0,
      );

      if (!Number.isSafeInteger(sharesTotal) || sharesTotal !== amountPaise) {
        setError("Exact shares must add up to the expense amount.");
        return;
      }
    }

    const expenseData = {
      name: trimmedName,
      amountPaise,
      payerId: numericPayerId,
      participantIds: participantIds.map(Number),
      sharingMode,
      ...(sharingMode === "EXACT" ? { participantShares } : {}),
    };

    setLoading(true);

    try {
      if (expenseToEdit) {
        await onUpdate(expenseToEdit.id, expenseData);
      } else {
        await onCreate(expenseData);
        setName("");
        setAmount("");
        setPayerId("");
        setParticipantIds([]);
        setSharingMode("EQUAL");
        setExactShares({});
      }
    } catch (err) {
      setError(
        err.message ||
          `Could not ${expenseToEdit ? "update" : "create"} expense.`,
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedCount = participantIds.length;
  const amountPaise = Math.round(Number(amount) * 100);

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h3>{expenseToEdit ? "Edit expense" : "Add an expense"}</h3>

      <label htmlFor="expense-name">Expense name</label>
      <input
        id="expense-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="e.g. Dinner"
        maxLength={100}
        required
      />

      <label htmlFor="expense-amount">Amount (₹)</label>
      <input
        id="expense-amount"
        type="number"
        min="0.01"
        step="0.01"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        placeholder="1500.00"
        required
      />

      <label htmlFor="expense-payer">Paid by</label>
      <select
        id="expense-payer"
        value={payerId}
        onChange={(event) => setPayerId(event.target.value)}
        required
      >
        <option value="">Select payer</option>
        {members.map((member) => (
          <option key={member.userId} value={member.userId}>
            {member.username}
          </option>
        ))}
      </select>

      <fieldset>
        <legend>Split among</legend>
        {members.map((member) => (
          <label key={member.userId} className="participant-option">
            <input
              type="checkbox"
              checked={participantIds.includes(member.userId)}
              onChange={() => toggleParticipant(member.userId)}
            />
            {member.username}
          </label>
        ))}
      </fieldset>

      <label htmlFor="sharing-mode">Sharing method</label>
      <select
        id="sharing-mode"
        value={sharingMode}
        onChange={(event) => setSharingMode(event.target.value)}
      >
        <option value="EQUAL">Split equally</option>
        <option value="EXACT">Enter exact shares</option>
      </select>

      {sharingMode === "EQUAL" && selectedCount > 0 && Number(amount) > 0 && (
        <p>
          Approximate share per person: ₹
          {(Number(amount) / selectedCount).toFixed(2)}
        </p>
      )}

      {sharingMode === "EXACT" && (
        <fieldset>
          <legend>Amount owed by each participant (₹)</legend>
          {participantIds.map((userId) => {
            const member = members.find((m) => m.userId === userId);
            if (!member) return null;

            return (
              <div key={userId} className="exact-share-row">
                <label htmlFor={`share-${userId}`}>{member.username}</label>
                <input
                  id={`share-${userId}`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={exactShares[userId] ?? ""}
                  onChange={(event) =>
                    handleExactShareChange(userId, event.target.value)
                  }
                  required
                />
              </div>
            );
          })}

          <p>
            Entered shares: ₹
            {(
              participantIds.reduce(
                (sum, userId) =>
                  sum +
                  (Number(exactShares[userId]) > 0
                    ? Math.round(Number(exactShares[userId]) * 100)
                    : 0),
                0,
              ) / 100
            ).toFixed(2)}
            {" / "}₹{(amountPaise / 100).toFixed(2)}
          </p>
        </fieldset>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-save">
        {loading
          ? "Saving..."
          : expenseToEdit
            ? "Save changes"
            : "Save expense"}
      </button>

      {expenseToEdit && onCancel && (
        <button type="button" onClick={onCancel} disabled={loading}>
          Cancel editing
        </button>
      )}
    </form>
  );
}
