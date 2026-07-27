# Application Screens Documentation

**Project:** Giftly UI (React Native / Expo)
**Scope of this document:** every screen component found under `src/screens/`, how it is reached, who can reach it, and what it actually does today.

> **Method note:** This project does **not** use a router or auth service. Navigation is a single hand-rolled state machine (`src/navigation/RootNavigator.tsx`) that swaps whichever screen component is rendered based on a `useState` value. There is no persisted session, no token, and no server API anywhere in the codebase (`grep` for `fetch`/`axios`/`http` returns nothing beyond an unrelated `Dimensions.get('window')` match). Every list, order, chat message, and profile stat visible in the app is a hardcoded constant or a string from `src/i18n/strings.ts`. This is noted per‑screen below and summarized in **Issues and Recommendations**.

---

## Role Summary

| Role | Description | Accessible Screens |
|---|---|---|
| **Guest** | Anyone who has not completed login/registration. Covers onboarding, phone entry, OTP verification, and the registration form for brand‑new phone numbers. | Onboarding, Login, OTP, Register |
| **Customer** (`role === 'user'` in code) | A registered end‑user who orders gifts, tracks orders, and chats with the assigned gift expert. | Home (User), Create Order, Waiting, Orders, Order Tracking, Chat, Profile |
| **Provider / Agent** (`role === 'agent'` in code; labelled "خبير الهدايا" / "Gift Expert" in the UI) | The gift‑expert who fulfills orders: sees earnings, schedule, and assigned orders. This is the closest role in this codebase to a "Provider" or "Courier" role. | Home (Agent), Orders, Order Tracking, Chat, Profile |
| **Admin** | Not found. No admin screens, admin route, or admin role value exist anywhere in the source. | — |
| **Manager** | Not found. | — |
| **Courier** | Not found as a distinct role. The Agent/Provider role covers both "selling/consulting" and "fulfilling" responsibilities in this mock, so there is no separate delivery‑courier persona or screen. | — |

Role is determined at login by matching the entered phone number against two hardcoded values in `RootNavigator.tsx`:
```
'555555555' → role = 'user'   (Customer)
'555555558' → role = 'agent'  (Provider/Agent)
anything else → role = 'new'  (routed to Register, becomes 'user' on submit)
```
There is no password, token, or server check of any kind — `role` is plain in-memory React state that resets to Guest whenever the app reloads.

---

## Navigation Structure

- **Root navigator** (`src/navigation/RootNavigator.tsx`): a single component holding `nav: { screen, params }` and `role` in `useState`. It renders one screen component at a time via a chain of `if (screen === '...')` checks. This is a custom, from-scratch navigator — it is **not** built on React Navigation.
- **"Stack" behavior**: there is no navigation history stack. Each screen's "back" callback is hardcoded to a specific destination screen (e.g. Order Tracking's back always goes to `agent-home` or `user-home` depending on role) rather than popping a real stack. There is no hardware/gesture back-button integration.
- **Bottom tab navigator**: not a real navigator either — `src/components/BottomTabBar.tsx` is a presentational component that renders tab buttons and calls an `onTabPress(route)` prop, which `RootNavigator.handleTabPress` interprets to switch screens. It is reused by both the Customer and Provider home/orders/profile screens with a different tab set (`isAgent` prop swaps `chat`+`orders` for `calendar`+`orders`).
- **Drawer navigator**: none exists in the project.
- **Modal screens**: implemented ad hoc with React Native's `<Modal>` inside individual screens (iOS date pickers in Register/Create Order, the city picker in Create Order, the language picker in Profile) — there is no shared modal navigator.
- **Deep linking**: not implemented. No `Linking`, `expo-router`, or URL scheme handling exists.
- **Unused navigation dependency**: `@react-navigation/native`, `@react-navigation/native-stack`, and `@react-navigation/bottom-tabs` are all installed in `package.json` but are never imported anywhere in `src/` — the real navigation is 100% the custom state machine described above.

