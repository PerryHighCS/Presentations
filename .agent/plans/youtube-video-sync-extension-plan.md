# YouTube Video Slide Sync Extension Plan

## Status Snapshot (2026-02-28)
- Planned now:
  - Add a reusable shared runtime extension for YouTube-backed Reveal slides.
  - Extend `reveal-iframe-sync.js` and its message schema for host-authoritative video playback sync.
  - Document authoring and host relay expectations in repo docs.
- Not started:
  - Shared runtime implementation in `vendor/SyncDeck-Reveal/js/`
  - Sync protocol changes for YouTube commands/events
  - Example deck integration and browser validation

## Summary
Create a reusable Reveal.js extension in the shared runtime submodule that allows a deck author to declare YouTube-backed slides and have playback stay synchronized between instructor and student iframes. The implementation should follow the existing `reveal-iframe-sync.js` contract: host-authoritative control flows downward as commands, while iframe runtime emits state upward for relay, recovery, and drift correction.

## Goal
Add a generalized YouTube video slide capability that:
- lets deck authors declare one or more YouTube slides without custom per-deck sync logic
- keeps students in sync with instructor playback
- preserves the current instructor/student role model and host-mediated `postMessage` architecture
- degrades safely when the YouTube API is unavailable or autoplay is blocked

## Scope
In scope:
- shared runtime/plugin work in `vendor/SyncDeck-Reveal/js/reveal-iframe-sync.js`
- new shared YouTube slide helper/plugin in the same submodule
- message schema updates in `vendor/SyncDeck-Reveal/js/reveal-iframe-sync-message-schema.md`
- repo docs updates in `AGENTS.md`
- one example deck integration for validation

Out of scope:
- generic support for Vimeo or arbitrary HTML5 video in the first pass
- peer-to-peer iframe sync without the host as relay
- student-local playback controls
- playlist support or multi-video composition on a single slide unless a clear need appears during implementation

## Product Decisions Locked
- Plan path uses `.agent/plans`, not `.agents/plans`, because that is the repo's current convention.
- Sync model is host-authoritative.
- Student viewers have no local playback control.
- `standalone` mode keeps normal local playback control because there is no host authority to defer to.
- The extension is reusable shared runtime code, not a one-off deck-specific script.

## Proposed Architecture

### 1. Add a shared YouTube slide runtime
Create a new shared script in the submodule:
- `vendor/SyncDeck-Reveal/js/reveal-youtube-sync.js`

Responsibilities:
- discover YouTube-enabled slide elements from declarative markup
- lazy-load the YouTube IFrame Player API once
- create and manage `YT.Player` instances only for declared slide containers
- expose a small runtime API on `window` for `reveal-iframe-sync.js` to call
- emit normalized local playback events only when the iframe role is `instructor`
- leave the player fully locally interactive when the runtime role is `standalone`

Recommended public runtime shape:
```js
window.RevealYoutubeSync = {
  init(options) {},
  getStatus() {},
  applyCommand(command) {},
  destroy() {}
};
```

### 2. Use declarative slide markup
Standardize deck authoring on a data-attribute contract rather than custom JS per deck.

Recommended minimal slide markup:
```html
<section
  data-youtube-video-id="VIDEO_ID"
  data-youtube-start="0"
  data-youtube-end=""
  data-youtube-autoplay="false"
  data-youtube-muted="false"
  data-youtube-caption="Optional title"
>
  <div class="slide-inner">
    <h2>Demo Video</h2>
  </div>
</section>
```

Rules:
- one authoritative YouTube player per slide in v1
- `data-youtube-video-id` is required
- `start`, `end`, `autoplay`, and `muted` are optional
- add an optional per-slide student-audio policy, for example `data-youtube-student-muted="true"`
- the runtime should auto-create a default `.youtube-slide-shell` and `.youtube-player-slot` inside `.slide-inner` when the author has not provided one
- if an author provides `.youtube-player-slot` explicitly, the runtime should reuse it rather than creating a duplicate
- deck authors do not embed raw YouTube iframes directly for synced slides
- deck authors should only need to declare YouTube behavior on the `<section>` unless they want custom layout control

### 3. Extend iframe sync protocol
Add explicit video commands/events rather than overloading `setState`.

