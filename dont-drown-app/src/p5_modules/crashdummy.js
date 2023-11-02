import PlayerBall from "./playerball";

export default class CrashDummy extends PlayerBall {

    constructor(p5, sketcher, pos) {
        super(p5, sketcher, pos);
        this._initPos = pos.copy();
        this._start = p5.frameCount;
        this.jump();
    }

    get jumpHeight() {
        return this._jumpHeight;
    }

    get jumpFrames() {
        return this._jumpFrames;
    }

    run() {
        if (!this.done) {
            const rising = this._velocity.y <= 0;
            this.integrate();
            const stillRising = this._velocity.y < 0;
            if (rising != stillRising && this._jumpHeight === undefined) {
                this._jumpHeight = Math.abs(this._initPos.y - this.pos.y) / this.increment();
                this._jumpFrames = Math.abs(this._start - this.p5.frameCount) * 2;
                this.done = true;
            }
        }
    }

    draw() {
       if (!this.done) this.sprite.draw(this._pos);
    }

}