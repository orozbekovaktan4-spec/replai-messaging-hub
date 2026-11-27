# Report: Stop admin API from returning platform tokens

## What Was Done
`GET /api/admin/businesses/:id` returned each business's raw Instagram / Telegram / WhatsApp connection data to anyone, with no login. That data includes access tokens, bot tokens and the WhatsApp registration PIN. The route uses `optionalAuth`, which only logs a warning. The exposure was confirmed in production by checking only whether a token was present, never printing it.

Added `redactBusinessSecrets()` in `server-new.js`. It copies the business row and removes these keys from each platform connection: `accessToken`, `token`, `botToken`, `pageAccessToken`, `userAccessToken`, `refreshToken`, `registrationPin`, `appSecret`, `clientSecret`, `webhookSecret`. It keeps the original format (JSON string or object). It is applied to all four responses that return a whole business row:
- `GET /api/admin/businesses/:id`
- `PUT /api/admin/businesses/:id`
- both create-business responses

The stored data is untouched; the server still reads tokens from the database when it sends messages.

## Files Changed
- `server-new.js`: added the helper and wrapped the four responses
- `reports/REDACT-BUSINESS-SECRETS.md`: this report

## How It Was Tested
- `node --check server-new.js`: OK. `tests/whatsapp-routing.test.mjs` and `tests/instagram-page-selection.test.mjs` pass.
- Helper self-check on made-up data:
  - secrets removed from both string and object connections
  - invalid JSON becomes `null`
  - the original row is unchanged
- Local server :3999: `GET /api/admin/businesses/:id` for `biz_001` and `biz_mvnmkhjl_ug62` shows every platform still `connected: true` with no secret keys left.
- Browser: `business-settings.html?id=biz_001` shows Instagram, Telegram and WhatsApp as Connected, with no console errors. The page only reads `connected`, `username`, `botName` and `phone`, and its save request never sends platform data back, so tokens can't be wiped.

## Questions and Issues
- **Still open (not fixed here):** the admin routes have no real login.
  - `optionalAuth` lets everyone through.
  - `requireAdminAuth` is never used and can't work yet, because nothing sets `req.session`.
  - So anyone can still call `PUT /api/admin/businesses/:id` and overwrite a business's connections, or call the connect and disconnect endpoints.
  - Fixing this needs a real admin login and a design decision.
- Every token that was stored before this deploy should be treated as exposed. In particular, rotate White Gold's old WhatsApp token (record `biz_mwx769nd_9da5`) and the Instagram and Telegram tokens.

## Status
✅ Done (not yet deployed)
