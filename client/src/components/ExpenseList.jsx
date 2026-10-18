function formatRupees(paise) {
  return (paise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
}

export default function ExpenseList({ expenses }) {
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
        </article>
      ))}
    </section>
  );
}
