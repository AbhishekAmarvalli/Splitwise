---
name: neobrutalism
description: Modern take on brutalism with bold borders, vivid accent colors, and raw, high-contrast layouts on warm surfaces.
license: MIT
metadata:
  author: typeui.sh
---

<!-- TYPEUI_SH_MANAGED_START -->
# neobrutalism Design System Skill (Universal)

## Mission
You are an expert design-system guideline author for neobrutalism design.
Create practical, implementation-ready guidance that can be directly used by engineers and designers.

## Brand
- **App:** Splitwise — a group expense tracker with real-time settlement
- **Logo:** 💸 (emoji used inline in navbar and headings)
- **Tagline:** "Split expenses. Stay friends."
- **Currency:** ₹ (Indian Rupee / INR)
- **Locale:** en-IN for dates and currency formatting

## Style Foundations
- Visual style: modern, clean, high-contrast
- Typography scale: 13/15/17/21/27/35 | Fonts: primary=Inter, display=Inter, mono=JetBrains Mono | weights=400, 500, 600, 700, 800, 900
- Color palette: primary, neutral, success, warning, danger | Tokens: primary=#FDC800, secondary=#432DD7, success=#16A34A, warning=#D97706, danger=#DC2626, surface=#FBFBF9, text=#1C293C
- Spacing scale: 4/8/12/16/24/32
- Borders: 2px solid everywhere, hard shadows (2-6px offset, no blur), no border-radius
- Transitions: explicitly `none` on all interactive elements for instant feedback

## Design Tokens — CSS Custom Properties (Light Mode)

### Core
| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#f5f5f0` | Page background |
| `--bg-card` | `#ffffff` | Card/panel surfaces |
| `--bg-elevated` | `#fafafa` | Elevated surfaces, hovers |
| `--bg-input` | `#ffffff` | Input fields |
| `--text` | `#1a1a1a` | Primary text |
| `--text-secondary` | `#555555` | Secondary text |
| `--text-muted` | `#999999` | Muted/caption text |
| `--accent` | `#dc2626` | Primary action accent |
| `--accent-hover` | `#b91c1c` | Accent hover state |
| `--accent-light` | `rgba(220, 38, 38, 0.08)` | Accent tint background |
| `--yellow` | `#fbbf24` | Warning/highlight |
| `--green` | `#22c55e` | Success indicator |
| `--green-dark` | `#16a34a` | Success dark |
| `--red` | `#ef4444` | Danger/error |
| `--border` | `#e0e0e0` | Subtle borders |
| `--border-strong` | `#cccccc` | Primary borders |

### Shadows
| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `2px 2px 0 #1a1a1a` | Subtle elevation |
| `--shadow` | `4px 4px 0 #1a1a1a` | Default elevation |
| `--shadow-lg` | `6px 6px 0 #1a1a1a` | Hover/active elevation |

### Spacing
| Token | Value |
|-------|-------|
| `--space-1` | `0.25rem` (4px) |
| `--space-2` | `0.5rem` (8px) |
| `--space-3` | `0.75rem` (12px) |
| `--space-4` | `1rem` (16px) |
| `--space-5` | `1.25rem` (20px) |
| `--space-6` | `1.5rem` (24px) |
| `--space-8` | `2rem` (32px) |
| `--space-10` | `2.5rem` (40px) |
| `--space-12` | `3rem` (48px) |
| `--space-16` | `4rem` (64px) |

