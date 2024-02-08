const WAVE_FOAM_COLOUR = 'lightskyblue';
const WAVE_WATER_COLOUR = 'mediumblue';
const N_CRESTS = 12;
const CREST_HEIGHT_DIV = 50;
const DETAIL = 5;

export default class Wave {
    #p5;
    #height;
    #crestHeight;
    #sprite;
    #pos;

    constructor(p5, sketcher) {
        this.#p5 = p5;
        this.#height = p5.width;
        this.#crestHeight = p5.height / CREST_HEIGHT_DIV;
        const foamWeight = sketcher.defLineWeight * 3;
        this.#sprite = sketcher.buildSketchedWave(
            WAVE_FOAM_COLOUR,
            WAVE_WATER_COLOUR,
            p5.width,
            p5.height,
            N_CRESTS,
            this.#crestHeight,
            DETAIL,
            0,
            foamWeight
        );
        this.#pos = p5.createVector(0, p5.height);
    }

    get height() {
        return this.#height;
    }

    get pos() {
        return this.#pos.copy();
    }

    /**
     * @param {p5.Vector} newPos
     */
    set pos(newPos) {
        this.#pos = newPos.copy();
    }

    translate({ x, y }) {
        if (x) this.#pos.x += x;
        if (y) this.#pos.y += y;
    }

    onScreen() {
        return this.#pos.y - this.#crestHeight <= this.#p5.height;
    }

    draw() {
        if (this.onScreen()) {
            this.#sprite.draw(this.#pos);
        }
    }
}