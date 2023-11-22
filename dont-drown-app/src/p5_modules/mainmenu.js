import { marginX, renderPage, topLineGap } from "./page";

export default class MainMenu {

    static gameMenuID() {
        return 'game-menu';
    }

    static titleID() {
        return 'menu-title';
    }

    constructor(p5) {
        this.p5 = p5;
        this.root = p5.createDiv();
        this.root.id(MainMenu.gameMenuID());
        this.resize();
        this.addTitle();
        this.hide();
    }

    addTitle() {
        this.titleSlot = this.p5.createDiv();
        this.titleSlot.parent(this.root);
        this.titleSlot.id('title-slot');
        this.titleSlot.html(`<h1 id=${MainMenu.titleID()} class="centered-text menu-text"><u>Don't Drown</u></h1>`, true);
        this.titleSlot.style('height', `${topLineGap()}px`);
    }

    resize() {
        this.root.style('margin-left', `${marginX(this.p5)}px`)
        this.root.style('width', `${this.p5.width - marginX(this.p5)}px`);
        this.root.style('height', `${this.p5.height}px`);
    }

    show() {
        this.root.show();
    }

    hide() {
        this.root.hide();
    }

    draw() {
        renderPage(this.p5, 0);
    }
}