### Typography
| Token | Value |
|-------|-------|
| `--text-h1` | `clamp(1.75rem, 1.4rem + 1.5vw, 2.5rem)` |
| `--text-h2` | `clamp(1.4rem, 1.1rem + 1vw, 1.875rem)` |
| `--text-h3` | `clamp(1.15rem, 1rem + 0.5vw, 1.35rem)` |
| `--text-h4` | `clamp(1rem, 0.9rem + 0.3vw, 1.125rem)` |
| `--text-body` | `1rem` |
| `--text-sm` | `0.875rem` |
| `--text-xs` | `0.75rem` |
| `--text-2xs` | `0.6875rem` |
| `--lh-heading` | `1.2` |
| `--lh-body` | `1.6` |
| `--lh-ui` | `1.35` |
| `--font-family` | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` |

### Border Radius (all 0px — intentional)
| Token | Value |
|-------|-------|
| `--radius` | `0px` |
| `--radius-sm` | `0px` |
| `--radius-pill` | `0px` |

## Design Tokens — Dark Mode (`[data-theme="dark"]`)

### Core Overrides
| Token | Dark Value |
|-------|-----------|
| `--bg` | `#0f0f0f` |
| `--bg-card` | `#1a1a1a` |
| `--bg-elevated` | `#222222` |
| `--bg-input` | `#1a1a1a` |
| `--text` | `#fafafa` |
| `--text-secondary` | `#bbbbbb` |
| `--text-muted` | `#777777` |
| `--accent` | `#f87171` |
| `--accent-hover` | `#fca5a5` |
| `--accent-light` | `rgba(248, 113, 113, 0.12)` |
| `--yellow` | `#facc15` |
| `--green` | `#4ade80` |
| `--green-dark` | `#22c55e` |
| `--red` | `#f87171` |
| `--border` | `#2a2a2a` |
| `--border-strong` | `#444444` |
| `--shadow-sm` | `2px 2px 0 #000000` |
| `--shadow` | `4px 4px 0 #000000` |
| `--shadow-lg` | `6px 6px 0 #000000` |

### Color Palette Overrides (Dark)
| Palette | Light → Dark mapping |
|---------|---------------------|
| Red | `--red-50` through `--red-900` are inverted (darkest in 50, lightest in 900) |
| Yellow | Same inversion pattern |
| Green | Same inversion pattern |
| Blue | Same inversion pattern |

### Dark Mode Rules
- All tokens use CSS custom properties — components must NEVER use hardcoded hex values
- The `data-theme="dark"` attribute on `<html>` toggles dark mode
- Theme context (`useTheme()`) manages state via localStorage
- Dark shadows always use `#000000` instead of `#1a1a1a`
- Dark borders are lighter against dark backgrounds (`--border-strong: #444444`)

## Color Palette Extended (Light Mode)

### Red
| Token | Value |
|-------|-------|
| `--red-50` | `#fef2f2` |
| `--red-100` | `#fee2e2` |
| `--red-200` | `#fecaca` |
| `--red-300` | `#fca5a5` |
| `--red-400` | `#f87171` |
| `--red-500` | `#ef4444` |
| `--red-600` | `#dc2626` |
| `--red-700` | `#b91c1c` |
| `--red-800` | `#991b1b` |
| `--red-900` | `#7f1d1d` |

### Yellow
| Token | Value |
|-------|-------|
| `--yellow-50` | `#fefce8` |
| `--yellow-100` | `#fef9c3` |
| `--yellow-200` | `#fef08a` |
| `--yellow-300` | `#fde047` |
| `--yellow-400` | `#facc15` |
| `--yellow-500` | `#eab308` |
| `--yellow-600` | `#ca8a04` |
| `--yellow-700` | `#a16207` |
| `--yellow-800` | `#854d0e` |
| `--yellow-900` | `#713f12` |

### Green
| Token | Value |
|-------|-------|
| `--green-50` | `#f0fdf4` |
| `--green-100` | `#dcfce7` |
| `--green-200` | `#bbf7d0` |
| `--green-300` | `#86efac` |
| `--green-400` | `#4ade80` |
| `--green-500` | `#22c55e` |
| `--green-600` | `#16a34a` |
| `--green-700` | `#15803d` |
| `--green-800` | `#166534` |
| `--green-900` | `#14532d` |

### Blue
| Token | Value |
|-------|-------|
| `--blue-50` | `#eff6ff` |
| `--blue-100` | `#dbeafe` |
| `--blue-200` | `#bfdbfe` |
| `--blue-300` | `#93c5fd` |
| `--blue-400` | `#60a5fa` |
| `--blue-500` | `#3b82f6` |
| `--blue-600` | `#2563eb` |
| `--blue-700` | `#1d4ed8` |
| `--blue-800` | `#1e40af` |
| `--blue-900` | `#1e3a8a` |

## Typography Rules

### Font Loading
- Inter: weights 400, 500, 600, 700, 800, 900 (all loaded via Google Fonts)
- JetBrains Mono: for code/data display (load separately if needed)
- Headings: Inter 800-900, letter-spacing: -0.02em to -0.03em
- Body: Inter 400, line-height: 1.6
- UI labels: Inter 900, text-transform: uppercase, letter-spacing: 0.06em
- Numbers: `font-variant-numeric: tabular-nums` on all monetary values

