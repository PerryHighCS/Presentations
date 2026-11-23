# Truth Table Detective: saved for the LogiKIT decks

Saved 2026-11-23. Built for AR2 Silicon in Control Day 7, then taken out of that deck because students
had not seen LogiKIT Lab 2 in about a year and no longer knew what its circuits were supposed to do.
The plan is to use it when the LogiKIT presentations are updated, where students will have just
built the Lab 2 circuits.

## Where the code lives

- Engine: `SiliconSims.buildTruthDetective(root)` in
  `Decks/AR2/Silicon in Control/semiconductor-sims.js` (still loaded by every Silicon in Control deck,
  so it keeps working). Helpers it uses in the same file: `gateSymbol`, `shuffle`, `shuffleChildren`,
  `tdEval`, `tdCombos`.
- Styles: the `.truth-detective` rules in `Decks/AR2/Silicon in Control/theme.css` (they also reuse
  the `.md-*` record and fix-select styles).
- Catalog entry: "Truth Table Detective" in `.agent/knowledge/html5-activities-index.md`.

To move it into a LogiKIT deck, copy `buildTruthDetective` and its helpers into that unit's script
(or load `semiconductor-sims.js` from it), copy the `.truth-detective` CSS, and paste the slide markup
below. Initialise it with:

```js
document.querySelectorAll('.truth-detective').forEach(function (r) {
    if (!r.closest('#storyboard')) SiliconSims.buildTruthDetective(r);
});
```

## Open item before release

A missing input wire reads as a 0 on the simulated board. Confirm what an unconnected LogiKIT input
actually reads on the classroom board.

## Related content that left Day 7 with it

- Objective: "Find a hidden fault by tracing gate LEDs."
- Exit ticket question: "On a LogiKIT board, the switches feed GATE1, GATE1 feeds GATE2, and GATE2
  feeds the output. GATE1's LED matches the schematic, but GATE2's LED does not. Where should you look
  first?" (answer: at GATE2, its module and the wires into it; distractors: the switches, GATE1's
  module, the output LED).
- Wrap-up card "Tracing faults": "Compare every gate LED with what the schematic predicts. The first
  gate that disagrees is where the fault is."
- Warm-up question: "In LogiKIT Lab 2, the car amplifier turned on when AUX or Bluetooth was selected,
  but not both. Which single gate has the same truth table?" (XOR).

## Slide markup (briefing slide and simulator slide)

```html
<!-- SLIDE 15 · HOW TRUTH TABLE DETECTIVE WORKS -->
<section>
  <div class="slide-inner">
    <span class="slide-tag">Troubleshooting · Truth Table Detective</span>
    <h2>Find the Gate That <span class="accent">Disagrees</span></h2>
    <p class="slide-intro">Each board is supposed to be a circuit from LogiKIT Lab 2, and each comes with the <strong>schematic</strong> and the <strong>truth table</strong> it should produce. One thing on the board does not match.</p>
    <div class="stage-row">
      <div class="step-card"><div class="sc-num">1</div><p class="sc-body"><strong>Set the switches.</strong> Each new input combination costs a minute.</p></div>
      <div class="step-card"><div class="sc-num">2</div><p class="sc-body"><strong>Trace.</strong> Work out what each gate&#39;s LED should show, then compare.</p></div>
      <div class="step-card"><div class="sc-num">3</div><p class="sc-body"><strong>Diagnose.</strong> Name the first gate that disagrees and the kind of fault.</p></div>
      <div class="step-card"><div class="sc-num">4</div><p class="sc-body"><strong>Prove it.</strong> Point to the reading where that gate disagrees.</p></div>
    </div>
    <div class="callout-warn fragment fade-up" style="margin-top:var(--gap-lg);">Read the LEDs; never <strong>force</strong> an output by jumpering it to 5 V or ground. That fights the gate&#39;s own output and can damage it.</div>
  </div>
</section>


<!-- SLIDE 16 · TRUTH TABLE DETECTIVE (SIMULATOR) -->
<section>
  <div class="slide-inner" style="justify-content:flex-start;padding-top:40px;">
    <span class="slide-tag">Troubleshooting · Truth Table Detective</span>
    <div class="truth-detective">
      <div class="td-grid">
        <div>
          <div class="lk-board">
            <svg data-role="board" viewBox="0 0 740 512" role="img" aria-label="A LogiKIT board: sixteen gate sockets in a 4 by 4 grid with modules in the sockets this circuit uses, an LED on each gate output, switches SW1 to SW6 along the bottom (click a switch to toggle it), and output LEDs L1 to L4."></svg>
          </div>
          <p class="td-note" data-role="board-note" aria-live="polite"></p>
        </div>
        <div class="td-right">
          <div class="td-head" data-role="title"></div>
          <p class="td-story" data-role="story"></p>
          <div class="ctl-row td-tabs">
            <span class="seg">
              <button class="seg-btn" data-tab="schem" aria-pressed="true">Schematic</button>
              <button class="seg-btn" data-tab="tt" aria-pressed="false">Truth table</button>
              <button class="seg-btn" data-tab="log" aria-pressed="false">Readings</button>
            </span>
          </div>
          <div class="sim-panel td-panel">
            <div data-role="schem-wrap"><svg data-role="schem" viewBox="0 0 612 290" role="img" aria-label="The schematic this board should match, with each gate labeled by its socket."></svg></div>
            <div data-role="side" aria-live="polite"></div>
          </div>
          <div class="budget"><span>Bench time</span><span class="budget-track"><span class="budget-fill" data-role="budget-bar" style="display:block;"></span></span><span data-role="budget-val"></span></div>
          <div data-role="act"></div>
        </div>
      </div>
    </div>
  </div>
</section>
```
