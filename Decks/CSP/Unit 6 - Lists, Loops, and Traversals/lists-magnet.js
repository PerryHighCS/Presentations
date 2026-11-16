/* ================================================================
   UNIT 6 LIST MAGNET TRACE BOARDS (shared by every Unit 6 deck)
   Adapted from the 4.1 Variables Explore trace boards. Each
   section[data-trace-board="key"] is rendered from traces[key]: a
   numbered Program, a Console (only if the trace prints), a narration
   panel, and a Memory Trace where each list is drawn as the 7-cell
   dry-erase magnet the pairs use on their whiteboards.

   Usage, before initSyncDeckReveal:   ListMagnet.prepare(TRACES);
   (or ListMagnet.prepare(TRACES, { plain: true }) to draw each list at
   its real length, without the magnet frame, for computer lessons)
   and in afterInit:                    ListMagnet.attach(Reveal);

   Every step becomes one hidden Reveal fragment. The board state is
   recomputed by folding steps 0..k, so back-navigation and host sync
   work without bookkeeping.

   Code tracing convention: `line` is the NEXT line to execute. A line's
   effects are applied on the step that moves the caret past it. A step
   that keeps the caret on the same line is the look-up / evaluate work
   before the line completes.

   Trace fields: code (array of lines), start (first line), steps,
   sideW (optional narration column width in px, for long lines).
   Step fields (all optional):
     line   next line to run (persists until changed)
     list   {name: [values]}  the list's full contents after this step;
            cells that differ from the previous step are highlighted
     read   {name: [indexes]}  cells being looked up on this step
            (an index past the end highlights an empty, shaded cell)
     decl   ['name', ...]      add empty variable columns
     set    {name: value}      append a value to a variable column
     out    console line
     lift   {lineNo: [values per flap]}  [[name]] flaps (plain variables
            only; list accesses never get flaps)
     work   narration HTML for this step only
   Values: numbers, strings (shown with quotes), null = undefined.
   Static magnets: <div data-magnet="name" data-values='[...]'>, with
   optional data-small and data-noname.
   ================================================================ */

