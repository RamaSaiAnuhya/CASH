import { useState } from "react"; // 1. Import useState

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
  // 2. Track which expense is expanded
  const [expandedExpenseId, setExpandedExpenseId] = useState(null);

  if (!expenses.length) {
    return <p>No expenses yet. Add your first expense!</p>;
  }

  const toggleExpand = (id) => {
    setExpandedExpenseId(expandedExpenseId === id ? null : id);
  };

  return (
    <section className="expense-list">
      {expenses.map((expense) => {
        const isExpanded = expandedExpenseId === expense.id;

        return (
          <article key={expense.id} className="expense-card">
            {/* 3. Make the header clickable to toggle details */}
            <div
              className="expense-card-header"
              onClick={() => toggleExpand(expense.id)}
              style={{ cursor: "pointer" }}
              role="button"
              aria-expanded={isExpanded}
            >
              <div>
                <h4>{expense.name}</h4>
                <p>Paid by {expense.payer.username}</p>
              </div>
              <strong>{formatRupees(expense.amountPaise)}</strong>
            </div>

            {/* 4. Conditionally render details based on state */}
            {isExpanded && (
              <div
                className="expense-card-details"
                onClick={() => toggleExpand(expense.id)}
                style={{ cursor: "pointer" }}
              >
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
                    className="btn-edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(expense);
                    }}
                    disabled={deletingExpenseId === expense.id}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(expense);
                    }}
                    disabled={deletingExpenseId === expense.id}
                  >
                    {deletingExpenseId === expense.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
