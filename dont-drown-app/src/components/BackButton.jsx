export default function ({ menuHistory, goBack }) {
    return <button
        className="menu-text menu-item-button"
        style={{display: menuHistory.length == 0 ? "none" : "flex"}}
        onClick={() => goBack()}
    >
        ← BACK
    </button>
}