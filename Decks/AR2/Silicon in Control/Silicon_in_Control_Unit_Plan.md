# AR2 Unit Plan: Silicon in Control

## How Semiconductors Changed the Way Machines Think

**Automation and Robotics 2 · grades 10 to 12 · 10 core class periods plus up to 5 flex periods · 45 minutes per class**

**Essential question:** How and why did semiconductor technology transform electrical switching into the digital control systems used in modern automation?

This unit is the bridge between AC Circuits and Programmable Logic Controllers. Students already know relays, solenoids, contactors, and motor control circuits, and they have already completed LogiKIT Labs 1 and 2 on logic gates. This unit opens the black boxes. Students find out what is inside a LogiKIT gate module, why a transistor can replace a relay coil, and how a 5 V logic signal can safely command a 24 V industrial actuator.

The unit is hands on. Students build and measure real diode, transistor, and logic circuits on breadboards, and they document predictions, measurements, and explanations in an engineering notebook. SyncDeck simulations cover what students cannot see directly (electrons, holes, and depletion regions) and give every lab a browser-based fallback for when a circuit will not cooperate.

**Unit at a glance**

| Day | Investigation | Focus |
| ----- | ----- | ----- |
| 1 | 1. The Evolution of Control | Relays, vacuum tubes, and the mystery component |
| 2 | 2. What Makes a Semiconductor? | Doping, electrons and holes, and the PN junction |
| 3 | 3. Diodes and Biasing | Forward and reverse bias on the bench |
| 4 | 3. Diodes and Biasing | Rectification, protection, and the first troubleshooting challenge |
| 5 | 4. Transistors | The transistor as an electronic switch |
| 6 | 4. Transistors | Biasing calculations, operating regions, and amplification |
| 7 | 5. Transistors to Logic Gates | Building NOT, AND, and OR gates from transistors |
| 8 | 6. Semiconductor Manufacturing | From sand to packaged chip, and the automation that makes it possible |
| 9 | 7. Connecting Electrical Systems | Optocouplers, MOSFETs, SCRs, TRIACs, and 5 V to 24 V control |
| 10 | 8. Logic to Programmable Control | The 555 timer, hardwired logic, and ladder logic |
| Flex 1 to 5 | Labs and assessment | Extra lab time, the interface troubleshooting challenge, and the final assessment |

The flex periods are expected, not optional extras. The diode, transistor, and logic gate labs (Days 3 to 7) are the most likely to run long, and the final assessment needs its own period. Spend flex time there first.

## Standards alignment

