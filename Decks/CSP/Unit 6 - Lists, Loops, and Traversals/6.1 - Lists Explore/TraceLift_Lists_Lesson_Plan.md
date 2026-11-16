# Lists Explore with List Magnets and TraceLift

**Course:** AP Computer Science Principles

**Topic:** Creating lists, accessing elements, element assignment, `appendItem`, `insertItem`, and `removeItem`

**Suggested Length:** 50 to 60 minutes

**Grouping:** Pairs at stand-up whiteboards

**Core Tools:** dry-erase list magnets (7 cells, indexes 0 to 6) and TraceLift printable program sheets

**Slides:** `6.1-lists-explore.html` (29 slides)

---

## Lesson Purpose

In Unit 4, students learned to trace programs by keeping a Memory Trace on a whiteboard, with one column per variable and one current value in each column. This lesson extends that model to lists. A list is still one named variable, but it holds a whole ordered collection of values. On the whiteboard, students write the list's name and place a list magnet under it. Each cell of the magnet holds one element, and the printed index row under the cells shows each element's index.

The conceptual progression is:

> **A variable names one value. A list names an ordered collection of values, and each value is found by its index.**

The Code.org version of this lesson uses gallon and sandwich baggies. The magnets replace the baggies: the name written above the magnet plays the role of the big labeled bag, and each cell plays the role of one small numbered bag.

---

## Lesson Goals

By the end of the lesson, students should be able to:

- Explain that a list is an ordered collection of elements stored under one name.
- Use the terms element, index, and length correctly, and explain why the last index is one less than the length.
- Write the command that creates a list with square brackets and commas.
- Evaluate an expression that contains list accesses by looking up each element, substituting it, and evaluating.
- Trace an element assignment such as `myNumbers[0] = 5;`, including one whose index is an expression.
- Trace `appendItem`, `insertItem`, and `removeItem`, including the elements that shift and the change in length.
- Explain that lists are a data abstraction.

---

## Big Ideas to Reinforce Throughout

Use these phrases consistently:

- **A list is one variable that holds many values in order.**
- **Indexes start at 0.**
- **The length is how many elements the list has.**
- **Evaluate first, then assign.** This applies to the right side, to the index, and to every argument of a list command.
- **Accessing an element does not change it.**
- **Insert and remove shift every element after the change.**

Read element assignment the same way as variable assignment:

```javascript
myNumbers[0] = 5;
```

> myNumbers at index 0 gets 5

---

## Materials

Each pair needs:

