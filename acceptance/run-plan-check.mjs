/**
 * Local acceptance for the enquiry plan. Uses fake data「客戶 A」only.
 * Does not print secrets. Run against wrangler pages on 127.0.0.1:8788.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const base = process.env.NORTHGO_BASE || "http://127.0.0.1:8788";

function loadAdminPassword() {
  const raw = fs.readFileSync(path.join(root, ".dev.vars"), "utf8");
  const line = raw.split(/\r?\n/).find((l) => l.startsWith("ADMIN_PASSWORD="));
  if (!line) throw new Error("ADMIN_PASSWORD missing");
  return line.slice("ADMIN_PASSWORD=".length);
}

async function postEnquiry(body) {
  const res = await fetch(base + "/api/enquiries", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function main() {
  const out = { base, checks: [] };

  const before = await (
    await fetch(base + "/api/admin/enquiries")
  ).json().catch(() => ({}));
  out.checks.push({
    name: "未登入不能讀清單",
    pass: (await fetch(base + "/api/admin/enquiries")).status === 401,
    note: "expect 401"
  });

  // Case 1 blank required
  const c1 = await postEnquiry({
    "given-name": "客戶 A",
    "family-name": "",
    company: "",
    email: "",
    phone: "",
    terms: false
  });
  out.checks.push({
    name: "必填留白",
    pass: c1.status === 400 && c1.data.ok === false && !!c1.data.fields,
    status: c1.status,
    message: c1.data.message,
    fields: c1.data.fields
  });

  // Case 2 bad email
  const c2 = await postEnquiry({
    "given-name": "客戶 A",
    "family-name": "測試",
    company: "假公司",
    email: "abc",
    phone: "0912000000",
    terms: true
  });
  out.checks.push({
    name: "電子郵件 abc",
    pass:
      c2.status === 400 &&
      c2.data.fields &&
      c2.data.fields.email === "請填正確的電子郵件。",
    status: c2.status,
    fields: c2.data.fields
  });

  // Case 3 message too long
  const c3 = await postEnquiry({
    "given-name": "客戶 A",
    "family-name": "測試",
    company: "假公司",
    email: "client-a@example.test",
    phone: "0912000000",
    message: "x".repeat(4001),
    terms: true
  });
  out.checks.push({
    name: "訊息超過 4000",
    pass:
      c3.status === 400 &&
      c3.data.fields &&
      c3.data.fields.message === "訊息太長。",
    status: c3.status,
    fields: c3.data.fields
  });

  // Happy path
  const ok = await postEnquiry({
    "given-name": "客戶 A",
    "family-name": "測試",
    company: "客戶 A 公司",
    email: "client-a@example.test",
    phone: "0912000000",
    message: "計畫驗收假資料",
    services: ["freight"],
    terms: true
  });
  out.checks.push({
    name: "合格送出",
    pass:
      ok.status === 201 &&
      ok.data.ok === true &&
      !!ok.data.id &&
      ok.data.message === "已收到您的詢問。",
    id: ok.data.id,
    message: ok.data.message,
    status: ok.status
  });

  const password = loadAdminPassword();
  const login = await fetch(base + "/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password })
  });
  const setCookie = login.headers.getSetCookie
    ? login.headers.getSetCookie()
    : [login.headers.get("set-cookie")];
  const cookie = (setCookie || [])
    .flatMap((s) => String(s || "").split(/,(?=[^;]+?=)/))
    .map((s) => s.trim().split(";")[0])
    .filter(Boolean)
    .join("; ");
  out.checks.push({
    name: "後台登入",
    pass: login.ok && !!cookie,
    status: login.status
  });

  const list = await fetch(
    base + "/api/admin/enquiries?company=" + encodeURIComponent("客戶 A"),
    { headers: { cookie } }
  );
  const listData = await list.json();
  const item = (listData.items || []).find((r) => r.id === ok.data.id);
  out.checks.push({
    name: "清單可見同筆且新進",
    pass: !!item && item.status === "新進" && item.given_name === "客戶 A",
    id: item && item.id,
    status: item && item.status,
    company: item && item.company
  });

  const patch = await fetch(base + "/api/admin/enquiries/" + encodeURIComponent(ok.data.id), {
    method: "PATCH",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ status: "處理中", note: "窗口備註假資料" })
  });
  const patched = await patch.json();
  out.checks.push({
    name: "改狀態與備註",
    pass:
      patch.ok &&
      patched.item &&
      patched.item.status === "處理中" &&
      patched.item.note === "窗口備註假資料" &&
      patched.item.given_name === "客戶 A",
    status: patched.item && patched.item.status
  });

  const put = await fetch(base + "/api/admin/enquiries/" + encodeURIComponent(ok.data.id), {
    method: "PUT",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({
      given_name: "客戶 A",
      family_name: "測試",
      company: "客戶 A 公司",
      email: "client-a@example.test",
      phone: "0912000000",
      country: "台灣",
      services: "freight,warehouse",
      message: "計畫驗收假資料（已編輯）",
      ship_date: "2026-12-01",
      status: "已回覆",
      note: "全文已更新",
      lang: "zh-tw"
    })
  });
  const putData = await put.json();
  out.checks.push({
    name: "編輯全文 PUT",
    pass:
      put.ok &&
      putData.item &&
      putData.item.message === "計畫驗收假資料（已編輯）" &&
      putData.item.country === "台灣" &&
      putData.item.status === "已回覆" &&
      putData.item.services === "freight,warehouse",
    status: putData.item && putData.item.status
  });

  const created = await fetch(base + "/api/admin/enquiries", {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({
      given_name: "客戶 A",
      family_name: "後台",
      company: "後台新增公司",
      email: "admin-create@example.test",
      phone: "0912111111",
      message: "後台建立假資料",
      status: "新進",
      note: ""
    })
  });
  const createdData = await created.json();
  out.checks.push({
    name: "後台新增",
    pass: created.status === 201 && createdData.item && createdData.item.company === "後台新增公司",
    id: createdData.item && createdData.item.id,
    status: created.status
  });

  const del = await fetch(base + "/api/admin/enquiries/" + encodeURIComponent(ok.data.id), {
    method: "DELETE",
    headers: { cookie }
  });
  const after = await fetch(base + "/api/admin/enquiries", { headers: { cookie } });
  const afterData = await after.json();
  const still = (afterData.items || []).some((r) => r.id === ok.data.id);
  out.checks.push({
    name: "軟刪後清單不見",
    pass: del.ok && !still,
    deleteStatus: del.status,
    stillVisible: still
  });

  out.pass = out.checks.every((c) => c.pass);
  console.log(JSON.stringify(out, null, 2));
  process.exit(out.pass ? 0 : 1);
}

main().catch((err) => {
  console.log(JSON.stringify({ pass: false, error: String(err && err.message || err) }));
  process.exit(1);
});
