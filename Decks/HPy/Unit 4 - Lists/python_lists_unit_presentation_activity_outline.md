# Python Lists Unit: Presentations, Activities, and Practice

**Status:** Working instructional outline. Presentations 1 to 4 are revised to match the finished decks.  
**Culminating project:** Collaborative *Review Detective*  
**Scope:** One dimensional Python lists. Tuples, two dimensional lists, dictionaries, and sets are outside this sequence.  
**Environment:** Short presentations and MobCode investigations, hands on tracing at tables and whiteboards, student owned VS Code exercise files, and a simple shared GitHub repository for the final project.

## Instructional goals

Students will be able to create and traverse lists, select and transform data, distinguish mutating and nonmutating operations, reason about references and aliases, debug loops that modify lists, and design testable list processing functions. Every student will apply these skills in their own module of a collaborative review analysis application.

The early presentations use sentences, words, and general examples rather than customer reviews. The project is previewed once in Presentation 1 and introduced fully in Presentation 9, so students meet list skills on their own terms before applying them to reviews.

### Recurring instructional routines

- **Predict, trace, verify, explain:** Students predict output before running MobCode examples. Complexity grows across the unit rather than saving tracing until the end.
- **Physical list model:** Each group uses a code sheet, an indexed tray (eight slots labeled 0 to 7) and colored list items (green, red, yellow, purple, and orange) to make element replacement, insertion, removal, and shifting visible. A finger or marker represents the current loop index. A setup slide sends groups to the tables and has them pick up a code sheet, a tray, and items on the way.
- **Memory model:** Groups trace at stand-up whiteboards, using retractable magnetic arrows to connect variable names to list objects drawn on the board. The instructor demonstrates the first trace with the same arrows on the front board.
- **Code sheets:** Each whiteboard trace and each tray trace starts from a printed code sheet of the program, as in the CSP tracing lessons. At the whiteboard, groups tape up the sheet and draw the frames, list objects, and arrows beside the code. At the tables, the sheet lies beside the tray, so groups can point at the line they are running and record the tray beside each line. The sheets have no flaps on the code; a line under the title holds a blank space for each variable the group must track. The slides call them code sheets. The programs are collected under "Code Sheet Exercise Set" at the end of this plan.
- **Trace boards and Python Tutor:** Deck trace boards step through each program for checking after students trace it themselves. In both the trace boards and Python Tutor, the marked line is the next line to run. Code examples that the deck does not step through carry a Python Tutor icon link built from the code on the slide.
- **MobCode instructions in comments:** A running MobCode activity covers the slide, so every MobCode starter program carries its task and steps in its comments.
- **VS Code artifact:** Each investigation yields a retained `.py` file in the student's Unit 4 folder, not just a temporary MobCode response.
- **Student built reference:** Students record operation, purpose, arguments, return value, mutation behavior, and a tested example. Each deck ends with a partially completed reference table that shows a few examples and leaves the rest for students. This reference grows across the unit.

## At a glance

| Presentation | Central question | Main class activity | VS Code exercise | Primary CMU coverage |
|---|---|---|---|---|
| 1. Why Lists? | Why use collections? | Reaction game in MobCode | Exploring Collections | 4.1, 4.2.1–4.2.3 |
| 2. Finding Things in Lists | How do we locate and summarize values? | List Detective predictions | Word Detective | 4.2.6–4.2.8 |
| 3. Changing Lists | What changes when we modify a list? | Indexed tray operations | Word Editor | 4.2.5, 4.2.8, 4.2.9 |
| 4. Aliases and Copies | Why can two variables change together? | Whiteboard traces with magnetic arrows | Alias Experiments | 4.2.4–4.2.6 |
| 5. Building New Lists | How do we filter and transform data? | MobCode loop and result tracing | Review Text Processor | 4.2.10, 4.2.12 |
| 6. The Disappearing Candy | Why does removal skip items? | Remove All the Reds | Remove and Filter | 4.2.10 |
| 7. Changing or Returning? | What does a function promise its caller? | Function call memory traces | Function Design Challenge | 4.2.5, 4.2.12 |
| 8. Python Shortcuts | When do shortcuts improve code? | Code Makeover | Refactoring Lab | 4.2.6–4.2.9, 4.2.11 |
| 9. Building Review Detective Together | How do independent modules form an application? | Team contracts and GitHub workflow | Project Modules | Applied skills |
| 10. Can We Trust the Results? | Is correct code producing useful conclusions? | Complex trace and adversarial examples | Integration and Investigation | 4.2.13 and synthesis |

