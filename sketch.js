let facemeshModel;
let video;
let predictions = [];

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // 載入 facemesh 模型
  loadFacemeshModel();
}

function draw() {
  background(220);

  // 顯示攝影機畫面
  image(video, 0, 0, width, height);

  // 如果有偵測到臉部特徵，繪製嘴唇
  if (predictions.length > 0) {
    stroke('red');
    strokeWeight(5);
    noFill();

    for (let prediction of predictions) {
      const keypoints = prediction.scaledMesh;

      // 嘴唇的索引
      const lipsIndices = [
        61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 61
      ];

      beginShape();
      for (let index of lipsIndices) {
        const [x, y] = keypoints[index];
        vertex(x, y);
      }
      endShape(CLOSE);
    }
  }
}

async function loadFacemeshModel() {
  facemeshModel = await facemesh.load();
  console.log('Facemesh model loaded');

  // 啟動偵測
  detectFace();
}

async function detectFace() {
  if (facemeshModel && video.loadedmetadata) {
    const predictionsArray = await facemeshModel.estimateFaces({
      input: video.elt,
    });
    predictions = predictionsArray;
  }

  // 持續偵測
  requestAnimationFrame(detectFace);
}
