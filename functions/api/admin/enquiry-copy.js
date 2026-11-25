import { json, readJson } from "../../_lib/json.js";
import { requireAdmin } from "../../_lib/auth.js";
import { COPY_KEYS, LANGS, loadAllCopy } from "../../_lib/copy.js";
import { enquiryDefaults } from "../../_lib/defaults.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!(await requireAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  if (!env.DB) return json({ error: "database unavailable" }, 503);
  return json({
    copy: await loadAllCopy(env.DB),
    defaults: enquiryDefaults()
  });
}

export async function onRequestPut(context) {
  const { request, env } = context;
  if (!(await requireAdmin(request, env))) return json({ error: "unauthorized" }, 401);
  if (!env.DB) return json({ error: "database unavailable" }, 503);

  const body = await readJson(request);
  if (!body || typeof body.copy !== "object" || !body.copy) {
    return json({ error: "invalid json" }, 400);
  }

  const stmts = [];
  LANGS.forEach(function (lang) {
    const bag = body.copy[lang] || {};
    COPY_KEYS.forEach(function (key) {
      const raw = bag[key];
      if (typeof raw !== "string") return;
      const value = raw.trim();
      if (!value) {
        stmts.push(
          env.DB.prepare("DELETE FROM enquiry_copy WHERE lang = ? AND key = ?").bind(lang, key)
        );
      } else {
        stmts.push(
          env.DB.prepare(
            `INSERT INTO enquiry_copy (lang, key, value) VALUES (?, ?, ?)
             ON CONFLICT(lang, key) DO UPDATE SET value = excluded.value`
          ).bind(lang, key, value.slice(0, 1000))
        );
      }
    });
  });

  if (stmts.length) await env.DB.batch(stmts);
  return json({ ok: true, copy: await loadAllCopy(env.DB) });
}
