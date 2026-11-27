// GymGrog exercise pool and session templates.
// Photos in img/<id>-0.jpg (start) and img/<id>-1.jpg (end) come from the public-domain
// free-exercise-db (https://github.com/yuhonas/free-exercise-db, Unlicense).
// Patterns are fixed; the exercise inside a pattern rotates every 4-week block.

export const PATTERNS = {
  mobility: { name: 'Warm-up mobility', muscles: 'Thoracic spine, hips, shoulders' },
  rotcuff:  { name: 'Shoulder health',  muscles: 'Rotator cuff, scapular stabilisers' },
  vpull:    { name: 'Vertical pull',   muscles: 'Lats, biceps' },
  hpull:    { name: 'Horizontal pull', muscles: 'Mid back, rear delts, biceps' },
  reardelt: { name: 'Rear delts / upper back', muscles: 'Rear delts, traps, rotator cuff' },
  hinge:    { name: 'Hip hinge',       muscles: 'Glutes, hamstrings, lower back' },
  squat:    { name: 'Squat / lunge',   muscles: 'Quads, glutes' },
  legiso:   { name: 'Leg isolation',   muscles: 'Hamstrings, quads or glutes' },
  calf:     { name: 'Calves',          muscles: 'Calves' },
  push:     { name: 'Horizontal push', muscles: 'Chest, front delts, triceps' },
  shoulder: { name: 'Shoulders',       muscles: 'Delts' },
  power:    { name: 'Pop-up power',    muscles: 'Whole body, fast' },
  core:     { name: 'Core',            muscles: 'Abs, obliques' },
  cardio:   { name: 'Cardio finish',   muscles: 'Heart and lungs, steady' },
  intervals:{ name: 'Intervals',       muscles: 'Heart and lungs, hard' },
};

