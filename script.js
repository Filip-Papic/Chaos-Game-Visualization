const container = document.getElementById("container");

// Config
const config = document.createElement("div");
config.id = "config";

/// Delay
const delay = document.createElement("input");
delay.label = document.createElement("label");
delay.label.innerHTML = "Delay (ms): 500";
delay.type = "range";
delay.min = 0;
delay.max = 1000;
delay.value = 500;
delay.oninput = () => {
  delay.label.innerHTML = `Delay (ms): ${delay.value}`;
};

/// Distance
const distance = document.createElement("input");
distance.label = document.createElement("label");
distance.label.innerHTML = "Distance: 0.00";
distance.type = "range";
distance.min = 0.01;
distance.max = 0.99;
distance.value = 0.5;
distance.step = 0.01;
distance.oninput = () => {
  distance.label.innerHTML = `Distance: ${distance.value}`;
};

/// Start
const start = document.createElement("button");
start.innerHTML = "Start";
start.addEventListener("click", () => {
  canvas.drawCustom();
});

/// Early finish
const finish = document.createElement("button");
finish.disabled = true;
finish.innerHTML = "Finish";
let finishClicked = false;
finish.addEventListener("click", () => {
  finishClicked = true;
});

/// Reset
const reset = document.createElement("button");
reset.disabled = true;
reset.innerHTML = "Reset";
reset.addEventListener("click", () => {
  canvas.clear();
});

//Canvas
const canvasHTML = document.createElement("canvas");
canvasHTML.width = 800;
canvasHTML.height = 600;
canvasHTML.role = "application";
canvasHTML.tabIndex = 0;
canvasHTML.ariaLabel = "Chaos Game";
const ctx = canvasHTML.getContext("2d");

container.appendChild(config);
container.appendChild(canvasHTML);

class Canvas {
  points = [];
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.canvas.addEventListener("click", (e) => {
      this.drawPoint(e.offsetX, e.offsetY, "red", 5);
    });
  }

  drawPoint(x, y, color = "yellow", size = 2) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
    this.points.push({ x: x, y: y });
  }

  drawTriangle() {
    const triangleCoords = [
      { x: 400, y: 50 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
    ];
    initJob(3, triangleCoords, 0.5);
  }

  drawSquare() {
    const squareCoords = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 700, y: 500 },
      { x: 100, y: 500 },
    ];
    initJob(4, squareCoords, 0.4);
  }

  drawHexagon() {
    const hexagonCoords = [
      { x: 400, y: 50 },
      { x: 100, y: 200 },
      { x: 100, y: 400 },
      { x: 400, y: 550 },
      { x: 700, y: 400 },
      { x: 700, y: 200 },
    ];
    initJob(6, hexagonCoords, 0.38);
  }

  drawCustom() {
    const customCoords = this.points;
    if (customCoords.length < 3) {
      alert("Please add at least 3 points");
      return;
    }
    initJob(customCoords.length, customCoords, distance.value);
  }

  resetPoints() {
    this.points = [];
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  static random(points) {
    return points[Math.floor(Math.random() * points.length)];
  }
}

const canvas = new Canvas(canvasHTML, ctx);

/// Triangle
const triangle = document.createElement("button");
triangle.innerHTML = "🔺";
triangle.addEventListener("click", () => {
  canvas.drawTriangle();
});
/// Square
const square = document.createElement("button");
square.innerHTML = "🟥";
square.addEventListener("click", () => {
  canvas.drawSquare();
});
/// Hexagon
const hexagon = document.createElement("button");
hexagon.innerHTML = "🟨";
hexagon.addEventListener("click", () => {
  canvas.drawHexagon();
});

config.appendChild(delay.label);
config.appendChild(delay);
config.appendChild(distance.label);
config.appendChild(distance);
config.appendChild(start);
config.appendChild(finish);
config.appendChild(reset);
config.appendChild(triangle);
config.appendChild(square);
config.appendChild(hexagon);

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Job {
  name = "ChaosGame_" + Date.now();
  resultPoints = [];
  constructor(pointCount, pointDistance, pointCoordinates) {
    this.pointCount = pointCount;
    this.pointDistance = pointDistance;
    this.pointCoordinates = pointCoordinates;
  }
  getPointCount() {
    return this.pointCount;
  }
  getPointDistance() {
    return this.pointDistance;
  }
  getPointCoordinates() {
    return this.pointCoordinates;
  }
  static iterations() {
    return 100000;
  }
}

const controller = new AbortController();

function isDisabled(bool) {
  start.disabled = bool;
  finish.disabled = !bool;
  reset.disabled = bool;
  square.disabled = bool;
  triangle.disabled = bool;
  hexagon.disabled = bool;
}

function initJob(pointCount, coords, distance) {
  isDisabled(true);
  canvas.clear();

  const job = new Job(pointCount, distance, coords);

  // draw initial points
  coords.forEach((point) => {
    canvas.drawPoint(point.x, point.y, "red", 5);
  });

  doJob(job);
}

async function doJob(job) {
  const pointCount = job.getPointCount();
  const pointDistance = job.getPointDistance();
  const pointCoordinates = job.getPointCoordinates();
  const resultPoints = [];

  let randomStartPoint = Canvas.random(pointCoordinates);
  let startPoint = new Point(randomStartPoint.x, randomStartPoint.y);

  let randomTargetPoint = Canvas.random(
    pointCoordinates.filter((point) => {
      return point.x !== randomStartPoint.x && point.y !== randomStartPoint.y;
    })
  );
  const firstTargetPoint = new Point(randomTargetPoint.x, randomTargetPoint.y);

  const currentPoint = new Point();
  currentPoint.x =
    (firstTargetPoint.x - startPoint.x) * pointDistance + startPoint.x;
  currentPoint.y =
    (firstTargetPoint.y - startPoint.y) * pointDistance + startPoint.y;

  resultPoints.push(new Point(currentPoint.x, currentPoint.y));

  // create other points with current point as target
  await doRest(
    currentPoint,
    startPoint,
    pointDistance,
    pointCoordinates,
    resultPoints
  );

  job.resultPoints = resultPoints;
  isDisabled(false);
}

const doRest = async (
  currentPoint,
  startPoint,
  pointDistance,
  pointCoordinates,
  resultPoints
) => {
  for (let i = 0; i < Job.iterations(); i++) {
    let randomPoint = Canvas.random(pointCoordinates);
    startPoint = new Point(randomPoint.x, randomPoint.y);

    currentPoint.x =
      (currentPoint.x - startPoint.x) * pointDistance + startPoint.x;
    currentPoint.y =
      (currentPoint.y - startPoint.y) * pointDistance + startPoint.y;

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
};
