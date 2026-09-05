---
name: Neobrutalism
colors:
  primary: "#FDC800"
  secondary: "#432DD7"
  success: "#16A34A"
  warning: "#D97706"
  danger: "#DC2626"
  surface: "#FBFBF9"
  text: "#1C293C"
  neutral: "#FBFBF9"
  bg: "#f5f5f0"
  bg-card: "#ffffff"
  bg-elevated: "#fafafa"
  border: "#e0e0e0"
  border-strong: "#cccccc"
  shadow: "#1a1a1a"
typography:
  h1:
    fontFamily: "Inter"
    fontSize: 2.1875rem
    fontWeight: 900
  body-md:
    fontFamily: "Inter"
    fontSize: 0.9375rem
  label-caps:
    fontFamily: "JetBrains Mono"
    fontSize: 0.8125rem
  sourceScale: "13/15/17/21/27/35"
  weights: "400, 500, 600, 700, 800, 900"
rounded:
  sm: 0px
  md: 0px
  all: 0px
spacing:
  sm: 4px
  md: 8px
  sourceScale: "4/8/12/16/24/32"
borders:
  width: 2px
  style: solid
  color: "--border-strong"
shadows:
  sm: "2px 2px 0"
  md: "4px 4px 0"
  lg: "6px 6px 0"
transitions: "none"
currency: "₹ (INR)"
---

## Overview

Modern take on brutalism with bold borders, vivid accent colors, and raw, high-contrast layouts on warm surfaces. This is the design system for a **Splitwise clone** — a group expense tracker with real-time settlement, ₹ (Indian Rupee) currency, and Socket.IO live updates.

## Brand Identity

- **App Name:** Splitwise
- **Logo:** 💸 (emoji, used inline)
- **Tagline:** "Split expenses. Stay friends."
- **Currency:** ₹ (Indian Rupee / INR)
- **Locale:** en-IN for dates and currency
- **Dark Mode:** Supported via `data-theme="dark"` attribute

## Style Foundations

- **Visual style:** modern, clean, high-contrast
- **Typography scale:** 13/15/17/21/27/35
- **Typography fonts:** primary=Inter, display=Inter, mono=JetBrains Mono
- **Typography weights:** 400, 500, 600, 700, 800, 900
- **Color palette:** primary, neutral, success, warning, danger
- **Spacing scale:** 4/8/12/16/24/32
- **Borders:** 2px solid everywhere, hard shadows, no border-radius
- **Transitions:** `transition: none` on all interactive elements

## Colors

