# SplitEase — Next Steps & Roadmap

## 1. Immediate Next Steps (Pre-Development)

### 1.1 Environment Setup
- [ ] Install Node.js 18+ (LTS)
- [ ] Install Expo CLI: `npm install -g expo-cli`
- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Create Expo account at expo.dev
- [ ] Install Android Studio + Android SDK (API 33+)
- [ ] Set up Android emulator (Pixel 6, API 33)
- [ ] Install Xcode (macOS only) for iOS simulator
- [ ] Install CocoaPods: `sudo gem install cocoapods`

### 1.2 Project Initialization
- [ ] Run `npx create-expo-app splitwise-app --template blank`
- [ ] Install core dependencies (see package list below)
- [ ] Configure `app.json` with app name, scheme, icons
- [ ] Set up folder structure per Architecture.md
- [ ] Configure ESLint + Prettier

### 1.3 Backend Preparation
- [ ] Add `POST /api/devices` endpoint to backend
- [ ] Add `DELETE /api/devices/:token` endpoint
- [ ] Install `firebase-admin` for push notifications
- [ ] Set up Firebase project (console.firebase.google.com)
- [ ] Generate `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
- [ ] Test push notification delivery

---

## 2. Development Phases

### Phase 1: Foundation (Week 1-2)
**Goal:** Working app shell with auth and navigation

- [ ] Expo project setup with all dependencies
- [ ] Design tokens file (colors, spacing, typography, shadows)
- [ ] Navigation structure (bottom tabs + stack)
- [ ] Splash screen (yellow background, 💸 logo)
- [ ] Auth screens (Login, Register) with neobrutalism styling
- [ ] JWT storage in SecureStore
- [ ] API client with interceptors
- [ ] Basic error handling

### Phase 2: Core Features (Week 3-4)
**Goal:** Full expense tracking on mobile

- [ ] Home/Dashboard screen
- [ ] Groups list screen
- [ ] Group detail screen with tabs (Expenses, Balances, Settlements)
- [ ] Add Expense full-screen form
- [ ] Member chips with color cycling
- [ ] Balance display with positive/negative badges
- [ ] Settlement flow (record payment)

### Phase 3: Real-time & Payments (Week 5-6)
**Goal:** Live updates and UPI integration

- [ ] Socket.IO integration for real-time updates
- [ ] Toast notifications for live events
- [ ] UPI deep link payment flow
- [ ] Personal QR code generation with embedded amount
- [ ] Payment method selection (UPI / Cash)
- [ ] Settlement recording with haptic feedback

### Phase 4: Polish & Features (Week 7-8)
**Goal:** Production-ready app

- [ ] Onboarding walkthrough (3 screens)
- [ ] Activity feed (grouped by date)
- [ ] Profile screen with settings
- [ ] Theme toggle (light/dark/system)
- [ ] Deep linking (splitease://)
- [ ] Pull-to-refresh on all lists
- [ ] Loading states and empty states
- [ ] Search and add members

### Phase 5: Launch Prep (Week 9-10)
**Goal:** Store submission

- [ ] Push notification setup (FCM/APNs)
- [ ] Sentry crash reporting
- [ ] Firebase Analytics
- [ ] App icon and splash screen assets
- [ ] EAS Build configuration
- [ ] Test on physical devices (iOS + Android)
- [ ] App Store submission
- [ ] Google Play submission

---

## 3. Future Features (Post-MVP)

### 3.1 Phase 6: Enhanced Payments
- [ ] Razorpay SDK integration
- [ ] Payment history screen
- [ ] Recurring expenses
- [ ] Currency conversion for international groups

### 3.2 Phase 7: Social Features
- [ ] User avatars/photo upload
- [ ] Group descriptions with images
- [ ] Expense receipts/attachments
- [ ] Comment on expenses

### 3.3 Phase 8: Intelligence
- [ ] Expense categorization (auto-tag: food, transport, etc.)
- [ ] Monthly spending summaries
- [ ] Balance trends over time
- [ ] Smart settlement suggestions

### 3.4 Phase 9: Advanced
- [ ] Receipt scanning with OCR
- [ ] Multi-currency support
- [ ] Export to CSV/PDF
- [ ] Split by percentage (enhanced UI)
- [ ] Recurring split templates

### 3.5 Phase 10: Platform
- [ ] iOS/Android home screen widgets
- [ ] App Clips / Instant Apps
- [ ] Apple Watch / Wear OS companion
- [ ] iMessage / WhatsApp share extensions

---

## 4. Dependency Installation Order

```bash
# 1. Initialize project
npx create-expo-app splitwise-app --template blank
cd splitwise-app

# 2. Core navigation
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler

# 3. State management
npm install zustand

# 4. Networking
npm install axios socket.io-client

# 5. Storage
npx expo install expo-secure-store @react-native-async-storage/async-storage
npm install react-native-mmkv

# 6. Notifications
npx expo install expo-notifications
npm install firebase-admin  # backend only

# 7. UI components
npx expo install expo-haptics expo-linking expo-splash-screen
npm install react-native-reanimated react-native-qrcode-styled

# 8. Utilities
npm install @react-native-community/netinfo

# 9. Analytics & Monitoring
npm install @sentry/react-native
npm install @react-native-firebase/app @react-native-firebase/analytics

# 10. Dev tools
npm install -D eslint prettier eslint-config-prettier
```

---

## 5. Key Decisions to Make

| Decision | Options | Recommendation |
|----------|---------|----------------|
| State persistence | MMKV vs AsyncStorage | MMKV (faster) |
| HTTP client | Axios vs fetch | Axios (interceptors) |
| Navigation | React Navigation vs Expo Router | Expo Router (simpler) |
| Icons | emoji vs vector icons | emoji (match web) |
| Animations | Reanimated vs Animated API | Reanimated (better perf) |
| QR codes | react-native-qrcode vs expo | expo-based |

---

## 6. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Expo managed limitations | May need native modules | Use Expo dev client when needed |
| Backend not ready for push | No notifications | Implement frontend stubs first |
| iOS review rejection | Delayed launch | Follow Apple HIG, prepare appeals |
| Android fragmentation | UI breaks on some devices | Test on 3+ device sizes |
| Offline sync conflicts | Data loss | Simple last-write-wins for MVP |
| Socket.IO disconnections | Missed updates | Auto-reconnect + refresh on focus |

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| App size | < 30MB |
| Cold start | < 2 seconds |
| Time to first screen | < 1 second (after splash) |
| Crash rate | < 1% |
| Push notification delivery | > 95% |
| Offline cache hit rate | > 90% for view operations |
