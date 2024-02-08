/* Game state codes */
const LOADING = 101; 
const MID_LEVEL = 102; 
const IN_MENU = 103; 

/* Menu codes */ 
const MAIN = 100;
const LEVEL_SELECTOR = 101;
const INSTRUCTIONS = 102;
const CREDITS = 103;
const MENU_STATES = [MAIN, LEVEL_SELECTOR, INSTRUCTIONS, CREDITS];

/* DOM element IDs */ 
const MENU_ID = "menu__root";
const RIGHT_ID = "menu__right-of-margin";
const TITLE_ID = "menu-title";

export { 
    LOADING, MID_LEVEL, IN_MENU, 
    MAIN, LEVEL_SELECTOR, INSTRUCTIONS, CREDITS, MENU_STATES, 
    MENU_ID, RIGHT_ID, TITLE_ID, 
 };