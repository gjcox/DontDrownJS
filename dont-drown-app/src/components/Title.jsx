import { useEffect } from "react";
import { getFontSizeFromID, TITLE_ID } from "../Menu";

const TOP_LINE_MULT = 1.5; // top line is x * title font size 

export default function Title({ topLineGap, setTopLineGap }) {

    useEffect(() => {
        // set top line gap based on title font size 
        setTopLineGap(getFontSizeFromID(TITLE_ID) * TOP_LINE_MULT);
    }, []);

    return <div className="flex-col-cont" style={{ height: `${topLineGap}px` }}>
        <h1
            id={TITLE_ID}
            className="centered-text menu-text">
            <u>Don't Drown</u>
        </h1>
    </div>;
} 
