const container = document.getElementById("container");

// Config
const config = document.createElement("div");
config.classList.add("config");
config.id = "config";

// Properties
const properties = document.createElement("div");
properties.classList.add("properties");

const delay = document.createElement("input");
delay.classList.add("delay");
delay.label = document.createElement("label");
delay.label.innerHTML = "Delay (ms): 500";
delay.type = "range";
delay.min = 0;
delay.max = 1000;
delay.value = 500;
delay.oninput = () => {
  delay.label.innerHTML = `Delay (ms): ${delay.value}`;
};

const proportion = document.createElement("input");
proportion.classList.add("proportion");
proportion.label = document.createElement("label");
proportion.label.innerHTML = "Proportion: 0.00";
proportion.type = "range";
proportion.min = 0.1;
proportion.max = 0.99;
proportion.value = 0.5;
proportion.step = 0.01;
proportion.oninput = () => {
  proportion.label.innerHTML = `Proportion: ${proportion.value}`;
};

properties.appendChild(delay.label);
properties.appendChild(delay);
properties.appendChild(proportion.label);
properties.appendChild(proportion);
config.appendChild(properties);

//Canvas
const canvasHTML = document.createElement("canvas");
//canvasHTML.width = 800;
//canvasHTML.height = 600;
canvasHTML.width = window.innerWidth * 0.99;
canvasHTML.height = window.innerHeight-120;
canvasHTML.role = "application";
canvasHTML.tabIndex = 0;
canvasHTML.ariaLabel = "Chaos Game";
const ctx = canvasHTML.getContext("2d");

// Controls
const control = document.createElement("div");
control.classList.add("control");

const start = document.createElement("button");
start.classList.add("start");
start.innerHTML = "Start";
start.addEventListener("click", () => {
  canvas.drawCustom();
});

const finish = document.createElement("button");
finish.classList.add("finish");
finish.disabled = true;
finish.innerHTML = "Finish";
let finishClicked = false;
finish.addEventListener("click", () => {
  finishClicked = true;
});

const reset = document.createElement("button");
reset.classList.add("reset");
reset.disabled = true;
reset.innerHTML = "Reset";
reset.addEventListener("click", () => {
  Canvas.clear();
});

const download = document.createElement("button");
download.classList.add("download");
download.innerHTML = "Download";
download.addEventListener("click", () => {
  Canvas.download();
});

control.appendChild(start);
control.appendChild(finish);
control.appendChild(reset);
control.appendChild(download);

container.appendChild(config);
container.appendChild(canvasHTML);
container.appendChild(control);

class Canvas {
  points = [];
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.canvas.addEventListener("click", (e) => {
      this.drawPoint(e.offsetX, e.offsetY, "red", 5);
    });
  }

  initJob(pointCount, coords, proportion) {
    isDisabled(true);
    Canvas.clear();

    const job = new Job(pointCount, proportion, coords);

    // draw initial points
    coords.forEach((point) => {
      this.drawPoint(point.x, point.y, "red", 5);
    });

    job.start();
  }

  drawPoint(x, y, color = "yellow", size = 2) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    this.points.push({ x: x, y: y });
  }

  drawTriangle() {
    const triangleCoords = [
      { x: canvasHTML.width/2, y: canvasHTML.height * 0.1 },
      { x: canvasHTML.width * 0.1, y: canvasHTML.height * 0.9 },
      { x: canvasHTML.width * 0.9, y: canvasHTML.height * 0.9 },
    ];
    this.initJob(3, triangleCoords, proportion.value);
  }

  drawSquare() {
    const squareCoords = [
      { x: canvasHTML.width * 0.1, y: canvasHTML.height * 0.1 },
      { x: canvasHTML.width * 0.9, y: canvasHTML.height * 0.1 },
      { x: canvasHTML.width * 0.9, y: canvasHTML.height * 0.9 },
      { x: canvasHTML.width * 0.1, y: canvasHTML.height * 0.9 },
    ];
    this.initJob(4, squareCoords, proportion.value);
  }

  drawHexagon() {
    const hexagonCoords = [
      { x: canvasHTML.width/2, y: canvasHTML.height * 0.1 },
      { x: canvasHTML.width * 0.9, y: canvasHTML.height * 0.3 },
      { x: canvasHTML.width * 0.9, y: canvasHTML.height * 0.7 },
      { x: canvasHTML.width/2, y: canvasHTML.height * 0.9 },
      { x: canvasHTML.width * 0.1, y: canvasHTML.height * 0.7 },
      { x: canvasHTML.width * 0.1, y: canvasHTML.height * 0.3 },
    ];
    this.initJob(6, hexagonCoords, proportion.value);
  }

  drawCustom() {
    const customCoords = this.points;
    if (customCoords.length < 3) {
      alert("Please add at least 3 points");
      return;
    }
    this.initJob(customCoords.length, customCoords, proportion.value);
  }

  resetPoints() {
    this.points = [];
  }

  static download() {
    const link = document.createElement("a");
    link.download = `ChaosGame_${Date.now()}.png`;
    link.href
    = canvasHTML
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
    link.click();
  }

  static clear() {
    ctx.clearRect(0, 0, canvasHTML.width, canvasHTML.height);
  }

  static random(points) {
    return points[Math.floor(Math.random() * points.length)];
  }
}

