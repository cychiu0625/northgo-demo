/**
 * Local happy-path: create enquiry as 客戶 A, then admin list finds it.
 * Does not print secrets. Does not hit northgo-demo.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.NORTHGO_BASE || "http://127.0.0.1:8790";

function loadAdminPassword() {
  const raw = fs.readFileSync(path.join(root, ".dev.vars"), "utf8");
  const line = raw.split(/\r?\n/).find((l) => l.startsWith("ADMIN_PASSWORD="));
  if (!line) throw new Error("ADMIN_PASSWORD missing");
  return line.slice("ADMIN_PASSWORD=".length);
}

async function main() {
  const create = await fetch(base + "/api/enquiries", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      "given-name": "客戶 A",
      "family-name": "測試",
      company: "客戶 A 公司",
      email: "client-a@example.test",
      phone: "0912000000",
      message: "合格送出驗收假資料",
      services: ["freight"],
      terms: true
    })
  });
  const created = await create.json();

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

  const list = await fetch(
    base + "/api/admin/enquiries?company=" + encodeURIComponent("客戶 A"),
    { headers: { cookie } }
  );
  const listData = await list.json();
  const item = (listData.items || []).find((r) => r.id === created.id);

  console.log(
    JSON.stringify(
      {
        base,
        clicked: "本機聯絡頁詢價表 → 送出詢問（假資料 客戶 A；未打示範站）",
        screenMessage: created.message,
        id: created.id,
        adminStatus: item && item.status,
        adminCompany: item && item.company,
        sameRow: !!item,
        createOk: create.status === 201 && created.ok === true,
        loginOk: login.ok && !!cookie
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.log(JSON.stringify({ pass: false, error: String(err && err.message || err) }));
  process.exit(1);
});