### Core Tokens
- **Primary (#FDC800):** Yellow accent — theme toggle, highlights
- **Secondary (#432DD7):** Purple accent — secondary actions
- **Success (#16A34A):** Green — positive balances, settled states
- **Warning (#D97706):** Amber — caution states
- **Danger (#DC2626):** Red — primary CTA, errors, negative balances
- **Surface (#FBFBF9):** Light warm background
- **Text (#1C293C):** Dark text on light surfaces

### Extended Palette
- **Red scale:** 50→900 (light to dark), used for primary CTA, errors, tab 1
- **Yellow scale:** 50→900, used for theme toggle, demo banners, tab 1 hover
- **Green scale:** 50→900, used for success, balances, tab 3
- **Blue scale:** 50→900, used for links, focus rings, tab 2

### Color Cycling Pattern
Components use `nth-child(4n+1)` through `4n+4` to cycle through red/yellow/green/blue. This creates visual variety in lists without manual color assignment:
- `nth-child(4n+1)` → Red
- `nth-child(4n+2)` → Yellow
- `nth-child(4n+3)` → Green
- `nth-child(4n+4)` → Blue

## Typography

### Font Loading
- Inter: 400, 500, 600, 700, 800, 900 (Google Fonts)
- JetBrains Mono: for code/data display (load separately if needed)

### Scale
- **h1:** `clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem)` — 900 weight, 1.15 line-height
- **h2:** `clamp(1.4rem, 1.1rem + 1vw, 1.875rem)` — 900 weight
- **h3:** `clamp(1.15rem, 1rem + 0.5vw, 1.35rem)` — 800 weight
- **h4:** `clamp(1rem, 0.9rem + 0.3vw, 1.125rem)` — 800 weight
- **Body:** 1rem — 400 weight, 1.6 line-height
- **Small:** 0.875rem — 400 weight
- **XS:** 0.75rem — 700-800 weight
- **2XS:** 0.6875rem — 700-800 weight

### Heading Treatment
- Letter-spacing: -0.02em to -0.03em (tighter than body)
- Line-height: 1.15 (h1) to 1.35 (UI labels)

### UI Labels
- Text-transform: uppercase
- Letter-spacing: 0.06em
- Weight: 900
- Font-size: xs (0.75rem)

### Monetary Numbers
- `font-variant-numeric: tabular-nums` on body and all number elements
- Format: `₹{value.toFixed(2)}` — always 2 decimal places
- Locale: `en-IN` for dates and currency formatting

## Spacing

| Token | Value | Rem |
|-------|-------|-----|
| `--space-1` | 4px | 0.25rem |
| `--space-2` | 8px | 0.5rem |
| `--space-3` | 12px | 0.75rem |
| `--space-4` | 16px | 1rem |
| `--space-5` | 20px | 1.25rem |
| `--space-6` | 24px | 1.5rem |
| `--space-8` | 32px | 2rem |
| `--space-10` | 40px | 2.5rem |
| `--space-12` | 48px | 3rem |
| `--space-16` | 64px | 4rem |

## Borders & Shadows

### Borders
- Width: 2px (3px only for navbar bottom and active tab indicator)
- Style: solid
- Color: `var(--border-strong)` (#cccccc light / #444444 dark)
- Radius: 0px everywhere — no exceptions

### Shadows
- Sm: `2px 2px 0 var(--shadow)` — chips, small elements
- Default: `4px 4px 0 var(--shadow)` — cards, buttons
- Lg: `6px 6px 0 var(--shadow)` — hover states, modals
- Shadow color: `#1a1a1a` (light) / `#000000` (dark)
- No blur, no spread — hard offset only

## Transitions

**Philosophy:** All interactive elements use `transition: none` for instant feedback. The neobrutalism aesthetic demands immediate state changes — no easing, no delays.

Exceptions (decorative only):
- `.spinner` rotation (0.7s)
- Friendship character animations (bouncing, waving, hugging)

## Component Catalog

### Button (`.btn`)
- Variants: default, primary (red), success (green), cash (yellow), ghost, outline
- Sizes: default, sm, full
- States: default, hover (elevate), active (sunken), disabled (dimmed)
- No transition

### Card
- `.group-card` — Color-cycling top border, avatar, footer with counts
- `.expense-card` — Header with amount badge, split chips
- `.settlement-card` — Flow display with arrow, date

### Modal
- `.modal-overlay` — Fixed, semi-transparent black, z-index 1000
- `.modal` — White card, max-width 480px, scrollable
- `.modal-actions` — Right-aligned button row

### Form
- `.form-group` — Label (uppercase xs) + input (2px border, shadow-sm)
- Focus: Blue border + 3px blue glow
- Error: `.field-error` (red border) + `.field-error-msg` (red text)

### Navbar
- Sticky, flex row, 3px bottom border
- Brand left, user actions right

### Tabs
- Color-coded: red/blue/green for expenses/balances/settlements
- Active: colored bg + 3px bottom border
- Hover: light colored bg

### Member Chip
- Color-cycling avatar + name
- 2px border, shadow-sm

### Balance Row
- User info + amount badge (positive=green, negative=red, zero=muted)

### Settlement Row
- Flow display (user → user) + amount + action buttons
- Yellow arrow

### Empty State
- Centered, illustration + heading + description + optional CTA

### Toast Notifications
- Dark bg (#1a1212), white text, 3000ms duration
- Emoji icons for context (💸, ✅, 🎉)

### QR Code
- Centered section, bordered canvas, payment button
- 200px canvas with white padding

### Search Results
- Avatar + name/email, yellow hover highlight

### Loading
- Full viewport centered spinner (40px, blue, rotating)

### Back Button
- Blue bg, blue border, shadow-sm
- Hover: deeper blue, elevated shadow

### Theme Toggle
- 42px square, yellow bg, 🌙/☀️ icon

### Split Mode Toggle
- 3 equal buttons: equal (red), custom (blue), percentage (green)

### Payment Method Toggle
- Horizontal button row: selected=primary, unselected=outline

## Accessibility

### WCAG 2.2 AA Requirements
- Contrast: 4.5:1 minimum for all text
- Focus: Visible outlines on all interactive elements
- Keyboard: All actions accessible via Tab/Enter/Space
- Labels: All inputs must have associated `<label>` elements
- Semantic HTML: `<button>`, `<a>`, `<nav>`, `<main>`, `<header>`
- Error announcements: Use aria-describedby or aria-live

### Emoji Accessibility
- Buttons with emoji + text: text provides accessible name
- Decorative emoji in headings: no aria needed
- Functional emoji: pair with text, never sole indicator

### Testable Criteria
- [ ] Tab through entire page — every interactive element receives visible focus
- [ ] Screen reader announces all form labels, errors, and status changes
- [ ] Color contrast passes WCAG AA for all text sizes
- [ ] Modal can be closed with Escape key
- [ ] All buttons have accessible names
- [ ] Error messages are associated with their fields

## Responsive Behavior

### Breakpoint
- Desktop: >640px (default)
- Mobile: ≤640px

### Mobile Adjustments
- Reduced padding on content areas
- Single-column grid layouts
- Column flex on rows that are horizontal on desktop
- Scrollable tab bar
- Smaller tab font/padding
- Reduced modal/card padding

### Rules
- Never hide content on mobile — reflow it
- Touch targets ≥44x44px
- Horizontal scroll acceptable for tab bars

## Currency Display

- Always use `₹` symbol prefix
- Always 2 decimal places: `₹{value.toFixed(2)}`
- Tabular numbers on all monetary elements
- Dates: `toLocaleDateString('en-IN')`
- Amount badges: bold, bordered, with color coding

## Anti-Patterns

### CSS
- ❌ Hardcoded hex colors (use tokens)
- ❌ Border-radius (always 0px)
- ❌ Transitions on interactive elements
- ❌ Blur on box-shadow (hard offset only)
- ❌ Inline styles for colors/borders
- ❌ `!important` except `.field-error`

### Component
- ❌ Buttons without `.btn` base class
- ❌ `<div onClick>` instead of `<button>`
- ❌ Modals without `.modal-overlay`
- ❌ Inputs without `<label>`
- ❌ Error state without both visual AND text indicator

### Naming
- ❌ CamelCase class names
- ❌ Generic component names (`.card`, `.btn` without prefix)
- ❌ Utility classes over semantic names

### Accessibility
- ❌ Removing focus outlines
- ❌ Color-only status indicators
- ❌ Non-keyboard-accessible interactive elements

## Migration Checklist

For new or existing components:
1. [ ] All colors reference CSS custom properties
2. [ ] All spacing uses `--space-*` tokens
3. [ ] Border is always 2px solid `--border-strong`
4. [ ] Shadow uses `--shadow-sm`, `--shadow`, or `--shadow-lg`
5. [ ] No border-radius (all 0px)
6. [ ] No transitions on interactive elements
7. [ ] Interactive elements use proper HTML tags
8. [ ] All inputs have associated labels
9. [ ] Focus-visible states are preserved
10. [ ] Responsive at 640px breakpoint
11. [ ] Dark mode works via token system
12. [ ] Monetary values use tabular-nums and ₹ formatting
13. [ ] Class names follow `.{component}-{modifier}` pattern

## QA Checklist

### Token Compliance
- [ ] No hardcoded hex colors
- [ ] All spacing uses `--space-*` tokens
- [ ] All border-radius values are 0px
- [ ] Shadows use only defined shadow tokens

### Component Structure
- [ ] Semantic class names following conventions
- [ ] Proper HTML tags for interactive elements
- [ ] Modal pattern used consistently
- [ ] Form labels for all inputs

### Dark Mode
- [ ] All colors work via tokens in both themes
- [ ] No hardcoded light-only or dark-only colors
- [ ] Shadows adapt per theme

### Accessibility
- [ ] Focus-visible outlines present
- [ ] Color not sole status indicator
- [ ] Error messages visually associated
- [ ] Loading states announced

### Responsive
- [ ] Layout reflows at 640px
- [ ] Touch targets ≥44x44px
- [ ] No horizontal overflow

### Currency
- [ ] ₹ with 2 decimal places
- [ ] tabular-nums on number displays
- [ ] en-IN locale for dates
