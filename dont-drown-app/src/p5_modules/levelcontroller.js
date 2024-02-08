import { detectEdgeCollision, detectLanding, increment } from "./physicsengine";
import PlayerBall, { LEFT, PC_DIAMETER_DIV, REST, RIGHT } from "./playerball";
import SpriteManager from "./sprites";
import StressTracker from "./stresstracker";
import Wave from "./wave";

const PAN_RATE_DIV = PC_DIAMETER_DIV * 10;
const UP = -1;
const NEITHER = 0;
const DOWN = 1;

export default class LevelController {
    #spriteManager;

    constructor(p5, sketcher, jumpHeight, completeLevel) {
        this.p5 = p5;
        this.sketcher = sketcher;
        this._pc = new PlayerBall(p5, sketcher);
        this._wave = new Wave(p5, sketcher);
        this._panning = NEITHER;
        this._panRate = p5.width / PAN_RATE_DIV;
        this._jumpHeight = jumpHeight;
        this._paused = false;
        this._stressIndex;
        this._stressTracker = new StressTracker(value => this._stressIndex = Math.round(value), jumpHeight * 1.5);
        this.completeLevel = completeLevel;

        this.#spriteManager = new SpriteManager(p5, sketcher, this.pc.diameter);
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

    toggleWave() {
        this._waveMoving = !this._waveMoving;
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
        // this.pc.pos = this.level.platforms[this.level.platforms.length - 1].middle;
        // this.pc.land(this.level.platforms[this.level.platforms.length - 1]);    
        this.pc.pos = this.level.platforms[0].middle;
        this.pc.land(this.level.platforms[0]);
        this.pc.resetVelocity();
        this.wave.pos = this.p5.createVector(0, this.p5.height);
        this._paused = false;
        this._waveMoving = true;
        this._stressTracker.reset();
    }

    togglePause() {
        this._paused = !this._paused;
        return this._paused;
    }

    /**
      * Pan level if needed and call physics engine methods. 
      */
    integrate(marginX) {
        if (!this._paused) {
            this.handleKeyboardInput();

            this.panWrapper();

            this.pc.integrate(marginX);
            if (this._waveMoving) {
                this.wave.pos.y -= this.level.waveRiseRate;
            }

            // stress management
            this._stressTracker.updateStress(Math.abs(this.pc.pos.y - this.wave.pos.y));

            // collision detection 
            detectLanding(this.pc, this.level.platforms);
            detectEdgeCollision(this.pc, marginX, this.p5.width);
            if (this.pc.pos.y >= this.wave.pos.y) {
                this.reset();
            }

            if (this.pc.currentPlatform == this.level.highestPlatform) {
                this.completeLevel();
            }

            // check if panning needed
            if (this.pc.pos.y < 1.5 * this.jumpHeight) {
                this.panning = UP;
            } else if (this.pc.pos.y > this.p5.height - this.jumpHeight) {
                this.panning = DOWN;
            } else {
                this.panning = NEITHER;
            }
        }
    }

    draw(marginX, lineGap, topLineGap) {
        this.level.draw(marginX, lineGap, topLineGap);
        this.#spriteManager.drawSprites(this._stressIndex, { pcPos: this.pc.pos })
        this.wave.draw();

        // temporary   
        this.p5.push();
        this.p5.text(this._stressIndex, 10, 10);
        this.p5.pop();
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