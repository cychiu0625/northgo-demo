import { COPY_KEYS, LANGS } from "./copy.js";

export const ENQUIRY_DEFAULTS = {
  "zh-tw": {
    formTitle: "詢價",
    name: "姓名",
    email: "信箱",
    service: "服務",
    message: "需求",
    send: "送出詢價",
    formError: "請填姓名、信箱和需求。",
    thanks: "已收到詢價，會由窗口處理。",
    optFreight: "貨運",
    optProject: "專案",
    optWarehouse: "倉儲",
    optAgency: "船務代理"
  },
  en: {
    formTitle: "Enquiry",
    name: "Name",
    email: "Email",
    service: "Service",
    message: "What you need",
    send: "Send enquiry",
    formError: "Add your name, email, and what you need.",
    thanks: "Enquiry received. The desk will follow up.",
    optFreight: "Freight",
    optProject: "Project",
    optWarehouse: "Warehouse",
    optAgency: "Shipping agency"
  },
  ja: {
    formTitle: "問い合わせ",
    name: "氏名",
    email: "メール",
    service: "サービス",
    message: "要件",
    send: "送信",
    formError: "氏名、メール、要件を入力してください。",
    thanks: "受け付けました。窓口よりご連絡します。",
    optFreight: "貨物",
    optProject: "プロジェクト",
    optWarehouse: "倉庫",
    optAgency: "船舶代理"
  },
  vi: {
    formTitle: "Yêu cầu",
    name: "Họ tên",
    email: "Email",
    service: "Dịch vụ",
    message: "Nhu cầu",
    send: "Gửi yêu cầu",
    formError: "Điền họ tên, email và nhu cầu.",
    thanks: "Đã nhận yêu cầu. Quầy sẽ liên hệ lại.",
    optFreight: "Vận tải",
    optProject: "Dự án",
    optWarehouse: "Kho",
    optAgency: "Đại lý tàu"
  }
};

export function emptyCopy() {
  const out = {};
  LANGS.forEach(function (lang) {
    out[lang] = {};
    COPY_KEYS.forEach(function (key) {
      out[lang][key] = "";
    });
  });
  return out;
}

export function enquiryDefaults() {
  const out = emptyCopy();
  LANGS.forEach(function (lang) {
    COPY_KEYS.forEach(function (key) {
      out[lang][key] = (ENQUIRY_DEFAULTS[lang] && ENQUIRY_DEFAULTS[lang][key]) || "";
    });
  });
  return out;
}
