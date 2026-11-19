# Unit 6: Lists, Loops, and Traversals

**Course:** AP Computer Science Principles

**Grouping:** Pairs at stand-up whiteboards

**Core Tools:** dry-erase list magnets (7 cells, indexes 0 to 6), the magnetic line pointer, and TraceLift printable program sheets

This plan covers the whole unit and grows as each lesson's slides are converted. The shared whiteboard routines come first, then a section for each lesson, then the misconceptions and TraceLift program sheets for every lesson.

| Lesson | Slides | Focus |
| --- | --- | --- |
| 6.1 Lists Explore | `6.1-lists-explore.html` (29 slides) | Creating lists, accessing elements, element assignment, `appendItem`, `insertItem`, `removeItem` |
| 6.2 Lists Investigate | `6.2-lists-investigate.html` (16 slides) | A computer lesson: list length, the random element and next element patterns in real apps, and lists from the Data tab |
| 6.4 Lists Make | `6.4-lists-make.html` (13 slides) | A computer lesson: each student builds the Reminder App with a list, `appendItem`, the List Scrolling Pattern, and `updateScreen` |

---

## Unit Overview

In Unit 4, students learned to trace programs by keeping a Memory Trace on a whiteboard, with one column per variable and one current value in each column. Unit 6 extends that model to lists. A list is still one named variable, but it holds a whole ordered collection of values. On the whiteboard, students write the list's name and place a list magnet under it. Each cell of the magnet holds one element, and the printed index row under the cells shows each element's index.

The conceptual progression for the unit starts with:

> **A variable names one value. A list names an ordered collection of values, and each value is found by its index.**

The Code.org version of Lesson 6.1 uses gallon and sandwich baggies. The magnets replace the baggies: the name written above the magnet plays the role of the big labeled bag, and each cell plays the role of one small numbered bag.

On the slides for whiteboard lessons, every trace board draws each list as the same 7-cell magnet. A cell that changes on a step is highlighted in yellow, and a cell being read is highlighted in blue, so the screen matches what pairs should have on their whiteboards.

---

## Materials

Each pair needs:

