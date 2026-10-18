export function validateCreateExpense(body) {
  const {
    name,
    amountPaise,
    payerId,
    participantIds,
    sharingMode = "EQUAL",
    participantShares,
  } = body;

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

  if (!["EQUAL", "EXACT"].includes(sharingMode)) {
    return "Sharing mode must be EQUAL or EXACT.";
  }

  if (sharingMode === "EXACT") {
    if (!Array.isArray(participantShares)) {
      return "Exact shares are required for exact sharing.";
    }

    if (participantShares.length !== participantIds.length) {
      return "Provide an exact share for every selected participant.";
    }

    const shareIds = new Set();

    for (const share of participantShares) {
      if (!share || !Number.isSafeInteger(share.userId) || share.userId <= 0) {
        return "Every share must have a valid participant ID.";
      }

      if (!Number.isSafeInteger(share.sharePaise) || share.sharePaise <= 0) {
        return "Each exact share must be a positive whole number of paise.";
      }

      if (shareIds.has(share.userId)) {
        return "Duplicate participant shares are not allowed.";
      }

      shareIds.add(share.userId);
    }

    if (participantIds.some((id) => !shareIds.has(id))) {
      return "Provide an exact share for every selected participant.";
    }

    const sharesTotal = participantShares.reduce(
      (sum, share) => sum + share.sharePaise,
      0,
    );

    if (!Number.isSafeInteger(sharesTotal) || sharesTotal !== amountPaise) {
      return "Exact shares must add up to the expense amount.";
    }
  }

  return null;
}
