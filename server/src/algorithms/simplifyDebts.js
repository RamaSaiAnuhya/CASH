function simplifyDebts(balances) {
  const debtors = [];
  const creditors = [];

  for (const member of balances) {
    if (member.balancePaise < 0) {
      debtors.push({
        userId: member.userId,
        username: member.username,
        amountPaise: -member.balancePaise,
      });
    } else if (member.balancePaise > 0) {
      creditors.push({
        userId: member.userId,
        username: member.username,
        amountPaise: member.balancePaise,
      });
    }
  }

  // Largest debts and credits are processed first.
  debtors.sort((a, b) => b.amountPaise - a.amountPaise);
  creditors.sort((a, b) => b.amountPaise - a.amountPaise);

  const settlements = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const amountPaise = Math.min(debtor.amountPaise, creditor.amountPaise);

    settlements.push({
      fromUserId: debtor.userId,
      fromUsername: debtor.username,
      toUserId: creditor.userId,
      toUsername: creditor.username,
      amountPaise,
      amount: amountPaise / 100,
    });

    debtor.amountPaise -= amountPaise;
    creditor.amountPaise -= amountPaise;

    if (debtor.amountPaise === 0) {
      debtorIndex++;
    }

    if (creditor.amountPaise === 0) {
      creditorIndex++;
    }
  }

  return settlements;
}

export default simplifyDebts;
