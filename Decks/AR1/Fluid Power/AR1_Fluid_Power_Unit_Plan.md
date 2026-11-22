# AR1 Unit 5: Pneumatics and Hydraulics

## Revised planning draft: VEX-specific SyncDeck simulations, aligned to ADE standards

**Duration:** Approximately 12–15 class periods of 45 minutes, adjustable for equipment and printing turnaround. Simulations support but do not replace the physical circuit builds.  
**Driving question:** How can we use pressure to produce, control, and safely apply motion in an automated machine?  
**Culminating challenge:** Design, build, test, and document a VEX pneumatic assembly-line station incorporating a functional 3D printed component.

**Hardware baseline:** VEX V5 Pneumatics Kit, part **276-8750**, with double-acting cylinders, double-acting solenoids, tank, regulator, gauge and adjustable air-flow fittings. The introductory simulations should represent these components and their connection points rather than assuming classroom equipment is an industrial 3/2 or 5/2 valve.

### Design approach

Keep the existing PHS progression: reading and summarization → syringe investigations → Pascal's Law → cylinders, valves and schematic symbols → VEX pneumatic exploration → assembly-line design project. Borrow the more detailed cylinder, valve, and calculation resources from CCHS selectively, without converting every existing slide into a lecture. Use SyncDeck for predictions, diagrams, HTML5 simulations, brief checks, and collaborative explanations; keep physical investigations and engineering notebook work central. Student adjustments to a simulation must generate observable differences and evidence, not just trigger a canned animation.

### Arizona ADE technical standards: design requirements

**Authoritative source:** *Arizona Department of Education, Automation and Robotics Technical Standards 14.4201.00*, validated in 2025, **Standard 7.0: Analyze Fluid Power Systems Including Hydraulics and Pneumatics**. The wording below follows that source. A match to a classroom activity is a planning claim, not evidence that a student has mastered the standard.

| ADE standard | Required emphasis | Learning activity | Observable student evidence | Coverage status |
|---|---|---|---|---|
| **7.1** | Differentiate hydraulic and pneumatic systems; industrial applications and factors such as pressure, power, mass and density | Day 1 dual-article comparison; Day 2 syringe observations | Summary and cross-reading comparison, including application justification | Core |
| **7.2** | Benefits of integrating fluid power with robotics | Day 4 actuator selection; Days 9–15 VEX mechanism and assembly-line station | Explain why the chosen pneumatic actuator suits the mechanism and what an electric alternative would change | Core |
| **7.3** | Principles of fluid power behavior | Day 2 compression/displacement stations; Day 3 Pascal's Law | Measurements, explanation and calculation | Core |
| **7.4** | Safety protocols for fluid and air power | Safety check before syringe and VEX work; depressurization/commissioning procedures | Demonstrated checklist, safety decision, operator instructions | Core, observed repeatedly |
| **7.5** | **Operate and observe simulated industrial-grade pneumatic and electro-pneumatic devices/circuits; vary physical parameters and observe the response** | Day 6 short industrial circuit comparison with pressure/load variation, following the VEX valve explorer; Day 8 VEX flow investigation | Documented industrial simulation trials plus prediction, observations and explanation | **Explicit industrial simulation checkpoint, with detailed workcell control reserved for MecLab** |
| **7.6** | Fundamental uses of vacuum technology, including cleaning, packaging, semiconductor manufacturing, scientific research | Day 4 application vignette and pressure-differential demonstration | Choose a vacuum application and explain pressure difference and limitations | **Short concept investigation; no full simulation required** |
| **7.7** | Power supplies for different fluid power systems | Day 4 side-by-side pneumatic compressor/receiver vs hydraulic pump/reservoir; Day 7 VEX source inspection | Annotated power-chain diagrams for both | **Explicitly required** |
| **7.8** | **Build and examine a hydraulic circuit** | Day 2 connected, water-filled syringe hydraulic circuit; compare equal and unequal piston areas | Constructed circuit, labeled diagram, measurements, performance conclusions | **Explicitly documented** |
| **7.9** | **Build and examine a pneumatic circuit** | Days 7–8 VEX tank, valve, actuator and flow control | Safe assembled circuit, schematic, test log | Core |
| **7.10** | **Troubleshoot hydraulic and pneumatic circuits**, including flow control, valve function and pressure sensor examples | Day 2 hydraulic air-bubble/leak diagnosis; Day 6 simple simulated valve fault and Day 8 flow investigation; Days 11–14 physical VEX fault isolation | Cause/evidence/remedy log for **both** hydraulic and pneumatic circuits | **Expanded to cover both** |

