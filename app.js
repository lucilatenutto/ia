
document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. GESTIÓN DE NAVEGACIÓN Y SCROLL
     ========================================================================== */
  const scrollToNucleosBtn = document.getElementById('scrollToNucleos');
  const nucleosSection = document.getElementById('nucleosSection');

  if (scrollToNucleosBtn && nucleosSection) {
    scrollToNucleosBtn.addEventListener('click', () => {
      nucleosSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ==========================================================================
     2. GESTIÓN DE VENTANAS MODALES
     ========================================================================== */
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

  // Cerrar modal al hacer clic fuera del contenido
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  // Cerrar modal con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-backdrop.active');
      if (activeModal) closeModal(activeModal);
    }
  });


  /* ==========================================================================
     3. CONTROLADOR DE REPRODUCCIÓN DE AUDIO (MP3 Y SINTETIZADOR)
     ========================================================================== */
  let currentAudioInstance = null;
  let currentActivePlayBtn = null;

  function stopAllAudio() {
    if (currentAudioInstance) {
      currentAudioInstance.pause();
      currentAudioInstance.currentTime = 0;
      currentAudioInstance = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
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
  }

  const playSampleBtns = document.querySelectorAll('.btn-play-sample');

  playSampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const audioSrc = btn.getAttribute('data-audio-src');
      const audioSynthText = btn.getAttribute('data-audio-synth');

      const playIcon = btn.querySelector('.play-icon');
      const pauseIcon = btn.querySelector('.pause-icon');
      const textSpan = btn.querySelector('span');

      // Si ya se está reproduciendo este mismo botón, pausar
      if (currentActivePlayBtn === btn) {
        stopAllAudio();
        return;
      }

      // Detener cualquier otro audio en reproducción
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


  /* ==========================================================================
     4. LÓGICA DEL TEST: "LLAMADA DE PRUEBA (RECONOCER A LA IA)"
     ========================================================================== */
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

      // Registrar respuesta
      userAnswers[sampleNum] = userChoice;

      // Marcar botones activos
      const sisterBtns = card.querySelectorAll('.btn-choice');
      sisterBtns.forEach(b => {
        b.classList.remove('selected-ia', 'selected-humana');
      });

      if (userChoice === 'ia') {
        btn.classList.add('selected-ia');
      } else {
        btn.classList.add('selected-humana');
      }

      // Evaluar acierto
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

      // Verificar si se completaron las 3 muestras
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


  /* ==========================================================================
     5. SIMULADOR NÚCLEO 2 (SLIDER & REVELAR TIEMPO)
     ========================================================================== */
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


  /* ==========================================================================
     6. HERRAMIENTA INTERACTIVA: "ARMÁ TU PROPIA ESTAFA" (NÚCLEO 2)
     ========================================================================== */
  const scamParams = {
    tono: 'neutro',
    emocion: 'urgencia',
    intensidad: 'normal',
    acento: 'rioplatense',
    velocidad: 1.0
  };

  // Manejador de selección de botones de parámetros
  document.querySelectorAll('.param-options').forEach(group => {
    const paramName = group.getAttribute('data-param');
    const btns = group.querySelectorAll('.param-btn');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        scamParams[paramName] = btn.getAttribute('data-val');
      });
    });
  });

  // Manejador del slider de velocidad
  const scamSpeedRange = document.getElementById('scamSpeedRange');
  const speedValLabel = document.getElementById('speedValLabel');

  if (scamSpeedRange && speedValLabel) {
    scamSpeedRange.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value).toFixed(1);
      scamParams.velocidad = parseFloat(val);
      speedValLabel.textContent = `${val}x (${val < 1 ? 'Lenta' : val > 1 ? 'Rápida' : 'Normal'})`;
    });
  }

  // Generación de audio y cálculo de gráfico de torta
  const btnGenerateScam = document.getElementById('btnGenerateScam');
  const scamResultsPanel = document.getElementById('scamResultsPanel');
  const scamAudioText = document.getElementById('scamAudioText');
  const btnPlayScamAudio = document.getElementById('btnPlayScamAudio');

  let isPlayingScamCall = false;

  const scriptTexts = {
    urgencia: "¡Hola! Estoy secuestrado en un auto en la ruta, necesitás transferir dinero inmediatamente a este alias si no querés que pase lo peor.",
    confianza: "Hola, te contacto del departamento de seguridad bancaria. Detectamos un acceso sospechoso y necesitamos validar tu clave de coordenadas.",
    desesperacion: "¡Por favor ayudame! Me acaban de asaltar en la calle, no tengo mi teléfono y necesito que le mandes efectivo a la persona que va a tu casa."
  };

  if (btnGenerateScam && scamResultsPanel) {
    btnGenerateScam.addEventListener('click', () => {
      // Mostrar panel de resultados
      scamResultsPanel.style.display = 'block';
      scamResultsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Actualizar texto según emoción
      const text = scriptTexts[scamParams.emocion] || scriptTexts.urgencia;
      if (scamAudioText) scamAudioText.textContent = `"${text}"`;

      // Calcular métricas según combinación de parámetros
      const metrics = calculateScamMetrics(scamParams);
      renderDonutChart(metrics);
    });
  }

  // Reproducción de audio sintetizado configurado
  if (btnPlayScamAudio) {
    btnPlayScamAudio.addEventListener('click', () => {
      if (!('speechSynthesis' in window)) {
        alert('Tu navegador no soporta reproducción de voz sintetizada.');
        return;
      }

      const playIcon = btnPlayScamAudio.querySelector('.play-icon');
      const pauseIcon = btnPlayScamAudio.querySelector('.pause-icon');
      const span = btnPlayScamAudio.querySelector('span');

      if (isPlayingScamCall) {
        window.speechSynthesis.cancel();
        isPlayingScamCall = false;
        if (playIcon) playIcon.style.display = 'inline';
        if (pauseIcon) pauseIcon.style.display = 'none';
        if (span) span.textContent = 'Escuchar Llamada Creada';
      } else {
        stopAllAudio();
        const text = scriptTexts[scamParams.emocion] || scriptTexts.urgencia;
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.lang = 'es-AR';
        utterance.rate = scamParams.velocidad;

        if (scamParams.tono === 'grave') utterance.pitch = 0.6;
        else if (scamParams.tono === 'agudo') utterance.pitch = 1.4;
        else utterance.pitch = 1.0;

        utterance.onend = () => {
          isPlayingScamCall = false;
          if (playIcon) playIcon.style.display = 'inline';
          if (pauseIcon) pauseIcon.style.display = 'none';
          if (span) span.textContent = 'Escuchar Llamada Creada';
        };

        window.speechSynthesis.speak(utterance);
        isPlayingScamCall = true;
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'inline';
        if (span) span.textContent = 'Pausar Reproducción';
      }
    });
  }

  // Cálculo de métricas
  function calculateScamMetrics(params) {
    let credibilidad = 70;
    let panico = 65;
    let engaño = 75;

    if (params.acento === 'rioplatense') { credibilidad += 15; engaño += 10; }
    if (params.emocion === 'urgencia') { panico += 25; engaño += 8; }
    if (params.emocion === 'desesperacion') { panico += 20; credibilidad += 5; }
    if (params.intensidad === 'gritado') { panico += 15; }
    if (params.intensidad === 'susurro') { credibilidad += 8; }
    if (params.velocidad > 1.1) { panico += 10; }

    credibilidad = Math.min(96, Math.max(40, credibilidad));
    panico = Math.min(98, Math.max(35, panico));
    engaño = Math.min(95, Math.max(45, engaño));

    return [
      { name: 'Credibilidad Acústica', pct: credibilidad, color: '#00f2fe', desc: 'Nivel de confianza biológica proyectada por el timbre y acento.' },
      { name: 'Índice de Pánico Inducido', pct: panico, color: '#ff007f', desc: 'Grado de anulación del pensamiento racional por la urgencia auditiva.' },
      { name: 'Tasa de Engaño Exitoso', pct: engaño, color: '#a855f7', desc: 'Porcentaje estimado de víctimas que realizarían la transferencia sin dudar.' }
    ];
  }

  // Renderizado del Gráfico de Dona SVG con Tooltip en Hover
  function renderDonutChart(dataItems) {
    const svg = document.getElementById('scamDonutSvg');
    const legend = document.getElementById('pieLegend');
    const donutCenterPct = document.getElementById('donutCenterPct');
    const tooltip = document.getElementById('pieTooltip');

    if (!svg || !legend) return;

    svg.innerHTML = '';
    legend.innerHTML = '';

    const avg = Math.round(dataItems.reduce((acc, curr) => acc + curr.pct, 0) / dataItems.length);
    if (donutCenterPct) donutCenterPct.textContent = `${avg}%`;

    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    dataItems.forEach((item) => {
      const slicePct = item.pct / 100;
      const strokeDasharray = `${circumference * slicePct * 0.85} ${circumference}`;
      const strokeDashoffset = -accumulatedAngle;
      accumulatedAngle += circumference * slicePct * 0.85 + (circumference * 0.05);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '50');
      circle.setAttribute('cy', '50');
      circle.setAttribute('r', radius);
      circle.setAttribute('stroke', item.color);
      circle.setAttribute('stroke-dasharray', strokeDasharray);
      circle.setAttribute('stroke-dashoffset', strokeDashoffset);
      circle.classList.add('donut-segment');

      // HOVER EVENTS PARA REVELAR EL PORCENTAJE EN EL TOOLTIP
      circle.addEventListener('mouseenter', () => showTooltip(item));
      circle.addEventListener('mousemove', () => showTooltip(item));
      circle.addEventListener('mouseleave', () => {
        if (tooltip) tooltip.classList.remove('active');
      });

      svg.appendChild(circle);

      // Crear leyenda
      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';
      legendItem.innerHTML = `
        <div class="legend-color-dot" style="background: ${item.color};"></div>
        <div class="legend-text">
          <strong>${item.name}</strong>
          <small>${item.desc}</small>
        </div>
        <span class="legend-pct" style="color:${item.color}">${item.pct}%</span>
      `;

      legendItem.addEventListener('mouseenter', () => showTooltip(item));
      legendItem.addEventListener('mouseleave', () => {
        if (tooltip) tooltip.classList.remove('active');
      });

      legend.appendChild(legendItem);
    });

    function showTooltip(item) {
      if (!tooltip) return;
      document.getElementById('tooltipTitle').textContent = item.name;
      document.getElementById('tooltipPct').textContent = `${item.pct}%`;
      document.getElementById('tooltipPct').style.color = item.color;
      document.getElementById('tooltipDesc').textContent = item.desc;
      tooltip.classList.add('active');
    }
  }

});


