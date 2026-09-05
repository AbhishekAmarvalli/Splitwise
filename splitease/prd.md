# SplitEase — Product Requirements Document (PRD)

## 1. Product Overview

| Field | Value |
|-------|-------|
| **Name** | SplitEase |
| **Type** | Cross-platform mobile app (iOS + Android) |
| **Framework** | React Native (Expo managed) |
| **Version** | 1.0.0 |
| **Tagline** | "Split expenses. Stay friends." |
| **Currency** | ₹ (Indian Rupee / INR) |
| **Target Market** | India — friends, roommates, trip groups |

---

## 2. Problem Statement

Groups of friends, roommates, and travelers struggle to track shared expenses. Manual tracking in chat groups leads to confusion, forgotten debts, and awkward conversations. Existing solutions are either too complex (full accounting tools) or too simple (spreadsheet tracking).

**SplitEase** makes splitting expenses effortless — add expenses, split them fairly, and settle up with a single tap via UPI.

---

## 3. Target Users

| Persona | Description | Needs |
|---------|-------------|-------|
| **Roommate Ravi** | Shares flat with 2 others, splits rent/utilities | Track recurring expenses, settle monthly |
| **Trip Traveler Tara** | Travels with friends, splits hotels/food/transport | Quick expense entry, fair splits, easy settlement |
| **Group Organizer Graham** | Manages a friend group's expenses | See who owes whom, track settlements |
| **Budget-Conscious Priya** | Wants to know her spending across groups | View balances, spending history |

---

## 4. Core Features

### 4.1 Authentication
| Feature | Requirement | Priority |
|---------|-------------|----------|
| Email/password registration | Name, email, password (min 6 chars) | P0 |
| Email/password login | Email + password, JWT token | P0 |
| Logout | Clear token, redirect to login | P0 |
| Session persistence | JWT stored in SecureStore, validated on launch | P0 |

### 4.2 Group Management
| Feature | Requirement | Priority |
|---------|-------------|----------|
| Create group | Name (required), description (optional) | P0 |
| View groups | List all user's groups with member count | P0 |
| View group detail | Members, expenses, balances, settlements | P0 |
| Add member | Search by name/email, add to group | P0 |
| Remove member | Remove from group (with confirmation) | P1 |
| Group invite link | Generate shareable deep link | P1 |
| Group invite QR | Generate QR code for group join | P2 |

### 4.3 Expense Tracking
| Feature | Requirement | Priority |
|---------|-------------|----------|
| Add expense | Description, amount (₹), paid by, split type | P0 |
| Equal split | Divide equally among selected members | P0 |
| Custom split | Enter exact amount per person | P1 |
| Percentage split | Enter percentage per person | P1 |
| View expenses | List with description, amount, payer, date | P0 |
| Delete expense | Remove expense (with confirmation) | P1 |
| Expandable details | Tap to see split breakdown | P0 |
| Payment method | Cash, UPI, Card, Bank Transfer | P0 |

### 4.4 Balances & Settlements
| Feature | Requirement | Priority |
|---------|-------------|----------|
| View balances | Individual balances per group member | P0 |
| Simplified debts | Greedy algorithm minimizes transactions | P0 |
| Record settlement | Mark a debt as paid | P0 |
| Settlement history | List of past settlements with dates | P0 |
| UPI payment | Deep link to UPI app with pre-filled details | P0 |
| Personal QR | Generate QR with amount + recipient embedded | P0 |
| Cash payment | Record cash settlement manually | P0 |

### 4.5 Real-time Updates
| Feature | Requirement | Priority |
|---------|-------------|----------|
| Socket.IO connection | Live updates when viewing group | P0 |
| Expense broadcast | New expenses appear instantly | P0 |
| Settlement broadcast | Settlements appear instantly | P0 |
| Balance refresh | Balances update on any change | P0 |
| Toast notifications | In-app toasts for live events | P0 |

### 4.6 Push Notifications
| Feature | Requirement | Priority |
|---------|-------------|----------|
| Device registration | Register FCM/APNs token on login | P0 |
| Expense notifications | Notify group members of new expenses | P0 |
| Settlement notifications | Notify when someone settles with you | P0 |
| Member notifications | Notify when added to a group | P1 |
| Notification handling | Tap opens relevant screen | P0 |

### 4.7 Activity Feed
| Feature | Requirement | Priority |
|---------|-------------|----------|
| Activity list | All actions across groups | P0 |
| Grouped by date | Today, Yesterday, This Week, Earlier | P0 |
| Action types | Expense added, settlement recorded, member joined | P0 |
| Tap to navigate | Tap activity to go to relevant group | P1 |

