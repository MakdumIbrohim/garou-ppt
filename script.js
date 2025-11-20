const character = document.getElementById('character');
const jumpButton = document.getElementById('jump-button');

let position = 0;
let isJumping = false;

function moveCharacter() {
  position += 2;
  let vertical = position * Math.tan(20 * Math.PI / 180);
  character.style.left = position + 'px';
  character.style.bottom = (300 - vertical) + 'px';
  requestAnimationFrame(moveCharacter);
}

moveCharacter();

jumpButton.addEventListener('click', () => {
  if (!isJumping) {
    isJumping = true;
    character.style.transform = 'translateY(-100px)';
    setTimeout(() => {
      character.style.transform = '';
      isJumping = false;
    }, 500);
  }
});