import Level from "./level";
import { marginX as calcMarginX } from "./page";
import { increment } from "./physicsengine";
import Platform from "./platform";
import { PC_DIAMETER_DIV } from "./playerball";

// horizontal, vertical and reflection jump bounds 
const H_JUMP_MIN_X_MULT = 0.6;
const H_JUMP_MAX_X_MULT = 0.9;
const H_JUMP_MIN_Y_MULT = 0.3;
const V_JUMP_MIN_X_MULT = 0;
const V_JUMP_MAX_X_MULT = 0.25;
const V_JUMP_MIN_Y_MULT = 0.75;
const R_JUMP_MIN_X_MULT = 0.35;
const R_JUMP_MAX_X_MULT = 0.45;
const R_JUMP_MIN_Y_MULT = 0.75;

const DIRECTION_CHANGE_CHANCE = 0.1


const H_JUMP = 101; // horizontal jump code 
const V_JUMP = 102; // vertical jump code
const R_JUMP = 103; // reflection jump code 

/**
 * For debugging 
 * @param {number} code 
 * @returns 
 */
function jumpCode(code) {
    switch (code) {
        case V_JUMP:
            return "V_JUMP";
        case H_JUMP:
            return "H_JUMP";
        case R_JUMP:
            return "R_JUMP";
        default:
            return "unrecognised";
    }
}

export default class LevelBuilder {
    constructor(p5, sketcher, jumpHeight, jumpWidth) {
        this.p5 = p5;
        this.sketcher = sketcher;
        this.jumpHeight = jumpHeight * increment(p5);
        this.jumpWidth = jumpWidth * increment(p5) + Platform.defaultWidth(p5);
        this.tokenElevation = 0.75 * p5.width / PC_DIAMETER_DIV;
    }

    calcMaxYatX(x) {
        if (x <= 0.5) {
            return 1;
        } else {
            return 1 - x;
        }
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

    /**
     * Simulates a jump as proportions of jump height and width. 
     * @param {*} jumpType either horizontal, vertical or reflection. 
     * @param {*} maxXMult the proportion of jump width needed to reach the edge of the playable area. 
     * @returns the proportions of jump width and height as [x, y]. 
     */
    randomJump(jumpType, maxXMult) {
        let x, y;

        switch (jumpType) {
            case H_JUMP:
                x = this.p5.random(H_JUMP_MIN_X_MULT, Math.min(maxXMult, H_JUMP_MAX_X_MULT));
                y = this.p5.random(H_JUMP_MIN_Y_MULT, this.calcMaxYatX(x));
                break;
            case R_JUMP:
                x = this.p5.random(R_JUMP_MIN_X_MULT, Math.min(maxXMult, R_JUMP_MAX_X_MULT));
                y = this.p5.random(R_JUMP_MIN_Y_MULT, this.calcMaxYatX(x));
                break;
            case V_JUMP:
                x = this.p5.random(V_JUMP_MIN_X_MULT, Math.min(maxXMult, V_JUMP_MAX_X_MULT));
                y = this.p5.random(V_JUMP_MIN_Y_MULT, this.calcMaxYatX(x));
                break;
            default:
                throw new Error(`Unrecognised jumpType '${jumpType}' in randomJump()`);
        }
        return [x, y];
    }


    buildLevel(difficulty) {
        const width = this.p5.width;
        const levelHeight = difficulty.heightMult * this.p5.height;
        const lowestPlatformHeight = 0.5 * this.p5.height;
        const highestPlatformHeight = this.p5.height + this.jumpHeight - levelHeight;
        const marginX = calcMarginX(this.p5)
        const middlePlayable = (marginX + width) / 2;
        const platformWidth = Platform.defaultWidth(this.p5);
        const minHJumpWidth = H_JUMP_MIN_X_MULT * this.jumpWidth * increment(this.p5);

        function applyBounds(platformPos) {
            platformPos.x = Math.max(marginX, platformPos.x);
            platformPos.x = Math.min(platformPos.x, width - platformWidth);
        }

        const platforms = [];
        const jumps = [];
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
            const distanceToEdge = goingLeft ?
                nextPlatformPos.x - marginX :
                (width - platformWidth) - nextPlatformPos.x;
            const maxXMult = distanceToEdge / this.jumpWidth;

            // simulate a jump to place a reachable next platform 
            const [xMult, yMult] = this.randomJump(jumpType, maxXMult); 
            const x = xMult * this.jumpWidth;
            const y = yMult * this.jumpHeight;
            nextPlatformPos.add(goingLeft ? -x : x, y);
            applyBounds(nextPlatformPos);

            // add next platform 
            platforms.push(new Platform(this.p5, this.sketcher, nextPlatformPos));
            jumps.push(`${jumpCode(jumpType)} ${goingLeft ? 'left' : 'right'} [${xMult}, ${yMult}]`);

            if (lastPlatform().pos.x < marginX + platformWidth && goingLeft
                || lastPlatform().pos.x > width - 2 * platformWidth && !goingLeft) {
                // edge reached - reflection jump 
                jumpType = R_JUMP;
                goingLeft = !goingLeft;
            } else if (jumpType != R_JUMP &&
                (lastPlatform().pos.x < marginX + minHJumpWidth && goingLeft
                    || lastPlatform().pos.x > width - (platformWidth + minHJumpWidth) && !goingLeft)) {
                // near edge - vertical jump 
                jumpType = V_JUMP;
            } else {
                // not near edge 
                /* There cannot be two central vertical jumps in a row,
                 * and central vertical jumps' frequency is based on difficulty */
                if (jumpType == H_JUMP && Math.random() >= difficulty.verticality) {
                    jumpType = V_JUMP;
                } else {
                    jumpType = H_JUMP;
                }

                // random chance to change direction if not a reflection jump 
                if (Math.random() <= DIRECTION_CHANGE_CHANCE) {
                    goingLeft = !goingLeft;
                }
            }



        } while (lastPlatform().pos.y < lowestPlatformHeight)

        // TODO colour top platform 
        // // replace the highest platform with a specially coloured one
        // highestPlatform = new Platform(highestPlatform);
        // platforms.remove(platforms.size() - 1);
        // platforms.add(highestPlatform);

        // console.log(jumps.join("\n"));

        const level = new Level(this.p5, difficulty);
        level.platforms = platforms;
        return level;
    }
}