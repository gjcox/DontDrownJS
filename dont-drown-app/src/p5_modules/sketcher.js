import { CompositeShape, Shape } from "./shapes";

const DEF_LINE_WEIGHT_DIV = 500; // default rough stroke weight divider relative to canvas width
const LINE_DEV_MULT_MIN = 0.15; // min magnitude of breaks as proportion of line thickness
const LINE_DEV_MULT_MAX = 0.6; // absolute max magnitude of breaks as proportion of line thickness
const LINE_BREAKS_MIN = 1; // minimum number of breaks in sketched line   
const LINE_BREAKS_MAX = 5; // maximum number of breaks in sketched line 

export default class Sketcher {
    constructor(p5) {
        this.p5 = p5;
        this._defLineWeight = p5.width / DEF_LINE_WEIGHT_DIV; // default mean thickness of sketched lines 
        this._lineDeviationMult = LINE_DEV_MULT_MIN; // [0..lineDeviationMult] magnitude of breaks as proportion of line thickness 
        this._lineBreaksUpperBound = LINE_BREAKS_MIN; // [0.._lineBreaksUpperBound] breaks in sketched lines 
    }

    get defLineWeight() {
        return this._defLineWeight;
    }

    set lineDeviationMult(fraction =0 ) {
        this._lineDeviationMult = LINE_DEV_MULT_MIN +
            fraction * (LINE_DEV_MULT_MAX - LINE_DEV_MULT_MIN);
    }

    set lineBreaksMax(fraction =0) {
        this._lineBreaksUpperBound = LINE_BREAKS_MIN +
            fraction * (LINE_BREAKS_MAX - LINE_BREAKS_MIN);
    }

    /* */
    /**
     * A random distance to offset a vertex in a jagged line
     * @param {*} lineWeight 
     * @returns random value from [-lineWeight * this.lineDeviationMult..-lineWeight * this.lineDeviationMult]
     */
    deviation = (lineWeight = this.defLineWeight) => {
        let maxDeviation = this._lineDeviationMult * lineWeight;
        return -maxDeviation + Math.random() * 2 * maxDeviation;
    };

    /**
     * Builds a line that evenly changes thickness from start to end. 
     * @param {*} start logically the bottom left corner 
     * @param {*} end logically the bottom right corner 
     * @param {*} startWeight line thickness at start 
     * @param {*} endWeight line thickness at end 
     * @returns a Shape object  
     */
    buildDualWeightedLine(start, end, startWeight, endWeight) {
        // perpendicular to line direction 
        const paddingDirection = start.copy().sub(end).rotate(this.p5.HALF_PI).normalize();

        const startPadding = paddingDirection.copy().mult(startWeight);
        const endPadding = paddingDirection.copy().mult(endWeight);

        const topLeft = start.copy().sub(startPadding);
        const topRight = end.copy().sub(endPadding);
        const bottomRight = end.copy();
        const bottomLeft = start.copy();

        const corners = [topLeft, topRight, bottomRight, bottomLeft];

        const line = new Shape(this.p5);
        corners.forEach((v) => line.addVertex(v));
        return line;
    }

    /**
     * Generates the vertices of a jagged edge for a sketched line between
     * two points by randomly determining break points in the connecting 
     * straight line and offsetting each break by a random amount.
     * 
     * Returned vertices do not include the start and end vertices of the edge. 
     *  
     * @param {*} start a p5.Vector 
     * @param {*} end a p5.Vector 
     * @returns an array of p5.Vector objects 
     */
    buildJaggedEdge(start, end, lineWeight) {
        const smoothLine = end.copy().sub(start);
        const smoothLineLength = smoothLine.mag();
        const direction = smoothLine.normalize();
        const offsetDirection = direction.copy().rotate(this.p5.HALF_PI);
        const nBreaks = Math.round(Math.random() * this._lineBreaksUpperBound);
        const jaggedEdgeVertices = [];

        var nextVertex = start.copy();
        for (let i = 0; i < nBreaks; i++) {
            // set nextVertex to next point on straight line 
            nextVertex.add(
                direction.copy().mult(this.p5.random(0, smoothLineLength / nBreaks))
            );
            // offset it perpendicular to the straight line 
            const offset = offsetDirection.copy().mult(this.deviation(lineWeight));
            const offsetVertex = nextVertex.copy().add(offset);
            // add offset vertex to jagged line 
            jaggedEdgeVertices.push(offsetVertex);
        }

        return jaggedEdgeVertices;
    }

