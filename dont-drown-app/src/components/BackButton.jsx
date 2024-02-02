export default function BackButton({ menuHistory, goBack }) {
    return <button
        className="menu__text menu__button menu__back-button"
        style={{display: menuHistory.length == 0 ? "none" : "flex"}}
        onClick={() => goBack()}
    >
        ← BACK
    </button>
}