# Report: WhatsApp Embedded Signup (per business)

Design: `reports/WHATSAPP-MULTI-BUSINESS-ARCHITECTURE.md` §1 · Builds on `reports/WHATSAPP-PLAN-C.md`

## What Was Done
The "Connect WhatsApp" button on `business-settings.html` now opens Meta's Embedded Signup popup. The owner picks or creates their business, enters the number and confirms the SMS code, and the number is connected to **that** business. No tokens to copy. The manual token form stays as a collapsed "Manual setup" fallback.

Flow:
1. On page load, the page fetches `GET /api/admin/whatsapp/config` (app ID, config ID, Graph version) and loads the Facebook JS SDK. The SDK is loaded up front because `FB.login` must run straight from the click, or the browser blocks the popup.
2. Click → `FB.login({ config_id, response_type:'code', override_default_response_type:true, extras:{ setup:{}, featureType:'', sessionInfoVersion:'3' } })`.
3. Meta posts `WA_EMBEDDED_SIGNUP` / `FINISH` with `waba_id` + `phone_number_id`. The listener only accepts it from `facebook.com` or its subdomains; it checks the exact hostname, not a loose `endsWith`.
4. `POST /api/admin/whatsapp/oauth/exchange { businessId, code, signupData }`:
   - exchanges the code **without** `redirect_uri` (the old code sent one, which fails for SDK codes);
   - if the IDs didn't arrive, gets the WABA from `debug_token` granular scopes and the number from `/{waba}/phone_numbers`. It refuses to guess when there are 0 or several, which replaces the old `me/businesses[0]` logic;
   - calls the shared `saveWhatsAppConnection()`, which checks number ownership (409), validates the token, registers the number (`POST /{id}/register` with a random PIN, kept as `registrationPin`), subscribes the app to the WABA's webhooks and saves `Business.whatsapp` with `method: 'embedded_signup'`.

## Files Changed
- `server-new.js`
  - `saveWhatsAppConnection()` helper, now shared by Plan C and Embedded Signup
  - `/oauth/exchange` rewritten per business
  - new `GET /api/admin/whatsapp/config`
  - security policy (CSP) now allows `connect.facebook.net` scripts and `*.facebook.com` frames/connections, which the FB SDK needs
  - sending accepts the older `token` field (see below)
- `business-settings.html`
  - Embedded Signup button and SDK loader
  - manual form moved into a collapsible `<details>`
  - fixed `loadPlatformConnections`: it called `JSON.parse` on objects the API had already parsed, which threw and showed every platform as "Not Connected"

## How It Was Tested
- `node --check server-new.js`: OK. `tests/whatsapp-routing.test.mjs` and `tests/instagram-page-selection.test.mjs` pass.
- Local server :3999, curl:
  - `GET /config` → app ID + config `893706532897953`
  - exchange without businessId → 400; without code → 400
  - exchange with a bogus code → 400 with Meta's own error ("Invalid verification code format."), so the call reaches Meta with the app credentials
  - manual connect for an unknown business → 404
  - CSP header includes the new Facebook sources
- Browser, White Gold's settings page: the FB SDK loads (`FB` defined, config ready), no CSP or console errors, the manual form is collapsed, and Instagram/WhatsApp status now render as "Connected" (before the fix they threw).

**Not tested:** the real popup → signup → SMS → connect round trip. It needs a person to complete Meta's popup, and the steps below.

## Found Along the Way
- **White Gold's existing `Business.whatsapp` record** is in an older format `{connected, token, phoneId, connectedAt}`. Since `c972377`, messages to that number would route to White Gold, but replies would fail because the send code read only `accessToken`. Sending now accepts `accessToken || token`. If that token or number is stale, reconnect via the new button.

## Before It Works in Production (Meta dashboard, someone with admin access)
1. **Facebook Login for Business → Settings → Allowed domains for the JavaScript SDK**: add `replai-xc95.onrender.com`. "Login with the JavaScript SDK" must be on.
2. **Configuration `893706532897953`**: check its token type. If it was made from the 60-day template, create a new *WhatsApp Embedded Signup* configuration with **system-user token, never expires** and set `WHATSAPP_ES_CONFIG_ID` in Render.
3. **WhatsApp → Configuration → Webhook**: `https://replai-xc95.onrender.com/webhook/whatsapp`, `messages` field subscribed.
4. Until Advanced Access / Business Verification are approved, the person doing the signup must have a role on the app (Admin/Developer/Tester).
5. Render env: `FACEBOOK_APP_ID`/`FACEBOOK_APP_SECRET` or the `INSTAGRAM_*` equivalents (same app). The server uses whichever is set.

## Questions and Issues
- `admin-super.html`'s global WhatsApp card, `connections-ui.js` (admin-new.html) and `/oauth/start`/`/oauth/callback` (which still write `.env`) are untouched. `connections-ui.js` now gets "businessId is required" from `/oauth/exchange` instead of silently connecting globally.
- Tokens and the registration PIN are stored in plaintext in `Business.whatsapp`, the same as Instagram.

## Status
✅ Done (pending Meta dashboard steps and one real signup)
