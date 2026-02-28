# Video Slide Sync Extension Plan

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
- Sync model is host-authoritative.
- Student viewers have no local playback control.
- `standalone` mode keeps normal local playback control because there is no host authority to defer to.
- The extension is reusable shared runtime code, not a one-off deck-specific script.
- Existing `reveal-iframe-sync.js` boundary enforcement is assumed to already be broadly sufficient for bounded student navigation within vertical stacks; new work should not redesign core slide-boundary navigation unless implementation proves a gap.
- Vertical stacks are the planned release mechanism; storyboard boundary changes are the on-the-fly release mechanism.
- Released media-control region is a horizontal-only inclusive min/max range between the instructor's current `h` position and the granted boundary `h`; `v` may be retained in payload types for compatibility but is ignored for released-region semantics.

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
- add an optional per-slide student-audio default policy, for example `data-youtube-student-audio="mute"` or `data-youtube-student-audio="unmute"`
- add an optional stack/slide local-control policy, for example `data-youtube-student-local-control="true"`, so instructors can permit local student playback on eligible slides
- static slide attributes are initial defaults only; host runtime commands are authoritative for the duration of the session
- the host may persist the instructor's last chosen student-audio mode locally on the instructor machine and use it as the default for future sessions across all decks before any new in-session override occurs
- the runtime should auto-create a default `.youtube-slide-shell` and `.youtube-player-slot` inside `.slide-inner` when the author has not provided one
- if an author provides `.youtube-player-slot` explicitly, the runtime should reuse it rather than creating a duplicate
- deck authors do not embed raw YouTube iframes directly for synced slides
- deck authors should only need to declare YouTube behavior on the `<section>` unless they want custom layout control
- for vertical Reveal stacks, the parent stack `<section>` should be allowed to define student-controlled behavior inherited by child slides
- planned release zones should be authored as vertical stacks; ad hoc release zones should be driven by instructor boundary/storyboard controls

### 3. Extend iframe sync protocol
Add explicit video commands/events rather than overloading `setState`.

