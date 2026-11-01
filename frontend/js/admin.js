/* =========================================================
   Admin panel logic
   - login.html: authenticates against /api/auth/login
   - dashboard.html: CRUD for rooms, bookings, customers,
     services and contact messages, guarded by the JWT token
========================================================= */

const TOKEN_KEY = 'pch_admin_token';
const ADMIN_KEY = 'pch_admin_info';

// style.css fades the <body> in from opacity:0 and expects something to add
// the "page-ready" class once the page has loaded. Public pages get this
// from js/main.js, but the admin pages don't load main.js — so without this,
// the whole admin area stays invisible. Handle it here instead.
document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => document.body.classList.add('page-ready'));
});

function isLoginPage() {
  return !!document.getElementById('loginForm');
}

function isDashboardPage() {
  return !!document.getElementById('adminNav');
}

/* ---------------- Login page ---------------- */
if (isLoginPage()) {
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorAlert = document.getElementById('errorAlert');
      errorAlert.classList.remove('show');

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const submitBtn = document.getElementById('submitBtn');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing In…';

      try {
        const { data } = await api.login({ email, password });
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(ADMIN_KEY, JSON.stringify({ name: data.name, email: data.email }));
        window.location.href = 'dashboard.html';
      } catch (err) {
        errorAlert.textContent = err.message;
        errorAlert.classList.add('show');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    });
  });
}

