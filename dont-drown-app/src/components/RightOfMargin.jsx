import { useEffect } from "react";
import Title from "./Title";
import MainMenu from "../menus/MainMenu";
import { MAIN, getFontSizeFromID, RIGHT_ID } from "./Menu";

export default function RightOfMargin({ currMenu, setCurrMenu, lineGap, setLineGap, topLineGap, setTopLineGap }) {
    let menu;
    switch (currMenu) {
        case MAIN:
        default:
            menu = <MainMenu setCurrMenu={setCurrMenu} lineGap={lineGap} />;
            break;
    }

    useEffect(() => {
        // set line gap based on font size 
        setLineGap(getFontSizeFromID(RIGHT_ID));
    }, []);

    return (<div
        id={RIGHT_ID}
        className="flex-col-cont"
        style={{ display: 'flex', flex: '1 0 auto' }}>
        <Title topLineGap={topLineGap} setTopLineGap={setTopLineGap} />
        {menu}
    </div>);
}
