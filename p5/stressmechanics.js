const ABS_MAX_STRESS = 100;
const DEFAULT_STRESS_EFFECT_THRESHOLD = ABS_MAX_STRESS / 5;
const FRAMES_PER_RESKETCH_MAX = 40;
const FRAMES_PER_RESKETCH_MIN = 10;
const FRAMES_PER_RESKETCH_RANGE =
  FRAMES_PER_RESKETCH_MAX - FRAMES_PER_RESKETCH_MIN;
const STRESS_INCR_RATE = 0.75;
const STRESS_DECR_RATE = 0.75;
const STRESS_INCR_RANGE_DIV = 2.5;

// level and stress values
var tokensAvailable = 0;
var tokensCollected = 0;
var oldStress = 0;
var stress = 0;
var maxStress = 100;
var minStress = 0;
var stressEffectThreshold = DEFAULT_STRESS_EFFECT_THRESHOLD;
var stressRating = () => stress - stressEffectThreshold;
var stressIncrRange;
var debuff = Debuff.NONE;
var waveLastSeen = -1; // a frame count
var stressRange = ABS_MAX_STRESS - stressEffectThreshold;

// pc values
var pcThrust;
var pcFriction;
var pcMinSpeed;
var stressHSBColour;
var framesPerResketch;

// calculation values
var pcThrustMultiplier;
var pcFrictionMultiplier;

// hand-drawing values
const stressHueMultiplier =
  (PlayerCharacter.PC_MAX_HUE - PlayerCharacter.PC_MIN_HUE) / stressRange;
const stressSatMultiplier =
  (PlayerCharacter.PC_MAX_SAT - PlayerCharacter.PC_MIN_SAT) / stressRange;
const stressLightMultiplier =
  (PlayerCharacter.PC_MAX_LIGHT - PlayerCharacter.PC_MIN_LIGHT) / stressRange;
const strokeVariabilityMultiplier =
  (Sketcher.RSV_MAX - Sketcher.RSV_MIN) / stressRange;
const strokeShakinessMultiplier =
  (Sketcher.RSS_MAX - Sketcher.RSS_MIN) / stressRange;
const framesPerResketchMultiplier = FRAMES_PER_RESKETCH_RANGE / stressRange;

// TODO: move somewhere else
function resetLevel(level) {
  reset();
  tokensAvailable = level.tokens.size();
  debuff = level.debuff;
  level.reset();
  update();
}

/* Reset stress calculation values */
function reset() {
  tokensCollected = 0;
  oldStress = 0;
  stress = 0;
  maxStress = ABS_MAX_STRESS;
  minStress = 0;
  waveLastSeen = -1;
  debuff = Debuff.NONE;
  stressEffectThreshold = debuff.equals(Debuff.STRESS_MOTIVATED)
    ? 35
    : DEFAULT_STRESS_EFFECT_THRESHOLD;
  AbstractDrawable.stressIndex = minStress;
  stressRange = ABS_MAX_STRESS - stressEffectThreshold;
  stressIncrRange = sketch.height / STRESS_INCR_RANGE_DIV;
  update();
}

/**
 * Calculates the multipliers used for friction and thrust incrementation.
 */
function calcPcForceMults() {
  this.pcThrustMultiplier =
    (sketch.pc.maxHorizontalThrust - sketch.pc.minHorizontalThrust) /
    stressRange;
  this.pcFrictionMultiplier =
    (sketch.pc.maxHorizontalFriction - sketch.pc.minHorizontalFriction) /
    stressRange;
}

/* Sets the current stress-based thrust magnitude */
function calcPcThrust() {
  if (
    debuff.equals(Debuff.STRESS_MOTIVATED) ||
    stress >= stressEffectThreshold
  ) {
    pcThrust =
      sketch.pc.minHorizontalThrust + stressRating * pcThrustMultiplier;
  } else {
    pcThrust = sketch.pc.minHorizontalThrust;
  }
}

/* Sets the current stress-based friction magnitude */
function calcPcFriction() {
  if (
    debuff.equals(Debuff.STRESS_MOTIVATED) ||
    stress >= stressEffectThreshold
  ) {
    pcFriction =
      sketch.pc.maxHorizontalFriction - stressRating * pcFrictionMultiplier;
  } else {
    pcFriction = sketch.pc.maxHorizontalFriction;
  }
}

