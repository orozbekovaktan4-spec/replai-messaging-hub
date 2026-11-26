# WhatsApp Multi-Business Integration — Analysis & Architecture

Date: 2026-11-26 · Status: analysis only, no code changed
Related: `WHATSAPP-EMBEDDED-SIGNUP-CONFIG.md`, `WHATSAPP-FIX-SUMMARY.md` (single-tenant SDK setup), `reports/INSTAGRAM-MULTI-ACCOUNT-ROOT-CAUSE.md` (same bug class on Instagram)

## ROOT CAUSE

Most of the WhatsApp OAuth code is already written, including the JS SDK Embedded Signup (`connections-ui.js`, `config_id: 893706532897953`). What's missing is any link to a **business**. Every step writes to or reads from one global slot:

| Step | Where | What it does today | Problem |
|---|---|---|---|
| UI | `admin-super.html:4045` | `connectWhatsAppOAuth()` opens `/oauth/start` popup | Uses the old URL flow. The working SDK code in `connections-ui.js` is only loaded by `admin-new.html` |
| SDK UI | `connections-ui.js:36`, `:87` | `FB.login({config_id})` → POST `/oauth/exchange` | Sends no `businessId` |
| Auth URL | `connection-manager.js:224` | `dialog/oauth` with `scope=` + `extras`, no `config_id` | Meta shows a plain login, not the WhatsApp signup screens. This path is dead |
| Exchange | `server-new.js:3735` | Sends `redirect_uri` when exchanging a JS-SDK code | SDK codes are exchanged **without** `redirect_uri`. Sending one fails with a redirect-mismatch error |
| WABA lookup | `server-new.js:3767`, `connection-manager.js:346` | `me/businesses[0]` → `owned_whatsapp_business_accounts[0]` → `phone_numbers[0]` | The same "first record" bug Instagram had (`2acc8ae`) |
| Storage | `connection-manager.js:323`, `:440`, `server-new.js:3843` | Token → `.env` + `connections.json` + `platformConnections.whatsapp` | One slot for all businesses. Render's disk is ephemeral, so it's lost on deploy |
| Routing | `server-new.js:5356` | `business = businesses[0]` | Every message gets the first business's AI context |
| Sending | `server-new.js:5129` | `platformConnections.whatsapp.token/phone_id` | Every business replies from the same number |
| Webhook delivery | nowhere | — | Nothing calls `POST /{waba_id}/subscribed_apps`, so Meta never sends a client WABA's messages to us |
| Number activation | nowhere | — | Nothing calls `POST /{phone_number_id}/register`. A new Cloud API number can't send until it is registered |

## SOLUTION ARCHITECTURE

### 1. OAuth flow: Embedded Signup via the FB JS SDK

WhatsApp does **not** use the Instagram login flow. It uses **Embedded Signup**, which runs on Facebook Login for Business. It uses the same Meta app (2031381430802139), is started with a `config_id`, and Meta's popup handles WABA creation, phone number entry and OTP itself. Keep the SDK approach that `connections-ui.js` already has, and add the business ID:

```
Front end (admin-super.html or business-settings.html — wherever the business is selected)
  1. Load https://connect.facebook.net/en_US/sdk.js; FB.init({ appId, version: 'v21.0' })
  2. window 'message' listener, origin *.facebook.com, data.type === 'WA_EMBEDDED_SIGNUP'
       event 'FINISH' → data.data = { phone_number_id, waba_id }   ← exact IDs, no guessing
       'CANCEL' / 'ERROR' → toast
  3. FB.login(cb, { config_id, response_type:'code', override_default_response_type:true,
                    extras:{ setup:{}, featureType:'', sessionInfoVersion:'3' } })
  4. POST /api/admin/whatsapp/oauth/exchange { businessId, code, signupData:{ waba_id, phone_number_id } }

Server (/oauth/exchange)
  5. GET /v21.0/oauth/access_token?client_id&client_secret&code        ← NO redirect_uri
  6. No signupData? GET /debug_token?input_token=<tok>&access_token=<APP_ID>|<APP_SECRET>
       → granular_scopes[scope=whatsapp_business_management].target_ids → wabaId(s)
       → GET /{wabaId}/phone_numbers   (>1 number → return list, let admin pick)
  7. POST /{waba_id}/subscribed_apps                         ← webhooks start flowing
  8. POST /{phone_number_id}/register { messaging_product:'whatsapp', pin }   ← ignore "already registered"
  9. GET /{phone_number_id}?fields=display_phone_number,verified_name,quality_rating
 10. prisma.business.update({ where:{ id: businessId }, data:{ whatsapp: JSON.stringify(wa) } })
```

