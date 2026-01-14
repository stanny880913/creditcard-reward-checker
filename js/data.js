// Data Source
const taishinPlans = [
    {
        id: "taishin_pay_app",
        name: "Pay著刷-台新Pay (Taishin Pay)",
        rate: "3.8%",
        merchants: [
            "Taishin Pay", "新光三越", "7-11", "全家", "Richart Mart", "康是美", "IKEA", "NET", "Ok", "萊爾富", "小北百貨", "楓康超市", "九乘九文具", "光南", "ATT", "愛迪達", "Adidas", "摩曼頓", "台北捷運", "55688", "新北捷運", "路易莎", "Lousia coffee", "漢堡王", "Burger King", "屋馬", "茶六", "涮屋馬", "金韓食"
        ],
        instruction: "限使用 \"台新Pay\" 綁定支付。",
        icon: "fa-mobile-screen",
        bank: "Taishin"
    },
    {
        id: "taishin_pay_taiwan",
        name: "Pay著刷-台灣Pay-TWQR 支付 (Taiwan Pay - TWQR)",
        rate: "3.8%",
        merchants: [
            "Taiwan Pay", "神腦", "燦坤", "全國電子", "麥當勞", "美廉社", "大樹藥局", "杏一醫療"
        ],
        instruction: "限使用 \"台灣Pay-TWQR\" 電子支付，在台新Pay頁面做切換。",
        icon: "fa-qrcode",
        bank: "Taishin"
    },
    {
        id: "taishin_pay_plus",
        name: "Pay著刷-Pay+ (Pay Plus)",
        rate: "3.8%",
        merchants: [
            "Taishin Pay+", "韓國GS25", "emart24", "DAISO", "海外交易"
        ],
        instruction: "海外交易/韓國超商。再享免1.5%手續費。",
        icon: "fa-globe",
        bank: "Taishin"
    },
    {
        id: "taishin_line",
        name: "Pay著刷",
        rate: "2.3%",
        merchants: ["LINE Pay"],
        instruction: "LINE Pay 綁定一般消費享 2.3% 回饋，但在四大超商、繳費皆不在回饋範圍內。",
        icon: "fa-comments",
        bank: "Taishin"
    },
    {
        id: "taishin_daily",
        name: "天天刷",
        rate: "3.3%",
        merchants: [
            "7-11 (限使用台新Pay綁定支付，單筆上限3000元)", "全家 (限使用台新Pay綁定支付，單筆上限3000元)", "家樂福", "大買家", "唐吉軻德", "LOPIA",
            "臺鐵", "高鐵", "台灣大車隊", "LINEGO", "Yoxi", "Uber", "台灣Bolt",
            "中油直營", "全國加油", "台亞直營", "全國特急電", "源點EVOASIS", "華城電能EVALUE", "USPACE", "Autopass", "車麻吉",
            "寶雅", "康是美", "屈臣氏", "杏一醫療", "大樹藥局", "丁丁藥局", "佑全保健藥妝", "健康人生藥局"
        ],
        instruction: "⚠️ 7-11/全家僅限台新Pay支付，實體卡無加碼。包含加油、通勤與連鎖藥局。",
        icon: "fa-basket-shopping",
        bank: "Taishin"
    },
    {
        id: "taishin_big",
        name: "大筆刷",
        rate: "3.3%",
        merchants: [
            "新光三越", "skm pay", "遠東百貨", "遠東SOGO", "漢神巨蛋", "漢神百貨", "微風 (不含台北車站、台大醫院、中研院店、微風東岸)", "台北101",
            "遠東巨城", "廣三SOGO", "南紡購物中心", "京站", "三創生活", "夢時代", "統一時代",
            "DREAM PLAZA", "中友百貨", "LaLaport",
            "MITSUI OUTLET PARK", "華泰名品城", "SKM Park Outlets",
            "IKEA", "特力屋", "HOLA", "宜得利", "瑪黑家居",
            "UNIQLO", "GU", "ZARA", "NET", "lululemon (不含百貨的店中店)"
        ],
        instruction: "百貨/Outlet/居家/時尚。",
        icon: "fa-bag-shopping",
        bank: "Taishin"
    },
    {
        id: "taishin_eslite",
        name: "大筆刷",
        rate: "3.3%",
        merchants: ["誠品", "誠品生活", "誠品線上", "誠品支付"],
        instruction: "包含誠品生活實體 / 線上 (不含誠品書店)。",
        icon: "fa-book-open",
        bank: "Taishin"
    },
    {
        id: "taishin_dining",
        name: "好饗刷",
        rate: "3.3%",
        merchants: [
            "全臺餐飲", "王品瘋Pay", "Uber Eats", "Foodpanda",
            "拓元售票", "KKTIX", "年代售票", "寬宏售票", "OPENTIX", "OPENTIX 兩廳院文化生活", "FunNow",
            "錢櫃", "好樂迪", "ONCOR", "sing!go", "享溫馨",
            "晶華", "雲朗", "萬豪", "煙波", "老爺", "福華", "漢來", "君悅", "洲際酒店", "寒沐"
        ],
        instruction: "餐飲/外送/娛樂/飯店。(排除餐券/住宿券)",
        icon: "fa-utensils",
        bank: "Taishin"
    },
    {
        id: "taishin_digital",
        name: "數趣刷",
        rate: "3.3%",
        merchants: [
            "蝦皮 (不含海外直送、黃金等貴金屬、遊戲點數、票券消費)", "momo", "酷澎", "Coupang", "PChome (不含商店街、支付連、海外代購、PChome旅遊、儲值、電子票券)", "淘寶", "Amazon", "東森", "博客來",
            "Richart Mart", "PayEasy", "iHerb", "SHEIN", "Farfetch", "Olive Young",
            "知識衛星", "Amazing Talker", "Tutor ABC", "Hahow", "PressPlay",
            "MyCard", "遊戲橘子", "Steam", "PlayStation", "Nintendo", "Netflix", "Disney+",
            "ChatGPT", "Notion", "Canva", "Perplexity", "Claude"
        ],
        instruction: "網購/課程/遊戲/AI。",
        icon: "fa-gamepad",
        bank: "Taishin"
    },
    {
        id: "taishin_travel",
        name: "玩旅刷",
        rate: "3.3%",
        merchants: [
            "海外消費", "海外消費 (含歐洲國家交易)", "中華航空", "華信航空", "華信", "長榮航空", "星宇航空", "台灣虎航", "國泰航空",
            "立榮航空", "立榮", "樂桃航空", "樂桃", "阿聯酋航空", "阿聯酋", "亞洲航空", "酷航", "捷星航空", "捷星", "新加坡航空",
            "日本航空", "越捷航空", "越捷",
            "Uber", "Grab", "SUICA", "ICOCA", "PASMO", "WOWPASS", "AIRSIM",
            "Klook", "KKday", "Agoda", "Booking.com", "Trip.com", "Airbnb", "Hotels.com", "Expedia",
            "雄獅", "易遊網", "東南", "可樂", "可樂旅遊", "長汎", "長汎假期", "五福", "喜鴻", "易飛", "易飛網", "燦星", "加利利", "鳳凰", "山富", "行健"
        ],
        instruction: "海外/航空/訂房/旅行社。",
        icon: "fa-plane",
        bank: "Taishin"
    },
    {
        id: "taishin_holiday",
        name: "假日刷",
        rate: "2%",
        merchants: [],
        instruction: "節假日不限通路 (一般消費/保費/LINE Pay)。",
        icon: "fa-calendar-day",
        bank: "Taishin"
    }
];