**Pacing:** Initially allow approximately 13 to 16 class periods including project work, but treat this as flexible. Presentations are instructional segments, not necessarily full periods.

---

## Presentation 1: Why Lists?

**Deck:** `4.1 - Why Lists/4.1-why-lists.html`

**CMU:** 4.1 Getting Started; 4.2.1 Introduction; 4.2.2 Creating Lists; 4.2.3 List and String Similarities; portions of 4.2.7, 4.2.9, and 4.2.10.

**Central question:** Why do we need collections instead of separate variables?

**Opening: the reaction game.** Students run a MobCode reaction timer: the program says "wait for it", then "GO", and the player presses Enter as fast as possible. The starter comments give the task for each phase.

1. **Phase 1 (MobCode):** Use an accumulator to print the player's average time when the game ends. The next slide explains the accumulator pattern: a running total and a count are enough, because computing an average never needs an earlier time again.
2. **Phase 2 plan (Resonance, free response):** How would you count how many tries beat the average? Students discover that the average is not known until the end, by which time the earlier times are gone.
3. **Why it is hard, then the list solution:** One variable per try does not scale and the number of tries is unknown. A list keeps every value under one name.
4. **Phase 2 (MobCode):** Store the times in a list, then count the tries that beat the average. The extension is to report the fastest time.
5. **Where the unit is going:** One slide previews Review Detective. This is the only project reference before Presentation 9.

**Presentation outline (after the opening)**
1. List literals, empty lists, mixed types, and `list()`.
2. `list()`, `[v] * n`, and `list(range(n))`, and why short list names use a capital `L`.
3. Strings and lists as ordered sequences.
4. Positive and negative indexing, `len()`, and invalid indexes, including a list with no items.
5. Slicing: each of `start`, `end`, and `step` is optional, a negative step such as `L[4:1:-1]` walks backward, and a slice never crashes.
6. Loops by value and by index.
7. `split()` turns a string into a list of words.

**MobCode trace:** Predict the output of a word list trace that uses a negative index, a slice, and a loop with a step of 2, then run it.

**Resonance checkpoints:** Questions show whole programs as fenced code blocks and single expressions or options as inline code.

**VS Code: Exploring Collections (`exploring_collections.py`).** Students start with a sentence of their own, at least eight words long. They split it into `words`, print its length, print slices (the first three words, the last two, and every other word), print a numbered listing by index, and print the words reversed with a slice. An early finisher tries punctuation and sees that `split(" ")` leaves `"walks!"` with its punctuation attached.

**Reference discoveries:** literals, `list()`, indexing, slicing, `len()`, looping, basic list creation, `split()`.

## Presentation 2: Finding Things in Lists

**Deck:** `4.2 - Finding Things in Lists/4.2-finding-things-in-lists.html`

**CMU:** 4.2.6 List Operators; 4.2.7 List Related Builtin Functions; nonmutating parts of 4.2.8 List Methods.

**Central question:** How can a program find useful information without changing a collection?

**Presentation outline**
1. Questions a program can ask of a list of words.
2. `in` and `not in`.
3. `count()` and `index()`, including the exception for a missing value.
4. Lists have no `find()`. A checkpoint asks why `str(L).find(...)` is not a substitute, followed by an explanation slide using `L = [5, 3, 18]`.
5. A predict and run trace, then an explanation of why a list inside `in` is false.
6. A trace of a `findFirst` loop over a list named `ratings`.
7. `len()`, `min()`, `max()`, and `sum()` with compatible types.
8. List equality and inequality, then lexicographic ordering and prefix ordering.
9. `type()` and `list()` as part of the reference, with limited slide time.

**MobCode trace:**

```python
words = ["good", "bad", "good", "great"]
print("good" in words)
print(words.count("good"))
print(words.index("great"))
print(["good", "bad"] in words)
```

Ask why the last membership check is false even though both individual words appear.

**VS Code: Word Detective (`word_detective.py`).** Each function takes a sentence string, splits it into words, and uses a loop rather than the builtin shortcut. Students test each function with `assert` before moving on.

