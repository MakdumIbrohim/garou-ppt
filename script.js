const character = document.getElementById('character');
const jumpButton = document.getElementById('jump-button');

jumpButton.addEventListener('click', () => {
  if (!character.classList.contains('jumping')) {
    character.classList.add('jumping');
    setTimeout(() => {
      character.classList.remove('jumping');
    }, 500);
  }
});