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

    const slideSections = Array.from(document.querySelectorAll('.reveal .slides > section'));

    function getAllowedMaxSlideIndex() {
      const lastIndex = Math.max(0, slideSections.length - 1);
      const syncApi = window.RevealIframeSyncAPI;
      if (!syncApi || typeof syncApi.getStatus !== 'function') return lastIndex;

      const status = syncApi.getStatus();
      if (!status || status.role !== 'student') return lastIndex;

      if (status.capabilities?.canNavigateForward) return lastIndex;

      const boundaryH = Number(status.studentBoundary?.h ?? reveal.getIndices().h ?? 0);
      if (!Number.isFinite(boundaryH)) return lastIndex;
      return Math.max(0, Math.min(lastIndex, boundaryH));
    }

    function renderStoryboard() {
      storyboardTrack.innerHTML = '';
      const allowedMaxIndex = getAllowedMaxSlideIndex();
      const hiddenCount = Math.max(0, slideSections.length - (allowedMaxIndex + 1));
      slideSections.forEach((section, index) => {
        if (index > allowedMaxIndex) return;

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
        storyboardTrack.appendChild(button);
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

    document.addEventListener('keydown', (event) => {
      const tagName = document.activeElement?.tagName;
      if (tagName === 'INPUT' || tagName === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key.toLowerCase() === toggleKey) {
        event.preventDefault();
        toggleStoryboard();
      }
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
  }

  window.initRevealStoryboard = initRevealStoryboard;
})();
