// script.js - full, siap pakai
const characterEl = document.getElementById("character");
const jumpButton = document.getElementById("jump-button");
const gameArea = document.getElementById("game-area");

const SLOPE_ANGLE_DEG = 20;
const SLOPE_TAN = Math.tan((SLOPE_ANGLE_DEG * Math.PI) / 180);

// Physics & gameplay tuning (konvensi: vy > 0 = ke atas)
const GRAVITY = -2000; // px / s^2 (negatif => menarik ke bawah)
const JUMP_VELOCITY = 900; // initial vy, px / s (positif => ke atas)
const HORIZ_JUMP_SPEED = 100; // px / s, horizontal movement while in air
const GROUND_BASE = 300; // dasar perhitungan bottom seperti sebelumnya

// Game speed (obstacles move left by this px/s)
const OBSTACLE_SPEED = 200;

// State
let isJumping = false;
let obstacles = [];
let clouds = [];
let spawnTimer = 0;
let cloudTimer = 0;

let lastTimestamp = null;

// Character state
const char = {
  x: 100, // left in px
  yOffset: 0, // vertical offset above the slope base (px). 0 = on ground
  vy: 0, // vertical velocity px/s (vy > 0 => up)
  width: 100,
  height: 100,
};

// Initialize DOM position
characterEl.style.left = char.x + "px";
const initialVertical = char.x * SLOPE_TAN;
characterEl.style.bottom = GROUND_BASE - initialVertical + char.yOffset + "px";

// Spawn obstacle (cactus)
function spawnObstacle() {
  const obstacle = document.createElement("div");
  obstacle.classList.add("cactus");

  let startLeft = window.innerWidth + 50;
  obstacle.style.left = startLeft + "px";

  let vertical = startLeft * SLOPE_TAN;
  obstacle.style.bottom = GROUND_BASE - vertical + "px";

  gameArea.appendChild(obstacle);
  obstacles.push({ element: obstacle, left: startLeft });
}

// Spawn cloud (parallax)
function spawnCloud() {
  const cloud = document.createElement("div");
  cloud.classList.add("cloud");

  const scale = 0.5 + Math.random() * 1;
  cloud.style.width = 100 * scale + "px";
  cloud.style.height = 40 * scale + "px";

  let startLeft = window.innerWidth + 100;
  let startTop = Math.random() * (window.innerHeight / 2);
  cloud.style.left = startLeft + "px";
  cloud.style.top = startTop + "px";

  const speedMult = 0.2 + Math.random() * 0.3;
  gameArea.appendChild(cloud);
  clouds.push({ element: cloud, left: startLeft, speed: speedMult });
}

// Web Audio jump sound
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
    // ignore audio errors (browser policy)
    console.warn("Audio error:", e);
  }
}

// Start jump (vy positive = up)
function startJump() {
  if (isJumping) return;
  isJumping = true;
  char.vy = JUMP_VELOCITY; // positive => will increase yOffset
  playJumpSound();
}

// Event listeners for button and keyboard
jumpButton.addEventListener("click", startJump);
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    startJump();
  }
});

// Main loop using timestamps (dt)
function gameLoop(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const dt = (timestamp - lastTimestamp) / 1000; // seconds
  lastTimestamp = timestamp;

  // spawn timing (frame-independent)
  spawnTimer += dt;
  if (spawnTimer > 1.6) {
    spawnObstacle();
    spawnTimer = 0;
  }

  cloudTimer += dt;
  if (cloudTimer > 3.3) {
    spawnCloud();
    cloudTimer = 0;
  }

  // Move clouds (parallax)
  for (let i = clouds.length - 1; i >= 0; i--) {
    const cloud = clouds[i];
    cloud.left -= OBSTACLE_SPEED * cloud.speed * dt;
    cloud.element.style.left = cloud.left + "px";
    if (cloud.left < -300) {
      cloud.element.remove();
      clouds.splice(i, 1);
    }
  }

  // Update character physics if jumping (vy > 0 up)
  if (isJumping) {
    // integrate vy with gravity (GRAVITY is negative)
    char.vy += GRAVITY * dt;
    char.yOffset += char.vy * dt; // yOffset increases when vy > 0 (go up)

    // horizontal progression while in air
    char.x += HORIZ_JUMP_SPEED * dt;

    // landing detection: when yOffset <= 0 back to ground (because yOffset grows upward)
    if (char.yOffset <= 0) {
      char.yOffset = 0;
      char.vy = 0;
      isJumping = false;
    }
  }

  // Update character DOM position (follow slope + yOffset)
  characterEl.style.left = char.x + "px";
  const baseBottom = GROUND_BASE - char.x * SLOPE_TAN;
  characterEl.style.bottom = baseBottom + char.yOffset + "px";

  // Move obstacles and detect collisions
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.left -= OBSTACLE_SPEED * dt;

    // update DOM position following slope
    const vertical = obs.left * SLOPE_TAN;
    obs.element.style.left = obs.left + "px";
    obs.element.style.bottom = GROUND_BASE - vertical + "px";

    // remove off-screen
    if (obs.left < -200) {
      obs.element.remove();
      obstacles.splice(i, 1);
      continue;
    }

    // collision detection (circle approximation)
    const charRect = characterEl.getBoundingClientRect();
    const obsRect = obs.element.getBoundingClientRect();

    const charCenterX = charRect.left + charRect.width / 2;
    const charCenterY = charRect.top + charRect.height / 2;
    const obsCenterX = obsRect.left + obsRect.width / 2;
    const obsCenterY = obsRect.top + obsRect.height / 2;

    const charRadius = Math.min(charRect.width, charRect.height) * 0.35;
    const obsRadius = Math.min(obsRect.width, obsRect.height) * 0.45;

    const dx = charCenterX - obsCenterX;
    const dy = charCenterY - obsCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < charRadius + obsRadius) {
      // Game over handling
      alert("Game Over!");
      // cleanup
      obstacles.forEach((o) => o.element.remove());
      obstacles = [];
      clouds.forEach((c) => c.element.remove());
      clouds = [];
      // reset character
      char.x = 100;
      char.yOffset = 0;
      char.vy = 0;
      isJumping = false;
      lastTimestamp = null;
      spawnTimer = 0;
      cloudTimer = 0;
      return; // stop this frame; next requestAnimationFrame restarts loop
    }
  }

  requestAnimationFrame(gameLoop);
}

// Start game loop
requestAnimationFrame(gameLoop);
