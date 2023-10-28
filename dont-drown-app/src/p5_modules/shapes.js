class Shape {
  constructor(p5, colour) {
    this.p5 = p5;
    this.vertices = [];
    this._colour = colour;
  }

  set colour(colour) {
    this._colour = colour;
  }

  addVertex(v = { x: 0, y: 0 }) {
    this.vertices.push(v);
  }

  draw(pos = { x: 0, y: 0 }) {
    this.p5.push();
    if (this._colour) {
      this.p5.fill(this._colour);
    }
    this.p5.beginShape();
    this.vertices.forEach(({ x, y }) => this.p5.vertex(x + pos.x, y + pos.y));
    this.p5.endShape(this.p5.CLOSE);
    this.p5.pop();
  }
}

class Ellipse {
  constructor(p5, colour, x, y, w, h) {
    this.p5 = p5;
    this._colour = colour;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  draw(pos = { x: 0, y: 0 }) {
    this.p5.push();
    if (this._colour) {
      this.p5.fill(this._colour);
    }
    this.p5.ellipse(this.x + pos.x, this.y + pos.y, this.w, this.h);
    this.p5.pop();
  }
}

class CompositeShape {
  constructor() {
    this.shapes = [];
  }

  addShape(s) {
    this.shapes.push(s);
  }

  draw(pos = { x: 0, y: 0 }) {
    this.shapes.forEach((s) => s.draw(pos));
  }
}

export { Shape, Ellipse, CompositeShape }; 