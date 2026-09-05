# SplitEase — Design Document

## 1. Overview

SplitEase uses a **neobrutalism design system** adapted for mobile touch interfaces. The core aesthetic — bold borders, vivid accent colors, hard shadows, and raw high-contrast layouts — is preserved from the web version but softened slightly for touch friendliness (2-4px border-radius on interactive elements).

---

## 2. Design Principles

1. **Bold & Unapologetic** — Thick borders, hard shadows, zero subtlety
2. **Instant Feedback** — No transitions, immediate state changes
3. **Color as Language** — Red/yellow/green/blue cycling creates visual hierarchy
4. **Touch-First** — Generous tap targets (≥44px), clear pressed states
5. **Accessible** — WCAG 2.2 AA contrast, visible focus, screen reader support

---

## 3. Color System

### 3.1 Core Palette (Light Mode)
| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#FDC800` | Theme toggle, highlights, brand yellow |
| Secondary | `#432DD7` | Secondary actions, links |
| Success | `#16A34A` | Positive balances, settlements |
| Warning | `#D97706` | Caution states |
| Danger | `#DC2626` | Primary CTA, errors, negative balances |
| Surface | `#FBFBF9` | Page background |
| Text | `#1C293C` | Primary text |
| Card | `#FFFFFF` | Card/panel surfaces |
| Border | `#E0E0E0` | Subtle borders |
| Border Strong | `#CCCCCC` | Primary borders |
| Shadow | `#1A1A1A` | Shadow color (light mode) |

### 3.2 Core Palette (Dark Mode)
| Name | Hex | Usage |
|------|-----|-------|
| Background | `#0F0F0F` | Page background |
| Card | `#1A1A1A` | Card/panel surfaces |
| Elevated | `#222222` | Elevated surfaces |
| Text | `#FAFAFA` | Primary text |
| Text Secondary | `#BBBBBB` | Secondary text |
| Border | `#2A2A2A` | Subtle borders |
| Border Strong | `#444444` | Primary borders |
| Shadow | `#000000` | Shadow color (dark mode) |

### 3.3 Color Cycling
Lists use `nth-child` cycling for visual variety:
- Position 1 → Red (`#DC2626`)
- Position 2 → Yellow (`#FACC15`)
- Position 3 → Green (`#22C55E`)
- Position 4 → Blue (`#3B82F6`)
- Repeats every 4 items

### 3.4 Extended Palette
Each color has a full 50-900 scale for tints, backgrounds, and borders:
- **Red:** `#FEF2F2` (50) → `#7F1D1D` (900)
- **Yellow:** `#FEFCE8` (50) → `#713F12` (900)
- **Green:** `#F0FDF4` (50) → `#14532D` (900)
- **Blue:** `#EFF6FF` (50) → `#1E3A8A` (900)

---

## 4. Typography

### 4.1 Font Stack
- **Primary:** Inter (400, 500, 600, 700, 800, 900)
- **Mono:** JetBrains Mono (for amounts/codes)
- **System fallback:** -apple-system, BlinkMacSystemFont, sans-serif

### 4.2 Type Scale
| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 | 28px (clamp) | 900 | 1.15 | -0.03em |
| H2 | 24px (clamp) | 900 | 1.2 | -0.02em |
| H3 | 18px (clamp) | 800 | 1.2 | -0.01em |
| H4 | 16px (clamp) | 800 | 1.35 | 0 |
| Body | 16px | 400 | 1.6 | 0 |
| Small | 14px | 400 | 1.6 | 0 |
| XS | 12px | 700-800 | 1.35 | 0 |
| 2XS | 11px | 700-800 | 1.35 | 0 |

### 4.3 UI Labels
- Text-transform: UPPERCASE
- Letter-spacing: 0.06em
- Weight: 900
- Size: 12px (XS)

### 4.4 Tabular Numbers
All monetary values use `fontVariant: ['tabular-nums']` for aligned columns.

---

## 5. Spacing

### 5.1 Scale (4px base)
| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight gaps, icon padding |
| sm | 8px | Small gaps, chip padding |
| md | 12px | Standard gaps |
| base | 16px | Default padding |
| lg | 20px | Card padding |
| xl | 24px | Section spacing |
| 2xl | 32px | Large gaps |
| 3xl | 40px | Screen padding |
| 4xl | 48px | Major sections |
| 5xl | 64px | Full page padding |