- `countWord(sentence, target)` returns how many times the word appears. Check it against `sentence.split(" ").count(target)`.
- `findFirst(sentence, target)` returns the index of the first matching word, or `-1` if it is missing.
- `countMatches(sentence, targets)` takes a list of target words and returns how many words in the sentence appear in it. For example, `countMatches("the red fox saw the blue sky", ["red", "blue", "green"])` returns 2.

Ask for a test with an empty sentence: `"".split(" ")` returns `[""]`, a list holding one empty string.

**Reference discoveries:** comparison and membership operators, `count()`, `index()`, `min()`, `max()`, `sum()`, `type()`; exceptions and return values.

## Presentation 3: Changing Lists

**Deck:** `4.3 - Changing Lists/4.3-changing-lists.html`

**CMU:** 4.2.5 List Mutability; mutating methods from 4.2.8; relevant operators from 4.2.6; `join()` from 4.2.9.

**Central question:** How does changing a list differ from reading it?

**Presentation outline**
1. Contrast `L[i] = value` with immutable string elements.
2. `append()`, `extend()`, and `insert()`.
3. `remove()` and `pop()`; value versus index; `pop()` returns the removed value.
4. Setup slide: groups move to the tables, picking up a code sheet, an indexed tray, and list items on the way.
5. The tray activity, then a trace board that checks it.
6. Index shifting after insertion and deletion.
7. `sort()` and `reverse()` as in place changes.
8. Many mutating methods return `None`, unlike `pop()`.
9. Predict both the returned values and the final contents, then run it.
10. `join()` turns a list of words back into a string.

**Physical tracing: Indexed trays (`tray.py`).** Each group's tray is a list named `tray`. Groups load it starting at slot 0 and run one line at a time from their code sheet, recording the tray beside each line and circling the items whose index changed:

```python
tray = ["green", "red", "yellow", "red", "purple"]
tray[2] = "orange"
tray.insert(1, "yellow")
tray.remove("red")
x = tray.pop(3)
tray.append("green")
```

The final tray is `["green", "yellow", "orange", "purple", "green"]`, and `x` holds `"red"`, kept in a separate spot because `pop` hands back the value it removed. **Implementation note:** A fixed eight slot tray is a model, not a literal Python list container. Empty slots are not list elements; the list ends at its last item. If a group runs out of slots, use an overflow space beside the tray.

**MobCode trace:** Predict both final contents and returned values after method calls, particularly `append()` versus `pop()`. The run includes an intentional crash for discussion.

**VS Code: Word Editor (`word_editor.py`).** Students split a sentence into words and make one edit per line, printing the joined result after each: replace a word by its index (found with `index`), insert a word at the start, remove one word and pop another (printing what `pop` returned), extend with two words, then sort and print with `", ".join(words)`. Each line gets a prediction comment before it runs.

**Reference discoveries:** element assignment, `append`, `extend`, `insert`, `remove`, `pop`, `sort`, `reverse`, `join`, mutation and return behavior.

## Presentation 4: Aliases and Copies

**Deck:** `4.4 - Aliases and Copies/4.4-aliases-and-copies.html`

**CMU:** 4.2.4 Visualizing Code Execution; 4.2.5 List Mutability; `+`, `+=`, `*`, and `*=` from 4.2.6.

**Central question:** Why can changing one variable seem to change another?

**Room flow.** Students open with a Resonance prediction at their computers. On slide 3 groups move to the whiteboards with their code sheets and magnetic arrows, and they stay there for the traces and checkpoints. Slide 19 sends them back to their computers for the MobCode and VS Code work.

