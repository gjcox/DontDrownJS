import Level from "./level";
import { increment, detectLanding } from "./physicsengine";
import PlayerBall, { LEFT, PC_DIAMETER_DIV, REST, RIGHT } from "./playerball";
import Wave from "./wave";

const PAN_RATE_DIV = PC_DIAMETER_DIV * 10;
const UP = -1;
const NEITHER = 0;
const DOWN = 1;

export default class LevelController {
    constructor(p5, sketcher, jumpHeight) {
        this.p5 = p5;
        this.sketcher = sketcher;
        this._pc = new PlayerBall(p5, sketcher);
        this._wave = new Wave(p5, sketcher);
        this._panning = NEITHER;
        this._panRate = p5.width / PAN_RATE_DIV;
        this._jumpHeight = jumpHeight;
    }

    get panning() {
        return this._panning;
    }

    set panning(panning) {
        this._panning = panning;
    }

    get level() {
        return this._level;
    }

    /**
     * @param {Level} level
     */
    set level(level) {
        this._level = level;
        this.reset(); 
    }

    get pc() {
        return this._pc;
    }

    get wave() {
        return this._wave;
    }

    get panRate() {
        return this._panRate;
    }

    get jumpHeight() {
        return this._jumpHeight * increment(this.p5);
    }

    handleKeyboardInput() {
        if ((this.p5.keyIsDown(this.p5.LEFT_ARROW) || this.p5.keyIsDown(65))
            && !(this.p5.keyIsDown(this.p5.RIGHT_ARROW) || this.p5.keyIsDown(68))) {
            this.pc.horizontalSteering = LEFT;
        } else if ((this.p5.keyIsDown(this.p5.RIGHT_ARROW) || this.p5.keyIsDown(68))
            && !(this.p5.keyIsDown(this.p5.LEFT_ARROW) || this.p5.keyIsDown(65))) {
            this.pc.horizontalSteering = RIGHT;
        } else {
            this.pc.horizontalSteering = REST;
        }

        if (this.pc.currentPlatform !== null) {
            if ((this.p5.keyIsDown(this.p5.UP_ARROW) || this.p5.keyIsDown(87))
                && !(this.p5.keyIsDown(this.p5.DOWN_ARROW) || this.p5.keyIsDown(83))) {
                this.pc.jump();
            } else if ((this.p5.keyIsDown(this.p5.DOWN_ARROW) || this.p5.keyIsDown(83))
                && !(this.p5.keyIsDown(this.p5.UP_ARROW) || this.p5.keyIsDown(87))) {
                this.pc.drop();
            }
        }
    }

    reset() {
        this.panning = NEITHER;
        this.level.reset(); 
        this.pc.pos = this.level.platforms[0].middle; 
        this.pc.land(this.level.platforms[0]); 
        this.pc.resetVelocity(); 
        this.wave.pos = this.p5.createVector(0, this.p5.height); 
    }

    /**
      * Pan level if needed. 
      */
    integrate() {
        this.handleKeyboardInput();

        this.panWrapper();

        this.pc.integrate();
        this.wave.pos.y -= this.level.waveRiseRate;

        // collision detection 
        detectLanding(this.pc, this.level.platforms);
        // TODO detect landing in the wave 

        // check if panning needed
        if (this.pc.pos.y < 1.5 * this.jumpHeight) {
            this.panning = UP;
        } else if (this.pc.pos.y > this.p5.height - this.jumpHeight) {
            this.panning = DOWN;
        } else {
            this.panning = NEITHER;
        }

    }

    draw() {
        this.level.draw();
        this.pc.draw();
        this.wave.draw();
    }

    panWrapper() {
        const pan = (y) => {
            this.level.pan(y);
            this.pc.pos.y += y;
            this.wave.pos.y += y;
        };

        if (this.panning == UP) {
            if (this.level.top + this.panRate >= 0) {
                pan(0 - this.level.top);
                this.panning = NEITHER;
            } else {
                pan(Math.max(this.panRate, Math.abs(this.pc.velocity.y) * increment(this.p5)));
            }
        } else if (this.panning == DOWN) {
            if (this.level.top - this.panRate <= this.level.topLimit) {
                pan(this.level.topLimit - this.level.top);
                this.panning = NEITHER;
            } else {
                pan(-Math.max(this.panRate, Math.abs(this.pc.velocity.y) * increment(this.p5)));
            }
        }
    }
}