- One stand-up whiteboard, a dry-erase marker, and an eraser.
- The magnetic line pointer from Unit 4.
- One or two list magnets (one for their own list and one for copying another group's list).
- The TraceLift program sheets for Rounds 1A, 1B, 2A, and 2B (see the last section of this plan).

---

## Whiteboard Setup

The whiteboard has the same three parts as in Unit 4.

```text
┌─────────────────────────────────┬─────────────────────────────────────────┐
│ PROGRAM                         │ MEMORY TRACE                            │
│                                 │                                         │
│ 1 var nums = [10, 50];          │ nums                                    │
│ 2 insertItem(nums, 1, 20);      │ ┌────┬────┬────┬────┬────┬────┬────┐    │
│ 3 insertItem(nums, 1, 100);     │ │ 10 │ 20 │ 50 │    │    │    │    │    │
│                                 │ ├────┼────┼────┼────┼────┼────┼────┤    │
│                                 │ │ 0  │ 1  │ 2  │ 3  │ 4  │ 5  │ 6  │    │
│                                 │ └────┴────┴────┴────┴────┴────┴────┘    │
├─────────────────────────────────┴─────────────────────────────────────────┤
│ CONSOLE (only needed when a program uses console.log)                     │
└───────────────────────────────────────────────────────────────────────────┘
```

### Program

The TraceLift sheet holds the numbered program. Students move the pointer beside the next line to run.

### Memory Trace

When a line creates a list, students write the list's name and put a magnet under it. They fill the cells from index 0 with no gaps. Strings keep their quotes.

The rules for changing the magnet are:

- **Element assignment:** erase that one cell and write the new value.
- **appendItem:** write the new item in the first empty cell.
- **removeItem:** erase the removed value, then move each value to its right one cell to the left, working left to right. The last filled cell ends up empty.
- **insertItem:** starting from the last element, move each value one cell to the right until the target index is free, then write the new item there. Working from the right keeps students from writing over a value they still need.

Unlike the Unit 4 variable columns, students do not cross out old values in the magnet cells. Each cell is small, and the shifting commands rewrite several cells at once, so erasing and rewriting keeps the list readable. The empty cells after the last element are not part of the list, so the length is the number of filled cells.

The magnets have 7 cells, so every list in this lesson has at most 7 elements. Tell students that real lists can be much longer.

### TraceLift Flaps

The list programs have **no flaps**. Students read list values straight from the magnet cells. Flaps stay reserved for plain variables, as in Unit 4. When an expression uses a list access, students write the substituted expression beside the line on the whiteboard (for example `10 + 25`) before writing the result.

---

## Lesson Sequence Overview

| Slides | Part | Student Action |
| --- | --- | --- |
| 1 to 4 | Warm-up and motivation | Brainstorm everyday lists, then see why separate variables do not scale |
| 5 to 10 | Creating lists | Build a list on a magnet and write the command that creates it |
| 11 to 14 | Accessing elements | Read elements by index and evaluate expressions with list accesses |
| 15 to 17 | Element assignment | Trace Rounds 1A and 1B |
| 18 to 23 | Changing the list | Learn `removeItem`, `appendItem`, and `insertItem`, then trace Rounds 2A and 2B |
| 24 to 25 | Videos | Code.org lists videos |
| 26 to 29 | Wrap-up | Vocabulary, data abstraction, AP exam notation, and exit ticket |

---

## Presentation and Teaching Plan

### Slide 2: Warm-Up (Resonance)

Students answer a free-response question: name one list of information they run into every day and explain why it is useful to keep that information together. Share a few responses, then ask what would be harder if the same information were not kept together in a list.

Likely answers include playlists, contacts, group chat messages, a class roster, a grade book, a leaderboard, and a weekly schedule.

### Slides 3 and 4: A Variable Holds One Value

Review the Unit 4 model with `var myName = "José";`. Then show the seven temperature variables, one per day of the week. Pairs discuss the challenges of storing 10, 100, or 1,000 values with only variables.

Push for concrete problems: inventing and remembering every name, not being able to ask for "the third day," and having to type every name to compute an average.

### Slides 6 to 8: The List Magnet, Make a List, and Vocabulary

Introduce the magnet as the whiteboard picture of a list. Pairs choose a name, write it above the magnet, and fill in 2 to 4 values. They share it with a nearby group by reading it aloud as "at index 0 is ..., at index 1 is ...". Keep these lists on the boards for the next few activities.

Then name the parts: each value is an **element**, each element has an **index** starting at 0, and the **length** is how many elements the list contains. Point out that the last index is always one less than the length.

### Slides 9 and 10: Creating a List in Code

Step through `var myList = ["pizza", 4];`. The right side builds the list, then the name gets it. Pairs then write the command that creates their own list and the command that creates another group's list, and check each other's work.

Common errors are parentheses or braces instead of square brackets, missing commas, and missing quotes on strings.

### Slides 11 and 12: Accessing an Element

Step through `console.log(lunchFood[1]);`. On the board, the cell being read is highlighted in blue. Students find the magnet named `lunchFood` and read cell 1.

Slide 12 is a Resonance check with two questions: what `lunchFood[2]` accesses (`"nachos"`) and what `lunchFood[0]` accesses (`"pizza"`). Students who answer `"soup"` for index 2 are counting from 1.

### Slides 13 and 14: Lists in Expressions

Use the Unit 4 routine of **look up, substitute, evaluate**. The only new part is where the value lives. Pairs then write three expressions that use their own list, trade boards with another group, and evaluate each other's expressions.

### Slide 15: Assigning to an Element

Before stepping, pairs predict what `myNumbers` contains after line 3. Emphasize that only the assigned cell changes, and the length stays the same.

### Slides 16 and 17: Rounds 1A and 1B

Pairs trace on their whiteboards, compare with another group, and then the slide steps through the check. Each exercise slide shows a "trace this" prompt until the first step, so the board doubles as the exercise display.

- **Round 1A:** line 3 copies `"cat"` into cell 2, so both cells hold `"cat"`. Line 5 looks up `myStuff[0]` twice. Final list: `15, "cat", "cat", 30`.
- **Round 1B:** the index can be an expression. On line 3, the index `myStuff[2]` evaluates to 3, so the assignment changes cell 3. Final list: `"dog", "tree", 3, "dog"`.

### Slides 19 to 21: removeItem, appendItem, and insertItem

For each command, pairs predict the list after line 3, then the slide steps through it. Cells that change on a step are highlighted in yellow, which makes the shifting visible.

- `removeItem(list, index)` removes the element at that index. Everything to its right shifts left, and the length drops by one.
- `appendItem(list, item)` adds a new index at the end and puts the item there. Nothing else moves.
- `insertItem(list, index, item)` shifts the element at that index and everything after it one cell right, then puts the item at that index. The length grows by one.

### Slides 22 and 23: Rounds 2A and 2B

Keep the command reference visible or written on the board.

- **Round 2A:** final list `20, "pow", "bang", 5, 10`, with length 5.
- **Round 2B:** line 2 builds `"potato"` from list accesses before appending. Line 4 is the trap: after the insert on line 3, the `5` has shifted to index 2, so that is what gets removed. Final list `"to", "go", "po", "potato"`, with length 4.

### Slides 24 and 25: Videos

Two Code.org videos about lists, played through SyncDeck's synced video player.

### Slides 26 to 28: Wrap-Up

Review the AP definitions of list, element, index, and length, and connect **data abstraction** back to the temperature problem from the start of class. Slide 28 is optional: it shows the AP exam reference sheet notation, where indexes start at 1 and the commands are `APPEND`, `INSERT`, and `REMOVE`. Our magnets are numbered 0 to 6 to match App Lab.

### Slide 29: Exit Ticket (Resonance)

1. `favNums[1] + favNums[2]` for `[74, 53, 22]` is `75`.
2. After the insert, append, and remove, `nums` is `[1, 4, 6]`.
3. The length of `letters` is `3`: it grows to 4 and then shrinks back to 3.
4. Free response: indexes start at 0, so a list with n elements uses indexes 0 through n minus 1.

---

## Common Misconceptions and Responses

### "The first element is at index 1."

> Look at the magnet's index row. Counting starts at 0, so the first element is at index 0.

### "The last index is the same as the length."

> A list of length 3 uses indexes 0, 1, and 2. The last index is always one less than the length.

### "Reading an element takes it out of the list."

> Looking up `lunchFood[1]` makes a copy of the value for the expression. The cell keeps its value.

### "`removeItem` leaves an empty spot in the middle."

> Every element after the removed one shifts left, so the list never has a gap.

### "`insertItem` writes over the element that was at that index."

> Insert makes room first. The old element moves one cell to the right.

### "After an insert or remove, every element keeps its old index."

> Elements after the change shift, so their indexes change too. Round 2B depends on this.

---

## TraceLift Program Sheets

These programs have no `[[name]]` flaps, because students read list values from the magnet cells. Each round matches the exercise slide with the same name.

### Round 1A

```text
Title: Round 1A - Trace the Changes
var myStuff = [20, "hat", "pow", 5];
myStuff[1] = "cat";
myStuff[2] = myStuff[1];
myStuff[0] = myStuff[3] + 10;
myStuff[3] = myStuff[0] + myStuff[0];
```

### Round 1B

```text
Title: Round 1B - Expressions as Indexes
var myStuff = ["dog", "cat", 3, 10];
myStuff[2 - 1] = "tree";
myStuff[myStuff[2]] = myStuff[0];
```

### Round 2A

```text
Title: Round 2A - Add and Remove
var aList = [20, "hat", "pow"];
appendItem(aList, 5);
appendItem(aList, 10);
removeItem(aList, 1);
insertItem(aList, 2, "bang");
```

### Round 2B

```text
Title: Round 2B - Expressions Inside Commands
var bList = ["to", 5, "po"];
appendItem(bList, bList[2] + "ta" + bList[0]);
insertItem(bList, 2 - 1, "go");
removeItem(bList, 2);
```

### Optional Demonstration Sheets

These match the teacher demonstration slides. Print them if you want pairs to trace along during the demonstrations instead of only predicting.

```text
Title: Demo - Assigning to an Element
var myNumbers = [10, 20, 25];
myNumbers[0] = 5;
myNumbers[2] = 30;
```

```text
Title: Demo - removeItem
var myNumbers = [10, 20, 25];
removeItem(myNumbers, 1);
removeItem(myNumbers, 0);
```

```text
Title: Demo - appendItem
var myNumbers = [10];
appendItem(myNumbers, 50);
appendItem(myNumbers, 100);
```

```text
Title: Demo - insertItem
var nums = [10, 50];
insertItem(nums, 1, 20);
insertItem(nums, 1, 100);
```