```mermaid
flowchart TD
    Onboarding[Onboarding] --> Login[Login]
    Login --> OTP[OTP Verify]
    OTP -->|phone 555555555 - Customer| UserHome[User Home]
    OTP -->|phone 555555558 - Agent| AgentHome[Agent Home]
    OTP -->|any other phone - new user| Register[Register]
    Register -->|submit| UserHome

    UserHome -->|order card tap| OrderTracking[Order Tracking]
    UserHome -- "tab: orders" --> Orders[Orders List]
    UserHome -- "tab: chat" --> Chat[Chat]
    UserHome -- "tab: profile" --> Profile[Profile]
    UserHome -->|FAB plus button| CreateOrder[Create Order]
    CreateOrder -->|submit| Waiting[Waiting]
    Waiting -->|auto after 3s| Chat
    Waiting -->|back to home| UserHome
    Orders -->|order card tap| OrderTracking
    OrderTracking -->|chat button| Chat
    OrderTracking -->|back| UserHome
    Chat -->|back| UserHome
    Profile -->|back| UserHome
    Profile -->|logout| Login

    AgentHome -->|order card tap| OrderTracking
    AgentHome -- "tab: orders" --> Orders
    AgentHome -- "tab: calendar (no destination - bug)" -.-> AgentHome
    AgentHome -- "tab: profile" --> Profile
    AgentHome -.->|FAB plus button - unintended, see Issues| CreateOrder
    OrderTracking -->|back, agent role| AgentHome
    Chat -->|back, agent role| AgentHome
    Profile -->|back, agent role| AgentHome
```

---

## Screens by Role

### Guest Screens

#### OnboardingScreen

| Property | Details |
|---|---|
| File | `src/screens/auth/OnboardingScreen.tsx` |
| Route | `onboarding` (initial screen; `RootNavigator` starts `nav.screen` at `'onboarding'`) |
| Roles | Guest |
| Authentication | Not required |
| Accessed From | App launch (default/root screen) |
| Navigates To | Login |

**Description**
A 3-slide swipeable intro carousel ("Choices that make an unforgettable moment", "Gift experts at your service", "Track your order easily") shown to every user on cold start, regardless of whether they've used the app before (no "seen onboarding" persistence exists).

**Main Actions**
- Swipe/paginate between 3 slides (tap the dot indicators or swipe)
- Skip onboarding (top-left "تخطي" link)
- Advance ("التالي" button) through slides, ending in "ابدأ الآن" (Start Now)

**APIs and Services**
- None. All slide content comes from `src/i18n/strings.ts`.

**Notes**
- Onboarding is shown on every app launch — there is no `AsyncStorage`/persisted flag to skip it for returning users.
- Slide order is manually reversed in JS for RTL (`renderedSlides`) rather than relying on native RTL FlatList behavior — functional but non-standard.

---

#### LoginScreen

| Property | Details |
|---|---|
| File | `src/screens/auth/LoginScreen.tsx` |
| Route | `login` |
| Roles | Guest |
| Authentication | Not required (this *is* the entry point to authentication) |
| Accessed From | Onboarding ("Start Now"/"Skip"), Profile screen "Logout" action |
| Navigates To | OTP |

**Description**
Collects a Saudi phone number (fixed `+966` prefix, 9-digit local number) and starts the login flow.

**Main Actions**
- Enter phone number
- Submit ("تسجيل الدخول" / Sign In) — disabled until a number is entered

**APIs and Services**
- None. `onLogin(phone)` is a local callback in `RootNavigator` that pattern-matches the phone string directly — no request is sent anywhere.

**Notes**
- **Mock authentication**: no password, no real OTP delivery, no backend call. Role assignment is entirely based on two hardcoded demo phone numbers (see Role Summary).
- No phone number format validation beyond a 9-digit max length.

---

#### OTPScreen

| Property | Details |
|---|---|
| File | `src/screens/auth/OTPScreen.tsx` |
| Route | `otp` |
| Roles | Guest |
| Authentication | Mid-authentication (represents the OTP-verification step) |
| Accessed From | Login (after submitting a phone number) |
| Navigates To | Agent Home (agent demo phone), User Home (customer demo phone), or Register (any other phone) |

