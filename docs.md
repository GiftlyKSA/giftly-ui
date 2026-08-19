# Giftly UI API integration and deployment guide

## What was implemented

The UI is now connected to the SAFE-GIFT backend contract in
`../giftly_backend/docs/api-4-ui.md`.

- Secure session persistence using `expo-secure-store`; access and refresh tokens are
  never written to AsyncStorage or logged.
- A shared API client with JSON handling, backend error-envelope parsing, HTTPS-only
  production URLs, a single-flight refresh-token rotation, one retry after `401
  UNAUTHORIZED`, and automatic local session removal if refresh fails.
- React Query cache management with request cancellation signals, bounded retry policy,
  and cache invalidation after mutations.
- Real phone OTP login: Saudi E.164 validation, `send-otp`, six-digit `verify-otp`,
  resend, registration-token handoff, and customer/courier registration.
- Authenticated route gating for the backend roles `CUSTOMER` and `COURIER`, including
  a courier `PENDING_VERIFICATION` screen.
- Customer Home, Orders, Create Order, Waiting, Order Tracking, Chat, and Profile are
  backed by API data where the API supports them.
- Courier Home and Courier Orders now show the backend’s available-order radar and can
  accept a request. The customer-only create-order action is hidden for couriers.
- Create Order obtains foreground location only after an explicit user action and sends
  the required city, latitude, longitude, and date to `POST /api/orders`.
- Waiting polls the created order every five seconds while active, stops automatically
  on unmount, and moves to Order Tracking when the backend reports `ASSIGNED`.
- Order Tracking loads the server order, derives its status timeline from the backend
  enum, supports cancellation where allowed, and lets customers approve delivery.
- Chat has a paged REST inbox/history, REST sends with optimistic UI, a thread-scoped
  WebSocket for incoming messages, read receipts, and socket cleanup on unmount.
- Profile loads real identity and wallet availability, supports name/email updates, and
  clears the session on logout.

The old hardcoded account, order, chat, and fixed waiting-timer flows were removed from
the integrated screens.

## Required environment variables

Create a local `.env` file. It is ignored by Git and is not pushed with the app:

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_ENVIRONMENT=development
```

`EXPO_PUBLIC_API_URL` must contain the origin only. Do not append `/api`; the client
adds `/api/...` itself. `EXPO_PUBLIC_ENVIRONMENT` must be either `development` or
`production`.

When both the UI variable is `development` and `POST /api/auth/send-otp` returns a valid
six-digit `dev_otp`, the OTP screen displays that exact code for local testing. A production
build never displays an OTP, even if a malformed or unexpected API response contains one.

Use the address appropriate for the runtime:

| Runtime | Example |
| --- | --- |
| Expo Web on the development machine | `http://localhost:8000` |
| Android emulator | `http://10.0.2.2:8000` |
| Physical device | `http://<development-computer-LAN-IP>:8000` |
| Production | `https://api.example.com` |

Production builds reject a non-HTTPS API origin. Do not add token, database, JWT, SMS,
payment, storage, or other backend secrets to the Expo environment; none belongs in a
mobile app.

## Local development

### 1. Start the backend

Follow the backend setup in `../giftly_backend/README.md`. Its documented local path is:

```powershell
cd ..\giftly_backend
uv sync
Copy-Item .env.example .env
docker compose up -d
uv run alembic upgrade head
uv run python -m app.seed
uv run uvicorn app.main:create_app --factory --reload
```

Verify it before starting Expo:

```powershell
Invoke-WebRequest http://localhost:8000/api/health
```

### 2. Run the UI

```powershell
cd ..\giftly-ui
npm ci
npx expo start -c
```

The API origin is compiled into the Expo bundle. Restart Expo after changing `.env`.

## Deployment requirements

### UI build

- Set `EXPO_PUBLIC_API_URL` to the HTTPS production API origin and
  `EXPO_PUBLIC_ENVIRONMENT=production` in the build environment.
- Keep the existing app IDs in `app.json` accurate: `com.giftly.app` for iOS and
  Android.
- The previous configuration referenced image assets that do not exist in this
  repository, so those invalid references were removed. Add real app icon, adaptive
  icon, splash, and favicon assets plus their `app.json` entries before store release.
- The app now declares an iOS foreground-location permission message through the
  `expo-location` plugin. Review this wording before App Store submission.
