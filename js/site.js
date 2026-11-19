(function () {
  var LANGS = ["zh-tw", "en", "ja", "vi"];
  var HTML = { "zh-tw": "zh-Hant", en: "en", ja: "ja", vi: "vi" };
  var COPY = {
    "zh-tw": {
      menu: "選單", skip: "跳至內容", enquire: "詢價",
      navHome: "首頁", navServices: "服務", navAbout: "關於", navContact: "聯絡",
      footerNote: "重建草案。正式站仍是 www.northgo.com。此稿沒有 News，也沒有空的社群連結。",
      footerLive: "開啟正式站",
      homeTitle: "Northgo｜讓物流變得輕鬆",
      homeEyebrow: "Taipei · since 1988",
      homeH1: "讓物流變得",
      homeH1b: "輕鬆",
      homeLede: "Northgo 在台北深耕超過三十年。貨運、專案、倉儲和船務代理由同一個窗口負責，少一些來回，進度看得到。",
      homeServices: "四項服務",
      altHero: "藍調時分的貨櫃港", altFreight: "機場貨機坪", altProject: "港邊的大型貨載",
      altWarehouse: "高架貨運倉", altAgency: "靠泊的貨櫃船", altAbout: "港口黃昏",
      servicesTitle: "服務",
      servicesLede: "沒有另開的總覽迷宮。四項服務各有一頁，詢價都回到這一語系的聯絡頁。",
      svcFreight: "貨運物流", svcFreightLede: "海運、空運、陸運、報關。",
      svcProject: "專案物流", svcProjectLede: "超大、超重、高價貨物，從計畫到送達。",
      svcWarehouse: "倉儲物流", svcWarehouseLede: "據點、倉位、庫存，以及離岸倉儲。",
      svcAgency: "船務代理", svcAgencyLede: "港口代理與海事服務。",
      freightTitle: "貨運物流",
      freightLede: "一種貨運關係，四種走法。下面每一段都在這一頁。",
      ocean: "海運", oceanLede: "整櫃 FCL 與併櫃 LCL，沿既有航線安排。",
      air: "空運", airLede: "時程緊、要盯航班的貨。",
      land: "陸運", landLede: "港到倉、倉到門。",
      customs: "報關", customsLede: "文件、稅則與放行。",
      projectTitle: "專案物流",
      projectLede: "工程方案與專案管理。涵蓋油氣、離岸與海工、基礎建設、能源、軌道、再生能源、礦業、營建與工業。",
      warehouseTitle: "倉儲物流",
      warehouseLede: "據點位置、彈性倉位、庫存管理、加值服務，以及離岸物流倉儲。",
      agencyTitle: "船務代理",
      agencyLede: "港口代理與海事服務。船型含乾散貨、油輪、雜貨、郵輪、離岸、特種船、貨櫃船、汽車船。",
      aboutTitle: "關於 Northgo",
      aboutLede: "願景、使命，以及為什麼客戶把窗口留在這裡。",
      visionT: "願景", vision: "成為最被信任的物流名字。",
      missionT: "使命", mission: "讓物流變得輕鬆。",
      valuesT: "價值", values: "以客戶為中心、誠信與透明、創新與卓越、永續與責任。",
      storyT: "沿革", story: "1988 年創立於台北，2024 年更名為 Northgo。名字換了，港口、倉庫和同一個操作窗口還在。",
      whyT: "為什麼留在這裡", why: "一個窗口對四項服務。進度用說得清楚的方式回報，而不是再轉一手。",
      contactTitle: "聯絡",
      contactLede: "七個辦公室在同一張地圖上。詢價留在這個語系，不會跳回英文站。",
      offices: "辦公室",
      all: "全部 7", taiwan: "台灣 3", japan: "日本 2", sea: "東南亞 1", americas: "美洲 1",
      mapAll: "世界 · 7 個辦公室",
      mapTaiwan: "台灣 · 台北、台中、高雄",
      mapJapan: "日本 · 東京、大阪",
      mapSea: "東南亞 · 胡志明市",
      mapAmericas: "美洲 · 洛杉磯",
      listHint: "點編號或卡片可定位。",
      hq: "總部",
      formTitle: "詢價",
      name: "姓名", email: "信箱", service: "服務", message: "需求",
      optFreight: "貨運", optProject: "專案", optWarehouse: "倉儲", optAgency: "船務代理",
      send: "送出詢價",
      formError: "請填姓名、信箱和需求。",
      thanks: "已記下這筆詢價。這是重建草案，不會送到 Northgo 的正式信箱。",
      taipei: "台北", taichung: "台中", kaohsiung: "高雄",
      la: "洛杉磯", hcmc: "胡志明市", tokyo: "東京", osaka: "大阪"
    },
    en: {
      menu: "Menu", skip: "Skip to content", enquire: "Enquire",
      navHome: "Home", navServices: "Services", navAbout: "About", navContact: "Contact",
      footerNote: "Rebuild draft. The live site remains www.northgo.com. This draft has no News link and no empty social icons.",
      footerLive: "Open the live site",
      homeTitle: "Northgo | Making logistics effortless",
      homeEyebrow: "Taipei · since 1988",
      homeH1: "Making logistics ",
      homeH1b: "effortless",
      homeLede: "Northgo has worked from Taipei for more than thirty years. Freight, projects, warehousing, and shipping agency sit with one desk, so handoffs drop and progress stays visible.",
      homeServices: "Four services",
      altHero: "A container port at blue hour", altFreight: "An airport cargo apron", altProject: "Oversized cargo on the quay",
      altWarehouse: "A high-bay cargo terminal", altAgency: "A container ship at berth", altAbout: "A port at sunset",
      servicesTitle: "Services",
      servicesLede: "Four services, one page each. Every enquiry stays in the language you are reading.",
      svcFreight: "Freight logistics", svcFreightLede: "Ocean, air, land, and customs.",
      svcProject: "Project logistics", svcProjectLede: "Oversized, heavy, and high-value cargo, from plan to delivery.",
      svcWarehouse: "Warehouse logistics", svcWarehouseLede: "Locations, storage, inventory, and offshore warehousing.",
      svcAgency: "Shipping agency", svcAgencyLede: "Port agency and marine services.",
      freightTitle: "Freight logistics",
      freightLede: "One freight relationship, four ways to move. Each block is on this page.",
      ocean: "Ocean", oceanLede: "FCL and LCL on established routes.",
      air: "Air", airLede: "Cargo that has to meet a flight.",
      land: "Land", landLede: "Port to warehouse, warehouse to door.",
      customs: "Customs", customsLede: "Documents, classification, and release.",
      projectTitle: "Project logistics",
      projectLede: "Engineering solutions and project management across oil and gas, offshore, infrastructure, energy, rail, renewables, mining, construction, and industry.",
      warehouseTitle: "Warehouse logistics",
      warehouseLede: "Locations, flexible storage, inventory, value-added services, and offshore warehousing.",
      agencyTitle: "Shipping agency",
      agencyLede: "Port agency and marine services for dry bulk, tankers, break bulk, cruise, offshore, specialised ships, container ships, and car carriers.",
      aboutTitle: "About Northgo",
      aboutLede: "Vision, mission, and why the desk stays here.",
      visionT: "Vision", vision: "To be the most trusted name in logistics.",
      missionT: "Mission", mission: "Making logistics effortless.",
      valuesT: "Values", values: "Customer focus, integrity, innovation, and responsibility.",
      storyT: "Story", story: "Founded in Taipei in 1988 and renamed Northgo in 2024. The name changed. The ports, warehouses, and the same desk stayed.",
      whyT: "Why this desk", why: "One desk for four services. Progress is reported in plain language instead of being passed on again.",
      contactTitle: "Contact",
      contactLede: "Seven offices on one map. The enquiry stays in this language.",
      offices: "Offices",
      all: "All 7", taiwan: "Taiwan 3", japan: "Japan 2", sea: "Southeast Asia 1", americas: "Americas 1",
      mapAll: "World · 7 offices",
      mapTaiwan: "Taiwan · Taipei, Taichung, Kaohsiung",
      mapJapan: "Japan · Tokyo, Osaka",
      mapSea: "Southeast Asia · Ho Chi Minh City",
      mapAmericas: "Americas · Los Angeles",
      listHint: "Use a number or a card to focus the map.",
      hq: "Head office",
      formTitle: "Enquiry",
      name: "Name", email: "Email", service: "Service", message: "What you need",
      optFreight: "Freight", optProject: "Project", optWarehouse: "Warehouse", optAgency: "Shipping agency",
      send: "Send enquiry",
      formError: "Add your name, email, and what you need.",
      thanks: "Enquiry noted. This is a rebuild draft, so it is not sent to Northgo.",
      taipei: "Taipei", taichung: "Taichung", kaohsiung: "Kaohsiung",
      la: "Los Angeles", hcmc: "Ho Chi Minh City", tokyo: "Tokyo", osaka: "Osaka"
    },
    ja: {
      menu: "メニュー", skip: "本文へ", enquire: "問い合わせ",
      navHome: "ホーム", navServices: "サービス", navAbout: "会社概要", navContact: "連絡",
      footerNote: "再構築の草案です。本番は www.northgo.com。この草案に News と空の SNS リンクはありません。",
      footerLive: "本番サイトを開く",
      homeTitle: "Northgo｜物流を、たやすく",
      homeEyebrow: "Taipei · since 1988",
      homeH1: "物流を、",
      homeH1b: "たやすく",
      homeLede: "Northgo は台北を拠点に三十余年。貨物、プロジェクト、倉庫、船舶代理を一つの窓口にまとめ、引き継ぎを減らし、進捗を見えるようにします。",
      homeServices: "4つのサービス",
      altHero: "ブルーアワーのコンテナ港", altFreight: "空港の貨物エプロン", altProject: "岸壁の大型貨物",
      altWarehouse: "高層貨物ターミナル", altAgency: "着岸したコンテナ船", altAbout: "夕暮れの港",
      servicesTitle: "サービス",
      servicesLede: "4つのサービスがそれぞれ1ページ。問い合わせはこの言語のままです。",
      svcFreight: "貨物物流", svcFreightLede: "海運、空運、陸運、通関。",
      svcProject: "プロジェクト物流", svcProjectLede: "大型・重量・高額貨物を計画から届くまで。",
      svcWarehouse: "倉庫物流", svcWarehouseLede: "拠点、保管、在庫、オフショア倉庫。",
      svcAgency: "船舶代理店", svcAgencyLede: "港湾代理と海事サービス。",
      freightTitle: "貨物物流",
      freightLede: "一つの貨物窓口、四つの運び方。各項目はこのページにあります。",
      ocean: "海運", oceanLede: "FCL と LCL を既存航路で手配。",
      air: "空運", airLede: "フライトに合わせる貨物。",
      land: "陸運", landLede: "港から倉庫、倉庫からドア。",
      customs: "通関", customsLede: "書類、分類、許可。",
      projectTitle: "プロジェクト物流",
      projectLede: "エンジニアリングとプロジェクト管理。石油・ガス、オフショア、インフラ、エネルギー、鉄道、再エネ、鉱業、建設、産業。",
      warehouseTitle: "倉庫物流",
      warehouseLede: "立地、柔軟な保管、在庫、付加価値、オフショア倉庫。",
      agencyTitle: "船舶代理店",
      agencyLede: "港湾代理と海事サービス。ドライバルク、タンカー、在来貨物、クルーズ、オフショア、特殊船、コンテナ船、自動車船。",
      aboutTitle: "Northgo について",
      aboutLede: "ビジョン、ミッション、そして窓口をここに置く理由。",
      visionT: "ビジョン", vision: "最も信頼される物流の名前になる。",
      missionT: "ミッション", mission: "物流を、たやすく。",
      valuesT: "バリュー", values: "顧客中心、誠実、革新、責任。",
      storyT: "沿革", story: "1988年に台北で創業し、2024年に Northgo へ改称。名前は変わっても、港、倉庫、同じ窓口は残っています。",
      whyT: "この窓口を置く理由", why: "4サービスを一つの窓口で。進捗はたらい回しにせず、わかる言葉で返します。",
      contactTitle: "連絡",
      contactLede: "7つのオフィスを一枚の地図に。問い合わせはこの言語のままです。",
      offices: "オフィス",
      all: "すべて 7", taiwan: "台湾 3", japan: "日本 2", sea: "東南アジア 1", americas: "米州 1",
      mapAll: "世界 · 7オフィス",
      mapTaiwan: "台湾 · 台北、台中、高雄",
      mapJapan: "日本 · 東京、大阪",
      mapSea: "東南アジア · ホーチミン",
      mapAmericas: "米州 · ロサンゼルス",
      listHint: "番号かカードで地図を寄せます。",
      hq: "本社",
      formTitle: "問い合わせ",
      name: "氏名", email: "メール", service: "サービス", message: "要件",
      optFreight: "貨物", optProject: "プロジェクト", optWarehouse: "倉庫", optAgency: "船舶代理",
      send: "送信",
      formError: "氏名、メール、要件を入力してください。",
      thanks: "受け付けました。これは草案なので Northgo には送信されません。",
      taipei: "台北", taichung: "台中", kaohsiung: "高雄",
      la: "ロサンゼルス", hcmc: "ホーチミン", tokyo: "東京", osaka: "大阪"
    },
    vi: {
      menu: "Menu", skip: "Tới nội dung", enquire: "Yêu cầu",
      navHome: "Trang chủ", navServices: "Dịch vụ", navAbout: "Giới thiệu", navContact: "Liên hệ",
      footerNote: "Bản dựng lại. Website chính vẫn là www.northgo.com. Bản này không có News và không có biểu tượng mạng xã hội trống.",
      footerLive: "Mở website chính",
      homeTitle: "Northgo | Logistics đơn giản hơn",
      homeEyebrow: "Taipei · since 1988",
      homeH1: "Biến logistics thành ",
      homeH1b: "chuyện đơn giản",
      homeLede: "Northgo làm việc từ Đài Bắc hơn ba mươi năm. Vận tải, dự án, kho và đại lý tàu nằm ở một quầy, bớt chuyển tay, tiến độ nhìn thấy được.",
      homeServices: "Bốn dịch vụ",
      altHero: "Cảng container lúc chạng vạng", altFreight: "Sân đỗ hàng không", altProject: "Hàng siêu trường trên cầu tàu",
      altWarehouse: "Kho hàng tầng cao", altAgency: "Tàu container cập bến", altAbout: "Cảng lúc hoàng hôn",
      servicesTitle: "Dịch vụ",
      servicesLede: "Bốn dịch vụ, mỗi dịch vụ một trang. Yêu cầu giữ nguyên ngôn ngữ bạn đang đọc.",
      svcFreight: "Vận tải", svcFreightLede: "Đường biển, hàng không, đường bộ và thông quan.",
      svcProject: "Logistics dự án", svcProjectLede: "Hàng quá khổ, quá tải, giá trị cao, từ kế hoạch đến giao.",
      svcWarehouse: "Kho bãi", svcWarehouseLede: "Địa điểm, chỗ chứa, tồn kho và kho ngoài khơi.",
      svcAgency: "Đại lý tàu", svcAgencyLede: "Đại lý cảng và dịch vụ hàng hải.",
      freightTitle: "Vận tải hàng hóa",
      freightLede: "Một mối vận tải, bốn cách đi. Mỗi mục nằm trên trang này.",
      ocean: "Đường biển", oceanLede: "FCL và LCL trên các tuyến sẵn có.",
      air: "Hàng không", airLede: "Hàng phải kịp chuyến bay.",
      land: "Đường bộ", landLede: "Từ cảng vào kho, từ kho tới cửa.",
      customs: "Thông quan", customsLede: "Chứng từ, phân loại và thông quan.",
      projectTitle: "Logistics dự án",
      projectLede: "Giải pháp kỹ thuật và quản lý dự án: dầu khí, ngoài khơi, hạ tầng, năng lượng, đường sắt, năng lượng tái tạo, khai khoáng, xây dựng và công nghiệp.",
      warehouseTitle: "Logistics kho bãi",
      warehouseLede: "Vị trí, lưu kho linh hoạt, tồn kho, dịch vụ gia tăng và kho ngoài khơi.",
      agencyTitle: "Đại lý tàu",
      agencyLede: "Đại lý cảng và dịch vụ hàng hải cho hàng rời, tàu dầu, hàng kiện, du thuyền, ngoài khơi, tàu chuyên dụng, tàu container và tàu chở ô tô.",
      aboutTitle: "Về Northgo",
      aboutLede: "Tầm nhìn, sứ mệnh, và vì sao quầy liên hệ nằm ở đây.",
      visionT: "Tầm nhìn", vision: "Trở thành cái tên logistics được tin nhất.",
      missionT: "Sứ mệnh", mission: "Biến logistics thành chuyện đơn giản.",
      valuesT: "Giá trị", values: "Lấy khách hàng làm trung tâm, chính trực, đổi mới và trách nhiệm.",
      storyT: "Câu chuyện", story: "Thành lập tại Đài Bắc năm 1988, đổi tên thành Northgo năm 2024. Tên đổi. Cảng, kho và cùng một quầy vẫn còn.",
      whyT: "Vì sao ở lại quầy này", why: "Một quầy cho bốn dịch vụ. Tiến độ được nói rõ, không chuyển thêm một vòng.",
      contactTitle: "Liên hệ",
      contactLede: "Bảy văn phòng trên một bản đồ. Yêu cầu giữ nguyên ngôn ngữ này.",
      offices: "Văn phòng",
      all: "Cả 7", taiwan: "Đài Loan 3", japan: "Nhật 2", sea: "Đông Nam Á 1", americas: "Châu Mỹ 1",
      mapAll: "Thế giới · 7 văn phòng",
      mapTaiwan: "Đài Loan · Đài Bắc, Đài Trung, Cao Hùng",
      mapJapan: "Nhật · Tokyo, Osaka",
      mapSea: "Đông Nam Á · TP. Hồ Chí Minh",
      mapAmericas: "Châu Mỹ · Los Angeles",
      listHint: "Bấm số hoặc thẻ để tới vị trí.",
      hq: "Trụ sở",
      formTitle: "Yêu cầu",
      name: "Họ tên", email: "Email", service: "Dịch vụ", message: "Nhu cầu",
      optFreight: "Vận tải", optProject: "Dự án", optWarehouse: "Kho", optAgency: "Đại lý tàu",
      send: "Gửi yêu cầu",
      formError: "Điền họ tên, email và nhu cầu.",
      thanks: "Đã ghi nhận. Đây là bản dựng lại, nên không gửi tới Northgo.",
      taipei: "Đài Bắc", taichung: "Đài Trung", kaohsiung: "Cao Hùng",
      la: "Los Angeles", hcmc: "TP. Hồ Chí Minh", tokyo: "Tokyo", osaka: "Osaka"
    }
  };

  var OFFICES = [
    { id: "taipei", n: 1, hq: true, region: "taiwan", key: "taipei", address: "7F., No. 10, Sec. 3, Minsheng E. Rd., Taipei City 104511, Taiwan", tel: "+886-2-2531-8677", fax: "+886-2-2531-8577", email: "info.tpe@northgo.com", lat: 25.0575355, lng: 121.5386075 },
    { id: "taichung", n: 2, region: "taiwan", key: "taichung", address: "No. 4, Zhongheng 11th Rd., Taichung City 435058, Taiwan", tel: "+886-4-2326-2580", fax: "+886-4-2326-0308", email: "info.txg@northgo.com", lat: 24.2713371, lng: 120.5309871 },
    { id: "kaohsiung", n: 3, region: "taiwan", key: "kaohsiung", address: "19F-2, No.31 Hai-Pien Rd., Kaohsiung City 802609, Taiwan", tel: "+886-7-335-0730", fax: "+886-7-336-4536", email: "info.khh@northgo.com", lat: 22.6165628, lng: 120.2936322 },
    { id: "los-angeles", n: 4, region: "americas", key: "la", address: "119 S. Atlantic Blvd, Ste#301, Monterey Park, CA 91754, USA", tel: "+1-714-853-1088", fax: "", email: "info.lax@northgo.com", lat: 34.0616936, lng: -118.1344366 },
    { id: "ho-chi-minh", n: 5, region: "southeast-asia", key: "hcmc", address: "5th Floor, No. 92D Nguyen Huu Canh Street, Ward 22, Binh Thanh District, Ho Chi Minh City, Vietnam", tel: "+84-28-9995-7368", fax: "", email: "info.hcmc@northgo.com", lat: 10.7896013, lng: 106.7124073 },
    { id: "tokyo", n: 6, region: "japan", key: "tokyo", address: "104-0041 6FL., Gran+Ginza-East 1-5-1 Shintomi, Chuo-Ku, Tokyo City, Japan", tel: "+81-3-6260-3944", fax: "+81-3-6260-3945", email: "info.tyo@northgo.com", lat: 35.6730667, lng: 139.7731585 },
    { id: "osaka", n: 7, region: "japan", key: "osaka", address: "530-0002 3FL., -B MF Sakura-Bashi Build, 2-6-23 Sonezaki Shinchi, kita-ku, Osaka City, Japan", tel: "+81-6-6676-8395", fax: "+81-6-6676-8397", email: "info.osa@northgo.com", lat: 34.7011083, lng: 135.4993475 }
  ];

  var lang = "zh-tw";
  try {
    var saved = localStorage.getItem("northgo-lang");
    if (LANGS.indexOf(saved) >= 0) lang = saved;
  } catch (err) { /* private mode */ }

  function t(key) {
    return (COPY[lang] && COPY[lang][key]) || COPY.en[key] || key;
  }

  function apply() {
    document.documentElement.lang = HTML[lang];
    var titleKey = document.body.getAttribute("data-title-key");
    if (titleKey) document.title = t(titleKey);
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (node) {
      node.alt = t(node.getAttribute("data-i18n-alt"));
    });
    document.querySelectorAll("[data-set-lang]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute("data-set-lang") === lang));
    });
    var page = document.body.getAttribute("data-page");
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      if (link.getAttribute("data-nav") === page) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    if (window.Northgo && typeof window.Northgo.onLang === "function") window.Northgo.onLang();
  }

  document.addEventListener("click", function (event) {
    var langButton = event.target.closest("[data-set-lang]");
    if (langButton) {
      lang = langButton.getAttribute("data-set-lang");
      try { localStorage.setItem("northgo-lang", lang); } catch (err) { /* ignore */ }
      apply();
      return;
    }
    var menu = event.target.closest(".menu");
    if (menu) {
      var nav = document.querySelector(".nav");
      var open = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(open));
      return;
    }
    if (event.target.closest(".nav a")) {
      var openNav = document.querySelector(".nav");
      var menuButton = document.querySelector(".menu");
      if (openNav) openNav.classList.remove("open");
      if (menuButton) menuButton.setAttribute("aria-expanded", "false");
    }
  });

  function mountLogo() {
    var nodes = document.querySelectorAll("[data-logo]");
    if (!nodes.length) return;
    function start() {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      nodes.forEach(function (node) {
        var anim = window.lottie.loadAnimation({
          container: node,
          renderer: "svg",
          loop: false,
          autoplay: !reduce,
          path: "img/ng-logo.json?v=1.3.1"
        });
        if (reduce) {
          anim.addEventListener("DOMLoaded", function () {
            anim.goToAndStop(47, true);
          });
        }
        var link = node.closest(".brand");
        if (link) {
          link.addEventListener("mouseenter", function () { anim.goToAndPlay(0, true); });
        }
      });
    }
    if (window.lottie) start();
    else {
      var script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js";
      script.onload = start;
      document.head.appendChild(script);
    }
  }

  window.Northgo = { t: t, offices: OFFICES, get lang() { return lang; } };
  document.addEventListener("DOMContentLoaded", function () {
    apply();
    mountLogo();
  });
})();
