import { ReactP5Wrapper } from "@p5-wrapper/react";
import { useEffect } from "react";

/**
 * Finds the maximum width and height of a canvas in a given window size such that width:height is 1.6:1. 
 * @param {*} width window size 
 * @param {*} height window height 
 * @returns the optimal [width, height] measurements 
 */
function determineSizes(width, height) {
    const goldenRatio = 1.6;
    let limitingFactor = width >= goldenRatio * height ? 'h' : 'w';
    if (limitingFactor == 'w') {
        return [width, width / goldenRatio];
    } else {
        return [height * goldenRatio, height];
    }
}

function sketch(p5) {
    var propped = undefined;
    var background = 250;

    const canvasScale = 0.8; // the proportion of the window to take up 
    const canvasDimensions = () => determineSizes(p5.windowWidth, p5.windowHeight).map(x => x * canvasScale);

    p5.setup = () => {
        p5.createCanvas(...canvasDimensions());
    };

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


    p5.windowResized = () => {
        p5.resizeCanvas(...canvasDimensions());
    };
}

export default ({ p5Prop: p5Prop, setP5Prop }) => {

    useEffect(() => {
        setP5Prop(true);
    }, []);

    return (<ReactP5Wrapper sketch={sketch} propped={p5Prop} />);
}; 