**Presentation outline**
1. Hook prediction (Resonance): `b = a`, then `a.append(4)`, then `print(b)`.
2. Boxes and arrows: frames, objects, and references, with a Python Tutor link to the hook program. Groups move to the whiteboards.
3. **Instructor demonstration** at the front board with magnetic arrows: two variables can refer to the same list, and a third holds an equal but separate list. Students build the same picture at their whiteboards.
4. Aliases versus copies, and `==` versus `is` and `is not`.
5. `copy.copy()`, with a Python Tutor link for each example. Recognize alternate copying forms such as slicing, `list(L)`, `L.copy()`, `L + []`, and `L * 1` without using them, consistent with CMU's preference for `copy.copy()`.
6. Reassigning moves an arrow (trace board), then mutation versus reassignment.
7. **Whiteboard trace:** groups trace `M[2] = 5` through an alias, then check with the revealed answer and Python Tutor.
8. **Hands on: Move the arrows (`arrows.py`):** before each line, groups mark it on their code sheet: **M** if it mutates a list, **A** if it points an arrow at a list that already exists (an alias), or **N** if it makes a new list and points an arrow at it (`copy.copy(a)` and `a + [5]`). `a[0] = 9` is the trap, since it has an equals sign but is M. A trace board checks the result.
9. `L = L + M` versus `L += M`, and `L = L * n` versus `L *= n`.
10. Four patterns that help you remember: assignment operators (`+=`, `*=`) mutate while plain operators do not; methods mutate while past-tense functions (`sorted`, `reversed`) do not; non-mutating operations return a new list that must be stored; and mutating methods return `None` except `pop`, so `L = L.sort()` turns `L` into `None`. When the patterns are not enough, run the alias test.
11. A parameter refers to the caller's list (trace board).
12. **Whiteboard trace:** a function call. `addItems(M)` mutates the caller's list through the parameter, then reassigns the parameter to a new list, so only the first change reaches the caller.
13. Back to computers.
14. **Trace on paper:** students trace the MobCode program on paper and predict every `print` before it opens.
15. MobCode: students type their predictions as comments, run the program, and find where any wrong prediction went wrong. A slide below the MobCode slide shows the program with a Python Tutor link, so students can step through it and find the first step where their drawing disagrees.

**Physical tracing: Magnetic arrows.** Each group draws list objects beside its code sheet and uses magnetic arrows for variable references, moving an arrow on reassignment and editing the drawn list on mutation. Contrast:

```python
a = [1, 2, 3]
b = a
a.append(4)
```

with:

```python
a = [1, 2, 3]
b = a
a = a + [4]
```

**MobCode: Identity predictions.** Predict object identity, value equality, and contents after sequences of assignment and mutation. A slide before the MobCode slide shows the program so students trace it on paper and write their predictions before they can run it. The steps are repeated in the starter comments, since MobCode covers the slide.

**VS Code: Alias Experiments (`alias_experiments.py`).** Each experiment has a prediction comment above it and an explanation in terms of arrows below it. Students show two lists that are `==` but not `is` and two that are both; use the alias test to decide whether `L += [1]`, `L = L + [1]`, and `L.extend([1])` mutate `L`; and write `shout(words)`, which uppercases every word by index, then protect the caller with `copy.copy`.

**Reference discoveries:** objects and aliases, copying, identity, reassignment, augmented operators, parameter aliases.

## Presentation 5: Building New Lists

**CMU:** 4.2.10 Looping over Lists; 4.2.12 Writing Mutating and Nonmutating Functions; preview 4.2.11.

**Central question:** How can we generate a new collection from an existing collection?

**Presentation outline**
1. Looping by value and by index.
2. Accumulating results into an initially empty list.
3. Filtering by condition.
4. Transforming each selected element.
5. Preserving the original list versus modifying it.
6. Brief preview of comprehensions, without requiring them yet.

**MobCode trace:**

```python
words = ["good", "bad", "great", "awful", "nice"]
negative = ["bad", "awful"]
result = []
for word in words:
    if word not in negative:
        result.append(word)
print(result)
print(words)
```

**VS Code: Review Text Processor.** Implement functions such as `removeWords(words, unwanted)`, `replaceWords(words, old, new)`, `findLongWords(words, minLength)`, and `uniqueWords(words)`. Require clear contracts, explicit loops, and tests for the unchanged input.

**Reference discoveries:** accumulation into a new list, filter and transform patterns, mutation of local results versus arguments.

## Presentation 6: The Disappearing Candy

**CMU:** 4.2.10 Looping over Lists, especially the mutation hazard and `removeAll`.

**Central question:** Why can removing an item cause the algorithm to miss the next one?

**Presentation outline**
1. Show the broken `for i in range(len(L))` approach that can crash.
2. Explain that the range was established before items were removed.
3. Try a `while` loop that still increments after every removal.
4. Show why adjacent targets are skipped.
5. Fix the loop by advancing only when no removal occurred.
6. Contrast mutating removal with building a filtered result list.

