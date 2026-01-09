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
    const debounced = (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
}

// Listeners
searchInput.addEventListener('focus', () => {
    // Mobile UX: Scroll to top of search area when focusing to give more room for suggestions
    setTimeout(() => {
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300); // Wait for keyboard to start appearing
});

searchInput.addEventListener('input', (e) => {
    // Immediate UI update for Clear Button
    toggleClearBtn(e.target.value);
});

const debouncedHandleInput = debounce(handleInput, 300);
searchInput.addEventListener('input', debouncedHandleInput);

// Add Enter key support for mobile keyboards
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        debouncedHandleInput.cancel();
        performSearch(searchInput.value);
        searchInput.blur(); // Close mobile keyboard
        suggestionsBox.classList.remove('active'); 
        suggestionsBox.classList.add('hidden');
    }
});

searchBtn.addEventListener('click', () => {
    debouncedHandleInput.cancel();
    performSearch(searchInput.value);
    searchInput.blur();
    suggestionsBox.classList.remove('active');
    suggestionsBox.classList.add('hidden');
});
clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    if(amountInput) amountInput.value = ''; // 同步清除金額輸入
    toggleClearBtn('');
    searchInput.focus();
    // Reset state
    if(defaultState) defaultState.classList.remove('hidden');
    if(resultContainer) {
        resultContainer.classList.add('hidden');
        resultContainer.innerHTML = ''; // 清空內容確保完全關閉
    }
    suggestionsBox.classList.remove('active');
    suggestionsBox.classList.add('hidden');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-card')) {
        suggestionsBox.classList.remove('active');
        suggestionsBox.classList.add('hidden');
    }
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
        suggestionsBox.classList.add('hidden');
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
        return `<div class="suggestion-item" data-value="${safeMatch}">${highlighted}</div>`;
    }).join('');
    
    // 移除 hidden class，添加 active class
    suggestionsBox.classList.remove('hidden');
    suggestionsBox.classList.add('active');
    
    // 為建議項添加點擊事件監聽器
    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const value = item.getAttribute('data-value');
            quickSearch(value);
        });
    });
}

function quickSearch(term) {
    if (!term) return;
    
    // 取消任何待執行的建議框彈出
    if (debouncedHandleInput && debouncedHandleInput.cancel) {
        debouncedHandleInput.cancel();
    }
    
    // 僅填充輸入框，不自動執行搜尋
    searchInput.value = term;
    toggleClearBtn(term);
    
    // 隱藏建議框與預設狀態
    suggestionsBox.classList.remove('active');
    suggestionsBox.classList.add('hidden');
    if(defaultState) defaultState.classList.add('hidden');
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
        // 使用精確比較並去除空白，避免「當勞」模糊匹配到「麥當勞」
        return p.merchants.some(m => m.trim().toLowerCase() === query.trim().toLowerCase());
    });

    // if (matches.length === 0) {
    //     const q = query.toLowerCase();
    //     if (['吃', '飯', '餐', '飲', 'food', '咖啡', 'cafe'].some(k => q.includes(k))) {
    //         const diningPlans = plans.filter(p => p.id.includes('dining') || p.id.includes('shopping') || p.id.includes('birthday'));
    //         matches.push(...diningPlans);
    //     }
    //     else if (['旅', '遊', '住', '宿', 'flight', 'hotel', '航', '機票', 'air'].some(k => q.includes(k))) {
    //         const travelPlans = plans.filter(p => p.id.includes('travel'));
    //         matches.push(...travelPlans);
    //     }
    // }

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
    
    // 取得金額輸入框的值（選填）
    const amountInput = document.getElementById('amountInput');
    const amount = amountInput ? parseFloat(amountInput.value) || 0 : 0;

    renderComparison(query, taishinResult, cathayResult, amount);
}

