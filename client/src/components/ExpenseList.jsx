function formatRupees(paise) {
  return (paise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
}

export default function ExpenseList({
  expenses,
  onEdit,
  onDelete,
  deletingExpenseId,
}) {
  if (!expenses.length) {
    return <p>No expenses yet. Add your first expense!</p>;
  }

  return (
    <section className="expense-list">
      <h3>Expenses</h3>

      {expenses.map((expense) => (
        <article key={expense.id} className="expense-card">
          <div className="expense-card-header">
            <div>
              <h4>{expense.name}</h4>
              <p>Paid by {expense.payer.username}</p>
            </div>

            <strong>{formatRupees(expense.amountPaise)}</strong>
          </div>

          <p>Split among {expense.participants.length} people</p>

          <ul>
            {expense.participants.map((participant) => (
              <li key={participant.userId}>
                {participant.user.username}:{" "}
                {formatRupees(participant.sharePaise)}
              </li>
            ))}
          </ul>

          <small>Added by {expense.createdBy.username}</small>

          <div className="expense-actions">
            <button
              type="button"
              onClick={() => onEdit(expense)}
              disabled={deletingExpenseId === expense.id}
            >
              Edit
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => onDelete(expense)}
              disabled={deletingExpenseId === expense.id}
            >
              {deletingExpenseId === expense.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
