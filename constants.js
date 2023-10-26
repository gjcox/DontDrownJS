/* Shape codes for Sketcher.handDraw() */
const VERTICES = 101;
const QUAD = 104;
const RECT = 108;
const ELLIPSE = 110;
const WAVE = 112;

/* Game state codes */
const PRE_STARTUP = 201;
const STARTUP = 202;
const MID_LEVEL = 203;
const IN_MENU = 204;

/* Sprite rendering constants */
const N_SPRITE_VARIANTS = 15;
const FRAMES_PER_STRESS_BAR_RESKETCH = 2;
const FRAMES_PER_RESKETCH_MAX = 40;
const FRAMES_PER_RESKETCH_MIN = 10;
const FRAMES_PER_RESKETCH_RANGE =
  FRAMES_PER_RESKETCH_MAX - FRAMES_PER_RESKETCH_MIN;

/* Sprite sizing constants */
const PF_WIDTH_DIV = 5; // platform width is 1/10 of sketch width
const PF_HEIGHT_DIV = 7; // as a ratio of platform width

/* Stress constants */
const ABS_MAX_STRESS = 100;
const DEFAULT_STRESS_EFFECT_THRESHOLD = ABS_MAX_STRESS / 5;
const STRESS_INCR_RATE = 0.75;
const STRESS_DECR_RATE = 0.75;
const STRESS_INCR_RANGE_DIV = 2.5;