**Important interpretation of 7.5:** The VEX component explorer alone is not equivalent to operating a simulated **industrial-grade electro-pneumatic** circuit. Preserve a bounded industrial example on Day 6 using a recognizable 5/2 solenoid valve, regulated air supply and double-acting cylinder. Students must vary a physical parameter and record changes in behavior. The fuller industrial workcell, sensors, sequencing, electrical interlocks and systematic diagnostics belong in the later **Festo MecLab** unit. A circuit model should be identified as simplified when appropriate.

**Supporting standards:** 2.1–2.4 and 2.6 for safety and fail-safe reasoning; 3.1–3.2, 3.5 and 3.9 for schematic literacy, calculation, and simulation-versus-physical comparisons; 10.1–10.7 only as applicable to the chosen mechanical mechanisms; 12.4 and 12.6 for robotic integration/end effectors; 16.1, 16.2, 16.5 and 16.6 for constraints, process diagrams, integration and improvement. These are connections, not a claim that the full breadth of each supporting standard is taught here.

### Outcomes

Students will be able to:
1. Compare hydraulic and pneumatic systems, including compressibility, typical applications, strengths and limitations.
2. Explain fluid pressure, Pascal's Law, and the force versus displacement tradeoff in connected cylinders.
3. Calculate pressure, force and piston area in appropriately scaled examples.
4. Identify sources, reservoirs, cylinders, valves, ports, exhausts and flow controls, and trace air paths through simple circuits.
5. Interpret and draw basic pneumatic schematics using appropriate symbols.
6. Assemble, operate and troubleshoot a basic VEX pneumatic circuit safely.
7. Design and document a mechanism that uses controlled pneumatic motion to accomplish a useful task.

## Lesson sequence

| Day | Focus | Core learning experience | SyncDeck interaction / evidence |
|---|---|---|---|
| 1 | **Where does fluid power appear?** | Two nonfiction readings, annotations, gist and summaries, followed by same-reading peer feedback and cross-reading comparison | Opening prediction, hydraulic versus pneumatic classification, final comparison |
| 2 | **What happens when we push a fluid?** | Three syringe stations: air versus water, matched water-filled syringes, and mismatched syringes | Predict response, record and compare observations, explain discrepancies |
| 3 | **Why can a small push lift a heavy load?** | Pascal's Law, pressure and force calculations grounded in syringe results | Numeric prediction, guided calculation, peer explanation |
| 4 | **How does pressure become motion?** | Power sources, cylinder anatomy and vacuum applications | Compare power chains and discuss vacuum pressure differential; label a cylinder |
| 5 | **How do we control motion?** | Basic directional control: 3/2 and 5/2 concepts, then the actual VEX double-acting solenoid | **HTML5 VEX valve explorer:** trace its P, A, B and R ports; compare its function with an industrial symbol |
| 6 | **How do engineers describe pneumatic circuits?** | Translate VEX connections to functional schematics; brief industrial 5/2 comparison and ADE 7.5 simulated trial | Draw VEX circuit and complete a short industrial electro-pneumatic simulation investigation |
| 7 | **Can we make the VEX cylinder move?** | VEX power-chain exploration: tank → solenoid → cylinder; connect, test and record | Predict valve behavior and label actual components |
| 8 | **Can we control the speed?** | Challenge students to obtain slow extension and fast retraction with VEX air-flow fittings | **HTML5 VEX flow explorer:** vary restrictions and compare simulated versus physical motion |
| 9 | **From actuator to mechanism** | Build a small VEX linkage or mechanism powered by the cylinder | Sketch motion path and explain the energy/control chain |
| 10 | **Assembly-line design challenge** | Introduce project brief; brainstorm, choose a task, plan structure and printed part | Compare concepts against constraints, peer critique |
| 11–13 | **Build, test and improve** | Construct VEX station, CAD and print custom functional component, integrate pneumatics, troubleshoot | Daily design reviews, test evidence, failure analysis |
| 14–15 | **Commission and hand off** | Demonstrate station; finalize schematic, notebook and operator manual; peer operation review | Troubleshooting scenario and final reflection |

The day numbers are an initial planning scaffold, not a commitment to a rigid schedule. Days 4–6 may compress if students progress quickly; days 11–13 may expand for printing and mechanical redesign.

## Detailed lesson notes

### Day 1: Introductory reading and summary writing

**Existing sources:** PHS `PHS School Improvement - Reading` folder: *Pneumatics: a simple introduction* and *How hydraulics works* PDFs; *Student Directions: Summary Writing* deck.

- **Opening (5 min):** Show two real-world applications, one primarily pneumatic and one hydraulic. Students predict which uses air or liquid and justify their guesses.
- **Reading (12–15 min):** Assign one of the two articles. Follow the existing six-step sequence: preview; read and annotate; write a one-sentence gist; draft a 4–6 sentence summary using 2–3 provided sentence starters; self-check; peer review.
- **Peer feedback (10 min):** Exchange with a reader of the **same** article using the existing rubric, then exchange with a reader of the **other** article.
- **Synthesis (10 min):** Write similarities and differences between hydraulic and pneumatic systems on the back, as specified in the existing activity. Bring both reading groups into a shared comparison.
- **Exit:** Name one advantage, one limitation and one suitable application of each system.

