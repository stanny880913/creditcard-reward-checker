if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('SW registred!', reg))
            .catch(err => console.log('SW failed', err));
    });
}

// Data loaded from data.js

// Combine for Keywords (cleaned up to exclude parenthetical notes for suggestions)
const allKeywords = [...new Set([
    ...taishinPlans.flatMap(p => p.merchants),
    ...cathayPlans.flatMap(p => p.merchants),
    ...yushanPlans.flatMap(p => p.merchants)
].map(m => {
    // 移除括號備註
    let clean = m.includes('(') ? m.split('(')[0].trim() : m;
    
    // 標準化常見的重複項目 (別名縮減)
    // 如果商家名包含 "momo購物網"，我們統一在下拉選單顯示 "momo" 即可
    // 這樣資料庫可以存不同的名字，但下拉選單不會重複
    if (clean.toLowerCase() === 'momo購物網') return 'momo';
    if (clean.toLowerCase() === 'pchome線上購物') return 'PChome';
    if (clean.toLowerCase() === 'youtube premium') return 'YouTube';
    
    return clean;
}))].sort((a, b) => a.localeCompare(b, 'zh-Hant'));

// DOM Elements
const searchInput = document.getElementById('merchantInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const suggestionsBox = document.getElementById('suggestions');
const resultContainer = document.getElementById('resultContainer');
const defaultState = document.getElementById('defaultState');

// Card Visibility Logic
const toggles = {
    taishin: document.getElementById('have-taishin'),
    cathay: document.getElementById('have-cathay'),
    yushan: document.getElementById('have-yushan')
};

// Load saved preferences
function loadPreferences() {
    const prefs = JSON.parse(localStorage.getItem('cardPreferences') || '{}');
    Object.keys(toggles).forEach(key => {
        if (prefs[key] !== undefined) {
            toggles[key].checked = prefs[key];
        }
    });
}

function savePreferences() {
    const prefs = {};
    Object.keys(toggles).forEach(key => {
        prefs[key] = toggles[key].checked;
    });
    localStorage.setItem('cardPreferences', JSON.stringify(prefs));
    // Re-render if there's a result
    if (searchInput.value) {
        performSearch(searchInput.value);
    }
}

// Attach listeners to toggles
Object.values(toggles).forEach(toggle => {
    toggle.addEventListener('change', savePreferences);
});

loadPreferences();

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
    
    // 填充輸入框並自動執行搜尋
    searchInput.value = term;
    toggleClearBtn(term);
    
    // 隱藏建議框與預設狀態
    suggestionsBox.classList.remove('active');
    suggestionsBox.classList.add('hidden');
    if(defaultState) defaultState.classList.add('hidden');

    performSearch(term);
    searchInput.blur(); // 收起手機鍵盤
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
        const normalizedQ = query.trim().toLowerCase();
        if (p.exclusions && p.exclusions.some(ex => normalizedQ.includes(ex.toLowerCase()))) {
            return false;
        }
        
        // 優先精確匹配，或是匹配括號前的名稱（解決「蝦皮 (不含...)」的問題）
        return p.merchants.some(m => {
            const normalizedM = m.trim().toLowerCase();
            const baseM = normalizedM.includes('(') ? normalizedM.split('(')[0].trim() : normalizedM;
            
            // 1. 精確匹配
            if (baseM === normalizedQ) return true;
            
            // 2. 雙向包含匹配 (解決 "momo" vs "momo購物網" 的問題)
            // 修改：如果是 2 位數的純英文/數字，限制必須是開頭匹配，避免 "DE" 匹配到 "Claude"
            if (normalizedQ.length >= 2) {
                const isShortAlpha = /^[a-z0-9]+$/.test(normalizedQ) && normalizedQ.length === 2;
                
                if (isShortAlpha) {
                    // 短英文/數字：限開頭匹配 (例如 "AP" 匹配 "Apple") 或 商家名包含英文單字開頭
                    if (baseM.startsWith(normalizedQ) || baseM.includes(' ' + normalizedQ)) return true;
                } else {
                    // 一般情況：
                    // 1. Merchant 包含 Query (最常見)
                    if (baseM.includes(normalizedQ)) return true;
                    
                    // 2. Query 包含 Merchant (反向搜索，如 "momo購物網" 找 "momo")
                    if (normalizedQ.includes(baseM)) {
                        // 針對純 ASCII (英文/數字) 的 Merchant 名稱進行邊界檢查
                        // 防止 "ok" 匹配 "booking", "net" 匹配 "netflix"
                        const isAscii = /^[\x00-\x7F]+$/.test(baseM);
                        if (isAscii) {
                            try {
                                const escapedBaseM = baseM.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                const boundaryRegex = new RegExp(`\\b${escapedBaseM}\\b`, 'i');
                                return boundaryRegex.test(normalizedQ);
                            } catch (e) {
                                return true;
                            }
                        }
                        // 非 ASCII (中文)，直接允許包含匹配
                        return true;
                    }
                }
            }
            
            return false;
        });
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
    const yushanResult = findMatchingPlans(yushanPlans, query);
    
    renderComparison(query, taishinResult, cathayResult, yushanResult);
}

