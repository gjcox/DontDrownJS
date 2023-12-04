import { lineGap, marginX, renderPage, topLineGap } from "./page";

const MAIN = 1;
const LEVEL_SELECTOR = 101;
const INSTRUCTIONS = 102;
const CREDITS = 103;
const MENU_STATES = [MAIN, LEVEL_SELECTOR, INSTRUCTIONS, CREDITS];

class Navigator {
    constructor(label, id, navigateTo) {
        this.label = label;
        this.id = id;
        this.navigateTo = navigateTo;
        Object.freeze(this);
    }

    toButton(p5, setState) {
        const button = p5.createButton(this.label);
        button.id(this.id);
        button.class("menu-text menu-item-button");
        button.style("margin-bottom", `${lineGap()}px`);
        button.mouseClicked(() => setState(this.navigateTo));
        return button;
    }
}

export default class Menu {

    static gameMenuID() {
        return 'game-menu';
    }

    static titleID() {
        return 'menu-title';
    }

    constructor(p5) {
        this.p5 = p5;
        this.root = p5.createDiv();
        this.root.id(Menu.gameMenuID());
        this.menus = new Map();
        this.setSize();
        this.addTitle();
        this.addMenuItemContainer();
        this.addMainMenu();
        this.addLevelSelector();
        this._menuState = MAIN;
        this.hide();
    }

    get menuState() {
        return this._menuState;
    }

    set menuState(newState) {
        if (!MENU_STATES.includes(newState)) {
            console.error(`Unrecognised menu state ${newState}`)
        } else {
            this._menuState = newState;
            this.switchMenu(); 
        }
    }

    /**
     * @param {Level[]} levelArr 
     */
    set levels(levelArr) {
        let levelSelector = this.menus.get(LEVEL_SELECTOR);
        levelArr.forEach(level => {
            levelSelector.html(`<button class="menu-text menu-item-button" style="margin-bottom:${lineGap()}px">${level.difficulty.string}</button>`, true);
        });
    }

    addTitle() {
        this.titleSlot = this.p5.createDiv();
        this.titleSlot.parent(this.root);
        this.titleSlot.id('title-slot');
        this.titleSlot.class('flex-col-cont');
        this.titleSlot.html(`<h1 id=${Menu.titleID()} class="centered-text menu-text"><u>Don't Drown</u></h1>`, true);
        this.titleSlot.style('height', `${topLineGap()}px`);
    }

    addMenuItemContainer() {
        this.menuItemContainer = this.p5.createDiv();
        this.menuItemContainer.parent(this.root);
        this.menuItemContainer.id('menuItemCont');
        this.menuItemContainer.style('column-gap', `${lineGap()}px`);
        this.menuItemContainer.style('margin-top', `${lineGap()}px`);
    }

    addMainMenu() {
        this.menus.set(MAIN, this.p5.createDiv());
        let mainMenu = this.menus.get(MAIN);
        mainMenu.class('flex-col-cont');
        const mainMenuItems = [
            new Navigator("Level selector", "lvl-select", LEVEL_SELECTOR), 
            new Navigator("Instructions", "instructions", INSTRUCTIONS), 
            new Navigator("Credits", "credits", CREDITS) 
        ]
        mainMenuItems.forEach(navigator => {
            const button = navigator.toButton(this.p5, x => {this.menuState = x; console.log(x)}); 
            button.parent(mainMenu); 
        })
        mainMenu.parent(this.menuItemContainer);
    }

    addLevelSelector() {
        this.menus.set(LEVEL_SELECTOR, this.p5.createDiv());
        let levelSelector = this.menus.get(LEVEL_SELECTOR);
        levelSelector.class('flex-col-cont');
        levelSelector.parent(this.menuItemContainer);
    }

    setSize() {
        this.root.style('margin-left', `${marginX(this.p5)}px`)
        this.root.style('width', `${this.p5.width - marginX(this.p5)}px`);
        this.root.style('height', `${this.p5.height}px`);
    }

    switchMenu() {
        for (const [key, menu] of this.menus) {
            if (key !== this.menuState) {
                menu.style("display", "none");
            } else {
                menu.style("display", "flex");
            }
        }
    }

    show() {
        this.root.show();
        this.switchMenu(); 
    }

    hide() {
        this.root.hide();
    }

    draw() {
        renderPage(this.p5, 0);
    }
}