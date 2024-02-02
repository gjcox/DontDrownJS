import PropTypes from 'prop-types';

import MenuNavigator from "../components/MenuNavigator";

export default function LevelSelector({ getLevels, startLevel, lineGap }) {
    LevelSelector.propTypes = {
        getLevels: PropTypes.func.isRequired, 
        startLevel: PropTypes.func.isRequired, 
        lineGap: PropTypes.number.isRequired
    };
  
    const levelButtons = getLevels().map((level, index) => <MenuNavigator
        key={index}
        label={level.difficulty.string}
        navigate={() => startLevel(level)}
        lineGap={lineGap} />);

    return <div className="menu__col-container">
        {levelButtons}
    </div>;
}