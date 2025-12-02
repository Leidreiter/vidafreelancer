// -------- POPUPS --------
const cards = document.querySelectorAll('.card');
const popups = document.querySelectorAll('.popup');
const closeBtns = document.querySelectorAll('.popup-close');

// Helper seguro para seleccionar la pista del carrusel (coincida por id o clase)
let carouselTrack = document.getElementById('carouselTrack') || document.querySelector('.carousel-track');
const carouselWrapper = document.querySelector('.carousel-wrapper');
const carouselControls = document.querySelectorAll('.carousel-control');

let isCarouselManual = false;
let manualOffset = 0;
let manualResumeTimeout = null;

if (!carouselTrack) {
  console.error('carouselTrack no encontrado. Asegurate de tener <div class="carousel-track"> o id="carouselTrack" en el HTML.');
} else {
  console.log('carouselTrack encontrado:', carouselTrack);
}

// Abrir popup
if (cards && cards.length) {
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-popup');
      const popup = document.getElementById(id);

      if (!popup) {
        console.warn(`Popup con id "${id}" no encontrado.`);
        return;
      }

      popup.style.display = 'flex';
      pauseCarousel();
    });

    // Pausar al hacer hover sobre la card (fallback por si el wrapper falla)
    card.addEventListener('mouseenter', () => {
      pauseCarousel();
    });
    card.addEventListener('mouseleave', () => {
      // Si hay un popup abierto, no reanudes.
      const anyOpen = Array.from(document.querySelectorAll('.popup')).some(p => p.style.display === 'flex');
      if (!anyOpen) resumeCarousel();
    });
  });
} else {
  console.warn('No se encontraron .card en el DOM.');
}

// Cerrar popup
if (closeBtns && closeBtns.length) {
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // suponiendo estructura: .popup > .popup-content > button.popup-close
      const popup = btn.closest('.popup');
      if (popup) {
        popup.style.display = 'none';
      }
      resumeCarousel();
    });
  });
}

// Cerrar clickeando fuera
if (popups && popups.length) {
  popups.forEach(p => {
    p.addEventListener('click', e => {
      if (e.target === p) {
        p.style.display = 'none';
        resumeCarousel();
      }
    });
  });
}

// -------- CARRUSEL CONTROL DINÁMICO --------
function pauseCarousel() {
  if (!carouselTrack || isCarouselManual) return;
  // Solo pausa si tiene animation
  const hasAnim = getComputedStyle(carouselTrack).animationName !== 'none';
  if (hasAnim) {
    carouselTrack.style.animationPlayState = 'paused';
    // tambien pausar cualquier transición por si acaso
    carouselTrack.style.transition = 'none';
    console.log('Carrusel pausado');
  }
}

function resumeCarousel() {
  if (!carouselTrack || isCarouselManual) return;
  carouselTrack.style.animationPlayState = 'running';
  console.log('Carrusel reanudado');
}

// --- PAUSA EN HOVER SOBRE EL WRAPPER (FIABLE) ---
if (carouselWrapper) {
  carouselWrapper.addEventListener('mouseenter', pauseCarousel);
  carouselWrapper.addEventListener('mouseleave', () => {
    // Si hay popup abierto, no reanudar
    const anyOpen = Array.from(document.querySelectorAll('.popup')).some(p => p.style.display === 'flex');
    if (!anyOpen) resumeCarousel();
  });
  console.log('Listeners de hover agregados en .carousel-wrapper');
} else {
  console.warn('.carousel-wrapper no encontrado; se usarán listeners en las cards como fallback.');
}

// -------- CONTROLES MANUALES DEL CARRUSEL --------
if (carouselControls && carouselControls.length) {
  carouselControls.forEach(control => {
    control.addEventListener('click', () => {
      const direction = control.dataset.direction === 'prev' ? 'prev' : 'next';
      moveCarousel(direction);
    });
  });
}

function moveCarousel(direction = 'next') {
  if (!carouselTrack) return;
  lockCarouselAnimation();

  const step = getCarouselStep();
  if (!step) return;

  manualOffset += direction === 'prev' ? step : -step;

  const overflow = Math.max(0, carouselTrack.scrollWidth - (carouselWrapper?.clientWidth || 0));
  const maxNegative = -overflow;
  if (manualOffset < maxNegative) {
    manualOffset = maxNegative;
  } else if (manualOffset > 0) {
    manualOffset = 0;
  }

  carouselTrack.style.transform = `translateX(${manualOffset}px)`;
  scheduleAutoResume();
}

