const character = document.getElementById('character');
const jumpButton = document.getElementById('jump-button');
const gameArea = document.getElementById('game-area');

let isJumping = false;
let obstacles = [];
let clouds = []; // Array to store clouds
let gameSpeed = 5;
let spawnTimer = 0;
let cloudTimer = 0;

// Set initial character position
character.style.left = '100px';
// Calculate initial bottom based on slope
// bottom = 300 - (left * tan(20deg))
// tan(20deg) is approx 0.364
let initialVertical = 100 * Math.tan(20 * Math.PI / 180);
character.style.bottom = (300 - initialVertical) + 'px';

function spawnObstacle() {
  const obstacle = document.createElement('div');
  obstacle.classList.add('cactus');
  // Start off-screen to the right
  let startLeft = window.innerWidth + 50;
  obstacle.style.left = startLeft + 'px';

  // Calculate bottom based on slope
  let vertical = startLeft * Math.tan(20 * Math.PI / 180);
  obstacle.style.bottom = (300 - vertical) + 'px';

  gameArea.appendChild(obstacle);
  obstacles.push({
    element: obstacle,
    left: startLeft
  });
}

function spawnCloud() {
  const cloud = document.createElement('div');
  cloud.classList.add('cloud');

  // Random size
  const scale = 0.5 + Math.random() * 1; // 0.5x to 1.5x
  cloud.style.width = (100 * scale) + 'px';
  cloud.style.height = (40 * scale) + 'px';

  // Random position
  let startLeft = window.innerWidth + 100;
  let startTop = Math.random() * (window.innerHeight / 2); // Top half of screen

  cloud.style.left = startLeft + 'px';
  cloud.style.top = startTop + 'px';

  // Random speed multiplier (parallax)
  const speedMult = 0.2 + Math.random() * 0.3; // 0.2x to 0.5x of game speed

  gameArea.appendChild(cloud);
  clouds.push({
    element: cloud,
    left: startLeft,
    speed: speedMult
  });
}

function gameLoop() {
  // Spawn obstacles
  spawnTimer++;
  if (spawnTimer > 100) { // Spawn every ~1.6 seconds at 60fps
    spawnObstacle();
    spawnTimer = 0;
  }

  // Spawn clouds
  cloudTimer++;
  if (cloudTimer > 200) { // Spawn every ~3.3 seconds
    spawnCloud();
    cloudTimer = 0;
  }

  // Move clouds
  for (let i = clouds.length - 1; i >= 0; i--) {
    let cloud = clouds[i];
    cloud.left -= gameSpeed * cloud.speed;
    cloud.element.style.left = cloud.left + 'px';

    // Remove if off-screen
    if (cloud.left < -200) {
      cloud.element.remove();
      clouds.splice(i, 1);
    }
  }

  // Move obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.left -= gameSpeed;

    // Update position
    let vertical = obs.left * Math.tan(20 * Math.PI / 180);
    obs.element.style.left = obs.left + 'px';
    obs.element.style.bottom = (300 - vertical) + 'px';

    // Remove if off-screen
    if (obs.left < -50) {
      obs.element.remove();
      obstacles.splice(i, 1);
    }

    // Collision Detection
    // Circle Collision (Distance Check)
    const charRect = character.getBoundingClientRect();
    const obsRect = obs.element.getBoundingClientRect();

    // Calculate centers
    const charCenterX = charRect.left + charRect.width / 2;
    const charCenterY = charRect.top + charRect.height / 2;
    const obsCenterX = obsRect.left + obsRect.width / 2;
    const obsCenterY = obsRect.top + obsRect.height / 2;

    // Define radii (adjust these for tightness)
    const charRadius = 35; // Character radius
    const obsRadius = 15;  // Obstacle radius (smaller than width/height)

    // Calculate distance
    const dx = charCenterX - obsCenterX;
    const dy = charCenterY - obsCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check collision
    if (distance < charRadius + obsRadius) {
      alert('Game Over!');
      // Reset game
      obstacles.forEach(o => o.element.remove());
      obstacles = [];
      spawnTimer = 0;
      // Reset clouds too? Maybe not, let them float
    }
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();

jumpButton.addEventListener('click', () => {
  if (!isJumping) {
    isJumping = true;
    character.style.transform = 'translateY(-150px)'; // Jump higher
    setTimeout(() => {
      character.style.transform = '';
      isJumping = false;
    }, 600); // Jump duration
  }
});