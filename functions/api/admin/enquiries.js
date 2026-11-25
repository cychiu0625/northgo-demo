import { json, readJson } from "../../_lib/json.js";
import { requireAdmin } from "../../_lib/auth.js";
import {
  ENQUIRY_STATUSES,
  getEnquiry,
  newId,
  validateEnquiryInput
} from "../../_lib/enquiries.js";

/** R＝讀取清單。需已登入。預設不回已軟刪除（deleted_at 非空）的列。 */
export async function onRequestGet(context) {
  const { request, env } = context;
  if (!(await requireAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  if (!env.DB) return json({ error: "database unavailable" }, 503);

  const url = new URL(request.url);
  const status = String(url.searchParams.get("status") || "").trim();
  const company = String(
    url.searchParams.get("company") || url.searchParams.get("q") || ""
  ).trim();
  const includeDeleted = url.searchParams.get("include_deleted") === "1";

  let sql =
    `SELECT id, created_at, given_name, family_name, company, email, phone,
            country, services, message, ship_date, status, note, deleted_at, lang
     FROM enquiries`;
  const binds = [];
  const where = [];

  /* 預設隱藏軟刪除 */
  if (!includeDeleted) {
    where.push("deleted_at IS NULL");
  }

  if (status) {
    const legacy = { new: "新進", read: "處理中", done: "已回覆" };
    const normalized = legacy[status] || status;
    if (ENQUIRY_STATUSES.indexOf(normalized) >= 0) {
      where.push("status = ?");
      binds.push(normalized);
    }
  }

  if (company) {
    where.push("company LIKE ?");
    binds.push("%" + company.replace(/%/g, "") + "%");
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

  const parsed = validateEnquiryInput(
    Object.assign({}, body, { status: body.status || "新進" }),
    false
  );
  if (!parsed.ok) return json({ error: "validation", fields: parsed.errors }, 400);

  const row = {
    id: newId(),
    created_at: new Date().toISOString(),
    given_name: parsed.value.given_name,
    family_name: parsed.value.family_name || "",
    company: parsed.value.company || "",
    email: parsed.value.email,
    phone: parsed.value.phone || "",
    country: parsed.value.country || "",
    services: parsed.value.services || "",
    message: parsed.value.message || "",
    ship_date: parsed.value.ship_date || "",
    lang: parsed.value.lang || "zh-tw",
    status: parsed.value.status || "新進",
    note: parsed.value.note || ""
  };

  await env.DB.prepare(
    `INSERT INTO enquiries (
      id, created_at, given_name, family_name, company, email, phone,
      country, services, message, ship_date, status, note, deleted_at, lang
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`
  )
    .bind(
      row.id,
      row.created_at,
      row.given_name,
      row.family_name,
      row.company,
      row.email,
      row.phone,
      row.country,
      row.services,
      row.message,
      row.ship_date,
      row.status,
      row.note,
      row.lang
    )
    .run();

  return json({ item: await getEnquiry(env.DB, row.id) }, 201);
}
