import { CompositeShape } from "./shapes";

const PF_WIDTH_DIV = 10; // relative to canvas width
const PF_HEIGHT_DIV = 40; // relative to canvas width
const PF_GROUND_THICKNESS_MULT = 3; // relative to sketcher.defLineWeight     

const PF_STROKE_COLOUR = 'limegreen';
const PF_FILL_COLOUR = 'chartreuse';

export default class Platform {
    constructor(p5, sketcher, pos, strokeColour = PF_STROKE_COLOUR, fillColour = PF_FILL_COLOUR) {
        this.p5 = p5;
        this._width = p5.width / PF_WIDTH_DIV;
        this._height = p5.width / PF_HEIGHT_DIV;
        this.strokeColour = strokeColour;
        this.fillColour = fillColour;
        this.sprite = this.buildSprite(sketcher);
        this._pos = pos;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get pos() {
        return this._pos;
    }

    set pos(newPos) {
        this._pos = newPos;
    }

    buildSprite(sketcher) {
        const sprite = new CompositeShape();
        const groundThickness = sketcher.defLineWeight * PF_GROUND_THICKNESS_MULT;
        const groundOverhang = groundThickness;
        const topBottomOverhang = groundOverhang + 0.1 * this.width;
        const trapezium = sketcher.buildSketchedQuad(
            this.strokeColour,
            this.fillColour,
            [
                this.p5.createVector(groundOverhang, groundThickness/2),
                this.p5.createVector(this.width - groundOverhang, groundThickness/2),
                this.p5.createVector(this.width - topBottomOverhang, this.height),
                this.p5.createVector(topBottomOverhang, this.height)
            ]
        );
        sprite.addShape(trapezium);
        const groundSurface = sketcher.buildSketchedLine(
            this.p5.createVector(this.width, groundThickness/2),
            this.p5.createVector(0, groundThickness/2),
            this.strokeColour,
            groundThickness
        )
        sprite.addShape(groundSurface);
        return sprite;
    }

    draw() {
        this.sprite.draw(this._pos);
    }
}