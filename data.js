// GymGrog exercise pool and session templates.
// Patterns are fixed; the exercise inside a pattern rotates every 4-week block.

export const PATTERNS = {
  vpull:    { name: 'Vertical pull',   muscles: 'Lats, biceps' },
  hpull:    { name: 'Horizontal pull', muscles: 'Mid back, rear delts, biceps' },
  reardelt: { name: 'Rear delts / upper back', muscles: 'Rear delts, traps, rotator cuff' },
  hinge:    { name: 'Hip hinge',       muscles: 'Glutes, hamstrings, lower back' },
  squat:    { name: 'Squat / lunge',   muscles: 'Quads, glutes' },
  legiso:   { name: 'Leg isolation',   muscles: 'Hamstrings or quads' },
  calf:     { name: 'Calves',          muscles: 'Calves' },
  push:     { name: 'Horizontal push', muscles: 'Chest, front delts, triceps' },
  shoulder: { name: 'Shoulders',       muscles: 'Delts' },
  core:     { name: 'Core',            muscles: 'Abs, obliques' },
  cardio:   { name: 'Cardio finish',   muscles: 'Heart and lungs' },
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
];

// Session templates. Each slot names a pattern; the exercise comes from the pool.
// reps: [min, max]. For 'time' exercises reps are seconds, for 'min' they are minutes.
// rest: seconds. offset: shifts which exercise this slot gets so A and B differ.
export const TEMPLATES = [
  {
    id: 'A', name: 'A: Pull + Legs', tagline: 'Back day. Paddle muscles.',
    slots: [
      { pattern: 'vpull',    sets: 3, reps: [10, 12], rest: 90, offset: 0 },
      { pattern: 'hpull',    sets: 3, reps: [10, 12], rest: 90, offset: 0 },
      { pattern: 'hinge',    sets: 3, reps: [10, 12], rest: 90, offset: 0 },
      { pattern: 'squat',    sets: 3, reps: [12, 15], rest: 90, offset: 0 },
      { pattern: 'reardelt', sets: 3, reps: [15, 20], rest: 60, offset: 0 },
      { pattern: 'core',     sets: 2, reps: [30, 60], rest: 45, offset: 0 },
      { pattern: 'cardio',   sets: 1, reps: [10, 10], rest: 0,  offset: 0 },
    ],
  },
  {
    id: 'B', name: 'B: Push + Legs', tagline: 'Chest, shoulders, legs. Pop-up power.',
    slots: [
      { pattern: 'push',     sets: 3, reps: [10, 12], rest: 90, offset: 0 },
      { pattern: 'squat',    sets: 3, reps: [10, 12], rest: 90, offset: 1 },
      { pattern: 'shoulder', sets: 3, reps: [12, 15], rest: 60, offset: 0 },
      { pattern: 'hpull',    sets: 2, reps: [12, 15], rest: 60, offset: 1 },
      { pattern: 'legiso',   sets: 3, reps: [12, 15], rest: 60, offset: 0 },
      { pattern: 'calf',     sets: 2, reps: [15, 20], rest: 45, offset: 0 },
      { pattern: 'cardio',   sets: 1, reps: [10, 10], rest: 0,  offset: 1 },
    ],
  },
  {
    id: 'C', name: 'C: Circuit', tagline: 'Lighter, faster, sweaty. Fat-loss day.',
    circuit: true,
    slots: [
      { pattern: 'hpull',    sets: 2, reps: [15, 15], rest: 45, offset: 2 },
      { pattern: 'squat',    sets: 2, reps: [15, 15], rest: 45, offset: 2 },
      { pattern: 'push',     sets: 2, reps: [15, 15], rest: 45, offset: 1 },
      { pattern: 'hinge',    sets: 2, reps: [15, 15], rest: 45, offset: 1 },
      { pattern: 'shoulder', sets: 2, reps: [15, 15], rest: 45, offset: 1 },
      { pattern: 'core',     sets: 2, reps: [30, 45], rest: 45, offset: 1 },
      { pattern: 'cardio',   sets: 1, reps: [15, 15], rest: 0,  offset: 2 },
    ],
  },
];

// Short session for a day you surfed but still want to tick the box.
export const SHORT_TEMPLATE = {
  id: 'S', name: 'S: Short (surfed today)', tagline: '20 minutes. Back and core only.',
  slots: [
    { pattern: 'hpull',    sets: 2, reps: [12, 15], rest: 60, offset: 0 },
    { pattern: 'reardelt', sets: 2, reps: [15, 20], rest: 45, offset: 1 },
    { pattern: 'hinge',    sets: 2, reps: [12, 15], rest: 60, offset: 2 },
    { pattern: 'core',     sets: 2, reps: [30, 45], rest: 45, offset: 0 },
  ],
};

export const DEFAULT_SETTINGS = {
  programStart: null,      // ISO date, set on first run
  blockDays: 28,           // exercise rotation period
  targetPer14: 4,          // minimum sessions per rolling 14 days (2/week)
  goalPer14: 6,            // goal (3/week)
  targetWeight: null,      // kg
  defaultRest: 90,
  sound: true,
  vibrate: true,
};
