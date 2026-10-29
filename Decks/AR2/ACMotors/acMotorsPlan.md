# AR2 Unit Plan: AC Motors, Generators, and Industrial Motor Control

**Honors Automation and Robotics 2 · 5 class periods · 45 minutes per class**

**Handouts:** [5 Day Note and Activity Records](https://drive.google.com/drive/u/0/folders/1kqLczxVce_jvGuFmFFz3nXYnz7ofPv43)

**The central question for the week will be:**
How do engineers generate electrical power, turn that power into controlled motion, and select the right motor for an industrial application?

This unit will build on students' prior experience with DC circuits, electromagnetism, capacitors, programmable controllers, and motors in their AR1 equipment. Rather than having students memorize a catalog of motor types, they'll investigate the engineering problems that led to different motor designs.

The emphasis will be on predicting behavior, experimenting with virtual systems, interpreting results, and making engineering decisions.

**Unit at a glance**

| Day | Focus |
| ----- | ----- |
| Monday (1) | Generators and phases |
| Tuesday (2) | Starting AC motors |
| Wednesday (3) | Three phase motors and VFDs |
| Thursday (4) | Robotics motors |
| Friday (5) | Diagnostics |

All investigations can run in a browser. No student purchases, physical builds, or energized AC equipment are required.

## Standards alignment

The primary reference is the [Arizona Department of Education Automation and Robotics Technical Standards, revised 2025](https://www.azed.gov/sites/default/files/2025/07/AutomationandRoboticsTS.pdf). This unit addresses all eight competencies in Standard 9.0, with the deepest treatment of 9.2, 9.5, and 9.8.

| Standard | Focus | Primary day |
| ----- | ----- | ----- |
| 9.1 | Safety by design | 3, 5 |
| 9.2 | Motor control, capacitor starting, VFDs, start and stop | 2, 3 |
| 9.3 | DC motor operation and use | 1, 4 |
| 9.4 | Stepper motors | 4 |
| 9.5 | AC motor types and applications | 2, 3 |
| 9.6 | Brushless motors | 4 |
| 9.7 | Servos | 4 |
| 9.8 | AC and DC generators | 1 |

Supporting competencies include 3.5 (equations and variables), 3.9 (theoretical versus simulated versus real behavior), 4.7 (AC versus DC), 6.6 (magnetic circuits), and 8.2 (industrial control logic).

Expected outcomes: By the end of the week, students should be able to explain the relationships between a generator's magnetic field, output waveform, and electrical phases; compare common AC motor starting methods; explain frequency based motor speed control; distinguish induction, brushed, brushless, stepper, and servo systems; and use motor specifications and diagnostic evidence to justify an engineering decision.

The instructional design below describes the five presentations and virtual investigations as built in `Decks/AR2/ACMotors/` (Day 1 to Day 5), and is the reference for revising them.

## Five Day Instructional Plan

**Course:** Honors Automation and Robotics 2  
**Duration:** Five 45 minute class periods  
**Primary Standards:** Arizona CTE Automation and Robotics 9.1 through 9.8  
**Instructional Model:** Brief direct instruction, interactive investigation, engineering analysis, and daily formative assessment

---

## Day 1: Generators, Alternating Current, and Electrical Phases

**Essential question:** Why does industry use three phase electrical power instead of just one phase?

**Standards:** 9.8, 9.3, 4.7, 6.6

### Learning objectives

Students will be able to:

1. Explain how relative motion between a magnetic field and a conductor can induce voltage.  
2. Distinguish the electrical outputs of simple AC and DC generators.  
3. Explain how multiple generator windings can create separate electrical phases.  
4. Interpret single phase and three phase AC waveforms.  
5. Identify advantages of three phase power for industrial motors and power distribution.

### Lesson sequence

**0 to 5 minutes: Hook, Where does three phase electricity come from?**

Display a residential electrical service and an industrial three phase motor connection.

Ask students:

* Both devices use alternating current. Why might they require different electrical supplies?  
* What do you think the word "phase" means?  
* Does three phase mean the electricity moves three times faster?

Collect predictions without immediately correcting them.

**5 to 12 minutes: Electromagnetic induction review**

Begin with a simplified generator containing a rotating magnet and a stationary coil.

Explain that a changing magnetic flux through a conductor loop induces voltage. Introduce Faraday's law conceptually without requiring formal calculus.

Students should recognize:

* Mechanical energy is supplied to rotate the generator.  
* Relative motion produces a changing magnetic flux.  
* The induced voltage periodically reverses polarity.  
* Faster rotation generally increases frequency and generated voltage in this simplified arrangement.  
* More turns or stronger magnetic fields can increase induced voltage.

Compare a basic AC alternator with a traditional commutator type DC generator.

Emphasize that generators and motors share electromagnetic principles, although their operation and designs differ.

**12 to 18 minutes: Introducing electrical phases**

Add a second stator winding to the virtual generator.

Ask students to predict whether its voltage will have the same waveform as the first winding.

Introduce phase difference as the separation between two periodic signals, measured in degrees of an electrical cycle.

Then add a third winding, with the three phase axes arranged 120 electrical degrees apart.

Show three sinusoidal voltage traces.

Define:

* Frequency: cycles per second, measured in hertz.  
* Period: time required for one complete cycle.  
* Phase angle: relative position of a waveform within its cycle.  
* Single phase: one alternating voltage phase.  
* Three phase: three alternating voltage phases separated by 120 electrical degrees.

Explain that generator pole count affects the relationship between shaft speed and output frequency. One shaft revolution is not necessarily one electrical cycle.

**18 to 32 minutes: Virtual Activity 1, Generator Lab (discover)**

Slide 11 lists the tasks and slide 12 runs the Generator Lab. Each task asks students to find how one setting changes a reading, so they discover the relationships instead of watching them:

A. Set 600, 1,200, then 1,800 RPM. How does the frequency change as the speed doubles and triples?

B. Change the speed again and watch the peak voltage. How does the voltage depend on speed?

C. Hold the speed and change the field. Which reading follows the field, and which ignores it?

D. Switch from 2 to 4 poles at the same speed. How do the frequency and voltage change, and why?

E. Back at 2 poles, add windings B and C. Pause and use Step 15°. How many degrees apart do the peaks arrive?

F. Press Reverse. How does the direction of rotation change the order of the peaks?

G. Show total power with A only, then with A+B+C. How does adding phases change how steady the power is, and why would industry care?

Students predict before each change, observe the generator and the scope, and explain what caused the change.

**32 to 40 minutes: Why does industry use three phase power?**

Use a simplified power delivery comparison.

Explain:

* Three phase current can create a smoothly rotating magnetic field.  
* Balanced three phase systems can provide relatively constant total instantaneous power.  
* Three phase systems offer practical advantages for large power delivery and motor operation.  
* Industrial facilities often distribute three phase power to motors and other large loads.

Clarify that typical North American residential 120/240 V split phase service is not the same as two phase power.

Show that real generators use many coils and poles per phase, not one coil per phase.

Connect to tomorrow's motor lesson: what happens when we apply these different electrical supplies to windings arranged around a motor?

**40 to 45 minutes: Exit ticket**

1. Why does rotating a magnet near a coil generate an alternating voltage?  
2. What does the 120° phase difference in a three phase supply describe?  
3. If the generator spins faster, what happens to the output frequency?  
4. Identify one practical advantage of three phase power, and explain why it matters in a factory.

**Success criteria:** Students explain the difference between phase angle and frequency, correctly interpret three phase waveforms, and connect multiple phases to industrial power applications.

### Presentation

`Decks/AR2/ACMotors/Day1_Generators_and_Phases.html`, 17 slides:

1. Title  
2. Essential question and objectives  
3. The industrial power mystery: a 120 V outlet beside a three phase motor connection  
4. Resonance predictions: does three phase mean faster, and what does "phase" mean?  
5. Generator energy conversion  
6. Alternator animation  
7. AC versus DC generator output (slip rings and commutator)  
8. One generator winding: frequency, period, and f = RPM × P / 120  
9. Adding a second winding  
10. Three windings, three phases  
11. Generator Lab tasks A to G  
12. Generator Lab simulator  
13. Why industry uses three phase  
14. Split phase is not two phase  
15. Real generators use many coils  
16. Single phase versus three phase review  
17. Resonance exit ticket

### Virtual activity specification: Generator Lab

**Interaction:** discover. Students change how the generator is built and run, then find the relationships themselves.

**Inputs and controls**

* Run, pause, reset, and Step 15° while paused  
* Rotor speed from 0 to 1,800 RPM  
* Windings: A, A+B, or A+B+C  
* Reverse rotation  
* Magnetic field strength from 50 to 130 %  
* 2 or 4 poles  
* Trace toggles for A, B, and C, and a total power trace

**Displays**

* Rotor magnet inside a stator ring. Selecting phases adds the physical winding (A at 0°, B at 120°, C at 240°) before its trace appears.  
* Oscilloscope with a 100 ms window in real time units, with the slow motion factor shown  
* Readouts: rotor speed, frequency, period, peak voltage, and phase sequence (A-B-C or A-C-B) with phase angles  
* A feedback line that explains each change

**Model behavior**

Coil k sees V = Vpeak sin(P/2 × θ − k × 120°).

Electrical frequency: f = RPM × P / 120.

Peak voltage grows with frequency and field strength: Vpeak = 100 V × (f / 30 Hz) × field.

With 4 poles, each phase has two coils, and the same speed gives twice the frequency.

**Important:** Selecting more phases adds the corresponding winding to the generator drawing, not just another trace, so students connect each waveform to its physical origin.

**Key misconception to target:** Three phase means three related waveforms, not a higher frequency.

---

## Day 2: Single Phase AC Motors and the Starting Problem

**Essential question:** If alternating current creates magnetic fields, why can't every AC motor start spinning by itself?

**Standards:** 9.2, 9.5, 9.1

### Learning objectives

Students will be able to:

1. Identify the stator and rotor in an induction motor.  
2. Explain why a single main winding creates a pulsating magnetic field without an inherently preferred starting direction.  
3. Describe why induction motor starting requires appropriate magnetic field conditions.  
4. Compare shaded pole, resistance start split phase, capacitor start, permanent split capacitor, and capacitor start capacitor run designs.  
5. Select a single phase motor based on load, cost, efficiency, and starting torque.

### Lesson sequence

**0 to 5 minutes: Warm up**

Display yesterday's three phase generator output alongside a single phase sine wave.

Ask:

"Which of these supplies do you think will be easier to use to start a rotating motor?"

Require students to explain their predictions.

**5 to 12 minutes: Induction motor anatomy**

Introduce:

* Stator: stationary laminated iron core and windings  
* Rotor: rotating component, often a squirrel cage conductor structure  
* Air gap: space between stator and rotor  
* Bearings and shaft: mechanical support and output  
* Magnetic induction: changing fields induce currents in the rotor

Explain that the rotor does not require brushes or a direct electrical connection to the stator.

Compare this construction with the permanent magnet rotors students have seen in small DC motors.

**12 to 20 minutes: The single phase problem**

Display a simple motor with a single stator winding.

Animate the magnetic field growing, collapsing, reversing, and repeating.

Show how this produces a pulsating field along a fixed axis.

Ask students why the motor has no inherent starting direction when the rotor is stationary.

Introduce the idea of additional spatially displaced windings and phase shifted currents.

Explain that different motor starting designs produce an effective rotating field component and enough starting torque to get the rotor moving.

**20 to 28 minutes: Five approaches to single phase motors**

Compare these designs:

**Shaded pole**

A shorted copper shading ring creates a delayed magnetic flux in part of the pole. The resulting field sweeps across the pole face.

Advantages: extremely simple, inexpensive, no capacitor or centrifugal starting switch.

Disadvantages: low starting torque and poor efficiency.

Applications: very small fans and low power appliances.

**Resistance start split phase**

An auxiliary winding is designed to carry a current with a different phase angle from the main winding.

Advantages: inexpensive, moderate starting torque.

Disadvantages: starting winding typically needs to be disconnected after acceleration.

Applications: some small pumps, tools, and machinery.

**Capacitor start**

A capacitor is connected with an auxiliary starting winding to create a larger phase separation during startup.

Advantages: comparatively high starting torque.

Disadvantages: starting capacitor and switching components add complexity.

Applications: compressors, pumps, and machinery with significant starting loads.

**Permanent split capacitor (PSC)**

A capacitor remains connected with the auxiliary winding during running.

Advantages: quiet operation, relatively simple construction, suitable for continuous fan and blower applications.

Disadvantages: generally less starting torque than a capacitor start design.

Applications: ventilation fans, blowers, and some pumps.

**Capacitor start capacitor run**

Uses start capacitance for strong startup and running capacitance during normal operation.

Advantages: strong starting performance with favorable running characteristics.

Disadvantages: additional cost and component complexity.

Applications: larger single phase motors requiring both strong startup and sustained performance.

**28 to 40 minutes: Virtual Activity 2, Motor Design Workshop (design)**

Students design a motor instead of picking one from a menu. Slide 16 sets the challenge and slide 17 runs the workshop. Four customers each need a single phase motor. Students start from the base motor (main winding and rotor, $30), add starting parts, run a 6 second test, and improve the design until it meets the brief for the lowest cost.

| Customer brief | Budget | Requirements | Cheapest design that passes |
| ----- | ----- | ----- | ----- |
| Apartment exhaust fan | $45 | Starts and runs quietly | Shaded pole ($38) |
| Ventilation blower, 12 hours a day | $70 | Starts, efficiency at least 70 % | PSC ($62) |
| Workshop compressor | $80 | Starts against a loaded cylinder and reaches speed | Capacitor start ($75) |
| Loaded conveyor, all day | $95 | Starts a heavy belt, efficiency at least 75 % | Capacitor start capacitor run ($87) |

Each brief has one cheapest passing design, and its near misses fail on a specific, explainable requirement: over budget, stalls, too inefficient, too noisy, or a start winding that overheats.

Tasks:

A. Test the base motor alone. Why does it only hum?

B. Find the cheapest design that meets each brief.

C. Compressor: which part made the difference?

D. Blower: find a design that starts but fails. What fixed it?

E. Try a switch with only a run capacitor. What happens?

F. Record your best design and one near miss for each brief.

Students record their designs on paper.

**40 to 45 minutes: Exit ticket**

1. Why does a single phase induction motor need an appropriate starting mechanism?  
2. What does the capacitor accomplish in a capacitor start motor?  
3. Why might a shaded pole motor be selected even though it is inefficient?  
4. Which starting design is appropriate for a load that needs high starting torque, such as an air compressor?

### Presentation

`Decks/AR2/ACMotors/Day2_Starting_AC_Motors.html`, 18 slides:

1. Title  
2. Essential question and objectives  
3. Warm up: three phase output beside a single sine wave  
4. Resonance prediction: which supply will start a motor more easily, and why?  
5. Inside an induction motor  
6. A real induction motor: a labeled photo of a motor taken apart  
7. The squirrel cage rotor  
8. One winding, a pulsating field (field viewer)  
9. Why starting torque is a problem  
10. A second winding and a phase shift (field viewer with a 0 to 90° shift)  
11. Shaded pole  
12. Resistance start split phase  
13. Capacitor start  
14. PSC and capacitor start capacitor run  
15. Comparison table  
16. Motor Design Workshop: the briefs and tasks  
17. Motor Design Workshop simulator  
18. Resonance exit ticket

### Virtual activity specification: Motor Design Workshop

**Interaction:** design. Students build a motor from parts to meet a customer brief within a budget, test it, and improve it.

**Parts (illustrative costs)**

| Part | Cost | What it does in the model |
| ----- | ----- | ----- |
| Base motor: main winding and rotor | $30 | Always included. Alone, it hums and cannot start. |
| Shading rings | +$8 | Weak shifted field: low starting torque, low efficiency. |
| Auxiliary winding | +$20 | A second winding that can shift the field. |
| Centrifugal switch | +$10 | Drops the auxiliary circuit (or the start capacitor) at 75 % speed. |
| Start capacitor | +$15 | Large phase shift for high starting torque; must be switched out. |
| Run capacitor | +$12 | Smaller phase shift that stays in; better running efficiency. |

**What a combination builds**

Every combination of parts produces an honest result, including the mistakes:

| Parts chosen | Result |
| ----- | ----- |
| None | Main winding only: hums, no starting torque |
| Shading rings | Shaded pole |
| Auxiliary winding and switch | Split phase |
| Auxiliary winding, switch, and start capacitor | Capacitor start |
| Auxiliary winding and run capacitor | PSC |
| Auxiliary winding, switch, start and run capacitors | Capacitor start capacitor run (the switch drops only the start capacitor) |
| Auxiliary winding alone | Starts, but the auxiliary winding never drops out and overheats (fault) |
| Auxiliary winding and start capacitor, no switch | The start capacitor stays in and fails (fault) |
| A capacitor or switch without the auxiliary winding | Nothing to connect to: no effect, money wasted |
| Shading rings plus an auxiliary design | Behaves like the auxiliary design, with extra losses |
| Auxiliary winding, switch, and run capacitor | Starts with PSC-level torque, then the switch removes the run capacitor at speed, so it runs like split phase and the capacitor is wasted |

**Displays**

* Brief card and selector (fan, blower, compressor, conveyor) with the budget and requirements  
* Parts checklist with a running total and budget bar  
* Cross section showing the fitted parts, and a ladder schematic built from them  
* Torque versus speed chart with the motor curve, the load curve, and the operating point  
* A result card with one row per requirement (pass or fail, with the reason), the total cost, and a note explaining wasted or misused parts

**Model**

An illustrative torque-speed model. A design starts only if its starting torque exceeds the load torque across the speed range. Switched designs drop their start circuit at 75 % speed, and a start winding or capacitor left in circuit trips within seconds.

**Important:** Adding a capacitor must not improve every measure. Students should see that motor selection involves tradeoffs rather than one universally superior design.

**Key misconception to target:** A capacitor does not deliver an extra burst of electricity. Its central role in capacitor starting is shifting the timing of the auxiliary winding current, so the two windings make a rotating field.

---

## Day 3: Three Phase Induction Motors and Industrial Speed Control

**Essential question:** How can we control the speed of an industrial AC motor without changing its mechanical gearing?

**Standards:** 9.2, 9.5, 9.1, 3.5

### Learning objectives

Students will be able to:

1. Explain how three phase stator currents produce a rotating magnetic field.  
2. Describe how induced rotor currents create torque in an induction motor.  
3. Distinguish synchronous speed from actual rotor speed.  
4. Calculate synchronous speed from frequency and pole count.  
5. Explain the purpose and basic operation of a variable frequency drive.  
6. Identify the functions of start and stop controls, overload protection, and emergency stopping arrangements.

### Lesson sequence

**0 to 5 minutes: Review challenge**

Show the single phase and three phase magnetic field animations.

Ask students:

"Why does one require a starting arrangement while the other naturally produces a rotating magnetic field?"

**5 to 13 minutes: How three phase induction motors work**

Introduce three stator winding groups arranged around the motor.

Animate the combined magnetic field rotating.

Show how the changing field induces current in the squirrel cage rotor. The interaction between the induced rotor currents and magnetic field produces torque.

Emphasize that induction motor operation is different from a permanent magnet motor following a rotating field.

Introduce slip:

* The rotating stator field has a synchronous speed.  
* A loaded induction motor rotor normally turns somewhat more slowly.  
* That speed difference is necessary for rotor induction and torque production.

**13 to 20 minutes: Frequency, poles, and speed**

Introduce:

Synchronous RPM = 120 × frequency / pole count

Work examples:

* 60 Hz, 2 poles: 3,600 RPM  
* 60 Hz, 4 poles: 1,800 RPM  
* 60 Hz, 6 poles: 1,200 RPM

Discuss why actual induction motor speeds are lower.

Example:

If a four pole motor has a synchronous speed of 1,800 RPM and an actual speed of 1,750 RPM, its slip is:

(1,800 − 1,750) / 1,800 × 100 = 2.78%

Students should interpret this as a relationship between field speed and shaft speed.

**20 to 26 minutes: Introduction to VFDs**

Ask:

"If our facility receives 60 Hz power, how can we operate a motor at a lower speed?"

Explain the basic stages:

1. Incoming AC is rectified to DC.  
2. A DC link stores and smooths electrical energy.  
3. Electronic switches in an inverter synthesize a controlled AC output.  
4. The VFD adjusts output frequency and voltage according to its control strategy.

Emphasize that VFDs can control motor speed, acceleration, and deceleration. They also provide monitoring and protective functions depending on the equipment.

**26 to 38 minutes: Virtual Activity 3, VFD Control Room missions (operate)**

Students operate a drive until a production spec holds. Slide 12 briefs the missions and slide 13 runs the Control Room. Each mission puts a machine on the drive with its motor and load already set, and students operate the frequency and ramp. A live checklist shows each spec passing or failing with its current value, and the mission completes when every spec holds.

A. **Mixer:** hold 1,140 RPM at 90 % load. Predict the frequency first.

B. **Conveyor:** reach full speed within 10 s, with no trip. Choose the ramp.

C. **Fan:** run at 70 % speed under 1.5 kW. How much power did you save?

D. **Overspeed:** hold 2,400 RPM within the motor's full load current. Find the heaviest load that works.

E. **Free run:** compare an ordinary stop, a protective trip, and the emergency stop. How does each one stop the motor, and how do you restart?

Each mission has a narrow passing window and a tempting wrong setting (see the activity specification below). When a mission completes, students record the settings it shows on paper, with one sentence on why those settings worked.

**38 to 42 minutes: Industrial controls**

Show a simplified three wire motor control arrangement with:

* Momentary Start button  
* Normally closed Stop button  
* Contactor or controller  
* Overload protection  
* Auxiliary holding contact

Explain why industrial controls often use a holding circuit and how a loss of power can prevent unexpected automatic restarting. Students operate this on the three wire start/stop simulator (slide 15): hold-to-press Start and Stop buttons, an overload trip, and a power failure, with live wires, contacts, and coil state, so they see that power returning does not restart the motor.

Clarify that emergency stop functions require specifically designed safety systems. A normal software stop or basic VFD command is not inherently a safety rated emergency stop.

**42 to 45 minutes: Exit ticket**

1. Calculate synchronous speed for a four pole motor operating at 50 Hz.  
2. Why is actual induction motor speed generally below synchronous speed?  
3. What electrical property does a VFD change to control motor speed?  
4. Explain one safety or operational advantage of a three wire start/stop control with a holding contact.

### Presentation

`Decks/AR2/ACMotors/Day3_Three_Phase_Motors_and_VFDs.html`, 17 slides:

1. Title  
2. Essential question and objectives  
3. Review challenge: single phase and three phase field viewers side by side  
4. Three phase stator fields  
5. How the squirrel cage makes torque, and why slip is needed  
6. Synchronous speed and slip (worked example: 2.78 %)  
7. Frequency and pole count  
8. Resonance: slip and synchronous speed check  
9. Introducing the VFD  
10. AC to DC to controlled AC  
11. Resonance prediction: synchronous speed at 30 Hz, and what happens to the pole count  
12. Control Room missions A to E  
13. VFD Control Room simulator  
14. Starting a motor without a VFD: contactor, overload relay, pushbuttons  
15. Three wire start/stop simulator  
16. Overload protection, and stop versus trip versus emergency stop  
17. Resonance exit ticket

### Virtual activity specification: VFD Control Room

**Interaction:** operate. Students run a drive until a measurable production spec holds.

**Inputs**

* Mission selector: Free run, Mixer, Conveyor, Fan, Overspeed  
* Frequency from 10 to 90 Hz  
* Motor pole count: 2, 4, or 6 (Free run only; each swaps in a different motor and nameplate)  
* Load from 0 to 150 % (missions set it, except Overspeed)  
* Acceleration and deceleration ramp from 1 to 20 s  
* Start, Stop, Reset fault, and a latching E-STOP

**Displays**

* Three phase output waveforms with live frequency and voltage  
* Field and rotor dial  
* Synchronous speed and shaft speed bars  
* Slip, torque, current against full load amps, and motor heat  
* Drive state, warnings, and a running explanation with the 120f/P arithmetic  
* Motor nameplate, with each abbreviation's full term on hover  
* Mission brief, live spec checklist, hold timer, and a completion record of the settings used

**Required physics relationships**

Synchronous RPM = 120f / P

Slip = (Synchronous RPM − Rotor RPM) / Synchronous RPM × 100

For an illustrative four pole motor:

At 60 Hz: 1,800 synchronous RPM.

At 30 Hz: 900 synchronous RPM.

At 50 Hz: 1,500 synchronous RPM.

The simulator distinguishes calculated synchronous speed from modeled actual speed.

**Model**

* Output frequency ramps at 60 Hz per ramp time.  
* Torque demand = load + 5 % friction + inertia × ramp rate. A fan load's torque grows with speed squared.  
* Slip in RPM is proportional to torque, the same at any frequency, so slip as a percentage grows at low frequency.  
* Above 60 Hz the voltage caps at 460 V, so each amp makes less torque: current = torque × f / 60, and the 150 % current limit allows only 150 × 60 / f torque.  
* Demand above the current limit for 0.5 s trips an overcurrent fault. Current above 115 % of full load amps heats the motor and trips the overload.  
* Stop ramps down under control, a fault coasts, and the E-STOP removes power and needs a release and a reset. Nothing restarts on its own.

**Missions**

Missions fix the machine (a 4 pole motor, its load, and its inertia). Hold missions complete after every spec passes at steady speed for 10 s; the conveyor completes once it reaches 1,700 RPM in time and the drive reaches its setpoint without a trip. During the timed conveyor attempt the frequency and ramp are locked, and Start only works from rest. A new completion replaces the record, so a better setting found later is the one recorded.

| Mission | Spec | Passes | Tempting wrong setting |
| ----- | ----- | ----- | ----- |
| Mixer, 90 % load | 1,125 to 1,155 RPM, held 10 s | 40 Hz only | 38 Hz from 120f/P, which ignores slip (1,093 RPM) |
| Conveyor, 100 % load, heavy belt | 1,700 RPM within 10 s of Start, running at its setpoint with no trip | Ramp of 7 to 10 s | The default 5 s ramp trips on overcurrent; 11 s is too slow |
| Fan, torque ∝ speed² | 1,200 to 1,250 RPM, at most 1.5 kW, held 10 s | 41 to 42 Hz (about 1.4 kW, down from 3.7 kW) | 44 Hz uses 1.56 kW |
| Overspeed, load starts at 100 % | At least 2,400 RPM, at most 6.7 A, load at least 60 %, held 10 s | 82 Hz and up at 60 or 65 % load | 80 to 81 Hz falls short by the slip; 70 % load draws 6.9 A |

**Model limitations**

Do not imply that reducing frequency alone automatically maintains motor torque and safe operating conditions. Real VFDs coordinate voltage, frequency, current limits, and motor characteristics. The simplified relationships above are documented for teachers rather than shown as a disclaimer on the slide; the deck's teaching slides and the running explanation carry the caveats students need.

**Key misconception to target:** VFDs change the electrical operating conditions of an AC motor. They do not change the motor's mechanical pole count.

---

## Day 4: Stepper, Brushless, and Servo Motors

**Essential question:** Why aren't all robotic systems powered by ordinary induction motors?

**Standards:** 9.3, 9.4, 9.6, 9.7

### Learning objectives

Students will be able to:

1. Identify key differences between brushed DC, brushless DC, stepper, and servo motor systems.  
2. Explain mechanical versus electronic commutation.  
3. Describe how a stepper motor controls nominal position through commanded steps.  
4. Explain how lost steps create positioning errors.  
5. Recognize that servo systems use feedback to regulate motion.  
6. Select an appropriate motor system for a specified automation application.

### Lesson sequence

**0 to 5 minutes: Hook**

Present three applications:

* Industrial ventilation fan  
* 3D printer axis  
* Robotic arm joint

Ask:

"Why wouldn't we use the same motor for all three?"

**5 to 12 minutes: Brushed versus brushless motors**

Briefly review brushed DC motor operation.

Compare the mechanical commutator and brushes with the electronic commutation used in brushless motors.

Introduce:

* Permanent magnet rotor  
* Stator windings  
* Electronic speed controller  
* Rotor position sensing or estimation

Explain why a brushless motor can use a DC power source while its driver produces time varying currents in the motor windings.

Discuss brush wear, efficiency, power density, and controller complexity.

**12 to 20 minutes: Stepper motors**

Introduce step angle and sequential winding energization.

Students calculate:

* 1.8° per full step  
* 200 full steps per revolution  
* 50 steps for 90° rotation

Explain that an ordinary open loop stepper controller assumes commanded motion occurs, but it cannot detect missed steps without additional feedback.

Use CNC machines and 3D printers as examples familiar to students.

**20 to 27 minutes: Servo systems**

Introduce the difference between a motor and a complete motion control system.

Explain that a servo system uses feedback to regulate position, speed, or torque.

Show a simple closed loop:

Commanded position → controller → motor → actual position → sensor feedback.

Explain that a servo can use different motor technologies and that the defining concept is controlled motion with feedback.

Connect the discussion to the sensor feedback unit.

**27 to 39 minutes: Virtual Activity 4, Head to Head (compare)**

Slide 14 sets the challenge: a robot arm joint must swing to a target angle, and three systems race on the same command, carry the same load, and take the same bump:

A. Open loop stepper.

B. Brushless motor with speed control but no position control.

C. Servo system with position feedback.

Slide 15 is a Resonance prediction before any racing: all three arms carry a heavy load to 90°, then take the same bump. Which will end within 1° of the target? (Only the servo.)

Slide 16 runs the race. Before each run, students check the arms they expect to end within 1° and lock that prediction; Run stays locked until they do. The four races:

1. Light load, bump off. Predict, then race.  
2. Light load, bump on. Which arms recover?  
3. Heavy load, bump on. Compare settle times.  
4. Overload. How does each system fail?

Students observe actual versus commanded position, error, recovery, settle time, and relative cost, and use the results in the motor selection exit ticket.

**39 to 45 minutes: Motor selection discussion and exit ticket**

Give students four applications:

1. Low cost toy vehicle  
2. Drone propulsion  
3. Precision robotic arm joint  
4. Small 3D printer axis

For each application, select an appropriate motor or motor system and justify the decision using two engineering criteria.

Explain that multiple solutions may be valid if students justify design tradeoffs.

### Presentation

`Decks/AR2/ACMotors/Day4_Stepper_Brushless_Servo.html`, 18 slides:

1. Title  
2. Essential question and objectives  
3. Hook: an industrial fan, a 3D printer axis, and a robot arm joint  
4. Resonance: why not the same motor for all three?  
5. Brushed DC motor review  
6. Brushless construction  
7. Electronic commutation (commutation demo with a live Hall code table)  
8. Stepper operation (the same demo in stepper mode, full and half steps)  
9. Step angle calculation  
10. Resonance: step count check  
11. Open loop positioning and lost steps  
12. Servo feedback  
13. Resonance: what makes a system a servo?  
14. Head to Head: the challenge  
15. Resonance prediction  
16. Head to Head simulator  
17. Motor selection comparison  
18. Resonance exit ticket: motor selection

### Virtual activity specification: Head to Head

**Interaction:** compare. Students predict, then race three systems on one command.

**Inputs**

* Target angle from 15 to 270°  
* Commanded speed from 30 to 360°/s  
* Load: light, medium, heavy, or overload  
* Bump on or off (a 0.3 s knock on all three arms 1 s after the command arrives)  
* Prediction checkboxes for A, B, and C, and Lock prediction  
* Run (unlocked by a locked prediction) and Reset; changing the command clears the lock

**Displays**

* Three arm dials side by side, each with the actual arm in its system's color, the dashed commanded angle, and the target  
* For each arm: error against the target (✓ or ✗ within 1° after the run), the feedback that system really has (none, speed, or encoder angle), lost steps or drive output, settle time, and whether the prediction was right  
* One position versus time graph with the commanded angle and three traces. Each trace has its own color, its own line thickness (drawn thickest first, so overlapping traces show as nested stripes), and a letter label at its end. The angle axis scales to the target so a miss of a few degrees stays visible.  
* A run report that counts right predictions and names the key failure, such as the stepper's controller still believing it reached the commanded angle  
* Relative cost of each system

**Model behavior**

Open loop stepper:

* Tracks commanded 1.8° steps while the torque demanded (friction plus acceleration) stays below a pull-out torque that falls with speed.  
* Loses steps in groups of 4 (one rotor tooth) when demand exceeds it, and a bump knocks it back 4 steps.  
* Never recognizes the position error; the controller still reports the commanded angle.

Brushless speed control:

* Runs at the commanded speed for the computed time, then brakes.  
* Never measures position, so lag, coasting, and bumps leave errors uncorrected.

Servo positioning system:

* A torque-limited PID loop on the encoder angle, with anti-windup so a bump never leaves it parked past the target.  
* Recovers from bumps over time, and raises a following-error fault after 1.5 s at its torque limit more than 20° from the command.

A run ends once every arm has been still for 0.6 s after the last event (a servo more than 1° off still counts as moving), or 5 s after it.

Results at 90° and 90°/s (arms that end within 1° of the target):

| Load | Bump off | Bump on |
| ----- | ----- | ----- |
| Light | Stepper and servo (brushless ends 1.2° off) | Servo only |
| Medium | All three | Servo only |
| Heavy | All three | Servo only |
| Overload | None: the stepper stalls and the servo faults | None |

With the bump off, the brushless arm misses under a light load but makes it under heavier ones, because with less friction it coasts farther after braking. That is a good discussion point.

**Important:** A servo should not instantly correct every disturbance. The simulation includes response time, torque limits, and failure when overloaded.

**Key misconception to target:** Motor technology alone does not guarantee precision. The controller, feedback devices, load, and mechanical design all matter.

---

## Day 5: Industrial Motor Selection and Troubleshooting

**Essential question:** How does an automation technician determine which motor to use and why a motor system isn't operating correctly?

**Standards:** 9.1 through 9.8, with emphasis on 9.2 and 9.5

### Learning objectives

Students will be able to:

1. Interpret basic motor specifications and operating conditions.  
2. Select motors and controllers based on application requirements.  
3. Diagnose common motor operating problems using simulated test evidence.  
4. Distinguish electrical, mechanical, and control related faults.  
5. Recommend solutions that respect industrial safety practices.  
6. Communicate engineering reasoning using technical evidence.

### Lesson sequence

**0 to 5 minutes: Opening question**

Display:

"The motor is humming, but the shaft is not turning."

Ask students:

"What information would you need before you could identify the problem?"

Accept multiple possible explanations. Emphasize that real diagnosis begins by gathering evidence rather than guessing.

**5 to 10 minutes: Troubleshooting process**

Introduce a repeatable diagnostic strategy:

1. Identify the symptom.  
2. Consider possible causes.  
3. Select an appropriate and safe diagnostic test.  
4. Interpret evidence.  
5. Recommend corrective action.  
6. Verify expected operation using a safe procedure.

Reinforce that electrical isolation and stored energy control are required before appropriate maintenance activities.

Students should not view an energized motor as something to disassemble or adjust.

**10 to 33 minutes: Virtual Activity 5, Motor Maintenance Work Orders (diagnose)**

Slide 10 explains how the work orders work and slide 11 runs them. Students receive four simulated service requests. Each has a hidden cause, a machine description, a motor nameplate, a reported symptom, a machine history, and a downtime budget. Students investigate, rule out causes, diagnose, and defend the diagnosis before they submit a record.

**Work Order 1: Ventilation fan (45 minute budget)**

A PSC fan motor hums but the blade does not turn.

Possible causes: failed run capacitor, open auxiliary winding, or a seized bearing or blocked blade. Distractor: a failed centrifugal starting switch, which the nameplate rules out because a PSC motor has none.

**Work Order 2: Industrial pump (25 minute budget)**

A VFD-driven pump runs, but the flow is low and it sounds slower than usual.

Possible causes: speed reference set too low, a max frequency parameter limiting the output, pump binding that overloads the motor, or the wrong motor installed. Distractor: phase sequence reversed, which reverses a motor rather than slowing it.

**Work Order 3: Overheating conveyor (30 minute budget)**

A conveyor runs for several minutes, then its motor protection trips.

Possible causes: conveyor overloaded, blocked cooling, overload relay set too low, or a failing bearing. Distractor: lost phase, which balanced currents on all three lines rule out.

**Work Order 4: Indexing slide (40 minute budget)**

An open loop stepper slide stops off target by an amount that changes from part to part.

Possible causes: lost steps from too much acceleration, mechanical binding at one spot, a loose pulley set screw, or a faulty position sensor. Distractor: drive current set too low, which a check of the drive's current setting rules out.

For each work order, students record on paper the tests they ran, the readings that mattered, their diagnosis and repair, and the safety step it required. **New fault** hides a different cause, dealt from a shuffled deck so that every cause comes up once before any repeats.

**33 to 40 minutes: Independent engineering selection assessment**

On slide 12, each student picks one of four applications and recommends a complete motor system on paper, explaining why it beats at least one other motor type:

* **Ventilation system:** a building exhaust fan runs all day, airflow should drop when the building is empty, and three phase power is available.  
* **Small lifting mechanism:** lifts a 20 kg tote 1 m onto a shelf and must not drop it if the power fails.  
* **Production indexing machine:** a rotary table turns exactly 45° every 2 seconds, all shift, and a missed position jams the next station.  
* **Industrial mixer:** a thick batch is hard to get moving from a stop; 15 HP, three phase power, and the speed changes by recipe.

They must recommend:

* Motor type  
* Power or control method  
* Starting approach  
* Relevant operating or safety consideration  
* Technical justification

**40 to 45 minutes: Unit reflection**

Students respond to:

"How do electrical supply characteristics, motor construction, and control methods combine to determine what a motor can do?"

A successful explanation connects at least two motor systems and discusses an engineering tradeoff.

### Presentation

`Decks/AR2/ACMotors/Day5_Motor_Selection_and_Troubleshooting.html`, 14 slides:

1. Title  
2. Essential question and objectives  
3. The service call: "The motor is humming, but the shaft is not turning."  
4. Resonance: what information would you need?  
5. Six step diagnostic process  
6. Safe troubleshooting (lockout, stored energy, qualified testing)  
7. Lockout/tagout: the six steps, and a lock and unique key for every worker  
8. Mechanical versus electrical versus control faults  
9. Resonance: fault type and safety check  
10. How the work orders work  
11. Motor Maintenance Work Orders simulator  
12. Engineering selection challenge  
13. Unit concept summary  
14. Resonance: final reflection

### Virtual activity specification: Motor Maintenance Work Orders

**Interaction:** diagnose. Students find a hidden fault from evidence on a limited budget, then defend the diagnosis.

**Structure**

Four selectable work orders. Each has an information panel with three tabs:

* **Ticket:** machine overview, motor nameplate (abbreviations show their full term on hover), and the reported symptom  
* **History:** a machine log, oldest to newest, with one lead for each possible cause and at least one entry that does not matter. It points students to tests, not to answers.  
* **Causes:** every candidate cause, including the distractor, as strike-out toggles

**Interaction model**

1. **Investigate.** Eight test buttons, each naming its procedure and its downtime cost: 2 minutes to read a display or records or to observe, 5 to measure live or run a test cycle, 15 for anything that needs lockout. Two tests on each ticket are unsafe. They show a time on the same scale and are charged when picked, so a cost never gives them away, but they are never performed and show a warning naming the hazard and the compliant procedure. A downtime meter fills against the ticket's budget; tests that no longer fit are disabled, and when none fit the status reads OUT OF TIME.  
2. **Diagnose** (unlocked by at least one test): choose the most likely cause and a repair. The repairs include an unsafe "raise the protection" option.  
3. **Defend:** tag the readings that support the diagnosis. At least one tag is needed to submit.

Useful tests reveal readings, not answers, and irrelevant tests return valid but unhelpful data. Budgets are tuned so a careful path to the key evidence leaves time to spare and running every test does not fit:

| Work order | Budget | Careful path | Every safe test |
| ----- | ----- | ----- | ----- |
| Ventilation fan | 45 min | 37 min | 57 min |
| Industrial pump | 25 min | 17 min | 28 min |
| Overheating conveyor | 30 min | 12 min | 34 min |
| Indexing slide | 40 min | 37 min | 54 min |

**Assessment behavior**

The record scores six points rather than grading only the final choice:

1. **Key evidence:** the student ran a test that reveals the actual cause.  
2. **Safety:** no unsafe test and no unsafe repair.  
3. **Ruled out:** the actual cause was never struck, and every struck cause is ruled out by a reading the student took.  
4. **Diagnosis:** the actual cause.  
5. **Repair:** a repair that fixes it.  
6. **Defended:** a key reading was tagged behind the correct diagnosis.

The record also shows the downtime used against the budget and how many tests could tell the causes apart, and ends with an explanation that ties the actual cause back to the week's lessons. Students copy their record to paper, so the instructor can review the tests, conclusions, and reasoning.

---

## Unit Assessment Framework

The unit should use frequent formative checks followed by a short applied assessment, without requiring a separate traditional examination.

### Recommended assessment weights

| Component | Weight |
| ----- | ----- |
| Daily virtual investigations | 40% |
| Daily exit tickets and concept checks | 20% |
| Day 5 diagnostic performance | 25% |
| Final motor selection justification | 15% |

These weights apply only to this unit's assessment, not to the course grading categories.

### Four level analytic rubric

**4: Advanced**

Student accurately explains motor operation, uses appropriate technical evidence, identifies meaningful tradeoffs, and justifies a solution under changing conditions.

**3: Proficient**

Student accurately explains the relevant principles, selects a workable solution, and provides adequate technical justification.

**2: Developing**

Student recognizes some correct principles or components but provides incomplete reasoning, misses important constraints, or makes unsupported decisions.

**1: Beginning**

Student demonstrates significant misconceptions or selects solutions without sufficient understanding or evidence.

Evaluate conceptual understanding, technical application, diagnostic reasoning, and safety awareness.

## Virtual Activity Design Principles

These principles apply across all five investigations.

1. **Prediction before simulation.** Students commit to an expectation before seeing the full behavior whenever practical.  
2. **Observable causes and effects.** Adjusting a meaningful parameter produces an understandable change.  
3. **Engineering tradeoffs.** No activity is designed so that a single option is superior on every measure.  
4. **Accurate simplification.** The simulations simplify the physics but keep the simplified relationships honest, and this plan documents them for teachers. The slides do not carry "simplified model" disclaimers; caveats that matter (such as real drives coordinating voltage with frequency) are taught on the slides themselves.  
5. **Visible technical data.** Show relevant measurements, diagrams, and specifications rather than only pass or fail messages.  
6. **Evidence based explanations.** Students justify conclusions using displayed results.  
7. **Reset and repeatability.** Students can return to a known state and repeat experiments.  
8. **Accessible interaction.** Controls are keyboard usable and labeled, readable without depending on color alone, and live regions announce results without flooding screen readers.  
9. **Instructor control.** Support guided demonstrations and independent student exploration.  
10. **Safety separation.** Simulations of electrical maintenance never imply that procedures are appropriate on energized equipment without proper training, equipment, and supervision.  
11. **A different kind of thinking each day.** Every simulator could be used the same way (change a setting, press Run, explain the graph), which invites clicking through. Instead, each day's activity has its own purpose:

| Day | Activity | Interaction | Students are trying to ... |
| ----- | ----- | ----- | ----- |
| 1 | Generator Lab | Discover | find how construction and speed shape the output |
| 2 | Motor Design Workshop | Design | build a motor that meets a brief within a budget |
| 3 | VFD Control Room missions | Operate | run a drive until a production spec holds |
| 4 | Head to Head | Compare | predict, then race three systems on one command |
| 5 | Motor Maintenance Work Orders | Diagnose | find a hidden fault with limited downtime, then defend it |

Find-the-fault activities like Day 5 transfer well to other units and courses; the repository's `.agent/knowledge/troubleshooting-activities.md` describes how to build them.

## Scope Boundaries

To preserve the one week duration, the following should not become major instructional topics:

* Detailed three phase circuit analysis and power factor mathematics  
* Wye and delta power calculations or motor rewiring  
* Advanced induction motor equivalent circuits  
* Detailed VFD parameter programming  
* Full stepper motor driver design  
* Electronic speed controller firmware  
* PID controller tuning  
* Physical AC motor disassembly and rebuild

These can be introduced visually or revisited in other units when relevant.

**The intended achievement is not mastery of industrial motor engineering. It is the ability to recognize how motor designs work, understand their control requirements, and make informed decisions about their use in automation.**

## Core Unit Vocabulary

Electromagnetic induction, alternator, AC, DC, frequency, hertz, phase, phase angle, single phase, three phase, stator, rotor, squirrel cage, induction motor, starting torque, shaded pole, auxiliary winding, capacitor start, permanent split capacitor, synchronous speed, slip, variable frequency drive, rectifier, inverter, commutation, stepper motor, brushless motor, servo, encoder, feedback, following error, contactor, holding contact, overload protection, lockout/tagout, and motor nameplate.

## Materials and Preparation

**Required**

* Teacher presentation computer and projector  
* Student devices with modern web browsers  
* Five interactive browser based investigations  
* Digital or printed note catcher  
* Exit ticket collection method

**Optional**

* Disconnected motor or rotor samples for visual demonstration  
* Small DC motor used as a generator  
* Multimeter or oscilloscope for an instructor demonstration  
* Industrial motor nameplate photographs  
* Existing VEX or Festo components for reference

No purchase is required to complete the planned unit.

## End of Week Evidence of Learning

By the end of Friday, each student should have produced:

1. Generator Lab findings: how speed, field, poles, direction, and the number of phases change the output.  
2. The best design and one near miss for each Motor Design Workshop brief.  
3. VFD speed and slip calculations, and the settings that completed each Control Room mission, with an explanation.  
4. Head to Head predictions and results, and motor selections for four applications.  
5. Four work order records (tests, readings, diagnosis, repair, and safety) and an independent engineering recommendation.

These artifacts provide evidence of technical understanding and applied decision making across Standard 9.0.

## How the presentations were built

All five decks follow the same arc:

1. **Present a problem:** a practical engineering question.  
2. **Introduce a principle:** only what is needed to investigate it.  
3. **Experiment:** the virtual investigation runs as an inline simulator slide in the deck itself, not as a separate link.  
4. **Apply and explain:** an engineering decision supported by evidence.

Resonance questions sit on their own slides (predictions, concept checks, exit tickets), because a running activity covers the slide. Students record the results of each virtual investigation on paper rather than in a debrief question, which keeps the evidence with the student and leaves the exit tickets for the day's concepts.

The decks share a theme (`Decks/AR2/ACMotors/theme.css`), use the same phase colors all week (A amber, B cyan, C violet, always paired with the letter), and show faults and trips in red.

The Friday engineering selection is an individual, in class written justification, which gives stronger evidence of understanding than completing the virtual activities alone.

The result is a compact but substantial unit that covers all of Arizona Standard 9.0, gives students opportunities to investigate real engineering relationships, and stays within five class periods.
