class Shape {
  #p5;
  #vertices;
  #colour; 

  constructor(p5, colour) {
    this.#p5 = p5;
    this.#vertices = [];
    this.#colour = colour;
  }

  /**
   * @param {any} colour
   */
  set colour(colour) {
    this.#colour = colour;
  }

  addVertex(v = { x: 0, y: 0 }) {
    this.#vertices.push(v);
  }

  draw(pos = { x: 0, y: 0 }) {
    this.#p5.push();
    if (this.#colour) {
      this.#p5.fill(this.#colour);
    }
    this.#p5.beginShape();
    this.#vertices.forEach(({ x, y }) => this.#p5.vertex(x + pos.x, y + pos.y));
    this.#p5.endShape(this.#p5.CLOSE);
    this.#p5.pop();
  }
}

class Ellipse {
  #p5;
  #x;
  #y;
  #width;
  #height;
  #colour; 

  constructor(p5, colour, x, y, w, h) {
    this.#p5 = p5;
    this.#colour = colour;
    this.#x = x;
    this.#y = y;
    this.#width = w;
    this.#height = h;
  }

  draw(pos = { x: 0, y: 0 }) {
    this.#p5.push();
    if (this.#colour) {
      this.#p5.fill(this.#colour);
    }
    this.#p5.ellipse(this.#x + pos.x, this.#y + pos.y, this.#width, this.#height);
    this.#p5.pop();
  }
}

class CompositeShape {
  #shapes; 

  constructor() {
    this.#shapes = [];
  }

  addShape(s) {
    this.#shapes.push(s);
  }

  draw(pos = { x: 0, y: 0 }) {
    this.#shapes.forEach((s) => s.draw(pos));
  }
}

export { Shape, Ellipse, CompositeShape }; 