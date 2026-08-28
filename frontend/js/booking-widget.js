/* =====================================================================
   Renax - Shared "Book Now" widget connector
   Wires up the booking forms that were previously just doing a plain
   page reload (action="#0", no JS) into real POST /api/bookings calls:
     - Homepage quick "Book Auto Rental" search bar (#homeBookingForm)
     - Homepage "Rent Now" popup modal (#rentNowForm)
     - Services page quick "Book Auto Rental" search bar (#servicesBookingForm)
     - Luxury Rentals "Book Your Chauffeur" bar (#luxuryBookingForm)
     - Commercial Fleet "Book Your Fleet Vehicle" bar (#fleetBookingForm)

   Self-contained: does not touch js/api-connect.js. Every function below
   is a no-op if its form isn't present on the current page, so this one
   file can safely be included on every page.
   ===================================================================== */
(function () {
  "use strict";

  var API_BASE_URL = "http://localhost:5000/api";

  document.addEventListener("DOMContentLoaded", function () {
    wireQuickBookingForm({
      formId: "homeBookingForm",
      msgId: "homeBookingMsg",
      carTypeSelectId: "hb-car-type",
      pickupLocationId: "hb-pickup-location",
      pickupDateId: "hb-pickup-date",
      returnDateId: "hb-return-date",
      nameId: "hb-name",
      emailId: "hb-email",
      phoneId: "hb-phone",
    });

    wireQuickBookingForm({
      formId: "servicesBookingForm",
      msgId: "servicesBookingMsg",
      carTypeSelectId: "sb-car-type",
      pickupLocationId: "sb-pickup-location",
      pickupDateId: "sb-pickup-date",
      returnDateId: "sb-return-date",
      nameId: "sb-name",
      emailId: "sb-email",
      phoneId: "sb-phone",
    });

    wireQuickBookingForm({
      formId: "luxuryBookingForm",
      msgId: "luxuryBookingMsg",
      fixedCategory: "luxury",
      notesFromSelectIds: ["lb-car", "lb-service-type"],
      pickupLocationId: "lb-pickup-location",
      pickupDateId: "lb-pickup-date",
      returnDateId: "lb-return-date",
      nameId: "lb-name",
      emailId: "lb-email",
      phoneId: "lb-phone",
    });

    wireQuickBookingForm({
      formId: "fleetBookingForm",
      msgId: "fleetBookingError",
      fixedCategory: "commercial",
      notesFromSelectIds: ["fbVehicleType", "fbLeaseTerm"],
      pickupLocationId: "fbPickupLocation",
      pickupDateId: "fbPickupDate",
      returnDateId: "fbReturnDate",
      nameId: "fbName",
      emailId: "fbEmail",
      phoneId: "fbPhone",
    });

    wireRentNowModal();
  });

  /* ------------------------------------------------------------------
     Generic wiring for the "quick search" style booking bars.
     ------------------------------------------------------------------ */
  function wireQuickBookingForm(cfg) {
    var form = document.getElementById(cfg.formId);
    if (!form) return;

    var msgBox = cfg.msgId ? document.getElementById(cfg.msgId) : null;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = getVal(cfg.nameId);
      var email = getVal(cfg.emailId);
      var phone = getVal(cfg.phoneId);

      var errors = [];
      if (!name) errors.push("Please enter your full name.");
      if (!isValidEmail(email)) errors.push("Please enter a valid email address.");
      if (!phone || phone.replace(/\D/g, "").length < 10) errors.push("Please enter a valid phone number (min 10 digits).");

      if (errors.length) {
        showMsg(msgBox, "error", errors.join("<br>"));
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      setLoadingState(submitBtn, true);
      hideMsg(msgBox);

      var category = cfg.fixedCategory || resolveCategoryFromSelect(document.getElementById(cfg.carTypeSelectId));

      var notes = "";
      if (cfg.notesFromSelectIds) {
        notes = cfg.notesFromSelectIds
          .map(function (id) { return getSelectText(id); })
          .filter(Boolean)
          .join(" | ");
      }

      fetchFirstVehicle(category)
        .then(function (vehicle) {
          if (!vehicle) {
            throw new Error("No vehicles are available for booking right now. Please contact us directly.");
          }

          var payload = {
            vehicle: vehicle._id,
            customerName: name,
            email: email,
            phone: phone,
            pickupDate: getVal(cfg.pickupDateId) || undefined,
            returnDate: getVal(cfg.returnDateId) || undefined,
            pickupLocation: getSelectText(cfg.pickupLocationId),
            notes: notes,
          };

          return fetch(API_BASE_URL + "/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then(function (res) { return res.json(); });
        })
        .then(function (result) {
          setLoadingState(submitBtn, false);
          if (result && result.success) {
            showMsg(msgBox, "success", "Thanks! Your booking request has been received — our team will confirm shortly.");
            form.reset();
          } else {
            showMsg(msgBox, "error", (result && result.error) || "Something went wrong. Please try again.");
          }
        })
        .catch(function (err) {
          setLoadingState(submitBtn, false);
          showMsg(msgBox, "error", err.message || "Could not reach the server. Is the backend running?");
        });
    });
  }

  /* ------------------------------------------------------------------
     Homepage "Rent Now" popup modal (#rentNowForm)
     ------------------------------------------------------------------ */
  function wireRentNowModal() {
    var form = document.getElementById("rentNowForm");
    if (!form) return;

    var msgBox = form.querySelector(".contact__msg");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = getVal("rn-name");
      var email = getVal("rn-email");
      var phone = getVal("rn-phone");

      var errors = [];
      if (!name) errors.push("Please enter your full name.");
      if (!isValidEmail(email)) errors.push("Please enter a valid email address.");
      if (!phone || phone.replace(/\D/g, "").length < 10) errors.push("Please enter a valid phone number (min 10 digits).");

      if (errors.length) {
        showMsg(msgBox, "error", errors.join("<br>"));
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      setLoadingState(submitBtn, true);
      hideMsg(msgBox);

      var category = resolveCategoryFromSelect(document.getElementById("rn-car-type"));

      fetchFirstVehicle(category)
        .then(function (vehicle) {
          if (!vehicle) {
            throw new Error("No vehicles are available for booking right now. Please contact us directly.");
          }

          var payload = {
            vehicle: vehicle._id,
            customerName: name,
            email: email,
            phone: phone,
            pickupDate: getVal("rn-pickup-date") || undefined,
            returnDate: getVal("rn-return-date") || undefined,
            pickupLocation: getSelectText("rn-pickup-location"),
            notes: getVal("rn-notes"),
          };

          return fetch(API_BASE_URL + "/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then(function (res) { return res.json(); });
        })
        .then(function (result) {
          setLoadingState(submitBtn, false);
          if (result && result.success) {
            showMsg(msgBox, "success", "Thanks! Your booking request has been received — our team will confirm shortly.");
            form.reset();
          } else {
            showMsg(msgBox, "error", (result && result.error) || "Something went wrong. Please try again.");
          }
        })
        .catch(function (err) {
          setLoadingState(submitBtn, false);
          showMsg(msgBox, "error", err.message || "Could not reach the server. Is the backend running?");
        });
    });
  }

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */

  // Turns the "Choose Car Type" dropdown text into a real backend
  // vehicle category. Only "Luxury Cars" maps cleanly onto the
  // backend's category enum — everything else falls back to "no
  // filter" so the booking can still go through against any vehicle.
  function resolveCategoryFromSelect(selectEl) {
    if (!selectEl) return null;
    var opt = selectEl.options[selectEl.selectedIndex];
    var text = opt ? opt.text.trim() : "";
    if (/luxury/i.test(text)) return "luxury";
    return null;
  }

  function fetchFirstVehicle(category) {
    var url = category
      ? API_BASE_URL + "/vehicles?category=" + encodeURIComponent(category)
      : API_BASE_URL + "/vehicles";

    return fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (result) {
        var list = result && result.success ? result.data : [];
        if (list && list.length) return list[0];
        if (!category) return null;
        // Nothing in that category yet — fall back to any available vehicle
        // so the booking can still be created.
        return fetch(API_BASE_URL + "/vehicles")
          .then(function (res2) { return res2.json(); })
          .then(function (result2) {
            var list2 = result2 && result2.success ? result2.data : [];
            return list2.length ? list2[0] : null;
          });
      })
      .catch(function () { return null; });
  }

  function getVal(id) {
    if (!id) return "";
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function getSelectText(id) {
    if (!id) return "";
    var el = document.getElementById(id);
    if (!el) return "";
    var opt = el.options ? el.options[el.selectedIndex] : null;
    var text = opt ? opt.text.trim() : "";
    if (!text || text === "0" || /^(choose|pick up|drop off|vehicle type|lease term|service type)/i.test(text)) return "";
    return text;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setLoadingState(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.dataset.originalText = btn.dataset.originalText || btn.textContent;
    btn.textContent = loading ? "Sending..." : btn.dataset.originalText;
  }

  function showMsg(box, type, html) {
    if (!box) return;
    box.style.display = "block";
    box.innerHTML = html;
    if (type === "success") {
      box.className = (box.className.indexOf("contact__msg") !== -1 ? "alert alert-success contact__msg" : "");
      box.style.color = "#2f7a3d";
      box.style.background = "#e8f7ea";
      box.style.border = "1px solid #bfe6c4";
      box.style.padding = "10px 15px";
      box.style.borderRadius = "6px";
    } else {
      box.style.color = "#c0392b";
      box.style.background = "#fdecea";
      box.style.border = "1px solid #f5c2bb";
      box.style.padding = "10px 15px";
      box.style.borderRadius = "6px";
    }
  }

  function hideMsg(box) {
    if (!box) return;
    box.style.display = "none";
    box.innerHTML = "";
  }
})();
