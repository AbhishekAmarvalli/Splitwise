# SplitEase — Architecture Document

## 1. Overview

SplitEase is a cross-platform mobile expense-splitting app built with React Native (Expo managed workflow). It shares a backend with the existing Splitwise web clone but adds mobile-specific capabilities: push notifications, deep linking, offline caching, and biometric-optional security.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                   SplitEase App                  │
│  ┌───────────┐ ┌──────────┐ ┌────────────────┐  │
│  │  Screens   │ │  Store   │ │  Services      │  │
│  │  (React    │ │ (Zustand)│ │  (API, Socket, │  │
│  │  Native)   │ │          │ │   Push, Cache) │  │
│  └─────┬─────┘ └────┬─────┘ └───────┬────────┘  │
│        │             │               │            │
│  ┌─────┴─────────────┴───────────────┴────────┐  │
│  │              Core Layer                     │  │
│  │  Navigation │ Hooks │ Utils │ Design Tokens │  │
│  └─────────────────────┬───────────────────────┘  │
└────────────────────────┼─────────────────────────┘
                         │
                    ┌────▼────┐
                    │ Network │
                    │  Layer  │
                    └────┬────┘
                         │
            ┌────────────▼────────────────┐
            │     Existing Backend         │
            │  Node.js + Express + PG      │
            │  Socket.IO + JWT Auth        │
            │  Render Deployment           │
            └─────────────┬───────────────┘
                          │
              ┌───────────▼───────────┐
              │   Mobile Extensions    │
              │  POST /api/devices     │
              │  Push Notification Svc │
              │  FCM + APNs            │
              └────────────────────────┘
