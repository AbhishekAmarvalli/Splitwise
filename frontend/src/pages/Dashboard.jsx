import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });

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

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const group = await api.createGroup(newGroup);
      setGroups([group, ...groups]);
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '' });
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
            <p>No groups yet!</p>
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
                  <span>💰 ${parseFloat(group.total_expenses).toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="form-group">
                <label>Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="e.g., Roommates, Trip to Bali"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <input
                  type="text"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="What's this group for?"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-ghost">
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
