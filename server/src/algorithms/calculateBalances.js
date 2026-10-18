function calculateBalances(members, expenses) {
  const balances = new Map();

  // Include every trip member, even if they have no expenses.
  for (const member of members) {
    balances.set(member.userId, {
      userId: member.userId,
      username: member.user.username,
      balancePaise: 0,
    });
  }

  for (const expense of expenses) {
    const payer = balances.get(expense.payerId);

    if (payer) {
      // The payer initially paid the full expense.
      payer.balancePaise += expense.amountPaise;
    }

    for (const participant of expense.participants) {
      const member = balances.get(participant.userId);

      if (member) {
        // Each participant owes their allocated share.
        member.balancePaise -= participant.sharePaise;
      }
    }
  }

  return Array.from(balances.values()).map((member) => ({
    ...member,
    balance: member.balancePaise / 100,
    status:
      member.balancePaise > 0
        ? "gets_back"
        : member.balancePaise < 0
          ? "owes"
          : "settled",
  }));
}

export default calculateBalances;
