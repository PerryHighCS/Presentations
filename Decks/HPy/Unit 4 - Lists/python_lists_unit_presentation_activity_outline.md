# Python Lists Unit: Presentations, Activities, and Practice

**Status:** Working instructional outline  
**Culminating project:** Collaborative *Review Detective*  
**Scope:** One dimensional Python lists. Tuples, two dimensional lists, dictionaries, and sets are outside this sequence.  
**Environment:** Short presentations and MobCode investigations, hands on tracing, student owned VS Code exercise files, and a simple shared GitHub repository for the final project.

## Instructional goals

Students will be able to create and traverse lists, select and transform data, distinguish mutating and nonmutating operations, reason about references and aliases, debug loops that modify lists, and design testable list processing functions. Every student will apply these skills in their own module of a collaborative review analysis application.

### Recurring instructional routines

- **Predict, trace, verify, explain:** Students predict output before running MobCode examples. Complexity grows across the unit rather than saving tracing until the end.
- **Physical list model:** Indexed trays (approximately eight slots) and colored candy make element replacement, insertion, removal, and shifting visible. Use a finger or marker to represent the current loop index.
- **Memory model:** Retractable magnetic arrows on the whiteboard connect variable names to list objects. Students reproduce the same references as box and arrow drawings on paper.
- **VS Code artifact:** Each investigation yields a retained `.py` file, not just a temporary MobCode response.
- **Student built reference:** Students record operation, purpose, arguments, return value, mutation behavior, and a tested example. This grows across the unit.

## At a glance

| Presentation | Central question | Main class activity | VS Code exercise | Primary CMU coverage |
|---|---|---|---|---|
| 1. Why Lists? | Why use collections? | MobCode indexing and slice traces | Exploring Collections | 4.2.1–4.2.3 |
| 2. Finding Things | How do we locate and summarize values? | List Detective predictions | Word Detective | 4.2.6–4.2.8 |
| 3. Changing Things | What changes when we modify a list? | Indexed candy tray operations | Review Editor | 4.2.5, 4.2.8 |
| 4. One List, Two Names | Why can two variables change together? | Magnetic arrow memory traces | Alias Experiments | 4.2.4–4.2.5 |
| 5. Building New Lists | How do we filter and transform data? | MobCode loop and result tracing | Review Text Processor | 4.2.10, 4.2.12 |
| 6. The Disappearing Candy | Why does removal skip items? | Remove All the Reds | Remove and Filter | 4.2.10 |
| 7. Changing or Returning? | What does a function promise its caller? | Function call memory traces | Function Design Challenge | 4.2.5, 4.2.12 |
| 8. Python Shortcuts | When do shortcuts improve code? | Code Makeover | Refactoring Lab | 4.2.6–4.2.9, 4.2.11 |
| 9. Building Review Detective Together | How do independent modules form an application? | Team contracts and GitHub workflow | Project Modules | Applied skills |
| 10. Can We Trust the Results? | Is correct code producing useful conclusions? | Complex trace and adversarial examples | Integration and Investigation | 4.2.13 and synthesis |

**Pacing:** Initially allow approximately 13 to 16 class periods including project work, but treat this as flexible. Presentations are instructional segments, not necessarily full periods.

---

## Presentation 1: Why Lists?

**CMU:** 4.2.1 Introduction; 4.2.2 Creating Lists; 4.2.3 List and String Similarities; portions of 4.2.7 and 4.2.10.

**Central question:** Why do we need collections instead of separate variables?

**Presentation outline**
1. Begin with three review words in three variables and challenge students to handle 30.
2. List literals, empty lists, mixed types, and `list()`.
3. Strings and lists as ordered sequences.
4. Positive and negative indexing, slicing, `len()`, and invalid indexes.
5. Loops by value and by index.
6. Alternate creation techniques: `[0] * n` and `list(range(n))`.

**MobCode trace:** Predict the output before running:

```python
words = ["amazing", "terrible", "okay", "perfect"]
print(words[-2])
print(words[1:3])
for i in range(0, len(words), 2):
    print(words[i])
```

Add an empty list case and an invalid index to discuss errors.

**VS Code: Exploring Collections.** Start with a short review string, use `split()` to obtain a word list, explore slices, and produce a numbered listing. Introduce `split()` here as a useful bridge, not an entire new API lecture.

**Reference discoveries:** literals, `list()`, indexing, slicing, `len()`, looping, basic list creation.

