## **SECTION 1: Quick Refresher**

## **Slide 1 – Create Task Survival Guide**

### **Slide 2 – What Have We Been Practicing?**

*FRQ*:  What have we already done to prepare for the create task?

### **Slide 3 – The Big 3 (Core Requirements)**

**Your program must include:**

* A **List (or Group)**  
* A **Procedure**  
* An **Algorithm (with sequencing, selection, iteration)**

## **SECTION 2: The Official Requirements**

### **Slide 4 – What You Must Submit**

*FRQ*: Look at the General Requirements on the first page of the Create Performance Task Student Handout. What are the 3 things you will need to turn in?

### **Slide 5 – Who will work on this?**

At the top of the first page there are 3 paragraphs introducing the project. Look through those paragraphs. 

### **Slide 6 – Purpose vs Functionality**

*FRQ*: What is the difference between purpose and functionality?

### **Slide 7 – Purpose vs Functionality**

* Purpose \= WHY the program exists  
* Functionality \= WHAT it does and HOW

### **Slide 8 – Mini Check**

      *MCQ*:

1. Which of these describes the purpose of a program?  
2. Which of these describes the functionality of a program?

### **Slide 9 – Program Code Requirements**

Your program **must** include:

* Input   
  * What counts as input?  
* Output  
  * What counts as output?  
* List (manages complexity)  
* Student developed procedure (with parameter)  
* Algorithm (Sequencing \+ Selection \+ Iteration)  
* Call to procedure

### **Slide 10 – What Counts as “Student-Developed”**

* ❌:  
  * event handlers  
    * What are examples of event handlers we have seen?  
  * built-in functions  
  * If you didn’t write it, it doesn’t count  
* ✔:  
  * functions YOU wrote

---

### **Slide 11 – Procedure Deep Dive**

*Vertical stack, instructions first then student paced procedure (and call)  on one slide, rubric on slide below it, repeat for each*

Navigate down this stack of slides. You'll see program code followed by a rubric. You be the judge. Does each example meet the criteria?

## **Clicker Procedure**

### **Procedure Definition:**

`def onMousePress(mouseX, mouseY):`  
	`if cookie.hits(mouseX, mouseY):`  
		`score = score + 100`  
	`if score > 10000:`  
		`win()`

### **Rubric:**

	Procedure name () Yes () No  
	Parameter () Yes () No  
	Selection () Yes () No  
	Iteration () Yes () No  
	Argument and Call () Yes () No

## **Personal Finance Procedure**

### **Procedure Definition:**

```py
def checkFraud(bills):
	for bill in bills:
		if bill > 5000:
			print ("Potential fraud: ", bill)
		else:
			print ("Normal transaction: ", bill)
```

### **Procedure Call:**

```py
totalBills = [1000, 1100, 11000, 800, 6200]
checkFraud(totalBills)
```

### **Rubric:**

	Procedure name () Yes () No  
	Parameter () Yes () No  
	Selection () Yes () No  
	Iteration () Yes () No  
	Argument and Call () Yes () No

## **Magic 8 Ball Procedure** 

### **Procedure Definition:**

```py
def magig8Ball(question):
	if len(question) == 0:
		print("Invalid question. Try again.")
		askQuestion()
	else:
		timer = 3
		while timer > 0:
			print("Thinking...", timer)
			time.sleep(1)
			timer = timer - 1

		response = random.choice(responses)
		print("Magic 8 Ball says:", response
```

### **Procedure Call:**

```py
def askQuestion():
	question = input("Ask the Magic 8 Ball a question: ")
	magic8Ball(question)
```

### **Rubric:**

	Procedure name () Yes () No  
	Parameter () Yes () No  
	Selection () Yes () No  
	Iteration () Yes () No  
	Argument and Call () Yes () No

### **Slide 12 – List Requirements**

*vertical stack requirements slide followed by example and then rubric, example then rubric*

“Use of at least one list (or other collection type) to represent a collection of data that is stored and used to manage program complexity and help fulfill the program’s purpose”

### **List Checklist:**

- [ ] Your program shows where **multiple elements** are stored into a list.

- [ ] Your program uses that list to manage complexity, meaning that it makes your program easier to develop. This means that without your list, you would need to have programmed it differently or you may not have been able to program it at all.  
      In other words, if you could have achieved the same outcome using a single variable, your list does not truly manage complexity.

### **Example 1**

`if score > highScore[0]:`  
    `highScore = [score]`

`print(highScore)`

### **Rubric:**

	Poll: Does this list manage complexity in the program? () Yes () No

### **Example 2**

`totalBills = [1000, 1100, 11000]`

`for bill in totalBills:`  
	`if bill > 5000:`  
		`print("Potential fraud: ", bill)`

### **Rubric:**

	Poll: Does this list manage complexity in the program? () Yes () No  
	  
---

### **Slide 13 – Video Requirements**

*Show requirements one at a time, pause, then show checkmark or x and turn green or red*  
Show the program receiving **input from the user ✔**

Include **voice narration explaining the code ❌**

Show at least one **feature of the program working ✔**

Display the **full program code on screen ❌**

Show **output produced by the program ✔**

Include **text captions explaining what is happening ❌ (allowed but not required)**

Show the program responding to **user interaction (click, typing, etc.) ✔**

Include your **name, class period, or school ❌ (No identifying information)**

Demonstrate how the **list works internally ❌ (not explicitly \- your program will just do it)**

