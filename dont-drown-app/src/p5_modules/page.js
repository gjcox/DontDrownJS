import Menu from "./menu";

const PAGE_COLOUR = 'lightgoldenrodyellow';
const LINE_WEIGHT = 1;
const LINE_COLOUR = 'gray';
const MARGIN_COLOUR = 'firebrick';

function lineGap() {
    const el = document.getElementById(Menu.gameMenuID());
    const fontSize = parseInt(window.getComputedStyle(el).fontSize);
    return fontSize;
}

function topLineGap() {
    const titleEl = document.getElementById(Menu.titleID());
    const titleFontSize = parseInt(window.getComputedStyle(titleEl).fontSize);
    return 1.5 * titleFontSize;
}

function renderPage(p5, virtualTop, marginX) {
    const _lineGap = lineGap();
    const _topLineGap = topLineGap();

    // render page colour 
    p5.background(PAGE_COLOUR);

    // render horizontal ruled lines 
    p5.push();
    p5.stroke(LINE_COLOUR);
    p5.strokeWeight(LINE_WEIGHT);
    const topLineY = Math.abs(virtualTop) <= _topLineGap ?
        virtualTop + _topLineGap :
        _lineGap - (Math.abs(virtualTop) - _topLineGap) % _lineGap;
    var lineY = topLineY;
    while (lineY <= p5.height) {
        p5.line(0, lineY, p5.width, lineY);
        lineY += _lineGap;
    }
    p5.pop();

    // render margin 
    p5.push();
    p5.stroke(MARGIN_COLOUR);
    p5.strokeWeight(LINE_WEIGHT);
    p5.line(marginX, 0, marginX, p5.height);
    p5.pop();
}

export { LINE_WEIGHT, lineGap, renderPage, topLineGap };

