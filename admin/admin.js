(function () {
  var COPY_KEYS = [
    "formTitle", "name", "email", "service", "message", "send",
    "formError", "thanks", "optFreight", "optProject", "optWarehouse", "optAgency"
  ];
  var COPY_LABELS = {
    formTitle: "Form title",
    name: "Name label",
    email: "Email label",
    service: "Service label",
    message: "Message label",
    send: "Submit button",
    formError: "Validation error",
    thanks: "Success message",
    optFreight: "Option · Freight",
    optProject: "Option · Project",
    optWarehouse: "Option · Warehouse",
    optAgency: "Option · Agency"
  };
  var SERVICE_LABELS = {
    freight: "Freight",
    project: "Project",
    warehouse: "Warehouse",
    agency: "Agency"
  };

  function api(path, options) {
    options = options || {};
    return fetch(path, {
      credentials: "same-origin",
      headers: Object.assign({ "content-type": "application/json" }, options.headers || {}),
      method: options.method || "GET",
      body: options.body ? JSON.stringify(options.body) : undefined
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        return { ok: res.ok, status: res.status, data: data };
      });
    });
  }

  function requireSession() {
    return api("/api/admin/session").then(function (res) {
      if (!res.ok) {
        location.replace("login.html");
        return false;
      }
      return true;
    });
  }

  function bindLogout() {
    var btn = document.querySelector("[data-logout]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      api("/api/admin/logout", { method: "POST" }).finally(function () {
        location.href = "login.html";
      });
    });
  }

  function markNav() {
    var page = document.body.getAttribute("data-admin");
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      if (link.getAttribute("data-nav") === page) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function bootLogin() {
    var form = document.getElementById("login-form");
    var err = document.getElementById("login-error");
    api("/api/admin/session").then(function (res) {
      if (res.ok) location.replace("index.html");
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      err.hidden = true;
      var password = form.password.value;
      api("/api/admin/login", { method: "POST", body: { password: password } }).then(function (res) {
        if (!res.ok) {
          err.hidden = false;
          err.textContent = "Password incorrect.";
          return;
        }
        location.href = "index.html";
      }).catch(function () {
        err.hidden = false;
        err.textContent = "Could not reach the server.";
      });
    });
  }

  function statusBadge(status) {
    return '<span class="badge ' + status + '">' + status + "</span>";
  }

  function bootInbox() {
    var listRoot = document.getElementById("enquiry-list");
    var detailRoot = document.getElementById("enquiry-detail");
    var filter = document.getElementById("status-filter");
    var empty = document.getElementById("enquiry-empty");
    var selected = "";
    var items = [];

    function load() {
      var q = filter.value ? ("?status=" + encodeURIComponent(filter.value)) : "";
      return api("/api/admin/enquiries" + q).then(function (res) {
        if (!res.ok) {
          listRoot.innerHTML = "<tr><td colspan='5'>Failed to load.</td></tr>";
          return;
        }
        items = res.data.items || [];
        renderList();
        if (selected) {
          var still = items.some(function (item) { return item.id === selected; });
          if (still) showDetail(selected);
          else {
            selected = "";
            detailRoot.hidden = true;
          }
        }
      });
    }

    function renderList() {
      empty.hidden = items.length > 0;
      if (!items.length) {
        listRoot.innerHTML = "";
        return;
      }
      listRoot.innerHTML = items.map(function (item) {
        return [
          "<tr data-id=\"" + item.id + "\" data-active=\"" + (item.id === selected) + "\">",
          "<td><button type=\"button\" class=\"linkish\" data-open=\"" + item.id + "\">" + escapeHtml(item.name) + "</button></td>",
          "<td>" + escapeHtml(item.email) + "</td>",
          "<td>" + escapeHtml(SERVICE_LABELS[item.service] || item.service) + "</td>",
          "<td>" + statusBadge(item.status) + "</td>",
          "<td>" + escapeHtml(formatWhen(item.created_at)) + "</td>",
          "</tr>"
        ].join("");
      }).join("");
      listRoot.querySelectorAll("[data-open]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          showDetail(btn.getAttribute("data-open"));
        });
      });
    }

    function showDetail(id) {
      selected = id;
      renderList();
      var item = items.filter(function (row) { return row.id === id; })[0];
      if (!item) return;
      detailRoot.hidden = false;
      detailRoot.innerHTML = [
        "<div class=\"card detail\">",
        "<div class=\"actions\">",
        statusBadge(item.status),
        "<span class=\"meta\">" + escapeHtml(item.lang) + " · " + escapeHtml(formatWhen(item.created_at)) + "</span>",
        "</div>",
        "<div><b>" + escapeHtml(item.name) + "</b><div class=\"meta\">" + escapeHtml(item.email) + " · " + escapeHtml(SERVICE_LABELS[item.service] || item.service) + "</div></div>",
        "<div class=\"message\">" + escapeHtml(item.message) + "</div>",
        "<label>Status<select id=\"detail-status\">",
        ["new", "read", "done"].map(function (s) {
          return "<option value=\"" + s + "\"" + (s === item.status ? " selected" : "") + ">" + s + "</option>";
        }).join(""),
        "</select></label>",
        "<label>Note<textarea id=\"detail-note\">" + escapeHtml(item.note || "") + "</textarea></label>",
        "<div class=\"actions\">",
        "<button type=\"button\" class=\"btn primary\" id=\"detail-save\">Save</button>",
        "<button type=\"button\" class=\"btn danger\" id=\"detail-delete\">Delete</button>",
        "</div>",
        "<p class=\"ok\" id=\"detail-ok\" hidden></p>",
        "<p class=\"err\" id=\"detail-err\" hidden></p>",
        "</div>"
      ].join("");

      document.getElementById("detail-save").addEventListener("click", function () {
        var status = document.getElementById("detail-status").value;
        var note = document.getElementById("detail-note").value;
        api("/api/admin/enquiries/" + encodeURIComponent(id), {
          method: "PATCH",
          body: { status: status, note: note }
        }).then(function (res) {
          var ok = document.getElementById("detail-ok");
          var err = document.getElementById("detail-err");
          if (!res.ok) {
            ok.hidden = true;
            err.hidden = false;
            err.textContent = "Could not save.";
            return;
          }
          err.hidden = true;
          ok.hidden = false;
          ok.textContent = "Saved.";
          return load().then(function () { showDetail(id); });
        });
      });

      document.getElementById("detail-delete").addEventListener("click", function () {
        if (!confirm("Delete this enquiry?")) return;
        api("/api/admin/enquiries/" + encodeURIComponent(id), { method: "DELETE" }).then(function (res) {
          if (!res.ok) return;
          selected = "";
          detailRoot.hidden = true;
          load();
        });
      });
    }

    filter.addEventListener("change", function () {
      selected = "";
      detailRoot.hidden = true;
      load();
    });
    load();
  }

  function bootCopy() {
    var langSelect = document.getElementById("copy-lang");
    var form = document.getElementById("copy-form");
    var ok = document.getElementById("copy-ok");
    var err = document.getElementById("copy-err");
    var store = { "zh-tw": {}, en: {}, ja: {}, vi: {} };

    var activeLang = langSelect.value;

    function readFormIntoStore(lang) {
      if (!form.elements || !form.elements.length) return;
      var bag = {};
      COPY_KEYS.forEach(function (key) {
        var field = form.elements[key];
        bag[key] = field ? field.value : "";
      });
      store[lang] = bag;
    }

    function renderFields() {
      var lang = langSelect.value;
      var bag = store[lang] || {};
      form.innerHTML = COPY_KEYS.map(function (key) {
        return [
          "<div class=\"row\">",
          "<b>" + escapeHtml(COPY_LABELS[key] || key) + "</b>",
          "<label><span class=\"visually-hidden\">" + escapeHtml(key) + "</span>",
          key === "thanks" || key === "formError" || key === "message"
            ? "<textarea name=\"" + key + "\" rows=\"3\">" + escapeHtml(bag[key] || "") + "</textarea>"
            : "<input name=\"" + key + "\" value=\"" + escapeAttr(bag[key] || "") + "\">",
          "</label>",
          "</div>"
        ].join("");
      }).join("") + "<div class=\"actions\"><button class=\"btn primary\" type=\"submit\">Save copy</button></div>";
    }

    api("/api/admin/enquiry-copy").then(function (res) {
      if (!res.ok) {
        err.hidden = false;
        err.textContent = "Could not load copy.";
        return;
      }
      store = Object.assign(store, res.data.copy || {});
      renderFields();
    });

    langSelect.addEventListener("change", function () {
      readFormIntoStore(activeLang);
      activeLang = langSelect.value;
      ok.hidden = true;
      err.hidden = true;
      renderFields();
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      readFormIntoStore(langSelect.value);
      activeLang = langSelect.value;
      api("/api/admin/enquiry-copy", { method: "PUT", body: { copy: store } }).then(function (res) {
        if (!res.ok) {
          ok.hidden = true;
          err.hidden = false;
          err.textContent = "Could not save copy.";
          return;
        }
        store = Object.assign(store, res.data.copy || {});
        err.hidden = true;
        ok.hidden = false;
        ok.textContent = "Copy saved.";
      });
    });
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }

  function formatWhen(iso) {
    try {
      return new Date(iso).toLocaleString();
    } catch (err) {
      return iso;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var page = document.body.getAttribute("data-admin");
    if (page === "login") {
      bootLogin();
      return;
    }
    markNav();
    bindLogout();
    requireSession().then(function (ok) {
      if (!ok) return;
      if (page === "inbox") bootInbox();
      if (page === "copy") bootCopy();
    });
  });
})();
