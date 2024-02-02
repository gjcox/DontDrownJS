import { useEffect } from "react";

import { INSTRUCTIONS, LEVEL_SELECTOR, MAIN, RIGHT_ID, getFontSizeFromID } from "../Menu";
import Instructions from "../menus/Instructions";
import LevelSelector from "../menus/LevelSelector";
import MainMenu from "../menus/MainMenu";
import Title from "./Title";

export default function RightOfMargin({ width, currMenu, setCurrMenu, lineGap, setLineGap,
    topLineGap, setTopLineGap, getLevels, startLevel }) {
    let menu;
    switch (currMenu) {
        case LEVEL_SELECTOR:
            menu = <LevelSelector
                getLevels={getLevels}
                startLevel={startLevel}
                lineGap={lineGap} />;
            break;
        case INSTRUCTIONS:
            menu = <Instructions
                lineGap={lineGap} />
            break;
        case MAIN:
        default:
            menu = <MainMenu
                setCurrMenu={setCurrMenu}
                lineGap={lineGap} />;
            break;
    }

    useEffect(() => {
        // set line gap based on font size 
        setLineGap(getFontSizeFromID(RIGHT_ID));
    }, []);

    return (<div
        id={RIGHT_ID}
        className="menu__col-container"
        style={{ width: width }}>
        <Title topLineGap={topLineGap} setTopLineGap={setTopLineGap} />
        {menu}
    </div>);
}
