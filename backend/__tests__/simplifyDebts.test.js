const { simplifyDebts } = require('../src/utils/simplifyDebts');

describe('simplifyDebts', () => {
  test('returns empty array when all balances are zero', () => {
    const result = simplifyDebts({ 1: 0, 2: 0, 3: 0 });
    expect(result).toEqual([]);
  });

  test('returns empty array for empty object', () => {
    const result = simplifyDebts({});
    expect(result).toEqual([]);
  });

  test('returns empty array when no one owes anything', () => {
    const result = simplifyDebts({ 1: 0.005, 2: -0.005 });
    expect(result).toEqual([]);
  });

  test('handles two people — one debtor, one creditor', () => {
    const result = simplifyDebts({ 1: 50, 2: -50 });
    expect(result).toEqual([
      { from: 2, to: 1, amount: 50 },
    ]);
  });

  test('handles uneven split between two people', () => {
    const result = simplifyDebts({ 1: 30, 2: -30 });
    expect(result).toEqual([
      { from: 2, to: 1, amount: 30 },
    ]);
  });

  test('handles three people with circular debt', () => {
    // Alice is owed 40, Bob is owed 10, Charlie owes 50
    const result = simplifyDebts({ 1: 40, 2: 10, 3: -50 });
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ from: 3, to: 1, amount: 40 });
    expect(result).toContainEqual({ from: 3, to: 2, amount: 10 });
  });

  test('minimizes transactions for four people', () => {
    // Classic scenario: A owes B 10, B owes C 10, C owes D 10
    // Net: A=-10, B=0, C=0, D=10 — simplified to 1 transaction
    const result = simplifyDebts({ 1: -10, 2: 0, 3: 0, 4: 10 });
    expect(result).toEqual([
      { from: 1, to: 4, amount: 10 },
    ]);
  });

  test('handles multiple debtors and creditors optimally', () => {
    // A paid 100, B paid 0, C paid 0, D paid 0
    // Each should owe 25 → A is +75, B/C/D are -25 each
    const result = simplifyDebts({ 1: 75, 2: -25, 3: -25, 4: -25 });
    expect(result).toHaveLength(3);
    // Total transferred should equal 75
    const totalTransferred = result.reduce((sum, t) => sum + t.amount, 0);
    expect(totalTransferred).toBeCloseTo(75, 2);
    // Each debtor pays exactly 25
    for (const t of result) {
      expect(t.amount).toBeCloseTo(25, 2);
    }
  });

  test('rounds amounts to 2 decimal places', () => {
    const result = simplifyDebts({ 1: 33.33, 2: -33.33 });
    expect(result[0].amount).toBe(33.33);
  });

  test('handles string keys (as they may come from DB)', () => {
    const result = simplifyDebts({ '1': 50, '2': -50 });
    expect(result).toEqual([
      { from: 2, to: 1, amount: 50 },
    ]);
  });

  test('handles floating point precision edge cases', () => {
    const result = simplifyDebts({ 1: 0.1 + 0.2, 2: -(0.1 + 0.2) });
    // Should produce exactly one transaction
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBeCloseTo(0.3, 2);
  });
});
