/*
 * RevealIframeSync
 * Lightweight Reveal.js plugin for iframe-hosted instructor/student synchronization via postMessage.
 *
 * Usage:
 * <script src="https://unpkg.com/reveal.js@5/dist/reveal.js"></script>
 * <script src="../js/chalkboard/chalkboard.js"></script>
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
  const IFRAME_SYNC_VERSION = '1.1.0';

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
    const isStandalone = ctx.state.role === 'standalone';
    return {
      canNavigateBack: (isInstructor || isStandalone) ? true : !!ctx.config.studentCanNavigateBack,
      canNavigateForward: (isInstructor || isStandalone) ? true : !!ctx.config.studentCanNavigateForward,
    };
  }

  function getStudentBoundary(ctx) {
    if (!ctx.state.studentMaxIndices) return null;
    return normalizeIndices(ctx.state.studentMaxIndices);
  }

  function buildSyncStatusPayload(ctx, reason) {
    return {
      reason: reason || 'status',
      role: ctx.state.role,
      capabilities: getRoleCapabilities(ctx),
      studentBoundary: getStudentBoundary(ctx),
      // True when this iframe set the boundary locally (via the storyboard
      // boundary button) rather than receiving it from the host. Lets the
      // storyboard skip forward-navigation restrictions for the acting instructor.
      boundaryIsLocal: !!ctx.state.boundaryIsLocal,
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

  function ensurePauseOverlay(ctx) {
    if (ctx.state.pauseOverlayEl) return ctx.state.pauseOverlayEl;

    const overlay = document.createElement('div');
    overlay.setAttribute('data-reveal-sync-pause-overlay', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:2147483647',
      'display:none',
      'align-items:center',
      'justify-content:center',
      'background:rgba(0,0,0,0.92)',
      'backdrop-filter:blur(1px)',
      'color:#ffffff',
      'font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif',
      'font-size:22px',
      'letter-spacing:0.02em',
      'pointer-events:auto',
      'user-select:none',
      'cursor:not-allowed',
    ].join(';');

    document.body.appendChild(overlay);
    ctx.state.pauseOverlayEl = overlay;
    return overlay;
  }

  function createPauseInputBlocker(ctx) {
    return (event) => {
      if (!ctx.state.pauseLockedByHost) return;
      if (ctx.state.role !== 'student') return;
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
    };
  }

  function applyPauseLockUi(ctx) {
    const shouldLock = ctx.state.role === 'student' && !!ctx.state.pauseLockedByHost;
    const overlay = ensurePauseOverlay(ctx);
    overlay.style.display = shouldLock ? 'flex' : 'none';
    overlay.setAttribute('aria-hidden', shouldLock ? 'false' : 'true');

    if (shouldLock) {
      // Ensure Reveal's own pause state also mirrors lock state.
      if (!ctx.deck.isPaused?.()) {
        ctx.deck.togglePause?.(true);
      }
      // Keep storyboard hidden while hard-paused.
      window.dispatchEvent(new CustomEvent('reveal-storyboard-set', { detail: { open: false } }));
    }
  }

  function captureStudentBoundary(ctx) {
    ctx.state.studentMaxIndices = normalizeIndices(ctx.deck.getIndices());
  }

  /** Default boundary for a student before the instructor has progressed. */
  function titleSlideBoundary() {
    return { h: 0, v: 0, f: -1 };
  }

  function setStudentBoundary(ctx, indices, options = {}) {
    if (!indices) return false;

    const nextBoundary = normalizeIndices(indices);
    ctx.state.studentMaxIndices = nextBoundary;
    ctx.state.hasExplicitBoundary = true;

    // Track whether this boundary originated locally (storyboard button) so the
    // storyboard can skip forward-restriction for the acting instructor.
    ctx.state.boundaryIsLocal = !!options.localBoundary;

    // Notify the storyboard so it can display the boundary marker for all roles.
    window.dispatchEvent(new CustomEvent('reveal-storyboard-boundary-update', {
      detail: { indices: nextBoundary },
    }));

    if (ctx.state.role === 'student') {
      if (options.syncToBoundary) {
        // Jump student to the boundary slide.
        ctx.deck.slide(nextBoundary.h, nextBoundary.v, nextBoundary.f);
      } else {
        // Rubber band: if student is already past the new boundary, snap back.
        const current = normalizeIndices(ctx.deck.getIndices());
        if (compareIndices(current, nextBoundary) > 0) {
          ctx.deck.slide(nextBoundary.h, nextBoundary.v, nextBoundary.f);
        }
      }
    }

    safePostToParent(ctx, 'studentBoundaryChanged', {
      reason: options.reason || 'setStudentBoundary',
      studentBoundary: getStudentBoundary(ctx),
    });
    emitLocalStatusEvent(ctx, options.reason || 'setStudentBoundary');

    return true;
  }

  function clearStudentBoundary(ctx, reason) {
    ctx.state.studentMaxIndices = null;
    ctx.state.hasExplicitBoundary = false;
    ctx.state.boundaryIsLocal = false;
    window.dispatchEvent(new CustomEvent('reveal-storyboard-boundary-update', {
      detail: { indices: null },
    }));
    safePostToParent(ctx, 'studentBoundaryChanged', {
      reason: reason || 'clearBoundary',
      studentBoundary: null,
    });
    emitLocalStatusEvent(ctx, reason || 'clearBoundary');
  }

  function enforceStudentNavigationBoundary(ctx) {
    if (ctx.state.applyingRemote) return;
    if (ctx.state.role !== 'student') return;
    if (!ctx.state.studentMaxIndices) return;

    const current = normalizeIndices(ctx.deck.getIndices());
    const max = normalizeIndices(ctx.state.studentMaxIndices);
    const delta = compareIndices(current, max);

    const canGoBack = !!ctx.config.studentCanNavigateBack;
    // An explicit boundary (allowStudentForwardTo / setStudentBoundary) always
    // enforces the forward limit regardless of the studentCanNavigateForward
    // config flag.  Config flags only govern "follow instructor" mode.
    const canGoForward = ctx.state.hasExplicitBoundary
      ? false
      : !!ctx.config.studentCanNavigateForward;

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
          if (ctx.state.role === 'student') {
            const requestedPause = (payload.override === undefined)
              ? !deck.isPaused?.()
              : !!payload.override;
            ctx.state.pauseLockedByHost = requestedPause;
            applyPauseLockUi(ctx);
          }
          deck.togglePause?.(payload.override);
          break;
        case 'pause':
          if (ctx.state.role === 'student') {
            ctx.state.pauseLockedByHost = true;
            applyPauseLockUi(ctx);
          }
          if (!deck.isPaused?.()) deck.togglePause?.(true);
          break;
        case 'resume':
          if (ctx.state.role === 'student') {
            ctx.state.pauseLockedByHost = false;
            applyPauseLockUi(ctx);
          }
          if (deck.isPaused?.()) deck.togglePause?.(false);
          break;
        case 'setRole':
          if (payload.role === 'instructor' || payload.role === 'student') {
            ctx.state.role = payload.role;
            ctx.state.pauseLockedByHost = false;
            applyPauseLockUi(ctx);
            if (ctx.state.role === 'student') {
              // Reset boundary to title slide when demoting to student.
              ctx.state.studentMaxIndices = titleSlideBoundary();
              ctx.state.hasExplicitBoundary = false;
              ctx.state.boundaryIsLocal = false;
              // Prevent student from drawing on the chalkboard canvas.
              callChalkboard(ctx, 'configure', [{ readOnly: true }]);
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
        case 'clearBoundary':
          clearStudentBoundary(ctx, 'clearBoundary');
          break;
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
        case 'chalkboardStroke': {
          // Relay a single draw/erase event from the instructor onto student canvas.
          const { mode: strokeMode, slide: strokeSlide, event: strokeEvent } = payload;
          if (strokeMode != null && strokeSlide && strokeEvent) {
            callChalkboard(ctx, 'replayStroke', [strokeMode, strokeSlide, strokeEvent]);
          }
          break;
        }
        case 'chalkboardState':
          // Full state sync — replace storage and redraw current slide.
          if (payload.storage) {
            callChalkboard(ctx, 'loadState', [payload.storage]);
          }
          break;
        case 'requestChalkboardState': {
          // Host asks the instructor iframe for a full state snapshot.
          const cbApi = chalkboardApi();
          if (cbApi) {
            safePostToParent(ctx, 'chalkboardState', { storage: cbApi.getData() });
          }
          break;
        }
        case 'ping':
          safePostToParent(ctx, 'pong', { ok: true });
          break;
        default:
          safePostToParent(ctx, 'warn', { message: `Unknown command: ${command.name}` });
      }

      // Auto-advance boundary when instructor syncs a position — but only if no
      // explicit boundary (allowStudentForwardTo / setStudentBoundary) is in
      // effect.  An explicit grant should not be silently overwritten by a sync.
      if (shouldCaptureStudentBoundary && ctx.state.role === 'student' && !ctx.state.hasExplicitBoundary) {
        captureStudentBoundary(ctx);
        emitLocalStatusEvent(ctx, 'captureStudentBoundary');
      }

      // If a synced state explicitly carries paused=true/false, mirror lock state
      // for students so local unpause cannot override a host pause.
      if (command.name === 'setState' && ctx.state.role === 'student') {
        const statePaused = payload?.state?.paused;
        if (typeof statePaused === 'boolean') {
          ctx.state.pauseLockedByHost = statePaused;
          applyPauseLockUi(ctx);
        }
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
      safePostToParent(ctx, 'state', buildSyncStatusPayload(ctx, 'stateChanged'));
    };

    const enforcePauseLock = () => {
      if (ctx.state.applyingRemote) return;
      if (ctx.state.role !== 'student') return;
      if (!ctx.state.pauseLockedByHost) return;

      // Student tried to unpause locally while host lock is active.
      ctx.state.applyingRemote = true;
      try {
        if (!deck.isPaused?.()) {
          deck.togglePause?.(true);
        }
        applyPauseLockUi(ctx);
      } finally {
        queueMicrotask(() => {
          ctx.state.applyingRemote = false;
        });
      }
    };

    deck.on('slidechanged', emitState);
    deck.on('fragmentshown', emitState);
    deck.on('fragmenthidden', emitState);
    deck.on('paused', emitState);
    deck.on('resumed', emitState);
    deck.on('resumed', enforcePauseLock);
    deck.on('overviewshown', emitState);
    deck.on('overviewhidden', emitState);

    // Emit state to the host whenever the storyboard strip opens or closes so
    // the host can reflect the storyboard state in its own UI (overview field).
    // Bypasses applyingRemote so the host receives confirmation even when the
    // toggle was triggered by a remote command.
    const onStoryboardChanged = () => {
      safePostToParent(ctx, 'state', buildSyncStatusPayload(ctx, 'storyboardChanged'));
    };
    window.addEventListener('reveal-storyboard-changed', onStoryboardChanged);

    // When the instructor clicks a boundary button in the storyboard, relay the
    // new boundary to the host so it can propagate to the student iframe.
    // localBoundary:true lets the storyboard skip forward-restriction so the
    // acting instructor's own view is never blanked.
    const onBoundaryMoved = (event) => {
      if (ctx.state.role !== 'instructor') return;
      const indices = event.detail?.indices;
      if (!indices) {
        clearStudentBoundary(ctx, 'instructorCleared');
        return;
      }
      setStudentBoundary(ctx, indices, { reason: 'instructorSet', localBoundary: true });
    };
    window.addEventListener('reveal-storyboard-boundary-moved', onBoundaryMoved);

    // Relay chalkboard draw/erase events to the host so it can forward them
    // to student iframes. Only relayed when this frame is the instructor.
    // The plugin fires 'broadcast' CustomEvents on document; event.content
    // carries {sender, type:'draw'|'erase', mode, board, fromX/Y, toX/Y, color,
    // x, y, timestamp} — all coordinates are already in logical space
    // (divided by canvas scale) so students can replay them at any viewport size.
    const onChalkboardBroadcast = (event) => {
      if (ctx.state.role !== 'instructor') return;
      const c = event.content;
      if (!c || c.sender !== 'chalkboard-plugin') return;
      const slide = deck.getIndices();
      if (c.type === 'draw') {
        safePostToParent(ctx, 'chalkboardStroke', {
          mode: c.mode,
          slide,
          event: { type: 'draw', x1: c.fromX, y1: c.fromY, x2: c.toX, y2: c.toY, color: c.color, board: c.board, time: c.timestamp },
        });
      } else if (c.type === 'erase') {
        safePostToParent(ctx, 'chalkboardStroke', {
          mode: c.mode,
          slide,
          event: { type: 'erase', x: c.x, y: c.y, board: c.board, time: c.timestamp },
        });
      }
    };
    document.addEventListener('broadcast', onChalkboardBroadcast);

    const pauseBlocker = createPauseInputBlocker(ctx);
    const blockedEvents = ['keydown', 'keyup', 'keypress', 'wheel', 'mousedown', 'mouseup', 'click', 'touchstart', 'touchend', 'pointerdown', 'pointerup'];
    blockedEvents.forEach((eventName) => {
      window.addEventListener(eventName, pauseBlocker, true);
    });

    ctx.cleanup.push(() => {
      deck.off('slidechanged', enforceStudentBounds);
      deck.off('fragmentshown', enforceStudentBounds);
      deck.off('fragmenthidden', enforceStudentBounds);
      deck.off('slidechanged', emitState);
      deck.off('fragmentshown', emitState);
      deck.off('fragmenthidden', emitState);
      deck.off('paused', emitState);
      deck.off('resumed', emitState);
      deck.off('resumed', enforcePauseLock);
      deck.off('overviewshown', emitState);
      deck.off('overviewhidden', emitState);
      window.removeEventListener('reveal-storyboard-changed', onStoryboardChanged);
      window.removeEventListener('reveal-storyboard-boundary-moved', onBoundaryMoved);
      document.removeEventListener('broadcast', onChalkboardBroadcast);
      blockedEvents.forEach((eventName) => {
        window.removeEventListener(eventName, pauseBlocker, true);
      });
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
        // Always start as 'standalone' until the host explicitly promotes the
        // role via setRole. This prevents boundary controls from appearing in
        // any unmanaged context (direct browser, VS Code preview, etc.).
        role: 'standalone',
        applyingRemote: false,
        pauseLockedByHost: false,
        pauseOverlayEl: null,
        studentMaxIndices: titleSlideBoundary(),  // default: title slide until instructor progresses
        hasExplicitBoundary: false,  // true once allowStudentForwardTo/setStudentBoundary received
        boundaryIsLocal: false,      // true when boundary was set by storyboard button (acting instructor)
      },
    };

    wireDeckEvents(ctx);
    wireWindowMessageListener(ctx);
    applyPauseLockUi(ctx);

    const api = {
      version: IFRAME_SYNC_VERSION,
      getRole: () => ctx.state.role,
      getStudentBoundary: () => getStudentBoundary(ctx),
      getCapabilities: () => getRoleCapabilities(ctx),
      getStatus: () => buildSyncStatusPayload(ctx, 'apiGetStatus'),
      setRole: (role) => {
        if (role === 'instructor' || role === 'student') {
          ctx.state.role = role;
          ctx.state.pauseLockedByHost = false;
          applyPauseLockUi(ctx);
          if (ctx.state.role === 'student') {
            ctx.state.studentMaxIndices = titleSlideBoundary();
            ctx.state.hasExplicitBoundary = false;
            ctx.state.boundaryIsLocal = false;
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
        if (ctx.state.pauseOverlayEl) {
          ctx.state.pauseOverlayEl.remove();
          ctx.state.pauseOverlayEl = null;
        }
        ctx.cleanup.forEach((fn) => fn());
        ctx.cleanup = [];
      },
    };

    // Assign to window before announceReady so the storyboard can read the
    // API immediately when it receives the reveal-iframesync-status event.
    window.RevealIframeSyncAPI = api;

    if (config.autoAnnounceReady) {
      announceReady(ctx, 'init');
    }

    return api;
  }

  window.RevealIframeSync = window.RevealIframeSync || {
    id: 'RevealIframeSync',
    version: IFRAME_SYNC_VERSION,
    init: initPlugin,
  };
})();
