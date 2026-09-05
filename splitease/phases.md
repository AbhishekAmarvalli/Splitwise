# SplitEase — Development Phases

## Overview

SplitEase development is divided into 5 phases across 10 weeks. Each phase has clear deliverables, acceptance criteria, and a working demo milestone.

---

## Phase 1: Foundation
**Duration:** Week 1–2
**Goal:** Working app shell with authentication and navigation

### Milestones
| # | Deliverable | Acceptance Criteria |
|---|-------------|-------------------|
| 1.1 | Expo project initialized | `npx expo start` launches without errors |
| 1.2 | Design tokens file | All colors, spacing, typography, shadows defined |
| 1.3 | Bottom tab navigation | 5 tabs visible: Home, Groups, +, Activity, Profile |
| 1.4 | Stack navigation | Screens push/pop correctly within tabs |
| 1.5 | Splash screen | Yellow background with 💸, shows until auth check |
| 1.6 | Login screen | Email/password form with validation, neobrutalism styling |
| 1.7 | Register screen | Name/email/password form with validation |
| 1.8 | JWT authentication | Token stored in SecureStore, validated on app launch |
| 1.9 | API client | Axios instance with auth interceptors, connects to Render backend |
| 1.10 | Error handling | Network errors, 401, 500 shown as toasts |

### Demo
- App launches → Splash → Login → Register → Dashboard (empty state)
- Token persists across app restarts

---

## Phase 2: Core Features
**Duration:** Week 3–4
**Goal:** Full expense tracking on mobile

### Milestones
| # | Deliverable | Acceptance Criteria |
|---|-------------|-------------------|
| 2.1 | Home/Dashboard screen | Shows user's groups in a list |
| 2.2 | Groups list screen | Lists all groups with member count and total expenses |
| 2.3 | Group detail screen | Tabs: Expenses, Balances, Settlements |
| 2.4 | Expenses tab | Lists expenses with amount badge and split chips |
| 2.5 | Balances tab | Shows individual balances with +/- badges |
| 2.6 | Settlements tab | Shows simplified debts and settlement history |
| 2.7 | Add Expense form | Full-screen form: description, amount, paid by, split mode |
| 2.8 | Member chips | Color-cycling avatars with names |
| 2.9 | Create Group | Modal or screen to create new groups |
| 2.10 | Add Member | Search and add members to groups |
| 2.11 | Empty states | Illustrated empty states for all list screens |
| 2.12 | Loading states | Spinners during data fetch |

### Demo
- Login → See groups → Tap group → See expenses/balances/settlements
- Add an expense → See it appear in list → Balances update
- Create a group → Add members → Add first expense

---

## Phase 3: Real-time & Payments
**Duration:** Week 5–6
**Goal:** Live updates and UPI integration

### Milestones
| # | Deliverable | Acceptance Criteria |
|---|-------------|-------------------|
| 3.1 | Socket.IO connection | Connects on group detail, disconnects on leave |
| 3.2 | Real-time expense updates | New expenses appear instantly without refresh |
| 3.3 | Real-time settlement updates | Settlements appear instantly |
| 3.4 | Real-time balance updates | Balances refresh when expenses/settlements change |
| 3.5 | Toast notifications | Emoji toasts for live events (💸 expenses, ✅ settlements) |
| 3.6 | UPI deep link | "Pay" button opens UPI app with pre-filled details |
| 3.7 | Personal QR code | Generate QR with amount + recipient embedded |
| 3.8 | Payment method selection | Toggle between UPI and Cash |
| 3.9 | Settlement recording | Record settlements, trigger real-time broadcast |
| 3.10 | Haptic feedback | Success haptic on settlement, light haptic on button press |

### Demo
- Two devices open same group
- Device A adds expense → Device B sees it instantly with toast
- Device B taps "Pay" → Opens UPI app → Records settlement → Device A sees update

---

## Phase 4: Polish & Features
**Duration:** Week 7–8
**Goal:** Production-ready app with all planned features

### Milestones
| # | Deliverable | Acceptance Criteria |
|---|-------------|-------------------|
| 4.1 | Onboarding walkthrough | 3 slides: Groups → Split → Settle, with illustrations |
| 4.2 | Activity feed | Grouped by date (Today, Yesterday, This Week) |
| 4.3 | Profile screen | User info, notification preferences, theme toggle, logout |
| 4.4 | Theme toggle | Light / Dark / System default options |
| 4.5 | Deep linking | splitease://group/{id} opens group detail |
| 4.6 | Pull-to-refresh | All list screens support pull-to-refresh |
| 4.7 | Search members | Search by name/email, add to group |
| 4.8 | Delete expense | Swipe to delete or long-press menu |
| 4.9 | Remove member | Remove member from group |
| 4.10 | Settlement QR modal | Full QR code view with pay button |
| 4.11 | Error boundaries | Graceful handling of unexpected errors |
| 4.12 | Accessibility pass | VoiceOver/TalkBack test, focus management |

### Demo
- First launch → Onboarding → Login → Full app flow
- Dark mode toggle works across all screens
- Deep link opens correct screen
- All interactions have haptic feedback

---

## Phase 5: Launch Prep
**Duration:** Week 9–10
**Goal:** Store submission and production deployment

### Milestones
| # | Deliverable | Acceptance Criteria |
|---|-------------|-------------------|
| 5.1 | Push notifications | FCM/APNs registered, notifications delivered |
| 5.2 | Sentry integration | Crashes reported, source maps uploaded |
| 5.3 | Firebase Analytics | Key events tracked (login, expense added, settlement) |
| 5.4 | App icon | 1024×1024, yellow background, 💸 |
| 5.5 | Splash screen | Animated or static branded splash |
| 5.6 | EAS Build | Both iOS and Android builds succeed |
| 5.7 | Physical device testing | Tested on 3+ Android devices, 2+ iOS devices |
| 5.8 | App Store submission | Screenshots, description, privacy policy |
| 5.9 | Google Play submission | Store listing, content rating, screenshots |
| 5.10 | Backend push service | Firebase Admin SDK sending notifications |

### Demo
- App installed from TestFlight / Play Store beta
- Push notifications received
- Full flow works end-to-end on production backend

---

## Phase Timeline

```
Week  1  2  3  4  5  6  7  8  9  10
      ├──┴──┤──┴──┤──┴──┤──┴──┤──┴──┤
Phase:  1     2     3     4     5
        Found Core  Real   Pol  Launch
        ation Feat  time  ish
```

---

## Definition of Done

A phase is complete when:
1. All milestones have passing acceptance criteria
2. App runs without crashes on both platforms
3. No known P0/P1 bugs
4. Code reviewed and merged
5. Demo recorded showing all features working

---

## Blockers & Dependencies

| Blocker | Phase | Resolution |
|---------|-------|-----------|
| Backend push endpoint | 3, 5 | Build stub first, integrate later |
| Firebase project setup | 5 | Set up in Week 8 |
| App Store developer account | 5 | Register in Week 7 |
| Google Play developer account | 5 | Register in Week 7 |
| Design assets (illustrations) | 4 | Commission or create in Week 6 |
| Physical test devices | 5 | Borrow or purchase in Week 8 |
