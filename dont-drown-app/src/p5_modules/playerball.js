import { LEFT, REST, RIGHT } from "../utils/constants";
import { C, COR_CAVAS_EDGE, COR_PLATFORM, COR_PLATFORM_EDGE, G, MU, PC_AIR_THRUST, PC_GROUND_THRUST, PC_JUMP_MULT, PC_MAX_SPEED, increment } from "./physicsengine";

const PC_DIAMETER_DIV = 30; // relative to canvas width
const PC_MASS = 10;

export default class PlayerBall {
    #p5;
    #diameter;
    #radius;
    #pos;
    #oldPos;
    #mass;
    #horizontalSteering;
    #resultantForce;
    #velocity;
    #currentPlatform;
    #droppedPlatform;
    #edgeClinging;
    #jumpForce;
    #weight;

    constructor(p5, pos) {
        this.#p5 = p5;
        this.#diameter = p5.width / PC_DIAMETER_DIV;
        this.#radius = this.#diameter / 2;
        this.#pos = pos ? pos.copy() : p5.createVector();
        this.#oldPos = this.#pos.copy();
        this.#mass = PC_MASS;
        this.#horizontalSteering = REST;
        this.#resultantForce = p5.createVector();
        this.#velocity = p5.createVector();
        this.#currentPlatform = null;
        this.#droppedPlatform = null;
        this.#edgeClinging;
        this.#jumpForce = G * this.#mass * PC_JUMP_MULT;
        this.#weight = G * this.#mass;
    }

    get radius() {
        return this.#radius;
    }

    get diameter() {
        return this.#diameter;
    }

    set pos(newPos) {
        this.#pos = newPos.copy();
    }

    get pos() {
        return this.#pos;
    }

    get oldPos() {
        return this.#oldPos;
    }

    get velocity() {
        return this.#velocity; 
    }

    /**
     * @param {number} steer
     */
    set horizontalSteering(steer) {
        if ([REST, LEFT, RIGHT].includes(steer)) {
            this.#horizontalSteering = steer;
        }
    }

    resetVelocity() {
        this.#velocity.mult(0);
    }

    get currentPlatform() {
        return this.#currentPlatform;
    }

    get droppedPlatform() {
        return this.#droppedPlatform;
    }

    land(platform) {
        this.#droppedPlatform = null;
        this.#pos.set(this.#pos.x, platform.pos.y - this.#radius);
        this.#currentPlatform = platform;
        this.#velocity.mult(1, -COR_PLATFORM);
        if (Math.abs(this.#velocity.y) < 1) {
            this.#velocity.mult(1, 0);
        } else {
            this.#currentPlatform = null;
        }
    }

    offPlatform() {
        if ((this.#horizontalSteering < 0) != (this.#velocity.x < 0)
            || this.#horizontalSteering == 0) {
            // bounce toward centre of current platform 
            this.#edgeClinging = true;
        } else {
            this.#currentPlatform = null;
            // TODO coyote time        
        }
    }

    /**
     * Queues a reflection of horizontal component of velocity. 
     */
    hitEdge() {
        this._hitEdge = true;
    }

    /**
     * If hitEdge() has been called, then reflect the horizontal component
     * of velocity and apply the canvas edge coefficient of restitution. 
     */
    bounceOffEdge() {
        if (this._hitEdge) {
            this.reflect(COR_CAVAS_EDGE);
            this._hitEdge = false;
        }
    }

    /**
     * Reflects the horizontal component of the ball's velocity, applying 
     * the passed coefficient of restitution.   
     * @param {*} cor coefficient of restitution (the proportion of speed retained)
     */
    reflect(cor = 1) {
        this.#velocity.mult(-cor, 1);
    }

    clingToEdge() {
        if (this.#edgeClinging && this.#currentPlatform !== null) {
            const centreX = this.#currentPlatform.pos.x + this.#currentPlatform.width / 2;
            if ((this.velocity.x < 0) && (centreX > this.pos.x)
                || (this.velocity.x > 0) && (centreX < this.pos.x)) {
                this.reflect(COR_PLATFORM_EDGE);
            }
        }
        this.#edgeClinging = false;
    }

    drop() {
        this.#droppedPlatform = this.#currentPlatform;
        this.#currentPlatform = null;
    }

    thrust() {
        const thrustForce = this.#currentPlatform !== null ?
            PC_GROUND_THRUST
            : PC_AIR_THRUST;
        this.#resultantForce.add(this.#horizontalSteering * thrustForce, 0);
    }

    jump() {
        this.#resultantForce.sub(0, this.#jumpForce);
        this.#currentPlatform = null;
    }

    friction() {
        const direction = this.#velocity.x / Math.abs(this.#velocity.x);
        if (direction != 0 & this.#currentPlatform !== null) {
            // friction = mu * normal reaction force
            // (assumes that platform is level) 
            // reaction force = mass * g 
            const friction = this.#mass * G * MU;
            this.#resultantForce.add(-direction * friction, 0);
        }
    }

    gravity() {
        if (this.#currentPlatform === null) { this.#resultantForce.add(0, this.#weight) }
    }

    airResistance() {
        // F_air = -c * v
        this.#resultantForce.add(0, this.#velocity.y * -C);
    }

    integrate(marginX) {
        const currentXDirection = this.#velocity.x / Math.abs(this.#velocity.x);

        // resolve horizontal forces 
        this.thrust();
        this.friction();

        // resolve vertical forces 
        this.gravity();
        this.airResistance();

        // acceleration 
        this.#velocity.add(this.#resultantForce.copy().div(this.#mass));
        const newXDirection = this.#velocity.x / Math.abs(this.#velocity.x);

        // ensure that friction doesn't reverse direction of motion 
        const justFriction = ((this.#horizontalSteering < 0) !=
            (this.#resultantForce.x < 0));
        if (justFriction && newXDirection != currentXDirection) {
            this.#velocity.x = 0;
        }

        // ensure max horizontal speed not exceeded 
        if (Math.abs(this.velocity.x) > PC_MAX_SPEED) {
            this.#velocity.x = PC_MAX_SPEED * newXDirection;
        }

        // bounce off edge
        this.bounceOffEdge();

        // cling to edge 
        this.clingToEdge();

        // apply movement 
        this.#oldPos = this.#pos.copy();
        this.#pos.add(this.#p5.createVector(increment(this.#p5), increment(this.#p5))
            .mult(this.#velocity));

        // prevent clipping through edges 
        this.#pos.x = Math.max(marginX + this.radius, this.#pos.x);
        this.#pos.x = Math.min(this.#p5.width - this.radius, this.#pos.x);

        // reset resultant force
        this.#resultantForce.set();
    }

}

export { PC_DIAMETER_DIV };

