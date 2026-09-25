
document.addEventListener('DOMContentLoaded', () => {


  const scrollToNucleosBtn = document.getElementById('scrollToNucleos');
  const nucleosSection = document.getElementById('nucleosSection');
  const navNucleo1 = document.getElementById('navNucleo1');
  const navNucleo2 = document.getElementById('navNucleo2');
  const footNucleo1 = document.getElementById('footNucleo1');
  const footNucleo2 = document.getElementById('footNucleo2');
  const footTestCall = document.getElementById('footTestCall');

  if (scrollToNucleosBtn && nucleosSection) {
    scrollToNucleosBtn.addEventListener('click', () => {
      nucleosSection.scrollIntoView({ behavior: 'smooth' });
    });
  }


  if (navNucleo1) navNucleo1.addEventListener('click', () => openModal(modalNucleo1));
  if (navNucleo2) navNucleo2.addEventListener('click', () => openModal(modalNucleo2));
  if (footNucleo1) footNucleo1.addEventListener('click', () => openModal(modalNucleo1));
  if (footNucleo2) footNucleo2.addEventListener('click', () => openModal(modalNucleo2));
  if (footTestCall) {
    footTestCall.addEventListener('click', () => {
      openModal(modalNucleo1);
      const testSec = document.getElementById('testCallSection');
      if (testSec) testSec.scrollIntoView({ behavior: 'smooth' });
    });
  }


  const openNucleo1Btn = document.getElementById('openNucleo1Btn');
  const openNucleo2Btn = document.getElementById('openNucleo2Btn');
  const modalNucleo1 = document.getElementById('modalNucleo1');
  const modalNucleo2 = document.getElementById('modalNucleo2');
  const closeModalBtns = document.querySelectorAll('.modal-close');

  function openModal(modal) {
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modal) {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      stopAllAudio();
    }
  }

  if (openNucleo1Btn && modalNucleo1) {
    openNucleo1Btn.addEventListener('click', () => openModal(modalNucleo1));
  }

  if (openNucleo2Btn && modalNucleo2) {
    openNucleo2Btn.addEventListener('click', () => openModal(modalNucleo2));
  }

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-backdrop');
      closeModal(modal);
    });
  });


  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });


  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-backdrop.active');
      if (activeModal) closeModal(activeModal);
    }
  });



  let currentAudioInstance = null;
  let currentActivePlayBtn = null;
  let isPlayingScamCall = false;

  function stopAllAudio() {
    if (currentAudioInstance) {
      currentAudioInstance.pause();
      currentAudioInstance.currentTime = 0;
      currentAudioInstance = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isPlayingScamCall = false;
    resetPlayBtnState();
  }

  function resetPlayBtnState() {
    document.querySelectorAll('.btn-play-sample').forEach(btn => {
      const playIcon = btn.querySelector('.play-icon');
      const pauseIcon = btn.querySelector('.pause-icon');
      const textSpan = btn.querySelector('span');
      if (playIcon) playIcon.style.display = 'inline';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (textSpan) textSpan.textContent = 'Reproducir Audio';
    });

    const btnPlayScam = document.getElementById('btnPlayScamAudio');
    if (btnPlayScam) {
      const playIcon = btnPlayScam.querySelector('.play-icon');
      const pauseIcon = btnPlayScam.querySelector('.pause-icon');
      const span = btnPlayScam.querySelector('span');
      if (playIcon) playIcon.style.display = 'inline';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (span) span.textContent = 'Escuchar Llamada Creada';
    }
  }

  const playSampleBtns = document.querySelectorAll('.btn-play-sample');

  playSampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const audioSrc = btn.getAttribute('data-audio-src');
      const audioSynthText = btn.getAttribute('data-audio-synth');

      const playIcon = btn.querySelector('.play-icon');
      const pauseIcon = btn.querySelector('.pause-icon');
      const textSpan = btn.querySelector('span');


      if (currentActivePlayBtn === btn) {
        stopAllAudio();
        return;
      }


      stopAllAudio();
      currentActivePlayBtn = btn;

      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'inline';
      if (textSpan) textSpan.textContent = 'Pausar Audio';

      if (audioSrc) {
        currentAudioInstance = new Audio(audioSrc);
        currentAudioInstance.play();

        currentAudioInstance.onended = () => {
          stopAllAudio();
        };

        currentAudioInstance.onerror = () => {
          alert('No se pudo cargar el archivo de audio: ' + audioSrc);
          stopAllAudio();
        };

      } else if (audioSynthText && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(audioSynthText);
        utterance.lang = 'es-ES';
        utterance.rate = 0.95;

        utterance.onend = () => {
          stopAllAudio();
        };

        window.speechSynthesis.speak(utterance);
      }
    });
  });



  const correctAnswers = {
    '1': 'ia',
    '2': 'ia',
    '3': 'humana'
  };

  const explanations = {
    '1': {
      ia: '¡Correcto! Esta llamada pertenece a una voz generada totalmente con IA generativa.',
      humana: 'Incorrecto. Este audio fue sintetizado mediante clonación de voz con algoritmos de IA.'
    },
    '2': {
      ia: '¡Correcto! Es un fragmento de voz clonado a partir de una nota de voz pública.',
      humana: 'Incorrecto. Corresponde a una muestra sintética generada por modelos neuronales.'
    },
    '3': {
      ia: 'Incorrecto. Esta muestra representa la voz de control humana sin procesamiento sintético.',
      humana: '¡Correcto! Es una voz humana real no sintetizada por algoritmos.'
    }
  };

  const userAnswers = {};

  const choiceBtns = document.querySelectorAll('.btn-choice');

  choiceBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sampleNum = btn.getAttribute('data-sample');
      const userChoice = btn.getAttribute('data-choice');
      const card = document.getElementById(`sample${sampleNum}Card`);
      const feedbackBox = document.getElementById(`feedbackSample${sampleNum}`);

      if (!card || !feedbackBox) return;


      userAnswers[sampleNum] = userChoice;


      const sisterBtns = card.querySelectorAll('.btn-choice');
      sisterBtns.forEach(b => {
        b.classList.remove('selected-ia', 'selected-humana');
      });

      if (userChoice === 'ia') {
        btn.classList.add('selected-ia');
      } else {
        btn.classList.add('selected-humana');
      }


      const isCorrect = userChoice === correctAnswers[sampleNum];
      card.classList.remove('correct-answer', 'wrong-answer');
      feedbackBox.classList.remove('feedback-correct', 'feedback-wrong');

      if (isCorrect) {
        card.classList.add('correct-answer');
        feedbackBox.classList.add('feedback-correct');
      } else {
        card.classList.add('wrong-answer');
        feedbackBox.classList.add('feedback-wrong');
      }

      feedbackBox.textContent = explanations[sampleNum][userChoice];
      feedbackBox.classList.add('show-feedback');


      checkTestCompletion();
    });
  });

  function checkTestCompletion() {
    const totalSamples = Object.keys(correctAnswers).length;
    const answeredSamples = Object.keys(userAnswers).length;

    if (answeredSamples === totalSamples) {
      let score = 0;
      for (const sample in correctAnswers) {
        if (userAnswers[sample] === correctAnswers[sample]) {
          score++;
        }
      }

      const scoreBadge = document.getElementById('userScoreBadge');
      if (scoreBadge) {
        if (score === 3) {
          scoreBadge.innerHTML = `🎯 <strong>Puntaje Final: 3/3 Aciertos (100%)</strong><br>¡Excelente precisión auditiva! Lograste distinguir correctamente todas las llamadas de IA.`;
          scoreBadge.style.borderColor = '#10b981';
          scoreBadge.style.background = 'rgba(16, 185, 129, 0.15)';
        } else {
          scoreBadge.innerHTML = `🎯 <strong>Puntaje Final: ${score}/3 Aciertos</strong><br>Como a más del 70% de las personas, la voz sintética logró confundir tus sentidos. ¡Por eso es vital verificar siempre la identidad!`;
          scoreBadge.style.borderColor = '#00f2fe';
          scoreBadge.style.background = 'rgba(0, 242, 254, 0.15)';
        }
      }
    }
  }



  const playBtn = document.getElementById('playAudioBtn');
  const timeSlider = document.getElementById('timeSlider');
  const selectedTimeDisplay = document.getElementById('selectedTimeDisplay');
  const submitGuessBtn = document.getElementById('submitGuessBtn');
  const revealInfoBox = document.getElementById('revealInfoBox');

  let isPlayingNucleo2 = false;

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (!('speechSynthesis' in window)) {
        alert('Tu navegador no soporta reproducción de voz sintetizada.');
        return;
      }

      if (isPlayingNucleo2) {
        window.speechSynthesis.cancel();
        isPlayingNucleo2 = false;
        playBtn.innerHTML = `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>`;
      } else {
        stopAllAudio();
        const text = "Hola, necesito que me hagas una transferencia rápida porque tuve una emergencia en la ruta.";
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.95;

        utterance.onend = () => {
          isPlayingNucleo2 = false;
          playBtn.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>`;
        };

        window.speechSynthesis.speak(utterance);
        isPlayingNucleo2 = true;
        playBtn.innerHTML = `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>`;
      }
    });
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



  const scamParams = {
    genero: 'ninguno',
    emocion: 'ninguno',
    nacionalidad: 'ninguno',
    velocidad: 1.0
  };

  function updateHackerAvatarVisuals() {
    const imgHackerMain = document.getElementById('imgHackerMain');
    const leftBubbleIcon = document.getElementById('leftBubbleIcon');
    const rightBubbleIcon = document.getElementById('rightBubbleIcon');

    if (!imgHackerMain) return;


    if (scamParams.genero === 'masculino') {
      imgHackerMain.src = 'imgs/hacker2.png';
    } else if (scamParams.genero === 'femenino') {
      imgHackerMain.src = 'imgs/hacker1.png';
    } else {
      imgHackerMain.src = 'imgs/hacker3.png';
    }


    if (leftBubbleIcon) {
      if (scamParams.nacionalidad === 'argentina') {
        leftBubbleIcon.innerHTML = `<img src="imgs/argentina.png" alt="Argentina">`;
      } else if (scamParams.nacionalidad === 'espana') {
        leftBubbleIcon.innerHTML = `<img src="imgs/espana.png" alt="España">`;
      } else {
        leftBubbleIcon.innerHTML = `<span class="symbol-text">¿</span>`;
      }
    }


    if (rightBubbleIcon) {
      if (scamParams.emocion === 'lento') {
        rightBubbleIcon.innerHTML = `<img src="imgs/manejo-del-estres (1).png" alt="Tranquilo">`;
      } else if (scamParams.emocion === 'normal') {
        rightBubbleIcon.innerHTML = `<img src="imgs/neutral.png" alt="Normal">`;
      } else if (scamParams.emocion === 'rapido') {
        rightBubbleIcon.innerHTML = `<img src="imgs/ataque-de-panico1.png" alt="Pánico">`;
      } else {
        rightBubbleIcon.innerHTML = `<span class="symbol-text">?</span>`;
      }
    }
  }


  document.querySelectorAll('.param-options').forEach(group => {
    const paramName = group.getAttribute('data-param');
    const btns = group.querySelectorAll('.param-btn');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        const isAlreadyActive = btn.classList.contains('active');

        btns.forEach(b => b.classList.remove('active'));

        if (isAlreadyActive) {

          scamParams[paramName] = 'ninguno';
        } else {
          btn.classList.add('active');
          scamParams[paramName] = val;
        }


        if (paramName === 'emocion') {
          const scamSpeedRange = document.getElementById('scamSpeedRange');
          const speedValLabel = document.getElementById('speedValLabel');
          let targetSpeed = 1.0;
          if (scamParams.emocion === 'lento') targetSpeed = 0.7;
          else if (scamParams.emocion === 'rapido') targetSpeed = 1.4;

          scamParams.velocidad = targetSpeed;
          if (scamSpeedRange) scamSpeedRange.value = targetSpeed;
          if (speedValLabel) {
            const labelText = targetSpeed < 0.9 ? 'Lenta' : targetSpeed > 1.1 ? 'Rápida' : 'Normal';
            speedValLabel.textContent = `${targetSpeed.toFixed(1)}x (${labelText})`;
          }
          if (currentAudioInstance) {
            currentAudioInstance.playbackRate = targetSpeed;
          }
        }

        updateHackerAvatarVisuals();
        updateScamFallPercentage();
      });
    });
  });


  updateHackerAvatarVisuals();


  const scamSpeedRange = document.getElementById('scamSpeedRange');
  const speedValLabel = document.getElementById('speedValLabel');

  if (scamSpeedRange && speedValLabel) {
    scamSpeedRange.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value).toFixed(1);
      const numVal = parseFloat(val);
      scamParams.velocidad = numVal;

      let speedText = 'Normal';
      if (numVal < 0.9) speedText = 'Lenta';
      else if (numVal > 1.1) speedText = 'Rápida';

      speedValLabel.textContent = `${val}x (${speedText})`;


      if (currentAudioInstance) {
        currentAudioInstance.playbackRate = numVal;
      }
      updateHackerAvatarVisuals();
    });
  }


  function getScamAudioPath(params) {
    const nac = (params.nacionalidad === 'espana') ? 'esp' : 'arg';
    const em = (params.emocion === 'lento') ? 'lenta' : (params.emocion === 'rapido') ? 'rapido' : 'normal';
    const gen = (params.genero === 'femenino') ? 'm' : 'h';

    if (nac === 'arg') {
      if (gen === 'h') {
        if (em === 'lenta') return 'audiosnucleodos/arglentah.mp3';
        if (em === 'rapido') return 'audiosnucleodos/argrapidoh.mp3';
        return 'audiosnucleodos/argrnormalh.mp3';
      } else {
        if (em === 'lenta') return 'audiosnucleodos/arglentam.mp3';
        if (em === 'rapido') return 'audiosnucleodos/argrapidom.mp3';
        return 'audiosnucleodos/argnormalm.mp3';
      }
    } else {
      if (gen === 'h') {
        if (em === 'lenta') return 'audiosnucleodos/esplentah.mp3';
        if (em === 'rapido') return 'audiosnucleodos/esprapidoh.mp3';
        return 'audiosnucleodos/espnormalh.mp3';
      } else {
        if (em === 'lenta') return 'audiosnucleodos/esplentam.mp3';
        if (em === 'rapido') return 'audiosnucleodos/esprapidom.mp3';
        return 'audiosnucleodos/espnormalm.mp3';
      }
    }
  }


  const btnGenerateScam = document.getElementById('btnGenerateScam');
  const scamResultsPanel = document.getElementById('scamResultsPanel');
  const scamAudioText = document.getElementById('scamAudioText');
  const btnPlayScamAudio = document.getElementById('btnPlayScamAudio');

  const scriptTexts = {
    lento: "Hola... Te hablo con tranquilidad para contarte sobre esta situación...",
    normal: "¡Hola! Te contacto porque tuvimos un inconveniente y necesitamos resolverlo ahora.",
    rapido: "¡Por favor escuchame! ¡Estoy desesperado, tuve una emergencia urgente en la calle y necesito tu ayuda ya!"
  };

  function triggerScamAudioPlayback() {
    const playIcon = btnPlayScamAudio ? btnPlayScamAudio.querySelector('.play-icon') : null;
    const pauseIcon = btnPlayScamAudio ? btnPlayScamAudio.querySelector('.pause-icon') : null;
    const span = btnPlayScamAudio ? btnPlayScamAudio.querySelector('span') : null;

    stopAllAudio();
    const audioPath = getScamAudioPath(scamParams);
    currentAudioInstance = new Audio(audioPath);
    if (scamParams.velocidad) {
      currentAudioInstance.playbackRate = scamParams.velocidad;
    }

    currentAudioInstance.play().then(() => {
      isPlayingScamCall = true;
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'inline';
      if (span) span.textContent = 'Pausar Reproducción';
    }).catch(err => {
      console.error('Error al reproducir audio:', err);
    });

    currentAudioInstance.onended = () => {
      isPlayingScamCall = false;
      if (playIcon) playIcon.style.display = 'inline';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (span) span.textContent = 'Escuchar Llamada Creada';
    };
  }

  if (btnGenerateScam && scamResultsPanel) {
    btnGenerateScam.addEventListener('click', () => {

      scamResultsPanel.style.display = 'block';
      scamResultsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });


      const text = scriptTexts[scamParams.emocion] || scriptTexts.normal;
      if (scamAudioText) scamAudioText.textContent = `"${text}"`;


      updateScamFallPercentage();


      triggerScamAudioPlayback();
    });
  }


  if (btnPlayScamAudio) {
    btnPlayScamAudio.addEventListener('click', () => {
      const playIcon = btnPlayScamAudio.querySelector('.play-icon');
      const pauseIcon = btnPlayScamAudio.querySelector('.pause-icon');
      const span = btnPlayScamAudio.querySelector('span');

      if (isPlayingScamCall) {
        stopAllAudio();
        isPlayingScamCall = false;
        if (playIcon) playIcon.style.display = 'inline';
        if (pauseIcon) pauseIcon.style.display = 'none';
        if (span) span.textContent = 'Escuchar Llamada Creada';
      } else {
        triggerScamAudioPlayback();
      }
    });
  }


  function updateScamFallPercentage() {
    let pct = 65;


    if (scamParams.genero === 'femenino') pct += 6;
    else if (scamParams.genero === 'masculino') pct += 4;


    if (scamParams.emocion === 'rapido') pct += 18;
    else if (scamParams.emocion === 'normal') pct += 10;
    else if (scamParams.emocion === 'lento') pct += 4;


    if (scamParams.nacionalidad === 'argentina') pct += 12;
    else if (scamParams.nacionalidad === 'espana') pct += 8;


    if (scamParams.velocidad > 1.0) {
      pct += Math.round((scamParams.velocidad - 1.0) * 14);
    } else if (scamParams.velocidad < 1.0) {
      pct -= Math.round((1.0 - scamParams.velocidad) * 8);
    }

    pct = Math.min(97, Math.max(42, pct));

    const donutCenterPct = document.getElementById('donutCenterPct');
    if (donutCenterPct) {
      donutCenterPct.textContent = `${pct}%`;
    }
    return pct;
  }

});


