import { CREST_HEIGHT_DIV } from "../utils/constants";

export default class Wave {
    #p5;
    #height;
    #crestHeight;
    #pos;

    constructor(p5) {
        this.#p5 = p5;
        this.#height = p5.width;
        this.#crestHeight = p5.height / CREST_HEIGHT_DIV;
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

}