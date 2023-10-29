import { C, COR_EDGE, COR_PLATFORM, G, MU } from "./physicsengine";

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
        this._pos = pos ?? p5.createVector();
        this._oldPos = this._pos;
        this._mass = PC_WEIGHT;
        this._horizontalSteering = REST;
        this._resultantForce = p5.createVector();
        this._velocity = p5.createVector();
        this._currentPlatform = null;
    }

    get radius() {
        return this._radius;
    }

    get diameter() {
        return this._diameter;
    }

    set pos(newPos) {
        this._pos = newPos;
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

    land(platform) {
        this._pos.set(this._pos.x, platform.pos.y - this._radius);
        this._currentPlatform = platform;
        this._velocity.mult(1, -COR_PLATFORM);
        if (Math.abs(this._velocity.y) < 1) {
            this._velocity.mult(1, 0);
        } else {
            this._currentPlatform = null;
        }
    }

    increment() {
        return this.p5.width / PC_INCREMENT_DIV;
    }

    thrust() {
        const thrust_force = this._mass * 2;
        this._resultantForce.add(this._horizontalSteering * thrust_force, 0);
    }

    friction() {
        const direction = this._velocity.x / Math.abs(this._velocity.x);
        if (direction != 0 & this._currentPlatform !== null) {
            // friction = mu * normal reaction force
            // (assumes that platform is level) 
            // reaction force = mass * g 
            const friction = this._mass * G * MU;
            this._resultantForce.add(direction * -1 * friction, 0);
        }
    }

    gravity() {
        if (this._currentPlatform === null) { this._resultantForce.add(0, this._mass * G) }
    }

    airResistance() {
        // F_air = -c * v
        this._resultantForce.sub(0, this._velocity.y * C);
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
        const justFriction = (this._horizontalSteering !=
            this._resultantForce.x / Math.abs(this._resultantForce.x));
        if (justFriction && newXDirection != currentXDirection) {
            this._velocity.x = 0;
        }

        // bounce off edge 
        if (this._pos.x < this._radius && this._velocity.x < 0
            || this._pos.x > this.p5.width - this._radius && this._velocity.x > 0) {
            this._velocity.mult(-COR_EDGE, 1);
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