function renderComparison(query, taishin, cathay, yushan) {
    resultContainer.classList.remove('hidden');
    
    // Check which cards user has
    const hasTaishin = toggles.taishin.checked;
    const hasCathay = toggles.cathay.checked;
    const hasYushan = toggles.yushan.checked;

    // Helper to get max rate for comparison
    const getRateValue = (res) => {
        const plan = res.best || res;
        if (!plan || !plan.rate) return 0;
        const nums = plan.rate.match(/[\d.]+/g);
        return nums ? Math.max(...nums.map(n => parseFloat(n))) : 0;
    };

    // Calculate rates only for cards the user HAS
    const tRate = hasTaishin ? getRateValue(taishin) : -1;
    const cRate = hasCathay ? getRateValue(cathay) : -1;
    const yRate = hasYushan ? getRateValue(yushan) : -1;
    
    // Determine best rate among ACTIVE cards
    const maxRate = Math.max(tRate, cRate, yRate);

    const cards = [];
    
    if (hasTaishin) {
        cards.push({ 
            html: renderCard(taishin, '台新信用卡', 'taishin-theme', query, tRate === maxRate && tRate > 0),
            rate: tRate 
        });
    }
    
    if (hasCathay) {
        cards.push({ 
            html: renderCard(cathay, '國泰Cube', 'cathay-theme', query, cRate === maxRate && cRate > 0),
            rate: cRate 
        });
    }
    
    if (hasYushan) {
        cards.push({ 
            html: renderCard(yushan, '玉山Unicard', 'yushan-theme', query, yRate === maxRate && yRate > 0),
            rate: yRate 
        });
    }

    // 從高到低排序
    cards.sort((a, b) => b.rate - a.rate);

    if (cards.length === 0) {
        resultContainer.innerHTML = `
            <div class="no-cards-msg">
                <i class="fa-solid fa-circle-info"></i>
                <p>請先在上方設定您持有的信用卡</p>
            </div>
        `;
        return;
    }

    resultContainer.innerHTML = `
        <div class="result-grid">
            ${cards.map(c => c.html).join('')}
        </div>
        ${cards.length > 1 ? `
        <div class="scroll-hint">
            <i class="fa-solid fa-arrows-left-right"></i> 左右滑動比較更多卡片
        </div>` : ''}
    `;
}

function renderCard(result, bankName, themeClass, query, isBest = false) {
    if (!result || (!result.best && !result.id)) {
        // Fallback Recommendation
        let recommendationHtml = '';
        
        if (bankName === '台新信用卡') {
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
        } else if (bankName === '國泰Cube') {
             recommendationHtml = `
            <div class="others-section">
                 <div class="others-title">💡 一般消費權益</div>
                 <div class="other-plan-row">
                    <div class="other-name">一般消費 (未選定加碼方案)</div>
                    <div class="other-rate">0.3%</div>
                </div>
            </div>`;
        } else if (bankName === '玉山Unicard') {
             recommendationHtml = `
            <div class="others-section">
                 <div class="others-title">💡 一般消費權益</div>
                 <div class="other-plan-row">
                    <div class="other-name">一般消費 (UP方案)</div>
                    <div class="other-rate">1%</div>
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
    
    // 找出匹配的通路是否有括號備註
    const matchedMerchant = plan.merchants.find(m => {
        const normalizedM = m.trim().toLowerCase();
        const normalizedQ = query.trim().toLowerCase();
        return normalizedM === normalizedQ || (normalizedM.includes('(') && normalizedM.split('(')[0].trim() === normalizedQ);
    });

    let merchantNoteHtml = '';
    if (matchedMerchant && matchedMerchant.includes('(')) {
        const noteMatch = matchedMerchant.match(/\(([^)]+)\)/);
        if (noteMatch) {
            merchantNoteHtml = `
                <div class="merchant-note">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>${noteMatch[1]}</span>
                </div>
            `;
        }
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

    const categoryText = 
        plan.id.includes('dining') || 
        plan.id.includes('shopping') || 
        plan.id.includes('birthday') ||
        plan.id.includes('department') ||
        plan.id.includes('ec') ||
        plan.id.includes('mobile_pay')
        ? '餐飲/中心/電商' : '指定通路';

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

            ${merchantNoteHtml}

            ${othersHtml}
        </div>
    `;
}

