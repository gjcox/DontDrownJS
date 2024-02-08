import { PC_MAX_SPEED, increment } from "./physicsengine";
import PlayerBall from "./playerball";

export default class CrashDummy extends PlayerBall {
    #p5;
    #initPos;
    #start;
    #jumpHeight;
    #jumpFrames;
    #jumpWidth;
    #done;

    constructor(p5, pos) {
        super(p5, pos);
        this.#p5 = p5;
        this.#initPos = pos.copy();
        this.#start = p5.frameCount;
        this.jump();
    }

    get done() {
        return this.#done;
    }

    /**
     * @returns [jumpHeight, jumpFrames, jumpWidth]. 
     */
    get jumpInfo() {
        return [this.#jumpHeight, this.#jumpFrames, this.#jumpWidth];
    }

    run() {
        if (!this.#done) {
            const rising = this.velocity.y <= 0;
            this.integrate();
            const stillRising = this.velocity.y < 0;
            if (rising != stillRising && this.#jumpHeight === undefined) {
                this.#jumpHeight = Math.abs(this.#initPos.y - this.pos.y) / increment(this.#p5);
                this.#jumpFrames = Math.abs(this.#start - this.#p5.frameCount) * 2;
                this.#jumpWidth = this.#jumpFrames * PC_MAX_SPEED;
                this.#done = true;
            }
        }
    }


}