import PropTypes from 'prop-types';

import MenuNavigator from "../components/MenuNavigator";
import { INSTRUCTIONS, LEVEL_SELECTOR } from "../utils/constants";

export default function MainMenu({ setCurrMenu, lineGap }) {
    MainMenu.propTypes = {
        setCurrMenu: PropTypes.func.isRequired,
        lineGap: PropTypes.number.isRequired
    };

    const navigators = [{
        id: 0,
        label: "Level selector",
        navigate: () => setCurrMenu(LEVEL_SELECTOR)
    }, {
        id: 1,
        label: "Instructions",
        navigate: () => setCurrMenu(INSTRUCTIONS)
    }/*, {
        id: 2,
        label: "Credits",
        navigate: () => setCurrMenu(CREDITS)
    }*/].map(navigatorProps => <MenuNavigator
        key={navigatorProps.id}
        label={navigatorProps.label}
        navigate={navigatorProps.navigate}
        lineGap={lineGap} />);

    return <div className="menu__col-container">
        {navigators}
    </div>;
}
