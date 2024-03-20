import PropTypes from 'prop-types';

export default function MenuLine({ lineGap, children }) {
    MenuLine.propTypes = {
        lineGap: PropTypes.number.isRequired,
        children: PropTypes.arrayOf(PropTypes.elementType)
    };


    return <p className="menu__text menu__instruction" style={{ paddingTop: `${lineGap}px` }}>{children}</p>
}