## Presentation 2: Finding Things in Lists

**CMU:** 4.2.6 List Operators; 4.2.7 List Related Builtin Functions; nonmutating parts of 4.2.8 List Methods.

**Central question:** How can a program find useful information without changing a collection?

**Presentation outline**
1. `in` and `not in`.
2. `count()` and `index()`, including the exception for a missing value.
3. `len()`, `min()`, `max()`, and `sum()` with compatible types.
4. List equality and inequality.
5. Brief exploration of lexicographic comparisons and prefix ordering.
6. `type()` and `list()` as part of the reference, with limited slide time.

**MobCode trace:**

```python
words = ["good", "bad", "good", "great"]
print("good" in words)
print(words.count("good"))
print(words.index("great"))
print(["good", "bad"] in words)
```

Ask why the last membership check is false even though both individual words appear.

**VS Code: Word Detective.** Functions to count word occurrences, find the first matching index (returning `-1` when absent), and identify words matching small positive or negative vocabularies. Use loops for some solutions rather than replacing all algorithm work with builtins.

**Reference discoveries:** comparison and membership operators, `count()`, `index()`, `min()`, `max()`, `sum()`, `type()`; exceptions and return values.

## Presentation 3: Changing Things

**CMU:** 4.2.5 List Mutability; mutating methods from 4.2.8; relevant operators from 4.2.6.

**Central question:** How does changing a list differ from reading it?

**Presentation outline**
1. Contrast `L[i] = value` with immutable string elements.
2. `append()`, `extend()`, and `insert()`.
3. `remove()` and `pop()`; value versus index; `pop()` returns the removed value.
4. Index shifting after insertion and deletion.
5. `sort()` and `reverse()` as in place changes.
6. Many mutating methods return `None`, unlike `pop()`.

**Physical tracing: Indexed candy trays.** Fill an indexed tray with colored candy. Students execute instructions: replace index 2, insert at index 1 (shift later candies), remove the first red, pop index 3, append a green. Record the tray after each operation and discuss which indexes moved. **Implementation note:** A fixed eight hole tray is a model, not a literal Python list container. For insertions that exceed capacity, use an overflow space or start with spare slots; empty physical slots are not list elements.

**MobCode trace:** Predict both final contents and returned values after method calls, particularly `append()` versus `pop()`.

**VS Code: Review Editor.** Modify a review represented as words: replace, insert, remove, append, then reconstruct text with `join()` (introduce the essential form now, revisit later).

**Reference discoveries:** element assignment, `append`, `extend`, `insert`, `remove`, `pop`, `sort`, `reverse`, mutation and return behavior.

## Presentation 4: One List, Two Names

**CMU:** 4.2.4 Visualizing Code Execution; 4.2.5 List Mutability.

**Central question:** Why can changing one variable seem to change another?

**Presentation outline**
1. Start with a prediction that is likely to expose a misconception.
2. Object references and aliases with two arrows pointing to one object.
3. Aliases versus separate but equal lists.
4. `==` versus `is` and `is not`.
5. `copy.copy()`; copies versus aliases. Briefly recognize alternate copying forms such as slicing, `list(L)`, `L.copy()`, `L + []`, and `L * 1`, consistent with CMU's preference for `copy.copy()`.
6. Reassignment breaks an alias; mutation does not.
7. Function parameters refer to the passed list object.
8. Contrast `L = L + M` with `L += M`, and `L = L * n` with `L *= n`.

**Physical tracing: Magnetic arrows.** Variable cards `a`, `b`, and `c` refer to drawn list objects. Change an element, copy the list, and reassign one variable. Students draw their own corresponding box and arrow traces. Compare:

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

**MobCode:** Predict object identity, value equality, and contents after sequences of assignment and mutation.

**VS Code: Alias Experiments.** Short experiments with `is`, `==`, `copy.copy()`, list arguments to functions, and augmented assignment. Each includes a prediction and explanation.

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
4. Decide whether the presentation sequence starts the project context early while delaying GitHub until later.
5. Define compact MobCode tracing interactions, VS Code starter files, and exit checks for each presentation.
6. Decide which experiments use actual candy and which use diagrams so physical materials are feasible for class size.

**Design principle:** Presentations introduce questions; investigations reveal behavior; VS Code provides durable practice; physical models make invisible list behavior visible; and the team project gives each student's list algorithms an authentic purpose.
