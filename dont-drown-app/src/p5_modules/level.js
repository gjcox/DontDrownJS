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

    constructor(p5, difficulty) {
        this.p5 = p5;
        this._platforms = [];
        this._difficulty = difficulty;
        this._height = Math.round(p5.height * difficulty.heightMult);
        this._topLimit = p5.height - this._height;
        this._top; // the top of the level relative to the viewport
        this._waveRiseRate = p5.height / (60 * difficulty.waveRiseTime);
    }

    get platforms() {
        return this._platforms;
    }

    set platforms(platforms) {
        this._platforms = platforms;
        this._platforms.sort((p1, p2) => p2.pos.y - p1.pos.y);
        this._highestPlatform = this._platforms[this._platforms.length - 1];
    }

    get difficulty() {
        return this._difficulty;
    }

    get top() {
        return this._top;
    }

    get topLimit() {
        return this._topLimit;
    }

    get waveRiseRate() {
        return this._waveRiseRate;
    }

    get highestPlatform() {
        return this._highestPlatform; 
    }

    reset() {
        this._top = this.topLimit;
        this.platforms.forEach(p => p.pos = p.initPos.copy());
    }

    /* Move all level elements up or down (incl. PC and wave) */
    pan(y) {
        this._top += y;
        this._platforms.forEach(p => p.translate(this.p5.createVector(0, y)));
    }

    draw(marginX, lineGap, topLineGap) {
        renderPage(this.p5, marginX, lineGap, topLineGap, this.top);
    } 
}

export { EASY, HARD, MEDIUM, VERY_HARD };
