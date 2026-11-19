import { json, readJson } from "../../_lib/json.js";
import { requireAdmin } from "../../_lib/auth.js";
import { getEnquiry, newId, validateEnquiryInput } from "../../_lib/enquiries.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!(await requireAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  if (!env.DB) return json({ error: "database unavailable" }, 503);

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "";
  const q = String(url.searchParams.get("q") || "").trim();

  let sql =
    `SELECT id, created_at, name, email, service, message, lang, status, note
     FROM enquiries`;
  const binds = [];
  const where = [];

  if (status && ["new", "read", "done"].indexOf(status) >= 0) {
    where.push("status = ?");
    binds.push(status);
  }
  if (q) {
    where.push("(name LIKE ? OR email LIKE ? OR message LIKE ? OR note LIKE ?)");
    const like = "%" + q.replace(/%/g, "") + "%";
    binds.push(like, like, like, like);
  }
  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY created_at DESC LIMIT 200";

  const stmt = env.DB.prepare(sql);
  const rows = binds.length ? await stmt.bind(...binds).all() : await stmt.all();
  return json({ items: rows.results || [] });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!(await requireAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  if (!env.DB) return json({ error: "database unavailable" }, 503);

  const body = await readJson(request);
  if (!body) return json({ error: "invalid json" }, 400);

  const parsed = validateEnquiryInput(body, false);
  if (!parsed.ok) return json({ error: "validation", fields: parsed.errors }, 400);

  const row = {
    id: newId(),
    created_at: new Date().toISOString(),
    name: parsed.value.name,
    email: parsed.value.email,
    service: parsed.value.service,
    message: parsed.value.message,
    lang: parsed.value.lang || "zh-tw",
    status: parsed.value.status || "new",
    note: parsed.value.note || ""
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

  return json({ item: await getEnquiry(env.DB, row.id) }, 201);
}
