# CSP 6.2 Bug Hunt (saved, not in the deck)

The bug hunt was built for `Decks/CSP/Unit 6 - Lists, Loops, and Traversals/6.2 - Lists Investigate/6.2-lists-investigate.html`
and taken out on 2026-11-16 because the teacher will not be there to run it. It went right after the
Pair Maker slide (slide 12) and before the Data tab slide.

To restore it:

1. Paste the slides below into the deck after the Pair Maker slide, then run
   `python3 .agent/skills/vendor/syncdeck/scripts/validate-deck.py --renumber <deck>` and fix the
   `data-activity-instance-key` slide numbers to match.
2. Add the `bugB` entry below back into the deck's `TRACES` object.
3. Paste the plan section back into the 6.2 Teaching Plan of
   `Unit_6_Lists_Loops_Traversals_Lesson_Plan.md`, renumber the slides it names, and restore the
   sequence table row ("Bug hunt") and the related goal and big idea.
4. Restore the bug hunt mentions in the title slide text and the slide 5 notes if wanted.

## Slides

```html
    <!-- SLIDE NN · BUG REPORT -->
    <section>
      <div class="slide-inner" style="justify-content:flex-start;padding:40px 56px;max-width:none;">
        <span class="slide-tag">Bug Hunt</span>
        <h2 style="margin-bottom:16px;">A Bug in the Outfit Picker</h2>
        <div class="symptom">
          <p><i class="a">Bug report:</i> &ldquo;When the jacket (the last top) is showing and I click next, the picture goes <i class="a">blank</i>. When I click next again, the <i class="a">hoodie</i> comes back.&rdquo;</p>
        </div>
        <p style="margin-top:var(--gap-sm);">A teammate changed the click code, and three versions are going around. Each one is a <i class="a">suspect</i>. The list is <i class="n">tops = ["hoodie", "tee", "jacket"]</i>.</p>
        <div class="suspects" style="margin-top:var(--gap-sm);">
          <div class="suspect"><h3>Suspect A</h3><div class="code-card"><div class="code-body"><pre><code data-hl>index = index + 1;
if (index >= tops.length - 1) {
  index = 0;
}</code></pre></div></div></div>
          <div class="suspect"><h3>Suspect B</h3><div class="code-card"><div class="code-body"><pre><code data-hl>index = index + 1;
if (index > tops.length) {
  index = 0;
}</code></pre></div></div></div>
          <div class="suspect"><h3>Suspect C</h3><div class="code-card"><div class="code-body"><pre><code data-hl>if (index > tops.length - 1) {
  index = 0;
}
index = index + 1;</code></pre></div></div></div>
        </div>
      </div>
      <aside class="notes">Each suspect is followed by showing tops[index]. All three are plausible, and all three are wrong in some way, but only one matches this exact bug report. Do not let students just "eyeball" the answer; the next slide asks them to gather evidence by working through test cases.</aside>
    </section>

    <!-- SLIDE NN · RUN YOUR TESTS -->
    <section>
      <div class="slide-inner" style="justify-content:flex-start;padding-top:48px;">
        <span class="slide-tag">Bug Hunt</span>
        <h2>Gather Evidence</h2>
        <p style="max-width:1400px;">A <i class="a">test</i> is a starting value for <i class="n">index</i> plus one or two clicks. Work through a suspect by hand with your partner, and write down what the screen would show after each click.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px 28px;margin-top:var(--gap);">
          <div class="rule-card"><div class="rule-when">Choose tests carefully</div><p>You have about 6 minutes. Some starting values give the same result for every suspect, so they tell you nothing.</p></div>
          <div class="rule-card"><div class="rule-when">Rule out with evidence</div><p>Cross out a suspect only when one of your test results disagrees with the bug report.</p></div>
          <div class="rule-card"><div class="rule-when">A second click</div><p>Run the click code again, starting from the index the first click left behind.</p></div>
          <div class="rule-card"><div class="rule-when">Be ready to defend it</div><p>Know which test ruled out each suspect you crossed out.</p></div>
        </div>
      </div>
      <aside class="notes">Evidence key (tops has length 3). Starting at index 0 with one click, all three suspects show "tee", so that test is useless (a second click would rule out Suspect A). Starting at index 1, Suspect A shows "hoodie" (it wraps too early, so the jacket never appears), while B and C show "jacket"; that rules out A. Starting at index 2 with two clicks, B shows blank then "hoodie" (matches the report), while C shows blank then "tee"; that rules out C. Suspect B is the cause.</aside>
    </section>

    <!-- SLIDE NN · DIAGNOSE -->
    <section
      data-activity-id="resonance"
      data-activity-trigger="slide-enter"
      data-activity-instance-key="resonance:15:0"
      data-activity-options='{"questions":[{"id":"q1","type":"multiple-choice","text":"Which suspect causes the bug in the report: blank after the last top, then the hoodie on the next click?","order":0,"responseTimeLimitMs":60000,"options":[{"id":"q1a","text":"Suspect A: `index >= tops.length - 1`","isCorrect":false},{"id":"q1b","text":"Suspect B: `index > tops.length`","isCorrect":true},{"id":"q1c","text":"Suspect C: the check comes before `index = index + 1`","isCorrect":false},{"id":"q1d","text":"There is not enough evidence to tell","isCorrect":false}]},{"id":"q2","type":"multiple-choice","text":"What is the best fix for the cause you found?","order":1,"responseTimeLimitMs":60000,"options":[{"id":"q2a","text":"Add a fourth top to the list, so index 3 has a picture","isCorrect":false},{"id":"q2b","text":"Start `index` at 1 instead of 0","isCorrect":false},{"id":"q2c","text":"Change the condition to `index > tops.length + 1`","isCorrect":false},{"id":"q2d","text":"Change the condition to `index > tops.length - 1`","isCorrect":true}]},{"id":"q3","type":"free-response","text":"Which test (starting index and clicks) ruled out each of the other suspects? What did that test show?","order":2,"responseTimeLimitMs":120000}]}'>
      <div class="slide-inner">
        <span class="slide-tag">Bug Hunt</span>
        <h2>Diagnose and Fix</h2>
        <p style="max-width:1350px;">Which suspect causes the bug in the report, and what is the best fix? Which tests ruled out the other suspects?</p>
      </div>
      <aside class="notes">Adding a fourth top only moves the problem: the blank would appear after the fourth top instead. That fix hides the symptom without curing the cause. Collect a few free responses and highlight students who named a specific starting index as their evidence.</aside>
    </section>

    <!-- SLIDE NN · BUG REVEAL -->
    <section data-trace-board="bugB">
      <div class="slide-inner board-inner">
        <div class="board-head">
          <span class="slide-tag">Bug Hunt &middot; The Cause</span>
          <h2>Tracing Suspect B</h2>
          <p class="board-prompt">Here is Suspect B on the test that matches the bug report, starting from the last top.</p>
        </div>
      </div>
      <aside class="notes">The condition compares against tops.length, which is 3, so index 3 slips through. Index 3 is past the end, so tops[3] is undefined and the picture is blank. On the next click, index 4 > 3 is true, so it wraps to 0. The fix is to compare against the last index, tops.length - 1.</aside>
    </section>
```

