import BackButton from "./BackButton";

export default function LeftOfMargin({ marginX, topLineGap, menuHistory, goBack }) {
    return <div
        className="menu__col-container"
        style={{ width: `${marginX}px`, height: `${topLineGap}px` }}
    >
        <BackButton
            menuHistory={menuHistory}
            goBack={goBack} />
    </div>;
}