**SyncDeck:** Initial poll, brief misconception check, two-column class comparison, and final explanation. Avoid duplicating the entire reading packet as slides.

### Day 2: Syringe investigations

**Existing source:** PHS *Day 2 Pneumatics and Hydraulics Lab* and the unit-root *Pneumatics and Hydraulics Lab*.

Three stations:
1. **Air versus water:** Connect same-size syringes, compare compressibility, delayed response and springiness. Repeat with water and minimize trapped bubbles.
2. **Equal syringes:** Measure input and output travel, observe reciprocal motion and discuss pressure transmission.
3. **Different-size syringes:** Push small-to-large and large-to-small, record movement and perceived force; optional small load test.

**Teacher emphasis:** Predictions before testing, observations rather than assumed outcomes, and discussion of why bubbles, leaks, friction and measurement error matter. Water is *approximately* incompressible in this context, not absolutely so.

**SyncDeck:** One shared prediction per station, then group reporting and a whole-class pattern-finding prompt. **Notebook:** setup sketches, distances, observations, force/displacement explanation. **Exit:** Why can the larger piston exert greater force but travel less distance?

### Day 3: Pascal's Law and quantitative reasoning

**Existing sources:** PHS *Day 3 Pascal's Law* and *Day 3 Pascal's Law Practice*; unit-root *Pascal's Law* and *Pascal’s Law Practice*.

Start with the syringe observations, introduce pressure as force divided by area, and apply Pascal's Law to a connected hydraulic system. Use the PHS worked example: 10 lbf on a 0.5 in² piston creates 20 psi; at a 4 in² output piston this produces 80 lbf in an ideal system. Explicitly connect increased force to reduced output travel, not free energy.

**SyncDeck:** Reveal equations only after predictions; students calculate and justify the next step. Use a short paired design question and independent practice. **Notebook:** annotated system sketch and at least one complete calculation. **Exit:** What happens to force and travel if output piston area doubles?

**Scope:** Keep the core math to P = F/A and F = PA. Use CCHS bore/area calculations as extension for students ready for circle geometry; Boyle's Law gets one slide at the end of the deck, before the exit ticket, looking back at the trapped-air challenge: P₁V₁ = P₂V₂ at constant temperature, with absolute versus gauge pressure. Day 4 applies it to the VEX tank. No extra day.

### Day 4: Cylinders as actuators

**Existing sources:** CCHS *Pneumatic Pistons: Parts, How They Work, and Calculations*; PHS *Day 4/5 - How Do We Turn Pressure Into Motion?*.

Investigate how a cylinder turns air pressure into linear movement. Identify barrel, piston, rod, bore, stroke and ports. Contrast single-acting/spring-return and double-acting cylinders. Discuss why pressure alone does not determine speed and why retraction force can differ when a rod reduces effective piston area.

**Boyle's Law application (after the VEX power chain):** Recall Boyle's Law from Day 3. Students convert gauge to absolute pressure (+14.7 psi) and find that a full 100 psi VEX tank holds about 7.8 tanks' worth of room air. A check question follows with a 50 psi version (about 4.4).

**SyncDeck:** Label a cylinder diagram, choose a cylinder for a clamp or ejector, and predict movement when one port is pressurized. **Notebook:** labeled cylinder and short actuator-selection rationale.

**If time allows: industry case study.** Use the "Fluid Power in the Real World" activity from the PHS Day 1 Student Guide (moved here from Day 1, where the reading fills the period). Each student picks an industry (aerospace, manufacturing, construction, medical, entertainment or transportation), researches one machine that uses fluid power, identifies whether it is hydraulic, pneumatic or both, explains what the fluid power system moves, and justifies why fluid power was chosen over electric motors using force, power, mass, density, inertia and pressure differences. This deepens ADE 7.1 and 7.2 evidence and builds on Deck 1's "Why Not Just Use an Electric Motor?" and factory-robot slides.

### Day 5: Directional control valves

**Existing sources:** PHS *How Do We Turn Pressure Into Motion?*; CCHS *Pneumatic Control Valves: Ports, Positions, and Applications*.

