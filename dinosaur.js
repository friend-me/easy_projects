
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏变量
let dino = {
  x: 50,
  y: canvas.height - 50,
  width: 40,
  height: 50,
  jumping: false,
  jumpVelocity: 0,
  gravity: 0.8,
  jumpPower: -15
};

let obstacles = [];
let gameSpeed = 5;
let score = 0;
let highScore = localStorage.getItem('dinoHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let frameCount = 0;

// DOM 元素
const statusText = document.getElementById('statusText');
const scoreText = document.getElementById('scoreText');
const highScoreText = document.getElementById('highScoreText');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// 初始化显示
highScoreText.textContent = highScore;

// 绘制地面线
function drawGround() {
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 10);
  ctx.lineTo(canvas.width, canvas.height - 10);
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// 绘制恐龙
function drawDino() {
  ctx.fillStyle = '#333';
  ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
  // 简单眼睛
  ctx.fillStyle = '#fff';
  ctx.fillRect(dino.x + 25, dino.y + 10, 8, 8);
  ctx.fillStyle = '#000';
  ctx.fillRect(dino.x + 27, dino.y + 12, 4, 4);
}

// 生成障碍物
function spawnObstacle() {
  const height = Math.random() * 30 + 20;
  obstacles.push({
    x: canvas.width,
    y: canvas.height - 10 - height,
    width: 20,
    height: height
  });
}

// 更新障碍物位置
function updateObstacles() {
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].x -= gameSpeed;
    if (obstacles[i].x + obstacles[i].width < 0) {
      obstacles.splice(i, 1);
      i--;
      score += 1;
    }
  }
}

// 绘制障碍物
function drawObstacles() {
  ctx.fillStyle = '#444';
  for (let obs of obstacles) {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }
}

// 检查碰撞
function checkCollision() {
  for (let obs of obstacles) {
    if (
      dino.x < obs.x + obs.width &&
      dino.x + dino.width > obs.x &&
      dino.y < obs.y + obs.height &&
      dino.y + dino.height > obs.y
    ) {
      return true;
    }
  }
  return false;
}

// 跳跃处理
function jump() {
  if (!dino.jumping) {
    dino.jumping = true;
    dino.jumpVelocity = dino.jumpPower;
  }
}

// 更新恐龙状态
function updateDino() {
  if (dino.jumping) {
    dino.y += dino.jumpVelocity;
    dino.jumpVelocity += dino.gravity;
    if (dino.y >= canvas.height - dino.height - 10) {
      dino.y = canvas.height - dino.height - 10;
      dino.jumping = false;
    }
  }
}

// 游戏主循环
function gameLoop() {
  if (!gameRunning || gamePaused) return;

  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 更新和绘制
  updateDino();
  updateObstacles();
  drawGround();
  drawDino();
  drawObstacles();

  // 分数更新
  scoreText.textContent = score;

  // 碰撞检测
  if (checkCollision()) {
    endGame();
    return;
  }

  // 随时间增加难度
  if (frameCount % 100 === 0) {
    gameSpeed += 0.2;
  }

  frameCount++;

  // 生成障碍物
  if (frameCount % 100 === 0) {
    spawnObstacle();
  }

  requestAnimationFrame(gameLoop);
}

// 开始游戏
function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  gamePaused = false;
  statusText.textContent = "游戏中...";
  statusText.className = "mt-1 text-lg font-semibold text-green-600";
  resetGame();
  gameLoop();
}

// 暂停游戏
function pauseGame() {
  if (!gameRunning) return;
  gamePaused = !gamePaused;
  statusText.textContent = gamePaused ? "已暂停" : "游戏中...";
  statusText.className = gamePaused 
    ? "mt-1 text-lg font-semibold text-yellow-600" 
    : "mt-1 text-lg font-semibold text-green-600";
  if (!gamePaused) gameLoop();
}

// 结束游戏
function endGame() {
  gameRunning = false;
  statusText.textContent = "游戏结束";
  statusText.className = "mt-1 text-lg font-semibold text-red-600";
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('dinoHighScore', highScore);
    highScoreText.textContent = highScore;
  }
}

// 重置游戏
function resetGame() {
  dino.y = canvas.height - dino.height - 10;
  dino.jumping = false;
  obstacles = [];
  score = 0;
  gameSpeed = 5;
  frameCount = 0;
  scoreText.textContent = score;
}

// 事件监听
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', () => {
  resetGame();
  if (gameRunning) {
    gameRunning = false;
    statusText.textContent = "准备就绪";
    statusText.className = "mt-1 text-lg font-semibold text-green-600";
  }
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    jump();
  } else if (e.code === 'KeyP') {
    pauseGame();
  } else if (e.code === 'KeyR') {
    resetGame();
    if (gameRunning) {
      gameRunning = false;
      statusText.textContent = "准备就绪";
      statusText.className = "mt-1 text-lg font-semibold text-green-600";
    }
  }
});
