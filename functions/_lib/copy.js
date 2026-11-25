export const COPY_KEYS = [
  "formTitle",
  "name",
  "email",
  "service",
  "message",
  "send",
  "formError",
  "thanks",
  "optFreight",
  "optProject",
  "optWarehouse",
  "optAgency"
];

export const LANGS = ["zh-tw", "en", "ja", "vi"];

export const SERVICES = ["freight", "project", "warehouse", "agency", "other"];

export async function loadCopy(db, lang) {
  const rows = await db
    .prepare("SELECT key, value FROM enquiry_copy WHERE lang = ?")
    .bind(lang)
    .all();
  const out = {};
  (rows.results || []).forEach(function (row) {
    out[row.key] = row.value;
  });
  return out;
}

export async function loadAllCopy(db) {
  const rows = await db.prepare("SELECT lang, key, value FROM enquiry_copy").all();
  const out = { "zh-tw": {}, en: {}, ja: {}, vi: {} };
  (rows.results || []).forEach(function (row) {
    if (!out[row.lang]) out[row.lang] = {};
    out[row.lang][row.key] = row.value;
  });
  return out;
}