### Scale
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| h1 | `--text-h1` (clamp 1.75-2.5rem) | 900 | 1.15 |
| h2 | `--text-h2` (clamp 1.4-1.875rem) | 900 | `--lh-heading` |
| h3 | `--text-h3` (clamp 1.15-1.35rem) | 800 | `--lh-heading` |
| h4 | `--text-h4` (clamp 1-1.125rem) | 800 | `--lh-ui` |
| Body | `--text-body` (1rem) | 400 | `--lh-body` |
| Small | `--text-sm` (0.875rem) | 400 | `--lh-body` |
| XS | `--text-xs` (0.75rem) | 700-800 | `--lh-ui` |
| 2XS | `--text-2xs` (0.6875rem) | 700-800 | `--lh-ui` |

## Component Rules

### Button (`.btn`)
**Anatomy:** Padding, border, shadow, label text
**Variants:**
- `.btn` — Default: white bg, 2px border, `--shadow-sm`
- `.btn-primary` — Red bg (`--red-600`), white text, 900 weight
- `.btn-success` — Green bg (`--green-500`), text color, green border
- `.btn-cash` — Yellow bg (`--yellow-100`), text color, yellow border
- `.btn-ghost` — Transparent, no shadow
- `.btn-outline` — White bg, default border
- `.btn-sm` — Compact padding, xs font
- `.btn-full` — Full width

**States:**
- Default: `--shadow-sm`
- Hover: `transform: translate(-1px, -1px)`, `--shadow` (deeper)
- Active/pressed: `transform: translate(2px, 2px)`, no shadow (sunken)
- Disabled: `opacity: 0.5`, `cursor: not-allowed`, no shadow, no transform
- Focus-visible: inherited browser outline (never remove without replacement)
- Loading: show `submitting ? 'Loading...' : 'Label'` text swap

**Interaction:** `transition: none` on all buttons — instant state changes
**Naming:** `.btn` → `.btn-{variant}` → `.btn-{size}` → `.btn-{layout}`

### Card (`.group-card`, `.expense-card`, `.settlement-card`)
**Anatomy:** 2px border, `--shadow`, padding `--space-4` to `--space-5`
**Variants:**
- `.group-card` — Has color-coded top border (nth-child 4n cycling: red/yellow/green/blue)
- `.expense-card` — Standard card with header, meta, amount badge, splits
- `.settlement-card` — Compact card with flow display and date

**States:**
- Default: `--shadow`
- Hover: `transform: translate(-2px, -2px)`, `--shadow-lg`
- Active: `transform: translate(2px, 2px)`, `--shadow-sm`

**Color cycling pattern:** `nth-child(4n+1)` = red, `4n+2` = yellow, `4n+3` = green, `4n+4` = blue

### Modal (`.modal`, `.modal-overlay`)
**Anatomy:** Fixed overlay with semi-transparent black bg, centered modal card
**Overlay:** `position: fixed`, `background: rgba(0, 0, 0, 0.5)`, `z-index: 1000`
**Card:** White bg, 2px border, `--shadow-lg`, max-width 480px, max-height 90vh with scroll
**Actions:** Right-aligned button row with `--space-6` top margin
**Interaction:** Click overlay to close (use `e.stopPropagation()` on card)

### Form (`.form-group`)
**Anatomy:** Label (uppercase, xs, 900 weight), input (2px border, `--shadow-sm`)
**States:**
- Default: White bg, 2px border
- Focus: Blue border (`--blue-500`), 3px blue glow ring
- Error: `.field-error` class — red border, red focus glow
- Error message: `.field-error-msg` — 2xs font, red color, 800 weight

**Validation:** Touch-on-blur pattern — validate on blur, re-validate on change after first blur

### Navbar (`.navbar`)
**Anatomy:** Sticky header, flex row, 3px bottom border, white bg
**Brand:** Left side, emoji + app name in h1
**User area:** Right side, username + theme toggle + logout

### Tabs (`.tabs`, `.tab`)
**Anatomy:** Horizontal button row, 2px bottom border on container
**Color coding:** Each tab has its own color — `nth-child` based
- Tab 1 (expenses): red hover/active bg, red active border
- Tab 2 (balances): blue hover/active bg, blue active border
- Tab 3 (settlements): green hover/active bg, green active border
**States:**
- Default: No bg, muted text
- Hover: Light colored bg (`--red-50`, `--blue-50`, `--green-50`)
- Active: Colored bg, 3px bottom border in accent color, dark text