**Description**
4-digit OTP entry screen with auto-advancing digit boxes and a resend link.

**Main Actions**
- Enter 4-digit code (auto-focus next box, backspace to go back a box)
- Verify (enabled only once all 4 boxes are filled)
- Resend code

**APIs and Services**
- None. `onVerify` and `onResend` are local no-op/callback stubs — **any 4 digits are accepted**, the code itself is never checked.

**Notes**
- **Placeholder/mock verification**: the OTP value the user types is never read or validated by `onVerify`; entering any 4 digits logs the user in.
- `onResend` (`RootNavigator.tsx`) is `() => {}` — the "Resend" link is a dead action.

---

#### RegisterScreen

| Property | Details |
|---|---|
| File | `src/screens/auth/RegisterScreen.tsx` |
| Route | `register` |
| Roles | Guest (transitions to Customer on submit) |
| Authentication | Reached only after OTP step for an unrecognized phone number |
| Accessed From | OTP screen (new/unrecognized phone) |
| Navigates To | User Home (on submit), Login (via "back"/"already have an account") |

**Description**
Registration form for brand-new customers: full name, phone, email, date of birth (native date picker on Android, custom modal spinner on iOS), and terms/privacy acceptance.

**Main Actions**
- Fill name / phone / email / date of birth
- Accept Terms & Conditions / Privacy Policy (links)
- Submit ("إنشاء الحساب" / Create Account)
- Navigate to Login instead ("لديك حساب بالفعل؟")

**APIs and Services**
- None. `onRegister()` immediately sets role to `'user'` and navigates Home — no field validation, no account is actually created/persisted anywhere.

**Notes**
- **Incomplete implementation**: the "Terms & Conditions" and "Privacy Policy" links (`reg_terms2`, `reg_terms4`) are `TouchableOpacity` with no `onPress` — they do nothing.
- No client-side validation exists for any field (empty name/phone/email can still submit successfully).
- Every submission is treated as a Customer; there is no path from Register into the Agent/Provider role.

---

### Customer Screens

#### UserHomeScreen

| Property | Details |
|---|---|
| File | `src/screens/user/UserHomeScreen.tsx` |
| Route | `user-home` |
| Roles | Customer |
| Authentication | Requires `role === 'user'` (in-memory only, not enforced by any guard) |
| Accessed From | OTP/Register (post sign-in), Bottom Tab Bar "Home" tab, back actions from Order Tracking/Chat/Profile |
| Navigates To | Order Tracking (order card), Create Order (FAB "+"), Orders / Chat / Profile (bottom tabs) |

**Description**
Customer's main dashboard: hero tagline, horizontal "Featured Gifts" carousel, a 7-day date strip for upcoming occasions, a list of upcoming occasions with a "Prepare your gift" shortcut, and a summary card of recent orders.

**Main Actions**
- Browse featured gifts (horizontal scroll)
- Select a day in the week strip
- Tap an order to open Order Tracking
- Tap "Prepare your gift" (visual only — no `onPress`, see Notes)
- Navigate via bottom tabs / FAB

**Important Components**
`AppHeader`, `OrderCard`, `BottomTabBar`

**APIs and Services**
- None. `gifts`, `upcoming_events`, and the local `ORDERS` array are hardcoded (`strings.ts` / component file).

**Notes**
- **Mock data**: gifts, occasions, and orders are all static.
- "عرض الكل" (See All, next to Featured Gifts) is a `TouchableOpacity` with no `onPress` — dead link.
- "التقويم الكامل" (Full Calendar, next to Upcoming Occasions) is also a dead `TouchableOpacity`.
- Tapping the profile avatar/greeting in `AppHeader` does nothing (`onProfilePress={() => {}}`) — the only working way to reach Profile is the bottom tab.

---

#### CreateOrderScreen

| Property | Details |
|---|---|
| File | `src/screens/user/CreateOrderScreen.tsx` |
| Route | `create-order` |
| Roles | Customer (see Issues — also reachable by Agent due to a UI bug) |
| Authentication | Requires being signed in |
| Accessed From | Bottom Tab Bar's central "+" FAB button |
| Navigates To | Waiting (on submit), User Home (on back) |

