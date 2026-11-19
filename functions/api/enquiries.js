import { json, readJson } from "../_lib/json.js";
import { getEnquiry, newId, validateEnquiryInput } from "../_lib/enquiries.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: "database unavailable" }, 503);

  const body = await readJson(request);
  if (!body) return json({ error: "invalid json" }, 400);

  const parsed = validateEnquiryInput(
    Object.assign({}, body, { status: "new", note: "" }),
    false
  );
  if (!parsed.ok) return json({ error: "validation", fields: parsed.errors }, 400);

  const row = {
    id: newId(),
    created_at: new Date().toISOString(),
    name: parsed.value.name,
    email: parsed.value.email,
    service: parsed.value.service,
    message: parsed.value.message,
    lang: parsed.value.lang || "zh-tw",
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

  return json({ ok: true, id: row.id, item: await getEnquiry(env.DB, row.id) }, 201);
}
