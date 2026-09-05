import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';
import { useSocket } from '../hooks/useSocket';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'cash', label: '💵 Cash', icon: '💵' },
  { id: 'upi', label: '📱 UPI', icon: '📱' },
  { id: 'card', label: '💳 Card', icon: '💳' },
  { id: 'bank', label: '🏦 Bank Transfer', icon: '🏦' },
];

export default function GroupDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [qrModal, setQrModal] = useState(null);

  const loadGroup = useCallback(async () => {
    try { const data = await api.getGroup(id); setGroup(data); }
    catch (err) { toast.error('Failed to load group'); setError('Failed to load group.'); }
  }, [id]);

  const loadExpenses = useCallback(async () => {
    try { const data = await api.getGroupExpenses(id); setExpenses(data); }
    catch (err) { toast.error('Failed to load expenses'); }
  }, [id]);

  const loadBalances = useCallback(async () => {
    try { const data = await api.getBalances(id); setBalances(data); }
    catch (err) { toast.error('Failed to load balances'); }
  }, [id]);

  const loadSettlements = useCallback(async () => {
    try { const data = await api.getSettlements(id); setSettlements(data); }
    catch (err) { toast.error('Failed to load settlements'); }
  }, [id]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadGroup(), loadExpenses(), loadBalances(), loadSettlements()]);
    setLoading(false);
  }, [loadGroup, loadExpenses, loadBalances, loadSettlements]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useSocket(id, {
    'expense-created': (expense) => { setExpenses((prev) => [expense, ...prev]); loadBalances(); loadSettlements(); toast(`${expense.paid_by_name} added "${expense.description}" — ₹${parseFloat(expense.amount).toFixed(2)}`, { icon: '💸' }); },
    'expense-deleted': () => { loadExpenses(); loadBalances(); },
    'settlement-created': (settlement) => { setSettlements((prev) => [settlement, ...prev]); loadBalances(); toast(`${settlement.from_user_name} paid ${settlement.to_user_name} ₹${parseFloat(settlement.amount).toFixed(2)}`, { icon: '✅' }); },
    'settlement-deleted': () => { loadSettlements(); loadBalances(); },
    'member-added': () => loadGroup(),
    'member-removed': () => loadGroup(),
  });

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (error || !group) return (
    <div className="loading-screen">
      <div className="empty-state">
        <p>{error || 'Group not found'}</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>← Back to Dashboard</Link>
      </div>
    </div>
  );

  return (
    <div className="group-detail">
      <header className="navbar">
        <div className="navbar-brand">
          <Link to="/" className="back-btn"><span className="back-icon">←</span> Back</Link>
          <h1>{group.name}</h1>
        </div>
        <div className="navbar-user">
          <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <span>{user?.name}</span>
        </div>
      </header>

      <main className="group-content">
        <div className="group-info-bar">
          <div className="group-info-left">
            <p>{group.description}</p>
            <span className="member-count">👥 {group.members?.length} members</span>
          </div>
          <button onClick={() => setShowAddMember(true)} className="btn btn-outline btn-sm">+ Add Member</button>
        </div>

        <div className="members-row">
          {group.members?.map((member) => (
            <div key={member.id} className="member-chip">
              <span className="member-avatar">{member.name[0].toUpperCase()}</span>
              <span>{member.name}</span>
            </div>
          ))}
        </div>

        <div className="tabs">
          <button className={`tab ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>Expenses ({expenses.length})</button>
          <button className={`tab ${activeTab === 'balances' ? 'active' : ''}`} onClick={() => setActiveTab('balances')}>Balances</button>
          <button className={`tab ${activeTab === 'settlements' ? 'active' : ''}`} onClick={() => setActiveTab('settlements')}>Settlements ({settlements.length})</button>
        </div>

        {activeTab === 'expenses' && (
          <div className="tab-content">
            <div className="tab-header">
              <button onClick={() => setShowAddExpense(true)} className="btn btn-primary">+ Add Expense</button>
            </div>
            {expenses.length === 0 ? (
              <div className="empty-state"><p>No expenses yet. Add your first expense!</p></div>
            ) : (
              <div className="expense-list">
                {expenses.map((expense) => (
                  <div key={expense.id} className="expense-card">
                    <div className="expense-header">
                      <div>
                        <h4>{expense.description}</h4>
                        <p className="expense-meta">
                          Paid by <strong>{expense.paid_by_name}</strong> · {new Date(expense.created_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <span className="expense-amount">₹{parseFloat(expense.amount).toFixed(2)}</span>
                    </div>
                    <div className="expense-splits">
                      {expense.splits?.map((split) => (
                        <span key={split.user_id} className="split-chip">
                          {split.user_name}: ₹{parseFloat(split.amount).toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'balances' && balances && (
          <div className="tab-content">
            <div className="balances-summary">
              <h3>Total Expenses: ₹{parseFloat(balances.totalExpenses).toFixed(2)}</h3>
            </div>
            <div className="members-balances">
              <h4>Individual Balances</h4>
              {balances.members?.map((member) => (
                <div key={member.id} className="balance-row">
                  <div className="balance-user">
                    <span className="member-avatar">{member.name[0].toUpperCase()}</span>
                    <span>{member.name}</span>
                  </div>
                  <span className={`balance-amount ${member.balance > 0 ? 'positive' : member.balance < 0 ? 'negative' : 'zero'}`}>
                    {member.balance > 0 ? '+' : ''}₹{member.balance.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="simplified-debts">
              <h4>⚡ Simplified Settlements</h4>
              {balances.transactions?.length === 0 ? (
                <p className="all-settled">✅ All settled up!</p>
              ) : (
                balances.transactions?.map((tx, i) => {
                  const isMyDebt = user && tx.from.id === user.id;
                  return (
                    <div key={i} className="settlement-row">
                      <div className="settlement-flow">
                        <span className="settlement-user">{tx.from.name}</span>
                        <span className="settlement-arrow">→</span>
                        <span className="settlement-user">{tx.to.name}</span>
                      </div>
                      <div className="settlement-amount-action">
                        <span className="settlement-amount">₹{tx.amount.toFixed(2)}</span>
                        {isMyDebt ? (
                          <>
                            <button onClick={() => setQrModal({ toUser: tx.to, amount: tx.amount, fromUser: tx.from })} className="btn btn-sm" title="Pay via UPI">📱 Pay</button>
                            <button
                              onClick={async () => {
                                try {
                                  await api.createSettlement({ groupId: parseInt(id), fromUser: tx.from.id, toUser: tx.to.id, amount: tx.amount, paymentMethod: 'cash' });
                                  toast.success('Settlement recorded!');
                                  loadBalances(); loadSettlements();
                                } catch (err) { toast.error(err.message); }
                              }}
                              className="btn btn-cash btn-sm"
                            >💵 Cash</button>
                          </>
                        ) : (
                          <span className="settlement-status">owed to {tx.to.name}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'settlements' && (
          <div className="tab-content">
            {settlements.length === 0 ? (
              <div className="empty-state"><p>No settlements yet.</p></div>
            ) : (
              <div className="settlement-list">
                {settlements.map((s) => (
                  <div key={s.id} className="settlement-card">
                    <div className="settlement-card-content">
                      <span className="settlement-user">{s.from_user_name}</span>
                      <span className="settlement-arrow">→</span>
                      <span className="settlement-user">{s.to_user_name}</span>
                      <span className="settlement-amount">₹{parseFloat(s.amount).toFixed(2)}</span>
                    </div>
                    <p className="settlement-date">{new Date(s.settled_at).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {showAddExpense && <AddExpenseModal group={group} onClose={() => setShowAddExpense(false)} onCreated={() => { setShowAddExpense(false); loadExpenses(); loadBalances(); }} />}
      {showAddMember && <AddMemberModal groupId={id} onClose={() => setShowAddMember(false)} onAdded={() => { setShowAddMember(false); loadGroup(); }} />}
      {qrModal && <QRCodeModal toUser={qrModal.toUser} fromUser={qrModal.fromUser} amount={qrModal.amount} onClose={() => setQrModal(null)} onSettled={() => { setQrModal(null); loadBalances(); loadSettlements(); }} groupId={id} />}
    </div>
  );
}

/* ===== Add Expense Modal ===== */
function AddExpenseModal({ group, onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ description: '', amount: '', paidBy: user?.id || '', paymentMethod: 'cash' });
  const [selectedMembers, setSelectedMembers] = useState(() => new Set(group.members?.map((m) => m.id) || []));
  const [splitMode, setSplitMode] = useState('equal');
  const [customAmounts, setCustomAmounts] = useState({});
  const [percentages, setPercentages] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const members = group.members || [];
  const selectedCount = selectedMembers.size;
  const totalAmount = parseFloat(form.amount) || 0;

  useEffect(() => {
    if (splitMode === 'custom' && totalAmount > 0 && selectedCount > 0) {
      const pp = Math.round((totalAmount / selectedCount) * 100) / 100;
      const u = {}; members.forEach((m) => { if (selectedMembers.has(m.id)) u[m.id] = customAmounts[m.id] ?? pp; }); setCustomAmounts(u);
    }
    if (splitMode === 'percentage' && selectedCount > 0) {
      const ep = Math.round((100 / selectedCount) * 10) / 10;
      const u = {}; members.forEach((m) => { if (selectedMembers.has(m.id)) u[m.id] = percentages[m.id] ?? ep; }); setPercentages(u);
    }
  }, [totalAmount, selectedCount, splitMode]);

  const toggleMember = (id) => {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); setCustomAmounts((p) => { const c = { ...p }; delete c[id]; return c; }); setPercentages((p) => { const c = { ...p }; delete c[id]; return c; }); }
      else { next.add(id); const n = next.size; if (splitMode === 'custom' && totalAmount > 0) setCustomAmounts((p) => ({ ...p, [id]: Math.round((totalAmount / n) * 100) / 100 })); if (splitMode === 'percentage') setPercentages((p) => ({ ...p, [id]: Math.round((100 / n) * 10) / 10 })); }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedMembers(new Set(members.map((m) => m.id)));
    if (splitMode === 'custom' && totalAmount > 0) { const pp = Math.round((totalAmount / members.length) * 100) / 100; const u = {}; members.forEach((m) => { u[m.id] = pp; }); setCustomAmounts(u); }
    if (splitMode === 'percentage') { const ep = Math.round((100 / members.length) * 10) / 10; const u = {}; members.forEach((m) => { u[m.id] = ep; }); setPercentages(u); }
  };

  const selectNone = () => { setSelectedMembers(new Set()); setCustomAmounts({}); setPercentages({}); };

  const handleCustomAmount = (id, v) => { const n = parseFloat(v); setCustomAmounts((p) => ({ ...p, [id]: isNaN(n) ? 0 : n })); };
  const handlePercentage = (id, v) => { const n = parseFloat(v); setPercentages((p) => ({ ...p, [id]: isNaN(n) ? 0 : n })); };

  const customTotal = Object.values(customAmounts).reduce((s, v) => s + (v || 0), 0);
  const customRemainder = Math.round((totalAmount - customTotal) * 100) / 100;
  const pctTotal = Object.values(percentages).reduce((s, v) => s + (v || 0), 0);
  const pctRemainder = Math.round((100 - pctTotal) * 10) / 10;

  const validate = (f, v) => { if (f === 'description') return v.trim() ? '' : 'Description is required'; if (f === 'amount') { if (!v) return 'Amount is required'; const n = parseFloat(v); return (isNaN(n) || n <= 0) ? 'Must be greater than 0' : ''; } return ''; };
  const handleChange = (f, v) => { setForm((p) => ({ ...p, [f]: v })); if (touched[f]) setErrors((p) => ({ ...p, [f]: validate(f, v) })); };
  const handleBlur = (f) => { setTouched((p) => ({ ...p, [f]: true })); setErrors((p) => ({ ...p, [f]: validate(f, form[f]) })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const de = validate('description', form.description), ae = validate('amount', form.amount);
    setErrors({ description: de, amount: ae }); setTouched({ description: true, amount: true });
    if (de || ae) return;
    if (selectedCount === 0) { toast.error('Select at least one person'); return; }
    if (splitMode === 'custom' && Math.abs(customRemainder) > 0.02) { toast.error(`Splits off by ₹${Math.abs(customRemainder).toFixed(2)}`); return; }
    if (splitMode === 'percentage' && Math.abs(pctRemainder) > 0.1) { toast.error(`Percentages off by ${Math.abs(pctRemainder).toFixed(1)}%`); return; }

    setSubmitting(true);
    try {
      const amount = parseFloat(form.amount);
      let splits;
      if (splitMode === 'equal') { const pp = Math.round((amount / selectedCount) * 100) / 100; splits = members.filter((m) => selectedMembers.has(m.id)).map((m) => ({ userId: m.id, amount: pp })); }
      else if (splitMode === 'custom') { splits = members.filter((m) => selectedMembers.has(m.id)).map((m) => ({ userId: m.id, amount: Math.round((customAmounts[m.id] || 0) * 100) / 100 })); }
      else { splits = members.filter((m) => selectedMembers.has(m.id)).map((m) => ({ userId: m.id, amount: Math.round((amount * (percentages[m.id] || 0) / 100) * 100) / 100, percentage: percentages[m.id] || 0 })); }

      await api.createExpense({ groupId: parseInt(group.id), description: form.description.trim(), amount, paidBy: parseInt(form.paidBy), splitType: splitMode === 'custom' ? 'exact' : splitMode === 'percentage' ? 'percentage' : 'equal', splits, paymentMethod: form.paymentMethod });
      toast.success('Expense added!'); onCreated();
    } catch (err) { toast.error(err.message); } finally { setSubmitting(false); }
  };

  const perPerson = selectedCount > 0 ? (totalAmount / selectedCount).toFixed(2) : '0.00';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>New Expense</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>What was it for?</label>
            <input type="text" value={form.description} onChange={(e) => handleChange('description', e.target.value)} onBlur={() => handleBlur('description')} placeholder="Dinner, Auto, Groceries..." maxLength={500} autoFocus className={touched.description && errors.description ? 'field-error' : ''} />
            {touched.description && errors.description && <span className="field-error-msg">{errors.description}</span>}
          </div>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => handleChange('amount', e.target.value)} onBlur={() => handleBlur('amount')} placeholder="0.00" className={touched.amount && errors.amount ? 'field-error' : ''} />
            {touched.amount && errors.amount && <span className="field-error-msg">{errors.amount}</span>}
          </div>
          <div className="form-group">
            <label>Paid by</label>
            <select value={form.paidBy} onChange={(e) => setForm({ ...form, paidBy: e.target.value })}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Paid through</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {PAYMENT_METHODS.map((pm) => (
                <button key={pm.id} type="button" onClick={() => setForm({ ...form, paymentMethod: pm.id })}
                  className={`btn btn-sm ${form.paymentMethod === pm.id ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: '1 1 auto' }}
                >{pm.label}</button>
              ))}
            </div>
          </div>

          <div className="member-selector">
            <div className="member-selector-header">
              <label>Split between ({selectedCount}/{members.length})</label>
              <div className="member-toggle-btns">
                <button type="button" onClick={selectAll} className={selectedCount === members.length ? 'active' : ''}>All</button>
                <button type="button" onClick={selectNone} className={selectedCount === 0 ? 'active' : ''}>None</button>
              </div>
            </div>
            <div className="split-mode-toggle">
              <button type="button" className={`split-mode-btn ${splitMode === 'equal' ? 'active' : ''}`} onClick={() => setSplitMode('equal')}>⚖️ Equal</button>
              <button type="button" className={`split-mode-btn ${splitMode === 'custom' ? 'active' : ''}`} onClick={() => setSplitMode('custom')}>✏️ Custom</button>
              <button type="button" className={`split-mode-btn ${splitMode === 'percentage' ? 'active' : ''}`} onClick={() => setSplitMode('percentage')}>📐 %</button>
            </div>
            <div className="member-list-select">
              {members.map((m) => {
                const sel = selectedMembers.has(m.id);
                const pct = percentages[m.id] || 0;
                const dp = totalAmount > 0 ? (totalAmount * pct / 100).toFixed(2) : '0.00';
                return (
                  <div key={m.id} className={`member-select-item ${sel ? 'selected' : ''}`}>
                    <input type="checkbox" checked={sel} onChange={() => toggleMember(m.id)} />
                    <span className="member-avatar">{m.name[0].toUpperCase()}</span>
                    <span className="member-name">{m.name}</span>
                    {sel && (splitMode === 'equal' ? <span className="member-share">₹{perPerson}</span>
                      : splitMode === 'custom' ? <div className="custom-amount-input"><span className="custom-dollar">₹</span><input type="number" step="0.01" min="0" value={customAmounts[m.id] ?? ''} onChange={(e) => handleCustomAmount(m.id, e.target.value)} className="custom-amount-field" placeholder="0.00" /></div>
                      : <div className="custom-amount-input"><input type="number" step="0.1" min="0" max="100" value={percentages[m.id] ?? ''} onChange={(e) => handlePercentage(m.id, e.target.value)} className="custom-amount-field" placeholder="0" /><span className="custom-dollar">%</span><span className="pct-dollar-amount">₹{dp}</span></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {splitMode === 'equal' ? <div className="split-preview">₹{perPerson} per person · {selectedCount} {selectedCount === 1 ? 'person' : 'people'}</div>
            : splitMode === 'custom' ? <div className={`split-preview ${Math.abs(customRemainder) > 0.02 ? 'split-error' : 'split-ok'}`}>Total: ₹{customTotal.toFixed(2)} / ₹{totalAmount.toFixed(2)}{Math.abs(customRemainder) > 0.02 && <span className="split-remainder"> (off by ₹{Math.abs(customRemainder).toFixed(2)})</span>}</div>
            : <div className={`split-preview ${Math.abs(pctRemainder) > 0.1 ? 'split-error' : 'split-ok'}`}>{pctTotal.toFixed(1)}% / 100%{Math.abs(pctRemainder) > 0.1 && <span className="split-remainder"> (off by {Math.abs(pctRemainder).toFixed(1)}%)</span>}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Adding...' : 'Add Expense'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===== QR Code + UPI Payment Modal ===== */
function QRCodeModal({ toUser, fromUser, amount, onClose, onSettled, groupId }) {
  const canvasRef = useRef(null);
  const [payMethod, setPayMethod] = useState('upi');

  useEffect(() => {
    if (canvasRef.current) {
      const upiUrl = `upi://pay?pa=${toUser.email || 'user@upi'}&pn=${encodeURIComponent(toUser.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Payment to ${toUser.name}`)}`;
      QRCode.toCanvas(canvasRef.current, upiUrl, { width: 200, margin: 2, color: { dark: '#1a1a1a', light: '#ffffff' } }, (err) => { if (err) console.error('QR Error:', err); });
    }
  }, [toUser, amount]);

  const handlePay = () => {
    const upiUrl = `upi://pay?pa=${toUser.email || 'user@upi'}&pn=${encodeURIComponent(toUser.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Payment to ${toUser.name}`)}`;
    window.open(upiUrl, '_blank');
  };

  const handleRecordPayment = async (method) => {
    try {
      await api.createSettlement({ groupId: parseInt(groupId), fromUser: fromUser.id, toUser: toUser.id, amount, paymentMethod: method });
      toast.success(`Settled via ${method === 'cash' ? 'Cash' : 'UPI'}!`);
      onSettled();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Pay ₹{amount.toFixed(2)}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
          <strong>{fromUser.name}</strong> pays <strong>{toUser.name}</strong>
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <button className={`btn btn-sm ${payMethod === 'upi' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPayMethod('upi')} style={{ flex: 1 }}>📱 UPI</button>
          <button className={`btn btn-sm ${payMethod === 'cash' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPayMethod('cash')} style={{ flex: 1 }}>💵 Cash</button>
        </div>

        {payMethod === 'upi' ? (
          <div className="qr-section">
            <canvas ref={canvasRef} className="qr-canvas" />
            <p style={{ marginTop: 'var(--space-3)' }}>Scan with any UPI app</p>
            <p style={{ fontWeight: 900, fontSize: 'var(--text-h3)', color: 'var(--text)' }}>₹{amount.toFixed(2)}</p>
            <button onClick={handlePay} className="btn btn-primary qr-pay-btn">💳 Pay via UPI</button>
          </div>
        ) : (
          <div className="qr-section">
            <p style={{ fontSize: 'var(--text-2xs)', marginBottom: 'var(--space-2)' }}>💵</p>
            <p style={{ fontWeight: 900, fontSize: 'var(--text-h3)', color: 'var(--text)' }}>₹{amount.toFixed(2)}</p>
            <p>Pay cash to <strong>{toUser.name}</strong></p>
          </div>
        )}

        <div className="modal-actions">
          <button onClick={() => handleRecordPayment(payMethod)} className="btn btn-success">✓ Mark as Paid</button>
          <button onClick={onClose} className="btn btn-ghost">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ===== Add Member Modal ===== */
function AddMemberModal({ groupId, onClose, onAdded }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    try { const data = await api.searchUsers(q); setResults(data); }
    catch (err) { toast.error('Search failed'); } finally { setSearching(false); }
  };

  const handleAdd = async (userId) => {
    try { await api.addMember(groupId, userId); toast.success('Member added!'); onAdded(); }
    catch (err) { toast.error(err.message); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Member</h2>
        <div className="form-group">
          <label>Search by name or email</label>
          <input type="text" value={query} onChange={(e) => handleSearch(e.target.value)} placeholder="Type at least 2 characters..." maxLength={255} autoFocus />
        </div>
        {searching && <p className="searching">Searching...</p>}
        <div className="search-results">
          {results.map((u) => (
            <div key={u.id} className="search-result-item">
              <div className="search-result-info">
                <span className="member-avatar">{u.name[0].toUpperCase()}</span>
                <div><p>{u.name}</p><p className="email">{u.email}</p></div>
              </div>
              <button onClick={() => handleAdd(u.id)} className="btn btn-primary btn-sm">Add</button>
            </div>
          ))}
        </div>
        <div className="modal-actions"><button onClick={onClose} className="btn btn-ghost">Close</button></div>
      </div>
    </div>
  );
}
