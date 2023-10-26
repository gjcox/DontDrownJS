class Shape {
  constructor(p, colour) {
    this.p = p;
    this.vertices = [];
    this._colour = colour;
  }

  set colour(colour) {
    this._colour = colour;
  }

  addVertex(v) {
    this.vertices.push(v);
  }

  draw(pos = { x: 0, y: 0 }) {
    if (this._colour) {
      this.p.fill(this._colour);
    }
    this.p.beginShape();
    this.vertices.forEach(([x, y]) => this.p.vertex(x + pos.x, y + pos.y));
    this.p.endShape(this.p.CLOSE);
  }
}

class Ellipse {
  constructor(p, colour, x, y, w, h) {
    this.p = p;
    this._colour = colour;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  draw(pos = { x: 0, y: 0 }) {
    if (this._colour) {
      this.p.fill(this._colour);
    }
    this.p.ellipse(this.x + pos.x, this.y + pos.y, this.w, this.h);
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
