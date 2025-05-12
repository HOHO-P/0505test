let facemeshModel;
let video;
let predictions = [];
let particles = []; // 粒子陣列

const lipsIndices = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 61];
const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 33];
const rightEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 362];

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  console.log('Video loaded'); // 確認攝影機已啟動
  loadFacemeshModel();
}

function draw() {
  background(220);

  // 顯示攝影機畫面
  image(video, 0, 0, width, height);

  // 如果有偵測到臉部特徵，繪製嘴唇和眼睛
  if (predictions.length > 0) {
    stroke('red');
    strokeWeight(5);
    noFill();

    for (let prediction of predictions) {
      const keypoints = prediction.scaledMesh;

      // 繪製嘴唇輪廓
      drawFeature(keypoints, lipsIndices, 'red');

      // 繪製左眼輪廓
      drawFeature(keypoints, leftEyeIndices, 'blue');

      // 繪製右眼輪廓
      drawFeature(keypoints, rightEyeIndices, 'green');
    }
  }

  // 更新並顯示粒子效果
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();

    // 如果粒子已經消失，將其從陣列中移除
    if (particles[i].finished()) {
      particles.splice(i, 1);
    }
  }
}

function drawFeature(keypoints, indices, color) {
  stroke(color);
  beginShape();
  for (let index of indices) {
    const [x, y] = keypoints[index];
    vertex(x, y);
  }
  endShape(CLOSE);
}

function loadFacemeshModel() {
  facemeshModel = ml5.facemesh(video, () => {
    console.log('Facemesh model loaded'); // 確認模型載入成功
  });

  // 啟動偵測
  facemeshModel.on('predict', (results) => {
    predictions = results;
  });
}

// 粒子類別
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1, 1); // 粒子的水平速度
    this.vy = random(-1, 1); // 粒子的垂直速度
    this.alpha = 255; // 粒子的透明度
  }

  // 更新粒子位置和透明度
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 5; // 每次更新減少透明度
  }

  // 繪製粒子
  show() {
    noStroke();
    fill(255, 0, 0, this.alpha); // 紅色粒子，透明度隨時間減少
    ellipse(this.x, this.y, 8); // 粒子的大小
  }

  // 判斷粒子是否消失
  finished() {
    return this.alpha <= 0;
  }
}