- One stand-up whiteboard, a dry-erase marker, and an eraser.
- The magnetic line pointer from Unit 4.
- One or two list magnets (one for their own list and one for copying another group's list or tracing a second list).
- The TraceLift program sheets for the lesson's tracing rounds (see the last section of this plan).

Investigate and Make lessons such as 6.2 and 6.4 happen at the computers instead, with no whiteboards or TraceLift sheets.

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

The TraceLift sheet holds the numbered program. Students move the pointer beside the next line to run. To trace a second click of a button (or a second pass through the same lines), they move the pointer back up and run those lines again.

### Memory Trace

When a line creates a list, students write the list's name and put a magnet under it. They fill the cells from index 0 with no gaps. Strings keep their quotes. Plain variables, such as an `index` variable, still get a Unit 4 column next to the magnets, with old values crossed out.

The rules for changing a magnet are:

- **Element assignment:** erase that one cell and write the new value.
- **appendItem:** write the new item in the first empty cell.
- **removeItem:** erase the removed value, then move each value to its right one cell to the left, working left to right. The last filled cell ends up empty.
- **insertItem:** starting from the last element, move each value one cell to the right until the target index is free, then write the new item there. Working from the right keeps students from writing over a value they still need.

Unlike the variable columns, students do not cross out old values in the magnet cells. Each cell is small, and the shifting commands rewrite several cells at once, so erasing and rewriting keeps the list readable. The empty cells after the last element are not part of the list, so the length is the number of filled cells, and reading a cell past the end gives `undefined`.

The magnets have 7 cells, so every whiteboard list has at most 7 elements. Tell students that real lists, like a column from a dataset, can be much longer.

### TraceLift Flaps

List accesses get **no flaps**. Students read list values straight from the magnet cells, and when an expression uses a list access, they write the substituted expression beside the line (for example `10 + 25`) before writing the result.

Flaps stay reserved for **plain variables**, as in Unit 4. If a later program uses a plain variable as an index, put its flap inside the list's brackets with a space on each side, as in `tops[ [[index]] ]`, so the flap's brackets never run into the list's own brackets.

---

## Lesson 6.1: Lists Explore

**Suggested Length:** 50 to 60 minutes

**Slides:** `6.1 - Lists Explore/6.1-lists-explore.html` (29 slides)

### Goals

By the end of the lesson, students should be able to:

- Explain that a list is an ordered collection of elements stored under one name.
- Use the terms element, index, and length correctly, and explain why the last index is one less than the length.
- Write the command that creates a list with square brackets and commas.
- Evaluate an expression that contains list accesses by looking up each element, substituting it, and evaluating.
- Trace an element assignment such as `myNumbers[0] = 5;`, including one whose index is an expression.
- Trace `appendItem`, `insertItem`, and `removeItem`, including the elements that shift and the change in length.
- Explain that lists are a data abstraction.

### Big Ideas

Use these phrases consistently:

- **A list is one variable that holds many values in order.**
- **Indexes start at 0.**
- **The length is how many elements the list has.**
- **Evaluate first, then assign.** This applies to the right side, to the index, and to every argument of a list command.
- **Accessing an element does not change it.**
- **Insert and remove shift every element after the change.**

Read element assignment the same way as variable assignment: `myNumbers[0] = 5;` is "myNumbers at index 0 gets 5."

### Sequence

| Slides | Part | Student Action |
| --- | --- | --- |
| 1 to 4 | Warm-up and motivation | Brainstorm everyday lists, then see why separate variables do not scale |
| 5 to 10 | Creating lists | Build a list on a magnet and write the command that creates it |
| 11 to 14 | Accessing elements | Read elements by index and evaluate expressions with list accesses |
| 15 to 17 | Element assignment | Trace Rounds 1A and 1B |
| 18 to 23 | Changing the list | Learn `removeItem`, `appendItem`, and `insertItem`, then trace Rounds 2A and 2B |
| 24 to 25 | Videos | Code.org lists videos |
| 26 to 29 | Wrap-up | Vocabulary, data abstraction, AP exam notation, and exit ticket |

### Teaching Plan

#### Slide 2: Warm-Up (Resonance)

Students answer a free-response question: name one list of information they run into every day and explain why it is useful to keep that information together. Share a few responses, then ask what would be harder if the same information were not kept together in a list.

Likely answers include playlists, contacts, group chat messages, a class roster, a grade book, a leaderboard, and a weekly schedule.

#### Slides 3 and 4: A Variable Holds One Value

Review the Unit 4 model with `var myName = "José";`. Then show the seven temperature variables, one per day of the week. Pairs discuss the challenges of storing 10, 100, or 1,000 values with only variables.

Push for concrete problems: inventing and remembering every name, not being able to ask for "the third day," and having to type every name to compute an average.

#### Slides 6 to 8: The List Magnet, Make a List, and Vocabulary

Introduce the magnet as the whiteboard picture of a list. Pairs choose a name, write it above the magnet, and fill in 2 to 4 values. They share it with a nearby group by reading it aloud as "at index 0 is ..., at index 1 is ...". Keep these lists on the boards for the next few activities.

Then name the parts: each value is an **element**, each element has an **index** starting at 0, and the **length** is how many elements the list contains. Point out that the last index is always one less than the length.

#### Slides 9 and 10: Creating a List in Code

Step through `var myList = ["pizza", 4];`. The right side builds the list, then the name gets it. Pairs then write the command that creates their own list and the command that creates another group's list, and check each other's work.

Common errors are parentheses or braces instead of square brackets, missing commas, and missing quotes on strings.

#### Slides 11 and 12: Accessing an Element

Step through `console.log(lunchFood[1]);`. Students find the magnet named `lunchFood` and read cell 1.

Slide 12 is a Resonance check with two questions: what `lunchFood[2]` accesses (`"nachos"`) and what `lunchFood[0]` accesses (`"pizza"`). Students who answer `"soup"` for index 2 are counting from 1.

#### Slides 13 and 14: Lists in Expressions

Use the Unit 4 routine of **look up, substitute, evaluate**. The only new part is where the value lives. Pairs then write three expressions that use their own list, trade boards with another group, and evaluate each other's expressions.

#### Slide 15: Assigning to an Element

Before stepping, pairs predict what `myNumbers` contains after line 3. Emphasize that only the assigned cell changes, and the length stays the same.

#### Slides 16 and 17: Rounds 1A and 1B

Pairs trace on their whiteboards, compare with another group, and then the slide steps through the check. Each exercise slide shows a "trace this" prompt until the first step, so the board doubles as the exercise display.

- **Round 1A:** line 3 copies `"cat"` into cell 2, so both cells hold `"cat"`. Line 5 looks up `myStuff[0]` twice. Final list: `15, "cat", "cat", 30`.
- **Round 1B:** the index can be an expression. On line 3, the index `myStuff[2]` evaluates to 3, so the assignment changes cell 3. Final list: `"dog", "tree", 3, "dog"`.

#### Slides 19 to 21: removeItem, appendItem, and insertItem

For each command, pairs predict the list after line 3, then the slide steps through it.

- `removeItem(list, index)` removes the element at that index. Everything to its right shifts left, and the length drops by one.
- `appendItem(list, item)` adds a new index at the end and puts the item there. Nothing else moves.
- `insertItem(list, index, item)` shifts the element at that index and everything after it one cell right, then puts the item at that index. The length grows by one.

#### Slides 22 and 23: Rounds 2A and 2B

Keep the command reference visible or written on the board.

- **Round 2A:** final list `20, "pow", "bang", 5, 10`, with length 5.
- **Round 2B:** line 2 builds `"potato"` from list accesses before appending. Line 4 is the trap: after the insert on line 3, the `5` has shifted to index 2, so that is what gets removed. Final list `"to", "go", "po", "potato"`, with length 4.

#### Slides 24 and 25: Videos

Two Code.org videos about lists, played through SyncDeck's synced video player.

#### Slides 26 to 28: Wrap-Up

Review the AP definitions of list, element, index, and length, and connect **data abstraction** back to the temperature problem from the start of class. Slide 28 is optional: it shows the AP exam reference sheet notation, where indexes start at 1 and the commands are `APPEND`, `INSERT`, and `REMOVE`. Our magnets are numbered 0 to 6 to match App Lab.

#### Slide 29: Exit Ticket (Resonance)

1. `favNums[1] + favNums[2]` for `[74, 53, 22]` is `75`.
2. After the insert, append, and remove, `nums` is `[1, 4, 6]`.
3. The length of `letters` is `3`: it grows to 4 and then shrinks back to 3.
4. Free response: indexes start at 0, so a list with n elements uses indexes 0 through n minus 1.

---

## Lesson 6.2: Lists Investigate

**Suggested Length:** 50 to 60 minutes

**Slides:** `6.2 - Lists Investigate/6.2-lists-investigate.html` (16 slides)

**Setting:** pairs at computers in the Code.org levels. There are no whiteboards, magnets, or TraceLift sheets in this lesson. The projected trace boards draw each list at its real length.

### Goals

By the end of the lesson, students should be able to:

- Use `list.length` to find how many elements a list has, and `list.length - 1` to find its last index.
- Explain why `list[list.length]` is `undefined`.
- Read an app's code and explain how it uses a list.
- Explain the **random element** pattern, `randomNumber(0, list.length - 1)`, and explain why its range is exactly the list's indexes.
- Explain the **next element** pattern, where an index variable moves by one and wraps back to 0 after the last index.
- Explain that `getColumn` returns a list made from one column of a dataset.

### Big Ideas

- **The last index is always `length - 1`.**
- **A random index should go from 0 to `length - 1`, so every pick is a real element.**
- **An index variable is a plain variable.** It holds a number that says which element to use, and the list itself stays the same.

### Sequence

| Slides | Part | Student Action |
| --- | --- | --- |
| 1 to 5 | Warm-up and list length | Compare lists and variables, watch the length video, trace `.length`, and check |
| 6 to 7 | Outfit Picker or Band Namer | Read one app in Code.org, answer its questions, and explain it to another group |
| 8 to 10 | Two list patterns | Step through the random element and next element patterns, then predict a wrap-around |
| 11 to 12 | Pair Maker | Watch the video, then every group reads the Pair Maker app |
| 13 to 15 | Lists from data | Explore the Data tab, watch the video, and print a column with `getColumn` |
| 16 | Exit ticket | Random index range and a reflection for the practice lesson |

### Teaching Plan

#### Slide 2: Warm-Up (Resonance)

Two free-response questions: similarities and differences between lists and variables, and how a list helps manage complexity.

Similarities: both have a name, follow the same naming rules, are created with `var`, and can be assigned. Differences: a list holds many values in order, is accessed by index, and can change length. A list manages complexity because one name and one piece of code can handle any number of values.

#### Slides 3 to 5: List Length

After the Code.org video, step through `tops.length` and `tops[tops.length - 1]` on the projected board. On the board, the length is the number of cells. The Resonance check asks for the last index of a 5-element list (4) and what `tops[tops.length]` accesses (`undefined`, because index 3 is past the end). Off-by-one mistakes like this are among the most common list bugs.

#### Slides 6 and 7: Outfit Picker or Band Namer

Pairs choose one app, read the program in Code.org, run it, and answer its questions. Split the room roughly in half so every pair can find a group with the other app. Then groups spend 3 to 4 minutes each explaining their app to a group that read the other one. Steer the share toward how each app chooses which element to show.

#### Slides 8 to 10: Two List Patterns and a Prediction

- **Random element (Band Namer):** `randomNumber(0, nouns.length - 1)` picks a whole number from 0 to the last index, both ends included. The projected board pretends the random pick came out as 2. Ask what would go wrong with `randomNumber(0, nouns.length)`: sometimes it would pick an index past the end.
- **Next element (Outfit Picker):** each click adds 1 to `index`, and an `if` sends it back to 0 when it passes the last index. The demonstration starts at index 0, so the condition is false and the app shows `"tee"`.
- **Wrapping around (slide 10):** pairs predict what one click shows when `index` starts at the last index (2), then step through it. Index becomes 3, the condition `3 > 2` is true, index wraps to 0, and the app shows `"hoodie"`. A second click would show `"tee"`.

#### Slides 11 and 12: Pair Maker

After the video, every group reads the Pair Maker app and answers its questions. Connect it to 6.1: the Add button uses `appendItem`, the Remove button uses `removeItem`, and the random pair uses the random element pattern on a list whose length changes.

#### Slides 13 to 15: Lists From Data

Pairs go to Level 4, run the app, and investigate the Data tab for about 5 minutes. (The Code.org slide used a YouTube timer here; use any classroom timer.) After the Data tab video, introduce `getColumn(table, column)`: it returns an ordinary list holding every value in one column, so accesses, `.length`, and the random element pattern all work on it. Pairs import a dataset and modify the code to print one column. A dataset column can have hundreds of values, which is exactly why lists matter: one name and one line of code handle all of them.

#### Slide 16: Exit Ticket (Resonance)

1. `randomNumber(0, nouns.length - 1)` for a 5-element list produces indexes 0 to 4.
2. Free response: what parts of using lists students already understand, and what they want to dig into during the practice lesson. Use these to plan the start of 6.3.

---

## Lesson 6.4: Lists Make

**Suggested Length:** 50 to 60 minutes

**Slides:** `6.4 - Lists Make/6.4-lists-make.html` (13 slides)

**Code.org:** [Lesson 4, Level 1](https://learn.mycode.run/link/xnycx)

**Setting:** the deck is short so students get to work fast. Students work at computers in the Code.org levels. They try the app and plan with a partner, but each student builds and submits their own Reminder App. There are no whiteboards, magnets, or TraceLift sheets in this lesson. The projected trace boards draw each list at its real length.

### Goals

By the end of the lesson, students should be able to:

- Plan an app's storage: one list for the reminders and one `index` variable for the reminder on screen.
- Use the **List Scrolling Pattern**, where the left and right buttons move `index` by one and stop at `0` and `length - 1`.
- Add an element with `appendItem` and set `index = list.length - 1` so the screen shows the new element.
- Use an `updateScreen` function, called from every `onEvent`, to show `list[index]`.
- Check an app against the rubric before submitting.

### Big Ideas

- **The list holds the data, and `index` says which element is on screen.** Scrolling changes `index`, not the list.
- **The scrolling pattern stops at the ends.** Unlike the Outfit Picker in 6.2, which wrapped back to the start, the counter pattern with a boundary keeps `index` from going below `0` or past `length - 1`.
- **After `appendItem`, the newest element is always at `length - 1`.**

### Sequence

| Slides | Part | Student Action |
| --- | --- | --- |
| 1 to 3 | The Reminder App | See the app, then try the finished version in Code.org |
| 4 to 5 | Plan | Learn the screen element ids and plan the list and `index` variable |
| 6 to 7 | Build | Plan in the activity guide, then follow the Get Started steps |
| 8 | Debugging | Match what the app does to a likely cause; press down for hints |
| 9 to 12 | Hints (below slide 8) | The List Scrolling Pattern, then worked examples of the right button, the last element, and the Add button |
| 13 | Submit | Check the app against the rubric and submit |

### Teaching Plan

#### Slides 2 and 3: Try the App

Students open Lesson 4, Level 1 and try the finished app: they add several reminders and scroll through them in both directions. Ask what happens at the first and last reminder. The arrows stop there and do nothing, which is the boundary in the List Scrolling Pattern. While they try it, ask how many lists the app needs (one, a list of the reminders, plus one plain `index` variable).

#### Slides 4 and 5: Plan

Slide 4 labels the five element ids from the activity guide: `reminderOutput`, `leftButton`, `rightButton`, `reminderInput`, and `addButton`. Three of them need an `onEvent`. Slide 5 matches the activity guide's two tables: a list (`reminders`, which starts as `[]`) and the `index` variable.

#### Slides 6 and 7: Build

Check plans before students start coding. A good plan has one list, one `index` variable, three `onEvent`s (left, right, and Add), and one `updateScreen` function. Step 3 of the activity guide has build steps students can follow. Leave slide 7 (Get Started) or slide 8 (Debugging Your App) up during build time.

#### Slide 8: Debugging Your App

Before answering a "my app is broken" question, ask which card matches what the student sees:

- **The screen shows `undefined`:** `index` went past the end, usually because the right button's condition uses `length` instead of `length - 1`.
- **A new reminder does not appear:** the Add button does not set `index` or does not call `updateScreen`.
- **Nothing happens on a click:** the id in `onEvent` does not match the element, or there is an error in the console.

A callout at the bottom tells students to press the down arrow for hints.

#### Slides 9 to 12: Hints (Vertical Stack Under Slide 8)

These are for students who are stuck; they are not taught to the whole class.

- **Hint 1, the List Scrolling Pattern (slide 9):** the pattern from the activity guide. Each button uses the counter pattern with a boundary, and both call `updateScreen`, which shows `myList[index]`.
- **Hint 2, the right button (slide 10):** `index` starts at 1 (the apple). The condition `1 < 2` is true, so `index++` makes it 2 and the screen shows `"pear"`. `console.log` stands in for `updateScreen` on the boards.
- **Hint 3, the last element (slide 11):** `index` starts at 2. The condition `2 < 2` is false, so `index` stays 2 and the screen still shows `"pear"`. Unlike the Outfit Picker in 6.2, the pattern stops instead of wrapping around.
- **Hint 4, the Add button (slide 12):** the user types "Call Grandma". `appendItem` adds it at index 2, `index = reminders.length - 1` makes `index` 2, and the screen shows the new reminder. `index = index + 1` would only work when the user happens to be on the last reminder already.

#### Slide 13: Check Your Work

The checklist is the Extensive Evidence column of the rubric: input, variables and lists, processing lists, functions, output, running without errors, and coding comments. The new row in this lesson is **Processing: Lists**, which means the list is appended to and read correctly for every element of the user interface. Students check every row before they click Submit.

---

## Common Misconceptions and Responses

### "The first element is at index 1."

> Look at the magnet's index row. Counting starts at 0, so the first element is at index 0.

### "The last index is the same as the length."

> A list of length 3 uses indexes 0, 1, and 2. The last index is always one less than the length, so the last element is `list[list.length - 1]`.

### "Reading an element takes it out of the list."

> Looking up `lunchFood[1]` makes a copy of the value for the expression. The cell keeps its value.

### "`removeItem` leaves an empty spot in the middle."

> Every element after the removed one shifts left, so the list never has a gap.

### "`insertItem` writes over the element that was at that index."

> Insert makes room first. The old element moves one cell to the right.

### "After an insert or remove, every element keeps its old index."

> Elements after the change shift, so their indexes change too. Round 2B depends on this.

### "`randomNumber(0, list.length)` picks a random element."

> `randomNumber` includes both ends, so this sometimes picks `list.length`, which is one past the last index. Use `list.length - 1` as the upper end.

### "If the program shows the wrong thing, the list must be wrong."

> Check the index first. A blank or `undefined` usually means the index went past the end of the list.

---

## TraceLift Program Sheets

List accesses have no `[[name]]` flaps, because students read list values from the magnet cells. Each round matches the exercise slide with the same name. Lessons done at the computers, such as 6.2, have no sheets.

### Lesson 6.1 Sheets

#### Round 1A

```text
Title: Round 1A - Trace the Changes
var myStuff = [20, "hat", "pow", 5];
myStuff[1] = "cat";
myStuff[2] = myStuff[1];
myStuff[0] = myStuff[3] + 10;
myStuff[3] = myStuff[0] + myStuff[0];
```

#### Round 1B

```text
Title: Round 1B - Expressions as Indexes
var myStuff = ["dog", "cat", 3, 10];
myStuff[2 - 1] = "tree";
myStuff[myStuff[2]] = myStuff[0];
```

#### Round 2A

```text
Title: Round 2A - Add and Remove
var aList = [20, "hat", "pow"];
appendItem(aList, 5);
appendItem(aList, 10);
removeItem(aList, 1);
insertItem(aList, 2, "bang");
```

#### Round 2B

```text
Title: Round 2B - Expressions Inside Commands
var bList = ["to", 5, "po"];
appendItem(bList, bList[2] + "ta" + bList[0]);
insertItem(bList, 2 - 1, "go");
removeItem(bList, 2);
```

#### Optional Demonstration Sheets

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
