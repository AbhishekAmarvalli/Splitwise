# SplitEase — Coding & Design Rules

## 1. Code Style

### 1.1 JavaScript
- **ES2022+** features (async/await, optional chaining, nullish coalescing)
- **No TypeScript** — plain JavaScript with JSDoc comments where helpful
- **Functional components only** — no class components
- **Hooks** for all state and side effects

### 1.2 Formatting
- **Prettier** for auto-formatting
- **Single quotes** for strings
- **Semicolons** at end of statements
- **Trailing commas** in objects and arrays
- **2-space indentation**
- **100 character line limit**

### 1.3 ESLint Rules
```javascript
// .eslintrc.js
module.exports = {
  extends: ['expo', 'prettier'],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

---

## 2. File & Folder Naming

### 2.1 Files
| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase.jsx | `Button.jsx`, `ExpenseCard.jsx` |
| Screens | kebab-case.jsx | `group-detail.jsx`, `add-expense.jsx` |
| Hooks | camelCase.js (use prefix) | `useSocket.js`, `useApi.js` |
| Stores | camelCase.js (use prefix) | `useAuthStore.js`, `useGroupStore.js` |
| Services | camelCase.js | `api.js`, `socket.js`, `push.js` |
| Utils | camelCase.js | `format.js`, `validation.js`, `upi.js` |
| Tokens | camelCase.js | `colors.js`, `spacing.js`, `typography.js` |
| Constants | UPPER_SNAKE_CASE.js | `config.js`, `routes.js`, `events.js` |
| Styles | camelCase.styles.js | `button.styles.js` (if extracted) |

### 2.2 Folders
| Folder | Contents | Convention |
|--------|----------|-----------|
| `app/` | Expo Router screens | kebab-case directories |
| `src/components/` | Reusable UI components | PascalCase files |
| `src/store/` | Zustand stores | `use{Name}Store.js` |
| `src/hooks/` | Custom hooks | `use{Name}.js` |
| `src/services/` | External integrations | camelCase files |
| `src/utils/` | Pure functions | camelCase files |
| `src/tokens/` | Design tokens | camelCase files |
| `src/constants/` | App constants | camelCase files |

### 2.3 Export Convention
```javascript
// ✅ Default export for components and screens
export default function Button({ ... }) { ... }

// ✅ Named exports for hooks and utilities
export function useSocket(groupId) { ... }
export function formatCurrency(amount) { ... }

// ✅ Default export for stores
const useAuthStore = create((...) => ({ ... }));
export default useAuthStore;
```

---

## 3. Component Rules

### 3.1 Component Structure
```javascript
// ✅ Standard component structure
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { tokens } from '../tokens';
import styles from './Button.styles';

export default function Button({ variant = 'default', size = 'default', onPress, children, ...props }) {
  const { theme } = useTheme();
  const t = tokens[theme];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[size],
        pressed && styles.pressed,
        { borderColor: t.borderStrong, shadowColor: t.shadow },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      {...props}
    >
      <Text style={[styles.label, styles[`${variant}Label`]]}>{children}</Text>
    </Pressable>
  );
}
```

### 3.2 Component Rules
- **Every component** must be a function component
- **Every interactive element** must use `Pressable` (not `TouchableOpacity`)
- **Every component** must accept `style` prop for overrides
- **Every component** must have `accessibilityRole` and `accessibilityLabel`
- **No inline styles** for colors/borders — use design tokens
- **No hardcoded values** — reference `tokens` object

### 3.3 Prop Naming
```javascript
// ✅ Good prop names
onPress          // Event handlers: on + Event name
isVisible        // Boolean props: is + adjective
itemCount        // Count props: noun + Count
selectedIndex    // Index props: adjective + Index
backgroundColor  // Style props: descriptive noun

