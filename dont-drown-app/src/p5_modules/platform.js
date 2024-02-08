
export default class Platform {
    static #PF_WIDTH_DIV = 10; // relative to canvas width
    static #PF_HEIGHT_DIV = 40; // relative to canvas width

    static get widthDiv() {
        return Platform.#PF_WIDTH_DIV;
    }

    static defaultWidth(p5) {
        return p5.width / Platform.#PF_WIDTH_DIV;
    }

    static get heightDiv() {
        return Platform.#PF_HEIGHT_DIV;
    }

    static defaultHeight(p5) {
        return p5.width / Platform.#PF_HEIGHT_DIV;
    }

    #p5;
    #width;
    #height;
    #pos;
    #initPos;

    constructor(p5, pos) {
        this.#p5 = p5;
        this.#width = Platform.defaultWidth(p5);
        this.#height = Platform.defaultHeight(p5);
        this.#pos = pos.copy();
        this.#initPos = pos.copy();
    }

    get width() {
        return this.#width;
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

    get initPos() {
        return this.#initPos.copy();
    }

    get middle() {
        return this.#pos.copy().add(this.#width / 2, 0);
    }

    translate(v) {
        this.#pos.add(v);
    }

    onScreen() {
        return this.#pos.y <= this.#p5.height && this.#pos.y >= this.#height;
    }

    draw() {
        if (this.onScreen()) {
            this.sprite.draw(this.#pos);
        }
    }
}