**Description**
Order request form: free-text description of the occasion/gift (optional), a required city picker (modal list of 10 Saudi cities), and a required delivery date picker.

**Main Actions**
- Enter description (optional)
- Select city (opens bottom-sheet modal)
- Select delivery date (native picker on Android, modal spinner on iOS)
- Submit request (disabled until city + date are chosen)

**Important Components**
Custom bottom-sheet `Modal` (city list), `@react-native-community/datetimepicker`

**APIs and Services**
- None. Submit calls `onSubmit()` which simply navigates to Waiting — no order is created/persisted or sent anywhere.

**Notes**
- **Mock data**: the city list is a hardcoded array, not fetched from any service.
- "Back" always returns to `user-home` regardless of which role opened the screen (see Issues — problematic for the Agent FAB bug).

---

#### WaitingScreen

| Property | Details |
|---|---|
| File | `src/screens/user/WaitingScreen.tsx` |
| Route | `waiting` |
| Roles | Customer |
| Authentication | Requires being signed in |
| Accessed From | Create Order (after submit) |
| Navigates To | Chat (automatically after ~3 seconds), User Home ("Back to Home" button) |

**Description**
An animated "matching you with a gift expert" screen with rotating tips/messages, shown immediately after submitting a new order request.

**Main Actions**
- Wait (auto-advances to Chat after a fixed 3-second timer)
- Manually return to Home instead

**APIs and Services**
- None. The 3-second delay is a hardcoded `setTimeout`, not a real matching/assignment process.

**Notes**
- **Placeholder behavior**: there is no real "matching" logic — every order is treated identically and always proceeds to the same hardcoded Chat conversation after exactly 3 seconds.

---

### Provider Screens

#### AgentHomeScreen

| Property | Details |
|---|---|
| File | `src/screens/agent/AgentHomeScreen.tsx` |
| Route | `agent-home` |
| Roles | Provider / Agent |
| Authentication | Requires `role === 'agent'` (in-memory only) |
| Accessed From | OTP (agent demo phone), Bottom Tab Bar "Home" tab, back actions from Order Tracking/Chat/Profile |
| Navigates To | Order Tracking (order card), Orders / Profile (bottom tabs); Calendar tab has no destination (see Issues) |

**Description**
Agent/gift-expert dashboard: monthly earnings goal with progress bar, weekly schedule strip, 4 performance stat cards (completed / active / earnings / pending), a weekly earnings bar chart, and a list of recent orders.

**Main Actions**
- Select a day in the week strip (also highlights the corresponding bar in the chart)
- View performance stats
- Tap an order card to open Order Tracking
- Navigate via bottom tabs

**Important Components**
`AppHeader` (agent variant, shows star rating), `OrderCard`, `BottomTabBar` (agent tab set)

**APIs and Services**
- None. Goal amount, stats, chart values, and the two recent orders are all hardcoded constants.

**Notes**
- **Mock data throughout**: earnings, completed-order counts, chart bars, and rating are static values, not computed from any order data.
- "التقويم الكامل" (Full Calendar) link next to the schedule section is a dead `TouchableOpacity` (no `onPress`).
- "عرض الكل" (See All, next to Recent Orders) is also a dead `TouchableOpacity`.
- The bottom tab bar's "Calendar" tab (agent-only tab) has **no corresponding screen or route** — see Issues and Recommendations.
- Tapping the profile avatar/greeting in `AppHeader` does nothing, same issue as on the Customer Home screen.

---

### Shared Screens (Customer + Provider)

> These four screens live under `src/screens/user/` but are used by both roles via an `isAgent` boolean prop that swaps a handful of labels/behaviors. See Issues for the directory-naming inconsistency this creates.

#### OrdersScreen

