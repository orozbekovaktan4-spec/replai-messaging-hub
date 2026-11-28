# Report: Lock down admin API

## What Was Done
- `/api/admin/*` now requires an admin session (accounts from the `"Admin"` table). No session → 401, business/other session → 403.
  Exempt: `GET /api/admin/{instagram,whatsapp}/oauth/callback` (Meta redirects the browser there).
- Login sets an HttpOnly, SameSite=Lax session cookie (`replai_session`) and stores the account `type` in the session; `x-session-id` header still accepted.
- Session ids are now 256-bit random (`crypto.randomBytes`) instead of timestamp + Math.random.
- Static serving narrowed to root `*.html`, `/connections-ui.js` and `/images/`. Before, the whole repo was public, including `users.json` (password hashes), `businessSessions.json`, `connections.json` and server source.
- Removed public debug routes: `/api/test-login-direct` (password oracle), `/debug-admin-check`, `/setup-database-now` (created admin@replai.com with a default password and returned it).
- `/api/webhooks/info` (exposed verify tokens) now requires admin.
- `admin-super.html`, `business-settings.html`: redirect to `/login` on 401/403 from `/api/admin`.
- `login.html`: redirect to `/admin` by `user.type === 'admin'` instead of a hard-coded email.
- `scripts/set-admin-password.js`: set an admin password from the terminal (hidden input).

## Files Changed
- `server-new.js`, `admin-super.html`, `business-settings.html`, `login.html`, `scripts/set-admin-password.js`

## How It Was Tested
Local server on port 3999 with synthetic sessions in `sessions.json` (restored afterwards):
- admin routes: no session 401, business session 403, admin via header 200, admin via cookie 200
- OAuth callback reachable without session; `/api/webhooks/info` 401 / 200 with admin
- `/users.json`, `/businessSessions.json`, `/connections.json`, `/server-new.js`, `/package.json` → 404
- removed debug routes → 404; `/`, `/admin`, `/login`, `/business-settings.html`, `/connections-ui.js` → 200
- Not tested: a real password login (no test admin credentials locally); Google sign-in flow.

## Questions and Issues
- Default admin password `admin123` is in the repo history; change it with `scripts/set-admin-password.js`.
- Other non-`/api/admin` routes without auth were not reviewed in this change.

## Status
✅ Done