window.ListMagnet = (function () {
  var MAGNET_CELLS = 7;
  var TRACES = {};
  var PLAIN = false;
  var KEYWORDS = { 'function': 1, 'var': 1 };
  var TOKEN_RE = /\[\[(\w+)\]\]|"[^"]*"|\b\d+(?:\.\d+)?\b|[A-Za-z_$À-ɏ][\w$À-ɏ]*|\s+|./g;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function fmtValue(v) {
    if (v === null) return { cls: 'mv-undef', text: 'undefined' };
    if (typeof v === 'string') return { cls: 'mv-str', text: '"' + v + '"' };
    return { cls: 'mv-num', text: String(v) };
  }

  // Highlight one line of the JavaScript subset used in this lesson.
  // [[name]] becomes a TraceLift flap (numbered per line).
  function highlight(src) {
    var out = '';
    var flapIdx = 0;
    var m;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(src)) !== null) {
      var tok = m[0];
      if (m[1]) {
        out += '<span class="flap" data-flap="' + (flapIdx++) + '"><span class="flap-name">' +
          esc(m[1]) + '</span><span class="flap-val"></span></span>';
      } else if (tok.charAt(0) === '"') {
        out += '<span class="tk-str">' + esc(tok) + '</span>';
      } else if (/^\d/.test(tok)) {
        out += '<span class="tk-num">' + tok + '</span>';
      } else if (/^[A-Za-z_$]/.test(tok)) {
        var rest = src.slice(TOKEN_RE.lastIndex);
        if (KEYWORDS[tok]) out += '<span class="tk-kw">' + tok + '</span>';
        else if (/^\s*\(/.test(rest) || tok === 'console') out += '<span class="tk-fn">' + tok + '</span>';
        else out += '<span class="tk-nm">' + tok + '</span>';
      } else if (/^\s+$/.test(tok)) {
        out += tok;
      } else {
        out += '<span class="tk-p">' + esc(tok) + '</span>';
      }
    }
    return out;
  }

  // One list magnet: name, length, and 7 cells over an index row.
  function magnetHTML(name, vals, opts) {
    opts = opts || {};
    var changed = opts.changed || {};
    var read = opts.read || {};
    var html = '<div class="list-block' + (opts.small ? ' mag-sm' : '') + '">';
    if (!opts.noname) {
      html += '<div class="list-head"><span class="list-name">' + esc(name) + '</span>' +
        '<span class="list-len">length <b>' + vals.length + '</b></span></div>';
    }
    // Magnet mode always draws the 7 cells of the physical magnet. Plain
    // mode draws only the list's real cells, plus a dashed ghost cell for
    // any index read past the end.
    var plain = opts.plain != null ? opts.plain : PLAIN;
    var count = MAGNET_CELLS;
    if (plain) {
      count = vals.length;
      Object.keys(read).forEach(function (k) { if (read[k]) count = Math.max(count, Number(k) + 1); });
    }
    html += '<div class="magnet' + (plain ? ' plain' : '') + '">';
    for (var i = 0; i < count; i++) {
      var inList = i < vals.length;
      var cls = 'mag-cell';
      var text = '';
      if (inList) {
        var fv = fmtValue(vals[i]);
        cls += ' ' + fv.cls;
        text = fv.text;
      } else {
        cls += plain ? ' ghost' : ' out';
      }
      if (changed[i]) cls += ' changed';
      if (read[i]) cls += ' read';
      html += '<div class="' + cls + '">' + esc(text) + '</div>' +
        '<div class="mag-idx' + (inList ? '' : (plain ? ' ghost' : ' out')) + '">' + i + '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function buildBoard(section) {
    var data = TRACES[section.getAttribute('data-trace-board')];
    if (!data) return;
    var inner = section.querySelector('.slide-inner');

    var board = el('div', 'board');
    if (data.sideW) board.style.setProperty('--side-w', data.sideW + 'px');
    var main = el('div', 'board-main');
    var codeCard = el('div', 'trace-code');
    codeCard.appendChild(el('div', 'panel-hdr', 'Program'));
    var body = el('div', 'code-body');
    data.code.forEach(function (src, i) {
      var row = el('div', 'code-line');
      row.setAttribute('data-ln', String(i + 1));
      row.innerHTML = '<span class="car"></span><span class="ln">' + (i + 1) + '</span><span class="src">' + highlight(src) + '</span>';
      body.appendChild(row);
    });
    codeCard.appendChild(body);
    main.appendChild(codeCard);
    board.appendChild(main);

    var side = el('div', 'board-side');
    data.hasConsole = data.steps.some(function (s) { return s.out != null; });
    if (data.hasConsole) {
      var con = el('div', 'panel con-panel');
      con.appendChild(el('div', 'panel-hdr', 'Console'));
      con.appendChild(el('div', 'con-body'));
      side.appendChild(con);
    }
    side.appendChild(el('div', 'work-panel'));
    board.appendChild(side);

    var mem = el('div', 'panel mem-panel');
    mem.appendChild(el('div', 'panel-hdr', 'Memory Trace'));
    mem.appendChild(el('div', 'mem-body'));
    board.appendChild(mem);
    inner.appendChild(board);

    data.steps.forEach(function () {
      var frag = el('span', 'fragment trace-step');
      frag.setAttribute('aria-hidden', 'true');
      inner.appendChild(frag);
    });

    data.named = {};
    data.named[data.start] = true;
    data.steps.forEach(function (s) { if (s.line) data.named[s.line] = true; });
  }

  function computeState(data, k) {
    var st = {
      line: data.start, work: '', vars: [], lists: [], listVals: {},
      changed: {}, read: {}, out: [], lifts: {}, visited: {}
    };
    st.visited[data.start] = true;

    function column(name) {
      for (var i = 0; i < st.vars.length; i++) if (st.vars[i].name === name) return st.vars[i];
      var col = { name: name, vals: [] };
      st.vars.push(col);
      return col;
    }

    for (var i = 0; i < k && i < data.steps.length; i++) {
      var s = data.steps[i];
      st.changed = {};
      st.read = s.read || {};
      (s.decl || []).forEach(function (n) { column(n); });
      if (s.set) Object.keys(s.set).forEach(function (n) { column(n).vals.push(s.set[n]); });
      if (s.list) Object.keys(s.list).forEach(function (n) {
        var prev = st.listVals[n];
        var next = s.list[n];
        if (!prev) st.lists.push(n);
        var ch = {};
        for (var c = 0; c < MAGNET_CELLS; c++) {
          var a = prev && c < prev.length ? prev[c] : undefined;
          var b = c < next.length ? next[c] : undefined;
          if (a !== b) ch[c] = true;
        }
        st.changed[n] = ch;
        st.listVals[n] = next.slice();
      });
      if (s.out != null) st.out.push(s.out);
      if (s.lift) Object.keys(s.lift).forEach(function (ln) { st.lifts[ln] = s.lift[ln]; });
      if (s.line) { st.line = s.line; st.visited[s.line] = true; }
      st.work = s.work || '';
    }
    return st;
  }

  function toSet(arr) {
    var o = {};
    (arr || []).forEach(function (i) { o[i] = true; });
    return o;
  }

  function render(section) {
    var data = TRACES[section.getAttribute('data-trace-board')];
    if (!data || !data.named) return;
    var k = section.querySelectorAll('.trace-step.visible').length;
    var st = computeState(data, k);

    section.classList.toggle('is-checking', k > 0);

    Array.prototype.forEach.call(section.querySelectorAll('.code-line[data-ln]'), function (row) {
      var ln = Number(row.getAttribute('data-ln'));
      row.classList.remove('current', 'done', 'pending', 'context');
      if (ln === st.line) row.classList.add('current');
      else if (st.visited[ln]) row.classList.add('done');
      else if (data.named[ln]) row.classList.add('pending');
      else row.classList.add('context');

      var vals = st.lifts[ln] || [];
      Array.prototype.forEach.call(row.querySelectorAll('.flap'), function (flap) {
        var idx = Number(flap.getAttribute('data-flap'));
        var valEl = flap.querySelector('.flap-val');
        if (idx < vals.length) {
          var f = fmtValue(vals[idx]);
          valEl.className = 'flap-val ' + f.cls;
          valEl.textContent = f.text;
          flap.classList.add('lifted');
        } else {
          valEl.textContent = '';
          flap.classList.remove('lifted');
        }
      });
    });

    var html = '';
    st.lists.forEach(function (n) {
      html += magnetHTML(n, st.listVals[n], { changed: st.changed[n], read: toSet(st.read[n]) });
    });
    st.vars.forEach(function (col) {
      html += '<div class="mem-col"><div class="mem-col-name">' + esc(col.name) + '</div>';
      if (!col.vals.length) html += '<div class="mem-val blank"></div>';
      col.vals.forEach(function (v, i) {
        var fv = fmtValue(v);
        html += '<div class="mem-val ' + fv.cls + (i < col.vals.length - 1 ? ' struck' : '') + '">' + esc(fv.text) + '</div>';
      });
      html += '</div>';
    });
    section.querySelector('.mem-body').innerHTML = html || '<div class="mem-empty">Nothing in memory yet.</div>';

    var conBody = section.querySelector('.con-body');
    if (conBody) {
      conBody.innerHTML = st.out.length
        ? st.out.map(function (line) { return '<div>' + esc(line) + '</div>'; }).join('')
        : '<div class="con-empty">No output yet.</div>';
    }

    section.querySelector('.work-panel').innerHTML = st.work;
  }

  function liveBoards() {
    return Array.prototype.filter.call(
      document.querySelectorAll('section[data-trace-board]'),
      function (s) { return !s.closest('#storyboard'); }
    );
  }

  // opts.plain: draw lists at their real length instead of as the 7-cell
  // whiteboard magnet (for computer lessons with no magnets).
  function prepare(traces, opts) {
    TRACES = traces || {};
    PLAIN = !!(opts && opts.plain);
    // Build boards, static magnets, and highlighted code before Reveal scans fragments.
    liveBoards().forEach(buildBoard);
    Array.prototype.forEach.call(document.querySelectorAll('[data-magnet]'), function (node) {
      node.innerHTML = magnetHTML(node.getAttribute('data-magnet'), JSON.parse(node.getAttribute('data-values')), {
        small: node.hasAttribute('data-small'),
        noname: node.hasAttribute('data-noname'),
        plain: node.hasAttribute('data-plain') ? true : undefined
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-hl]'), function (node) {
      node.innerHTML = node.textContent.split('\n').map(highlight).join('\n');
    });
    renderAll();
  }

  function renderAll() { liveBoards().forEach(render); }

  function attach(Reveal) {
    ['fragmentshown', 'fragmenthidden', 'slidechanged', 'ready'].forEach(function (evt) {
      Reveal.on(evt, renderAll);
    });
    renderAll();
  }

  return { prepare: prepare, attach: attach, render: renderAll };
})();