Begin with a dump-truck tailgate: the driver pushes a knob to open it and pulls the knob to close it, and the tailgate must stay open after the driver lets go. Students propose a mechanism before seeing the valve, then meet the PHS push-pull tailgate control valve (a detented 5/2 valve). The press-and-hold 3/2 push button follows as the contrasting spring-return control. Introduce ports, positions, normally open/closed **for a specified flow path**, and a short comparison of industrial 3/2 versus 5/2 valves. Then show the **VEX double-acting solenoid students will use**: two P connections, A and B actuator connections, and two R exhaust openings communicating through a shared passage. It directs compressed air toward A or B while the other actuator side exhausts. Do **not** tell students the VEX unit is physically identical to a standard five-external-port 5/2 valve, or assume that an arbitrary VEX port label corresponds to a particular direction without tracing the cylinder tubing. Introduce the electrical actuation command without requiring PLC logic.

**SyncDeck:** Students switch between the actual VEX connection view and an **equivalent functional industrial symbol**. They predict the pressure and exhaust paths for each solenoid state. **Notebook:** a VEX port map and one industrial 5/2 comparison diagram. **Exit:** Explain why the VEX valve can control a double-acting cylinder even though its external port layout differs from a conventional 5/2 valve.

**Editorial check before conversion:** One CCHS valve slide describes a normally closed valve but then states that the resting state passes P to A, which is inconsistent. Verify the intended flow diagram rather than copying that statement. Also avoid implying that a 5/2 valve is intrinsically more powerful than a 3/2 valve; its main distinction here is control of two actuator ports.

### Day 6: Pneumatic schematic literacy

**Existing sources:** PHS *Turning Pressure into Motion* worksheet, PHS presentation, and CCHS *Hydraulic and Pneumatic Symbols.pdf*.

Teach a small reusable symbol vocabulary: pressure source, receiver/tank, single- and double-acting cylinder, industrial directional-control symbol, solenoid, exhaust and flow control. Model symbols as descriptions of **function**, not photographs or literal counts of visible VEX holes. Draw a tank/regulator → VEX double-acting solenoid → double-acting cylinder circuit with A/B tubing and shared exhaust noted. Compare this functional drawing with a conventional 5/2 industrial schematic and discuss what a simplified functional representation intentionally omits. For **ADE 7.5**, spend a bounded segment operating a simulated industrial electro-pneumatic circuit and changing pressure or load; record at least two operating conditions and a conclusion. Reserve sensors, automated sequencing and a build-your-own industrial workcell for Festo MecLab.

**SyncDeck:** Identify port paths in a VEX schematic, spot a swapped actuator connection, and briefly manipulate an industrial electro-pneumatic circuit for 7.5. **Notebook:** VEX-specific plumbing sketch, an industrial functional comparison, and a two-trial parameter table. The existing PHS 3/2 single-acting challenge remains an optional concept extension, not a build instruction for the VEX kit.

### Days 7–9: VEX pneumatic exploration

**Existing source:** PHS *Day 6-8 - VEX Pneumatics Exploration*.

**Day 7:** Inspect the **276-8750** kit and establish safety rules. Identify tank, regulator and gauge, double-acting solenoid, double-acting cylinder, tubing, and fittings. Sketch **tank → regulator → solenoid P → A/B → cylinder**, with R exhaust shown separately. The VEX solenoid has two P openings (the second may feed another part of the system) and two R openings joined internally; do not confuse either with an independent industrial valve function. Use the manufacturer-approved control method and connect the VEX solenoid driver only as specified for available equipment. Test with teacher-approved pressure and check the actual air path before naming extend/retract states.

**Day 8:** Challenge: make extension slow and retraction fast. First investigate behavior without an added restriction, then use the **VEX air-flow valve fittings** provided in the kit and compare fitting placement/settings. Keep pressure regulation (available force) distinct from airflow restriction (primarily motion speed). Document which side is restricted and what happens in each direction; do not assume a flow-control fitting acts exactly like an industrial metering component without observing its directionality. Update the VEX-specific schematic.

**Day 9:** Build a simple VEX mechanism using the circuit. Sketch the linkage, document its purpose and trace air movement during operation. Reflect on where the same arrangement would be useful on a robot or factory line.

**SyncDeck:** Short safety check before handling equipment, predictions of actuator behavior, comparison of speed-control trials, photo/diagram review. **Notebook:** original and revised schematics, trial log, mechanism sketch, and reflection.

### Days 10–15: Fluid Power in the Assembly Line

**Existing source:** PHS *Fluid Power in the Assembly Line* project brief, with a closely related CCHS version.

**Student mission:** Design a single station for an automated assembly line using a VEX structure, pneumatic actuation and one functional 3D printed component.

**Constraints retained from PHS brief:**
- Fits on a single VEX base plate; incorporates a VEX linkage or movement system.
- Uses at least one pneumatic cylinder and one solenoid valve.
- Demonstrates speed-controlled motion with a flow-control method.
- Includes a functional 3D printed component fitting within 4 × 4 × 4 inches; not decorative.
- Protects the operator from pinch points. Manual triggering is acceptable.
- Includes a standard-symbol pneumatic schematic with tank, valve, cylinder and speed control.
- Includes design sketches, CAD file (STL or STEP), dimensioned part drawing, brief interface explanation, iteration evidence and final photos.
- Includes a 3–5 page operator manual with overview, labeled controls, safe operating and depressurizing procedures, and a troubleshooting table.

