# SplitEase — Memory & State Management

## 1. Overview

SplitEase uses a layered memory strategy:
1. **Zustand stores** — In-memory state for reactive UI
2. **AsyncStorage** — Persistent cache for offline data
3. **SecureStore** — Encrypted storage for sensitive data (JWT)
4. **Socket.IO** — Real-time state synchronization

---

## 2. Zustand Store Architecture

### 2.1 Store Design Philosophy
- Each domain gets its own store (auth, groups, expenses, balances, settlements)
- Stores are flat — no deeply nested state
- Actions live inside stores (not separate action files)
- Selectors are memoized to prevent unnecessary re-renders
- Stores persist to AsyncStorage for offline access

### 2.2 Store Map

```
┌─────────────────────────────────────────┐
│              Zustand Stores              │
├─────────────┬───────────────────────────┤
│ useAuth     │ user, token, login,       │
│             │ register, logout          │
├─────────────┼───────────────────────────┤
│ useGroups   │ groups[], loading,        │
│             │ fetchGroups, createGroup  │
├─────────────┼───────────────────────────┤
│ useExpenses │ expenses[], loading,      │
│             │ fetchExpenses,            │
│             │ addExpense, deleteExpense │
├─────────────┼───────────────────────────┤
│ useBalances │ balances, loading,        │
│             │ fetchBalances             │
├─────────────┼───────────────────────────┤
│ useSettlements│ settlements[], loading,  │
│               │ fetchSettlements,        │
│               │ recordSettlement         │
├─────────────┼───────────────────────────┤
│ useActivity │ activities[], loading,    │
│             │ fetchActivity             │
├─────────────┼───────────────────────────┤
│ useSync     │ pending[], isSyncing,     │
│             │ queueAction, processQueue │
├─────────────┼───────────────────────────┤
│ useTheme    │ theme, toggle, setTheme   │
└─────────────┴───────────────────────────┘
```

---

## 3. Store Definitions

### 3.1 Auth Store
```javascript
// src/store/useAuthStore.js
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,

  // Initialize from secure storage
  init: async () => {
    const token = await SecureStore.getItemAsync('jwt_token');
    if (token) {
      try {
        const user = await api.getMe(token);
        set({ user, token, loading: false });
      } catch {
        await SecureStore.deleteItemAsync('jwt_token');
        set({ loading: false });
      }
    } else {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    const { token, user } = await api.login(email, password);
    await SecureStore.setItemAsync('jwt_token', token);
    set({ user, token });
  },

  register: async (name, email, password) => {
    const { token, user } = await api.register(name, email, password);
    await SecureStore.setItemAsync('jwt_token', token);
    set({ user, token });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('jwt_token');
    set({ user: null, token: null });
  },
}));
```

### 3.2 Groups Store
```javascript
const useGroupStore = create((set, get) => ({
  groups: [],
  currentGroup: null,
  loading: false,

  fetchGroups: async () => {
    set({ loading: true });
    const groups = await api.getGroups();
    set({ groups, loading: false });
    // Persist for offline
    await AsyncStorage.setItem('groups', JSON.stringify(groups));
  },

  createGroup: async (data) => {
    const group = await api.createGroup(data);
    set((state) => ({ groups: [group, ...state.groups] }));
    return group;
  },

  setCurrentGroup: (group) => set({ currentGroup: group }),
}));
```

### 3.3 Expenses Store
```javascript
const useExpenseStore = create((set, get) => ({
  expenses: [],         // Current group's expenses
  loading: false,

  fetchExpenses: async (groupId) => {
    set({ loading: true });
    const expenses = await api.getGroupExpenses(groupId);
    set({ expenses, loading: false });
    await AsyncStorage.setItem(`expenses_${groupId}`, JSON.stringify(expenses));
  },

  addExpense: async (data) => {
    const expense = await api.createExpense(data);
    set((state) => ({ expenses: [expense, ...state.expenses] }));
    return expense;
  },

  // Called by Socket.IO listener
  onExpenseCreated: (expense) => {
    set((state) => ({
      expenses: [expense, ...state.expenses],
    }));
  },

  onExpenseDeleted: (expenseId) => {
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== expenseId),
    }));
  },
}));
```

