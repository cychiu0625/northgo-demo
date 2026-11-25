import { LANGS, SERVICES } from "./copy.js";

export const ENQUIRY_STATUSES = ["新進", "處理中", "已回覆"];

export function newId() {
  return crypto.randomUUID();
}

function pick(body, snake, kebab) {
  if (!body || typeof body !== "object") return undefined;
  if (Object.prototype.hasOwnProperty.call(body, snake)) return body[snake];
  if (kebab && Object.prototype.hasOwnProperty.call(body, kebab)) return body[kebab];
  return undefined;
}

export function validateEnquiryInput(body, partial) {
  const out = {};
  const errors = [];

  const givenRaw = pick(body, "given_name", "given-name");
  if (!partial || typeof givenRaw === "string") {
    const givenName = String(givenRaw != null ? givenRaw : body.name || "").trim();
    if (!givenName) errors.push("given_name");
    else if (givenName.length > 120) errors.push("given_name_long");
    else out.given_name = givenName;
  }

  const familyRaw = pick(body, "family_name", "family-name");
  if (!partial || typeof familyRaw === "string") {
    const familyName = String(familyRaw != null ? familyRaw : "").trim();
    if (!partial && !familyName) errors.push("family_name");
    else if (familyName.length > 120) errors.push("family_name_long");
    else if (typeof familyRaw === "string" || !partial) out.family_name = familyName;
  }

  if (!partial || typeof body.company === "string") {
    const company = String(body.company || "").trim();
    if (!partial && !company) errors.push("company");
    else if (company.length > 160) errors.push("company_long");
    else out.company = company;
  }

  if (!partial || typeof body.email === "string") {
    const email = String(body.email || "").trim();
    if (!email || email.indexOf("@") < 1) errors.push("email");
    else if (email.length > 200) errors.push("email_long");
    else out.email = email;
  }

  if (!partial || typeof body.phone === "string") {
    const phone = String(body.phone || "").trim();
    if (!partial && !phone) errors.push("phone");
    else if (phone.length > 60) errors.push("phone_long");
    else if (typeof body.phone === "string" || !partial) out.phone = phone;
  }

  if (!partial || typeof body.country === "string") {
    out.country = String(body.country || "").trim().slice(0, 80);
  }

  const servicesRaw = body.services != null ? body.services : body.service;
  if (!partial || servicesRaw != null) {
    let services = "";
    if (Array.isArray(servicesRaw)) {
      services = servicesRaw.map(function (item) { return String(item || "").trim(); }).filter(Boolean).join(",");
    } else {
      services = String(servicesRaw || "").trim();
    }
    if (services && SERVICES.indexOf(services) < 0 && services.indexOf(",") < 0) {
      // allow multi csv or known single service
      const parts = services.split(",").map(function (p) { return p.trim(); }).filter(Boolean);
      const bad = parts.some(function (p) { return SERVICES.indexOf(p) < 0; });
      if (bad && SERVICES.indexOf(services) < 0) {
        /* keep free text for admin edits */
      }
    }
    out.services = services.slice(0, 400);
  }

  if (!partial || typeof body.message === "string") {
    const message = String(body.message || "");
    if (message.length > 4000) errors.push("message_long");
    else out.message = message;
  }

  const shipRaw = pick(body, "ship_date", "ship-date");
  if (!partial || typeof shipRaw === "string") {
    out.ship_date = String(shipRaw != null ? shipRaw : "").trim().slice(0, 40);
  }

  if (!partial || typeof body.lang === "string") {
    let lang = String(body.lang || "zh-tw").trim();
    if (LANGS.indexOf(lang) < 0) lang = "zh-tw";
    out.lang = lang;
  }

  if (!partial || typeof body.status === "string") {
    let status = String(body.status || "新進").trim();
    const legacy = { new: "新進", read: "處理中", done: "已回覆" };
    if (legacy[status]) status = legacy[status];
    if (ENQUIRY_STATUSES.indexOf(status) < 0) errors.push("status");
    else out.status = status;
  }

  if (!partial || typeof body.note === "string") {
    out.note = String(body.note || "").slice(0, 2000);
  }

  return { ok: errors.length === 0, errors, value: out };
}

const ENQUIRY_SELECT =
  `id, created_at, given_name, family_name, company, email, phone, country,
   services, message, ship_date, status, note, deleted_at, lang`;

export async function getEnquiry(db, id, opts) {
  const includeDeleted = opts && opts.includeDeleted;
  const sql = includeDeleted
    ? `SELECT ${ENQUIRY_SELECT} FROM enquiries WHERE id = ?`
    : `SELECT ${ENQUIRY_SELECT} FROM enquiries WHERE id = ? AND deleted_at IS NULL`;
  return db.prepare(sql).bind(id).first();
}
