# Troubleshooting and Diagnosis Activities

Read this when planning or building an activity where students find a hidden fault from evidence.

Activities where students find a hidden fault from evidence work well in every course, not just
the hardware ones: a program with a bug, a circuit that misbehaves, a network that drops, a lab
setup that gives bad data. When a topic has a "something is wrong, find out what" angle, suggest
one. The AR2 AC Motors Day 5 Work Orders (`buildWorkOrders` in
`Decks/AR2/ACMotors/Day5_Motor_Selection_and_Troubleshooting.html`, described in the activities
index) is a worked example, but the engine won't fit every subject. Carry over the design, not
necessarily the code:

- **A hidden cause among several plausible ones.** Each scenario has three or four causes that all
  fit the reported symptom. Deal them from a shuffled deck so that "new fault" shows every cause
  once before any repeats; plain random picks repeat too often.
- **Tests return evidence, not answers.** A test shows a reading (a meter value, an error message,
  a log line, a variable's value), and only some tests read differently across the causes.
  Irrelevant tests return real but unhelpful data, so students learn to choose tests that tell
  the causes apart.
- **Each test has a cost** (time, downtime, money) against a budget. Tune it so a careful path
  finishes with time to spare and running every test does not fit. Give the unsafe or bad-practice
  choices a cost on the same scale, and charge it, so a missing cost never gives them away.
- **Unsafe or bad-practice choices sit beside the right ones.** Examples: working on live
  equipment, editing production code, deleting data to make an error go away. They are never
  carried out; they show a warning that names the hazard and the correct procedure, and they
  count against safety in the record.
- **Context with leads and noise.** A history log (recent changes, past failures) gives one
  lead for each possible cause plus at least one entry that does not matter, oldest to newest. It
  should point students to tests, not to answers.
- **Rule out, diagnose, defend.** Students strike out the causes their evidence rules out, and
  each strike earns credit only when one of their own readings actually rules that cause out.
  They then choose a cause and a fix (include a distractor cause and a fix that hides the symptom
  instead of curing it). Finally they tag the readings that support their diagnosis; that earns
  credit only when the diagnosis is right.
- **A record that scores each step and explains the cause:** key evidence, safety, ruling out,
  diagnosis, fix, and defense, plus the cost used and a short explanation that ties the real
  cause back to the lesson.
