/* =====================================================================
   Economy & Daily Self-Drive Rentals pillar — local script.
   Self-contained: does not touch js/api-connect.js or any other shared
   file, so the rest of the site is untouched. Talks to the same
   backend (Zohaib's REST API) at API_BASE_URL.
   Built by Muhammad Hamza (Frontend).
   ===================================================================== */
(function () {
  "use strict";

  var API_BASE_URL = "http://localhost:5000/api";

  document.addEventListener("DOMContentLoaded", function () {
    initOutstationCalculator();
    initInquiryForm();
  });

  /* ------------------------------------------------------------------
     Sub-page #3: interactive outstation inter-city price calculator
     ------------------------------------------------------------------ */
  function initOutstationCalculator() {
    var form = document.getElementById("ecr-price-calculator");
    if (!form) return;

    var distance = document.getElementById("ecr-distance-km");
    var days = document.getElementById("ecr-trip-days");
    var vehicleType = document.getElementById("ecr-vehicle-type");
    var driver = document.getElementById("ecr-with-driver");

    var distanceValueLabel = document.getElementById("ecr-distance-km-value");
    var totalOut = document.getElementById("ecr-total-fare");
    var baseOut = document.getElementById("ecr-breakdown-base");
    var distanceOut = document.getElementById("ecr-breakdown-distance");
    var driverOut = document.getElementById("ecr-breakdown-driver");
    var totalRowOut = document.getElementById("ecr-breakdown-total");

    var RATE_PER_KM = { hatchback: 22, sedan: 28, "hatchback-suv": 32 };
    var BASE_FARE = { hatchback: 3000, sedan: 4000, "hatchback-suv": 5500 };
    var DAILY_DRIVER_FEE = 2500;

    function fmt(n) {
      return "PKR " + Math.round(n).toLocaleString("en-PK");
    }

    function calculate() {
      var km = parseFloat(distance.value) || 0;
      var tripDays = parseInt(days.value, 10) || 1;
      var type = vehicleType.value || "hatchback";
      var withDriver = driver && driver.checked;

      var base = BASE_FARE[type] || BASE_FARE.hatchback;
      var perKmTotal = km * (RATE_PER_KM[type] || RATE_PER_KM.hatchback) * 2; // round trip
      var driverFee = withDriver ? DAILY_DRIVER_FEE * tripDays : 0;
      var total = base + perKmTotal + driverFee;

      if (distanceValueLabel) distanceValueLabel.textContent = km + " km";
      if (baseOut) baseOut.textContent = fmt(base);
      if (distanceOut) distanceOut.textContent = fmt(perKmTotal);
      if (driverOut) driverOut.textContent = fmt(driverFee);
      if (totalRowOut) totalRowOut.textContent = fmt(total);
      if (totalOut) totalOut.textContent = fmt(total);
    }

    [distance, days, vehicleType, driver].forEach(function (el) {
      if (!el) return;
      el.addEventListener("input", calculate);
      el.addEventListener("change", calculate);
    });

    calculate();
  }

  /* ------------------------------------------------------------------
     Booking & Inquiry Form — frontend validation + POST to backend
     ------------------------------------------------------------------ */
  function initInquiryForm() {
    var form = document.getElementById("ecr-inquiry-form");
    if (!form) return;

    var vehicleSelect = document.getElementById("ecr-field-vehicle");
    if (vehicleSelect) {
      fetchEconomyVehicles().then(function (vehicles) {
        vehicleSelect.innerHTML = '<option value="">Select a vehicle</option>' +
          vehicles.map(function (v) {
            return '<option value="' + v._id + '">' + escapeHtml(v.title) +
              (v.price ? " — PKR " + Number(v.price).toLocaleString("en-PK") + "/" + (v.priceUnit || "day") : "") +
              "</option>";
          }).join("");
        if (!vehicles.length) {
          vehicleSelect.innerHTML = '<option value="">No listed vehicles yet — general inquiry</option>';
        }
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      handleSubmit(form);
    });
  }

  function fetchEconomyVehicles() {
    return fetch(API_BASE_URL + "/vehicles?category=economy")
      .then(function (res) { return res.json(); })
      .then(function (result) { return result.success ? result.data : []; })
      .catch(function () { return []; });
  }

  function handleSubmit(form) {
    var fields = {
      name: form.querySelector("#ecr-field-name"),
      email: form.querySelector("#ecr-field-email"),
      phone: form.querySelector("#ecr-field-phone"),
      vehicle: form.querySelector("#ecr-field-vehicle"),
      date: form.querySelector("#ecr-field-date"),
      notes: form.querySelector("#ecr-field-notes"),
    };

    var isValid = true;
    isValid = validateRequired(fields.name, "Please enter your full name.") && isValid;
    isValid = validateEmail(fields.email) && isValid;
    isValid = validatePhone(fields.phone) && isValid;
    isValid = validateRequired(fields.vehicle, "Please choose a vehicle or inquiry type.") && isValid;

    if (!isValid) return;

    var payload = {
      vehicle: fields.vehicle.value,
      customerName: fields.name.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      pickupDate: fields.date && fields.date.value ? fields.date.value : undefined,
      notes: fields.notes ? fields.notes.value.trim() : "",
    };

    var submitBtn = form.querySelector('button[type="submit"]');
    var msgBox = form.querySelector(".ecr-form-msg");
    setLoadingState(submitBtn, true);
    hideMsg(msgBox);

    // Task: connect booking form onSubmit handler to Zohaib's REST API backend endpoint.
    fetch(API_BASE_URL + "/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) { return res.json(); })
      .then(function (result) {
        setLoadingState(submitBtn, false);
        if (result.success) {
          showMsg(msgBox, "success", "Thanks! Your rental request has been received — our team will confirm shortly.");
          form.reset();
        } else {
          showMsg(msgBox, "error", result.error || "Something went wrong. Please try again.");
        }
      })
      .catch(function () {
        setLoadingState(submitBtn, false);
        showMsg(msgBox, "error", "Could not reach the server. Is the backend running?");
      });
  }

  function validateRequired(field, message) {
    var wrapper = field ? field.closest(".ecr-field") : null;
    if (!field || !field.value || !field.value.trim()) {
      toggleError(wrapper, message);
      return false;
    }
    toggleError(wrapper, null);
    return true;
  }

  function validateEmail(field) {
    var wrapper = field ? field.closest(".ecr-field") : null;
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!field || !re.test(field.value.trim())) {
      toggleError(wrapper, "Please enter a valid email address.");
      return false;
    }
    toggleError(wrapper, null);
    return true;
  }

  function validatePhone(field) {
    var wrapper = field ? field.closest(".ecr-field") : null;
    var digits = field ? field.value.replace(/\D/g, "") : "";
    if (!field || digits.length < 10) {
      toggleError(wrapper, "Please enter a valid phone number (min 10 digits).");
      return false;
    }
    toggleError(wrapper, null);
    return true;
  }

  function toggleError(wrapper, message) {
    if (!wrapper) return;
    var errorEl = wrapper.querySelector(".ecr-error");
    if (message) {
      wrapper.classList.add("has-error");
      if (errorEl) errorEl.textContent = message;
    } else {
      wrapper.classList.remove("has-error");
    }
  }

  function setLoadingState(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.dataset.originalText = btn.dataset.originalText || btn.textContent;
    btn.textContent = loading ? "Sending..." : btn.dataset.originalText;
  }

  function showMsg(box, type, text) {
    if (!box) return;
    box.className = "ecr-form-msg " + type;
    box.textContent = text;
  }
  function hideMsg(box) {
    if (!box) return;
    box.className = "ecr-form-msg";
    box.textContent = "";
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
})();