```

---

## 3. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React Native (Expo managed) | Cross-platform UI |
| **Language** | JavaScript (ES2022+) | All source code |
| **Navigation** | React Navigation 6 | Bottom tabs + stack |
| **State** | Zustand | Global state management |
| **HTTP** | Axios | API communication |
| **Realtime** | Socket.IO Client | Live expense/settlement updates |
| **Storage** | expo-secure-store | JWT tokens, sensitive data |
| **Cache** | AsyncStorage + MMKV | Offline data cache |
| **Push** | expo-notifications | FCM/APNs push notifications |
| **Analytics** | Firebase Analytics + Sentry | Usage tracking + crash reporting |
| **Deep Links** | expo-linking | Custom URL scheme (splitease://) |
| **Haptics** | expo-haptics | Tactile feedback |
| **Camera** | expo-camera + expo-image-picker | Future receipt scanning |
| **QR** | react-native-qrcode-styled | Personal QR code generation |
| **Animations** | react-native-reanimated | Smooth transitions |
| **Splash** | expo-splash-screen | Branded launch screen |

---

## 4. Project Structure

```
splitwise-app/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/                   # Auth stack (unprotected)
│   │   ├── login.jsx
│   │   ├── register.jsx
│   │   └── _layout.jsx
│   ├── (onboarding)/             # Onboarding stack
│   │   ├── welcome.jsx
│   │   ├── groups.jsx
│   │   ├── split.jsx
│   │   ├── settle.jsx
│   │   └── _layout.jsx
│   ├── (tabs)/                   # Main tab navigator
│   │   ├── home.jsx              # Dashboard
│   │   ├── groups.jsx            # Groups list
│   │   ├── activity.jsx          # Activity feed
│   │   ├── profile.jsx           # Profile + settings
│   │   └── _layout.jsx           # Tab bar config + FAB
│   ├── group/
│   │   └── [id].jsx              # Group detail (stack within tabs)
│   ├── expense/
│   │   └── new.jsx               # Add expense (full screen)
│   ├── settlement/
│   │   └── [id].jsx              # Settlement detail + QR
│   └── _layout.jsx               # Root layout (providers, splash)
│
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Input.jsx
│   │   ├── Tab.jsx
│   │   ├── MemberChip.jsx
│   │   ├── BalanceRow.jsx
│   │   ├── SettlementRow.jsx
│   │   ├── ExpenseCard.jsx
│   │   ├── SplitPreview.jsx
│   │   ├── EmptyState.jsx
│   │   ├── Toast.jsx
│   │   ├── QRCode.jsx
│   │   ├── SearchResults.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── BackButton.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── FAB.jsx
│   │   ├── SyncBanner.jsx
│   │   └── OnboardingSlide.jsx
│   │
│   ├── screens/                  # Screen containers (if not using app/ directly)
│   │
│   ├── store/                    # Zustand stores
│   │   ├── useAuthStore.js
│   │   ├── useGroupStore.js
│   │   ├── useExpenseStore.js
│   │   ├── useBalanceStore.js
│   │   ├── useSettlementStore.js
│   │   ├── useActivityStore.js
│   │   └── useSyncStore.js
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useSocket.js
│   │   ├── useApi.js
│   │   ├── usePushNotifications.js
│   │   ├── useDeepLinking.js
│   │   ├── useHaptics.js
│   │   ├── useOffline.js
│   │   └── useTheme.js
│   │
│   ├── services/                 # External service integrations
│   │   ├── api.js                # Axios instance + interceptors
│   │   ├── socket.js             # Socket.IO client setup
│   │   ├── push.js               # Push notification registration + handling
│   │   ├── analytics.js          # Firebase Analytics wrapper
│   │   ├── sentry.js             # Sentry crash reporting setup
│   │   └── secureStore.js        # Secure storage wrapper
│   │
│   ├── utils/                    # Pure utility functions
│   │   ├── format.js             # Currency, date, number formatting
│   │   ├── validation.js         # Form validation rules
│   │   ├── simplifyDebts.js      # Debt simplification algorithm (port from web)
│   │   ├── upi.js                # UPI deep link generation
│   │   └── qr.js                 # QR code data generation
│   │
│   ├── tokens/                   # Design system tokens
│   │   ├── colors.js             # Light + dark color palettes
│   │   ├── spacing.js            # Spacing scale
│   │   ├── typography.js         # Font sizes, weights, line heights
│   │   ├── shadows.js            # Neobrutalism shadow definitions
│   │   └── index.js              # Re-export all tokens
│   │
│   └── constants/                # App constants
│       ├── config.js             # API URLs, app name, version
│       ├── routes.js             # Route name constants
│       └── events.js             # Socket event name constants
│
├── assets/                       # Static assets
│   ├── splash.png                # Splash screen image
│   ├── icon.png                  # App icon
│   ├── adaptive-icon.png         # Android adaptive icon
│   ├── onboarding/               # Onboarding illustrations
│   └── fonts/                    # Custom fonts (if needed)
│
├── android/                      # Android native project (generated)
├── ios/                          # iOS native project (generated)
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build configuration
├── package.json
├── babel.config.js
└── .env                          # Environment variables
```

---

## 5. Data Flow

### 5.1 Authentication Flow
```
User opens app
  → Check SecureStore for JWT token
    → Token exists? Validate with GET /api/auth/me
      → Valid: Navigate to (tabs)
      → Invalid: Clear token, Navigate to (auth)/login
    → No token: Navigate to (auth)/login
  → User enters credentials
    → POST /api/auth/login → Store JWT in SecureStore
    → POST /api/devices → Register push token with backend
    → Navigate to (tabs)
```

### 5.2 Expense Creation Flow
```
User taps FAB → Select "Add Expense"
  → Full-screen form loads group members
  → User fills: description, amount, paid by, split mode
  → User taps "Add Expense"
    → POST /api/expenses → Backend processes
    → Socket.IO broadcasts 'expense-created' to all group members
    → All connected clients prepend expense to list
    → Push notification sent to offline members
    → Balance recalculated and broadcast
