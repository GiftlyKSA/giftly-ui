# Giftly — React Native App

A gift-giving platform connecting clients with gift experts.  
Built for **Expo SDK 53** (compatible with Expo 54 when released).

---

## 📁 Project Structure

```
giftly-rn/
├── App.tsx                          # Entry point, font loading, RTL setup
├── app.json                         # Expo config
├── package.json                     # Dependencies
├── babel.config.js
└── src/
    ├── constants/
    │   ├── colors.ts                # Design tokens: colors, spacing, radius, shadows
    │   └── fonts.ts                 # Font families and sizes
    ├── navigation/
    │   └── RootNavigator.tsx        # Simple stack navigator (no external lib needed)
    ├── components/
    │   ├── AppHeader.tsx            # Top header with avatar, balance/analytics
    │   ├── BottomTabBar.tsx         # Bottom nav with FAB center button
    │   └── OrderCard.tsx            # Reusable order list item
    └── screens/
        ├── auth/
        │   ├── LoginScreen.tsx      # Login with role toggle (user/agent)
        │   ├── RegisterScreen.tsx   # Registration form
        │   └── OTPScreen.tsx        # 4-digit OTP verification
        ├── user/
        │   ├── UserHomeScreen.tsx   # Events calendar, gift cards, orders
        │   ├── OrdersScreen.tsx     # Orders list with filter tabs
        │   ├── OrderTrackingScreen.tsx  # 5-stage order timeline + map
        │   ├── ChatScreen.tsx       # Real-time chat with gift expert
        │   └── ProfileScreen.tsx    # User profile & settings
        └── agent/
            └── AgentHomeScreen.tsx  # Earnings dashboard, charts, orders
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#673195` (purple) |
| Primary Light | `#C9AEEC` |
| Primary Lighter | `#F3EFFF` |
| Primary Mid | `#934AD2` |
| Success | `#13C87A` |
| Info | `#0070C0` |
| Error | `#DB0D0D` |
| Font (Arabic) | Tajawal (400/500/700/800) |
| Font (English) | Inter (400/500/600/700) |
| Direction | RTL (Arabic) |

---

## 🚀 Getting Started

```bash
# Install dependencies
cd giftly-rn
npm install

# Start Expo
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

---

## 📱 Screens Overview

### Authentication Flow
- **LoginScreen** — Phone + password login, Apple/Google social login, role selector (User / Gift Expert)
- **RegisterScreen** — Full registration with role selector
- **OTPScreen** — 4-box OTP input with auto-focus

### User Flow
- **UserHomeScreen** — Greeting header with balance, featured gift cards carousel, weekly calendar, upcoming events, registered orders
- **OrdersScreen** — Filterable orders list (All / Active / Completed / Cancelled)
- **OrderTrackingScreen** — 5-stage tracking timeline, gift preview, map placeholder, chat & cancel actions
- **ChatScreen** — Real-time messaging with gift expert, attachment support
- **ProfileScreen** — Avatar, stats, settings, notifications toggle, dark mode toggle, logout

### Agent Flow
- **AgentHomeScreen** — Earnings goal progress, weekly calendar, stats grid (completed/active/earnings/pending), bar chart, recent orders

---

## 🔧 Key Technical Decisions

- **RTL by default** — `I18nManager.forceRTL(true)` applied globally
- **No heavy nav library** — `RootNavigator` uses simple React state for screen switching; swap for `@react-navigation/native` if needed
- **Expo Google Fonts** — Tajawal + Inter loaded via `useFonts`
- **Expo SDK 53** — Targets Expo 53 (SDK 54 compatible when available)
- **TypeScript** — All files typed with interfaces

---

## 📦 Adding @react-navigation (Optional)

```bash
npm install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
npx expo install react-native-screens react-native-safe-area-context
```

Then replace `RootNavigator.tsx` with a proper `NavigationContainer` + `createNativeStackNavigator` setup.
