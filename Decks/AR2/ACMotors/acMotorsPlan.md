# **AR2 Unit Plan: AC Motors, Generators, and Industrial Motor Control**

Honors Automation and Robotics 2 \| 5 class periods \| 45 minutes per class

The central question for the week will be:

How do engineers generate electrical power, turn that power into controlled motion, and select the right motor for an industrial application?

This unit will build on students' prior experience with DC circuits, electromagnetism, capacitors, programmable controllers, and motors in their AR1 equipment. Rather than having students memorize a catalog of motor types, they'll investigate the engineering problems that led to different motor designs.

The emphasis will be on predicting behavior, experimenting with virtual systems, interpreting results, and making engineering decisions.

Unit at a glance

Mon

## **1**

Generators & phases

Tue

## **2**

Starting AC motors

Wed

## **3**

Three phase & VFDs

Thu

## **4**

Robotics motors

Fri

## **5**

Diagnostics

All investigations can run in a browser. No student purchases, physical builds, or energized AC equipment are required.

## **Standards alignment**

The primary reference is the [Arizona Department of Education Automation and Robotics Technical Standards, revised 2025](https://www.azed.gov/sites/default/files/2025/07/AutomationandRoboticsTS.pdf?utm_source=chatgpt.com). This unit addresses all eight competencies in Standard 9.0, with the deepest treatment of 9.2, 9.5, and 9.8.

![]()  
azed.gov+1

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

The complete instructional design below is intended to function as the source specification for creating the daily presentations and virtual investigations.

## **Detailed instructional plan**

# **AR2: AC Motors, Generators, and Industrial Motor Control**

## **Comprehensive Five Day Instructional Plan**

**Course:** Honors Automation and Robotics 2  
**Duration:** Five 45 minute class periods  
**Primary Standards:** Arizona CTE Automation and Robotics 9.1 through 9.8  
**Instructional Model:** Brief direct instruction, interactive investigation, engineering analysis, and daily formative assessment

---

# **Day 1: Generators, Alternating Current, and Electrical Phases**

**Essential question:** Why does industry use three phase electrical power instead of just one phase?

**Standards:** 9.8, 9.3, 4.7, 6.6

### **Learning objectives**

Students will be able to:

1. Explain how relative motion between a magnetic field and a conductor can induce voltage.  
2. Distinguish the electrical outputs of simple AC and DC generators.  
3. Explain how multiple generator windings can create separate electrical phases.  
4. Interpret single phase and three phase AC waveforms.  
5. Identify advantages of three phase power for industrial motors and power distribution.

### **Lesson sequence**

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

**18 to 32 minutes: Virtual Activity 1, Build an Alternator**

Students investigate the behavior of a virtual generator.

Required investigation tasks:

A. Configure one coil and record the output waveform.

B. Increase rotor speed. Record what changes and what stays the same.

C. Add a second winding displaced by 120 electrical degrees. Predict and observe the new waveform.

D. Add a third winding to create a balanced three phase system.

E. Compare the timing of the three voltage peaks.

F. Reverse the generator's rotation and describe the effect on phase sequence.

G. Explain why balanced three phase power can supply a more consistent total instantaneous power to a balanced load than an equivalent single phase system.

Students complete a prediction, observation, and explanation for each major change.

**32 to 40 minutes: Why does industry use three phase power?**

Use a simplified power delivery comparison.

Explain:

* Three phase current can create a smoothly rotating magnetic field.  
* Balanced three phase systems can provide relatively constant total instantaneous power.  
* Three phase systems offer practical advantages for large power delivery and motor operation.  
* Industrial facilities often distribute three phase power to motors and other large loads.

Clarify that typical North American residential 120/240 V split phase service is not the same as two phase power.

Connect to tomorrow's motor lesson: what happens when we apply these different electrical supplies to windings arranged around a motor?

**40 to 45 minutes: Exit ticket**

1. Why does rotating a magnet near a coil generate an alternating voltage?  
2. What does the 120° phase difference in a three phase supply describe?  
3. If the generator spins faster, what happens to the output frequency?  
4. Identify one practical advantage of three phase power.

**Success criteria:** Students explain the difference between phase angle and frequency, correctly interpret three phase waveforms, and connect multiple phases to industrial power applications.

### **Presentation development notes**

Recommended 9 to 11 slides:

1. The industrial power mystery  
2. Generator energy conversion  
3. Alternator animation  
4. AC versus DC generator output  
5. One generator winding  
6. Adding a second winding  
7. Three windings, three phases  
8. Embedded generator investigation  
9. Why industry uses three phases  
10. Single phase versus three phase review  
11. Exit ticket

### **Virtual activity specification: Generator Lab**

**Inputs and controls**

* Start, pause, reset, and manual rotor rotation  
* Rotor speed, adjustable from 0 to 1,800 RPM  
* Select one, two, or three phase outputs  
* Toggle individual winding displays  
* Show or hide phase traces  
* Reverse mechanical rotation  
* Optional magnetic field strength control  
* Optional selectable pole count for an advanced challenge

**Displays**

* Animated rotor and stationary windings  
* Oscilloscope style voltage graph  
* Frequency readout  
* Rotor speed readout  
* Phase angle indicators  
* AC output terminals  
* Explanatory feedback area

**Model behavior**

For the basic version, use one pole pair and sinusoidal voltages:

VA \= Vpeak sin(θ)

VB \= Vpeak sin(θ − 120°)

VC \= Vpeak sin(θ \+ 120°)

For P magnetic poles, the electrical frequency is:

f \= RPM × P / 120

Generated voltage magnitude should increase with rotation speed and magnetic flux in the simplified model.

**Important:** Do not simply add traces when a student selects additional phases. Visually add the corresponding winding to the generator model so students can connect the electrical waveform to its physical origin.

**Key misconception to target:** Three phase means three related waveforms, not a higher frequency.

---

# **Day 2: Single Phase AC Motors and the Starting Problem**

**Essential question:** If alternating current creates magnetic fields, why can't every AC motor start spinning by itself?

**Standards:** 9.2, 9.5, 9.1

### **Learning objectives**

Students will be able to:

1. Identify the stator and rotor in an induction motor.  
2. Explain why a single main winding creates a pulsating magnetic field without an inherently preferred starting direction.  
3. Describe why induction motor starting requires appropriate magnetic field conditions.  
4. Compare shaded pole, resistance start split phase, capacitor start, permanent split capacitor, and capacitor start capacitor run designs.  
5. Select a single phase motor based on load, cost, efficiency, and starting torque.

### **Lesson sequence**

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

**28 to 40 minutes: Virtual Activity 2, The Motor Starting Challenge**

Present a virtual motor with selectable starting configurations.

Students begin with only a main winding and attempt to start a stationary rotor.

They then investigate:

A. A shaded pole design.

B. An auxiliary starting winding.

C. A starting winding with a capacitor.

D. A permanent run capacitor arrangement.

E. A high inertia or high starting torque load.

Students select a design and observe whether it can start the specified load.

They compare startup behavior, component complexity, and cost.

At least three application scenarios should be completed:

* Small ventilation fan  
* Workshop air compressor  
* Continuous duty ventilation blower

Each selection requires a written technical justification.

**40 to 45 minutes: Exit ticket**

1. Why does a single phase induction motor need an appropriate starting mechanism?  
2. What does the capacitor accomplish in a capacitor start motor?  
3. Why might a shaded pole motor be selected even though it is inefficient?  
4. Which starting design would be appropriate for a load requiring high starting torque?

### **Presentation development notes**

Recommended 10 to 12 slides:

1. Can a single phase motor start itself?  
2. Inside an induction motor  
3. The squirrel cage rotor  
4. Single phase magnetic field animation  
5. Why starting torque is a problem  
6. The shaded pole solution  
7. Split phase auxiliary windings  
8. Capacitor start  
9. PSC and capacitor start capacitor run  
10. Motor comparison  
11. Embedded starting challenge  
12. Exit ticket

### **Virtual activity specification: Motor Starting Lab**

**Inputs**

* Select motor design  
* Select starting load category  
* Start, stop, reset  
* Toggle the auxiliary winding and starting components  
* Display magnetic field animation  
* Optional component fault switches

**Displays**

* Cross section showing active windings  
* Rotor position and rotational speed  
* Simplified magnetic field representation  
* Starting torque versus required load torque  
* Startup status: successful, stalled, or overloaded  
* Component list and relative cost

**Simulation rules**

Use a clearly documented qualitative or simplified torque model.

Illustrative starting torque categories:

| Design | Relative starting torque |
| ----- | ----- |
| Shaded pole | Very low |
| Resistance start split phase | Moderate |
| Capacitor start | High |
| PSC | Low to moderate |
| Capacitor start capacitor run | High |

These categories must not be presented as universal quantitative specifications. Actual performance varies by motor design and rating.

A motor starts only if available accelerating torque is adequate for the modeled load across the relevant speed range.

**Important:** Adding a capacitor must not automatically improve every performance measure. Students should observe that motor selection involves tradeoffs rather than one universally superior design.

**Key misconception to target:** A capacitor does not simply deliver an extra burst of electricity. Its central role in capacitor starting is changing the current phase relationship between motor windings.

---

# **Day 3: Three Phase Induction Motors and Industrial Speed Control**

**Essential question:** How can we control the speed of an industrial AC motor without changing its mechanical gearing?

**Standards:** 9.2, 9.5, 9.1, 3.5

### **Learning objectives**

Students will be able to:

1. Explain how three phase stator currents produce a rotating magnetic field.  
2. Describe how induced rotor currents create torque in an induction motor.  
3. Distinguish synchronous speed from actual rotor speed.  
4. Calculate synchronous speed from frequency and pole count.  
5. Explain the purpose and basic operation of a variable frequency drive.  
6. Identify the functions of start and stop controls, overload protection, and emergency stopping arrangements.

### **Lesson sequence**

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

Synchronous RPM \= 120 × frequency / pole count

Work examples:

* 60 Hz, 2 poles: 3,600 RPM  
* 60 Hz, 4 poles: 1,800 RPM  
* 60 Hz, 6 poles: 1,200 RPM

Discuss why actual induction motor speeds are lower.

Example:

If a four pole motor has a synchronous speed of 1,800 RPM and an actual speed of 1,750 RPM, its slip is:

(1,800 − 1,750) / 1,800 × 100 \= 2.78%

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

**26 to 38 minutes: Virtual Activity 3, VFD Control Room**

Students operate a simulated industrial induction motor.

Tasks:

A. Set the frequency to 60 Hz and predict synchronous speed.

B. Reduce frequency to 30 Hz. Predict the new synchronous speed.

C. Compare motor behavior using two, four, and six pole configurations.

D. Increase mechanical load and observe the modeled change in slip.

E. Adjust acceleration time and determine why a large load may require a slower acceleration ramp.

F. Investigate an overload or overcurrent warning.

G. Compare an ordinary stop command, a protective trip, and an emergency stop safety function.

Use at least one realistic motor specification plate within the activity.

**38 to 42 minutes: Industrial controls**

Show a simplified three wire motor control arrangement with:

* Momentary Start button  
* Normally closed Stop button  
* Contactor or controller  
* Overload protection  
* Auxiliary holding contact

Explain why industrial controls often use a holding circuit and how a loss of power can prevent unexpected automatic restarting.

Clarify that emergency stop functions require specifically designed safety systems. A normal software stop or basic VFD command is not inherently a safety rated emergency stop.

**42 to 45 minutes: Exit ticket**

1. Calculate synchronous speed for a four pole motor operating at 50 Hz.  
2. Why is actual induction motor speed generally below synchronous speed?  
3. What electrical property does a VFD change to control motor speed?  
4. Explain one safety or operational advantage of appropriate motor start and stop controls.

### **Presentation development notes**

Recommended 10 to 12 slides:

1. Why three phase motors start naturally  
2. Three phase stator fields  
3. How a squirrel cage rotor creates torque  
4. Synchronous speed versus rotor speed  
5. Frequency and pole count calculation  
6. Introducing the VFD  
7. AC to DC to controlled AC  
8. Embedded VFD simulator  
9. Starting and stopping an industrial motor  
10. Overload protection and safety  
11. Investigation results  
12. Exit ticket

### **Virtual activity specification: VFD Control Room**

**Inputs**

* Frequency from 10 to 90 Hz  
* Motor pole count: 2, 4, or 6  
* Load level  
* Acceleration ramp time  
* Start, stop, reset fault

**Displays**

* Three phase output waveforms  
* Rotating magnetic field  
* Synchronous RPM  
* Simulated shaft RPM  
* Percentage slip  
* Relative torque demand  
* Drive state and warnings  
* Motor nameplate data

**Required physics relationships**

Synchronous RPM \= 120f / P

Slip \= (Synchronous RPM − Rotor RPM) / Synchronous RPM × 100

For an illustrative four pole motor:

At 60 Hz: 1,800 synchronous RPM.

At 30 Hz: 900 synchronous RPM.

At 50 Hz: 1,500 synchronous RPM.

The simulator should distinguish calculated synchronous speed from modeled actual speed.

**Model limitations**

Do not imply that reducing frequency alone automatically maintains motor torque and safe operating conditions. Real VFDs coordinate voltage, frequency, current limits, and motor characteristics.

The virtual system should use a defined approximate control model and identify it as educational rather than a motor commissioning tool.

**Key misconception to target:** VFDs change the electrical operating conditions of an AC motor. They do not change the motor's mechanical pole count.

---

# **Day 4: Stepper, Brushless, and Servo Motors**

**Essential question:** Why aren't all robotic systems powered by ordinary induction motors?

**Standards:** 9.3, 9.4, 9.6, 9.7

### **Learning objectives**

Students will be able to:

1. Identify key differences between brushed DC, brushless DC, stepper, and servo motor systems.  
2. Explain mechanical versus electronic commutation.  
3. Describe how a stepper motor controls nominal position through commanded steps.  
4. Explain how lost steps create positioning errors.  
5. Recognize that servo systems use feedback to regulate motion.  
6. Select an appropriate motor system for a specified automation application.

### **Lesson sequence**

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

**27 to 39 minutes: Virtual Activity 4, Precision Under Pressure**

Students control a virtual positioning mechanism through the same commanded movement using three alternative systems:

A. Open loop stepper.

B. Brushless motor with speed control but no position control.

C. Servo system with position feedback.

Students introduce mechanical resistance or a disturbance.

Observe what happens to:

* Actual position  
* Commanded position  
* Position error  
* Recovery behavior  
* Relative cost and complexity

Students recommend a solution for a precision positioning application, including whether additional sensors or control hardware are necessary.

**39 to 45 minutes: Motor selection discussion and exit ticket**

Give students four applications:

1. Low cost toy vehicle  
2. Drone propulsion  
3. Precision robotic arm joint  
4. Small 3D printer axis

For each application, select an appropriate motor or motor system and justify the decision using two engineering criteria.

Explain that multiple solutions may be valid if students justify design tradeoffs.

### **Presentation development notes**

Recommended 9 to 11 slides:

1. Different machines, different motor requirements  
2. Brushed DC motor review  
3. Brushless motor construction  
4. Electronic commutation  
5. Stepper operation  
6. Step angle calculation  
7. Open loop positioning and lost steps  
8. Servo feedback  
9. Embedded positioning investigation  
10. Motor selection comparison  
11. Exit ticket

### **Virtual activity specification: Precision Under Pressure**

**Inputs**

* Motor or control system selection  
* Target position  
* Speed or command rate  
* Applied disturbance  
* Load level  
* Run, pause, reset

**Displays**

* Animated shaft or position indicator  
* Commanded position  
* Actual position  
* Position error  
* Feedback signal when applicable  
* Motion graph  
* Controller response indicators

**Model behavior**

Open loop stepper:

* Tracks commanded steps within the torque and speed limits of the model.  
* Can lose steps if load or acceleration demands exceed available torque.  
* Does not automatically recognize position error.

Brushless speed control:

* Regulates speed according to the selected model.  
* Does not inherently guarantee a commanded shaft position.

Servo positioning system:

* Measures actual position.  
* Detects position error.  
* Adjusts drive output to reduce error within its physical limits.

**Important:** A servo should not instantly correct every disturbance. The simulation must include response time, torque limitations, and possible failure when overloaded.

**Key misconception to target:** Motor technology alone does not guarantee precision. The controller, feedback devices, load, and mechanical design all matter.

---

# **Day 5: Industrial Motor Selection and Troubleshooting**

**Essential question:** How does an automation technician determine which motor to use and why a motor system isn't operating correctly?

**Standards:** 9.1 through 9.8, with emphasis on 9.2 and 9.5

### **Learning objectives**

Students will be able to:

1. Interpret basic motor specifications and operating conditions.  
2. Select motors and controllers based on application requirements.  
3. Diagnose common motor operating problems using simulated test evidence.  
4. Distinguish electrical, mechanical, and control related faults.  
5. Recommend solutions that respect industrial safety practices.  
6. Communicate engineering reasoning using technical evidence.

### **Lesson sequence**

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

**10 to 33 minutes: Virtual Activity 5, Motor Maintenance Work Orders**

Students receive four simulated service requests.

Each contains a machine description, motor specifications, observable symptoms, and available diagnostic tests.

Students choose tests and interpret results before diagnosing the failure.

**Work Order 1: Ventilation Fan**

A single phase fan motor hums but does not start.

Possible causes:

* Failed start or run capacitor  
* Damaged auxiliary winding  
* Mechanical obstruction  
* Failed starting switch, if the motor design uses one

Students inspect simulated component measurements and mechanical condition.

**Work Order 2: Industrial Pump**

A three phase induction motor runs slower than expected.

Possible causes:

* Incorrect VFD output frequency  
* Excessive mechanical loading  
* Incorrect drive settings  
* Motor mismatch

Students review drive frequency, nameplate information, shaft speed, and motor current.

**Work Order 3: Overheating Motor**

A motor runs for several minutes before protective shutdown.

Possible causes:

* Excessive load  
* Poor cooling or blocked ventilation  
* Incorrect overload settings  
* Mechanical bearing problem

Students interpret operating current, temperature trend, and load conditions.

**Work Order 4: Positioning Error**

An automated mechanism repeatedly misses its target position.

Possible causes:

* Open loop stepper losing steps  
* Excessive acceleration  
* Mechanical binding  
* Encoder or feedback problem, depending on the system

Students analyze commanded and actual position, load changes, and available feedback.

Each work order requires:

* Suspected cause  
* Selected diagnostic evidence  
* Final diagnosis  
* Recommended corrective action  
* Safety consideration

**33 to 40 minutes: Independent engineering selection assessment**

Students receive one new application, such as a ventilation system, small lifting mechanism, production indexing machine, or industrial mixer.

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

### **Presentation development notes**

Recommended 6 to 8 slides:

1. A motor won't start, what now?  
2. Diagnostic reasoning process  
3. Mechanical versus electrical versus control faults  
4. Safe troubleshooting practices  
5. Launch virtual work orders  
6. Engineering selection challenge  
7. Unit concept summary  
8. Final reflection

### **Virtual activity specification: Motor Maintenance Work Orders**

**Structure**

Four selectable work orders, each with:

* Machine overview  
* Motor nameplate  
* Reported symptoms  
* Available diagnostic tests  
* Evidence panels  
* Diagnosis choices  
* Recommended repair choices  
* Engineering explanation input

**Interaction model**

Students must select at least one relevant test before submitting a diagnosis.

Useful tests reveal information, not immediate answers.

Irrelevant tests may return valid information that does not resolve the issue.

Unsafe choices trigger a safety warning and ask students to select a compliant procedure.

**Assessment behavior**

Do not grade students only on their final choice.

Also assess whether students:

* Selected relevant tests  
* Interpreted results correctly  
* Recognized unsafe procedures  
* Connected the diagnosis to physical or control principles  
* Recommended a reasonable solution

The instructor should be able to review the selected tests, conclusions, and written reasoning.

---

# **Unit Assessment Framework**

The unit should use frequent formative checks followed by a short applied assessment, without requiring a separate traditional examination.

## **Recommended assessment weights**

| Component | Weight |
| ----- | ----- |
| Daily virtual investigations | 40% |
| Daily exit tickets and concept checks | 20% |
| Day 5 diagnostic performance | 25% |
| Final motor selection justification | 15% |

These weights apply only to this unit's assessment, not to the course grading categories.

## **Four level analytic rubric**

**4: Advanced**

Student accurately explains motor operation, uses appropriate technical evidence, identifies meaningful tradeoffs, and justifies a solution under changing conditions.

**3: Proficient**

Student accurately explains the relevant principles, selects a workable solution, and provides adequate technical justification.

**2: Developing**

Student recognizes some correct principles or components but provides incomplete reasoning, misses important constraints, or makes unsupported decisions.

**1: Beginning**

Student demonstrates significant misconceptions or selects solutions without sufficient understanding or evidence.

Evaluate conceptual understanding, technical application, diagnostic reasoning, and safety awareness.

# **Virtual Activity Design Principles**

These principles should apply consistently across all five investigations.

1. **Prediction before simulation.** Students must commit to an expectation before seeing the full behavior whenever practical.  
2. **Observable causes and effects.** Adjusting a meaningful parameter should produce an understandable change.  
3. **Engineering tradeoffs.** Avoid designing every activity so that a single option is superior on every measure.  
4. **Accurate simplification.** Educational simulations may simplify physics but must clearly identify the simplified relationships.  
5. **Visible technical data.** Show relevant measurements, diagrams, and specifications rather than providing only pass or fail messages.  
6. **Evidence based explanations.** Students should justify conclusions using displayed results.  
7. **Reset and repeatability.** Students can return to a known state and repeat experiments.  
8. **Accessible interaction.** Controls should be keyboard usable, labeled, and readable without depending on color alone.  
9. **Instructor control.** Support guided demonstrations and independent student exploration.  
10. **Safety separation.** Simulations of electrical maintenance must never imply that procedures are appropriate on energized equipment without proper training, equipment, and supervision.

# **Scope Boundaries**

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

# **Core Unit Vocabulary**

Electromagnetic induction, alternator, AC, DC, frequency, hertz, phase, phase angle, single phase, three phase, stator, rotor, squirrel cage, induction motor, starting torque, shaded pole, auxiliary winding, capacitor start, permanent split capacitor, synchronous speed, slip, variable frequency drive, rectifier, inverter, commutation, stepper motor, brushless motor, servo, feedback, overload protection, and motor nameplate.

# **Materials and Preparation**

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

# **End of Week Evidence of Learning**

By the end of Friday, each student should have produced:

1. Generator and phase investigation responses.  
2. Single phase motor starting comparison.  
3. VFD speed and slip calculations.  
4. Motor positioning comparison and application selections.  
5. A diagnostic work order record and independent engineering recommendation.

These artifacts provide evidence of technical understanding and applied decision making across Standard 9.0.

## **Recommendations for building the presentations**

I would use a consistent structure for all five presentations, with the virtual investigation integrated into the presentation itself rather than linked as an unrelated activity.

Suggested presentation structure

1\. Present a problem

Give students a practical engineering question.

2\. Introduce a principle

Explain only what is needed to investigate it.

3\. Experiment

Manipulate variables, observe results, test predictions.

4\. Apply and explain

Make an engineering decision supported by evidence.

For development, I would prioritize the five activities in this order:

1. Generator and three phase exploration: Establishes the conceptual foundation for the entire week.  
2. Single phase starting comparison: Probably the richest opportunity for exploration, because the designs solve the same problem differently.  
3. VFD investigation: Provides concrete numerical relationships and strong alignment with Standard 9.2.  
4. Motor troubleshooting: Makes an excellent authentic assessment.  
5. Stepper, brushless, and servo comparison: Can be relatively simple because students will already understand rotating magnetic fields and motor controllers.

I would also build the student note catcher around the prediction, observation, explanation pattern used throughout the week. This allows students to record meaningful evidence without producing five sets of fill in the blank definitions.

The colleague's original presentations can supply much of the technical content, particularly for Days 1 and 4\. Day 2 will need the most new material, and Day 3 will benefit from substantial additions about VFDs and industrial motor controls.

One final consideration: because this unit is primarily simulated, I'd make the independent written justification on Friday an individual, in class assessment. That would provide stronger evidence of understanding than simply completing the virtual activities.

The result should be a compact but substantial unit that covers all of Arizona Standard 9.0, gives students opportunities to investigate real engineering relationships, and stays within five class periods.

