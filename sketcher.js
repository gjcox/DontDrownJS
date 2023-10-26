const RSW_DEF_DIV = 500; // default rough stroke weight divider
const RSV_MIN = 0.15; // minimum rough stroke variability
const RSV_MAX = 0.6; // maximum rough stroke variability
const RSS_MIN = 1; // rough stroke shakiness minimum
const RSS_MAX = 5; // rough stroke shakiness maximum

var RSW_DEF; // default rough stroke weight
var _roughStrokeWeight; // the base weight of hand drawn lines

var roughStrokeVariabilityRate = RSV_MIN; // the max proportion of rough stroke weight to deviate from the smooth line 
var roughStrokeShakiness = RSS_MIN; // the maximum number of jags in a rough line

/* The absolute max deviation from a smooth line */
const roughStrokeVariability = () =>
  _roughStrokeWeight * roughStrokeVariabilityRate;  

/* A random distance to offset a vertex in a hand drawn line, bounded by +-rsv */
const deviation = () => {
  let rsv = roughStrokeVariability();
  return -rsv + Math.random() * 2 * rsv;
};


/**
  * Sketcher class handles drawing lines and objects in the "hand drawn" art style. 
  */
class Sketcher {
  constructor(p) {
    this.p = p;
  }

  get roughStrokeWeight() {
    return _roughStrokeWeight;  
  }
  
  set roughStrokeWeight(newWeight) {
    _roughStrokeWeight = newWeight;
  }

  /* Generates a sin wave as a set of points, for use in Wave token generation */
  sinWave(waveWidth, nSections, sectionDepth, verticesPerSection, startOffset) {
    let nVertices = nSections * verticesPerSection;
    let vertices = [];
    let xIncr = waveWidth / (nVertices - 1);
    for (let i = 0; i < nVertices; i++) {
      vertices[i] = this.p.createVector(
        i * xIncr,
        sectionDepth *
          this.p.sin(
            this.p.TAU *
              (((i + startOffset) % (2 * verticesPerSection)) /
                (2 * verticesPerSection))
          )
      );
    }
    return vertices;
  }

  
  
  buildDualWeightedLine(start, end, startWeight, endWeight) {
    let heading = start.copy().sub(end).heading();
    heading += this.p.HALF_PI;

    let startPadding = p5.Vector.fromAngle(heading).mult(startWeight);
    let endPadding = p5.Vector.fromAngle(heading).mult(endWeight);

    let topLeft = start.copy().sub(startPadding);
    let topRight = end.copy().sub(endPadding);
    let bottomRight = end.copy();
    let bottomLeft = start.copy();

    let corners = [topLeft, topRight, bottomRight, bottomLeft];

    const line = new Shape(this.p);
    corners.forEach((v) => line.addVertex([v.x, v.y]));
    return line;
  }

  /*
   * Returns a jagged quasi-quadrilateral to act as a hand-drawn line.
   * The top and bottom edges (those parallel to start -> end) will be jagged, and the
   * left and right edges will be straight.
   *
   * N.B. Expects roughStrokeWeight to have been set prior to call
   */
  buildHandDrawnLine(start, end, colour) {
    let handDrawnLine = new Shape(this.p, colour);
    let smoothLine = start.copy().sub(end);
    let smoothLineLength = smoothLine.mag();
    let heading = smoothLine.heading() + this.p.HALF_PI;
    let padding = p5.Vector.fromAngle(heading).mult(this.roughStrokeWeight);

    let nSections, nextVertex, direction;

    let jaggedLine = () => {
      for (let i = 0; i < nSections; i++) {
        nextVertex = nextVertex.add(
          direction.copy().mult(this.p.random(0, smoothLineLength / nSections))
        );
        handDrawnLine.addVertex([
          nextVertex.x + deviation(),
          nextVertex.y + deviation(),
        ]);
      }
    };

    /* topLeft is not necessarily the top left corner, but it's easier to keep track
     * of than just numbering the corners */
    let topLeft = start.copy().sub(padding);
    let topRight = end.copy().sub(padding);
    let bottomRight = end.copy();
    let bottomLeft = start.copy();

    handDrawnLine.addVertex([topLeft.x, topLeft.y]); // top left corner

    // draw a jagged line between top left and top right
    nSections = Math.round(this.p.random(0, roughStrokeShakiness));
    nextVertex = topLeft.copy();
    direction = topRight.copy().sub(topLeft).normalize();
    jaggedLine();

    // draw a straight line between top right and bottom right
    handDrawnLine.addVertex([topRight.x, topRight.y]);
    handDrawnLine.addVertex([bottomRight.x, bottomRight.y]);

    // draw a jagged line between bottom right and bottom left
    nSections = Math.round(this.p.random(0, roughStrokeShakiness));
    nextVertex = bottomRight.copy();
    direction = bottomLeft.copy().sub(bottomRight).normalize();
    jaggedLine();

    // draw a straight line between bottom left and top left
    handDrawnLine.addVertex([bottomLeft.x, bottomLeft.y]);
    return handDrawnLine;
  }

