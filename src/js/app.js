const btnMenu = document.getElementById('btn-menu');
const sidebar = document.getElementById('sidebar');

btnMenu.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

// Cerrar sidebar al hacer clic en un enlace
const sidebarLinks = sidebar.querySelectorAll('a');
sidebarLinks.forEach(link => {
  link.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
});