### Member Chip (`.member-chip`)
**Anatomy:** Inline flex, 2px border, `--shadow-sm`, avatar + name
**Color cycling:** Same nth-child 4n pattern as group cards
**Avatar:** 24px circle, white initial, 800 weight, colored bg

### Balance Row (`.balance-row`)
**Anatomy:** Flex row, 2px border, `--shadow-sm`, user info + amount badge
**Amount badges:**
- `.positive` — Green bg, dark text
- `.negative` — Red bg, white text
- `.zero` — Light bg, muted text

### Settlement Row (`.settlement-row`)
**Anatomy:** Flex row, flow display (user → user), amount + action buttons
**Arrow:** Yellow colored, h4 size, 900 weight

### Expense Card (`.expense-card`)
**Anatomy:** Header (description, meta), amount badge, split chips
**Amount badge:** Green bg, 2px border, `--shadow-sm`
**Split chips:** Color cycling via nth-child, xs font, bordered

### Split Preview (`.split-preview`)
**Anatomy:** Centered preview bar showing split calculation
**States:**
- `.split-ok` — Green border/bg
- `.split-error` — Red border/bg with remainder highlight

### Empty State (`.empty-state`)
**Anatomy:** Centered, padded, illustration + heading + description
**Layout:** Vertical flex, max-width 900px, centered
**CTA:** Add a primary button below description

### Toast Notifications (react-hot-toast)
**Style:** Dark bg (`#1a1212`), white text, subtle border
**Duration:** 3000ms
**Icons:** Use emoji — 💸 for expenses, ✅ for settlements, 🎉 for success
**Pattern:** `toast.success()`, `toast.error()`, `toast()` with custom icon

### QR Code (`.qr-section`)
**Anatomy:** Centered section, elevated bg, bordered canvas, payment button
**Canvas:** 200px width, 2px border, white padding, `--shadow-sm`
**Pay button:** Primary red, full width below QR

### Search Results (`.search-result-item`)
**Anatomy:** Flex row, 2px border, avatar + name/email, hover highlight
**States:**
- Default: White bg
- Hover: Yellow bg (`--yellow-50`), yellow border

### Loading States (`.loading`, `.spinner`)
**Screen:** Full viewport, centered, matches page bg
**Spinner:** 40px circle, 3px border, blue top color, rotating animation
**Duration:** Show until data loads — use `finally` block to hide

### Back Button (`.back-btn`)
**Anatomy:** Blue bg (`--blue-50`), blue border, 2px shadow
**States:**
- Default: Blue bg, shadow
- Hover: Deeper blue bg, elevated shadow
- Active: Sunken (translate down, no shadow)

### Demo Credentials Banner (`.demo-credentials`)
**Anatomy:** Yellow bg (`--yellow-100`), yellow border, centered text, `--shadow-sm`
**Usage:** Only on login/register pages, shows test account info

### Payment Method Toggle
**Anatomy:** Horizontal button row, flex
**States:**
- Selected: `.btn-primary` style
- Unselected: `.btn-outline` style

### Split Mode Toggle (`.split-mode-toggle`)
**Anatomy:** Bordered container, 3 equal-width buttons
**Active colors:** Red (equal), Blue (custom), Green (percentage)
**Border:** 2px container border, 2px between buttons

### Member Selector (`.member-selector`)
**Anatomy:** Header with count + toggle buttons, list of selectable items
**Item states:**
- Default: White bg, 2px border
- Hover: Blue bg tint
- Selected: Blue border, blue bg tint

### Theme Toggle (`.theme-toggle`)
**Anatomy:** 42px square, yellow bg, yellow border, 3px black shadow
**Icon:** 🌙 (light) / ☀️ (dark)
**States:** Same press/hover as buttons

## Naming Conventions (Strict)

### Class naming pattern
```
.{component}
.{component}-{modifier}
.{component}-{sub-element}
```

