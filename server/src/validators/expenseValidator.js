export function validateCreateExpense(body) {
  const { name, amountPaise, payerId, participantIds } = body;

  if (typeof name !== "string" || !name.trim()) {
    return "Expense name is required.";
  }

  if (name.trim().length > 100) {
    return "Expense name must be 100 characters or fewer.";
  }

  if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
    return "Amount must be a positive whole number of paise.";
  }

  if (!Number.isSafeInteger(payerId) || payerId <= 0) {
    return "A valid payer is required.";
  }

  if (!Array.isArray(participantIds) || participantIds.length === 0) {
    return "Select at least one participant.";
  }

  if (participantIds.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
    return "All participant IDs must be valid.";
  }

  if (new Set(participantIds).size !== participantIds.length) {
    return "Duplicate participants are not allowed.";
  }

  return null;
}
