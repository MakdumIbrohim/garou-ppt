const character = document.getElementById('character');
const jumpButton = document.getElementById('jump-button');

let position = 0;
let isJumping = false;

function moveCharacter() {
  position += 2; 
  character.style.left = position + 'px';
  requestAnimationFrame(moveCharacter);
}

moveCharacter();

jumpButton.addEventListener('click', () => {
  if (!isJumping) {
    isJumping = true;
    character.style.transform = 'translateY(-150px) rotate(20deg)';
    setTimeout(() => {
      character.style.transform = 'rotate(20deg)';
      isJumping = false;
    }, 500);
  }
});