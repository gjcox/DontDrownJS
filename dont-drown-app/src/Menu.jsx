import { useState } from "react";
import PropTypes from 'prop-types'; 

import LeftOfMargin from "./components/LeftOfMargin";
import RightOfMargin from "./components/RightOfMargin";
import { MAIN_MENU as IN_MENU } from './p5_modules/constants';

const MAIN = 100;
const LEVEL_SELECTOR = 101;
const INSTRUCTIONS = 102;
const CREDITS = 103;
const MENU_STATES = [MAIN, LEVEL_SELECTOR, INSTRUCTIONS, CREDITS];

const MENU_ID = "menu__root";
const RIGHT_ID = "menu__right-of-margin";
const TITLE_ID = "menu-title";

export function getFontSizeFromID(id) {
    const el = document.getElementById(id);
    const fontSize = parseInt(window.getComputedStyle(el).fontSize);
    return fontSize;
}

export default function Menu({ gameState, canvasDims, marginX,
    lineGap, setLineGap, topLineGap, setTopLineGap, getLevels, startLevel }) {
        Menu.propTypes = {
            gameState: PropTypes.number.isRequired,
            canvasDims: PropTypes.objectOf(PropTypes.number), 
            marginX: PropTypes.number.isRequired,
            lineGap: PropTypes.number.isRequired,
            setLineGap: PropTypes.func.isRequired,
            topLineGap: PropTypes.number.isRequired,
            setTopLineGap: PropTypes.func.isRequired,
            getLevels: PropTypes.func.isRequired,
            startLevel: PropTypes.func.isRequired
        };

    const [currMenu, setCurrMenu] = useState(MAIN);
    const [menuHistory, setMenuHistory] = useState([]);

    const setCurrMenuWrapper = (newState) => {
        /* Changes menu state, adding the previous menu to a history stack */
        if (!MENU_STATES.includes(newState)) {
            console.error(`Unrecognised menu state ${newState}`)
        } else {
            setMenuHistory([...menuHistory, currMenu]);
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
                    style={{ ...canvasDims }}
                >
                    <LeftOfMargin
                        marginX={marginX}
                        topLineGap={topLineGap}
                        menuHistory={menuHistory}
                        goBack={goBack}
                    />
                    <RightOfMargin
                        width={canvasDims.width - marginX}
                        currMenu={currMenu}
                        setCurrMenu={setCurrMenuWrapper}
                        lineGap={lineGap}
                        setLineGap={setLineGap}
                        topLineGap={topLineGap}
                        setTopLineGap={setTopLineGap}
                        getLevels={getLevels}
                        startLevel={startLevel}
                    />
                </div>
            }
        </>)

}

export { CREDITS, INSTRUCTIONS, LEVEL_SELECTOR, MAIN, RIGHT_ID, TITLE_ID };
