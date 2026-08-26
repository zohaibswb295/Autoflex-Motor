/*
  Renax - Frontend <-> Backend connector
  Include this file on any page that needs to talk to the backend:
    <script src="js/api-connect.js"></script>

  Change API_BASE_URL to your live backend URL when you deploy.
*/

const API_BASE_URL = "http://localhost:5000/api";

// ---------- CONTACT FORM ----------
// Works with the form that has class="contact__form" (used on contact.html, index.html, etc.)
document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.querySelector(".contact__form");
  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const payload = {
        name: contactForm.querySelector('[name="name"]')?.value || "",
        email: contactForm.querySelector('[name="email"]')?.value || "",
        phone: contactForm.querySelector('[name="phone"]')?.value || "",
        subject: contactForm.querySelector('[name="subject"]')?.value || "",
        message: contactForm.querySelector('[name="message"]')?.value || "",
      };

      const msgBox = contactForm.querySelector(".contact__msg");

      try {
        const res = await fetch(`${API_BASE_URL}/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();

        if (result.success) {
          if (msgBox) {
            msgBox.textContent = "Your message was sent successfully.";
            msgBox.style.display = "block";
          } else {
            alert("Your message was sent successfully.");
          }
          contactForm.reset();
        } else {
          alert("Something went wrong: " + (result.error || "Please try again."));
        }
      } catch (err) {
        alert("Could not reach the server. Is the backend running?");
        console.error(err);
      }
    });
  }

  // ---------- NEWSLETTER FORM ----------
  // Works with any form inside .widget-newsletter (footer subscribe box on every page)
  document.querySelectorAll(".widget-newsletter form").forEach(function (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value : "";

      if (!email) return;

      try {
        const res = await fetch(`${API_BASE_URL}/newsletter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const result = await res.json();

        if (result.success) {
          alert("Subscribed successfully!");
          form.reset();
        } else {
          alert("Something went wrong: " + (result.error || "Please try again."));
        }
      } catch (err) {
        alert("Could not reach the server. Is the backend running?");
        console.error(err);
      }
    });
  });

  // ---------- DYNAMIC VEHICLE LISTING ----------
  // Looks for <div id="vehicle-list" data-category="luxury"></div>
  // and fills it with cards fetched from the backend.
  const vehicleList = document.getElementById("vehicle-list");
  if (vehicleList) {
    const category = vehicleList.getAttribute("data-category") || "";
    fetchVehicles(category).then((vehicles) => renderVehicleCards(vehicleList, vehicles));
  }
});

// Fetch vehicles from backend, optionally filtered by category
async function fetchVehicles(category) {
  try {
    const url = category
      ? `${API_BASE_URL}/vehicles?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/vehicles`;
    const res = await fetch(url);
    const result = await res.json();
    return result.success ? result.data : [];
  } catch (err) {
    console.error("Failed to fetch vehicles:", err);
    return [];
  }
}

// Render simple vehicle cards into a container
function renderVehicleCards(container, vehicles) {
  if (!vehicles.length) {
    container.innerHTML = "<p>No vehicles found.</p>";
    return;
  }

  container.innerHTML = vehicles
    .map(
      (v) => `
      <div class="col-lg-4 col-md-6 mb-30">
        <div class="car-item">
          <div class="car-thumb">
            <img src="${v.image || 'img/cars/1.png'}" alt="${v.title}">
          </div>
          <div class="car-content">
            <h5>${v.title}</h5>
            <p>${v.description || ""}</p>
            <span class="price">${v.priceUnit === 'fixed' ? 'PKR ' + v.price : 'PKR ' + v.price + ' / ' + v.priceUnit}</span>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}
