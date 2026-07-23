# SAFE-GIFT Mobile UI Spec

Build-ready screen specification for the SAFE-GIFT React Native (Expo) app, covering
both the CUSTOMER and COURIER roles, built strictly against the API contract supplied
for this task. Nothing below invents an endpoint, field, or status not present in that
contract — anywhere the UI needs something the API doesn't provide, it's called out in
**§6 API Gaps** instead of assumed.

> Note on scope: this file documents a distinct product ("SAFE-GIFT", peer-to-peer
> custom gifting with a COURIER role, wallet/escrow, invoices) from the `giftly-ui`
> app this repository currently contains (which has no courier role, wallet, or
> invoice flow). It's written as a standalone spec a developer can build a new app or
> a major extension from — it does not assume or reuse any existing screen in this
> repo.

---

## 1. App Overview & Navigation

Two roles share one codebase and diverge immediately after auth: **CUSTOMER** and
**COURIER**. Role is fixed at registration (`POST /api/auth/register`) and returned on
every login/refresh — the client never lets a user switch roles.

### 1.1 Navigation tree

```
RootNavigator (native-stack)
├── AuthStack (unauthenticated)
│   ├── Landing
│   ├── PhoneEntry
│   ├── OtpVerify
│   └── RegisterRoleForm            (only when verify-otp returns is_new_user:true)
│
├── CourierPendingStack              (COURIER, status:PENDING_VERIFICATION)
│   └── PendingVerification
│
├── CustomerTabs (bottom-tabs)       (CUSTOMER, status:ACTIVE)
│   ├── OrdersTab (stack)
│   │   ├── OrderList
│   │   ├── OrderDetail
│   │   ├── InvoiceView
│   │   ├── ChatThread
│   │   └── RatingSheet (modal)
│   ├── NewOrderTab (stack)
│   │   └── CreateOrder
│   ├── WalletTab (stack)
│   │   ├── WalletHome
│   │   └── TopUpWebview
│   ├── ChatTab (stack)
│   │   ├── ConversationList
│   │   └── ChatThread
│   └── ProfileTab (stack)
│       └── Profile
│
└── CourierTabs (bottom-tabs)        (COURIER, status:ACTIVE)
    ├── RadarTab (stack)
    │   ├── AvailableOrders
    │   ├── OrderDetail
    │   ├── AuthorInvoice
    │   ├── DeliverOrder
    │   └── ChatThread
    ├── MyOrdersTab (stack)          (see API Gaps — no list endpoint exists yet)
    │   ├── MyOrdersList
    │   └── OrderDetail
    ├── WalletTab (stack)            (same screens as customer wallet)
    ├── ChatTab (stack)
    └── ProfileTab (stack)
```

`OrderDetail`, `InvoiceView`, `ChatThread`, and the wallet screens are shared
components parameterized by role — the API calls are identical, only which actions
render (accept vs. pay vs. deliver) differs, driven by role + order status.

### 1.2 Role split after login

| verify-otp / register result | Route |
|---|---|
| `is_new_user:false`, `role:CUSTOMER` | → CustomerTabs |
| `is_new_user:false`, `role:COURIER`, `status:ACTIVE` | → CourierTabs |
| `is_new_user:false`, `role:COURIER`, `status:PENDING_VERIFICATION` | → CourierPendingStack |
| `is_new_user:false`, `status:BANNED` | → AuthStack with a blocking "account suspended" message (never reachable via normal 401 handling since login itself should be blocked; if `GET /api/users/me` later returns `status:BANNED`, force logout) |
| `is_new_user:true` | → RegisterRoleForm (role chosen here) |
| Register response `role:COURIER` | → CourierPendingStack (always `PENDING_VERIFICATION` on creation) |
| Register response `role:CUSTOMER` | → CustomerTabs |

### 1.3 Route map

| Route | Screen | Reachable by |
|---|---|---|
| `/auth/landing` | Landing | Anyone, unauthenticated |
| `/auth/phone` | PhoneEntry | Anyone, unauthenticated |
| `/auth/otp` | OtpVerify | After PhoneEntry submits |
| `/auth/register` | RegisterRoleForm | After OtpVerify returns `is_new_user:true` |
| `/courier/pending` | PendingVerification | COURIER, `status:PENDING_VERIFICATION` |
| `/customer/orders` | OrderList | CUSTOMER |
| `/customer/orders/:id` | OrderDetail | CUSTOMER, participant only |
| `/customer/orders/:id/invoice` | InvoiceView | CUSTOMER, participant only |
| `/customer/new-order` | CreateOrder | CUSTOMER |
| `/customer/wallet` | WalletHome | CUSTOMER |
| `/customer/chats` | ConversationList | CUSTOMER |
| `/customer/chats/:conversationId` | ChatThread | CUSTOMER, participant only |
| `/customer/profile` | Profile | CUSTOMER |
| `/courier/radar` | AvailableOrders | COURIER, `status:ACTIVE` |
| `/courier/orders/:id` | OrderDetail | COURIER, participant only |
| `/courier/orders/:id/invoice/new` | AuthorInvoice | COURIER, assigned courier, order `ASSIGNED` |
| `/courier/orders/:id/deliver` | DeliverOrder | COURIER, assigned courier, order `IN_PROGRESS` |
| `/courier/my-orders` | MyOrdersList | COURIER (see API Gaps) |
| `/courier/wallet` | WalletHome | COURIER |
| `/courier/chats` | ConversationList | COURIER |
| `/courier/chats/:conversationId` | ChatThread | COURIER, participant only |
| `/courier/profile` | Profile | COURIER |

---

## 2. Global Concerns

### 2.1 Token storage & the request interceptor

- Store `access_token` and `refresh_token` in secure storage (iOS Keychain /
  Android Keystore) — e.g. `expo-secure-store`. Never `AsyncStorage`.
