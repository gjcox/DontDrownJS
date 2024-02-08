import { STRESS_LIMITS } from "./stresstracker";

const SPRITE_VARIANTS_PER_STRESS = 15;
const MAX_FRAMES_PER_VARIANT = 60;
const MIN_FRAMES_PER_VARIANT = 10;

const PC_DETAIL = 25; // vertices in PC 'circle' 


function stressColour(stressFraction, fill = true) {
    // N.B. MAX and MIN are relative to stress rather than HSL 
    const MIN_H = 280;
    const MAX_H = 360;
    const MIN_S = 20;
    const MAX_S = 100;
    const MIN_L = 90;
    const MAX_L = 65;

    var H = Math.round(MIN_H + stressFraction * (MAX_H - MIN_H));
    var S = Math.round(MIN_S + stressFraction * (MAX_S - MIN_S));
    var L = Math.round(MIN_L + stressFraction * (MAX_L - MIN_L));
    if (!fill) L = (L - 40);

    return `hsl(${H}, ${S}%, ${L}%)`;
}

function calcStressFraction(stress) {
    return (stress - STRESS_LIMITS.min) /
        (STRESS_LIMITS.max - STRESS_LIMITS.min);
}

function generateSprites(sketcher, generateSprite) {
    const sprites = [];
    for (let stress = STRESS_LIMITS.min; stress <= STRESS_LIMITS.max; stress++) {
        sprites[stress] = [];

        // stress-based drawing settings 
        const stressFraction = calcStressFraction(stress);
        sketcher.lineBreaksMax = stressFraction;
        sketcher.lineDeviationMult = stressFraction;

        for (let variant = 0; variant < SPRITE_VARIANTS_PER_STRESS; variant++) {
            sprites[stress][variant] = generateSprite(stressFraction);
        }
    }

    // reset sketcher to defaults
    sketcher.lineBreaksMax = undefined;
    sketcher.lineDeviationMult = undefined;

    return sprites;
}

export default class SpriteManager {
    #p5;
    #smoothedStress; // to prevent 1 redraw per frame  
    #variant;
    #framesPerVariant;
    #lastFrameCount;
    #pcSprites;

    constructor(p5, sketcher, pcDiameter) {
        this.#p5 = p5;
        this.#variant = 0;
        this.#smoothedStress = STRESS_LIMITS.min;
        this.#lastFrameCount = p5.frameCount;
        this.#framesPerVariant = MAX_FRAMES_PER_VARIANT;
        this.#generatePCSprites(p5, sketcher, pcDiameter);
    }



    #generatePCSprites(p5, sketcher, pcDiameter) {
        function generatePCSprite(stressFraction) {
            const strokeColour = stressColour(stressFraction, false);
            const fillColour = stressColour(stressFraction);

            return sketcher.buildSketchedEllipse(
                p5.color(strokeColour),
                p5.color(fillColour),
                0,
                0,
                pcDiameter,
                pcDiameter,
                PC_DETAIL,
            );
        }

        this.#pcSprites = generateSprites(sketcher, generatePCSprite);
    }


    drawSprites(stress, { pcPos }) {
        // Frames per variant is inversely proportional to stress 
        this.#framesPerVariant = Math.max(MIN_FRAMES_PER_VARIANT,
            Math.round(MAX_FRAMES_PER_VARIANT * (1 - calcStressFraction(stress))));

        // If enough time has passed...
        if ((this.#p5.frameCount - this.#lastFrameCount) %
            this.#framesPerVariant == 0) {
            // ... increment variant and update smoothed stress 
            this.#smoothedStress = Math.round(stress);
            this.#variant = (this.#variant + 1) % SPRITE_VARIANTS_PER_STRESS;
            this.#lastFrameCount = this.#p5.frameCount;
        }

        if (pcPos) {
            this.#pcSprites[this.#smoothedStress][this.#variant].draw(pcPos);
        }

    }
}