    /**
     * Builds a jagged quasi-quadrilateral to act as a sketched line.
     * The top and bottom edges (those parallel to start -> end) will be jagged, and the
     * perpendicular edges will be straight.
     * @param {*} start a p5.Vector; the 'bottom left' corner of the sketched line 
     * @param {*} end a p5.Vector; the 'bottom right' corner of the sketched line 
     * @param {*} colour 
     * @param {*} lineWeight the thickness of the line at the smooth edges 
     * @returns a Shape object 
     */
    buildSketchedLine(start, end, colour, lineWeight = this.defLineWeight) {
        // the padding vector is essentially the straight edges at the start and end of the line 
        const padding = start.copy().sub(end).rotate(this.p5.HALF_PI).normalize().mult(lineWeight);

        const sketchedLine = new Shape(this.p5, colour);

        /* topLeft is not necessarily the top left corner, but it's easier to keep track
        * of than just numbering the corners */
        const topLeft = start.copy().sub(padding);
        const topRight = end.copy().sub(padding);
        const bottomRight = end.copy();
        const bottomLeft = start.copy();

        // start at top left corner
        sketchedLine.addVertex(topLeft);

        // draw a jagged line between top left and top right
        this.buildJaggedEdge(topLeft, topRight, lineWeight).forEach(xy => sketchedLine.addVertex(xy));

        // straight line between top right and bottom right
        sketchedLine.addVertex(topRight);
        sketchedLine.addVertex(bottomRight);

        // draw a jagged line between bottom right and bottom left
        this.buildJaggedEdge(bottomRight, bottomLeft, lineWeight).forEach(xy => sketchedLine.addVertex(xy));

        // finish on bottom left corner 
        sketchedLine.addVertex(bottomLeft);
        return sketchedLine;
    }

    /**
     * 
     * @param {*} strokeColour 
     * @param {*} fillColour 
     * @param {*} lineWeight the average thickness of edge lines
     * @param {p5.Vector[]} corners four p5.Vectors 
     * @returns 
     */
    buildSketchedQuad(strokeColour, fillColour, corners, lineWeight = this.defLineWeight) {
        const quad = new CompositeShape();

        // add the fill
        const quadFill = new Shape(this.p5, fillColour);
        for (let corner of corners) {
            quadFill.addVertex(corner);
        }
        quad.addShape(quadFill);

        // add the sketched edges
        for (let i = 0; i < 4; i++) {
            const line = this.buildSketchedLine(
                corners[i],
                corners[(i + 1) % 4],
                strokeColour,
                lineWeight
            );
            quad.addShape(line);
        }

        return quad;
    }

    /**
     * 
     * @param {*} strokeColour 
     * @param {*} fillColour 
     * @param {*} x of top-left corner
     * @param {*} y of top-left corner
     * @param {*} w width
     * @param {*} h height 
     * @param {*} lineWeight 
     * @returns 
     */
    buildSketchedRect(strokeColour, fillColour, x, y, w, h, lineWeight = this.defLineWeight) {
        return this.buildSketchedQuad(
            strokeColour,
            fillColour,
            [this.p5.createVector(x, y),
            this.p5.createVector(x + w, y),
            this.p5.createVector(x + w, y + h),
            this.p5.createVector(x, y + h)],
            lineWeight
        );
    }

