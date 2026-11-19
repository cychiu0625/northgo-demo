import { json, readJson } from "../_lib/json.js";
import { SERVICES, LANGS } from "../_lib/copy.js";

function id() {
  return crypto.randomUUID();
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "database unavailable" }, 503);

  const body = await readJson(request);
  if (!body) return json({ error: "invalid json" }, 400);

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();
  const service = String(body.service || "").trim();
  let lang = String(body.lang || "zh-tw").trim();
  if (LANGS.indexOf(lang) < 0) lang = "zh-tw";

  if (!name || !email || !message || email.indexOf("@") < 1) {
    return json({ error: "validation" }, 400);
  }
  if (SERVICES.indexOf(service) < 0) {
    return json({ error: "invalid service" }, 400);
  }
  if (name.length > 120 || email.length > 200 || message.length > 4000) {
    return json({ error: "too long" }, 400);
  }

  const row = {
    id: id(),
    created_at: new Date().toISOString(),
    name,
    email,
    service,
    message,
    lang,
    status: "new",
    note: ""
  };

  await env.DB.prepare(
    `INSERT INTO enquiries (id, created_at, name, email, service, message, lang, status, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      row.id,
      row.created_at,
      row.name,
      row.email,
      row.service,
      row.message,
      row.lang,
      row.status,
      row.note
    )
    .run();

  return json({ ok: true, id: row.id }, 201);
}
