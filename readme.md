# Northgo 詢價表（整份做法）

驗收用假資料「客戶 A」。不寄信。不要把 `.dev.vars` 放進 git。不要按示範站送出鈕。

## 頁面

| 頁面 | 路徑 |
|------|------|
| 詢價表 | `contact.html#enquiry` |
| 後台登入 | `admin/login.html` |
| 客戶詢問 | `admin/index.html` |

## 本機

1. `.dev.vars` 從 `.dev.vars.example` 複製（勿進 git）
2. `npm run migrate:local`
3. `npm run dev` → `http://127.0.0.1:8788`
4. 驗收：`npm run check`

## CRUD

- **C：** 前台 POST `/api/enquiries` →「已收到您的詢問。」＋編號；狀態「新進」
- **R：** `/admin` 清單篩選；點列看明細（軟刪預設隱藏）
- **U：** 只改狀態／備註；`PATCH /api/admin/enquiries/:id`
- **D：**「確定刪除？」→ 軟刪 `deleted_at`

## 驗證三案

見 `acceptance/enquiry-validation.md`（必填留白／信箱 abc／訊息太長 → 不寫入）。
