import Platform from "./platform";

const G = 2; // gravity 
const MU = 0.129; // coefficient of friction 
const COR_PLATFORM = 0; // coefficient of restitution 
const COR_EDGE = 0.8;
const C = 0.25; // air constant 

/* Finds the horizontal position of the ball when it was at a given height */
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
 * N.B. for search cut off to work, platforms must be sorted by pos.y
 * @param {*} ball 
 * @param {*} platforms 
 */
function detectLanding(ball, platforms) {
    if (ball.currentPlatform instanceof Platform) {
        // determine if off edge of platform 
        if (ball.pos.x < ball.currentPlatform.pos.x || ball.pos.x > ball.currentPlatform.pos.x + ball.currentPlatform.width) {
            ball.offPlatform();
        }
    } else if (ball.velocity.y >= 0) {
        // determine if fallen onto a platform 
        platforms.every(p => {
            if (p.pos.y < ball.oldPos.y) {
                // platform too high
                // cut off search
                return false;
            } else if (p.pos.y > (ball.pos.y + ball.radius)) {
                // platform too low
                // continue search
                return true;
            } else if (p !== ball.droppedPlatform) {
                const xIntercept = getXAtYOverlap(ball, p.pos.y);
                if (xIntercept >= p.pos.x && xIntercept <= p.pos.x + p.width) {
                    ball.land(p);
                    return false;
                }
            }
            return true;
        });
    }
}

export { C, COR_EDGE, COR_PLATFORM, G, MU, detectLanding };

