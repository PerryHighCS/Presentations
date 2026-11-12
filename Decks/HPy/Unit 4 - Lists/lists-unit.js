/* ============================================================
   HPy UNIT 4 (LISTS) SHARED WIDGETS
   Loaded by every deck in this unit, before the SyncDeck bundle.

   ListsUnit.prepare(traces)  call before initSyncDeckReveal so the
                              storyboard clones see the built DOM:
                              highlights <code class="py"> blocks,
                              adds Python Tutor links to
                              .code-card[data-tutor], and builds every
                              .lt-board[data-trace].
   ListsUnit.attach(Reveal)   call from afterInit: redraws boards as
                              their hidden step fragments advance.

   A trace is { file, code, layout, cols, gap, consoleLines, sayLines, steps }.
   layout: omitted = code and console left, memory and narration right;
           'wide'  = code beside console and narration, memory full width
                     below (long lines, short programs);
           'three' = tall code left, memory and console side by side,
                     narration under both (long programs).
   Steps fold left to right; each one may set:
     line    the NEXT line to run (0 = not started, past the end = done)
     frames  [[frameName, {var: '@objId' | 'literal'}], ...]  (replaces)
     objs    {objId: [cellText, ...] | null}                  (merges)
     candy   {objId: true}  draws cells as colored candies     (merges)
     hl      {objId: {hl: [i], add: [i], bad: [i]}}            (this step only)
     ptr     [{obj, idx, name}]                                (replaces)
     print   'line' or ['line', ...]                           (appends)
     err     'Traceback text'                                  (appends, red)
     say     narration HTML                                    (this step only)
   Follows .agent/knowledge/code-tracing.md: `line` is the next line
   about to execute, so a line's effects appear on the step that
   moves past it.
   ============================================================ */