**Suggested project pacing:**
- **Day 10:** Introduce brief, evaluate possible stations (pusher, clamp, gate, stamp, slider, gripper or diverter), sketch two concepts, select one against constraints.
- **Day 11:** Mechanical layout and pneumatic schematic; teacher design review and safety approval before pressurization.
- **Days 12–13:** Build VEX structure, model and print custom part, integrate actuator, solenoid and flow control; document tests and revisions. Extend if printing requires more time.
- **Day 14:** Commission station against test criteria, revise documentation, conduct a peer operator test using the draft manual.
- **Day 15:** Demonstration and technical handoff, including explanation of airflow, control, safety and troubleshooting.

**Assessment:** Preserve the PHS project rubric weighting: functional prototype and mechanism **40%**, functional printed component and CAD **20%**, engineering notebook and schematic **20%**, user manual **20%**. Consider a brief individual oral check during demonstrations so each student can explain the pneumatic path and a failure mode.

## HTML5 simulation specifications for SyncDeck

Use multiple *interaction models*, not five versions of the same drag-the-slider activity. Simulations should run as locally hosted or embedded HTML5 modules in SyncDeck, accept student inputs, support reset, expose component labels and units, and provide a small results table or a way to transcribe observations into the notebook. Treat numerical results as **idealized models** unless validated against hardware; show the assumptions.

### Simulation A: Pressure, piston area and travel (Days 2–3)

- **Form:** Two coupled syringe/piston cross sections, animated to scale, with linked gauges and distance rulers.
- **Inputs:** Input force, two piston cross-sectional areas (or diameters), input travel; optional small trapped-air volume.
- **Behavior:** For an ideal incompressible, closed circuit, calculate `P = F_in / A_in`, `F_out = P × A_out`, and `A_in × Δx_in = A_out × Δx_out`. Show force/travel tradeoff and conservation-of-work reasoning. Distinguish input travel from output travel rather than letting the student create motion or energy from nowhere.
- **Student challenge:** Predict the direction of force and distance changes when the output area doubles, then test.
- **Evidence:** Prediction, parameter values, force/travel readings, explanation of discrepancy with physical syringes.
- **Standards:** 7.3, supports 7.8; 3.5 and 3.9.

### Simulation B: VEX solenoid and cylinder explorer (Day 5; core)

- **Form:** A labeled VEX-style double-acting solenoid with **two P openings, A and B cylinder connections, and two R exhaust openings that share an exhaust passage**, connected to a double-acting cylinder. Provide two toggled views: **hardware/port map** and **simplified industrial functional schematic**.
- **Inputs:** Select commanded A or B state, swap A/B cylinder tube connections, swap the driver cable plugs, and optionally reveal a transparent internal airflow diagram.
- **Behavior:** Highlight supply-to-A plus B-to-exhaust, or supply-to-B plus A-to-exhaust; show the correct cylinder response for the selected actual tube connections. Do not map motion direction from port letters alone. Distinguish a schematic's logical function from the physical external ports and internal passageways.
- **Student challenge:** Predict which chamber receives pressure; find why a cylinder extends when the designer expected retraction; correct the tubing or interpretation.
- **Evidence:** Actual VEX port map, two-state path table and one paragraph comparing VEX with the conventional industrial 5/2 **function**.
- **Standards:** 7.2, 7.3, 7.9; contributes to 7.5 preparation and 7.10.

### Simulation C: Short industrial electro-pneumatic bridge (Day 6; required for 7.5)

- **Form:** A recognizable **industrial** regulator/supply, electrically actuated 5/2 directional-control valve, and double-acting cylinder. Display the electrical command separately from pneumatic flow. This is a **bridge to Festo MecLab**, not a full industrial workcell simulation.
- **Inputs:** Command solenoid state and adjust **one or two** physical parameters such as supply pressure or load. Optionally expose a single valve routing fault.
- **Behavior:** Show the appropriate air and exhaust paths, whether enough force is available to move the load, and a simple observable response. State assumptions instead of implying a precise industrial dynamics model.
- **Student challenge:** Record **at least two parameter trials**, describe what changed, and identify the similarity in *function* but difference in component representation compared with VEX.
- **Evidence:** A two-trial observation table and a brief explanatory claim. This is the **explicit 7.5 checkpoint**.
- **Standards:** **7.5**, 7.7 and introductory 7.10.
- **Defer until MecLab:** Industrial circuit composition, end-position sensing, interlocks, PLC/ladder logic, multiple-cylinder sequences, industrial fault trees and validated timing calculations.