| Property | Details |
|---|---|
| File | `src/screens/user/OrdersScreen.tsx` |
| Route | `user-orders` (Customer) / `agent-orders` (Provider) — both routes render the same component |
| Roles | Customer, Provider |
| Authentication | Requires being signed in as either role |
| Accessed From | Bottom Tab Bar "Orders" tab (both roles) |
| Navigates To | Order Tracking (tapping any order card) |

**Description**
Filterable list of orders (All / Active / Done / Cancelled) with a result count and an empty state.

**Main Actions**
- Filter by status
- Tap an order card → Order Tracking
- (Empty state shown when a filter has no matches)

**Important Components**
`OrderCard`, `BottomTabBar`

**APIs and Services**
- None. `ALL_ORDERS` is a hardcoded 4-item array; filtering is done client-side over this static list.

**Notes**
- **Mock data**: identical fixed order list is shown to Customer and Provider alike — there's no per-user/per-agent filtering against a real backend.

---

#### OrderTrackingScreen

| Property | Details |
|---|---|
| File | `src/screens/user/OrderTrackingScreen.tsx` |
| Route | `order-tracking` |
| Roles | Customer, Provider |
| Authentication | Requires being signed in as either role |
| Accessed From | Order card tap (Home or Orders list, either role) |
| Navigates To | Chat ("Contact Expert" button or header chat icon), back to Home (role-aware: Customer → User Home, Provider → Agent Home) |

**Description**
Order detail/tracking view: order ID with copy shortcut, delivery time/date/amount summary, a gift preview card with assigned agent name, a 5-stage progress timeline, a live-tracking map placeholder, and cancel/chat action buttons.

**Main Actions**
- Copy order ID
- View delivery timeline/progress
- Cancel order (button present, non-functional — see Notes)
- Open chat with the gift expert

**Important Components**
Custom stage-timeline UI (no external library), static map placeholder

**APIs and Services**
- None. `orderId` is passed in via navigation params but all other order details (gift name, occasion, agent name, timeline state, amount) are hardcoded — they do not vary by the actual `orderId`.

**Notes**
- **Incomplete implementation**: "إلغاء الطلب" (Cancel Order) button has no `onPress` handler at all.
- **Placeholder/mock data**: the "live tracking" map is a static emoji/placeholder box, not a real map integration; timeline stage completion (`STAGE_DONE`/`STAGE_ACTIVE`) is a hardcoded array, identical for every order regardless of `orderId`.

---

#### ChatScreen

| Property | Details |
|---|---|
| File | `src/screens/user/ChatScreen.tsx` |
| Route | `chat` |
| Roles | Customer, Provider |
| Authentication | Requires being signed in as either role |
| Accessed From | Bottom Tab Bar "Chat" tab (**Customer only** — this tab does not exist in the Provider tab set), Order Tracking screen (both roles) |
| Navigates To | Back to Home (role-aware) |

**Description**
1:1 chat thread between the customer and their assigned gift expert, with a message list, order-context banner, and a text input with send/attach buttons.

**Main Actions**
- Send a text message (appended locally, no delivery to any backend)
- (Attach file — button present, non-functional)

**APIs and Services**
- None. `INITIAL_MESSAGES` is a hardcoded 5-message conversation seed; new messages sent by the user are only appended to local component state and are never persisted or actually delivered.

**Notes**
- **Incomplete implementation**: the 📎 attach button has no `onPress` handler.
- **Placeholder/mock data**: the "agent" side never actually responds — the conversation is one-directional after the initial seed messages.
- **Navigation inconsistency**: reachable via bottom tab for Customers, but Providers have no tab entry for Chat (only reachable via Order Tracking) — see Issues.

---

#### ProfileScreen

| Property | Details |
|---|---|
| File | `src/screens/user/ProfileScreen.tsx` |
| Route | `user-profile` (Customer) / `agent-profile` (Provider) — both render the same component |
| Roles | Customer, Provider |
| Authentication | Requires being signed in as either role |
| Accessed From | Bottom Tab Bar "Profile" tab (both roles) |
| Navigates To | Login (Logout action); Language modal (in-place, not a separate screen) |

**Description**
Account screen: avatar, name/phone (and rating + stats, Provider only), account info list (email/address/payment, +report/schedule for Providers), preference toggles (dark mode, language), support links, logout, and delete-account.

