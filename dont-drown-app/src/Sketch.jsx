import { ReactP5Wrapper } from "@p5-wrapper/react";
import { useEffect } from "react";
import Sketcher from "./p5_modules/sketcher";

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
    const canvasScale = 0.8; // the proportion of the window to take up 
    const canvasDimensions = () => determineSizes(p5.windowWidth, p5.windowHeight).map(x => x * canvasScale);
    const background = 250;
    
    var sketcher;
    var sketchedLine;
    var propped = undefined;

    p5.setup = () => {
        p5.createCanvas(...canvasDimensions());
        sketcher = new Sketcher(p5); 
        p5.noStroke(); 
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

        if (!sketchedLine || p5.frameCount % 30 == 0) {
            sketchedLine = sketcher.buildSketchedLine(
                p5.createVector(50, 100),
                p5.createVector(150, 200),
                'blue',
                20
                ); 
        }

        p5.background(background);
        p5.push();
        sketchedLine.draw(); 
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