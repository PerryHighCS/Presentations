# AC Motors Unit: Build Outline

Working outline for the five decks built from `acMotorsPlan.md`. Each deck follows
the plan's arc (problem, principle, experiment, apply), runs its virtual
investigation as an inline simulator slide, and uses Resonance only on dedicated
question slides (predictions, investigation records, exit tickets).

Shared pieces:

- `Decks/AR2/ACMotors/theme.css` layers on `../theme.css` (terminal green). It adds
  cards, tables, MCQ/FRQ boxes, simulator controls, readout tiles, and the task
  pager used on every simulator slide.
- Phase colors are used the same way all week, always paired with a letter:
  A = amber, B = cyan, C = violet. Faults and trips are red.
- Simulator text (controls, readouts, logs) uses the 22 to 24 px label sizes, as
  the AC Circuits simulators do. Prose and questions stay at 30 px.
- Every simulator labels itself as a simplified educational model.

---

## Day 1: Generators and Phases (`Day1_Generators_and_Phases.html`)

1. Title
2. Essential question and objectives
3. The industrial power mystery: a 120 V outlet next to a three phase motor connection (L1, L2, L3)
4. Resonance (poll + FR): "Does three phase mean the electricity moves three times faster?" and "Why might these need different supplies?"
5. Generator energy conversion: mechanical in, changing flux, voltage out (what increases voltage)
6. Alternator animation: the Generator Lab engine locked to one winding
7. AC vs DC generator output: slip rings give a sine, a commutator gives pulsing DC
8. One winding: frequency, period, and f = RPM × P / 120
9. Adding a second winding: phase difference in electrical degrees
10. Three windings, three phases: 120° apart, same frequency
11. Investigation tasks A to G (predict, observe, explain)
12. **Generator Lab simulator**
13. Why industry uses three phase: constant total power, rotating field, efficient delivery
14. Split phase is not two phase (120/240 V residential service)
15. Single phase vs three phase review table
16. Resonance exit ticket (4 questions)

**Generator Lab:** rotor magnet inside a stator ring. Selecting 1, 2, or 3 phases
adds the physical winding (A at 0°, B at 120°, C at 240°) before its trace appears.
Controls: run/pause, step 15° while paused, speed 0 to 1,800 RPM, reverse, field
strength, 2 or 4 poles, trace toggles, total-power trace. Displays: scrolling
100 ms oscilloscope in real time units, frequency, RPM, peak voltage, phase
sequence (A-B-C or A-C-B), and a feedback line. Model: V = Vpk sin(θ − k·120°),
Vpk ∝ speed × field, f = RPM × P / 120. Animation runs in slow motion with the
factor shown.

## Day 2: Starting AC Motors (`Day2_Starting_AC_Motors.html`)

1. Title
2. Essential question and objectives
3. Warm up: three phase output beside a single sine
4. Resonance (poll + FR): which supply will start a motor more easily, and why
5. Inside an induction motor: stator, windings, rotor, air gap, shaft, bearings
6. The squirrel cage rotor: induced currents, no brushes, compared with a PM rotor
7. Single phase field: field viewer showing a pulsating field on a fixed axis
8. Why starting torque is a problem: two equal counter-rotating halves, hum, push start either way
9. Shaded pole
10. Resistance start split phase (centrifugal switch)
11. Capacitor start (the capacitor shifts phase; it is not a burst of energy)
12. PSC and capacitor start capacitor run
13. Comparison table
14. Investigation tasks
15. **Motor Starting Lab simulator**
16. Resonance: justify a design for the fan, compressor, and blower
17. Resonance exit ticket (4 questions)

**Motor Starting Lab:** six designs (main winding only, shaded pole, split phase,
capacitor start, PSC, CSCR) × four loads (small fan, ventilation blower, air
compressor, loaded conveyor). It uses an illustrative torque-speed model, and
switched designs drop the start winding at 75 % speed. The rotor accelerates by
(motor torque − load torque) / inertia. Outcomes: stalled (hum), start winding
overheated (slow start), running overloaded (high slip), or running. Displays:
cross section with active windings, capacitor, and switch; rotor; field arrow;
torque-speed chart with an operating point; status; and the cost, efficiency, and
noise of each design. One fault switch (open capacitor) previews Day 5.

## Day 3: Three Phase Motors and VFDs (`Day3_Three_Phase_Motors_and_VFDs.html`)

