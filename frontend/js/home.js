/* =========================================================
   Homepage — loads featured rooms and services from the API
========================================================= */

const iconSvg = (name) => {
  const icons = {
    utensils: '<path d="M6 3v7a2 2 0 0 0 2 2v9M18 3v18M6 3a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2m12-9a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3"/>',
    waves: '<path d="M2 12c1.5 1.5 3.5 1.5 5 0s3.5-1.5 5 0 3.5 1.5 5 0 3.5-1.5 5 0M2 18c1.5 1.5 3.5 1.5 5 0s3.5-1.5 5 0 3.5 1.5 5 0 3.5-1.5 5 0"/>',
    wifi: '<path d="M5 12.5a11 11 0 0 1 14 0M8.5 16a6 6 0 0 1 7 0M12 19.5h.01"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    car: '<path d="M5 17h14M5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm14 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM3 17V9l2-5h14l2 5v8"/>',
    shirt: '<path d="M16 4l4 3-2 4h-2v9H8v-9H6l-2-4 4-3 4 2 4-2z"/>',
    dumbbell: '<path d="M6.5 6.5l11 11M4 10l-2 2 4 4 2-2M20 14l2-2-4-4-2 2M8 4l-2 2 2 2 2-2-2-2zM18 14l2 2-2 2-2-2 2-2z"/>',
    star: '<path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/>',
  };
  return icons[name] || icons.star;
};

function roomCardTemplate(room) {
  const img = room.images && room.images[0] ? room.images[0] : 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800';
  return `
    <div class="room-card" data-reveal>
      <div class="room-card-img">
        <span class="room-card-type">${room.type}</span>
        <img src="${img}" alt="${room.name}" loading="lazy" />
        <div class="room-card-price">${formatNaira(room.price)}<small> /night</small></div>
      </div>
      <div class="room-card-body">
        <h3>${room.name}</h3>
        <p class="desc">${room.description}</p>
        <div class="room-meta">
          <span>👤 ${room.capacity.adults + room.capacity.children} Guests</span>
          <span>🛏 ${room.bedType}</span>
          ${room.sizeSqm ? `<span>📐 ${room.sizeSqm} m²</span>` : ''}
        </div>
        <a href="/rooms/${room.slug || room._id}" class="btn btn-outline-dark">View Details</a>
      </div>
    </div>`;
}

function serviceCardTemplate(service) {
  return `
    <div class="service-card" data-reveal>
      <div class="service-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${iconSvg(service.icon)}</svg>
      </div>
      <h3>${service.name}</h3>
      <p>${service.description}</p>
    </div>`;
}

async function loadFeaturedRooms() {
  const container = document.getElementById('featuredRooms');
  if (!container) return;
  try {
    const { data } = await api.getRooms('?featured=true');
    const rooms = data.slice(0, 3);
    if (!rooms.length) {
      container.innerHTML = '<div class="empty-state">No featured rooms available right now. Please check back soon.</div>';
      return;
    }
    container.innerHTML = rooms.map(roomCardTemplate).join('');
    window.pchObserveReveals && window.pchObserveReveals(container);
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Unable to load rooms right now. (${err.message})</div>`;
  }
}

async function loadHomeServices() {
  const container = document.getElementById('homeServices');
  if (!container) return;
  try {
    const { data } = await api.getServices();
    const services = data.slice(0, 8);
    if (!services.length) {
      container.innerHTML = '<div class="empty-state">Service information coming soon.</div>';
      return;
    }
    container.innerHTML = services.map(serviceCardTemplate).join('');
    window.pchObserveReveals && window.pchObserveReveals(container);
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Unable to load services right now. (${err.message})</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedRooms();
  loadHomeServices();
});