**Main Actions**
- Toggle dark mode (functional)
- Change language between Arabic/English (functional, triggers app reload)
- Logout (functional — returns to Login)
- Everything else below is visual-only (see Notes)

**Important Components**
`Switch`, in-screen `MenuItem` sub-component, language-selection `Modal`

**APIs and Services**
- None.

**Notes**
- **Incomplete implementation**: Email, Address, Payment Methods, Performance Report (Provider), Monthly Schedule (Provider), Help Center, Terms & Conditions, Privacy Policy, and Delete Account menu rows all render as tappable `MenuItem`s but have **no `onPress` handler** — every one is a dead end.
- **Placeholder/mock data**: name, phone, rating, and all stats shown are hardcoded strings, not the actual signed-in account's data.
- "✏️ تعديل" (Edit) button in the header has no `onPress` handler.

---

## Complete Screen Inventory

| # | Screen | File Path | Route | Role | Description | Status |
|---|---|---|---|---|---|---|
| 1 | OnboardingScreen | `src/screens/auth/OnboardingScreen.tsx` | `onboarding` | Guest | 3-slide app intro carousel | Complete |
| 2 | LoginScreen | `src/screens/auth/LoginScreen.tsx` | `login` | Guest | Phone number entry / sign-in | Complete (mock auth) |
| 3 | OTPScreen | `src/screens/auth/OTPScreen.tsx` | `otp` | Guest | 4-digit OTP entry | Placeholder (any code accepted; resend is a no-op) |
| 4 | RegisterScreen | `src/screens/auth/RegisterScreen.tsx` | `register` | Guest → Customer | New-account registration form | Incomplete (terms/privacy links dead, no validation) |
| 5 | UserHomeScreen | `src/screens/user/UserHomeScreen.tsx` | `user-home` | Customer | Customer dashboard/home | Incomplete ("See All"/"Full Calendar" links dead) |
| 6 | AgentHomeScreen | `src/screens/agent/AgentHomeScreen.tsx` | `agent-home` | Provider | Agent/gift-expert dashboard | Incomplete ("Full Calendar"/"See All" links dead, Calendar tab has no target) |
| 7 | CreateOrderScreen | `src/screens/user/CreateOrderScreen.tsx` | `create-order` | Customer (leak to Provider, see Issues) | New order request form | Complete (core flow works; hardcoded city list) |
| 8 | WaitingScreen | `src/screens/user/WaitingScreen.tsx` | `waiting` | Customer | Animated "finding an expert" wait screen | Complete (timer-based placeholder by design) |
| 9 | OrdersScreen | `src/screens/user/OrdersScreen.tsx` | `user-orders` / `agent-orders` | Customer, Provider | Filterable order list | Complete (over mock data) |
| 10 | OrderTrackingScreen | `src/screens/user/OrderTrackingScreen.tsx` | `order-tracking` | Customer, Provider | Order detail & delivery timeline | Incomplete (cancel button dead, map is a placeholder) |
| 11 | ChatScreen | `src/screens/user/ChatScreen.tsx` | `chat` | Customer, Provider | 1:1 chat with gift expert | Incomplete (attach button dead, no real backend delivery) |
| 12 | ProfileScreen | `src/screens/user/ProfileScreen.tsx` | `user-profile` / `agent-profile` | Customer, Provider | Account & settings screen | Incomplete (most menu rows are dead links) |

---

## Issues and Recommendations

