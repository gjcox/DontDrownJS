// const PLATFORM_STROKE_COLOUR = 0xddd79b00;
// const PLATFORM_FILL_COLOUR = 0xaaffe6cc;
const PLATFORM_STROKE_COLOUR =  'gold'; 
const PLATFORM_FILL_COLOUR = 'yellow';
      
const TOP_PLATFORM_STROKE_COLOUR = 0xddd7c800;
const TOP_PLATFORM_FILL_COLOUR = 0xaaffe678;

function generatePlatformSprites(
  p,
  sketcher,
  array,
  width = undefined,
  strokeColour = PLATFORM_STROKE_COLOUR,
  fillColour = PLATFORM_FILL_COLOUR
) {
  if (!width) {
    width = p.width / PF_WIDTH_DIV;
  }
  let height = p.width / PF_WIDTH_DIV / PF_HEIGHT_DIV;

  p.colorMode(p.RGB);
  let topStrokeWeight = 2 * RSW_DEF;

  for (let i = 0; i <= ABS_MAX_STRESS; i++) {
    // create a set of sprites for each stress level
    // TODO: make drawing stress-dependent
    array.push([]);
    for (let j = 0; j < N_SPRITE_VARIANTS; j++) {
      let sprite = new CompositeShape();

      // add basic shape - a top-heavy trapezium to be overhung by top line
      sketcher.roughStrokeWeight = RSW_DEF;

      let platformShape = sketcher.buildHandDrawnShape(
        QUAD,
        strokeColour,
        fillColour,
        2 * RSW_DEF,        RSW_DEF,
        width - 2 * RSW_DEF,        RSW_DEF,
        width - (2 * RSW_DEF + width / 16),        height,
        2 *RSW_DEF + width / 16,        height
      );
      sprite.addShape(platformShape);

      // add thick top line
      sketcher.roughStrokeWeight = sketcher.roughStrokeWeight * 2;
      let topLine = sketcher.buildHandDrawnLine(
        p.createVector(0, 0),
        p.createVector(width, 0),
        strokeColour
      );
      sprite.addShape(topLine);

      array[i].push(sprite);
    }
  }
}

function generateTopPlatformSprites(p, sketcher, array) {
  generatePlatformSprites(
    p,
    sketcher,
    array,
    p.width / PF_WIDTH_DIV,
    TOP_PLATFORM_STROKE_COLOUR,
    TOP_PLATFORM_FILL_COLOUR
  );
}

function generateWidePlatformSprites() {
  throw new Error("TODO: implement wide platform generation");
}
