# 03-backend-gemini-ws-seam-and-e2e-seeds

Status: ready-for-agent
Blocked by: none

## Context
Rails currently hardcodes `GEMINI_WS_URL = 'wss://generativelanguage.googleapis.com/...'` in `Gemini::LiveClient`, preventing the test environment from routing to the local Mock Gemini server. Furthermore, the test database lacks static seed data for E2E scenarios.

## Implementation Details
1. Update `api/app/clients/gemini/live_client.rb`:
   - Change `GEMINI_WS_URL` to `ENV.fetch('GEMINI_WS_URL', 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent')`.
   - In `connect`, append `?session_id=#{@session_id}` to `GEMINI_WS_URL` if `@session_id` is present, allowing mock servers to route scenarios.
2. Update `api/app/channels/audio_websocket_middleware.rb`:
   - Pass `session_id: session.id` when initializing `Gemini::LiveClient`.
3. Create `api/lib/tasks/e2e_seed.rake` (providing `rails db:seed:e2e`):
   - Clear existing E2E test data for tenant `e2e-corp`.
   - Create organization `e2e-corp` with tenant scheme `e2e-corp`.
   - Create assessment and technical vacancy with standardized B7 competencies.
   - Seed candidate sessions with dedicated tokens:
     - `e2e-token-happy-path` (status: `pending`)
     - `e2e-token-resumption` (status: `pending`)
     - `e2e-token-consent-decline` (status: `pending`)
     - `e2e-token-soft-bypass` (status: `pending`)
     - `e2e-token-live-gemini` (status: `pending`)
4. Wire `e2e/global-setup.ts` to execute `bundle exec rails db:seed:e2e` in `api/` before Playwright test execution.

## Verification
- `cd api && RAILS_ENV=test bundle exec rails db:seed:e2e`
- Verify database contains sessions for all 5 scenario tokens.