Step 6 replaces `me/businesses[0]`: `debug_token` returns exactly the WABA(s) this user granted.

Permissions on the configuration: `whatsapp_business_management`, `whatsapp_business_messaging`.

### 2. Tokens and storage: `Business.whatsapp` (existing `String?` column, no schema change)

**Which token:** it depends on how configuration `893706532897953` was created. `WHATSAPP-EMBEDDED-SIGNUP-CONFIG.md` recommends the *"60-day token"* template:
- **60-day user token**: expires, and needs re-consent or a refresh before day 60. Avoid this.
- **System-user (business integration) token**: scoped to the client's WABA and **never expires**. It only stops working if the client removes the app. **Create a new configuration with token type "System-user access token" / expiry "Never"** and use its ID. No refresh code is then needed.

Either way, treat Graph error `190` on send as disconnected and show "Reconnect", the same way Instagram does at `server-new.js:5108`.

```json
{
  "connected": true,
  "connectedAt": "2026-11-26T10:00:00Z",
  "phoneNumberId": "1098765432101234",
  "wabaId": "2034567890123456",
  "phone": "+996 555 001 001",
  "verifiedName": "White Gold",
  "qualityRating": "GREEN",
  "accessToken": "EAAC...",
  "tokenType": "system_user",
  "tokenExpiresAt": null,
  "registrationPin": "482913",
  "phoneId": "1098765432101234"
}
```
`phone` / `phoneId` are kept because existing readers use them (`server-new.js:6040`, `:6664`). The token is stored in plaintext, the same way as Instagram's. Encrypting both is a separate task.

### 3. Webhook routing

Every Cloud API webhook includes the receiving number:

```json
{ "object": "whatsapp_business_account",
  "entry": [{ "id": "<WABA_ID>", "changes": [{ "field": "messages", "value": {
     "metadata": { "display_phone_number": "996555001001", "phone_number_id": "1098765432101234" },
     "contacts": [{ "profile": { "name": "Aibek" }, "wa_id": "996700123456" }],
     "messages": [{ "from": "996700123456", "id": "wamid.X", "type": "text", "text": { "body": "Салам" } }]
}}]}]}
```

Route on **`value.metadata.phone_number_id`**, not `entry.id`. One WABA can hold several numbers, and the phone number ID is also what we send from.

```javascript
// whatsapp branch (~5307)
platformAccountId = value?.metadata?.phone_number_id || null;
userName = value?.contacts?.[0]?.profile?.name;

// lookup (~5346) — same rule as Instagram: unknown → drop, never fall back
} else if (platform === 'whatsapp') {
  business = await db.findBusinessByWhatsAppPhoneId(platformAccountId);
  if (!business) {
    console.error(`[whatsapp] No business owns phone_number_id ${platformAccountId} — not replying`);
    return res.sendStatus(200);
  }
}
```

### 4. Meta app configuration (app 2031381430802139)

