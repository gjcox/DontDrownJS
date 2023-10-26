import { ReactP5Wrapper } from "@p5-wrapper/react";
import { useEffect } from "react";

function sketch(p5) {
    var propped = undefined;
    var background = 250;

    p5.setup = () => p5.createCanvas(600, 400);

    p5.updateWithProps = props => {
        if (props.propped) {
            propped = props.propped;
        }
    };

    p5.draw = () => {
        /* React strict-mode calls useEffect twice, which means two 
         * canvases are sometimes generated. Seemingly when this happens 
         * the first canvas does not get passed props properly, so we can
         * use this to determine if a canvas needs deleting. */
        if (propped === undefined) { p5.remove(); return; };

        p5.background(background);
        p5.push();
        p5.text(propped, 50, 50);
        p5.pop();
    };

}

export default ({ p5Prop: p5Prop, setP5Prop }) => {

    useEffect(() => {
        setP5Prop(true);
    }, []);

    return (<ReactP5Wrapper sketch={sketch} propped={p5Prop} />);
}; 