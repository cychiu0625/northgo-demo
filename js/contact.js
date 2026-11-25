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
    /* 詢價表 C＝新增：POST /api/enquiries。不寄信。成功顯示句子＋編號；失敗停在原頁。 */
    var form = document.getElementById("enquiry-form");
    var submitBtn = document.getElementById("enquiry-submit");
    var statusBox = document.getElementById("form-status");
    var given = form.querySelector('[name="given-name"]');
    if (given && !given.value) given.value = "客戶 A";
    var busy = false;
    var fieldKeys = {};
    var fieldRaw = {};
    var statusKey = "";
    var statusRaw = "";
    var statusKind = "";

    function copyText(key) {
      var pack = window.NorthgoContent && window.NorthgoContent.fieldErrors;
      var lang = Northgo.lang;
      if (pack && pack[lang] && pack[lang][key]) return pack[lang][key];
      if (pack && pack["zh-tw"] && pack["zh-tw"][key]) return pack["zh-tw"][key];
      if (pack && pack.en && pack.en[key]) return pack.en[key];
      return key;
    }

    function clearFieldErrors() {
      form.querySelectorAll(".field-err").forEach(function (node) {
        node.hidden = true;
        node.textContent = "";
      });
      fieldKeys = {};
      fieldRaw = {};
    }

    function showFieldError(name, key) {
      var node = document.getElementById("err-" + name);
      if (!node) return;
      fieldKeys[name] = key;
      delete fieldRaw[name];
      node.textContent = copyText(key);
      node.hidden = false;
    }

    function showFieldMessage(name, text) {
      var node = document.getElementById("err-" + name);
      if (!node) return;
      fieldRaw[name] = text;
      delete fieldKeys[name];
      node.textContent = text;
      node.hidden = false;
    }

    function setStatus(key, kind) {
      statusKey = key || "";
      statusRaw = "";
      statusKind = kind || "";
      if (!statusBox) return;
      if (!key) {
        statusBox.hidden = true;
        statusBox.textContent = "";
        statusBox.classList.remove("is-ok", "is-err");
        return;
      }
      statusBox.textContent = copyText(key);
      statusBox.hidden = false;
      statusBox.classList.toggle("is-ok", kind === "ok");
      statusBox.classList.toggle("is-err", kind === "err");
    }

    function setStatusText(text, kind) {
      statusKey = "";
      statusRaw = text || "";
      statusKind = kind || "";
      if (!statusBox) return;
      if (!text) {
        statusBox.hidden = true;
        statusBox.textContent = "";
        statusBox.classList.remove("is-ok", "is-err");
        return;
      }
      statusBox.textContent = text;
      statusBox.hidden = false;
      statusBox.classList.toggle("is-ok", kind === "ok");
      statusBox.classList.toggle("is-err", kind === "err");
    }

    function setBusy(on) {
      busy = on;
      if (!submitBtn) return;
      submitBtn.disabled = on;
      submitBtn.textContent = copyText(on ? "formSending" : "formSend");
    }

    function refreshCopy() {
      Object.keys(fieldKeys).forEach(function (name) {
        var node = document.getElementById("err-" + name);
        if (node && !node.hidden) node.textContent = copyText(fieldKeys[name]);
      });
      Object.keys(fieldRaw).forEach(function (name) {
        var node = document.getElementById("err-" + name);
        if (node && !node.hidden) node.textContent = fieldRaw[name];
      });
      if (statusRaw) setStatusText(statusRaw, statusKind);
      else if (statusKey) setStatus(statusKey, statusKind);
      if (submitBtn && !busy) submitBtn.textContent = copyText("formSend");
      if (submitBtn && busy) submitBtn.textContent = copyText("formSending");
    }

    function emailLooksOk(value) {
      var at = value.indexOf("@");
      if (at < 1 || at >= value.length - 1) return false;
      var domain = value.slice(at + 1);
      return domain.indexOf(".") > 0 && domain.indexOf(".") < domain.length - 1;
    }

    function collectPayload() {
      var fields = form.elements;
      var services = [];
      form.querySelectorAll('[name="services"]:checked').forEach(function (box) {
        services.push(box.value);
      });
      return {
        "given-name": String(fields.namedItem("given-name") && fields.namedItem("given-name").value || "").trim(),
        "family-name": String(fields.namedItem("family-name") && fields.namedItem("family-name").value || "").trim(),
        company: String(fields.namedItem("company") && fields.namedItem("company").value || "").trim(),
        email: String(fields.namedItem("email") && fields.namedItem("email").value || "").trim(),
        phone: String(fields.namedItem("phone") && fields.namedItem("phone").value || "").trim(),
        country: String(fields.namedItem("country") && fields.namedItem("country").value || "").trim(),
        services: services,
        message: String(fields.namedItem("message") && fields.namedItem("message").value || ""),
        "ship-date": String(fields.namedItem("ship-date") && fields.namedItem("ship-date").value || "").trim(),
        terms: !!(fields.namedItem("terms") && fields.namedItem("terms").checked)
      };
    }

    function focusFirstError() {
      var order = ["given-name", "family-name", "company", "email", "phone", "message", "terms"];
      var i;
      for (i = 0; i < order.length; i += 1) {
        if (fieldKeys[order[i]] || fieldRaw[order[i]]) {
          var el = form.elements.namedItem(order[i]);
          if (el && el.focus) el.focus();
          return;
        }
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (busy) return;

      var payload = collectPayload();
      var firstBad = null;

      clearFieldErrors();
      setStatus("", "");

      function fail(name, key) {
        showFieldError(name, key);
        if (!firstBad) firstBad = form.elements.namedItem(name);
      }

      if (!payload["given-name"]) fail("given-name", "fieldCheck");
      if (!payload["family-name"]) fail("family-name", "fieldCheck");
      if (!payload.company) fail("company", "fieldCheck");
      if (!payload.email) fail("email", "fieldCheck");
      else if (!emailLooksOk(payload.email)) fail("email", "emailInvalid");
      if (!payload.phone) fail("phone", "fieldCheck");
      if (payload.message.length > 4000) fail("message", "messageTooLong");
      if (!payload.terms) fail("terms", "fieldCheck");

      if (firstBad) {
        setStatus("formFixFields", "err");
        if (firstBad.focus) firstBad.focus();
        return;
      }

      /* C：POST 新增一筆。不寄信；狀態由伺服器預設「新進」。試的時候只用假資料「客戶 A」。 */
      setBusy(true);
      fetch("/api/enquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, status: res.status, data: data || {} };
          }).catch(function () {
            return { ok: false, status: res.status, data: {} };
          });
        })
        .then(function (result) {
          setBusy(false);
          var data = result.data;
          if (result.ok && data.ok && data.id) {
            var line = (data.message || copyText("formSuccess")) + " " + data.id;
            setStatusText(line, "ok");
            form.reset();
            clearFieldErrors();
            if (given) given.value = "客戶 A";
            return;
          }
          if (data.fields && typeof data.fields === "object") {
            Object.keys(data.fields).forEach(function (name) {
              showFieldMessage(name, data.fields[name]);
            });
            setStatusText(data.message || copyText("formFixFields"), "err");
            focusFirstError();
            return;
          }
          setStatus("formFail", "err");
        })
        .catch(function () {
          setBusy(false);
          setStatus("formFail", "err");
        });
    });
    Northgo.onLang = function () {
      caption();
      renderList();
      refreshCopy();
    };
    refreshCopy();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
