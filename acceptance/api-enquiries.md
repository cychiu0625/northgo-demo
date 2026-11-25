# POST /api/enquiries（`src/worker.js`）

入口：`functions/api/enquiries.js` → `src/worker.js`。  
驗收用假資料「客戶 A」。不要按示範站送出鈕。不要寫密碼、不要把 `.dev.vars` 放進 git。

## 通過 → 201

```json
{ "ok": true, "id": "<uuid>", "message": "已收到您的詢問。" }
```

會在 D1 `enquiries` 新增一列，`status` 為「新進」。

## 不通過 → 400（不寫入）

```json
{
  "ok": false,
  "message": "請檢查標示的欄位。",
  "fields": {
    "email": "請填正確的電子郵件。"
  }
}
```

| 情況 | fields 句子（繁中） |
|------|---------------------|
| 必填空 | 請檢查這個欄位。 |
| 信箱如 `abc` | 請填正確的電子郵件。 |
| 訊息 > 4000 | 訊息太長。 |

網頁檢查關掉時，這一道仍要擋。寫入失敗 → `message`:「送出時發生問題，請再試一次。」
