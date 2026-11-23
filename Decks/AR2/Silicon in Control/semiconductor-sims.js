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
   buildSwitchBench(root) Transistor Switch Bench: a 2N3904 low-side
                          or 2N3906 high-side LED switch with a DMM
                          and a cross-section of carriers crossing
                          the base (Day 5). root[data-static="npn"
                          |"pnp"] draws only that schematic.
   buildRegionExplorer(root)
                          Transistor Region Explorer: the NPN driver
                          with R_B and beta controls, region badge,
                          heat, and an I_C vs I_B graph (Day 6).
   buildMysteryDriver(root)
                          Mystery Driver: hidden-fault mode of the
                          same circuit with tests, a time budget,
                          rule-out, diagnosis, and a record (Day 6).
   buildGateBuilder(root) Transistor Gate Builder: NOT, NAND, and NOR
                          from switch-drawn transistors and a pull-up,
                          with a truth table (Day 7).
   buildTruthDetective(root)
                          Truth Table Detective: a LogiKIT board with
                          a Lab 2 circuit and one hidden fault (Day 7).
   buildInterfaceDriver(root)
                          Interface Driver: 5 V input, optocoupler,
                          2N3904, and a 24 V relay coil with a
                          flyback diode; a DMM with test points and
                          a choice of ground (Day 9).
   buildSwitchCompare(root)
                          Switching Device Comparison: MOSFET, SCR,
                          or TRIAC with a lamp on DC or AC, and a
                          scrolling scope (Day 9).
   buildTimer555(root)    Inside the 555: an astable 555 as blocks
                          with a capacitor gauge and a scope (Day 10).
   buildAlarmLadder(root) The home alarm as logic gates and as a
                          ladder rung side by side (Day 10).
   buildSensorMatch(root) PNP (sourcing) and NPN (sinking) sensors
                          wired to a PLC input (Day 10).
   initSlotBuilder(section, keyPrefix)
                          Drag-or-click card slots with a perfect
                          overlay (Day 8 process flowchart).
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
        Reveal.on('slidechanged', function () { sims.forEach(function (s) { if (s.reset) s.reset(); if (s.sync) s.sync(); }); });
        ['fragmentshown', 'fragmenthidden', 'ready'].forEach(function (ev) {
            Reveal.on(ev, function () { sims.forEach(function (s) { if (s.sync) s.sync(); }); });
        });
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


    /* ─── Shared schematic helpers (Switch Bench, Region Explorer) ── */
    function wire(d, parent) { return el('path', { d: d, class: 'sb-w' }, parent); }
    function sym(d, parent, extra) { var a = { d: d, class: 'sb-sym' }; if (extra) a.style = extra; return el('path', a, parent); }
    function text(x, y, t, cls, parent, anchor) {
        var n = el('text', { x: x, y: y, class: cls, 'text-anchor': anchor || 'start' }, parent);
        n.textContent = t; return n;
    }
    function resV(x, y0, y1, parent) {
        var h = (y1 - y0) / 8, d = 'M' + x + ' ' + y0 + ' l12 ' + h / 2;
        for (var i = 0; i < 7; i++) d += ' l' + (i % 2 ? 24 : -24) + ' ' + h;
        sym(d + ' l12 ' + h / 2, parent);
    }
    function resH(x0, x1, y, parent) {
        var w = (x1 - x0) / 8, d = 'M' + x0 + ' ' + y + ' l' + w / 2 + ' -12';
        for (var i = 0; i < 7; i++) d += ' l' + w + ' ' + (i % 2 ? -24 : 24);
        sym(d + ' l' + w / 2 + ' -12', parent);
    }
    function led(x, y0, parent) {
        var g = el('g', {}, parent);
        el('circle', { cx: x, cy: y0 + 20, r: 36, class: 'sb-glow' }, g);
        el('path', { d: 'M' + (x - 24) + ' ' + y0 + ' H' + (x + 24) + ' L' + x + ' ' + (y0 + 40) + ' Z', class: 'sb-led' }, g);
        sym('M' + (x - 24) + ' ' + (y0 + 40) + ' H' + (x + 24), g);
        sym('M' + (x - 34) + ' ' + (y0 + 8) + ' l-16 -12 M' + (x - 34) + ' ' + (y0 + 24) + ' l-16 -12', g, 'stroke-width:3');
        return g;
    }
    function ground(x, y, parent) {
        sym('M' + (x - 24) + ' ' + y + ' H' + (x + 24) + ' M' + (x - 15) + ' ' + (y + 10) + ' H' + (x + 15) + ' M' + (x - 6) + ' ' + (y + 20) + ' H' + (x + 6), parent);
    }
    function arrowHead(x1, y1, x2, y2, t, parent) {
        var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L;
        var tx = x1 + dx * t, ty = y1 + dy * t, bx = tx - ux * 18, by = ty - uy * 18;
        el('path', { d: 'M' + tx + ' ' + ty + ' L' + (bx - uy * 9) + ' ' + (by + ux * 9) + ' L' + (bx + uy * 9) + ' ' + (by - ux * 9) + ' Z', class: 'sb-arrow' }, parent);
    }
    function transistor(cx, cy, pnp, parent) {
        el('circle', { cx: cx, cy: cy, r: 50, class: 'sb-body' }, parent);
        sym('M' + (cx - 20) + ' ' + (cy - 28) + ' V' + (cy + 28), parent, 'stroke-width:6');
        sym('M' + (cx - 20) + ' ' + (cy - 14) + ' L' + (cx + 20) + ' ' + (cy - 42), parent);
        sym('M' + (cx - 20) + ' ' + (cy + 14) + ' L' + (cx + 20) + ' ' + (cy + 42), parent);
        if (!pnp) arrowHead(cx - 20, cy + 14, cx + 20, cy + 42, 0.9, parent);
        else arrowHead(cx + 20, cy - 42, cx - 20, cy - 14, 0.8, parent);
    }
    function swtch(x0, x1, y, parent) {
        el('circle', { cx: x0, cy: y, r: 6, class: 'sb-dot' }, parent);
        el('circle', { cx: x1, cy: y, r: 6, class: 'sb-dot' }, parent);
        return el('line', { x1: x0, y1: y, x2: x1 - 4, y2: y - 34, class: 'sb-sym sb-lever' }, parent);
    }
    function mark(x, y, w, h, parent) { return el('rect', { x: x, y: y, width: w, height: h, rx: 12, class: 'sb-mark' }, parent); }


    /* ─── Transistor Switch Bench ────────────────────────────
       A 2N3904 low-side switch (NPN) or a 2N3906 high-side switch
       (PNP) on 5 V: a 4.7 kOhm base resistor through a switch, and
       a red LED with a 150 Ohm resistor in the collector path. With
       the switch closed the transistor is saturated:
         I_B = (5 - 0.72) / 4700          = 0.91 mA
         I_C = (5 - 2.0 LED - 0.10) / 150 = 19.33 mA
       so I_C / I_B is about 21, well below beta (about 150), because
       the load limits the collector current. A cross-section shows
       carriers from the emitter flooding the thin base: about 1 in
       21 leaves through the base lead, the rest reach the collector.
       Electrons for the NPN, holes for the PNP.
       ───────────────────────────────────────────────────── */
    function buildSwitchBench(root) {
        var VCC = 5, RB = 4700, RC = 150, VLED = 2.0, VBE = 0.72, VCESAT = 0.10;
        var IB_ON = (VCC - VBE) / RB, IC_ON = (VCC - VLED - VCESAT) / RC;
        var svg = root.querySelector('[data-role="circuit"]');
        var xs = root.querySelector('[data-role="xsec"]');
        function q(r) { return root.querySelector('[data-role="' + r + '"]'); }
        var type = 'npn', closed = false, measuring = null, parts = [], spawn = 0;

        // NPN low-side switch: the load sits between +5 V and the collector.
        var gN = el('g', {}, svg), mN = {};
        wire('M100 50 H480 V80 M480 160 V196 M480 236 V292 M480 382 V470 M440 340 H380 M280 340 H200 M140 340 H100 V50', gN);
        sym('M480 292 V298', gN);
        el('circle', { cx: 100, cy: 50, r: 7, class: 'sb-dot' }, gN);
        text(116, 34, '+5 V', 'sb-lbl-b', gN);
        resV(480, 80, 160, gN); text(512, 130, '150 Ω', 'sb-lbl', gN);
        var ledN = led(480, 196, gN); text(526, 226, 'LED', 'sb-lbl', gN);
        transistor(460, 340, false, gN);
        text(512, 300, 'C', 'sb-lbl-b', gN); text(512, 404, 'E', 'sb-lbl-b', gN); text(410, 324, 'B', 'sb-lbl-b', gN, 'middle');
        text(530, 352, '2N3904', 'sb-lbl', gN);
        ground(480, 470, gN);
        resH(380, 280, 340, gN); text(330, 300, '4.7 kΩ', 'sb-lbl', gN, 'middle');
        var levN = swtch(140, 200, 340, gN); text(170, 400, 'Switch', 'sb-lbl', gN, 'middle');
        mN.ib = mark(266, 306, 128, 68, gN); mN.ic = mark(446, 70, 68, 100, gN); mN.vbe = mark(396, 284, 128, 120, gN);

        // PNP high-side switch: the load sits between the collector and ground.
        var gP = el('g', {}, svg), mP = {};
        wire('M300 50 H480 V118 M480 202 V236 M480 276 V320 M480 400 V470 M440 160 H380 M280 160 H200 M140 160 H100 V470', gP);
        el('circle', { cx: 300, cy: 50, r: 7, class: 'sb-dot' }, gP);
        text(280, 40, '+5 V', 'sb-lbl-b', gP, 'end');
        transistor(460, 160, true, gP);
        text(512, 118, 'E', 'sb-lbl-b', gP); text(512, 220, 'C', 'sb-lbl-b', gP); text(410, 144, 'B', 'sb-lbl-b', gP, 'middle');
        text(530, 172, '2N3906', 'sb-lbl', gP);
        var ledP = led(480, 236, gP); text(526, 266, 'LED', 'sb-lbl', gP);
        resV(480, 320, 400, gP); text(512, 370, '150 Ω', 'sb-lbl', gP);
        ground(480, 470, gP); ground(100, 470, gP);
        resH(380, 280, 160, gP); text(330, 120, '4.7 kΩ', 'sb-lbl', gP, 'middle');
        var levP = swtch(140, 200, 160, gP); text(170, 220, 'Switch', 'sb-lbl', gP, 'middle');
        mP.ib = mark(266, 126, 128, 68, gP); mP.ic = mark(446, 310, 68, 100, gP); mP.vbe = mark(396, 96, 128, 128, gP);

        // Static schematic for a lab slide: root[data-static="npn"|"pnp"].
        if (root.dataset.static) {
            (root.dataset.static === 'pnp' ? gN : gP).style.display = 'none';
            [mN, mP].forEach(function (m) { Object.keys(m).forEach(function (k) { m[k].remove(); }); });
            return null;
        }

        // Cross-section: emitter | thin base | collector.
        var regE = el('rect', { x: 30, y: 70, width: 220, height: 120 }, xs);
        var regB = el('rect', { x: 250, y: 70, width: 50, height: 120 }, xs);
        var regC = el('rect', { x: 300, y: 70, width: 230, height: 120 }, xs);
        el('path', { d: 'M0 130 H30 M530 130 H560 M275 70 V16', class: 'sb-w xs-lead' }, xs);
        var gC = el('g', {}, xs);
        var tE = text(140, 116, '', 'sb-lbl-b', xs, 'middle'), tB = text(275, 116, '', 'sb-lbl-b', xs, 'middle'), tC = text(415, 116, '', 'sb-lbl-b', xs, 'middle');
        text(292, 34, 'Base', 'sb-lbl', xs);
        text(140, 226, 'Emitter', 'sb-lbl', xs, 'middle');
        text(415, 226, 'Collector', 'sb-lbl', xs, 'middle');

        function on() { return closed; }
        function render() {
            var pnp = type === 'pnp', isOn = on();
            gN.style.display = pnp ? 'none' : ''; gP.style.display = pnp ? '' : 'none';
            root.classList.toggle('sb-on', isOn);
            [levN, levP].forEach(function (lv) {
                lv.setAttribute('x2', closed ? 200 : 196);
                lv.setAttribute('y2', +lv.getAttribute('y1') - (closed ? 0 : 34));
            });
            var marks = pnp ? mP : mN;
            [mN, mP].forEach(function (m) { Object.keys(m).forEach(function (k) { m[k].classList.toggle('on', m === marks && k === measuring); }); });
            regE.setAttribute('class', pnp ? 'sb-reg-p' : 'sb-reg-n');
            regB.setAttribute('class', pnp ? 'sb-reg-n' : 'sb-reg-p');
            regC.setAttribute('class', pnp ? 'sb-reg-p' : 'sb-reg-n');
            tE.textContent = pnp ? 'P' : 'N'; tB.textContent = pnp ? 'N' : 'P'; tC.textContent = pnp ? 'P' : 'N';
            q('xs-note').textContent = pnp ? 'PNP · holes' : 'NPN · electrons';
            root.querySelectorAll('[data-tr-type]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.trType === type ? 'true' : 'false'); });
            root.querySelectorAll('[data-measure]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.measure === measuring ? 'true' : 'false'); });
            q('sw').textContent = closed ? 'Open the switch' : 'Close the switch';
            var dmm = q('dmm'), name = q('dmm-name');
            if (measuring === 'ib') { name.textContent = 'DMM · base current'; dmm.textContent = (isOn ? IB_ON * 1000 : 0).toFixed(2) + ' mA'; }
            else if (measuring === 'ic') { name.textContent = 'DMM · collector current'; dmm.textContent = (isOn ? IC_ON * 1000 : 0).toFixed(2) + ' mA'; }
            else if (measuring === 'vbe') { name.textContent = 'DMM · volts, base to emitter'; dmm.textContent = (isOn ? (pnp ? -VBE : VBE) : 0).toFixed(2) + ' V'; }
            else { name.textContent = 'DMM'; dmm.textContent = '-.--'; }
            var msg;
            if (!pnp) msg = closed
                ? '<b>Switch closed:</b> a small current flows <b>into the base</b>, and the transistor turns on. A much larger current flows from collector to emitter, and the LED lights.'
                : '<b>Switch open:</b> no current reaches the base, so the transistor is <b>off</b>. The collector-to-emitter path blocks current, and the LED is dark.';
            else msg = closed
                ? '<b>Switch closed:</b> a small current flows <b>out of the base</b> to ground, and the transistor turns on. A much larger current flows from emitter to collector, and the LED lights.'
                : '<b>Switch open:</b> the base is not connected to ground, so no base current flows and the transistor is <b>off</b>. The LED is dark.';
            q('feedback').innerHTML = msg;
        }
        function tick(dt) {
            if (on()) {
                spawn += dt * 18;
                while (spawn >= 1) {
                    spawn -= 1;
                    var c = el('circle', { r: 7, class: type === 'pnp' ? 'sb-h' : 'sb-e' }, gC);
                    parts.push({ x: 36, y: 84 + Math.random() * 92, vx: 150 + Math.random() * 50, out: Math.random() < 1 / 21, up: false, el: c });
                }
            }
            parts.forEach(function (p) {
                if (p.up) { p.x += (275 - p.x) * Math.min(1, dt * 8); p.y -= 160 * dt; if (p.y < 14) p.dead = true; }
                else {
                    p.x += p.vx * dt; p.y += (Math.random() - 0.5) * 60 * dt;
                    p.y = Math.max(80, Math.min(180, p.y));
                    if (p.out && p.x >= 268) p.up = true;
                    if (p.x > 524) p.dead = true;
                }
                if (p.dead) gC.removeChild(p.el);
                else { p.el.setAttribute('cx', p.x.toFixed(1)); p.el.setAttribute('cy', p.y.toFixed(1)); }
            });
            parts = parts.filter(function (p) { return !p.dead; });
        }
        root.querySelectorAll('[data-tr-type]').forEach(function (b) {
            b.addEventListener('click', function () { if (type !== b.dataset.trType) { type = b.dataset.trType; closed = false; parts = []; gC.innerHTML = ''; render(); } });
        });
        q('sw').addEventListener('click', function () { closed = !closed; render(); });
        root.querySelectorAll('[data-measure]').forEach(function (b) {
            b.addEventListener('click', function () { measuring = b.dataset.measure; render(); });
        });
        function reset() { type = 'npn'; closed = false; measuring = null; parts = []; spawn = 0; gC.innerHTML = ''; render(); }
        reset();
        return { root: root, tick: tick, reset: reset };
    }


    /* ─── NPN driver schematic (Region Explorer, Mystery Driver) ──
       The Day 5 low-side switch: +5 V, a 150 Ohm resistor and a red
       LED to the collector, the emitter to ground, and the base fed
       from an input switch through R_B. Wires are split by loop so
       the base loop and the collector loop light separately.
       ───────────────────────────────────────────────────── */
    function npnDriver(svg, opts) {
        opts = opts || {};
        var h = {};
        h.rail = wire('M100 50 H480', svg);
        h.wB = [wire('M140 340 H100 V50', svg), wire('M440 340 H380 M280 340 H200', svg)];
        h.wC = [wire('M480 50 V80 M480 160 V196 M480 236 V292', svg)];
        h.wE = wire('M480 382 V470', svg);
        sym('M480 292 V298', svg);
        el('circle', { cx: 100, cy: 50, r: 7, class: 'sb-dot' }, svg);
        text(116, 34, '+5 V', 'sb-lbl-b', svg);
        resV(480, 80, 160, svg); text(512, 130, '150 Ω', 'sb-lbl', svg);
        h.led = led(480, 196, svg); text(526, 226, 'LED', 'sb-lbl', svg);
        h.glow = h.led.querySelector('.sb-glow'); h.ledBody = h.led.querySelector('.sb-led');
        transistor(460, 340, false, svg);
        text(512, 300, 'C', 'sb-lbl-b', svg); text(512, 404, 'E', 'sb-lbl-b', svg); text(410, 324, 'B', 'sb-lbl-b', svg, 'middle');
        h.part = text(530, 352, opts.part === undefined ? '2N3904' : opts.part, 'sb-lbl', svg);
        ground(480, 470, svg);
        resH(380, 280, 340, svg); h.rb = text(330, 300, opts.rb || '4.7 kΩ', 'sb-lbl', svg, 'middle');
        if (opts.rb === 'R_B') { h.rb.textContent = 'R'; h.rb.style.fontSize = '36px'; el('tspan', { 'baseline-shift': 'sub', style: 'font-size:31px' }, h.rb).textContent = 'B'; }
        h.lever = swtch(140, 200, 340, svg); text(170, 400, opts.swLabel || 'Input', 'sb-lbl', svg, 'middle');
        h.iB = text(330, 392, '', 'sb-cur', svg, 'middle');
        h.iC = text(500, 266, '', 'sb-cur', svg);
        h.marks = {
            vb: el('circle', { cx: 440, cy: 340, r: 20, class: 'sb-mark' }, svg),
            vc: el('circle', { cx: 480, cy: 292, r: 20, class: 'sb-mark' }, svg),
            ve: el('circle', { cx: 480, cy: 388, r: 20, class: 'sb-mark' }, svg),
            vled: mark(446, 186, 68, 60, svg),
            ib: mark(266, 306, 128, 68, svg),
            bands: mark(266, 306, 128, 68, svg),
            part: mark(396, 284, 210, 120, svg),
            diode: mark(396, 284, 128, 120, svg),
            pins: mark(396, 284, 128, 120, svg),
            trace: mark(446, 380, 68, 120, svg),
        };
        h.setSwitch = function (closed) {
            h.lever.setAttribute('x2', closed ? 200 : 196);
            h.lever.setAttribute('y2', closed ? 340 : 306);
        };
        h.setFlow = function (ib, ic) {
            h.wB.forEach(function (w) { w.classList.toggle('lit', ib > 0); });
            h.wC.forEach(function (w) { w.classList.toggle('lit', ic > 0); });
            h.wE.classList.toggle('lit', ib + ic > 0);
            h.rail.classList.toggle('lit', ib + ic > 0);
        };
        h.setLed = function (b) {
            b = Math.max(0, Math.min(1, b));
            h.glow.style.opacity = (b > 0 ? 0.08 + 0.32 * b : 0).toFixed(3);
            h.ledBody.style.fill = 'rgba(255,107,94,' + (0.15 + 0.85 * b).toFixed(3) + ')';
        };
        h.showMark = function (k) { Object.keys(h.marks).forEach(function (m) { h.marks[m].classList.toggle('on', m === k); }); };
        return h;
    }
    function fmtI(a) {
        if (a <= 0) return '0 mA';
        if (a < 1e-3) return (a * 1e6).toFixed(a < 1e-5 ? 1 : 0) + ' µA';
        return (a * 1e3).toFixed(a < 1e-2 ? 2 : 1) + ' mA';
    }

    /* ─── Transistor Region Explorer ──────────────────────────
       The NPN driver with an input switch, a base resistor picked
       from standard values (1 kOhm to 1 MOhm), and beta 100, 150, or
       300. Model from the unit plan:
         I_B = (5 - 0.7) / R_B with the input on, else 0
         I_C(sat) = (5 - 2.0 LED - 0.2) / 150 = 18.67 mA
         I_C = min(beta * I_B, I_C(sat))
         V_CE = 5 - 2.0 - I_C * 150, floored at 0.2 V; 5 V in cutoff
         P = I_C * V_CE, which peaks in the active region
       With beta 150: 4.7 kOhm saturates (0.91 mA), 47 kOhm is active
       (91 µA, 13.7 mA, V_CE 0.94 V), 470 kOhm is active (9.1 µA,
       1.37 mA, V_CE 2.79 V).
       ───────────────────────────────────────────────────── */
    var RB_VALUES = [1e3, 1.5e3, 2.2e3, 3.3e3, 4.7e3, 6.8e3, 10e3, 15e3, 22e3, 33e3, 47e3, 68e3, 100e3, 150e3, 220e3, 330e3, 470e3, 680e3, 1e6];
    function fmtR(r) { return r >= 1e6 ? (r / 1e6) + ' MΩ' : (r / 1e3) + ' kΩ'; }
    function buildRegionExplorer(root) {
        var VCC = 5, VBE = 0.7, VLED = 2.0, RC = 150, VSAT = 0.2, ICSAT = (VCC - VLED - VSAT) / RC;
        function q(r) { return root.querySelector('[data-role="' + r + '"]'); }
        var c = npnDriver(q('circuit'), { rb: '47 kΩ' });
        var plot = q('plot');
        var on = false, rbIdx = 10, beta = 150;

        // Graph: I_B 0 to 200 µA across, I_C 0 to 25 mA up.
        var PX0 = 84, PX1 = 540, PY0 = 196, PY1 = 16, IBMAX = 200e-6, ICMAX = 25e-3;
        function gx(ib) { return PX0 + (PX1 - PX0) * Math.min(ib, IBMAX) / IBMAX; }
        function gy(ic) { return PY0 - (PY0 - PY1) * ic / ICMAX; }
        el('path', { d: 'M' + PX0 + ' ' + PY1 + ' V' + PY0 + ' H' + PX1, class: 'db-axis' }, plot);
        [0, 50, 100, 150, 200].forEach(function (u) {
            el('text', { x: gx(u * 1e-6), y: PY0 + 30, class: 'db-tick', 'text-anchor': 'middle' }, plot).textContent = u;
        });
        [0, 10, 20].forEach(function (m) {
            el('text', { x: PX0 - 12, y: gy(m * 1e-3) + 8, class: 'db-tick', 'text-anchor': 'end' }, plot).textContent = m;
        });
        el('text', { x: (PX0 + PX1) / 2, y: PY0 + 60, class: 'db-tick', 'text-anchor': 'middle' }, plot).textContent = 'Base current (µA)';
        el('text', { x: 16, y: (PY0 + PY1) / 2, class: 'db-tick', 'text-anchor': 'middle', transform: 'rotate(-90 16 ' + (PY0 + PY1) / 2 + ')' }, plot).textContent = 'mA';
        el('path', { d: 'M' + PX0 + ' ' + gy(ICSAT) + ' H' + PX1, class: 're-limit' }, plot);
        el('text', { x: PX1, y: gy(ICSAT) - 10, class: 'db-tick', 'text-anchor': 'end' }, plot).textContent = 'load limit';
        var curve = el('path', { class: 're-curve' }, plot);
        var pt = el('circle', { r: 9, class: 're-pt' }, plot);

        function solve() {
            var rb = RB_VALUES[rbIdx], ib = on ? (VCC - VBE) / rb : 0;
            var ic = Math.min(beta * ib, ICSAT);
            var vce = ic > 0 ? Math.max(VSAT, VCC - VLED - ic * RC) : VCC;
            var region = ib <= 0 ? 'cutoff' : (beta * ib >= ICSAT ? 'sat' : 'active');
            return { rb: rb, ib: ib, ic: ic, vce: vce, p: ic * vce, region: region };
        }
        function render() {
            var s = solve();
            c.rb.textContent = fmtR(s.rb);
            c.setSwitch(on); c.setFlow(s.ib, s.ic); c.setLed(s.ic / ICSAT);
            c.iB.textContent = s.ib > 0 ? fmtI(s.ib) : '';
            c.iC.textContent = s.ic > 0 ? fmtI(s.ic) : '';
            q('rb-val').textContent = fmtR(s.rb);
            q('rb').value = rbIdx;
            q('sw').textContent = on ? 'Input off' : 'Input on';
            root.querySelectorAll('[data-beta]').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.beta === beta ? 'true' : 'false'); });
            q('ib').textContent = fmtI(s.ib);
            q('ic').textContent = fmtI(s.ic);
            q('vce').textContent = s.vce.toFixed(2) + ' V';
            var badge = q('region');
            badge.textContent = { cutoff: 'Cutoff', active: 'Active', sat: 'Saturation' }[s.region];
            badge.className = 're-badge re-' + s.region;
            var pmw = s.p * 1000;
            q('heat-val').textContent = pmw.toFixed(1) + ' mW';
            q('heat-bar').style.width = Math.min(100, pmw / 15 * 100).toFixed(1) + '%';
            var knee = ICSAT / beta;
            curve.setAttribute('d', knee < IBMAX
                ? 'M' + gx(0) + ' ' + gy(0) + ' L' + gx(knee) + ' ' + gy(ICSAT) + ' H' + PX1
                : 'M' + gx(0) + ' ' + gy(0) + ' L' + PX1 + ' ' + gy(beta * IBMAX));
            pt.setAttribute('cx', gx(s.ib)); pt.setAttribute('cy', gy(s.ic));
            pt.classList.toggle('off-scale', s.ib > IBMAX);
            q('plot-note').textContent = s.ib > IBMAX ? 'off the scale →' : 'β = ' + beta;
            var msg;
            if (s.region === 'cutoff') msg = '<b>Cutoff:</b> no base current, so no collector current. The transistor is an <b>open switch</b>, and the whole 5 V appears across it.';
            else if (s.region === 'active') msg = '<b>Active:</b> I<sub>C</sub> = β × I<sub>B</sub> = ' + fmtI(s.ic) + ', so the collector current follows the base current. With ' + s.vce.toFixed(2) + ' V across it, the transistor turns <b>' + pmw.toFixed(1) + ' mW</b> into heat.';
            else msg = '<b>Saturation:</b> the base could drive ' + fmtI(beta * s.ib) + ', but the load allows only ' + fmtI(ICSAT) + '. V<sub>CE</sub> falls to 0.2 V, and the transistor is a <b>closed switch</b>.';
            q('feedback').innerHTML = msg;
        }
        q('sw').addEventListener('click', function () { on = !on; render(); });
        q('rb').addEventListener('input', function () { rbIdx = +this.value; render(); });
        root.querySelectorAll('[data-beta]').forEach(function (b) { b.addEventListener('click', function () { beta = +b.dataset.beta; render(); }); });
        root.querySelectorAll('[data-rb-pick]').forEach(function (b) {
            b.addEventListener('click', function () { rbIdx = RB_VALUES.indexOf(+b.dataset.rbPick); render(); });
        });
        function reset() { on = false; rbIdx = 10; beta = 150; render(); }
        reset();
        return { root: root, reset: reset };
    }

    /* ─── Mystery Driver (hidden-fault mode of the NPN driver) ──
       The build sheet calls for a 2N3904, a 4.7 kOhm base resistor,
       and the emitter to ground. The input is on, but the LED is dim
       or dark. Hidden causes, dealt from a shuffled deck:
         rb    base resistor is 470 kOhm   I_B 9 µA, V_C 2.79 V, LED dim
         rev   transistor turned around    I_B 0.91 mA, reverse beta
                                           about 2, V_C 2.73 V, LED dim
         pnp   a 2N3906 in its place       no current, V_B 5.00 V
         open  emitter not grounded        no current, V_E 4.38 V
       The distractor, a blown transistor (B-E junction open), reads
       like pnp or open in circuit; only the diode test rules it out.
       Tests cost bench minutes against a budget; two unsafe choices
       are charged and never carried out. Students strike causes,
       diagnose with a fix, tag supporting readings, and get a record.
       ───────────────────────────────────────────────────── */
    var MD_CAUSES = {
        rb:   { name: 'Base resistor too large', fix: 0, led: 0.075,
                why: 'A 470 kΩ resistor (yellow, violet, <b>yellow</b>) lets only about <b>9 µA</b> into the base. β × 9 µA is far below the 18.7 mA the load allows, so the transistor sits in the <b>active region</b> with almost 3 V across it: a dim LED and a warm transistor.' },
        rev:  { name: 'Transistor turned around', fix: 1, led: 0.097,
                why: 'With the collector and emitter swapped, the base current is normal (<b>0.91 mA</b>), but a transistor run backwards has a current gain of only about 2. The collector current is under 2 mA, so the LED is dim. The pins do not match the datasheet.' },
        pnp:  { name: '2N3906 in place of the 2N3904', fix: 2, led: 0,
                why: 'A 2N3906 is a PNP: its base is N-type. Pulling the base up to 5 V reverse biases its junctions, so no base current flows and the base sits at the full <b>5.00 V</b>. The printing says 2N3906, and the diode test conducts only with the <b>black</b> lead on the base.' },
        open: { name: 'Emitter not connected to ground', fix: 3, led: 0,
                why: 'With the emitter wire missing, base current has nowhere to go, so none flows and the LED is dark. The emitter floats up to about <b>4.4 V</b>, following the base through the base-emitter junction, instead of sitting at 0 V.' },
        blown:{ name: 'Transistor blown (junction open)', fix: 4, distractor: true },
    };
    var MD_ORDER = ['rb', 'rev', 'pnp', 'open', 'blown'];
    var MD_FIXES = ['Fit a 4.7 kΩ base resistor', 'Turn the transistor around to match the pinout', 'Replace it with a 2N3904', 'Jumper the emitter row to the ground rail', 'Replace the transistor with a new one', 'Use a 47 Ω LED resistor so the LED gets more current'];
    var MD_TESTS = [
        { id: 'vb', cost: 1, name: 'V base', label: 'V at the base (to ground)', r: { rb: '0.62 V', rev: '0.72 V', pnp: '5.00 V', open: '5.00 V', blown: '5.00 V' } },
        { id: 'vc', cost: 1, name: 'V collector', label: 'V at the collector', r: { rb: '2.79 V', rev: '2.73 V', pnp: '5.00 V', open: '5.00 V', blown: '5.00 V' } },
        { id: 've', cost: 1, name: 'V emitter', label: 'V at the emitter', r: { rb: '0.00 V', rev: '0.00 V', pnp: '0.00 V', open: '4.38 V', blown: '0.00 V' } },
        { id: 'vled', cost: 1, name: 'V LED', label: 'V across the LED', r: { rb: '2.00 V', rev: '2.00 V', pnp: '0.00 V', open: '0.00 V', blown: '0.00 V' } },
        { id: 'ib', cost: 2, name: 'I base', label: 'Base current, meter in series', r: { rb: '0.009 mA', rev: '0.91 mA', pnp: '0.00 mA', open: '0.00 mA', blown: '0.00 mA' } },
        { id: 'bands', cost: 2, name: 'Bands', label: 'Read R<sub>B</sub> color bands', r: { rb: 'Yellow, violet, yellow: 470 kΩ', def: 'Yellow, violet, red: 4.7 kΩ' } },
        { id: 'part', cost: 2, name: 'Part no.', label: 'Read the part number', r: { pnp: '2N3906', def: '2N3904' } },
        { id: 'pins', cost: 2, name: 'Pinout', label: 'Check pins vs. datasheet', r: { rev: 'The emitter lead is in the collector row: turned around', def: 'E, B, C are in the right rows' } },
        { id: 'trace', cost: 2, name: 'Emitter wire', label: 'Trace the emitter wire', r: { open: 'No jumper from the emitter row to ground', def: 'Emitter row jumpered to the ground rail' } },
        { id: 'diode', cost: 3, name: 'Diode test', label: 'Pull it: diode-test junctions', r: { pnp: 'Conducts (0.68 V) only with the black lead on the base: a PNP', blown: 'B–E reads OL both ways: junction open', def: 'Conducts (0.68 V) with the red lead on the base: a good NPN' } },
        { id: 'short', cost: 1, unsafe: true, label: 'Jumper R<sub>B</sub> for more current',
          warn: 'Not done. A wire in place of R<sub>B</sub> puts 5 V straight across the base-emitter junction, and hundreds of mA flow until it burns out. The base resistor is what limits base current.' },
        { id: 'ohmhot', cost: 1, unsafe: true, label: 'Ohms on R<sub>B</sub>, power on',
          warn: 'Not done. An ohmmeter sends its own current, so a powered circuit gives a false reading and can damage the meter. Power down and lift one lead first.' },
    ];
    function buildMysteryDriver(root) {
        var BUDGET = 10;
        var NOTES = [
            ['Mon', 'The driver passed its check, and the LED lit fully.'],
            ['Tue', 'The resistor drawer was restocked. The 4.7 kΩ and 470 kΩ bins sit side by side.'],
            ['Tue', 'The 2N3904 and 2N3906 bags were poured into one bin to save space.'],
            ['Wed', 'The board was knocked off the bench, and a student pushed the parts back in.'],
            ['Thu', 'The bench supply was checked. It reads 5.00 V.'],
        ];
        function q(r) { return root.querySelector('[data-role="' + r + '"]'); }
        var c = npnDriver(q('circuit'), { rb: 'R_B', part: '', swLabel: 'Input' });
        c.setSwitch(true);
        var deck = [], s;
        function pick(avoid) {
            if (!deck.length) {
                var ids = ['rb', 'rev', 'pnp', 'open'];
                for (var i = ids.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = ids[i]; ids[i] = ids[j]; ids[j] = t; }
                if (ids[0] === avoid) ids.push(ids.shift());
                deck = ids;
            }
            return deck.shift();
        }
        function fresh(avoid) { return { cause: pick(avoid), log: [], used: 0, struck: {}, diag: null, fix: null, tags: {}, stage: 'test', tab: 'notes', last: null }; }
        function test(id) { return MD_TESTS.filter(function (t) { return t.id === id; })[0]; }
        function reading(t, cause) { return t.r[cause] || t.r.def; }
        function ran(id) { return s.log.indexOf(id) >= 0; }
        function evidence() { return s.log.filter(function (id) { return !test(id).unsafe; }); }
        function unsafeRun() { return s.log.filter(function (id) { return test(id).unsafe; }); }
        function left() { return BUDGET - s.used; }

        function renderCircuit() {
            var cz = MD_CAUSES[s.cause];
            c.setLed(cz.led);
            c.setFlow(s.cause === 'rb' || s.cause === 'rev' ? 1 : 0, cz.led > 0 ? 1 : 0);
            c.showMark(s.last);
        }
        function renderPanel() {
            var box = q('left');
            root.querySelectorAll('[data-tab]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.tab === s.tab ? 'true' : 'false'); });
            if (s.tab === 'notes') {
                box.innerHTML = '<div class="md-notes">' + NOTES.map(function (n) {
                    return '<div class="md-note"><span class="md-day">' + n[0] + '</span><span>' + n[1] + '</span></div>';
                }).join('') + '</div>';
                return;
            }
            if (!s.log.length) { box.innerHTML = '<p class="md-empty">Run a test. Its reading appears here.</p>'; return; }
            box.innerHTML = '<div class="md-log">' + s.log.map(function (id) {
                var t = test(id);
                if (t.unsafe) return '<div class="md-entry unsafe"><span class="md-k">Unsafe</span><span class="md-v">' + t.warn + '</span></div>';
                return '<button class="md-entry' + (s.tags[id] ? ' tagged' : '') + '" data-log="' + id + '"' + (s.stage === 'defend' ? '' : ' disabled') + '>' +
                    '<span class="md-k">' + t.name + '</span><span class="md-v">' + reading(t, s.cause) + '</span></button>';
            }).join('') + '</div>';
            box.querySelectorAll('[data-log]').forEach(function (b) {
                b.addEventListener('click', function () { s.tags[b.dataset.log] = !s.tags[b.dataset.log]; renderPanel(); renderRight(); renderNav(); });
            });
            box.scrollTop = box.scrollHeight;
        }
        function nTags() { return Object.keys(s.tags).filter(function (k) { return s.tags[k]; }).length; }
        function renderNav() {
            var nav = q('nav'), b = [];
            if (s.stage === 'test') b.push('<button class="sim-btn" data-go="diag">Diagnose</button>');
            if (s.stage === 'diag') b.push('<button class="sim-btn alt" data-go="test">Back to tests</button>', '<button class="sim-btn" data-go="defend"' + (s.diag && s.fix !== null ? '' : ' disabled') + '>Defend</button>');
            if (s.stage === 'defend') b.push('<button class="sim-btn alt" data-go="diag">Back</button>', '<button class="sim-btn" data-go="record"' + (nTags() ? '' : ' disabled') + '>Submit</button>');
            if (s.stage === 'record') b.push('<button class="sim-btn" data-act="md-new">New mystery</button>');
            nav.innerHTML = b.join('');
            nav.querySelectorAll('[data-go]').forEach(function (x) { x.addEventListener('click', function () { go(x.dataset.go); }); });
            var nw = nav.querySelector('[data-act="md-new"]');
            if (nw) nw.addEventListener('click', function () { s = fresh(s.cause); renderAll(); });
        }
        function renderRight() {
            var box = q('right'), html = '';
            q('budget-bar').style.width = (100 * s.used / BUDGET) + '%';
            q('budget-val').textContent = s.used + ' of ' + BUDGET + ' min used';
            if (s.stage === 'test') {
                html = '<div class="md-tests">' + MD_TESTS.map(function (t) {
                    var dis = ran(t.id) || t.cost > left();
                    return '<button class="md-test' + (ran(t.id) ? ' done' : '') + '" data-test="' + t.id + '"' + (dis ? ' disabled' : '') + '><span>' + t.label + '</span><span class="md-cost">' + t.cost + ' min</span></button>';
                }).join('') + '</div>';
            } else if (s.stage === 'diag') {
                html = '<p class="md-help">Strike (✕) each cause your evidence rules out. Then choose the cause and a fix.</p>' +
                    '<div class="md-causes">' + MD_ORDER.map(function (id) {
                        var st = !!s.struck[id];
                        return '<div class="md-cause' + (st ? ' struck' : '') + (s.diag === id ? ' picked' : '') + '">' +
                            '<button class="md-x" data-strike="' + id + '" aria-pressed="' + st + '" aria-label="Rule out">✕</button>' +
                            '<button class="md-pick" data-diag="' + id + '"' + (st ? ' disabled' : '') + '>' + MD_CAUSES[id].name + '</button></div>';
                    }).join('') + '</div>' +
                    '<label class="md-fix-l">Fix <select class="md-fix" data-role="fix"><option value="">Choose a fix</option>' +
                    MD_FIXES.map(function (f, i) { return '<option value="' + i + '"' + (s.fix === i ? ' selected' : '') + '>' + f + '</option>'; }).join('') + '</select></label>';
            } else if (s.stage === 'defend') {
                var n = nTags();
                html = '<p class="md-help">You chose <b>' + MD_CAUSES[s.diag].name + '</b>, and the fix: <b>' + MD_FIXES[s.fix] + '</b>.</p>' +
                    '<p class="md-help">Now <b>tag the readings</b> in the evidence log below that support your diagnosis. Click a reading to tag it.</p>' +
                    '<p class="md-help"><span class="res">' + n + (n === 1 ? ' reading' : ' readings') + ' tagged.</span></p>';
            } else html = renderRecord();
            box.innerHTML = html;
            box.querySelectorAll('[data-test]').forEach(function (b) { b.addEventListener('click', function () { runTest(test(b.dataset.test)); }); });
            box.querySelectorAll('[data-strike]').forEach(function (b) {
                b.addEventListener('click', function () { var id = b.dataset.strike; s.struck[id] = !s.struck[id]; if (s.struck[id] && s.diag === id) s.diag = null; renderRight(); renderNav(); });
            });
            box.querySelectorAll('[data-diag]').forEach(function (b) { b.addEventListener('click', function () { s.diag = b.dataset.diag; renderRight(); renderNav(); }); });
            var fx = box.querySelector('[data-role="fix"]');
            if (fx) fx.addEventListener('change', function () { s.fix = this.value === '' ? null : +this.value; renderNav(); });
        }
        function runTest(t) {
            if (ran(t.id) || t.cost > left()) return;
            s.used += t.cost;
            s.log.push(t.id);
            s.last = t.unsafe ? null : t.id;
            s.tab = 'log';
            renderAll();
        }
        function differs(t, a, b) { return reading(t, a) !== reading(t, b); }
        function renderRecord() {
            var cz = MD_CAUSES[s.cause], ev = evidence();
            var struck = MD_ORDER.filter(function (id) { return s.struck[id]; });
            var fair = struck.filter(function (id) { return id !== s.cause && ev.some(function (tid) { return differs(test(tid), s.cause, id); }); });
            var tagged = Object.keys(s.tags).filter(function (k) { return s.tags[k]; });
            var good = tagged.filter(function (id) { return MD_ORDER.some(function (o) { return o !== s.cause && differs(test(id), s.cause, o); }); });
            var right = s.diag === s.cause, fixed = s.fix === cz.fix, nUnsafe = unsafeRun().length;
            var badStrike = struck.indexOf(s.cause) >= 0, unfair = struck.length - fair.length - (badStrike ? 1 : 0);
            function row(k, ok, v) { return '<tr><td>' + k + '</td><td class="' + (ok ? 'ok' : 'bad') + '">' + v + '</td></tr>'; }
            return '<div class="md-record"><table class="rec-table">' +
                row('Cause', right, right ? 'Correct: ' + cz.name : 'It was: ' + cz.name) +
                row('Fix', fixed, fixed ? 'Correct' : 'Should be: ' + MD_FIXES[cz.fix]) +
                row('Evidence', right && good.length > 0, right ? good.length + ' of ' + tagged.length + ' tagged readings tell this cause apart from the others' : 'Tags earn credit only when the diagnosis is right') +
                row('Ruled out', !badStrike && unfair === 0, fair.length + ' struck with evidence' + (unfair > 0 ? ', ' + unfair + ' without' : '') + (badStrike ? ', and the real cause struck' : '')) +
                row('Safety', !nUnsafe, nUnsafe ? nUnsafe + ' unsafe choice' + (nUnsafe > 1 ? 's' : '') : 'No unsafe choices') +
                row('Time', true, s.used + ' of ' + BUDGET + ' min') +
                '</table><div class="md-why"><b>Why:</b> ' + cz.why + '</div></div>';
        }
        function go(stage) {
            s.stage = stage;
            if (stage === 'defend') s.tab = 'log';
            renderAll();
        }
        function renderAll() { renderCircuit(); renderRight(); renderPanel(); renderNav(); }
        root.querySelectorAll('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { s.tab = b.dataset.tab; renderPanel(); }); });
        s = fresh(null);
        renderAll();
        return { root: root, cause: function () { return s.cause; } };
    }


    /* ─── Logic gate symbols (Gate Builder, Truth Table Detective) ──
       gateSymbol(parent, type, x, y, w, h) draws an AND, OR, XOR, NOT,
       NAND, or NOR symbol in a w x h box with inputs on the left edge
       and the output at the right edge's midpoint.
       ───────────────────────────────────────────────────── */
    function gateSymbol(parent, type, x, y, w, h, cls) {
        var g = el('g', { class: cls || 'lg-sym' }, parent);
        var inv = /^N/.test(type) && type !== 'NOT' || type === 'NOT';
        var bw = inv ? w - 12 : w, base = type.replace(/^N(?=AND|OR)/, '');
        var d;
        if (type === 'NOT') d = 'M' + x + ' ' + y + ' L' + (x + bw) + ' ' + (y + h / 2) + ' L' + x + ' ' + (y + h) + ' Z';
        else if (base === 'AND') d = 'M' + x + ' ' + y + ' H' + (x + bw - h / 2) + ' A' + (h / 2) + ' ' + (h / 2) + ' 0 0 1 ' + (x + bw - h / 2) + ' ' + (y + h) + ' H' + x + ' Z';
        else d = 'M' + x + ' ' + y + ' Q' + (x + bw * 0.3) + ' ' + (y + h / 2) + ' ' + x + ' ' + (y + h) + ' Q' + (x + bw * 0.65) + ' ' + (y + h) + ' ' + (x + bw) + ' ' + (y + h / 2) + ' Q' + (x + bw * 0.65) + ' ' + y + ' ' + x + ' ' + y + ' Z';
        el('path', { d: d }, g);
        if (type === 'XOR') el('path', { d: 'M' + (x - 8) + ' ' + y + ' Q' + (x - 8 + bw * 0.3) + ' ' + (y + h / 2) + ' ' + (x - 8) + ' ' + (y + h), class: 'lg-x' }, g);
        if (inv) el('circle', { cx: x + bw + 6, cy: y + h / 2, r: 6 }, g);
        return g;
    }
    function shuffle(a) {
        for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
        return a;
    }

    /* ─── Transistor Gate Builder ─────────────────────────────
       A transistor-level NOT, NAND, or NOR gate. Each 2N3904 is drawn
       as a switch that closes when its base input is 1, between the
       output node and ground; a 1 kOhm pull-up holds the output at
       5 V unless the transistors make a complete path to ground (then about 0.2 V).
       NOT: one switch. NAND: two in series. NOR: two in parallel.
       "Show current" animates the path that pulls the output low.
       ───────────────────────────────────────────────────── */
    function buildGateBuilder(root) {
        function q(r) { return root.querySelector('[data-role="' + r + '"]'); }
        var svg = q('circuit');
        var gate = 'NOT', A = 0, B = 0, showCur = true;
        var found = { NOT: {}, NAND: {}, NOR: {} };   // truth-table rows the student has reached, per gate
        var groups = {};
        // The interactive builder draws real NPN symbols; the static concept slides draw switches.
        var asNpn = !root.dataset.static;
        // Input labels. In the interactive builder each label is the toggle button itself.
        var inputs = [];
        function inLbl(x, y, name, parent) {
            if (!asNpn) return text(x, y, name, 'sb-lbl-b', parent, 'middle');
            var g = el('g', { class: 'gb-in', role: 'button', tabindex: '0', 'data-in': name }, parent);
            el('rect', { x: x - 34, y: y - 29, width: 72, height: 40, rx: 8 }, g);
            var t = text(x + 2, y - 1, name + '=0', 'gb-in-txt', g, 'middle');
            inputs.push({ g: g, t: t, name: name });
            return g;
        }
        function swMos(x, y0, y1, label, parent, mirror) {
            if (asNpn) {
                // an NPN at 80% scale: collector at the top, emitter at the bottom, both on x;
                // the base input arrives at y0 + 35 from x - 40
                var cy = y0 + 35, gq = el('g', { class: 'gb-q' }, parent);
                wire('M' + x + ' ' + y0 + ' V' + (cy - 30) + ' M' + x + ' ' + (cy + 30) + ' V' + y1 + ' M' + (x - 40) + ' ' + cy + ' H' + (x - 32), gq);
                transistor(0, 0, false, el('g', { transform: 'translate(' + (x - 16) + ' ' + cy + ') scale(0.8)' }, gq));
                text(x + 32, cy + 9, label, 'sb-lbl-b', parent);
                return { q: gq };
            }
            // a transistor drawn as a switch between y0 (top contact) and y1 (bottom contact);
            // mirror puts the open lever (and the input) on the right
            var g = el('g', {}, parent), dx = mirror ? 30 : -30;
            el('circle', { cx: x, cy: y0, r: 6, class: 'sb-dot' }, g);
            el('circle', { cx: x, cy: y1, r: 6, class: 'sb-dot' }, g);
            var lev = el('line', { x1: x, y1: y1, x2: x + dx, y2: y0 + 6, class: 'sb-sym gb-lever' }, g);
            text(mirror ? x - 18 : x + 18, (y0 + y1) / 2 + 9, label, 'sb-lbl-b', g, mirror ? 'end' : 'start');
            return { lev: lev, x: x, y0: y0, y1: y1, dx: dx };
        }
        function setSw(s, on) {
            if (s.q) { s.q.classList.toggle('on', on); return; }
            s.lev.setAttribute('x2', on ? s.x : s.x + s.dx);
            s.lev.setAttribute('y2', on ? s.y0 : s.y0 + 6);
        }
        function common(g) {
            var c = {};
            c.rail = wire('M200 40 H330', g);
            el('circle', { cx: 200, cy: 40, r: 7, class: 'sb-dot' }, g);
            text(186, 50, '+5 V', 'sb-lbl-b', g, 'end');
            c.pr = wire('M330 40 V70 M330 150 V190', g);
            resV(330, 70, 150, g); text(362, 120, '1 kΩ', 'sb-lbl', g);
            c.out = wire('M330 190 H540', g);
            el('circle', { cx: 330, cy: 190, r: 6, class: 'gb-node' }, g);
            c.yLed = el('circle', { cx: 566, cy: 190, r: 22, class: 'gb-out' }, g);
            c.yTxt = text(566, 200, 'Y', 'sb-lbl-b gb-ytxt', g, 'middle');
            wire('M566 212 V450', g); ground(566, 450, g);   // the indicator's return to ground
            return c;
        }
        // NOT
        var gN = el('g', {}, svg), cN = common(gN);
        cN.down = wire('M330 190 V280 M330 350 V450', gN);
        var qN = swMos(330, 280, 350, 'Q1', gN);
        cN.inA = wire('M60 315 H130 M230 315 H290', gN); resH(130, 230, 315, gN); inLbl(40, 324, 'A', gN); text(180, 293, '10 kΩ', 'sb-lbl', gN, 'middle');
        ground(330, 450, gN);
        cN.path = el('path', { d: 'M330 70 V150 M330 190 V280 M330 350 V450', class: 'gb-flow' }, gN);
        groups.NOT = { g: gN, c: cN, sw: [qN] };
        // NAND
        var gA = el('g', {}, svg), cA = common(gA);
        cA.down = wire('M330 190 V240 M330 300 V340 M330 400 V450', gA);
        var qA1 = swMos(330, 240, 300, 'Q1', gA), qA2 = swMos(330, 340, 400, 'Q2', gA);
        cA.inA = wire('M60 275 H130 M230 275 H290', gA); resH(130, 230, 275, gA); inLbl(40, 284, 'A', gA); text(180, 253, '10 kΩ', 'sb-lbl', gA, 'middle');
        cA.inB = wire('M60 375 H130 M230 375 H290', gA); resH(130, 230, 375, gA); inLbl(40, 384, 'B', gA); text(180, 353, '10 kΩ', 'sb-lbl', gA, 'middle');
        ground(330, 450, gA);
        cA.path = el('path', { d: 'M330 70 V150 M330 190 V240 M330 300 V340 M330 400 V450', class: 'gb-flow' }, gA);
        groups.NAND = { g: gA, c: cA, sw: [qA1, qA2] };
        // NOR
        var gO = el('g', {}, svg), cO = common(gO);
        cO.down = wire('M330 190 V230 M250 230 H450 M250 230 V290 M450 230 V290 M250 350 V410 M450 350 V410 M250 410 H450 M300 410 V450', gO);
        var qO1 = swMos(250, 290, 350, 'Q1', gO), qO2 = swMos(450, 290, 350, 'Q2', gO);
        cO.inA = wire('M60 325 H90 M180 325 H210', gO); resH(90, 180, 325, gO); inLbl(40, 334, 'A', gO); text(135, 303, '10 kΩ', 'sb-lbl', gO, 'middle');
        cO.inB = wire('M60 480 H130 M230 480 H380 V325 H410', gO); resH(130, 230, 480, gO); inLbl(40, 489, 'B', gO); text(180, 458, '10 kΩ', 'sb-lbl', gO, 'middle');
        ground(300, 450, gO);
        cO.pathA = el('path', { d: 'M330 70 V150 M330 190 V230 H250 V290 M250 350 V410 H300 V450', class: 'gb-flow' }, gO);
        cO.pathB = el('path', { d: 'M330 70 V150 M330 190 V230 H450 V290 M450 350 V410 H300 V450', class: 'gb-flow' }, gO);
        groups.NOR = { g: gO, c: cO, sw: [qO1, qO2] };
        // AND and OR: the switches sit between +5 V and the output, and a
        // 1 kOhm pull-down holds the output at 0 V until a path to 5 V closes.
        function pullDown(g, y) {
            var c = {};
            el('circle', { cx: 330, cy: y, r: 6, class: 'gb-node' }, g);
            c.out = wire('M330 ' + y + ' H540', g);
            c.yLed = el('circle', { cx: 566, cy: y, r: 22, class: 'gb-out' }, g);
            c.yTxt = text(566, y + 10, 'Y', 'sb-lbl-b gb-ytxt', g, 'middle');
            wire('M566 ' + (y + 22) + ' V450', g); ground(566, 450, g);
            c.pd = wire('M330 ' + y + ' V' + (y + 20) + ' M330 ' + (y + 90) + ' V450', g);
            resV(330, y + 20, y + 90, g); text(362, y + 65, '1 kΩ', 'sb-lbl', g);
            ground(330, 450, g);
            return c;
        }
        var gD = el('g', {}, svg), cD = pullDown(gD, 320);
        cD.rail = wire('M200 40 H330 V90', gD);
        el('circle', { cx: 200, cy: 40, r: 7, class: 'sb-dot' }, gD); text(186, 50, '+5 V', 'sb-lbl-b', gD, 'end');
        cD.down = wire('M330 150 V190 M330 250 V320', gD);
        var qD1 = swMos(330, 90, 150, 'Q1', gD), qD2 = swMos(330, 190, 250, 'Q2', gD);
        cD.inA = wire('M60 125 H130 M230 125 H290', gD); resH(130, 230, 125, gD); inLbl(40, 134, 'A', gD); text(180, 103, '10 kΩ', 'sb-lbl', gD, 'middle');
        cD.inB = wire('M60 225 H130 M230 225 H290', gD); resH(130, 230, 225, gD); inLbl(40, 234, 'B', gD); text(180, 203, '10 kΩ', 'sb-lbl', gD, 'middle');
        cD.path = el('path', { d: 'M200 40 H330 V90 M330 150 V190 M330 250 V340 M330 410 V450', class: 'gb-flow' }, gD);
        groups.AND = { g: gD, c: cD, sw: [qD1, qD2], up: true };
        var gR = el('g', {}, svg), cR = pullDown(gR, 290);
        cR.rail = wire('M200 40 H330 V80', gR);
        el('circle', { cx: 200, cy: 40, r: 7, class: 'sb-dot' }, gR); text(186, 50, '+5 V', 'sb-lbl-b', gR, 'end');
        cR.down = wire('M250 80 H410 M250 80 V120 M410 80 V120 M250 180 V220 M410 180 V220 M250 220 H410 M330 220 V290', gR);
        var qR1 = swMos(250, 120, 180, 'Q1', gR), qR2 = swMos(410, 120, 180, 'Q2', gR, true);
        cR.inA = wire('M60 155 H90 M180 155 H210', gR); resH(90, 180, 155, gR); inLbl(40, 164, 'A', gR); text(135, 133, '10 kΩ', 'sb-lbl', gR, 'middle');
        cR.inB = wire('M450 155 H470 M550 155 H580', gR); resH(470, 550, 155, gR); inLbl(600, 164, 'B', gR); text(510, 133, '10 kΩ', 'sb-lbl', gR, 'middle');
        cR.pathA = el('path', { d: 'M200 40 H330 V80 H250 V120 M250 180 V220 H330 V310 M330 380 V450', class: 'gb-flow' }, gR);
        cR.pathB = el('path', { d: 'M200 40 H330 V80 H410 V120 M410 180 V220 H330 V310 M330 380 V450', class: 'gb-flow' }, gR);
        groups.OR = { g: gR, c: cR, sw: [qR1, qR2], up: true };

        var TT = { AND: function (a, b) { return a && b ? 1 : 0; }, OR: function (a, b) { return a || b ? 1 : 0; }, NOT: function (a) { return a ? 0 : 1; }, NAND: function (a, b) { return a && b ? 0 : 1; }, NOR: function (a, b) { return a || b ? 0 : 1; } };
        // Draw one gate's state. neutral leaves Y unlit and shows no current.
        function draw(gate, A, B, showCur, neutral) {
            var G = groups[gate], c = G.c, two = gate !== 'NOT';
            var y = neutral ? null : (two ? TT[gate](A, B) : TT.NOT(A));
            setSw(G.sw[0], !!A); if (two) setSw(G.sw[1], !!B);
            c.inA.classList.toggle('lit', !!A); if (c.inB) c.inB.classList.toggle('lit', !!B);
            c.yLed.classList.toggle('on', y === 1);
            // current flows through the closed switches: to ground when Y = 0 (pull-up gates),
            // or from 5 V through the pull-down when Y = 1 (AND, OR)
            var flowing = !neutral && showCur && (G.up ? y === 1 : y === 0);
            [c.rail, c.pr, c.pd, c.down].forEach(function (w) { if (w) w.classList.toggle('lit', flowing); });
            ['path', 'pathA', 'pathB'].forEach(function (k) { if (c[k]) c[k].style.display = 'none'; });
            if (flowing) {
                if (c.pathA) { if (A) c.pathA.style.display = ''; if (B) c.pathB.style.display = ''; }
                else c.path.style.display = '';
            }
            return y;
        }
        if (root.dataset.static) {
            // Static schematic for a concept slide: root[data-static="NOT"|"NAND"|"NOR"|"AND"|"OR"].
            // Fragments on the same slide with data-gate-a (and data-gate-b) set the inputs;
            // the last visible one wins, and before any of them every input is 0 (switches open),
            // so Y starts lit on the pull-up gates and dark on AND and OR.
            Object.keys(groups).forEach(function (k) {
                var G = groups[k];
                G.g.style.display = k === root.dataset.static ? '' : 'none';
                G.sw.forEach(function (x) { setSw(x, false); });
                ['path', 'pathA', 'pathB'].forEach(function (p) { if (G.c[p]) G.c[p].style.display = 'none'; });
            });
            // root[data-highlight]: circle each transistor switch and name it.
            if (root.hasAttribute('data-highlight')) {
                groups[root.dataset.static].sw.forEach(function (x) {
                    el('ellipse', { cx: x.x + 2, cy: (x.y0 + x.y1) / 2, rx: 68, ry: 66, class: 'gb-hl' }, groups[root.dataset.static].g);
                    text(x.x - 52, (x.y0 + x.y1) / 2 + 92, 'transistor', 'sb-lbl gb-hl-lbl', groups[root.dataset.static].g, 'end');
                });
            }
            var sGate = root.dataset.static;
            function sync() {
                var sec = root.closest('section'), shown = sec ? sec.querySelectorAll('.fragment.visible[data-gate-a]') : [];
                var f = shown.length ? shown[shown.length - 1] : null;
                draw(sGate, f ? +f.dataset.gateA : 0, f ? +(f.dataset.gateB || 0) : 0, true, false);
            }
            sync();
            return { root: root, sync: sync };
        }
        // Hunt mode: the same NAND drawing with a hidden fault (see buildGateHunt below).
        if (root.classList.contains('gate-hunt')) return gateHunt(root, groups, inputs, draw);
        function render() {
            Object.keys(groups).forEach(function (k) { groups[k].g.style.display = k === gate ? '' : 'none'; });
            var two = gate !== 'NOT';
            var y = draw(gate, A, B, showCur, false);
            root.querySelectorAll('[data-gate]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.gate === gate ? 'true' : 'false'); });
            inputs.forEach(function (i) {
                var v = i.name === 'A' ? A : B;
                i.g.classList.toggle('on', !!v); i.g.setAttribute('aria-pressed', v ? 'true' : 'false');
                i.g.setAttribute('aria-label', 'Input ' + i.name + ' is ' + v + '. Press to toggle.');
                i.t.textContent = i.name + '=' + v;
            });
            q('cur').setAttribute('aria-pressed', showCur ? 'true' : 'false');
            q('y').innerHTML = 'Y = <b>' + y + '</b> &nbsp;(' + (y ? '5.0 V' : '0.2 V') + ')';
            // truth table
            var rows = two ? [[0, 0], [0, 1], [1, 0], [1, 1]] : [[0], [1]];
            // the current input combination counts as found; unfound rows stay blank
            found[gate][two ? A + '' + B : A + ''] = true;
            var nFound = Object.keys(found[gate]).length;
            q('tt').innerHTML = '<thead><tr><th>A</th>' + (two ? '<th>B</th>' : '') + '<th>' + (two ? 'Path through transistors?' : 'Path through Q1?') + '</th><th>Y</th></tr></thead><tbody>' +
                rows.map(function (r) {
                    var yy = two ? TT[gate](r[0], r[1]) : TT.NOT(r[0]);
                    var cur = r[0] === A && (!two || r[1] === B);
                    var seen = found[gate][r.join('')];
                    return '<tr' + (cur ? ' class="cur"' : '') + '><td>' + r[0] + '</td>' + (two ? '<td>' + r[1] + '</td>' : '') +
                        (seen ? '<td>' + (yy ? 'No' : 'Yes') + '</td><td>' + yy + '</td>' : '<td class="gb-blank">?</td><td class="gb-blank">?</td>') + '</tr>';
                }).join('') + '</tbody>';
            var msg;
            if (gate === 'NOT') msg = A ? '<b>A = 1</b> saturates Q1, which pulls the output down to about 0.2 V. <b>Y = 0.</b>' : '<b>A = 0</b> leaves Q1 off, so the pull-up resistor holds the output at 5 V. <b>Y = 1.</b>';
            else if (gate === 'NAND') msg = (A && B) ? 'Q1 and Q2 are both on, so current has a complete path through the transistors and the output is pulled down. <b>Y = 0</b> only in this row: <b>NOT AND</b>.' : 'Q1 and Q2 are in <b>series</b>. With either one off, there is no path through the transistors, and the pull-up holds <b>Y = 1</b>.';
            else msg = (A || B) ? 'Q1 and Q2 are in <b>parallel</b>, so <b>either</b> one turned on makes a path through the transistors. <b>Y = 0:</b> <b>NOT OR</b>.' : 'Both transistors are off, so nothing pulls the output down. <b>Y = 1</b> only in this row.';
            q('feedback').innerHTML = msg;
            // task line: progress on this gate, then a pointer to the next unfinished gate
            var order = ['NOT', 'NAND', 'NOR'], need = { NOT: 2, NAND: 4, NOR: 4 };
            root.querySelectorAll('[data-gate]').forEach(function (b) { b.classList.toggle('done', Object.keys(found[b.dataset.gate]).length === need[b.dataset.gate]); });
            var task;
            if (nFound < rows.length) task = 'Click ' + (two ? '<b>A</b> and <b>B</b>' : '<b>A</b>') + ' in the circuit.<br>Rows found: <b>' + nFound + ' of ' + rows.length + '</b>';
            else {
                var next = order.filter(function (k) { return Object.keys(found[k]).length < need[k]; })[0];
                task = next ? 'The ' + gate + ' table is complete. Now choose <b>' + next + '</b>.' : 'All three tables are complete. Compare them.';
            }
            if (q('task')) q('task').innerHTML = task;
        }
        root.querySelectorAll('[data-gate]').forEach(function (b) { b.addEventListener('click', function () { gate = b.dataset.gate; if (gate === 'NOT') B = 0; render(); }); });
        function toggle(name) { if (name === 'A') A = A ? 0 : 1; else B = B ? 0 : 1; render(); }
        inputs.forEach(function (i) {
            i.g.addEventListener('click', function () { toggle(i.name); });
            i.g.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggle(i.name); }
            });
        });
        q('cur').addEventListener('click', function () { showCur = !showCur; render(); });
        function reset() { gate = 'NOT'; A = 0; B = 0; showCur = true; found = { NOT: {}, NAND: {}, NOR: {} }; render(); }
        reset();
        return { root: root, reset: reset };
    }

    /* ─── Truth Table Detective (LogiKIT board) ────────────────
       A drawing of the classroom LogiKIT: sockets GATE1 to GATE16 in a
       4 x 4 grid, each with its own output LED, switches SW1 to SW6,
       and output LEDs LED1 to LED4. Each case loads a LogiKIT Lab 2
       circuit (sockets as in the lab manual) with one hidden fault,
       dealt from a shuffled deck of fault types:
         lookalike  NOR in an OR socket, NAND in an AND socket (or back)
         missing    one gate input has no wire, which reads as 0
                    (confirm the real board does this)
         moved      one gate input wired from the wrong source
         swap       the wires from two switches are swapped
       Every fault is checked to change LED1 for some input. Trying a
       new switch combination costs 1 minute of bench time. Students
       name the first gate that disagrees, the kind of fault, and the
       row that proves it.
       ───────────────────────────────────────────────────── */
    var TD_CIRCUITS = [
        { id: 'amp', name: 'The amplifier problem', story: 'The amplifier powers on when AUX or Bluetooth is selected, but not both.',
          inputs: [['SW1', 'AUX', 60], ['SW2', 'BT', 130]], out: 'Power', outGate: 3,
          gates: { 1: { t: 'OR', in: ['SW1', 'SW2'], x: 184, y: 40 }, 5: { t: 'AND', in: ['SW1', 'SW2'], x: 184, y: 170 }, 6: { t: 'NOT', in: ['G5'], x: 304, y: 170 }, 3: { t: 'AND', in: ['G1', 'G6'], x: 424, y: 100 } } },
        { id: 'friends', name: 'Friends decide', story: 'The friends hang out when at least two of the three say yes.',
          inputs: [['SW1', 'A', 50], ['SW2', 'B', 130], ['SW3', 'C', 210]], out: 'HangOut', outGate: 11,
          gates: { 1: { t: 'AND', in: ['SW1', 'SW2'], x: 184, y: 20 }, 5: { t: 'AND', in: ['SW1', 'SW3'], x: 184, y: 110 }, 9: { t: 'AND', in: ['SW2', 'SW3'], x: 184, y: 200 }, 6: { t: 'OR', in: ['G1', 'G5'], x: 304, y: 64 }, 11: { t: 'OR', in: ['G6', 'G9'], x: 424, y: 130 } } },
        { id: 'alarm', name: 'Home alarm', story: 'The alarm sounds when the system is armed and the door or the window is not closed.',
          inputs: [['SW1', 'Armed', 50], ['SW2', 'Door', 150], ['SW3', 'Window', 230]], out: 'Alarm', outGate: 3,
          gates: { 1: { t: 'NOT', in: ['SW2'], x: 184, y: 128 }, 5: { t: 'NOT', in: ['SW3'], x: 184, y: 208 }, 2: { t: 'OR', in: ['G1', 'G5'], x: 304, y: 160 }, 3: { t: 'AND', in: ['SW1', 'G2'], x: 424, y: 70 } } },
        { id: 'buzzer', name: 'Scoreboard buzzer', story: 'When enabled, the buzzer sounds if time is up (Timer = 0) or the button is pressed.',
          inputs: [['SW1', 'Enabled', 50], ['SW2', 'Timer', 150], ['SW3', 'Button', 230]], out: 'Buzzer', outGate: 3,
          gates: { 1: { t: 'NOT', in: ['SW2'], x: 184, y: 128 }, 2: { t: 'OR', in: ['G1', 'SW3'], x: 304, y: 170 }, 3: { t: 'AND', in: ['SW1', 'G2'], x: 424, y: 70 } } },
    ];
    var TD_FAULTS = {
        lookalike: 'A look-alike module is in a socket',
        missing: 'An input wire is missing',
        moved: 'An input wire comes from the wrong place',
        swap: 'Two switch wires are swapped',
    };
    var LOOKALIKE = { AND: 'NAND', NAND: 'AND', OR: 'NOR', NOR: 'OR' };
    var GATE_FN = {
        AND: function (a, b) { return a & b; }, OR: function (a, b) { return a | b; }, NAND: function (a, b) { return 1 - (a & b); },
        NOR: function (a, b) { return 1 - (a | b); }, XOR: function (a, b) { return a ^ b; }, NOT: function (a) { return 1 - a; },
    };
    var MODULE_COLOR = { AND: 'm-and', NAND: 'm-nand', NOT: 'm-not', OR: 'm-or', NOR: 'm-nor', XOR: 'm-xor' };
    function tdEval(gates, sw) {
        var out = {}, ids = Object.keys(gates);
        function src(sname) {
            if (sname === null) return 0;
            if (sname.charAt(0) === 'S') return sw[sname] || 0;
            return out[sname.slice(1)] || 0;
        }
        for (var pass = 0; pass < 6; pass++) {
            ids.forEach(function (id) {
                var g = gates[id], a = src(g.in[0]), b = g.in.length > 1 ? src(g.in[1]) : 0;
                out[id] = GATE_FN[g.t](a, b);
            });
        }
        return out;
    }
    function tdCombos(n) { var r = []; for (var i = 0; i < (1 << n); i++) { var c = []; for (var k = n - 1; k >= 0; k--) c.push((i >> k) & 1); r.push(c); } return r; }
    function buildTruthDetective(root) {
        function q(r) { return root.querySelector('[data-role="' + r + '"]'); }
        var board = q('board'), schem = q('schem');
        var faultDeck = [], circ, gates, fault, sw, tried, used, bad, stage, tab, pick, lastCircuit = null;

        // Board: 16 sockets, switches, output LEDs.
        var SX = 20, SY = 16, CW = 172, CH = 98;
        var sockets = {};
        for (var n = 1; n <= 16; n++) {
            var col = (n - 1) % 4, row = Math.floor((n - 1) / 4), x = SX + col * (CW + 6), y = SY + row * (CH + 8);
            var g = el('g', {}, board);
            el('rect', { x: x, y: y, width: CW, height: CH, rx: 6, class: 'lk-cell' }, g);
            ['A', 'C', 'B'].forEach(function (p, i) { el('circle', { cx: x + 14, cy: y + 20 + i * 26, r: 5, class: 'lk-pin' }, g); });
            [0, 1, 2].forEach(function (i) { el('circle', { cx: x + CW - 14, cy: y + 20 + i * 26, r: 5, class: 'lk-pin' }, g); });
            var mod = el('g', {}, g);
            var led = el('circle', { cx: x + CW - 36, cy: y + 38, r: 9, class: 'lk-led' }, g);
            text(x + CW / 2 - 6, y + CH - 6, 'GATE' + n, 'lk-lbl', g, 'middle');
            sockets[n] = { x: x, y: y, mod: mod, led: led };
        }
        var swEls = {}, BY = SY + 4 * (CH + 8) + 8;
        for (var k = 1; k <= 6; k++) {
            var bx = SX + 20 + (k - 1) * 82;
            var sg = el('g', { class: 'lk-sw', 'data-sw': 'SW' + k }, board);
            el('rect', { x: bx, y: BY, width: 64, height: 56, rx: 8, class: 'lk-swbox' }, sg);
            var sled = el('circle', { cx: bx + 32, cy: BY + 18, r: 8, class: 'lk-led' }, sg);
            text(bx + 32, BY + 48, 'SW' + k, 'lk-lbl', sg, 'middle');
            swEls['SW' + k] = { g: sg, led: sled };
        }
        var outLeds = {};
        for (var m = 1; m <= 4; m++) {
            var ox = SX + 520 + (m - 1) * 52;
            var ol = el('circle', { cx: ox + 16, cy: BY + 18, r: 10, class: 'lk-led lk-out' }, board);
            text(ox + 16, BY + 48, 'L' + m, 'lk-lbl', board, 'middle');
            outLeds[m] = ol;
        }

        function pickFault() {
            if (!faultDeck.length) faultDeck = shuffle(Object.keys(TD_FAULTS));
            return faultDeck.shift();
        }
        function clone(gs) { var o = {}; Object.keys(gs).forEach(function (id) { o[id] = { t: gs[id].t, in: gs[id].in.slice(), x: gs[id].x, y: gs[id].y }; }); return o; }
        function lastOut(gs, c) {
            var swv = {}; c.inputs.forEach(function (inp) { swv[inp[0]] = 0; });
            return tdCombos(c.inputs.length).map(function (cb) {
                c.inputs.forEach(function (inp, i) { swv[inp[0]] = cb[i]; });
                return tdEval(gs, swv)[c.outGate];
            }).join('');
        }
        function upstreamOf(gs, id) {
            // gates that feed gate id, directly or indirectly
            var seen = {};
            (function walk(g) { gs[g].in.forEach(function (sname) { if (sname && sname.charAt(0) === 'G' && !seen[sname.slice(1)]) { seen[sname.slice(1)] = 1; walk(sname.slice(1)); } }); })(id);
            return seen;
        }
        function makeFault(type) {
            for (var tries = 0; tries < 200; tries++) {
                var c = TD_CIRCUITS[Math.floor(Math.random() * TD_CIRCUITS.length)];
                if (TD_CIRCUITS.length > 1 && c.id === lastCircuit && tries < 100) continue;
                var gs = clone(c.gates), ids = Object.keys(gs), f = { type: type };
                if (type === 'lookalike') {
                    var cand = ids.filter(function (id) { return LOOKALIKE[gs[id].t]; });
                    var id = cand[Math.floor(Math.random() * cand.length)];
                    f.gate = id; f.from = gs[id].t; f.to = LOOKALIKE[gs[id].t]; gs[id].t = f.to;
                    f.where = [id];
                } else if (type === 'missing' || type === 'moved') {
                    var gid = ids[Math.floor(Math.random() * ids.length)], pin = Math.floor(Math.random() * gs[gid].in.length);
                    f.gate = gid; f.pin = pin; f.was = gs[gid].in[pin];
                    if (type === 'missing') gs[gid].in[pin] = null;
                    else {
                        var up = upstreamOf(gs, gid);
                        var opts = c.inputs.map(function (inp) { return inp[0]; }).concat(ids.filter(function (o) { return o !== gid && !upstreamOf(gs, o)[gid] && (up[o] || true); }).map(function (o) { return 'G' + o; }));
                        opts = opts.filter(function (o) { return o !== f.was && gs[gid].in.indexOf(o) < 0; });
                        if (!opts.length) continue;
                        f.now = opts[Math.floor(Math.random() * opts.length)];
                        gs[gid].in[pin] = f.now;
                    }
                    f.where = [gid];
                } else {
                    var sws = c.inputs.map(function (inp) { return inp[0]; }); shuffle(sws);
                    var s1 = sws[0], s2 = sws[1];
                    f.s1 = s1; f.s2 = s2;
                    ids.forEach(function (id) { gs[id].in = gs[id].in.map(function (sname) { return sname === s1 ? s2 : sname === s2 ? s1 : sname; }); });
                    f.where = ids.filter(function (id) { return c.gates[id].in.indexOf(s1) >= 0 || c.gates[id].in.indexOf(s2) >= 0; });
                }
                if (lastOut(gs, c) === lastOut(c.gates, c)) continue;
                lastCircuit = c.id;
                return { circ: c, gates: gs, fault: f };
            }
            return makeFault('lookalike');
        }
        function srcName(c, sname) {
            if (sname === null) return 'nothing';
            if (sname.charAt(0) === 'S') { var inp = c.inputs.filter(function (i) { return i[0] === sname; })[0]; return sname + (inp ? ' (' + inp[1] + ')' : ''); }
            return 'GATE' + sname.slice(1);
        }
        function pinName(c, gid, pin) { return c.gates[gid].t === 'NOT' ? 'input' : (pin ? 'B input' : 'A input'); }
        function explain() {
            var f = fault, c = circ;
            if (f.type === 'lookalike') return 'GATE' + f.gate + ' held a <b>' + f.to + '</b> module where the schematic calls for <b>' + f.from + '</b>. The two look alike, and the ' + f.to + ' gives the opposite output in every row, so GATE' + f.gate + '&#39;s LED disagrees first.';
            if (f.type === 'missing') return 'The wire into GATE' + f.gate + '&#39;s ' + pinName(c, f.gate, f.pin) + ' (from ' + srcName(c, f.was) + ') was <b>missing</b>. An unconnected input reads as <b>0</b>, so GATE' + f.gate + ' disagrees whenever ' + srcName(c, f.was) + ' is 1.';
            if (f.type === 'moved') return 'GATE' + f.gate + '&#39;s ' + pinName(c, f.gate, f.pin) + ' was wired from <b>' + srcName(c, f.now) + '</b> instead of <b>' + srcName(c, f.was) + '</b>. Every gate before it agrees, and GATE' + f.gate + ' is the first that does not.';
            return 'The wires from <b>' + srcName(c, f.s1) + '</b> and <b>' + srcName(c, f.s2) + '</b> were <b>swapped</b>, so each gate fed by those switches saw the other input. The first disagreement shows up at a gate fed directly by one of those switches.';
        }
        function swState() { var o = {}; circ.inputs.forEach(function (inp) { o[inp[0]] = sw[inp[0]] || 0; }); return o; }
        function key() { return circ.inputs.map(function (inp) { return sw[inp[0]] || 0; }).join(''); }
        function budget() { return (1 << circ.inputs.length) - 2; }

        function drawSchematic() {
            schem.innerHTML = '';
            var c = circ, pinY = {};
            c.inputs.forEach(function (inp, i) {
                text(4, inp[2] + 8, inp[1], 'td-lbl', schem);
                pinY[inp[0]] = { x: 128 + i * 14, y: inp[2] };
                el('path', { d: 'M' + 114 + ' ' + inp[2] + ' H' + (128 + i * 14), class: 'td-w' }, schem);
            });
            function inPin(g, i) { var t = c.gates[g]; return t.t === 'NOT' ? { x: t.x, y: t.y + 22 } : { x: t.x, y: t.y + (i ? 34 : 10) }; }
            Object.keys(c.gates).forEach(function (id) {
                var t = c.gates[id];
                gateSymbol(schem, t.t, t.x, t.y, 64, 44, 'td-gate');
                text(t.x + 30, t.y + 70, 'GATE' + id, 'td-glbl', schem, 'middle');
                t.in.forEach(function (sname, i) {
                    var p = inPin(id, i), d;
                    if (sname.charAt(0) === 'S') { var s0 = pinY[sname]; d = 'M' + s0.x + ' ' + s0.y + ' V' + p.y + ' H' + p.x; el('circle', { cx: s0.x, cy: p.y, r: 4, class: 'td-dot' }, schem); }
                    else { var sg = c.gates[sname.slice(1)], ox = sg.x + 64, oy = sg.y + 22, mx = p.x - 18 - i * 8; d = 'M' + ox + ' ' + oy + ' H' + mx + ' V' + p.y + ' H' + p.x; }
                    el('path', { d: d, class: 'td-w' }, schem);
                });
            });
            Object.keys(pinY).forEach(function (sn) {
                var ys = Object.keys(c.gates).reduce(function (acc, id) { c.gates[id].in.forEach(function (sname, i) { if (sname === sn) acc.push(inPin(id, i).y); }); return acc; }, [pinY[sn].y]);
                el('path', { d: 'M' + pinY[sn].x + ' ' + Math.min.apply(null, ys) + ' V' + Math.max.apply(null, ys), class: 'td-w' }, schem);
            });
            var og = c.gates[c.outGate];
            el('path', { d: 'M' + (og.x + 64) + ' ' + (og.y + 22) + ' H' + (og.x + 84), class: 'td-w' }, schem);
            text(og.x + 88, og.y + 30, c.out, 'td-lbl', schem);
        }
        function renderBoard() {
            var on = tried[key()] !== undefined;
            var outs = on ? tdEval(gates, swState()) : null;
            for (var n = 1; n <= 16; n++) {
                var s = sockets[n], g = gates[n];
                s.mod.innerHTML = '';
                if (g) {
                    el('rect', { x: s.x + 34, y: s.y + 10, width: 78, height: 54, rx: 6, class: 'lk-mod ' + MODULE_COLOR[g.t] }, s.mod);
                    gateSymbol(s.mod, g.t, s.x + 46, s.y + 22, 50, 30, 'lk-modsym');
                }
                s.led.classList.toggle('on', !!(g && outs && outs[n]));
            }
            Object.keys(swEls).forEach(function (k) {
                var used = circ.inputs.some(function (inp) { return inp[0] === k; });
                swEls[k].g.classList.toggle('unused', !used);
                swEls[k].led.classList.toggle('on', used && !!sw[k]);
            });
            outLeds[1].classList.toggle('on', !!(outs && outs[circ.outGate]));
            q('board-note').innerHTML = on ? 'Reading the board for this input combination.' : (Object.keys(tried).length >= budget() ? '<span class="warn">Out of bench time:</span> only combinations you already tried can be read.' : 'New combination: press <b>Read the LEDs</b> (1 min).');
        }
        function renderSide() {
            root.querySelectorAll('[data-tab]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.tab === tab ? 'true' : 'false'); });
            q('budget-val').textContent = used + ' of ' + budget() + ' min';
            q('budget-bar').style.width = Math.min(100, 100 * used / budget()) + '%';
            var box = q('side'), html = '';
            q('schem-wrap').style.display = tab === 'schem' ? '' : 'none';
            if (tab === 'schem') { box.style.display = 'none'; return; }
            box.style.display = '';
            if (tab === 'tt') {
                var rows = tdCombos(circ.inputs.length), cur = key();
                html = '<table class="td-tt"><thead><tr>' + circ.inputs.map(function (i) { return '<th>' + i[1] + '</th>'; }).join('') + '<th>' + circ.out + '</th></tr></thead><tbody>' +
                    rows.map(function (r) {
                        var swv = {}; circ.inputs.forEach(function (inp, i) { swv[inp[0]] = r[i]; });
                        return '<tr' + (r.join('') === cur ? ' class="cur"' : '') + '>' + r.map(function (v) { return '<td>' + v + '</td>'; }).join('') + '<td>' + tdEval(circ.gates, swv)[circ.outGate] + '</td></tr>';
                    }).join('') + '</tbody></table>';
            } else {
                var ks = Object.keys(tried), gids = Object.keys(gates).sort(function (a, b) { return a - b; });
                if (!ks.length) html = '<p class="md-empty">Read the LEDs for an input combination. Each reading is logged here.</p>';
                else html = '<table class="td-log"><thead><tr><th>' + circ.inputs.map(function (i) { return i[0]; }).join(' ') + '</th>' + gids.map(function (g) { return '<th>G' + g + '</th>'; }).join('') + '</tr></thead><tbody>' +
                    ks.map(function (k) { return '<tr><td>' + k.split('').join(' ') + '</td>' + gids.map(function (g) { return '<td>' + tried[k][g] + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
                if (bad) html += '<p class="td-bad"><span class="fault">Bad practice:</span> not done. Jumpering a gate output to 5 V fights the gate&#39;s own output and can damage it. Read the LED instead.</p>';
            }
            box.innerHTML = html;
        }
        function renderAct() {
            var box = q('act'), html = '';
            if (stage === 'test') {
                html = '<div class="ctl-row"><button class="sim-btn" data-role="read">Read the LEDs (1 min)</button><button class="sim-btn alt" data-act="bad"' + (bad ? ' disabled' : '') + '>Jumper an output to 5 V</button><button class="sim-btn" data-go="diag">Diagnose</button></div>';
            } else if (stage === 'diag') {
                var gids = Object.keys(gates).sort(function (a, b) { return a - b; }), ks = Object.keys(tried);
                html = '<div class="td-diag"><span class="ctl-label">First gate that disagrees</span><span class="seg">' + gids.map(function (g) { return '<button class="seg-btn" data-pick-gate="' + g + '" aria-pressed="' + (pick.gate === g) + '">G' + g + '</button>'; }).join('') + '</span></div>' +
                    '<div class="td-diag"><span class="ctl-label">Fault</span><select class="md-fix" data-role="ftype"><option value="">Choose the kind of fault</option>' + Object.keys(TD_FAULTS).map(function (f) { return '<option value="' + f + '"' + (pick.type === f ? ' selected' : '') + '>' + TD_FAULTS[f] + '</option>'; }).join('') + '</select></div>' +
                    '<div class="td-diag"><span class="ctl-label">Proof row</span><select class="md-fix" data-role="frow"><option value="">The reading that shows it</option>' + ks.map(function (k) { return '<option value="' + k + '"' + (pick.row === k ? ' selected' : '') + '>' + circ.inputs.map(function (i, n) { return i[0] + '=' + k.charAt(n); }).join(', ') + '</option>'; }).join('') + '</select></div>' +
                    '<div class="ctl-row"><button class="sim-btn alt" data-go="test">Back</button><button class="sim-btn" data-go="record"' + (pick.gate && pick.type && pick.row ? '' : ' disabled') + '>Submit</button></div>';
            } else {
                var exp = function (k) { var swv = {}; circ.inputs.forEach(function (inp, i) { swv[inp[0]] = +k.charAt(i); }); return tdEval(circ.gates, swv); };
                var gOk = fault.where.indexOf(pick.gate) >= 0, tOk = pick.type === fault.type;
                var rOk = pick.row && exp(pick.row)[pick.gate] !== tried[pick.row][pick.gate];
                function row(k, ok, v) { return '<tr><td>' + k + '</td><td class="' + (ok ? 'ok' : 'bad') + '">' + v + '</td></tr>'; }
                html = '<div class="md-record"><table class="rec-table">' +
                    row('Gate', gOk, gOk ? 'Correct: GATE' + pick.gate : 'The fault was at GATE' + fault.where.join(' or GATE')) +
                    row('Fault', tOk, tOk ? 'Correct' : 'It was: ' + TD_FAULTS[fault.type]) +
                    row('Proof', rOk, rOk ? 'In that row, GATE' + pick.gate + '&#39;s LED disagrees with the schematic' : 'In that row, GATE' + pick.gate + '&#39;s LED matches the schematic') +
                    row('Practice', !bad, bad ? '1 bad-practice choice' : 'No bad-practice choices') +
                    row('Time', true, used + ' of ' + budget() + ' min') +
                    '</table><div class="md-why"><b>Why:</b> ' + explain() + '</div><div class="ctl-row"><button class="sim-btn" data-act="new">New board</button></div></div>';
            }
            box.innerHTML = html;
            var rd = box.querySelector('[data-role="read"]');
            if (rd) rd.addEventListener('click', readLeds);
            box.querySelectorAll('[data-go]').forEach(function (b) { b.addEventListener('click', function () { stage = b.dataset.go; if (stage === 'diag') tab = 'log'; renderAll(); }); });
            var bd = box.querySelector('[data-act="bad"]');
            if (bd) bd.addEventListener('click', function () { if (!bad) { bad = true; used += 1; tab = 'log'; renderAll(); } });
            box.querySelectorAll('[data-pick-gate]').forEach(function (b) { b.addEventListener('click', function () { pick.gate = b.dataset.pickGate; renderAct(); }); });
            var ft = box.querySelector('[data-role="ftype"]'); if (ft) ft.addEventListener('change', function () { pick.type = this.value || null; renderAct(); });
            var fr = box.querySelector('[data-role="frow"]'); if (fr) fr.addEventListener('change', function () { pick.row = this.value || null; renderAct(); });
            var nw = box.querySelector('[data-act="new"]'); if (nw) nw.addEventListener('click', function () { load(); });
        }
        function readLeds() {
            var k = key();
            if (tried[k] !== undefined || Object.keys(tried).length >= budget()) return;
            tried[k] = tdEval(gates, swState()); used += 1; tab = 'log';
            renderAll();
        }
        function renderAll() {
            root.classList.toggle('td-record', stage === 'record');
            q('title').textContent = circ.name;
            q('story').textContent = circ.story;
            renderBoard(); renderSide(); renderAct();
            var rd = q('read'); if (rd) rd.disabled = tried[key()] !== undefined || Object.keys(tried).length >= budget();
        }
        Object.keys(swEls).forEach(function (k) {
            swEls[k].g.addEventListener('click', function () {
                if (stage !== 'test' || !circ.inputs.some(function (inp) { return inp[0] === k; })) return;
                sw[k] = sw[k] ? 0 : 1; renderAll();
            });
        });
        root.querySelectorAll('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { tab = b.dataset.tab; renderSide(); }); });
        function load() {
            var made = makeFault(pickFault());
            circ = made.circ; gates = made.gates; fault = made.fault;
            sw = {}; tried = {}; used = 0; bad = false; stage = 'test'; tab = 'schem'; pick = { gate: null, type: null, row: null };
            drawSchematic(); renderAll();
        }
        load();
        return { root: root, fault: function () { return { circ: circ.id, fault: fault }; } };
    }


    /* ─── Slot builder (drag or click cards into slots) ──────────
       Port of the AR1 Fluid Power initLabelBuilder (itself from the
       CSP 4.6 flowchart slot builder). section[data-fcb] holds a
       [data-fcb-root] stage of absolutely positioned .fcb-slot
       buttons (data-accept = comma-separated chip ids) and a
       [data-fcb-bank] of .fcb-chip buttons (data-chip). Wrong drops
       shake and stay in the bank; attempts, misses, and placements
       persist in sessionStorage per section id; a zero-miss finish
       shows the perfect overlay and a saved badge.
       ───────────────────────────────────────────────────── */
    function shuffleChildren(host) {
        var kids = Array.prototype.slice.call(host.children);
        shuffle(kids).forEach(function (k) { host.appendChild(k); });
    }
    function initSlotBuilder(section, keyPrefix) {
      var root = section.querySelector('[data-fcb-root]');
      var bankEl = section.querySelector('[data-fcb-bank]');
      var slots = Array.prototype.slice.call(root.querySelectorAll('.fcb-slot:not(.fcb-given)'));   // .fcb-given slots are pre-filled anchors
      var chips = Array.prototype.slice.call(bankEl.querySelectorAll('.fcb-chip'));
      var scoreEl = section.querySelector('[data-fcb-score]');
      var attemptsEl = section.querySelector('[data-fcb-attempts]');
      var completeEl = section.querySelector('[data-fcb-complete]');
      var perfectEl = section.querySelector('[data-fcb-perfect]');
      var overlayEl = section.querySelector('[data-fcb-overlay]');
      var total = slots.length, placed = 0, attempts = 0, misses = 0, selected = null;
      /* earned: finished with zero misses at least once in this tab. It is saved,
         so the badge survives closing the overlay, Start over and a reload. */
      var earned = false;
      var STORE_KEY = (keyPrefix || 'silicon') + ':fcb:' + section.id;
      function save() {
        try {
          sessionStorage.setItem(STORE_KEY, JSON.stringify({ attempts: attempts, misses: misses, earned: earned,
            filled: slots.map(function (sl) { return sl.dataset.chipIdx || null; }) }));
        } catch (e) {}
      }
      function load() { try { return JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null'); } catch (e) { return null; } }
      if (overlayEl) overlayEl.addEventListener('click', function () { overlayEl.classList.remove('visible'); });
      if (perfectEl) perfectEl.addEventListener('click', function () { overlayEl.classList.add('visible'); });
      function status(justFinished) {
        var done = placed === total;
        if (done && misses === 0 && !earned) { earned = true; save(); }
        perfectEl.hidden = !earned;
        if (overlayEl) overlayEl.classList.toggle('visible', !!justFinished && done && misses === 0);
        scoreEl.textContent = placed + ' of ' + total + ' placed';
        attemptsEl.textContent = attempts + (attempts === 1 ? ' try' : ' tries');
        completeEl.hidden = !done;
        completeEl.textContent = misses === 0 ? (section.dataset.fcbPerfectMsg || 'Perfect! Every card on the first try.')
          : (section.dataset.fcbDoneMsg || 'Complete!') + ' ' + misses + (misses === 1 ? ' wrong try' : ' wrong tries') + ' along the way.';
      }
      function fill(slot, chip) {
        slot.innerHTML = chip.innerHTML;
        slot.classList.add('filled');
        slot.dataset.chipIdx = String(chips.indexOf(chip));
        slot.setAttribute('aria-label', 'Correct: ' + chip.textContent);
        chip.classList.add('used');
        placed++;
      }
      function select(chip) {
        if (selected) selected.classList.remove('selected');
        selected = (chip && chip !== selected) ? chip : null;
        if (selected) selected.classList.add('selected');
      }
      function place(chip, slot) {
        if (!chip || slot.classList.contains('filled') || chip.classList.contains('used')) return;
        attempts++;
        if (slot.dataset.accept.split(',').indexOf(chip.dataset.chip) !== -1) {
          fill(slot, chip);
        } else {
          misses++;
          slot.classList.remove('wrong'); void slot.offsetWidth; slot.classList.add('wrong');
          var b = document.createElement('span');
          b.className = 'fcb-x'; b.setAttribute('aria-hidden', 'true'); b.textContent = '✗';
          slot.appendChild(b);
          setTimeout(function () { slot.classList.remove('wrong'); if (b.parentNode) b.parentNode.removeChild(b); }, 650);
        }
        select(null); save(); status(placed === total);
      }
      var suppressClick = false;
      function slotAt(x, y) {
        var el = document.elementFromPoint(x, y);
        var slot = el && el.closest ? el.closest('.fcb-slot') : null;
        return slot && root.contains(slot) ? slot : null;
      }
      function startDrag(chip, e) {
        if (chip.classList.contains('used') || (e.pointerType === 'mouse' && e.button !== 0)) return;
        var startX = e.clientX, startY = e.clientY, rect = chip.getBoundingClientRect();
        var offX = e.clientX - rect.left, offY = e.clientY - rect.top, ghost = null, hover = null;
        try { chip.setPointerCapture(e.pointerId); } catch (err) {}
        // Listen on the window, not the chip: if the browser drops pointer capture
        // (zoom, an iframe host, a trackpad), pointerup would otherwise land on the
        // slot, the drag would never end, and the ghost would stay stuck there.
        var pid = e.pointerId;
        function move(ev) {
          if (ev.pointerId !== pid) return;
          ev.stopPropagation();
          if (!ghost) {
            if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) < 6) return;
            ghost = chip.cloneNode(true);
            ghost.classList.add('fcb-ghost');
            ghost.style.transform = 'scale(' + (Reveal.getScale ? Reveal.getScale() : 1) + ')';
            document.body.appendChild(ghost);
            chip.classList.add('dragging');
            select(null);
          }
          ghost.style.left = (ev.clientX - offX) + 'px';
          ghost.style.top = (ev.clientY - offY) + 'px';
          var over = slotAt(ev.clientX, ev.clientY);
          if (over !== hover) {
            if (hover) hover.classList.remove('drag-over');
            hover = over && !over.classList.contains('filled') ? over : null;
            if (hover) hover.classList.add('drag-over');
          }
        }
        function end(ev) {
          if (ev.pointerId !== undefined && ev.pointerId !== pid) return;
          ev.stopPropagation();
          window.removeEventListener('pointermove', move, true);
          window.removeEventListener('pointerup', end, true);
          window.removeEventListener('pointercancel', end, true);
          window.removeEventListener('blur', end);
          if (hover) hover.classList.remove('drag-over');
          if (!ghost) return;
          ghost.parentNode.removeChild(ghost);
          chip.classList.remove('dragging');
          suppressClick = true;
          var target = ev.type === 'pointerup' ? slotAt(ev.clientX, ev.clientY) : null;
          if (target) place(chip, target);
        }
        window.addEventListener('pointermove', move, true);
        window.addEventListener('pointerup', end, true);
        window.addEventListener('pointercancel', end, true);
        window.addEventListener('blur', end);
      }
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () { if (suppressClick) { suppressClick = false; return; } select(chip); });
        chip.addEventListener('pointerdown', function (e) { e.stopPropagation(); startDrag(chip, e); });
        chip.addEventListener('touchstart', function (e) { e.stopPropagation(); }, { passive: true });
      });
      slots.forEach(function (slot) {
        slot.dataset.empty = slot.innerHTML;
        slot.addEventListener('click', function () { if (selected) place(selected, slot); });
      });
      function clearBoard() {
        slots.forEach(function (slot) { slot.innerHTML = slot.dataset.empty; slot.classList.remove('filled', 'wrong'); delete slot.dataset.chipIdx; });
        chips.forEach(function (chip) { chip.classList.remove('used', 'selected'); });
        placed = 0; selected = null;
        shuffleChildren(bankEl);
      }
      section.querySelector('[data-fcb-reset]').addEventListener('click', function () { clearBoard(); save(); status(); });
      clearBoard();
      var saved = load();
      if (saved) {
        attempts = saved.attempts || 0; misses = saved.misses || 0; earned = !!saved.earned;
        (saved.filled || []).forEach(function (idx, i) { if (idx !== null && chips[+idx] && slots[i]) fill(slots[i], chips[+idx]); });
      }
      status();
    }


    /* ── SVG zoom: click an element with .svg-zoomable to open its schematic in the
       runtime lightbox. The SVG's theme styles are copied inline so it still
       looks right once it becomes a standalone image. */
    var ZOOM_PROPS = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap',
        'stroke-linejoin', 'stroke-dasharray', 'opacity', 'display', 'visibility', 'font-family',
        'font-size', 'font-weight', 'font-style', 'letter-spacing', 'text-anchor', 'dominant-baseline'];
    function svgToDataUrl(svg) {
        var clone = svg.cloneNode(true);
        var src = svg.querySelectorAll('*'), dst = clone.querySelectorAll('*');
        for (var i = 0; i < src.length; i++) {
            var cs = getComputedStyle(src[i]), st = '';
            ZOOM_PROPS.forEach(function (prop) { st += prop + ':' + cs.getPropertyValue(prop) + ';'; });
            dst[i].setAttribute('style', st);
            dst[i].removeAttribute('class');
        }
        var vb = svg.viewBox.baseVal, bg = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || '#121a16';
        clone.setAttribute('xmlns', NS);
        clone.setAttribute('width', vb.width * 2);
        clone.setAttribute('height', vb.height * 2);
        var rect = document.createElementNS(NS, 'rect');
        rect.setAttribute('x', vb.x); rect.setAttribute('y', vb.y);
        rect.setAttribute('width', vb.width); rect.setAttribute('height', vb.height);
        rect.setAttribute('style', 'fill:' + bg);
        clone.insertBefore(rect, clone.firstChild);
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
    }
    function zoomSvg(host) {
        var svg = host.querySelector('svg');
        if (!svg || typeof global.openImgModal !== 'function') return;
        global.openImgModal(svgToDataUrl(svg), svg.getAttribute('aria-label') || '');
    }
    document.addEventListener('click', function (e) {
        var host = e.target.closest && e.target.closest('.svg-zoomable');
        if (host && !host.closest('#storyboard')) zoomSvg(host);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        var host = document.activeElement && document.activeElement.closest && document.activeElement.closest('.svg-zoomable');
        if (host) { e.preventDefault(); zoomSvg(host); }
    });

    /* ─── Faulty Gate Hunt ────────────────────────────────────
       A transistor NAND built from the build sheet, with one hidden
       fault. Evidence comes three ways: the truth table (free: click A
       and B on the schematic and watch the lamp), voltage probes at five
       test points (1 min each, at the current inputs), and power-off
       tests. Every real cause has a look-alike with the same truth
       table, so the table narrows the search and a probe settles it.
       Causes are dealt from a shuffled deck; "Y lamp burned out" is a
       distractor that looks like the missing pull-up.
       ───────────────────────────────────────────────────── */
    var GH_CAUSES = {
        rb1: { name: 'Q1&#39;s base resistor has a bad contact', fix: 0,
               why: 'With Q1&#39;s base resistor not making contact, no base current reaches Q1, so it never turns on. The series path is never complete, and the lamp stays lit for every input. Q1&#39;s base reads <b>0 V</b> even with A = 1, and an ohmmeter across the resistor reads OL.' },
        e2:  { name: 'Q2&#39;s emitter is not connected to ground', fix: 1,
               why: 'With Q2&#39;s emitter not grounded, the series path has no way out to ground, so the output never goes low. No base current can flow either, so a base whose input is 1 floats up to about <b>5 V</b> instead of the normal 0.7 to 0.8 V.' },
        q2s: { name: 'Q2 is shorted, collector to emitter', fix: 2,
               why: 'A shorted Q2 conducts all the time, as if B were always 1. Only Q1 is left in control, so Y = NOT A. Q2&#39;s base still reads <b>0 V</b> when B = 0, and the diode test shows the short.' },
        rb2: { name: 'Q2&#39;s base resistor goes to +5 V, not input B', fix: 5,
               why: 'With Q2&#39;s base resistor tied to +5 V, Q2 is on all the time, as if B were always 1, so Y = NOT A. Q2&#39;s base reads <b>0.7 V</b> even with B = 0, which a shorted Q2 would not show.' },
        pu:  { name: 'The 1 kΩ pull-up is missing', fix: 3,
               why: 'Without the pull-up, nothing connects the output to 5 V, so Y reads <b>0 V</b> in every row and the lamp never lights. A burned-out lamp would leave Y at 5 V in the rows that should be 1.' },
        par: { name: 'Q1 and Q2 are wired in parallel', fix: 4,
               why: 'Q1&#39;s emitter goes straight to ground, so Q1 and Q2 sit side by side. Either one can pull the output down, and the table matches a <b>NOR</b> gate instead of a NAND.' },
        led: { name: 'The Y lamp is burned out', fix: 6, distractor: true },
    };
    var GH_ORDER = ['rb1', 'e2', 'q2s', 'rb2', 'pu', 'par', 'led'];
    var GH_FIXES = ['Reseat Q1&#39;s base resistor', 'Reseat the ground jumper on Q2&#39;s emitter', 'Replace Q2', 'Install the 1 kΩ pull-up', 'Move Q1&#39;s emitter to Q2&#39;s collector', 'Move Q2&#39;s base resistor to input B', 'Replace the Y lamp', 'Swap in the LogiKIT NAND module instead'];
    // Test points on the NAND drawing: [id, label, x, y, label anchor dx, dy, text-anchor]
    var GH_TPS = [
        ['y',   'TP1', 450, 190, 0, -18, 'middle', 'Y output'],
        ['vb1', 'TP2', 250, 275, 0, 44, 'middle', 'Q1 base'],
        ['mid', 'TP3', 330, 322, 18, 9, 'start', 'Q1 to Q2'],
        ['vb2', 'TP4', 250, 375, 0, 44, 'middle', 'Q2 base'],
        ['ve2', 'TP5', 330, 428, 18, 9, 'start', 'Q2 emitter'],
    ];
    var GH_TESTS = [
        { id: 'rb1', cost: 2, label: 'Ohms across Q1&#39;s base resistor', r: { rb1: 'OL: open', def: '10.0 kΩ' } },
        { id: 'cont', cost: 2, label: 'Continuity, Q2 emitter to ground', r: { e2: 'No beep: OL', def: 'Beeps: 0.3 Ω' } },
        { id: 'rpu', cost: 2, label: 'Ohms from the +5 V rail to Y', r: { pu: 'OL: nothing connected', def: '1.00 kΩ' } },
        { id: 'diode', cost: 3, label: 'Pull Q2 and diode-test it', r: { q2s: 'C–E reads 0.00 V both ways: shorted', def: 'B–E 0.68 V, B–C 0.69 V, C–E OL: a good NPN' } },
        { id: 'trace', cost: 4, label: 'Trace every wire against the build sheet', r: { par: 'Q1&#39;s emitter is jumpered to the ground rail, not to Q2&#39;s collector', rb2: 'Q2&#39;s 10 kΩ resistor runs to the +5 V rail, not to input B', def: 'Every wire matches the build sheet' } },
        { id: 'ohmhot', cost: 1, unsafe: true, label: 'Ohms across the pull-up, power on',
          warn: 'Not done. An ohmmeter sends its own current, so a powered circuit gives a false reading and can damage the meter. Power down first.' },
        { id: 'hotpull', cost: 1, unsafe: true, label: 'Pull Q2 out with the power on',
          warn: 'Not done. Pulling parts from a live breadboard can short neighboring rows and damage the transistor. Power down, then remove it.' },
    ];
    // Node voltages for the NAND as built with fault f, at inputs A and B.
    function ghModel(f, A, B) {
        var a1 = A && f !== 'rb1' ? 1 : 0, b2 = f === 'rb2' ? 1 : B;
        var q2c = b2 || f === 'q2s', gnd = f !== 'e2';
        var path = f === 'par' ? (a1 || (q2c && gnd)) : (a1 && q2c && gnd);
        var y = f === 'pu' ? 0 : (path ? 0.2 : 5.0);
        var mid = f === 'par' ? y : (q2c && gnd ? (f === 'q2s' && !b2 ? 0.0 : 0.1) : (a1 ? 4.3 : 0.0));
        var vb1 = (f === 'rb1' || !A) ? 0 : (f === 'par' ? 0.7 : (q2c && gnd ? 0.8 : 5.0));
        var vb2 = !b2 ? 0 : (gnd ? 0.7 : 5.0);
        var ve2 = gnd ? 0 : (b2 ? 4.3 : 0);
        return { y: y, vb1: vb1, mid: mid, vb2: vb2, ve2: ve2, lamp: f === 'led' ? 0 : (y > 2.5 ? 1 : 0) };
    }
    function gateHunt(root, groups, inputs, draw) {
        var BUDGET = 10, G = groups.NAND, c = G.c;
        var NOTES = [
            ['Mon', 'Built from the NAND build sheet. It matched the LogiKIT NAND.'],
            ['Tue', 'Resistors were borrowed from this kit for another project.'],
            ['Tue', 'A loose jumper on the ground rail was pushed back in.'],
            ['Wed', 'The board was dropped, and the parts were pressed back in.'],
            ['Wed', 'A transistor was tested by touching it across 5 V.'],
            ['Thu', 'A second builder rewired part of the board from memory.'],
            ['Thu', 'The LogiKIT batteries were replaced.'],
        ];
        function q(r) { return root.querySelector('[data-role="' + r + '"]'); }
        Object.keys(groups).forEach(function (k) { groups[k].g.style.display = k === 'NAND' ? '' : 'none'; });
        var A = 0, B = 0, deck = [], s;
        // test point dots
        var tpEls = {};
        GH_TPS.forEach(function (t) {
            var g = el('g', { class: 'gh-tp', role: 'button', tabindex: '0', 'data-tp': t[0], 'aria-label': t[1] + ', ' + t[7] + ': measure voltage (1 minute)' }, G.g);
            el('circle', { cx: t[2], cy: t[3], r: 11 }, g);
            text(t[2] + t[4], t[3] + t[5], t[1], 'gh-tp-lbl', g, t[6]);
            tpEls[t[0]] = g;
            g.addEventListener('click', function () { probe(t); });
            g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); probe(t); } });
        });
        function pick(avoid) {
            if (!deck.length) {
                deck = shuffle(['rb1', 'e2', 'q2s', 'rb2', 'pu', 'par']);
                if (deck[0] === avoid) deck.push(deck.shift());
            }
            return deck.shift();
        }
        function fresh(avoid) { return { cause: pick(avoid), log: [], used: 0, rows: {}, struck: {}, diag: null, fix: null, stage: 'test', tab: 'notes', last: null }; }
        function state() { return A + '' + B; }
        function left() { return BUDGET - s.used; }
        function test(id) { return GH_TESTS.filter(function (t) { return t.id === id; })[0]; }
        function tp(id) { return GH_TPS.filter(function (t) { return t[0] === id; })[0]; }
        function fmtV(v) { return v.toFixed(2) + ' V'; }
        // an evidence item's reading under cause f: 'p:node:AB', 't:id', or 'r:AB' (a truth-table row)
        function readingOf(item, f) {
            var p = item.split(':');
            if (p[0] === 'p') return fmtV(ghModel(f, +p[2][0], +p[2][1])[p[1]]);
            if (p[0] === 'r') return ghModel(f, +p[1][0], +p[1][1]).lamp;
            var t = test(p[1]); return t.unsafe ? null : (t.r[f] || t.r.def);
        }
        function evidence() { return s.log.filter(function (i) { return !(i[0] === 't' && test(i.split(':')[1]).unsafe); }).concat(Object.keys(s.rows).map(function (r) { return 'r:' + r; })); }
        function differs(item, a, b) { return readingOf(item, a) !== readingOf(item, b); }
        function lookAlikes(f) {
            return GH_ORDER.filter(function (o) { return o !== f && ['00', '01', '10', '11'].every(function (r) { return ghModel(o, +r[0], +r[1]).lamp === ghModel(f, +r[0], +r[1]).lamp; }); });
        }
        function probe(t) {
            if (s.stage !== 'test') return;
            var id = 'p:' + t[0] + ':' + state();
            s.last = t[0];
            if (s.log.indexOf(id) < 0) {
                if (left() < 1) { renderCircuit(); return; }
                s.used += 1; s.log.push(id);
            }
            s.tab = 'log'; renderAll();
        }
        function runTest(t) {
            if (s.log.indexOf('t:' + t.id) >= 0 || t.cost > left()) return;
            s.used += t.cost; s.log.push('t:' + t.id); s.last = null; s.tab = 'log'; renderAll();
        }
        function toggle(name) { if (s.stage === 'record') return; if (name === 'A') A = A ? 0 : 1; else B = B ? 0 : 1; renderAll(); }
        inputs.forEach(function (i) {
            if (!G.g.contains(i.g)) return;
            i.g.addEventListener('click', function () { toggle(i.name); });
            i.g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggle(i.name); } });
        });
        function renderCircuit() {
            draw('NAND', A, B, false, false);
            G.sw.forEach(function (x) { if (x.q) x.q.classList.remove('on'); });   // conduction is hidden: that is the evidence
            var m = ghModel(s.cause, A, B);
            c.yLed.classList.toggle('on', !!m.lamp);
            s.rows[state()] = m.lamp;
            inputs.forEach(function (i) {
                var v = i.name === 'A' ? A : B;
                i.g.classList.toggle('on', !!v); i.g.setAttribute('aria-pressed', v ? 'true' : 'false');
                i.g.setAttribute('aria-label', 'Input ' + i.name + ' is ' + v + '. Press to toggle.');
                i.t.textContent = i.name + '=' + v;
            });
            Object.keys(tpEls).forEach(function (k) { tpEls[k].classList.toggle('last', s.last === k); });
        }
        function renderTable() {
            var rows = ['00', '01', '10', '11'];
            q('tt').innerHTML = '<tbody><tr><th>A B</th>' + rows.map(function (r) { return '<td' + (r === state() ? ' class="cur"' : '') + '>' + r[0] + ' ' + r[1] + '</td>'; }).join('') + '</tr>' +
                '<tr><th>Should be</th>' + rows.map(function (r) { return '<td' + (r === state() ? ' class="cur"' : '') + '>' + (r === '11' ? 0 : 1) + '</td>'; }).join('') + '</tr>' +
                '<tr><th>Lamp</th>' + rows.map(function (r) {
                    var seen = s.rows[r], ok = seen === (r === '11' ? 0 : 1);
                    return '<td class="' + (r === state() ? 'cur ' : '') + (seen === undefined ? 'gb-blank' : (ok ? 'gh-ok' : 'gh-bad')) + '">' + (seen === undefined ? '?' : seen) + '</td>';
                }).join('') + '</tr></tbody>';
        }
        function entry(item) {
            var p = item.split(':');
            if (p[0] === 't') {
                var t = test(p[1]);
                if (t.unsafe) return '<div class="md-entry unsafe"><span class="md-k">Unsafe</span><span class="md-v">' + t.warn + '</span></div>';
                return '<div class="md-entry"><span class="md-k">' + t.label + '</span><span class="md-v">' + readingOf(item, s.cause) + '</span></div>';
            }
            var t2 = tp(p[1]);
            return '<div class="md-entry"><span class="md-k">' + t2[1] + ' ' + t2[7] + ', A=' + p[2][0] + ' B=' + p[2][1] + '</span><span class="md-v">' + readingOf(item, s.cause) + '</span></div>';
        }
        function renderPanel() {
            var box = q('left');
            root.querySelectorAll('[data-tab]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.tab === s.tab ? 'true' : 'false'); });
            if (s.tab === 'notes') {
                box.innerHTML = '<div class="md-notes">' + NOTES.map(function (n) { return '<div class="md-note"><span class="md-day">' + n[0] + '</span><span>' + n[1] + '</span></div>'; }).join('') + '</div>';
                return;
            }
            box.innerHTML = s.log.length ? '<div class="md-log">' + s.log.map(entry).join('') + '</div>' : '<p class="md-empty">Click a test point (TP) or run a test. The reading appears here.</p>';
            box.scrollTop = box.scrollHeight;
        }
        function renderNav() {
            var b = [];
            if (s.stage === 'test') b.push('<button class="sim-btn" data-go="diag">Diagnose</button>');
            if (s.stage === 'diag') b.push('<button class="sim-btn alt" data-go="test">Back to tests</button>', '<button class="sim-btn" data-go="record"' + (s.diag && s.fix !== null ? '' : ' disabled') + '>Submit</button>');
            if (s.stage === 'record') b.push('<button class="sim-btn" data-act="new">New fault</button>');
            q('nav').innerHTML = b.join('');
            q('nav').querySelectorAll('[data-go]').forEach(function (x) { x.addEventListener('click', function () { s.stage = x.dataset.go; renderAll(); }); });
            var nw = q('nav').querySelector('[data-act="new"]');
            if (nw) nw.addEventListener('click', function () { s = fresh(s.cause); A = 0; B = 0; renderAll(); });
        }
        function renderRight() {
            var box = q('right'), html = '';
            q('budget-bar').style.width = (100 * s.used / BUDGET) + '%';
            q('budget-val').textContent = s.used + ' of ' + BUDGET + ' min used';
            root.classList.toggle('gh-recorded', s.stage === 'record');
            root.classList.toggle('gh-diag', s.stage === 'diag');
            if (s.stage === 'test') {
                html = '<p class="md-help">Click a <b>TP</b> dot to measure its voltage at the current inputs (1 min). Power-off tests:</p>' +
                    '<div class="md-tests">' + GH_TESTS.map(function (t) {
                        var done = s.log.indexOf('t:' + t.id) >= 0;
                        return '<button class="md-test' + (done ? ' done' : '') + '" data-test="' + t.id + '"' + (done || t.cost > left() ? ' disabled' : '') + '><span>' + t.label + '</span><span class="md-cost">' + t.cost + ' min</span></button>';
                    }).join('') + '</div>';
            } else if (s.stage === 'diag') {
                html = '<p class="md-help">Strike (✕) the causes your readings rule out.</p>' +
                    '<div class="md-causes">' + GH_ORDER.map(function (id) {
                        var st = !!s.struck[id];
                        return '<div class="md-cause' + (st ? ' struck' : '') + (s.diag === id ? ' picked' : '') + '">' +
                            '<button class="md-x" data-strike="' + id + '" aria-pressed="' + st + '" aria-label="Rule out">✕</button>' +
                            '<button class="md-pick" data-diag="' + id + '"' + (st ? ' disabled' : '') + '>' + GH_CAUSES[id].name + '</button></div>';
                    }).join('') + '</div>' +
                    '<label class="md-fix-l">Fix <select class="md-fix" data-role="fix"><option value="">Choose a fix</option>' +
                    GH_FIXES.map(function (f, i) { return '<option value="' + i + '"' + (s.fix === i ? ' selected' : '') + '>' + f + '</option>'; }).join('') + '</select></label>';
            } else html = renderRecord();
            box.innerHTML = html;
            box.querySelectorAll('[data-test]').forEach(function (b) { b.addEventListener('click', function () { runTest(test(b.dataset.test)); }); });
            box.querySelectorAll('[data-strike]').forEach(function (b) {
                b.addEventListener('click', function () { var id = b.dataset.strike; s.struck[id] = !s.struck[id]; if (s.struck[id] && s.diag === id) s.diag = null; renderRight(); renderNav(); });
            });
            box.querySelectorAll('[data-diag]').forEach(function (b) { b.addEventListener('click', function () { s.diag = b.dataset.diag; renderRight(); renderNav(); }); });
            var fx = box.querySelector('[data-role="fix"]');
            if (fx) fx.addEventListener('change', function () { s.fix = this.value === '' ? null : +this.value; renderNav(); });
        }
        function renderRecord() {
            var cz = GH_CAUSES[s.cause], ev = evidence(), like = lookAlikes(s.cause);
            var struck = GH_ORDER.filter(function (id) { return s.struck[id]; });
            var fair = struck.filter(function (id) { return id !== s.cause && ev.some(function (i) { return differs(i, s.cause, id); }); });
            var badStrike = struck.indexOf(s.cause) >= 0, unfair = struck.length - fair.length - (badStrike ? 1 : 0);
            var nRows = Object.keys(s.rows).length;
            var key = like.length ? ev.some(function (i) { return i[0] !== 'r' && like.every(function (o) { return differs(i, s.cause, o); }); }) : true;
            var nUnsafe = s.log.filter(function (i) { return i[0] === 't' && test(i.split(':')[1]).unsafe; }).length;
            var right = s.diag === s.cause, fixed = s.fix === cz.fix;
            function row(k, ok, v) { return '<tr><td>' + k + '</td><td class="' + (ok ? 'ok' : 'bad') + '">' + v + '</td></tr>'; }
            return '<div class="md-record"><table class="rec-table">' +
                row('Cause', right, right ? 'Correct: ' + cz.name : 'It was: ' + cz.name) +
                row('Fix', fixed, fixed ? 'Correct' : 'Should be: ' + GH_FIXES[cz.fix]) +
                row('Truth table', nRows === 4, nRows + ' of 4 rows checked') +
                row('Key reading', key, like.length ? (key ? 'Found one that rules out the look-alike: ' : 'Missing. Nothing you measured rules out the look-alike: ') + like.map(function (o) { return '&ldquo;' + GH_CAUSES[o].name + '&rdquo;'; }).join(' and ') : 'No look-alike: the table alone points here') +
                row('Ruled out', !badStrike && unfair === 0, fair.length + ' struck with evidence' + (unfair > 0 ? ', ' + unfair + ' without' : '') + (badStrike ? ', and the real cause struck' : '')) +
                row('Safety', !nUnsafe, nUnsafe ? nUnsafe + ' unsafe choice' + (nUnsafe > 1 ? 's' : '') : 'No unsafe choices') +
                row('Time', true, s.used + ' of ' + BUDGET + ' min') +
                '</table><div class="md-why"><b>Why:</b> ' + cz.why + '</div></div>';
        }
        function renderAll() { renderCircuit(); renderTable(); renderRight(); renderPanel(); renderNav(); }
        root.querySelectorAll('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { s.tab = b.dataset.tab; renderPanel(); }); });
        s = fresh(null);
        renderAll();
        return { root: root, cause: function () { return s.cause; } };
    }

    /* ─── Wafer maps (Day 8) ──────────────────────────────────
       drawWaferMap(svg, pattern, opts) colors every die on a 300 mm
       wafer as pass or fail. The grid is 17 x 17 dies of 24 px inside a
       wafer of radius 196 (viewBox 0 0 420 420); exposure fields are 3 x 3
       dies. A seeded random makes each map look the same on every load.
       Patterns: good, edge (CMP), center (etch), repeater (photo mask),
       scratch (handling robot), whole (implant dose), cluster (particles).
       buildMapQuiz(root) deals random maps and asks which step failed.
       ───────────────────────────────────────────────────── */
    function rng(seed) {
        var a = seed >>> 0;
        return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    }
    var WM_ID = 0;
    function drawWaferMap(svg, pattern, o) {
        o = o || {};
        var R = rng(o.seed || 7), D = 24, C = 210, base = o.base === undefined ? 0.03 : o.base;
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        var id = 'wmclip' + (++WM_ID);
        var defs = el('defs', {}, svg), cp = el('clipPath', { id: id }, defs);
        el('circle', { cx: C, cy: C, r: 196 }, cp);
        el('circle', { cx: C, cy: C, r: 196, class: 'wm-wafer' }, svg);
        var dies = el('g', {}, svg), nBad = 0, nAll = 0;
        var sc = o.scratch || [[-0.85, -0.35], [0.75, 0.45]], cl = o.cluster || [0.35, -0.3], rp = o.rep || [1, 1];
        function segDist(px, py, a, b) {
            var dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy)));
            var qx = a[0] + t * dx - px, qy = a[1] + t * dy - py; return Math.sqrt(qx * qx + qy * qy);
        }
        for (var r = -8; r <= 8; r++) for (var c = -8; c <= 8; c++) {
            var x0 = C + (c - 0.5) * D, y0 = C + (r - 0.5) * D, far = 0;
            [[x0, y0], [x0 + D, y0], [x0, y0 + D], [x0 + D, y0 + D]].forEach(function (pt) { far = Math.max(far, Math.hypot(pt[0] - C, pt[1] - C)); });
            if (far > 192) continue;
            var nx = c * D / 192, ny = r * D / 192, rr = Math.hypot(nx, ny), pb = base;
            if (pattern === 'edge') pb = rr > 0.8 ? 0.9 : (rr > 0.7 ? 0.35 : base);
            else if (pattern === 'center') pb = rr < 0.32 ? 0.92 : (rr < 0.45 ? 0.45 : base);
            else if (pattern === 'repeater') pb = ((c + 8) % 3 === rp[0] && (r + 8) % 3 === rp[1]) ? 1 : base;
            else if (pattern === 'scratch') pb = segDist(nx, ny, sc[0], sc[1]) < 0.075 ? 0.95 : base;
            else if (pattern === 'whole') pb = 0.9;
            else if (pattern === 'cluster') pb = Math.hypot(nx - cl[0], ny - cl[1]) < 0.26 ? 0.85 : base;
            var bad = R() < pb;
            nAll++; if (bad) nBad++;
            el('rect', { x: x0 + 1.5, y: y0 + 1.5, width: D - 3, height: D - 3, rx: 2, class: 'wm-die ' + (bad ? 'bad' : 'ok') }, dies);
        }
        var f = el('g', { 'clip-path': 'url(#' + id + ')', class: 'wm-field' }, svg), d = '';
        [-8, -5, -2, 1, 4, 7].forEach(function (k) { var v = C + (k - 0.5) * D; d += 'M' + v + ' 0 V420 M0 ' + v + ' H420 '; });
        d += 'M' + (C + 8.5 * D) + ' 0 V420 M0 ' + (C + 8.5 * D) + ' H420';
        el('path', { d: d }, f);
        el('path', { d: 'M' + (C - 9) + ' ' + (C + 196) + ' L' + C + ' ' + (C + 184) + ' L' + (C + 9) + ' ' + (C + 196) + ' Z', class: 'wm-notch' }, svg);
        return { bad: nBad, all: nAll };
    }
    function drawWaferMaps(scope) {
        (scope || document).querySelectorAll('svg[data-wafer]').forEach(function (svg) {
            drawWaferMap(svg, svg.dataset.wafer, { seed: +(svg.dataset.seed || 7), base: svg.dataset.base === undefined ? undefined : +svg.dataset.base });
        });
    }
    var MQ_STEPS = [
        { id: 'edge', name: 'Polishing (CMP)', say: 'polishing (CMP)', why: 'A ring of failures at the <b>edge</b> means the outer dies were treated differently. The polisher pressed harder near the edge and polished them too thin.' },
        { id: 'center', name: 'Etch', say: 'the etch step', why: 'A <b>bullseye</b> in the center points to a step that heats or flows from the middle. A hot heater zone under the center etched it too deep.' },
        { id: 'repeater', name: 'Photolithography mask', say: 'the photolithography mask', why: 'The <b>same spot</b> fails in every exposure field. Only the mask repeats field by field, so a speck on the mask printed into each one.' },
        { id: 'scratch', name: 'Handling robot', say: 'the handling robot', why: 'A <b>straight line</b> of failures is a scratch. Something dragged across the wafer: a robot that is out of alignment.' },
        { id: 'whole', name: 'Implant dose', say: 'the implant dose', why: 'When <b>nearly every die</b> fails, the problem hit the whole wafer evenly, like the wrong implant dose changing the doping everywhere.' },
        { id: 'cluster', name: 'Cleanroom particles', say: 'particles in the cleanroom air', why: 'A <b>random blob</b> in one place, not tied to the edge, the center, or the fields, is contamination: particles that fell on that part of the wafer.' },
    ];
    function buildMapQuiz(root) {
        function q(r) { return root.querySelector('[data-role="' + r + '"]'); }
        var svg = q('map'), deck = [], cur = null, answered = false, right = 0, tries = 0;
        var btns = q('choices');
        btns.innerHTML = MQ_STEPS.map(function (st) { return '<button class="seg-btn mq-choice" data-pick="' + st.id + '">' + st.name + '</button>'; }).join('');
        function deal() {
            if (!deck.length) { deck = shuffle(MQ_STEPS.map(function (x) { return x.id; })); if (cur && deck[0] === cur) deck.push(deck.shift()); }
            cur = deck.shift(); answered = false;
            var seed = Math.floor(Math.random() * 1e9), R = rng(seed), o = { seed: seed };
            if (cur === 'scratch') { var a = R() * Math.PI, ox = (R() - 0.5) * 0.4, oy = (R() - 0.5) * 0.4; o.scratch = [[ox - 0.85 * Math.cos(a), oy - 0.85 * Math.sin(a)], [ox + 0.8 * Math.cos(a), oy + 0.8 * Math.sin(a)]]; }
            if (cur === 'cluster') { var ang = R() * 2 * Math.PI, rad = 0.42 + R() * 0.12; o.cluster = [rad * Math.cos(ang), rad * Math.sin(ang)]; }
            if (cur === 'repeater') { o.rep = [Math.floor(R() * 3), Math.floor(R() * 3)]; o.base = 0.01; }
            drawWaferMap(svg, cur, o);
            btns.querySelectorAll('[data-pick]').forEach(function (b) { b.disabled = false; b.classList.remove('mq-right', 'mq-wrong'); b.setAttribute('aria-pressed', 'false'); });
            q('feedback').innerHTML = 'Look at <b>where</b> the failed dies are. Then choose the step that went wrong.';
            score();
        }
        function score() { q('score').textContent = right + ' of ' + tries + ' right on the first try'; }
        btns.querySelectorAll('[data-pick]').forEach(function (b) {
            b.addEventListener('click', function () {
                if (answered) return;
                answered = true; tries++;
                var st = MQ_STEPS.filter(function (x) { return x.id === cur; })[0], ok = b.dataset.pick === cur;
                if (ok) right++;
                btns.querySelectorAll('[data-pick]').forEach(function (x) { x.disabled = true; if (x.dataset.pick === cur) x.classList.add('mq-right'); });
                if (!ok) b.classList.add('mq-wrong');
                q('feedback').innerHTML = (ok ? '<b class="res">Right: it was ' : '<b class="fault-c">Not quite. It was ') + st.say + '.</b> ' + st.why;
                score();
            });
        });
        q('next').addEventListener('click', deal);
        deal();
        return { root: root, reset: function () {} };
    }

    /* ─── Interface Driver (Day 9) ───────────────────────────
       A 5 V input drives an optocoupler LED through 390 Ohm; the
       phototransistor, on the 24 V side, feeds a 2N3904 base
       through 10 kOhm; the 2N3904 switches a 480 Ohm, 24 V relay
       coil with a flyback diode across it. The two sides share no
       wire (separate grounds), so a meter whose black lead sits on
       the other side's ground has no reference and drifts.
         LED:   (5 - 1.2) / 390            = 9.7 mA
         base:  (24 - 0.3 - 0.76) / 10000  = 2.3 mA
         coil:  (24 - 0.15) / 480          = 50 mA (forced beta 22)
       Turning the input off with the diode out sends the coil's
       spike across Q1 (rated 40 V); Q1 fails shorted, and the relay
       then stays on until Q1 is replaced.
       root[data-static] draws the circuit only; fragments on the
       slide with data-drv-in set the input (last visible wins).
       ───────────────────────────────────────────────────── */
    function buildInterfaceDriver(root) {
        function q(r) { return root.querySelector('[data-role="' + r + '"]'); }
        var svg = q('circuit'), isStatic = root.hasAttribute('data-static');
        var inOn = false, diode = true, dead = false, flyT = 0, sparkT = 0, tp = null, black = '24', drift = 0, driftT = 0;
        var g = el('g', {}, svg);
        // isolation barrier and optocoupler outline
        el('path', { d: 'M335 20 V76 M335 138 V470', class: 'id-barrier' }, g);
        el('rect', { x: 240, y: 142, width: 240, height: 156, rx: 14, class: 'id-opto' }, g);
        text(355, 104, 'opto-', 'sb-lbl', g, 'middle'); text(355, 132, 'coupler', 'sb-lbl', g, 'middle');
        text(160, 510, '5 V side', 'sb-lbl-b id-side', g, 'middle');
        text(610, 510, '24 V side', 'sb-lbl-b id-side', g, 'middle');
        // 5 V side
        var w5 = [wire('M40 80 H70', g), wire('M130 80 H150', g), wire('M230 80 H280 V180', g), wire('M280 220 V420', g)];
        el('circle', { cx: 40, cy: 80, r: 7, class: 'sb-dot' }, g);
        text(30, 40, '+5 V', 'sb-lbl-b', g, 'start');
        var lever = swtch(70, 130, 80, g); text(100, 128, 'input', 'sb-lbl', g, 'middle');
        resH(150, 230, 80, g); text(190, 50, '390 Ω', 'sb-lbl', g, 'middle');
        el('circle', { cx: 280, cy: 200, r: 34, class: 'sb-glow id-ledglow' }, g);
        var ledBody = el('path', { d: 'M256 180 H304 L280 220 Z', class: 'sb-led' }, g);
        sym('M256 220 H304', g);
        ground(280, 420, g); text(262, 470, '5 V gnd', 'sb-lbl', g, 'middle');
        // light
        var rays = el('g', { class: 'id-rays' }, g);
        [198, 224].forEach(function (y) {
            el('path', { d: 'M312 ' + y + ' H346', class: 'id-ray' }, rays);
            el('path', { d: 'M358 ' + y + ' l-14 -8 v16 z', class: 'id-ray-head' }, rays);
        });
        // phototransistor (no base lead)
        var pq = el('g', { class: 'gb-q id-pq' }, g);
        transistor(410, 210, false, pq);
        // 24 V side
        var wR = wire('M430 168 V50 H640', g), wS = wire('M640 50 H780', g);
        el('circle', { cx: 780, cy: 50, r: 7, class: 'sb-dot' }, g);
        text(780, 30, '+24 V', 'sb-lbl-b', g, 'end');
        var wB = [wire('M430 252 V360 H450', g), wire('M530 360 H600', g)];
        resH(450, 530, 360, g); text(490, 410, '10 kΩ', 'sb-lbl', g, 'middle');
        var wC = [wire('M640 50 V100', g), wire('M640 220 V318', g)];
        var coil = el('path', { d: 'M640 100 a22 15 0 0 1 0 30 a22 15 0 0 1 0 30 a22 15 0 0 1 0 30 a22 15 0 0 1 0 30', class: 'sb-sym id-coil' }, g);
        text(622, 150, 'relay', 'sb-lbl', g, 'end'); text(622, 184, 'coil', 'sb-lbl', g, 'end');
        var qg = el('g', { class: 'gb-q id-q1' }, g);
        transistor(620, 360, false, qg);
        el('path', { d: 'M590 330 l60 60 M650 330 l-60 60', class: 'id-x' }, qg);
        text(680, 372, 'Q1', 'sb-lbl-b', g);
        var wE = wire('M640 402 V420', g);
        ground(640, 420, g); text(640, 470, '24 V gnd', 'sb-lbl', g, 'middle');
        var dg = el('g', { class: 'id-diode' }, g);
        var wD = wire('M640 80 H740 V122 M740 178 V250 H640', dg);
        el('path', { d: 'M716 178 H764 L740 126 Z', class: 'id-dsym' }, dg);
        sym('M716 124 H764', dg);
        text(776, 162, 'D1', 'sb-lbl-b', dg);
        var spark = el('path', { class: 'id-spark', d: 'M680 300 l10 -22 l5 17 l14 -14 l-5 22 l17 2 l-19 10 l7 14 l-17 -7 l-7 17 l-5 -19 l-17 5 z' }, g);
        // test points
        var TPS = [
            { id: 'TP1', side: '5', x: 280, y: 140, lx: 264, ly: 150, a: 'end' },
            { id: 'TP2', side: '24', x: 430, y: 320, lx: 414, ly: 330, a: 'end' },
            { id: 'TP3', side: '24', x: 568, y: 360, lx: 552, ly: 342, a: 'end' },
            { id: 'TP4', side: '24', x: 640, y: 280, lx: 656, ly: 290 },
        ];
        TPS.forEach(function (t) {
            var tg = el('g', { class: 'id-tp', 'data-tp': t.id }, g);
            if (!isStatic) { tg.setAttribute('role', 'button'); tg.setAttribute('tabindex', '0'); tg.setAttribute('aria-label', 'Measure ' + t.id); }
            el('circle', { cx: t.x, cy: t.y, r: 13 }, tg);
            text(t.lx, t.ly, t.id, 'id-tp-lbl', tg, t.a || 'start');
            t.g = tg;
        });
        if (isStatic) TPS.forEach(function (t) { t.g.style.display = 'none'; });

        function vAt(id) {
            switch (id) {
            case 'TP1': return inOn ? 1.18 : 0;
            case 'TP2': return inOn ? 23.7 : 0;
            case 'TP3': return inOn ? 0.76 : 0;
            case 'TP4':
                if (dead) return 0.05;
                if (sparkT > 0) return 412;
                if (inOn) return 0.15;
                return flyT > 0 ? 24.7 : 24.0;
            }
            return 0;
        }
        var coilOn = function () { return dead || inOn; };
        function draw() {
            lever.setAttribute('x2', inOn ? 130 : 126); lever.setAttribute('y2', inOn ? 80 : 46);
            w5.forEach(function (w) { w.classList.toggle('lit', inOn); });
            ledBody.style.fill = inOn ? '#ff6b5e' : '';
            g.querySelector('.id-ledglow').style.opacity = inOn ? 0.35 : 0;
            rays.classList.toggle('on', inOn);
            pq.classList.toggle('on', inOn);
            wR.classList.toggle('lit', inOn);
            wB.forEach(function (w) { w.classList.toggle('lit', inOn); });
            wS.classList.toggle('lit', inOn || coilOn());
            wC.forEach(function (w) { w.classList.toggle('lit', coilOn()); });
            wE.classList.toggle('lit', inOn || coilOn());
            coil.classList.toggle('on', coilOn() || flyT > 0);
            qg.classList.toggle('on', inOn && !dead);
            qg.classList.toggle('dead', dead);
            dg.style.display = diode ? '' : 'none';
            wD.classList.toggle('fly', flyT > 0);
            spark.style.opacity = sparkT > 0 ? 1 : 0;
            if (isStatic) return;
            TPS.forEach(function (t) { t.g.classList.toggle('sel', tp === t.id); });
            var sw = q('in'); sw.textContent = inOn ? 'Input 1' : 'Input 0'; sw.setAttribute('aria-pressed', inOn ? 'true' : 'false');
            root.querySelectorAll('[data-diode]').forEach(function (b) { b.setAttribute('aria-pressed', (b.dataset.diode === 'in') === diode ? 'true' : 'false'); });
            root.querySelectorAll('[data-black]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.black === black ? 'true' : 'false'); });
            q('replace').style.visibility = dead ? '' : 'hidden';
            var chip = q('relay');
            chip.textContent = coilOn() ? 'Relay on' : 'Relay off';
            chip.className = 'status-chip ' + (dead ? 'bad' : coilOn() ? 'busy' : '');
            var t = TPS.filter(function (x) { return x.id === tp; })[0];
            var name = q('dmm-name'), val = q('dmm-val');
            if (!t) { name.textContent = 'Click a test point (TP)'; val.textContent = '--.- V'; }
            else {
                name.textContent = t.id + ' to ' + black + ' V ground';
                var v = t.side === black ? vAt(t.id) : drift;
                val.textContent = (v < 0 ? MINUS : '') + Math.abs(v).toFixed(Math.abs(v) >= 100 ? 0 : 2) + ' V';
            }
            val.classList.toggle('drift', !!t && t.side !== black);
            var fb = q('feedback'), cls = '';
            var tpSide = t ? t.side : null;
            if (dead) { cls = 'bad'; fb.innerHTML = '<b>Q1 failed.</b> With no flyback diode, the coil&#39;s spike reached hundreds of volts, far past Q1&#39;s 40 V rating. Q1 failed <b>shorted</b>, so the relay stays on whatever the input does. Put D1 back and replace Q1.'; }
            else if (t && tpSide !== black) { cls = 'caution'; fb.innerHTML = '<b>No reference.</b> ' + t.id + ' is on the ' + tpSide + ' V side, but the black lead is on the ' + black + ' V ground. The two sides share no wire, so the reading drifts and means nothing. Move the black lead.'; }
            else if (sparkT > 0) { cls = 'bad'; fb.innerHTML = '<b>No diode:</b> the coil fights the sudden stop, and the voltage across Q1 jumps to <b>hundreds of volts</b>.'; }
            else if (inOn) fb.innerHTML = '<b>Input 1:</b> about 10 mA lights the LED. Its light turns on the phototransistor, about 2.3 mA flows into Q1&#39;s base, and Q1 saturates. The coil draws about <b>50 mA</b> from the 24 V supply.';
            else if (flyT > 0) fb.innerHTML = '<b>Input 0:</b> Q1 turned off. The coil&#39;s current circles through D1 and dies away, so Q1 sees only about <b>24.7 V</b>.';
            else fb.innerHTML = '<b>Input 0:</b> the LED is dark, so the phototransistor and Q1 are off and the relay is off. Turn the input on, then click a test point to measure it.';
            fb.className = 'sim-feedback ' + cls;
        }
        function setIn(on) {
            if (on === inOn) return;
            if (!on && !dead) {
                if (diode) flyT = 0.8;
                else { sparkT = 0.5; }
            }
            inOn = on; draw();
        }
        function tick(dt) {
            var changed = false;
            if (flyT > 0) { flyT = Math.max(0, flyT - dt); changed = true; }
            if (sparkT > 0) { sparkT = Math.max(0, sparkT - dt); if (sparkT === 0) dead = true; changed = true; }
            driftT -= dt;
            if (driftT <= 0) { driftT = 0.35; drift = Math.max(-3, Math.min(3, drift + gauss() * 0.6)); var t = TPS.filter(function (x) { return x.id === tp; })[0]; if (t && t.side !== black) changed = true; }
            if (changed) draw();
        }
        function reset() { inOn = false; diode = true; dead = false; flyT = 0; sparkT = 0; tp = null; black = '24'; if (!isStatic) draw(); else sync(); }
        function sync() {
            if (!isStatic) return;
            var sec = root.closest('section'), shown = sec ? sec.querySelectorAll('.fragment.visible[data-drv-in]') : [];
            var f = shown.length ? shown[shown.length - 1] : null;
            inOn = f ? f.dataset.drvIn === '1' : root.dataset.static === '1';
            draw();
        }
        if (isStatic) { sync(); return { root: root, sync: sync }; }
        q('in').addEventListener('click', function () { setIn(!inOn); });
        lever.style.cursor = 'pointer';
        lever.addEventListener('click', function () { setIn(!inOn); });
        root.querySelectorAll('[data-diode]').forEach(function (b) { b.addEventListener('click', function () { diode = b.dataset.diode === 'in'; draw(); }); });
        root.querySelectorAll('[data-black]').forEach(function (b) { b.addEventListener('click', function () { black = b.dataset.black; draw(); }); });
        q('replace').addEventListener('click', function () { dead = false; draw(); });
        TPS.forEach(function (t) {
            function pick() { tp = t.id; draw(); }
            t.g.addEventListener('click', pick);
            t.g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
        });
        var pager = root.querySelector('.task-pager'); if (pager) initTaskPager(pager);
        reset();
        return { root: root, tick: tick, reset: reset };
    }

    /* ─── Switching Device Comparison (Day 9) ────────────────
       A lamp (a resistor) in series with a MOSFET, an SCR, or a
       TRIAC on 24 V DC or 24 V AC (34 V peak). Time is slowed 60
       times, so one 60 Hz cycle takes one second; the scope shows
       the last four seconds.
         MOSFET: the channel conducts both ways while the gate is on.
                 With the gate off it blocks forward voltage, but its
                 body diode conducts the negative half of AC.
         SCR:    a gate signal while forward biased (v > 1 V) latches
                 it on; it turns off only when current falls to zero
                 (v <= 0.3 V), so on DC it stays on until the circuit
                 is broken. Conducts the positive half only.
         TRIAC:  the same latch in either direction; turns off at
                 each zero crossing.
       Lamp brightness is the mean of i^2 over the last second,
       relative to 24 V DC.
       ───────────────────────────────────────────────────── */
    function buildSwitchCompare(root) {
        function q(r) { return root.querySelector('[data-role="' + r + '"]'); }
        var cs = q('circuit'), sc = q('scope');
        var dev = 'MOSFET', src = 'DC', hold = false, pulseT = 0, brkT = 0, on = false, onSign = 1, t = 0, hist = [], trig = false, everOn = false;
        // circuit
        wire('M80 150 V60 H206 M274 60 H400 V150 M400 250 V340 H80 V250', cs);
        var lampG = el('circle', { cx: 240, cy: 60, r: 46, class: 'sc-lampglow' }, cs);
        el('circle', { cx: 240, cy: 60, r: 34, class: 'sb-body' }, cs);
        sym('M216 36 L264 84 M264 36 L216 84', cs);
        text(240, 128, 'lamp', 'sb-lbl', cs, 'middle');
        var srcDC = el('g', {}, cs), srcAC = el('g', {}, cs);
        sym('M50 186 H110 M64 214 H96', srcDC, 'stroke-width:6');
        wire('M80 150 V186 M80 214 V250', srcDC);
        text(20, 180, '+', 'sb-lbl-b', srcDC);
        el('circle', { cx: 80, cy: 200, r: 50, class: 'sb-body' }, srcAC);
        sym('M56 200 q12 -30 24 0 q12 30 24 0', srcAC);
        text(150, 210, '24 V', 'sb-lbl', cs);
        var devs = {};
        devs.MOSFET = el('g', {}, cs);
        sym('M372 176 V224', devs.MOSFET, 'stroke-width:5');
        sym('M388 174 V188 M388 193 V207 M388 212 V226', devs.MOSFET, 'stroke-width:5');
        wire('M388 181 H400 V150 M388 219 H400 V250 M400 200 V219', devs.MOSFET);
        el('path', { d: 'M390 200 l16 -8 v16 z', class: 'sb-arrow' }, devs.MOSFET);
        wire('M300 236 H372 V224', devs.MOSFET);
        text(414, 170, 'D', 'sb-lbl', devs.MOSFET); text(414, 248, 'S', 'sb-lbl', devs.MOSFET);
        devs.SCR = el('g', {}, cs);
        wire('M400 150 V176 M400 214 V250', devs.SCR);
        el('path', { d: 'M376 176 H424 L400 214 Z', class: 'sb-body' }, devs.SCR);
        sym('M376 176 H424 L400 214 Z M376 214 H424', devs.SCR);
        wire('M408 214 L384 236 H300', devs.SCR);
        text(430, 170, 'A', 'sb-lbl', devs.SCR); text(430, 248, 'K', 'sb-lbl', devs.SCR);
        devs.TRIAC = el('g', {}, cs);
        wire('M400 150 V176 M400 224 V250', devs.TRIAC);
        sym('M372 176 H428 M372 224 H428 M376 178 H398 L387 222 Z M402 222 H424 L413 178 Z', devs.TRIAC);
        wire('M376 224 L364 236 H300', devs.TRIAC);
        text(436, 170, 'MT2', 'sb-lbl', devs.TRIAC); text(436, 248, 'MT1', 'sb-lbl', devs.TRIAC);
        var gateDot = el('circle', { cx: 300, cy: 236, r: 10, class: 'sc-gatedot' }, cs);
        text(286, 244, 'gate', 'sb-lbl', cs, 'end');
        var loopW = el('path', { d: 'M80 150 V60 H206 M274 60 H400 V150 M400 250 V340 H80 V250', class: 'sb-w sc-loop' }, cs);
        // scope
        var X0 = 40, X1 = 880, W = 4;
        function sx(age) { return X1 - (X1 - X0) * age / W; }
        var YV = 100, YG = 240, YI = 362, KV = 1.75, KI = 1.75;
        [[YV, 'Source voltage', 'var(--warn)', 26], [YG, 'Gate', 'var(--glow)', 196], [YI, 'Lamp current', 'var(--result)', 286]].forEach(function (r) {
            el('line', { x1: X0, y1: r[0], x2: X1, y2: r[0], class: 'sc-axis' }, sc);
            el('text', { x: X0, y: r[3], class: 'sc-tick', style: 'fill:' + r[2] }, sc).textContent = r[1];
        });
        el('text', { x: X1, y: 26, class: 'sc-tick', 'text-anchor': 'end' }, sc).textContent = 'now →';
        var pV = el('path', { class: 'sc-volt' }, sc), pG = el('path', { class: 'sc-gate' }, sc), pI = el('path', { class: 'sc-out' }, sc);
        function vSrc(tt) {
            if (brkT > 0) return 0;
            return src === 'DC' ? 24 : 34 * Math.sin(2 * Math.PI * tt);
        }
        function step(dt) {
            t += dt;
            if (pulseT > 0) pulseT = Math.max(0, pulseT - dt);
            if (brkT > 0) brkT = Math.max(0, brkT - dt);
            var v = vSrc(t), gOn = hold || pulseT > 0, i = 0;
            if (dev === 'MOSFET') {
                on = gOn;
                i = gOn ? v : (v < -0.7 ? v + 0.7 : 0);
            } else {
                if (on && (dev === 'SCR' ? v <= 0.3 : (Math.abs(v) <= 0.3 || Math.sign(v) !== onSign))) on = false;
                if (!on && gOn && (dev === 'SCR' ? v > 1 : Math.abs(v) > 1)) { on = true; onSign = Math.sign(v); everOn = true; }
                i = on ? v : 0;
            }
            if (gOn) trig = true;
            hist.push({ t: t, v: v, g: gOn ? 1 : 0, i: i });
            while (hist.length && t - hist[0].t > W + 0.1) hist.shift();
        }
        function draw() {
            var dv = [], dg = [], di = [];
            hist.forEach(function (h) {
                var x = sx(t - h.t); if (x < X0) return;
                dv.push(x.toFixed(1) + ' ' + (YV - h.v * KV).toFixed(1));
                dg.push(x.toFixed(1) + ' ' + (YG - h.g * 30).toFixed(1));
                di.push(x.toFixed(1) + ' ' + (YI - h.i * KI).toFixed(1));
            });
            pV.setAttribute('d', dv.length > 1 ? 'M' + dv.join(' L') : '');
            pG.setAttribute('d', dg.length > 1 ? 'M' + dg.join(' L') : '');
            pI.setAttribute('d', di.length > 1 ? 'M' + di.join(' L') : '');
            var p = 0, n = 0;
            hist.forEach(function (h) { if (t - h.t <= 1) { p += h.i * h.i; n++; } });
            var b = n ? Math.min(1, p / n / 576) : 0;
            lampG.style.opacity = (b * 0.75).toFixed(3);
            var last = hist.length ? hist[hist.length - 1] : null;
            loopW.classList.toggle('lit', !!last && Math.abs(last.i) > 0.5);
            gateDot.classList.toggle('on', hold || pulseT > 0);
            Object.keys(devs).forEach(function (k) { devs[k].style.display = k === dev ? '' : 'none'; });
            srcDC.style.display = src === 'DC' ? '' : 'none'; srcAC.style.display = src === 'AC' ? '' : 'none';
            root.querySelectorAll('[data-dev]').forEach(function (bt) { bt.setAttribute('aria-pressed', bt.dataset.dev === dev ? 'true' : 'false'); });
            root.querySelectorAll('[data-src]').forEach(function (bt) { bt.setAttribute('aria-pressed', bt.dataset.src === src ? 'true' : 'false'); });
            var hb = q('hold'); hb.setAttribute('aria-pressed', hold ? 'true' : 'false'); hb.textContent = hold ? 'Gate held on' : 'Hold gate on';
            q('lamp').textContent = 'Lamp ' + Math.round(b * 100) + '%';
            feedback();
        }
        var lastMsg = '';
        function feedback() {
            var m;
            if (!trig && !(dev === 'MOSFET' && src === 'AC' && t > 0.5)) m = 'Pulse the gate or hold it on, and watch the lamp current. Time is slowed 60 times, so one AC cycle takes a second.';
            else if (dev === 'MOSFET' && src === 'DC') m = '<b>MOSFET on DC:</b> the lamp is on only while the gate is on. A MOSFET <b>follows its gate</b>, so it can switch a DC load on and off, and fast.';
            else if (dev === 'MOSFET') m = '<b>MOSFET on AC:</b> even with the gate off, current flows on every <b>negative half</b>. A diode built into the MOSFET conducts backward, so one MOSFET cannot block AC.';
            else if (src === 'DC') m = '<b>' + dev + ' on DC:</b> one gate pulse <b>latches</b> it on, and it stays on after the gate lets go, like a seal-in contact. DC never falls to zero, so only breaking the circuit turns it off.';
            else if (dev === 'SCR') m = '<b>SCR on AC:</b> it conducts only on the <b>positive half</b> after a gate signal, and turns off by itself at each zero crossing. Holding the gate gives half the power.';
            else m = '<b>TRIAC on AC:</b> it conducts on <b>both halves</b> and turns off at each zero crossing, so each half needs a new gate signal. This is how solid-state relays and lamp dimmers switch AC.';
            if (m !== lastMsg) { q('feedback').innerHTML = m; lastMsg = m; }
        }
        function tick(dt) { step(dt); draw(); }
        function setDev(d) { dev = d; on = false; trig = false; hold = false; draw(); }
        root.querySelectorAll('[data-dev]').forEach(function (bt) { bt.addEventListener('click', function () { setDev(bt.dataset.dev); }); });
        root.querySelectorAll('[data-src]').forEach(function (bt) { bt.addEventListener('click', function () { src = bt.dataset.src; on = false; trig = false; draw(); }); });
        q('pulse').addEventListener('click', function () { pulseT = 0.08; trig = true; });
        q('hold').addEventListener('click', function () { hold = !hold; if (hold) trig = true; draw(); });
        q('break').addEventListener('click', function () { brkT = 0.15; });
        var pager = root.querySelector('.task-pager'); if (pager) initTaskPager(pager);
        function reset() {
            dev = 'MOSFET'; src = 'DC'; hold = false; pulseT = 0; brkT = 0; on = false; trig = false; t = 0; hist = [];
            for (var k = 0; k < 240; k++) step(1 / 60);
            trig = false; draw();
        }
        reset();
        return { root: root, tick: tick, reset: reset };
    }


    /* ─── Inside the 555 (Day 10) ────────────────────────────
       An astable 555 drawn as blocks: the voltage divider, two
       comparators, the flip-flop, the output stage, and the
       discharge transistor, beside a capacitor gauge. R1 = 10 kOhm,
       C = 100 uF, R2 = 10 or 47 kOhm, in real time:
         charging    dVc/dt = (5 - Vc) / ((R1 + R2) C), output on
         discharging dVc/dt = -Vc / (R2 C), output off
       At 2/3 of 5 V the upper comparator resets the flip-flop; at
       1/3 the lower comparator sets it. On time 0.693 (R1 + R2) C,
       off time 0.693 R2 C. A toggle swaps each block's "what it
       does" text for "what it is made of".
       ───────────────────────────────────────────────────── */
    function buildTimer555(root) {
        function q(r) { return root.querySelector('[data-role="' + r + '"]'); }
        var svg = q('blocks'), sc = q('scope');
        var R1 = 10000, C = 100e-6, R2 = 10000, VCC = 5, vc = 0, Q = 1, t = 0, hist = [], view = 'does', flashU = 0, flashL = 0;
        var blocks = {};
        function block(key, x, y, w, h, title, does, made) {
            var g = el('g', { class: 't5-blk' }, svg);
            el('rect', { x: x, y: y, width: w, height: h, rx: 12 }, g);
            text(x + w / 2, y + 36, title, 't5-title', g, 'middle');
            var l1 = text(x + w / 2, y + 68, '', 't5-sub', g, 'middle'), l2 = text(x + w / 2, y + 96, '', 't5-sub', g, 'middle');
            blocks[key] = { g: g, l1: l1, l2: l2, does: does, made: made };
            return g;
        }
        function arrow(d, cls) { var p = el('path', { d: d, class: 't5-arrow ' + (cls || '') }, svg); return p; }
        // capacitor gauge
        text(75, 28, '+5 V', 't5-sub', svg, 'middle');
        arrow('M75 40 V96', 't5-chg');
        el('path', { d: 'M75 104 l-10 -16 h20 z', class: 't5-head t5-chg-h' }, svg);
        el('rect', { x: 40, y: 110, width: 70, height: 300, rx: 8, class: 't5-gauge' }, svg);
        var fill = el('rect', { x: 44, y: 406, width: 62, height: 0, rx: 5, class: 't5-fill' }, svg);
        [[2 / 3, '2/3'], [1 / 3, '1/3']].forEach(function (m) {
            var y = 410 - 300 * m[0];
            el('line', { x1: 36, y1: y, x2: 114, y2: y, class: 't5-mark' }, svg);
            text(122, y + 8, m[1], 't5-sub', svg);
        });
        text(75, 444, 'capacitor', 't5-sub', svg, 'middle');
        block('upper', 190, 30, 270, 110, 'Upper comparator', ['Is the capacitor', 'above 2/3? Reset.'], ['Transistors in the', 'active region']);
        block('divider', 190, 195, 270, 110, 'Voltage divider', ['Makes the 1/3 and', '2/3 reference'], ['Three equal', 'resistors in series']);
        block('lower', 190, 360, 270, 110, 'Lower comparator', ['Is the capacitor', 'below 1/3? Set.'], ['Transistors in the', 'active region']);
        block('ff', 522, 160, 186, 180, 'Flip-flop', ['Remembers', 'set or reset'], ['NOR gates', 'in a loop']);
        var ffState = text(615, 320, '', 't5-state', svg, 'middle');
        block('out', 724, 30, 212, 110, 'Output', ['Drives the LED', 'on or off'], ['A transistor', 'driver']);
        block('dis', 724, 360, 212, 110, 'Discharge', ['Empties the', 'capacitor'], ['An NPN switch', 'to ground']);
        arrow('M110 85 H190'); arrow('M110 415 H190');
        arrow('M325 195 V140'); arrow('M325 305 V360');
        var aU = arrow('M460 85 H492 V200 H522'), aL = arrow('M460 415 H492 V300 H522');
        text(470, 64, 'reset', 't5-sub', svg); text(470, 460, 'set', 't5-sub', svg);
        var aO = arrow('M708 200 H716 V85 H724'), aD = arrow('M708 300 H716 V415 H724');
        var aDis = el('path', { d: 'M830 470 V486 H75 V410', class: 't5-dis' }, svg);
        wire('M830 140 V170', svg);
        var ledGlow = el('circle', { cx: 830, cy: 196, r: 34, class: 't5-ledglow' }, svg);
        var ledBody = el('path', { d: 'M810 176 H850 L830 212 Z', class: 't5-led' }, svg);
        sym('M810 214 H850', svg);
        // scope
        var X0 = 16, X1 = 396, W = 8;
        function yv(v) { return 150 - v * 24; }
        el('line', { x1: X0, y1: yv(0), x2: X1, y2: yv(0), class: 'sc-axis' }, sc);
        [[VCC * 2 / 3, '2/3'], [VCC / 3, '1/3']].forEach(function (m) {
            el('line', { x1: X0, y1: yv(m[0]), x2: X1, y2: yv(m[0]), class: 'sc-mark' }, sc);
            el('text', { x: X1 + 6, y: yv(m[0]) + 8, class: 'sc-tick' }, sc).textContent = m[1];
        });
        el('text', { x: X0, y: 24, class: 'sc-tick', style: 'fill:var(--warn)' }, sc).textContent = 'Capacitor voltage';
        el('line', { x1: X0, y1: 232, x2: X1, y2: 232, class: 'sc-axis' }, sc);
        el('text', { x: X0, y: 184, class: 'sc-tick', style: 'fill:var(--glow)' }, sc).textContent = 'Output';
        var pV = el('path', { class: 'sc-volt' }, sc), pO = el('path', { class: 't5-outtr' }, sc);
        function step(dt) {
            t += dt;
            if (Q) vc += (VCC - vc) / ((R1 + R2) * C) * dt; else vc -= vc / (R2 * C) * dt;
            if (Q && vc >= VCC * 2 / 3) { Q = 0; flashU = 0.4; }
            else if (!Q && vc <= VCC / 3) { Q = 1; flashL = 0.4; }
            if (flashU > 0) flashU -= dt;
            if (flashL > 0) flashL -= dt;
            hist.push({ t: t, v: vc, q: Q });
            while (hist.length && t - hist[0].t > W + 0.1) hist.shift();
        }
        function draw() {
            fill.setAttribute('height', (300 * vc / VCC - 8 > 0 ? 300 * vc / VCC - 8 : 0).toFixed(1));
            fill.setAttribute('y', (406 - Math.max(0, 300 * vc / VCC - 8)).toFixed(1));
            Object.keys(blocks).forEach(function (k) {
                var b = blocks[k], lines = view === 'does' ? b.does : b.made;
                b.l1.textContent = lines[0]; b.l2.textContent = lines[1] || '';
            });
            blocks.upper.g.classList.toggle('on', flashU > 0);
            blocks.lower.g.classList.toggle('on', flashL > 0);
            blocks.ff.g.classList.toggle('on', true);
            blocks.out.g.classList.toggle('on', !!Q);
            blocks.dis.g.classList.toggle('on', !Q);
            aU.classList.toggle('on', flashU > 0); aL.classList.toggle('on', flashL > 0);
            aO.classList.toggle('on', !!Q); aD.classList.toggle('on', !Q);
            aDis.classList.toggle('on', !Q);
            root.classList.toggle('t5-charging', !!Q);
            ffState.textContent = Q ? 'SET' : 'RESET';
            ledGlow.style.opacity = Q ? 0.35 : 0;
            ledBody.style.fill = Q ? '#ff6b5e' : '';
            var dv = [], dq = [];
            hist.forEach(function (h) {
                var x = X1 - (X1 - X0) * (t - h.t) / W; if (x < X0) return;
                dv.push(x.toFixed(1) + ' ' + yv(h.v).toFixed(1));
                dq.push(x.toFixed(1) + ' ' + (h.q ? 196 : 232));
            });
            pV.setAttribute('d', dv.length > 1 ? 'M' + dv.join(' L') : '');
            pO.setAttribute('d', dq.length > 1 ? 'M' + dq.join(' L') : '');
            root.querySelectorAll('[data-view]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.view === view ? 'true' : 'false'); });
            root.querySelectorAll('[data-r2]').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.r2 === R2 ? 'true' : 'false'); });
            q('ton').textContent = (0.693 * (R1 + R2) * C).toFixed(1) + ' s';
            q('toff').textContent = (0.693 * R2 * C).toFixed(1) + ' s';
            q('vc').textContent = vc.toFixed(2) + ' V';
            var fb = q('feedback'), m = Q
                ? '<b>Charging:</b> the flip-flop is set, so the output is on and the discharge transistor is off. The capacitor charges through the timing resistors. At <b>2/3</b> of 5 V the upper comparator resets the flip-flop.'
                : '<b>Discharging:</b> the flip-flop is reset, so the output is off and the discharge transistor empties the capacitor through a timing resistor. At <b>1/3</b> of 5 V the lower comparator sets the flip-flop again.';
            if (fb.innerHTML !== m) fb.innerHTML = m;
        }
        function tick(dt) { var n = Math.ceil(dt / 0.005); for (var i = 0; i < n; i++) step(dt / n); draw(); }
        root.querySelectorAll('[data-view]').forEach(function (b) { b.addEventListener('click', function () { view = b.dataset.view; draw(); }); });
        root.querySelectorAll('[data-r2]').forEach(function (b) { b.addEventListener('click', function () { R2 = +b.dataset.r2; draw(); }); });
        q('restart').addEventListener('click', function () { vc = 0; Q = 1; t = 0; hist = []; draw(); });
        var pager = root.querySelector('.task-pager'); if (pager) initTaskPager(pager);
        function reset() { vc = 0; Q = 1; t = 0; hist = []; R2 = 10000; view = 'does'; flashU = flashL = 0; draw(); }
        reset();
        return { root: root, tick: tick, reset: reset };
    }

    /* ─── Alarm: Gates and Ladder (Day 10) ───────────────────
       Alarm = Armed AND (NOT DoorClosed OR NOT WindowClosed), drawn
       as logic gates and as a ladder rung at the same time: an NO
       Armed contact in series with NC Door and NC Window contacts
       in parallel. "Add a motion sensor" adds a second OR gate and
       new wires on the gate side, and one more parallel contact on
       the ladder side. "Cut the door wire" makes the door input
       read open whatever the door does (fail-safe wiring).
       ───────────────────────────────────────────────────── */
    function buildAlarmLadder(root) {
        function q(r) { return root.querySelector('[data-role="' + r + '"]'); }
        var gs = q('gates'), ls = q('ladder');
        var s = { armed: 0, door: 1, win: 1, motion: 0, addM: false, cut: false };
        function W(d, parent, cls) { return el('path', { d: d, class: 'sb-w ' + (cls || '') }, parent); }
        // gates
        var gw = {};
        [['Armed', 70], ['Door closed', 160], ['Window closed', 240]].forEach(function (r) { text(6, r[1] + 10, r[0], 'sb-lbl', gs); });
        var motLbl = text(6, 340, 'Motion', 'sb-lbl', gs);
        gw.armed = W('M250 70 H560 V75 H585', gs);
        gw.door = W('M250 160 H280', gs); gw.doorN = W('M336 160 H360 V175 H388', gs);
        gw.win = W('M250 240 H280', gs); gw.winN = W('M336 240 H360 V225 H388', gs);
        gateSymbol(gs, 'NOT', 280, 140, 54, 40);
        gateSymbol(gs, 'NOT', 280, 220, 54, 40);
        gateSymbol(gs, 'OR', 380, 150, 80, 100);
        var or1Direct = W('M460 200 H540 V115 H585', gs);
        var mG = el('g', {}, gs);
        var or1ToOr2 = W('M460 200 H486', mG);
        gw.mot = W('M250 330 H460 V280 H486', mG);
        gateSymbol(mG, 'OR', 480, 190, 80, 110);
        var or2Out = W('M560 245 H570 V115 H585', mG);
        gateSymbol(gs, 'AND', 580, 50, 90, 90);
        gw.and = W('M670 95 H700', gs);
        var gLamp = el('circle', { cx: 724, cy: 95, r: 22, class: 'gb-out' }, gs);
        var cutG = el('path', { d: 'M256 146 l20 28 M276 146 l-20 28', class: 'al-cut' }, gs);
        var dots = {};
        ['armed', 'door', 'win', 'motion'].forEach(function (k, i) {
            dots[k] = el('circle', { cx: 250, cy: [70, 160, 240, 330][i], r: 8, class: 'al-dot' }, gs);
        });
        // ladder
        W('M30 40 V370 M730 40 V370', ls, 'al-rail');
        function contact(x, y, nc, label) {
            var g = el('g', { class: 'al-ct' }, ls);
            el('rect', { x: x + 8, y: y - 8, width: 28, height: 16, class: 'al-bridge' }, g);
            sym('M' + x + ' ' + (y - 22) + ' V' + (y + 22) + ' M' + (x + 44) + ' ' + (y - 22) + ' V' + (y + 22), g);
            if (nc) sym('M' + (x - 6) + ' ' + (y + 24) + ' L' + (x + 50) + ' ' + (y - 24), g);
            text(x + 22, y - 34, label, 'sb-lbl', g, 'middle');
            return g;
        }
        var lw = {};
        lw.a = W('M30 110 H80', ls, 'lit');
        var cA = contact(80, 110, false, 'Armed');
        lw.b = W('M124 110 H280 M150 110 V215 H280', ls);
        var lwBM = W('M150 215 V320 H280', ls);
        var cD = contact(280, 110, true, 'Door closed');
        var cW = contact(280, 215, true, 'Window closed');
        var cM = contact(280, 320, false, 'Motion');
        lw.d = W('M324 110 H440', ls);
        lw.w = W('M324 215 H440 V110', ls);
        lw.m = W('M324 320 H440 V215', ls);
        lw.o = W('M440 110 H536 M584 110 H730', ls);
        var coil = el('circle', { cx: 560, cy: 110, r: 24, class: 'al-coil' }, ls);
        text(560, 172, 'Alarm', 'sb-lbl', ls, 'middle');
        function draw() {
            var doorIn = s.cut ? 0 : s.door;
            var nd = 1 - doorIn, nw = 1 - s.win, or1 = nd || nw, mot = s.addM && s.motion;
            var alarm = s.armed && (or1 || mot) ? 1 : 0;
            gw.armed.classList.toggle('lit', !!s.armed);
            gw.door.classList.toggle('lit', !!doorIn); gw.doorN.classList.toggle('lit', !!nd);
            gw.win.classList.toggle('lit', !!s.win); gw.winN.classList.toggle('lit', !!nw);
            or1Direct.style.display = s.addM ? 'none' : ''; mG.style.display = s.addM ? '' : 'none';
            motLbl.style.display = s.addM ? '' : 'none'; dots.motion.style.display = s.addM ? '' : 'none';
            or1Direct.classList.toggle('lit', !!or1); or1ToOr2.classList.toggle('lit', !!or1);
            gw.mot.classList.toggle('lit', !!mot); or2Out.classList.toggle('lit', !!(or1 || mot));
            gw.and.classList.toggle('lit', !!alarm); gLamp.classList.toggle('on', !!alarm);
            cutG.style.display = s.cut ? '' : 'none';
            dots.armed.classList.toggle('on', !!s.armed); dots.door.classList.toggle('on', !!doorIn);
            dots.win.classList.toggle('on', !!s.win); dots.motion.classList.toggle('on', !!s.motion);
            // ladder
            cA.classList.toggle('pass', !!s.armed); cD.classList.toggle('pass', !!nd); cW.classList.toggle('pass', !!nw); cM.classList.toggle('pass', !!mot);
            cM.style.display = s.addM ? '' : 'none'; lwBM.style.display = s.addM ? '' : 'none'; lw.m.style.display = s.addM ? '' : 'none';
            lw.b.classList.toggle('lit', !!s.armed); lwBM.classList.toggle('lit', !!s.armed);
            lw.d.classList.toggle('lit', !!(s.armed && nd)); lw.w.classList.toggle('lit', !!(s.armed && nw)); lw.m.classList.toggle('lit', !!(s.armed && mot));
            lw.o.classList.toggle('lit', !!alarm); coil.classList.toggle('on', !!alarm);
            // controls
            [['armed', 'Armed', 'Disarmed'], ['door', 'Door closed', 'Door open'], ['win', 'Window closed', 'Window open'], ['motion', 'Motion', 'No motion']].forEach(function (c) {
                var b = root.querySelector('[data-in="' + c[0] + '"]');
                b.setAttribute('aria-pressed', s[c[0]] ? 'true' : 'false'); b.textContent = s[c[0]] ? c[1] : c[2];
            });
            root.querySelector('[data-in="motion"]').style.visibility = s.addM ? '' : 'hidden';
            q('add').setAttribute('aria-pressed', s.addM ? 'true' : 'false');
            q('cut').setAttribute('aria-pressed', s.cut ? 'true' : 'false');
            q('cut').textContent = s.cut ? 'Repair the door wire' : 'Cut the door wire';
            var chip = q('alarm'); chip.textContent = alarm ? 'ALARM' : 'Quiet'; chip.className = 'status-chip ' + (alarm ? 'bad' : 'ok');
            var fb = q('feedback'), m;
            if (s.cut) m = '<b>Cut wire:</b> the door input now reads <b>open</b> even with the door shut, so the armed alarm sounds. The sensors report &quot;closed&quot; on purpose: a broken wire looks like an open door, so a fault can never hide a break-in.';
            else if (s.addM) m = '<b>Motion sensor added.</b> The gate circuit needed a <b>second OR gate</b> and new wires. The ladder needed <b>one more contact</b> in parallel, which on a PLC is a change to the program.';
            else if (alarm) m = '<b>Alarm:</b> armed, and the ' + (nd && nw ? 'door and window are' : nd ? 'door is' : 'window is') + ' open. In the rung, the Armed contact is closed and a normally closed contact passes because its input is off.';
            else m = 'Series contacts act like <b>AND</b>, parallel contacts act like <b>OR</b>, and a normally closed contact acts like <b>NOT</b>: it passes current when its input is off.';
            if (fb.innerHTML !== m) fb.innerHTML = m;
        }
        root.querySelectorAll('[data-in]').forEach(function (b) { b.addEventListener('click', function () { s[b.dataset.in] = s[b.dataset.in] ? 0 : 1; draw(); }); });
        q('add').addEventListener('click', function () { s.addM = !s.addM; if (!s.addM) s.motion = 0; draw(); });
        q('cut').addEventListener('click', function () { s.cut = !s.cut; draw(); });
        function reset() { s = { armed: 0, door: 1, win: 1, motion: 0, addM: false, cut: false }; draw(); }
        reset();
        return { root: root, reset: reset };
    }

    /* ─── Sourcing and Sinking Sensors (Day 10) ──────────────
       A three-wire 24 V sensor (brown +24 V, blue 0 V, black signal)
       with a PNP output (switches the signal to +24 V: sourcing) or
       an NPN output (switches it to 0 V: sinking), wired to a PLC
       input drawn as an LED and resistor whose common goes to 0 V
       (it accepts a sourcing sensor) or to +24 V (it accepts a
       sinking sensor). Current flows only when the sensor and input
       match and the target is present. Signal readings:
         PNP on 23.8 V; NPN on 0.1 V; an off output floats to the
         input's common (0 V or about 24 V).
       ───────────────────────────────────────────────────── */
    function buildSensorMatch(root) {
        function q(r) { return root.querySelector('[data-role="' + r + '"]'); }
        var svg = q('circuit');
        var s = { type: 'PNP', com: '0', target: false };
        function W(d, cls) { return el('path', { d: d, class: 'sb-w ' + (cls || '') }, svg); }
        // rails
        var rails = [W('M150 40 H720'), W('M150 440 H720')];
        text(720, 30, '+24 V', 'sb-lbl-b', svg, 'end'); text(720, 478, '0 V', 'sb-lbl-b', svg, 'end');
        // target and sensor body
        var tgt = el('rect', { x: 14, y: 196, width: 50, height: 90, rx: 6, class: 'sm-target' }, svg);
        text(39, 316, 'steel', 'sm-small', svg, 'middle');
        el('rect', { x: 80, y: 80, width: 300, height: 320, rx: 16, class: 'sm-body' }, svg);
        var name = text(262, 70, 'PNP sensor', 'sb-lbl-b', svg, 'middle');
        var det = el('g', { class: 'sm-det' }, svg);
        el('rect', { x: 96, y: 200, width: 100, height: 80, rx: 8 }, det);
        text(146, 248, 'detect', 'sm-small', det, 'middle');
        var ind = el('circle', { cx: 120, cy: 370, r: 10, class: 'sm-ind' }, svg);
        // PNP: emitter up to brown, collector down to signal; NPN: collector up to signal, emitter down to blue
        var gP = el('g', {}, svg), gN = el('g', {}, svg);
        var qP = el('g', { class: 'gb-q' }, gP); transistor(300, 180, true, qP);
        var wPe = W('M320 138 V96 H150'); gP.appendChild(wPe);
        el('circle', { cx: 150, cy: 96, r: 7, class: 'sm-node' }, gP);
        var wPc = W('M320 222 V240'); gP.appendChild(wPc);
        var bP = el('path', { d: 'M196 220 H226 V180 H277', class: 'sm-base' }, gP);
        var qN = el('g', { class: 'gb-q' }, gN); transistor(300, 300, false, qN);
        var wNc = W('M320 258 V240'); gN.appendChild(wNc);
        var wNe = W('M320 342 V384 H150'); gN.appendChild(wNe);
        el('circle', { cx: 150, cy: 384, r: 7, class: 'sm-node' }, gN);
        var bN = el('path', { d: 'M196 260 H226 V300 H277', class: 'sm-base' }, gN);
        var wBr = W('M150 40 V200', 'sm-brown'), wBl = W('M150 280 V440', 'sm-blue');
        var wSig = W('M320 240 H520');
        text(430, 226, 'signal', 'sm-small', svg, 'middle');
        text(140, 66, 'brown', 'sm-small', svg, 'end'); text(140, 426, 'blue', 'sm-small', svg, 'end');
        // PLC input
        el('rect', { x: 480, y: 70, width: 180, height: 340, rx: 16, class: 'sm-plc' }, svg);
        text(530, 120, 'PLC', 'sb-lbl-b', svg, 'middle'); text(530, 154, 'input', 'sb-lbl-b', svg, 'middle');
        var gDown = el('g', {}, svg), gUp = el('g', {}, svg);
        // common to 0 V: signal -> R -> LED -> 0 V
        var dW1 = W('M520 240 H620 V262 M620 320 V336 M620 376 V440'); gDown.appendChild(dW1);
        el('circle', { cx: 620, cy: 440, r: 7, class: 'sm-node' }, gDown);
        resV(620, 262, 320, gDown);
        var dGlow = el('circle', { cx: 620, cy: 356, r: 32, class: 'sm-glow' }, gDown);
        var dLed = el('path', { d: 'M598 336 H642 L620 376 Z', class: 'sm-led' }, gDown); sym('M598 376 H642', gDown);
        text(602, 428, 'COM', 'sm-small', gDown, 'end');
        // common to +24 V: +24 V -> LED -> R -> signal
        var uW1 = W('M620 40 V104 M620 144 V160 M620 218 V240 H520'); gUp.appendChild(uW1);
        el('circle', { cx: 620, cy: 40, r: 7, class: 'sm-node' }, gUp);
        var uGlow = el('circle', { cx: 620, cy: 124, r: 32, class: 'sm-glow' }, gUp);
        var uLed = el('path', { d: 'M598 104 H642 L620 144 Z', class: 'sm-led' }, gUp); sym('M598 144 H642', gUp);
        resV(620, 160, 218, gUp);
        text(602, 66, 'COM', 'sm-small', gUp, 'end');
        function draw() {
            var on = s.target, pnp = s.type === 'PNP', match = (pnp && s.com === '0') || (!pnp && s.com === '24');
            var cur = on && match;
            var v = pnp ? (on ? 23.8 : (s.com === '0' ? 0 : 23.9)) : (on ? 0.1 : (s.com === '24' ? 23.9 : 0));
            tgt.style.opacity = on ? 1 : 0.15;
            ind.classList.toggle('on', on);
            det.classList.toggle('on', on);
            name.textContent = s.type + ' sensor';
            gP.style.display = pnp ? '' : 'none'; gN.style.display = pnp ? 'none' : '';
            qP.classList.toggle('on', on); qN.classList.toggle('on', on);
            bP.classList.toggle('on', on); bN.classList.toggle('on', on);
            gDown.style.display = s.com === '0' ? '' : 'none'; gUp.style.display = s.com === '24' ? '' : 'none';
            [wPe, wPc, wNc, wNe, wSig, dW1, uW1, wBr, wBl].concat(rails).forEach(function (w) { w.classList.toggle('lit', cur); });
            [dGlow, uGlow].forEach(function (g) { g.style.opacity = cur ? 0.35 : 0; });
            [dLed, uLed].forEach(function (l) { l.style.fill = cur ? '#ff6b5e' : ''; });
            root.querySelectorAll('[data-type]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.type === s.type ? 'true' : 'false'); });
            root.querySelectorAll('[data-com]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.com === s.com ? 'true' : 'false'); });
            var tb = q('target'); tb.setAttribute('aria-pressed', on ? 'true' : 'false'); tb.textContent = on ? 'Target present' : 'No target';
            q('vsig').textContent = v.toFixed(1) + ' V';
            var chip = q('input'); chip.textContent = cur ? 'Input ON' : 'Input off'; chip.className = 'status-chip ' + (cur ? 'busy' : '');
            var fb = q('feedback'), m, cls = '';
            if (!match) {
                cls = 'caution';
                m = pnp
                    ? '<b>Mismatch.</b> The PNP sensor <b>sources</b>: it connects the signal to +24 V. This input&#39;s common is also +24 V, so both ends of the input sit at 24 V and no current can flow. The input never sees the target, though the sensor&#39;s own light comes on.'
                    : '<b>Mismatch.</b> The NPN sensor <b>sinks</b>: it connects the signal to 0 V. This input&#39;s common is also 0 V, so both ends of the input sit at 0 V and no current can flow. The input never sees the target, though the sensor&#39;s own light comes on.';
            } else if (!on) m = 'A matched pair. Bring the <b>target</b> up to the sensor and watch the signal wire and the input.';
            else m = pnp
                ? '<b>Sourcing:</b> the PNP output connects the signal to <b>+24 V</b>, like the Day 5 2N3906 high-side switch. Current flows out of the sensor, through the input, to 0 V.'
                : '<b>Sinking:</b> the NPN output connects the signal to <b>0 V</b>, like the Day 5 2N3904 low-side switch. Current flows from +24 V, through the input, into the sensor.';
            fb.innerHTML = m; fb.className = 'sim-feedback ' + cls;
        }
        root.querySelectorAll('[data-type]').forEach(function (b) { b.addEventListener('click', function () { s.type = b.dataset.type; draw(); }); });
        root.querySelectorAll('[data-com]').forEach(function (b) { b.addEventListener('click', function () { s.com = b.dataset.com; draw(); }); });
        q('target').addEventListener('click', function () { s.target = !s.target; draw(); });
        function reset() { s = { type: 'PNP', com: '0', target: false }; draw(); }
        reset();
        return { root: root, reset: reset };
    }

    global.SiliconSims = {
        el: el,
        buildDopingLab: buildDopingLab,
        buildDiodeBench: buildDiodeBench,
        buildRectifierLab: buildRectifierLab,
        buildFlyback: buildFlyback,
        buildServiceCall: buildServiceCall,
        buildSwitchBench: buildSwitchBench,
        buildRegionExplorer: buildRegionExplorer,
        buildMysteryDriver: buildMysteryDriver,
        buildGateBuilder: buildGateBuilder,
        buildTruthDetective: buildTruthDetective,
        initSlotBuilder: initSlotBuilder,
        initTaskPager: initTaskPager,
        startSimLoop: startSimLoop,
        drawWaferMap: drawWaferMap,
        drawWaferMaps: drawWaferMaps,
        buildMapQuiz: buildMapQuiz,
        buildInterfaceDriver: buildInterfaceDriver,
        buildSwitchCompare: buildSwitchCompare,
        buildTimer555: buildTimer555,
        buildAlarmLadder: buildAlarmLadder,
        buildSensorMatch: buildSensorMatch,
        zoomSvg: zoomSvg,
    };
})(window);
