# Report: WhatsApp Plan C (manual per-business connect)

Design: `reports/WHATSAPP-MULTI-BUSINESS-ARCHITECTURE.md` (Plan C + Phases C/D)

## What Was Done
Each business can now connect its own WhatsApp number by pasting a token, and messages route and reply per business:

- **Connect** `POST /api/admin/connect/whatsapp` `{ businessId, token, phone_id, waba_id? }`
  - Validates input. Refuses a number that's already connected to another business (409).
  - Checks the token against `GET /{phone_id}`.
  - If `waba_id` is given, calls `POST /{waba_id}/subscribed_apps` so Meta delivers webhooks.
  - Saves to `Business.whatsapp`. It no longer writes `.env` or global state.
- **Disconnect** `POST /api/admin/whatsapp/disconnect` with `businessId` sets `Business.whatsapp = {connected:false}`. Without a `businessId` it keeps the old global behaviour (still used by `connections-ui.js`).
- **Webhook routing** reads `value.metadata.phone_number_id` and finds the owning business. An unknown number is logged and dropped. The `businesses[0]` fallback is gone for WhatsApp; Telegram still has it.
- **Sending** uses the business's own `phoneNumberId` + `accessToken`, not `platformConnections.whatsapp`.
- **UI** (`business-settings.html`): the WhatsApp card has a Token / Phone Number ID / WABA ID form, the same pattern as Telegram. It hides once connected.

## Files Changed
- `server-new.js`: connect endpoint rewritten; disconnect made per-business; webhook routing; per-business send
- `db.js`: added `pickBusinessByWhatsAppPhoneId` (pure) and `findBusinessByWhatsAppPhoneId`
- `business-settings.html`: credential form, `connectWhatsApp()`, disconnect sends `businessId`, form show/hide made generic
- `tests/whatsapp-routing.test.mjs`: new routing self-check

## How It Was Tested
- `node tests/whatsapp-routing.test.mjs`: passes (each number goes to its own business; unknown, disconnected or empty → null; legacy `phoneId` still routes)
- `node --check server-new.js`: OK
- Local server on :3999 against the configured DB, with curl:
  - missing businessId → 400; non-numeric phone_id → 400; non-numeric waba_id → 400
  - unknown business → 404 (connect and disconnect)
- Browser: business-settings.html loads with the new form and no console errors

**Not tested:** a real connect with a Meta token, and a live webhook → reply round trip. Both need real WhatsApp credentials and a signed Meta webhook.

## Questions and Issues
- To go live, White Gold needs from its Meta Business Manager: a system-user token with `whatsapp_business_messaging` + `whatsapp_business_management`, the phone number ID, and the WABA ID.
- The Meta app's WhatsApp webhook must point to `https://<render-host>/webhook/whatsapp` with the `messages` field subscribed. Signature validation uses `INSTAGRAM_APP_SECRET`, so it must be this app's secret.
- The token is stored in plaintext in `Business.whatsapp`, the same as Instagram.
- `admin-super.html`'s global WhatsApp card and the `/whatsapp/oauth/*` routes are untouched (Embedded Signup work comes later).

## Status
✅ Done (pending live test with real credentials)
