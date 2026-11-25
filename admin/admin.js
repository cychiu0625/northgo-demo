(function () {
  var COPY_KEYS = [
    "formTitle", "name", "email", "service", "message", "send",
    "formError", "thanks", "optFreight", "optProject", "optWarehouse", "optAgency"
  ];
  var COPY_LABELS = {
    formTitle: "表單標題",
    name: "姓名欄位",
    email: "信箱欄位",
    service: "服務欄位",
    message: "需求欄位",
    send: "送出按鈕",
    formError: "驗證錯誤訊息",
    thanks: "送出成功訊息",
    optFreight: "選項 · 貨運",
    optProject: "選項 · 專案",
    optWarehouse: "選項 · 倉儲",
    optAgency: "選項 · 船務代理"
  };
  var SERVICE_LABELS = {
    freight: "貨運物流",
    project: "專案物流",
    warehouse: "倉儲物流",
    agency: "船務代理",
    other: "其他"
  };
  var STATUS_LABELS = {
    "新進": "新進",
    "處理中": "處理中",
    "已回覆": "已回覆"
  };
  var STATUS_CLASS = {
    "新進": "status-new",
    "處理中": "status-progress",
    "已回覆": "status-done",
    new: "status-new",
    read: "status-progress",
    done: "status-done"
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
    var submit = form.querySelector("button[type='submit']");
    api("/api/admin/session").then(function (res) {
      if (res.ok) location.replace("index.html");
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      err.hidden = true;
      submit.disabled = true;
      var password = form.password.value;
      api("/api/admin/login", { method: "POST", body: { password: password } }).then(function (res) {
        if (!res.ok) {
          err.hidden = false;
          err.textContent = res.status === 503
            ? "伺服器未設定管理密碼，請先在 Cloudflare 設定密鑰。"
            : "密碼錯誤。";
          submit.disabled = false;
          return;
        }
        location.href = "index.html";
      }).catch(function () {
        err.hidden = false;
        err.textContent = "無法連線伺服器。";
        submit.disabled = false;
      });
    });
  }

  function statusBadge(status) {
    var cls = STATUS_CLASS[status] || "status-new";
    return '<span class="badge ' + cls + '">' + escapeHtml(STATUS_LABELS[status] || status || "") + "</span>";
  }

  function displayName(item) {
    var given = item && (item.given_name || item.name) || "";
    var family = item && item.family_name || "";
    return String(given + (family ? " " + family : "")).trim();
  }

  function servicesLabel(raw) {
    if (!raw) return "—";
    return String(raw).split(",").map(function (part) {
      var key = part.trim();
      return SERVICE_LABELS[key] || key;
    }).filter(Boolean).join("、") || "—";
  }

  function shortId(id) {
    var s = String(id || "");
    return s.length > 8 ? s.slice(0, 8) : s;
  }

  function fieldValue(form, key) {
    var el = form.elements.namedItem(key);
    return el ? String(el.value || "") : "";
  }

  function fieldOptions(selectedValue, map) {
    return Object.keys(map).map(function (key) {
      return "<option value=\"" + key + "\"" + (key === selectedValue ? " selected" : "") + ">" + escapeHtml(map[key]) + "</option>";
    }).join("");
  }

  function serviceChecks(selectedCsv) {
    var selected = {};
    String(selectedCsv || "").split(",").forEach(function (part) {
      var key = part.trim();
      if (key) selected[key] = true;
    });
    return Object.keys(SERVICE_LABELS).map(function (key) {
      return [
        "<label class=\"check\">",
        "<input type=\"checkbox\" name=\"services\" value=\"" + key + "\"" + (selected[key] ? " checked" : "") + ">",
        escapeHtml(SERVICE_LABELS[key]),
        "</label>"
      ].join("");
    }).join("");
  }

  function collectServices(form) {
    var out = [];
    form.querySelectorAll('input[name="services"]:checked').forEach(function (box) {
      out.push(box.value);
    });
    return out.join(",");
  }

  function enquiryPayload(form, extras) {
    extras = extras || {};
    return Object.assign({
      given_name: fieldValue(form, "given_name").trim(),
      family_name: fieldValue(form, "family_name").trim(),
      company: fieldValue(form, "company").trim(),
      phone: fieldValue(form, "phone").trim(),
      email: fieldValue(form, "email").trim(),
      country: fieldValue(form, "country").trim(),
      services: collectServices(form),
      message: fieldValue(form, "message"),
      ship_date: fieldValue(form, "ship_date").trim(),
      status: fieldValue(form, "status") || "新進",
      note: fieldValue(form, "note"),
      lang: fieldValue(form, "lang") || "zh-tw"
    }, extras);
  }

  function bootInbox() {
    var rowsRoot = document.getElementById("enquiry-rows");
    var detailRoot = document.getElementById("enquiry-detail");
    var filter = document.getElementById("status-filter");
    var search = document.getElementById("search-q");
    var pageSize = document.getElementById("page-size");
    var empty = document.getElementById("enquiry-empty");
    var pagerMeta = document.getElementById("pager-meta");
    var pagePrev = document.getElementById("page-prev");
    var pageNext = document.getElementById("page-next");
    var settingsBtn = document.getElementById("settings-btn");
    var settingsDialog = document.getElementById("settings-dialog");
    var selected = "";
    var mode = "view";
    var items = [];
    var page = 1;
    var searchTimer = null;

    function totalPages() {
      var size = Math.max(1, Number(pageSize.value) || 20);
      return Math.max(1, Math.ceil(items.length / size));
    }

    function pageItems() {
      var size = Math.max(1, Number(pageSize.value) || 20);
      var start = (page - 1) * size;
      return items.slice(start, start + size);
    }

    function syncPager() {
      var pages = totalPages();
      if (page > pages) page = pages;
      pagerMeta.textContent = "共 " + items.length + " 筆 · 第 " + page + " / " + pages + " 頁";
      pagePrev.disabled = page <= 1;
      pageNext.disabled = page >= pages;
    }

    function load() {
      var params = [];
      if (filter.value) params.push("status=" + encodeURIComponent(filter.value));
      if (search.value.trim()) params.push("company=" + encodeURIComponent(search.value.trim()));
      var q = params.length ? ("?" + params.join("&")) : "";
      return api("/api/admin/enquiries" + q).then(function (res) {
        if (res.status === 401) {
          location.replace("login.html");
          return;
        }
        if (!res.ok) {
          rowsRoot.innerHTML = "<tr><td colspan=\"4\" class=\"err\">無法載入詢價清單。</td></tr>";
          empty.hidden = true;
          return;
        }
        items = res.data.items || [];
        if (page > totalPages()) page = totalPages();
        renderList();
        if (mode === "create" || mode === "edit") {
          return;
        }
        if (selected) {
          var still = items.some(function (row) { return row.id === selected; });
          if (!still) {
            selected = "";
            mode = "view";
            detailRoot.hidden = true;
            detailRoot.innerHTML = "";
          }
        }
      });
    }

    function renderList() {
      var rows = pageItems();
      empty.hidden = items.length > 0;
      syncPager();
      if (!items.length) {
        rowsRoot.innerHTML = "";
        return;
      }
      rowsRoot.innerHTML = rows.map(function (item) {
        return [
          "<tr data-id=\"" + escapeAttr(item.id) + "\" data-active=\"" + (item.id === selected && mode !== "create") + "\">",
          "<td><code>" + escapeHtml(item.id) + "</code></td>",
          "<td>" + escapeHtml(item.company || "—") + "</td>",
          "<td>" + statusBadge(item.status) + "</td>",
          "<td>" + escapeHtml(formatWhen(item.created_at)) + "</td>",
          "</tr>"
        ].join("");
      }).join("");

      rowsRoot.querySelectorAll("tr[data-id]").forEach(function (tr) {
        tr.addEventListener("click", function () {
          showDetail(tr.getAttribute("data-id"));
        });
      });
    }

    function closeDetail() {
      selected = "";
      mode = "view";
      detailRoot.hidden = true;
      detailRoot.innerHTML = "";
      renderList();
    }

    /** D＝軟刪除：先問「確定刪除？」；確認後 DELETE API 寫入 deleted_at，清單預設不再顯示。 */
    function bindDelete(item, deleteBtn) {
      if (!deleteBtn) return;
      deleteBtn.addEventListener("click", function () {
        if (!confirm("確定刪除？")) return;
        deleteBtn.disabled = true;
        api("/api/admin/enquiries/" + encodeURIComponent(item.id), { method: "DELETE" }).then(function (res) {
          deleteBtn.disabled = false;
          if (res.status === 401) {
            location.replace("login.html");
            return;
          }
          if (!res.ok) {
            var err = document.getElementById("detail-err");
            if (err) {
              err.hidden = false;
              err.textContent = "刪除失敗，請再試一次。";
            }
            return;
          }
          closeDetail();
          load();
        }).catch(function () {
          deleteBtn.disabled = false;
          var err = document.getElementById("detail-err");
          if (err) {
            err.hidden = false;
            err.textContent = "無法連線伺服器。";
          }
        });
      });
    }

    function renderDetail(item) {
      mode = "view";
      selected = item.id;
      detailRoot.hidden = false;
      renderList();
      detailRoot.innerHTML = [
        "<div class=\"detail-head\">",
        "<h2>詢價明細</h2>",
        statusBadge(item.status),
        "</div>",
        "<p class=\"meta\">U＝更新：只能改狀態與備註。客戶原文只讀，不會被改掉。</p>",
        "<dl class=\"detail-grid detail-grid-2\">",
        "<div><dt>編號</dt><dd><code>" + escapeHtml(item.id) + "</code></dd></div>",
        "<div><dt>建立時間</dt><dd>" + escapeHtml(formatWhen(item.created_at)) + "</dd></div>",
        "<div><dt>公司</dt><dd>" + escapeHtml(item.company || "—") + "</dd></div>",
        "<div><dt>聯絡人</dt><dd>" + escapeHtml(displayName(item) || "—") + "</dd></div>",
        "<div><dt>電子郵件</dt><dd>" + escapeHtml(item.email || "—") + "</dd></div>",
        "<div><dt>電話</dt><dd>" + escapeHtml(item.phone || "—") + "</dd></div>",
        "<div><dt>國家</dt><dd>" + escapeHtml(item.country || "—") + "</dd></div>",
        "<div><dt>服務</dt><dd>" + escapeHtml(servicesLabel(item.services)) + "</dd></div>",
        "<div><dt>預計出貨</dt><dd>" + escapeHtml(item.ship_date || "—") + "</dd></div>",
        "<div><dt>語系</dt><dd>" + escapeHtml(LANG_LABELS[item.lang] || item.lang || "—") + "</dd></div>",
        "<div class=\"span-2\"><dt>訊息（客戶原文）</dt><dd>" + escapeHtml(item.message || "—") + "</dd></div>",
        "</dl>",
        "<form id=\"enquiry-update\">",
        "<input type=\"hidden\" name=\"id\" value=\"" + escapeAttr(item.id) + "\">",
        "<label>狀態<select name=\"status\">" + fieldOptions(item.status || "新進", STATUS_LABELS) + "</select></label>",
        "<label>備註<textarea name=\"note\" rows=\"3\" placeholder=\"窗口備註\">" + escapeHtml(item.note || "") + "</textarea></label>",
        "<div class=\"actions\">",
        "<button type=\"submit\" class=\"btn primary\">儲存</button>",
        "<button type=\"button\" class=\"btn danger\" id=\"detail-delete\">刪除</button>",
        "<button type=\"button\" class=\"btn ghost\" id=\"detail-close\">關閉</button>",
        "</div>",
        "<p class=\"ok\" id=\"detail-ok\" hidden>已儲存。清單上的狀態已更新。</p>",
        "<p class=\"err\" id=\"detail-err\" hidden></p>",
        "</form>"
      ].join("");
      detailRoot.scrollIntoView({ behavior: "smooth", block: "start" });

      var form = document.getElementById("enquiry-update");
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var id = fieldValue(form, "id");
        if (!id || id !== item.id) {
          document.getElementById("detail-err").hidden = false;
          document.getElementById("detail-err").textContent = "編號不符，未儲存（避免改到別筆）。";
          return;
        }
        var saveBtn = form.querySelector("button[type='submit']");
        saveBtn.disabled = true;
        api("/api/admin/enquiries/" + encodeURIComponent(id), {
          method: "PATCH",
          body: {
            id: id,
            status: fieldValue(form, "status"),
            note: fieldValue(form, "note")
          }
        }).then(function (res) {
          saveBtn.disabled = false;
          var ok = document.getElementById("detail-ok");
          var err = document.getElementById("detail-err");
          if (res.status === 401) {
            location.replace("login.html");
            return;
          }
          if (res.status === 400 && res.data && res.data.error === "id mismatch") {
            ok.hidden = true;
            err.hidden = false;
            err.textContent = "編號不符，未儲存（避免改到別筆）。";
            return;
          }
          if (!res.ok || !res.data.item || res.data.item.id !== id) {
            ok.hidden = true;
            err.hidden = false;
            err.textContent = "儲存失敗，請再試一次。";
            return;
          }
          err.hidden = true;
          ok.hidden = false;
          selected = res.data.item.id;
          /* 重新載入清單，狀態徽章會一起變 */
          return load().then(function () {
            renderDetail(res.data.item);
            var saved = document.getElementById("detail-ok");
            if (saved) saved.hidden = false;
          });
        }).catch(function () {
          saveBtn.disabled = false;
          var err = document.getElementById("detail-err");
          err.hidden = false;
          err.textContent = "無法連線伺服器。";
        });
      });

      bindDelete(item, document.getElementById("detail-delete"));
      var closeBtn = document.getElementById("detail-close");
      if (closeBtn) closeBtn.addEventListener("click", closeDetail);
    }

    function renderEditor(item) {
      var isNew = !item;
      mode = isNew ? "create" : "edit";
      selected = isNew ? "" : item.id;
      detailRoot.hidden = false;
      renderList();
      detailRoot.innerHTML = [
        "<h2 class=\"detail-title\">" + (isNew ? "新增詢問" : "編輯詢問") + "</h2>",
        "<form id=\"enquiry-editor\">",
        "<div class=\"split-2\">",
        "<label>名<input name=\"given_name\" required value=\"" + escapeAttr(isNew ? "客戶 A" : (item.given_name || "")) + "\"></label>",
        "<label>姓<input name=\"family_name\" required value=\"" + escapeAttr(isNew ? "" : (item.family_name || "")) + "\"></label>",
        "</div>",
        "<div class=\"split-2\">",
        "<label>公司<input name=\"company\" required value=\"" + escapeAttr(isNew ? "" : (item.company || "")) + "\"></label>",
        "<label>電話<input name=\"phone\" required value=\"" + escapeAttr(isNew ? "" : (item.phone || "")) + "\"></label>",
        "</div>",
        "<label>電子郵件<input name=\"email\" type=\"email\" required value=\"" + escapeAttr(isNew ? "" : (item.email || "")) + "\"></label>",
        "<div class=\"split-2\">",
        "<label>國家<input name=\"country\" value=\"" + escapeAttr(isNew ? "" : (item.country || "")) + "\"></label>",
        "<label>預計出貨<input name=\"ship_date\" type=\"date\" value=\"" + escapeAttr(isNew ? "" : (item.ship_date || "")) + "\"></label>",
        "</div>",
        "<fieldset class=\"services-set\"><legend>有興趣的服務</legend><div class=\"checks\">" +
          serviceChecks(isNew ? "" : (item.services || "")) +
        "</div></fieldset>",
        "<label>訊息<textarea name=\"message\" rows=\"4\">" + escapeHtml(isNew ? "" : (item.message || "")) + "</textarea></label>",
        "<div class=\"split-2\">",
        "<label>狀態<select name=\"status\">" + fieldOptions(isNew ? "新進" : (item.status || "新進"), STATUS_LABELS) + "</select></label>",
        "<label>語系<select name=\"lang\">" + fieldOptions(isNew ? "zh-tw" : (item.lang || "zh-tw"), LANG_LABELS) + "</select></label>",
        "</div>",
        "<label>備註<textarea name=\"note\" rows=\"2\">" + escapeHtml(isNew ? "" : (item.note || "")) + "</textarea></label>",
        "<div class=\"actions\">",
        "<button type=\"submit\" class=\"btn primary\">" + (isNew ? "建立" : "儲存全文") + "</button>",
        "<button type=\"button\" class=\"btn ghost\" id=\"detail-cancel\">取消</button>",
        isNew ? "" : "<button type=\"button\" class=\"btn danger\" id=\"detail-delete\">刪除</button>",
        "</div>",
        "<p class=\"ok\" id=\"detail-ok\" hidden></p>",
        "<p class=\"err\" id=\"detail-err\" hidden></p>",
        "</form>"
      ].join("");

      var form = document.getElementById("enquiry-editor");
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var payload = enquiryPayload(form);
        var saveBtn = form.querySelector("button[type='submit']");
        var ok = document.getElementById("detail-ok");
        var err = document.getElementById("detail-err");
        saveBtn.disabled = true;
        var req = isNew
          ? api("/api/admin/enquiries", { method: "POST", body: payload })
          : api("/api/admin/enquiries/" + encodeURIComponent(item.id), { method: "PUT", body: payload });
        req.then(function (res) {
          saveBtn.disabled = false;
          if (res.status === 401) {
            location.replace("login.html");
            return;
          }
          if (!res.ok || !res.data.item) {
            ok.hidden = true;
            err.hidden = false;
            err.textContent = isNew ? "建立失敗，請檢查必填欄位。" : "儲存失敗，請檢查必填欄位。";
            return;
          }
          selected = res.data.item.id;
          mode = "view";
          return load().then(function () {
            renderDetail(res.data.item);
            var saved = document.getElementById("detail-ok");
            if (saved) {
              saved.hidden = false;
              saved.textContent = isNew ? "已建立。" : "已儲存全文。";
            }
          });
        }).catch(function () {
          saveBtn.disabled = false;
          err.hidden = false;
          err.textContent = "無法連線伺服器。";
        });
      });

      var cancel = document.getElementById("detail-cancel");
      if (cancel) {
        cancel.addEventListener("click", function () {
          if (isNew) closeDetail();
          else showDetail(item.id);
        });
      }
      if (!isNew) bindDelete(item, document.getElementById("detail-delete"));
    }

    function showDetail(id) {
      selected = id;
      mode = "view";
      renderList();
      api("/api/admin/enquiries/" + encodeURIComponent(id)).then(function (res) {
        if (res.status === 401) {
          location.replace("login.html");
          return;
        }
        if (!res.ok || !res.data.item) {
          detailRoot.hidden = false;
          detailRoot.innerHTML = "<p class=\"err\">找不到這筆詢價。</p>";
          return;
        }
        renderDetail(res.data.item);
      });
    }

    filter.addEventListener("change", function () {
      page = 1;
      closeDetail();
      load();
    });
    pageSize.addEventListener("change", function () {
      page = 1;
      renderList();
    });
    search.addEventListener("input", function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        page = 1;
        load();
      }, 220);
    });
    pagePrev.addEventListener("click", function () {
      if (page <= 1) return;
      page -= 1;
      renderList();
    });
    pageNext.addEventListener("click", function () {
      if (page >= totalPages()) return;
      page += 1;
      renderList();
    });
    document.getElementById("refresh-list").addEventListener("click", function () { load(); });
    document.getElementById("new-enquiry").addEventListener("click", function () {
      renderEditor(null);
    });
    if (settingsBtn && settingsDialog) {
      settingsBtn.addEventListener("click", function () { settingsDialog.showModal(); });
    }
    load();
    setInterval(function () {
      if (document.hidden) return;
      if (mode === "create" || mode === "edit") return;
      load();
    }, 15000);
  }

  function bootCopy() {
    var langSelect = document.getElementById("copy-lang");
    var form = document.getElementById("copy-form");
    var ok = document.getElementById("copy-ok");
    var err = document.getElementById("copy-err");
    var store = { "zh-tw": {}, en: {}, ja: {}, vi: {} };
    var defaults = { "zh-tw": {}, en: {}, ja: {}, vi: {} };
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
      var defs = defaults[lang] || {};
      form.innerHTML = COPY_KEYS.map(function (key) {
        var placeholder = defs[key] || "";
        return [
          "<div class=\"row\">",
          "<b>" + escapeHtml(COPY_LABELS[key] || key) + "</b>",
          "<label><span class=\"visually-hidden\">" + escapeHtml(key) + "</span>",
          key === "thanks" || key === "formError" || key === "message"
            ? "<textarea name=\"" + key + "\" rows=\"3\" placeholder=\"" + escapeAttr(placeholder) + "\">" + escapeHtml(bag[key] || "") + "</textarea>"
            : "<input name=\"" + key + "\" value=\"" + escapeAttr(bag[key] || "") + "\" placeholder=\"" + escapeAttr(placeholder) + "\">",
          placeholder ? "<span class=\"hint\">預設：" + escapeHtml(placeholder) + "</span>" : "",
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
      defaults = Object.assign(defaults, res.data.defaults || {});
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
        ok.textContent = "文案已儲存，前台詢價頁會立即套用。";
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
      var d = new Date(iso);
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, "0");
      var day = String(d.getDate()).padStart(2, "0");
      var hh = String(d.getHours()).padStart(2, "0");
      var mm = String(d.getMinutes()).padStart(2, "0");
      var ss = String(d.getSeconds()).padStart(2, "0");
      return y + "/" + m + "/" + day + " " + hh + ":" + mm + ":" + ss;
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
