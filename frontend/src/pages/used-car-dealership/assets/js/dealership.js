/* =====================================================================
   Used Car Dealership pillar — local script.
   Self-contained: does not touch js/api-connect.js or any other shared
   file, so the rest of the site is untouched. Talks to the same
   backend (Zohaib's REST API) at API_BASE_URL.
   ===================================================================== */
(function () {
  "use strict";

  var API_BASE_URL = "http://localhost:5000/api";

  document.addEventListener("DOMContentLoaded", function () {
    initLeaseCalculator();
    initInquiryForm();
  });

  /* ------------------------------------------------------------------
     Sub-page #3: interactive financing / lease calculator
     ------------------------------------------------------------------ */
  function initLeaseCalculator() {
    var form = document.getElementById("ucd-lease-calculator");
    if (!form) return;

    var price = document.getElementById("ucd-vehicle-price");
    var down = document.getElementById("ucd-down-payment");
    var term = document.getElementById("ucd-loan-term");
    var rate = document.getElementById("ucd-interest-rate");

    var downValueLabel = document.getElementById("ucd-down-payment-value");
    var monthlyOut = document.getElementById("ucd-monthly-payment");
    var principalOut = document.getElementById("ucd-breakdown-principal");
    var interestOut = document.getElementById("ucd-breakdown-interest");
    var totalOut = document.getElementById("ucd-breakdown-total");

    function fmt(n) {
      return "PKR " + Math.round(n).toLocaleString("en-PK");
    }

    function calculate() {
      var p = parseFloat(price.value) || 0;
      var downPct = parseFloat(down.value) || 0;
      var months = parseInt(term.value, 10) || 12;
      var annualRate = parseFloat(rate.value) || 0;

      var downAmount = (p * downPct) / 100;
      var principal = Math.max(p - downAmount, 0);
      var monthlyRate = annualRate / 100 / 12;

      var monthly;
      if (monthlyRate === 0) {
        monthly = principal / months;
      } else {
        monthly =
          (principal * monthlyRate) /
          (1 - Math.pow(1 + monthlyRate, -months));
      }
      if (!isFinite(monthly)) monthly = 0;

      var totalPayable = monthly * months;
      var totalInterest = totalPayable - principal;

      if (downValueLabel) downValueLabel.textContent = downPct + "%";
      if (monthlyOut) monthlyOut.textContent = fmt(monthly);
      if (principalOut) principalOut.textContent = fmt(principal);
      if (interestOut) interestOut.textContent = fmt(totalInterest > 0 ? totalInterest : 0);
      if (totalOut) totalOut.textContent = fmt(principal + (totalInterest > 0 ? totalInterest : 0));
    }

    [price, down, term, rate].forEach(function (el) {
      if (el) el.addEventListener("input", calculate);
    });

    calculate();
  }

  /* ------------------------------------------------------------------
     Booking & Inquiry Form — frontend validation + POST to backend
     ------------------------------------------------------------------ */
  function initInquiryForm() {
    var form = document.getElementById("ucd-inquiry-form");
    if (!form) return;

    var vehicleSelect = document.getElementById("ucd-field-vehicle");
    if (vehicleSelect) {
      fetchUsedCars().then(function (vehicles) {
        vehicleSelect.innerHTML = '<option value="">Select a vehicle</option>' +
          vehicles.map(function (v) {
            return '<option value="' + v._id + '">' + escapeHtml(v.title) +
              (v.price ? " — PKR " + Number(v.price).toLocaleString("en-PK") : "") +
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

  function fetchUsedCars() {
    return fetch(API_BASE_URL + "/vehicles?category=used-car")
      .then(function (res) { return res.json(); })
      .then(function (result) { return result.success ? result.data : []; })
      .catch(function () { return []; });
  }

  function handleSubmit(form) {
    var fields = {
      name: form.querySelector("#ucd-field-name"),
      email: form.querySelector("#ucd-field-email"),
      phone: form.querySelector("#ucd-field-phone"),
      vehicle: form.querySelector("#ucd-field-vehicle"),
      date: form.querySelector("#ucd-field-date"),
      notes: form.querySelector("#ucd-field-notes"),
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
    var msgBox = form.querySelector(".ucd-form-msg");
    setLoadingState(submitBtn, true);
    hideMsg(msgBox);

    fetch(API_BASE_URL + "/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) { return res.json(); })
      .then(function (result) {
        setLoadingState(submitBtn, false);
        if (result.success) {
          showMsg(msgBox, "success", "Thanks! Your inquiry has been received — our team will contact you shortly.");
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
    var wrapper = field ? field.closest(".ucd-field") : null;
    if (!field || !field.value || !field.value.trim()) {
      toggleError(wrapper, message);
      return false;
    }
    toggleError(wrapper, null);
    return true;
  }

  function validateEmail(field) {
    var wrapper = field ? field.closest(".ucd-field") : null;
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!field || !re.test(field.value.trim())) {
      toggleError(wrapper, "Please enter a valid email address.");
      return false;
    }
    toggleError(wrapper, null);
    return true;
  }

  function validatePhone(field) {
    var wrapper = field ? field.closest(".ucd-field") : null;
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
    var errorEl = wrapper.querySelector(".ucd-error");
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
    box.className = "ucd-form-msg " + type;
    box.textContent = text;
  }
  function hideMsg(box) {
    if (!box) return;
    box.className = "ucd-form-msg";
    box.textContent = "";
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
})();
