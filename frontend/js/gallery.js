/* =========================================================
   Gallery page — client-side category filtering with a fade
   transition instead of an instant show/hide
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('#galleryFilters button');
  const items = document.querySelectorAll('#galleryGrid .gallery-item');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      items.forEach((item) => {
        const show = filter === 'all' || item.dataset.cat === filter;
        item.classList.toggle('filtered-out', !show);
      });
    });
  });
});