function lockCarouselAnimation() {
  if (!carouselTrack || isCarouselManual) return;

  manualOffset = getCurrentTranslateX(carouselTrack);
  carouselTrack.style.animation = 'none';
  carouselTrack.classList.add('is-manual');
  carouselTrack.style.transform = `translateX(${manualOffset}px)`;
  isCarouselManual = true;
  console.log('Carrusel bloqueado en modo manual');
}

function scheduleAutoResume() {
  clearTimeout(manualResumeTimeout);
  manualResumeTimeout = setTimeout(() => {
    unlockCarouselAnimation();
  }, 4000);
}

function unlockCarouselAnimation() {
  if (!carouselTrack || !isCarouselManual) return;

  isCarouselManual = false;
  manualOffset = 0;
  carouselTrack.classList.remove('is-manual');
  carouselTrack.style.removeProperty('transform');
  carouselTrack.style.removeProperty('animation');
  carouselTrack.style.animationPlayState = 'running';
  console.log('Carrusel vuelve al modo automático');
}

function getCurrentTranslateX(element) {
  const style = window.getComputedStyle(element);
  const transform = style.transform;

  if (transform && transform !== 'none') {
    try {
      const MatrixCtor = window.DOMMatrixReadOnly || window.DOMMatrix || window.WebKitCSSMatrix;
      if (MatrixCtor) {
        const matrix = new MatrixCtor(transform);
        if (typeof matrix.m41 === 'number') return matrix.m41;
        if (typeof matrix.m13 === 'number') return matrix.m13;
      }
    } catch (error) {
      const match2d = transform.match(/matrix\(([^)]+)\)/);
      if (match2d) {
        const values = match2d[1].split(',').map(parseFloat);
        return values[4] || 0;
      }
      const match3d = transform.match(/matrix3d\(([^)]+)\)/);
      if (match3d) {
        const values = match3d[1].split(',').map(parseFloat);
        return values[12] || 0;
      }
    }
  }

  return 0;
}

function getCarouselStep() {
  if (!carouselTrack) return 0;
  const card = carouselTrack.querySelector('.card');
  const gapValue = parseFloat(getComputedStyle(carouselTrack).columnGap || getComputedStyle(carouselTrack).gap || '0');
  const cardWidth = card ? card.getBoundingClientRect().width : 0;
  return cardWidth + gapValue;
}

// -------- DRAG-TO-SCROLL DEL CARRUSEL --------
// let isDown = false;
// let startX;
// let scrollLeft;

// // Activamos el arrastre en el wrapper del carrusel
// if (carouselWrapper) {

//   carouselWrapper.addEventListener('mousedown', (e) => {
//     // Evita que al hacer clic en una card se abra el popup inmediatamente
//     if (e.target.classList.contains('card')) {
//       e.preventDefault();
//     }

//     isDown = true;
//     carouselWrapper.classList.add('dragging');

//     pauseCarousel();

//     startX = e.pageX - carouselWrapper.offsetLeft;
//     scrollLeft = carouselWrapper.scrollLeft;
//   });

//   carouselWrapper.addEventListener('mouseleave', () => {
//     isDown = false;
//     carouselWrapper.classList.remove('dragging');

//     // reanudar solo si no hay popups abiertos
//     const anyOpen = Array.from(popups).some(p => p.style.display === 'flex');
//     if (!anyOpen) resumeCarousel();
//   });

//   carouselWrapper.addEventListener('mouseup', () => {
//     isDown = false;
//     carouselWrapper.classList.remove('dragging');

//     const anyOpen = Array.from(popups).some(p => p.style.display === 'flex');
//     if (!anyOpen) resumeCarousel();
//   });

//   carouselWrapper.addEventListener('mousemove', (e) => {
//     if (!isDown) return;
//     e.preventDefault();

//     const x = e.pageX - carouselWrapper.offsetLeft;
//     const walk = (x - startX) * 1.8; // velocidad del desplazamiento

//     carouselWrapper.scrollLeft = scrollLeft - walk;
//   });
// }