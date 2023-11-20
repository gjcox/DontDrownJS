class Difficulty {
    constructor(heightMult, hasGround, verticality, waveRiseTime) {
        this._heightMult = heightMult;
        this._hasGround = hasGround;
        this._verticality = verticality;
        this._waveRiseTime = waveRiseTime;
    }

    get heightMult() {
        return this._heightMult;
    }

    get hasGround() {
        return this._hasGround;
    }

    get verticality() {
        return this._verticality;
    }

    get waveRiseTime() {
        return this._waveRiseTime;
    }
}

const EASY = new Difficulty(1.5, true, 0.6, 14);
const MEDIUM = new Difficulty(2, false, 0.4, 14);
const HARD = new Difficulty(2.5, false, 0.2, 14);
const VERY_HARD = new Difficulty(3, false, 0.1, 14);

export default class Level {

    constructor(p5, difficulty) {
        this.p5 = p5;
        this._platforms = [];
        this._difficulty = difficulty;
        this._height = Math.round(p5.height * difficulty.heightMult);
        this._topLimit = p5.height - this._height;
        this._top; // the top of the level relative to the viewport
        this._waveRiseRate = p5.height / (60 * difficulty.waveRiseTime);
        this._age = undefined;
    }

    get platforms() {
        return this._platforms;
    }

    set platforms(platforms) {
        this._platforms = platforms;
        this._platforms.sort((p1, p2) => p2.pos.y - p1.pos.y);
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

    get page() {
        this._page;
    }

    set page(page) {
        this._page = page;
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

    draw() {
        this._page?.draw({ x: 0, y: Math.abs(this.topLimit - this.top) });
        this._platforms.forEach(p => p.draw());
    }
}

export { EASY, HARD, MEDIUM, VERY_HARD };
