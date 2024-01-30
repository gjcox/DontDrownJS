export default function ({ label, navigate, lineGap }) {
    return <button
        className="menu-text menu-item-button"
        style={{ marginBottom: `${lineGap}px` }}
        onClick={() => navigate()}
    >
        {label}
    </button>
}