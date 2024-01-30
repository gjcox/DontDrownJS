import { useState } from "react"
import { MAIN_MENU as IN_MENU } from './p5_modules/constants';
import LeftOfMargin from "./components/LeftOfMargin";
import RightOfMargin from "./components/RightOfMargin";

const MAIN = 100;
const LEVEL_SELECTOR = 101;
const INSTRUCTIONS = 102;
const CREDITS = 103;
const MENU_STATES = [MAIN, LEVEL_SELECTOR, INSTRUCTIONS, CREDITS];

const MENU_ID = "game-menu";
const RIGHT_ID = "right-of-margin";
const TITLE_ID = "menu-title";

export function getFontSizeFromID(id) {
    const el = document.getElementById(id);
    const fontSize = parseInt(window.getComputedStyle(el).fontSize);
    return fontSize;
}

export default function Menu({ gameState, canvasDims, marginX,
    lineGap, setLineGap, topLineGap, setTopLineGap }) {
    const [currMenu, setCurrMenu] = useState(MAIN);
    const [menuHistory, setMenuHistory] = useState([]);

    const setCurrMenuWrapper = (newState) => {
        /* Changes menu state, adding the previous menu to a history stack */
        if (!MENU_STATES.includes(newState)) {
            console.error(`Unrecognised menu state ${newState}`)
        } else {
            setMenuHistory([...menuHistory, newState]);
            setCurrMenu(newState);
        }
    }

    const goBack = () => {
        /* Attempt to return to the previous menu in the history stack */
        const lastMenu = menuHistory.at(-1);
        if (lastMenu !== undefined) {
            setCurrMenu(lastMenu);
            setMenuHistory(menuHistory.slice(0, -1));
        }
    }

    return (
        <>
            {gameState === IN_MENU &&
                <div
                    id={MENU_ID}
                    style={{ ...canvasDims, display: 'flex' }}
                >
                    <LeftOfMargin
                        marginX={marginX}
                        topLineGap={topLineGap}
                        menuHistory={menuHistory}
                        goBack={goBack}
                    />
                    <RightOfMargin
                        currMenu={currMenu}
                        setCurrMenu={setCurrMenuWrapper}
                        lineGap={lineGap}
                        setLineGap={setLineGap}
                        topLineGap={topLineGap}
                        setTopLineGap={setTopLineGap}
                    />
                </div>
            }
        </>)

}

export { MAIN, LEVEL_SELECTOR, INSTRUCTIONS, CREDITS, RIGHT_ID, TITLE_ID }; 