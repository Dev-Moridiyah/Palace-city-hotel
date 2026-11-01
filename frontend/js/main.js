/* =========================================================
   Palace City Hotel — global site behaviour
   Navbar scroll state, mobile menu, active link, footer year
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Soft page fade-in on load
  requestAnimationFrame(() => document.body.classList.add('page-ready'));

  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  const onScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach((link) =>
      link.addEventListener('click', () => navLinks.classList.remove('open'))
    );
  }

  // Highlight the current page in the nav
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[data-page]').forEach((link) => {
    if (link.dataset.page === current) link.classList.add('active');
  });

  // Footer year
  document.querySelectorAll('.current-year').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // Simple reveal-on-scroll for section headers/cards.
  // Exposed on window so pages that insert cards after an API call
  // (rooms, services, featured rooms) can (re-)observe the new elements.
  window.pchObserveReveals = (root = document) => {
    const targets = root.querySelectorAll('[data-reveal]:not(.revealed)');
    if (!('IntersectionObserver' in window) || !targets.length) {
      targets.forEach((el) => el.classList.add('revealed'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((el) => observer.observe(el));
  };

  window.pchObserveReveals();
});