(function () {
  'use strict';

  var KEYWORDS = ['def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or',
    'is', 'import', 'from', 'as', 'pass', 'break', 'continue', 'with', 'lambda', 'assert'];
  var BUILTINS = ['print', 'len', 'range', 'list', 'type', 'min', 'max', 'sum', 'sorted',
    'reversed', 'str', 'int', 'abs', 'open'];
  var CONSTS = ['True', 'False', 'None'];
  var TOKEN = /(#.*$)|(f?'(?:[^'\\]|\\.)*'?|f?"(?:[^"\\]|\\.)*"?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|(\s+)|([\s\S])/g;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlightLine(line) {
    var out = '';
    var m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(line)) !== null) {
      if (m[0] === '') { TOKEN.lastIndex++; continue; }
      if (m[1]) out += '<span class="tok-cm">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="tok-str">' + esc(m[2]) + '</span>';
      else if (m[3]) out += '<span class="tok-num">' + esc(m[3]) + '</span>';
      else if (m[4]) {
        var w = m[4];
        if (KEYWORDS.indexOf(w) >= 0 || BUILTINS.indexOf(w) >= 0) out += '<span class="tok-kw">' + w + '</span>';
        else if (CONSTS.indexOf(w) >= 0) out += '<span class="tok-bool">' + w + '</span>';
        else out += '<span class="tok-nm">' + w + '</span>';
      } else if (m[5]) out += m[5];
      else out += '<span class="tok-op">' + esc(m[6]) + '</span>';
    }
    return out;
  }

  function highlight(code) {
    return code.split('\n').map(highlightLine).join('\n');
  }

  // Python Tutor link icon: an upright snake in a mortarboard, and an outward arrow.
  var TUTOR_ICON = '<svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">' +
    '<path d="M8 40 C2 40 3 34 9 34 C17 34 21 32 20 27 C19 22 10 23 10 17 C10 13 13 11.5 15 12" fill="none" stroke="#7cd992" stroke-width="4.2" stroke-linecap="round"/>' +
    '<path d="M8 40 C12 40 14 39.5 16 39" fill="none" stroke="#7cd992" stroke-width="2.4" stroke-linecap="round"/>' +
    '<ellipse cx="18.5" cy="12" rx="5.6" ry="4" fill="#7cd992"/>' +
    '<circle cx="20" cy="11" r="1.2" fill="#1a1410"/>' +
    '<path d="M23.8 13 l3.2 0.2 M27 13.2 l1.6 -1.2 M27 13.2 l1.6 1.2" stroke="#ff8a7e" stroke-width="1.1" stroke-linecap="round"/>' +
    '<rect x="15" y="6" width="7" height="3.2" fill="#f2b134"/>' +
    '<polygon points="10.5,5.5 18.5,2 26.5,5.5 18.5,9" fill="#f2b134"/>' +
    '<path d="M10.5 5.5 V11" stroke="#f2b134" stroke-width="1.3"/><circle cx="10.5" cy="11.6" r="1.3" fill="#f2b134"/>' +
    '<path d="M30 30 L40 20 M33.5 20 H40 V26.5" fill="none" stroke="#f2b134" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  // ── fold steps 0..k into one state ───────────────────────
  function fold(steps, k) {
    var s = { line: 0, frames: [], objs: {}, candy: {}, hl: {}, ptr: [], out: [], say: '' };
    for (var i = 0; i <= k && i < steps.length; i++) {
      var st = steps[i];
      if ('line' in st) s.line = st.line;
      if (st.frames) s.frames = st.frames;
      if (st.objs) {
        Object.keys(st.objs).forEach(function (id) {
          if (st.objs[id] === null) delete s.objs[id];
          else s.objs[id] = st.objs[id].map(String);
        });
      }
      if (st.candy) Object.keys(st.candy).forEach(function (id) { s.candy[id] = st.candy[id]; });
      s.hl = st.hl || {};
      if ('ptr' in st) s.ptr = st.ptr || [];
      if (st.print) s.out = s.out.concat([].concat(st.print).map(function (t) { return { t: t }; }));
      if (st.err) s.out = s.out.concat([].concat(st.err).map(function (t) { return { t: t, err: true }; }));
      s.say = st.say || '';
    }
    return s;
  }

  // ── layout, computed once across every step ──────────────
  var CH = 14.4;          // Fira Code advance width at 24px
  var ROW = 58;           // variable row height
  var CELL_H = 52;
  var CANDY_W = 64;

  function textW(s) { return Math.ceil(String(s).length * CH); }

  function layout(trace) {
    var steps = trace.steps;
    var frameOrder = [];
    var frameVars = {};
    var objOrder = [];
    var objCells = {};
    var objCellW = {};
    var objPtr = {};
    var candy = {};
    var nameW = 0;
    var valW = 64;
    var frameW = 0;
    for (var k = 0; k < steps.length; k++) {
      var s = fold(steps, k);
      s.frames.forEach(function (f) {
        var fname = f[0];
        if (frameOrder.indexOf(fname) < 0) { frameOrder.push(fname); frameVars[fname] = []; }
        frameW = Math.max(frameW, textW(fname) + 24);
        Object.keys(f[1]).forEach(function (v) {
          if (frameVars[fname].indexOf(v) < 0) frameVars[fname].push(v);
          nameW = Math.max(nameW, textW(v));
          var val = f[1][v];
          if (val.charAt(0) !== '@') valW = Math.max(valW, textW(val) + 24);
        });
      });
      Object.keys(s.objs).forEach(function (id) {
        if (objOrder.indexOf(id) < 0) objOrder.push(id);
        if (s.candy[id]) candy[id] = true;
        objCells[id] = Math.max(objCells[id] || 0, s.objs[id].length);
        s.objs[id].forEach(function (c) { objCellW[id] = Math.max(objCellW[id] || 56, textW(c) + 22); });
      });
      s.ptr.forEach(function (p) {
        objPtr[p.obj] = true;
        objCells[p.obj] = Math.max(objCells[p.obj] || 0, p.idx + 1);
      });
    }
    var varsX = 16;
    var slotX = varsX + nameW + 14;
    frameW = Math.max(frameW, slotX + valW + 16);

    var y = 0;
    var framePos = {};
    frameOrder.forEach(function (fname) {
      var h = 36 + frameVars[fname].length * ROW + 8;
      framePos[fname] = { y: y, h: h };
      y += h + 16;
    });
    var framesH = y;

    var objX = frameOrder.length ? frameW + (trace.gap || 100) : 0;
    var oy = 0;
    var objPos = {};
    var objsW = 0;
    objOrder.forEach(function (id) {
      var cw = candy[id] ? CANDY_W : objCellW[id];
      var h = 28 + CELL_H + (objPtr[id] ? 44 : 0);
      objPos[id] = { y: oy, h: h, cw: cw };
      objsW = Math.max(objsW, (objCells[id] || 1) * cw + 4);
      oy += h + 22;
    });

    return {
      frameOrder: frameOrder, frameVars: frameVars, framePos: framePos, frameW: frameW,
      slotX: slotX, valW: valW, objX: objX, objPos: objPos,
      width: Math.max(objX + objsW, frameW) + 4,
      height: Math.max(framesH - 16, oy - 22, 60) + (trace.memPad || 0),
    };
  }

  var CANDY = { red: '#ff6b5b', green: '#7cd992', yellow: '#f2d34a', blue: '#7cd992', orange: '#ffa94d', purple: '#c9a4ff' };

  function renderMem(L, s, uid) {
    var p = [];
    p.push('<defs><marker id="lt-ah-' + uid + '" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto">' +
      '<path class="lt-arrowhead" d="M0,0 L9,4 L0,8 Z"></path></marker></defs>');
    var arrows = [];

    // objects first, so arrows can find their targets
    var objAnchor = {};
    Object.keys(L.objPos).forEach(function (id) {
      var P = L.objPos[id];
      var cells = s.objs[id];
      if (!cells) return;
      var x0 = L.objX;
      var cy = P.y + 28;
      objAnchor[id] = { x: x0, y: cy + CELL_H / 2 };
      var hl = s.hl[id] || {};
      if (cells.length === 0) {
        p.push('<rect class="lt-cell" x="' + x0 + '" y="' + cy + '" width="96" height="' + CELL_H + '" rx="4"></rect>');
        p.push('<text class="lt-empty" x="' + (x0 + 48) + '" y="' + (cy + 34) + '" text-anchor="middle">[ ]</text>');
      }
      cells.forEach(function (c, i) {
        var x = x0 + i * P.cw;
        var cls = 'lt-cell';
        ['hl', 'add', 'bad'].forEach(function (k) { if ((hl[k] || []).indexOf(i) >= 0) cls += ' ' + k; });
        p.push('<text class="lt-idx" x="' + (x + P.cw / 2) + '" y="' + (P.y + 20) + '" text-anchor="middle">' + i + '</text>');
        p.push('<rect class="' + cls + '" x="' + x + '" y="' + cy + '" width="' + P.cw + '" height="' + CELL_H + '"></rect>');
        if (s.candy[id]) {
          var name = c.replace(/['"]/g, '');
          p.push('<circle cx="' + (x + P.cw / 2) + '" cy="' + (cy + CELL_H / 2) + '" r="19" fill="' + (CANDY[name] || '#ccc') + '"></circle>');
          p.push('<text class="lt-candy-letter" x="' + (x + P.cw / 2) + '" y="' + (cy + CELL_H / 2 + 8) + '" text-anchor="middle">' + esc(name.charAt(0).toUpperCase()) + '</text>');
        } else {
          p.push('<text class="lt-cell-val" x="' + (x + P.cw / 2) + '" y="' + (cy + 34) + '" text-anchor="middle">' + esc(c) + '</text>');
        }
      });
    });

    s.ptr.forEach(function (ptr) {
      var P = L.objPos[ptr.obj];
      var cells = s.objs[ptr.obj];
      if (!P || !cells) return;
      var past = ptr.idx >= cells.length;
      var cx = L.objX + ptr.idx * P.cw + P.cw / 2;
      var ty = P.y + 28 + CELL_H + 6;
      p.push('<path class="lt-ptr' + (past ? ' past' : '') + '" d="M' + cx + ',' + ty + ' l-10,14 l20,0 Z"></path>');
      p.push('<text class="lt-ptr-text' + (past ? ' past' : '') + '" x="' + cx + '" y="' + (ty + 38) + '" text-anchor="middle">' + esc(ptr.name + ' = ' + ptr.idx) + '</text>');
    });

    s.frames.forEach(function (f) {
      var fname = f[0];
      var FP = L.framePos[fname];
      p.push('<rect class="lt-frame-box" x="0" y="' + FP.y + '" width="' + L.frameW + '" height="' + FP.h + '" rx="8"></rect>');
      p.push('<text class="lt-frame-name" x="12" y="' + (FP.y + 26) + '">' + esc(fname) + '</text>');
      L.frameVars[fname].forEach(function (v, r) {
        if (!(v in f[1])) return;
        var val = f[1][v];
        var ry = FP.y + 36 + r * ROW;
        p.push('<text class="lt-var-name" x="' + (L.slotX - 12) + '" y="' + (ry + 31) + '" text-anchor="end">' + esc(v) + '</text>');
        p.push('<rect class="lt-var-slot" x="' + L.slotX + '" y="' + (ry + 4) + '" width="' + L.valW + '" height="44" rx="4"></rect>');
        if (val.charAt(0) === '@') {
          var sx = L.slotX + L.valW / 2;
          var sy = ry + 26;
          p.push('<circle class="lt-dot" cx="' + sx + '" cy="' + sy + '" r="6"></circle>');
          arrows.push({ sx: sx, sy: sy, id: val.slice(1) });
        } else {
          p.push('<text class="lt-var-val" x="' + (L.slotX + L.valW / 2) + '" y="' + (ry + 34) + '" text-anchor="middle">' + esc(val) + '</text>');
        }
      });
    });

    arrows.forEach(function (a) {
      var t = objAnchor[a.id];
      if (!t) return;
      var tx = t.x - 3;
      var c1 = a.sx + Math.max(60, (tx - a.sx) * 0.5);
      var c2 = tx - Math.max(50, (tx - a.sx) * 0.35);
      p.push('<path class="lt-arrow" marker-end="url(#lt-ah-' + uid + ')" d="M' + a.sx + ',' + a.sy +
        ' C' + c1 + ',' + a.sy + ' ' + c2 + ',' + t.y + ' ' + tx + ',' + t.y + '"></path>');
    });
    return p.join('');
  }

  var uidCounter = 0;

  function buildBoard(board, trace) {
    var uid = ++uidCounter;
    var L = layout(trace);
    var lines = trace.code.replace(/^\n|\n\s*$/g, '').split('\n');
    var codeRows = lines.map(function (ln, i) {
      return '<div class="code-line pending" data-ln="' + (i + 1) + '"><span class="car">&rsaquo;</span><span class="ln">' +
        (i + 1) + '</span><span>' + (highlightLine(ln) || ' ') + '</span></div>';
    }).join('');
    var consoleLines = trace.consoleLines === undefined ? 3 : trace.consoleLines;
    var code = '<div class="code-card lt-code"><div class="code-hdr"><span class="dot"></span><span class="dot"></span><span class="dot"></span>' +
      '<span style="margin-left:6px;">' + esc(trace.file || 'main.py') + '</span></div><div class="code-body">' + codeRows + '</div></div>';
    var cons = consoleLines ? '<div class="lt-console"><div class="lt-bar">console</div><div class="lt-console-out" style="height:' +
      (consoleLines * 36 + 16) + 'px;"></div></div>' : '';
    var mem = '<div class="lt-mem"><div class="lt-bar">memory</div><svg width="' + L.width + '" height="' + L.height +
      '" viewBox="0 0 ' + L.width + ' ' + L.height + '" role="img" aria-label="Variables and the list objects they refer to"></svg></div>';
    var say = '<div class="lt-say" style="min-height:' + ((trace.sayLines || 2) * 44 + 8) + 'px;"></div>';
    var html;
    if (trace.layout === 'three') {
      // tall code on the left; memory and console side by side; narration under both
      html = '<div class="lt-grid" style="--lt-cols:' + (trace.cols || 'auto auto minmax(0,1fr)') + ';">' +
        '<div style="grid-column:1;grid-row:1 / span 2;">' + code + '</div>' +
        '<div style="grid-column:2;grid-row:1;">' + mem + '</div>' +
        '<div style="grid-column:3;grid-row:1;">' + cons + '</div>' +
        '<div style="grid-column:2 / span 2;grid-row:2;">' + say + '</div></div>';
    } else if (trace.layout === 'wide') {
      // code beside console + narration, memory full width underneath
      html = '<div class="lt-grid" style="--lt-cols:' + (trace.cols || 'auto minmax(0,1fr)') + ';">' +
        '<div class="lt-left">' + code + '</div><div class="lt-right">' + cons + say + '</div>' +
        '<div style="grid-column:1 / -1;">' + mem + '</div></div>';
    } else {
      html = '<div class="lt-grid" style="--lt-cols:' + (trace.cols || 'minmax(0,1fr) minmax(0,1fr)') + ';">' +
        '<div class="lt-left">' + code + cons + '</div><div class="lt-right">' + mem + say + '</div></div>';
    }
    for (var k = 1; k < trace.steps.length; k++) html += '<span class="fragment lt-step" aria-hidden="true"></span>';
    board.innerHTML = html;
    board._lt = { trace: trace, layout: L, uid: uid, lines: lines.length };
    render(board, 0);
  }

  function render(board, k) {
    var B = board._lt;
    if (!B) return;
    var s = fold(B.trace.steps, k);
    board.querySelectorAll('.code-line').forEach(function (row) {
      var n = +row.getAttribute('data-ln');
      row.classList.toggle('current', n === s.line);
      row.classList.toggle('done', s.line > 0 && n < s.line);
      row.classList.toggle('pending', s.line === 0 || n > s.line);
    });
    var out = board.querySelector('.lt-console-out');
    if (out) {
      out.innerHTML = s.out.map(function (o) {
        return o.err ? '<span class="lt-err">' + esc(o.t) + '</span>' : esc(o.t);
      }).join('\n');
    }
    board.querySelector('.lt-mem svg').innerHTML = renderMem(B.layout, s, B.uid);
    board.querySelector('.lt-say').innerHTML = s.say;
  }

  function refresh(section) {
    if (!section) return;
    section.querySelectorAll('.lt-board').forEach(function (board) {
      render(board, board.querySelectorAll('.lt-step.visible').length);
    });
  }

  window.ListsUnit = {
    highlight: highlight,
    prepare: function (traces) {
      // A .code-card[data-tutor] gets a Python Tutor icon link in its header,
      // built from its own code so the link can never drift from what the
      // slide shows. data-tutor-setup holds lines to run first (e.g. a
      // variable the snippet uses but does not define), joined with "|".
      document.querySelectorAll('.code-card[data-tutor]').forEach(function (card) {
        var el = card.querySelector('code.py');
        var hdr = card.querySelector('.code-hdr');
        if (!el || !hdr) return;
        var setup = card.getAttribute('data-tutor-setup');
        var code = (setup ? setup.split('|').join('\n') + '\n' : '') + el.textContent.replace(/^\n/, '');
        var a = document.createElement('a');
        a.className = 'tutor-link';
        a.href = 'https://pythontutor.com/visualize.html#code=' + encodeURIComponent(code) +
          '&curInstr=0&mode=display&origin=opt-frontend.js';
        a.target = '_blank';
        a.rel = 'noopener';
        a.title = 'Open in Python Tutor';
        a.setAttribute('aria-label', 'Open in Python Tutor');
        a.innerHTML = TUTOR_ICON;
        hdr.appendChild(a);
      });
      document.querySelectorAll('code.py').forEach(function (el) {
        el.innerHTML = highlight(el.textContent.replace(/^\n/, ''));
      });
      document.querySelectorAll('.lt-board[data-trace]').forEach(function (board) {
        var t = traces && traces[board.getAttribute('data-trace')];
        if (t) buildBoard(board, t);
      });
    },
    attach: function (Reveal) {
      var go = function () { refresh(Reveal.getCurrentSlide()); };
      Reveal.on('fragmentshown', go);
      Reveal.on('fragmenthidden', go);
      Reveal.on('slidechanged', go);
      go();
    },
  };
})();
