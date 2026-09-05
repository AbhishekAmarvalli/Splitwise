# 💸 SplitEase

A cross-platform mobile expense-splitting app built with React Native (Expo). Split expenses with friends, track balances, and settle up via UPI — all with a bold neobrutalism design.

![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)
![Framework](https://img.shields.io/badge/framework-React%20Native%20(Expo)-61DAFB)
![Design](https://img.shields.io/badge/design-Neobrutalism-FDC800)
![Currency](https://img.shields.io/badge/currency-₹%20INR-16A34A)

---

## Features

- **Group Management** — Create groups, add/remove members, share invite links
- **Expense Tracking** — Add expenses with equal, custom, or percentage splits
- **Debt Simplification** — Greedy algorithm minimizes settlement transactions
- **Real-time Updates** — Socket.IO broadcasts changes to all group members
- **UPI Payments** — Deep link to UPI apps or generate personal QR codes
- **Settlement Recording** — Mark debts as paid with payment method tracking
- **Push Notifications** — Get notified of expenses, settlements, and group activity
- **Offline Support** — View cached data offline, blocked actions show "No connection"
- **Dark Mode** — Full dark mode with system default detection
- **Haptic Feedback** — Tactile feedback on key actions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo managed) |
| Language | JavaScript |
| Navigation | React Navigation 6 |
| State | Zustand |
| HTTP | Axios |
| Realtime | Socket.IO |
| Storage | expo-secure-store + AsyncStorage |
| Push | expo-notifications (FCM/APNs) |
| Analytics | Firebase Analytics + Sentry |
| Design | Neobrutalism (custom design system) |

---

## Project Structure

```
splitwise-app/
├── app/                  # Expo Router screens
│   ├── (auth)/           # Login, Register
│   ├── (onboarding)/     # 3-screen walkthrough
│   ├── (tabs)/           # Main tab screens
│   ├── group/            # Group detail
│   ├── expense/          # Add expense
│   └── settlement/       # Settlement QR
├── src/
│   ├── components/       # Reusable UI components
│   ├── store/            # Zustand stores
│   ├── hooks/            # Custom hooks
│   ├── services/         # API, Socket, Push, Analytics
│   ├── utils/            # Utilities (format, validation, UPI)
│   ├── tokens/           # Design system tokens
│   └── constants/        # App constants
├── assets/               # Icons, splash, illustrations
├── app.json              # Expo configuration
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (`node -v`)
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Expo account ([expo.dev/signup](https://expo.dev/signup))
- Android Studio (for Android emulator)
- Xcode (for iOS simulator, macOS only)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd splitwise-app

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Emulator/Simulator

```bash
# Android emulator
npx expo start --android

# iOS simulator (macOS only)
npx expo start --ios
```

### Running on Physical Device

1. Install **Expo Go** from App Store / Play Store
2. Run `npx expo start`
3. Scan the QR code with Expo Go

---

## Environment Variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_API_URL=https://your-backend.onrender.com
EXPO_PUBLIC_WS_URL=wss://your-backend.onrender.com
EXPO_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
EXPO_PUBLIC_FIREBASE_CONFIG={"apiKey":"...","projectId":"..."}
```

---

## Design System

SplitEase uses a **neobrutalism design system** with:
- Bold 2px borders
- Hard shadows (no blur)
- Vivid accent colors (red, yellow, green, blue)
- Color cycling in lists
- Sharp corners (0px radius, 2-4px on touch elements)
- No transitions (instant state changes)

See `design.md` for the complete design documentation.

---

## Backend

SplitEase shares a backend with the existing Splitwise web clone:
- **API:** Node.js + Express
- **Database:** PostgreSQL
- **Realtime:** Socket.IO
- **Auth:** JWT + bcryptjs

### Mobile-Specific Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/devices | Register push notification token |
| DELETE | /api/devices/:token | Unregister device |
| GET | /api/notifications | List notifications |
| PUT | /api/notifications/:id/read | Mark as read |

---

## Building for Production

### Android
```bash
# Build APK
eas build --platform android --profile preview

# Build AAB (for Play Store)
eas build --platform android --profile production
```

### iOS
```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Build for App Store
eas build --platform ios --profile production
```

---

## Testing

```bash
# Run on Android emulator
npx expo run:android

# Run on iOS simulator
npx expo run:ios

# Run tests (when available)
npm test
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture.md](./Architecture.md) | System architecture and data flow |
| [design.md](./design.md) | Design system and UI patterns |
| [memory.md](./memory.md) | State management and caching |
| [next.md](./next.md) | Roadmap and future features |
| [phases.md](./phases.md) | Development phases and milestones |
| [prd.md](./prd.md) | Product Requirements Document |
| [rules.md](./rules.md) | Coding conventions and design rules |

---

## Related Projects

- **Web version:** `../` (Splitwise web clone — React + Node.js)

---

## License

MIT
