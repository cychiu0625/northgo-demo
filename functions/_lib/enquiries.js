import { LANGS, SERVICES } from "./copy.js";

export function newId() {
  return crypto.randomUUID();
}

export function validateEnquiryInput(body, partial) {
  const out = {};
  const errors = [];

  if (!partial || typeof body.name === "string") {
    const name = String(body.name || "").trim();
    if (!name) errors.push("name");
    else if (name.length > 120) errors.push("name_long");
    else out.name = name;
  }

  if (!partial || typeof body.email === "string") {
    const email = String(body.email || "").trim();
    if (!email || email.indexOf("@") < 1) errors.push("email");
    else if (email.length > 200) errors.push("email_long");
    else out.email = email;
  }

  if (!partial || typeof body.service === "string") {
    const service = String(body.service || "").trim();
    if (SERVICES.indexOf(service) < 0) errors.push("service");
    else out.service = service;
  }

  if (!partial || typeof body.message === "string") {
    const message = String(body.message || "").trim();
    if (!message) errors.push("message");
    else if (message.length > 4000) errors.push("message_long");
    else out.message = message;
  }

  if (!partial || typeof body.lang === "string") {
    let lang = String(body.lang || "zh-tw").trim();
    if (LANGS.indexOf(lang) < 0) lang = "zh-tw";
    out.lang = lang;
  }

  if (!partial || typeof body.status === "string") {
    const status = String(body.status || "new").trim();
    if (["new", "read", "done"].indexOf(status) < 0) errors.push("status");
    else out.status = status;
  }

  if (!partial || typeof body.note === "string") {
    out.note = String(body.note || "").slice(0, 2000);
  }

  return { ok: errors.length === 0, errors, value: out };
}

export async function getEnquiry(db, id) {
  return db
    .prepare(
      `SELECT id, created_at, name, email, service, message, lang, status, note
       FROM enquiries WHERE id = ?`
    )
    .bind(id)
    .first();
}
