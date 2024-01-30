import { useState } from "react"
import BackButton from "./BackButton";
import MenuNavigator from "./MenuNavigator";
import { MAIN_MENU as IN_MENU } from './p5_modules/constants';

const MAIN = 100;
const LEVEL_SELECTOR = 101;
const INSTRUCTIONS = 102;
const CREDITS = 103;
const MENU_STATES = [MAIN, LEVEL_SELECTOR, INSTRUCTIONS, CREDITS];

const MENU_ID = "game-menu";
const TITLE_ID = "menu-title";

function lineGap() {
    console.warn("lineGap() is not implemented. TODO: add line gaps to top-level state");
    return 16;
}

function topLineGap() {
    console.warn("topLineGap() is not implemented. TODO: add line gaps to top-level state");
    return 80;
}

function LeftOfMargin({ marginX, menuHistory, goBack }) {
    return <div
        className="flex-col-cont"
        style={{ width: `${marginX}px`, height: `${topLineGap}px` }}
    >
        <BackButton
            menuHistory={menuHistory}
            goBack={goBack} />
    </div>
}

function Title({ }) {
    return <div className="flex-col-cont" style={{ height: `${topLineGap}px` }}>
        <h1
            id={TITLE_ID}
            className="centered-text menu-text">
            <u>Don't Drown</u>
        </h1>
    </div>
}

function MainMenu({ setCurrMenu }) {
    const navigators = [{
        id: 0,
        label: "Level selector",
        navigate: setCurrMenu(LEVEL_SELECTOR)
    }, {
        id: 1,
        label: "Instructions",
        navigate: setCurrMenu(INSTRUCTIONS)
    }, {
        id: 2,
        label: "Credits",
        navigate: setCurrMenu(CREDITS)
    }].map(props =>
        <MenuNavigator
            key={props.id}
            label={props.label}
            navigate={props.navigate}
            lineGap={lineGap()}
        />)

    return <div className="flex-col-cont">
        {navigators}
    </div>
}

export default Menu = ({ gameState, canvasDims, marginX }) => {
    const [currMenu, setCurrMenu] = useState(MAIN);
    const [menuHistory, setMenuHistory] = useState([]);

    const setCurrMenuWrapper = (newState) => {
        if (!MENU_STATES.includes(newState)) {
            console.error(`Unrecognised menu state ${newState}`)
        } else {
            setMenuHistory([...menuHistory, newState]);
            setCurrMenu(newState);
            // this.switchDisplayedMenu(); // TODO 
        }
    }

    const goBack = () => {
        // attempts to revert to the previous menu 
        const lastMenu = menuHistory.at(-1);
        if (lastMenu !== undefined) {
            setCurrMenu(lastMenu);
            setMenuHistory(menuHistory.slice(0, -1));
            // this.switchDisplayedMenu(); // TODO 
        }
    }


    let menu;
    switch (currMenu) {
        case MAIN:
        default:
            <MainMenu />
            break;
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
                        menuHistory={menuHistory}
                        goBack={goBack}
                    />
                    <RightOfMargin>
                        <Title />
                        {menu}
                    </RightOfMargin>
                </div>
            }
        </>)

}