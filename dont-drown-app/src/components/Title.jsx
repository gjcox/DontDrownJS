import PropTypes from 'prop-types';

import { TITLE_ID } from "../utils/constants";

export default function Title({ topLineGap }) {
    Title.propTypes = {
        topLineGap: PropTypes.number.isRequired,
    };

    return <div className="menu__col-container" style={{ height: `${topLineGap}px` }}>
        <h1
            id={TITLE_ID}
            className="menu__title menu__text">
            <u>Don&apos;t Drown</u>
        </h1>
    </div>;
} 
