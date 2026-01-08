// netlify/functions/ask-ai.js

// 簡化版資料摘要 (Hardcoded for serverless function efficiency)
const cardDataSummary = [
    // Taishin
    { id: "taishin_pay_app", desc: "台新Pay綁定支付。適用: 新光三越, 7-11, 全家, 康是美, IKEA" },
    { id: "taishin_pay_taiwan", desc: "台灣Pay掃碼支付。適用: 麥當勞, 大樹藥局, 燦坤, 全國電子" },
    { id: "taishin_pay_plus", desc: "韓國超商與海外交易免手續費。適用: 韓國GS25, DAISO" },
    { id: "taishin_line", desc: "LINE Pay 綁定一般消費" },
    { id: "taishin_daily", desc: "天天刷。適用: 加油(中油/全國), 超商(台新Pay), 全聯, 寶雅, 屈臣氏, 藥局, 交通(台鐵/高鐵/Uber)" },
    { id: "taishin_big", desc: "大筆刷。適用: 百貨公司(新光/遠東/SOGO/微風/101), Outlet, IKEA, UNIQLO, ZARA" },
    { id: "taishin_eslite", desc: "誠品專用。適用: 誠品生活, 誠品線上. 排除: 誠品書店" },
    { id: "taishin_dining", desc: "好饗刷。適用: 餐廳, 外送(UberEats/Foodpanda), 飯店住宿, KTV(錢櫃/好樂迪), 售票系統" },
    { id: "taishin_digital", desc: "數趣刷。適用: 網購(蝦皮/Momo/PChome/淘寶), 遊戲(Steam/Nintendo), 影音(Netflix/Disney+), AI(ChatGPT)" },
    { id: "taishin_travel", desc: "玩旅刷。適用: 海外消費, 航空公司(長榮/中華/星宇/廉航), 訂房網(Booking/Agoda), 旅行社, 交通卡(Suica)" },
    
    // Cathay
    { id: "cathay_megaport", desc: "瘋大港。適用: 大港開唱周邊, 高雄指定飯店, 高鐵(限期)" },
    { id: "cathay_digital", desc: "玩數位。適用: 網購(蝦皮/Momo/PChome), 影音串流, AI(ChatGPT/Claude)" },
    { id: "cathay_shopping", desc: "樂饗購。適用: 百貨公司(SOGO/新光/遠東), 餐廳, 外送, 藥妝(屈臣氏/康是美). 排除: 服飾品牌(Uniqlo/Zara)" },
    { id: "cathay_eslite", desc: "誠品生活。適用: 誠品實體" },
    { id: "cathay_travel", desc: "趣旅行。適用: 海外實體消費, 航空公司, 訂房網, Klook/KKday, 交通(高鐵/Uber)" },
    { id: "cathay_select", desc: "集精選。適用: 家樂福, 全聯, 7-11/全家, 加油(中油)" },
    { id: "cathay_birthday_10", desc: "慶生月10%。適用: 指定高級餐廳(王品/鼎王/無老), KTV, 日本樂園(迪士尼/環球)" },
    { id: "cathay_birthday_35", desc: "慶生月3.5%。適用: 新光三越, Uber Eats, Klook" },
    { id: "cathay_kids", desc: "童樂匯。適用: 親子餐廳, 樂園, 飯店, 母嬰用品, 學費" }
];

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        console.log('[BACKEND] 🚀 Function 已啟動');
        const body = JSON.parse(event.body);
        const userQuery = body.query;
        console.log('[BACKEND] 📨 接收到查詢:', userQuery);
        
        // API Key will come from Environment Variable in Netlify Dashboard
        const apiKey = process.env.GOOGLE_API_KEY; 

        if (!apiKey) {
            console.error('[BACKEND] ❌ 環境變數 GOOGLE_API_KEY 未設定');
            return { 
                statusCode: 500, 
                body: JSON.stringify({ error: "Server Configuration Error: API Key missing" }) 
            };
        }

        console.log('[BACKEND] ✅ API Key 已載入 (長度:', apiKey.length, '字符)');
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        console.log('[BACKEND] 🔗 Google API URL 已準備');
        
        const prompt = `
            你是一個信用卡推薦助手。
            以下是現有的卡片 ID 與適用情境摘要：
            ${JSON.stringify(cardDataSummary)}
            
            使用者的需求是：「${userQuery}」
            
            請判斷哪一張卡片的 ID 最符合需求。
            邏輯判斷優先順序：
            1. 如果提及特定商戶(如 "饗食天堂")，請推論其類別(如 餐廳)並對應最適合的卡(如 dining 或 shopping)。
            2. 如果提及特定類別(如 "買衣服")，請對映百貨或網購相關卡片。
            3. 如果是出國相關(如 "日本"), 請對應 travel 相關。
            
            回傳規則：
            - 若有高度相關的卡片，只回傳該 "ID" 字串 (例如 "cathay_travel")。
            - 若完全不相關或無法判斷，回傳 "null"。
            - 只回傳純文字 ID，不要有 Markdown 格式(如 \`\`)，不要有解釋。
        `;

        console.log('[BACKEND] 📤 正在呼叫 Google Gemini API...');
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        console.log('[BACKEND] 📥 收到 Google 回應，狀態碼:', response.status);
        const data = await response.json();

        // 檢查 Google 是否回傳錯誤 (例如 API Key 無效, Quota 超過等)
        if (!response.ok) {
            console.error('[BACKEND] ❌ Google API 錯誤:', data);
            return {
                statusCode: response.status, // 回傳原本的錯誤代碼 (400, 403...)
                body: JSON.stringify({ error: data.error?.message || "Google API Error" })
            };
        }
        
        // 解析回應
        console.log('[BACKEND] 🔍 解析 Google 回應...');
        let aiResult = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "null";
        // 清理可能出現的引號或空白
        aiResult = aiResult.replace(/^['"`]+|['"`]+$/g, '').trim();
        console.log('[BACKEND] 🎯 AI 最終判斷結果:', aiResult);

        console.log('[BACKEND] ✅ 回傳成功！');
        return {
            statusCode: 200,
            body: JSON.stringify({ result: aiResult })
        };

    } catch (error) {
        console.error('[BACKEND] ❌ Function 執行失敗:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to connect to AI service" })
        };
    }
}