1. The **WhatsApp product** is added to the same app. One app serves both Instagram and WhatsApp.
2. **Facebook Login for Business → Configurations**: create a *WhatsApp Embedded Signup* config with a **system-user token, never expires**, and permissions `whatsapp_business_management` + `whatsapp_business_messaging`. Put its ID in env `WHATSAPP_ES_CONFIG_ID` (currently hardcoded in `connections-ui.js:36`).
3. **Allowed domains for the JS SDK**: add the Render host. `WHATSAPP-EMBEDDED-SIGNUP-CONFIG.md` lists only localhost and ngrok.
4. **Webhook**: WhatsApp → Configuration → `https://<render-host>/webhook/whatsapp`, verify token = `WEBHOOK_VERIFY_TOKEN`, subscribe the field **`messages`**. The signature is HMAC'd with **this app's secret**. The code reads `INSTAGRAM_APP_SECRET` (`:5230`), which is correct only if it equals `FACEBOOK_APP_SECRET`.
5. **Access level for real clients** (`CHECK-WHATSAPP-REVIEW-STATUS.md` says a review was submitted):
   - Business Verification of REPLAI's Meta Business portfolio
   - Advanced Access for `whatsapp_business_management` + `whatsapp_business_messaging`
   - App in Live mode, plus Tech Provider onboarding in the WhatsApp panel
   - Until then, only app admins/testers can finish Embedded Signup

## IMPLEMENTATION STEPS

### Phase A: `connection-manager.js` (`WhatsAppConnector`)
Turn it into stateless helpers. Delete the `.env`/`connections.json` writes.
```javascript
async exchangeCode(code)                       // GET oauth/access_token, no redirect_uri
async getGrantedWabaIds(token)                 // debug_token → granular_scopes target_ids
getPhoneNumbers(wabaId, token)                 // keep existing
async subscribeApp(wabaId, token)              // POST /{wabaId}/subscribed_apps
async registerNumber(phoneNumberId, token, pin)// POST /{id}/register
```
Remove `getAuthUrl` / `handleCallback` / `updateEnvFile` (dead or harmful), unless Plan B is chosen.

### Phase B: routes (`server-new.js`)
- `/api/admin/whatsapp/oauth/exchange` (`:3720`): require `businessId`, drop `redirect_uri`, run steps 5–10, and stop logging `signupData`.
- New `GET /api/admin/whatsapp/config` → `{ appId, configId }` (public values) so the front end doesn't hardcode them.
- `/api/admin/whatsapp/disconnect` (`:3880`): take `businessId` → `Business.whatsapp = {connected:false}`.
- Remove `/oauth/start` and `/oauth/callback` (`:3449`, `:3478`) and drop `platformConnections.whatsapp` writes.
- `/api/admin/connect/whatsapp` (`:3372`): change from writing to `.env` to a per-business manual connect (Plan C).

### Phase C: webhook routing: code in §3, plus `db.findBusinessByWhatsAppPhoneId` (a copy of `findBusinessByInstagramAccountId`, `db.js:67`, matching `phoneNumberId || phoneId`).

### Phase D: sending (`server-new.js:5129`)
```javascript
} else if (platform === 'whatsapp') {
  const wa = business?.whatsapp && typeof business.whatsapp === 'object' ? business.whatsapp : null;
  const phoneId = wa?.phoneNumberId || wa?.phoneId;
  const token = wa?.accessToken;
  if (!phoneId || !token) return { ok:false, platform, error:'No WhatsApp connection for this business — reconnect WhatsApp.' };
  // existing fetch to facebookGraphUrl(`${phoneId}/messages`) unchanged
}
```
`getAllBusinesses()` already parses the JSON (`db.js:425`). The text limit is 4096, so `.slice(0, 1024)` can be raised. **24h rule**: free-form replies are only allowed within 24h of the customer's last message. AI replies meet this, while outbound follow-ups need approved templates (out of scope).

### Code changes needed

| File | Change |
|---|---|
| `connection-manager.js` | `WhatsAppConnector` → 5 stateless helpers above; delete `.env`/`connections.json` writes |
| `server-new.js` | `:3720` per-business exchange; `:3880` per-business disconnect; new `/api/admin/whatsapp/config`; remove `:3449`/`:3478`; `:5307` read `metadata.phone_number_id`; `:5356` route by helper; `:5129` per-business send; `:3372` per-business manual connect |
| `db.js` | `findBusinessByWhatsAppPhoneId(id)` |
| `admin-super.html` | Port `launchWhatsAppSignup` + message listener from `connections-ui.js` inline (monolithic-HTML convention), pass `businessId`, use `/whatsapp/config` |
| `prisma/schema.prisma` | **None** |
| tests | `tests/whatsapp-routing.test.mjs`: right business per phone ID, null for unknown |