// ❌ Bad prop names
pressed          // Use isPressed
showModal        // Use isVisible
clickHandler     // Use onPress
num              // Use count or total
```

---

## 4. Design Token Rules

### 4.1 Token Access
```javascript
import { tokens } from '../tokens';

// Access tokens via theme
const { theme } = useTheme();
const t = tokens[theme];

// Use tokens in styles
const styles = StyleSheet.create({
  card: {
    backgroundColor: t.card,
    borderColor: t.borderStrong,
    borderWidth: 2,
    shadowColor: t.shadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
});
```

### 4.2 Token Naming
```javascript
// ✅ Token naming convention
t.background     // Page background
t.card           // Card/panel surface
t.text           // Primary text
t.textSecondary  // Secondary text
t.textMuted      // Muted text
t.border         // Subtle border
t.borderStrong   // Primary border
t.shadow         // Shadow color

// ✅ Color scale access
t.red[500]       // Specific shade
t.green[100]     // Tint for backgrounds
t.blue[600]      // Accent color

// ❌ Never do this
'#1a1a1a'        // Hardcoded hex
'rgb(26, 26, 26)' // Hardcoded RGB
```

### 4.3 Forbidden Values
| Value | Why | Alternative |
|-------|-----|-------------|
| Hardcoded hex colors | Breaks dark mode | Use `t.{color}` |
| Hardcoded pixel values for spacing | Inconsistent rhythm | Use `spacing.{size}` |
| `borderRadius > 4` | Breaks neobrutalism | Use 0-4px max |
| `transition` or `animation` | Instant feedback only | Remove entirely |
| `opacity` for disabled | Use visual indicator | Add disabled style |

---

## 5. Spacing Rules

### 5.1 Spacing Scale
```javascript
import { spacing } from '../tokens';

// Available spacing values
spacing.xs    // 4px
spacing.sm    // 8px
spacing.md    // 12px
spacing.base  // 16px (default)
spacing.lg    // 20px
spacing.xl    // 24px
spacing['2xl'] // 32px
spacing['3xl'] // 40px
spacing['4xl'] // 48px
spacing['5xl'] // 64px
```

### 5.2 Spacing Rules
- **Between elements:** Use `spacing.base` (16px) as default
- **Within cards:** Use `spacing.lg` (20px) padding
- **Between sections:** Use `spacing.xl` (24px) or `spacing['2xl']` (32px)
- **Screen padding:** Use `spacing.xl` (24px) horizontal
- **Tight gaps (chips):** Use `spacing.sm` (8px) or `spacing.xs` (4px)
- **Never use:** Raw pixel values like `margin: 17`

---

## 6. Typography Rules

### 6.1 Font Usage
```javascript
import { typography } from '../tokens';

const styles = StyleSheet.create({
  heading: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.h1,    // 28px
    fontWeight: '900',
    lineHeight: typography.lineHeights.tight, // 1.15
    letterSpacing: -0.03,
  },
  body: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.body,   // 16px
    fontWeight: '400',
    lineHeight: typography.lineHeights.normal, // 1.6
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,     // 12px
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.06,
  },
});
```

### 6.2 Typography Rules
- **Headings:** 800-900 weight, negative letter-spacing
- **Body:** 400 weight, 1.6 line-height
- **Labels:** 900 weight, uppercase, 0.06em letter-spacing
- **Monetary values:** Always use `fontVariant: ['tabular-nums']`
- **Never use:** Font sizes below 11px (accessibility)

---

## 7. Shadow Rules

### 7.1 Shadow Application
```javascript
// ✅ Correct shadow (hard offset, no blur)
{
  shadowColor: t.shadow,        // #1A1A1A or #000000
  shadowOffset: { width: 3, height: 3 },
  shadowOpacity: 1,             // Full opacity
  shadowRadius: 0,              // No blur
  elevation: 4,                 // Android
}

