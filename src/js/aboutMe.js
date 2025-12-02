// FADE UP SECUENCIAL PARA LOS LOGOS
const fadeItems = document.querySelectorAll('.fade-item');

const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      fadeItems.forEach((item, i) => {
        setTimeout(() => {
          item.classList.add('fade-up');
        }, i * 200); // delay entre logos
      });

      fadeObserver.disconnect();
    }
  });
});

fadeObserver.observe(document.querySelector('.sponsors-logos'));