### Examples
- `.btn`, `.btn-primary`, `.btn-sm`, `.btn-full`
- `.expense-card`, `.expense-header`, `.expense-amount`, `.expense-splits`
- `.balance-row`, `.balance-user`, `.balance-amount`, `.balance-amount.positive`
- `.settlement-row`, `.settlement-flow`, `.settlement-arrow`, `.settlement-amount`
- `.member-chip`, `.member-avatar`, `.member-name`, `.member-share`
- `.modal`, `.modal-overlay`, `.modal-actions`
- `.form-group`, `.form-group label`, `.form-group input`
- `.split-chip`, `.split-preview`, `.split-ok`, `.split-error`
- `.group-card`, `.group-card-header`, `.group-card-footer`, `.group-avatar`

### Rules
- Use lowercase with hyphens — NEVER camelCase for class names
- Component names must be descriptive: `.expense-card`, not `.card` or `.ecard`
- Modifiers use dot notation: `.btn-primary`, `.balance-amount.positive`
- Avoid utility classes — prefer semantic component names
- Every new component MUST have a BEM-like structure in CSS

## Accessibility Requirements

### WCAG 2.2 AA
- **Contrast:** All text must meet 4.5:1 ratio against background (use token values, never raw hex)
- **Focus states:** All interactive elements must have visible focus-visible outlines
- **Keyboard:** All actions must be keyboard-accessible — Tab to navigate, Enter/Space to activate
- **Labels:** All inputs must have associated `<label>` elements (use `htmlFor`/`id`)
- **Alt text:** Emoji used as icons MUST have aria-label or sr-only text
- **Semantic HTML:** Use `<button>`, `<a>`, `<nav>`, `<main>`, `<header>` — never `<div onClick>`
- **Error announcements:** Validation errors must be announced via aria-live or aria-describedby

### Component-Specific A11y
- **Buttons:** Must have `type="button"` or `type="submit"` — never rely on default
- **Modals:** Must trap focus, close on Escape, return focus to trigger on close
- **Forms:** All required fields must use `required` attribute and `aria-required`
- **Tabs:** Use `role="tablist"`, `role="tab"`, `role="tabpanel"` with `aria-selected`
- **Search results:** Announce result count via aria-live region
- **Loading states:** Announce via aria-busy or aria-live="polite"
- **Color status:** Never rely on color alone — pair with text/icon (e.g., ✅ + "settled")

### Testable Acceptance Criteria
- [ ] Tab through entire page — every interactive element receives visible focus
- [ ] Screen reader announces all form labels, errors, and status changes
- [ ] Color contrast passes WCAG AA for all text sizes
- [ ] Modal can be closed with Escape key
- [ ] All buttons have accessible names (text content or aria-label)
- [ ] Error messages are associated with their fields via aria-describedby

## Emoji-as-Icons Pattern

### Usage Rules
- Emoji serve as inline icons throughout the app (💸, 🌙, ☀️, 💵, 📱, 💳, 🏦, ⚡, ✅, 🎉, 📐, ✏️, ⚖️)
- Every emoji used as a functional indicator MUST have an `aria-label` or be paired with text
- Emoji in headings/branding (💸 Splitwise) are decorative — no aria needed
- Emoji in buttons (💵 Cash, 📱 UPI) serve as labels — the button text is sufficient

### Accessibility
- Buttons with emoji + text: the text provides the accessible name
- Standalone emoji indicators: add `title` attribute for tooltip
- Never use emoji as the ONLY way to convey meaning — always pair with text

## Animation Rules

### Philosophy
- All interactive elements use `transition: none` — instant feedback, no animation lag
- Decorative animations exist for delight, not function
- Never animate layout properties (width, height, position) — only transform and opacity

### Existing Animations
| Animation | Element | Duration | Usage |
|-----------|---------|----------|-------|
| `spin` | `.spinner` | 0.7s linear infinite | Loading indicator |
| `charBounce` | `.char-bounce` | 2s ease-in-out infinite | Friendship characters |
| `wave` | `.char-wave` | 1.2s ease-in-out infinite | Character waving gesture |
| `highfiveLeft/Right` | `.highfive-left/right` | 1.5s ease-in-out infinite | High-five gesture |
| `impactPulse` | `.highfive-impact` | 1.5s ease-in-out infinite | Impact star |
| `hugLeft/Right` | `.char-hug-left/right` | 3s ease-in-out infinite | Hug gesture |
| `floatHeart` | `.float-heart` | 2.5s ease-in-out infinite | Floating heart |