## Trace Data

```js
  bugB: {
    code: [
      'var tops = ["hoodie", "tee", "jacket"];',
      'var index = 2;',
      'index = index + 1;',
      'if (index > tops.length) {',
      '  index = 0;',
      '}',
      'console.log(tops[index]);'
    ],
    start: 1,
    steps: [
      { line: 2, list: { tops: ['hoodie', 'tee', 'jacket'] }, work: '<i class=n>tops</i> <i class=a>gets</i> a list of three strings.' },
      { line: 3, decl: ['index'], set: { index: 2 }, work: 'Start on the jacket: <i class=n>index</i> <i class=a>gets</i> <i class=v>2</i>. The user clicks next.' },
      { line: 4, set: { index: 3 }, work: '<i class=n>index</i> <i class=a>gets</i> <i class=v>2 + 1</i>, which is <i class=v>3</i>.' },
      { work: 'This version compares with <i class=n>tops.length</i>, which is <i class=v>3</i>. Is <i class=v>3 &gt; 3</i>? No, the condition is false.' },
      { line: 7, work: 'The body is skipped, so <i class=n>index</i> stays <i class=v>3</i>.' },
      { read: { tops: [3] }, work: '<i class=a>Look up</i> <i class=n>index</i>: <i class=v>3</i>. Index <i class=x>3</i> is past the end of the list, so <i class=n>tops[3]</i> is <i class=u>undefined</i>.' },
      { line: 8, out: 'undefined',
        work: 'The picture goes blank. The fix is to compare with the last index: <i class=n>index &gt; tops.length - 1</i>.' }
    ]
  }
```

## Lesson Plan Section

#### Slides 13 to 16: Bug Hunt

The bug report says that after the last top (the jacket), clicking next shows a blank picture, and clicking again brings back the hoodie. Three suspect versions of the click code are on slide 13, and pairs work through them by hand at their computers (scratch paper helps). A **test** is a starting value for `index` plus one or two clicks. Pairs have about 6 minutes, so they must choose tests that tell the suspects apart, and they cross out a suspect only when a test result disagrees with the report.

Evidence key, with `tops = ["hoodie", "tee", "jacket"]`:

| Test | Suspect A (`>= length - 1`) | Suspect B (`> length`) | Suspect C (check before `+ 1`) |
| --- | --- | --- | --- |
| Start at 0, one click | `"tee"` | `"tee"` | `"tee"` |
| Start at 1, one click | `"hoodie"` (the jacket never shows) | `"jacket"` | `"jacket"` |
| Start at 2, two clicks | `"hoodie"`, then `"tee"` | blank, then `"hoodie"` | blank, then `"tee"` |

Starting at 0 with one click is a wasted test, because every suspect gives the same result (a second click from 0 would rule out Suspect A, which wraps to the hoodie too early). Starting at 1 rules out Suspect A, and starting at 2 with two clicks rules out Suspect C. **Suspect B** matches the report: it compares with `tops.length` (3), so index 3 slips through and `tops[3]` is `undefined`.

Slide 15 is a Resonance diagnosis: which suspect is the cause (B), the best fix (compare with `tops.length - 1`), and a free response naming the tests that ruled out the others. Adding a fourth top to the list is the symptom-hiding distractor: the blank would just appear after the fourth top instead. Slide 16 steps through Suspect B on the test that matches the report.
