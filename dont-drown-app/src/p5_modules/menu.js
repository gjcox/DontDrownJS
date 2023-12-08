import { lineGap, renderPage, topLineGap } from "./page";

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
        button.class('menu-text menu-item-button');
        button.style('margin-bottom', `${lineGap()}px`);
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
        this._menuState = MAIN;
        this._menuHistory = [];
        this.addLeftOfMargin();
        this.addRightOfMargin();
        this.setSize();
        this.hide();
    }

    get menuState() {
        return this._menuState;
    }

    set menuState(newState) {
        if (!MENU_STATES.includes(newState)) {
            console.error(`Unrecognised menu state ${newState} in set menuState()`)
        } else {
            this.pushMenu(this.menuState);
            this._menuState = newState;
            this.switchDisplayedMenu();
        }
    }

    clearMenuHistory() {
        this._menuHistory.length = 0;
    }

    pushMenu(state) {
        if (!MENU_STATES.includes(state)) {
            console.error(`Unrecognised menu state ${state} in pushMenu()`)
        } else {
            this._menuHistory.push(state);
        }
    }

    popMenu() {
        return this._menuHistory.pop();
    }

    addLeftOfMargin() {
        this.leftOfMargin = this.p5.createDiv();
        this.leftOfMargin.id('leftOfMargin');
        this.leftOfMargin.parent(this.root);

        this.leftOfMarginTopSlot = this.p5.createDiv();
        this.leftOfMarginTopSlot.class('flex-col-cont');
        this.leftOfMarginTopSlot.parent(this.leftOfMargin);

        const backButton = this.p5.createButton('← BACK');
        backButton.class('menu-text menu-item-button');
        backButton.mouseClicked(() => this.revertMenuState());
        backButton.parent(this.leftOfMarginTopSlot);
    }

    addRightOfMargin() {
        this.rightOfMargin = this.p5.createDiv();
        this.rightOfMargin.id('rightOfMargin');
        this.rightOfMargin.style('flex', '1 0 auto'); // grows to fill space
        this.rightOfMargin.class('flex-col-cont');
        this.rightOfMargin.parent(this.root);

        this.addTitle();
        this.addMenuItemContainer();
        this.addMainMenu();
        this.addLevelSelector();
    }

    revertMenuState() {
        const lastMenu = this.popMenu();
        if (lastMenu !== undefined) {
            this._menuState = lastMenu;
            this.switchDisplayedMenu();
        }
    }

    /**
     * @param {Level[]} levelArr 
     * @param {*} startLevel 
     */
    setLevels(levelArr, startLevel) {
        let levelSelector = this.menus.get(LEVEL_SELECTOR);
        levelArr.forEach(level => {
            const button = this.p5.createButton(level.difficulty.string);
            button.class('menu-text menu-item-button');
            button.style('margin-bottom', `${lineGap()}px`);
            button.mouseClicked(() => startLevel(level));
            button.parent(levelSelector);
        });
    }

    addTitle() {
        this.rightOfMarginTopSlot = this.p5.createDiv();
        this.rightOfMarginTopSlot.parent(this.rightOfMargin);
        this.rightOfMarginTopSlot.id('title-slot');
        this.rightOfMarginTopSlot.class('flex-col-cont');
        this.rightOfMarginTopSlot.html(`<h1 id=${Menu.titleID()} class="centered-text menu-text"><u>Don't Drown</u></h1>`, true);
    }

    addMenuItemContainer() {
        this.menuItemContainer = this.p5.createDiv();
        this.menuItemContainer.parent(this.rightOfMargin);
        this.menuItemContainer.id('menuItemCont');
        this.menuItemContainer.style('column-gap', `${lineGap()}px`);
        this.menuItemContainer.style('margin-top', `${lineGap()}px`);
    }

    addMainMenu() {
        this.menus.set(MAIN, this.p5.createDiv());
        let mainMenu = this.menus.get(MAIN);
        mainMenu.class('flex-col-cont');
        const mainMenuItems = [
            new Navigator('Level selector', 'lvl-select', LEVEL_SELECTOR),
            new Navigator('Instructions', 'instructions', INSTRUCTIONS),
            new Navigator('Credits', 'credits', CREDITS)
        ];
        mainMenuItems.forEach(navigator => {
            const button = navigator.toButton(this.p5, x => this.menuState = x);
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

    setMarginX(marginX) {
        this.leftOfMargin.style('width', `${marginX}px`);
    }

    setSize() {
        this.root.style('width', `${this.p5.width}px`);
        this.root.style('height', `${this.p5.height}px`);
        this.leftOfMarginTopSlot.style('height', `${topLineGap()}px`);
        this.rightOfMarginTopSlot.style('height', `${topLineGap()}px`);
    }

    switchDisplayedMenu() {
        for (const [key, menu] of this.menus) {
            if (key !== this.menuState) {
                menu.style('display', 'none');
            } else {
                menu.style('display', 'flex');
            }
        }
    }

    show(state = MAIN) {
        this.root.style('display', 'flex');
        this.menuState = state;
        this.switchDisplayedMenu();
        this.clearMenuHistory();
    }

    hide() {
        this.root.style('display', 'none');
        this.clearMenuHistory();
    }

}