const cathayPlans = [
    {
        id: "cathay_megaport",
        name: "瘋大港",
        rate: "3.5% / 10%",
        merchants: [
            // 售票 (限 2025/12/16~18)
            "拓元售票",
            // 周邊 (限 2026/3/21~23 或 預購)
            "大港開唱", "大港倉", "棧二庫", "左腳右腳", "ChargeSPOT", "星巴克",
            // 交通 (限 2026/2/21~3/23)
            "台灣高鐵", "台灣鐵路局",
            // 住宿 (限高雄指定)
            "城市商旅", "真愛館", "駁二館", "麗尊酒店", "帕可麗酒店", "和逸飯店",
            "旅居文旅", "一心館", "七賢館", "亞灣館", "秝芯旅店", "六合館",
            "鈞怡大飯店", "夏優旅居", "華園大飯店", "捷絲旅", "Klook"
        ],
        instruction: "期間限定活動。需注意售票、交通、周邊商品的適用日期不同。",
        icon: "fa-guitar",
        bank: "Cathay"
    },
    {
        id: "cathay_digital",
        name: "玩數位",
        rate: "3%",
        merchants: [
            "ChatGPT", "Canva", "Claude", "Cursor", "Duolingo", "Gamma", "Gemini", "Notion", "Perplexity", "Speak",
            "Apple", "Google Play", "Disney+", "Netflix", "Spotify", "YouTube Premium", "Max",
            "蝦皮", "momo", "PChome", "小樹購", "Coupang", "酷澎", "淘寶", "天貓"
        ],
        instruction: "AI/串流/網購專用。",
        icon: "fa-laptop-code",
        bank: "Cathay"
    },
    {
        id: "cathay_shopping",
        name: "樂饗購",
        rate: "3%",
        merchants: [
            "遠東SOGO", "遠東Garden City", "新光三越", "遠東百貨", "台北101", "BELLAVITA", "微風",
            "統一時代", "ATT 4 FUN", "京站", "美麗華", "NOKE忠泰", "大葉高島屋", "LaLaport",
            "宏匯廣場", "台茂", "大江", "Big City", "巨城", "中友", "廣三SOGO", "南紡", "耐斯",
            "夢時代", "漢神", "新月廣場", "CITYLINK", "秀泰", "環球", "太平洋百貨", "華泰名品城",
            "SKM Park", "MITSUI OUTLET PARK",
            "Uber Eats", "Foodpanda", "國內餐飲 (不含餐券)", "麥當勞", "康是美", "屈臣氏"
        ],
        exclusions: ["UNIQLO", "GU", "ZARA", "H&M", "Gap"],
        instruction: "不包含店中櫃，如：無印良品｜UNIQLO｜GU｜Gap｜H&M｜ZARA｜lululemon...等。請依刷卡簽單或CUBE App消費資訊中查看，非以發票上列示之商家名稱為依據。",
        icon: "fa-champagne-glasses",
        bank: "Cathay"
    },
    {
        id: "cathay_eslite",
        name: "樂饗購",
        rate: "3%",
        merchants: ["誠品", "誠品生活"],
        instruction: "限誠品生活實體。 (不含：誠品線上、誠品書店)。",
        icon: "fa-book-open",
        bank: "Cathay"
    },
    {
        id: "cathay_travel",
        name: "趣旅行",
        rate: "3%",
        merchants: [
            "星野集團", "全球迪士尼飯店", "東橫INN",
            "海外實體消費", "東京迪士尼", "大阪環球影城", "USJ", "哈利波特影城",
            "SUICA", "PASMO", "ICOCA", "Uber", "Grab", "台灣高鐵", "台灣大車隊", "yoxi", "iRent", "和運租車", "格上租車",
            "中華航空", "長榮航空", "星宇航空", "國泰航空", "阿聯酋", "虎航", "樂桃", "酷航", "捷星", "日本航空", "全日空", "亞洲航空", "聯合航空", "新加坡航空", "越捷", "大韓", "達美", "土耳其航空", "卡達", "法國航空",
            "Agoda", "Booking.com", "Airbnb", "Trip.com", "Klook", "KKday",
            "雄獅", "易遊網", "可樂", "東南", "五福", "燦星", "山富", "長汎", "鳳凰", "易飛網", "理想", "永利", "三賀"
        ],
        instruction: "海外實體/訂房/航空。注意：第三方支付 (LinePay等) 通常不適用。",
        icon: "fa-plane-departure",
        bank: "Cathay"
    },
    {
        id: "cathay_select",
        name: "集精選",
        rate: "2%",
        merchants: [
            "家樂福", "LOPIA", "全聯", "中油直營",
            "7-11", "全家", "IKEA",
            "U-POWER", "EVOASIS", "車麻吉", "uTagGo"
        ],
        instruction: "只有一般消費/超市/加油。刷卡0.3%。",
        icon: "fa-leaf",
        bank: "Cathay"
    },
    {
        id: "cathay_birthday_10",
        name: "慶生月 - 精選10%",
        rate: "10%",
        merchants: [
            // 宜花東美食
            "礁溪庄櫻桃谷", "富美海鮮火鍋", "富美海鮮", "上乘三家涮涮鍋", "上乘三家", "燒肉吉室", "茶宴", "挪亞方舟美食旗艦店", "挪亞方舟",
            "樹懶餐廳", "九號咖啡", "肉肉餐桌", "歐鄉牛排館", "老時光燒肉酒肴", "老時光", "火車頭烤肉屋", "火車頭", 
            "小和山谷", "屋賀爺燒肉", "屋賀爺", "湯蒸火鍋台東新生店", "湯蒸火鍋",
            
            // 微醺/餐酒/甜點
            "BeApe 法國傳統餐酒館", "BeApe", "Gras French", "TUTTO BELLO", "THE 春", "香色", "Galerie Bistro", 
            "FUGU GASTROPUB", "creammm.t", "Miss V Bakery", "紅葉蛋糕", "紅葉蛋糕指定網站", "七見櫻堂",

            // 在地食材 
            "Plants", "里海咖啡", "日光私廚法式餐廳", "日光私廚", "方正谷眷村味", "方正谷", "FIRNS", "漁采時令料理", "漁采",

            // 連鎖饗宴
            "UNCLE SHAWN 燒肉餐酒館", "UNCLE SHAWN", "二本松涮涮屋", "二本松", "橋山壽喜燒", "Pastaio", "Pastaio noodle cafe", 
            "詹記麻辣火鍋", "詹記", "無老鍋", "鼎王麻辣鍋", "鼎王", "小方舟串燒酒場", "小方舟", 
            "毛丼丼飯專門店", "毛丼", "毛房蔥柚鍋．冷藏肉專門", "毛房", "毛蔬亞洲蔬食", "毛蔬", "森川丼丼", "將軍府燒烤日本料理", "將軍府", "好夥伴咖啡",

            // 樂園/娛樂
            "東京迪士尼樂園", "東京迪士尼", "大阪環球影城", "USJ", "PlayStation", "Nintendo", "巴哈姆特動畫瘋",
            "錢櫃KTV", "錢櫃", "好樂迪KTV", "好樂迪", "星聚點KTV", "星聚點", "享溫馨KTV", "享溫馨"
        ],
        instruction: "生日當月限定。指定餐廳、KTV、日本樂園享 10% 小樹點。 (需切換權益)",
        icon: "fa-cake-candles",
        bank: "Cathay"
    },
    {
        id: "cathay_birthday_35",
        name: "慶生月 - 指定3.5%",
        rate: "3.5%",
        merchants: [
            "新光三越", "Uber Eats", "Klook", "FunNow"
        ],
        exclusions: ["SKM Park Outlets 高雄草衙"],
        instruction: "生日當月限定。百貨、外送、旅遊享 3.5% 小樹點。 (新光三越排除 SKM Park Outlets 高雄草衙)",
        icon: "fa-gift",
        bank: "Cathay"
    },
    {
        id: "cathay_kids",
        name: "童樂匯",
        rate: "5% / 10%",
        merchants: [
            // 補齊 5% 親子餐廳與 10% 品牌
            "雞湯大叔", "YAYOI", "彌生軒", "大戶屋", "甲蟲秘境", "貳樓", "大樹先生的家", "Money Jump", "小島3.5度", "Zone Cafe", "小院子",
            "10mois", "Mamas&Papas", "古北町", "Tiger Family", "Little Wonders", "Seahorse Originals",
            "朱宗慶", "雲門舞集", "Yamaha音樂教室", "TutorABC Junior", "SKI SCHOOL", "Etalking Kids", "iSKI", "汐游寶寶", "風城游汐谷",
            "東京迪士尼", "大阪環球影城", "麗寶樂園", "六福村", "九族文化村", "劍湖山", "義大", "小叮噹",
            "卡多摩", "樂兒屋", "寶齡婦幼", "安琪兒", "宜兒樂", "麗兒采家", "Taobaby", "俏媽咪", "媽媽好",
            "喜來登", "蘭城晶英", "煙波", "和逸", "威斯汀", "麗寶福容", "雲品", "義大皇家", "萬豪", "凱撒", "遠雄悅來", "瑞穗天合", "六福莊", "礁溪鳳凰", "名人堂",
            "台北美國學校", "台北歐洲學校", "道明外僑", "馬禮遜", "康乃薾", "立人", "康橋", "華盛頓", "復興實驗", "維多利亞", "高雄美國學校", "i繳費"
        ],
        instruction: "需解鎖權益。親子餐廳/樂園/飯店/學費/母嬰用品。",
        icon: "fa-child-reaching",
        bank: "Cathay"
    }
];