const canvas = new Canvas(canvasHTML, ctx);

// Premade shapes
const shapes = document.createElement("div");

const triangle = document.createElement("button");
triangle.innerHTML = "🔺";
triangle.addEventListener("click", () => {
  canvas.drawTriangle();
});

const square = document.createElement("button");
square.innerHTML = "🟥";
square.addEventListener("click", () => {
  canvas.drawSquare();
});

const hexagon = document.createElement("button");
hexagon.innerHTML = "🔶";
hexagon.addEventListener("click", () => {
  canvas.drawHexagon();
});

shapes.classList.add("shapes");
shapes.appendChild(triangle);
shapes.appendChild(square);
shapes.appendChild(hexagon);
config.appendChild(shapes);

const controller = new AbortController();

function isDisabled(bool) {
  proportion.disabled = bool;
  start.disabled = bool;
  finish.disabled = !bool;
  reset.disabled = bool;
  square.disabled = bool;
  triangle.disabled = bool;
  hexagon.disabled = bool;
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Job {
  resultPoints = [];
  constructor(pointCount, pointProportion, pointCoordinates) {
    this.pointCount = pointCount;
    this.pointProportion = pointProportion;
    this.pointCoordinates = pointCoordinates;
  }
  getPointCount() {
    return this.pointCount;
  }
  getPointProportion() {
    return this.pointProportion;
  }
  getPointCoordinates() {
    return this.pointCoordinates;
  }

  async start() {
    const pointCount = this.getPointCount();
    const pointProportion = this.getPointProportion();
    const pointCoordinates = this.getPointCoordinates();
    const resultPoints = [];

    let randomStartPoint = Canvas.random(pointCoordinates);
    let startPoint = new Point(randomStartPoint.x, randomStartPoint.y);

    let randomTargetPoint = Canvas.random(
      pointCoordinates.filter((point) => {
        return point.x !== randomStartPoint.x && point.y !== randomStartPoint.y;
      })
    );
    const firstTargetPoint = new Point(
      randomTargetPoint.x,
      randomTargetPoint.y
    );

    const currentPoint = new Point();
    currentPoint.x =
      (firstTargetPoint.x - startPoint.x) * pointProportion + startPoint.x;
    currentPoint.y =
      (firstTargetPoint.y - startPoint.y) * pointProportion + startPoint.y;

    resultPoints.push(new Point(currentPoint.x, currentPoint.y));

    // create other points with current point as target
    await this.doRest(
      currentPoint,
      startPoint,
      pointProportion,
      pointCoordinates,
      resultPoints
    );

    this.resultPoints = resultPoints;
    isDisabled(false);
  }

  async doRest(
    currentPoint,
    startPoint,
    pointProportion,
    pointCoordinates,
    resultPoints
  ) {
    for (let i = 0; i < Job.iterations(); i++) {
      let randomPoint = Canvas.random(pointCoordinates);
      startPoint = new Point(randomPoint.x, randomPoint.y);

      currentPoint.x =
        (currentPoint.x - startPoint.x) * pointProportion + startPoint.x;
      currentPoint.y =
        (currentPoint.y - startPoint.y) * pointProportion + startPoint.y;

      resultPoints.push(new Point(currentPoint.x, currentPoint.y));

      canvas.drawPoint(currentPoint.x, currentPoint.y, "yellow", 2);

      if (finishClicked) {
        clearTimeout();
      } else {
        await new Promise((resolve) => setTimeout(resolve, delay.value));
      }
    }
    finishClicked = false;
    finish.disabled = true;
    return resultPoints;
  }

  static iterations() {
    return 100000;
  }
}