  /**
   * Returns a "hand drawn" shape.
   * @param type QUAD, RECT, ELLIPSE, or WAVE
   * @param strokeColour
   * @param fillColour
   * @param for QUAD: x1, y1, x2, y2, x3, y3, x4, y4;
   *        for RECT: x, y, width, height;
   *        for ELLIPSE: vertices, x, y, width, height;
   *        for WAVE: width, height, nSections, sectionDepth, verticesPerSection, startOffset;
   * @return
   */
  buildHandDrawnShape(type, strokeColour, fillColour, ...params) {
    switch (type) {
      case QUAD:
        if (params.length != 8) {
          throw Error(
            "handDraw(QUAD) requires 8 floats in params, got " + params.length
          );
        } else {
          var quad = new CompositeShape();

          // add the fill
          let quadFill = new Shape(this.p, fillColour);
          for (let i = 0; i < 8; i += 2) {
            quadFill.addVertex([params[i], params[i + 1]]);
          }
          quad.addShape(quadFill);

          // add the hand drawn edges
          for (let i = 0; i < 8; i += 2) {
            let line = this.buildHandDrawnLine(
              this.p.createVector(params[i], params[i + 1]),
              this.p.createVector(params[(i + 2) % 8], params[(i + 3) % 8]),
              strokeColour
            );
            quad.addShape(line);
          }

          return quad;
        }
      case RECT:
        if (params.length != 4) {
          throw new Error(
            "handDraw(RECT) requires 4 floats in params, got " + params.length
          );
        } else {
          // (x, y) is the top left corner of the rectangle
          const [x, y, w, h] = params;
          return this.buildHandDrawnShape(
            QUAD,
            strokeColour,
            fillColour,
            x,
            y,
            x + w,
            y,
            x + w,
            y + h,
            x,
            y + h
          );
        }
      case ELLIPSE:
        // params : vertices, x, y, width, height
        if (params.length != 5) {
          throw new Error(
            "handDraw(ELLIPSE) requires 5 floats in params, got " +
              params.length
          );
        } else {
          const [nVertices, x, y, w, h] = params;
          var ellipse = new CompositeShape();

          // add the fill
          let ellipseFill = new Ellipse(this.p, fillColour, x, y, w, h);
          ellipse.addShape(ellipseFill);

          // add the hand drawn edge as a series of straight lines of variable weight
          const halfW = w / 2;
          const halfH = h / 2;
          var currVertex = this.p.createVector(
            x + halfW * this.p.cos(0),
            y + halfH * this.p.sin(0)
          );
          var nextVertex = this.p.createVector();
          var startWeight = this.roughStrokeWeight;
          var endWeight = this.roughStrokeWeight + deviation();

          for (let i = 1; i <= nVertices; i++) {
            let angle = (i * this.p.TAU) / nVertices;
            nextVertex.x = x + halfW * this.p.cos(angle);
            nextVertex.y = y + halfH * this.p.sin(angle);

            let line = this.buildDualWeightedLine(
              currVertex,
              nextVertex,
              startWeight,
              endWeight
            );
            line.colour = strokeColour;
            ellipse.addShape(line);

            currVertex.x = nextVertex.x;
            currVertex.y = nextVertex.y;
            startWeight = endWeight;
            endWeight = this.roughStrokeWeight + deviation();
          }

          return ellipse;
        }
      case WAVE:
        if (params.length != 6) {
          throw Error(
            "handDraw(WAVE) requires 6 floats in params, got " + params.length
          );
        } else {
          const [
            w,
            h,
            nCrests,
            crestDepth,
            verticesPerCrest,
            startOffset,
          ] = params;
          const wave = new CompositeShape();
          const smoothWaveVertices = this.sinWave(
            w,
            nCrests,
            crestDepth,
            verticesPerCrest,
            startOffset
          );

          // add the fill
          const waveFill = new Shape(this.p, fillColour);
          for (let vertex of smoothWaveVertices) {
            waveFill.addVertex([vertex.x, vertex.y]);
          }
          waveFill.addVertex([params[0], params[1]]);
          waveFill.addVertex([0, params[1]]);
          wave.addShape(waveFill);

          // add the hand drawn edge as a series of straight lines of variable weight
          var startWeight = this.roughStrokeWeight;
          var endWeight = this.roughStrokeWeight + deviation();
          for (let i = 0; i < smoothWaveVertices.length - 1; i++) {
            let line = this.buildDualWeightedLine(
              smoothWaveVertices[i],
              smoothWaveVertices[i + 1],
              startWeight,
              endWeight
            );
            line.colour = strokeColour;
            wave.addShape(line);

            startWeight = endWeight;
            endWeight = this.roughStrokeWeight + deviation();
          }

          return wave;
        }
      default:
        throw new Error(
          "handDraw() only works with QUAD, RECT, ELLIPSE and WAVE objects"
        );
    }
  }
}