// ❌ Wrong shadow (blurred)
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 8,              // Blurred — wrong!
}
```

### 7.2 Shadow Levels
| Level | Offset | Elevation | Usage |
|-------|--------|-----------|-------|
| Sm | 2px 2px | 2 | Chips, small badges |
| Default | 3px 3px | 4 | Cards, buttons |
| Lg | 4px 4px | 6 | Modals, hover states |

### 7.3 Shadow Rules
- **Always** use `shadowOpacity: 1` (full opacity)
- **Always** use `shadowRadius: 0` (no blur)
- **Never** use blurred shadows
- **Dark mode:** Shadow color changes to `#000000`
- **Pressed state:** Remove shadow entirely (`shadowRadius: 0`, `elevation: 0`)

---

## 8. Color Rules

### 8.1 Color Usage
```javascript
// ✅ Primary actions (red)
t.red[600]      // Background of primary buttons
'#FFFFFF'       // Text on red buttons (always white)

// ✅ Success (green)
t.green[500]    // Success buttons, positive balances
t.green[100]    // Success backgrounds

// ✅ Warning (yellow)
t.yellow[400]   // Theme toggle, highlights
t.yellow[100]   // Warning backgrounds

// ✅ Informational (blue)
t.blue[500]     // Focus rings, links
t.blue[50]      // Info backgrounds

// ❌ Never use raw hex for component colors
backgroundColor: '#DC2626'    // Wrong!
```

### 8.2 Color Cycling
```javascript
// Position-based color cycling for lists
const getCyclingColor = (index, t) => {
  const cycle = [t.red, t.yellow, t.green, t.blue];
  return cycle[index % 4];
};

// Usage
{items.map((item, i) => (
  <Chip key={item.id} color={getCyclingColor(i, t)} />
))}
```

### 8.3 Color Rules
- **Primary CTA:** Always red (`t.red[600]`)
- **Success:** Always green (`t.green[500]`)
- **Danger:** Always red (`t.red[500]`)
- **Links:** Always blue (`t.blue[600]`)
- **Text on colored bg:** Always white or `t.text`
- **Never use:** Color as sole indicator — always pair with text/icon

---

## 9. Interaction Rules

### 9.1 Pressed State
```javascript
// ✅ Standard pressed state (translate + remove shadow)
<Pressable
  style={({ pressed }) => ({
    transform: pressed ? [{ translateX: 2 }, { translateY: 2 }] : [],
    shadowRadius: pressed ? 0 : 3,
    elevation: pressed ? 0 : 4,
  })}
/>
```

### 9.2 No Transitions
```javascript
// ❌ Never add transitions
style={{ transition: 'all 0.2s' }}  // Wrong!

// ✅ Instant state changes only
style={({ pressed }) => pressed ? pressedStyle : defaultStyle}
```

