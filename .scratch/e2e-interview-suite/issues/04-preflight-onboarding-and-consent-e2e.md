# 04-preflight-onboarding-and-consent-e2e

Status: ready-for-agent
Blocked by: 01, 03

## Context
Candidates entering an interview must navigate the statutory Pre-Flight Consent Modal under Indonesian Law No. 27/2022 (UU PDP), complete the Hardware Check, and handle the Advisory Connectivity Check before the live room opens.

## Implementation Details
1. Create `e2e/tests/onboarding.spec.ts`.
2. Scenario 1: **UU PDP Consent Opt-Out**:
   - Navigate to `/interview/e2e-token-consent-decline`.
   - Assert Pre-Flight Consent Modal is visible with UU PDP statutory notice.
   - Click "Tolak" (Decline).
   - Assert modal closes, interview terminates cleanly, informative decline message displays, and microphone is never captured.
3. Scenario 2: **Affirmative Consent & Hardware Check with Soft Bypass**:
   - Navigate to `/interview/e2e-token-soft-bypass`.
   - Click "Saya Setuju" (Affirmative Opt-In).
   - Assert transition to Hardware Check.
   - Assert synthetic microphone audio level registers on visualizer.
   - Simulate advisory connectivity warning (mock latency > 300ms) and assert Soft Bypass confirmation button appears.
   - Click Soft Bypass to confirm proceeding.
   - Click "Mulai Wawancara" (Start Interview) button.
   - Assert audio capture and playback contexts are activated within the user gesture.

## Verification
- `cd e2e && npx playwright test tests/onboarding.spec.ts`
