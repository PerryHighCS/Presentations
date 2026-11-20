/* ============================================================
   SILICON IN CONTROL · SHARED SIMULATORS
   Loaded by the decks in Decks/AR2/Silicon in Control/ with
   <script src="semiconductor-sims.js"></script> before the
   deck's own script. Styles live in this folder's theme.css.

   buildDopingLab(root)   Doping Lab: a silicon lattice with
                          electrons, holes, dopants, an applied
                          voltage, temperature, and a PN junction.
                          root[data-mode="junction"] locks it to
                          the junction with a bias slider (Day 3).
   buildDiodeBench(root)  Diode Bench: supply, 1 kOhm resistor,
                          and a silicon diode, with a virtual DMM
                          and a current versus voltage plot.
   initTaskPager(el)      One-task-at-a-time pager.
   startSimLoop(Reveal, sims)
                          One requestAnimationFrame loop that ticks
                          only the sims on the current slide and
                          resets them all on slidechanged.

   Every builder draws into its SVGs before initSyncDeckReveal
   runs, so storyboard thumbnails show the drawing.
   ============================================================ */

(function (global) {
    'use strict';
    var NS = 'http://www.w3.org/2000/svg';
    var MINUS = '−';

    function el(tag, attrs, parent) {
        var e = document.createElementNS(NS, tag);
        for (var k in attrs) e.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(e);
        return e;
    }
    function fmtSigned(v, digits, unit) {
        return (v < 0 ? MINUS : '') + Math.abs(v).toFixed(digits) + unit;
    }
    function gauss() {
        var u = 1 - Math.random(), v = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    /* ─── Task pager ─────────────────────────────────────── */
    function initTaskPager(box) {
        var items = Array.prototype.map.call(box.querySelectorAll('ol > li'), function (li) { return li.innerHTML; });
        var i = 0;
        var count = box.querySelector('.tp-count'), text = box.querySelector('.tp-text');
        var prev = box.querySelector('.tp-prev'), next = box.querySelector('.tp-next');
        function show() {
            count.textContent = 'TASK ' + (i + 1) + ' OF ' + items.length;
            text.innerHTML = items[i];
            prev.disabled = i === 0;
            next.disabled = i === items.length - 1;
        }
        prev.addEventListener('click', function () { if (i > 0) { i--; show(); } });
        next.addEventListener('click', function () { if (i < items.length - 1) { i++; show(); } });
        show();
    }

    /* ─── Shared animation loop ──────────────────────────── */
    function startSimLoop(Reveal, sims) {
        var last = performance.now();
        function frame(now) {
            // The first frame's timestamp can be earlier than the start time,
            // so clamp at 0: a negative step makes sqrt(dt) NaN in the random walk.
            var dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
            last = now;
            var cur = Reveal.getCurrentSlide();
            sims.forEach(function (s) { if (s.tick && cur && cur.contains(s.root)) s.tick(dt); });
            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
        Reveal.on('slidechanged', function () { sims.forEach(function (s) { if (s.reset) s.reset(); }); });
    }

    /* ─── Doping Lab ─────────────────────────────────────────
       Geometry: a 14 x 6 lattice of silicon atoms between two
       metal contacts. Electrons move continuously (random walk
       plus drift). Holes live on bond sites and move only by
       hopping to a neighboring bond, and each hop draws a short
       streak showing the electron that filled it moving the
       other way. A carrier that touches one of the opposite type
       recombines with it.

       Uniform modes (pure, n, p): the applied voltage V puts the
       + terminal on the left when V > 0. Electrons drift toward
       +, holes toward -. Carriers leaving one contact re-enter
       at the other, and each crossing counts toward the current.

       Junction mode: P-type on the left, N-type on the right,
       bias V > 0 is forward (+ on the P side). The barrier
       phi = max(0.03, 0.7 - V) sets the depletion half-width
       d = 55 * sqrt(phi / 0.7), and inside that band the field
       pushes electrons back to the N side and holes back to the
       P side. Under forward bias, each recombination is fed by a
       new electron at the N contact and a new hole at the P
       contact, which is the current. Under reverse bias, pairs
       generated inside the band are swept apart, which is the
       tiny leakage current.

       Thermal generation: pairs appear at a rate that doubles
       about every 12 degrees C, starting near one pair every
       eight seconds at 25 degrees C.
       ───────────────────────────────────────────────────── */
    function buildDopingLab(root) {
        var junctionOnly = root.dataset.mode === 'junction';
        var svg = root.querySelector('[data-role="lattice"]');
        function q(r) { return root.querySelector('[data-role="' + r + '"]'); }

        var X0 = 60, X1 = 900, Y0 = 34, Y1 = 386, MID = 480;
        var COLS = 14, ROWS = 6, AX = 90, AY = 60, S = 60;
        var MAXC = 80, D = 85, KD = 160;
        var P_SIDE = [[1, 1], [3, 4], [6, 1], [2, 3], [6, 4], [4, 0]];
        var N_SIDE = [[7, 2], [10, 0], [12, 3], [7, 5], [13, 1], [11, 4]];
        var FORM = 2.5;

        // Static drawing
        var gBand = el('g', {}, svg);
        var band = el('rect', { x: MID, y: Y0 - 14, width: 0, height: Y1 - Y0 + 28, class: 'dl-band' }, gBand);
        var bandLbl = el('text', { x: MID, y: Y0 - 22, class: 'dl-band-lbl', 'text-anchor': 'middle' }, gBand);
        bandLbl.textContent = 'Depletion region';
        var gBonds = el('g', { class: 'dl-bonds' }, svg);
        var atoms = [];
        for (var j = 0; j < ROWS; j++) {
            for (var i = 0; i < COLS; i++) {
                var x = AX + S * i, y = AY + S * j;
                if (i < COLS - 1) el('line', { x1: x, y1: y, x2: x + S, y2: y }, gBonds);
                if (j < ROWS - 1) el('line', { x1: x, y1: y, x2: x, y2: y + S }, gBonds);
            }
        }
        var gAtoms = el('g', {}, svg);
        for (j = 0; j < ROWS; j++) {
            for (i = 0; i < COLS; i++) {
                var g = el('g', { class: 'dl-atom', 'data-i': i, 'data-j': j }, gAtoms);
                var c = el('circle', { cx: AX + S * i, cy: AY + S * j, r: 19 }, g);
                var t = el('text', { x: AX + S * i, y: AY + S * j + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, g);
                atoms.push({ i: i, j: j, x: AX + S * i, y: AY + S * j, g: g, c: c, t: t, kind: 'Si' });
            }
        }
        var junctionLine = el('line', { x1: MID, y1: Y0 - 14, x2: MID, y2: Y1 + 14, class: 'dl-junction' }, svg);
        var sideP = el('text', { x: 270, y: Y1 + 52, class: 'dl-side', 'text-anchor': 'middle' }, svg);
        sideP.textContent = 'P-type';
        var sideN = el('text', { x: 690, y: Y1 + 52, class: 'dl-side', 'text-anchor': 'middle' }, svg);
        sideN.textContent = 'N-type';
        el('rect', { x: 30, y: Y0 - 14, width: 18, height: Y1 - Y0 + 28, class: 'dl-contact' }, svg);
        el('rect', { x: 912, y: Y0 - 14, width: 18, height: Y1 - Y0 + 28, class: 'dl-contact' }, svg);
        var termL = el('text', { x: 39, y: Y1 + 52, class: 'dl-term', 'text-anchor': 'middle' }, svg);
        var termR = el('text', { x: 921, y: Y1 + 52, class: 'dl-term', 'text-anchor': 'middle' }, svg);
        var gStreak = el('g', {}, svg);
        var gCar = el('g', {}, svg);

        var mode = junctionOnly ? 'pn' : 'pure';
        var V = 0, T = 25, d = 0, carriers = [], events = [], streaks = [], genAcc = 0, clock = 0, forming = 0;
        var SLOW = 0.35, speed = SLOW, paused = false, tracked = null, lostT = 0, trailPts = [], trailT = 0;
        var trail = el('polyline', { class: 'dl-trail', points: '' }, svg);
        svg.insertBefore(trail, gCar);

        function atomAt(i, j) { return atoms[j * COLS + i]; }
        function bondSitesNear(a) {
            var s = [];
            if (a.i < COLS - 1) s.push({ x: a.x + S / 2, y: a.y });
            if (a.i > 0) s.push({ x: a.x - S / 2, y: a.y });
            if (a.j < ROWS - 1) s.push({ x: a.x, y: a.y + S / 2 });
            if (a.j > 0) s.push({ x: a.x, y: a.y - S / 2 });
            return s;
        }
        function addCarrier(type, x, y, born) {
            if (carriers.length >= MAXC) return null;
            var c = { type: type, x: x, y: y, hopT: Math.random() * 0.2, age: born ? 0 : 1 };
            c.el = type === 'e'
                ? el('circle', { cx: x, cy: y, r: 8, class: 'dl-e' }, gCar)
                : el('circle', { cx: x, cy: y, r: 10, class: 'dl-h' }, gCar);
            carriers.push(c);
            c.el.dataset.k = 'c';
            if (born) flash(x, y, 'dl-flash-gen');
            return c;
        }
        function removeCarrier(c) {
            c.el.remove(); c.dead = true;
            if (c === tracked) { tracked = null; lostT = 4; trailPts = []; trail.setAttribute('points', ''); }
        }
        function untrack() {
            if (tracked) tracked.el.classList.remove('dl-tracked');
            tracked = null; lostT = 0; trailPts = []; trail.setAttribute('points', '');
        }
        function flash(x, y, cls) {
            var f = el('circle', { cx: x, cy: y, r: 12, class: cls }, gStreak);
            streaks.push({ el: f, life: 0.5, grow: true });
        }
        function addHoleNear(a) {
            var s = bondSitesNear(a);
            var p = s[Math.floor(Math.random() * s.length)];
            return addCarrier('h', p.x, p.y);
        }
        function setKind(a, kind) {
            a.kind = kind;
            a.g.setAttribute('class', 'dl-atom' + (kind === 'P' ? ' is-p' : kind === 'B' ? ' is-b' : ''));
            a.t.textContent = kind === 'P' ? 'P⁺' : kind === 'B' ? 'B⁻' : '';
        }
        function clearAll() {
            untrack();
            carriers.forEach(removeCarrier);
            lostT = 0;
            carriers = [];
            atoms.forEach(function (a) { setKind(a, 'Si'); a.g.classList.remove('exposed'); });
            events = [];
            d = 0;
        }
        function dopants(kind) { return atoms.filter(function (a) { return a.kind === kind; }); }
        function addDopant(a, kind) {
            setKind(a, kind);
            if (kind === 'P') addCarrier('e', a.x + 14 * gauss(), a.y + 14 * gauss());
            else addHoleNear(a);
        }
        function removeDopant(a) {
            var type = a.kind === 'P' ? 'e' : 'h';
            setKind(a, 'Si');
            var best = null, bd = 1e9;
            carriers.forEach(function (c) {
                if (c.type !== type || c.dead) return;
                var dd = (c.x - a.x) * (c.x - a.x) + (c.y - a.y) * (c.y - a.y);
                if (dd < bd) { bd = dd; best = c; }
            });
            if (best) removeCarrier(best);
            carriers = carriers.filter(function (c) { return !c.dead; });
        }
        function setDopantCount(n) {
            var kind = mode === 'n' ? 'P' : 'B';
            var have = dopants(kind);
            while (have.length > n) { removeDopant(have.pop()); }
            var free = atoms.filter(function (a) { return a.kind === 'Si'; });
            while (have.length < n && free.length) {
                var k = Math.floor(Math.random() * free.length);
                var a = free.splice(k, 1)[0];
                addDopant(a, kind);
                have.push(a);
            }
        }
        function setupMode() {
            clearAll();
            if ((mode === 'n' || mode === 'p') && q('dopants')) setDopantCount(+q('dopants').value);
            if (mode === 'pn') {
                forming = FORM;
                P_SIDE.forEach(function (p) { addDopant(atomAt(p[0], p[1]), 'B'); });
                N_SIDE.forEach(function (p) { addDopant(atomAt(p[0], p[1]), 'P'); });
            }
            var vs = q('volts');
            if (mode === 'pn') { vs.min = -3; vs.max = 1; vs.step = 0.05; }
            else { vs.min = -2; vs.max = 2; vs.step = 0.1; }
            // keep the battery setting across modes, clamped to the new range
            // (the browser also snaps it to the new step)
            vs.value = Math.max(+vs.min, Math.min(+vs.max, V));
            V = parseFloat(vs.value);
            root.classList.toggle('is-pn', mode === 'pn');
            var showDop = mode === 'n' || mode === 'p';
            if (q('dopants')) q('dopants').disabled = !showDop;
            root.querySelectorAll('[data-mode-btn]').forEach(function (b) {
                b.setAttribute('aria-pressed', b.dataset.modeBtn === mode ? 'true' : 'false');
            });
            render();
        }

        // Physics
        function barrier() { return Math.max(0.03, 0.7 - V); }
        function current() {
            var n = 0;
            events.forEach(function (e) { n += e.s; });
            return n / 3;
        }
        function countEvent(sign) { events.push({ t: clock, s: sign }); }
        function hopHole(c, dt) {
            c.hopT -= dt;
            if (c.hopT > 0) return;
            c.hopT = 0.16 + Math.random() * 0.12;
            // drift strength along x for this hole
            var f = 0;
            if (mode !== 'pn') f = V * 1.4;
            else {
                if (forming > 0) f = (c.x < MID && c.x > MID - 100) ? 2.5 : 0;
                else if (Math.abs(c.x - MID) < d) f = -9 * Math.sqrt(barrier() / 0.7);
                else if (c.x < MID && V > 0.35) f = 4 * (V - 0.35);
            }
            var opts = [[S, 0], [-S, 0], [0, S], [0, -S], [S / 2, S / 2], [S / 2, -S / 2], [-S / 2, S / 2], [-S / 2, -S / 2]];
            var ws = [], sum = 0;
            opts.forEach(function (o) {
                var nx = c.x + o[0], ny = c.y + o[1];
                var ok = ny >= AY - 1 && ny <= AY + S * (ROWS - 1) + 1;
                if (mode === 'pn') ok = ok && nx >= AX - 1 && nx <= AX + S * (COLS - 1) + 1;
                var w = ok ? Math.exp(f * o[0] / S) : 0;
                ws.push(w); sum += w;
            });
            var r = Math.random() * sum, k = 0;
            while (k < ws.length - 1 && r > ws[k]) { r -= ws[k]; k++; }
            var ox = c.x, oy = c.y;
            c.x += opts[k][0]; c.y += opts[k][1];
            var line = el('line', { x1: c.x, y1: c.y, x2: ox, y2: oy, class: 'dl-streak' }, gStreak);
            streaks.push({ el: line, life: 0.3 });
            if (mode !== 'pn') {
                if (c.x > AX + S * (COLS - 1) + S / 2) { c.x -= S * COLS; countEvent(1); }
                else if (c.x < AX - S / 2) { c.x += S * COLS; countEvent(-1); }
            }
        }
        function moveElectron(c, dt) {
            var vx = 0;
            if (mode !== 'pn') vx = -V * KD;
            else {
                if (forming > 0) vx = (c.x > MID && c.x < MID + 100) ? -150 : 0;
                else if (Math.abs(c.x - MID) < d) vx = 900 * Math.sqrt(barrier() / 0.7);
                else if (c.x > MID && V > 0.35) vx = -650 * (V - 0.35);
            }
            c.x += vx * dt + D * Math.sqrt(dt) * gauss();
            c.y += D * Math.sqrt(dt) * gauss();
            if (c.y < Y0) c.y = 2 * Y0 - c.y;
            if (c.y > Y1) c.y = 2 * Y1 - c.y;
            if (mode !== 'pn') {
                if (c.x < X0) { c.x += X1 - X0; countEvent(1); }
                else if (c.x > X1) { c.x -= X1 - X0; countEvent(-1); }
            } else {
                if (c.x < X0) c.x = 2 * X0 - c.x;
                if (c.x > X1) c.x = 2 * X1 - c.x;
            }
        }
        function generate(dt) {
            var rate = Math.min(30, 0.12 * Math.pow(2, (T - 25) / 12));
            genAcc += rate * dt;
            while (genAcc >= 1) {
                genAcc -= 1;
                if (carriers.length > MAXC - 2) continue;
                var a = atoms[Math.floor(Math.random() * atoms.length)];
                if (a.kind !== 'Si') continue;
                var e = addCarrier('e', a.x, a.y, true);
                var h = addHoleNear(a);
                if (h) h.age = 0;
                if (mode === 'pn' && V < -0.05 && Math.abs(a.x - MID) < d && e && h) {
                    // swept apart by the field: electron to N, hole to P,
                    // and the circuit takes one of each away at the contacts
                    countEvent(-1);
                    e.x = MID + d + 6; h.x = Math.max(AX, Math.min(MID - d - S / 2, h.x));
                    absorbAtContact('e', X1); absorbAtContact('h', X0);
                }
            }
        }
        function absorbAtContact(type, xEdge) {
            var best = null, bd = 1e9;
            carriers.forEach(function (c) {
                if (c.type !== type || c.dead) return;
                var dd = Math.abs(c.x - xEdge);
                if (dd < bd) { bd = dd; best = c; }
            });
            if (best) removeCarrier(best);
        }
        function feedElectron() { addCarrier('e', X1 - 10, Y0 + Math.random() * (Y1 - Y0)); }
        function feedHole() { var a = atomAt(0, Math.floor(Math.random() * ROWS)); addCarrier('h', a.x + S / 2, a.y); }
        // Forward current: a carrier that makes it through the depletion
        // region into the other side counts once, and the circuit feeds a
        // new one of the same type in at its own contact.
        function crossings(c) {
            var zone = c.x > MID + d ? 'N' : c.x < MID - d ? 'P' : c.zone;
            if (c.zone && zone !== c.zone && !c.crossed && mode === 'pn' && V > 0.05 && forming <= 0) {
                if (c.type === 'e' && zone === 'P') { c.crossed = true; countEvent(1); c.life = 0.5 + Math.random() * 0.6; }
                if (c.type === 'h' && zone === 'N') { c.crossed = true; countEvent(1); c.life = 0.5 + Math.random() * 0.6; }
            }
            c.zone = zone;
        }
        // A carrier that crossed into the other side is a minority carrier
        // there. When its lifetime runs out it recombines with the nearest
        // majority carrier, which the circuit then replaces at the contact.
        function minorityDecay(dt) {
            carriers.forEach(function (c) {
                if (c.dead || c.life === undefined) return;
                c.life -= dt;
                if (c.life > 0) return;
                var want = c.type === 'e' ? 'h' : 'e', best = null, bd = 1e9;
                carriers.forEach(function (o) {
                    if (o.type !== want || o.dead) return;
                    var dd = (o.x - c.x) * (o.x - c.x) + (o.y - c.y) * (o.y - c.y);
                    if (dd < bd) { bd = dd; best = o; }
                });
                flash(c.x, c.y, 'dl-flash-rec');
                removeCarrier(c);
                if (best) removeCarrier(best);
            });
            carriers = carriers.filter(function (c) { return !c.dead; });
        }
        // Keep each side neutral: the circuit feeds or removes majority
        // carriers at the contacts so the N side holds one electron per
        // donor outside the depletion region, plus one for each minority
        // hole on that side, and the same for holes on the P side.
        var neutralT = 0;
        function neutralize(dt) {
            neutralT -= dt;
            if (neutralT > 0 || forming > 0) return;
            neutralT = 0.08;
            var nE = 0, nH = 0, minE = 0, minH = 0, dN = 0, dP = 0;
            carriers.forEach(function (c) {
                if (c.type === 'e') { if (c.x > MID) nE++; else minE++; }
                else { if (c.x < MID) nH++; else minH++; }
            });
            atoms.forEach(function (a) {
                if (Math.abs(a.x - MID) < d + 2) return;
                if (a.kind === 'P') dN++;
                if (a.kind === 'B') dP++;
            });
            for (var k = 0; k < 3 && nE < dN + minH; k++, nE++) feedElectron();
            if (nE > dN + minH + 1) absorbAtContact('e', X1);
            for (k = 0; k < 3 && nH < dP + minE; k++, nH++) feedHole();
            if (nH > dP + minE + 1) absorbAtContact('h', X0);
            carriers = carriers.filter(function (c) { return !c.dead; });
        }
        function recombine() {
            var es = carriers.filter(function (c) { return c.type === 'e' && !c.dead; });
            var hs = carriers.filter(function (c) { return c.type === 'h' && !c.dead; });
            es.forEach(function (e) {
                for (var k = 0; k < hs.length; k++) {
                    var h = hs[k];
                    if (h.dead || e.age < 0.6 || h.age < 0.6) continue;
                    var dx = e.x - h.x, dy = e.y - h.y;
                    if (dx * dx + dy * dy < 15 * 15) {
                        flash((e.x + h.x) / 2, (e.y + h.y) / 2, 'dl-flash-rec');
                        removeCarrier(e); removeCarrier(h);
                        break;
                    }
                }
            });
            carriers = carriers.filter(function (c) { return !c.dead; });
        }

        function render() {
            q('volts-val').textContent = fmtSigned(V, mode === 'pn' ? 2 : 1, ' V');
            q('temp-val').textContent = T + ' °C';
            if (q('dop-val')) q('dop-val').textContent = (mode === 'n' || mode === 'p') ? q('dopants').value : 'n/a';
            var ne = 0, nh = 0;
            carriers.forEach(function (c) { if (c.type === 'e') ne++; else nh++; });
            q('ne').textContent = ne;
            q('nh').textContent = nh;
            var I = (mode !== 'pn' && Math.abs(V) < 0.05) ? 0 : current();
            q('cur').textContent = Math.abs(I) < 0.05 ? '0.0 carriers/s' : fmtSigned(I, 1, ' carriers/s');
            // terminals
            termL.textContent = V > 0.001 ? '+' : V < -0.001 ? MINUS : '';
            termR.textContent = V > 0.001 ? MINUS : V < -0.001 ? '+' : '';
            // depletion band
            var showBand = mode === 'pn' && d > 4;
            band.setAttribute('x', MID - d);
            band.setAttribute('width', 2 * d);
            band.style.display = showBand ? '' : 'none';
            bandLbl.style.display = showBand && d > 26 ? '' : 'none';
            atoms.forEach(function (a) {
                a.g.classList.toggle('exposed', mode === 'pn' && a.kind !== 'Si' && Math.abs(a.x - MID) < d + 2);
            });
            // feedback
            var fb = q('feedback'), msg = '';
            fb.className = 'sim-feedback';
            if (mode === 'pure') {
                msg = ne + nh === 0
                    ? 'Pure silicon at ' + T + ' °C: every electron is locked in a bond, so there are almost no free carriers. Try raising the temperature.'
                    : 'Heat shakes electrons out of their bonds. Each one leaves a <b>hole</b> behind, so carriers appear in <b>pairs</b>.';
            } else if (mode === 'n') {
                msg = 'N-type: each phosphorus atom gave away its fifth electron and is now a fixed <b>positive ion (P⁺)</b>. The free <b>electrons</b> carry the current. Click an atom to add or remove phosphorus.';
            } else if (mode === 'p') {
                msg = 'P-type: each boron atom left a <b>hole</b> in a bond and is now a fixed <b>negative ion (B⁻)</b>. A hole moves when a neighboring electron jumps into it. Click an atom to add or remove boron.';
            } else {
                if (forming > 0) msg = 'Electrons near the boundary <b>cross</b> into the P side and fill holes. Watch the band that is left behind.';
                else if (V > 0.62) msg = '<b>Forward bias.</b> The depletion region has almost vanished, so carriers flood across the junction and recombine. Current flows.';
                else if (V > 0.05) msg = 'Forward bias, but under about 0.6 V. The depletion region is narrower, but its field still turns most carriers back.';
                else if (V < -0.05) msg = '<b>Reverse bias.</b> The battery pulls carriers away from the junction, so the depletion region widens. Only a tiny leakage current flows.';
                else msg = 'Carriers near the boundary crossed and recombined. The band left behind has <b>no free carriers</b>, only fixed ions: B⁻ on the P side and P⁺ on the N side.';
            }
            if (mode !== 'pn' && Math.abs(V) > 0.05 && ne + nh > 0) msg += ' Electrons drift toward <b>+</b>, holes toward <b>' + MINUS + '</b>.';
            if (tracked) msg = '<b>Following one ' + (tracked.type === 'e' ? 'electron' : 'hole') + '.</b> ' + (tracked.type === 'h' ? 'Each jump is a neighboring electron moving into the empty spot, so the hole moves the other way. ' : 'It wanders through the spaces between atoms. ') + 'Click it again to stop following.';
            else if (lostT > 0) msg = 'The carrier you were following <b>recombined</b>: it met a carrier of the other type, and both disappeared. Click another one to follow it.';
            if (paused) msg = '<b>Paused.</b> ' + msg;
            fb.innerHTML = msg;
        }

        var lastRender = 0;
        function tick(dt) {
            if (paused) return;
            dt *= speed;
            if (lostT > 0) lostT = Math.max(0, lostT - dt / speed);
            clock += dt;
            if (mode === 'pn') {
                if (forming > 0) forming = Math.max(0, forming - dt);
                var target = forming > 0 ? 55 * (1 - forming / FORM) : Math.min(190, 55 * Math.sqrt(barrier() / 0.7));
                d += (target - d) * Math.min(1, dt * 1.5);
            }
            generate(dt);
            carriers.forEach(function (c) {
                c.age += dt;
                if (c.type === 'e') moveElectron(c, dt); else hopHole(c, dt);
                // safety net: a carrier with an invalid position is removed
                if (!isFinite(c.x) || !isFinite(c.y)) { removeCarrier(c); return; }
                c.el.setAttribute('cx', c.x.toFixed(1));
                c.el.setAttribute('cy', c.y.toFixed(1));
            });
            carriers = carriers.filter(function (c) { return !c.dead; });
            if (mode === 'pn') { carriers.slice().forEach(crossings); minorityDecay(dt); neutralize(dt); }
            recombine();
            if (tracked) {
                trailT -= dt;
                if (trailT <= 0) {
                    trailT = 0.12;
                    var last = trailPts[trailPts.length - 1];
                    // a carrier that wrapped through a contact starts a fresh trail
                    if (last && Math.abs(last[0] - tracked.x) > 200) trailPts = [];
                    trailPts.push([tracked.x, tracked.y]);
                    if (trailPts.length > 40) trailPts.shift();
                    trail.setAttribute('points', trailPts.map(function (p) { return p[0].toFixed(0) + ',' + p[1].toFixed(0); }).join(' '));
                }
            }
            streaks = streaks.filter(function (s) {
                s.life -= dt;
                if (s.life <= 0) { s.el.remove(); return false; }
                s.el.style.opacity = (Math.min(1, s.life / 0.3) * (s.grow ? 0.55 : 1)).toFixed(2);
                if (s.grow) s.el.setAttribute('r', (12 + (0.5 - s.life) * 30).toFixed(1));
                return true;
            });
            while (events.length && events[0].t < clock - 3) events.shift();
            lastRender += dt;
            if (lastRender > 0.2) { lastRender = 0; render(); }
        }

        // Controls
        root.querySelectorAll('[data-mode-btn]').forEach(function (b) {
            b.addEventListener('click', function () { mode = b.dataset.modeBtn; setupMode(); });
        });
        if (q('dopants')) q('dopants').addEventListener('input', function () { if (mode === 'n' || mode === 'p') { setDopantCount(+this.value); render(); } });
        q('volts').addEventListener('input', function () { V = parseFloat(this.value); events = []; render(); });
        q('temp').addEventListener('input', function () { T = parseInt(this.value, 10); render(); });
        var pauseBtn = root.querySelector('[data-act="pause"]');
        function setPaused(p) {
            paused = p;
            if (pauseBtn) pauseBtn.textContent = paused ? 'Play' : 'Pause';
            render();
        }
        if (pauseBtn) pauseBtn.addEventListener('click', function () { setPaused(!paused); });
        function setSpeed(v) {
            speed = v;
            root.querySelectorAll('[data-speed]').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.speed === v ? 'true' : 'false'); });
        }
        root.querySelectorAll('[data-speed]').forEach(function (b) {
            b.addEventListener('click', function () { setSpeed(+b.dataset.speed); });
        });
        var restart = root.querySelector('[data-act="restart"]');
        if (restart) restart.addEventListener('click', setupMode);
        svg.addEventListener('click', function (ev) {
            if (ev.target.dataset && ev.target.dataset.k === 'c') {
                var hit = carriers.find(function (c) { return c.el === ev.target; });
                var same = hit === tracked;
                untrack();
                if (hit && !same) { tracked = hit; hit.el.classList.add('dl-tracked'); trailPts = [[hit.x, hit.y]]; trailT = 0; }
                render();
                return;
            }
            var g = ev.target.closest && ev.target.closest('.dl-atom');
            if (!g || (mode !== 'n' && mode !== 'p')) return;
            var a = atomAt(+g.dataset.i, +g.dataset.j);
            var kind = mode === 'n' ? 'P' : 'B';
            var slider = q('dopants');
            if (a.kind === kind) removeDopant(a);
            else if (a.kind === 'Si' && dopants(kind).length < +slider.max) addDopant(a, kind);
            slider.value = dopants(kind).length;
            render();
        });

        function reset() {
            mode = junctionOnly ? 'pn' : 'pure';
            T = 25; q('temp').value = 25;
            if (q('dopants')) q('dopants').value = 6;
            setSpeed(SLOW); paused = false; if (pauseBtn) pauseBtn.textContent = 'Pause';
            V = 0;
            setupMode();
        }
        reset();
        return { root: root, tick: tick, reset: reset };
    }

    /* ─── Diode Bench ────────────────────────────────────────
       A supply (0 to 9 V), a 1 kOhm resistor, and a 1N4001-class
       silicon diode in series. The diode follows the Shockley
       equation I = Is (exp(Vd / nVt) - 1) with Is = 3.69 nA and
       nVt = 46.5 mV, which gives 0.625 V at 2.5 mA, 0.650 V at
       4.3 mA, and 0.681 V at 8.3 mA. The circuit is solved by
       bisection on the diode voltage. Reversed, the diode passes
       only -Is, so nearly the whole supply appears across it.
       ───────────────────────────────────────────────────── */
    function buildDiodeBench(root) {
        var R = 1000, IS = 3.69e-9, NVT = 0.04653;
        var svg = root.querySelector('[data-role="circuit"]');
        var plot = root.querySelector('[data-role="plot"]');
        function q(r) { return root.querySelector('[data-role="' + r + '"]'); }
        var Vs = 5, fwd = true, measuring = null, points = [];

        function solve() {
            if (!fwd) {
                var ir = -IS * (1 - Math.exp(-Vs / NVT));
                return { vd: Vs + ir * R, i: ir };
            }
            var lo = 0, hi = Vs;
            for (var k = 0; k < 60; k++) {
                var mid = (lo + hi) / 2;
                var f = (Vs - mid) / R - IS * (Math.exp(mid / NVT) - 1);
                if (f > 0) lo = mid; else hi = mid;
            }
            var vd = (lo + hi) / 2;
            return { vd: vd, i: (Vs - vd) / R };
        }

        // Circuit: supply left, resistor top, ammeter right, diode bottom.
        var wires = el('g', { class: 'db-wires' }, svg);
        el('path', { d: 'M90 180 V70 H230' }, wires);
        el('path', { d: 'M370 70 H700 V150' }, wires);
        el('path', { d: 'M700 230 V380 H520' }, wires);
        el('path', { d: 'M400 380 H90 V250' }, wires);
        el('line', { x1: 50, y1: 186, x2: 130, y2: 186, class: 'db-sym', style: 'stroke-width:4' }, svg);
        el('line', { x1: 70, y1: 218, x2: 110, y2: 218, class: 'db-sym', style: 'stroke-width:9' }, svg);
        el('line', { x1: 90, y1: 180, x2: 90, y2: 186, class: 'db-sym' }, svg);
        el('line', { x1: 90, y1: 218, x2: 90, y2: 250, class: 'db-sym' }, svg);
        el('text', { x: 150, y: 184, class: 'db-lbl-b' }, svg).textContent = '+';
        var vsLbl = el('text', { x: 150, y: 236, class: 'db-lbl' }, svg);
        el('path', { d: 'M230 70 l10 -18 l20 36 l20 -36 l20 36 l20 -36 l20 36 l20 -36 l10 18', class: 'db-sym', style: 'stroke-width:4' }, svg);
        el('text', { x: 300, y: 130, class: 'db-lbl', 'text-anchor': 'middle' }, svg).textContent = '1 kΩ';
        el('circle', { cx: 700, cy: 190, r: 40, class: 'db-meter' }, svg);
        el('text', { x: 700, y: 192, class: 'db-lbl-b', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, svg).textContent = 'A';
        el('text', { x: 768, y: 200, class: 'db-lbl' }, svg).textContent = 'Ammeter';
        var diode = el('g', {}, svg);
        el('path', { d: 'M400 380 H430 M490 380 H520', class: 'db-sym' }, diode);
        el('path', { d: 'M490 350 L490 410 L436 380 Z', class: 'db-diode' }, diode);
        el('line', { x1: 432, y1: 350, x2: 432, y2: 410, class: 'db-sym', style: 'stroke-width:5' }, diode);
        var anodeLbl = el('text', { x: 500, y: 450, class: 'db-lbl', 'text-anchor': 'start' }, svg);
        var cathLbl = el('text', { x: 420, y: 450, class: 'db-lbl', 'text-anchor': 'end' }, svg);
        var marks = {
            vd: el('rect', { x: 390, y: 330, width: 140, height: 96, rx: 12, class: 'db-mark' }, svg),
            vr: el('rect', { x: 220, y: 34, width: 160, height: 72, rx: 12, class: 'db-mark' }, svg),
            i: el('rect', { x: 650, y: 140, width: 100, height: 100, rx: 12, class: 'db-mark' }, svg),
        };

        // Plot: diode voltage 0 to 0.8 V, current 0 to 10 mA.
        var PX0 = 70, PX1 = 440, PY0 = 230, PY1 = 20;
        function px(v) { return PX0 + (PX1 - PX0) * v / 0.8; }
        function py(iA) { return PY0 - (PY0 - PY1) * Math.min(1, iA * 1000 / 10); }
        if (plot) {
            el('path', { d: 'M' + PX0 + ' ' + PY1 + ' V' + PY0 + ' H' + PX1, class: 'db-axis' }, plot);
            [0, 0.2, 0.4, 0.6, 0.8].forEach(function (v) {
                el('line', { x1: px(v), y1: PY0, x2: px(v), y2: PY0 + 8, class: 'db-axis' }, plot);
                el('text', { x: px(v), y: PY0 + 34, class: 'db-tick', 'text-anchor': 'middle' }, plot).textContent = v.toFixed(1);
            });
            [0, 5, 10].forEach(function (m) {
                el('line', { x1: PX0 - 8, y1: py(m / 1000), x2: PX0, y2: py(m / 1000), class: 'db-axis' }, plot);
                el('text', { x: PX0 - 14, y: py(m / 1000) + 8, class: 'db-tick', 'text-anchor': 'end' }, plot).textContent = m;
            });
            el('text', { x: (PX0 + PX1) / 2, y: PY0 + 66, class: 'db-tick', 'text-anchor': 'middle' }, plot).textContent = 'Diode voltage (V)';
            el('text', { x: 18, y: (PY0 + PY1) / 2, class: 'db-tick', 'text-anchor': 'middle', transform: 'rotate(-90 18 ' + (PY0 + PY1) / 2 + ')' }, plot).textContent = 'mA';
        }
        var gPts = plot ? el('g', {}, plot) : null;

        function fmtV(v) { return v.toFixed(Math.abs(v) < 1 ? 3 : 2) + ' V'; }
        function render() {
            var s = solve();
            diode.setAttribute('transform', fwd ? '' : 'rotate(180 460 380)');
            anodeLbl.textContent = fwd ? 'Anode' : 'Cathode';
            cathLbl.textContent = fwd ? 'Cathode' : 'Anode';
            vsLbl.textContent = Vs.toFixed(1) + ' V';
            q('vs-val').textContent = Vs.toFixed(1) + ' V';
            root.classList.toggle('flowing', s.i > 1e-5);
            Object.keys(marks).forEach(function (k) { marks[k].classList.toggle('on', k === measuring); });
            root.querySelectorAll('[data-measure]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.measure === measuring ? 'true' : 'false'); });
            var dmm = q('dmm'), name = q('dmm-name');
            if (measuring === 'vd') { name.textContent = 'DMM · volts across the diode'; dmm.textContent = fmtV(s.vd); }
            else if (measuring === 'vr') { name.textContent = 'DMM · volts across the resistor'; dmm.textContent = Math.max(0, s.i * R).toFixed(2) + ' V'; }
            else if (measuring === 'i') { name.textContent = 'DMM · current (ammeter)'; dmm.textContent = (Math.max(0, s.i) * 1000).toFixed(2) + ' mA'; }
            else { name.textContent = 'DMM'; dmm.textContent = '-.--'; }
            var fb = q('feedback'), msg;
            fb.className = 'sim-feedback';
            if (!fwd) msg = '<b>Reverse bias:</b> the cathode faces the + side. The depletion region blocks current, so the whole supply appears across the diode.';
            else if (Vs < 0.5) msg = 'Forward bias, but the supply is too small to collapse the depletion region. Almost no current flows yet.';
            else if (s.vd < 0.6) msg = 'Forward bias. Current is starting to flow; watch the diode voltage as you raise the supply.';
            else msg = '<b>Forward bias:</b> the diode drops about <b>' + s.vd.toFixed(2) + ' V</b>, and the rest of the supply drops across the resistor.';
            fb.innerHTML = msg;
            if (gPts) {
                gPts.innerHTML = '';
                points.forEach(function (p) { el('circle', { cx: px(Math.min(0.8, p.vd)), cy: py(p.i), r: 7, class: 'db-pt' }, gPts); });
            }
            var cnt = q('pt-count');
            if (cnt) cnt.textContent = points.length + (points.length === 1 ? ' point' : ' points');
        }
        q('vs').addEventListener('input', function () { Vs = parseFloat(this.value); render(); });
        root.querySelector('[data-act="flip"]').addEventListener('click', function () { fwd = !fwd; render(); });
        root.querySelectorAll('[data-measure]').forEach(function (b) {
            b.addEventListener('click', function () { measuring = b.dataset.measure; render(); });
        });
        var plotBtn = root.querySelector('[data-act="plot"]');
        if (plotBtn) plotBtn.addEventListener('click', function () {
            var s = solve();
            if (fwd && points.length < 30) points.push({ vd: s.vd, i: Math.max(0, s.i) });
            render();
        });
        var clearBtn = root.querySelector('[data-act="clear"]');
        if (clearBtn) clearBtn.addEventListener('click', function () { points = []; render(); });

        function reset() {
            Vs = 5; fwd = true; measuring = null; points = [];
            q('vs').value = 5;
            render();
        }
        reset();
        return { root: root, reset: reset };
    }


    /* ─── Rectifier Lab ──────────────────────────────────────
       A 12 VAC (17.0 V peak, 60 Hz) source feeds a half-wave or
       bridge rectifier, a 1 kOhm load, and an optional filter
       capacitor. Each silicon diode drops 0.7 V when it conducts.
       The steady-state waveform is computed by stepping 12 cycles
       (400 steps per cycle) and keeping the last two: a diode
       conducts while the source, less its drops, is above the
       output; otherwise the capacitor discharges through the load,
       dV/dt = -V / RC. A slow-motion cursor sweeps the scope and the
       circuit lights the path that carries current at that moment.
       ───────────────────────────────────────────────────── */
    function buildRectifierLab(root) {
        var VP = 17.0, F = 60, RL = 1000, N = 400;
        var circ = root.querySelector('[data-role="rect-circuit"]');
        var scope = root.querySelector('[data-role="rect-scope"]');
        function q(r) { return root.querySelector('[data-role="' + r + '"]'); }
        var mode = 'half', capUF = 0, wave = null, cursor = 0, running = true;

        // ── circuit drawing ──
        function wire(d, flags, parent) { return el('path', { d: d, class: 'rc-w', 'data-on': flags }, parent); }
        function diode(x1, y1, x2, y2, flags, parent, label, lx, ly) {
            var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, px = -uy, py = ux;
            var a = 0.5 - 26 / L, b = 0.5 + 22 / L;
            var ax = x1 + dx * a, ay = y1 + dy * a, cx = x1 + dx * b, cy = y1 + dy * b;
            var g = el('g', { class: 'rc-d', 'data-on': flags }, parent);
            el('path', { d: 'M' + x1 + ' ' + y1 + ' L' + ax.toFixed(1) + ' ' + ay.toFixed(1) + ' M' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' L' + x2 + ' ' + y2, class: 'rc-dw' }, g);
            el('path', { d: 'M' + (ax + px * 20).toFixed(1) + ' ' + (ay + py * 20).toFixed(1) + ' L' + (ax - px * 20).toFixed(1) + ' ' + (ay - py * 20).toFixed(1) + ' L' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' Z', class: 'rc-tri' }, g);
            el('path', { d: 'M' + (cx + px * 20).toFixed(1) + ' ' + (cy + py * 20).toFixed(1) + ' L' + (cx - px * 20).toFixed(1) + ' ' + (cy - py * 20).toFixed(1), class: 'rc-bar' }, g);
            if (label) el('text', { x: lx, y: ly, class: 'rc-lbl', 'text-anchor': 'middle' }, parent).textContent = label;
        }
        function source(parent) {
            el('circle', { cx: 90, cy: 220, r: 34, class: 'rc-src' }, parent);
            el('path', { d: 'M70 220 q10 -18 20 0 t20 0', class: 'rc-sym' }, parent);
            el('text', { x: 80, y: 316, class: 'rc-lbl', 'text-anchor': 'end' }, parent).textContent = '12 VAC';
        }
        function loadAndCap(parent, top, bottom) {
            wire('M590 ' + top + ' V170', 'load', parent);
            el('path', { d: 'M590 170 l-16 10 l32 20 l-32 20 l32 20 l-32 20 l32 20 l-16 10', class: 'rc-res', 'data-on': 'load' }, parent);
            wire('M590 290 V' + bottom, 'load', parent);
            el('text', { x: 612, y: 236, class: 'rc-lbl' }, parent).textContent = '1 kΩ';
            var cap = el('g', { class: 'rc-capg' }, parent);
            wire('M590 ' + top + ' H730 V238', 'cap', cap);
            wire('M730 256 V' + bottom + ' H590', 'cap', cap);
            el('line', { x1: 702, y1: 238, x2: 758, y2: 238, class: 'rc-plate', 'data-on': 'cap' }, cap);
            el('line', { x1: 702, y1: 256, x2: 758, y2: 256, class: 'rc-plate', 'data-on': 'cap' }, cap);
            el('text', { x: 716, y: 310, class: 'rc-lbl', 'text-anchor': 'end' }, cap).textContent = 'C';
            el('text', { x: 560, y: top - 14, class: 'rc-lbl', 'text-anchor': 'end', style: 'fill:var(--result)' }, parent).textContent = 'Output +';
        }
        var gHalf = el('g', {}, circ), gBridge = el('g', {}, circ);
        source(gHalf);
        wire('M90 186 V110 H250', 'src', gHalf);
        diode(250, 110, 370, 110, 'd1', gHalf, 'D1', 310, 80);
        wire('M370 110 H590', 'out', gHalf);
        wire('M590 420 H90 V254', 'out', gHalf);
        loadAndCap(gHalf, 110, 420);
        source(gBridge);
        wire('M90 186 V60 H360 V110', 'src', gBridge);
        wire('M90 254 V390 H360 V350', 'src', gBridge);
        diode(360, 110, 480, 230, 'd1', gBridge, 'D1', 448, 156);
        diode(360, 350, 480, 230, 'd2', gBridge, 'D2', 448, 312);
        diode(240, 230, 360, 350, 'd3', gBridge, 'D3', 272, 312);
        diode(240, 230, 360, 110, 'd4', gBridge, 'D4', 272, 156);
        wire('M480 230 H530 V110 H590', 'out', gBridge);
        wire('M590 420 H200 V402 a12 12 0 0 0 0 -24 V230 H240', 'out', gBridge);   // hop over the source wire
        loadAndCap(gBridge, 110, 420);

        // ── scope drawing ──
        var SX0 = 70, SX1 = 740, SY0 = 160, SV = 6.4;  // 6.4 px per volt, centre line at y = 160
        function sx(i) { return SX0 + (SX1 - SX0) * i / (2 * N); }
        function sy(v) { return SY0 - v * SV; }
        [-20, -10, 0, 10, 20].forEach(function (v) {
            el('line', { x1: SX0, y1: sy(v), x2: SX1, y2: sy(v), class: v ? 'sc-grid' : 'sc-axis' }, scope);
            el('text', { x: SX0 - 10, y: sy(v) + 8, class: 'sc-tick', 'text-anchor': 'end' }, scope).textContent = v;
        });
        el('text', { x: 18, y: SY0, class: 'sc-tick', 'text-anchor': 'middle', transform: 'rotate(-90 18 ' + SY0 + ')' }, scope).textContent = 'volts';
        var trIn = el('path', { class: 'sc-in' }, scope);
        var trOut = el('path', { class: 'sc-out' }, scope);
        var cur = el('line', { x1: SX0, y1: 20, x2: SX0, y2: 300, class: 'sc-cursor' }, scope);

        function compute() {
            var dt = 1 / (F * N), C = capUF * 1e-6, v = 0, out = [];
            for (var k = 0; k < 12 * N; k++) {
                var vin = VP * Math.sin(2 * Math.PI * k / N);
                var src = mode === 'half' ? vin : Math.abs(vin), drop = mode === 'half' ? 0.7 : 1.4;
                var avail = src - drop, cond;
                if (C > 0) {
                    if (avail > v) { v = avail; cond = true; } else { v -= v / (RL * C) * dt; cond = false; }
                } else { v = Math.max(0, avail); cond = avail > 0; }
                if (k >= 10 * N) out.push({ vin: vin, v: v, cond: cond, pos: vin >= 0 });
            }
            return out;
        }
        function path(key) {
            return 'M' + wave.map(function (p, i) { return sx(i).toFixed(1) + ' ' + sy(p[key]).toFixed(1); }).join(' L');
        }
        function update() {
            wave = compute();
            trIn.setAttribute('d', path('vin'));
            trOut.setAttribute('d', path('v'));
            var vs = wave.map(function (p) { return p.v; });
            var mx = Math.max.apply(null, vs), mn = Math.min.apply(null, vs);
            var avg = vs.reduce(function (a, b) { return a + b; }, 0) / vs.length;
            q('vin-pk').textContent = VP.toFixed(1) + ' V';
            q('vout-pk').textContent = mx.toFixed(1) + ' V';
            q('ripple').textContent = capUF ? (mx - mn).toFixed(2) + ' V' : 'n/a';
            q('vdc').textContent = avg.toFixed(1) + ' V';
            gHalf.style.display = mode === 'half' ? '' : 'none';
            gBridge.style.display = mode === 'bridge' ? '' : 'none';
            root.querySelectorAll('.rc-capg').forEach(function (g) { g.style.display = capUF ? '' : 'none'; });
            root.querySelectorAll('[data-rect-mode]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.rectMode === mode ? 'true' : 'false'); });
            root.querySelectorAll('[data-cap]').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.cap === capUF ? 'true' : 'false'); });
            var fb = q('feedback'), drop = mode === 'half' ? '0.7\u00A0V' : '1.4\u00A0V';
            var msg = mode === 'half'
                ? '<b>Half-wave:</b> only the positive halves get through D1, so the output has <b>gaps</b>. Its peak is ' + drop + ' below the input peak.'
                : '<b>Bridge:</b> two diodes conduct on each half (D1 and D3, then D2 and D4), so <b>both halves</b> come out positive. Two drops cost ' + drop + '.';
            if (capUF) msg += ' The capacitor fills the gaps, leaving a <b>' + (mx - mn).toFixed(2) + '\u00A0V ripple</b>.';
            fb.innerHTML = msg;
            render();
        }
        function render() {
            var i = Math.min(wave.length - 1, Math.floor(cursor));
            var p = wave[i];
            cur.setAttribute('x1', sx(i).toFixed(1)); cur.setAttribute('x2', sx(i).toFixed(1));
            var flags = {
                src: p.cond, out: p.cond, load: p.cond || (capUF > 0 && p.v > 0.1), cap: capUF > 0 && (p.cond || p.v > 0.1),
                d1: p.cond && (mode === 'half' || p.pos), d3: p.cond && mode === 'bridge' && p.pos,
                d2: p.cond && mode === 'bridge' && !p.pos, d4: p.cond && mode === 'bridge' && !p.pos,
            };
            var dis = capUF > 0 && !p.cond;
            root.querySelectorAll('[data-on]').forEach(function (e) {
                var on = e.dataset.on.split(' ').some(function (f) { return flags[f]; });
                e.classList.toggle('on', on);
                e.classList.toggle('dis', on && dis && (e.dataset.on === 'cap' || e.dataset.on === 'load'));
            });
            var st = q('rect-state');
            st.textContent = p.cond ? (mode === 'half' ? 'D1 conducting' : (p.pos ? 'D1 and D3 conducting' : 'D2 and D4 conducting'))
                : (capUF && p.v > 0.1 ? 'Diodes off: capacitor feeding the load' : 'Diodes off: no output');
        }
        function tick(dt) {
            if (!running) return;
            cursor = (cursor + dt * N) % (2 * N);   // two cycles every four seconds: about 120 times slower than real
            render();
        }
        root.querySelectorAll('[data-rect-mode]').forEach(function (b) { b.addEventListener('click', function () { mode = b.dataset.rectMode; update(); }); });
        root.querySelectorAll('[data-cap]').forEach(function (b) { b.addEventListener('click', function () { capUF = +b.dataset.cap; update(); }); });
        var pb = root.querySelector('[data-act="rect-pause"]');
        if (pb) pb.addEventListener('click', function () { running = !running; pb.textContent = running ? 'Pause' : 'Play'; });
        function reset() { mode = 'half'; capUF = 0; cursor = 0; running = true; if (pb) pb.textContent = 'Pause'; update(); }
        reset();
        return { root: root, tick: tick, reset: reset };
    }

    /* ─── Flyback demo ───────────────────────────────────────
       A 24 V supply, a switch, and a relay coil (480 Ohm, about
       1 H, so tau = L / R is about 2 ms). The switch closes at
       5 ms and opens at 25 ms. With no diode the coil current has
       nowhere to go, so the voltage across the opening switch
       spikes far off the scale (hundreds of volts) and the
       current collapses through an arc. With a flyback diode the
       current circulates through the diode and dies away over a
       few milliseconds, and the switch sees only 24.7 V.
       ───────────────────────────────────────────────────── */
    function buildFlyback(root) {
        var svg = root.querySelector('[data-role="fly-scope"]');
        function q(r) { return root.querySelector('[data-role="' + r + '"]'); }
        var withDiode = false, t = 40, running = false;
        var X0 = 70, X1 = 740, T1 = 40;
        function x(tt) { return X0 + (X1 - X0) * tt / T1; }
        function yv(v) { return 150 - Math.min(v, 66) * 1.8; }   // volts strip: 0 at y = 150, clipped at 66 V
        function yi(i) { return 300 - i * 1.6; }                  // current strip: 0 at y = 300, 50 mA = 80 px
        [0, 24, 48].forEach(function (v) {
            el('line', { x1: X0, y1: yv(v), x2: X1, y2: yv(v), class: v ? 'sc-grid' : 'sc-axis' }, svg);
            el('text', { x: X0 - 10, y: yv(v) + 8, class: 'sc-tick', 'text-anchor': 'end' }, svg).textContent = v;
        });
        [0, 50].forEach(function (m) {
            el('line', { x1: X0, y1: yi(m), x2: X1, y2: yi(m), class: m ? 'sc-grid' : 'sc-axis' }, svg);
            el('text', { x: X0 - 10, y: yi(m) + 8, class: 'sc-tick', 'text-anchor': 'end' }, svg).textContent = m;
        });
        el('text', { x: X0 + 6, y: 26, class: 'sc-tick', style: 'fill:var(--warn)' }, svg).textContent = 'Volts across the switch';
        el('text', { x: X0 + 6, y: 196, class: 'sc-tick', style: 'fill:var(--result)' }, svg).textContent = 'Coil current (mA)';
        el('line', { x1: x(5), y1: 40, x2: x(5), y2: 300, class: 'sc-mark' }, svg);
        el('line', { x1: x(25), y1: 40, x2: x(25), y2: 300, class: 'sc-mark' }, svg);
        el('text', { x: x(5) + 6, y: 318, class: 'sc-tick' }, svg).textContent = 'close';
        el('text', { x: x(25) + 6, y: 318, class: 'sc-tick' }, svg).textContent = 'open';
        var trV = el('path', { class: 'sc-volt' }, svg), trI = el('path', { class: 'sc-out' }, svg);
        var off = el('text', { x: x(25) + 30, y: 90, class: 'sc-tick fly-off' }, svg);
        off.textContent = '100s of volts';
        function sample(tt) {
            var I0 = 50, tau = 2;
            if (tt < 5) return { v: 24, i: 0 };
            if (tt < 25) return { v: 0, i: I0 * (1 - Math.exp(-(tt - 5) / tau)) };
            var s = tt - 25;
            var i0 = I0 * (1 - Math.exp(-20 / tau));
            if (withDiode) return { v: 24.7 - 0.7 * Math.min(1, s / 6), i: i0 * Math.exp(-s / tau) };
            return { v: s < 0.6 ? 400 : 24 + 60 * Math.exp(-(s - 0.6) / 0.25) * Math.cos((s - 0.6) * 18), i: s < 0.3 ? i0 * (1 - s / 0.3) : 0 };
        }
        function draw() {
            var pv = [], pi = [];
            for (var tt = 0; tt <= t + 1e-9; tt += 0.05) {
                var p = sample(tt);
                pv.push(x(tt).toFixed(1) + ' ' + yv(Math.max(0, p.v)).toFixed(1));
                pi.push(x(tt).toFixed(1) + ' ' + yi(p.i).toFixed(1));
            }
            trV.setAttribute('d', pv.length ? 'M' + pv.join(' L') : '');
            trI.setAttribute('d', pi.length ? 'M' + pi.join(' L') : '');
            off.style.display = !withDiode && t > 25 ? '' : 'none';
            root.classList.toggle('with-diode', withDiode);
            root.classList.toggle('arc', !withDiode && t > 25 && t < 26.5);
            root.querySelectorAll('[data-fly]').forEach(function (b) { b.setAttribute('aria-pressed', (b.dataset.fly === 'with') === withDiode ? 'true' : 'false'); });
            var fb = q('feedback');
            if (t < 40) fb.innerHTML = 'Running: the switch closes at 5 ms and opens at 25 ms.';
            else if (withDiode) fb.innerHTML = '<b>With the diode:</b> when the switch opens, the coil current keeps flowing around through the diode and dies away in a few milliseconds. The switch sees only about <b>24.7 V</b>.';
            else fb.innerHTML = '<b>No diode:</b> the coil fights the sudden stop. The voltage across the opening switch jumps to <b>hundreds of volts</b> and arcs across the contacts, or destroys a transistor.';
        }
        function run() { t = 0; running = true; }
        function tick(dt) {
            if (!running) return;
            t = Math.min(40, t + dt * 10);   // 40 ms of circuit time in 4 s
            if (t >= 40) running = false;
            draw();
        }
        root.querySelectorAll('[data-fly]').forEach(function (b) { b.addEventListener('click', function () { withDiode = b.dataset.fly === 'with'; run(); draw(); }); });
        root.querySelector('[data-act="fly-run"]').addEventListener('click', function () { run(); draw(); });
        function reset() { withDiode = false; t = 40; running = false; draw(); }
        reset();
        return { root: root, tick: tick, reset: reset };
    }

    /* ─── Service call (hidden-fault troubleshooting) ─────────
       Adapted from AR1 Fluid Power Deck 2 (buildServiceCall), which
       is the single-ticket version of the AR2 AC Motors Day 5 Work
       Orders. The ticket is data: buildServiceCall(root, ticket).
       The hidden cause is dealt from a shuffled deck, tests return
       readings (r[cause] or r.def), unsafe choices are charged but
       never performed, and the record scores key evidence, safety,
       ruling out, diagnosis, fix, and defense.
       ───────────────────────────────────────────────────── */
    function buildServiceCall(root, w) {
        function q(r) { return root.querySelector('[data-role="' + r + '"]'); }
        var deck = [];
        function pickCause(avoid) {
            if (!deck.length) {
                var ids = Object.keys(w.causes);
                for (var i = ids.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1)), t = ids[i];
                    ids[i] = ids[j]; ids[j] = t;
                }
                if (ids[0] === avoid) ids.push(ids.shift());
                Array.prototype.push.apply(deck, ids);
            }
            return deck.shift();
        }
        function fresh(avoid) {
            return { cause: pickCause(avoid), run: [], unsafe: [], stage: 'investigate', view: null, diag: -1, repair: -1,
                     used: 0, struck: [], tags: [], tab: 'ticket' };
        }
        var s = fresh();
        function test(id) { return w.tests.filter(function (t) { return t.id === id; })[0]; }
        function reading(t, cause) { return t.r[cause] || t.r.def; }
        function relevant(t) {
            var seen = {};
            Object.keys(w.causes).forEach(function (c) { seen[reading(t, c)] = 1; });
            return Object.keys(seen).length > 1;
        }
        function left() { return w.budget - s.used; }
        function tried(id) { return s.run.indexOf(id) >= 0 || s.unsafe.indexOf(id) >= 0; }
        function outOfTime() { return !w.tests.some(function (t) { return !tried(t.id) && t.min <= left(); }); }

        function renderInfo() {
            var box = q('info'), html;
            html = '<span class="seg info-tabs" aria-label="Ticket information">' +
                [['ticket', 'Ticket'], ['history', w.logLabel || 'Log'], ['causes', 'Causes']].map(function (p) {
                    return '<button class="seg-btn" type="button" data-tab="' + p[0] + '" aria-pressed="' + (s.tab === p[0]) + '">' + p[1] + '</button>';
                }).join('') + '</span>';
            if (s.tab === 'ticket') {
                html += '<div class="wo-title">' + w.title + '</div><p class="wo-over">' + w.overview + '</p>' +
                    '<div class="np"><span class="np-head">' + w.npHead + '</span><div class="np-grid">' +
                    w.nameplate.map(function (p) { return '<div><span class="np-k">' + p[0] + '</span><span class="np-v">' + p[1] + '</span></div>'; }).join('') +
                    '</div></div><div class="sym"><span class="sym-head">Reported problem</span><p class="sym-text">' + w.symptom + '</p></div>';
            } else if (s.tab === 'history') {
                html += '<div class="wo-title">' + (w.logLabel || 'Log') + '</div><p class="wo-over">Some entries may not matter.</p>' +
                    '<div class="hist">' + w.history.map(function (h) {
                        return '<div class="hist-row"><span class="hist-when">' + h[0] + '</span><span class="hist-text">' + h[1] + '</span></div>';
                    }).join('') + '</div>';
            } else {
                html += '<div class="wo-title">Possible causes</div>' +
                    '<p class="cause-note">Strike out a cause only when a reading rules it out. Your record checks each strike against your readings.</p>' +
                    '<div class="cause-list">' + w.diagnoses.map(function (d, i) {
                        var out = s.struck.indexOf(i) >= 0;
                        return '<button class="cause-btn" type="button" data-cause="' + i + '" aria-pressed="' + out + '"' + (s.stage === 'record' ? ' disabled' : '') + '>' +
                            '<span class="wt-mark">' + (out ? '✗' : '○') + '</span><span class="cb-body"><span class="cb-text">' + d.text + '</span>' +
                            (d.hint ? '<span class="cb-hint">' + d.hint + '</span>' : '') + '</span></button>';
                    }).join('') + '</div>';
            }
            box.innerHTML = html;
            box.querySelectorAll('[data-tab]').forEach(function (b) {
                b.addEventListener('click', function () { s.tab = b.dataset.tab; renderInfo(); box.querySelector('[data-tab="' + s.tab + '"]').focus(); });
            });
            box.querySelectorAll('[data-cause]').forEach(function (b) {
                b.addEventListener('click', function () {
                    var i = +b.dataset.cause, k = s.struck.indexOf(i);
                    if (k >= 0) s.struck.splice(k, 1); else s.struck.push(i);
                    renderInfo();
                    box.querySelector('[data-cause="' + i + '"]').focus();
                });
            });
        }
        function testButton(t, onClick) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'wo-test';
            b.dataset.id = t.id;
            b.innerHTML = '<span class="wt-mark"></span><span class="wt-text">' + t.label + '</span><span class="wt-cost"></span>';
            b.addEventListener('click', onClick);
            return b;
        }
        function renderWork() {
            var box = q('work');
            if (s.stage === 'investigate') {
                box.innerHTML = '<div class="sim-head"><span>Choose a test</span><span class="sim-note">Read each one before you run it.</span></div><div class="test-grid"></div>';
                var g = box.querySelector('.test-grid');
                w.tests.forEach(function (t) { g.appendChild(testButton(t, function () { runTest(t); })); });
                syncTests();
            } else if (s.stage === 'diagnose') {
                box.innerHTML = '<div class="diag-grid"><div><div class="sim-head"><span>Most likely cause</span></div><div class="opt-list" data-k="diag"></div></div>' +
                    '<div><div class="sim-head"><span>Recommended fix</span></div><div class="opt-list" data-k="repair"></div></div></div>';
                [['diag', w.diagnoses], ['repair', w.repairs]].forEach(function (pair) {
                    var list = box.querySelector('[data-k="' + pair[0] + '"]');
                    pair[1].forEach(function (o, i) {
                        var b = document.createElement('button');
                        b.type = 'button';
                        b.className = 'wo-opt';
                        b.innerHTML = '<span class="wt-mark"></span><span>' + o.text + '</span>';
                        b.addEventListener('click', function () { s[pair[0]] = i; syncOpts(); renderBar(); });
                        list.appendChild(b);
                    });
                });
                syncOpts();
            } else if (s.stage === 'defend') {
                box.innerHTML = '<div class="sim-head"><span>Defend your diagnosis</span></div>' +
                    '<p class="defend-q">You chose <b>' + w.diagnoses[s.diag].text + '</b>. Tag every reading that supports it.</p><div class="test-grid"></div>';
                var g2 = box.querySelector('.test-grid');
                s.run.forEach(function (id) {
                    g2.appendChild(testButton(test(id), function () {
                        var k = s.tags.indexOf(id);
                        if (k >= 0) s.tags.splice(k, 1); else s.tags.push(id);
                        s.view = { id: id };
                        syncTags(); renderEvidence(); renderBar();
                    }));
                });
                syncTags();
            } else renderRecord(box);
        }
        function syncTests() {
            var rem = left();
            q('work').querySelectorAll('.wo-test').forEach(function (b) {
                var t = test(b.dataset.id), run = s.run.indexOf(t.id) >= 0, bad = s.unsafe.indexOf(t.id) >= 0;
                b.classList.toggle('is-run', run);
                b.classList.toggle('is-unsafe', bad);
                b.classList.toggle('is-view', !!s.view && s.view.id === t.id);
                b.disabled = !run && !bad && t.min > rem;
                b.querySelector('.wt-mark').textContent = run ? '✓' : bad ? '⚠' : '';
                b.querySelector('.wt-cost').textContent = run ? 'done' : bad ? 'stopped' : t.min + ' min';
            });
        }
        function syncTags() {
            q('work').querySelectorAll('.wo-test').forEach(function (b) {
                var tagged = s.tags.indexOf(b.dataset.id) >= 0;
                b.classList.toggle('is-tag', tagged);
                b.setAttribute('aria-pressed', tagged);
                b.querySelector('.wt-mark').textContent = tagged ? '☑' : '☐';
                b.querySelector('.wt-cost').textContent = '';
            });
        }
        function syncOpts() {
            ['diag', 'repair'].forEach(function (k) {
                q('work').querySelectorAll('[data-k="' + k + '"] .wo-opt').forEach(function (b, i) {
                    b.setAttribute('aria-pressed', s[k] === i ? 'true' : 'false');
                    b.querySelector('.wt-mark').textContent = s[k] === i ? '●' : '○';
                });
            });
        }
        function runTest(t) {
            if (!tried(t.id)) {
                if (t.min > left()) return;
                (t.unsafe ? s.unsafe : s.run).push(t.id);
                s.used += t.min;
            }
            s.view = { id: t.id, unsafe: !!t.unsafe };
            syncTests(); renderEvidence(); renderBar();
        }
        function renderEvidence() {
            var chips = q('chips'), body = q('ev-body');
            var hadFocus = document.activeElement && document.activeElement.classList.contains('ev-chip') ? document.activeElement.dataset.id : null;
            chips.innerHTML = '';
            if (!s.run.length) chips.innerHTML = '<span class="ev-none">No tests run yet</span>';
            s.run.forEach(function (id) {
                var c = document.createElement('button');
                c.type = 'button';
                c.className = 'ev-chip';
                c.dataset.id = id;
                c.textContent = test(id).name;
                c.setAttribute('aria-pressed', s.view && s.view.id === id ? 'true' : 'false');
                c.addEventListener('click', function () { s.view = { id: id }; renderEvidence(); if (s.stage === 'investigate') syncTests(); });
                chips.appendChild(c);
                if (hadFocus === id) c.focus();
            });
            var t = s.view && test(s.view.id);
            q('ev').classList.toggle('bad', !!(s.view && s.view.unsafe));
            if (!t) body.innerHTML = '<span class="ev-proc">Choose a test. Its result appears here, and you can reopen it from the chips above.</span>';
            else if (s.view.unsafe) body.innerHTML = '<span class="ev-warn">⚠ NOT SAFE PRACTICE · NOT PERFORMED</span>' + t.warn;
            else body.innerHTML = '<span class="ev-proc">' + t.proc + '</span>' + reading(t, s.cause);
        }
        function renderBar() {
            var show = { back: s.stage === 'diagnose' || s.stage === 'defend', 'to-diag': s.stage === 'investigate',
                         'to-defend': s.stage === 'diagnose', submit: s.stage === 'defend' };
            Object.keys(show).forEach(function (k) { q(k).style.display = show[k] ? '' : 'none'; });
            q('to-diag').disabled = !s.run.length;
            q('to-defend').disabled = s.diag < 0 || s.repair < 0;
            q('submit').disabled = !s.tags.length;
            var count = 'Tests run: ' + s.run.length + ' · Unsafe choices: ' + s.unsafe.length;
            if (s.stage === 'investigate' && !s.run.length) count = 'Run at least one test to unlock Diagnose.';
            else if (s.stage === 'investigate' && outOfTime()) count = 'Out of time: diagnose with what you have.';
            if (s.stage === 'defend') count = s.tags.length ? s.tags.length + ' reading' + (s.tags.length > 1 ? 's' : '') + ' tagged' : 'Tag at least one reading to submit.';
            if (s.stage === 'record') count = 'Press New case to solve a different cause.';
            q('count').textContent = count;
            var rem = left(), pct = Math.min(100, s.used / w.budget * 100);
            q('dt-val').textContent = s.used + ' / ' + w.budget + ' min';
            var fill = q('dt-fill');
            fill.style.width = pct + '%';
            fill.className = 'dt-fill' + (outOfTime() ? ' out' : rem <= w.budget / 4 ? ' low' : '');
            var chip = q('status');
            var name = { investigate: 'INVESTIGATE', diagnose: 'DIAGNOSE', defend: 'DEFEND', record: 'RECORDED' }[s.stage];
            if (s.stage === 'investigate' && s.run.length && outOfTime()) name = 'OUT OF TIME';
            chip.className = 'status-chip ' + (name === 'OUT OF TIME' ? 'bad' : { investigate: 'busy', diagnose: 'caution', defend: 'caution', record: 'ok' }[s.stage]);
            chip.textContent = name;
        }
        function renderRecord(box) {
            var c = w.causes[s.cause];
            var ranKeys = c.key.filter(function (k) { return s.run.indexOf(k) >= 0; });
            var keyRan = ranKeys.length > 0;
            function names(ids, join) { return ids.map(function (k) { return test(k).name; }).join(join); }
            var nRel = s.run.filter(function (id) { return relevant(test(id)); }).length;
            var d = w.diagnoses[s.diag], r = w.repairs[s.repair];
            var dOK = d.cause === s.cause, rOK = r.fixes === s.cause, safe = !s.unsafe.length && !r.unsafe;
            var trueIdx = w.diagnoses.map(function (o) { return o.cause; }).indexOf(s.cause);
            var struckTrue = s.struck.indexOf(trueIdx) >= 0;
            function justified(i) {
                var o = w.diagnoses[i];
                if (!o.cause) return o.ruledBy.every(function (id) { return s.run.indexOf(id) >= 0; });
                return s.run.some(function (id) { var t = test(id); return reading(t, o.cause) !== reading(t, s.cause); });
            }
            var unjust = s.struck.filter(function (i) { return i !== trueIdx && !justified(i); });
            var elimOK = s.struck.length > 0 && !struckTrue && !unjust.length;
            var tagKeys = c.key.filter(function (k) { return s.tags.indexOf(k) >= 0; });
            var defOK = dOK && tagKeys.length > 0;
            var score = [keyRan, safe, elimOK, dOK, rOK, defOK].filter(Boolean).length;
            function mark(ok) { return ok ? '<span class="ok">✓</span> ' : '<span class="no">✗</span> '; }
            var rows = [
                ['Key evidence', mark(keyRan) + (keyRan ? 'You checked the ' + names(ranKeys, ' and ') + ' result' + (ranKeys.length > 1 ? 's.' : '.') : 'Not checked: the ' + names(c.key, ' or ') + ' result.')],
                ['Safety', mark(safe) + (safe ? 'No unsafe choices.' : [
                    s.unsafe.length ? s.unsafe.length + ' unsafe choice' + (s.unsafe.length > 1 ? 's' : '') + ' made.' : '',
                    r.unsafe ? 'The fix you chose is unsafe.' : ''].join(' ').trim())],
                ['Ruled out', mark(elimOK) + (struckTrue ? 'You struck out the actual cause (see the ' + names(c.key, ' or ') + ' result).'
                    : unjust.length ? 'No result you took rules out “' + w.diagnoses[unjust[0]].text + '” yet.'
                    : s.struck.length ? (s.struck.length > 1 ? s.struck.length + ' causes struck out, each ruled out by your evidence.' : '1 cause struck out, ruled out by your evidence.') : 'You did not strike out any causes.')],
                ['Diagnosis', mark(dOK) + (dOK ? c.name + '.' : 'Actual cause: ' + c.name + '.')],
                ['Fix', mark(rOK) + (rOK ? r.text + '.' : (r.unsafe ? 'Unsafe: ' : '') + (r.note || 'It does not fix the actual cause.'))],
                ['Defended', mark(defOK) + (defOK ? 'You backed it with the ' + names(tagKeys, ' and ') + ' result' + (tagKeys.length > 1 ? 's.' : '.')
                    : tagKeys.length ? 'The ' + names(tagKeys, ' and ') + ' result you tagged points to the actual cause, not your diagnosis.'
                    : 'No key result tagged (the ' + names(c.key, ' or ') + ' result).')],
            ];
            var stats = s.used + ' of ' + w.budget + ' min · ' + s.run.length + ' test' + (s.run.length === 1 ? '' : 's') + ', ' + nRel + ' useful';
            box.innerHTML = '<div class="sim-head"><span>Record <span class="sim-note">' + stats + '</span></span><span class="rec-score">Score ' + score + ' / 6</span></div>' +
                '<table class="rec-table">' + rows.map(function (row) { return '<tr><td>' + row[0] + '</td><td>' + row[1] + '</td></tr>'; }).join('') + '</table>' +
                '<div class="rec-why"><b>Why:</b> ' + c.why + '</div>';
        }
        function renderAll() { renderInfo(); renderWork(); renderEvidence(); renderBar(); }
        function go(stage) { s.stage = stage; renderAll(); }
        q('to-diag').addEventListener('click', function () { go('diagnose'); });
        q('to-defend').addEventListener('click', function () { if (s.diag >= 0 && s.repair >= 0) go('defend'); });
        q('back').addEventListener('click', function () { go(s.stage === 'defend' ? 'diagnose' : 'investigate'); });
        q('submit').addEventListener('click', function () { if (!s.tags.length) return; s.stage = 'record'; renderAll(); });
        q('new').addEventListener('click', function () { s = fresh(s.cause); renderAll(); });
        renderAll();
        return { root: root, cause: function () { return s.cause; } };
    }

    global.SiliconSims = {
        el: el,
        buildDopingLab: buildDopingLab,
        buildDiodeBench: buildDiodeBench,
        buildRectifierLab: buildRectifierLab,
        buildFlyback: buildFlyback,
        buildServiceCall: buildServiceCall,
        initTaskPager: initTaskPager,
        startSimLoop: startSimLoop,
    };
})(window);