// status: 'like' | 'ok' | 'never' | 'unknown'  (unknown = parked until you learn it)
// step: weight increment in kg when progressing. 0 = bodyweight / timed.
// unit: 'kg' | 'bw' (bodyweight, log reps only) | 'time' (seconds) | 'min' (cardio minutes)
export const EXERCISES = [
  // Vertical pull
  { id: 'lat-pulldown-wide', name: 'Lat pulldown (wide grip)', pattern: 'vpull', equipment: 'Cable machine', step: 2.5, unit: 'kg', status: 'ok',
    cues: 'Chest up, pull the bar to the upper chest, elbows down and back. Control the way up. Do not lean back more than a little.' },
  { id: 'lat-pulldown-neutral', name: 'Lat pulldown (neutral / close grip)', pattern: 'vpull', equipment: 'Cable machine, V-handle', step: 2.5, unit: 'kg', status: 'ok',
    cues: 'Same as wide, but the close handle lets you use more range. Think elbows to hips.' },
  { id: 'assisted-pullup', name: 'Assisted pull-up', pattern: 'vpull', equipment: 'Assisted pull-up machine', step: -2.5, unit: 'kg', status: 'ok',
    cues: 'Knees on the pad. Weight shown is the ASSISTANCE, so progress means going DOWN. Full hang at the bottom, chin over bar.' },

  // Horizontal pull
  { id: 'seated-cable-row', name: 'Seated cable row', pattern: 'hpull', equipment: 'Cable row station', step: 2.5, unit: 'kg', status: 'ok',
    cues: 'Sit tall, pull the handle to your belly button, squeeze shoulder blades together, let arms straighten fully each rep.' },
  { id: 'chest-supported-row', name: 'Chest-supported row machine', pattern: 'hpull', equipment: 'Row machine', step: 2.5, unit: 'kg', status: 'ok',
    cues: 'Chest against the pad so the lower back is out of it. Drive elbows back, pause one second squeezed.' },
  { id: 'db-row', name: 'Single-arm dumbbell row', pattern: 'hpull', equipment: 'Dumbbell, bench', step: 2, unit: 'kg', status: 'ok',
    cues: 'One hand and knee on the bench, flat back. Row the dumbbell to your hip, not your shoulder. Weight is per dumbbell.' },

  // Rear delts
  { id: 'face-pull', name: 'Face pull', pattern: 'reardelt', equipment: 'Cable, rope', step: 2.5, unit: 'kg', status: 'ok',
    cues: 'Cable at face height. Pull the rope to your forehead, hands finish beside your ears. Light weight, high reps.' },
  { id: 'reverse-pec-deck', name: 'Reverse pec-deck', pattern: 'reardelt', equipment: 'Pec-deck machine (reversed)', step: 2.5, unit: 'kg', status: 'ok',
    cues: 'Chest against the pad, arms slightly bent, sweep the handles back until in line with your shoulders.' },

  // Hinge
  { id: 'db-rdl', name: 'Dumbbell Romanian deadlift', pattern: 'hinge', equipment: 'Dumbbells', step: 2, unit: 'kg', status: 'ok',
    cues: 'Soft knees, push hips BACK, dumbbells slide down the thighs. Stop when hamstrings pull, stand up by squeezing glutes. Weight is per dumbbell.' },
  { id: 'kb-swing', name: 'Kettlebell swing', pattern: 'hinge', equipment: 'Kettlebell', step: 4, unit: 'kg', status: 'ok',
    cues: 'Hinge, not squat. Snap the hips forward, arms are just ropes. Bell floats to chest height, no higher.' },
  { id: 'cable-pullthrough', name: 'Cable pull-through', pattern: 'hinge', equipment: 'Cable, rope, low pulley', step: 2.5, unit: 'kg', status: 'ok',
    cues: 'Face away from the machine, rope between the legs. Hinge back, then drive hips forward and squeeze glutes.' },

  // Squat
  { id: 'leg-press', name: 'Leg press', pattern: 'squat', equipment: 'Leg press machine', step: 5, unit: 'kg', status: 'ok',
    cues: 'Feet shoulder width, mid platform. Lower until knees are at 90 degrees, keep the lower back on the pad. Do not lock the knees.' },
  { id: 'goblet-squat', name: 'Goblet squat', pattern: 'squat', equipment: 'Dumbbell or kettlebell', step: 2, unit: 'kg', status: 'ok',
    cues: 'Hold the weight at your chest, elbows inside the knees at the bottom. Sit between your heels, chest tall.' },
  { id: 'walking-lunge', name: 'Walking lunges', pattern: 'squat', equipment: 'Dumbbells (or bodyweight)', step: 2, unit: 'kg', status: 'ok',
    cues: 'Long step, back knee kisses the floor, front shin vertical. Reps are per leg. Weight is per dumbbell.' },

  // Leg isolation
  { id: 'leg-curl', name: 'Leg curl', pattern: 'legiso', equipment: 'Leg curl machine', step: 2.5, unit: 'kg', status: 'ok',
    cues: 'Hips pressed down, curl the pad to your glutes, lower slowly over 3 seconds.' },
  { id: 'leg-extension', name: 'Leg extension', pattern: 'legiso', equipment: 'Leg extension machine', step: 2.5, unit: 'kg', status: 'ok',
    cues: 'Pad on the ankles, extend fully and pause one second at the top. Lower slowly.' },

  // Calves
  { id: 'calf-raise', name: 'Calf raise', pattern: 'calf', equipment: 'Calf machine or leg press', step: 5, unit: 'kg', status: 'ok',
    cues: 'Full stretch at the bottom, pause, full rise onto the toes, pause. Slow.' },
  { id: 'seated-calf-raise', name: 'Seated calf raise', pattern: 'calf', equipment: 'Seated calf machine', step: 5, unit: 'kg', status: 'ok',
    cues: 'Pad on the knees, let the heels drop as low as they go, pause, rise onto the toes and hold a second. Slow.' },
  { id: 'leg-press-calf', name: 'Calf press on leg press', pattern: 'calf', equipment: 'Leg press machine', step: 5, unit: 'kg', status: 'ok',
    cues: 'Legs straight, knees soft, only the balls of the feet on the plate. Push through the toes, let the heels drop slowly.' },
  { id: 'db-calf-raise', name: 'Standing dumbbell calf raise', pattern: 'calf', equipment: 'One dumbbell, a step or plate under the toes', step: 2, unit: 'kg', status: 'ok',
    cues: 'Hold one dumbbell, other hand on something for balance. Full stretch at the bottom, full rise, pause at both ends. Weight is the one dumbbell.' },

  // Push
  { id: 'chest-press-machine', name: 'Chest press machine', pattern: 'push', equipment: 'Chest press machine', step: 2.5, unit: 'kg', status: 'ok',
    cues: 'Handles level with mid chest. Shoulder blades pinned back, press without locking the elbows, lower under control.' },
  { id: 'db-bench', name: 'Dumbbell bench press', pattern: 'push', equipment: 'Dumbbells, flat bench', step: 2, unit: 'kg', status: 'ok',
    cues: 'Feet flat, slight arch, dumbbells over the chest. Lower to the sides of the chest, elbows at 45 degrees. Weight is per dumbbell.' },
  { id: 'pushup', name: 'Push-ups', pattern: 'push', equipment: 'Floor (or hands on a bench to make it easier)', step: 0, unit: 'bw', status: 'ok',
    cues: 'Body in one line, hands under shoulders, chest to a fist off the floor. Hands on a bench if the floor is too hard.' },

  // Shoulders
  { id: 'shoulder-press-machine', name: 'Shoulder press machine', pattern: 'shoulder', equipment: 'Shoulder press machine', step: 2.5, unit: 'kg', status: 'ok',
    cues: 'Handles at ear height to start, press up without shrugging. Lower until elbows are just below shoulders.' },
  { id: 'lateral-raise', name: 'Lateral raise', pattern: 'shoulder', equipment: 'Dumbbells', step: 1, unit: 'kg', status: 'ok',
    cues: 'Slight bend in the elbows, raise to shoulder height, lead with the elbows. Light weight. Weight is per dumbbell.' },

  // Core (plank family only, by your choice)
  { id: 'plank', name: 'Plank', pattern: 'core', equipment: 'Floor', step: 0, unit: 'time', status: 'ok',
    cues: 'Forearms down, squeeze glutes, tuck the ribs. Hold. Log the seconds.' },
  { id: 'side-plank', name: 'Side plank', pattern: 'core', equipment: 'Floor', step: 0, unit: 'time', status: 'ok',
    cues: 'Elbow under shoulder, hips high and stacked. Seconds are per side.' },

  // Cardio finish
  { id: 'rower', name: 'Rower', pattern: 'cardio', equipment: 'Rowing machine', step: 0, unit: 'min', status: 'ok',
    cues: 'Legs, then back, then arms. Steady pace where you could still talk. Great for the back.' },
  { id: 'bike', name: 'Bike', pattern: 'cardio', equipment: 'Upright or recumbent bike', step: 0, unit: 'min', status: 'ok',
    cues: 'Steady pace, conversational. Easy on the joints after leg day.' },
  { id: 'cross-trainer', name: 'Cross-trainer', pattern: 'cardio', equipment: 'Elliptical', step: 0, unit: 'min', status: 'ok',
    cues: 'Use the arms, push and pull. Steady.' },
  { id: 'incline-walk', name: 'Incline treadmill walk', pattern: 'cardio', equipment: 'Treadmill', step: 0, unit: 'min', status: 'ok',
    cues: 'Incline 8 to 12 percent, walking pace 5 to 6 km/h, no holding the rails.' },

  // Parked: you said you do not know these yet. They stay out of the rotation until you set them to "ok" or "like".
  { id: 'back-extension', name: 'Back extension bench', pattern: 'hinge', equipment: '45-degree back extension bench', step: 2.5, unit: 'kg', status: 'unknown',
    cues: 'Hips on the pad, ankles locked in. Hinge down with a flat back, then come up until the body is a straight line, not beyond. Hold a plate on the chest to add weight.' },
  { id: 'hack-squat', name: 'Hack squat', pattern: 'squat', equipment: 'Hack squat machine', step: 5, unit: 'kg', status: 'unknown',
    cues: 'Back flat on the pad, shoulders under the shoulder pads, feet mid platform. Release the safety handles, squat to 90 degrees, press up.' },
  { id: 'smith-squat', name: 'Smith machine squat', pattern: 'squat', equipment: 'Smith machine', step: 5, unit: 'kg', status: 'unknown',
    cues: 'The bar runs on fixed rails. Feet slightly in front of the bar, unhook by rotating the bar, squat, rotate back to hook. Set the safety stops first.' },
  { id: 'cable-fly', name: 'Cable chest fly', pattern: 'push', equipment: 'Cable crossover', step: 2.5, unit: 'kg', status: 'unknown',
    cues: 'Handles at chest height, step forward, slight elbow bend. Bring hands together in a hugging arc, open slowly.' },
  { id: 'sled-push', name: 'Sled push', pattern: 'cardio', equipment: 'Sled, turf lane', step: 0, unit: 'min', status: 'unknown',
    cues: 'Hands on the high posts, lean in, drive with short fast steps. Walk it back. Brutal and fun.' },

  // ---- Added 27 Nov 2026: more variety, surf-specific work, shoulder health, warm-up, intervals ----
  // Warm-up mobility (one round at the start of every session, no weight)
  { id: 'thoracic-rotation', name: 'Quadruped thoracic rotation', pattern: 'mobility', equipment: 'Floor', step: 0, unit: 'bw', status: 'ok', nophoto: true,
    cues: 'On all fours, one hand behind the head. Drop that elbow to the opposite wrist, then open it to the ceiling and follow it with your eyes. Reps are per side. This is the rotation surfing asks for, taken out of the lower back.' },
  { id: 'cat-camel', name: 'Cat-camel', pattern: 'mobility', equipment: 'Floor', step: 0, unit: 'bw', status: 'ok',
    cues: 'On all fours. Round the whole spine up like a cat, then let it sag and lift the chest. Slow, breathe, no forcing.' },
  { id: 'hip-flexor-stretch', name: 'Kneeling hip flexor stretch', pattern: 'mobility', equipment: 'Floor or mat', step: 0, unit: 'time', status: 'ok',
    cues: 'Half-kneeling, squeeze the glute of the back leg and shift forward until the front of the hip pulls. Keep the ribs down. Seconds are per side.' },
  { id: 'standing-hip-circles', name: 'Standing hip circles', pattern: 'mobility', equipment: 'Nothing', step: 0, unit: 'bw', status: 'ok',
    cues: 'Hand on something for balance. Lift the knee and draw the biggest circle you can with it, both directions. Reps are per side.' },
  // Shoulder health (rotator cuff, every session, light and strict)
  { id: 'band-external-rotation', name: 'Band external rotation', pattern: 'rotcuff', equipment: 'Light band', step: 0, unit: 'bw', status: 'ok',
    cues: 'Elbow glued to the ribs, forearm across the belly, rotate the hand out. Slow, no shrug. Reps are per arm. Surfers with shoulder pain lose exactly this motion.' },
  { id: 'cable-external-rotation', name: 'Cable external rotation', pattern: 'rotcuff', equipment: 'Cable at elbow height', step: 2.5, unit: 'kg', status: 'ok',
    cues: 'Same as the band version. Lightest plate on the stack, elbow tucked, rotate out and back under control. Reps are per arm.' },
  { id: 'band-pull-apart', name: 'Band pull-apart', pattern: 'rotcuff', equipment: 'Light band', step: 0, unit: 'bw', status: 'ok',
    cues: 'Arms straight in front at shoulder height, pull the band apart until it touches the chest, squeeze the shoulder blades, return slowly.' },
  { id: 'band-internal-rotation', name: 'Band internal rotation', pattern: 'rotcuff', equipment: 'Light band', step: 0, unit: 'bw', status: 'ok',
    cues: 'Elbow at the ribs, start with the hand out to the side, rotate it in across the belly. The muscle that pulls on every paddle stroke. Reps are per arm.' },
  // Vertical pull
  { id: 'straight-arm-pulldown', name: 'Straight-arm pulldown', pattern: 'vpull', equipment: 'Cable, straight bar or rope', step: 2.5, unit: 'kg', status: 'ok',
    cues: 'Arms nearly straight, hinge slightly, sweep the bar from eye level down to the thighs. This is the paddle stroke with weight on it. Feel the lats, not the triceps.' },
  { id: 'pullup', name: 'Pull-up', pattern: 'vpull', equipment: 'Bar', step: 0, unit: 'bw', status: 'unknown',
    cues: 'Full hang, pull the chest to the bar, lower all the way. Use the assisted machine until you can do 5 clean ones.' },
  // Horizontal pull
  { id: 'inverted-row', name: 'Inverted row', pattern: 'hpull', equipment: 'Smith bar at hip height, or TRX', step: 0, unit: 'bw', status: 'ok',
    cues: 'Hang under the bar, body straight as a plank, pull the chest to the bar. Walk the feet back to make it harder, forward to make it easier.' },
  { id: 'one-arm-cable-row', name: 'Single-arm cable row', pattern: 'hpull', equipment: 'Cable row station, single handle', step: 2.5, unit: 'kg', status: 'ok',
    cues: 'One hand on the handle, other hand on the knee. Row to the hip, let the shoulder blade glide forward at the end of each rep. Reps are per arm.' },
  // Rear delts
  { id: 'cable-rear-delt-row', name: 'Rope rear-delt row', pattern: 'reardelt', equipment: 'Cable, rope, chest height', step: 2.5, unit: 'kg', status: 'ok',
    cues: 'Elbows high and wide, pull the rope to the chin, hands finish beside the shoulders. Lighter than a normal row.' },
  { id: 'reverse-fly-ext-rotation', name: 'Reverse fly with external rotation', pattern: 'reardelt', equipment: 'Light dumbbells, bench', step: 1, unit: 'kg', status: 'ok',
    cues: 'Chest on an incline bench. Raise the dumbbells out to the sides, then rotate the thumbs up at the top. Very light. Weight is per dumbbell.' },
  // Hinge
  { id: 'single-leg-rdl', name: 'Single-leg Romanian deadlift', pattern: 'hinge', equipment: 'One kettlebell or dumbbell', step: 2, unit: 'kg', status: 'ok',
    cues: 'Weight in the hand opposite the standing leg. Hinge, let the back leg float up, keep the hips square. Balance is the point: the single-leg strength you use on the board. Reps are per leg.' },
  { id: 'hip-thrust', name: 'Barbell hip thrust', pattern: 'hinge', equipment: 'Bench, barbell with pad', step: 5, unit: 'kg', status: 'unknown',
    cues: 'Upper back on the bench, bar across the hips. Drive the hips up until the body is flat, squeeze the glutes one second, chin tucked. Lower under control.' },
  // Squat / lunge (single-leg)
  { id: 'db-split-squat', name: 'Dumbbell split squat', pattern: 'squat', equipment: 'Dumbbells', step: 2, unit: 'kg', status: 'ok',
    cues: 'Long stance, back knee kisses the floor straight down, front shin vertical. All reps on one leg, then switch. Weight is per dumbbell.' },
  { id: 'db-step-up', name: 'Dumbbell step-up', pattern: 'squat', equipment: 'Dumbbells, box at knee height', step: 2, unit: 'kg', status: 'ok',
    cues: 'Whole foot on the box, stand up through that heel without pushing off the back foot. Step down slowly. Reps are per leg, weight per dumbbell.' },
  // Leg isolation
  { id: 'single-leg-glute-bridge', name: 'Single-leg glute bridge', pattern: 'legiso', equipment: 'Floor', step: 0, unit: 'bw', status: 'ok',
    cues: 'On your back, one foot flat, other leg straight. Drive the hips up through the heel, squeeze, lower. Reps are per leg.' },
  // Push
  { id: 'incline-db-press', name: 'Incline dumbbell press', pattern: 'push', equipment: 'Incline bench, dumbbells', step: 2, unit: 'kg', status: 'ok',
    cues: 'Bench at 30 degrees. Press up and slightly back, lower until the elbows are just below the shoulders. The pop-up angle. Weight is per dumbbell.' },
  { id: 'dip-machine', name: 'Dip machine', pattern: 'push', equipment: 'Assisted / seated dip machine', step: 5, unit: 'kg', status: 'unknown',
    cues: 'Chest slightly forward, press down until the arms are straight, lower until the shoulders are level with the elbows.' },
  // Shoulders
  { id: 'db-shoulder-press', name: 'Dumbbell shoulder press', pattern: 'shoulder', equipment: 'Dumbbells, bench with back', step: 2, unit: 'kg', status: 'ok',
    cues: 'Start at ear height, press up until the arms are straight, lower under control. Ribs down, no arching. Weight is per dumbbell.' },
  // Pop-up power (power phase only)
  { id: 'box-jump', name: 'Box jump', pattern: 'power', equipment: 'Plyo box, knee height', step: 0, unit: 'bw', status: 'ok',
    cues: 'Swing the arms, jump, land softly on the whole foot with bent knees. Step down, never jump down. Every rep fresh: rest between reps if needed.' },
  { id: 'med-ball-slam', name: 'Medicine ball slam', pattern: 'power', equipment: 'Slam ball, 6 to 10 kg', step: 2, unit: 'kg', status: 'ok',
    cues: 'Ball overhead, whole body reaches tall, then slam it into the floor as hard as you can with the lats and abs. Catch the bounce, reset.' },
  { id: 'med-ball-chest-pass', name: 'Medicine ball chest pass', pattern: 'power', equipment: 'Medicine ball, wall', step: 1, unit: 'kg', status: 'ok',
    cues: 'Feet staggered, ball at the chest, throw it into the wall as fast as you can and catch it. Fast hands: that is the pop-up.' },
  { id: 'plank-to-popup', name: 'Plank to pop-up', pattern: 'power', equipment: 'Floor, mat', step: 0, unit: 'bw', status: 'ok', nophoto: true,
    cues: 'Lie flat as if on the board, hands under the chest. Push and bring both feet under you in one movement, land in your surf stance, stand. Back down slowly. Same stance every rep.' },
  { id: 'plyo-pushup', name: 'Plyo push-up', pattern: 'power', equipment: 'Floor', step: 0, unit: 'bw', status: 'unknown',
    cues: 'Push-up so hard the hands leave the floor. Land with soft elbows. Do it from the knees first.' },
  // Core (plank family)
  { id: 'plank-shoulder-taps', name: 'Plank with shoulder taps', pattern: 'core', equipment: 'Floor', step: 0, unit: 'bw', status: 'ok', nophoto: true,
    cues: 'High plank, feet wide. Tap the opposite shoulder without the hips twisting. Slow. Reps are total taps.' },
  { id: 'pushup-to-side-plank', name: 'Push-up to side plank', pattern: 'core', equipment: 'Floor', step: 0, unit: 'bw', status: 'ok',
    cues: 'One push-up, then rotate into a side plank with the arm to the ceiling, hold a second, come back, other side. Reps are total.' },
  // Cardio
  { id: 'stairmaster', name: 'Stair climber', pattern: 'cardio', equipment: 'Stair climber', step: 0, unit: 'min', status: 'ok',
    cues: 'Hands light on the rails, whole foot on the step. A pace where you can still speak in short sentences.' },
  { id: 'rope-jumping', name: 'Skipping rope', pattern: 'cardio', equipment: 'Jump rope', step: 0, unit: 'min', status: 'unknown',
    cues: 'Small hops, wrists do the work. Stop and restart as often as needed; the minutes still count.' },
  // Intervals (power phase cardio)
  { id: 'bike-intervals', name: 'Bike intervals', pattern: 'intervals', equipment: 'Stationary bike', step: 0, unit: 'min', status: 'ok',
    cues: '30 seconds hard, 90 seconds easy, repeat for the minutes shown. Hard means you could not talk. Two minutes easy to finish.' },
  { id: 'rower-intervals', name: 'Rower intervals', pattern: 'intervals', equipment: 'Rowing machine', step: 0, unit: 'min', status: 'ok',
    cues: '30 seconds hard, 90 seconds easy, repeat for the minutes shown. Legs first, then lean, then arms; reverse on the way back.' },
];

