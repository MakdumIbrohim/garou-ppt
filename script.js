const character = document.getElementById('character');
const jumpButton = document.getElementById('jump-button');
const gameArea = document.getElementById('game-area');

let isJumping = false;
let obstacles = [];
let gameSpeed = 5;
let spawnTimer = 0;

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

function gameLoop() {
  // Spawn obstacles
  spawnTimer++;
  if (spawnTimer > 100) { // Spawn every ~1.6 seconds at 60fps
    spawnObstacle();
    spawnTimer = 0;
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
    // Simple box collision
    const charRect = character.getBoundingClientRect();
    const obsRect = obs.element.getBoundingClientRect();

    // Shrink hitboxes slightly for better feel
    if (
      charRect.right > obsRect.left + 10 &&
      charRect.left < obsRect.right - 10 &&
      charRect.bottom > obsRect.top + 10 &&
      charRect.top < obsRect.bottom - 10
    ) {
      alert('Game Over!');
      // Reset game
      obstacles.forEach(o => o.element.remove());
      obstacles = [];
      spawnTimer = 0;
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