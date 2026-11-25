-- enquiries：詢價收件。狀態只用「新進、處理中、已回覆」，預設「新進」。
-- deleted_at 為 NULL 表示尚未刪除。本檔不插入任何客戶資料。

PRAGMA foreign_keys = OFF;

CREATE TABLE enquiries_new (
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

INSERT INTO enquiries_new (
  id,
  created_at,
  given_name,
  family_name,
  company,
  email,
  phone,
  country,
  services,
  message,
  ship_date,
  status,
  note,
  deleted_at,
  lang
)
SELECT
  id,
  created_at,
  COALESCE(name, '') AS given_name,
  '' AS family_name,
  COALESCE(company, '') AS company,
  email,
  '' AS phone,
  '' AS country,
  COALESCE(service, '') AS services,
  COALESCE(message, '') AS message,
  '' AS ship_date,
  CASE status
    WHEN 'new' THEN '新進'
    WHEN 'read' THEN '處理中'
    WHEN 'done' THEN '已回覆'
    WHEN '新進' THEN '新進'
    WHEN '處理中' THEN '處理中'
    WHEN '已回覆' THEN '已回覆'
    ELSE '新進'
  END AS status,
  COALESCE(note, '') AS note,
  NULL AS deleted_at,
  COALESCE(lang, 'zh-tw') AS lang
FROM enquiries;

DROP TABLE enquiries;
ALTER TABLE enquiries_new RENAME TO enquiries;

CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries (status);
CREATE INDEX IF NOT EXISTS idx_enquiries_deleted ON enquiries (deleted_at);

PRAGMA foreign_keys = ON;