// Session templates. Each slot names a pattern; the exercise comes from the pool.
// reps: [min, max]. For 'time' exercises reps are seconds, for 'min' they are minutes.
// rest: seconds. offset: shifts which exercise this slot gets so A and B differ.
// Three 4-week phases that repeat. Main lifts take their reps and rest from the phase; warm-up,
// shoulder health, rear delts, calves and core keep their own. The circuit session is never phased.
export const PHASES = [
  { id: 'build', name: 'Build', tagline: 'Higher reps, short rests: muscle and conditioning base, easiest on the joints.', reps: [12, 15], rest: 60, cardio: { pattern: 'cardio', min: 15 } },
  { id: 'strength', name: 'Strength', tagline: 'Heavier, fewer reps, full rests: the weights go up.', reps: [8, 10], rest: 120, cardio: { pattern: 'cardio', min: 10 } },
  { id: 'power', name: 'Power', tagline: 'Fast and explosive: pop-ups, jumps, throws on top of heavy work, intervals to finish.', reps: [6, 8], rest: 120, cardio: { pattern: 'intervals', min: 8 } },
];

export const TEMPLATES = [
  // Slot flags: phased = reps and rest come from the current PHASE; phasedCardio = pattern and minutes
  // come from the phase; onlyPhase = the slot exists in that phase only.
  {
    id: 'A', name: 'A: Pull + Legs', tagline: 'Back day. Paddle muscles.',
    slots: [
      { pattern: 'mobility', sets: 1, reps: [8, 8],   rest: 0,  offset: 0 },
      { pattern: 'rotcuff',  sets: 2, reps: [15, 20], rest: 30, offset: 0 },
      { pattern: 'vpull',    sets: 3, reps: [12, 15], rest: 60, offset: 0, phased: true },
      { pattern: 'hpull',    sets: 3, reps: [12, 15], rest: 60, offset: 0, phased: true },
      { pattern: 'hinge',    sets: 3, reps: [12, 15], rest: 60, offset: 0, phased: true },
      { pattern: 'squat',    sets: 3, reps: [12, 15], rest: 60, offset: 0, phased: true },
      { pattern: 'power',    sets: 3, reps: [5, 6],   rest: 90, offset: 0, onlyPhase: 'power' },
      { pattern: 'reardelt', sets: 3, reps: [15, 20], rest: 60, offset: 0 },
      { pattern: 'core',     sets: 2, reps: [30, 60], rest: 45, offset: 0 },
      { pattern: 'cardio',   sets: 1, reps: [15, 15], rest: 0,  offset: 0, phasedCardio: true },
    ],
  },
  {
    id: 'B', name: 'B: Push + Legs', tagline: 'Chest, shoulders, legs. Pop-up power.',
    slots: [
      { pattern: 'mobility', sets: 1, reps: [8, 8],   rest: 0,  offset: 1 },
      { pattern: 'rotcuff',  sets: 2, reps: [15, 20], rest: 30, offset: 1 },
      { pattern: 'push',     sets: 3, reps: [12, 15], rest: 60, offset: 0, phased: true },
      { pattern: 'squat',    sets: 3, reps: [12, 15], rest: 60, offset: 1, phased: true },
      { pattern: 'shoulder', sets: 3, reps: [12, 15], rest: 60, offset: 0, phased: true },
      { pattern: 'hpull',    sets: 2, reps: [12, 15], rest: 60, offset: 1, phased: true },
      { pattern: 'power',    sets: 3, reps: [5, 6],   rest: 90, offset: 1, onlyPhase: 'power' },
      { pattern: 'legiso',   sets: 3, reps: [12, 15], rest: 60, offset: 0 },
      { pattern: 'calf',     sets: 2, reps: [15, 20], rest: 45, offset: 0 },
      { pattern: 'cardio',   sets: 1, reps: [15, 15], rest: 0,  offset: 1, phasedCardio: true },
    ],
  },
  {
    id: 'C', name: 'C: Circuit', tagline: 'Lighter, faster, sweaty. Fat-loss day, same in every phase.',
    circuit: true,
    slots: [
      { pattern: 'mobility', sets: 1, reps: [8, 8],   rest: 0,  offset: 2 },
      { pattern: 'hpull',    sets: 2, reps: [15, 15], rest: 45, offset: 2 },
      { pattern: 'squat',    sets: 2, reps: [15, 15], rest: 45, offset: 2 },
      { pattern: 'push',     sets: 2, reps: [15, 15], rest: 45, offset: 1 },
      { pattern: 'hinge',    sets: 2, reps: [15, 15], rest: 45, offset: 1 },
      { pattern: 'shoulder', sets: 2, reps: [15, 15], rest: 45, offset: 1 },
      { pattern: 'core',     sets: 2, reps: [30, 45], rest: 45, offset: 1 },
      { pattern: 'cardio',   sets: 1, reps: [15, 15], rest: 0,  offset: 2 },
    ],
  },
  // Extra sessions. Not in the default rotation (A, B, C); pick them from "Other session"
  // or add them to the rotation in Settings.
  {
    id: 'F', name: 'F: Full body', tagline: 'Everything once. The classic.',
    slots: [
      { pattern: 'mobility', sets: 1, reps: [8, 8],   rest: 0,  offset: 0 },
      { pattern: 'rotcuff',  sets: 2, reps: [15, 20], rest: 30, offset: 2 },
      { pattern: 'squat',    sets: 3, reps: [12, 15], rest: 60, offset: 0, phased: true },
      { pattern: 'hpull',    sets: 3, reps: [12, 15], rest: 60, offset: 0, phased: true },
      { pattern: 'push',     sets: 3, reps: [12, 15], rest: 60, offset: 0, phased: true },
      { pattern: 'hinge',    sets: 3, reps: [12, 15], rest: 60, offset: 1, phased: true },
      { pattern: 'vpull',    sets: 2, reps: [12, 15], rest: 60, offset: 1, phased: true },
      { pattern: 'shoulder', sets: 2, reps: [12, 15], rest: 60, offset: 1 },
      { pattern: 'core',     sets: 2, reps: [30, 60], rest: 45, offset: 0 },
      { pattern: 'cardio',   sets: 1, reps: [15, 15], rest: 0,  offset: 1, phasedCardio: true },
    ],
  },
  {
    id: 'L', name: 'L: Legs only', tagline: 'Quads, glutes, hamstrings, calves. Walk out slowly.',
    slots: [
      { pattern: 'mobility', sets: 1, reps: [8, 8],   rest: 0,  offset: 1 },
      { pattern: 'squat',    sets: 3, reps: [12, 15], rest: 60, offset: 0, phased: true },
      { pattern: 'hinge',    sets: 3, reps: [12, 15], rest: 60, offset: 0, phased: true },
      { pattern: 'squat',    sets: 3, reps: [12, 15], rest: 60, offset: 1, phased: true },
      { pattern: 'legiso',   sets: 3, reps: [12, 15], rest: 60, offset: 0 },
      { pattern: 'legiso',   sets: 3, reps: [12, 15], rest: 60, offset: 1 },
      { pattern: 'calf',     sets: 3, reps: [15, 20], rest: 45, offset: 0 },
      { pattern: 'core',     sets: 2, reps: [30, 60], rest: 45, offset: 0 },
      { pattern: 'cardio',   sets: 1, reps: [15, 15], rest: 0,  offset: 1, phasedCardio: true },
    ],
  },
  {
    id: 'U', name: 'U: Upper body', tagline: 'Back, chest, shoulders. Legs get the day off.',
    slots: [
      { pattern: 'mobility', sets: 1, reps: [8, 8],   rest: 0,  offset: 2 },
      { pattern: 'rotcuff',  sets: 2, reps: [15, 20], rest: 30, offset: 0 },
      { pattern: 'vpull',    sets: 3, reps: [12, 15], rest: 60, offset: 0, phased: true },
      { pattern: 'push',     sets: 3, reps: [12, 15], rest: 60, offset: 0, phased: true },
      { pattern: 'hpull',    sets: 3, reps: [12, 15], rest: 60, offset: 0, phased: true },
      { pattern: 'shoulder', sets: 3, reps: [12, 15], rest: 60, offset: 0, phased: true },
      { pattern: 'hpull',    sets: 2, reps: [12, 15], rest: 60, offset: 1 },
      { pattern: 'reardelt', sets: 3, reps: [15, 20], rest: 60, offset: 0 },
      { pattern: 'core',     sets: 2, reps: [30, 60], rest: 45, offset: 1 },
      { pattern: 'cardio',   sets: 1, reps: [15, 15], rest: 0,  offset: 0, phasedCardio: true },
    ],
  },
  {
    id: 'D', name: 'D: Back & core', tagline: 'All the paddle muscles, nothing else.',
    slots: [
      { pattern: 'mobility', sets: 1, reps: [8, 8],   rest: 0,  offset: 0 },
      { pattern: 'rotcuff',  sets: 2, reps: [15, 20], rest: 30, offset: 1 },
      { pattern: 'vpull',    sets: 3, reps: [12, 15], rest: 60, offset: 0, phased: true },
      { pattern: 'hpull',    sets: 3, reps: [12, 15], rest: 60, offset: 0, phased: true },
      { pattern: 'hinge',    sets: 3, reps: [12, 15], rest: 60, offset: 0, phased: true },
      { pattern: 'hpull',    sets: 3, reps: [12, 15], rest: 60, offset: 1 },
      { pattern: 'reardelt', sets: 3, reps: [15, 20], rest: 60, offset: 0 },
      { pattern: 'core',     sets: 2, reps: [30, 60], rest: 45, offset: 0 },
      { pattern: 'core',     sets: 2, reps: [30, 45], rest: 45, offset: 1 },
      { pattern: 'cardio',   sets: 1, reps: [15, 15], rest: 0,  offset: 0, phasedCardio: true },
    ],
  },
];

// Short session for a day you surfed but still want to tick the box.
export const SHORT_TEMPLATE = {
  id: 'S', name: 'S: Short (surfed today)', tagline: '20 minutes. Shoulders, back and core only.',
  slots: [
    { pattern: 'rotcuff',  sets: 2, reps: [15, 20], rest: 30, offset: 2 },
    { pattern: 'hpull',    sets: 2, reps: [12, 15], rest: 60, offset: 0 },
    { pattern: 'reardelt', sets: 2, reps: [15, 20], rest: 45, offset: 1 },
    { pattern: 'hinge',    sets: 2, reps: [12, 15], rest: 60, offset: 2 },
    { pattern: 'core',     sets: 2, reps: [30, 45], rest: 45, offset: 0 },
  ],
};

export const DEFAULT_SETTINGS = {
  programStart: null,      // ISO date, set on first run
  rotation: ['A', 'B', 'C'], // which sessions cycle as "next up"; others are picked by hand
  blockDays: 28,           // exercise rotation period
  targetPer14: 4,          // minimum sessions per rolling 14 days (2/week)
  goalPer14: 6,            // goal (3/week)
  targetWeight: null,      // kg
  defaultRest: 90,
  notify: true,            // silent system notification when rest is over
  vibrate: true,
};
