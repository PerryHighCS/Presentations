# Python Lists Unit: Collaborative Review Detective

**Status:** Working planning draft, October 2026  
**Audience:** Instructor planning reference, not yet a student assignment  
**Purpose:** Guide the development of lessons, investigations, assessments, and a culminating collaborative project.

## The Big Idea

Students build a Python program that analyzes the language used in consumer reviews and investigates what automated analysis can and cannot tell us.

**Driving question:** *Can a program help us understand consumer reviews, and when might its conclusions be misleading?*

This extends an earlier CSV data analysis project. Instead of reading records and summarizing columns, students write algorithms that examine and transform **sequences of words**. The work should result in a meaningful investigation, not a demonstration of list syntax disguised as an application.

The project borrows the language and sentiment investigation idea from the AP CSA Consumer Review Lab and the open inquiry spirit of the AP CSA Data Lab. It is **not** intended as a direct Python translation of either lab.

## Nonnegotiable Design Constraints

1. **One dimensional lists are the primary data structure.** Do not require two dimensional lists, dictionaries, sets, classes, or other collections not yet taught.
2. **Every student writes substantial list processing code.** Do not divide the team into a list programmer, an input programmer, and a presentation programmer.
3. **Students develop independently testable modules.** A teammate's unfinished code should not prevent progress.
4. **The project is meaningful.** Students must interpret findings, challenge assumptions, and investigate the limitations of simplistic language analysis.
5. **VS Code is the permanent workspace.** Students retain their code and build on it across lessons. MobCode is reserved for brief shared tracing, prediction, and debugging activities.
6. **GitHub introduces basic collaboration and version control.** Initially use separate student owned Python files within a common repository. Keep the workflow simple.
7. **Function interfaces are agreed upon before integration.** Students can test modules against shared sample inputs.
8. **Individual understanding matters more than commit count.** Use code review, traces, tests, and short individual explanations as evidence.

## Provisional Student Product

A console based **Review Detective** program that takes one or more sample reviews and produces a combined analysis of the language. Depending on the final design, it may:

- Estimate positive and negative sentiment using word lists or corresponding scores.
- Describe vocabulary patterns, repetition, or commonly used words.
- Investigate signs of exaggerated or conflicting language, without pretending to prove a review is authentic or fake.
- Compare the original review with a deliberately modified version to expose the limitations of the analysis.
- Report findings in understandable language and support conclusions with examples from the reviews.

A simple text file can supply review text. Avoid building a complex interface or data ingestion system.

## Provisional Team Architecture

**Preferred team size:** Three, with adjustments for pairs or groups of four.

All students receive the same review data and implement separate algorithms that can be tested on their own.

| Module | Possible investigation | Required emphasis | Status |
| --- | --- | --- | --- |
| Sentiment Detective | Identify positive and negative language and calculate a defensible sentiment estimate | Searching lists, counting, filtering, accumulating results | Candidate |
| Language Detective | Analyze vocabulary, repetition, and word frequency | Building lists, membership checks, sorting, slicing, transforming | Candidate |
| Review Investigator | Investigate exaggeration, conflicting signals, or the effect of changing language | Comparing lists, filtering, mutation versus copying, transformations | **Needs refinement for comparable rigor** |

**Important:** These are starting points, not final role assignments. Before approving the project, verify that each module demands similarly challenging one dimensional list algorithms. Avoid a role whose job is primarily writing reports or managing input.

### Integration principle

Modules should depend on the same **agreed upon inputs and outputs**, not on one another's implementation. A small shared `main.py` can call completed functions and assemble the results. Stub functions and sample test cases can allow integration before every algorithm is finished.

A possible repository structure, subject to revision:

```text
review-detective/
    main.py                 # Shared integration
    sentiment.py            # Student A
    language.py             # Student B
    investigator.py         # Student C
    sample_reviews.txt      # Shared sample input
    README.md               # Team instructions and findings
```

## Individual Programming Expectations

Each student should be able to point to code they wrote that:

- Creates and populates one dimensional lists.
- Traverses lists with loops.
- Searches, counts, or filters values using conditions.
- Builds a new list by transforming or selecting values from another list.
- Performs and explains an intentional list mutation.
- Defines and tests multiple functions that use lists as arguments or results.
- Distinguishes when a function mutates an argument versus returns a new result.
- Explains representative code traces, including relevant reference or alias behavior.

These are **proposed assessment criteria**, not rigid requirements that every function must mutate a list. In particular, mutation should happen where it makes sense and be documented clearly.

## Teaching Approach Leading Into the Project

Design the unit around programming tasks and conceptual investigations, **not** one long presentation of the List API.