**Physical tracing: Remove All the Reds.** Use an eight slot indexed tray with adjacent reds, such as green, red, red, yellow, red, green, red, yellow. A student's finger is the loop index. They must follow the broken algorithm literally, including shifting candies after a `pop()` and advancing the finger even when that skips a red. Then repair the algorithm and test again.

```python
i = 0
while i < len(candies):
    if candies[i] == "red":
        candies.pop(i)
    i += 1  # Bug: skips the item shifted into index i
```

**MobCode:** Trace three candidate `removeAll` functions, explain failure, repair them, and test consecutive matches.

**VS Code: Remove and Filter.** Implement a mutating `removeAll` and a nonmutating `filterOut`. Test empty lists, adjacent matches, all matches, and no matches.

**Reference discoveries:** changing length during iteration, index shifting, `while` conditions, and safer alternatives.

## Presentation 7: Changing or Returning?

**CMU:** 4.2.5 parameter aliases and 4.2.12 function contracts.

**Central question:** Should a function change a caller's list or return a new result?

**Presentation outline**
1. Revisit parameter references.
2. Mutating versus nonmutating functions.
3. Compare in place updates with returned new lists.
4. Default expectation: do not unexpectedly mutate arguments.
5. Local list mutation is compatible with a nonmutating function, as long as arguments are preserved.
6. Specify behavior through contracts and tests.

**Physical tracing: Function frames.** Draw the caller's variable, the function parameter, and one shared list object. Trace:

```python
def removeFirst(items):
    items.pop(0)

numbers = [10, 20, 30]
removeFirst(numbers)
```

Contrast with a function that reassigns its local parameter to a new list. Demonstrate why the caller's variable is unaffected by local reassignment.

**MobCode:** Detect a function that promises to calculate a result but unexpectedly calls `sort()` or `pop()` on its input.

**VS Code: Function Design Challenge.** Implement both mutating and nonmutating versions of selected earlier operations. Tests check output and post call state of arguments.

**Reference discoveries:** function contracts, returned values, local mutation, argument mutation, copying.

## Presentation 8: Python Shortcuts and Code Makeovers

**CMU:** Remaining elements of 4.2.6–4.2.9; 4.2.11 comprehensions.

**Central question:** When are Python's shortcuts clearer or safer than an explicit loop?

**Presentation outline**
1. `+` and `*` on lists versus `+=` and `*=`; identity consequences.
2. `sorted(L)` versus `L.sort()`.
3. `reversed(L)` returns an iterator; contrast with `list(reversed(L))` and `L.reverse()`.
4. `split()`, `splitlines()`, `join()`; review the transformations introduced earlier.
5. List comprehensions in basic form.
6. Comprehensions with an `if` condition.
7. Readability, behavior preservation, and appropriate use of shortcuts.

**MobCode: Code Makeover.** Predict whether an explicit loop and a comprehension have identical output and mutation behavior:

```python
result = []
for word in words:
    if len(word) > 5:
        result.append(word)

# Equivalent concise form:
result = [word for word in words if len(word) > 5]
```

**VS Code: Refactoring Lab.** Revisit earlier functions, simplify selected implementations, and use regression tests to verify output and unchanged or intentionally changed inputs.

**Reference discoveries:** sorting and reversing variants, string conversion methods, concatenation, repetition, and comprehensions.

## Presentation 9: Building Review Detective Together

**CMU:** Application and integration of 4.2.1–4.2.12; GitHub is an additional engineering objective, not a CMU Lists topic.

**Central question:** How can several programmers write separate list algorithms that combine into one useful application?

**Presentation outline**
1. Introduce the review analysis question and a shared sample dataset.
2. Show possible sentiment, vocabulary, and language pattern analyses.
3. Agree on inputs, outputs, and mutation contracts.
4. Assign separate student owned `.py` modules with meaningful list processing in each.
5. Explain importing functions and independently testing modules.
6. Introduce a shared GitHub repository and VS Code Source Control: pull, edit, commit, push.
7. Agree on file ownership and a coordination rule for shared files. Separate files reduce merge conflicts but concurrent pushes still require syncing.

**Team design activity:** Draft function signatures and test inputs before implementation. Example:

```python
def countPositive(words, positiveWords):
    # Return the number of positive word occurrences.
    # Do not mutate either input list.
    ...
```

