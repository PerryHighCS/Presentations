# Proposal: Inline Activity And Session Services For SyncDeck

## Summary

SyncDeck already supports embedded activities by letting Reveal decks declare launch intent with `data-activity-*` attributes. The host then owns activity lifecycle, session creation, and participant relay.

This proposal extends that same philosophy to activities that are authored directly inside a presentation. Deck-local JavaScript should be able to opt into SyncDeck session services without becoming responsible for networking, participant discovery, persistence, or host orchestration.

The goal is to support a spectrum of classroom interactions:

- local-only student activities that survive reloads
- shared activities where students exchange or submit events
- instructor-visible progress and checkpoints
- instructor-controlled shared state such as timers, phases, random seeds, or released challenges
- eventual dashboard views for activity progress and shared classroom state

## Motivation

Course decks increasingly include JavaScript interactions directly in the presentation. For example, a cybersecurity deck might include a public/private key lab where students drag keys, encrypt messages, verify signatures, and receive step-by-step feedback.

Some of these interactions should remain private and local to each student. Others would benefit from session awareness:

- a timer should start, pause, resume, and finish at the same time for instructor and students
- an instructor might broadcast a challenge prompt to all students
- students might submit an encrypted or signed response
- a paired activity might allow students to exchange public keys or messages
- the instructor might want aggregate progress such as "24 of 29 students completed step 2"
- late joiners or refreshed browsers should restore the current activity state

Without a shared SyncDeck service layer, each deck-local activity must either remain isolated or invent its own messaging scheme. That creates duplicated logic and inconsistent behavior across courses.

## Design Principles

1. Decks describe intent; the host owns orchestration.
2. Inline activity APIs should be generic and activity-agnostic.
3. Activities must continue to work in standalone Reveal preview mode.
4. Local student state and shared classroom state should be clearly separate.
5. Timers and other shared state should sync canonical state, not high-frequency UI updates.
6. The protocol should use stable activity identity based on `deckId`, `activityId`, and `instanceKey`.
7. The host should decide routing, persistence, permissions, and dashboard display.
8. Existing embedded activity contracts should remain unchanged.

## Proposed Concept

Add a browser API exposed by the SyncDeck Reveal runtime:

```js
window.SyncDeckSession
```

This API would sit above the existing `RevealIframeSyncAPI.sendCustom(...)` mechanism and provide deck authors with small, structured services.

At a high level:

- inline activities register themselves with the host
- activities can store local state
- activities can emit progress or shared events
- activities can subscribe to host-relayed events or state updates
- shared utilities, especially timers, can be controlled by the instructor and rendered consistently across all participants

## Example Authoring API

### Register An Inline Activity

```js
const keyLab = SyncDeckSession.activities.register({
  activityId: 'public-private-key-lab',
  instanceKey: 'public-private-key-lab:6:0',
  title: 'Public/Private Key Lab',
  visibility: 'instructor',
  capabilities: ['localState', 'progress', 'sharedEvents']
});
```

The runtime should derive useful defaults when possible:

- `deckId` from the current iframe sync config
- `indices` from `Reveal.getIndices()`
- `instanceKey` from `activityId:h:v` if not supplied

### Local Student State

```js
keyLab.local.set({
  selectedStep: 'decrypt-response',
  completedSteps: ['encrypt-message'],
  attempts: {
    'encrypt-message': 2
  }
});

keyLab.local.onRestore((state) => {
  restoreKeyLabUi(state);
});
```

Local state is private to the student by default. The host may persist it for restore, but it should not be broadcast to classmates.

### Progress Events

```js
keyLab.progress.emit({
  checkpoint: 'encrypt-message',
  status: 'complete'
});
```

The host can aggregate this for instructor-facing views.

### Shared Activity Events

```js
keyLab.events.send('message-submitted', {
  ciphertext: 'Q7F2-19AC',
  signed: true
});

keyLab.events.on('challenge-broadcast', (event) => {
  renderChallenge(event.payload);
});
```

The host decides whether events go to:

- instructor only
- all students
- a group
- a specific partner
- no one, if the current role is not allowed

