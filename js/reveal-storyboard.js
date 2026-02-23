(function () {
  const DEFAULT_STORYBOARD_CONFIG = {
    reveal: null,
    storyboardId: 'storyboard',
    trackId: 'storyboard-track',
    toggleKey: 'm',
  };

  function getSlideLabel(section, index) {
    const heading = section.querySelector('h1, h2, h3');
    const text = heading ? heading.textContent.trim() : `Slide ${index + 1}`;
    return text.replace(/\s+/g, ' ');
  }

  function createSlidePreview(section) {
    const sectionClone = section.cloneNode(true);
    sectionClone.classList.remove('past', 'future', 'stack');
    sectionClone.classList.add('present');

    sectionClone.querySelectorAll('.fragment').forEach((node) => {
      node.classList.add('visible');
    });

    sectionClone.querySelectorAll('.yes-ring').forEach((node) => {
      node.style.animation = 'none';
      node.style.opacity = '0.45';
    });

    const scene = document.createElement('div');
    scene.className = 'story-scene reveal';

    const slides = document.createElement('div');
    slides.className = 'slides';
    slides.appendChild(sectionClone);
    scene.appendChild(slides);

    const preview = document.createElement('div');
    preview.className = 'story-preview';
    preview.appendChild(scene);
    return preview;
  }

  function initRevealStoryboard(options = {}) {
    const config = {
      ...DEFAULT_STORYBOARD_CONFIG,
      ...options,
    };

    const reveal = config.reveal || /** @type {any} */ (window).Reveal;
    if (!reveal) return;

    const storyboardId = config.storyboardId;
    const trackId = config.trackId;
    const toggleKey = (config.toggleKey || 'm').toLowerCase();

    const storyboard = document.getElementById(storyboardId);
    const storyboardTrack = document.getElementById(trackId);
    if (!storyboard || !storyboardTrack) return;

    // ── Boundary state ──────────────────────────────────────────────────────
    let currentBoundaryIndex = null;
    let liveRegion;

    function getRole() {
      return window.RevealIframeSyncAPI?.getStatus()?.role ?? null;
    }

    // Inject boundary-specific CSS once (idempotent).
    function injectBoundaryStyles() {
      if (document.getElementById('reveal-storyboard-boundary-css')) return;
      const style = document.createElement('style');
      style.id = 'reveal-storyboard-boundary-css';
      style.textContent = [
        '.story-thumb-wrap { position: relative; display: inline-flex; flex-shrink: 0; }',
        '.story-boundary-btn {',
        '  position: absolute; bottom: 4px; right: 4px;',
        '  width: 22px; height: 22px;',
        '  background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.3);',
        '  border-radius: 4px; color: #aaa; font-size: 12px;',
        '  cursor: pointer; display: flex; align-items: center; justify-content: center;',
        '  opacity: 0; transition: opacity 0.15s; z-index: 2;',
        '}',
        '.story-thumb-wrap:hover .story-boundary-btn,',
        '.story-thumb-wrap:focus-within .story-boundary-btn,',
        '.story-boundary-btn:focus { opacity: 1; }',
        '.story-thumb-wrap.story-thumb-boundary .story-boundary-btn {',
        '  opacity: 1; background: var(--cyan, #0ff); color: #000;',
        '  border-color: var(--cyan, #0ff);',
        '}',
        '.story-thumb-wrap.story-thumb-boundary .story-thumb {',
        '  border-color: var(--amber, #f90) !important;',
        '  box-shadow: 0 0 0 1px rgba(255,153,0,0.35) inset;',
        '}',
      ].join('\n');
      document.head.appendChild(style);
    }

    // Visually hidden live region appended to body (NOT inside storyboard which
    // has aria-hidden="true" when closed — that would suppress announcements).
    function createLiveRegion() {
      const el = document.createElement('div');
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.setAttribute('aria-atomic', 'true');
      el.style.cssText = [
        'position:absolute',
        'width:1px',
        'height:1px',
        'padding:0',
        'margin:-1px',
        'overflow:hidden',
        'clip:rect(0,0,0,0)',
        'white-space:nowrap',
        'border:0',
      ].join(';');
      document.body.appendChild(el);
      return el;
    }

    // Update the boundary marker visuals and announce the change.
    function updateBoundaryMarker(index) {
      currentBoundaryIndex = (index != null && Number.isFinite(Number(index)))
        ? Number(index)
        : null;

      storyboardTrack.querySelectorAll('.story-thumb-wrap').forEach((wrap) => {
        const isBoundary = currentBoundaryIndex !== null
          && Number(wrap.dataset.slide) === currentBoundaryIndex;
        wrap.classList.toggle('story-thumb-boundary', isBoundary);
        const btn = wrap.querySelector('.story-boundary-btn');
        if (btn) btn.setAttribute('aria-pressed', isBoundary ? 'true' : 'false');
      });

      if (currentBoundaryIndex !== null && liveRegion) {
        liveRegion.textContent = `Student boundary set to slide ${currentBoundaryIndex + 1}`;
      }
    }

    injectBoundaryStyles();
    liveRegion = createLiveRegion();

    // ── Slide data ──────────────────────────────────────────────────────────
    const slideSections = Array.from(document.querySelectorAll('.reveal .slides > section'));

    function getAllowedMaxSlideIndex() {
      const lastIndex = Math.max(0, slideSections.length - 1);
      const syncApi = window.RevealIframeSyncAPI;
      if (!syncApi || typeof syncApi.getStatus !== 'function') return lastIndex;

      const status = syncApi.getStatus();
      if (!status) return lastIndex;

      // Never restrict when:
      //  - role is instructor (they can always see everything)
      //  - forward navigation is explicitly allowed
      //  - boundary was set locally (this iframe is the acting instructor, even
      //    if its role was not yet upgraded to 'instructor' by the host)
      if (status.role !== 'student' || status.capabilities?.canNavigateForward || status.boundaryIsLocal) {
        return lastIndex;
      }

      // Only restrict when an explicit boundary has been set.
      // Without a boundary (null), show all slides — navigation enforcement
      // handles snap-back separately and avoids blanking at an arbitrary position.
      if (status.studentBoundary == null) return lastIndex;
      const boundaryH = Number(status.studentBoundary.h);
      if (!Number.isFinite(boundaryH)) return lastIndex;
      return Math.max(0, Math.min(lastIndex, boundaryH));
    }

    function renderStoryboard() {
      storyboardTrack.innerHTML = '';
      storyboardTrack.setAttribute('role', 'group');
      storyboardTrack.setAttribute('aria-label', 'Slide storyboard');

      const allowedMaxIndex = getAllowedMaxSlideIndex();
      const hiddenCount = Math.max(0, slideSections.length - (allowedMaxIndex + 1));
      const isInstructor = getRole() === 'instructor';

      slideSections.forEach((section, index) => {
        if (index > allowedMaxIndex) return;

        // Wrapper div — holds nav button + optional boundary button.
        // data-slide on the wrapper is read by updateBoundaryMarker.
        const wrap = document.createElement('div');
        wrap.className = 'story-thumb-wrap';
        wrap.dataset.slide = String(index);

        // Navigation button (data-slide kept here too for updateStoryboardActive compat).
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'story-thumb';
        button.dataset.slide = String(index);
        button.setAttribute('aria-label', `Go to ${getSlideLabel(section, index)}`);

        const num = document.createElement('span');
        num.className = 'story-num';
        num.textContent = String(index + 1).padStart(2, '0');

        const caption = document.createElement('span');
        caption.className = 'story-caption';
        caption.textContent = getSlideLabel(section, index);

        button.appendChild(num);
        button.appendChild(createSlidePreview(section));
        button.appendChild(caption);
        button.addEventListener('click', () => reveal.slide(index));
        wrap.appendChild(button);

        // Boundary button — instructor only. Not rendered for students so
        // there is nothing to accidentally activate.
        if (isInstructor) {
          const boundaryBtn = document.createElement('button');
          boundaryBtn.type = 'button';
          boundaryBtn.className = 'story-boundary-btn';
          boundaryBtn.setAttribute('aria-label', `Set student boundary to slide ${index + 1}`);
          boundaryBtn.setAttribute('aria-pressed', 'false');
          boundaryBtn.textContent = '\u2691'; // ⚑ flag
          boundaryBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.dispatchEvent(new CustomEvent('reveal-storyboard-boundary-moved', {
              detail: { indices: { h: index, v: 0, f: 0 } },
            }));
          });
          wrap.appendChild(boundaryBtn);
        }

        storyboardTrack.appendChild(wrap);
      });

      if (hiddenCount > 0) {
        const lockedCard = document.createElement('div');
        lockedCard.className = 'story-thumb story-thumb-locked';
        lockedCard.setAttribute('aria-label', `${hiddenCount} additional slides are currently locked`);

        const num = document.createElement('span');
        num.className = 'story-num';
        num.textContent = '🔒';

        const body = document.createElement('div');
        body.className = 'story-lock-body';
        body.textContent = `+${hiddenCount} locked`;

        const caption = document.createElement('span');
        caption.className = 'story-caption';
        caption.textContent = 'Host-controlled slides';

        lockedCard.appendChild(num);
        lockedCard.appendChild(body);
        lockedCard.appendChild(caption);
        storyboardTrack.appendChild(lockedCard);
      }

      // Reapply boundary marker after re-render (handles role-change refreshes).
      if (currentBoundaryIndex !== null) updateBoundaryMarker(currentBoundaryIndex);
    }

    function updateStoryboardActive(index) {
      const thumbs = storyboardTrack.querySelectorAll('.story-thumb');
      thumbs.forEach((thumb) => {
        const slideIndex = Number(thumb.dataset.slide);
        thumb.classList.toggle('active', slideIndex === index);
      });

      const activeThumb = storyboardTrack.querySelector('.story-thumb.active');
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }

    function toggleStoryboard() {
      document.body.classList.toggle('storyboard-open');
      const isOpen = document.body.classList.contains('storyboard-open');
      storyboard.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      reveal.layout();
      // Notify reveal-iframe-sync (and any other listener) so the host can
      // reflect the storyboard state in its own UI.
      window.dispatchEvent(new CustomEvent('reveal-storyboard-changed', { detail: { open: isOpen } }));
    }

    function refreshStoryboard() {
      renderStoryboard();
      updateStoryboardActive(reveal.getIndices().h || 0);
    }

    refreshStoryboard();

    reveal.on('slidechanged', (event) => {
      updateStoryboardActive(event.indexh);
    });

    window.addEventListener('reveal-iframesync-status', () => {
      refreshStoryboard();
    });

    // M key (or configured toggleKey) opens/closes the storyboard.
    document.addEventListener('keydown', (event) => {
      const tagName = document.activeElement?.tagName;
      if (tagName === 'INPUT' || tagName === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key.toLowerCase() === toggleKey) {
        event.preventDefault();
        toggleStoryboard();
      }
    });

    // Arrow Left/Right move focus between nav buttons when the storyboard is focused.
    // Scoped to storyboardTrack so arrow keys only fire when inside the strip.
    storyboardTrack.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const navBtns = Array.from(storyboardTrack.querySelectorAll('button.story-thumb'));
      const cur = navBtns.indexOf(document.activeElement);
      if (cur === -1) return;
      e.preventDefault(); // prevent Reveal from consuming arrow keys
      const next = e.key === 'ArrowRight'
        ? Math.min(cur + 1, navBtns.length - 1)
        : Math.max(cur - 1, 0);
      navBtns[next].focus();
      navBtns[next].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });

    // Allow reveal-iframe-sync (and any other code) to drive the storyboard
    // without a direct reference to toggleStoryboard().
    // Used when the container site sends overview commands or setState with overview:true/false.
    window.addEventListener('reveal-storyboard-toggle', () => {
      toggleStoryboard();
    });

    window.addEventListener('reveal-storyboard-set', (event) => {
      const shouldBeOpen = !!event.detail?.open;
      const isOpen = document.body.classList.contains('storyboard-open');
      if (shouldBeOpen !== isOpen) toggleStoryboard();
    });

    // Incoming boundary update from reveal-iframe-sync (triggered when host sends
    // setStudentBoundary command to either instructor or student iframe).
    window.addEventListener('reveal-storyboard-boundary-update', (event) => {
      const h = event.detail?.indices?.h;
      updateBoundaryMarker(h != null ? Number(h) : null);
    });
  }

  window.initRevealStoryboard = initRevealStoryboard;
})();