```

### 5.3 Settlement Flow
```
User views balances tab
  → Sees simplified debts (who owes whom)
  → Taps "Pay" on a debt
    → Modal with two options:
      1. "Pay via UPI" → Opens UPI app via deep link (upi://pay?...)
      2. "Show QR" → Generates personal QR with embedded amount
  → User completes payment externally
  → Taps "Mark as Paid"
    → POST /api/settlements → Backend records
    → Socket.IO broadcasts 'settlement-created'
    → Haptic feedback (success)
    → Push notification to creditor
```

### 5.4 Real-time Update Flow
```
Socket.IO connects on group detail screen
  → Listens for events:
    - expense-created → Prepend to list, refresh balances
    - expense-deleted → Reload expenses + balances
    - settlement-created → Prepend to list, refresh balances, haptic
    - settlement-deleted → Reload settlements + balances
    - member-added → Reload group info
    - member-removed → Reload group info
  → Toast notification for each event with emoji icon
  → All updates use Zustand store for reactive UI
```

### 5.5 Offline Flow
```
User performs action while offline
  → API call fails (network error)
  → Show "No connection — changes saved locally" banner
  → Save action to local queue (AsyncStorage)
  → Show sync indicator in UI
  → When connection restored:
    → Process queue items in order
    → Sync indicator shows progress
    → On success: clear queue, show "Synced!" toast
    → On conflict: show resolution dialog
```

---

## 6. API Integration

### 6.1 Existing Endpoints (Reused)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/auth/search?q= | Search users |
| GET | /api/groups | List user's groups |
| POST | /api/groups | Create a group |
| GET | /api/groups/:id | Get group details |
| POST | /api/groups/:id/members | Add member |
| DELETE | /api/groups/:id/members/:uid | Remove member |
| POST | /api/expenses | Add an expense |
| GET | /api/expenses/group/:gid | List group expenses |
| GET | /api/balances/:groupId | Calculate balances |
| POST | /api/settlements | Record a settlement |
| GET | /api/settlements/group/:gid | List group settlements |

### 6.2 Mobile-Specific Endpoints (New)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/devices | Register FCM/APNs device token |
| DELETE | /api/devices/:token | Unregister device token |
| GET | /api/notifications | List user notifications |
| PUT | /api/notifications/:id/read | Mark notification as read |

### 6.3 API Client Configuration
```javascript
// src/services/api.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE = process.env.EXPO_PUBLIC_API_URL; // Render URL

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('jwt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('jwt_token');
      // Redirect to login
    }
    return Promise.reject(error);
  }
);
```

---

## 7. Push Notification Architecture

### 7.1 Registration
```
App launches
  → Request notification permissions (expo-notifications)
  → Get FCM/APNs device token
  → POST /api/devices { token, platform: 'ios'|'android' }
  → Backend stores token for user
```

### 7.2 Delivery
```
Backend event occurs (expense created, settlement recorded)
  → Query all group member device tokens
  → Filter out the actor (don't notify self)
  → Send via Firebase Admin SDK (FCM for Android, APNs for iOS)
  → Payload: { title, body, data: { groupId, type, id } }
```

### 7.3 Handling
```
Notification received (foreground)
  → Show in-app toast (not system notification)
  → Update relevant Zustand store
  → Trigger haptic feedback

Notification received (background)
  → System notification shown
  → User taps → Deep link to relevant screen

Notification received (killed)
  → System notification shown
  → User taps → App launches → Deep link to relevant screen
```

---

## 8. Deep Linking Architecture

### 8.1 URL Scheme
```
splitease://group/123          → Group detail
splitease://expense/new?gid=1  → Add expense to group
splitease://settlement/456     → Settlement detail
splitease://home               → Dashboard
```

### 8.2 Expo Configuration
```json
// app.json
{
  "expo": {
    "scheme": "splitease",
    "plugins": [
      ["expo-linking", { "scheme": "splitease" }]
    ]
  }
}
```

### 8.3 Share Sheet Integration
```
User taps "Share Group" → Generate link: splitease://group/{id}
  → Open native share sheet
  → User picks: WhatsApp, SMS, Telegram, etc.
  → Recipient taps link → Opens app to group (if installed)
                          → Or shows "Download SplitEase" (if not)
```

---

## 9. Security

| Concern | Solution |
|---------|----------|
| JWT storage | expo-secure-store (Keychain/Keystore) |
| API communication | HTTPS only (Render provides) |
| Token refresh | Re-login on 401 (no refresh token for MVP) |
| Deep link validation | Validate link format, check group membership |
| Input sanitization | Server-side validation (existing) |
| Device token | Stored server-side, deleted on logout |

---

## 10. Error Handling Strategy

| Error Type | Handling |
|------------|----------|
| Network error | Show "No connection" banner, queue action |
| 401 Unauthorized | Clear token, redirect to login |
| 403 Forbidden | Show "You don't have access" toast |
| 404 Not Found | Show "Not found" screen with back button |
| 500 Server Error | Show "Something went wrong" toast, log to Sentry |
| Validation error | Show field-level errors (red border + message) |
| Socket disconnect | Auto-reconnect with exponential backoff |

---

## 11. Performance Considerations

- **Lazy loading:** Only load group data when navigating to group detail
- **Virtualized lists:** Use FlatList for expense/settlement lists (not ScrollView)
- **Image optimization:** Compress avatars, use progressive loading
- **Memory:** Disconnect Socket.IO when leaving group screens
- **Bundle size:** Use Expo's tree-shaking, avoid unused imports
- **Splash screen:** Keep visible until auth check completes
