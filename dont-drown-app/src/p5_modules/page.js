import { PC_DIAMETER_DIV } from "./playerball";

const MARGIN_DIV = 10;
const TOP_LINE_SPACE_DIV = 20; 

export default class Page {

    constructor(p5, height) {
        this.p5 = p5;
        this._marginX = p5.width / MARGIN_DIV;
        this._height = height; 
        this._topLineY = p5.height - height + p5.height / TOP_LINE_SPACE_DIV; // TODO make this match stress bar
        this._lineGap = p5.width / PC_DIAMETER_DIV; 
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
}