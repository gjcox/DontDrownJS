import { ReactP5Wrapper } from "@p5-wrapper/react";
import { useEffect } from "react";
import PlayerBall, { LEFT, REST, RIGHT } from "./p5_modules/playerball";
import Sketcher from "./p5_modules/sketcher";
import Platform from "./p5_modules/platform";
import { detectLanding } from "./p5_modules/physicsengine";
import CrashDummy from "./p5_modules/crashdummy";

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
    const canvasScale = 0.8; // the proportion of the window to take up 
    const canvasDimensions = () => determineSizes(p5.windowWidth, p5.windowHeight).map(x => x * canvasScale);
    const background = 'lightgoldenrodyellow';

    var centre;
    var sketcher;
    var pc;
    var crashDummy;
    const platforms = [];

    function handleKeyboardInput() {
        if ((p5.keyIsDown(p5.LEFT_ARROW) || p5.keyIsDown(65))
            && !(p5.keyIsDown(p5.RIGHT_ARROW) || p5.keyIsDown(68))) {
            pc.horizontalSteering = LEFT;
        } else if ((p5.keyIsDown(p5.RIGHT_ARROW) || p5.keyIsDown(68))
            && !(p5.keyIsDown(p5.LEFT_ARROW) || p5.keyIsDown(65))) {
            pc.horizontalSteering = RIGHT;
        } else {
            pc.horizontalSteering = REST;
        }

        if (pc.currentPlatform !== null) {
            if ((p5.keyIsDown(p5.UP_ARROW) || p5.keyIsDown(87))
                && !(p5.keyIsDown(p5.DOWN_ARROW) || p5.keyIsDown(83))) {
                pc.jump();
            } else if ((p5.keyIsDown(p5.DOWN_ARROW) || p5.keyIsDown(83))
                && !(p5.keyIsDown(p5.UP_ARROW) || p5.keyIsDown(87))) {
                pc.drop();
            }
        }
    }

    p5.keyPressed = () => {
        if (p5.keyCode == 32) { // spacebar
            pc = new PlayerBall(p5, sketcher, centre);
        }
    }

    function randomPlatforms(nPlatforms) {
        for (let i = 0; i < nPlatforms; i++) {
            platforms.push(new Platform(p5, sketcher,
                p5.createVector(
                    Math.random() * p5.width, Math.random() * p5.height
                )
            ));
        }
        platforms.sort((p1, p2) => p2.pos.y - p1.pos.y);
    }

    p5.setup = () => {
        p5.createCanvas(...canvasDimensions());
        centre = p5.createVector(p5.width / 2, p5.height / 2);
        sketcher = new Sketcher(p5);
        sketcher.lineBreaksMax = 2;
        sketcher.lineDeviationMult = 0.6;
        p5.noStroke();
        pc = new PlayerBall(p5, sketcher, centre);
        crashDummy = new CrashDummy(p5, sketcher, centre);
        platforms.push(new Platform(p5, sketcher, centre));
        randomPlatforms(10);
        p5.frameRate();
    };

    p5.updateWithProps = props => {
        if (props.propped) {
            propped = props.propped;
        }
    };

    function drawJumpRange() {
        p5.push();
        p5.stroke('black');
        p5.line(pc.pos.x, pc.pos.y, pc.pos.x, pc.pos.y - (crashDummy.jumpHeight * pc.increment()));
        p5.pop();
    }

    function drawDebugOverlay() {
        p5.push();
        p5.fill('black');
        p5.textAlign(p5.RIGHT);
        p5.textSize(100);
        p5.text(`${Math.round(pc.velocity.x)}, ${Math.round(pc.velocity.y)}`,
            p5.width / 10 * 9, p5.height / 10);
        p5.pop();
    }

    p5.draw = () => {
        /* React strict-mode calls useEffect twice, which means two 
         * canvases are sometimes generated. Seemingly when this happens 
         * the first canvas does not get passed props properly, so we can
         * use this to determine if a canvas needs deleting. */
        if (propped === undefined) { p5.remove(); return; };

        handleKeyboardInput();

        // physics calculations 
        pc.integrate();
        crashDummy.run();
        detectLanding(pc, platforms);

        // drawing 
        p5.background(background);
        platforms.forEach(p => p.draw());
        pc.draw();
        drawJumpRange();
        crashDummy.draw();
    };

    p5.windowResized = () => {
        p5.resizeCanvas(...canvasDimensions());
        // TODO resize increment 
    };

}

export default ({ p5Prop: p5Prop, setP5Prop }) => {

    useEffect(() => {
        setP5Prop(true);
    }, []);

    return (<ReactP5Wrapper sketch={sketch} propped={p5Prop} />);
}; 