let sketch = function (p) {
  var sketcher;
  var start, end;
  var counter = 0;
  var dualWeightedLine,
    handDrawnLine,
    handDrawnQuad,
    handDrawnRect,
    handDrawnEllipse,
    wave,
    platform;

  p.setup = function () {
    p.createCanvas(400, 400);
    sketcher = new Sketcher(p);
    start = p.createVector(40, 50);
    end = p.createVector(30, 20);
    dualWeightedLine = sketcher.buildDualWeightedLine(start, end, 10, 20);
    p.noStroke();
    platform = new Platform(p, sketcher, 200, 200);
  };

  p.draw = function () {
    sketcher.roughStrokeWeight = 5;

    if (counter++ % 30 == 0) {
      handDrawnLine = sketcher.buildHandDrawnLine(
        p.createVector(100, 100),
        p.createVector(200, 200)
      );
      handDrawnQuad = sketcher.buildHandDrawnShape(
        QUAD,
        "blue",
        "pink",
        275,
        300,
        375,
        300,
        350,
        350,
        300,
        350
      );
      handDrawnRect = sketcher.buildHandDrawnShape(
        RECT,
        "green",
        "orange",
        300,
        200,
        50,
        50
      );
      handDrawnEllipse = sketcher.buildHandDrawnShape(
        ELLIPSE,
        "salmon",
        "magenta",
        15,
        100,
        200,
        50,
        75
      );
      wave = sketcher.buildHandDrawnShape(
        WAVE,
        "aliceblue",
        "cornflowerblue",
        400,
        175,
        12,
        10,
        13,
        counter
      );
    }
    p.background(220);
    wave.draw({ x: 0, y: 350 });
    p.fill("black");
    dualWeightedLine.draw({
      x: (counter++ / 30) % 400,
      y: (counter++ / 30) % 400,
    });
    handDrawnLine.draw();
    handDrawnQuad.draw();
    handDrawnRect.draw();
    handDrawnEllipse.draw();
    platform.draw();
  };
};

let test = function (p) {
  var sketcher;

  p.setup = function () {
    p.createCanvas(600, 600);
    p.noStroke();

    sketcher = new Sketcher(p);
    RSW_DEF = 2; 
    sketcher.roughStrokeWeight = RSW_DEF;
    platform = new Platform(p, sketcher, 200, 200);
  };

  p.draw = function () {
    p.background(220);
    platform.render();
  };
};

let myp5 = new p5(test);
