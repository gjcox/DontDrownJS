import PropTypes from 'prop-types';

export default function BackButton({ menuHistory, goBack }) {
    BackButton.propTypes = {
        menuHistory: PropTypes.arrayOf(PropTypes.number).isRequired,
        goBack: PropTypes.func.isRequired
    };

    return <button
        className="menu__text menu__button menu__back-button"
        style={{ display: menuHistory.length == 0 ? "none" : "flex" }}
        onClick={() => goBack()}
    >
        ←
    </button>
}