New host -> iframe commands:
- `youtubeLoad`
- `youtubePlay`
- `youtubePause`
- `youtubeSeek`
- `youtubeSyncState`

Recommended payload shapes:
```json
{ "name": "youtubeLoad", "payload": { "slide": { "h": 3, "v": 0, "f": -1 }, "videoId": "abc123", "startSeconds": 12, "autoplay": false } }
```

```json
{ "name": "youtubePlay", "payload": { "slide": { "h": 3, "v": 0, "f": -1 }, "at": 12.4, "issuedAt": 1760000000000 } }
```

```json
{ "name": "youtubePause", "payload": { "slide": { "h": 3, "v": 0, "f": -1 }, "at": 19.1 } }
```

```json
{ "name": "youtubeSeek", "payload": { "slide": { "h": 3, "v": 0, "f": -1 }, "to": 42.0, "autoplay": true, "issuedAt": 1760000000000 } }
```

```json
{ "name": "youtubeSyncState", "payload": { "slide": { "h": 3, "v": 0, "f": -1 }, "videoId": "abc123", "playerState": "playing", "currentTime": 42.0, "muted": false, "seq": 17, "issuedAt": 1760000000000 } }
```

```json
{ "name": "youtubeSetMuted", "payload": { "slide": { "h": 3, "v": 0, "f": -1 }, "muted": true, "scope": "student" } }
```

New iframe -> host events:
- `youtubeReady`
- `youtubeState`
- `youtubeEnded`
- `youtubeError`

Recommended upward event payload:
```json
{
  "slide": { "h": 3, "v": 0, "f": -1 },
  "videoId": "abc123",
  "playerState": "playing",
  "currentTime": 42.0,
  "duration": 120.5,
  "muted": false,
  "seq": 17
}
```

Protocol rules:
- only instructor iframes emit authoritative `youtubeState`
- students never emit authoritative playback changes
- host relays instructor-originated video state to students
- a monotonically increasing `seq` prevents stale state from overriding newer commands
- student mute policy must be relayable independently of play/pause/seek so the host can enforce silent synchronized playback when configured

### 4. Define sync behavior precisely
Instructor side:
- when entering a YouTube slide, initialize/load the player if needed
- if slide config says `autoplay=true`, start playback and emit state
- on local play/pause/seek/end, emit normalized `youtubeState` upward
- send periodic state heartbeats while playing, recommended every 1-2 seconds
- suppress duplicate emissions caused by remote command application

Student side:
- local controls are disabled or overlaid
- apply host-relayed video commands
- apply host-relayed mute policy when synchronous playback is configured to mute student audio
- on `youtubePlay`, seek if drift exceeds threshold, then play
- on `youtubePause`, pause and snap to authoritative time if drift exceeds threshold
- on `youtubeSyncState`, correct drift if absolute delta exceeds threshold
- recommended drift correction threshold: `0.75s`
- recommended stale command rejection: ignore commands with lower `seq`

Standalone side:
- local controls remain enabled
- no host sync commands are required or expected
- local play/pause/seek should not be blocked by sync guardrails intended for `student` role
- the helper should still provide the same player lifecycle behavior on slide enter/leave

### 5. Integrate with slide lifecycle
Behavior on Reveal events:
- `slidechanged`:
  - if leaving a YouTube slide, pause that slide's player
  - if entering a YouTube slide, ensure the correct player is mounted and synchronized
  - instructor emits an immediate `youtubeState` snapshot after slide activation
- `fragmentshown` / `fragmenthidden`:
  - no-op unless later requirements tie video behavior to fragments
- `setRole`:
  - instructor role should publish current video state if currently on a YouTube slide
  - student role should lock local controls and wait for host state
- `setState` / `slide` commands:
  - after deck navigation completes, the YouTube helper should reconcile the active slide's media state from host data

### 6. Handle host responsibilities explicitly
The existing host/container implementation is outside this repo, but the plan must define the expected contract.

Host relay/storage model:
- maintain per-session `youtube` state alongside existing chalkboard buffers
- latest authoritative video state shape:
```js
session.youtube = {
  slideKey: '3/0/-1',
  videoId: 'abc123',
  playerState: 'paused',
  currentTime: 42.0,
  muted: false,
  studentMuted: true,
  seq: 17,
  issuedAt: 1760000000000
};
```
- when instructor sends `youtubeState`, replace stored state if `seq` is newer
- when a student iframe becomes ready or is promoted to `student`, host sends the latest `youtubeSyncState` for the active slide
- when student mute policy is enabled, host also sends `youtubeSetMuted` or includes equivalent `studentMuted` state on resync
- host may translate container UI actions into `youtubePlay` / `youtubePause` / `youtubeSeek`

