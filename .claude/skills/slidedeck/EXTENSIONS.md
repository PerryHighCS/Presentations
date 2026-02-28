# Slide Extensions

This document holds optional or reusable slide extension patterns that are too specific to keep inline in `SKILL.md`.

## YouTube Slides

For presentations that need synchronized YouTube playback, prefer a declarative slide contract on the `<section>` rather than hand-writing embed iframes.

Authoring contract:

- Mark the slide with `data-youtube-*` attributes such as `data-youtube-video-id`, `data-youtube-start`, and `data-youtube-student-muted`.
- Do not hand-write a raw YouTube `<iframe>` for synchronized slides.
- By default, the shared runtime should create the player shell and `.youtube-player-slot` automatically inside `.slide-inner`.
- Only add an explicit `.youtube-player-slot` when the layout needs a custom placement for the player.

Recommended minimal markup:

```html
<section
    data-youtube-video-id="VIDEO_ID"
    data-youtube-start="0"
    data-youtube-autoplay="false"
    data-youtube-student-muted="true"
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
- `student` mode should follow synchronized playback commands and may be forced muted when configured.
- `instructor` mode is the authoritative source for synchronized playback state.
