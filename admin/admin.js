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
    freight: "貨運",
    project: "專案",
    warehouse: "倉儲",
    agency: "船務代理"
  };
  var STATUS_LABELS = {
    new: "新件",
    read: "已讀",
    done: "已完成"
  };
  var LANG_LABELS = {
    "zh-tw": "繁中",
    en: "EN",
    ja: "日本語",
    vi: "VI"
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
          err.textContent = "密碼錯誤。";
          return;
        }
        location.href = "index.html";
      }).catch(function () {
        err.hidden = false;
        err.textContent = "無法連線伺服器。";
      });
    });
  }

  function statusBadge(status) {
    return '<span class="badge ' + status + '">' + escapeHtml(STATUS_LABELS[status] || status) + "</span>";
  }

  function bootInbox() {
    var listRoot = document.getElementById("enquiry-cards");
    var detailRoot = document.getElementById("enquiry-detail");
    var filter = document.getElementById("status-filter");
    var search = document.getElementById("search-q");
    var empty = document.getElementById("enquiry-empty");
    var selected = "";
    var mode = "view";
    var items = [];
    var searchTimer = null;

    function load() {
      var params = [];
      if (filter.value) params.push("status=" + encodeURIComponent(filter.value));
      if (search.value.trim()) params.push("q=" + encodeURIComponent(search.value.trim()));
      var q = params.length ? ("?" + params.join("&")) : "";
      return api("/api/admin/enquiries" + q).then(function (res) {
        if (!res.ok) {
          listRoot.innerHTML = "<p class=\"err\">無法載入詢問列表。</p>";
          return;
        }
        items = res.data.items || [];
        renderList();
        if (mode === "create") {
          renderEditor(null);
          return;
        }
        if (selected) {
          var still = items.some(function (item) { return item.id === selected; });
          if (still) showDetail(selected, false);
          else {
            selected = "";
            mode = "view";
            detailRoot.innerHTML = "<p class=\"empty\">點左側一筆詢問查看完整內容，或按「新增詢問」。</p>";
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
          "<button type=\"button\" class=\"enquiry-card\" data-open=\"" + item.id + "\" aria-pressed=\"" + (item.id === selected && mode !== "create") + "\">",
          "<div class=\"row\"><b>" + escapeHtml(item.name) + "</b>" + statusBadge(item.status) + "</div>",
          "<div class=\"snippet\">" + escapeHtml(item.message) + "</div>",
          "<div class=\"meta\">" + escapeHtml(SERVICE_LABELS[item.service] || item.service) + " · " + escapeHtml(item.email) + " · " + escapeHtml(formatWhen(item.created_at)) + "</div>",
          "</button>"
        ].join("");
      }).join("");
      listRoot.querySelectorAll("[data-open]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          showDetail(btn.getAttribute("data-open"), true);
        });
      });
    }

    function fieldOptions(selectedValue, map) {
      return Object.keys(map).map(function (key) {
        return "<option value=\"" + key + "\"" + (key === selectedValue ? " selected" : "") + ">" + escapeHtml(map[key]) + "</option>";
      }).join("");
    }

    function renderEditor(item) {
      var isNew = !item;
      mode = isNew ? "create" : "edit";
      if (isNew) selected = "";
      renderList();
      detailRoot.innerHTML = [
        "<h2 style=\"margin:0 0 12px;color:var(--navy);font-size:1.2rem\">" + (isNew ? "新增詢問" : "詢問詳情") + "</h2>",
        isNew ? "" : "<p class=\"meta\" style=\"margin:0 0 12px\">送出時間：" + escapeHtml(formatWhen(item.created_at)) + "</p>",
        "<form id=\"enquiry-editor\">",
        "<div class=\"split-2\">",
        "<label>姓名<input name=\"name\" required value=\"" + escapeAttr(item && item.name || "") + "\"></label>",
        "<label>信箱<input name=\"email\" type=\"email\" required value=\"" + escapeAttr(item && item.email || "") + "\"></label>",
        "</div>",
        "<div class=\"split-2\">",
        "<label>服務<select name=\"service\">" + fieldOptions(item && item.service || "freight", SERVICE_LABELS) + "</select></label>",
        "<label>語系<select name=\"lang\">" + fieldOptions(item && item.lang || "zh-tw", LANG_LABELS) + "</select></label>",
        "</div>",
        "<label>需求內容<textarea name=\"message\" required rows=\"6\">" + escapeHtml(item && item.message || "") + "</textarea></label>",
        "<div class=\"split-2\">",
        "<label>狀態<select name=\"status\">" + fieldOptions(item && item.status || "new", STATUS_LABELS) + "</select></label>",
        "<label>內部備註<textarea name=\"note\" rows=\"3\">" + escapeHtml(item && item.note || "") + "</textarea></label>",
        "</div>",
        "<div class=\"actions\">",
        "<button type=\"submit\" class=\"btn primary\">" + (isNew ? "建立" : "儲存") + "</button>",
        isNew ? "" : "<button type=\"button\" class=\"btn danger\" id=\"detail-delete\">刪除</button>",
        "<button type=\"button\" class=\"btn ghost\" id=\"detail-cancel\">取消</button>",
        "</div>",
        "<p class=\"ok\" id=\"detail-ok\" hidden></p>",
        "<p class=\"err\" id=\"detail-err\" hidden></p>",
        "</form>"
      ].join("");

      var form = document.getElementById("enquiry-editor");
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var payload = {
          name: form.name.value.trim(),
          email: form.email.value.trim(),
          service: form.service.value,
          lang: form.lang.value,
          message: form.message.value.trim(),
          status: form.status.value,
          note: form.note.value
        };
        var req = isNew
          ? api("/api/admin/enquiries", { method: "POST", body: payload })
          : api("/api/admin/enquiries/" + encodeURIComponent(item.id), { method: "PATCH", body: payload });
        req.then(function (res) {
          var ok = document.getElementById("detail-ok");
          var err = document.getElementById("detail-err");
          if (!res.ok) {
            ok.hidden = true;
            err.hidden = false;
            err.textContent = "儲存失敗，請檢查必填欄位。";
            return;
          }
          err.hidden = true;
          ok.hidden = false;
          ok.textContent = isNew ? "已建立。" : "已儲存。";
          selected = res.data.item.id;
          mode = "edit";
          return load().then(function () { showDetail(selected, false); });
        });
      });

      var cancel = document.getElementById("detail-cancel");
      if (cancel) {
        cancel.addEventListener("click", function () {
          if (isNew) {
            mode = "view";
            detailRoot.innerHTML = "<p class=\"empty\">點左側一筆詢問查看完整內容，或按「新增詢問」。</p>";
            renderList();
            return;
          }
          showDetail(item.id, false);
        });
      }

      var del = document.getElementById("detail-delete");
      if (del) {
        del.addEventListener("click", function () {
          if (!confirm("確定刪除這筆客戶詢問？")) return;
          api("/api/admin/enquiries/" + encodeURIComponent(item.id), { method: "DELETE" }).then(function (res) {
            if (!res.ok) return;
            selected = "";
            mode = "view";
            detailRoot.innerHTML = "<p class=\"empty\">點左側一筆詢問查看完整內容，或按「新增詢問」。</p>";
            load();
          });
        });
      }
    }

    function showDetail(id, markRead) {
      selected = id;
      mode = "edit";
      var item = items.filter(function (row) { return row.id === id; })[0];
      if (!item) return;
      renderEditor(item);
      if (markRead && item.status === "new") {
        api("/api/admin/enquiries/" + encodeURIComponent(id), {
          method: "PATCH",
          body: { status: "read" }
        }).then(function (res) {
          if (!res.ok || !res.data.item) return;
          item.status = "read";
          var idx = -1;
          items.forEach(function (row, i) { if (row.id === id) idx = i; });
          if (idx >= 0) items[idx] = res.data.item;
          renderEditor(res.data.item);
        });
      }
    }

    filter.addEventListener("change", function () {
      selected = "";
      mode = "view";
      detailRoot.innerHTML = "<p class=\"empty\">點左側一筆詢問查看完整內容，或按「新增詢問」。</p>";
      load();
    });
    search.addEventListener("input", function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () { load(); }, 220);
    });
    document.getElementById("refresh-list").addEventListener("click", function () { load(); });
    document.getElementById("new-enquiry").addEventListener("click", function () {
      renderEditor(null);
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
      }).join("") + "<div class=\"actions\"><button class=\"btn primary\" type=\"submit\">儲存文案</button></div>";
    }

    api("/api/admin/enquiry-copy").then(function (res) {
      if (!res.ok) {
        err.hidden = false;
        err.textContent = "無法載入文案。";
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
          err.textContent = "儲存失敗。";
          return;
        }
        store = Object.assign(store, res.data.copy || {});
        err.hidden = true;
        ok.hidden = false;
        ok.textContent = "文案已儲存。";
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