### Vacuum technology application investigation (Day 4; light touch)

- **Form:** Short diagrams, images or a classroom suction-cup demonstration rather than a dedicated required HTML5 simulation.
- **Content:** Pressure difference, vacuum generation, suction limitations and uses in packaging, cleaning, semiconductor manufacturing and scientific research.
- **Student challenge:** Explain why a clean sealed surface works better than a porous or leaking one, and select an industrial application.
- **Evidence:** An application match with explanation.
- **Standards:** **7.6**.
- **Optional extension:** A very short vacuum force visual using `F ≈ ΔP × A` for a well-sealed idealized cup, if it adds value without taking time from VEX.

### Simulation D: VEX flow-control challenge (Day 8; core)

- **Form:** VEX tank, regulator, solenoid, cylinder and **actual flow-control fitting locations**, with independent extension/retraction testing and a simple time-versus-position trace.
- **Inputs:** Select extension/retraction, adjust a VEX-style flow restriction and choose among feasible fitting positions. Keep the supply pressure setting separately visible for force comparison.
- **Behavior:** Show idealized changes in travel speed and the air path. Restriction directionality must match the fittings the class possesses; if not yet verified, use an explicitly conceptual model without asserting precise metering behavior.
- **Student challenge:** Predict and obtain **slow extension, fast retraction** in the model, then reproduce it physically with approved hardware. Compare discrepancies rather than treating the simulated outcome as guaranteed.
- **Evidence:** Prediction, two or more configurations, actual observations, revised VEX schematic and troubleshooting note.
- **Standards:** 7.3, 7.9, 7.10; reinforces 7.5 but does **not replace** the industrial trial.

### Simulation design guardrails

1. Each simulation opens with a **prediction**, allows one or more meaningful parameter changes, and ends with a **claim supported by observation**.
2. Keep **Simulation B and D** consistent with VEX 276-8750 hardware; keep **Simulation C explicitly industrial**. Never merge VEX and industrial port diagrams as if identical.
3. Separate **physical fact**, **simplified mathematical model**, and **observed hardware behavior**. Real cylinder motion depends on pressure, load, flow resistance, compressibility and friction.
4. Include unit labels and reset/restore-default controls; make controls keyboard accessible; never make students infer state from color alone.
5. Where SyncDeck cannot persist simulation data automatically, require students to enter results in their engineering notebook or respond to an accompanying SyncDeck question.
6. No simulated failure mode should lead students to intentionally create an unsafe equivalent on pressurized classroom hardware.

## Standards-based assessment checkpoints

| Checkpoint | Individual or team? | Evidence to collect | Standards |
|---|---|---|---|
| Reading and contrast | Individual | Annotated text, accurate summary, hydraulic/pneumatic comparison | 7.1 |
| Hydraulic lab | Team measurements plus individual explanation | Water-filled syringe circuit, displacement and force evidence, one hydraulic fault diagnosis | 7.3, 7.4, **7.8, 7.10** |
| Power-source and vacuum check | Individual | Compressor/receiver vs pump/reservoir diagram; vacuum application and limitation | **7.6, 7.7** |
| Short simulated industrial circuit | Individual | Two parameter trials, circuit flow trace and explanation | **7.5**, supports 7.10 |
| VEX pneumatic circuit | Team demonstration plus individual check | Physical circuit, safe operating checklist, schematic and performance data | 7.2, 7.4, **7.9** |
| Final assembly-line station | Team artifact plus individual explanation | Functional prototype, functional printed part, operator manual, fault log and reasons for fluid power choice | 7.2, 7.4, 7.9, 7.10; 16.1/16.5/16.6 |

**Coverage check:** The unit has an intentionally identified activity and collectable evidence for **every Standard 7.1–7.10**. The industrial simulation for 7.5 is intentionally bounded in this unit; stronger treatment follows during MecLab. The key coverage decisions are retaining a short but explicit industrial simulation for 7.5, recording the water-filled syringe build as direct 7.8 evidence, explicitly documenting hydraulic *and* pneumatic troubleshooting for 7.10, and giving 7.6–7.7 their own checks. This is a curriculum mapping; mastery depends on actual student work and assessment.

## Crosscutting additions and cautions

### Safety

Revisit safety before every physical investigation and build. Use only equipment-rated pressures and fittings, safety glasses, guarded pinch points and teacher-approved pressurization. Depressurize and verify stored energy is released before disconnecting lines or modifying components. Never assume switching off a solenoid has exhausted the system. The VEX solenoid always powers either A or B, so the cylinder stays pressurized in its last position, and the tank stays charged.

