import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from "react";

import LeftOfMargin from "./components/LeftOfMargin";
import RightOfMargin from "./components/RightOfMargin";
import { IN_MENU, LARGE_FONT, MAIN, MEDIUM_FONT, MENU_ID, MENU_STATES, SMALL_FONT } from './utils/constants';
import { getScrollbarWidth } from './utils/functions';

export default function Menu({ gameState, canvasDims, marginX,
    lineGap, setLineGap, topLineGap, getLevels, startLevel, setMenuScrollOffset }) {
    Menu.propTypes = {
        gameState: PropTypes.number.isRequired,
        canvasDims: PropTypes.objectOf(PropTypes.number),
        marginX: PropTypes.number.isRequired,
        lineGap: PropTypes.number.isRequired,
        setLineGap: PropTypes.func.isRequired,
        topLineGap: PropTypes.number.isRequired,
        getLevels: PropTypes.func.isRequired,
        startLevel: PropTypes.func.isRequired,
        setMenuScrollOffset: PropTypes.func.isRequired
    };

    const scrollRef = useRef(null);
    const scrollBarWidth = getScrollbarWidth();
    const handleScroll = () => {
        // Scrolling down raises the virtual top of the page 
        setMenuScrollOffset(-scrollRef.current.scrollTop);
    };


    const [currMenu, setCurrMenu] = useState(MAIN);
    const [menuHistory, setMenuHistory] = useState([]);
    const [fontStyle, setFontStyle] = useState();

    useEffect(() => {
        switch (lineGap) {
            case SMALL_FONT:
                setFontStyle('menu-font--small');
                break;
            case MEDIUM_FONT:
                setFontStyle('menu-font--medium');
                break;
            case LARGE_FONT:
                setFontStyle('menu-font--large');
                break;
        }
    }, [lineGap]);

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
                    className={fontStyle}
                >
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className={`menu__scroll-pane`}
                    >
                        <LeftOfMargin
                            marginX={marginX}
                            topLineGap={topLineGap}
                            menuHistory={menuHistory}
                            goBack={goBack}
                        />
                        <RightOfMargin
                            width={canvasDims.width - marginX - scrollBarWidth}
                            currMenu={currMenu}
                            setCurrMenu={setCurrMenuWrapper}
                            lineGap={lineGap}
                            setLineGap={setLineGap}
                            topLineGap={topLineGap}
                            getLevels={getLevels}
                            startLevel={startLevel}
                        />
                    </div>
                </div>
            }
        </>)

}

