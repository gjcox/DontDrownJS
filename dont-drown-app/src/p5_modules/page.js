import { PC_DIAMETER_DIV } from "./playerball";
import { CompositeShape, Shape } from "./shapes";

const PAGE_COLOUR = 'lightgoldenrodyellow'; 
const LINE_COLOUR = 'gray'; 
const MARGIN_COLOUR = 'firebrick'; 
const MARGIN_DIV = 10;
const TOP_LINE_SPACE_DIV = 8;

export default class Page {

    constructor(p5, height) {
        this.p5 = p5;
        this._marginX = p5.width / MARGIN_DIV;
        this._height = height;
        this._topLineY = (p5.height / TOP_LINE_SPACE_DIV) + (p5.height - height); // TODO make this match stress bar
        this._lineGap = p5.width / PC_DIAMETER_DIV;
        this.generateLines(); 
    }

    get marginX() {
        return this._marginX;
    }

    get height() {
        return this._height;
    }

    get topLineY() {
        return this._topLineY;
    }

    get lineGap() {
        return this._lineGap;
    }

    get lines() {
        return this._lines; 
    }

    /*
     * Draws ruled lines as rectangles so that their weight is more easily 
     * customised, and they can be moved to pan/scroll the page.
     */
    drawLine(start, end, weight, colour) {
        const paddingDirection = start.copy().sub(end).rotate(this.p5.HALF_PI).normalize();

        const padding = paddingDirection.copy().mult(weight);

        const topLeft = start.copy().sub(padding);
        const topRight = end.copy().sub(padding);
        const bottomRight = end.copy();
        const bottomLeft = start.copy();

        const corners = [topLeft, topRight, bottomRight, bottomLeft];

        const line = new Shape(this.p5, colour);
        corners.forEach((v) => line.addVertex(v));
        return line;
    }


    /* Places the margin and uniformly spaced horizontal lines on the page */
    generateLines() {
        const LINE_WEIGHT = 1; 
        this._lines = new CompositeShape();

        // horizontal ruled lines
        for (let i = 0; i <= this.height / this.lineGap; i++) {
            let height = this.topLineY + i * this.lineGap;
            this._lines.addShape(
                this.drawLine(
                    this.p5.createVector(0, height),
                    this.p5.createVector(this.p5.width, height),
                    LINE_WEIGHT, LINE_COLOUR)
            );
        }

        // vertical margin 
        this._lines.addShape(this.drawLine(
            this.p5.createVector(this.marginX, this.p5.height),
            this.p5.createVector(this.marginX, this.p5.height - this.height), 
            LINE_WEIGHT, MARGIN_COLOUR));

    }

    draw(pos ) {
        this.p5.background(PAGE_COLOUR);
        this.lines.draw(pos); 
    }
}