### 9.3 Haptic Triggers
```javascript
import * as Haptics from 'expo-haptics';

// Light impact — button press
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Success — settlement recorded, expense added
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Error — validation error, API failure
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

---

## 10. Navigation Rules

### 10.1 Route Naming
```javascript
// ✅ Route names
const ROUTES = {
  LOGIN: 'login',
  REGISTER: 'register',
  HOME: 'home',
  GROUPS: 'groups',
  GROUP_DETAIL: 'group/[id]',
  ADD_EXPENSE: 'expense/new',
  SETTLEMENT: 'settlement/[id]',
  ACTIVITY: 'activity',
  PROFILE: 'profile',
};
```

### 10.2 Navigation Rules
- **Tab screens:** Use `navigation.navigate()` (no stack push)
- **Detail screens:** Use `navigation.push()` (stack within tab)
- **Modal screens:** Use `navigation.navigate()` with modal presentation
- **Back navigation:** Use `navigation.goBack()` or swipe gesture
- **Deep links:** Always validate target exists before navigating

---

## 11. Error Handling Rules

### 11.1 API Errors
```javascript
// ✅ Standard error handling
try {
  await api.createExpense(data);
  toast.success('Expense added!');
  haptics.success();
} catch (error) {
  if (error.response?.status === 401) {
    useAuthStore.getState().logout();
  } else if (error.response?.status === 403) {
    toast.error("You don't have access");
  } else {
    toast.error(error.message || 'Something went wrong');
    Sentry.captureException(error);
  }
}
```

### 11.2 Error Display Rules
- **Network error:** "No connection — check your internet"
- **401:** Auto-logout, redirect to login
- **403:** "You don't have access to this group"
- **404:** "Not found" screen with back button
- **500:** "Something went wrong" toast + Sentry log
- **Validation:** Red border + error message below input

---

## 12. Testing Rules

### 12.1 What to Test
- Pure utility functions (format, validation, simplifyDebts)
- Zustand store actions
- UPI deep link generation
- QR code data generation

### 12.2 What NOT to Test (MVP)
- Component rendering (manual QA)
- Navigation flows (manual QA)
- Socket.IO integration (manual QA)
- Push notification delivery (manual QA)

### 12.3 Test File Convention
```
src/utils/__tests__/format.test.js
src/utils/__tests__/validation.test.js
src/store/__tests__/useAuthStore.test.js
```

---

## 13. Git Rules

### 13.1 Branch Naming
```
main                    # Production
develop                 # Development
feature/add-expense     # Feature branches
fix/settlement-bug      # Bug fix branches
chore/setup-push-notif  # Maintenance branches
```

### 13.2 Commit Messages
```
feat: add expense creation form
fix: resolve settlement QR code rendering
chore: update Expo SDK to latest
style: apply neobrutalism tokens to buttons
refactor: extract API client to service layer
```

### 13.3 PR Requirements
- [ ] Code follows style rules
- [ ] No hardcoded colors or spacing
- [ ] Accessibility basics covered
- [ ] Tested on both platforms
- [ ] No console.log in production code

---

## 14. Accessibility Checklist

- [ ] All interactive elements have `accessibilityRole`
- [ ] All buttons have `accessibilityLabel`
- [ ] All images have `accessibilityLabel` or `accessible={false}`
- [ ] Form inputs have associated labels
- [ ] Error messages are announced via `accessibilityLiveRegion`
- [ ] Touch targets are ≥ 44px
- [ ] Color is never the sole indicator of status
- [ ] Heading hierarchy is logical (h1 → h2 → h3)
- [ ] Focus order follows visual layout
- [ ] All text meets 4.5:1 contrast ratio

---

## 15. Performance Rules

### 15.1 List Rendering
```javascript
// ✅ Use FlatList with keyExtractor
<FlatList
  data={expenses}
  keyExtractor={(item) => String(item.id)}
  renderItem={({ item }) => <ExpenseCard expense={item} />}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
/>

// ❌ Never use ScrollView for long lists
<ScrollView>
  {expenses.map(e => <ExpenseCard key={e.id} />)}  // Bad!
</ScrollView>
```

### 15.2 Memoization
```javascript
// ✅ Memoize expensive computations
const simplifiedDebts = useMemo(
  () => simplifyDebts(balances),
  [balances]
);

// ✅ Memoize callbacks passed to children
const handlePress = useCallback((id) => {
  navigate(`/group/${id}`);
}, [navigate]);
```

### 15.3 Store Selectors
```javascript
// ✅ Granular selectors (prevents unnecessary re-renders)
const expenses = useExpenseStore((s) => s.expenses);
const loading = useExpenseStore((s) => s.loading);

// ❌ Object destructuring (re-renders on any state change)
const { expenses, loading } = useExpenseStore();
```

---

## 16. Security Rules

- **Never** store JWT in AsyncStorage (use SecureStore)
- **Never** log sensitive data (tokens, passwords)
- **Never** hardcode API keys in source code
- **Always** validate deep link URLs before navigating
- **Always** check group membership before showing data
- **Always** use HTTPS for API calls
- **Always** clear SecureStore on logout
