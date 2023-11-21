import { canvasDimensions } from "../Sketch";
import Page, {LINE_WEIGHT} from "./page";

export default class MainMenu {
    constructor(p5) {
        this.p5 = p5;
        this.root = p5.createDiv();
        this.root.id('game-menu');
        this.page = new Page(p5, p5.height);
        this.resize();
        this.addTitle();
        this.hide();
    }

    addTitle() {
        this.titleSlot = this.p5.createDiv(); 
        this.titleSlot.parent(this.root); 
        this.titleSlot.id('title-slot')
        this.titleSlot.style('height', `${this.page.topLineY + 2*LINE_WEIGHT}px`); 
        const title = "menu-title";
        this.titleSlot.html(`<h1 id=${title} class="centered-text menu-text"><u>Don't Drown</u></h1>`, true);
    }

    resize() {
        const [width, height] = canvasDimensions(this.p5);
        this.root.style('margin-left', `${this.page.marginX}px`)
        this.root.style('width', `${width - this.page.marginX}px`);
        this.root.style('height', `${height}px`);
        this.page = new Page(this.p5, this.p5.height);
    }

    show() {
        this.root.show();
    }

    hide() {
        this.root.hide();
    }

    draw() {
        this.page.draw();
    }
}