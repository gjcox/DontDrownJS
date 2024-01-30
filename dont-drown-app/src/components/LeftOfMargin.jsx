import BackButton from "./BackButton";

export default function LeftOfMargin({ marginX, topLineGap, menuHistory, goBack }) {
    return <div
        className="flex-col-cont"
        style={{ width: `${marginX}px`, height: `${topLineGap}px` }}
    >
        <BackButton
            menuHistory={menuHistory}
            goBack={goBack} />
    </div>;
}
