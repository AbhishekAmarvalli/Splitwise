import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import FriendshipCharacters from '../components/FriendshipCharacters';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

function validateGroupName(name) {
  if (!name.trim()) return 'Group name is required';
  if (name.trim().length > 255) return 'Group name must be at most 255 characters';
  return '';
}

function validateGroupDescription(desc) {
  if (desc.length > 1000) return 'Description must be at most 1000 characters';
  return '';
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await api.getGroups();
      setGroups(data);
    } catch (err) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = (field, value) => {
    setNewGroup((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: field === 'name' ? validateGroupName(value) : validateGroupDescription(value),
      }));
    }
  };

  const handleGroupBlur = (field) => {
    const value = newGroup[field];
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: field === 'name' ? validateGroupName(value) : validateGroupDescription(value),
    }));
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const nameErr = validateGroupName(newGroup.name);
    const descErr = validateGroupDescription(newGroup.description);
    setErrors({ name: nameErr, description: descErr });
    setTouched({ name: true, description: true });
    if (nameErr || descErr) return;

    try {
      const group = await api.createGroup({
        name: newGroup.name.trim(),
        description: newGroup.description.trim() || undefined,
      });
      setGroups([group, ...groups]);
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '' });
      setErrors({});
      setTouched({});
      toast.success('Group created!');
      navigate(`/group/${group.id}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="dashboard">
      <header className="navbar">
        <div className="navbar-brand">
          <h1>💸 SplitWise Clone</h1>
        </div>
        <div className="navbar-user">
          <span>{user?.name}</span>
          <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={logout} className="btn btn-ghost btn-sm">Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-header">
          <h2>Your Groups</h2>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            + New Group
          </button>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : groups.length === 0 ? (
          <div className="empty-state">
            <FriendshipCharacters variant="default" size={180} />
            <p style={{ marginTop: 'var(--space-4)', fontWeight: 800, fontSize: 'var(--text-h4)' }}>No groups yet!</p>
            <p>Create a group to start splitting expenses with friends.</p>
          </div>
        ) : (
          <div className="groups-grid">
            {groups.map((group) => (
              <Link to={`/group/${group.id}`} key={group.id} className="group-card">
                <div className="group-card-header">
                  <span className="group-avatar">{group.name[0].toUpperCase()}</span>
                  <div>
                    <h3>{group.name}</h3>
                    <p className="group-desc">{group.description || 'No description'}</p>
                  </div>
                </div>
                <div className="group-card-footer">
                  <span>👥 {group.member_count} members</span>
                  <span>💰 ₹{parseFloat(group.total_expenses).toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => { setShowCreateModal(false); setErrors({}); setTouched({}); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Group</h2>
            <form onSubmit={handleCreateGroup} noValidate>
              <div className="form-group">
                <label>Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => handleGroupChange('name', e.target.value)}
                  onBlur={() => handleGroupBlur('name')}
                  placeholder="Roommates, Trip to Bali..."
                  maxLength={255}
                  autoFocus
                  required
                  className={touched.name && errors.name ? 'field-error' : ''}
                />
                {touched.name && errors.name && (
                  <span className="field-error-msg">{errors.name}</span>
                )}
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <input
                  type="text"
                  value={newGroup.description}
                  onChange={(e) => handleGroupChange('description', e.target.value)}
                  onBlur={() => handleGroupBlur('description')}
                  placeholder="What's this group for?"
                  maxLength={1000}
                  className={touched.description && errors.description ? 'field-error' : ''}
                />
                {touched.description && errors.description && (
                  <span className="field-error-msg">{errors.description}</span>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => { setShowCreateModal(false); setErrors({}); setTouched({}); }} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