### 5.2 Touch Targets
- Minimum: 44px × 44px (Apple HIG)
- Preferred: 48px × 48px (Material Design)
- Button height: 48px (default), 36px (compact)

---

## 6. Borders & Shadows

### 6.1 Borders
- **Default width:** 2px
- **Active/emphasis width:** 3px (navbar, active tabs)
- **Style:** solid
- **Color:** `var(--border-strong)`
- **Radius:** 0px (sharp corners) — **softened to 2-4px on interactive elements for touch**

### 6.2 Border Radius (Mobile Adaptation)
| Element | Radius | Reason |
|---------|--------|--------|
| Cards | 0px | Preserve brutalist aesthetic |
| Buttons | 0px | Sharp, intentional |
| Inputs | 2px | Slightly softer for text entry |
| Chips/Badges | 0px | Match cards |
| Modals | 0px | Sharp, framed |
| Avatars | 50% (circle) | Always circular |
| FAB | 50% (circle) | Standard FAB shape |
| Toggle pills | 0px | Sharp |

### 6.3 Shadows
| Level | Offset | Blur | Usage |
|-------|--------|------|-------|
| Sm | 2px 2px | 0 | Chips, small elements |
| Default | 3px 3px | 0 | Cards, buttons (mobile: reduced from 4px) |
| Lg | 4px 4px | 0 | Hover states, modals (mobile: reduced from 6px) |

**Shadow color:** `#1A1A1A` (light) / `#000000` (dark)

### 6.4 Pressed State
- `transform: translate(2px, 2px)` — element moves down-right
- `shadow: none` — shadow disappears (element is "pressed into" surface)
- This replaces hover on touch devices

---

## 7. Components

### 7.1 Button
```
┌─────────────────┐
│    Label Text    │  ← 800 weight, uppercase
└─────────────────┘
  2px border, hard shadow
```

**Variants:**
| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| Default | White | Text | Border-strong |
| Primary | #DC2626 | White | #B91C1C |
| Success | #22C55E | Text | #16A34A |
| Cash | #FEF9C3 | Text | #FDE047 |
| Ghost | Transparent | Text | None |
| Outline | White | Text | Border-strong |

**States:** Default → Pressed (translate + remove shadow) → Disabled (opacity 0.5)

### 7.2 FAB (Floating Action Button)
```
     ┌───┐
     │ + │  ← 56px circle, red bg, white icon
     └───┘
       │
  3px border, 4px shadow
  Position: bottom center, above tab bar
  Elevation: overlaps tab bar by 20px
```

**Interactions:**
- Tap → Action sheet (Add Expense / Create Group)
- Long press → Haptic feedback
- Pressed → translate(2px, 2px), no shadow

### 7.3 Bottom Tab Bar
```
┌─────┬─────┬───┬─────┬─────┐
│ 🏠  │ 👥  │   │ 📋  │ 👤  │
│Home │Group│ + │Activ│Profi│
└─────┴─────┴───┴─────┴─────┘
         ↑ FAB overlaps here
```

**Styling:**
- Background: white (light) / #1A1A1A (dark)
- Border top: 2px solid border-strong
- Active: Icon + label in accent color (red)
- Inactive: Icon + label in muted color
- Height: 56px + safe area inset

### 7.4 Card
```
┌────────────────────────────┐
│ 🟢 Title Text              │  ← color-coded top border
│                            │
│ Description or meta text   │
│                            │
├────────────────────────────┤
│ Footer info    │  ₹123.00  │
└────────────────────────────┘
  2px border, 3px shadow, 16px padding
```

**Interactions:**
- Tap → Navigate to detail
- Pressed → translate(2px, 2px), shadow removed

### 7.5 Expense Card
```
┌────────────────────────────────┐
│ Dinner at Café         ₹500.00 │
│ Paid by Alice · Sep 5, 2026   │
│                                │
│ [Alice: ₹250] [Bob: ₹250]     │  ← split chips (color cycling)
└────────────────────────────────┘
```

**Expandable behavior:**
- Default: Shows description + amount + meta
- Expanded (tap): Reveals split breakdown chips
- Haptic on expand

