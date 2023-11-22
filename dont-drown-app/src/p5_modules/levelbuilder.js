import Level from "./level";
import { marginX as calcMarginX } from "./page";
import { increment } from "./physicsengine";
import Platform, { PF_WIDTH_DIV } from "./platform";
import { PC_DIAMETER_DIV } from "./playerball";

// horizontal and vertical jump modifiers 
const H_MIN_JUMP_RANGE_MULT = 0.6;
const H_MAX_JUMP_RANGE_MULT = 0.9;
const V_MIN_JUMP_RANGE_MULT = 0;
const V_MAX_JUMP_RANGE_MULT = 0.25;
const H_MIN_JUMP_HEIGHT_MULT = 0.25;
const H_MAX_JUMP_HEIGHT_MULT = 0.5;
const V_MIN_JUMP_HEIGHT_MULT = 0.75;
const V_MAX_JUMP_HEIGHT_MULT = 1;

const DIRECTION_CHANGE_CHANCE = 0.1

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

    buildLevel(difficulty) {
        const levelHeight = difficulty.heightMult * this.p5.height;
        const level = new Level(this.p5, difficulty);
        const platforms = [];
        const marginX = calcMarginX(this.p5)

        // level generation values
        const lowestPlatformHeight = 0.75 * this.p5.height;
        const highestPlatformHeight = this.p5.height + this.jumpHeight - levelHeight;
        const playableWidth = this.p5.width - marginX;

        var currentPlatform;

        if (difficulty.hasGround) {
            // TODO wide platforms 
            currentPlatform = new Platform(this.p5, this.sketcher, this.p5.createVector(marginX, lowestPlatformHeight));
            platforms.push(currentPlatform);
        } else {
            currentPlatform = new Platform(this.p5, this.sketcher,
                this.p5.createVector(marginX + Math.random() * (playableWidth - this.p5.width / PF_WIDTH_DIV),
                    lowestPlatformHeight));
            platforms.push(currentPlatform);
        }
        var highestPlatform = currentPlatform;

        var diffX, diffY = 0; // displacements between current and next platform
        var goingLeft = false;

        /* while current platform is at least a jump away from the max platform height */
        while (currentPlatform.pos.y > highestPlatformHeight) {

            const nextPlatform = new Platform(this.p5, this.sketcher, this.p5.createVector(0, 0));
            const wentUp = diffY >= this.jumpHeight * V_MIN_JUMP_HEIGHT_MULT;
            const edgeReached = currentPlatform.pos.x < marginX + nextPlatform.width
                || currentPlatform.pos.x > this.p5.width - currentPlatform.width - nextPlatform.width;

            if (edgeReached) {
                // turn around
                goingLeft = !goingLeft;

                // reflection jump
                diffY = this.jumpHeight * this.p5.random(V_MIN_JUMP_HEIGHT_MULT, V_MAX_JUMP_HEIGHT_MULT);
                diffX = Math.max(currentPlatform.width,
                    this.jumpWidth * this.p5.random(H_MIN_JUMP_RANGE_MULT, V_MAX_JUMP_RANGE_MULT));
            } else {
                // random chance to change horizontal direction
                if (Math.random() <= DIRECTION_CHANGE_CHANCE) {
                    goingLeft = !goingLeft;
                }

                if (!wentUp && Math.random() < difficulty.verticality) {
                    // vertical jump (can't have two in a row)
                    diffY = this.jumpHeight * this.p5.random(V_MIN_JUMP_HEIGHT_MULT, V_MAX_JUMP_HEIGHT_MULT);
                    diffX = this.jumpWidth * this.p5.random(V_MIN_JUMP_RANGE_MULT, V_MAX_JUMP_RANGE_MULT);
                } else {
                    // horizontal jump
                    diffY = this.jumpHeight * this.p5.random(H_MIN_JUMP_HEIGHT_MULT, H_MAX_JUMP_HEIGHT_MULT);
                    diffX = Math.max(currentPlatform.width,
                        this.jumpWidth * this.p5.random(H_MIN_JUMP_RANGE_MULT, H_MAX_JUMP_RANGE_MULT));
                }

            }

            if (goingLeft) {
                diffX = -diffX;
            }

            [diffX, diffY] = [diffX, diffY].map(x => x * increment(this.p5));
            const platformPosition = this.placePlatform(marginX, currentPlatform, nextPlatform, diffX, diffY, highestPlatformHeight);
            nextPlatform.initPos = platformPosition;
            nextPlatform.pos = platformPosition;
            currentPlatform = nextPlatform;
            platforms.push(currentPlatform);

            if (currentPlatform.pos.y < highestPlatform.pos.y) {
                highestPlatform = currentPlatform;
            }
        }

        // TODO colour top platform 
        // // replace the highest platform with a specially coloured one
        // highestPlatform = new Platform(highestPlatform);
        // platforms.remove(platforms.size() - 1);
        // platforms.add(highestPlatform);

        level.platforms = platforms;
        return level;
    }
}