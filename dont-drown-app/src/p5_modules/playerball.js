import { C, COR_CAVAS_EDGE, COR_PLATFORM, COR_PLATFORM_EDGE, G, MU, PC_AIR_THRUST, PC_GROUND_THRUST, PC_JUMP_MULT, PC_MAX_SPEED } from "./physicsengine";

const PC_DIAMETER_DIV = 30; // relative to canvas width
const PC_WEIGHT = 10;
const PC_DETAIL = 15;

const PC_INCREMENT_DIV = 2000; // relative to canvas width 

const REST = 0;
const LEFT = -1;
const RIGHT = 1;

export default class PlayerBall {
    constructor(p5, sketcher, pos) {
        this.p5 = p5;
        this._diameter = p5.width / PC_DIAMETER_DIV;
        this._radius = this._diameter / 2;
        this.sprite = sketcher.buildSketchedEllipse(
            p5.color('hsl(280, 20%, 50%)'),
            p5.color('hsl(280, 20%, 90%)'),
            0,
            0,
            this._diameter,
            this._diameter,
            PC_DETAIL,
        );
        this._pos = pos.copy() ?? p5.createVector();
        this._oldPos = this._pos.copy();
        this._mass = PC_WEIGHT;
        this._horizontalSteering = REST;
        this._resultantForce = p5.createVector();
        this._velocity = p5.createVector();
        this._currentPlatform = null;
        this._droppedPlatform = null;
        this._edgeClinging;
        this._jumpForce = G * this._mass * PC_JUMP_MULT;
        this._weight = G * this._mass;
    }

    get radius() {
        return this._radius;
    }

    get diameter() {
        return this._diameter;
    }

    set pos(newPos) {
        this._pos = newPos.copy();
    }

    get pos() {
        return this._pos;
    }

    get oldPos() {
        return this._oldPos;
    }

    set horizontalSteering(steer) {
        if ([REST, LEFT, RIGHT].includes(steer)) {
            this._horizontalSteering = steer;
        }
    }

    get velocity() {
        return this._velocity;
    }

    get currentPlatform() {
        return this._currentPlatform;
    }

    set currentPlatform(platform) {
        this._currentPlatform = platform ?? null;
    }

    get droppedPlatform() {
        return this._droppedPlatform;
    }

    get jumpForce() {
        return this._jumpForce;
    }

    get weight() {
        return this._weight;
    }

    land(platform) {
        this._droppedPlatform = null;
        this._pos.set(this._pos.x, platform.pos.y - this._radius);
        this._currentPlatform = platform;
        this._velocity.mult(1, -COR_PLATFORM);
        if (Math.abs(this._velocity.y) < 1) {
            this._velocity.mult(1, 0);
        } else {
            this._currentPlatform = null;
        }
    }

    offPlatform() {
        if ((this._horizontalSteering < 0) != (this._velocity.x < 0)
            || this._horizontalSteering == 0) {
            // bounce toward centre of current platform 
            this._edgeClinging = true;
        } else {
            this._currentPlatform = null;
            // TODO coyote time        
        }
    }

    clingToEdge() {
        if (this._edgeClinging && this._currentPlatform !== null) {
            const centreX = this.currentPlatform.pos.x + this.currentPlatform.width / 2;
            if ((this.velocity.x < 0) && (centreX > this.pos.x)
                || (this.velocity.x > 0) && (centreX < this.pos.x)) {
                this._velocity.mult(-COR_PLATFORM_EDGE, 1);
            }
        }
        this._edgeClinging = false;
    }

    drop() {
        this._droppedPlatform = this._currentPlatform;
        this._currentPlatform = null;
    }

    increment() {
        return this.p5.width / PC_INCREMENT_DIV;
    }

    thrust() {
        const thrustForce = this.currentPlatform !== null ?
            PC_GROUND_THRUST
            : PC_AIR_THRUST;
        this._resultantForce.add(this._horizontalSteering * thrustForce, 0);
    }

    jump() {
        this._resultantForce.sub(0, this.jumpForce);
        this._currentPlatform = null;
    }

    friction() {
        const direction = this._velocity.x / Math.abs(this._velocity.x);
        if (direction != 0 & this._currentPlatform !== null) {
            // friction = mu * normal reaction force
            // (assumes that platform is level) 
            // reaction force = mass * g 
            const friction = this._mass * G * MU;
            this._resultantForce.add(-direction * friction, 0);
        }
    }

    gravity() {
        if (this._currentPlatform === null) { this._resultantForce.add(0, this.weight) }
    }

    airResistance() {
        // F_air = -c * v
        this._resultantForce.add(0, this._velocity.y * -C);
    }

    integrate() {
        const currentXDirection = this._velocity.x / Math.abs(this._velocity.x);

        // resolve horizontal forces 
        this.thrust();
        this.friction();

        // resolve vertical forces 
        this.gravity();
        this.airResistance();

        // acceleration 
        this._velocity.add(this._resultantForce.copy().div(this._mass));
        const newXDirection = this._velocity.x / Math.abs(this._velocity.x);

        // ensure that friction doesn't reverse direction of motion 
        const justFriction = ((this._horizontalSteering < 0) !=
            (this._resultantForce.x < 0));
        if (justFriction && newXDirection != currentXDirection) {
            this._velocity.x = 0;
        }

        // ensure max horizontal speed not exceeded 
        if (Math.abs(this.velocity.x) > PC_MAX_SPEED) {
            this._velocity.x = PC_MAX_SPEED * newXDirection;
        }

        // cling to edge 
        this.clingToEdge();

        // bounce off edge 
        if (this._pos.x < this._radius && this._velocity.x < 0
            || this._pos.x > this.p5.width - this._radius && this._velocity.x > 0) {
            this._velocity.mult(-COR_CAVAS_EDGE, 1);
        }

        // apply movement 
        this._oldPos = this._pos.copy();
        this._pos.add(this.p5.createVector(this.increment(), this.increment())
            .mult(this._velocity));

        // reset resultant force
        this._resultantForce.set();
    }

    draw() {
        this.sprite.draw(this._pos);
    }

}

export { LEFT, REST, RIGHT };

