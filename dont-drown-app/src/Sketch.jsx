import { ReactP5Wrapper } from "@p5-wrapper/react";
import { useEffect } from "react";
import { LEVEL, LOADING, MAIN_MENU } from "./p5_modules/constants";
import CrashDummy from "./p5_modules/crashdummy";
import { EASY, HARD, MEDIUM, VERY_HARD } from "./p5_modules/level";
import LevelBuilder from "./p5_modules/levelbuilder";
import LevelController from "./p5_modules/levelcontroller";
import Menu from "./p5_modules/menu";
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
        return [width, width / goldenRatio].map(x => Math.round(x));
    } else {
        return [height * goldenRatio, height].map(x => Math.round(x));
    }
}

/**
 * 
 * @param {p5} p5 
 * @returns [width, height]
 */
function canvasDimensions(p5) {
    const canvasScale = 1; // the proportion of the parent element to take up 
    const wrapper = p5.select('.react-p5-wrapper');
    const height = wrapper.height;
    const width = wrapper.width;
    return determineSizes(width, height).map(x => x * canvasScale);
}

function sketch(p5) {
    const background = 'mintcream';
    const centre = () => p5.createVector(p5.width / 2, p5.height / 2);
    const levels = [];

    var menu;
    var propped = undefined;
    var _gameState = LOADING;
    const gameState = () => _gameState;
    var sketcher, crashDummy, levelBuilder, levelController;

    function setGameState(newGameState) {
        switch (newGameState) {
            case MAIN_MENU:
                _gameState = MAIN_MENU;
                menu.show();
                break;
            default:
                menu.hide();
                _gameState = newGameState;
                break;
        }
    }

    p5.keyPressed = () => {
        if (p5.key == 'r' && gameState() == LEVEL) {
            levelController?.reset();
        } else if (p5.key == 'p') {
            if (levelController?.togglePause()) {
                setGameState(MAIN_MENU);
                menu.show();
            } else if (levelController.level !== undefined) {
                setGameState(LEVEL);
                menu?.hide();
            }
        } else if (p5.key == 'w') {
            levelController?.toggleWave();
        }
    }

    p5.setup = () => {
        // N.B. this can run twice, so don't manipulate the DOM here 
        const canvas = p5.createCanvas(...canvasDimensions(p5));
        sketcher = new Sketcher(p5);
        sketcher.lineBreaksMax = 2;
        sketcher.lineDeviationMult = 0.6;
        p5.noStroke();
        crashDummy = new CrashDummy(p5, sketcher, centre());
        p5.frameRate();
    };

    function gameSetup() {
        menu = new Menu(p5);
        const [jumpHeight, jumpFrames, jumpWidth] = crashDummy.jumpInfo;
        levelBuilder = new LevelBuilder(p5, sketcher, jumpHeight, jumpWidth);
        [EASY, MEDIUM, HARD, VERY_HARD].forEach(diff => levels.push(levelBuilder.buildLevel(diff)));
        menu.levels = levels;
        levelController = new LevelController(p5, sketcher, jumpHeight, completeLevel);
        setGameState(MAIN_MENU);
    }

    p5.updateWithProps = props => {
        if (props.propped) {
            propped = props.propped;
        }
    };

    function drawLoading() {
        p5.background(background);
        p5.push();
        p5.fill('black');
        p5.textAlign(p5.CENTER);
        p5.textSize(100);
        const centreVector = centre()
        p5.text(`Loading...`, centreVector.x, centreVector.y);
        p5.pop();

        crashDummy.run();
        crashDummy.draw();

        if (crashDummy.done) {
            gameSetup();
        }
    }

    function runLevel() {
        // drawing 
        levelController?.integrate();
        levelController?.draw();
    }

    function completeLevel() {
        levelController.level = undefined;
        setGameState(MAIN_MENU);
    }

    p5.draw = () => {
        /* React strict-mode calls useEffect twice, which means two 
         * canvases are sometimes generated. Seemingly when this happens 
         * the first canvas does not get passed props properly, so we can
         * use this to determine if a canvas needs deleting. */
        if (propped === undefined) { p5.remove(); return; };

        switch (gameState()) {
            case LOADING:
                drawLoading();
                break;
            case LEVEL:
                runLevel();
                break;
            case MAIN_MENU:
                menu.draw();
                break;
        }
    };

    p5.windowResized = () => {
        // p5.resizeCanvas(...canvasDimensions(p5));
        // // TODO resize increment 
        // mainMenu.resize();
    };

}

export default ({ p5Prop: p5Prop, setP5Prop }) => {

    useEffect(() => {
        setP5Prop(true);
    }, []);

    return (<ReactP5Wrapper sketch={sketch} propped={p5Prop} />);
};

export { canvasDimensions };

