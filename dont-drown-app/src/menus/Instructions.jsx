import PropTypes from 'prop-types';

import MenuLine from '../components/MenuLine';

export default function Instructions({ lineGap }) {
    Instructions.propTypes = {
        lineGap: PropTypes.number.isRequired
    };

    const instructions = [
        "UP to jump when on a platform",
        "DOWN to fall through a platform",
        "LEFT and RIGHT to accelerate",
        "Esc or P to (un)pause",
        "",
        "Reach the top platform as fast as you can to complete the level",
        "If you get too close to the wave then you'll get stressed",
        "As stress rises, you horizontally speed up faster and slow down slower",
        "Keep far ahead of the wave to de-stress",
        "Collect tokens along the way for a sense of challenge",
        "Once per level you can briefly pause the wave with SPACEBAR, but once the unpauses it will briefly move faster to make up for it"
    ].map((txt, index) =>
        <div key={index}>
            {txt.length ? <MenuLine lineGap={lineGap}>•  {txt}</MenuLine> : <MenuLine lineGap={lineGap} />}
        </div>
    );
    return (
        <div className="menu__col-container--padded">
            {instructions}
        </div>
    );
}