### 3.4 Sync Store (Offline Queue)
```javascript
const useSyncStore = create((set, get) => ({
  pending: [],          // Queued actions
  isSyncing: false,

  queueAction: async (action) => {
    const item = {
      id: Date.now(),
      type: action.type,      // 'addExpense', 'recordSettlement', etc.
      data: action.data,
      timestamp: Date.now(),
      status: 'pending',
    };
    set((state) => ({ pending: [...state.pending, item] }));
    await AsyncStorage.setItem('sync_queue', JSON.stringify([...get().pending]));
  },

  processQueue: async () => {
    if (get().isSyncing || get().pending.length === 0) return;
    set({ isSyncing: true });

    for (const item of get().pending) {
      try {
        await executeAction(item);
        set((state) => ({
          pending: state.pending.filter((p) => p.id !== item.id),
        }));
      } catch {
        break; // Stop on first failure
      }
    }

    await AsyncStorage.setItem('sync_queue', JSON.stringify(get().pending));
    set({ isSyncing: false });
  },

  clearQueue: async () => {
    set({ pending: [] });
    await AsyncStorage.removeItem('sync_queue');
  },
}));
```

---

## 4. Persistence Layer

### 4.1 Storage Hierarchy
| Storage | Contents | Encryption | When Used |
|---------|----------|------------|-----------|
| SecureStore | JWT token | Yes (Keychain/Keystore) | Auth only |
| AsyncStorage | Cached data, sync queue, preferences | No | Everything else |
| Zustand (memory) | Current session state | N/A | While app is running |

### 4.2 Cache Strategy
```
App launches
  → Load Zustand stores from AsyncStorage (hydrate)
  → Attempt API refresh in background
    → Success: Update stores with fresh data
    → Failure: Show cached data, show "offline" indicator
  → Store becomes source of truth for UI
```

### 4.3 Cache Keys
| Key | Contents | TTL |
|-----|----------|-----|
| `jwt_token` | JWT authentication token | Until logout |
| `groups` | User's groups list | Session |
| `expenses_{groupId}` | Group expenses | Session |
| `balances_{groupId}` | Group balances | Session |
| `settlements_{groupId}` | Group settlements | Session |
| `activity` | Activity feed | Session |
| `sync_queue` | Pending offline actions | Until synced |
| `theme` | User theme preference | Permanent |
| `onboarding_complete` | First launch flag | Permanent |
| `user_profile` | User name, email, avatar | Session |

### 4.4 Cache Invalidation
- **On login:** Fetch fresh data, replace all caches
- **On pull-to-refresh:** Fetch fresh data, replace specific cache
- **On Socket.IO event:** Update specific cache entry
- **On logout:** Clear all caches except theme and onboarding

---

## 5. Offline Strategy

### 5.1 Partial Offline Support
| Action | Offline Behavior |
|--------|-----------------|
| View groups | ✅ Show cached data |
| View expenses | ✅ Show cached data |
| View balances | ✅ Show cached data |
| View settlements | ✅ Show cached data |
| View activity | ✅ Show cached data |
| Add expense | ❌ Block with "No connection" message |
| Create group | ❌ Block with "No connection" message |
| Record settlement | ❌ Block with "No connection" message |
| Add member | ❌ Block with "No connection" message |
| Remove member | ❌ Block with "No connection" message |

### 5.2 Sync Indicator
```
┌──────────────────────────────────┐
│ ⏳ 2 changes pending sync        │  ← visible banner
└──────────────────────────────────┘
```
- Appears when `syncStore.pending.length > 0`
- Shows count of pending changes
- Auto-hides when queue is empty
- Manual retry button on tap

### 5.3 Network Detection
```javascript
import NetInfo from '@react-native-community/netinfo';

// Listen for connectivity changes
NetInfo.addEventListener((state) => {
  if (state.isConnected && !wasConnected) {
    // Back online — process queue
    useSyncStore.getState().processQueue();
  }
  wasConnected = state.isConnected;
});
```

### 5.4 Conflict Resolution
- **Simple approach:** Last-write-wins
- **If conflict detected:** Show dialog with options:
  - Keep local version
  - Keep server version
  - Merge manually

---

## 6. Real-time State (Socket.IO)