The primary reference is the [Arizona Department of Education Automation and Robotics Technical Standards, revised 2025](https://www.azed.gov/sites/default/files/2025/07/AutomationandRoboticsTS.pdf), the same document the AC Motors unit uses. This unit addresses Standard 5.0, Implement and Test Control Circuits Using Diodes and Semiconductor Components, together with 4.10 on integrated circuits.

| Standard | Focus | Primary days |
| ----- | ----- | ----- |
| 4.10 | The role of integrated circuits in control systems, sensors, and smart devices | 7, 8, 10 |
| 5.1 | What a diode is and what it does in a control circuit | 1, 3, 4 |
| 5.2 | Insulators, conductors, N and P types, diodes, semiconductors, transistors, and the effect of temperature | 2, 3 |
| 5.3 | Thyristors and relays in a control circuit | 1, 9 |
| 5.4 | Electron and hole currents and how they explain diodes and transistors | 2, 3, 5 |
| 5.6 | Transistor biasing currents in cutoff, saturation, and the active (linear) region | 5, 6 |
| 5.7 | Build basic transistor and diode circuits using an oscilloscope and DMM | 3, 4, 5, 6 |
| 5.10 | Identify and troubleshoot component-level defects using diagnostic tools | 4, 6, 7, Flex |

**Not addressed in this unit:** 5.5 (decibel gain and loss of amplifiers, and power gain), 5.8 (impedance matching), and 5.9 (cascade amplifiers and voltage gain). The unit treats the transistor mainly as a switch, and Day 6 introduces amplification only as the active region. These three criteria need an amplifier-focused lesson, either as a flex extension that builds on Day 6 or in another unit.

**Supporting standards:** 3.9 (theoretical, simulated, and real results, compared in every lab that has a matching simulation); 4.2 (transistors and diodes as components); 4.9 (oscillators, through the 555 timer on Day 10); 4.11 (analog and digital circuits, through the active region versus switching on Day 6 and logic on Day 7); 6.8 (troubleshooting components with signal probes, meters, and the oscilloscope); 8.1 and 8.2 (relating a schematic to PLC inputs and outputs, including sourcing and sinking sensors, and interpreting ladder logic, on Day 10); 14.6 (common sensors, through an inductive proximity sensor demonstration and modeling PNP and NPN sensor outputs on Day 10); 15.3 (silicon and germanium as manufacturing materials, on Days 2 and 8); 15.9 (material handling in the microchip industry, on Day 8); and 16.2 (a process flowchart, on Day 8). These are connections, not a claim that the full breadth of each supporting standard is taught here.

Each match is a planning claim, not proof that a student has mastered the standard. The evidence section of each day below names what a student produces for each standard.

## Learning outcomes

By the end of the unit, students will be able to:

1. Explain how and why industrial control evolved from mechanical and electromechanical switching to semiconductor-based electronic control, comparing the advantages and limitations of each switching technology.
2. Describe and model semiconductor materials, including doping, electrons and holes as charge carriers, and the PN junction, and use that model to explain diode and transistor behavior.
3. Construct, measure, and troubleshoot diode and transistor circuits, including the effects of biasing and the three transistor operating regions.
4. Design and analyze transistor-based NOT, AND, and OR circuits, and explain how integrated circuits package the same idea at enormous scale.
5. Analyze circuits that connect low voltage electronic control to industrial sensors and actuators.
6. Describe the major stages of semiconductor manufacturing, identify the automation each stage depends on, and name related careers in Arizona.

## Instructional approach

Each day starts from a problem or a surprising observation, and students predict before they test. Direct instruction is short and comes after students have something to explain. Labs are staged with checkpoints, so a student verifies one part of a circuit before adding the next; a checkpoint is a quick DMM reading or an LED that should be on.

Every lab has a matching SyncDeck simulation. The simulation is for seeing what the bench cannot show (charge carriers, the depletion region, current at every point) and is a fallback for a group whose circuit fails. It does not replace the bench build.

**Troubleshooting runs through the unit.** Days 4, 6, and 7 each end with a hidden-fault challenge, and a larger one on the interface circuit fills a flex period. They follow the troubleshooting activity design used in other units: each fault has several plausible causes, tests return readings rather than answers, each test costs time against a budget, unsafe choices sit beside safe ones, and students must rule out causes and defend their diagnosis with their own readings.

**Engineering notebook.** Every day produces notebook evidence: a prediction, a circuit diagram, a measurement table, and an explanation. The notebook is the main formative assessment and the source for the final assessment.

**Supports and extensions.** Early labs give students the full circuit diagram, a measurement table with labeled columns, and a vocabulary card. Later labs remove these supports one at a time: Day 6 gives the diagram but not the table, and Day 7 gives only the truth table to match. Extension challenges are listed in each day for students who finish early.

## Lab supplies

This list gathers the materials from every day of the unit. The class has 10 to 20 students working in pairs, so plan for 5 to 10 pair kits, plus spares for parts that get lost or damaged.

### Pair kit

Each pair keeps one kit for the whole unit.

| Item | Per pair | Used on days |
| ----- | ----- | ----- |
| Breadboard and jumper wires | 1 | 1, 3 to 7, 9, 10 |
| 5 V DC supply (an adjustable bench supply also covers Day 3) | 1 | 1, 3, 5 to 7, 9, 10 |
| DMM with a diode-test mode | 1, or 2 on Day 6 if available | All lab days |
| 1N4001 diodes (one is the Day 1 mystery part, and one is the Day 9 flyback diode) | 4 | 1 to 4, 9 |
| Red LEDs | 4 | 1, 3, 5 to 7, 10 |
| 2N3904 NPN transistors | 4 | 5 to 7, 9, 10 |
| 2N3906 PNP transistors | 2 | 5, 10 |
| 150 Ω resistors | 2 | 5, 6 |
| 1 kΩ resistors | 4 | 1, 3, 4, 6, 7, 10 |
| 4.7 kΩ resistors | 4 | 5, 6, 10 |
| 10 kΩ resistors | 4 | 7, 9 |
| 47 kΩ and 470 kΩ resistors | 1 each | 6 |
| 100 kΩ potentiometer (extension) | 1 | 6 |
| Push buttons | 2 | 10 |
| Optocoupler (4N35 or PC817) | 1 | 9 |
| Logic-level MOSFET | 1 | 9 |
| 390 Ω resistor for the optocoupler LED, and any other values the final Day 9 driver schematic calls for | 1 | 9 |

For Day 1, hide the part number on each mystery diode with a dot of marker or a small piece of tape. Leave the band visible, because students use it to describe the orientation.

### Class and station equipment

| Item | Quantity | Used on days |
| ----- | ----- | ----- |
| Festo AC/DC trainer: 24 V DC source, toggle switch, DC relay, and indicator light | 1 for a demonstration | 1 |
| LogiKIT board with gate modules | 1 per pair, plus 2 or 3 spare boards for planted faults | 7, 9, 10 |
| Low voltage AC source (12 VAC transformer or function generator) | 1 per station | 4 |
| Oscilloscope | 1 per station, or 1 for a demonstration | 4 |
| Load resistors and a filter capacitor (about 470 µF, 25 V or higher) | 1 set per station | 4 |
| 24 V DC supply | 1 per station, plus 1 for the sensor demonstration | 9, 10 |
| 24 V relay with a coil current under 100 mA, or a small solenoid | 1 per station | 9 |
| Inductive proximity sensors, one PNP and one NPN, with datasheets and a steel target | 1 set | 10 |
| Interface PCB, or its schematic | 1, if available | 9 |
| Wafer or chip samples | A few, if available | 8 |
| Computers or devices with browsers for the SyncDeck simulations | 1 per pair | 2, 6 to 10 |

### Printed materials

A TO-92 pinout card for each pair (Days 5 to 10), a 2N3904 datasheet page (Day 6), the Day 8 team investigation template, and the engineering notebook pages for each lab.

### Instructor troubleshooting kit

Planted faults for the Day 4, Day 6, and Day 7 challenges: 100 Ω and 100 kΩ resistors to swap in for 1 kΩ, a deliberately damaged (open) diode, a 2N3906 to place where a 2N3904 belongs, and, for the Day 7 transistor NAND, a shorted 2N3904, a missing pull-up, and a loose ground jumper.

## Day 1: The Evolution of Control

**Investigation 1 · Standards 5.1, 5.3**

**Day question:** How could we switch a machine on and off with no moving parts?

### Objectives

Students will be able to:

1. Describe how a relay uses a small control current to switch a larger load current.
2. Identify the limitations of relays that pushed engineers toward vacuum tubes and then transistors: speed, size, wear, contact arcing, and power use.
3. Record evidence that a mystery component conducts in only one direction.

### Lesson sequence

**0 to 8 minutes: Revisit a relay.** Build the relay circuit from the AC Circuits unit on the Festo AC/DC trainer, using its DC relay and 24 V DC source: a toggle switch drives the relay coil, and an NO contact feeds an indicator light. The deck's relay simulator shows the same circuit. Ask: how many times per second could this relay switch? What wears out? What would happen to a computer built from 10,000 of these?

**8 to 18 minutes: From relays to tubes to transistors.** Show a short demonstration or video of a vacuum tube triode, where a small grid voltage controls a large plate current with no moving parts. Compare the relay, the vacuum tube, and the transistor in a table: switching speed, size, lifespan, power use, and failure mode. Students begin the comparison chart in their notebooks and fill in the transistor column as the unit goes on.

**18 to 38 minutes: The mystery component.** Each pair gets a breadboard, a 5 V supply, a 1 kΩ resistor, an LED as an indicator, and an unlabeled diode. Students build the circuit, observe the LED, then reverse the mystery component and observe again. They measure the voltage across the component in both directions with a DMM. Do not name the part yet.

**38 to 45 minutes: Explain.** Students write an evidence-based claim: what does the component do, and what might be happening inside it? Collect their ideas in a Resonance short answer. These ideas become the starting point for Day 2.

### Evidence

Notebook comparison chart (relay, vacuum tube, transistor), with evidence-based advantages and limitations. A data table for the mystery component in both directions, with a written claim.

### Materials

The Festo AC/DC trainer (24 V DC source, toggle switch, DC relay, indicator light) and the deck's relay simulator, vacuum tube images or a short video, diodes (1N4001 or 1N4148), LEDs, 1 kΩ resistors, breadboards, 5 V supplies, DMMs.

### Presentation

`Decks/AR2/Silicon in Control/Day1_Evolution_of_Control.html`, 16 slides:

1. Title
2. Today's question and objectives
3. Revisiting the relay: the trainer's DC relay circuit as a simulator on 24 V DC, with an operation counter
4. The cost of 10,000 relays: speed, wear, power, and arcing, and the 1947 moth in the Harvard Mark II
5. Resonance check: how long a relay lasts at 50 switches per second, and one other problem at scale
6. Inside a vacuum tube: heater, cathode, grid, and plate
7. Triode Explorer simulator: heater warm-up, grid voltage, plate current, and cutoff
8. Resonance check: what the grid does, and how few volts switch the tube off
9. ENIAC: 17,468 tubes, about 150 kW, and a failed tube about every two days
10. Comparison chart of relays, vacuum tubes, and transistors, with the transistor column left for students to fill in
11. Resonance check: what the tube fixed and what it broke
12. Mystery component lab steps, with the circuit drawing and a safety note
13. What to record: the notebook table for both orientations
14. Mystery Component Bench simulator, for absent students or a second look
15. Resonance claim and exit ticket
16. Wrap up and a preview of Day 2

## Day 2: What Makes a Semiconductor?

**Investigation 2 · Standards 5.2, 5.4**

**Day question:** Why does the mystery component let current through in one direction only?

### Objectives

Students will be able to:

1. Distinguish conductors, insulators, and semiconductors by how freely their charge carriers move.
2. Explain how adding phosphorus or boron to silicon creates N-type and P-type material.
3. Describe current in a semiconductor as electrons moving one way and holes moving the other.
4. Explain why a semiconductor conducts better when it is warmer, which is the opposite of a metal.
5. Describe the depletion region that forms where P-type and N-type material meet.

### Lesson sequence

**0 to 5 minutes: Hook.** Show the class's Day 1 claims. Ask which ones could explain a one-way valve for current.

**5 to 15 minutes: Silicon and doping.** Introduce the silicon crystal: each atom shares four electrons with its neighbors, so pure silicon has very few free carriers. Add a phosphorus atom, which has a fifth electron with nowhere to bond, so N-type silicon has extra free electrons. (The first transistors were made from germanium, which behaves the same way but leaks more current when warm; that is one reason the industry moved to silicon.) Add a boron atom, which is missing one electron, and the gap it leaves is a hole that behaves like a moving positive charge.

**15 to 30 minutes: Simulation, the Doping Lab.** Students use the doping simulation (specification below). They add donors and acceptors, apply a voltage, and watch electrons and holes drift in opposite directions. They raise the temperature and watch electron-hole pairs appear in pure silicon. Then they join P and N regions and watch carriers near the boundary recombine to leave a depletion region with no free carriers.

**30 to 38 minutes: Temperature on the bench.** Students set a DMM to diode mode, read the forward voltage of a diode, then pinch the diode between their fingers for 30 seconds and read it again. The reading drops by roughly 2 mV for every degree of warming, because more carriers are available. Compare with a length of copper wire, which conducts slightly worse when warmer.

**38 to 45 minutes: Model the junction.** Students draw and annotate a PN junction in their notebooks: P side, N side, holes, electrons, and the depletion region. Exit question on Resonance: which side of the junction has extra electrons, and what happens to them at the boundary?

### Evidence

Annotated PN junction model; a written explanation of how doping changes electrical behavior; temperature readings with an explanation.

### Materials

Doping Lab simulation; optional physical model (two colors of beads or tokens on a grid); DMMs with a diode mode; diodes.

### Presentation

`Decks/AR2/Silicon in Control/Day2_What_Makes_a_Semiconductor.html`, 15 slides:

1. Title
2. Today's question and objectives
3. Hook: the class evidence from Day 1 and a one-way valve for current
4. Conductors, insulators, and semiconductors, with a resistivity scale from copper to glass
5. The silicon crystal: four shared electrons per atom, heat-generated pairs, and germanium
6. N-type: phosphorus adds a free electron and leaves a fixed P⁺ ion
7. P-type: boron leaves a hole, and a hole moves when an electron jumps into it
8. Resonance check: what phosphorus adds, and what moves when a hole moves
9. Doping Lab simulator with six tasks
10. Temperature on the bench: the DMM diode test before and after 30 seconds in your fingers
11. Resonance check: why the reading dropped, and copper compared with silicon
12. The PN junction: recombination at the boundary, the depletion region, and its field
13. Model the junction in the notebook
14. Resonance exit ticket, including a prediction for Day 3
15. Wrap up

### Simulation specification: Doping Lab

**Interaction:** discover. A grid of silicon atoms with bonds drawn between them.

- **Controls:** add donor (phosphorus) or acceptor (boron) atoms by clicking; a doping level slider; an applied voltage slider with polarity; a temperature slider; a "join P and N" mode that places a P region beside an N region.
- **Display:** free electrons as small blue dots and holes as open red circles, each moving by a random walk plus drift in the applied field. A readout counts free electrons, holes, and the resulting current.
- **Model:** electrons drift toward the positive terminal and holes toward the negative terminal; both count toward current in the same direction. Raising the temperature creates electron-hole pairs at a rate that grows with temperature, which matters most in lightly doped silicon. In join mode, carriers that cross the boundary recombine, leaving a band with fixed charged ions and no free carriers.
- **Key misconception to target:** a hole is not a positive particle traveling through the wire. It is a missing electron in a bond, and it "moves" when a neighboring electron fills it.

## Day 3: Diodes and Biasing

**Investigation 3 · Standards 5.1, 5.2, 5.4, 5.7**

**Day question:** What has to happen at the junction before current can flow?

### Objectives

Students will be able to:

1. Identify the anode and cathode of a diode and draw its schematic symbol.
2. Explain forward and reverse bias in terms of the depletion region.
3. Measure the diode voltage drop and the circuit current under forward and reverse bias.
4. Use the diode voltage drop to calculate the current in a series resistor circuit.

### Lesson sequence

**0 to 8 minutes: Name the mystery component.** Reveal that the Day 1 component is a diode. Connect the Day 2 junction model to the symbol: the arrow points the way conventional current flows when the diode is forward biased.

**8 to 15 minutes: Bias and the depletion region.** Use the Doping Lab in join mode. Forward bias pushes carriers into the depletion region until it collapses and current flows, once the voltage reaches about 0.7 V for silicon. Reverse bias pulls carriers away and widens the depletion region, so almost no current flows.

**15 to 38 minutes: Bench lab.** Students build a 5 V supply, a 1 kΩ resistor, and a diode in series. They predict, then measure: the voltage across the diode, the voltage across the resistor, and the current, for forward and reverse bias. They calculate the current from the resistor voltage and compare it with the meter reading. Forward bias should give about 0.6 to 0.7 V across the diode and about (5 − 0.7) / 1000 ≈ 4.3 mA. Reverse bias should give nearly the full 5 V across the diode and almost no current.

**38 to 45 minutes: Explain.** Students explain each measurement using the depletion region. Exit question on Resonance: if the supply rises from 5 V to 9 V, what happens to the diode voltage and to the current?

### Extension

Plot a rough current versus voltage curve by replacing the fixed supply with an adjustable one and recording current at 0.1 V steps near 0.6 V.

### Evidence

Circuit diagram, prediction and measurement table, calculated current, and an explanation tying each reading to the depletion region.

### Materials

Breadboards, 1N4001 diodes, 1 kΩ resistors, adjustable DC supplies, DMMs.

### Presentation

`Decks/AR2/Silicon in Control/Day3_Diodes_and_Biasing.html`, 13 slides:

1. Title
2. Today's question and objectives
3. It is a diode: the case and band, the PN junction inside, and the schematic symbol
4. Forward and reverse bias, with the depletion region drawn for each
5. Bias the Junction: the Doping Lab in junction mode with a bias slider and five tasks
6. Resonance check: why about 0.7 V is needed, and what reverse bias does to the depletion region
7. The 0.7 V rule worked through for 5 V and 1 kΩ (4.3 mA), and the reversed case
8. Resonance practice: 9 V and 2.2 kΩ (3.8 mA), and finding a classmate's mistake
9. Bench lab steps, the ammeter safety note, and the I–V extension
10. What to record: the notebook table for forward and reverse bias
11. Diode Bench simulator with an adjustable supply, a DMM, and a current versus voltage plot
12. Resonance exit ticket: 5 V to 9 V, and explaining the measurements with the depletion region
13. Wrap up and a preview of rectification

The Doping Lab and Diode Bench live in `semiconductor-sims.js` in this folder, so later decks in the unit can reuse them.

## Day 4: Rectification, Protection, and Troubleshooting

**Investigation 3 · Standards 5.1, 5.7, 5.10**

**Day question:** How can a one-way valve for current turn AC into DC?

### Objectives

Students will be able to:

1. Explain half-wave and full-wave (bridge) rectification and sketch the output waveform of each.
2. Measure a rectified waveform with an oscilloscope and identify the peak voltage lost across the diodes.
3. Explain how a flyback diode protects a transistor or switch from the voltage spike of a relay coil.
4. Locate a hidden fault in a diode circuit from measurements.

### Lesson sequence

**0 to 6 minutes: Hook.** Show the sine wave from the AC Circuits unit. Ask: if a diode only lets current flow one way, what will the waveform look like after it?

**6 to 22 minutes: Rectification.** With a low voltage AC source (a 12 VAC transformer or a function generator, never mains), students build a half-wave rectifier with a load resistor and observe the output on an oscilloscope. They measure the peak and compare it with the input peak, which should be about 0.7 V lower. An instructor demonstration or the rectifier simulation adds a bridge rectifier and a filter capacitor. If oscilloscopes are short, run the scope section as a station or a demonstration.

**22 to 28 minutes: Diodes as protection.** Connect back to the relays from Day 1. When current through a relay coil is switched off, the collapsing magnetic field produces a large voltage spike. A diode across the coil gives that current a safe path. This idea returns on Day 9.

**28 to 43 minutes: Troubleshooting challenge, Diode Bench Diagnosis.** Students use the hidden-fault simulator below. In classrooms with spare boards, set up two or three physical boards with planted faults as well.

**43 to 45 minutes: Exit.** Students record one fault, the reading that gave it away, and why.

### Evidence

Oscilloscope sketches with input and output peak voltages labeled; a written explanation of rectification; the troubleshooting record.

### Materials

Low voltage AC source, diodes, load resistors, a filter capacitor for the demonstration, oscilloscopes, DMMs.

### Troubleshooting specification: Diode Bench Diagnosis

Reuse the Work Orders engine from the AR2 AC Motors unit (Day 5), or its simpler single-ticket version from AR1 Fluid Power Deck 2.

- **Symptom:** an indicator LED in a diode circuit is dark (or too bright, depending on the dealt fault).
- **Causes, dealt from a shuffled deck:** the diode is reversed; the resistor is the wrong value (100 Ω or 100 kΩ in place of 1 kΩ); the diode is open; the LED is reversed. Add a distractor cause, a dead supply, that the first supply reading rules out.
- **Tests with time costs:** read the resistor color bands (1 min); measure the supply voltage (2 min); measure the voltage across the diode (2 min); measure the voltage across the resistor (2 min); test the diode out of circuit in diode mode (5 min); measure resistance of the resistor out of circuit (5 min); a noise test that returns real but unhelpful data, such as the supply's current limit setting.
- **Unsafe or bad-practice choices:** measure resistance with the circuit powered; touch the diode to see whether it is hot. Each shows a warning that names the problem and the correct procedure.
- **Budget:** tune so a careful path leaves time to spare and running every test does not fit.

### Presentation

`Decks/AR2/Silicon in Control/Day4_Rectifiers_and_Protection.html`, 16 slides:

1. Title
2. Today's question and objectives
3. Hook: a 12 VAC sine wave meets a one-way valve, and why 12 VAC (RMS) peaks at 17.0 V
4. Resonance prediction: the output shape of a diode and resistor on AC
5. The half-wave rectifier: circuit, waveform, and the 0.7 V lost at the peak
6. Scope lab: build the half-wave rectifier, measure the peaks, and record them (the bridge with a filter capacitor is demonstrated after the simulator)
7. Why a bridge rectifier: the half-wave throws away half of every cycle, and flipping that half doubles the average DC
8. Rectifier Lab tasks A to F
9. Rectifier Lab simulator: half-wave and bridge, filter capacitor, a scope with a sweeping cursor, and conduction highlighted in the circuit
10. Resonance check: the half-wave output peak, and why a bridge loses 1.4 V
11. The flyback diode: a relay coil spike with and without the diode
12. Resonance check: why the diode, and how it reduces arcing
13. How Diode Bench Diagnosis works
14. Diode Bench Diagnosis (the service call simulator on the Day 1 loop)
15. Resonance exit ticket: which causes fit a 5.00 V diode reading, and one fault students diagnosed
16. Wrap up and a preview of the transistor

## Day 5: The Transistor as an Electronic Switch

**Investigation 4 · Standards 5.4, 5.6, 5.7**

**Day question:** How can a tiny current control a much larger one, with no moving parts?

### Objectives

Students will be able to:

1. Identify the base, collector, and emitter of an NPN transistor and draw its symbol.
2. Describe the NPN transistor as two PN junctions, and explain how base current lets collector current flow.
3. Build a transistor circuit that switches an LED, and measure base and collector current.
4. Explain how a PNP transistor mirrors an NPN transistor, and when each one is used.
5. Compare transistor switching with relay switching.

### Lesson sequence

**0 to 5 minutes: Hook.** Put a relay and a transistor side by side. Both let a small signal control a larger load. Ask students to predict three differences.

**5 to 15 minutes: Inside the NPN transistor.** Build on the Day 2 model: an NPN transistor is a thin P-type base between two N-type regions. A small base current floods the thin base with electrons, most of which sweep straight through to the collector. Introduce current gain, β = I<sub>C</sub> / I<sub>B</sub>, as "how many times larger the collector current is."

**15 to 32 minutes: Bench lab, the NPN switch.** Students build a 2N3904 switch: a 5 V supply, a 4.7 kΩ base resistor from a switch or jumper, and an LED with a 150 Ω resistor between the supply and the collector, with the emitter to ground. They checkpoint the LED circuit alone first, then add the transistor. They measure base current and collector current with the switch open and closed, and calculate the ratio.

**32 to 40 minutes: The PNP mirror.** The 2N3906 is the PNP twin of the 2N3904: a thin N-type base between two P-type regions, with every current and voltage reversed. Students build it as a high-side switch: the emitter to +5 V, the LED and its 150 Ω resistor from the collector to ground, and the 4.7 kΩ base resistor switched to ground to turn it on. An NPN switch sits between the load and ground and *sinks* current; a PNP switch sits between the supply and the load and *sources* current. This distinction returns on Day 10, where industrial sensors come in both types.

Both parts use the same TO-92 package and the same emitter, base, collector pin order, and only the printing tells them apart. Have students read the part number before placing every transistor.

**40 to 45 minutes: Compare.** Students add the transistor column to their Day 1 comparison chart. Resonance check: the base current is 1 mA and the collector current is 18 mA. Is that the transistor's β? Why or why not? (No. In saturation the load limits the collector current, so the ratio is smaller than β.)

### Evidence

Circuit diagram, base and collector current measurements, the calculated current ratio, and an updated comparison chart.

### Materials

2N3904 (NPN) and 2N3906 (PNP) transistors, 4.7 kΩ and 150 Ω resistors, LEDs, breadboards, 5 V supplies, DMMs, and a printed pinout card for the TO-92 package.

### Presentation

`Decks/AR2/Silicon in Control/Day5_The_Transistor_Switch.html`, 16 slides:

1. Title
2. Today's question and objectives
3. Hook: a relay and a transistor switching an LED, side by side
4. Resonance prediction: three ways the two switches might differ
5. Inside the NPN transistor: the N-P-N structure, two PN junctions, and the symbol
6. How a small current controls a large one: electrons flood the thin base, a few leave as base current, and most reach the collector
7. Current gain: β = I<sub>C</sub> / I<sub>B</sub> and I<sub>E</sub> = I<sub>B</sub> + I<sub>C</sub>, with a worked example
8. Resonance check: which terminal carries the most current, and a β calculation
9. Bench lab: the NPN switch, with the LED checkpoint first and the schematic
10. Record table for I<sub>B</sub>, I<sub>C</sub>, and the ratio, and why the ratio is far below β
11. Transistor Switch Bench simulator: NPN or PNP, the base switch, a DMM, and a cross-section of carriers crossing the base
12. The PNP mirror: sinking and sourcing switches
13. Bench lab: the PNP switch, the part number warning, and the TO-92 pinout
14. The transistor column of the comparison chart
15. Resonance exit ticket: is an 18 mA / 1 mA ratio the β, sinking and sourcing, and one advantage over a relay
16. Wrap up and a preview of amplification

## Day 6: Biasing, Operating Regions, and Amplification

**Investigation 4 · Standards 5.6, 5.7, 5.10**

**Day question:** Why is a transistor sometimes a switch and sometimes an amplifier?

### Objectives

Students will be able to:

1. Identify cutoff, the active region, and saturation from measured base current, collector current, and collector-emitter voltage.
2. Calculate the base resistor needed to drive a transistor into saturation.
3. Explain why a switch should operate only in cutoff or saturation, and why an amplifier operates in the active region.
4. Locate a biasing fault in a transistor circuit from measurements.

### Lesson sequence

**0 to 10 minutes: The three regions.** Use the Transistor Region Explorer (specification below). With no base current the transistor is in cutoff and acts like an open switch. With a little base current the transistor is in the active region, where I<sub>C</sub> = β × I<sub>B</sub> and the collector current follows the base current, which is amplification. With enough base current the load limits the collector current and V<sub>CE</sub> drops to about 0.2 V; the transistor is saturated and acts like a closed switch.

**10 to 20 minutes: Biasing calculation.** Work one example together, then students do one alone.

- Saturation collector current: I<sub>C(sat)</sub> ≈ (5 V − 2 V for the LED − 0.2 V) / 150 Ω ≈ 18.7 mA.
- Minimum base current, using the lowest β the 2N3904 datasheet guarantees near this current (h<sub>FE</sub> of 100 at 10 mA): 18.7 mA / 100 ≈ 0.19 mA.
- Drive the base about five times harder than the minimum to be sure of saturation: about 1 mA.
- Base resistor: (5 V − 0.7 V) / 1 mA = 4.3 kΩ. Use the next standard value, 4.7 kΩ, which gives about 0.91 mA.

**20 to 32 minutes: Bench lab.** Students swap base resistors (4.7 kΩ, 47 kΩ, 470 kΩ) and record I<sub>B</sub>, I<sub>C</sub>, and V<sub>CE</sub> for each, then classify each as cutoff, active, or saturation. At 470 kΩ, I<sub>B</sub> is only about 9 µA, so the LED glows dimly and V<sub>CE</sub> is several volts: the transistor is in the active region and is wasting power as heat.

**32 to 43 minutes: Troubleshooting challenge, the Mystery Driver.** Students use the hidden-fault mode of the driver they just explored (specification below). Day 4 used the service-call format, so this one runs inside the familiar circuit instead: students probe the board, pull parts, strike causes, diagnose, and defend.

**43 to 45 minutes: Exit.** Why does a transistor switch get hot when its base resistor is too large?

### Extension

Use a potentiometer as an adjustable base resistor and plot I<sub>C</sub> against I<sub>B</sub>. Find where the line stops rising (the start of saturation) and estimate β from the slope of the straight part.

### Evidence

Biasing calculation with work shown, a measurement table with each row classified by region, and the troubleshooting record.

### Materials

2N3904 transistors, base resistors (4.7 kΩ, 47 kΩ, and 470 kΩ) for the region lab, 150 Ω collector resistors, LEDs, breadboards, 5 V supplies, and two DMMs per pair if available, so base and collector current can be read at the same time. A 2N3904 datasheet page showing h<sub>FE</sub> and V<sub>CE(sat)</sub> for the biasing calculation. For the extension, a 100 kΩ potentiometer in series with a 1 kΩ resistor, so the base current can never exceed a safe value when the potentiometer is turned to zero.

### Simulation specification: Transistor Region Explorer

- **Controls:** a base drive slider (input voltage or base resistor); supply voltage; collector load (LED with resistor, or resistor only); β selection within the datasheet range.
- **Display:** the circuit with current shown on each wire, the LED brightness, a gauge for each of I<sub>B</sub>, I<sub>C</sub>, and V<sub>CE</sub>, and a region badge (Cutoff, Active, Saturation). A small graph of I<sub>C</sub> against I<sub>B</sub> marks the current operating point, and shows the line bending flat at saturation.
- **Model:** I<sub>B</sub> = (V<sub>in</sub> − 0.7 V) / R<sub>B</sub> when V<sub>in</sub> > 0.7 V, otherwise 0. I<sub>C</sub> = min(β × I<sub>B</sub>, I<sub>C(sat)</sub>). V<sub>CE</sub> = V<sub>CC</sub> − I<sub>C</sub> × R<sub>load</sub> − V<sub>LED</sub>, with a floor of 0.2 V. Transistor power = I<sub>C</sub> × V<sub>CE</sub>, shown as a heat indicator, which peaks in the active region.

### Troubleshooting specification: the Mystery Driver

- **Symptom:** the LED on a transistor switch is dim or dark when the input is on.
- **Causes:** the base resistor is too large, so the transistor never saturates (the fault named in the Curriculum Action Plan); the transistor is turned around, so the collector and emitter are swapped and it works poorly in reverse; a 2N3906 is in the 2N3904's place, which looks identical but needs the opposite polarity; the emitter is not connected to ground. Add a distractor cause, a blown transistor, which a diode-mode test of both junctions rules out.
- **Tests:** read the base resistor bands; read the part number on the transistor; measure V<sub>BE</sub>; measure V<sub>CE</sub>; measure the voltage across the LED; measure I<sub>B</sub>; test the transistor junctions in diode mode out of circuit (a PNP part conducts with the meter leads the opposite way round); check the pinout against the datasheet.
- **Unsafe or bad-practice choices:** replace the base resistor with a wire to "give it more current" (which destroys the base junction); measure resistance with the circuit powered.
- **Format:** the Region Explorer's circuit with the base resistor value and part number hidden. Tests cost 1 to 3 minutes against a 10-minute budget, bench notes give one lead per cause, and students strike causes, choose a cause and fix, tag supporting readings, and receive a scored record.

### Presentation

`Decks/AR2/Silicon in Control/Day6_Operating_Regions_and_Biasing.html`, 18 slides:

1. Title
2. Today's question and objectives
3. Hook: the last lesson's 4.7 kΩ readings, and a prediction for 470 kΩ
4. Resonance prediction: what a 100 times larger base resistor does
5. What is an amplifier: a small input wave and its larger copy, everyday and industrial examples, β as the transistor's gain, and a preview of clipping
6. The three regions: a diagram of I<sub>C</sub> against I<sub>B</sub> shaded into cutoff, active, and saturation, with V<sub>CE</sub> for each
7. Transistor Region Explorer simulator (top of a vertical stack; press down for its tasks)
8. Region Explorer tasks A to F
9. Why a switch stays out of the active region: P = I<sub>C</sub> × V<sub>CE</sub> for an LED and a motor, and why an amplifier lives there
10. Resonance check: name the region from two sets of readings
11. Choosing a base resistor: the four-step worked example (4.7 kΩ)
12. Your turn: a 40 mA relay coil (2.2 kΩ)
13. Bench lab: three base resistors
14. Record and classify table
15. How the Mystery Driver works
16. The Mystery Driver (hidden-fault simulator)
17. Resonance exit ticket: the readings for a too-large base resistor, and why the switch gets hot
18. Wrap up and a preview of logic gates

## Day 7: From Transistors to Logic Gates

**Investigation 5 · Standards 4.10, 5.4, 5.10**

**Day question:** What is inside a LogiKIT gate module?

### Objectives

Students will be able to:

1. Recall the NOT, AND, OR, NAND, NOR, and XOR truth tables from the LogiKIT labs.
2. Build a transistor NOT gate and explain why it inverts.
3. Explain why transistors in series make an AND function and transistors in parallel make an OR function.
4. Verify a transistor gate's truth table against the matching LogiKIT module.
5. Explain how an integrated circuit packages the same transistor switches at enormous scale.

### Lesson sequence

**0 to 7 minutes: LogiKIT review.** Students already completed LogiKIT Labs 1 and 2, so this is a fast warm-up, not a reteach. Run a quick round of Resonance truth table checks: one each for AND, OR, NOT, and NAND, and one that describes the XOR rule (output 1 when exactly one input is 1). Students have not seen LogiKIT Lab 2 in about a year, so no question depends on remembering its circuits. Remind students that each LogiKIT module was a black box.

**7 to 15 minutes: Open the box.** Start from the Day 6 switch. When the input is high, the transistor saturates and the collector voltage falls to about 0.2 V; when the input is low, the transistor is cut off and a pull-up resistor holds the collector at 5 V. The output is the opposite of the input: a NOT gate. Next, two switches between 5 V and the output, with a pull-down resistor, make AND in series and OR in parallel. Moving the same switches to the bottom, under a pull-up, flips the output: series gives NAND and parallel gives NOR. A top-side NPN only lifts the output to about 4.3 V, which is one reason chips build NAND and NOR and add a NOT to get AND and OR. Students should recognize the Lab 1 pattern: AND followed by NOT is NAND.

**15 to 35 minutes: Bench lab.** Every pair builds a transistor NOT gate and checks its truth table against a LogiKIT NOT module, using a LogiKIT switch as the input. Then pairs split: half build the series pair (NAND) and half build the parallel pair (NOR). Each pair checks its circuit against the matching LogiKIT module. Students who finish early add an inverter to make AND or OR.

**35 to 43 minutes: Troubleshooting challenge, the faulty gate.** A transistor NAND built from the build sheet no longer follows the NAND truth table. Students fill the truth table first (free), then probe five test points and run power-off tests against a 10-minute budget, and diagnose the hidden cause and fix. Every cause has a look-alike with the same truth table (an open base resistor or an ungrounded emitter; a shorted Q2 or Q2's base tied to 5 V; a missing pull-up or a burned-out lamp), so the table narrows the search and a voltage settles it. The simulation runs the activity; with spare boards, plant the same faults on breadboards. This replaces the planned LogiKIT Truth Table Detective, which is saved for the LogiKIT presentations update because students no longer remember the Lab 2 circuits.

**43 to 45 minutes: Exit.** A faulty NAND question (the lamp stays lit, and Q1's base reads 5 V: which fault fits?), then: a chip in a phone holds billions of transistors. Using today's circuits, explain what most of those transistors are doing.

### Evidence

Truth tables for the transistor gates and the LogiKIT modules side by side; a schematic of a transistor NAND or NOR gate with an explanation; the troubleshooting record.

### Materials

2N3904 transistors, 1 kΩ and 10 kΩ resistors, LEDs, breadboards, LogiKIT boards and gate modules.

### Simulation specification: Transistor Gate Builder

- **Display:** a transistor-level NOT, NAND, or NOR gate drawn with NPN symbols that glow when they conduct, a pull-up resistor, and an output LED with its own return to ground. The truth table starts blank and fills in each row the first time students reach that input combination.
- **Controls:** the A and B labels on the schematic are the input toggles; a gate selector; a "show current" toggle that animates current through the path that pulls the output low. A task line counts the rows found and points to the next unfinished gate.
- **Purpose:** make series-equals-AND and parallel-equals-OR visible by showing which switches close. Students see that the output is pulled low only when the transistors make a complete path to ground. The interactive builder draws real NPN symbols that light when on; the concept slides draw them as switches.

### Simulation specification: The Faulty Gate

- **Display:** the Gate Builder's transistor NAND (NPN symbols, A and B toggles on the schematic, a lamp on Y) with test points TP1 to TP5 at the output, Q1's base, the node between Q1 and Q2, Q2's base, and Q2's emitter. The transistors do not glow, because which one conducts is the evidence. A truth table compares "Should be" with the lamp and marks wrong rows in red.
- **Faults, dealt from a shuffled deck:** Q1's base resistor open, Q2's emitter not grounded, Q2 shorted, Q2's base resistor tied to 5 V, the pull-up missing, Q1 and Q2 wired in parallel. "The lamp is burned out" is a distractor.
- **Tests:** truth table rows are free; a probe costs 1 minute at the current inputs; power-off tests (ohms, continuity, diode test, trace the wiring) cost 2 to 4 minutes; two unsafe choices are charged and never carried out. Students strike causes, choose a cause and a fix, and get a record that checks whether they found the reading that separates the look-alike faults.

### Presentation

`Decks/AR2/Silicon in Control/Day7_Transistors_to_Logic_Gates.html`, 19 slides:

1. Title
2. Today's question and objectives
3. LogiKIT review: a photo of the board and the module colors
4. Resonance warm-up: AND, OR, NOT, NAND, and the XOR rule (no Lab 2 memory needed)
5. Open the box: the transistor NOT gate with its pull-up resistor (the fragments close and open the switch and light the output)
6. Series makes AND: two top-side switches and a pull-down resistor
7. Parallel makes OR: the same switches side by side
8. Series on the bottom makes NAND (and why chips build NAND and add a NOT for AND)
9. Parallel on the bottom makes NOR
10. The gate that flew to the Moon: resistor-transistor logic (RTL), the Apollo Guidance Computer built from about 2,800 chips of two NOR gates each, and NOT, OR, and AND made from NOR gates alone
11. Transistor Gate Builder simulator
12. Resonance check: series and parallel transistor gates
13. Bench lab: the NOT gate, then NAND or NOR, checked against the LogiKIT modules
14. Record table: transistor gate and LogiKIT module side by side
15. Billions of switches: from a breadboard gate to an integrated circuit
16. How the faulty gate works: find the hidden fault in a transistor NAND
17. The Faulty Gate simulator
18. Resonance exit ticket: which fault fits a NAND whose lamp stays lit, and what most of a phone chip's transistors are doing
19. Wrap up and a preview of semiconductor manufacturing

The LogiKIT board photo (`media/logikit-board.jpg`) comes from the Lab 2 presentation. The bench lab joins the LogiKIT ground to the breadboard ground and drives the transistor base from a LogiKIT switch through 10 kΩ, about 0.43 mA; confirm the switch output can supply that (see Open items).

## Day 8: Semiconductor Manufacturing

**Investigation 6 · Standard 4.10 · Career connection**

**Day question:** How do you build billions of transistors on a chip smaller than a fingernail, and who runs the machines that do it?

### Objectives

Students will be able to:

1. Sequence the major steps from silicon crystal to packaged chip.
2. Read a wafer map and name the manufacturing step, sensor, and actuator behind a failure pattern.
3. Name technical careers in semiconductor manufacturing and the education paths into them.

### Lesson sequence

**0 to 8 minutes: Hook and scale.** A wafer or chip sample if available, then a view of how small one transistor in a modern chip is. Connect to Day 2: the n-type and p-type regions students modeled are made by ion implantation, one of the steps they will investigate.

**8 to 16 minutes: The process loop.** A short overview of the front-end loop (deposition, photolithography, etching, ion implantation, polishing, and repeat, layer by layer) and the back-end steps (wafer probe and test, dicing, die attach, wire bonding or flip-chip bonding, molding, and final test). Students place the steps in order with the flowchart slot builder.

**16 to 36 minutes: Reading wafer maps.** At wafer probe every die is tested, and the pass and fail results form a map. Students learn this the way a new technician would: the teacher walks through six failure patterns, one slide each, and for each one the class names the step that went wrong, the sensor that catches it, and the actuator that corrects it. The patterns are a ring at the edge (polishing pressure), a bullseye in the center (an etch heater zone), the same spot in every exposure field (dust on a photolithography mask), a straight scratch (a misaligned handling robot), the whole wafer failing (the wrong implant dose), and a random cluster (particles in the cleanroom air). Each slide links a reference for students who want more. Then students practice on random maps and diagnose the step on their own. This replaced a team investigation: students had too little background to research an operation on their own, and seeing each pattern with its cause first gives them what they need to diagnose one.

**36 to 45 minutes: Automation and careers.** Look back across the six patterns: every one was caught by a sensor and corrected by an actuator, the same things students study in this course. Close with Arizona: chip fabrication and advanced packaging facilities in the Phoenix area, and the technician, equipment, and automation roles they need. Check these industry examples against current news before class, since investments and project timelines change often.

### Evidence

Notebook process diagram from wafer to packaged chip; the practice score from reading wafer maps; and the exit ticket naming a technician job, a sensor or actuator, and a course skill.

### Materials

Wafer or chip samples, process illustrations, short manufacturing videos, career resources, and the fellowship presentations on semiconductor manufacturing, assembly and packaging, and advanced packaging. Use these presentations as teacher background and as a source of facts. Many of their images are credited to companies or publishers, so redraw diagrams or link to the original sources instead of copying images into public decks.

### Time note

This day is tight. If teams need more time, give the investigation the full period and move the gallery share into a flex period.

### Presentation

`Decks/AR2/Silicon in Control/Day8_Semiconductor_Manufacturing.html`, 29 slides (slides 10 to 16 and 18 to 24 are vertical stacks):

1. Title
2. Today's question and objectives
3. Hook: a scale ladder from a human hair down to transistor spacing
4. Resonance prediction: how many transistors fit across a hair, and how a factory could make billions at once
5. From sand to wafer: crystal growth, slicing, and polishing
6. The front-end loop: deposition, photolithography, etch and clean, ion implantation, and polishing, repeated for every layer
7. ASML's EUV scanner: the machine behind photolithography (one company, tin-droplet EUV light, mirrors in a vacuum, about $200 million)
8. The back end: probe, dice, attach, bond, mold, and final test
9. Whole-class video (video-sync): Intel, "From Sand to Silicon: The Making of a Microchip" (4:44)
10. See It Up Close: a vertical stack for individual viewing on student devices
11. Growing the crystal: UNSW eLearning's Czochralski animation
12. The EUV scanner: Branch Education, "The $200M Machine that Prints Microchips," with links to ASML's EUV light clip and Veritasium
13. The front-end loop: TED-Ed, "How are microchips made?"
14. Polishing flat: the CMP polisher diagram and photo, with a reference link
15. Wire bonding: Semitracks, "Wirebonding Overview Animation," and an electron microscope image of bond wires
16. The deep dive: Branch Education, "How are Microchips Made?" (about 30 minutes)
17. Process flowchart slot builder (13 steps: six given as anchors, seven for students to place, and two distractors)
18. Reading a wafer map: what wafer probe records, and how a pattern points to a step (top of a vertical stack)
19. Pattern: a ring at the edge (polishing pressure, a thickness sensor, pressure zones)
20. Pattern: a bullseye in the center (an etch heater zone, chuck temperature sensors, heater control)
21. Pattern: the same spot in every field (dust on the photolithography mask, mask inspection cameras, the wafer stage)
22. Pattern: a straight scratch (a misaligned robot, joint encoders and a vacuum sensor, servo motors)
23. Pattern: the whole wafer fails (the wrong implant dose, a Faraday cup, beam control)
24. Pattern: a random cluster (cleanroom particles, particle counters, fan filter units)
25. Practice: random wafer maps, choose the step that failed
26. A fab runs on automation: sensors, actuators, control, and material handling
27. Chipmaking in Arizona: TSMC, Intel, Amkor, and technician and engineer paths (speaker notes hold the November 2026 status; recheck before class)
28. Resonance exit ticket: ion implantation, photolithography, and one technician job
29. Wrap up and a preview of interfacing 5 V logic with 24 V devices

Images on slides 5, 7, 8, 14, 15, and 18 come from the fellowship course materials in this folder: the ingot puller and CMP diagrams from ASU's "Introduction to Semiconductor Manufacturing," the dicing saw, probe card, and bond-wire images from Hongbin Yu's "Assembly and Packaging" module, and the ASML EUV scanner image from the "Advanced Packaging" lecture. Each slide credits its source.

## Day 9: Connecting Different Electrical Systems

**Investigation 7 · Standards 5.3, 5.7**

**Day question:** How can a 5 V logic signal safely command a 24 V industrial actuator?

### Objectives

Students will be able to:

1. Explain why logic circuits and industrial loads need different voltages and, often, electrical isolation.
2. Describe how an optocoupler passes a signal using light, with no electrical connection between its two sides.
3. Build a transistor or MOSFET driver for a 24 V load, with a flyback diode on any inductive load.
4. Compare MOSFETs, SCRs, and TRIACs and match each to a DC or AC switching job.

### Lesson sequence

**0 to 6 minutes: Hook.** A LogiKIT output runs on 5 V and supplies only milliamps. A solenoid valve or a contactor coil from the AC Circuits unit needs 24 V and much more current. Ask: what is the worst that could happen if we connected them directly?

**6 to 14 minutes: Isolation and the optocoupler.** An optocoupler holds an LED and a phototransistor in one package. Current through the LED makes light, the light turns on the phototransistor, and the two circuits never share a wire.

**14 to 34 minutes: Bench lab, 5 V to 24 V.** Students build the driver in stages, checking each stage before adding the next.

1. A 5 V input (a LogiKIT output or a switch) drives the optocoupler LED through a resistor.
2. The optocoupler output switches a transistor or logic-level MOSFET on the 24 V side.
3. The transistor drives a 24 V relay coil or small solenoid, with a flyback diode across the coil.

The 2N3904 is rated for 40 V and 200 mA, and its gain falls off well before 200 mA. Use it for relay coils that draw under about 100 mA, and use the logic-level MOSFET for anything heavier, such as most solenoid valves. The 40 V rating also makes the flyback diode easy to justify: the spike from a 24 V coil without one is far above 40 V.

Before connecting a LogiKIT output, confirm that it can supply the optocoupler LED current (about 5 to 10 mA); if it cannot, buffer it through a transistor. Compare the finished breadboard with the interface PCB or its schematic, if available.

**34 to 42 minutes: Simulation, Switching Device Comparison.** Students compare a MOSFET, an SCR, and a TRIAC (specification below). The MOSFET follows its gate on DC. The SCR latches on with one gate pulse and stays on until its current falls to zero, so on DC it never turns off, but on AC it turns off at every zero crossing. The TRIAC does the same on both halves of the AC wave. Connect to Day 1: the SCR latches the way a relay seal-in circuit does.

**42 to 45 minutes: Exit.** Why does the driver need a flyback diode, and what would happen to the transistor without it?

### Evidence

The staged circuit diagram with the voltage at each stage measured, a component identification of the interface PCB or schematic, and a device comparison table.

### Materials

Optocouplers (4N35 or PC817), logic-level MOSFETs, 2N3904 transistors, 1N4001 diodes, 24 V supplies, 24 V relays or small solenoids, LogiKIT boards, the interface PCB or its schematic if available.

### Simulation specification: Switching Device Comparison

- **Controls:** device (MOSFET, SCR, TRIAC); source (DC or AC); a gate button that sends a pulse or holds the gate on; a flyback diode toggle for an inductive load.
- **Display:** a scope trace of source voltage, gate signal, and load current, and a lamp or solenoid that responds. With the flyback diode off, an inductive load shows a large voltage spike at turn-off and a warning that the switch would be damaged.
- **Model:** MOSFET conducts while the gate is above threshold, and its body diode conducts the negative half of AC, which is why one MOSFET cannot block AC. SCR turns on at a gate pulse when forward biased and stays on until current reaches zero. TRIAC turns on at a gate pulse in either polarity and turns off at each zero crossing.

The flyback diode toggle moved to the Interface Driver below, where it protects a real transistor; the comparison uses a lamp, and a "break the circuit" button shows the only way to turn off a latched SCR on DC.

### Simulation specification: Interface Driver

- **Controls:** the input switch; D1 in or out; the meter's black lead on the 5 V ground or the 24 V ground; clickable test points TP1 (LED anode), TP2 (phototransistor emitter), TP3 (Q1 base), and TP4 (Q1 collector).
- **Display:** the staged driver with each side's ground drawn separately and a dashed isolation line between them, light crossing the optocoupler, lit current paths, a DMM, and a relay status chip.
- **Model:** with the input on, about 10 mA through the LED, 2.3 mA into Q1's base, and 50 mA in the coil (Q1 saturated at about 0.15 V). A test point measured against the other side's ground reads a drifting, meaningless value. Switching off with D1 out spikes Q1 past its 40 V rating; Q1 fails shorted and the relay stays on until it is replaced.

### Presentation

`Decks/AR2/Silicon in Control/Day9_Connecting_Electrical_Systems.html`, 19 slides:

1. Title
2. Today's question and objectives
3. Hook: a 5 V, 20 mA logic output against a 24 V, 200 mA solenoid valve
4. Resonance prediction: what happens if you connect them directly, and what else could go wrong
5. Three problems an interface solves: not enough current, 24 V in the wrong place, and coil kickback
6. The optocoupler: an infrared LED, light across an isolation gap, and a phototransistor
7. Each side has its own ground: the contrast with joining grounds on Day 7, and how to measure
8. The driver, stage by stage, with the schematic following the fragments
9. Is a 2N3904 enough? Relay coils, solenoid valves and the logic-level MOSFET, and the spike
10. Interface Driver simulator with four tasks
11. Resonance check: where the black lead goes, and the missing flyback diode
12. Bench lab: build it one stage at a time, with a checkpoint for each stage
13. Engineering notebook: TP1 to TP4 at input 0 and 1, and the simulator value
14. MOSFETs, SCRs, and TRIACs: what turns each on and off, and what each is used for
15. Switching Device Comparison simulator with five tasks
16. Resonance check: the SCR latch on DC, and choosing a TRIAC for an AC heater
17. The solid-state relay: an optocoupler and a TRIAC in one block, compared with a relay
18. Resonance exit ticket: how an optocoupler protects the logic, and why the driver needs a flyback diode
19. Wrap up and a preview of PLCs

## Day 10: From Electronic Logic to Programmable Control

**Investigation 8 · Standards 4.10, 5.3**

**Day question:** If transistors can make decisions, why do factories use PLCs?

### Objectives

Students will be able to:

1. Identify the main blocks inside a 555 timer (comparators, a flip-flop, and a discharge transistor) and the transistor switches inside each.
2. Translate a logic circuit into an equivalent ladder logic rung.
3. Explain the difference between PNP (sourcing) and NPN (sinking) sensor outputs, and match each to a PLC input.
4. Compare hardwired logic and programmable control for flexibility, troubleshooting, and safety.

### Lesson sequence

**0 to 8 minutes: Revisit the 555 timer.** Show the 555 block diagram. Students already know what the chip does; now they identify which blocks are made of the transistor switches and logic from this unit. Every block is something they have built in simpler form.

**8 to 20 minutes: One circuit, two ways.** Introduce the home alarm from LogiKIT Lab 2 as a new problem, since students have not seen Lab 2 in about a year: Alarm = Armed AND (NOT DoorClosed OR NOT WindowClosed). Students rebuild it on the LogiKIT as a reminder, then draw the same logic as a ladder rung: an Armed contact in series with a parallel pair of normally closed DoorClosed and WindowClosed contacts. Connect the "monitor for closed" design to industrial practice: stop buttons and safety circuits are wired normally closed so that a broken wire stops the machine.

**20 to 30 minutes: PNP and NPN sensors.** Demonstrate the two inductive proximity sensors on 24 V, one PNP and one NPN. Bring a steel target toward each one and watch its indicator LED and the voltage on its signal wire: the PNP sensor's signal rises to +24 V when it detects the target, and the NPN sensor's signal falls to 0 V. Show both datasheet wiring diagrams side by side. To make each output visible to the room, connect an LED with a 4.7 kΩ resistor (about 5 mA at 24 V) as a stand-in load: from the signal wire to 0 V on the PNP sensor, and from +24 V to the signal wire on the NPN sensor. Industrial sensors are sold as PNP or NPN, and inside each is the same switch students built on Day 5. A PNP sensor sources: its output transistor connects the signal wire to +24 V when it detects something, like the 2N3906 high-side switch. An NPN sensor sinks: its output transistor connects the signal wire to 0 V, like the 2N3904 low-side switch.

Students model both at 5 V on a breadboard. A push button stands in for "target detected" and drives a 2N3906 sourcing output or a 2N3904 sinking output. An LED with a 1 kΩ resistor stands in for the PLC input: for the sourcing sensor it connects from the output to ground, and for the sinking sensor it connects from +5 V to the output. Students then swap the "PLC input" to the wrong type and explain why the LED never lights. A mismatched sensor and input is a common commissioning fault in the PLC unit.

**30 to 40 minutes: Compare.** Students compare their LogiKIT build with the rung in the Gates and Ladder simulator (slide 8): to add a motion sensor, what changes on the LogiKIT, and what changes in the ladder program? Which is easier to troubleshoot, and why?

**40 to 45 minutes: Exit ticket and wrap up.** Students answer the unit question. Introduce the final assessment and its scoring criteria at the start of the flex period that holds it.

### Evidence

A logic schematic and an equivalent ladder rung for the same function, plus a written comparison of hardwired and programmable control.

### Materials

555 timer block diagram, two inductive proximity sensors (one PNP, one NPN) with their datasheets, a 24 V supply and a steel target for the demonstration, 2N3904 and 2N3906 transistors, push buttons, LEDs, 1 kΩ and 4.7 kΩ resistors, breadboards, 5 V supplies, LogiKIT boards, PLC examples.

### Presentation

`Decks/AR2/Silicon in Control/Day10_Logic_to_Programmable_Control.html`, 19 slides:

1. Title
2. Today's question and objectives
3. The 555 you already know: the AR1 flasher photo
4. Inside the 555 simulator: the blocks (voltage divider, two comparators, flip-flop, output stage, discharge transistor) beside a capacitor gauge and scope, with a toggle between what each block does and what it is made of, and a smaller or larger timing resistor
5. Resonance check: what happens at 2/3, and the discharge transistor as an NPN low-side switch
6. A home alarm in logic, introduced from scratch because students have not seen LogiKIT Lab 2 in about a year
7. The same alarm as a ladder rung: series is AND, parallel is OR, normally closed is NOT
8. Gates and ladder simulator: the alarm drawn both ways at once, with "add a motion sensor" and "cut the door wire"
9. Why the sensors report closed: fail-safe wiring and normally closed stop buttons
10. Lab: build the alarm on the LogiKIT, then draw the gate schematic and the rung
11. Resonance check: the OR contact pattern, and a broken stop-button wire
12. Sourcing and sinking sensors: the three wires and the PNP and NPN outputs
13. Teacher demonstration of the two proximity sensors
14. Sensor and input simulator: PNP or NPN sensor, input common to 0 V or +24 V, and a target
15. Lab: model sourcing and sinking outputs at 5 V, then swap the inputs to the wrong type
16. Resonance check: reading an NPN signal, and a PNP sensor on the wrong input
17. Hardwired or programmable: change, troubleshoot, keep it safe
18. Resonance exit ticket: why a PLC makes changes easier, and the unit question
19. Wrap up: from relay to PLC

## Flex periods

Use flex periods in this order of priority:

1. **Finish the core labs** on Days 3 to 7.
2. **Final assessment** (one period).
3. **Interface troubleshooting challenge** (one period). Using the Day 9 driver on breadboards or LogiKIT, or the interface PCB, students locate planted faults: wrong signal polarity, a missing ground reference in a non-isolated version of the driver, a base resistor too large for saturation, or a missing flyback diode. Use the same design as the earlier challenges, with a simulation version for students who are absent.
4. **Manufacturing gallery share** if it did not fit on Day 8.
5. **Extension challenges:** design a transistor XOR gate; build a 555 astable circuit and drive a 24 V load from it through the Day 9 driver.

## Final assessment

Students receive a simplified industrial control circuit: a 24 V PNP or NPN sensor input passes through an optocoupler into low voltage logic, the logic decides, and a transistor or MOSFET driver with a flyback diode operates a 24 V solenoid valve. They:

1. Identify every semiconductor component and explain its function, including whether the sensor sources or sinks its output.
2. Trace the signal from sensor to actuator, stating the voltage and the state of each component for one input condition.
3. Predict the effect of one fault (chosen from a short list) and name the measurement that would confirm it.
4. Write the equivalent ladder logic for the decision and compare how the two systems make the decision.

**Scoring criteria:** technical accuracy of component identification and function, correct application of the bias and operating region concepts, a valid fault prediction supported by a measurement, and a ladder rung that matches the logic.

## Source inventory and reuse decisions

| Source | Use in this unit |
| ----- | ----- |
| Curriculum Action Plan (Semiconductor Educator Fellowship) | The basis for this plan: investigations, outcomes, standards, and assessments |
| LogiKIT Lab Manual, Labs 1 and 2, with their presentations | Already completed by students. Reused as a Day 7 warm-up and as the home alarm example on Day 10. |
| Fellowship presentation: Introduction to Semiconductor Manufacturing | Day 8 front-end process flow, the transistor cross-section for Day 2, workforce needs |
| Fellowship presentation: Semiconductor Assembly and Packaging | Day 8 back-end operations (dicing, wafer probe, die attach, wire bonding, molding) |
| Fellowship presentation: Advanced Packaging and Emerging Trends | Day 8 career connection and the Arizona industry overview |
| AR2 AC Circuits decks | Relay simulator (Day 1), sine waves (Day 4), contactor coils (Day 9) |
| AR2 AC Motors Day 5 | The Work Orders troubleshooting engine (Days 4, 6, and flex) |

## Open items

- **Amplifier standards.** Decide where 5.5, 5.8, and 5.9 will be taught (see Standards alignment).
- **LogiKIT electrical details.** Confirm how much current a LogiKIT output can supply, and what a gate input reads when left unconnected, before relying on either in a lab or simulation.
- **Equipment counts.** Confirm the number of oscilloscopes (Day 4), spare LogiKIT boards for planted faults (Day 7), and 24 V relays or solenoids (Day 9).
- **Relay coil current.** Check that the Day 9 relay coils draw less than about 100 mA, so the 2N3904 can drive them; otherwise use the MOSFET.
