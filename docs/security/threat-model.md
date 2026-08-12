# Chat app prototype threat model

Protected assets are AI provider credentials, conversation content, proxy authorization,
device-local message state, and user-selected media. Mobile input, model output, proxy
requests, deep links, and external media metadata are untrusted.

Required controls:

- Keep provider SDKs and secrets in the loopback/server proxy; the mobile bundle may hold
  only the non-secret proxy URL.
- Validate, authenticate, rate-limit, size-limit, and time-bound proxy requests and model
  responses; do not expose raw provider errors to the app.
- Keep conversations, tokens, provider responses, and stable identifiers out of logs,
  fixtures, analytics, and crash reports.
- Cancel in-flight responses on navigation/unmount and verify the conversation identity
  before applying results.
- Keep explicit mock/test mode independent of live network access.

Update this model when persistence, accounts, live AI, media, telemetry, or a deployable
proxy is introduced or changed.
