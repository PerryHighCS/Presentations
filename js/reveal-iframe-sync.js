/*
 * RevealIframeSync
 * Lightweight Reveal.js plugin for iframe-hosted instructor/student synchronization via postMessage.
 *
 * Usage:
 * <script src="https://unpkg.com/reveal.js@5/dist/reveal.js"></script>
 * <script src="https://cdn.jsdelivr.net/npm/reveal.js-plugins@latest/chalkboard/plugin.js"></script>
 * <script src="js/reveal-iframe-sync.js"></script>
 * <script>
 * Reveal.initialize({
 *   plugins: [ RevealChalkboard, RevealIframeSync ].filter(Boolean),
 *   iframeSync: {
 *     role: 'student',              // 'student' | 'instructor'
 *     deckId: '2d-arrays',          // optional logical deck id
 *     hostOrigin: '*',              // recommended: exact host origin in production
 *     allowedOrigins: ['*'],        // origins accepted for inbound commands
 *   }
 * });
 * </script>
 */

(function () {
  const IFRAME_SYNC_VERSION = '1.0.0';

  const DEFAULTS = {
    role: 'student',
    deckId: null,
    hostOrigin: '*',
    allowedOrigins: ['*'],
    messageType: 'reveal-sync',
    autoAnnounceReady: true,
    studentCanNavigateBack: true,
    studentCanNavigateForward: false,
  };

  function normalizeOrigin(origin) {
    return origin || '*';
  }

  function isAllowedOrigin(origin, allowedOrigins) {
    if (!Array.isArray(allowedOrigins) || allowedOrigins.length === 0) return false;
    if (allowedOrigins.includes('*')) return true;
    return allowedOrigins.includes(origin);
  }

  function buildMessage(ctx, action, payload) {
    return {
      type: ctx.config.messageType,
      version: IFRAME_SYNC_VERSION,
      action,
      deckId: ctx.config.deckId,
      role: ctx.state.role,
      source: 'reveal-iframe-sync',
      ts: Date.now(),
      payload: payload || {},
    };
  }

  function safePostToParent(ctx, action, payload) {
    if (!window.parent || window.parent === window) return;
    const message = buildMessage(ctx, action, payload);
    window.parent.postMessage(message, normalizeOrigin(ctx.config.hostOrigin));
  }

  function currentDeckState(deck) {
    return {
      revealState: deck.getState(),
      indices: deck.getIndices(),
      paused: !!deck.isPaused?.(),
      // Reflect the custom storyboard strip state rather than Reveal's native
      // grid overview (which is always suppressed in this setup).
      overview: document.body.classList.contains('storyboard-open'),
    };
  }

  function normalizeIndices(indices) {
    return {
      h: Number(indices?.h ?? 0),
      v: Number(indices?.v ?? 0),
      f: Number(indices?.f ?? 0),
    };
  }

  function compareIndices(a, b) {
    const left = normalizeIndices(a);
    const right = normalizeIndices(b);

    if (left.h !== right.h) return left.h - right.h;
    if (left.v !== right.v) return left.v - right.v;
    return left.f - right.f;
  }

  function getRoleCapabilities(ctx) {
    const isInstructor = ctx.state.role === 'instructor';
    return {
      canNavigateBack: isInstructor ? true : !!ctx.config.studentCanNavigateBack,
      canNavigateForward: isInstructor ? true : !!ctx.config.studentCanNavigateForward,
    };
  }

  function getStudentBoundary(ctx) {
    if (ctx.state.role !== 'student') return null;
    if (!ctx.state.studentMaxIndices) return null;
    return normalizeIndices(ctx.state.studentMaxIndices);
  }

  function buildSyncStatusPayload(ctx, reason) {
    return {
      reason: reason || 'status',
      role: ctx.state.role,
      capabilities: getRoleCapabilities(ctx),
      studentBoundary: getStudentBoundary(ctx),
      ...currentDeckState(ctx.deck),
    };
  }

  function emitLocalStatusEvent(ctx, reason) {
    window.dispatchEvent(new CustomEvent('reveal-iframesync-status', {
      detail: buildSyncStatusPayload(ctx, reason || 'localUpdate'),
    }));
  }

  function announceReady(ctx, reason) {
    const status = buildSyncStatusPayload(ctx, reason || 'init');
    safePostToParent(ctx, 'ready', status);
    emitLocalStatusEvent(ctx, reason || 'init');
  }

  function captureStudentBoundary(ctx) {
    ctx.state.studentMaxIndices = normalizeIndices(ctx.deck.getIndices());
  }

  function setStudentBoundary(ctx, indices, options = {}) {
    if (ctx.state.role !== 'student') return false;
    if (!indices) return false;

    const nextBoundary = normalizeIndices(indices);
    ctx.state.studentMaxIndices = nextBoundary;

    if (options.syncToBoundary) {
      ctx.deck.slide(nextBoundary.h, nextBoundary.v, nextBoundary.f);
    }

    safePostToParent(ctx, 'studentBoundaryChanged', {
      reason: options.reason || 'setStudentBoundary',
      studentBoundary: getStudentBoundary(ctx),
    });
    emitLocalStatusEvent(ctx, options.reason || 'setStudentBoundary');

    return true;
  }

  function enforceStudentNavigationBoundary(ctx) {
    if (ctx.state.applyingRemote) return;
    if (ctx.state.role !== 'student') return;

    const canGoBack = !!ctx.config.studentCanNavigateBack;
    const canGoForward = !!ctx.config.studentCanNavigateForward;

    if (canGoBack && canGoForward) return;

    if (!ctx.state.studentMaxIndices) {
      captureStudentBoundary(ctx);
      return;
    }

    const current = normalizeIndices(ctx.deck.getIndices());
    const max = normalizeIndices(ctx.state.studentMaxIndices);
    const delta = compareIndices(current, max);

    let shouldReset = false;
    if (!canGoForward && delta > 0) shouldReset = true;
    if (!canGoBack && delta < 0) shouldReset = true;

    if (!shouldReset) return;

    ctx.state.applyingRemote = true;
    try {
      ctx.deck.slide(max.h, max.v, max.f);
    } finally {
      queueMicrotask(() => {
        ctx.state.applyingRemote = false;
      });
    }
  }

  function chalkboardApi() {
    return window.RevealChalkboard || null;
  }

  function callChalkboard(ctx, method, args = []) {
    const api = chalkboardApi();
    if (!api) {
      safePostToParent(ctx, 'warn', { message: 'RevealChalkboard not loaded' });
      return false;
    }
    if (typeof api[method] !== 'function') {
      safePostToParent(ctx, 'warn', { message: `RevealChalkboard.${method} not available` });
      return false;
    }
    try {
      api[method](...(Array.isArray(args) ? args : []));
      return true;
    } catch (error) {
      safePostToParent(ctx, 'warn', { message: `RevealChalkboard.${method} failed`, error: String(error) });
      return false;
    }
  }

  function applyCommand(ctx, command) {
    const deck = ctx.deck;
    const payload = command.payload || {};
    let shouldCaptureStudentBoundary = false;

    if (!deck) return;

    ctx.state.applyingRemote = true;
    try {
      switch (command.name) {
        case 'next':
          deck.next();
          shouldCaptureStudentBoundary = true;
          break;
        case 'prev':
          deck.prev();
          shouldCaptureStudentBoundary = true;
          break;
        case 'slide':
          deck.slide(payload.h ?? 0, payload.v ?? 0, payload.f);
          shouldCaptureStudentBoundary = true;
          break;
        case 'setState':
          if (payload.state) {
            // Strip `overview` before applying — Reveal's built-in grid overview
            // should never be activated on the receiving end. Instead, route the
            // overview flag to the custom bottom-of-screen storyboard strip.
            const { overview, ...safeState } = payload.state;
            deck.setState(safeState);
            if (overview !== undefined) {
              window.dispatchEvent(new CustomEvent('reveal-storyboard-set', { detail: { open: !!overview } }));
            }
          }
          shouldCaptureStudentBoundary = true;
          break;

        // overview commands → custom storyboard strip (not Reveal's built-in grid).
        // The container site can send these directly from a button or toolbar.
        case 'toggleOverview':
          window.dispatchEvent(new CustomEvent('reveal-storyboard-toggle'));
          break;

        case 'showOverview':
          window.dispatchEvent(new CustomEvent('reveal-storyboard-set', { detail: { open: true } }));
          break;

        case 'hideOverview':
          window.dispatchEvent(new CustomEvent('reveal-storyboard-set', { detail: { open: false } }));
          break;
        case 'togglePause':
          deck.togglePause?.(payload.override);
          break;
        case 'pause':
          if (!deck.isPaused?.()) deck.togglePause?.(true);
          break;
        case 'resume':
          if (deck.isPaused?.()) deck.togglePause?.(false);
          break;
        case 'setRole':
          if (payload.role === 'instructor' || payload.role === 'student') {
            ctx.state.role = payload.role;
            if (ctx.state.role === 'student') {
              captureStudentBoundary(ctx);
            }
            safePostToParent(ctx, 'roleChanged', { role: ctx.state.role });
            announceReady(ctx, 'roleChanged');
          }
          break;
        case 'allowStudentForwardTo': {
          const target = payload.indices || payload;
          setStudentBoundary(ctx, target, {
            syncToBoundary: !!payload.syncToBoundary,
            reason: 'allowStudentForwardTo',
          });
          break;
        }
        case 'setStudentBoundary': {
          const target = payload.indices || payload;
          setStudentBoundary(ctx, target, {
            syncToBoundary: !!payload.syncToBoundary,
            reason: 'setStudentBoundary',
          });
          break;
        }
        case 'chalkboardCall':
          if (payload.method) {
            callChalkboard(ctx, payload.method, payload.args || []);
          }
          break;
        case 'toggleChalkboard':
          callChalkboard(ctx, 'toggleChalkboard');
          break;
        case 'toggleNotesCanvas':
          callChalkboard(ctx, 'toggleNotesCanvas');
          break;
        case 'clearChalkboard':
          callChalkboard(ctx, 'clear');
          break;
        case 'resetChalkboard':
          callChalkboard(ctx, 'reset');
          break;
        case 'ping':
          safePostToParent(ctx, 'pong', { ok: true });
          break;
        default:
          safePostToParent(ctx, 'warn', { message: `Unknown command: ${command.name}` });
      }

      if (shouldCaptureStudentBoundary && ctx.state.role === 'student') {
        captureStudentBoundary(ctx);
        emitLocalStatusEvent(ctx, 'captureStudentBoundary');
      }
    } finally {
      queueMicrotask(() => {
        ctx.state.applyingRemote = false;
      });
    }
  }

  function wireDeckEvents(ctx) {
    const deck = ctx.deck;

    const enforceStudentBounds = () => {
      enforceStudentNavigationBoundary(ctx);
    };

    deck.on('slidechanged', enforceStudentBounds);
    deck.on('fragmentshown', enforceStudentBounds);
    deck.on('fragmenthidden', enforceStudentBounds);

    const emitState = () => {
      if (ctx.state.applyingRemote) return;
      if (ctx.state.role !== 'instructor') return;
      safePostToParent(ctx, 'state', currentDeckState(deck));
    };

    deck.on('slidechanged', emitState);
    deck.on('fragmentshown', emitState);
    deck.on('fragmenthidden', emitState);
    deck.on('paused', emitState);
    deck.on('resumed', emitState);
    deck.on('overviewshown', emitState);
    deck.on('overviewhidden', emitState);

    // Emit state to the host whenever the storyboard strip opens or closes so
    // the host can reflect the storyboard state in its own UI (overview field).
    const onStoryboardChanged = () => emitState();
    window.addEventListener('reveal-storyboard-changed', onStoryboardChanged);

    ctx.cleanup.push(() => {
      deck.off('slidechanged', enforceStudentBounds);
      deck.off('fragmentshown', enforceStudentBounds);
      deck.off('fragmenthidden', enforceStudentBounds);
      deck.off('slidechanged', emitState);
      deck.off('fragmentshown', emitState);
      deck.off('fragmenthidden', emitState);
      deck.off('paused', emitState);
      deck.off('resumed', emitState);
      deck.off('overviewshown', emitState);
      deck.off('overviewhidden', emitState);
      window.removeEventListener('reveal-storyboard-changed', onStoryboardChanged);
    });
  }

  function wireWindowMessageListener(ctx) {
    const onMessage = (event) => {
      if (!isAllowedOrigin(event.origin, ctx.config.allowedOrigins)) return;
      const data = event.data;
      if (!data || data.type !== ctx.config.messageType) return;

      if (ctx.config.deckId && data.deckId && data.deckId !== ctx.config.deckId) return;

      if (data.action === 'command' && data.payload) {
        applyCommand(ctx, data.payload);
      }

      if (data.action === 'requestState') {
        safePostToParent(ctx, 'state', buildSyncStatusPayload(ctx, 'requestState'));
      }
    };

    window.addEventListener('message', onMessage);
    ctx.cleanup.push(() => window.removeEventListener('message', onMessage));
  }

  function initPlugin(deck) {
    const config = {
      ...DEFAULTS,
      ...(deck.getConfig().iframeSync || {}),
    };

    const ctx = {
      deck,
      config,
      cleanup: [],
      state: {
        role: config.role === 'instructor' ? 'instructor' : 'student',
        applyingRemote: false,
        studentMaxIndices: null,
      },
    };

    if (ctx.state.role === 'student') {
      captureStudentBoundary(ctx);
    }

    wireDeckEvents(ctx);
    wireWindowMessageListener(ctx);

    if (config.autoAnnounceReady) {
      announceReady(ctx, 'init');
    }

    const api = {
      version: IFRAME_SYNC_VERSION,
      getRole: () => ctx.state.role,
      getStudentBoundary: () => getStudentBoundary(ctx),
      getCapabilities: () => getRoleCapabilities(ctx),
      getStatus: () => buildSyncStatusPayload(ctx, 'apiGetStatus'),
      setRole: (role) => {
        if (role === 'instructor' || role === 'student') {
          ctx.state.role = role;
          if (ctx.state.role === 'student') {
            captureStudentBoundary(ctx);
          }
          safePostToParent(ctx, 'roleChanged', { role: ctx.state.role });
          announceReady(ctx, 'apiSetRole');
        }
      },
      sendState: () => safePostToParent(ctx, 'state', currentDeckState(deck)),
      sendCustom: (eventName, payload) => safePostToParent(ctx, eventName, payload || {}),
      chalkboard: {
        call: (method, ...args) => callChalkboard(ctx, method, args),
        toggleBoard: () => callChalkboard(ctx, 'toggleChalkboard'),
        toggleNotes: () => callChalkboard(ctx, 'toggleNotesCanvas'),
        clear: () => callChalkboard(ctx, 'clear'),
        reset: () => callChalkboard(ctx, 'reset'),
      },
      destroy: () => {
        ctx.cleanup.forEach((fn) => fn());
        ctx.cleanup = [];
      },
    };

    window.RevealIframeSyncAPI = api;
    return api;
  }

  window.RevealIframeSync = window.RevealIframeSync || {
    id: 'RevealIframeSync',
    version: IFRAME_SYNC_VERSION,
    init: initPlugin,
  };
})();