Teach the different failure hazards of the two systems. Compressed air stores energy like a spring, so a pneumatic failure can burst, snap or whip a loose line. Hydraulic fluid stores little energy, but a high-pressure pinhole leak can inject fluid through skin, causing a serious injury that may look minor at first. Never feel for a hydraulic leak with a hand. (This corrects the PHS Day 3 "When Things Go Wrong" slide, which presents leaking as the only hydraulic risk.) Avoid directing cylinders toward people. Do not ask students to create deliberate leaks or obstruct pressurized ports without an approved procedure.

### Standard 7.5: Simulated electro-pneumatic devices

The source sequence is strongest on physical builds. Include the **bounded industrial electro-pneumatic simulation** on Day 6 and capture at least two physical-parameter trials. The **VEX-specific** valve explorer on Day 5 prepares students to recognize its familiar directional-control function. Industrial sequencing, sensors and advanced diagnostics will be taught later with Festo MecLab.

### Standard 7.6: Vacuum technology

Use a concise vacuum application demonstration and comparison on Day 4. Explicitly connect vacuum uses to packaging, cleaning, semiconductor manufacturing, and scientific research, as named in 7.6. A dedicated vacuum simulation is optional rather than a core build.

### Hydraulics balance

The later lessons intentionally emphasize pneumatics because the available VEX hardware and final project do. Preserve hydraulic understanding through the initial readings, water-filled syringe lab and Pascal's Law. Document the syringe apparatus as the **simple hydraulic circuit build** required for 7.8, including its assembled components, test results, and a brief performance analysis. For 7.10, include a safe hydraulic troubleshooting scenario such as trapped air or leakage.

### Suggested SyncDeck architecture

Use **six core decks**, rather than one per worksheet, with embedded HTML5 modules as noted:
1. Fluid Power: applications and reading synthesis (Day 1)
2. Fluid Behavior: syringe lab and Pascal's Law (Days 2–3), including **Simulation A**
3. Actuators and Valves: from pressure to motion (Days 4–5), including **VEX Simulation B** and the short vacuum application
4. Reading and Designing Pneumatic Circuits (Day 6), including **short industrial Simulation C for ADE 7.5**
5. VEX Pneumatics: power, control and speed (Days 7–9), including **VEX Simulation D**
6. Assembly Line Challenge: design reviews and commissioning (Days 10–15)

For each deck, favor **predict → discuss → test/trace → explain**. Use visual animations sparingly where motion or valve state truly benefits from them. Keep calculations, physical data and final schematic drawings in the engineering notebook; SyncDeck should surface reasoning and feedback, not become another form to fill in.

## Source inventory and reuse decisions

| Source group | Materials reviewed | Recommended treatment |
|---|---|---|
| PHS reading | Summary Writing slides; hydraulic and pneumatic article files identified | Preserve opening literacy activity and peer exchange |
| PHS core | Day 1 introduction; Day 2 syringe lab; Day 3 Pascal's Law; Day 4/5 pressure-to-motion slides and guide | Main instructional spine; convert and consolidate |
| PHS practical | VEX Pneumatics Exploration; Fluid Power in the Assembly Line | Preserve progression and capstone constraints |
| CCHS | Cylinder parts/calculations, valve presentation, Boyle's Law, pneumatic math, symbols and assembly-line brief | Borrow selectively, especially component explanations and optional math |
| HHS | Similar day-labeled resources | Appears substantially overlapping; no need to treat as independent sequence without deeper version comparison |
| Unit root | Pascal's Law, practice and syringe lab | Check for duplicate or alternate versions when building final decks |

**Source folder:** https://drive.google.com/drive/u/0/folders/16ZhxOeAFcfyFM8ZVgY-PdXKrsFhqQ4Dr

## Decisions made (2026-11-20)

- **VEX solenoid behavior:** The VEX double-acting solenoid always powers one side. Its driver circuit uses the on/off signal to choose whether A or B is pressurized; there is no "both off" or vented-center state. Simulations B and D model it as two states only, with the opposite side exhausting through R.
- **PHS Day 4/5 NO/NC slides:** These are not wrong. They show a valve cross-section (open above, closed below), so their "position 1/2" numbering refers to the drawing, not the ISO symbol convention used later (rightmost box = default). Relabel the cross-section states when converting so they cannot be confused with ISO positions.
- **CCHS valve slides:** Fix the normally closed P-to-A contradiction and drop the "5/2 is more powerful" claim.
- **Hydraulic safety:** Add the high-pressure pinhole leak (fluid injection) hazard, while keeping the contrast that pneumatic failures release stored energy explosively. See Safety.
- **E-stop in the Assembly Line brief:** Replace "E-Stop" with the VEX **shut-off valve fitting** as the operator's air shut-off. The fitting is directional (marked with a flow arrow) and **vents the downstream side when closed**, like an industrial lockout valve (teacher-confirmed; VEX documentation does not say so). Closing it is therefore both the operator's stop and the depressurizing step in the operator manual. The tank upstream of the valve stays charged, so the manual should still say how to empty the tank before storage or disassembly.
- **Theme:** Every AR1 deck (DC Circuits, Engineering Communication, Final Project, Mechanical Linkages, Welcome) used `DCCircuits/theme.css`. **Done:** it is now promoted to `Decks/AR1/theme.css`, and fluid power decks in `Decks/AR1/Fluid Power/` link it as `../theme.css`.
- **Activity name:** Use "VEXploration" for the Days 7–9 VEX exploration activity.

