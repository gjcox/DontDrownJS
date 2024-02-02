import PropTypes from 'prop-types';

import BackButton from "./BackButton";

export default function LeftOfMargin({ marginX, topLineGap, menuHistory, goBack }) {
    LeftOfMargin.propTypes = {
        marginX: PropTypes.number.isRequired,
        topLineGap: PropTypes.number.isRequired,
        menuHistory: PropTypes.arrayOf(PropTypes.number).isRequired,
        goBack: PropTypes.func.isRequired
    };
    
    return <div
        className="menu__col-container"
        style={{ width: `${marginX}px`, height: `${topLineGap}px` }}
    >
        <BackButton
            menuHistory={menuHistory}
            goBack={goBack} />
    </div>;
}