- Build a development/preview/production binary using the project’s chosen Expo build
  process. If using EAS, configure the project first and then run `eas build` for each
  target platform.
- Run `npx tsc --noEmit` and a manual Android/iOS smoke test against the intended API
  environment before publishing.

### Dependency-security release gate

`npm audit fix` was applied without forcing a breaking upgrade. The remaining audit
findings are transitive Expo 54/React Native 0.81 toolchain findings; the reported
automated remediation requires a breaking Expo/React Native upgrade. Do not use
`npm audit fix --force` on a release branch without a separately reviewed SDK migration.

Before a production launch, plan and validate that Expo SDK migration, then rerun the
audit and device smoke tests. The integration itself introduces no application secrets
or known audit-critical package findings after the non-breaking fixes.

### Backend production readiness

- Serve the API over HTTPS at the same origin configured in `EXPO_PUBLIC_API_URL`.
- Configure backend production secrets, database, Redis, SMS provider, payment gateway,
  object storage, and CORS as documented in `giftly_backend/.env.example` and its
  README. They must never be copied into this UI repository.
- Set production CORS origins for Expo Web and any web deployment. Native Android/iOS
  HTTP clients are not browser-CORS clients.
- Ensure the WebSocket endpoint is reachable through the production proxy:
  `wss://<host>/api/ws/conversations/{id}?token=<access_token>`.
- Preserve the backend rate-limit and request-ID headers; the UI uses API error messages
  and supports `Retry-After` from rate-limit responses.

## API coverage by screen

| UI area | Implemented endpoints |
| --- | --- |
| Login and OTP | `POST /api/auth/send-otp`, `POST /api/auth/verify-otp` |
| Registration | `POST /api/auth/register` |
| Session | `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/users/me` |
| Customer home/orders | `GET /api/orders`, `GET /api/wallets/me` |
| Courier radar | `GET /api/orders/available`, `POST /api/orders/{id}/accept` |
| Create/wait/track | `POST /api/orders`, `GET /api/orders/{id}`, `POST /api/orders/{id}/cancel`, `POST /api/orders/{id}/approve` |
| Profile | `GET/PATCH /api/users/me` |
| Chat | `GET /api/conversations`, `GET /api/conversations/{id}/messages`, `POST /api/conversations/{id}/messages`, `POST /api/conversations/{id}/read`, WebSocket receive |

## Still needed before full product release

These items are intentionally not presented as complete features because the current
screens or backend contract do not support them end-to-end yet.

- Request-photo and delivery-proof upload UI. The API supports the upload URL → S3 PUT →
  confirm sequence, but the current screens do not have image-picker/progress UI.
- Courier invoice authoring, customer invoice/payment, promo validation, wallet top-up,
  wallet transaction history, disputes, ratings, delivery proof, and push-device
  registration. The API exists; dedicated UI flows are still required.
- A courier “My Orders” list. `GET /api/orders` is customer-only and
  `GET /api/orders/available` only shows unassigned requests. The backend needs an
  assigned/history endpoint for couriers.
- Names/avatars of the other participant in Order Tracking and Chat. The backend returns
  opaque user IDs but has no participant-profile endpoint.
- Displaying uploaded request/proof photos. The API does not return media keys or signed
  read URLs in order responses.
- Product catalogue, occasions, calendar, courier schedule, performance totals, and live
  courier tracking. No matching backend endpoints currently exist, so these remain
  absent or explicitly local content rather than fake API data.
- Chat attachments. The backend currently supports text messages only.
- Deep linking from push notifications. The push payload schema does not yet guarantee
  routable `order_id` or `conversation_id` fields.

## Contract note: WebSocket authentication

The live backend route and `api-4-ui.md` use the access token in the query string for
React Native WebSocket upgrades. `docs/authentication.md` mentions a WebSocket ticket
endpoint, but that endpoint is not in the backend’s current OpenAPI contract or router.
The UI therefore uses the implemented route today. Replace it with a ticket flow once
the backend exposes and documents it.

## Validation performed

```powershell
npx tsc --noEmit
npx expo-doctor
$env:EXPO_PUBLIC_API_URL='https://api.example.test'; npx expo export --platform web --output-dir web-build
```

TypeScript, Expo Doctor, and a production-style Expo Web export pass. The generated
`web-build` output is ignored by Git. The local backend health check was unavailable
during this change, so authentication, order lifecycle, and chat need a final
end-to-end smoke test after the backend is started with its local services.
