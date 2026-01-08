if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('SW registred!', reg))
            .catch(err => console.log('SW failed', err));
    });
}

// Data loaded from data.js

// Combine for Keywords
const allKeywords = [
    ...taishinPlans.flatMap(p => p.merchants),
    ...cathayPlans.flatMap(p => p.merchants)
];

// DOM Elements
const searchInput = document.getElementById('merchantInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const suggestionsBox = document.getElementById('suggestions');
const resultContainer = document.getElementById('resultContainer');
const defaultState = document.getElementById('defaultState');

// Utils
function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

// Listeners
searchInput.addEventListener('input', (e) => {
    // Immediate UI update for Clear Button
    toggleClearBtn(e.target.value);
});
searchInput.addEventListener('input', debounce(handleInput, 300));
// Add Enter key support for mobile keyboards
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        performSearch(searchInput.value);
        searchInput.blur(); // Close mobile keyboard
        suggestionsBox.classList.remove('active'); // Hide suggestions
    }
});

searchBtn.addEventListener('click', () => {
    performSearch(searchInput.value);
    searchInput.blur();
    suggestionsBox.classList.remove('active');
});
clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    toggleClearBtn('');
    searchInput.focus();
    // Reset state
    if(defaultState) defaultState.classList.remove('hidden');
    if(resultContainer) resultContainer.classList.add('hidden');
    suggestionsBox.classList.remove('active');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) suggestionsBox.classList.remove('active');
});

function toggleClearBtn(val) {
    if (val.trim().length > 0) {
        clearBtn.classList.add('visible');
    } else {
        clearBtn.classList.remove('visible');
    }
}

// Logic
function handleInput(e) {
    const value = e.target.value.trim().toLowerCase();
    
    if (!value) {
        if(defaultState) defaultState.classList.remove('hidden');
        if(resultContainer) resultContainer.classList.add('hidden');
        suggestionsBox.classList.remove('active');
        return;
    } 
    
    if (defaultState) defaultState.classList.add('hidden');

    if (value.length > 0) {
        const matches = [...new Set(allKeywords.filter(k => k.toLowerCase().includes(value)))].slice(0, 5);
        renderSuggestions(matches, value);
    } else {
        suggestionsBox.classList.remove('active');
    }
}