    /**
     * 
     * @param {*} strokeColour 
     * @param {*} fillColour 
     * @param {*} x centre
     * @param {*} y centre 
     * @param {*} w width
     * @param {*} h  height 
     * @param {*} detail number of sides/vertices 
     * @param {*} lineWeight 
     */
    buildSketchedEllipse(strokeColour, fillColour, x, y, w, h, detail, lineWeight = this.defLineWeight) {
        const ellipse = new CompositeShape();

        const fillVertices = [];
        const outerVertices = [];
        const innerVertices = [];
        const outerHalfW = w / 2;
        const outerHalfH = h / 2;

        /* build three ellipses (fill, outer and inner) as series of 
           straight lines */
        for (let i = 0; i < detail; i++) {
            const angle = (i * this.p5.TAU) / detail;
            // generate a smooth polygon around the origin 
            const centredVertex = this.p5.createVector(
                outerHalfW * this.p5.cos(angle),
                outerHalfH * this.p5.sin(angle)
            );

            /* for the fill, just change the centre to x,y */
            fillVertices.push(this.p5.createVector(x, y).add(centredVertex));

            /* for the outer edge of the outline, change the centre to x,y 
               and add random deviation */
            outerVertices.push(this.p5.createVector(
                x + this.deviation(lineWeight) / 2,
                y + this.deviation(lineWeight) / 2).add(centredVertex));

            /* for the inner edge, limit the magnitude to (outer radius
               - lineWeight), then change centre and add deviation */
            const outerRadius = centredVertex.mag();
            const innerRadius = outerRadius - lineWeight;
            centredVertex.limit(innerRadius);
            innerVertices.push(this.p5.createVector(
                x + this.deviation(lineWeight) / 2,
                y + this.deviation(lineWeight) / 2).add(centredVertex));
        }

        // add the fill 
        const fill = new Shape(this.p5, fillColour);
        fillVertices.forEach(v => fill.addVertex(v));
        ellipse.addShape(fill);

        // add the outline 
        /* construct filled outline shape as a techincally open loop, 
           but the two ends touch to appear like a closed loop */
        const outline = new Shape(this.p5, strokeColour);
        outerVertices.forEach(v => outline.addVertex(v));
        outerVertices.slice(0, 1).forEach(v => outline.addVertex(v))
        innerVertices.slice(0, 1).forEach(v => outline.addVertex(v))
        innerVertices.reverse();
        innerVertices.forEach(v => outline.addVertex(v));
        ellipse.addShape(outline);

        return ellipse;
    }

    /* Generates a sin wave as a set of points, for use in buildSketchedWave() */
    buildSinWave(waveWidth, nCrests, crestHeight, detail, startOffset) {
        let nVertices = nCrests * detail;
        let vertices = [];
        let xIncr = waveWidth / (nVertices - 1);
        for (let i = 0; i < nVertices; i++) {
            vertices.push(this.p5.createVector(
                i * xIncr,
                crestHeight *
                this.p5.sin(
                    this.p5.TAU *
                    (((i + startOffset) % (2 * detail)) /
                        (2 * detail))
                )
            ));
        }
        return vertices;
    }

    /**
     * 
     * @param {*} strokeColour 
     * @param {*} fillColour 
     * @param {*} w width
     * @param {*} h height
     * @param {*} nCrests number of crests 
     * @param {*} crestHeight 
     * @param {*} detail vertices per crest 
     * @param {*} startOffset horizontal offset of sin wave 
     * @param {*} lineWeight 
     * @returns 
     */
    buildSketchedWave(strokeColour, fillColour, w, h, nCrests, crestHeight, detail, startOffset, lineWeight = this.defLineWeight) {
        const sketchedWave = new CompositeShape();
        const smoothWaveVertices = this.buildSinWave(
            w,
            nCrests,
            crestHeight,
            detail,
            startOffset
        );

        // add fill 
        const waveFill = new Shape(this.p5, fillColour);
        smoothWaveVertices.forEach(v => waveFill.addVertex(v))
        waveFill.addVertex(this.p5.createVector(w, h)); // bottom right corner 
        waveFill.addVertex(this.p5.createVector(0, h)); // bottom left corner 
        sketchedWave.addShape(waveFill);

        // add sketched top line 
        const upperEdge = smoothWaveVertices.map(v => v.copy()
            .add(this.deviation(lineWeight) / 2, this.deviation(lineWeight) / 2));
        const lowerEdge = smoothWaveVertices.map(v =>
            v.copy().add(0, lineWeight)
                .add(this.deviation(lineWeight) / 2, this.deviation(lineWeight) / 2));
        lowerEdge.reverse();
        const sketchedLine = new Shape(this.p5, strokeColour);
        upperEdge.forEach(v => sketchedLine.addVertex(v));
        lowerEdge.forEach(v => sketchedLine.addVertex(v));
        sketchedWave.addShape(sketchedLine);

        return sketchedWave;
    }
}