That's about 3 tasks of about 1h each: (A+B), (C+D+db+test), (UI). App Review is the long pole and runs in parallel.

## POTENTIAL BLOCKERS

1. **App Review / Business Verification pending.** *Mitigation:* add pilot owners as app **Testers**, since Embedded Signup works for them in Development mode. Plan C works with no review at all.
2. **The number is already on the WhatsApp phone app.** A number can't be on both the phone app and the Cloud API, unless Meta's *coexistence* option is offered for that number/region. *Mitigation:* ask owners for a dedicated number, or check whether coexistence is available for +996 numbers.
3. **The existing config issues 60-day tokens.** *Mitigation:* create a system-user / never-expires config (§2).
4. **No webhooks for client WABAs.** This is almost always the missing `subscribed_apps` call. *Mitigation:* step 7, plus re-subscribe in `testWhatsAppConnection` (`:2309`).
5. **Signature check uses `INSTAGRAM_APP_SECRET`.** If it differs from the WhatsApp app's secret, every webhook gets a 403. *Mitigation:* confirm on the first test message, then switch to `FACEBOOK_APP_SECRET`.
6. **New-number limits.** Unverified businesses get pending display names and a limit of about 250 business-initiated conversations/day. Inbound replies aren't affected. *Mitigation:* show `qualityRating` in the UI.

## ALTERNATIVE APPROACHES

- **Plan B: redirect popup** (matches the Instagram pattern). `https://www.facebook.com/v21.0/dialog/oauth?client_id&config_id&response_type=code&redirect_uri&state=<carries businessId>`. Exchange **with** that `redirect_uri` and resolve the WABA via `debug_token` (no `WA_EMBEDDED_SIGNUP` message in this mode). Meta documents this less for Embedded Signup, so use it only if the SDK is blocked.
- **Plan C: manual per-business connect.** The admin pastes a system-user token + `phone_number_id` from the client's own Business Manager into `Business.whatsapp`. It needs no App Review, so White Gold can go live today. Reuse the existing validate-token code (`:4830`).
- **Twilio: not for multi-tenant.** Every business still goes through Meta WABA onboarding (Twilio's sender flow wraps it), it adds a per-message markup, and it needs a second routing scheme (`To` number). Leave the existing Twilio webhook (`:1763`) as-is for legacy use only.

**Recommendation:** Meta Cloud API with Embedded Signup via the JS SDK, and Plan C for pilots until App Review passes.

## VERIFICATION STEPS

1. Unit test: the phone-ID lookup returns A for A's ID, B for B's, and null for unknown.
2. Connect White Gold → in Prisma Studio, `Business.whatsapp` has `phoneNumberId`, `wabaId`, `accessToken`, `connected:true`. `GET /{wabaId}/subscribed_apps` lists our app.
3. Connect Test Shop with a second number → its own row, and White Gold's row is unchanged.
4. Message number 1 → log shows its `phone_number_id` → White Gold's AI context, and the reply comes from number 1.
5. Message number 2 → Test Shop's context, and the reply comes from number 2.
6. Signed curl with an unknown `phone_number_id` → logged and dropped, no reply.
7. Disconnect White Gold → its messages are dropped, and Test Shop is unaffected.
8. Redeploy on Render → both connections survive (nothing in `.env`/`connections.json`).

## Questions for the human

1. Do pilot businesses have **dedicated numbers**, or are their numbers on the WhatsApp phone app? (blocker 2)
2. What is the status of the App Review / Business Verification noted in `CHECK-WHATSAPP-REVIEW-STATUS.md`?
3. Should Plan C (manual per-business connect) ship first so White Gold can go live before review?
4. Was config `893706532897953` created with the 60-day template? If so, OK to create a never-expiring system-user config?
