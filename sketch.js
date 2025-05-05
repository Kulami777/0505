// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY; // 圓的初始位置
let circleRadius = 50; // 圓的半徑
let isDragging = false; // 是否正在拖動圓
let draggingHandIndex = null; // 哪隻手在拖動圓
let draggingFinger = null; // 正在拖動的手指 (8: 食指, 4: 大拇指)
let previousFingerPosition = null; // 儲存手指的上一個位置

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // 初始化圓的位置
  circleX = width / 2;
  circleY = height / 2;

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  // 繪製圓
  fill(255, 0, 0, 150); // 半透明紅色
  noStroke();
  ellipse(circleX, circleY, circleRadius * 2);

  // 確保至少有一隻手被偵測到
  if (hands.length > 0) {
    for (let handIndex = 0; handIndex < hands.length; handIndex++) {
      let hand = hands[handIndex];

      if (hand.confidence > 0.1) {
        // 繪製手部的關鍵點
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // 根據左右手設定顏色
          if (hand.handedness == "Left") {
            fill(255, 0, 255); // 左手為紫色
          } else {
            fill(255, 255, 0); // 右手為黃色
          }

          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }

        // 串接 keypoints 5 到 8
        for (let i = 5; i < 8; i++) {
          let start = hand.keypoints[i];
          let end = hand.keypoints[i + 1];
          stroke(0, 255, 0); // 設定線條顏色為綠色
          strokeWeight(2);  // 設定線條粗細
          line(start.x, start.y, end.x, end.y);
        }

        // 串接 keypoints 9 到 12
        for (let i = 9; i < 12; i++) {
          let start = hand.keypoints[i];
          let end = hand.keypoints[i + 1];
          stroke(0, 0, 255); // 設定線條顏色為藍色
          strokeWeight(2);  // 設定線條粗細
          line(start.x, start.y, end.x, end.y);
        }

        // 檢查食指 (keypoints[8]) 是否接觸圓
        let indexFinger = hand.keypoints[8];
        let distanceToCircleIndex = dist(indexFinger.x, indexFinger.y, circleX, circleY);

        // 檢查大拇指 (keypoints[4]) 是否接觸圓
        let thumb = hand.keypoints[4];
        let distanceToCircleThumb = dist(thumb.x, thumb.y, circleX, circleY);

        // 如果食指接觸圓，開始拖動
        if (distanceToCircleIndex < circleRadius) {
          if (!isDragging) {
            isDragging = true;
            draggingHandIndex = handIndex; // 設定拖動的手
            draggingFinger = 8; // 設定拖動的手指為食指
            previousFingerPosition = { x: indexFinger.x, y: indexFinger.y }; // 初始化手指位置
          }
        }

        // 如果大拇指接觸圓，開始拖動
        if (distanceToCircleThumb < circleRadius) {
          if (!isDragging) {
            isDragging = true;
            draggingHandIndex = handIndex; // 設定拖動的手
            draggingFinger = 4; // 設定拖動的手指為大拇指
            previousFingerPosition = { x: thumb.x, y: thumb.y }; // 初始化手指位置
          }
        }

        // 如果正在拖動，讓圓跟隨手指移動，並畫出軌跡
        if (isDragging && draggingHandIndex === handIndex) {
          let currentFinger = draggingFinger === 8 ? indexFinger : thumb; // 根據拖動的手指選擇
          let lineColor = draggingFinger === 8 ? [255, 0, 0] : [0, 0, 255]; // 食指為紅色，拇指為藍色

          // 畫出手指的移動軌跡
          if (previousFingerPosition) {
            stroke(...lineColor); // 設定線條顏色
            strokeWeight(2);
            line(previousFingerPosition.x, previousFingerPosition.y, currentFinger.x, currentFinger.y);
          }

          // 更新圓的位置
          circleX = currentFinger.x;
          circleY = currentFinger.y;

          // 更新手指的上一個位置
          previousFingerPosition = { x: currentFinger.x, y: currentFinger.y };
        }
      }
    }
  }

  // 如果沒有手接觸圓，停止拖動並清除手指位置
  if (
    hands.length === 0 ||
    !hands.some(hand =>
      dist(hand.keypoints[8].x, hand.keypoints[8].y, circleX, circleY) < circleRadius ||
      dist(hand.keypoints[4].x, hand.keypoints[4].y, circleX, circleY) < circleRadius
    )
  ) {
    isDragging = false;
    draggingHandIndex = null;
    draggingFinger = null;
    previousFingerPosition = null; // 清除手指位置
  }
}
