import { CREST_HEIGHT_DIV } from "../utils/constants";
import { CompositeShape } from "./shapes";
import { STRESS_LIMITS } from "./stresstracker";

const SPRITE_VARIANTS_PER_STRESS = 5;
const MAX_FRAMES_PER_VARIANT = 60;
const MIN_FRAMES_PER_VARIANT = 10;

const PC_DETAIL = 25; // vertices in PC 'circle' 

const PF_GROUND_THICKNESS_MULT = 3; // relative to sketcher.defLineWeight     
const PF_STROKE_COLOUR = 'limegreen';
const PF_FILL_COLOUR = 'chartreuse';

const WAVE_FOAM_COLOUR = 'lightskyblue';
const WAVE_WATER_COLOUR = 'mediumblue';
const N_CRESTS = 12;
const WAVE_DETAIL = 5; // vertices per crest  
const ASSUMED_FRAMERATE = 60;
const SECONDS_PER_CREST = 2;
const WAVE_VARIANTS = WAVE_DETAIL * 2;
const WAVE_FPS = WAVE_VARIANTS / SECONDS_PER_CREST;

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

function generateSprites(sketcher, generateSprite, variants = SPRITE_VARIANTS_PER_STRESS) {
    const sprites = [];
    for (let stress = STRESS_LIMITS.min; stress <= STRESS_LIMITS.max; stress++) {
        sprites[stress] = [];

        // stress-based drawing settings 
        const stressFraction = calcStressFraction(stress);
        sketcher.lineBreaksMax = stressFraction;
        sketcher.lineDeviationMult = stressFraction;

        for (let variant = 0; variant < variants; variant++) {
            const args = { stressFraction: stressFraction, variant: variant };
            sprites[stress][variant] = generateSprite(args);
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
    #platformSprites;
    #waveSprites;
    #waveVariant;

    constructor(p5, sketcher, pcDiameter, platformWidth, platformHeight) {
        this.#p5 = p5;
        this.reset();
        console.log(`Generating PC sprites`);
        this.#generatePCSprites(p5, sketcher, pcDiameter);
        console.log(`Generating platform sprites`);
        this.#generatePlatformSprites(p5, sketcher, platformWidth, platformHeight);
        console.log(`Generating wave sprites`);
        this.#generateWaveSprites(p5, sketcher);
        console.log(`All sprites generated`);
    }

    reset() {
        this.#variant = 0;
        this.#smoothedStress = STRESS_LIMITS.min;
        this.#lastFrameCount = this.#p5.frameCount;
        this.#framesPerVariant = MAX_FRAMES_PER_VARIANT;
        this.#waveVariant = 0;
    }

    #generatePCSprites(p5, sketcher, pcDiameter) {
        function generatePCSprite({ stressFraction }) {
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

    #generatePlatformSprites(p5, sketcher, platformWidth, platformHeight) {
        function generatePlatformSprite() {
            const sprite = new CompositeShape();
            const groundThickness = sketcher.defLineWeight * PF_GROUND_THICKNESS_MULT;
            const groundOverhang = groundThickness;
            const topBottomOverhang = groundOverhang + 0.1 * platformWidth;
            const trapezium = sketcher.buildSketchedQuad(
                PF_STROKE_COLOUR,
                PF_FILL_COLOUR,
                [
                    p5.createVector(groundOverhang, 0),
                    p5.createVector(platformWidth - groundOverhang, 0),
                    p5.createVector(platformWidth - topBottomOverhang, platformHeight),
                    p5.createVector(topBottomOverhang, platformHeight)
                ]
            );
            sprite.addShape(trapezium);
            const groundSurface = sketcher.buildSketchedLine(
                p5.createVector(platformWidth, groundThickness / 2),
                p5.createVector(0, groundThickness / 2),
                PF_STROKE_COLOUR,
                groundThickness
            )
            sprite.addShape(groundSurface);
            return sprite;
        }

        this.#platformSprites = generateSprites(sketcher, generatePlatformSprite);
    }

    #generateWaveSprites(p5, sketcher) {
        const crestHeight = p5.height / CREST_HEIGHT_DIV;

        function generateWaveSprite({ variant }) {
            const foamWeight = sketcher.defLineWeight * 3;
            return sketcher.buildSketchedWave(
                WAVE_FOAM_COLOUR,
                WAVE_WATER_COLOUR,
                p5.width,
                p5.height,
                N_CRESTS,
                crestHeight,
                WAVE_DETAIL,
                variant,
                foamWeight
            );
        }

        this.#waveSprites = generateSprites(sketcher, generateWaveSprite, WAVE_VARIANTS);
    }

    drawSprites(stress, { pcPos, platforms, wavePos }) {
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

        // If enough time has passed...
        if (this.#p5.frameCount % Math.floor(ASSUMED_FRAMERATE / WAVE_FPS) == 0) {
            // ... increment wave variant 
            this.#waveVariant = (this.#waveVariant + 1) % WAVE_VARIANTS;
        }

        if (pcPos) {
            this.#pcSprites[this.#smoothedStress][this.#variant].draw(pcPos);
        }

        if (platforms) {
            for (let { i, pos } of platforms) {
                let adjustedVariant = (this.#variant + i) % SPRITE_VARIANTS_PER_STRESS;
                this.#platformSprites[this.#smoothedStress][adjustedVariant].draw(pos);
            }
        }

        if (wavePos) {
            this.#waveSprites[this.#smoothedStress][this.#waveVariant].draw(wavePos);
        }
    }
}