### 7.6 Modal / Bottom Sheet
```
┌────────────────────────────────┐
│                                │
│        (drag handle)           │
│                                │
│  ┌──────────────────────────┐  │
│  │ Title                    │  │
│  │                          │  │
│  │ Content...               │  │
│  │                          │  │
│  │        [Cancel] [Action] │  │
│  └──────────────────────────┘  │
│                                │
└────────────────────────────────┘
  Semi-transparent overlay behind
```

### 7.7 Form Input
```
LABEL (uppercase, xs, bold)
┌──────────────────────────────┐
│ Placeholder text             │  ← 2px border, 2px radius
└──────────────────────────────┘
Error message (if any)          ← red, 2xs, bold
```

**States:**
- Default: White bg, 2px border
- Focus: Blue border (#3B82F6), 3px blue glow ring
- Error: Red border (#DC2626), red glow ring

### 7.8 Member Chip
```
┌──────────────────┐
│ [A] Alice         │  ← colored avatar circle + name
└──────────────────┘
  2px border, 2px shadow, color cycling
```

### 7.9 Balance Row
```
┌──────────────────────────────────┐
│ [A] Alice              +₹500.00  │  ← green badge
│ [B] Bob                -₹250.00  │  ← red badge
│ [C] Charlie              ₹0.00   │  ← muted badge
└──────────────────────────────────┘
```

### 7.10 Settlement Row
```
┌──────────────────────────────────────┐
│ Bob  →  Alice        ₹250.00  [Pay] │
└──────────────────────────────────────┘
  Yellow arrow, action button on right
```

### 7.11 QR Code Section
```
┌──────────────────────────┐
│                          │
│    ┌──────────────┐      │
│    │              │      │
│    │   QR Code    │      │  ← 200px, 2px border
│    │              │      │
│    └──────────────┘      │
│                          │
│    Scan with any UPI app │
│       ₹250.00            │
│    [Pay via UPI]         │
│                          │
└──────────────────────────┘
```

### 7.12 Onboarding Slide
```
┌──────────────────────────────────┐
│                                  │
│         [Illustration]           │
│                                  │
│        Bold Heading Text         │
│                                  │
│    Description text that explains│
│    the feature in 1-2 lines      │
│                                  │
│         ● ○ ○                    │  ← dot indicators
│                                  │
│         [Next →]                 │
│                                  │
└──────────────────────────────────┘
  Yellow (#FDC800) background
  Black text
```

### 7.13 Sync Banner
```
┌──────────────────────────────────┐
│ ⏳ 2 changes pending sync        │  ← yellow bg, dark text
└──────────────────────────────────┘
  Sticky banner below navbar
  Disappears when all synced
```

### 7.14 Activity Feed Item
```
┌──────────────────────────────────┐
│ [A] Alice added "Dinner"  ₹500   │
│     Today at 2:30 PM             │
├──────────────────────────────────┤
│ [B] Bob settled with Alice ₹250  │
│     Today at 1:15 PM             │
├──────────────────────────────────┤
│ ─── Yesterday ─────────────────  │  ← date separator
├──────────────────────────────────┤
│ [C] Charlie added "Taxi"   ₹150  │
│     Yesterday at 8:45 PM         │
└──────────────────────────────────┘
```

---

## 8. Navigation Design

### 8.1 Screen Hierarchy
```
Root
├── Onboarding (3 slides) → first launch only
├── Auth Stack
│   ├── Login
│   └── Register
└── Main Tabs
    ├── Home (Dashboard)
    │   └── Group Detail → Add Expense → Settlement QR
    ├── Groups (List)
    │   └── Group Detail → ...
    ├── [FAB] → Action Sheet → Add Expense / Create Group
    ├── Activity (Feed)
    └── Profile
        └── Settings sections
```

### 8.2 Transition Animations
| From → To | Animation |
|-----------|-----------|
| Tab → Tab | Cross-fade (default) |
| Tab → Stack | Slide from right |
| Stack → Tab | Slide from left |
| Modal open | Slide up from bottom |
| Modal close | Slide down |
| Onboarding → Auth | Fade |

### 8.3 Gesture Support
- **Swipe back:** Navigate back (iOS standard)
- **Pull to refresh:** Refresh list data
- **Scroll to dismiss:** Keyboard dismisses on scroll

---

## 9. Dark Mode

### 9.1 Toggle
- Three options: System Default, Light, Dark
- Stored in AsyncStorage
- Applied via React context

### 9.2 Token Mapping
All colors swap via design tokens — no hardcoded values in components:
```javascript
const themes = {
  light: {
    background: '#F5F5F0',
    card: '#FFFFFF',
    text: '#1A1A1A',
    border: '#E0E0E0',
    shadow: '#1A1A1A',
    // ...
  },
  dark: {
    background: '#0F0F0F',
    card: '#1A1A1A',
    text: '#FAFAFA',
    border: '#2A2A2A',
    shadow: '#000000',
    // ...
  }
};
```

### 9.3 Adaptations
- Shadows always use black in dark mode
- Borders are lighter against dark backgrounds
- Color cycling tints are inverted (darker backgrounds, lighter text)

---

## 10. Haptic Feedback

| Trigger | Haptic Type |
|---------|-------------|
| Button press | Light impact |
| Expense added | Success |
| Settlement recorded | Success |
| Error occurred | Error (notification) |
| Pull to refresh | Selection |
| Long press FAB | Medium impact |
| Tab switch | Selection |

---

## 11. Splash Screen

```
┌──────────────────────────────────┐
│                                  │
│                                  │
│            💸                    │  ← large emoji, centered
│                                  │
│        SplitEase                 │  ← bold, black, 28px
│                                  │
│   Split expenses. Stay friends.  │  ← subtitle, gray
│                                  │
│                                  │
└──────────────────────────────────┘
  Background: #FDC800 (yellow)
  Duration: Until auth check completes
```

---

## 12. Empty States

```
┌──────────────────────────────────┐
│                                  │
│         [Illustration]           │
│                                  │
│      No groups yet!              │  ← bold, h3
│                                  │
│  Create a group to start         │
│  splitting expenses.             │  ← muted, body
│                                  │
│       [Create Group]             │  ← primary button
│                                  │
└──────────────────────────────────┘
```

---

## 13. Loading States

### 13.1 Screen Loading
```
┌──────────────────────────────────┐
│                                  │
│                                  │
│           ◌ (spinner)            │  ← 40px, blue, rotating
│                                  │
│                                  │
└──────────────────────────────────┘
  Background matches page
```

### 13.2 Button Loading
```
┌─────────────────────────┐
│    Adding... (spinner)   │  ← text swap, no animation on button
└─────────────────────────┘
```

### 13.3 Pull to Refresh
- Native React Native RefreshControl
- Blue spinner, matches neobrutalism accent

---

## 14. Accessibility

### 14.1 Requirements
- All text: 4.5:1 contrast ratio minimum
- All interactive elements: ≥44px touch target
- All buttons: accessible name (text or aria-label)
- All images: alt text or decorative marking
- Screen reader: VoiceOver (iOS) + TalkBack (Android)
- Dynamic Type: Support system font scaling

### 14.2 Focus Management
- Tab order follows visual layout
- Modals trap focus
- Form errors announced via accessibilityLiveRegion
- Loading states announced via accessibilityState

### 14.3 Color Independence
- Status never conveyed by color alone
- Always pair color with text/icon (e.g., green badge + "+" prefix)
- Balance amounts include sign (+/-) text

---

## 15. Responsive Behavior

### 15.1 Screen Sizes
| Category | Width | Adaptations |
|----------|-------|-------------|
| Small phone | <360px | Reduce padding, single column |
| Standard phone | 360-414px | Default layout |
| Large phone | 414-480px | Slightly more padding |
| Tablet | >720px | Two-column layout (future) |

### 15.2 Safe Areas
- Top: Status bar + notch/dynamic island
- Bottom: Home indicator (iPhone) / navigation bar (Android)
- Use `useSafeAreaInsets()` from react-native-safe-area-context

---

## 16. Assets

### 16.1 App Icon
- 1024×1024px
- Yellow (#FDC800) background
- 💸 emoji centered
- No text (iOS requirement)
- No transparency

### 16.2 Splash Screen
- Yellow (#FDC800) background
- 💸 centered
- App name below

### 16.3 Onboarding Illustrations
- 3 illustrations (Groups, Split, Settle)
- Simple, flat style with neobrutalism colors
- SVG or PNG with transparency
