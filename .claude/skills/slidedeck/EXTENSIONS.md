# Slide Extensions

This document holds optional or reusable slide extension patterns that are too specific to keep inline in `SKILL.md`.

## YouTube Slides

For presentations that need synchronized YouTube playback, prefer a declarative slide contract on the `<section>` rather than hand-writing embed iframes.

This is the v1 pattern for synchronized video slides. Name the broader concept "video slides" in docs and planning, but implement YouTube first.

Authoring contract:

- Mark the slide with `data-youtube-*` attributes such as `data-youtube-video-id`, `data-youtube-start`, and `data-youtube-student-audio`.
- Do not hand-write a raw YouTube `<iframe>` for synchronized slides.
- By default, the shared runtime should create the player shell and `.youtube-player-slot` automatically inside `.slide-inner`.
- Only add an explicit `.youtube-player-slot` when the layout needs a custom placement for the player.

Recommended minimal markup:

```html
<section
    data-youtube-video-id="VIDEO_ID"
    data-youtube-start="0"
    data-youtube-autoplay="false"
    data-youtube-student-audio="mute"
>
    <div class="slide-inner">
        <h2>Demo Video</h2>
    </div>
</section>
```

Optional custom placement:

```html
<section data-youtube-video-id="VIDEO_ID">
    <div class="slide-inner split">
        <div>
            <h2>Demo Video</h2>
            <p>Context and speaker notes.</p>
        </div>
        <div class="youtube-player-slot"></div>
    </div>
</section>
```

Behavior expectations:

- `standalone` mode should keep local YouTube controls enabled.
- `student` mode should follow synchronized playback commands and use the configured student-audio mode: `mute`, `slide`, or `unmute`.
- `instructor` mode is the authoritative source for synchronized playback state.

## Vertical Stack Student-Controlled Series

Vertical slide stacks can be used for a student-controlled series of slides: once the instructor reaches a horizontal stack, students may freely navigate within that stack while still remaining bounded to that stack.

Authoring contract:

- Use Reveal's normal vertical stack structure: one parent horizontal `<section>` containing child `<section>` slides.
- Treat the stack as a bounded exploration area for students, not as an unbounded free-navigation escape hatch.
- Use vertical stacks as the planned release mechanism; use storyboard boundary controls for ad hoc release ranges.
- When a YouTube slide appears inside a student-controlled vertical stack, the YouTube runtime should allow local student playback control for that stack if enabled by config.
- Prefer declaring stack-level behavior on the parent stack `<section>` so all child slides inherit the same student-control policy.

Recommended stack markup:

```html
<section
    data-student-stack="true"
    data-student-local-control="true"
    data-youtube-student-audio="mute"
>
    <section>
        <div class="slide-inner">
            <h2>Explore This Topic</h2>
            <p>Students can move within this stack after the instructor reaches it.</p>
        </div>
    </section>

    <section data-youtube-video-id="VIDEO_ID">
        <div class="slide-inner">
            <h2>Watch and Explore</h2>
        </div>
    </section>

    <section>
        <div class="slide-inner">
            <h2>Reflection</h2>
        </div>
    </section>
</section>
```

Behavior expectations:

- By default, students should only gain local control within a vertical stack when the instructor has reached that stack and the stack opts into student-controlled behavior.
- Instructor and host controls should still determine whether student local control is currently enabled.
- For YouTube slides inside an enabled student-controlled stack, students may receive local play/pause/seek control.
