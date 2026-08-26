/*
  Renax - Fleet Admin Panel logic
  Requires js/api-connect.js to be loaded FIRST (it defines API_BASE_URL).
  Powers: stat cards, vehicle table (add/edit/delete), bookings table (status update).
*/

document.addEventListener("DOMContentLoaded", function () {
  const connBanner = document.getElementById("admin-conn-banner");
  const vehicleForm = document.getElementById("admin-vehicle-form");
  const vehicleTableBody = document.getElementById("admin-vehicle-tbody");
  const bookingTableBody = document.getElementById("admin-booking-tbody");
  const formTitle = document.getElementById("admin-form-title");
  const cancelEditBtn = document.getElementById("admin-cancel-edit");
  const categoryFilterBtns = document.querySelectorAll(".admin-tab-btn[data-filter]");

  let editingId = null;
  let currentFilter = "";

  const categoryLabels = {
    luxury: "Luxury",
    economy: "Economy",
    "used-car": "Used Car",
    workshop: "Workshop",
    commercial: "Commercial",
  };

  function showConnError() {
    if (connBanner) connBanner.classList.add("show");
  }
  function hideConnError() {
    if (connBanner) connBanner.classList.remove("show");
  }

  // ---------- STATS ----------
  async function loadStats() {
    try {
      const [vehiclesRes, bookingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/vehicles`),
        fetch(`${API_BASE_URL}/bookings`),
      ]);
      const vehiclesData = await vehiclesRes.json();
      const bookingsData = await bookingsRes.json();

      if (vehiclesData.success && bookingsData.success) {
        hideConnError();
        const vehicles = vehiclesData.data;
        const bookings = bookingsData.data;

        setText("stat-total-vehicles", vehicles.length);
        setText("stat-available-vehicles", vehicles.filter((v) => v.available).length);
        setText("stat-total-bookings", bookings.length);
        setText("stat-pending-bookings", bookings.filter((b) => b.status === "pending").length);
      }
    } catch (err) {
      showConnError();
      console.error("Stats load failed:", err);
    }
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // ---------- VEHICLES ----------
  async function loadVehicles() {
    if (!vehicleTableBody) return;
    try {
      const url = currentFilter
        ? `${API_BASE_URL}/vehicles?category=${encodeURIComponent(currentFilter)}`
        : `${API_BASE_URL}/vehicles`;
      const res = await fetch(url);
      const result = await res.json();

      if (!result.success) throw new Error(result.error || "Failed to load vehicles");
      hideConnError();
      renderVehicles(result.data);
    } catch (err) {
      showConnError();
      vehicleTableBody.innerHTML = `<tr><td colspan="7"><div class="admin-empty-state"><i class="fa-solid fa-plug-circle-xmark"></i>Could not load vehicles. Is the backend server running?</div></td></tr>`;
      console.error(err);
    }
  }

  function renderVehicles(vehicles) {
    if (!vehicles.length) {
      vehicleTableBody.innerHTML = `<tr><td colspan="7"><div class="admin-empty-state"><i class="fa-solid fa-car"></i>No vehicles in this category yet. Add one using the form above.</div></td></tr>`;
      return;
    }
    vehicleTableBody.innerHTML = vehicles
      .map(
        (v) => `
      <tr>
        <td><img class="thumb" src="${v.image || '../../../img/cars/1.png'}" alt="${escapeHtml(v.title)}" onerror="this.src='../../../img/cars/1.png'"></td>
        <td><strong>${escapeHtml(v.title)}</strong><br><span style="color:#999;font-size:12px;">${escapeHtml(v.brand || "")}</span></td>
        <td><span class="badge-pill badge-${v.category}">${categoryLabels[v.category] || v.category}</span></td>
        <td>PKR ${Number(v.price).toLocaleString()} ${v.priceUnit && v.priceUnit !== "fixed" ? "/ " + v.priceUnit : ""}</td>
        <td><span class="badge-pill ${v.available ? "badge-yes" : "badge-no"}">${v.available ? "Available" : "Unavailable"}</span></td>
        <td>${v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "-"}</td>
        <td>
          <button class="admin-btn-outline" data-edit="${v._id}">Edit</button>
          <button class="admin-btn-outline danger" data-delete="${v._id}">Delete</button>
        </td>
      </tr>`
      )
      .join("");

    vehicleTableBody.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => startEdit(btn.getAttribute("data-edit"), vehicles));
    });
    vehicleTableBody.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", () => deleteVehicle(btn.getAttribute("data-delete")));
    });
  }

  function startEdit(id, vehicles) {
    const v = vehicles.find((x) => x._id === id);
    if (!v || !vehicleForm) return;
    editingId = id;
    formTitle.textContent = "Edit Vehicle";
    vehicleForm.title.value = v.title || "";
    vehicleForm.category.value = v.category || "luxury";
    vehicleForm.brand.value = v.brand || "";
    vehicleForm.type.value = v.type || "";
    vehicleForm.price.value = v.price || "";
    vehicleForm.priceUnit.value = v.priceUnit || "day";
    vehicleForm.image.value = v.image || "";
    vehicleForm.description.value = v.description || "";
    vehicleForm.available.checked = !!v.available;
    if (cancelEditBtn) cancelEditBtn.style.display = "inline-block";
    vehicleForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    editingId = null;
    if (formTitle) formTitle.textContent = "Add New Vehicle";
    if (vehicleForm) vehicleForm.reset();
    if (cancelEditBtn) cancelEditBtn.style.display = "none";
  }

  async function deleteVehicle(id) {
    if (!confirm("Delete this vehicle? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/vehicles/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      loadVehicles();
      loadStats();
    } catch (err) {
      alert("Could not delete vehicle. Is the backend running?");
      console.error(err);
    }
  }

  if (vehicleForm) {
    vehicleForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const payload = {
        title: vehicleForm.title.value,
        category: vehicleForm.category.value,
        brand: vehicleForm.brand.value,
        type: vehicleForm.type.value,
        price: Number(vehicleForm.price.value),
        priceUnit: vehicleForm.priceUnit.value,
        image: vehicleForm.image.value,
        description: vehicleForm.description.value,
        available: vehicleForm.available.checked,
      };

      try {
        const url = editingId ? `${API_BASE_URL}/vehicles/${editingId}` : `${API_BASE_URL}/vehicles`;
        const method = editingId ? "PUT" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.error || "Save failed");

        resetForm();
        loadVehicles();
        loadStats();
      } catch (err) {
        alert("Could not save vehicle: " + err.message);
        console.error(err);
      }
    });
  }

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", resetForm);
  }

  categoryFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryFilterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.getAttribute("data-filter");
      loadVehicles();
    });
  });

  // ---------- BOOKINGS ----------
  async function loadBookings() {
    if (!bookingTableBody) return;
    try {
      const res = await fetch(`${API_BASE_URL}/bookings`);
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      hideConnError();
      renderBookings(result.data);
    } catch (err) {
      bookingTableBody.innerHTML = `<tr><td colspan="6"><div class="admin-empty-state"><i class="fa-solid fa-calendar-xmark"></i>Could not load bookings. Is the backend server running?</div></td></tr>`;
      console.error(err);
    }
  }

  function renderBookings(bookings) {
    if (!bookings.length) {
      bookingTableBody.innerHTML = `<tr><td colspan="6"><div class="admin-empty-state"><i class="fa-solid fa-calendar"></i>No bookings yet. New bookings from the website will show up here.</div></td></tr>`;
      return;
    }
    bookingTableBody.innerHTML = bookings
      .map((b) => {
        const vehicleTitle = b.vehicle && b.vehicle.title ? b.vehicle.title : "Deleted vehicle";
        return `
      <tr>
        <td><strong>${escapeHtml(b.customerName)}</strong><br><span style="color:#999;font-size:12px;">${escapeHtml(b.email)}</span></td>
        <td>${escapeHtml(vehicleTitle)}</td>
        <td>${b.pickupDate ? new Date(b.pickupDate).toLocaleDateString() : "-"} &rarr; ${b.returnDate ? new Date(b.returnDate).toLocaleDateString() : "-"}</td>
        <td>${escapeHtml(b.pickupLocation || "-")}</td>
        <td><span class="badge-pill badge-status-${b.status}">${b.status}</span></td>
        <td>
          <select class="status-select" data-status-id="${b._id}">
            <option value="pending" ${b.status === "pending" ? "selected" : ""}>Pending</option>
            <option value="confirmed" ${b.status === "confirmed" ? "selected" : ""}>Confirmed</option>
            <option value="cancelled" ${b.status === "cancelled" ? "selected" : ""}>Cancelled</option>
          </select>
        </td>
      </tr>`;
      })
      .join("");

    bookingTableBody.querySelectorAll("[data-status-id]").forEach((select) => {
      select.addEventListener("change", async () => {
        const id = select.getAttribute("data-status-id");
        try {
          const res = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: select.value }),
          });
          const result = await res.json();
          if (!result.success) throw new Error(result.error);
          loadBookings();
          loadStats();
        } catch (err) {
          alert("Could not update booking status.");
          console.error(err);
        }
      });
    });
  }

  function escapeHtml(str) {
    if (str === undefined || str === null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---------- INIT (only runs if this page has the admin elements) ----------
  if (vehicleTableBody || bookingTableBody) {
    loadStats();
    loadVehicles();
    loadBookings();
  }
});
