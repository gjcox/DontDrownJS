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
const CANVAS_ID = "defaultCanvas0";

/* Sketch sizing */
const CREST_HEIGHT_DIV = 50;
const MARGIN_DIV = 10;

/* Font sizing */
const SMALL_FONT = 16; // px
const MEDIUM_FONT = 24; // px
const LARGE_FONT = 32; // px 
const H1_FONT = 2.5; // em 
const TOP_LINE_MULT = 1.5; // * H1 font size = top line gap 

/* Movement codes */
const REST = 0;
const LEFT = -1;
const RIGHT = 1;

export {
    LOADING, MID_LEVEL, IN_MENU,
    MAIN, LEVEL_SELECTOR, INSTRUCTIONS, CREDITS, MENU_STATES,
    MENU_ID, RIGHT_ID, TITLE_ID, CANVAS_ID,
    CREST_HEIGHT_DIV, MARGIN_DIV,
    SMALL_FONT, MEDIUM_FONT, LARGE_FONT, H1_FONT, TOP_LINE_MULT,
    REST, LEFT, RIGHT,
};

