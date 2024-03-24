import { renderPage } from "./page";

class Difficulty {
    constructor(heightMult, hasGround, verticality, waveRiseTime, string) {
        this.heightMult = heightMult;
        this.hasGround = hasGround;
        this.verticality = verticality;
        this.waveRiseTime = waveRiseTime;
        this.string = string;
        Object.freeze(this);
    }
}

const EASY = new Difficulty(1.5, true, 0.6, 14, "easy");
const MEDIUM = new Difficulty(2, false, 0.4, 14, "medium");
const HARD = new Difficulty(2.5, false, 0.2, 14, "hard");
const VERY_HARD = new Difficulty(3, false, 0.1, 14, "very hard");

export default class Level {
    #p5;
    #platforms;
    #tokens;
    #highestPlatform;
    #difficulty;
    #height;
    #topLimit;
    #top;
    #waveRiseRate;

    constructor(p5, difficulty) {
        this.#p5 = p5;
        this.#platforms = [];
        this.#difficulty = difficulty;
        this.#height = Math.round(p5.height * difficulty.heightMult);
        this.#topLimit = p5.height - this.#height;
        this.#top; // the top of the level relative to the viewport
        this.#waveRiseRate = p5.height / (60 * difficulty.waveRiseTime);
    }

    get platforms() {
        return this.#platforms;
    }

    set platforms(platforms) {
        this.#platforms = platforms;
        this.#platforms.sort((p1, p2) => p2.pos.y - p1.pos.y);
        this.#highestPlatform = this.#platforms[this.#platforms.length - 1];
    }

    get tokens() {
        return this.#tokens;
    }

    set tokens(tokens) {
        this.#tokens = tokens;
        this.#tokens.sort((t1, t2) => t2.pos.y - t1.pos.y);
    }

    get difficulty() {
        return this.#difficulty;
    }

    get top() {
        return this.#top;
    }

    get topLimit() {
        return this.#topLimit;
    }

    get waveRiseRate() {
        return this.#waveRiseRate;
    }

    get highestPlatform() {
        return this.#highestPlatform;
    }

    reset() {
        this.#top = this.topLimit;
        this.#platforms.forEach(p => p.pos = p.initPos);
        this.#tokens.forEach(t => t.reset());
    }

    /* Move all level elements up or down (incl. PC and wave) */
    pan(y) {
        this.#top += y;
        this.#platforms.forEach(p => p.translate(this.#p5.createVector(0, y)));
        this.#tokens.forEach(t => t.translate({ y: y }));
    }

    renderPage(marginX, lineGap, topLineGap) {
        renderPage(this.#p5, marginX, lineGap, topLineGap, this.top);
    }
}

export { EASY, HARD, MEDIUM, VERY_HARD };