### Rules
- Animations are ONLY for `.friendship-chars` and `.spinner` — never add animations to interactive components
- Use `animation-delay` for staggered character animations (0.3s increments)
- Set `pointer-events: none` on animated character containers
- Never animate `box-shadow`, `border-color`, or `background-color` — use instant swaps

## Realtime UX Patterns

### Socket.IO Event → Visual Update Mapping
| Event | Visual Effect |
|-------|---------------|
| `expense-created` | Prepend to expense list, refresh balances, toast with 💸 icon |
| `expense-deleted` | Reload expenses and balances |
| `settlement-created` | Prepend to settlement list, refresh balances, toast with ✅ icon |
| `settlement-deleted` | Reload settlements and balances |
| `member-added` | Reload group info (member count, list) |
| `member-removed` | Reload group info (member count, list) |

### Rules
- Toast notifications use `toast()` with custom icon for realtime events
- Balance refresh always follows expense/settlement changes
- Never animate list insertions — prepend silently
- Error toasts use `toast.error()` for failed operations

## Currency Display Rules

### ₹ (Indian Rupee) Patterns
- Amount badge: `₹{value.toFixed(2)}` — always 2 decimal places
- Use `font-variant-numeric: tabular-nums` on all monetary elements
- Format dates with `toLocaleDateString('en-IN')` or `toLocaleString('en-IN')`
- Payment amount headings: bold, h3 size, dark color
- Split amounts: xs/2xs font, within bordered chips
- Balance amounts: body size, 900 weight, with colored badge

### Tabular Numbers
- Apply `font-variant-numeric: tabular-nums` to:
  - `body` element (global)
  - `.expense-amount`
  - `.balance-amount`
  - `.settlement-amount`
  - `.split-chip`
  - `.member-share`
  - `.pct-dollar-amount`

## Responsive Behavior

### Breakpoints
- **Desktop:** Default (>640px)
- **Mobile:** `@media (max-width: 640px)`

### Mobile Adjustments
| Element | Change |
|---------|--------|
| `.dashboard-content`, `.group-content` | Padding: `--space-4` |
| `.groups-grid` | Single column (`grid-template-columns: 1fr`) |
| `.group-info-bar` | Column layout, items start-aligned |
| `.settlement-row` | Column layout with gap |
| `.tabs` | `overflow-x: auto` (horizontal scroll) |
| `.tab` | Smaller font/padding |
| `.expense-header` | Column layout |
| `.auth-card` | Reduced padding (`--space-6`) |
| `.modal` | Reduced padding (`--space-5`) |

### Rules
- Never hide content on mobile — reflow it
- Touch targets must be at least 44x44px
- Horizontal scroll is acceptable for tab bars
- Modals must fit within viewport height

## Anti-Patterns and Prohibited Implementations

### CSS Anti-Patterns
- ❌ **NEVER** use hardcoded hex values — always reference CSS custom properties
- ❌ **NEVER** add `border-radius` — all corners must be sharp (0px)
- ❌ **NEVER** add `transition` to interactive elements — instant feedback only
- ❌ **NEVER** use `box-shadow` with blur — always hard offset shadows
- ❌ **NEVER** use rgba for shadows — use solid `#1a1a1a` (light) or `#000000` (dark)
- ❌ **NEVER** mix border widths — always 2px (3px only for navbar bottom and tab active borders)
- ❌ **NEVER** use flex shorthand that omits important properties

### Component Anti-Patterns
- ❌ **NEVER** create a button without `.btn` base class
- ❌ **NEVER** use `div` with `onClick` — always `<button>` or `<a>`
- ❌ **NEVER** create a modal without `.modal-overlay` wrapper
- ❌ **NEVER** hardcode colors in component styles — use the token system
- ❌ **NEVER** create a form input without an associated `<label>`
- ❌ **NEVER** show error state without both visual indicator (red border) AND text message

### Naming Anti-Patterns
- ❌ **NEVER** use camelCase class names (`expenseCard` → use `expense-card`)
- ❌ **NEVER** use generic names (`.card`, `.btn`, `.input` without component prefix)
- ❌ **NEVER** use inline styles for colors/borders — use CSS classes with tokens
- ❌ **NEVER** use `!important` except for `.field-error` override

### Accessibility Anti-Patterns
- ❌ **NEVER** remove focus outlines without providing an alternative
- ❌ **NEVER** rely on color alone to convey status
- ❌ **NEVER** create interactive elements that aren't keyboard-accessible
- ❌ **NEVER** use emoji as the only indicator of an action's meaning

