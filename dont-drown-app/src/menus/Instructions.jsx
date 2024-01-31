export default function Instructions({ lineGap }) {
    console.log(lineGap);
    function Line({ children }) {
        return <p className="menu__text menu__instruction" style={{ paddingTop: `${lineGap}px` }}>{children}</p>
    }

    const instructions = [
        "UP to jump when on a platform",
        "DOWN to fall through a platform",
        "LEFT and RIGHT to accelerate",
        "Esc or P to (un)pause",
        "",
        "Reach the top platform as fast as you can to complete the level",
        "If you get too close to the wave then you'll get stressed",
        "As stress rises, you horizontally speed up faster and slow down slower",
        "Keep far ahead of the wave to de-stress",
        "Collect tokens along the way for a sense of challenge",
        "Once per level you can briefly pause the wave with SPACEBAR, but once the unpauses it will briefly move faster to make up for it"
    ].map((txt, index) =>
        <div key={index}>
            {txt.length ? <Line>•  {txt}</Line> : <Line/>}
        </div>
    );
    return <div className="menu__col-container">
        {instructions}
    </div>
}