- A single HTTP client interceptor:
  1. Attach `Authorization: Bearer <access_token>` to every request **except**
     `/api/auth/*`, health checks, and the raw S3 `upload_url` PUT.
  2. On `401 UNAUTHORIZED`: call `POST /api/auth/refresh` once with the stored
     `refresh_token`. On success, store the **new** `access_token` + `refresh_token`
     (the old refresh token is now invalid — discard it) and retry the original
     request exactly once.
  3. If refresh itself 401s (unknown/expired/reused token — this also covers a
     banned/suspended account), clear both tokens and navigate to
     `/auth/phone`. Show a one-line toast: "Session expired, please sign in again."
  4. Never auto-retry a second time — one refresh attempt per failed request, to
     avoid infinite loops if the backend is genuinely down.
- On `429 RATE_LIMITED`: read the `Retry-After` header (seconds); disable the
  triggering action's button and show a countdown/"try again in Ns" state rather
  than silently retrying.
- WebSocket connections pass `access_token` as a query param at connect time (RN
  can't set headers on the upgrade request). If the socket closes with code
  `4401`, treat it exactly like a 401: refresh the access token and reconnect with
  the new token in the query string. Code `4403` means the user isn't a
  participant — do not retry, just stop reconnecting.

### 2.2 Money / date / currency rendering

- **Money is always a decimal string.** Never `parseFloat`/`Number()` it for
  display or arithmetic that could reintroduce float rounding — format via a
  string-safe decimal formatter (e.g. `decimal.js` or a small fixed-point helper).
  A `MoneyText` component (see §5) owns this everywhere.
- Render as `"{amount} {currency}"` using the invoice/wallet's own `currency` field
  when present (defaults to `"SAR"` app-wide otherwise) — never hardcode a symbol.
- Negative amounts (wallet transaction `amount`, e.g. `"-724.50"`) render with a
  leading minus and, ideally, a muted/red tint; positive amounts (credits) can get
  a `+` prefix and a green tint.
- Timestamps (`created_at`, `issued_at`, `expires_at`, …) are ISO-8601 UTC strings —
  convert to the device's local timezone for display, using a relative format
  ("3m ago", "Yesterday") for chat/activity feeds and an absolute local
  date/time for receipts and order records.
- `delivery_date` / `dob` are plain `"YYYY-MM-DD"` — no timezone conversion, display
  as a calendar date only.
- Phone numbers are stored/sent as `^\+9665\d{8}$`; display with normal Saudi
  grouping (e.g. `+966 5X XXX XXXX`) but always **send** the raw E.164 string.

### 2.3 Standard data-screen states

Every screen that fetches from the API implements all of:

| State | Trigger | UX |
|---|---|---|
| Loading | first fetch, no cached data | Skeleton matching the eventual layout (not a spinner) for list/detail screens |
| Empty | 200 with an empty `items`/resource | Illustration + one-line explanation + a primary action where one exists (e.g. "No orders yet" → "Create your first order") |
| Error | any non-2xx after the interceptor's refresh step, or network failure | `ErrorBanner` mapped from `error.code` (see §2.4) with a retry button; keep the previous successful data on screen underneath if this was a refresh, not a first load |
| Offline | no network detected before a request fires | Skip the request, show a persistent "You're offline" banner, keep last-known cached data visible, auto-retry on reconnect |
| Pull-to-refresh | user gesture on any list/detail screen | Re-run the screen's primary GET(s); on failure, keep old data and show a transient toast, not a full-screen error |
| Cursor pagination | any `items` + `next_cursor` response | Infinite-scroll: fetch next page when the user nears the list end, passing `next_cursor` back **verbatim**; stop when `next_cursor` is `null`; never construct a cursor client-side |
| Optimistic vs. confirmed writes | user-initiated mutation | See §2.5 |
| Rate limited | `429` on any call | See §2.1; on chat send specifically, keep the message in a "sending" bubble state rather than dropping it |

### 2.4 Error-code → UX mapping

| `error.code` | HTTP | UX |
|---|---|---|
| `UNAUTHORIZED` | 401 | Handled by the interceptor (silent refresh+retry); if that fails, force logout |
| `FORBIDDEN` | 403 | Hide/disable the action client-side in the first place; if hit anyway (stale UI), show `error.message` and refresh the screen's data |
| `NOT_FOUND` | 404 | Generic "This isn't available anymore" empty state, offer to go back |
| `INVALID_STATE_TRANSITION` | 409 | Re-fetch the resource (order/invoice), re-derive which actions are valid from the new status, show a toast: "This order has changed — refreshed for you" |
| `CONFLICT` | 409 | Re-fetch and retry the user's last action once automatically; if it fails again, surface `error.message` |
| `ORDER_ALREADY_ASSIGNED` | 409 | Remove the order from the courier's radar list immediately, toast "Someone else got there first" |
| `INSUFFICIENT_FUNDS` | 409 | On invoice pay: show the shortfall and a "Top Up Wallet" CTA that deep-links into WalletHome's top-up flow |
| `PROMO_NOT_FOUND` / `PROMO_INACTIVE` / `PROMO_NOT_STARTED` / `PROMO_EXPIRED` / `PROMO_MIN_ORDER_NOT_MET` / `PROMO_USAGE_EXCEEDED` / `PROMO_USER_LIMIT_REACHED` | 422 | Inline error under the promo code input using `error.message`; never block the rest of checkout |
| `OUTSIDE_DELIVERY_GEOFENCE` | 403 | On DeliverOrder: show `error.message` plus a "Move closer to the delivery point" hint. **Never** show the target lat/long |
| `VALIDATION_ERROR` | 422 | Inline, field-level error; map by whichever field the form last touched if the API doesn't disambiguate |
| `PAYLOAD_TOO_LARGE` | 413 | On media upload: "That file is too large" before ever reaching step 2 of the upload flow (validate `byte_size` client-side against the ~10MiB cap first) |
| `LENGTH_REQUIRED` | 411 | Shouldn't be reachable from correct client code (never stream request bodies); if seen, generic error + retry |
| `RATE_LIMITED` | 429 | See §2.1 |
| `INTERNAL_ERROR` | 500 | Generic "Something went wrong, we're looking into it" + the `request_id` in small print (useful for support), retry button |

`ErrorBanner` always branches on `error.code`; `error.message` is only ever used as
display text, never parsed for logic.

### 2.5 Optimistic vs. confirmed writes

- **Optimistic** (instant local update, roll back on failure): chat message send
  (bubble appears immediately in a "sending" state, flips to "sent" on the REST
  201, flips to an error/retry state on failure); marking a conversation read.
- **Confirmed-only** (show a loading state on the action, only update UI on 2xx):
  everything involving money or state transitions — order create/accept/cancel/
  deliver/approve/dispute, invoice issue/pay/cancel, promo validate, wallet top-up,
  rating submit. These all have server-side side effects (escrow, payouts,
  geofence checks) that must not be assumed to have succeeded.

### 2.6 Idempotency

`POST /api/wallets/topup` and `POST /api/invoices/{id}/pay` are safe to retry on
timeout/network-drop — the server dedupes. On a request that times out with no
response, the client may safely re-send the identical request rather than asking
the user to decide.

---

## 3. Screen-by-Screen Spec

### 3.1 Onboarding — Landing

- **Purpose**: entry point, choose sign in.
- **Role/entry**: unauthenticated, app cold start.
- **API calls**: none.
- **Inputs**: none (a single "Continue" CTA to PhoneEntry).
- **States**: static.

### 3.2 Onboarding — PhoneEntry

- **Purpose**: collect phone number, request an OTP.
- **Role/entry**: unauthenticated; from Landing or "resend"/back navigation.
- **API calls**: `POST /api/auth/send-otp` on submit.
  - Request body built from: `phone` (masked Saudi input, validated client-side
    against `^\+9665\d{8}$` before the call fires).
- **UI state machine**: `idle` → `submitting` → `sent` (navigate to OtpVerify,
  passing `phone` + `expires_in`) | `error`.
- **Fields displayed**: none.
- **Errors this screen can hit**: `VALIDATION_ERROR` (422, malformed phone) → inline
  under the input; `RATE_LIMITED` (429) → disable submit, show countdown from
  `Retry-After`.
- **Loading/empty/success**: submit button shows a spinner while `submitting`;
  success navigates away (no persistent success state on this screen).

### 3.3 Onboarding — OtpVerify

- **Purpose**: verify the OTP, branch to login or registration.
- **Role/entry**: unauthenticated; from PhoneEntry only (needs `phone` param).
- **API calls**: `POST /api/auth/verify-otp` on submit (6-digit code entry,
  auto-submits when filled). "Resend code" re-fires `send-otp`, restarting the
  `expires_in` countdown.
  - Request body: `{phone, otp}`.
- **UI state machine**: `entering` → `verifying` → branches on response:
  - `is_new_user:false` → store `access_token`/`refresh_token`, register the push
    device (§3.16), route by `role`/`status` per §1.2.
  - `is_new_user:true` → store `registration_token` in memory (not secure
    storage — it's single-use and short-lived), navigate to RegisterRoleForm.
  - `error` → shake the input, clear it.
- **Fields displayed**: masked phone number ("code sent to +966 5X XXX XX99"),
  countdown timer, `dev_otp` auto-fill **only** when the field is non-null (dev/test
  builds only — production always receives `null` and shows nothing).
- **Errors**: `VALIDATION_ERROR` (bad/expired code) → inline "Incorrect code, try
  again"; `RATE_LIMITED` → disable resend.

### 3.4 Onboarding — RegisterRoleForm

- **Purpose**: pick CUSTOMER vs COURIER and complete profile.
- **Role/entry**: unauthenticated but holding a `registration_token`; only
  reachable from OtpVerify's new-user branch.
- **API calls**: `POST /api/auth/register` on submit.
  - Request body: `{registration_token, role, full_name?, email?, dob?, city?,
    national_id?, passport_id?}`.
- **UI state machine**: role toggle (CUSTOMER/COURIER) first — selecting COURIER
  reveals two additional required fields (`city`, and one of `national_id` /
  `passport_id` via a segmented ID-type picker) per the contract's courier
  requirement. `idle` → `submitting` → success (store tokens, route per §1.2) |
  `error`.
- **Inputs → request fields**: Full name → `full_name` (optional), Email →
  `email` (optional), DOB → `dob` (optional, date picker, formats to
  `"YYYY-MM-DD"`), City → `city` (**required if COURIER**), National ID / Passport
  toggle+field → `national_id` **or** `passport_id` (exactly one, **required if
  COURIER**).
- **Errors**: `VALIDATION_ERROR` (422) → inline per field, including "city and an
  ID are required for couriers" if a courier submits without them.
- On success with `role:COURIER`: always routes to PendingVerification (a fresh
  courier account is never `ACTIVE`).

### 3.5 Courier — PendingVerification

- **Purpose**: blocking screen while an admin verifies a new courier account.
- **Role/entry**: COURIER, `status:PENDING_VERIFICATION`. Every app launch checks
  `GET /api/users/me` on the auth-gate; while status is `PENDING_VERIFICATION`,
  this is the only reachable screen (tabs are not mounted).
- **API calls**: `GET /api/users/me` — on screen focus and via pull-to-refresh (no
  push/webhook signals a verification event, so this is poll-on-demand only; see
  API Gaps for a possible push event).
- **UI state machine**: `pending` (persistent illustration + "We're reviewing
  your documents" + a manual "Check again" button) → on a refresh returning
  `status:ACTIVE`, route to CourierTabs.
- **Fields displayed**: `full_name`, submitted `city` (from local state captured
  at registration — the API doesn't return it back on `/users/me`, see API Gaps).
- **Errors**: `UNAUTHORIZED` handled by the interceptor as usual; no other
  mutating calls happen here.

### 3.6 Customer — CreateOrder

- **Purpose**: place a new gift order.
- **Role/entry**: CUSTOMER, from the NewOrderTab or a "+" FAB on OrderList.
- **API calls**:
  1. Per selected photo: `POST /api/media/upload-urls` → PUT raw bytes to
     `upload_url` → `POST /api/media/confirm`, run sequentially per photo, in
     parallel across photos (max 3).
  2. `POST /api/orders` on final submit.
- **Request payload**:
  - `description` ← free-text field, optional, capped at 2000 chars (live
    counter, disable submit past the limit).
  - `delivery_city` ← city picker, required, ≤100 chars.
  - `latitude`/`longitude` ← map pin picker (drag-to-place) or device location,
    required, validated in-range client-side.
  - `delivery_date` ← date picker, required, capped to "today + 6 months" in the
    picker itself.
  - `request_media_keys` ← the `storage_key`s from step 1, only after each has
    been through `confirm` (0–3 photos; UI enforces the 3-photo cap by disabling
    the add-photo button).
- **UI state machine**: `editing` → (per photo) `uploading photo n/3` → `submitting
  order` → `created` (navigate to OrderDetail for the new order,
  status `NEW`) | `error` (stay on form, preserve all entered data).
- **Errors**: `VALIDATION_ERROR` → inline per field; `PAYLOAD_TOO_LARGE` on a
  photo → remove that photo from the pending list with an inline "too large"
  note, don't block the rest; general upload failure (network) → per-photo retry
  button, order submit stays disabled until every added photo is `CONFIRMED` or
  removed.
- **Loading/empty**: N/A (form screen); success is a screen transition.

### 3.7 Customer — OrderList

- **Purpose**: browse the customer's own orders.
- **Role/entry**: CUSTOMER, OrdersTab root.
- **API calls**: `GET /api/orders` on mount and pull-to-refresh, paginated
  (cursor, `limit=20`); optional `?status=` filter chips (All / the seven status
  values) map to repeat calls with that query param — **not** client-side
  filtering, since the list is server-paginated.
- **Fields displayed** (`OrderSummary`): `id`, `StatusBadge` from `status`,
  `delivery_city`, `delivery_date`, `description` (truncated 1–2 lines),
  `created_at` (relative).
- **States**: loading skeleton (5 `OrderCard` placeholders); empty ("No orders
  yet" + "Create an order" CTA to CreateOrder); error banner with retry; infinite
  scroll pagination per §2.3.
- **Push deep link**: none targets this screen directly (see §3.16 — "new
  message" deep-links to ChatThread, not here).
- Tapping a row → OrderDetail.

### 3.8 Shared — OrderDetail

- **Purpose**: full detail + the action relevant to the order's current status,
  for whichever role is viewing.
- **Role/entry**: CUSTOMER or COURIER, must be a participant (`customer_id` or
  `courier_id` matches the caller — enforced server-side, 404 otherwise). Entry
  points: OrderList row, AvailableOrders row (courier, pre-accept), push deep
  link, MyOrdersList row.
- **API calls**:
  - `GET /api/orders/{id}` on mount/focus.
  - `GET /api/orders/{id}/invoice` on mount **if** `status` is `WAITING_PAYMENT`
    or later (returns 404 before an invoice exists — treat 404 here as "no
    invoice yet", not an error state).
  - Action calls fired by buttons below.
- **UI state machine, keyed on `status`**:

  | `status` | Customer sees | Courier sees |
  |---|---|---|
  | `NEW` | "Waiting for a courier to accept", Cancel button | (not reachable here pre-accept — courier is on AvailableOrders) |
  | `ASSIGNED` | Courier assigned, waiting for invoice; Cancel button; Chat button | "Write an invoice" CTA → AuthorInvoice; Cancel button; Chat button |
  | `WAITING_PAYMENT` | Invoice summary + "Pay Invoice" CTA → InvoiceView; Cancel button (still allowed pre-in-progress) | Invoice summary, read-only; "Cancel invoice" via InvoiceView; waiting-for-payment note |
  | `IN_PROGRESS` | "Your gift is being prepared/delivered"; Chat button; Dispute button | "Mark delivered" CTA → DeliverOrder; Chat button; Dispute button |
  | `DELIVERED` | "Approve" CTA (releases courier's payout) + note: "Auto-approves in ~72h if you don't respond"; Rate button appears after approve; Dispute button | Waiting-for-approval note; Dispute button |
  | `COMPLETED` | Rate button (if not yet rated this order — client tracks locally, no "already rated" flag in the contract, see API Gaps); read-only detail | Read-only detail; Rate button |
  | `CANCELLED` | `reason` shown if present; read-only | Read-only |
  | `DISPUTED` | `resolution_note` shown when set, else "Under review"; read-only otherwise | Same |
  | `REFUNDED` | Read-only, refund note | Read-only |

- **Fields displayed**: `id`, `status` badge, `delivery_city`, `delivery_date`,
  `description`, `total_amount` (via `MoneyText`, only meaningful once an invoice
  exists — shows "—" before `WAITING_PAYMENT`), `latitude`/`longitude` (shown as a
  static map pin — **only rendered once populated**, i.e. courier post-accept or
  customer always; a courier viewing a `NEW` order on AvailableOrders never sees
  this screen pre-accept), `assigned_at`, `created_at`.
- **Cancel** (`POST /api/orders/{id}/cancel`): confirmation sheet asking for an
  optional `reason` (≤255 chars) → on 200, refresh detail. Button only rendered
  before `IN_PROGRESS` per the contract.
- **Dispute** (`POST /api/orders/{id}/dispute`): opens a sheet requiring `reason`
  (3–1000 chars) → on 201, refresh detail to show `DISPUTED` state.
- **Errors**: `NOT_FOUND` → "This order isn't available" + back; `
  INVALID_STATE_TRANSITION` on any action → refresh + re-derive the table above +
  toast; `OUTSIDE_DELIVERY_GEOFENCE` doesn't occur here (that's DeliverOrder).
- **Push deep link**: none directly, but ChatThread and rating flows return here.

### 3.9 Shared — InvoiceView

- **Purpose**: show the itemized invoice, preview a promo, and pay.
- **Role/entry**: CUSTOMER (to pay) or COURIER (read-only, or to cancel their own
  draft/issued invoice), from OrderDetail once `status >= WAITING_PAYMENT`.
- **API calls**:
  - `GET /api/orders/{id}/invoice` (or `GET /api/invoices/{id}` if navigated with
    an invoice id directly) on mount.
  - Customer only: `POST /api/promos/validate` when a promo code is entered and
    "Apply" tapped (preview only — does not mutate the invoice).
  - Customer only: `POST /api/invoices/{id}/pay` on "Pay Now" (no body).
  - Courier only (invoice `status:DRAFT`/`ISSUED`): `POST /api/invoices/{id}/cancel`.
- **UI state machine keyed on invoice `status`**:
  - `DRAFT`/`ISSUED` + not expired: customer sees the full breakdown and Pay Now;
    courier sees breakdown + Cancel Invoice.
  - `ISSUED` past `expires_at`: treat like expired — disable Pay, show "This
    invoice has expired, ask your courier to reissue it."
  - `PAID`: read-only receipt view for both roles.
  - `CANCELLED`/`EXPIRED`: read-only, banner explaining state.
- **Fields displayed**, in this exact order (per contract): for each item —
  `title`, `description`, `unit_price_amount` × `quantity`, `tax_rate`,
  `line_net_amount`, `line_discount_amount`, `line_taxable_amount`,
  `line_tax_amount`, `line_total_amount`; then invoice totals —
  `items_net_amount`, `courier_fee_amount`, `service_fee_amount`,
  `discount_amount`, `net_after_discount_amount`, `tax_amount`, `total_amount`
  (bold, largest), `promo_code` (if set), `expires_at` (countdown once <1h left).
- **Promo input** (customer, pre-pay only): text field → `POST
  /api/promos/validate {code, order_id}` → on success show `discount_amount` /
  `original_total_amount` / `total_amount` as a preview strip above the real
  totals (the preview is **not** applied until `pay` — payment re-validates the
  code server-side via whatever `promo_code` was captured at invoice authoring,
  see API Gaps: the contract's invoice creation takes `promo_code` from the
  courier's `POST .../invoices` call, not from the customer's later preview —
  reconcile this in product, not just UI, before build).
- **Pay flow**: tap "Pay Now" → `POST /api/invoices/{id}/pay` →
  - `status:"PAID"` in response → success screen/confetti, order refreshes to
    `IN_PROGRESS`, `amount_from_wallet`/`amount_from_gateway` shown as a receipt
    breakdown.
  - `status:"PENDING"` → open `payment_url` in an in-app WebView
    (`react-native-webview`). **Recommendation**: on WebView navigation back to
    the app's known return URL (or the WebView closing), re-fetch
    `GET /api/invoices/{id}` rather than trying to parse the return URL for a
    result — the gateway webhook is the source of truth and may land slightly
    after the redirect. Show a "Confirming payment…" spinner for up to ~10s
    polling `GET /api/invoices/{id}` every ~2s, then fall back to "We'll notify
    you once payment confirms" if still `ISSUED`.
- **Errors**: `PROMO_*` (422) → inline under the promo field, invoice itself
  unaffected; `CONFLICT`/`INVALID_STATE_TRANSITION` (409, not payable/expired) →
  refresh invoice, show banner; `INSUFFICIENT_FUNDS` (409) → per §2.4, deep-link
  to WalletTab top-up.

### 3.10 Courier — AvailableOrders ("radar")

- **Purpose**: browse unassigned orders in the courier's city and accept one.
- **Role/entry**: COURIER, `status:ACTIVE`, RadarTab root. A `PENDING_VERIFICATION`
  courier never reaches this tab (gated at §1.2/§3.5).
- **API calls**: `GET /api/orders/available` on mount, focus, and pull-to-refresh,
  paginated. **Recommendation**: poll every ~20–30s while the tab is foregrounded
  (no push event is defined for "list changed", only "new order nearby" — see
  §3.16 — which should trigger an immediate refresh rather than replacing polling
  entirely, since the push payload carries no order id to patch in directly).
- **Fields displayed**: `OrderSummary` fields (city, date, description, created_at)
  — no exact coordinates pre-accept, per the contract.
- **Accept**: swipe or tap "Accept" on a card → `POST /api/orders/{id}/accept` →
  on 200, remove from the radar list and navigate to OrderDetail (now `ASSIGNED`,
  exact coordinates now visible).
- **Errors**: `ORDER_ALREADY_ASSIGNED` (409) → remove the card from the list
  immediately with a toast "Someone else got there first", no navigation;
  `FORBIDDEN` (403, shouldn't happen once `ACTIVE` but defensively) → route back
  to PendingVerification.
- **States**: empty ("No orders in your area right now"); loading skeleton;
  error banner + retry.
- **Push deep link**: "new order nearby" push → open the app to this screen and
  trigger an immediate refresh (the push body carries no order details per the
  contract — always re-fetch).

### 3.11 Courier — AuthorInvoice

- **Purpose**: build and issue the invoice for an order the courier accepted.
- **Role/entry**: COURIER, the assigned courier, order `status:ASSIGNED`, from
  OrderDetail's "Write an invoice" CTA.
- **API calls**: `POST /api/orders/{id}/invoices` on submit.
- **Request payload**: a repeatable item form (1–20 rows), each row →
  `{title (required, ≤120), description? (≤500), unit_price_amount (decimal
  string, required), quantity (int 1–999, default 1), tax_rate (decimal string
  0–1, default "0.15")}`; plus a single `courier_fee_amount` field (decimal
  string, default `"0.00"`); plus an optional `promo_code` field (courier can
  pre-apply a promo the customer told them about, 1–32 chars).
- **UI state machine**: `editing` (live-computed running total client-side for
  UX only — the authoritative totals come back in the response) →
  `submitting` → `issued` (navigate to InvoiceView, now read-only for the
  courier) | `error` (stay on form).
- **Errors**: `VALIDATION_ERROR` (422) → inline per item/field (e.g. an item
  missing `title`, a non-numeric price); `FORBIDDEN` (not the assigned courier)
  → shouldn't be reachable given the entry gate, but on 403 route back to
  OrderDetail with a toast.
- **States**: N/A beyond the form's own validation; no GET on this screen.

### 3.12 Courier — DeliverOrder

- **Purpose**: capture proof of delivery within the geofence.
- **Role/entry**: COURIER, assigned courier, order `status:IN_PROGRESS`, from
  OrderDetail's "Mark delivered" CTA.
- **API calls**:
  1. Get device location (foreground location permission).
  2. Per photo (1–5 required): the same upload-urls → PUT → confirm sequence as
     CreateOrder.
  3. `POST /api/orders/{id}/deliver` on submit.
- **Request payload**: `latitude`/`longitude` ← device's current position (not
  editable — re-fetched fresh at submit time, not cached from screen-open, since
  the courier may have moved), `proof_media_keys` ← confirmed keys from step 2
  (1–5, submit disabled until at least 1 confirmed photo), `note` ← optional
  text, ≤500 chars.
- **UI state machine**: `capturing` (camera/photo picker, live count "2/5
  photos") → `submitting` → `delivered` (navigate to OrderDetail, now
  `DELIVERED`) | `error`.
- **Errors**: `OUTSIDE_DELIVERY_GEOFENCE` (403) → per §2.4, show the distance
  from `error.message` and a "get closer and try again" prompt; **never** render
  any target coordinates even though the courier's own OrderDetail view has
  them elsewhere — this screen's error state specifically must not leak them
  into a map pin or numeric display. `INVALID_STATE_TRANSITION` (409, e.g.
  order was disputed/cancelled mid-delivery) → refresh order, route back to
  OrderDetail with an explanatory toast.

### 3.13 Shared — WalletHome

- **Purpose**: balance, top-up, transaction history. Identical screen for both
  roles (a courier's payouts land here as `ESCROW_RELEASE` transactions).
- **Role/entry**: CUSTOMER or COURIER, WalletTab root.
- **API calls**: `GET /api/wallets/me` on mount/focus/pull-to-refresh;
  `GET /api/wallets/me/transactions` paginated, same triggers.
- **Fields displayed**: `balance`, `held_balance`, `available` (highlighted as
  "spendable now" — this is the number to make prominent, not `balance`),
  `currency`; transaction list rows: signed `amount` (color-coded), `type`
  (human label per the type enum), `status` (small badge — `PENDING` vs
  `SETTLED` vs `REVERSED`), `balance_after`, `created_at`.
- **Top-up**: amount input (bounded ~100–20000, client-side range hint matching
  the server's ~100-20000 SAR bound) → `POST /api/wallets/topup {amount}` → open
  `payment_url` in a WebView (TopUpWebview). **Recommendation** (same reasoning
  as invoice pay, §3.9): on WebView return, re-fetch `GET /api/wallets/me` and
  poll briefly, since top-up credit lands asynchronously via webhook — don't
  parse the return URL for a result.
- **Errors**: `VALIDATION_ERROR` (422, amount out of range) → inline under the
  top-up input, before the call even fires where possible (client-side bound
  check first).
- **States**: loading skeleton for both balance card and transaction list
  independently (balance loads fast, history can lag); empty transaction list
  ("No transactions yet"); pagination per §2.3.

### 3.14 Shared — ConversationList (chat inbox)

- **Purpose**: list all conversations (one per accepted order) for the current
  user.
- **Role/entry**: CUSTOMER or COURIER, ChatTab root.
- **API calls**: `GET /api/conversations` on mount/focus/pull-to-refresh,
  paginated (cursor format `"<iso8601>|<uuid>"`, opaque — pass back verbatim,
  never parse it).
- **Fields displayed**: per row — counterpart avatar/initial (no name field is
  returned, only `other_user_id`; see API Gaps), `last_message_preview`,
  `unread_count` (badge), `last_message_timestamp` (relative). Rows sort
  newest-first per the contract, no client re-sort needed.
- **States**: empty ("No conversations yet — chat opens once a courier accepts
  your order" for customers / "...once you accept an order" for couriers);
  loading skeleton; pagination.
- **Push deep link**: "new message" push → open directly to ChatThread for that
  `conversation_id` if the push payload includes one (see API Gaps — contract
  says push bodies "never carry sensitive content" but doesn't confirm they
  carry a routable id at all; if not, land on ConversationList instead and let
  the user tap in).
- Tapping a row → ChatThread, and immediately fires the read-receipt call
  (§3.15) since opening the thread implies reading it.

### 3.15 Shared — ChatThread

- **Purpose**: one order's conversation, live.
- **Role/entry**: CUSTOMER or COURIER, participant only, from ConversationList,
  OrderDetail's Chat button, or a push deep link.
- **API calls**:
  - `GET /api/conversations/{id}/messages` on mount, paginated newest-first
    (cursor-paginate **upward** as the user scrolls back in history).
  - `POST /api/conversations/{id}/read` on mount (fire-and-forget, 204) to clear
    unread count — also re-fire whenever the thread regains foreground focus.
  - `POST /api/conversations/{id}/messages` as the **reliable send path** — see
    below.
  - `WS /api/ws/conversations/{id}?token=<access_token>` opened on mount, closed
    on unmount, for live incoming messages only.
- **Send flow (recommendation)**: use REST POST as the source of truth, not the
  WebSocket send path. On submit: optimistically render the message in a
  "sending" bubble → `POST /api/conversations/{id}/messages {text}` → on 201,
  reconcile the optimistic bubble with the real `id`/`created_at` and mark
  "sent" → on failure, mark "failed" with a tap-to-retry. The contract
  explicitly notes WS client→server frames are silently dropped past ~30/min or
  ~4KB with no error surfaced — that makes WS send unsuitable as the only path;
  it's fine as a redundant fast-path if desired, but REST must remain the
  fallback of record.
- **Receive flow**: WS pushes new messages as JSON matching the message shape;
  append to the thread, and if the thread is focused, immediately fire
  `.../read` again. If the socket is closed/reconnecting, don't block sending
  (REST send/receive still works without a live socket — a reconnect will just
  mean incoming messages arrive late until it's back, so also poll
  `GET .../messages` on regaining foreground focus as a catch-up mechanism).
- **Fields displayed**: message bubbles keyed by `sender_id === me`, `content`,
  `created_at`, `is_read` (as a small check/double-check indicator on the
  sender's own bubbles, since `message_type` is always `"TEXT"` in this
  contract — no attachment rendering needed).
- **Input validation**: 1–4000 chars, disable send when empty/over-limit.
- **Errors**: `FORBIDDEN` (not a participant) → shouldn't be reachable via the
  normal nav paths; on 403 route back with a toast. `VALIDATION_ERROR` on send
  (empty/too-long, should be caught client-side first) → inline.

### 3.16 Shared — Push Registration

Not a screen — a lifecycle concern, listed here since the deliverable calls it
out explicitly.

- **On successful login/registration** (any role): request push permission if
  not yet granted, obtain the platform push token, `POST /api/devices
  {token, device_os}`. Re-fire this any time the OS reports a token refresh
  (e.g. `Notifications.addPushTokenListener` in Expo), for the lifetime of the
  session.
- **On logout**: `DELETE /api/devices {token}` **before** clearing local tokens
  (needs the still-valid `Authorization` header), then proceed with
  `POST /api/auth/logout` and clearing secure storage.
- **On receiving a push while foregrounded**: never render push body content
  directly as trusted data — the contract states push bodies carry no sensitive
  content and implies they're notify-only. Always re-fetch the relevant
  resource via REST (order detail, conversation list) before updating any UI.

### 3.17 Shared — RatingSheet

- **Purpose**: rate the other participant after an order completes.
- **Role/entry**: CUSTOMER or COURIER, participant, order `status:DELIVERED` or
  `COMPLETED`, opened as a modal from OrderDetail's Rate button.
- **API calls**: `POST /api/orders/{id}/ratings {score, comment?}` on submit.
- **Inputs**: 1–5 star picker (required) → `score`; optional comment, ≤500 chars
  → `comment`.
- **UI state machine**: `rating` → `submitting` → `submitted` (dismiss sheet,
  toast "Thanks for your feedback") | `error` (stay open, inline message).
- **Errors**: `VALIDATION_ERROR` (422, e.g. score out of 1–5) → inline;
  `CONFLICT`/`INVALID_STATE_TRANSITION` if a rating already exists for this
  order/rater pair (the contract doesn't explicitly define this as a duplicate
  guard — treat any 409 here generically per §2.4, and see API Gaps: there's no
  field on `OrderDetail` telling the client "already rated," so the Rate button
  visibility is a local-state guess after a successful submit within the same
  session — a fresh app install/reinstall can't know and may show it again
  until the server 409s).
- Rated-user's aggregate is visible elsewhere via
  `GET /api/users/{id}/ratings/summary` (e.g. on a future profile-view-other-user
  screen — not specified in this contract's screen list, so not detailed
  further here).

### 3.18 Customer — Profile

- **Purpose**: view/edit the customer's own profile.
- **Role/entry**: CUSTOMER, ProfileTab root.
- **API calls**: `GET /api/users/me` on mount/focus; `PATCH /api/users/me` on
  save.
- **Fields displayed**: `phone` (read-only), `full_name`, `email`, `rating` +
  `rating_count` (customer ratings are less prominent than a courier's but the
  field exists for both roles per the contract), `status` (only surfaced if not
  `ACTIVE`, which shouldn't normally happen post-login).
- **Inputs → request fields**: `full_name`, `email`, `dob` (date picker) — any
  subset, `PATCH` only sends changed fields.
- **Errors**: `VALIDATION_ERROR` (422, e.g. malformed email) → inline per field.
- **Logout**: `DELETE /api/devices` then `POST /api/auth/logout` then clear
  storage and route to `/auth/phone` (see §3.16).

### 3.19 Courier — Profile

- Same screen/component as §3.18, plus a read-only `rating`/`rating_count`
  summary card shown more prominently (couriers are rated on every completed
  order and this is their trust signal), and — if product wants a "verification
  status" row — note that `GET /api/users/me`'s `status` field already covers
  `ACTIVE`/`PENDING_VERIFICATION`/`BANNED`, no separate call needed.

### 3.20 Courier — MyOrdersList

- **Purpose**: the courier's own active + historical orders (accepted, not just
  radar-visible).
- **Status**: **blocked on an API gap** — see §6. No endpoint in this contract
  lists orders by assigned courier. Documented here so the screen slot exists in
  the nav tree and the gap is visible to whoever picks this spec up; do not
  build against a workaround (e.g. scraping `GET /api/orders/available` — that's
  explicitly *unassigned* orders only, and stops returning an order the instant
  this courier accepts it) as a permanent solution.

---

## 4. Journeys Covered

- ✅ Onboarding, both roles, including courier `PENDING_VERIFICATION` (§3.2–3.5)
- ✅ Customer create-order with photo upload (§3.6)
- ✅ Order tracking/detail, both roles, all statuses (§3.8)
- ✅ Invoice view + promo preview + pay, incl. gateway WebView return (§3.9)
- ✅ Courier radar + accept + author invoice (§3.10–3.11)
- ✅ Courier deliver with geofence handling (§3.12)
- ✅ Wallet: balance + top-up + history (§3.13)
- ✅ Chat: inbox + thread + WS receive + REST send + read receipts (§3.14–3.15)
- ✅ Ratings (§3.17)
- ✅ Push registration on login / removal on logout (§3.16)

---

## 5. Components Inventory

| Component | Purpose | Notes |
|---|---|---|
| `MoneyText` | Renders a decimal-string amount + currency | Never floats the string; handles the signed-amount color convention from §2.2 |
| `StatusBadge` | Small pill for order/invoice/dispute status enums | One variant per screen's status enum (order vs. invoice vs. dispute — different color maps) |
| `OrderCard` | List-row summary for OrderList/AvailableOrders/MyOrdersList | Renders `OrderSummary` fields; no coordinates |
| `PhotoUploader` | Multi-photo picker driving the upload-urls→PUT→confirm flow | Used by CreateOrder (0–3) and DeliverOrder (1–5); owns per-photo progress/error/retry state |
| `Paginator` / `useCursorPagination` | Cursor-pagination hook | Wraps "fetch next on near-end scroll, stop at `next_cursor:null`, never construct a cursor" |
| `ErrorBanner` | Error display bound to `error.code` | Central place implementing the §2.4 table so no screen reimplements branching logic |
| `OfflineBanner` | Persistent "you're offline" strip | Driven by a network-state hook (e.g. `@react-native-community/netinfo`) |
| `MapPinView` | Static (non-interactive) map showing one lat/long | Used only where the contract explicitly returns coordinates (OrderDetail post-accept) — never fed error-response data |
| `RatingStars` | 1–5 star input/display | Input mode for RatingSheet, display mode for profile/summary reads |
| `GeofenceErrorCard` | Renders `OUTSIDE_DELIVERY_GEOFENCE` specifically | Distance-only messaging, enforced at the component level to make "never show target coords" hard to get wrong ad hoc |
| `InvoiceItemsTable` | Renders invoice line items in the contract's exact field order | Shared by AuthorInvoice's live preview and InvoiceView's read view |
| `ChatBubble` | Single message, sending/sent/failed/read states | Used by ChatThread only |
| `WebviewPaymentSheet` | Wraps a payment `payment_url` WebView + return-triggered poll | Shared by InvoiceView pay and WalletHome top-up (§3.9/§3.13 both reference the same recommendation) |

### 5.1 State management

- **Server cache**: everything fetched from `/api` — orders, invoices, wallet,
  conversations/messages, user profile — belongs in a query-cache layer (React
  Query is a good fit given the cursor-pagination and refetch-on-focus patterns
  used throughout this spec; not hard-locking the choice). Cache keys should
  include the resource id and, for lists, the active filter/status so switching
  an OrderList filter chip doesn't require a manual cache-bust.
- **Local/UI state**: form drafts (CreateOrder, AuthorInvoice, DeliverOrder),
  photo-upload progress, the promo-preview strip (explicitly *not* persisted to
  the invoice until pay), and modal/sheet visibility — plain component state or
  a lightweight store (Zustand fits; not hard-locking).
- **Auth state**: access/refresh tokens live in secure storage as the source of
  truth; an in-memory auth store mirrors "is logged in / current role / current
  status" for instant nav decisions, rehydrated from secure storage + one
  `GET /api/users/me` call on cold start.
- **WebSocket connection**: owned by ChatThread's mount lifecycle — one socket
  per open thread, closed on unmount. Do **not** hold a global always-on socket
  per conversation across the whole app; the contract's per-user ~30msg/min cap
  and the "only two participants may connect" rule make a thread-scoped
  connection the simpler and correct model. Incoming messages from an open
  socket feed directly into that conversation's server-cache entry (e.g. React
  Query cache update) so ConversationList's `unread_count`/`last_message_*`
  stay in sync without a separate refetch, but *do* refetch
  `GET /api/conversations` on ConversationList's own focus as a correctness
  backstop.

---

## 6. API Gaps

Things the UI in §3 needs that this contract doesn't provide. Flagged here
instead of assumed; each screen above references back to its relevant row.

1. **No "my orders" endpoint for couriers.** `GET /api/orders` is CUSTOMER-only;
   `GET /api/orders/available` is unassigned orders only and drops an order the
   instant it's accepted. A courier has no way to list their own
   assigned/in-progress/completed order history (§3.20). Needs something like
   `GET /api/orders?role=courier` or a dedicated `GET /api/couriers/me/orders`.
2. **No participant profile lookup.** `OrderDetail` returns `customer_id` /
   `courier_id` (opaque UUIDs) and chat returns `other_user_id`, but there's no
   `GET /api/users/{id}` (only `GET /api/users/{id}/ratings/summary`, which is
   score-only). The UI can't show the other party's name/avatar anywhere —
   OrderDetail, ChatThread header, ConversationList rows all need this.
3. **No media retrieval.** The upload flow (`upload-urls` → PUT → `confirm`)
   only covers getting bytes *in*. Neither `OrderDetail` nor any other response
   in this contract returns the `request_media_keys`/`proof_media_keys` back, and
   there's no signed-GET/view-URL endpoint. The UI cannot display the gift
   request photos or delivery proof photos anywhere after upload, even though
   CreateOrder and DeliverOrder both collect them.
4. **Courier fields not echoed back.** `GET /api/users/me` doesn't return
   `city`/`national_id`/`passport_id` submitted at registration, so
   PendingVerification (§3.5) can only show what the client happened to cache
   locally at registration time, not the source of truth (irrelevant after a
   reinstall or a second device).
5. **No "already rated" signal.** Neither `OrderDetail` nor any other resource
   indicates whether the current user has already submitted a rating for an
   order, so RatingSheet's visibility (§3.17) is a best-effort local guess.
6. **No push payload schema.** The contract confirms push events exist ("new
   order nearby", "new message") and that bodies carry no sensitive content, but
   not whether they carry a routable id (`order_id` / `conversation_id`) for
   deep-linking (§3.10, §3.14). Needs confirmation before deep-link routes can
   be wired reliably instead of just opening the relevant list screen.
7. **No "verification failed" state.** `PENDING_VERIFICATION` is documented, but
   there's no rejected/needs-resubmission status in the user `status` enum
   (`ACTIVE`/`PENDING_VERIFICATION`/`BANNED` only) — if an admin rejects a
   courier application, the UI has no status to branch on for that case
   specifically (it would presumably surface as indefinite `PENDING_VERIFICATION`
   or `BANNED`, worth clarifying before build).
8. **Promo re-validation at pay time is unclear.** `promo_code` is captured when
   the courier authors the invoice (`POST .../invoices`), while
   `POST /api/promos/validate` is a customer-facing preview against an
   `order_id`, not the invoice. It's not specified whether paying an invoice
   that already has a `promo_code` re-checks the promo's live validity
   (usage caps, expiry) at pay time or only at author time — matters for
   InvoiceView's promo UI (§3.9) and worth confirming with backend before
   assuming either behavior.
