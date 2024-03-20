import PropTypes from 'prop-types';

import MenuNavigator from "../components/MenuNavigator";
import { INSTRUCTIONS, LEVEL_SELECTOR, SETTINGS } from "../utils/constants";

export default function MainMenu({ setCurrMenu, lineGap }) {
    MainMenu.propTypes = {
        setCurrMenu: PropTypes.func.isRequired,
        lineGap: PropTypes.number.isRequired
    };

    const navigators = [{
        id: LEVEL_SELECTOR,
        label: "Level selector",
        navigate: () => setCurrMenu(LEVEL_SELECTOR)
    }, {
        id: INSTRUCTIONS,
        label: "Instructions",
        navigate: () => setCurrMenu(INSTRUCTIONS)
    }/*, {
        id: CREDITS,
        label: "Credits",
        navigate: () => setCurrMenu(CREDITS)
    }*/, {
        id: SETTINGS,
        label: "Settings",
        navigate: () => setCurrMenu(SETTINGS)
    }].map(navigatorProps => <MenuNavigator
        key={navigatorProps.id}
        label={navigatorProps.label}
        navigate={navigatorProps.navigate}
        lineGap={lineGap} />);

    return <div className="menu__col-container--padded">
        {navigators}
    </div>;
}
