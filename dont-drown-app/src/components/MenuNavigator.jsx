import PropTypes from 'prop-types';

export default function MenuNavigator({ label, navigate, lineGap }) {
    MenuNavigator.propTypes = {
        label: PropTypes.string.isRequired, 
        navigate: PropTypes.func.isRequired, 
        lineGap: PropTypes.number.isRequired
    };

    return <button
        className="menu__text menu__button"
        style={{ marginTop: `${lineGap}px` }}
        onClick={() => navigate()}
    >
        {label}
    </button>
}