Show the program running from start to finish **❌ (You only have 1 minute)**

Zoom in on the **procedure code and explain it ❌ (Don't show your code or include voice)**

Include **background music ❌ (unless part of your program)**

Show different **inputs leading to different outputs ✔**

Demonstrate a **loop running ❌ (not explicitly \- your program will just do it)**

Include a **title screen with your name ❌ (No identifying information)**

Show the program handling an **if/decision  ❌ (not explicitly \- your program will just do it)**

Record your **screen only (no camera needed) ✔**

Include **debugging or error messages  ❌ (Show your program WORKING)**

Show at least one **complete interaction cycle (input → processing → output) ✔**

### **Slide 14 \- Key takeaway**

	Your video is NOT about explaining your code

Your video is about PROVING your program works

### **Slide 15 \- Academic Integrity \= Your Score**

	**Flip to page 6 of the student handouts. Look over plagiarism and the Acceptable Generative AI Use section.**

	If you submit work that is not your own → **score of 0**

This includes:

* code  
* media  
* explanations  
  If you can’t explain it yourself, don’t submit it.

### **Slide 16 \- Acceptable Collaboration**

Which of the following count as plagiarism?

Copying code from a friend

Copying code from the internet

Using AI and pasting in code

Using starter code

All of these \= plagiarism unless properly credited

### **Slide 17 \- AI Use: Allowed, But Dangerous**

### **✔ Allowed**

* Helping you understand concepts  
* Debugging  
* Explaining errors

### **❌ NOT SAFE**

* Copy/paste code you don’t understand  
* Submitting AI-written code as your own thinking

**You must be able to explain EVERYTHING in your code on the exam**

### **Slide 18 \- How to Use AI Safely**

Ask AI:

* “Explain this”  
* “Why does this work?”  
* "Why am I getting this error?"

  NOT:

* “Write my program”  
* "Write a procedure that…"

### **Slide 19 –Required Acknowledgements**

If you use:

Starter code → comment it

Internet code → cite it

AI → say it was AI-assisted

Partner → My partner wrote this:

```py
# Gemini helped write this function
# My partner wrote this procedure
# I worked with my partner to write this procedure
# This function came from a project we wrote in class
```

### **Slide 20 – Collaboration Rules**

### **You CAN:**

* Work with a partner on code

### **You CANNOT:**

* Work with anyone on:  
  * Video  
  * PPR

The PPR must be 100% your own \- Your own procedure (that meets all requirements), your own list

### **Slide 21 \- PPR (Most Important Part)**

The PPR is your key to remember what **YOU** wrote for your program on test day

* Must include:  
  * procedure \+ call  
  * list usage  
* MUST NOT include:  
  * comments  
    * Comments are an immediate 0

### **Slide 22 \- How will my project be scored?**

Your project will be submitted BEFORE April 30th. Including the Video, Program Code, and PPR.  
On test day, you will receive a copy of your PPR and have 1 hour to answer 4 questions.

Your project will will be scored on 6 points:  
	1 point \- Video

- shows input/output/functionality

	1 point \- Program requirements

- Program code includes student developed procedure, a call to that procedure, a list that is used properly, selection, iteration

	1 point for each question

Those 6 points represent 30% of AP Test score.

## **SECTION 3: How to Not Lose Points**

### **Slide 23 –  Common Mistakes**

* Parameter not used  
* No loop or no if  
* List doesn’t manage complexity  
* Procedure not student-created  
* Comments in PPR  
* Missing input/output in video  
  * How do you show keyboard input?

### **Slide 24 – Fix the Code**

This program is close… but it would NOT earn full credit on the Create Task.

Work with a partner:

1. Identify what’s missing  
2. Suggest how to fix it 

```py
scores = [10, 20, 30, 40]

def checkScores(threshold):
    for s in scores:
        print("Score:", s)

checkScores(25)
```

### **Slide 25 \- What I noticed**

 Issue 1: Parameter not used

* `threshold` exists but does nothing

Issue 2: No selection

* No `if` statement → missing selection requirement

Issue 3: Weak use of list

* List is used, but not meaningfully (just printing)

### **Slide 26 \- My fix**

```py
scores = [10, 20, 30, 40]

def checkScores(threshold):
    for s in scores:
        if s >= threshold:
            print("High score:", s)
        else:
            print("Score:", s)

checkScores(25)
```

## **SECTION 4: The 9-Hour Game Plan**

### **Slide 27 – Reality Check**

You have 9 hours. That’s it. But it's also a LOT of time.

You HAVE to work through the entire time.

No phones

No games

If you have extra time, add features

### **Slide 28 – Suggested Timeline**

**Day 1:**

* Idea \+ plan

**Day 2**:

* Start coding

**Day 3-7 (5 hrs):**

* Finish core features  
* Test  
* Build procedure \+ list correctly  
* Test  
* Stretch Goals  
* Test

**Day 8-9 (2 hrs):**

* Test  
* Record video  
* Build PPR

### **Slide 29 – Final Thought**

“Simple programs that meet all requirements score better than complex programs that miss one.”

### **Slide 30 – Planning Sheet**

 **My program idea:**  
 **Input:**  
 **List:**  
 **Procedure:**  
 **Output:**

**Stretch Goals:** *(If I "finish" before time)*

### **Slide 31 – Algorithm Planning**

* What loops?  
* What decisions?  
* What does the procedure do?

