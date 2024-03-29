import { LEFT, REST, RIGHT } from "../utils/constants";
import { detectEdgeCollision, detectLanding, detectTokenCollection, increment } from "./physicsengine";
import Platform from "./platform";
import PlayerBall, { PC_DIAMETER_DIV } from "./playerball";
import SpriteManager from "./sprites";
import StressTracker from "./stresstracker";
import Token from "./token";
import Wave from "./wave";

const PAN_RATE_DIV = PC_DIAMETER_DIV * 10;
const UP = -1;
const NEITHER = 0;
const DOWN = 1;

export default class LevelController {
    #p5;
    #pc;
    #level;
    #wave;
    #panning;
    #waveMoving;
    #panRate;
    #jumpHeight;
    #paused;
    #stressIndex;
    #stressTracker;
    #completeLevel;
    #spriteManager;

    constructor(p5, sketcher, jumpHeight) {
        this.#p5 = p5;
        this.#pc = new PlayerBall(p5);
        this.#wave = new Wave(p5, sketcher);
        this.#panning = NEITHER;
        this.#panRate = p5.width / PAN_RATE_DIV;
        this.#jumpHeight = jumpHeight * increment(p5);
        this.#paused = false;
        this.#stressIndex;
        this.#stressTracker = new StressTracker(value => this.stressIndex = value, jumpHeight * 1.5);
        this.#spriteManager = new SpriteManager(p5, sketcher,
            this.#pc.diameter,
            Platform.defaultWidth(p5), Platform.defaultHeight(p5),
            Token.defaultDiameter(p5)
        );
    }

    /**
     * @param {number} value
     */
    set stressIndex(value) {
        this.#stressIndex = Math.round(value);
    }

    get level() {
        return this.#level;
    }

    /**
     * @param {Level} level
     */
    set level(level) {
        this.#level = level;
        this.reset();
    }

    toggleWave() {
        this.#waveMoving = !this.#waveMoving;
    }

    handleKeyboardInput() {
        if ((this.#p5.keyIsDown(this.#p5.LEFT_ARROW) || this.#p5.keyIsDown(65))
            && !(this.#p5.keyIsDown(this.#p5.RIGHT_ARROW) || this.#p5.keyIsDown(68))) {
            this.#pc.horizontalSteering = LEFT;
        } else if ((this.#p5.keyIsDown(this.#p5.RIGHT_ARROW) || this.#p5.keyIsDown(68))
            && !(this.#p5.keyIsDown(this.#p5.LEFT_ARROW) || this.#p5.keyIsDown(65))) {
            this.#pc.horizontalSteering = RIGHT;
        } else {
            this.#pc.horizontalSteering = REST;
        }

        if (this.#pc.currentPlatform !== null) {
            if ((this.#p5.keyIsDown(this.#p5.UP_ARROW) || this.#p5.keyIsDown(87))
                && !(this.#p5.keyIsDown(this.#p5.DOWN_ARROW) || this.#p5.keyIsDown(83))) {
                this.#pc.jump();
            } else if ((this.#p5.keyIsDown(this.#p5.DOWN_ARROW) || this.#p5.keyIsDown(83))
                && !(this.#p5.keyIsDown(this.#p5.UP_ARROW) || this.#p5.keyIsDown(87))) {
                this.#pc.drop();
            }
        }
    }

    reset() {
        this.#panning = NEITHER;
        this.level.reset();
        // this.#pc.pos = this.level.platforms[this.level.platforms.length - 1].middle;
        // this.#pc.land(this.level.platforms[this.level.platforms.length - 1]);    
        this.#pc.pos = this.level.platforms[0].middle;
        this.#pc.land(this.level.platforms[0]);
        this.#pc.resetVelocity();
        this.#wave.pos = this.#p5.createVector(0, this.#p5.height);
        this.#paused = false;
        this.#waveMoving = true;
        this.#stressTracker.reset();
        this.#spriteManager.reset();
    }

    togglePause() {
        this.#paused = !this.#paused;
        return this.#paused;
    }

    /**
      * Pan level if needed and call physics engine methods. 
      */
    integrate(marginX) {
        if (!this.#paused) {
            this.handleKeyboardInput();

            this.panWrapper();

            this.#pc.integrate(marginX);
            if (this.#waveMoving) {
                this.#wave.translate({ y: -this.level.waveRiseRate });
            }
            this.#level.tokens.forEach(t => t.integrate());

            // stress management
            this.#stressTracker.updateStress(Math.abs(this.#pc.pos.y - this.#wave.pos.y));

            // token collection detection
            const collected = detectTokenCollection(this.#pc, this.level.tokens.filter((t) => t.onScreen()));
            collected.forEach(token => token.collect());

            // collision detection 
            detectLanding(this.#pc, this.level.platforms.filter((p) => p.onScreen()));
            detectEdgeCollision(this.#pc, marginX, this.#p5.width);
            if (this.#pc.pos.y >= this.#wave.pos.y) {
                this.reset();
            }

            // check if panning needed
            if (this.#pc.pos.y < 1.5 * this.#jumpHeight) {
                this.#panning = UP;
            } else if (this.#pc.pos.y > this.#p5.height - this.#jumpHeight) {
                this.#panning = DOWN;
            } else {
                this.#panning = NEITHER;
            }

            // return of true means level is complete 
            return this.#pc.currentPlatform == this.level.highestPlatform;
        }
    }

    draw(marginX, lineGap, topLineGap) {
        this.level.renderPage(marginX, lineGap, topLineGap);
        this.#spriteManager.drawSprites(this.#stressIndex, {
            pcPos: this.#pc.pos,
            platforms: this.level.platforms
                .map((p, i) => { return { i: i, pos: p.pos, onScreen: p.onScreen() } })
                .filter((p) => p.onScreen),
            wavePos: this.#wave.onScreen() ? this.#wave.pos : undefined,
            stressBarPos: this.#p5.createVector(
                (this.#p5.width + marginX - this.#spriteManager.stressBarWidth(this.#p5)) / 2,
                this.#spriteManager.stressBarHeight(this.#p5) / 2),
            tokens: this.level.tokens
                .map((t, i) => { return { i: i, pos: t.pos, onScreen: t.onScreen() } })
                .filter((t) => t.onScreen)
        });

        // temporary   
        this.#p5.push();
        this.#p5.text(this.#stressIndex, 10, 10);
        this.#p5.pop();
    }

    panWrapper() {
        const pan = (y) => {
            this.level.pan(y);
            this.#pc.pos.y += y;
            this.#wave.translate({ y: y });
        };

        if (this.#panning == UP) {
            if (this.level.top + this.#panRate >= 0) {
                pan(0 - this.level.top);
                this.#panning = NEITHER;
            } else {
                pan(Math.max(this.#panRate, Math.abs(this.#pc.velocity.y) * increment(this.#p5)));
            }
        } else if (this.#panning == DOWN) {
            if (this.level.top - this.#panRate <= this.level.topLimit) {
                pan(this.level.topLimit - this.level.top);
                this.#panning = NEITHER;
            } else {
                pan(-Math.max(this.#panRate, Math.abs(this.#pc.velocity.y) * increment(this.#p5)));
            }
        }
    }
}