### Shared Timers

```js
const timer = SyncDeckSession.timers.get('discussion-timer');

timer.start({
  durationMs: 180000,
  label: 'Partner discussion'
});

timer.onChange((state) => {
  renderTimer(state);
});
```

Timer state should sync canonical timestamps rather than remaining seconds:

```json
{
  "id": "discussion-timer",
  "status": "running",
  "startedAt": 1778240000000,
  "durationMs": 180000,
  "pausedAt": null,
  "accumulatedPausedMs": 0,
  "serverNow": 1778240060000
}
```

Each iframe computes display time locally from the canonical state. This keeps students aligned without sending updates every second.

## Proposed Message Types

These would be host-facing messages sent through the existing `reveal-sync` envelope.

### `inlineActivityReady`

Sent when an inline activity registers.

```json
{
  "type": "reveal-sync",
  "action": "inlineActivityReady",
  "deckId": "protecting-data",
  "role": "student",
  "payload": {
    "activityId": "public-private-key-lab",
    "instanceKey": "public-private-key-lab:6:0",
    "title": "Public/Private Key Lab",
    "indices": { "h": 6, "v": 0, "f": -1 },
    "capabilities": ["localState", "progress", "sharedEvents"]
  }
}
```

### `inlineActivityEvent`

Sent when deck-local code emits an event.

```json
{
  "type": "reveal-sync",
  "action": "inlineActivityEvent",
  "deckId": "protecting-data",
  "role": "student",
  "payload": {
    "activityId": "public-private-key-lab",
    "instanceKey": "public-private-key-lab:6:0",
    "event": "message-submitted",
    "scope": "instructor",
    "payload": {
      "ciphertext": "Q7F2-19AC",
      "signed": true
    }
  }
}
```

### `inlineActivityLocalState`

Sent when a student activity updates private restore state.

```json
{
  "type": "reveal-sync",
  "action": "inlineActivityLocalState",
  "deckId": "protecting-data",
  "role": "student",
  "payload": {
    "activityId": "public-private-key-lab",
    "instanceKey": "public-private-key-lab:6:0",
    "state": {
      "completedSteps": ["encrypt-message"]
    }
  }
}
```

### `sessionSharedStateSet`

Sent when authorized deck code requests an update to shared state.

```json
{
  "type": "reveal-sync",
  "action": "sessionSharedStateSet",
  "deckId": "protecting-data",
  "role": "instructor",
  "payload": {
    "key": "timer:discussion-timer",
    "value": {
      "status": "running",
      "startedAt": 1778240000000,
      "durationMs": 180000,
      "pausedAt": null,
      "accumulatedPausedMs": 0
    }
  }
}
```

### `sessionSharedState`

Sent by the host to iframes when shared state changes or when a participant joins late.

```json
{
  "type": "reveal-sync",
  "action": "command",
  "payload": {
    "name": "sessionSharedState",
    "key": "timer:discussion-timer",
    "value": {
      "status": "running",
      "startedAt": 1778240000000,
      "durationMs": 180000,
      "pausedAt": null,
      "accumulatedPausedMs": 0,
      "serverNow": 1778240060000
    }
  }
}
```

## Permissions And Routing

The host should enforce routing and mutation rules. Suggested defaults:

| Capability | Instructor | Student |
| --- | --- | --- |
| Register inline activity | yes | yes |
| Write local private state | yes | yes |
| Emit progress | yes | yes |
| Read aggregate progress | yes | no |
| Start/pause/reset shared timer | yes | no, unless delegated |
| Read shared timer | yes | yes |
| Broadcast event to all | yes | no, unless delegated |
| Submit event to instructor | yes | yes |
| Send peer/group event | configurable | configurable |

Deck authors should be able to request a scope, but the host should be authoritative.

Suggested event scopes:

- `local`
- `instructor`
- `all`
- `group`
- `partner`
- `host`

## Privacy And Safety

Inline activities may collect student work or behavior. The API should make data classification explicit:

- local private state
- progress metadata
- student submission
- shared classroom state
- instructor broadcast

