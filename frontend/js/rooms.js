/* =========================================================
   Rooms listing page — fetch + filter rooms from the API
========================================================= */

function roomCard(room) {
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

async function loadRooms(query = '') {
  const grid = document.getElementById('roomsGrid');
  grid.innerHTML = '<div class="loader"><div class="spinner"></div><span>Loading rooms…</span></div>';
  try {
    const { data } = await api.getRooms(query);
    if (!data.length) {
      grid.innerHTML = '<div class="empty-state">No rooms match your search. Try adjusting your filters.</div>';
      return;
    }
    grid.innerHTML = data.map(roomCard).join('');
    window.pchObserveReveals && window.pchObserveReveals(grid);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">We couldn't load rooms right now. (${err.message})</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadRooms();

  document.getElementById('applyFilters').addEventListener('click', () => {
    const type = document.getElementById('filterType').value;
    const guests = document.getElementById('filterGuests').value;
    const maxPrice = document.getElementById('filterPrice').value;

    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (guests) params.set('guests', guests);
    if (maxPrice) params.set('maxPrice', maxPrice);

    const qs = params.toString();
    loadRooms(qs ? `?${qs}` : '');
  });
});
