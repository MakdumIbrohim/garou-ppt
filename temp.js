// Konstanta elemen DOM
const characterEl = document.getElementById("character");
const jumpButton = document.getElementById("jump-button");
const gameArea = document.getElementById("game-area");

// Konstanta fisika permainan
const SLOPE_ANGLE_DEG = 20;
const SLOPE_TAN = Math.tan((SLOPE_ANGLE_DEG * Math.PI) / 180);

const GRAVITY = -2000;
const JUMP_VELOCITY = 900;
const HORIZ_JUMP_SPEED = 100;
const GROUND_BASE = window.innerWidth < 768 ? 350 : 300;

const OBSTACLE_SPEED = 200;

// Variabel state permainan
let isJumping = false;
let obstacles = [];
let clouds = [];
let spawnTimer = 0;
let cloudTimer = 0;

let lastTimestamp = null;

const char = {
  // Objek karakter
  x: 100,
  yOffset: 0,
  vy: 0,
  width: 100,
  height: 100,
};

characterEl.style.left = char.x + "px";
const initialVertical = char.x * SLOPE_TAN;
characterEl.style.bottom = GROUND_BASE - initialVertical + char.yOffset + "px";
// Fungsi spawn rintangan

function spawnObstacle() {
  const obstacle = document.createElement("div");
  obstacle.classList.add("cactus");

  let startLeft = window.innerWidth + 50;
  obstacle.style.left = startLeft + "px";

  let vertical = startLeft * SLOPE_TAN;
  obstacle.style.bottom = GROUND_BASE - vertical + "px";

  gameArea.appendChild(obstacle);
  obstacles.push({ element: obstacle, left: startLeft });
  // Fungsi spawn awan
}

function spawnCloud() {
  const cloud = document.createElement("div");
  cloud.classList.add("cloud");

  const isMobile = window.innerWidth < 768;
  const scale = isMobile ? 0.3 + Math.random() * 0.5 : 0.5 + Math.random() * 1;
  cloud.style.width = 100 * scale + "px";
  cloud.style.height = 40 * scale + "px";

  let startLeft = window.innerWidth + 100;
  let startTop =
    Math.random() *
    (isMobile ? Math.min(window.innerHeight / 4, 150) : window.innerHeight / 2);
  cloud.style.left = startLeft + "px";
  cloud.style.top = startTop + "px";

  const speedMult = 0.2 + Math.random() * 0.3;
  gameArea.appendChild(cloud);
  clouds.push({ element: cloud, left: startLeft, speed: speedMult });
  // Fungsi suara lompat
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playJumpSound() {
  try {
    if (audioCtx.state === "suspended") audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      600,
      audioCtx.currentTime + 0.08
    );
    gainNode.gain.setValueAtTime(0.45, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioCtx.currentTime + 0.12
    );
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.12);
  } catch (e) {
    console.warn("Audio error:", e);
    // Fungsi mulai lompat
  }
}

function startJump() {
  if (isJumping) return;
  isJumping = true;
  char.vy = JUMP_VELOCITY;
  playJumpSound();
}

jumpButton.addEventListener("click", startJump);
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    // Loop utama permainan
    e.preventDefault();
    startJump();
  }
});

function gameLoop(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const dt = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  spawnTimer += dt;
  if (spawnTimer > 1.6) {
    spawnObstacle();
    spawnTimer = 0;
  }

  cloudTimer += dt;
  if (cloudTimer > 1.0) {
    spawnCloud();
    cloudTimer = 0;
  }

  // Gerakkan awan
  for (let i = clouds.length - 1; i >= 0; i--) {
    const cloud = clouds[i];
    cloud.left -= OBSTACLE_SPEED * cloud.speed * dt;
    cloud.element.style.left = cloud.left + "px";
    if (cloud.left < -300) {
      cloud.element.remove();
      clouds.splice(i, 1);
    }
  }

  if (isJumping) {
    char.vy += GRAVITY * dt;
    char.yOffset += char.vy * dt;

    if (char.yOffset <= 0) {
      char.yOffset = 0;
      char.vy = 0;
      isJumping = false;
    }
  }

  characterEl.style.left = char.x + "px";
  const baseBottom = GROUND_BASE - char.x * SLOPE_TAN;
  characterEl.style.bottom = baseBottom + char.yOffset + "px";
  // Gerakkan rintangan dan deteksi tabrakan

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.left -= OBSTACLE_SPEED * dt;

    const vertical = obs.left * SLOPE_TAN;
    obs.element.style.left = obs.left + "px";
    obs.element.style.bottom = GROUND_BASE - vertical + "px";

    if (obs.left < -200) {
      obs.element.remove();
      obstacles.splice(i, 1);
      continue;
    }

  }
  // Mulai permainan

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