### 6.1 Connection Lifecycle
```
Group Detail screen mounts
  → Connect Socket.IO to backend
  → Join room: group:{groupId}
  → Listen for events

Group Detail screen unmounts
  → Leave room
  → Disconnect Socket.IO
```

### 6.2 Event → Store Mapping
```javascript
// src/hooks/useSocket.js
useEffect(() => {
  if (!groupId) return;

  const socket = connect(groupId);

  socket.on('expense-created', (expense) => {
    useExpenseStore.getState().onExpenseCreated(expense);
    useBalanceStore.getState().refresh(groupId);
    showExpenseToast(expense);
  });

  socket.on('settlement-created', (settlement) => {
    useSettlementStore.getState().onSettlementCreated(settlement);
    useBalanceStore.getState().refresh(groupId);
    showSettlementToast(settlement);
    haptics.success();
  });

  socket.on('member-added', () => {
    useGroupStore.getState().refresh(groupId);
  });

  return () => disconnect(groupId);
}, [groupId]);
```

### 6.3 Reconnection Strategy
- Auto-reconnect with exponential backoff
- Initial delay: 1 second
- Max delay: 30 seconds
- On reconnect: Rejoin rooms, refresh stale data

---

## 7. State Shape Reference

### 7.1 Expense Object
```javascript
{
  id: 1,
  description: "Dinner at Café",
  amount: "500.00",
  paid_by: 1,
  paid_by_name: "Alice",
  group_id: 1,
  split_type: "equal",
  payment_method: "cash",
  created_at: "2026-09-05T14:30:00Z",
  splits: [
    { user_id: 1, user_name: "Alice", amount: "250.00" },
    { user_id: 2, user_name: "Bob", amount: "250.00" },
  ],
}
```

### 7.2 Balance Object
```javascript
{
  totalExpenses: "1500.00",
  members: [
    { id: 1, name: "Alice", balance: 500 },
    { id: 2, name: "Bob", balance: -250 },
    { id: 3, name: "Charlie", balance: -250 },
  ],
  transactions: [
    { from: { id: 2, name: "Bob" }, to: { id: 1, name: "Alice" }, amount: 250 },
    { from: { id: 3, name: "Charlie" }, to: { id: 1, name: "Alice" }, amount: 250 },
  ],
}
```

### 7.3 Settlement Object
```javascript
{
  id: 1,
  from_user: 2,
  from_user_name: "Bob",
  to_user: 1,
  to_user_name: "Alice",
  amount: "250.00",
  payment_method: "upi",
  group_id: 1,
  settled_at: "2026-09-05T15:00:00Z",
}
```

### 7.4 Sync Queue Item
```javascript
{
  id: 1693929000000,
  type: "addExpense",
  data: {
    groupId: 1,
    description: "Taxi",
    amount: 150,
    paidBy: 2,
    splitType: "equal",
    splits: [{ userId: 2, amount: 150 }],
    paymentMethod: "cash",
  },
  timestamp: 1693929000000,
  status: "pending",
}
```

---

## 8. Performance Optimizations

### 8.1 Selector Optimization
```javascript
// ❌ Bad — re-renders on every state change
const { expenses, loading } = useExpenseStore();

// ✅ Good — only re-renders when expenses array changes
const expenses = useExpenseStore((s) => s.expenses);
const loading = useExpenseStore((s) => s.loading);
```

### 8.2 Memoization
- Use `useMemo` for expensive computations (debt simplification)
- Use `useCallback` for event handlers passed to children
- Use React.memo for pure display components

### 8.3 List Optimization
- Use `FlatList` with `keyExtractor` for all lists
- Set `getItemLayout` for fixed-height items
- Use `removeClippedSubviews` for long lists
- Implement `onEndReached` for pagination (future)

### 8.4 Store Hydration
```javascript
// App launch — hydrate stores from cache
const hydrateStores = async () => {
  const [groups, theme] = await Promise.all([
    AsyncStorage.getItem('groups'),
    AsyncStorage.getItem('theme'),
  ]);

  if (groups) useGroupStore.setState({ groups: JSON.parse(groups) });
  if (theme) useThemeStore.setState({ theme: JSON.parse(theme) });
};
```
