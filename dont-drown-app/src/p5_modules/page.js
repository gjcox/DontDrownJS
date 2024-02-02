const PAGE_COLOUR = 'lightgoldenrodyellow';
const LINE_WEIGHT = 1;
const LINE_COLOUR = 'gray';
const MARGIN_COLOUR = 'firebrick';

function renderPage(p5, marginX, lineGap, topLineGap, virtualTop = 0) {
    // render page colour 
    p5.background(PAGE_COLOUR);

    // render horizontal ruled lines 
    p5.push();
    p5.stroke(LINE_COLOUR);
    p5.strokeWeight(LINE_WEIGHT);
    const topLineY = Math.abs(virtualTop) <= topLineGap ?
        virtualTop + topLineGap :
        lineGap - (Math.abs(virtualTop) - topLineGap) % lineGap;
    var lineY = topLineY;
    while (lineY <= p5.height) {
        p5.line(0, lineY, p5.width, lineY);
        lineY += lineGap;
    }
    p5.pop();

    // render margin 
    p5.push();
    p5.stroke(MARGIN_COLOUR);
    p5.strokeWeight(LINE_WEIGHT);
    p5.line(marginX, 0, marginX, p5.height);
    p5.pop();
}

export { LINE_WEIGHT, renderPage };