1. Title
2. Essential question and objectives
3. Review challenge: single phase vs three phase field viewers side by side
4. Three phase stator fields (field viewer, three phase mode)
5. How the squirrel cage makes torque, and why slip is needed
6. Synchronous speed vs rotor speed, worked slip example (2.78 %)
7. Frequency and pole count: 2, 4, and 6 poles at 60 Hz
8. Resonance: slip calculation check
9. Introducing the VFD: "60 Hz arrives; how do we run slower?"
10. AC to DC to controlled AC (rectifier, DC link, inverter)
11. Resonance prediction: synchronous speed at 30 Hz, and what a VFD changes
12. Investigation tasks A to G
13. **VFD Control Room simulator**
14. Starting and stopping an industrial motor: **three wire start/stop simulator**
15. Overload protection, and stop vs trip vs emergency stop
16. Resonance: investigation results
17. Resonance exit ticket

**VFD Control Room:** frequency 10 to 90 Hz, 2/4/6 poles (each swaps in a
different motor and nameplate), load 0 to 150 %, accel/decel ramp 1 to 20 s,
Start/Stop/E-stop/Reset. Model: sync = 120f/P; slip rpm ∝ torque (V/Hz region, so
slip % grows at low frequency); torque available falls above 60 Hz; accel torque
= inertia × ramp rate; current limit 150 % → overcurrent trip; sustained > 115 %
→ overload trip. Stop ramps down, a fault coasts, E-stop removes power and needs a
reset. Displays: output waveforms, field dial, sync vs shaft speed bars, slip %,
torque %, current, drive state, warnings, nameplate.

**Three wire control:** Stop (NC), Start (NO, momentary), M coil, M holding
contact, OL contact; buttons for Start, Stop, OL trip, and power loss.

## Day 4: Stepper, Brushless, and Servo (`Day4_Stepper_Brushless_Servo.html`)

1. Title
2. Essential question and objectives
3. Hook: fan, 3D printer axis, robot arm joint
4. Brushed DC review (commutator and brushes)
5. Brushless construction (PM rotor, stator windings, ESC, Hall sensors)
6. Electronic commutation: **commutation demo** in BLDC mode
7. Stepper operation: the same demo in stepper mode (step, half step)
8. Step angle calculation (1.8°, 200 steps, 50 steps for 90°)
9. Resonance: step count check
10. Open loop positioning and lost steps
11. Servo feedback loop
12. Resonance: what makes a system a servo
13. Investigation tasks
14. **Precision Under Pressure simulator**
15. Motor selection comparison table
16. Resonance exit ticket: toy vehicle, drone, robot arm joint, 3D printer axis

**Precision Under Pressure:** systems are an open loop stepper, BLDC speed
control, and a servo with an encoder. Inputs: target angle, speed, load
(light/medium/heavy), bump disturbance, run/pause/reset. Model: the stepper loses
steps in groups of 4 when demanded torque exceeds the torque available at that
step rate, and never knows it. BLDC regulates speed and runs for the computed
time, so it drifts and coasts. The servo uses a torque-limited PD loop with
response time, and raises a following-error fault when saturated too long.
Displays: dial with commanded and actual pointers, error, encoder signal (servo
only), position-vs-time graph, controller indicators, cost and complexity.

## Day 5: Selection and Troubleshooting (`Day5_Motor_Selection_and_Troubleshooting.html`)

1. Title
2. Essential question and objectives
3. "The motor is humming, but the shaft is not turning."
4. Resonance FR: what information do you need?
5. Six step diagnostic process
6. Mechanical vs electrical vs control faults
7. Safe troubleshooting (LOTO, stored energy, qualified testing)
8. How the work orders work
9. **Motor Maintenance Work Orders simulator**
10. Resonance: work order records (diagnosis, evidence, repair, safety)
11. Engineering selection challenge (choose one of four applications)
12. Resonance: individual selection justification
13. Unit concept summary
14. Resonance: final reflection

**Work Orders:** four work orders (ventilation fan, industrial pump, overheating
conveyor motor, positioning error), each with a hidden cause drawn from 3 or 4
possibilities. A New Fault button draws another. Students run tests, safe and
unsafe. Useful tests reveal readings rather than answers, irrelevant tests return
valid but unhelpful data, and unsafe choices raise a warning. At least one test is
required before the Diagnose stage unlocks. The diagnosis and repair choices then
produce a scored record: relevant tests, unsafe attempts, diagnosis, and repair.
