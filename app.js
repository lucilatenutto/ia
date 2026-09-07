
document.addEventListener('DOMContentLoaded', () => {
  const playBtn = document.getElementById('playAudioBtn');
  const timeSlider = document.getElementById('timeSlider');
  const selectedTimeDisplay = document.getElementById('selectedTimeDisplay');
  const submitGuessBtn = document.getElementById('submitGuessBtn');
  const revealInfoBox = document.getElementById('revealInfoBox');

  let isPlaying = false;


  function toggleAudio() {
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta reproducción de voz sintetizada.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      isPlaying = false;
      playBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>`;
    } else {
      window.speechSynthesis.cancel();
      const text = "Hola, necesito que me hagas una transferencia rápida porque tuve una emergencia en la ruta.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;

      utterance.onend = () => {
        isPlaying = false;
        playBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>`;
      };

      window.speechSynthesis.speak(utterance);
      isPlaying = true;
      playBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>`;
    }
  }

  if (playBtn) {
    playBtn.addEventListener('click', toggleAudio);
  }

  if (timeSlider && selectedTimeDisplay) {
    timeSlider.addEventListener('input', (e) => {
      selectedTimeDisplay.textContent = `${e.target.value}s`;
    });
  }

  if (submitGuessBtn && revealInfoBox) {
    submitGuessBtn.addEventListener('click', () => {
      revealInfoBox.classList.add('active');
    });
  }
});