**VS Code: Collaborative Project.** Build and test each student's module independently, then integrate through a shared entry point. Ensure every student creates and traverses lists, searches or filters, transforms data, and demonstrates deliberate mutation decisions. The exact module responsibilities remain provisional until the project's rubric and starter files are designed.

## Presentation 10: Can We Trust the Results?

**CMU:** 4.2.13 Code Tracing with Lists and cumulative earlier concepts.

**Central question:** Can code be technically correct but produce misleading conclusions?

**Presentation outline**
1. A complex trace involving function calls, copying, sorting, and mutation.
2. Trace original versus resulting lists.
3. Test edge cases that reveal hidden bugs.
4. Separate algorithm correctness from the validity of a review interpretation.
5. Try adversarial changes to wording, repetition, or adjectives and observe output shifts.
6. Present and explain individual modules and integrated project limitations.

**MobCode:** A multi operation trace requiring manual box and arrow sketches before execution.

**VS Code: Integration and Investigation.** Teams complete their application, test contrasting reviews, document a case their algorithm handles well and a case where its interpretation is limited, and demonstrate their individual list processing functions.

---

## CMU topic verification

| CMU section | Presentation coverage | Key points to verify in final materials |
|---|---|---|
| 4.1 Getting Started | 1 | Collections context only; tuples and 2D lists later |
| 4.2.1 Introduction | 1 | List literal, mixed types, empty list |
| 4.2.2 Creating Lists | 1 | `[]`, `list()`, `[v] * n`, `list(range(n))` |
| 4.2.3 List and String Similarities | 1 | Indexes, negative indexes, slicing, both loops |
| 4.2.4 Visualizing Code Execution | 4, 7 | Frames, references, diagrams, stepping |
| 4.2.5 List Mutability | 3, 4, 7 | Aliases, copies, `is`, breaking aliases, parameters, mutation distinction |
| 4.2.6 List Operators | 2, 4, 8 | Comparison, membership, `+`, `*`, `+=`, `*=`, slices |
| 4.2.7 List Related Builtin Functions | 2, 8 | `list`, `type`, `len`, `min`, `max`, `sum`, `sorted`, `reversed` |
| 4.2.8 List Methods | 2, 3, 8 | `index`, `count`, `append`, `extend`, `insert`, `remove`, `pop`, `sort`, `reverse` |
| 4.2.9 List Related String Methods | 1, 3, 8 | `split`, `splitlines`, `join` |
| 4.2.10 Looping over Lists | 1, 5, 6 | Traversal and mutation hazards, `removeAll` |
| 4.2.11 List Comprehensions | 5 (preview), 8 | Basic and conditional forms |
| 4.2.12 Writing Mutating and Nonmutating Functions | 5–7 | Function promises, in place versus new lists, local mutation |
| 4.2.13 Code Tracing with Lists | All, especially 10 | Cumulative manual and executable tracing |

### Content that should not disappear in slide development

- The difference between equal values and object identity.
- `copy.copy()` and recognition of other ways Python can make shallow list copies.
- Why `L = L + M` and `L += M` can differ for aliases, likewise multiplication.
- `remove(v)` searches for a value; `pop(i)` selects an index and returns the removed value.
- `index(v)` and `remove(v)` raise errors when no match exists.
- `sorted(L)` creates a list; `L.sort()` modifies the existing list; `reversed(L)` does not directly return a list.
- List ordering comparisons use lexicographic rules, including prefix ordering.
- A function can mutate a local result while remaining nonmutating with respect to its input arguments.
- String splitting and joining are essential to the review analysis workflow.

## Suggested assessment evidence

Each student retains a VS Code lab collection and contributes a separately testable module to Review Detective. Evaluate the ability to predict and trace list behavior, build algorithms with loops, demonstrate appropriate mutation and nonmutation, test edge cases, explain function contracts, and integrate responsibly with teammates. Keep GitHub commit counts out of the definition of individual programming proficiency.

## Open design decisions