## Decisions to make before building decks

1. **VEX kit identified:** 276-8750. Before implementing fitting-specific flow behavior, inspect the actual classroom fittings and verify orientation/directionality against VEX documentation. Confirm the available method of commanding the solenoids and follow manufacturer wiring guidance.
2. Decide whether piston bore calculations belong in required practice or extension work. Boyle's Law is settled: introduced on Day 3, applied to the VEX tank on Day 4 (2026-11-22).
3. Confirm printing throughput and whether the capstone should have more than three build periods.
4. Review valve schematics and nomenclature against the actual symbols before reproducing slides, especially default-state conventions.
5. Decide how to record each student's individual understanding alongside team construction and documentation.

### Verified hardware references

- VEX V5 Pneumatics Kit (276-8750): https://www.vexrobotics.com/276-8750.html
- VEX, *Understanding the V5 Pneumatics Kit Components*: https://kb.vex.com/hc/en-us/articles/17126345547156-Understanding-the-V5-Pneumatics-Kit-Components
- VEX, *Example V5 Pneumatics Kit Configurations*: https://kb.vex.com/hc/en-us/articles/17193212326036-Example-V5-Pneumatics-Kit-Configurations
- VEX, *Coding the V5 Pneumatics Kit* (not yet reviewed): https://kb.vex.com/hc/en-us/articles/17202683259540-Coding-the-V5-Pneumatics-Kit
- ADE Automation and Robotics Technical Standards 14.4201.00 (uploaded project standards, 2025 validation), Standard 7.0.

### VEX hardware notes from the documentation (checked 2026-11-20)

- **Filling the tank:** Students charge the tank from the classroom compressor through the tank's brass fill valve (teacher-confirmed). The robot carries no compressor and runs on stored air, so cylinder force drops as the tank empties.
- **Supply side:** A tee at the tank outlet feeds the pressure gauge. The shut-off valve and an optional regulator sit on the supply line before the solenoid. The text does not give their order, so take it from the diagram or the classroom kits.
- **Air flow valve fittings go on the cylinder ports only.** VEX says not to put them on the solenoid. The only feasible positions in Simulation D are therefore the cylinder's two ports. The documentation does not say which direction they restrict, but the classroom fittings **meter out** (teacher-confirmed): air flows freely into the cylinder through a fitting and is squeezed on its way out, with a screw setting the restriction. A fitting on the rod-end port therefore slows extension only, which is the Day 8 answer and the model in Simulation D.
- **Driver cable orientation sets the logic.** The green/white plug goes on the B side. Reversing the plugs "will flip the logic, causing the cylinder to extend when you want it to retract." Swapped A/B tubing produces the same symptom, so this makes a good pair of hidden faults for Simulation B and the 7.10 troubleshooting evidence: students need a test that tells the two causes apart.
- **Second P port:** It ships with a 4 mm plug. The two-cylinder example chains a second solenoid from the supply line.
- **Fittings are hand-tightened only.** Tools can damage the O-ring seals and break the delicate threads on the fittings. Add this to the Day 7 safety and handling rules.
- **Maximum pressure is 100 psi** (teacher-confirmed). Never pressurize the tank above it. Use 100 psi as the upper limit of the supply-pressure setting in Simulation D.
- **Classroom regulators are set to 50 psi by default** (teacher-confirmed). Decks 7 and 8 test at 50 psi, and Simulation D starts there.
- **Not stated in the documentation:** a depressurizing procedure. Closing the shut-off valve vents everything downstream of it (teacher-confirmed), but the tank stays charged.

### Unit boundary: VEX now, MecLab later

**This unit:** How pressure produces motion, how VEX directs air to a double-acting cylinder, how flow restriction changes observed speed, and how a simple mechanism uses those ideas. Students can explain the *functional analogy* to industrial directional-control valves without treating hardware as interchangeable.

**Later Festo MecLab:** Industrial valve identification and connection conventions, substantial electro-pneumatic circuit construction, end-position sensors, PLC/ladder logic, automation sequences, systematic industrial fault diagnosis and performance tuning. Return to the Day 6 industrial simulation as prior knowledge.

*Updated curriculum planning draft, grounded in the supplied PHS/CCHS/HHS materials, ADE 7.1–7.10, and verified VEX 276-8750 component documentation. Not yet a slide-by-slide SyncDeck implementation.*
