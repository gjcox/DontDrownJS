import { Shape } from "./shapes";

const DEF_LINE_WEIGHT_DIV = 500; // default rough stroke weight divider relative to canvas width
const LINE_DEV_MULT_MIN = 0.15; // min magnitude of breaks as proportion of line thickness
const LINE_DEV_MULT_MAX = 0.6; // absolute max magnitude of breaks as proportion of line thickness
const LINE_BREAKS_MIN = 1; // minimum number of breaks in sketched line   
const LINE_BREAKS_MAX = 5; // maximum number of breaks in sketched line 

export default class Sketcher {
    constructor(p5) {
        this.p5 = p5;
        this.defLineWeight = p5.width / DEF_LINE_WEIGHT_DIV; // default mean thickness of sketched lines 
        this.lineDeviationMult = LINE_DEV_MULT_MIN; // [0..lineDeviationMult] magnitude of breaks as proportion of line thickness 
        this.lineBreaksMax = LINE_BREAKS_MIN; // [0..lineBreaksMax] breaks in sketched lines 
    }

    /* */
    /**
     * A random distance to offset a vertex in a jagged line
     * @param {*} lineWeight 
     * @returns random value from [-lineWeight * this.lineDeviationMult..-lineWeight * this.lineDeviationMult]
     */
    deviation = (lineWeight = this.defLineWeight) => {
        let maxDeviation = this.lineDeviationMult * lineWeight;
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
        corners.forEach((v) => line.addVertex([v.x, v.y]));
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
     * @returns an array of [x,y] coordinates
     */
    buildJaggedEdge(start, end, lineWeight) {
        const smoothLine = end.copy().sub(start);
        const smoothLineLength = smoothLine.mag();
        const direction = smoothLine.normalize();
        const offsetDirection = direction.copy().rotate(this.p5.HALF_PI);
        const nBreaks = Math.round(Math.random() * this.lineBreaksMax);
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
            jaggedEdgeVertices.push([offsetVertex.x, offsetVertex.y,]);
        }

        return jaggedEdgeVertices;
    };

    /**
     * Builds a jagged quasi-quadrilateral to act as a sketched line.
     * The top and bottom edges (those parallel to start -> end) will be jagged, and the
     * perpendicular edges will be straight.
     * @param {*} start the 'bottom left' corner of the sketched line 
     * @param {*} end the 'bottom right' corner of the sketched line 
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
        sketchedLine.addVertex([topLeft.x, topLeft.y]);

        // draw a jagged line between top left and top right
        this.buildJaggedEdge(topLeft, topRight, lineWeight).forEach(xy => sketchedLine.addVertex(xy));

        // straight line between top right and bottom right
        sketchedLine.addVertex([topRight.x, topRight.y]);
        sketchedLine.addVertex([bottomRight.x, bottomRight.y]);

        // draw a jagged line between bottom right and bottom left
        this.buildJaggedEdge(bottomRight, bottomLeft, lineWeight).forEach(xy => sketchedLine.addVertex(xy));

        // finish on bottom left corner 
        sketchedLine.addVertex([bottomLeft.x, bottomLeft.y]);
        return sketchedLine;
    }
}