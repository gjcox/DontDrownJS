import Level from "./level";
import { marginX as calcMarginX } from "./page";
import { increment } from "./physicsengine";
import Platform from "./platform";
import { PC_DIAMETER_DIV } from "./playerball";

// horizontal, vertical and reflection jump bounds 
const H_JUMP_MIN_X_MULT = 0.6;
const H_JUMP_MAX_X_MULT = 0.9;
const H_JUMP_MIN_Y_MULT = 0.25;
const H_JUMP_MAX_Y_MULT = 0.5;
const V_JUMP_MIN_X_MULT = 0;
const V_JUMP_MAX_X_MULT = 0.25;
const V_JUMP_MIN_Y_MULT = 0.75;
const V_JUMP_MAX_Y_MULT = 1;
const R_JUMP_MIN_X_MULT = 0.25;
const R_JUMP_MAX_X_MULT = 0.35;
const R_JUMP_MIN_Y_MULT = 0.35;
const R_JUMP_MAX_Y_MULT = 0.55;

const DIRECTION_CHANGE_CHANCE = 0.1

const H_JUMP = 101; // horizontal jump code 
const V_JUMP = 102; // vertical jump code
const R_JUMP = 103; // reflection jump code 

export default class LevelBuilder {
    constructor(p5, sketcher, jumpHeight, jumpWidth) {
        this.p5 = p5;
        this.sketcher = sketcher;
        this.jumpHeight = jumpHeight;
        this.jumpWidth = jumpWidth;
        this.tokenElevation = 0.75 * p5.width / PC_DIAMETER_DIV;
    }

    /**
     * Calculates the position vector of the next platform based on the 
     * current platform and the generated X and Y distances, ensuring that
     * the new platform will be within the bounds of the level.
     * @param {*} currentPlatform 
     * @param {*} nextPlatform 
     * @param {*} diffX 
     * @param {*} diffY 
     * @returns 
     */
    placePlatform(marginX, currentPlatform, nextPlatform, diffX, diffY, highestPlatformHeight) {
        var x = Math.max(marginX, currentPlatform.pos.x + diffX);
        x = Math.min(x, this.p5.width - nextPlatform.width);
        var y = Math.min(this.p5.height - nextPlatform.height, currentPlatform.pos.y - diffY);
        y = Math.max(highestPlatformHeight, y);
        return this.p5.createVector(x, y);
    }

    randomJump(jumpType) {
        let x, y; // displacements between current and next platform 

        switch (jumpType) {
            case H_JUMP:
                x = this.jumpWidth * this.p5.random(H_JUMP_MIN_X_MULT, H_JUMP_MAX_X_MULT);
                y = this.jumpHeight * this.p5.random(H_JUMP_MIN_Y_MULT, H_JUMP_MAX_Y_MULT);
                break;
            case R_JUMP:
                x = this.jumpWidth * this.p5.random(R_JUMP_MIN_X_MULT, R_JUMP_MAX_X_MULT);
                y = this.jumpHeight * this.p5.random(R_JUMP_MIN_Y_MULT, R_JUMP_MAX_Y_MULT);
                break;
            case V_JUMP:
                x = this.jumpWidth * this.p5.random(V_JUMP_MIN_X_MULT, V_JUMP_MAX_X_MULT);
                y = this.jumpHeight * this.p5.random(V_JUMP_MIN_Y_MULT, V_JUMP_MAX_Y_MULT);
                break;
            default:
                throw new Error(`Unrecognised jumpType '${jumpType}' in randomJump()`);
        }
        return [x, y].map(x => x * increment(this.p5));
    }


    buildLevel(difficulty) {
        const width = this.p5.width;
        const levelHeight = difficulty.heightMult * this.p5.height;
        const lowestPlatformHeight = 0.5 * this.p5.height;
        const highestPlatformHeight = this.p5.height + this.jumpHeight - levelHeight;
        const marginX = calcMarginX(this.p5)
        const middlePlayable = (marginX + width) / 2;
        const platformWidth = Platform.defaultWidth(this.p5);

        function applyBounds(platformPos) {
            platformPos.x = Math.max(marginX, platformPos.x);
            platformPos.x = Math.min(platformPos.x, width - platformWidth);
        }

        const platforms = [];
        const topPlatformPos = this.p5.createVector(
            this.p5.random(marginX, width - platformWidth),
            highestPlatformHeight
        );
        const topPlatform = new Platform(this.p5, this.sketcher, topPlatformPos);
        platforms.push(topPlatform);

        const lastPlatform = () => platforms[platforms.length - 1];

        // start with a horizontal jump...
        var jumpType = H_JUMP;
        // ... towards the horizontal middle of the playable area
        var goingLeft = lastPlatform().middle.x > middlePlayable;

        do {
            var nextPlatformPos = lastPlatform().pos.copy();
            const [x, y] = this.randomJump(jumpType); // displacements between current and next platform 
            nextPlatformPos.add(goingLeft ? -x : x, y);
            applyBounds(nextPlatformPos);
            platforms.push(new Platform(this.p5, this.sketcher, nextPlatformPos));

            if (lastPlatform().pos.x < marginX + platformWidth
                || lastPlatform().pos.x > width - 2 * platformWidth) {
                // edge reached - reflection jump 
                jumpType = R_JUMP;
                goingLeft = !goingLeft;
            } else if (jumpType == V_JUMP || Math.random() >= difficulty.verticality) {
                /* There cannot be two vertical jumps in a row,
                   and vertical jumps' frequency is based on difficulty */
                jumpType = H_JUMP;
            } else {
                jumpType = V_JUMP;
            }

            // random chance to change direction if not a reflection jump 
            if (jumpType != R_JUMP && Math.random() <= DIRECTION_CHANGE_CHANCE) {
                goingLeft = !goingLeft;
            }

        } while (lastPlatform().pos.y < lowestPlatformHeight)

        // TODO colour top platform 
        // // replace the highest platform with a specially coloured one
        // highestPlatform = new Platform(highestPlatform);
        // platforms.remove(platforms.size() - 1);
        // platforms.add(highestPlatform);

        const level = new Level(this.p5, difficulty);
        level.platforms = platforms;
        return level;
    }
}