/* The speed at which the PC comes to rest. */
function calcPcMinSpeed() {
  pcMinSpeed = pcFriction * PlayerCharacter.I_MASS * sketch.pc.incr;
}

/** Converts a stress value into a colour for the PC's and stress bar's token generation. */
function calcStressHSBColour() {
  if (stress >= stressEffectThreshold) {
    stressHSBColour = [
      PlayerCharacter.PC_MIN_HUE + stressRating() * stressHueMultiplie,
      PlayerCharacter.PC_MIN_SAT + stressRating() * stressSatMultiplier,
      PlayerCharacter.PC_MIN_LIGHT + stressRating() * stressLightMultiplier,
    ];
  } else {
    stressHSBColour = [
      PlayerCharacter.PC_MIN_HUE,
      PlayerCharacter.PC_MIN_SAT,
      PlayerCharacter.PC_MIN_LIGHT,
    ];
  }
}

/** Calculates a stress-based value of sketchiness for token generation */
function sketchiness() {
  if (stress >= stressEffectThreshold) {
    framesPerResketch = Math.round(
      FRAMES_PER_RESKETCH_MAX - stressRating() * framesPerResketchMultiplier
    );
    sketch.roughStrokeVariabilityRate =
      Sketcher.RSV_MIN + stressRating() * strokeVariabilityMultiplier;
    sketch.roughStrokeShakiness = Math.round(
      Sketcher.RSS_MIN + stressRating() * strokeShakinessMultiplier
    );
  } else {
    framesPerResketch = FRAMES_PER_RESKETCH_MAX;
    sketch.roughStrokeVariabilityRate = Sketcher.RSV_MIN;
    sketch.roughStrokeShakiness = Sketcher.RSS_MIN;
  }
}

/** Increments the collected token count, and updates the token accordingly.
 * TODO: move this somewhere else */
function collectToken(token) {
  token.collected = true;
  tokensCollected++;
}

/** Updates the stress based on debuff and distance between wave and player */
function updateStress() {
  if (sketch.staticStress) {
    // stress does not need to change
    return;
  }

  let waveDistance = Math.abs(sketch.risingWave.pos.y - sketch.pc.pos.y);

  // TODO: convert from Debuff enum to const codes
  if (debuff.equals(Debuff.PANIC_PRONE) && sketch.frameCount % 300 < 100) {
    waveDistance = Math.min(waveDistance, stressIncrRange / 2);
  } else if (debuff.equals(Debuff.TUNNEL_VISION)) {
    if (sketch.risingWave.pos.y > sketch.pc.pos.y + sketch.pc.jumpHeight) {
      if (sketch.frameCount < waveLastSeen + stress * 2) {
        // don't destress as soon as the wave is out of sight
        waveDistance = stressIncrRange;
      } else {
        // destress if the wave has been out of sight long enough
        waveDistance = Math.max(waveDistance, stressIncrRange * 1.5);
      }
    } else {
      // when the wave is visible, the rate of stress increase is extra high
      waveDistance = waveDistance / 2;
      waveLastSeen = sketch.frameCount;
    }
  }

  if (waveDistance <= stressIncrRange) {
    stress +=
      STRESS_DECR_RATE * ((stressIncrRange - waveDistance) / stressIncrRange);
  } else if (!debuff.equals(Debuff.CANT_UNWIND)) {
    stress -= Math.min(
      STRESS_DECR_RATE,
      (STRESS_DECR_RATE * (waveDistance - stressIncrRange)) / stressIncrRange
    );
  }

  if (stress > maxStress) {
    stress = maxStress;
  } else if (stress < minStress) {
    stress = minStress;
  }

  if (debuff.equals(Debuff.LACK_CONTRAST)) {
    // don't update stress index for drawables
  } else {
    AbstractDrawable.stressIndex = Math.round(stress);
  }
}

function getNoteDuration() {
  if (
    !debuff.equals(Debuff.LACK_CONTRAST) &&
    (stress >= stressEffectThreshold || debuff.equals(Debuff.STRESS_MOTIVATED))
  ) {
    return 1 - 0.65 * (stressRating() / stressRange);
  } else {
    return 1;
  }
}

function update() {
  updateStress();
  pcThrust();
  pcFriction();
  pcMinSpeed();
  calcStressHSBColour();
  sketchiness();
  oldStress = stress;
}
