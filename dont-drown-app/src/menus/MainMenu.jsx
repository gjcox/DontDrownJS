import MenuNavigator from "../components/MenuNavigator";
import { LEVEL_SELECTOR, INSTRUCTIONS, CREDITS } from "../Menu";

export default function MainMenu({ setCurrMenu, lineGap }) {
    const navigators = [{
        id: 0,
        label: "Level selector",
        navigate: () => setCurrMenu(LEVEL_SELECTOR)
    }, {
        id: 1,
        label: "Instructions",
        navigate: () => setCurrMenu(INSTRUCTIONS)
    }, {
        id: 2,
        label: "Credits",
        navigate: () => setCurrMenu(CREDITS)
    }].map(props => <MenuNavigator
        key={props.id}
        label={props.label}
        navigate={props.navigate}
        lineGap={lineGap} />);

    return <div className="flex-col-cont">
        {navigators}
    </div>;
}
