# Code Tracing Convention

Read this when authoring or editing a `data-fragment-trace` slide.

Decks that trace code execution line-by-line (`data-fragment-trace` sections driving `.code-line.current`/`.done`/`.pending`/`.active-call` highlighting) must follow this rule:

**The highlighted "current" line always indicates the next line about to execute, not the line that just ran.** A line's effects (a `print()` writing to the console, an assignment populating a var-box, a function call returning to its call site) must not be revealed on the fragment that arrives at that line. They are revealed only on the fragment where the caret moves past it, i.e. one step later, when the following line becomes current.

A line that raises an exception never completes, so the caret never advances past it. Its effect (the traceback) is revealed on a later fragment that keeps `data-trace-current` pointing at that same crashing line rather than a following one, since there is no line the program reached afterward.

This applies uniformly to console output, variable assignment, and function-return-to-call-site reveals. When authoring or editing a `data-fragment-trace` section, structure fragments so that any line producing an observable effect fires a hidden fragment on arrival (`data-trace-current="N"` with no visible content) followed by the visible reveal on the fragment that advances `data-trace-current` to `N+1` (using a virtual line number past the end of the snippet if there is no real next line, or reusing `N` if the line crashes instead of completing).