New host -> iframe commands:
- `youtubeLoad`
- `youtubePlay`
- `youtubePause`
- `youtubeSeek`
- `youtubeSyncState`
- `youtubeSetStudentAudio`
- `youtubeSetLocalControl`

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
{ "name": "youtubeSetStudentAudio", "payload": { "slide": { "h": 3, "v": 0, "f": -1 }, "mode": "mute", "scope": "student" } }
```

```json
{ "name": "youtubeSetLocalControl", "payload": { "slide": { "h": 3, "v": 1, "f": -1 }, "enabled": true, "scope": "student" } }
```

New iframe -> host events:
- `youtubeState`
- `youtubeEnded`
- `youtubeError`
- `youtubeCapabilities`
- `youtubePlayerStatus`

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

Recommended capabilities payload:
```json
{
  "slide": { "h": 3, "v": 0, "f": -1 },
  "videoId": "abc123",
  "supportsStudentMute": true,
  "studentAudioMode": "slide",
  "resolvedStudentMuted": false,
  "supportsStudentLocalControl": true,
  "studentLocalControl": false,
  "withinStudentControlledStack": true,
  "releasedRegion": {
    "startH": 3,
    "endH": 5
  },
  "role": "instructor"
}
```

Recommended player-status payload:
```json
{
  "slide": { "h": 3, "v": 0, "f": -1 },
  "videoId": "abc123",
  "playerReady": true,
  "playerBlocked": false,
  "reason": "playerReady",
  "role": "student"
}
```

Recommended error payload:
```json
{
  "slide": { "h": 3, "v": 0, "f": -1 },
  "videoId": "abc123",
  "errorCode": 150,
  "message": "Embedded playback not allowed",
  "role": "student"
}
```

Protocol rules:
- only instructor iframes emit authoritative `youtubeState`
- students never emit authoritative playback changes
- host relays instructor-originated video state to students
- host should treat instructor `youtubeEnded` as authoritative terminal playback state and relay an equivalent ended-state sync so lagging or rejoined students converge on ended playback
- a monotonically increasing `seq` prevents stale state from overriding newer commands
- student audio policy must be relayable independently of play/pause/seek so the host can enforce `mute`, `slide`, or `unmute` behavior when configured
- `data-youtube-student-audio` defines only the initial default; host-issued `youtubeSetStudentAudio` becomes authoritative for the session and should win on reload/rejoin
- for future sessions, an instructor-local persisted student-audio preference may override the authored default before the first live session command is sent
- `youtubeError` should carry enough context for the host to identify the failing slide/video and present a recoverable indicator to the instructor
- the iframe runtime should advertise whether the active YouTube slide supports student mute controls so the host can show or hide a toolbar toggle without hardcoded slide knowledge
- the iframe runtime should also advertise whether the active slide is inside a student-controlled vertical stack and whether local student playback control can be toggled from the host toolbar
- vertical-stack navigation itself should reuse the existing Reveal iframe sync boundary model where possible rather than introducing a second navigation-control system
- released-region metadata should be available to the host/storyboard so the active released range can be highlighted visually
- released-region comparison should use horizontal indices only; vertical position remains relevant for current-slide state, not for release-range membership
- each iframe should report player readiness for the active video slide so the host can aggregate whether students are ready, blocked, or still loading before the instructor starts playback

### 4. Define sync behavior precisely
Instructor side:
- when entering a YouTube slide, initialize/load the player if needed
- if slide config says `autoplay=true`, prepare playback immediately; in synced mode the host should wait for student readiness before issuing the authoritative play command, while in standalone mode playback starts immediately
- on local play/pause/seek/end, emit normalized `youtubeState` upward
- on local end, emit `youtubeEnded` upward so the host can finalize synced playback state for all students
- on active YouTube slide entry and whenever student-audio capability changes, emit `youtubeCapabilities` upward so the host toolbar can expose a 3-state student audio control
- on active YouTube slide entry and whenever stack/local-control capability changes, emit `youtubeCapabilities` upward so the host toolbar can expose a student local-control toggle
- on active video slide entry, emit player-status updates so the host can show whether the instructor player itself is ready
- send periodic state heartbeats while playing, recommended every 1-2 seconds
- suppress duplicate emissions caused by remote command application

Student side:
- local controls are disabled or overlaid
- apply host-relayed video commands
- apply host-relayed student audio policy, where `mute` forces mute, `unmute` forces audio on, and `slide` resolves to the slide-authored default
- if the active slide is inside the currently released region and local control is enabled, allow local play/pause/seek on that slide
- emit `youtubePlayerStatus` when the player becomes ready, when API load is still pending, and when autoplay or playback preparation is blocked
- on `youtubePlay`, seek if drift exceeds threshold, then play
- on `youtubePause`, pause and snap to authoritative time if drift exceeds threshold
- on `youtubeSyncState`, correct drift if absolute delta exceeds threshold
- recommended drift correction threshold: `0.75s`
- recommended stale command rejection: ignore commands with lower `seq`
- when local student playback control is enabled, playback freedom is limited to the current released region even though general backward navigation may still be allowed outside it

Standalone side:
- local controls remain enabled
- no host sync commands are required or expected
- local play/pause/seek should not be blocked by sync guardrails intended for `student` role
- the helper should still provide the same player lifecycle behavior on slide enter/leave
- `youtubeCapabilities` may still be emitted for internal consistency, but only instructor-originated capability messages should drive host toolbar controls

### 5. Integrate with slide lifecycle
Behavior on Reveal events:
- `slidechanged`:
  - if leaving a YouTube slide, pause that slide's player
  - if entering a YouTube slide, ensure the correct player is mounted and synchronized
  - instructor emits an immediate `youtubeState` snapshot after slide activation
  - when the active slide enters or leaves a planned-release stack or other released region, recompute and emit `youtubeCapabilities` so host toolbar controls and storyboard highlighting update immediately
  - when the active slide enters a video slide, emit an initial `youtubePlayerStatus` with loading/ready state so the host can aggregate student readiness
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
- persist instructor-side student-audio preference locally across sessions as a global preference across decks, for example:
```js
localPrefs.youtube = {
  studentAudioMode: "mute",
  updatedAt: 1760000000000
};
```
- latest authoritative video state shape:
```js
session.youtube = {
  slideKey: '3/0/-1',
  videoId: 'abc123',
  playerState: 'paused',
  currentTime: 42.0,
  muted: false,
  studentAudioMode: 'slide',
  resolvedStudentMuted: true,
  studentLocalControl: false,
  withinStudentControlledStack: true,
  releasedRegion: {
    startH: 3,
    endH: 5
  },
  seq: 17,
  issuedAt: 1760000000000
};
```
- maintain per-student player readiness state for the active video slide, for example:
```js
session.youtubePlayers = {
  byClientId: {
    "student-a": { playerReady: true, playerBlocked: false, reason: "playerReady", slideKey: "3/0/-1" },
    "student-b": { playerReady: false, playerBlocked: false, reason: "loading", slideKey: "3/0/-1" }
  },
  summary: {
    readyCount: 1,
    loadingCount: 1,
    blockedCount: 0,
    totalCount: 2
  }
};
```
- when instructor sends `youtubeState`, replace stored state if `seq` is newer
- when instructor sends `youtubeCapabilities`, update host UI state so the toolbar knows whether to show a student audio control and what its current mode/value is
- the same capability message should tell the host whether to show a student local-control toggle for the active slide/stack
- when any iframe sends `youtubePlayerStatus`, update the per-client readiness map and recompute an aggregate status for the instructor toolbar
- when a student iframe becomes ready or is promoted to `student`, host sends the latest `youtubeSyncState` for the active slide
- when instructor sends `youtubeEnded`, mark the session video state as ended and relay an equivalent ended-state sync to students that may not have naturally reached the end yet
- when any iframe sends `youtubeError`, log/store the error context and show a recoverable status indicator in the instructor UI; do not crash the sync session
- initialize student audio mode for a new session from persisted instructor-local preference when available; otherwise fall back to authored slide config
- after any host-issued `youtubeSetStudentAudio`, the host-stored audio mode becomes authoritative for the session and must be re-applied on reload or rejoin
- after any host-issued `youtubeSetStudentAudio`, also update the instructor-local persisted preference unless the container intentionally disables persistence
- when student audio policy is enabled, host also sends `youtubeSetStudentAudio` or includes equivalent `studentAudioMode` state on resync
- when local-control policy is enabled for the current stack/slide, host may send `youtubeSetLocalControl` to let students control playback locally
- host may translate container UI actions into `youtubePlay` / `youtubePause` / `youtubeSeek` / `youtubeSetStudentAudio` / `youtubeSetLocalControl`
- host/storyboard UI should highlight the currently released region, not just the single boundary marker
- host toolbar should show aggregated readiness such as `all ready`, `n loading`, or `n blocked`, so the instructor can decide whether to wait before pressing play
- when synchronized `autoplay=true` is active, host should treat it as coordinated autoplay: wait until all connected student players are ready, then issue play; if readiness stalls, show an explicit instructor override such as `play now anyway`
- if synchronized `autoplay=true` is active and the connected-student count is zero, treat readiness as immediately satisfied and autoplay without waiting

### 6a. Storyboard representation
Storyboard requirements:
- highlight the full released region as an inclusive horizontal range between release start and release end
- preserve the existing explicit boundary marker so instructors can still see the current hard limit
- visually distinguish planned release zones (vertical stacks) from ad hoc released regions created via boundary controls
- represent vertical stacks in a way that makes their child slides legible in the strip; do not flatten them into ambiguous duplicates with no hierarchy cues
- when a vertical stack is acting as a planned release zone, the storyboard should show both the stack grouping and the currently active child slide

Recommended storyboard treatment:
- render horizontal slides as primary thumbnails
- render vertical stacks as grouped thumbnails or an expandable cluster under the parent horizontal position
- apply a release-range highlight band across every thumbnail in the currently released region
- keep the current active slide highlight visually distinct from the release-range highlight
- when the instructor changes the boundary on the fly, animate the release-range highlight update so the changed teaching state is obvious

### 7. Accessibility and UX defaults
- provide a visible poster/loading state before player readiness
- expose slide-level caption/title text for non-visual context
- disable pointer interaction on student players via overlay or API-level control policy
- keep pointer and keyboard interaction available in `standalone` mode
- preserve keyboard navigation for Reveal itself
- do not rely on autoplay with sound; expect browser autoplay restrictions
- if autoplay is blocked, instructor sees a recoverable ready state and manual play becomes authoritative
- in synchronized sessions, `autoplay=true` should mean coordinated autoplay after readiness, not immediate instructor-only autoplay
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
- `youtubeSetStudentAudio`
- `youtubeSetLocalControl`

### Updated message schema doc
Update `vendor/SyncDeck-Reveal/js/reveal-iframe-sync-message-schema.md` with:
- new command names
- payload examples
- new upward event types
- host buffering/relay expectations
- sequencing and drift-correction rules
- capability advertisement for host toolbar affordances such as 3-state student audio control
- stack-aware capability advertisement and student local-control toggling
- explicit note that vertical-stack slide navigation continues to rely on the existing boundary model unless a validated implementation gap is found
- player-readiness reporting and host aggregation rules for instructor wait/go decisions
- coordinated autoplay semantics in synced mode versus immediate autoplay in standalone mode
- explicit host handling for `youtubeEnded`
- `youtubeError` payload shape and host behavior

### Updated authoring docs
Update `AGENTS.md` to document:
- minimal YouTube slide markup on the `<section>`
- optional explicit `.youtube-player-slot` override for custom layout
- vertical-stack authoring for student-controlled series
- required script include order
- initialization snippet
- autoplay and control restrictions
- optional student audio behavior for synchronized playback
- host-visible capability advertisement so container toolbars can expose 3-state student audio controls
- host-visible capability advertisement so container toolbars can expose student local-control toggles
- storyboard highlighting for released regions and visual treatment for vertical stacks
- host relay expectations

Update `.claude/skills/slidedeck/SKILL.md` to document:
- a YouTube slide is declared by `data-youtube-*` attributes on the `<section>`
- authors should not hand-write raw YouTube iframes for synced slides
- the runtime auto-inserts `.youtube-slide-shell` and `.youtube-player-slot` by default
- authors may provide `.youtube-player-slot` explicitly when they need custom placement
- vertical stacks as a student-controlled series pattern

## Actionable Checklist

### Phase 1: Design and contract
- [ ] Confirm final filename and store this plan at `.agent/plans/video-slide-sync-extension-plan.md`.
- [ ] Add a short "Status Snapshot" header to the plan file, matching existing plan style.
- [ ] Specify final declarative HTML contract for YouTube slides.
- [ ] Specify default auto-generated player-slot behavior and the optional explicit slot override.
- [ ] Specify final message names and payload schemas.
- [ ] Specify drift-correction, sequencing, and autoplay fallback rules.
- [ ] Specify how 3-state student audio is configured and how it is represented in sync payloads.
- [ ] Specify precedence for authored `data-youtube-student-audio` versus runtime `youtubeSetStudentAudio`.
- [ ] Specify the upward capability message that tells the host when to show a student audio control.
- [ ] Specify stack-level config and capability messages for student local playback control.
- [ ] Confirm and document that existing iframe-sync boundary handling is the base mechanism for vertical-stack navigation freedom.
- [ ] Specify released-region semantics as inclusive horizontal min/max between instructor position and boundary.
- [ ] Document that `v` may remain in TypeScript/message types for consistency but is ignored for release-range calculations.
- [ ] Specify storyboard representation for released regions and vertical stacks.
- [ ] Specify player-readiness events and host aggregation semantics so the instructor can see whether students are ready before playback starts.
- [ ] Specify that synchronized `autoplay=true` means coordinated wait-for-ready autoplay, while standalone `autoplay=true` remains immediate.
- [ ] Specify zero-student behavior for coordinated autoplay.
- [ ] Specify authoritative host behavior for `youtubeEnded`.
- [ ] Specify precedence between authored student-audio default, persisted instructor-local preference, and in-session host override.
- [ ] Specify `youtubeError` payload fields and host behavior.

### Phase 2: Shared runtime
- [ ] Add `reveal-youtube-sync.js` in the submodule.
- [ ] Implement one-time YouTube IFrame API loader.
- [ ] Implement slide discovery by `data-youtube-*` attributes.
- [ ] Implement automatic insertion of `.youtube-slide-shell` and `.youtube-player-slot` for YouTube slides that do not provide a custom slot.
- [ ] Implement player registry keyed by Reveal slide indices.
- [ ] Implement active-slide attach/load/pause lifecycle.
- [ ] Implement student control lockout.
- [ ] Preserve full local controls in `standalone` mode.
- [ ] Implement role-aware 3-state audio handling so student playback can be forced muted, slide-default, or unmuted when configured.
- [ ] Implement released-region-aware local playback control so students can play locally only on slides inside the active released range.
- [ ] Implement normalized status reporting API for the sync plugin.
- [ ] Implement capability reporting so the host can discover student audio support for the active slide.
- [ ] Implement capability reporting so the host can discover student local-control support for the active slide/stack.
- [ ] Implement player-status reporting for loading, ready, and blocked states on instructor and student video players.

### Phase 3: Sync plugin integration
- [ ] Extend command handling in `reveal-iframe-sync.js` for YouTube commands, including `youtubeSetStudentAudio`.
- [ ] Wire instructor-originated YouTube events to upward `postMessage`.
- [ ] Apply remote YouTube commands on student iframes without feedback loops.
- [ ] Emit current YouTube state on instructor role promotion and active YouTube slide entry.
- [ ] Relay and reapply student audio policy during initial sync and mid-session changes.
- [ ] Emit capability messages that let the host show or hide an instructor toolbar 3-state student audio control.
- [ ] Relay and reapply student local-control policy during initial sync and mid-session changes.
- [ ] Emit capability messages that let the host show or hide an instructor toolbar local-control toggle for students.
- [ ] Relay authoritative ended-state updates so student players converge when the instructor video ends.
- [ ] Ensure navigation away from a YouTube slide pauses playback cleanly.
- [ ] Avoid changing core boundary-navigation behavior unless a concrete failing case is found during validation.
- [ ] Emit enough released-region metadata for the storyboard to highlight the full allowed media-control range.
- [ ] Emit enough player-status metadata for the host to aggregate student readiness and expose a wait/go indicator in the instructor toolbar.
- [ ] Ensure synced `autoplay=true` waits for readiness and exposes an explicit instructor override instead of autoplaying silently after a timeout.
- [ ] Ensure synced `autoplay=true` starts immediately when zero students are connected.
- [ ] Persist instructor student-audio preference locally for future sessions when the host/container supports it.

### Phase 4: Documentation and examples
- [ ] Update `reveal-iframe-sync-message-schema.md` with new commands/events and host examples.
- [ ] Update `AGENTS.md` with authoring instructions and architectural constraints.
- [ ] Update `.claude/skills/slidedeck/SKILL.md` so generated decks use the section-only YouTube authoring contract by default.
- [ ] Update `.claude/skills/slidedeck/EXTENSIONS.md` with vertical-stack student-control guidance.
- [ ] Document storyboard behavior for released regions and vertical-stack grouping.
- [ ] Add or update one example deck showing a synced YouTube slide.

### Phase 5: Validation
- [ ] Validate standalone deck behavior with a YouTube slide and no host.
- [ ] Validate instructor iframe publishes video state upward.
- [ ] Validate student iframe mirrors play/pause/seek from instructor.
- [ ] Validate drift correction after a delayed student join.
- [ ] Validate reload recovery when instructor or student refreshes mid-video.
- [ ] Validate behavior when the YouTube API fails or autoplay is blocked.
- [ ] Validate the instructor host toolbar receives capability state and can switch student audio live between `mute`, `slide`, and `unmute`.
- [ ] Validate the instructor host toolbar receives capability state and can toggle student local control live for an eligible vertical stack.
- [ ] Validate an eligible vertical stack works with existing iframe-sync boundary navigation without additional navigation changes.
- [ ] Validate the storyboard highlights the full released region, not just the boundary endpoint.
- [ ] Validate vertical stacks are represented clearly in the storyboard and the active child slide remains obvious.
- [ ] Validate the host can tell when all student players are ready, still loading, or blocked before the instructor starts playback.
- [ ] Validate synchronized `autoplay=true` waits for all ready players and that the instructor can override with `play now anyway`.
- [ ] Validate synchronized `autoplay=true` starts immediately when no students are connected.
- [ ] Validate instructor `youtubeEnded` causes lagging or rejoined students to converge on ended state.
- [ ] Validate instructor-selected student-audio mode persists locally and seeds future sessions across decks.
- [ ] Validate `youtubeError` surfaces recoverably in host UI with slide/video context.
- [ ] Validate no regression to storyboard, pause lock, boundary controls, or chalkboard sync.

## Test Cases and Scenarios

### Functional
- Instructor enters a YouTube slide with `autoplay=false`; student loads same slide paused at identical start time.
- Instructor presses play; host relays play; student begins playback near the same timestamp.
- Instructor seeks to a new time; student snaps to the new time and resumes/pause state correctly.
- Instructor pauses; student pauses at the corrected time.
- Instructor leaves the slide; both sides pause the video.
- Instructor video reaches the end; host relays ended state so all student players converge on ended playback even if some were slightly behind.
- Student joins late on an active YouTube slide; host sends latest `youtubeSyncState`; student loads and catches up.
- Instructor reloads on an active YouTube slide; host rehydrates students from fresh instructor state.
- Standalone deck user can play, pause, and seek a YouTube slide locally without host messages.
- A synchronized student session can be configured with student audio mode `mute`, `slide`, or `unmute` while the instructor remains independently audible.
- The instructor host UI can discover that student audio control is available for the active YouTube slide and change it from the toolbar.
- Runtime student audio mode overrides the authored default for the duration of the session, including reloads and rejoins.
- Instructor-selected student audio mode can be persisted locally on the instructor machine and reused as the starting default in future sessions across decks.
- A YouTube slide inside an eligible vertical stack can grant student local playback control once the instructor reaches that stack.
- The instructor host UI can discover that student local playback control is available for the active slide/stack and toggle it from the toolbar.
- The released region is highlighted clearly in the storyboard as a range, not only as a single boundary marker.
- Vertical stacks are legible in the storyboard and communicate both grouping and current child-slide position.
- The instructor can see whether all connected student players are ready before starting playback and choose to wait or proceed.
- In synchronized mode, `autoplay=true` waits for student readiness before starting, while standalone mode still autoplays immediately.
- In synchronized mode, `autoplay=true` waits for student readiness before starting, except when zero students are connected, in which case it starts immediately.
- A slide with only `data-youtube-*` attributes and no explicit `.youtube-player-slot` still renders and syncs correctly.
- A slide with a custom `.youtube-player-slot` uses that slot without creating duplicate player containers.

### Edge cases
- Multiple YouTube slides in one deck, visited out of order.
- Same YouTube video ID reused on multiple slides with different `start` offsets.
- Browser blocks autoplay with sound.
- Student audio policy changes while a synchronized video is already loaded.
- A deck authored with `data-youtube-student-audio="mute"` is later switched to `unmute` by host command and then reloaded; host session state should win.
- A deck authored with `data-youtube-student-audio="slide"` is later switched to `mute`; a future session on the same instructor machine should start from the persisted global local preference if enabled.
- Host receives a capability update when navigation enters or leaves a YouTube slide so the toolbar does not show stale student audio controls.
- Host receives a capability update when navigation enters or leaves a student-controlled vertical stack so the toolbar does not show stale local-control controls.
- A student moves one slide backward outside the released region and immediately loses local playback control while still retaining normal backward navigation.
- Storyboard must represent a vertical stack with enough hierarchy that instructors can understand which slides are in the planned release zone.
- Some student players naturally end later than others unless the host relays authoritative ended state.
- One or more student players remain loading or blocked while the instructor player is ready.
- Synchronized `autoplay=true` is pending because not all students are ready, and the instructor chooses whether to wait or override.
- Synchronized `autoplay=true` activates while zero students are connected; playback should start immediately rather than waiting forever.
- A student or instructor iframe emits `youtubeError`; host should surface recoverable context instead of silently failing.
- YouTube API script loads slowly.
- Student receives an older `seq` after a newer one.
- Network lag causes temporary drift while playing.
- Non-YouTube slides should behave exactly as before.

### Regression
- Existing `setState`, `slide`, pause lock, storyboard, and chalkboard sync behavior remain unchanged for decks without YouTube slides.
- `standalone` role still works without host promotion.
- `standalone` role retains local YouTube interactivity and is not treated like a locked-down student.
- Student navigation boundary logic remains compatible with media playback state, including bounded local control inside designated vertical stacks.
- Existing vertical-stack navigation behavior in `reveal-iframe-sync.js` should remain the primary navigation mechanism rather than being replaced by YouTube-specific navigation rules.
- Storyboard boundary UI remains compatible with the new release-range highlighting and vertical-stack grouping.

## Risks and Mitigations
- YouTube API timing races:
  - Mitigation: queue commands until player ready, then apply only the newest state.
- Feedback loops between remote apply and local event listeners:
  - Mitigation: track `applyingRemote` / suppress re-emit around remote commands.
- Browser autoplay policy divergence:
  - Mitigation: design around manual instructor play as authoritative and treat autoplay as best-effort.
- Student drift over time:
  - Mitigation: periodic instructor heartbeats plus threshold-based correction.
- Over-scoping navigation changes that the existing boundary model already handles:
  - Mitigation: validate current vertical-stack behavior first and keep new work focused on media control, capability reporting, and documentation.
- Storyboard complexity makes release state harder to read:
  - Mitigation: separate visual treatments for active slide, boundary marker, release range, and vertical-stack grouping.
- Readiness signals may flap during load or reconnect:
  - Mitigation: aggregate per-client player status with timestamps and display stable summary states in the toolbar rather than reacting to a single transient event.
- Ambiguity around autoplay semantics between standalone and synced sessions:
  - Mitigation: define `autoplay=true` as coordinated autoplay in synced mode and immediate autoplay only in standalone mode.
- Ambiguity around zero-student coordinated autoplay:
  - Mitigation: treat zero connected students as immediately ready.
- Host contract ambiguity:
  - Mitigation: document exact expected relay/storage behavior in the schema doc.
- Error events are too vague to act on:
  - Mitigation: define `youtubeError` payload with slide, video, and error code/message, and require host UI/logging behavior.

## Acceptance Criteria
- A deck author can add a YouTube slide using the documented markup and shared script only.
- Instructor playback actions are reflected on connected student iframes.
- New or reloaded students can recover to the current authoritative playback state.
- Students cannot independently control synchronized playback.
- Deck authors can choose the default synchronized student audio mode.
- The host/container can discover and change student audio mode from instructor-facing controls without hardcoding slide-specific knowledge.
- Static deck student-audio configuration acts only as the initial default; host runtime student-audio state is authoritative for the session and survives reload/rejoin via host resync.
- Persisted instructor-local student-audio preference may override the authored default at the start of a future session, while live in-session host state remains authoritative once the session is active.
- Deck authors can mark vertical stacks/slides as eligible for student local playback control, and the host can toggle that control at runtime.
- Planned release zones and ad hoc released regions are both represented clearly in the storyboard.
- The host can aggregate student player readiness and expose that state to the instructor before playback starts.
- `autoplay=true` behaves predictably: coordinated wait-for-ready in synced sessions, immediate autoplay in standalone.
- `autoplay=true` also behaves predictably when zero students are connected: synced playback starts immediately instead of waiting.
- Decks without YouTube slides continue to function unchanged.
- Docs and schema are detailed enough for host/container integration without reverse engineering source.

## Assumptions and Defaults
- `.agent/plans` is the correct planning directory for this repo.
- The implementation will live in the shared submodule under `vendor/SyncDeck-Reveal/js/`.
- The host/container already relays `reveal-sync` messages and can be extended to store one latest YouTube state object per session.
- The host/container can optionally persist instructor student-audio preference locally across sessions as a global preference across decks.
- v1 supports one synchronized YouTube player per slide.
- Drift correction threshold defaults to `0.75s`.
- Instructor emits periodic playback heartbeats while playing, default every `1000-2000ms`.
- Students have no local play/pause/seek permissions.
- `standalone` users do have local play/pause/seek permissions.
- Student audio mode defaults to `slide`, meaning use the authored slide default unless the host overrides it.
- If a persisted instructor-local student-audio preference exists, that preference seeds the next session before any new live override is applied.
- Student local playback control defaults to `false` unless explicitly enabled by slide/stack config and turned on by the instructor host UI.
- Released media-control region defaults to disabled until a planned stack is entered or the instructor grants an ad hoc boundary-based release.
- Raw embedded YouTube iframes are not considered supported authoring for synced slides; the shared helper owns iframe creation.
