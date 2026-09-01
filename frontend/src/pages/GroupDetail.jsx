import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useSocket } from '../hooks/useSocket';
import toast from 'react-hot-toast';

export default function GroupDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses');
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const loadGroup = useCallback(async () => {
    try {
      const data = await api.getGroup(id);
      setGroup(data);
    } catch (err) {
      toast.error('Failed to load group');
    }
  }, [id]);

  const loadExpenses = useCallback(async () => {
    try {
      const data = await api.getGroupExpenses(id);
      setExpenses(data);
    } catch (err) {
      toast.error('Failed to load expenses');
    }
  }, [id]);

  const loadBalances = useCallback(async () => {
    try {
      const data = await api.getBalances(id);
      setBalances(data);
    } catch (err) {
      toast.error('Failed to load balances');
    }
  }, [id]);

  const loadSettlements = useCallback(async () => {
    try {
      const data = await api.getSettlements(id);
      setSettlements(data);
    } catch (err) {
      toast.error('Failed to load settlements');
    }
  }, [id]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadGroup(), loadExpenses(), loadBalances(), loadSettlements()]);
    setLoading(false);
  }, [loadGroup, loadExpenses, loadBalances, loadSettlements]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Real-time updates via Socket.IO
  useSocket(id, {
    'expense-created': (expense) => {
      setExpenses((prev) => [expense, ...prev]);
      loadBalances();
      loadSettlements();
      toast(`${expense.paid_by_name} added "${expense.description}" — $${parseFloat(expense.amount).toFixed(2)}`, { icon: '💸' });
    },
    'expense-deleted': () => {
      loadExpenses();
      loadBalances();
    },
    'settlement-created': (settlement) => {
      setSettlements((prev) => [settlement, ...prev]);
      loadBalances();
      toast(`${settlement.from_user_name} paid ${settlement.to_user_name} $${parseFloat(settlement.amount).toFixed(2)}`, { icon: '✅' });
    },
    'settlement-deleted': () => {
      loadSettlements();
      loadBalances();
    },
    'member-added': () => loadGroup(),
    'member-removed': () => loadGroup(),
  });

  if (loading || !group) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="group-detail">
      <header className="navbar">
        <div className="navbar-brand">
          <Link to="/" className="back-link">← </Link>
          <h1>{group.name}</h1>
        </div>
        <div className="navbar-user">
          <span>{user?.name}</span>
        </div>
      </header>

      <main className="group-content">
        <div className="group-info-bar">
          <div className="group-info-left">
            <p>{group.description}</p>
            <span className="member-count">👥 {group.members?.length} members</span>
          </div>
          <button onClick={() => setShowAddMember(true)} className="btn btn-outline btn-sm">
            + Add Member
          </button>
        </div>

        {/* Members list */}
        <div className="members-row">
          {group.members?.map((member) => (
            <div key={member.id} className="member-chip">
              <span className="member-avatar">{member.name[0].toUpperCase()}</span>
              <span>{member.name}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            Expenses ({expenses.length})
          </button>
          <button
            className={`tab ${activeTab === 'balances' ? 'active' : ''}`}
            onClick={() => setActiveTab('balances')}
          >
            Balances
          </button>
          <button
            className={`tab ${activeTab === 'settlements' ? 'active' : ''}`}
            onClick={() => setActiveTab('settlements')}
          >
            Settlements ({settlements.length})
          </button>
        </div>

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="tab-content">
            <div className="tab-header">
              <button onClick={() => setShowAddExpense(true)} className="btn btn-primary">
                + Add Expense
              </button>
            </div>
            {expenses.length === 0 ? (
              <div className="empty-state">
                <p>No expenses yet. Add your first expense!</p>
              </div>
            ) : (
              <div className="expense-list">
                {expenses.map((expense) => (
                  <div key={expense.id} className="expense-card">
                    <div className="expense-header">
                      <div>
                        <h4>{expense.description}</h4>
                        <p className="expense-meta">
                          Paid by <strong>{expense.paid_by_name}</strong> · {new Date(expense.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="expense-amount">
                        ${parseFloat(expense.amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="expense-splits">
                      {expense.splits?.map((split) => (
                        <span key={split.user_id} className="split-chip">
                          {split.user_name}: ${parseFloat(split.amount).toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Balances Tab */}
        {activeTab === 'balances' && balances && (
          <div className="tab-content">
            <div className="balances-summary">
              <h3>Total Expenses: ${parseFloat(balances.totalExpenses).toFixed(2)}</h3>
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
                    {member.balance > 0 ? '+' : ''}{member.balance.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="simplified-debts">
              <h4>⚡ Simplified Settlements (minimized transactions)</h4>
              {balances.transactions?.length === 0 ? (
                <p className="all-settled">✅ All settled up!</p>
              ) : (
                balances.transactions?.map((tx, i) => (
                  <div key={i} className="settlement-row">
                    <div className="settlement-flow">
                      <span className="settlement-user">{tx.from.name}</span>
                      <span className="settlement-arrow">→</span>
                      <span className="settlement-user">{tx.to.name}</span>
                    </div>
                    <div className="settlement-amount-action">
                      <span className="settlement-amount">${tx.amount.toFixed(2)}</span>
                      <button
                        onClick={async () => {
                          try {
                            await api.createSettlement({
                              groupId: parseInt(id),
                              fromUser: tx.from.id,
                              toUser: tx.to.id,
                              amount: tx.amount,
                            });
                            toast.success('Settlement recorded!');
                            loadBalances();
                            loadSettlements();
                          } catch (err) {
                            toast.error(err.message);
                          }
                        }}
                        className="btn btn-success btn-sm"
                      >
                        Settle
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Settlements Tab */}
        {activeTab === 'settlements' && (
          <div className="tab-content">
            {settlements.length === 0 ? (
              <div className="empty-state">
                <p>No settlements yet.</p>
              </div>
            ) : (
              <div className="settlement-list">
                {settlements.map((s) => (
                  <div key={s.id} className="settlement-card">
                    <div className="settlement-card-content">
                      <span className="settlement-user">{s.from_user_name}</span>
                      <span className="settlement-arrow">→</span>
                      <span className="settlement-user">{s.to_user_name}</span>
                      <span className="settlement-amount">${parseFloat(s.amount).toFixed(2)}</span>
                    </div>
                    <p className="settlement-date">
                      {new Date(s.settled_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          group={group}
          onClose={() => setShowAddExpense(false)}
          onCreated={() => {
            setShowAddExpense(false);
            loadExpenses();
            loadBalances();
          }}
        />
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <AddMemberModal
          groupId={id}
          onClose={() => setShowAddMember(false)}
          onAdded={() => {
            setShowAddMember(false);
            loadGroup();
          }}
        />
      )}
    </div>
  );
}

function AddExpenseModal({ group, onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    description: '',
    amount: '',
    paidBy: user?.id || '',
    splitType: 'equal',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const amount = parseFloat(form.amount);
      const splits = group.members.map((m) => ({
        userId: m.id,
        amount: Math.round((amount / group.members.length) * 100) / 100,
      }));

      await api.createExpense({
        groupId: parseInt(group.id),
        description: form.description,
        amount,
        paidBy: parseInt(form.paidBy),
        splitType: form.splitType,
        splits,
      });

      toast.success('Expense added!');
      onCreated();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Expense</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g., Dinner, Groceries, Uber"
              required
            />
          </div>
          <div className="form-group">
            <label>Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
          <div className="form-group">
            <label>Paid by</label>
            <select
              value={form.paidBy}
              onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
            >
              {group.members?.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Split type</label>
            <select
              value={form.splitType}
              onChange={(e) => setForm({ ...form, splitType: e.target.value })}
            >
              <option value="equal">Equal Split</option>
            </select>
          </div>
          <p className="split-preview">
            Split equally: ${form.amount ? (parseFloat(form.amount) / group.members.length).toFixed(2) : '0.00'} per person
          </p>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMemberModal({ groupId, onClose, onAdded }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await api.searchUsers(q);
      setResults(data);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (userId) => {
    try {
      await api.addMember(groupId, userId);
      toast.success('Member added!');
      onAdded();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Member</h2>
        <div className="form-group">
          <label>Search by name or email</label>
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search users..."
            autoFocus
          />
        </div>
        {searching && <p className="searching">Searching...</p>}
        <div className="search-results">
          {results.map((u) => (
            <div key={u.id} className="search-result-item">
              <div className="search-result-info">
                <span className="member-avatar">{u.name[0].toUpperCase()}</span>
                <div>
                  <p>{u.name}</p>
                  <p className="email">{u.email}</p>
                </div>
              </div>
              <button onClick={() => handleAdd(u.id)} className="btn btn-primary btn-sm">Add</button>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-ghost">Close</button>
        </div>
      </div>
    </div>
  );
}
