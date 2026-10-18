export function calculateSplits(amountPaise, participantIds) {
  if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
    throw new Error("Amount must be a positive whole number of paise.");
  }

  const uniqueIds = [...new Set(participantIds)];

  if (uniqueIds.length === 0) {
    throw new Error("Select at least one participant.");
  }

  const baseShare = Math.floor(amountPaise / uniqueIds.length);
  const remainder = amountPaise % uniqueIds.length;

  return uniqueIds.map((userId, index) => ({
    userId,
    sharePaise: baseShare + (index < remainder ? 1 : 0),
  }));
}
