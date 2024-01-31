export default function ({ label, navigate, lineGap }) {
    return <button
        className="menu__text menu__button"
        style={{ marginTop: `${lineGap}px` }}
        onClick={() => navigate()}
    >
        {label}
    </button>
}