### 7. Accessibility and UX defaults
- provide a visible poster/loading state before player readiness
- expose slide-level caption/title text for non-visual context
- disable pointer interaction on student players via overlay or API-level control policy
- keep pointer and keyboard interaction available in `standalone` mode
- preserve keyboard navigation for Reveal itself
- do not rely on autoplay with sound; expect browser autoplay restrictions
- if autoplay is blocked, instructor sees a recoverable ready state and manual play becomes authoritative
- when student mute is enabled, communicate clearly in docs that muted student playback is intentional sync policy rather than player failure

## Public Interfaces and Docs To Add or Change

### New shared script
- `vendor/SyncDeck-Reveal/js/reveal-youtube-sync.js`

### Updated plugin command surface
Update `vendor/SyncDeck-Reveal/js/reveal-iframe-sync.js` to recognize:
- `youtubeLoad`
- `youtubePlay`
- `youtubePause`
- `youtubeSeek`
- `youtubeSyncState`
- `youtubeSetMuted`

### Updated message schema doc
Update `vendor/SyncDeck-Reveal/js/reveal-iframe-sync-message-schema.md` with:
- new command names
- payload examples
- new upward event types
- host buffering/relay expectations
- sequencing and drift-correction rules

### Updated authoring docs
Update `AGENTS.md` to document:
- minimal YouTube slide markup on the `<section>`
- optional explicit `.youtube-player-slot` override for custom layout
- required script include order
- initialization snippet
- autoplay and control restrictions
- optional student mute behavior for synchronized playback
- host relay expectations

Update `.claude/skills/slidedeck/SKILL.md` to document:
- a YouTube slide is declared by `data-youtube-*` attributes on the `<section>`
- authors should not hand-write raw YouTube iframes for synced slides
- the runtime auto-inserts `.youtube-slide-shell` and `.youtube-player-slot` by default
- authors may provide `.youtube-player-slot` explicitly when they need custom placement

## Actionable Checklist

### Phase 1: Design and contract
- [ ] Confirm final filename and store this plan at `.agent/plans/youtube-video-sync-extension-plan.md`.
- [ ] Add a short "Status Snapshot" header to the plan file, matching existing plan style.
- [ ] Specify final declarative HTML contract for YouTube slides.
- [ ] Specify default auto-generated player-slot behavior and the optional explicit slot override.
- [ ] Specify final message names and payload schemas.
- [ ] Specify drift-correction, sequencing, and autoplay fallback rules.
- [ ] Specify how student mute is configured and how it is represented in sync payloads.

### Phase 2: Shared runtime
- [ ] Add `reveal-youtube-sync.js` in the submodule.
- [ ] Implement one-time YouTube IFrame API loader.
- [ ] Implement slide discovery by `data-youtube-*` attributes.
- [ ] Implement automatic insertion of `.youtube-slide-shell` and `.youtube-player-slot` for YouTube slides that do not provide a custom slot.
- [ ] Implement player registry keyed by Reveal slide indices.
- [ ] Implement active-slide attach/load/pause lifecycle.
- [ ] Implement student control lockout.
- [ ] Preserve full local controls in `standalone` mode.
- [ ] Implement role-aware mute handling so student playback can be forced muted when configured.
- [ ] Implement normalized status reporting API for the sync plugin.

### Phase 3: Sync plugin integration
- [ ] Extend command handling in `reveal-iframe-sync.js` for YouTube commands.
- [ ] Wire instructor-originated YouTube events to upward `postMessage`.
- [ ] Apply remote YouTube commands on student iframes without feedback loops.
- [ ] Emit current YouTube state on instructor role promotion and active YouTube slide entry.
- [ ] Relay and reapply student mute policy during initial sync and mid-session changes.
- [ ] Ensure navigation away from a YouTube slide pauses playback cleanly.

