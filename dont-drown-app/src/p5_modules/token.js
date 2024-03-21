const TOKEN_DIAMETER_DIV = 25;
const TOKEN_BOUNCE_FRAMES = 30; // frames per bounce cycle 
const TOKEN_BOUNCE_DIV = 4; // fraction of token height

export default class Token {
    #p5;
    #diameter;
    #radius;
    #initPos;
    #pos;
    #oldPos;
    #bounceHeight;
    #bounceIncrement;
    #bounceFrameOffset;
    #bouncingDown = false;
    #collected = false;

    constructor(p5, pos) {
        this.#p5 = p5;
        this.#diameter = p5.width / TOKEN_DIAMETER_DIV;
        this.#radius = this.#diameter / 2;
        this.#initPos = pos.copy();
        this.#bounceHeight = this.#diameter / TOKEN_BOUNCE_DIV;
        this.#bounceIncrement = this.#bounceHeight / TOKEN_BOUNCE_FRAMES;
        this.#bounceFrameOffset = Math.round(p5.random(0, TOKEN_BOUNCE_FRAMES));
        this.reset();
    }

    get initPos() {
        return this.#initPos.copy(); 
    }

    set pos(newPos) {
        this.#pos = newPos.copy();
    }

    get pos() {
        return this.#pos.copy();
    }

    get oldPos() {
        return this.#oldPos.copy();
    }

    get radius() {
        return this.#radius;
    }

    static defaultDiameter(p5) {
        return p5.width / TOKEN_DIAMETER_DIV;
    }

    reset() {
        this.#pos = this.#initPos.copy();
        this.#oldPos = this.#initPos.copy();
        this.#collected = false;
        this.#bouncingDown = false;
        // restore the bounce offset
        this.#pos.add(0, this.#bounceFrameOffset * this.#bounceIncrement);
    }

    /**
     * Tokens bounce up and down in place. 
     */
    integrate() {
        this.#oldPos = this.#pos.copy();
        if (this.#collected) {
            return;
        }

        if ((this.#p5.frameCount + this.#bounceFrameOffset) %
            TOKEN_BOUNCE_FRAMES == 0) {
            this.#bouncingDown = !this.#bouncingDown;
        }

        if (this.#bouncingDown) {
            this.#pos.y += this.#bounceIncrement;
        } else {
            this.#pos.y -= this.#bounceIncrement;
        }
    }

    translate({ x = 0, y = 0 }) {
        // TODO test if this not changing oldPos affects collision detection 
        this.#pos.x += x;
        this.#pos.y += y;
    }

    onScreen() {
        return !this.#collected &&
            this.#pos.y - this.#radius <= this.#p5.height &&
            this.#pos.y >= -this.#radius;
    }
}