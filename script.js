const container = document.getElementById("container");

const config = document.createElement("div");
config.id = "config";
config.innerHTML = "Speed";
const speed = document.createElement("input");
speed.type = "range";
speed.min = 0;
speed.max = 1000;
speed.value = 500;
config.appendChild(speed);
container.appendChild(config);

const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
canvas.role = "application";
canvas.tabIndex = 0;
canvas.ariaLabel = "Chaos Game";
container.appendChild(canvas);

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  draw(color, size) {
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.beginPath();
    //ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI);
    ctx.fillRect(this.x, this.y, size, size);
  }
  static random(points) {
    return points[Math.floor(Math.random() * points.length)];
  }
}

class Job {
  name = "ChaosGame_" + Date.now();
  resultPoints = [];
  constructor(pointNumber, pointDistance, pointCoordinates) {
    this.pointNumber = pointNumber;
    this.pointDistance = pointDistance;
    this.pointCoordinates = pointCoordinates;
  }
  getPointNumber() {
    return this.pointNumber;
  }
  getPointDistance() {
    return this.pointDistance;
  }
  getPointCoordinates() {
    return this.pointCoordinates;
  }
  static iterations() {
    return 1000;
  }
}

function initJob() {
  const pointNumber = 3;
  const pointDistance = 0.5;
  const pointCoordinates = [
    {
      x: 400,
      y: 50,
    },
    {
      x: 100,
      y: 500,
    },
    {
      x: 700,
      y: 500,
    },
  ];
  const job = new Job(pointNumber, pointDistance, pointCoordinates);

  // draw initial points
  pointCoordinates.forEach((point) => {
    new Point(point.x, point.y).draw("red", 5);
  });

  doJob(job);
}

async function doJob(job) {
  const pointNumber = job.getPointNumber();
  const pointDistance = job.getPointDistance();
  const pointCoordinates = job.getPointCoordinates();
  const resultPoints = [];

  let randomStartPoint = Point.random(pointCoordinates);
  let startPoint = new Point(randomStartPoint.x, randomStartPoint.y);

  let randomTargetPoint = Point.random(
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
}

const doRest = async (
  currentPoint,
  startPoint,
  pointDistance,
  pointCoordinates,
  resultPoints
) => {
  for (let i = 0; i < Job.iterations(); i++) {
    let randomPoint = Point.random(pointCoordinates);
    startPoint = new Point(randomPoint.x, randomPoint.y);

    currentPoint.x =
      (currentPoint.x - startPoint.x) * pointDistance + startPoint.x;
    currentPoint.y =
      (currentPoint.y - startPoint.y) * pointDistance + startPoint.y;

    resultPoints.push(new Point(currentPoint.x, currentPoint.y));

    currentPoint.draw("yellow", 2);

    await sleep(speed.value);
  }
  return resultPoints;
};

const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

initJob();
