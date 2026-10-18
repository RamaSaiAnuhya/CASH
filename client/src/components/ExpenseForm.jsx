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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fill the form when an expense is selected for editing.
  useEffect(() => {
    if (expenseToEdit) {
      setName(expenseToEdit.name);
      setAmount((expenseToEdit.amountPaise / 100).toFixed(2));
      setPayerId(String(expenseToEdit.payerId));
      setParticipantIds(
        expenseToEdit.participants.map((participant) =>
          Number(participant.userId),
        ),
      );
    } else {
      setName("");
      setAmount("");
      setPayerId("");
      setParticipantIds([]);
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

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const numericAmount = Number(amount);
    const amountPaise = Math.round(numericAmount * 100);
    const numericPayerId = Number(payerId);

    if (!name.trim()) {
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

    setLoading(true);

    try {
      const expenseData = {
        name: name.trim(),
        amountPaise,
        payerId: numericPayerId,
        participantIds: participantIds.map(Number),
      };

      if (expenseToEdit) {
        await onUpdate(expenseToEdit.id, expenseData);
      } else {
        await onCreate(expenseData);
        setName("");
        setAmount("");
        setPayerId("");
        setParticipantIds([]);
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
        placeholder="3000.00"
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

      {participantIds.length > 0 && Number(amount) > 0 && (
        <p>
          Approximate share per person: ₹
          {(Number(amount) / participantIds.length).toFixed(2)}
        </p>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading}>
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