### 4.8 Profile & Settings
| Feature | Requirement | Priority |
|---------|-------------|----------|
| View profile | Name, email display | P0 |
| Theme toggle | Light / Dark / System | P0 |
| Notification preferences | Enable/disable push notifications | P1 |
| Logout | Clear all data, redirect to login | P0 |

### 4.9 Onboarding
| Feature | Requirement | Priority |
|---------|-------------|----------|
| First launch detection | Show onboarding on first install | P0 |
| 3-screen walkthrough | Groups → Split → Settle | P0 |
| Skip option | Skip to login at any point | P0 |
| Don't show again | Mark as complete, never show again | P0 |

---

## 5. Non-Functional Requirements

### 5.1 Performance
| Metric | Target |
|--------|--------|
| App launch (cold) | < 2 seconds |
| Screen transition | < 300ms |
| API response display | < 500ms after response |
| App size | < 30MB |
| Memory usage | < 150MB active |

### 5.2 Compatibility
| Platform | Minimum Version |
|----------|----------------|
| iOS | 14.0+ |
| Android | 10.0+ (API 29+) |
| Node.js (backend) | 18.0+ |

### 5.3 Security
| Requirement | Implementation |
|-------------|---------------|
| JWT storage | expo-secure-store (Keychain/Keystore) |
| API communication | HTTPS only |
| Input validation | Server-side (existing) |
| Deep link validation | Validate URL format + group membership |
| Token expiry | Re-login on 401 |

### 5.4 Accessibility
| Requirement | Standard |
|-------------|----------|
| Color contrast | WCAG 2.2 AA (4.5:1 minimum) |
| Touch targets | ≥ 44px × 44px |
| Screen readers | VoiceOver (iOS) + TalkBack (Android) |
| Dynamic type | Support system font scaling |
| Focus management | Logical tab order, visible focus states |

### 5.5 Offline
| Capability | Support Level |
|------------|---------------|
| View groups | ✅ Cached |
| View expenses | ✅ Cached |
| View balances | ✅ Cached |
| View settlements | ✅ Cached |
| Add expense | ❌ Blocked |
| Create group | ❌ Blocked |
| Record settlement | ❌ Blocked |
| Sync indicator | ✅ Visible banner |

---

## 6. Design Requirements

### 6.1 Visual Design
- Neobrutalism aesthetic: bold borders, hard shadows, vivid colors
- Slightly softened for touch (2-4px border-radius on interactive elements)
- Color cycling pattern for lists (red → yellow → green → blue)
- Emoji used as icons (💸, 🌙, ☀️, 💵, 📱, 💳, 🏦)

### 6.2 Navigation
- Bottom tab bar: Home, Groups, +, Activity, Profile
- FAB (Floating Action Button) for + tab
- Stack navigation within each tab
- Swipe back gesture on iOS

### 6.3 Dark Mode
- Full dark mode support
- System default detection
- Manual override toggle
- All colors via design tokens (no hardcoded values)

### 6.4 Splash Screen
- Yellow (#FDC800) background
- 💸 emoji centered
- App name + tagline
- Shows until auth check completes

---

## 7. Technical Requirements

### 7.1 Architecture
- React Native (Expo managed workflow)
- Zustand for state management
- Axios for HTTP
- Socket.IO for real-time
- Expo SecureStore for JWT
- AsyncStorage + MMKV for cache

### 7.2 Backend
- Shared with existing Splitwise web clone
- Node.js + Express + PostgreSQL
- New endpoints: device registration, push notifications
- Firebase Admin SDK for push delivery

### 7.3 Deployment
- EAS Build for iOS and Android
- App Store + Google Play
- Over-the-air updates via Expo

---

## 8. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Downloads | 1,000 in first month | App Store + Play Store analytics |
| DAU | 100+ within 3 months | Firebase Analytics |
| Crash-free rate | > 99% | Sentry |
| Push notification delivery | > 95% | Firebase Console |
| User retention (7-day) | > 40% | Firebase Analytics |
| App rating | > 4.0 stars | Store reviews |

---

## 9. Out of Scope (MVP)

- Receipt scanning / OCR
- Multi-currency support
- Recurring expenses
- Expense categories / tags
- User avatars / photo upload
- Home screen widgets
- Apple Watch / Wear OS
- Internationalization (i18n)
- Biometric authentication
- Razorpay / payment gateway integration

---

## 10. Open Questions

| Question | Status | Resolution |
|----------|--------|------------|
| App store name availability | Pending | Check "SplitEase" on both stores |
| Privacy policy URL | Pending | Create before submission |
| Terms of service | Pending | Create before submission |
| Firebase project ownership | Pending | Use existing or create new |
| Backend deployment updates | Pending | Add push endpoints to Render |
