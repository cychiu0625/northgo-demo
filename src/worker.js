/**
 * 詢價收件：POST /api/enquiries
 * 誰會用：聯絡頁送出後，由這支 worker 接收。
 *
 * 要做什麼：
 * 1. 再檢查必填、信箱格式、訊息長度（網頁檢查關掉也要擋得住）
 * 2. 通過 → 寫入 D1 enquiries 一列，JSON 回傳成功 + 編號
 * 3. 不通過 → JSON 回傳哪一欄錯了，且不要寫入
 *
 * 句子與頁面繁中一致。不記錄密碼、不讀 .dev.vars 以外的密鑰到回應裡。
 */

const MSG = {
  fieldCheck: "請檢查這個欄位。",
  emailInvalid: "請填正確的電子郵件。",
  messageTooLong: "訊息太長。",
  formSuccess: "已收到您的詢問。",
  formFail: "送出時發生問題，請再試一次。",
  formFixFields: "請檢查標示的欄位。"
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

function newId() {
  return crypto.randomUUID();
}

function pick(body, snake, kebab) {
  if (!body || typeof body !== "object") return "";
  if (typeof body[snake] === "string") return body[snake];
  if (typeof body[kebab] === "string") return body[kebab];
  if (body[snake] != null && typeof body[snake] !== "object") return String(body[snake]);
  if (body[kebab] != null && typeof body[kebab] !== "object") return String(body[kebab]);
  return "";
}

function emailLooksOk(value) {
  var at = value.indexOf("@");
  if (at < 1 || at >= value.length - 1) return false;
  var domain = value.slice(at + 1);
  return domain.indexOf(".") > 0 && domain.indexOf(".") < domain.length - 1;
}

function servicesValue(body) {
  if (!body || typeof body !== "object") return "";
  var raw = body.services != null ? body.services : body.service;
  if (Array.isArray(raw)) {
    return raw
      .map(function (item) {
        return String(item || "").trim();
      })
      .filter(Boolean)
      .join(",");
  }
  return String(raw || "").trim();
}

function termsAccepted(body) {
  if (!body || typeof body !== "object") return false;
  var value = body.terms;
  return value === true || value === 1 || value === "1" || value === "on" || value === "true";
}

/**
 * 伺服端檢查（即使前端 novalidate／關掉檢查也要擋）。
 * 回傳 { ok, fields, value }；ok 為 false 時不要寫入 D1。
 */
export function validateEnquiryBody(body) {
  var fields = {};
  var givenName = pick(body, "given_name", "given-name").trim();
  var familyName = pick(body, "family_name", "family-name").trim();
  var company = pick(body, "company", "company").trim();
  var email = pick(body, "email", "email").trim();
  var phone = pick(body, "phone", "phone").trim();
  var country = pick(body, "country", "country").trim();
  var message = pick(body, "message", "message");
  var shipDate = pick(body, "ship_date", "ship-date").trim();
  var services = servicesValue(body);

  if (!givenName) fields["given-name"] = MSG.fieldCheck;
  if (!familyName) fields["family-name"] = MSG.fieldCheck;
  if (!company) fields.company = MSG.fieldCheck;
  if (!email) fields.email = MSG.fieldCheck;
  else if (!emailLooksOk(email)) fields.email = MSG.emailInvalid;
  if (!phone) fields.phone = MSG.fieldCheck;
  if (message.length > 4000) fields.message = MSG.messageTooLong;
  if (!termsAccepted(body)) fields.terms = MSG.fieldCheck;

  var ok = Object.keys(fields).length === 0;
  return {
    ok: ok,
    fields: fields,
    value: ok
      ? {
          given_name: givenName.slice(0, 120),
          family_name: familyName.slice(0, 120),
          company: company.slice(0, 160),
          email: email.slice(0, 200),
          phone: phone.slice(0, 60),
          country: country.slice(0, 80),
          services: services.slice(0, 400),
          message: message.slice(0, 4000),
          ship_date: shipDate.slice(0, 40),
          lang: "zh-tw"
        }
      : null
  };
}

export async function handlePostEnquiries(request, env) {
  if (!env || !env.DB) {
    return json({ ok: false, message: MSG.formFail }, 503);
  }

  var body;
  try {
    body = await request.json();
  } catch (err) {
    return json(
      {
        ok: false,
        message: MSG.formFixFields,
        fields: { body: MSG.fieldCheck }
      },
      400
    );
  }

  /* 不 console.log(body)，避免把客戶資料或誤傳的密碼寫進日誌。 */
  var parsed = validateEnquiryBody(body);
  if (!parsed.ok) {
    return json(
      {
        ok: false,
        message: MSG.formFixFields,
        fields: parsed.fields
      },
      400
    );
  }

  var id = newId();
  var createdAt = new Date().toISOString();
  var row = parsed.value;

  try {
    await env.DB.prepare(
      `INSERT INTO enquiries (
        id, created_at, given_name, family_name, company, email, phone,
        country, services, message, ship_date, status, note, deleted_at, lang
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '新進', '', NULL, ?)`
    )
      .bind(
        id,
        createdAt,
        row.given_name,
        row.family_name,
        row.company,
        row.email,
        row.phone,
        row.country,
        row.services,
        row.message,
        row.ship_date,
        row.lang
      )
      .run();
  } catch (err) {
    return json({ ok: false, message: MSG.formFail }, 500);
  }

  return json(
    {
      ok: true,
      id: id,
      message: MSG.formSuccess
    },
    201
  );
}

/** Cloudflare Pages Functions：functions/api/enquiries.js 轉到這裡。 */
export async function onRequestPost(context) {
  return handlePostEnquiries(context.request, context.env);
}

/** 獨立 Worker：只處理 POST /api/enquiries。 */
export default {
  async fetch(request, env) {
    var url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/api/enquiries") {
      return handlePostEnquiries(request, env);
    }
    if (request.method === "OPTIONS" && url.pathname === "/api/enquiries") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-methods": "POST, OPTIONS",
          "access-control-allow-headers": "content-type"
        }
      });
    }
    return json({ ok: false, message: MSG.formFail }, 404);
  }
};
