import { STRESS_LIMITS } from "./stresstracker";

const SPRITE_VARIANTS_PER_STRESS = 15;

const PC_DETAIL = 15; // vertices in PC 'circle' 
const PC_SPRITES = [];

function stressColour(stress, fill = true) {
    // N.B. MAX and MIN are relative to stress rather than HSL 
    const MIN_H = 280;
    const MAX_H = 360;
    const MIN_S = 20;
    const MAX_S = 100;
    const MIN_L = 90;
    const MAX_L = 65;

    const stressFraction = (stress - STRESS_LIMITS.min) / (STRESS_LIMITS.max - STRESS_LIMITS.min);
    var H = Math.round(MIN_H + stressFraction * (MAX_H - MIN_H));
    var S = Math.round(MIN_S + stressFraction * (MAX_S - MIN_S));
    var L = Math.round(MIN_L + stressFraction * (MAX_L - MIN_L));
    if (!fill) L = (L - 40);

    return `hsl(${H}, ${S}%, ${L}%)`;
}

function generatePCSprites(p5, sketcher, pcDiameter) {
    for (let index = 0; index <= STRESS_LIMITS.max; index++) {
        const strokeColour = stressColour(index, false);
        const fillColour = stressColour(index);
        PC_SPRITES[index] = [];
        for (let variant = 0; variant < SPRITE_VARIANTS_PER_STRESS; variant++) {
            PC_SPRITES[index][variant] = sketcher.buildSketchedEllipse(
                p5.color(strokeColour),
                p5.color(fillColour),
                0,
                0,
                pcDiameter,
                pcDiameter,
                PC_DETAIL,
            );
        }
    }
}

function drawPC(pos, stressIndex, variant = 0) {
    if (PC_SPRITES.length == 0) {
        throw new Error('Cannot draw PC before PC sprites are generated.');
    } else {
        PC_SPRITES[stressIndex][variant].draw(pos);
    }
}


export { generatePCSprites, drawPC };