### Data Display Anti-Patterns
- ❌ **NEVER** display monetary values without `toFixed(2)` or proper formatting
- ❌ **NEVER** use proportional tabular spacing for numbers — always `tabular-nums`
- ❌ **NEVER** display dates without locale formatting (`en-IN`)
- ❌ **NEVER** truncate user names — allow overflow with ellipsis if needed

## Migration Notes

### Existing Inconsistencies to Fix
1. **Inline styles in JSX:** Several components use inline `style={{ }}` for layout — migrate to CSS classes
2. **Missing font weights:** index.html only loads Inter 400-700, but skill requires 400-900
3. **Toast styling:** Toast options are hardcoded in App.jsx — extract to CSS if possible
4. **QR modal inline styles:** Payment method toggle uses inline flex — extract to `.payment-method-toggle` class

### Migration Checklist for New Components
1. [ ] All colors reference CSS custom properties
2. [ ] All spacing uses `--space-*` tokens
3. [ ] Border is always 2px solid `--border-strong`
4. [ ] Shadow uses `--shadow-sm`, `--shadow`, or `--shadow-lg`
5. [ ] No border-radius (all 0px)
6. [ ] No transitions on interactive elements
7. [ ] Interactive elements use `<button>` or `<a>` tags
8. [ ] All inputs have associated labels
9. [ ] Focus-visible states are preserved
10. [ ] Responsive at 640px breakpoint
11. [ ] Dark mode works via token system (no hardcoded colors)
12. [ ] Monetary values use tabular-nums and ₹ formatting
13. [ ] Class names follow `.{component}-{modifier}` pattern

## QA Checklist (Code Review)

### Token Compliance
- [ ] No hardcoded hex colors in component CSS
- [ ] All spacing uses `--space-*` tokens
- [ ] All border-radius values are 0px
- [ ] Shadows use only `--shadow-sm`, `--shadow`, or `--shadow-lg`

### Component Structure
- [ ] Every component has a semantic class name following naming conventions
- [ ] Interactive elements use proper HTML tags (`<button>`, `<a>`)
- [ ] Modals use `.modal-overlay` + `.modal` pattern
- [ ] Forms have labels for all inputs

### Dark Mode
- [ ] All colors work in both light and dark mode via tokens
- [ ] No hardcoded light-only or dark-only colors in component styles
- [ ] Shadows adapt (black in dark, dark-gray in light)

### Accessibility
- [ ] Focus-visible outlines are present on all interactive elements
- [ ] Color is never the sole indicator of status
- [ ] Error messages are visually associated with their fields
- [ ] Loading states are announced to screen readers

### Responsive
- [ ] Layout reflows at 640px breakpoint
- [ ] Touch targets are at least 44x44px on mobile
- [ ] No horizontal overflow on mobile

### Currency
- [ ] All monetary values display ₹ with 2 decimal places
- [ ] `tabular-nums` is applied to all number displays
- [ ] Dates use `en-IN` locale formatting

## Guideline Authoring Workflow
1. Restate the design intent in one sentence before proposing rules.
2. Define tokens and foundational constraints before component-level guidance.
3. Specify component anatomy, states, variants, and interaction behavior.
4. Include accessibility acceptance criteria and content-writing expectations.
5. Add anti-patterns and migration notes for existing inconsistent UI.
6. End with a QA checklist that can be executed in code review.

## Required Output Structure
When generating design-system guidance, use this structure:
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Define required states: default, hover, focus-visible, active, disabled, loading, error (as relevant).
- Describe interaction behavior for keyboard, pointer, and touch.
- State spacing, typography, and color-token usage explicitly.
- Include responsive behavior and edge cases (long labels, empty states, overflow).

## Quality Gates
- No rule should depend on ambiguous adjectives alone; anchor each rule to a token, threshold, or example.
- Every accessibility statement must be testable in implementation.
- Prefer system consistency over one-off local optimizations.
- Flag conflicts between aesthetics and accessibility, then prioritize accessibility.

## Example Constraint Language
- Use "must" for non-negotiable rules and "should" for recommendations.
- Pair every do-rule with at least one concrete don't-example.
- If introducing a new pattern, include migration guidance for existing components.

<!-- TYPEUI_SH_MANAGED_END -->