1. Finalize exact Review Detective module roles so each student has comparable one dimensional list work.
2. Decide how much review data and sentiment vocabulary to provide versus generate.
3. Build the student reference sheet template, likely a single growing document or workbook.
4. **Decided:** Presentation 1 previews the project on one slide; the full project context and GitHub start in Presentation 9.
5. Define compact MobCode tracing interactions, VS Code starter files, and exit checks for each presentation.
6. **Decided for Presentations 3 and 6:** groups use indexed trays with colored list items (green, red, yellow, purple, and orange). Decide whether later presentations need physical materials.
7. Prepare code sheets for whiteboard and tray traces in Presentations 5 to 10 as those decks are finalized, and add them to the exercise set below.

**Design principle:** Presentations introduce questions; investigations reveal behavior; VS Code provides durable practice; physical models make invisible list behavior visible; and the team project gives each student's list algorithms an authentic purpose.

---

## Code Sheet Exercise Set

Make the code sheets with TraceLift (https://print.mycode.run/tracelift), which prints each program as a numbered code sheet. Copy each block below into TraceLift as it is. The code itself has no `[[name]]` flaps. Where a sheet needs space to record a variable, a comment line under the title uses flaps such as `# [[x]]` as blank spaces for students to fill in. Because it is a comment, the code's line numbers still match the slides. Print one sheet per group for each group trace, and one large sheet for the front board demonstration.

### Lesson 4.3: Be the List (slides 6 and 7, tables)

The tray is the list, so the sheet only needs a space for `x`, the value `pop` hands back. Groups record the tray beside each line.

```text
Title: Lesson 4.3 - Be the List
# [[x]]
tray = ["green", "red", "yellow", "red", "purple"]
tray[2] = "orange"
tray.insert(1, "yellow")
tray.remove("red")
x = tray.pop(3)
tray.append("green")
```

### Lesson 4.4 Round 1: The Hook (slide 2, optional)

Students first answer this as a Resonance question. A sheet lets groups redraw it at the board after slide 3.

```text
Title: Lesson 4.4 Round 1 - The Hook
a = [1, 2, 3]
b = a
a.append(4)
print(b)
```

### Lesson 4.4 Demo: Two Names, One List (slide 4, front board)

The instructor traces this at the front board while groups copy the picture.

```text
Title: Lesson 4.4 Demo - Two Variables Can Refer to the Same List
L = [1, 3]
M = L
N = [1, 3]
L[0] = 42
print(L, M, N)
print(L is M, L is N, L == N)
```

### Lesson 4.4 Round 2: Reassigning Moves an Arrow (slide 8, optional)

The deck steps through this on a trace board. Groups can trace it first.

```text
Title: Lesson 4.4 Round 2 - Reassigning Moves an Arrow
L = [1, 3]
M = L
M = [1, 3]
print(L == M, L is M)
M[0] = 99
print(L, M)
```

### Lesson 4.4 Round 3: Trace It (slide 10)

```text
Title: Lesson 4.4 Round 3 - Trace It
L = [1, 2, 3]
M = L
M[2] = 5
print(L, M)
```

### Lesson 4.4 Round 4: Move the Arrows (slide 11)

```text
Title: Lesson 4.4 Round 4 - Move the Arrows
import copy
a = [1, 2, 3]
b = a
c = copy.copy(a)
a[0] = 9
b.append(4)
a = a + [5]
print(a, b, c)
```

### Lesson 4.4 Round 5: A Parameter Refers to the Caller's List (slide 16, optional)

The deck steps through this on a trace board. Groups draw a second frame for the call to `f`.

```text
Title: Lesson 4.4 Round 5 - A Parameter Refers to the Caller's List
def f(M):
    M[0] = 42

L = [1, 3]
f(L)
print(L)
```

### Lesson 4.4 Round 6: Trace a Function Call (slide 18)

Groups draw a second frame for the call to `addItems` and mark each line M, A, or N.

```text
Title: Lesson 4.4 Round 6 - Trace a Function Call
def addItems(M):
    M.append(4)
    M = M + [5]
    M.append(6)

L = [1, 2, 3]
addItems(L)
print(L)
```

### Lesson 4.6: Remove All the Reds (slides 6 and 7, tables)

Groups load the tray as the slide shows: green, red, red, purple, red, orange, red, yellow. The tray is `items`, and one student's finger is `i`; the space for `i` lets the group write each new value. Line 5 on the slide is line 5 on the sheet.

```text
Title: Lesson 4.6 - Remove All the Reds
# [[i]]
i = 0
while i < len(items):
    if items[i] == "red":
        items.pop(i)
    i += 1
```
