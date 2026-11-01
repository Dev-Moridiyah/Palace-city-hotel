/* =========================================================
   Dynamic Room Details page
   Reads the room id/ from the URL path (/rooms/:id) and
   fetches the matching room from the API — one HTML file
   serves every room instead of a page per room.
========================================================= */

function getRoomIdFromUrl() {
  // Supports /rooms/:id and, as a fallback, room-details.html?id=...
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const roomsIndex = pathParts.indexOf('rooms');
  if (roomsIndex !== -1 && pathParts[roomsIndex + 1]) {
    return decodeURIComponent(pathParts[roomsIndex + 1]);
  }
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function facilitiesList(facilities = []) {
  return facilities.map((f) => `<li>${f}</li>`).join('');
}

function renderRoom(room) {
  document.title = `${room.name} — Palace City Hotel`;
  document.getElementById('roomTitle').textContent = room.name;
  document.getElementById('roomBreadcrumb').textContent = room.name;

  const images = room.images && room.images.length ? room.images : [
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200',
  ];
  const mainImg = images[0];
  const thumb1 = images[1] || images[0];

  const container = document.getElementById('roomContent');
  container.innerHTML = `
    <div class="room-detail-gallery">
      <img src="${mainImg}" alt="${room.name}" />
      <div class="room-detail-thumbs">
        <img src="${thumb1}" alt="${room.name} view 2" />
        <img src="${images[2] || mainImg}" alt="${room.name} view 3" />
      </div>
    </div>

    <div class="room-detail-grid">
      <div class="room-detail-main">
        <span class="section-tag">${room.type}</span>
        <h2>${room.name}</h2>
        <div class="room-meta mt-lg" style="margin-bottom:26px;">
          <span>👤 ${room.capacity.adults} Adults, ${room.capacity.children} Children</span>
          <span>🛏 ${room.bedType}</span>
          ${room.sizeSqm ? `<span>📐 ${room.sizeSqm} m²</span>` : ''}
          <span>★ ${room.rating || 4.8} Rating</span>
        </div>
        <p>${room.description}</p>

        <h3 class="mt-lg" style="margin-bottom:6px;">Room Facilities</h3>
        <ul class="facilities-list">
          ${facilitiesList(room.facilities)}
        </ul>
      </div>

      <div class="book-box">
        <div class="price">${formatNaira(room.price)} <span>/ night</span></div>
        <p style="margin:14px 0 22px;font-size:0.88rem;">
          ${room.isAvailable ? 'Available for booking' : 'Currently unavailable'}
        </p>
        <a href="/booking.html?roomId=${room._id}" class="btn btn-gold btn-block">Book This Room</a>
        <a href="/rooms.html" class="btn btn-outline-dark btn-block mt-lg" style="margin-top:14px;">Back to All Rooms</a>
      </div>
    </div>
  `;
}

async function loadRoom() {
  const id = getRoomIdFromUrl();
  const container = document.getElementById('roomContent');

  if (!id) {
    container.innerHTML = '<div class="empty-state">No room specified.</div>';
    return;
  }

  try {
    const { data } = await api.getRoom(id);
    renderRoom(data);
  } catch (err) {
    document.getElementById('roomTitle').textContent = 'Room Not Found';
    container.innerHTML = `<div class="empty-state">We couldn't find that room. (${err.message}) <br/><br/>
      <a href="/rooms.html" class="btn btn-primary">Browse All Rooms</a></div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadRoom);