The host should avoid broadcasting private local state. Student submissions should be routed according to host policy, and dashboard displays should distinguish aggregate progress from visible student work.

## Standalone Behavior

Decks must still run outside SyncDeck, including direct browser preview and VS Code preview.

In standalone mode:

- `SyncDeckSession` may exist as a no-op/local-only shim
- local state can use in-memory storage or browser storage if enabled by the deck
- shared events should not throw errors
- timers can run locally
- methods should return predictable results such as `{ supported: false }` or resolve without network effects

Example:

```js
if (!SyncDeckSession.supported) {
  startLocalTimer();
}
```

## Relationship To Embedded Activities

This proposal does not replace the existing embedded activity flow.

Embedded activities should continue to use:

- `data-activity-id`
- `data-activity-trigger`
- `data-activity-options`
- `activityRequest`
- host-owned launch and child session lifecycle

Inline activity services are for interactions that live inside the Reveal deck itself. They are useful when the activity is small, tightly coupled to slide content, or does not need a full separate ActiveBits app.

## Candidate Use Cases

### Synchronized Timers

Deck-authored timers can be controlled by the instructor and displayed consistently across instructor and student views.

Important implementation detail: sync timer state, not per-second ticks.

### Public/Private Key Lab

Local mode:

- student drags keys
- student sees local feedback
- local progress restores after reload

Shared mode:

- instructor sees aggregate progress
- instructor broadcasts a message to encrypt or verify
- students submit encrypted or signed artifacts
- optional partner mode exchanges public keys or challenge messages

### Warm-Up And Exit Ticket Widgets

For quick prompts that do not need the full embedded Resonance activity flow, deck-local code can collect lightweight status or short responses.

### Student-Controlled Simulations

Students can manipulate local parameters while the instructor sees completion or checkpoint signals.

### Released Challenge Phases

The instructor can move a class through shared phases:

- setup
- attempt
- discuss
- reveal
- debrief

Each phase is shared state, and deck UI can respond to phase changes.

## Implementation Roadmap

### Phase 1: Thin Runtime API Over Existing Custom Messages

- Add `SyncDeckSession.activities.register(...)`.
- Add `activity.events.send(...)`.
- Add `activity.events.on(...)`.
- Add basic host-relayed message routing.
- Provide a standalone no-op/local shim.

This phase can be implemented mostly as a convenience layer over `RevealIframeSyncAPI.sendCustom(...)`.

### Phase 2: Local State And Late Join Restore

- Add private local state persistence.
- Add host restore on reload or reconnect.
- Add versioned state envelopes.
- Add limits for payload size and update frequency.

### Phase 3: Shared State And Timers

- Add `SyncDeckSession.shared`.
- Add `SyncDeckSession.timers`.
- Use canonical timestamp-based timer state.
- Add instructor-only mutations by default.

### Phase 4: Instructor Dashboard Integration

- Display registered inline activities by slide.
- Show aggregate progress.
- Show timer controls.
- Show submitted artifacts when activities opt in.

### Phase 5: Groups And Partner Routing

- Add group and partner addressing.
- Support host-assigned pairing.
- Add instructor controls for routing and visibility.

## Open Questions

1. Should inline activity registration be declared in HTML, JavaScript, or both?
2. Should local private state persist across sessions, or only within one live SyncDeck session?
3. How should payload size and update frequency be limited?
4. Should students ever be allowed to mutate shared state directly?
5. Should timer control be globally available in the host UI, deck-local only, or both?
6. How should grouped or paired activities map to existing SyncDeck session membership?
7. Should inline activity submissions reuse any existing embedded activity reporting model?
8. What dashboard affordances are needed for the first useful release?

## Recommended First Slice

Build the smallest useful slice around timers and progress:

1. Expose `SyncDeckSession.activities.register(...)`.
2. Expose `activity.progress.emit(...)`.
3. Expose `SyncDeckSession.timers.get(id)`.
4. Support instructor-controlled timer start, pause, resume, and reset.
5. Restore timer state for late joiners.
6. Keep student timer display read-only by default.

This provides immediate classroom value and validates the session-service architecture before adding peer messaging or richer activity submissions.

