import MenuNavigator from "../components/MenuNavigator";

export default function LevelSelector({ getLevels, startLevel, lineGap }) {
    const levelButtons = getLevels().map((level, index) => <MenuNavigator
        key={index}
        label={level.difficulty.string}
        navigate={() => startLevel(level)}
        lineGap={lineGap} />);

    return <div className="flex-col-cont">
        {levelButtons}
    </div>;
}