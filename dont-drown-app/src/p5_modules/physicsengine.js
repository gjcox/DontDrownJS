import Platform from "./platform";

const G = 2; // gravity 
const MU = 0.5; // coefficient of friction 
const COR_PLATFORM = 0; // coefficient of restitution 
const COR_CAVAS_EDGE = 0.8;
const COR_PLATFORM_EDGE = 0.5;
const C = 0.25; // air constant 
const PC_MAX_SPEED = 15; // horizontal component of velocity 
const PC_GROUND_THRUST = 15;
const PC_AIR_THRUST = 5;
const PC_JUMP_MULT = 20; // jump thrust = weight * jump_mult

const INCREMENT_DIV = 2000; // relative to canvas width 

/** 
 * Finds the horizontal position of the ball when it was at a given height 
 * @param {PlayerBall} ball 
 * @param {number} y y coordinate 
*/
function getXAtYOverlap(ball, y) {
    const dir = ball.pos.copy().sub(ball.oldPos).normalize();
    if (dir.y != 0) {
        const intesection = ball.oldPos.x + (dir.x * ((y - (ball.oldPos.y + ball.radius)) / dir.y));
        if (dir.x < 0) {
            return Math.min(ball.pos.x, intesection);
        } else {
            return Math.max(ball.pos.x, intesection);
        }
    } else {
        return undefined;
    }
}

/**
 * N.B. platforms must be sorted by pos.y
 * @param {PlayerBall} ball 
 * @param {Array<Platform>} platforms 
 */
function detectLanding(ball, platforms) {
    if (ball.currentPlatform instanceof Platform) {
        // determine if off edge of platform 
        if (ball.pos.x > ball.currentPlatform.pos.x + ball.currentPlatform.width
            || ball.pos.x < ball.currentPlatform.pos.x) {
            ball.offPlatform();
        }
    } else if (ball.velocity.y >= 0) {
        // determine if fallen onto a platform 
        platforms.every(platform => {
            if (platform.pos.y < ball.oldPos.y) {
                // platform too high
                // cut off search 
                return false;
            } else if (platform.pos.y > (ball.pos.y + ball.radius)) {
                // platform too low
            } else if (platform !== ball.droppedPlatform) {
                const xIntercept = getXAtYOverlap(ball, platform.pos.y);
                if (xIntercept >= platform.pos.x && xIntercept <= platform.pos.x + platform.width) {
                    ball.land(platform);
                    return false;
                }
            }
                            
            // continue search
            return true;
        });
    }
}

/**
 * 
 * @param {PlayerBall} ball 
 * @param {Array<number>} leftEdges 
 * @param {Array<number>} rightEdges 
 */
function detectEdgeCollision(ball, leftEdge, rightEdge) {
    const ballLeftEdge = ball.pos.x - ball.radius;
    const ballRightEdge = ball.pos.x + ball.radius;
    if (leftEdge >= ballLeftEdge && ball.velocity.x < 0
        || rightEdge <= ballRightEdge && ball.velocity.x > 0) {
        ball.hitEdge();
    }
}

const increment = (p5) => {
    return p5.width / INCREMENT_DIV;
}

export { C, COR_CAVAS_EDGE, COR_PLATFORM, COR_PLATFORM_EDGE, G, INCREMENT_DIV, MU, PC_AIR_THRUST, PC_GROUND_THRUST, PC_JUMP_MULT, PC_MAX_SPEED, detectLanding, detectEdgeCollision, increment };

