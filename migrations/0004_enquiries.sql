-- D1 資料表 enquiries（客戶詢價）
--
-- 欄位：
--   id              主鍵
--   created_at      建立時間
--   given_name      名
--   family_name     姓
--   company         公司
--   email           電子郵件
--   phone           電話
--   country         國家
--   services        服務（可複選，存成字串）
--   message         訊息
--   ship_date       預計出貨時間
--   status          狀態：只用「新進」「處理中」「已回覆」，預設「新進」
--   note            備註
--   deleted_at      刪除時間；NULL（空）表示還沒刪
--   lang            語系（選用）
--
-- 限制：本檔不插入任何客戶列。驗收請用假資料「客戶 A」，不要寫進 migration。
-- 若 0003 已套用過，下方 CREATE IF NOT EXISTS 不會改動既有資料。

CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  given_name TEXT NOT NULL DEFAULT '',
  family_name TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  services TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  ship_date TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '新進'
    CHECK (status IN ('新進', '處理中', '已回覆')),
  note TEXT NOT NULL DEFAULT '',
  deleted_at TEXT,
  lang TEXT NOT NULL DEFAULT 'zh-tw'
);

CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries (status);
CREATE INDEX IF NOT EXISTS idx_enquiries_deleted ON enquiries (deleted_at);