### Phase 4: Documentation and examples
- [ ] Update `reveal-iframe-sync-message-schema.md` with new commands/events and host examples.
- [ ] Update `AGENTS.md` with authoring instructions and architectural constraints.
- [ ] Update `.claude/skills/slidedeck/SKILL.md` so generated decks use the section-only YouTube authoring contract by default.
- [ ] Add or update one example deck showing a synced YouTube slide.

### Phase 5: Validation
- [ ] Validate standalone deck behavior with a YouTube slide and no host.
- [ ] Validate instructor iframe publishes video state upward.
- [ ] Validate student iframe mirrors play/pause/seek from instructor.
- [ ] Validate drift correction after a delayed student join.
- [ ] Validate reload recovery when instructor or student refreshes mid-video.
- [ ] Validate behavior when the YouTube API fails or autoplay is blocked.
- [ ] Validate no regression to storyboard, pause lock, boundary controls, or chalkboard sync.

## Test Cases and Scenarios

### Functional
- Instructor enters a YouTube slide with `autoplay=false`; student loads same slide paused at identical start time.
- Instructor presses play; host relays play; student begins playback near the same timestamp.
- Instructor seeks to a new time; student snaps to the new time and resumes/pause state correctly.
- Instructor pauses; student pauses at the corrected time.
- Instructor leaves the slide; both sides pause the video.
- Student joins late on an active YouTube slide; host sends latest `youtubeSyncState`; student loads and catches up.
- Instructor reloads on an active YouTube slide; host rehydrates students from fresh instructor state.
- Standalone deck user can play, pause, and seek a YouTube slide locally without host messages.
- A synchronized student session can be configured to play the video muted while the instructor remains unmuted.
- A slide with only `data-youtube-*` attributes and no explicit `.youtube-player-slot` still renders and syncs correctly.
- A slide with a custom `.youtube-player-slot` uses that slot without creating duplicate player containers.

### Edge cases
- Multiple YouTube slides in one deck, visited out of order.
- Same YouTube video ID reused on multiple slides with different `start` offsets.
- Browser blocks autoplay with sound.
- Student mute policy changes while a synchronized video is already loaded.
- YouTube API script loads slowly.
- Student receives an older `seq` after a newer one.
- Network lag causes temporary drift while playing.
- Non-YouTube slides should behave exactly as before.

### Regression
- Existing `setState`, `slide`, pause lock, storyboard, and chalkboard sync behavior remain unchanged for decks without YouTube slides.
- `standalone` role still works without host promotion.
- `standalone` role retains local YouTube interactivity and is not treated like a locked-down student.
- Student navigation boundary logic remains independent of media playback state.

## Risks and Mitigations
- YouTube API timing races:
  - Mitigation: queue commands until player ready, then apply only the newest state.
- Feedback loops between remote apply and local event listeners:
  - Mitigation: track `applyingRemote` / suppress re-emit around remote commands.
- Browser autoplay policy divergence:
  - Mitigation: design around manual instructor play as authoritative and treat autoplay as best-effort.
- Student drift over time:
  - Mitigation: periodic instructor heartbeats plus threshold-based correction.
- Host contract ambiguity:
  - Mitigation: document exact expected relay/storage behavior in the schema doc.

## Acceptance Criteria
- A deck author can add a YouTube slide using the documented markup and shared script only.
- Instructor playback actions are reflected on connected student iframes.
- New or reloaded students can recover to the current authoritative playback state.
- Students cannot independently control synchronized playback.
- Deck authors can choose whether synchronized student playback is muted.
- Decks without YouTube slides continue to function unchanged.
- Docs and schema are detailed enough for host/container integration without reverse engineering source.

## Assumptions and Defaults
- `.agent/plans` is the correct planning directory for this repo.
- The implementation will live in the shared submodule under `vendor/SyncDeck-Reveal/js/`.
- The host/container already relays `reveal-sync` messages and can be extended to store one latest YouTube state object per session.
- v1 supports one synchronized YouTube player per slide.
- Drift correction threshold defaults to `0.75s`.
- Instructor emits periodic playback heartbeats while playing, default every `1000-2000ms`.
- Students have no local play/pause/seek permissions.
- `standalone` users do have local play/pause/seek permissions.
- Student mute defaults to `false` unless explicitly enabled by slide config or host policy.
- Raw embedded YouTube iframes are not considered supported authoring for synced slides; the shared helper owns iframe creation.
