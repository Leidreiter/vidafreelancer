// ANIMACIÓN DE NÚMEROS
const numbers = document.querySelectorAll('.sp-number');

const animateNumbers = () => {
  numbers.forEach(num => {
    const target = +num.dataset.target;
    const increment = target / 120; // velocidad

    const update = () => {
      const current = +num.innerText;

      if (current < target) {
        num.innerText = Math.ceil(current + increment);
        requestAnimationFrame(update);
      } else {
        num.innerText = target;
      }
    };

    update();
  });
};

// Dispara la animación cuando aparece en pantalla
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateNumbers();
      observer.disconnect();
    }
  });
});

observer.observe(document.querySelector('.sp-stats'));