(function () {
  var FAN = {
    taipei: [-18, -40],
    taichung: [-18, 0],
    kaohsiung: [-18, 40],
    tokyo: [22, -28],
    osaka: [22, 20],
    "ho-chi-minh": [36, 52],
    "los-angeles": [0, 0]
  };
  var region = "all";
  var map;
  var markers = {};
  var active = "";

  function narrow() { return window.innerWidth < 860; }

  function icon(office, on) {
    var zoom = map.getZoom();
    var shift = zoom < 5 ? FAN[office.id] || [0, 0] : [0, 0];
    var scale = narrow() && region === "all" ? 0.72 : 1;
    return L.divIcon({
      className: "",
      html: '<div class="pin' + (on ? " on" : "") + '">' + office.n + "</div>",
      iconSize: [28, 28],
      iconAnchor: [14 - shift[0] * scale, 14 - shift[1] * scale]
    });
  }

  function fit() {
    var list = Northgo.offices.filter(function (office) {
      return region === "all" || office.region === region;
    });
    var bounds = L.latLngBounds(list.map(function (office) {
      return [office.lat, office.lng];
    }));
    var maxZoom = { all: narrow() ? 2 : 3, taiwan: 8, japan: 7, "southeast-asia": 8, americas: 6 }[region];
    var pad = bounds.pad(region === "all" && narrow() ? 0.6 : 0.35);
    var padding = region === "all" && narrow() ? [36, 36] : [48, 48];
    map.fitBounds(pad, { padding: padding, maxZoom: maxZoom, animate: false });
    refreshIcons();
  }

  function refreshIcons() {
    Northgo.offices.forEach(function (office) {
      markers[office.id].setIcon(icon(office, office.id === active));
    });
  }

  function caption() {
    var key = { all: "mapAll", taiwan: "mapTaiwan", japan: "mapJapan", "southeast-asia": "mapSea", americas: "mapAmericas" }[region];
    document.getElementById("map-caption").textContent = Northgo.t(key);
  }

  function renderList() {
    var root = document.getElementById("office-list");
    root.innerHTML = "";
    Northgo.offices.forEach(function (office) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "office";
      button.setAttribute("aria-pressed", String(office.id === active));
      var title = document.createElement("b");
      title.textContent = office.n + " · " + Northgo.t(office.key) + (office.hq ? " · " + Northgo.t("hq") : "");
      var meta = document.createElement("span");
      meta.textContent = office.address;
      button.appendChild(title);
      button.appendChild(meta);
      if (office.id === active) {
        var detail = document.createElement("span");
        detail.textContent = office.tel + (office.fax ? " · " + office.fax : "") + " · " + office.email;
        button.appendChild(detail);
      }
      button.addEventListener("click", function () { focus(office.id); });
      root.appendChild(button);
    });
  }

  function focus(id) {
    active = id;
    var office = Northgo.offices.filter(function (item) { return item.id === id; })[0];
    map.flyTo([office.lat, office.lng], Math.max(map.getZoom(), 8));
    refreshIcons();
    renderList();
  }

  function boot() {
    map = L.map("map", { scrollWheelZoom: false });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);
    map.setView([22, 122], 2);
    Northgo.offices.forEach(function (office) {
      var marker = L.marker([office.lat, office.lng], { icon: icon(office, false) }).addTo(map);
      marker.on("click", function () { focus(office.id); });
      markers[office.id] = marker;
    });
    fit();
    caption();
    renderList();
    setTimeout(function () { map.invalidateSize(); fit(); }, 80);
    window.addEventListener("resize", function () { map.invalidateSize(); fit(); });
    document.querySelectorAll("[data-region]").forEach(function (button) {
      button.addEventListener("click", function () {
        region = button.getAttribute("data-region");
        active = "";
        document.querySelectorAll("[data-region]").forEach(function (item) {
          item.setAttribute("aria-pressed", String(item === button));
        });
        fit();
        caption();
        renderList();
      });
    });
    var copyOverrides = {};
    var formBusy = false;

    function enquiryText(key) {
      if (copyOverrides[key]) return copyOverrides[key];
      return Northgo.t(key);
    }

    function applyEnquiryCopy() {
      var form = document.getElementById("enquiry-form");
      if (!form) return;
      var title = document.querySelector("#enquiry h2");
      if (title) title.textContent = enquiryText("formTitle");
      form.querySelectorAll("[data-i18n]").forEach(function (node) {
        var key = node.getAttribute("data-i18n");
        if (!key) return;
        node.textContent = enquiryText(key);
      });
      var ok = document.getElementById("form-ok");
      var error = document.getElementById("form-error");
      if (ok && !ok.hidden) ok.textContent = enquiryText("thanks");
      if (error && !error.hidden) error.textContent = enquiryText("formError");
    }

    function loadEnquiryCopy() {
      return fetch("/api/enquiry-copy?lang=" + encodeURIComponent(Northgo.lang), {
        credentials: "same-origin"
      })
        .then(function (res) { return res.ok ? res.json() : { copy: {} }; })
        .then(function (data) {
          copyOverrides = data.copy || {};
          applyEnquiryCopy();
        })
        .catch(function () {
          copyOverrides = {};
          applyEnquiryCopy();
        });
    }

    document.getElementById("enquiry-form").addEventListener("submit", function (event) {
      event.preventDefault();
      if (formBusy) return;
      var form = event.currentTarget;
      var error = document.getElementById("form-error");
      var ok = document.getElementById("form-ok");
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      var service = form.service.value;
      if (!name || !email || !message || email.indexOf("@") < 1) {
        error.hidden = false;
        error.textContent = enquiryText("formError");
        ok.hidden = true;
        return;
      }
      formBusy = true;
      error.hidden = true;
      ok.hidden = true;
      fetch("/api/enquiries", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name,
          email: email,
          service: service,
          message: message,
          lang: Northgo.lang
        })
      })
        .then(function (res) {
          if (!res.ok) throw new Error("submit failed");
          ok.hidden = false;
          ok.textContent = enquiryText("thanks");
          form.reset();
        })
        .catch(function () {
          error.hidden = false;
          error.textContent = enquiryText("formError");
        })
        .finally(function () {
          formBusy = false;
        });
    });
    Northgo.onLang = function () {
      caption();
      renderList();
      loadEnquiryCopy();
    };
    loadEnquiryCopy();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