const yushanPlans = [
    {
        id: "yushan_mobile_pay",
        name: "行動支付",
        rate: "最高4.5%",
        merchants: [
            "玉山Wallet電子支付", "LINE Pay", "全支付", "街口支付", "悠遊付", "全盈+PAY", "iPASS MONEY", "icash Pay"
        ],
        instruction: "UP方案最高4.5%。限指定支付。排除超商、全聯、稅費。LINE Pay須有指定請款名稱。玉山Wallet限國內TWQR/台灣Pay(排除PayPay、學費、代扣繳)。",
        icon: "fa-mobile-screen",
        bank: "Yushan"
    },
    {
        id: "yushan_ec",
        name: "電商平台",
        rate: "最高4.5%",
        merchants: [
            "momo購物網", "momo", "蝦皮購物", "淘寶", "Coupang酷澎", "蝦皮", "淘寶", "Coupang", "酷澎"
        ],
        instruction: "UP方案最高4.5%。限實體卡/Apple Pay/GP/SP，排除第三方支付(如LINE Pay、街口)。蝦皮不含跨境。momo含TV購物/旅遊。淘寶含Lite。Coupang含火箭速配/跨境。",
        icon: "fa-cart-shopping",
        bank: "Yushan"
    },
    {
        id: "yushan_department_store",
        name: "國內百貨",
        rate: "最高4.5%",
        merchants: [
            "新光三越百貨", "新光三越", "台北101", "華泰名品城", "三井OUTLET", "MITSUI OUTLET PARK", "京站", "美麗華", "秀泰生活", "LaLaport", "統領廣場", "采盟", "昇恆昌", "統一時代百貨台北店", "統一時代", "DREAM PLAZA", "遠東百貨集團", "遠東百貨", "漢神百貨", "微風百貨", "微風", "誠品生活", "誠品"
        ],
        instruction: "UP方案最高4.5%。限實體卡/AP/GP/SP。排除3rd支付(如LINE Pay)、店中獨立店(如A13 Apple)。含SOGO、Garden City、skm pay/online、誠品線上。漢神不含巨蛋。",
        icon: "fa-bag-shopping",
        bank: "Yushan"
    },
    {
        id: "yushan_lifestyle",
        name: "生活採買",
        rate: "最高4.5%",
        merchants: [
            "家樂福", "屈臣氏", "康是美", "特力屋", "HOLA", "hoi好好生活", "UNIQLO", "NET", "大樹藥局", "丁丁藥妝"
        ],
        instruction: "UP方案最高4.5%。限實體卡/AP/GP/SP。僅限國內。UNIQLO/NET僅限街邊獨立店，百貨商場店中店不適用。",
        icon: "fa-basket-shopping",
        bank: "Yushan"
    },
    {
        id: "yushan_dining",
        name: "餐飲美食",
        rate: "最高4.5%",
        merchants: [
            "Uber Eats", "Foodpanda", "EZTABLE", "王品瘋Pay", 
            "饗賓餐飲", "官網購買餐券", "饗A Joy", "饗食天堂", "果然匯", "小福利", "饗饗", "旭集", "開飯", "饗泰多", "真珠",
            "瓦城料理", "瓦城", "非常泰", "大心", "1010", "時時香", "BOBO",
            "乾杯燒肉", "乾杯燒肉居酒屋", "老乾杯",
            "漢來美食", "漢來海港", "島語", "漢來蔬食", "漢來名人坊", "東方樓", "漢來上海湯包", "溜溜酸菜魚", "上菜", "翠園", "漢來軒", "焰", "PAVO", "精緻海鮮火鍋", "弁慶", "福園", "日日烘焙坊", "糕餅小舖", "台北漢來", "高雄漢來", "花季渡假飯店", "Hi Lai Café", "台北/高雄漢來大飯店", "花季渡假飯店",
            "鼎王餐飲", "鼎王麻辣鍋", "麻一點", "無老鍋",
            "爭鮮餐飲", "爭鮮迴轉壽司", "爭鮮PLUS", "定食8", "爭鮮gogo", "MAGiC TOUCH"
        ],
        instruction: "UP方案最高4.5%。限實體卡/Apple Pay/Google Pay/Samsung Pay。王品須用瘋Pay支付。漢來含漢來/花季飯店。排除百貨商場/美食街/飯店內之非獨立店簽單。",
        icon: "fa-utensils",
        bank: "Yushan",
    },
    {
        id: "yushan_traffic",
        name: "加油交通",
        rate: "最高4.5%",
        merchants: [
            "台灣中油 (限直營店)", "台灣中油", "55688", "台灣大車隊", "機場接送", "台鐵", "高鐵", "Uber", "Yoxi"
        ],
        instruction: "UP方案最高4.5%。限實體卡/Apple Pay/Google Pay/Samsung Pay。中油限直營店(含中油Pay)。台鐵/高鐵限官方通路購票(排除超商、感應扣款、聯票)。Uber限國內TWD交易。",
        icon: "fa-car",
        bank: "Yushan"
    },
    {
        id: "yushan_travel",
        name: "航空旅遊",
        rate: "最高4.5%",
        merchants: [
            "中華航空", "長榮航空", "日本航空", "台灣虎航", "樂桃航空", "酷航", "Trip.com", "Booking.com", "Hotels.com", "AsiaYo", "Expedia", "KKday", "Klook", "雄獅旅遊", "雄獅", "可樂旅遊", "可樂", "東南旅遊", "東南", "Agoda"
        ],
        instruction: "UP方案最高4.5%。限實體卡/Apple Pay/Google Pay/Samsung Pay。航空限官網/臨櫃購票(含機上免稅)。訂房限線上付款(排除到店付款)。Klook限國內TWD交易。雄獅含旅天下(排除其加盟商)。",
        icon: "fa-plane",
        bank: "Yushan"
    },
    {
        id: "yushan_overseas",
        name: "國外實體",
        rate: "最高4.5%",
        merchants: [
            "日本", "韓國", "泰國", "越南", "新加坡", "馬來西亞", "菲律賓", "中國", "香港", "澳門", "美國", "加拿大", "英國", "法國", "德國", "義大利", "澳洲"
        ],
        instruction: "UP方案最高4.5%。限實體卡/Apple Pay/Google Pay/Samsung Pay。排除網路交易、幣別為台幣或地點在台灣之交易。金額不含1.5%手續費。",
        icon: "fa-globe",
        bank: "Yushan"
    },
    {
        id: "yushan_selected",
        name: "精選商家",
        rate: "最高4.5%",
        merchants: [
            "Apple直營店", "小米台灣", "小米", "全國電子", "燦坤", "迪卡儂"
        ],
        instruction: "UP方案最高4.5%。限實體卡/Apple Pay/Google Pay/Samsung Pay。小米含通路不含商城(蝦皮/momo等)。全國/燦坤/迪卡儂含官網購物。排除第三方支付。",
        icon: "fa-store",
        bank: "Yushan"
    },
    {
        id: "yushan_esg",
        name: "ESG消費",
        rate: "最高4.5%",
        merchants: [
            "玉山Wallet愛心捐款", "特斯拉", "Tesla", "Gogoro電池資費", "Gogoro", "YouBike 2.0", "YouBike",
            "弘道老人福利基金會", "華山社會福利慈善事業基金會", "伊甸社會福利基金會", "喜憨兒社會福利基金會", 
            "社團法人中華民國保護動物協會", "勵馨社會福利事業基金會", 
            "財團法人私立天主教中華聖母社會福利慈善事業基金會", "財團法人羅慧夫顱顏基金會", 
            "社團法人臺灣雷特氏症病友關懷協會", "財團法人陽光社會福利基金會", 
            "社團法人台灣微客公益行動協會", "財團法人台北市失親兒福利基金會", 
            "社團法人中華民國失智者照顧協會", "財團法人台北市私立雙連視障關懷基金會", 
            "社團法人台灣同伴動物扶助協會", "社團法人台灣懷生相信動物協會", 
            "財團法人普仁青年關懷基金會", "社團法人中華民國荒野保護協會", 
            "社團法人台灣之心愛護動物協會"
        ],
        instruction: "UP方案最高4.5%。限實體卡/Apple Pay/Google Pay/Samsung Pay。捐款限Wallet愛心捐款專區。YouBike限App/掃碼租借(不含悠遊卡)。",
        icon: "fa-seedling",
        bank: "Yushan"
    }
];