function renderSuggestions(matches, query) {
    if (matches.length === 0) {
        suggestionsBox.classList.remove('active');
        return;
    }
    
    // Safety: Escape HTML
    const escapeHtml = (unsafe) => {
        return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
    }
    
    suggestionsBox.innerHTML = matches.map(match => {
        const safeMatch = escapeHtml(match);
        const safeQuery = escapeHtml(query);
        const regex = new RegExp(`(${safeQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const highlighted = safeMatch.replace(regex, '<span class="match-highlight">$1</span>');
        return `<div class="suggestion-item" onclick="quickSearch('${safeMatch}')">${highlighted}</div>`;
    }).join('');
    suggestionsBox.classList.add('active');
}

function quickSearch(term) {
    searchInput.value = term;
    toggleClearBtn(term);
    suggestionsBox.classList.remove('active');
    if(defaultState) defaultState.classList.add('hidden');
    performSearch(term);
}

// Logic
function findMatchingPlans(plans, query) {
    // 1. Check for Exact ID search (AI Redirect)
    const exactIdMatch = plans.find(p => p.id === query);
    if (exactIdMatch) {
         return {
            best: exactIdMatch,
            others: []
        };
    }

    let matches = plans.filter(p => {
        if (p.exclusions && p.exclusions.some(ex => query.toLowerCase().includes(ex.toLowerCase()))) {
            return false;
        }
        return p.merchants.some(m => m.toLowerCase().includes(query.toLowerCase()));
    });

    if (matches.length === 0) {
        const q = query.toLowerCase();
        if (['吃', '飯', '餐', '飲', 'food', '咖啡', 'cafe'].some(k => q.includes(k))) {
            const diningPlans = plans.filter(p => p.id.includes('dining') || p.id.includes('shopping') || p.id.includes('birthday'));
            matches.push(...diningPlans);
        }
        else if (['旅', '遊', '住', '宿', 'flight', 'hotel', '航', '機票', 'air'].some(k => q.includes(k))) {
            const travelPlans = plans.filter(p => p.id.includes('travel'));
            matches.push(...travelPlans);
        }
    }

    if (matches.length === 0) return { best: null, others: [] };

    matches.sort((a, b) => {
        const getRate = (str) => {
            const nums = str.match(/[\d.]+/g);
            return nums ? Math.max(...nums.map(n => parseFloat(n))) : 0;
        };
        return getRate(b.rate) - getRate(a.rate);
    });

    const seen = new Set();
    matches = matches.filter(p => {
        const duplicate = seen.has(p.id);
        seen.add(p.id);
        return !duplicate;
    });

    return {
        best: matches[0],
        others: matches.slice(1)
    };
}

function performSearch(query) {
    if (!query) return;

    const taishinResult = findMatchingPlans(taishinPlans, query);
    const cathayResult = findMatchingPlans(cathayPlans, query);

    renderComparison(query, taishinResult, cathayResult);
}

function renderComparison(query, taishin, cathay) {
    resultContainer.classList.remove('hidden');
    
    const taishinCard = renderCard(taishin, 'Taishin', 'taishin-theme', query);
    const cathayCard = renderCard(cathay, 'Cathay Cube', 'cathay-theme', query);

    // AI Button Logic: Only show when both results are generic/fallback
    let aiButtonHtml = '';
    const isTaishinEmpty = !taishin || (!taishin.best && !taishin.id);
    const isCathayEmpty = !cathay || (!cathay.best && !cathay.id);

    if (isTaishinEmpty && isCathayEmpty) {
        aiButtonHtml = `
            <div id="ai-section" style="width: 100%; text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.05);">
                <p style="color: #666; margin-bottom: 15px; font-size: 0.95rem;">找不到精確結果？讓 AI 幫你分析！</p>
                <button id="askAiBtn" class="action-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 28px; border-radius: 50px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3); display: inline-flex; align-items: center; gap: 8px; font-size: 1rem; transition: transform 0.2s;">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> 
                    <span>AI 智慧判斷</span>
                </button>
            </div>
        `;
    }

    resultContainer.innerHTML = `
        <div class="result-grid">
            ${taishinCard}
            ${cathayCard}
        </div>
        ${aiButtonHtml}
    `;

    // Bind AI Event
    const askAiBtn = document.getElementById('askAiBtn');
    if (askAiBtn) {
        askAiBtn.addEventListener('click', () => callNetlifyAI(query));
    }
}

function renderCard(result, bankName, themeClass, query) {
    if (!result || (!result.best && !result.id)) {
        // Fallback Recommendation
        let recommendationHtml = '';
        
        if (bankName === 'Taishin') {
            recommendationHtml = `
            <div class="others-section" style="margin-top: 15px; border-top: 1px dashed #ddd; padding-top: 10px;">
                <div class="others-title" style="color: #e63946;">💡 推薦替代方案 (若支援)</div>
                <div class="other-plan-row">
                    <div class="other-name">LINE Pay (Pay著刷)</div>
                    <div class="other-rate">2.3%</div>
                </div>
                 <div class="other-plan-row">
                    <div class="other-name">假日一般消費</div>
                    <div class="other-rate">2%</div>
                </div>
                 <div class="instruction-box" style="margin-top: 5px;">
                    <p style="font-size: 0.85rem; color: #666;">
                        若店家支援 <b>LINE Pay</b> 或 <b>台新Pay</b>，綁定後即可享回饋。
                        <br>週六週日直接刷實體卡亦享 2%。
                    </p>
                </div>
            </div>`;
        } else if (bankName === 'Cathay Cube') {
             recommendationHtml = `
            <div class="others-section" style="margin-top: 15px; border-top: 1px dashed #ddd; padding-top: 10px;">
                 <div class="others-title" style="color: #1a4985;">💡 一般消費權益</div>
                 <div class="other-plan-row">
                    <div class="other-name">一般消費 (集精選)</div>
                    <div class="other-rate">0.3%</div>
                </div>
                 <div class="instruction-box" style="margin-top: 5px;">
                    <p style="font-size: 0.85rem; color: #666;">
                        此通路可能僅適用一般消費回饋。
                        <br>建議優先使用其他高回饋卡片。
                    </p>
                </div>
            </div>`;
        }

        return `
            <div class="result-card ${themeClass}" style="opacity: 0.85;">
                <div class="bank-logo">${bankName}</div>
                <h3 style="color: #666; margin-bottom: 20px;">無指定加碼</h3>
                <div class="instruction-box">
                    <p style="font-size: 0.9rem !important;">
                        "${query}" 尚無特定方案列出。
                    </p>
                </div>
                ${recommendationHtml}
            </div>
        `;
    }

    const plan = result.best || result;
    const others = result.others || [];

    let othersHtml = '';
    if (others && others.length > 0) {
        othersHtml = `
            <div class="others-section">
                <div class="others-title">其他適用方案</div>
                ${others.map(other => `
                    <div class="other-plan-row">
                        <div class="other-name">${other.name}</div>
                        <div class="other-rate">${other.rate}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    return `
        <div class="result-card ${themeClass}">
            <div class="result-header">
                <div>
                    <div class="bank-logo">${bankName}</div>
                    <div class="merchant-name" style="font-size: 1.2rem;">${plan.name}</div>
                </div>
            </div>
            
            <div class="result-body">
                <div class="info-row">
                    <div class="info-icon"><i class="fa-solid fa-percent"></i></div>
                    <div class="info-content">
                        <h3>回饋比例</h3>
                        <p class="rate-highlight">${plan.rate}</p>
                    </div>
                </div>
                
                <div class="info-row">
                    <div class="info-icon"><i class="fa-solid ${plan.icon}"></i></div>
                    <div class="info-content">
                        <h3>適用類別</h3>
                        <p style="font-size: 1rem;">${plan.id.includes('dining') || plan.id.includes('shopping') || plan.id.includes('birthday') ? '餐飲/購物' : '指定通路'}</p>
                    </div>
                </div>

                <div class="instruction-box">
                    <div class="info-row" style="margin-bottom:0px;">
                        <div class="info-content">
                            <h3>攻略</h3>
                            <p>${plan.instruction}</p>
                        </div>
                    </div>
                </div>

                ${othersHtml}
            </div>
        </div>
    `;
}

// AI Feature
async function callNetlifyAI(query) {
    const btn = document.getElementById('askAiBtn');
    const loading = document.getElementById('ai-loading');
    
    console.log('[AI] 🤖 使用者觸發 AI 智慧判斷');
    console.log('[AI] 📝 查詢內容:', query);
    
    if (btn) btn.style.display = 'none';
    if (loading) loading.classList.remove('hidden');

    try {
        console.log('[AI] 🌐 正在連接 Netlify Function...');
        const response = await fetch('/.netlify/functions/ask-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });
        
        console.log('[AI] ✅ 收到回應，狀態碼:', response.status);
        const data = await response.json();
        console.log('[AI] 📦 AI 回傳結果:', data);
        
        if (data.result && data.result !== "null") {
            console.log('[AI] 🎯 AI 推薦的卡片 ID:', data.result);
            performSearch(data.result); 
        } else {
            console.warn('[AI] ⚠️ AI 無法判斷或回傳 null');
            if (loading) loading.innerHTML = '<i class="fa-solid fa-face-sad-tear"></i> AI 也找不到適合的方案，建議直接查看一般消費權益。';
        }
    } catch (e) {
        console.error('[AI] ❌ 連線失敗:', e);
        if (loading) loading.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> 連線錯誤，請稍後再試。';
    }
}
