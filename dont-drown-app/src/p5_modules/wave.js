const WAVE_FOAM_COLOUR = 'lightskyblue';
const WAVE_WATER_COLOUR = 'mediumblue';
const N_CRESTS = 12; 
const CREST_HEIGHT_DIV = 20; 
const DETAIL = 3; 

export default class Wave {
    constructor(p5, sketcher) {
        this.p5 = p5;
        this._width = p5.width;
        this._height = p5.width;
        this.sprite = sketcher.buildSketchedWave(
            WAVE_FOAM_COLOUR,
            WAVE_WATER_COLOUR,
            p5.width,
            p5.height,
            N_CRESTS,
            p5.width / CREST_HEIGHT_DIV,
            DETAIL,
            0
        );        
        this._pos = p5.createVector(0, p5.height);
    }

    get height() {
        return this._height; 
    }

    get pos() {
        return this._pos; 
    }

    /**
     * @param {p5.Vector} newPos
     */
    set pos(newPos) {
        this._pos = newPos; 
    }

    onScreen() {
        return this.pos.y <= this.p5.height;
    }

    draw() {
        if (this.onScreen()) {
            this.sprite.draw(this.pos);
        }
    }
}