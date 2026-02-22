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

    const reveal = config.reveal || window.Reveal;
    if (!reveal) return;

    const storyboardId = config.storyboardId;
    const trackId = config.trackId;
    const toggleKey = (config.toggleKey || 'm').toLowerCase();

    const storyboard = document.getElementById(storyboardId);
    const storyboardTrack = document.getElementById(trackId);
    if (!storyboard || !storyboardTrack) return;

    const slideSections = Array.from(document.querySelectorAll('.reveal .slides > section'));

    function renderStoryboard() {
      storyboardTrack.innerHTML = '';
      slideSections.forEach((section, index) => {
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
    }

    function updateStoryboardActive(index) {
      const thumbs = storyboardTrack.querySelectorAll('.story-thumb');
      thumbs.forEach((thumb, thumbIndex) => {
        thumb.classList.toggle('active', thumbIndex === index);
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
    }

    renderStoryboard();
    updateStoryboardActive(reveal.getIndices().h || 0);

    reveal.on('slidechanged', (event) => {
      updateStoryboardActive(event.indexh);
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
  }

  window.initRevealStoryboard = initRevealStoryboard;
})();
