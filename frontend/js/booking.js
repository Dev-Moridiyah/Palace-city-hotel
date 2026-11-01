/* =========================================================
   Booking page — populates the room dropdown, validates the
   form, computes a live summary, and submits to the API.
========================================================= */

let allRooms = [];

function populateRoomSelect(preselectId) {
  const select = document.getElementById('roomSelect');
  select.innerHTML =
    '<option value="">Select a room…</option>' +
    allRooms
      .map((r) => `<option value="${r._id}" data-price="${r.price}">${r.name} — ${formatNaira(r.price)}/night</option>`)
      .join('');

  if (preselectId) select.value = preselectId;
  updateSummary();
}

function nightsBetween(checkIn, checkOut) {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diff = (outDate - inDate) / (1000 * 60 * 60 * 24);
  return diff > 0 ? Math.round(diff) : 0;
}

function updateSummary() {
  const select = document.getElementById('roomSelect');
  const selectedOption = select.options[select.selectedIndex];
  const room = allRooms.find((r) => r._id === select.value);
  const checkIn = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;

  const summaryRoom = document.getElementById('summaryRoom');
  const sumNights = document.getElementById('sumNights');
  const sumPrice = document.getElementById('sumPrice');
  const sumTotal = document.getElementById('sumTotal');

  if (!room) {
    summaryRoom.innerHTML = '<p style="color:var(--champagne-light);font-size:0.9rem;">Select a room to see a summary of your stay.</p>';
    sumNights.textContent = '—';
    sumPrice.textContent = '—';
    sumTotal.textContent = formatNaira(0);
    return;
  }

  const img = room.images && room.images[0] ? room.images[0] : 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=400';
  summaryRoom.innerHTML = `
    <img src="${img}" alt="${room.name}" />
    <div><strong>${room.name}</strong><span>${room.type}</span></div>
  `;
  sumNights.textContent = nights || '—';
  sumPrice.textContent = formatNaira(room.price);
  const newTotal = formatNaira(nights ? nights * room.price : 0);
  if (sumTotal.textContent !== newTotal) {
    sumTotal.textContent = newTotal;
    sumTotal.classList.remove('value-pulse');
    void sumTotal.offsetWidth; // restart animation
    sumTotal.classList.add('value-pulse');
  }
}

function showFieldError(id, isInvalid) {
  const group = document.getElementById(id).closest('.form-group');
  group.classList.toggle('invalid', isInvalid);
}

function validateForm() {
  let valid = true;
  const room = document.getElementById('roomSelect').value;
  const checkIn = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();

  const emailPattern = /^\S+@\S+\.\S+$/;

  if (!room) { showFieldError('roomSelect', true); valid = false; } else showFieldError('roomSelect', false);

  const nights = nightsBetween(checkIn, checkOut);
  if (!checkIn) { showFieldError('checkIn', true); valid = false; } else showFieldError('checkIn', false);
  if (!checkOut || nights <= 0) { showFieldError('checkOut', true); valid = false; } else showFieldError('checkOut', false);

  if (!fullName) { showFieldError('fullName', true); valid = false; } else showFieldError('fullName', false);
  if (!email || !emailPattern.test(email)) { showFieldError('email', true); valid = false; } else showFieldError('email', false);
  if (!phone) { showFieldError('phone', true); valid = false; } else showFieldError('phone', false);

  return valid;
}

async function loadRoomsIntoForm() {
  const select = document.getElementById('roomSelect');
  try {
    const { data } = await api.getRooms();
    allRooms = data;
    const params = new URLSearchParams(window.location.search);
    populateRoomSelect(params.get('roomId'));
  } catch (err) {
    select.innerHTML = `<option value="">Unable to load rooms (${err.message})</option>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('checkIn').setAttribute('min', today);
  document.getElementById('checkOut').setAttribute('min', today);

  loadRoomsIntoForm();

  ['roomSelect', 'checkIn', 'checkOut'].forEach((id) =>
    document.getElementById(id).addEventListener('change', updateSummary)
  );

  document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('successAlert').classList.remove('show');
    document.getElementById('errorAlert').classList.remove('show');

    if (!validateForm()) return;

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    const payload = {
      roomId: document.getElementById('roomSelect').value,
      checkIn: document.getElementById('checkIn').value,
      checkOut: document.getElementById('checkOut').value,
      adults: Number(document.getElementById('adults').value),
      children: Number(document.getElementById('children').value),
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      country: document.getElementById('country').value.trim(),
      specialRequests: document.getElementById('requests').value.trim(),
    };

    try {
      await api.createBooking(payload);
      document.getElementById('successAlert').classList.add('show');
      document.getElementById('bookingForm').reset();
      updateSummary();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const errorAlert = document.getElementById('errorAlert');
      errorAlert.textContent = err.message;
      errorAlert.classList.add('show');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Reservation';
    }
  });
});