**Navigation / routing**
- **React Navigation is installed but entirely unused.** `@react-navigation/native`, `@react-navigation/native-stack`, and `@react-navigation/bottom-tabs` are dependencies in `package.json`, but every screen transition is handled by a hand-rolled `useState` switch in `RootNavigator.tsx`. This means no real back-stack, no deep linking, and no hardware/gesture back support anywhere in the app.
- **Missing route: "Calendar" tab (Agent).** `BottomTabBar`'s agent tab set includes a `calendar` route, but `RootNavigator.handleTabPress` never handles `route === 'calendar'` for the agent branch, and no `CalendarScreen` exists. Tapping this tab currently does nothing.
- **Role-access inconsistency: shared "+" FAB.** The central "+" button in `BottomTabBar` is rendered unconditionally (not gated by `isAgent`), and `RootNavigator.handleTabPress` checks `route === 'new-order'` *before* checking role. This means an Agent can open the Customer-only `CreateOrderScreen` from their own home screen, and its "back" action then always lands on `user-home` — dropping an Agent into the Customer dashboard. This looks unintended.
- **Chat is reachable inconsistently by role.** Customers have a dedicated "Chat" bottom tab; Providers do not (their tab set is Home/Orders/Calendar/Profile) — Providers can only reach Chat via Order Tracking's chat button. If this asymmetry isn't intentional, it should be reconciled.
- **`AppHeader`'s profile shortcut is dead on both home screens.** `onProfilePress={() => {}}` in both `UserHomeScreen` and `AgentHomeScreen` means tapping the avatar/greeting does nothing; Profile is only reachable via the bottom tab.

**Directory / naming**
- Screens shared between Customer and Provider (`OrdersScreen`, `OrderTrackingScreen`, `ChatScreen`, `ProfileScreen`) live under `src/screens/user/`, which reads as Customer-only. Consider a `src/screens/shared/` (or similar) location to make the shared nature explicit.
- There is no `src/screens/admin`, `manager`, or `courier` directory or role — if the product roadmap includes those roles, none of the scaffolding exists yet.

**Authentication**
- **No real authentication exists.** Login accepts any phone number; OTP accepts any 4 digits; role is assigned by matching two hardcoded demo phone numbers. There is no token, no session persistence (reloading the app resets straight to Onboarding/Guest), and no server-side check anywhere.
- No client-side field validation on Login, OTP, or Register (e.g., empty name/email can be submitted).

**Mock / hardcoded data (applies app-wide)**
Every screen's data is static: gifts, occasions, orders, chat messages, agent stats/earnings, tracking timeline state, and city lists are all hardcoded in either the screen file or `src/i18n/strings.ts`. None of it varies based on the actual signed-in user, selected order, or navigation params (e.g. `OrderTrackingScreen` ignores the real content of `orderId` beyond displaying the string). Any of these screens should be treated as **UI prototypes**, not backend-integrated features, until real services are wired in.

**Dead-end UI elements found**
| Location | Element | Issue |
|---|---|---|
| RegisterScreen | Terms & Conditions / Privacy Policy links | No `onPress` |
| UserHomeScreen | "See All" (Featured Gifts), "Full Calendar" (Upcoming Occasions) | No `onPress` |
| AgentHomeScreen | "Full Calendar" (Schedule), "See All" (Recent Orders) | No `onPress` |
| OrderTrackingScreen | "Cancel Order" button | No `onPress` |
| ChatScreen | Attach (📎) button | No `onPress` |
| ProfileScreen | Edit (header), Email, Address, Payment Methods, Performance Report, Monthly Schedule, Help Center, Terms & Conditions, Privacy Policy, Delete Account | No `onPress` on any of these `MenuItem`s |

**Unused / unregistered screens**
- None found — every screen file under `src/screens/` is imported and reachable from `RootNavigator.tsx`. There are no orphaned screen components and no routes pointing at a screen that doesn't exist (aside from the Calendar tab noted above, which has no screen at all rather than a broken reference).

**Duplicate or similarly named screens**
- None found. Screen names are distinct; the closest thing to duplication is intentional prop-based reuse (`OrdersScreen`, `OrderTrackingScreen`, `ChatScreen`, `ProfileScreen` each serve two roles via an `isAgent` boolean), which is a legitimate pattern, not an accidental duplicate.

**Other**
- Two other installed dependencies (`react-native-calendars`, `@react-navigation/*`, `react-native-vector-icons`, `react-native-svg`) show no usage anywhere in `src/`, suggesting either removed features or planned-but-unbuilt functionality (e.g., a real calendar screen to back the missing Calendar tab).