| Stage | Main concepts | Learning experience | Connection to project |
| --- | --- | --- | --- |
| 1. Store and inspect | Creating lists, indexing, slicing, `len`, loops | Small VS Code explorations using strings and lists | Represent a review as a list of words |
| 2. Search and summarize | `in`, `count`, `index`, basic built in functions | Investigate word lists and summarize findings | Find interesting words and patterns |
| 3. Change a list | Element assignment, `append`, `insert`, `remove`, `pop` | List editing experiments | Revise or clean review text |
| 4. Understand identity | Mutability, aliases, copies, `is` versus `==` | Predict, trace, and model references physically | Avoid unintended changes to shared inputs |
| 5. Process lists | Filtering, transformation, functions, gathering results | Build and test reusable algorithms | Develop individual analysis modules |
| 6. Debug mutation | Removing items while iterating, index shifts | Broken code investigation and manual tracing | Make filtering and cleaning reliable |
| 7. Choose behavior | Mutating versus nonmutating functions | Implement and compare both styles | Define predictable module interfaces |
| 8. Refactor | Sorting, reversing, comprehensions, `split`, `join` | Improve prior code without changing its meaning | Refine and integrate final program |

The order is adjustable. Introduce operations when students need them, rather than presenting all functions and methods up front.

### Four complementary learning environments

**VS Code:** Main space for writing, saving, testing, and revising actual programs. Students should retain small labs that become references and possible foundations for the final project.

**Presentation and MobCode:** Brief predictions, code reading, error diagnosis, and interactive traces. These are shared investigations, not substitutes for permanent student code.

**Manual and physical tracing:** Build on memory traces students already know from CSP. Use whiteboard object boxes and retractable magnetic arrows to model variables referring to list objects. Have students predict and draw what happens when references are copied, lists are mutated, or variables are reassigned.

**Student constructed List Programmer's Reference:** Students accumulate examples and explanations as they discover operations. For each entry, capture the syntax, what it does, what it returns, whether it mutates the existing list, and a short verified example. Include surprising cases such as `append()` returning `None`, `pop()` returning the removed element, `sorted(L)` versus `L.sort()`, and `L = L + M` versus `L += M`.

## Code Tracing Throughout

Do not save code tracing for the end of the unit. Increase complexity in stages:

1. Identify indexes, slices, and loop results.
2. Track values before and after list methods.
3. Draw two variables referring to the same list versus separate copies.
4. Trace list parameters, mutations, and reassignment inside functions.
5. Diagnose index shifting when elements are removed during loops.
6. Trace several interacting list operations and explain the state after each step.

A repeated protocol can be **predict → manually trace → run → explain**.

## First GitHub Collaboration Workflow

Start with one repository per team and clearly designated file ownership. Students use VS Code's Source Control interface for a simple cycle:

**Pull → edit and test your own file → commit with a meaningful message → push.**

Teach that a push may be rejected if a teammate has pushed first. Pull and integrate the latest changes before trying again. Separate files reduce merge conflicts but do not eliminate coordination problems. Postpone branches and pull requests unless the class is ready for them.

Before integration, students should agree on function names, parameters, return values, and whether each function changes its inputs. Provide or co-develop small test cases that all teammates can run independently.

## Potential Culminating Investigation

Give the team a review with mixed positive and negative statements. Their program analyzes it. Students then deliberately change wording, repeat certain adjectives, or replace selected words and run the same analysis again.

**Questions to investigate:**

- Which edits changed the program's conclusion?
- Did the review's meaning actually change?
- What evidence did the algorithms overlook?
- Do the modules agree, and what might explain disagreement?
- What would the team change if the program were used in a real purchasing decision?

Avoid claiming that simple heuristics can reliably detect fake reviews or that a sentiment score represents an objective truth.

## Planning Questions Still Open

- What source of review text is appropriate, manageable, and interesting to students?
- What are the exact three module contracts, and how do we ensure equivalent complexity?
- Should teams investigate one review at a time or compare several reviews?
- Should sentiment use a provided word and score dataset or student defined word lists?
- What is the minimal integrated deliverable, and what features are optional extensions?
- At what point in the unit should teams receive the project and GitHub repository?
- What individual evidence will count toward the authentic assessment component?
- How many class periods should be reserved for project development and integration?

## Working Definition of Success

By the end of the unit, **every student can design, implement, trace, test, and explain algorithms involving one dimensional lists**, including the consequences of mutable objects and shared references. Teams have a functioning, collaboratively built Python program that uses those algorithms to investigate reviews and communicate both findings and limitations.

The project should make list operations necessary, rather than merely visible.