/* ---------------- Dashboard page ---------------- */
if (isDashboardPage()) {
  // Guard: redirect to login if no token
  if (!localStorage.getItem(TOKEN_KEY)) {
    window.location.href = 'login.html';
  }

  let rooms = [];

  document.addEventListener('DOMContentLoaded', () => {
    const adminInfo = JSON.parse(localStorage.getItem(ADMIN_KEY) || '{}');
    document.getElementById('adminName').textContent = adminInfo.name ? `Hi, ${adminInfo.name}` : '';

    // Sidebar navigation
    document.querySelectorAll('#adminNav button').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#adminNav button').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.admin-panel').forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`panel-${btn.dataset.panel}`).classList.add('active');
        document.getElementById('panelTitle').textContent = btn.textContent;
      });
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ADMIN_KEY);
      window.location.href = 'login.html';
    });

    loadOverview();
    loadRoomsTable();
    loadBookingsTable();
    loadCustomersTable();
    loadServicesTable();
    loadMessagesTable();

    document.getElementById('bookingStatusFilter').addEventListener('change', (e) => {
      loadBookingsTable(e.target.value);
    });

    setupRoomModal();
    setupServiceModal();
  });

  function handleAuthError(err) {
    if (err.message && err.message.toLowerCase().includes('not authorised')) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = 'login.html';
    }
  }

  async function loadOverview() {
    try {
      const [roomsRes, bookingsRes, messagesRes] = await Promise.all([
        api.getRooms(),
        api.getBookings(),
        api.getMessages(),
      ]);
      document.getElementById('statRooms').textContent = roomsRes.count;
      document.getElementById('statBookings').textContent = bookingsRes.count;
      document.getElementById('statPending').textContent = bookingsRes.data.filter((b) => b.status === 'pending').length;
      document.getElementById('statMessages').textContent = messagesRes.data.filter((m) => !m.isRead).length;
    } catch (err) {
      handleAuthError(err);
    }
  }

  /* ---------- Rooms ---------- */
  async function loadRoomsTable() {
    const tbody = document.getElementById('roomsTableBody');
    try {
      const { data } = await api.getRooms();
      rooms = data;
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="7">No rooms yet. Click "Add Room" to create one.</td></tr>';
        return;
      }
      tbody.innerHTML = data
        .map(
          (r) => `
        <tr>
          <td><img src="${(r.images && r.images[0]) || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=200'}" alt="${r.name}" /></td>
          <td>${r.name}</td>
          <td>${r.type}</td>
          <td>${formatNaira(r.price)}</td>
          <td>${r.capacity.adults} adults, ${r.capacity.children} children</td>
          <td>${r.isAvailable ? '<span class="badge badge-confirmed">Available</span>' : '<span class="badge badge-cancelled">Unavailable</span>'}</td>
          <td>
            <button class="icon-btn edit-room" data-id="${r._id}" title="Edit">✏️</button>
            <button class="icon-btn danger delete-room" data-id="${r._id}" title="Delete">🗑️</button>
          </td>
        </tr>`
        )
        .join('');

      tbody.querySelectorAll('.edit-room').forEach((btn) =>
        btn.addEventListener('click', () => openRoomModal(btn.dataset.id))
      );
      tbody.querySelectorAll('.delete-room').forEach((btn) =>
        btn.addEventListener('click', () => deleteRoomRow(btn.dataset.id))
      );
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7">Unable to load rooms (${err.message})</td></tr>`;
      handleAuthError(err);
    }
  }

  async function deleteRoomRow(id) {
    if (!confirm('Delete this room? This cannot be undone.')) return;
    try {
      await api.deleteRoom(id);
      loadRoomsTable();
      loadOverview();
    } catch (err) {
      alert(err.message);
    }
  }

  function setupRoomModal() {
    const modal = document.getElementById('roomModal');
    document.getElementById('addRoomBtn').addEventListener('click', () => openRoomModal());
    document.getElementById('cancelRoomModal').addEventListener('click', () => modal.classList.remove('open'));

    document.getElementById('roomForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('roomId').value;

      const payload = {
        name: document.getElementById('roomName').value.trim(),
        type: document.getElementById('roomType').value,
        description: document.getElementById('roomDescription').value.trim(),
        price: Number(document.getElementById('roomPrice').value),
        bedType: document.getElementById('roomBedType').value.trim() || 'Queen Bed',
        capacity: {
          adults: Number(document.getElementById('roomAdults').value),
          children: Number(document.getElementById('roomChildren').value || 0),
        },
        facilities: document
          .getElementById('roomFacilities')
          .value.split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        images: document
          .getElementById('roomImages')
          .value.split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        featured: document.getElementById('roomFeatured').value === 'true',
      };

      try {
        if (id) {
          await api.updateRoom(id, payload);
        } else {
          await api.createRoom(payload);
        }
        modal.classList.remove('open');
        loadRoomsTable();
        loadOverview();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  function openRoomModal(id) {
    const modal = document.getElementById('roomModal');
    const form = document.getElementById('roomForm');
    form.reset();
    document.getElementById('roomId').value = '';
    document.getElementById('roomModalTitle').textContent = id ? 'Edit Room' : 'Add Room';

    if (id) {
      const room = rooms.find((r) => r._id === id);
      if (room) {
        document.getElementById('roomId').value = room._id;
        document.getElementById('roomName').value = room.name;
        document.getElementById('roomType').value = room.type;
        document.getElementById('roomDescription').value = room.description;
        document.getElementById('roomPrice').value = room.price;
        document.getElementById('roomBedType').value = room.bedType || '';
        document.getElementById('roomAdults').value = room.capacity.adults;
        document.getElementById('roomChildren').value = room.capacity.children;
        document.getElementById('roomFacilities').value = (room.facilities || []).join(', ');
        document.getElementById('roomImages').value = (room.images || []).join(', ');
        document.getElementById('roomFeatured').value = String(!!room.featured);
      }
    }
    modal.classList.add('open');
  }

  /* ---------- Bookings ---------- */
  async function loadBookingsTable(status = '') {
    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = '<tr><td colspan="7">Loading bookings…</td></tr>';
    try {
      const query = status ? `?status=${status}` : '';
      const { data } = await api.getBookings(query);
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="7">No bookings found.</td></tr>';
        return;
      }
      tbody.innerHTML = data
        .map(
          (b) => `
        <tr>
          <td>${b.customer ? b.customer.fullName : 'Unknown'}<br/><small style="color:var(--charcoal-soft);">${b.customer ? b.customer.email : ''}</small></td>
          <td>${b.room ? b.room.name : 'Room removed'}</td>
          <td>${new Date(b.checkIn).toLocaleDateString()}</td>
          <td>${new Date(b.checkOut).toLocaleDateString()}</td>
          <td>$${b.totalPrice || 0}</td>
          <td>
            <select class="status-select" data-id="${b._id}">
              ${['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled']
                .map((s) => `<option value="${s}" ${s === b.status ? 'selected' : ''}>${s}</option>`)
                .join('')}
            </select>
          </td>
          <td><button class="icon-btn danger delete-booking" data-id="${b._id}" title="Delete">🗑️</button></td>
        </tr>`
        )
        .join('');

      tbody.querySelectorAll('.status-select').forEach((sel) =>
        sel.addEventListener('change', async () => {
          try {
            await api.updateBooking(sel.dataset.id, { status: sel.value });
            loadOverview();
          } catch (err) {
            alert(err.message);
          }
        })
      );
      tbody.querySelectorAll('.delete-booking').forEach((btn) =>
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this booking?')) return;
          try {
            await api.deleteBooking(btn.dataset.id);
            loadBookingsTable(status);
            loadOverview();
          } catch (err) {
            alert(err.message);
          }
        })
      );
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7">Unable to load bookings (${err.message})</td></tr>`;
      handleAuthError(err);
    }
  }

  /* ---------- Customers ---------- */
  async function loadCustomersTable() {
    const tbody = document.getElementById('customersTableBody');
    try {
      const res = await apiRequest('/customers');
      const data = res.data;
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="5">No customers yet.</td></tr>';
        return;
      }
      tbody.innerHTML = data
        .map(
          (c) => `
        <tr>
          <td>${c.fullName}</td>
          <td>${c.email}</td>
          <td>${c.phone}</td>
          <td>${c.country || '—'}</td>
          <td>${new Date(c.createdAt).toLocaleDateString()}</td>
        </tr>`
        )
        .join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5">Unable to load customers (${err.message})</td></tr>`;
      handleAuthError(err);
    }
  }

  /* ---------- Services ---------- */
  async function loadServicesTable() {
    const tbody = document.getElementById('servicesTableBody');
    try {
      const { data } = await api.getServices();
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="4">No services yet. Click "Add Service" to create one.</td></tr>';
        return;
      }
      tbody.innerHTML = data
        .map(
          (s) => `
        <tr>
          <td>${s.name}</td>
          <td>${s.description}</td>
          <td>${s.isActive ? 'Yes' : 'No'}</td>
          <td>
            <button class="icon-btn edit-service" data-id="${s._id}" title="Edit">✏️</button>
            <button class="icon-btn danger delete-service" data-id="${s._id}" title="Delete">🗑️</button>
          </td>
        </tr>`
        )
        .join('');

      tbody.querySelectorAll('.edit-service').forEach((btn) =>
        btn.addEventListener('click', () => openServiceModal(data.find((s) => s._id === btn.dataset.id)))
      );
      tbody.querySelectorAll('.delete-service').forEach((btn) =>
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this service?')) return;
          try {
            await apiRequest(`/services/${btn.dataset.id}`, { method: 'DELETE' });
            loadServicesTable();
          } catch (err) {
            alert(err.message);
          }
        })
      );
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4">Unable to load services (${err.message})</td></tr>`;
    }
  }

  function setupServiceModal() {
    const modal = document.getElementById('serviceModal');
    document.getElementById('addServiceBtn').addEventListener('click', () => openServiceModal());
    document.getElementById('cancelServiceModal').addEventListener('click', () => modal.classList.remove('open'));

    document.getElementById('serviceForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('serviceId').value;
      const payload = {
        name: document.getElementById('serviceName').value.trim(),
        description: document.getElementById('serviceDescription').value.trim(),
        icon: document.getElementById('serviceIcon').value,
      };
      try {
        if (id) {
          await apiRequest(`/services/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        } else {
          await apiRequest('/services', { method: 'POST', body: JSON.stringify(payload) });
        }
        modal.classList.remove('open');
        loadServicesTable();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  function openServiceModal(service) {
    const modal = document.getElementById('serviceModal');
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceId').value = '';
    document.getElementById('serviceModalTitle').textContent = service ? 'Edit Service' : 'Add Service';

    if (service) {
      document.getElementById('serviceId').value = service._id;
      document.getElementById('serviceName').value = service.name;
      document.getElementById('serviceDescription').value = service.description;
      document.getElementById('serviceIcon').value = service.icon || 'star';
    }
    modal.classList.add('open');
  }

  /* ---------- Messages ---------- */
  async function loadMessagesTable() {
    const tbody = document.getElementById('messagesTableBody');
    try {
      const { data } = await api.getMessages();
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="6">No messages yet.</td></tr>';
        return;
      }
      tbody.innerHTML = data
        .map(
          (m) => `
        <tr>
          <td>${m.name}${m.isRead ? '' : ' <span class="badge badge-pending">New</span>'}</td>
          <td>${m.email}</td>
          <td>${m.subject || '—'}</td>
          <td style="white-space:normal;max-width:280px;">${m.message}</td>
          <td>${new Date(m.createdAt).toLocaleDateString()}</td>
          <td><button class="icon-btn danger delete-message" data-id="${m._id}" title="Delete">🗑️</button></td>
        </tr>`
        )
        .join('');

      tbody.querySelectorAll('.delete-message').forEach((btn) =>
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this message?')) return;
          try {
            await api.deleteMessage(btn.dataset.id);
            loadMessagesTable();
            loadOverview();
          } catch (err) {
            alert(err.message);
          }
        })
      );
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6">Unable to load messages (${err.message})</td></tr>`;
      handleAuthError(err);
    }
  }
}
