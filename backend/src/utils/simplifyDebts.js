/**
 * Debt Simplification Algorithm
 *
 * Given a set of balances (positive = creditor, negative = debtor),
 * this algorithm minimizes the number of transactions needed to settle all debts.
 *
 * Uses a greedy approach:
 * 1. Calculate net balances for each person
 * 2. Sort creditors and debtors by amount
 * 3. Match the largest debtor with the largest creditor
 * 4. Transfer min(|debtor_balance|, creditor_balance)
 * 5. Repeat until all settled
 *
 * This is optimal for minimizing the number of transactions.
 */

function simplifyDebts(balances) {
  // balances: { userId: number } — positive means person is owed money, negative means they owe
  const transactions = [];

  // Filter out zero balances
  const entries = Object.entries(balances)
    .map(([userId, amount]) => ({ userId: parseInt(userId), amount: parseFloat(amount) }))
    .filter((e) => Math.abs(e.amount) > 0.01); // Ignore near-zero due to floating point

  if (entries.length === 0) return transactions;

  // Separate into creditors (positive) and debtors (negative)
  let creditors = entries.filter((e) => e.amount > 0).sort((a, b) => b.amount - a.amount);
  let debtors = entries.filter((e) => e.amount < 0).sort((a, b) => a.amount - b.amount);

  // Greedy matching
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const transferAmount = Math.min(Math.abs(debtor.amount), creditor.amount);

    if (transferAmount > 0.01) {
      transactions.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(transferAmount * 100) / 100, // Round to 2 decimal places
      });
    }

    debtor.amount += transferAmount;
    creditor.amount -= transferAmount;

    if (Math.abs(debtor.amount) < 0.01) i++;
    if (Math.abs(creditor.amount) < 0.01) j++;
  }

  return transactions;
}

module.exports = { simplifyDebts };
