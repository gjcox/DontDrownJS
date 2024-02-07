import { PC_MAX_SPEED, increment } from "./physicsengine";
import PlayerBall from "./playerball";

export default class CrashDummy extends PlayerBall {

    constructor(p5, sketcher, pos) {
        super(p5, sketcher, pos);
        this._initPos = pos.copy();
        this._start = p5.frameCount;
        this.jump();
    }

    get done() {
        return this._done; 
    }

    /**
     * @returns [this._jumpHeight, this._jumpFrames, this._jumpWidth]. 
     */
    get jumpInfo() {
        return [this._jumpHeight, this._jumpFrames, this._jumpWidth];
    }

    run() {
        if (!this._done) {
            const rising = this._velocity.y <= 0;
            this.integrate();
            const stillRising = this._velocity.y < 0;
            if (rising != stillRising && this._jumpHeight === undefined) {
                this._jumpHeight = Math.abs(this._initPos.y - this.pos.y) / increment(this.p5);
                this._jumpFrames = Math.abs(this._start - this.p5.frameCount) * 2;
                this._jumpWidth = this._jumpFrames * PC_MAX_SPEED;
                this._done = true;
            }
        }
    }


}