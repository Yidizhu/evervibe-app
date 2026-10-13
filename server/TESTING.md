# Offline server checks

From the repository root, with Node.js 22.13 or newer and dependencies installed:

```sh
node scripts/bundle-runtime.mjs
node server/run-tests.mjs
```

The runner invokes the standard `node --test` runner with an explicit file list,
so it works without shell glob expansion on Windows or POSIX systems.
The suite uses provider fixtures, blocks default `fetch`, and needs no API keys,
local environment file, online account, or network access. The Worker checks apply
the committed D1 migration to an in-memory SQLite database. No hosted database is
modified. The bundled runtime must be regenerated after changing `server/source`.
An additional Miniflare/workerd check runs the actual cloud route in the Workers
runtime, using fake bindings and intercepting every outbound request locally.
It verifies provider calls across incoming requests and rejects redirects without
following them. Workers supports `redirect: 'manual'`, not `redirect: 'error'`.

Coverage includes Qloo entity identity/type validation; controlled geographic and
cultural filters; both participants' selected interests; private/group separation;
the gated EVE suggestion bridge; cancellation and sanitized provider errors;
same-origin requests, body bounds and short rolling-window protection; and D1
catalog reuse across independent service instances.

The current suite contains 105 checks, including separate A/B compare signals,
shared-tag parsing, cache expiry and invalidation, shared tags entering insights,
consent and cancellation, honest empty/outage states and verified-candidate fallback
when the final Gemini explanation has a transient failure.

Only validated public Qloo entity facts and expiry timestamps are persisted in D1.
Chat, notes and relationship progress are not saved there. Story plans are held in
memory for 30 minutes: ordinary shared chat can continue after expiry and clears
its old plan reference; a direct lookup returns `PLAN_EXPIRED` so the interface can
ask for fresh options.

This is a single-browser demo with fictional partners. Its share/receive controls
are visitor-provided session choices, not independently authenticated permissions
from two real account holders. There is no endpoint that retrieves another real
user's profile or private conversation. A multi-account product would need account
identity and server-owned relationship permissions before reusing this flow.

Try follow-ups use a short-lived, purpose-signed reference to verified public candidate facts. Checks cover signature/type/scope/expiry validation, cross-instance recovery, no private notes or conversation in the signed payload, ordinary follow-ups without a new Qloo lookup, explicit replacement, and retained cancellation/participation gates. The proof establishes catalog provenance, not authentication of either demo participant.