function renderComparison(query, taishin, cathay, amount = 0) {
    resultContainer.classList.remove('hidden');
    
    // Helper to get max rate for comparison
    const getRateValue = (res) => {
        const plan = res.best || res;
        if (!plan || !plan.rate) return 0;
        const nums = plan.rate.match(/[\d.]+/g);
        return nums ? Math.max(...nums.map(n => parseFloat(n))) : 0;
    };

    const tRate = getRateValue(taishin);
    const cRate = getRateValue(cathay);
    
    const taishinCard = renderCard(taishin, 'Taishin', 'taishin-theme', query, amount, tRate > cRate && tRate > 0);
    const cathayCard = renderCard(cathay, 'Cathay Cube', 'cathay-theme', query, amount, cRate > tRate && cRate > 0);

    resultContainer.innerHTML = `
        <div class="result-grid">
            ${taishinCard}
            ${cathayCard}
        </div>
    `;
}

function renderCard(result, bankName, themeClass, query, amount = 0, isBest = false) {
    if (!result || (!result.best && !result.id)) {
        // Fallback Recommendation
        let recommendationHtml = '';
        
        if (bankName === 'Taishin') {
            recommendationHtml = `
            <div class="others-section">
                <div class="others-title">💡 推薦替代方案 (若支援)</div>
                <div class="other-plan-row">
                    <div class="other-name">LINE Pay (Pay著刷)</div>
                    <div class="other-rate">2.3%</div>
                </div>
                 <div class="other-plan-row">
                    <div class="other-name">假日一般消費</div>
                    <div class="other-rate">2%</div>
                </div>
            </div>`;
        } else if (bankName === 'Cathay Cube') {
             recommendationHtml = `
            <div class="others-section">
                 <div class="others-title">💡 一般消費權益</div>
                 <div class="other-plan-row">
                    <div class="other-name">一般消費 (集精選)</div>
                    <div class="other-rate">0.3%</div>
                </div>
            </div>`;
        }

        return `
            <div class="result-card ${themeClass}" style="opacity: 0.85;">
                <div class="card-title-area">
                    <div class="bank-tag">${bankName}</div>
                    <div class="merchant-name">無指定加碼</div>
                </div>
                <div class="strategy-box">
                    <div class="strategy-text">"${query}" 尚無特定方案列出。建議改用一般消費或電子支付。</div>
                </div>
                ${recommendationHtml}
            </div>
        `;
    }

    const plan = result.best || result;
    const others = result.others || [];
    
    // 計算實際回饋金額
    let rewardAmountHtml = '';
    if (amount > 0) {
        const rateValue = (parseFloat(plan.rate.match(/[\d.]+/)) || 0) / 100;
        const rewardAmount = Math.floor(amount * rateValue);
        rewardAmountHtml = `
            <div class="reward-calc-mini">
                <div class="reward-calc-header">預估回饋 (消費 NT$ ${amount.toLocaleString()})</div>
                <div class="reward-calc-body">
                    <div class="reward-calc-amount">NT$ ${rewardAmount.toLocaleString()}</div>
                    <i class="fa-solid fa-coins"></i>
                </div>
            </div>
        `;
    }

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

    const categoryText = plan.id.includes('dining') || plan.id.includes('shopping') || plan.id.includes('birthday') ? '餐飲/購物' : '指定通路';

    const bestBadge = isBest ? `<div class="best-badge"><i class="fa-solid fa-crown"></i> 最佳推薦</div>` : '';

    return `
        <div class="result-card ${themeClass} ${isBest ? 'is-best' : ''}">
            ${bestBadge}
            <div class="card-title-area">
                <div class="bank-tag">${bankName}</div>
                <div class="merchant-name">${plan.name}</div>
            </div>
            
            <div class="rate-container">
                <span class="rate-highlight">${plan.rate.replace('%', '')}</span>
                <span class="rate-unit">%</span>
            </div>
            
            <div class="benefit-badge">
                <i class="fa-solid ${plan.icon}"></i>
                <span>${categoryText}</span>
            </div>

            <div class="strategy-box">
                <div class="strategy-title">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> 刷卡攻略
                </div>
                <div class="strategy-text">${plan.instruction}</div>
            </div>

            ${rewardAmountHtml}
            ${othersHtml}
        </div>
    `;
}

