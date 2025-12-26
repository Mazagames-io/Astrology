/**
 * PWA: SERVICE WORKER & INSTALLATION
 */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => console.log('Service Worker Registered'));
}

let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        installBtn.classList.add('hidden');
    }
    deferredPrompt = null;
});

/**
 * DATA: ZODIAC SIGNS
 */
const zodiacSigns = [
    { id: 'aries', name: 'Aries', dates: 'Mar 21 - Apr 19', element: 'Fire', rulingPlanet: 'Mars', symbol: '♈', personality: 'Eager, dynamic, quick, and competitive. Aries is the pioneer and creates new paths.', traits: ['Courageous', 'Determined', 'Confident', 'Enthusiastic'] },
    { id: 'taurus', name: 'Taurus', dates: 'Apr 20 - May 20', element: 'Earth', rulingPlanet: 'Venus', symbol: '♉', personality: 'Strong, dependable, sensual, and creative. Taurus loves the finer things in life.', traits: ['Reliable', 'Patient', 'Practical', 'Devoted'] },
    { id: 'gemini', name: 'Gemini', dates: 'May 21 - Jun 20', element: 'Air', rulingPlanet: 'Mercury', symbol: '♊', personality: 'Versatile, expressive, inquisitive, and kind. Gemini is intellectually curious.', traits: ['Gentle', 'Affectionate', 'Curious', 'Adaptable'] },
    { id: 'cancer', name: 'Cancer', dates: 'Jun 21 - Jul 22', element: 'Water', rulingPlanet: 'Moon', symbol: '♋', personality: 'Intuitive, sentimental, compassionate, and protective. Cancer cares deeply about family.', traits: ['Tenacious', 'Imaginative', 'Loyal', 'Emotional'] },
    { id: 'leo', name: 'Leo', dates: 'Jul 23 - Aug 22', element: 'Fire', rulingPlanet: 'Sun', symbol: '♌', personality: 'Dramatic, outgoing, fiery, and self-assured. Leo loves to be center stage.', traits: ['Creative', 'Passionate', 'Generous', 'Cheerful'] },
    { id: 'virgo', name: 'Virgo', dates: 'Aug 23 - Sep 22', element: 'Earth', rulingPlanet: 'Mercury', symbol: '♍', personality: 'Practical, loyal, gentle, and analytical. Virgo is hardworking and detail-oriented.', traits: ['Loyal', 'Analytical', 'Kind', 'Hardworking'] },
    { id: 'libra', name: 'Libra', dates: 'Sep 23 - Oct 22', element: 'Air', rulingPlanet: 'Venus', symbol: '♎', personality: 'Social, fair-minded, diplomatic, and gracious. Libra seeks balance and harmony.', traits: ['Cooperative', 'Diplomatic', 'Gracious', 'Fair-minded'] },
    { id: 'scorpio', name: 'Scorpio', dates: 'Oct 23 - Nov 21', element: 'Water', rulingPlanet: 'Pluto', symbol: '♏', personality: 'Resourceful, brave, passionate, and a true friend. Scorpio is deep and mysterious.', traits: ['Resourceful', 'Brave', 'Passionate', 'Stubborn'] },
    { id: 'sagittarius', name: 'Sagittarius', dates: 'Nov 22 - Dec 21', element: 'Fire', rulingPlanet: 'Jupiter', symbol: '♐', personality: 'Generous, idealistic, and great sense of humor. Sagittarius loves travel.', traits: ['Generous', 'Idealistic', 'Funny'] },
    { id: 'capricorn', name: 'Capricorn', dates: 'Dec 22 - Jan 19', element: 'Earth', rulingPlanet: 'Saturn', symbol: '♑', personality: 'Responsible, disciplined, and self-controlled. Capricorn is a master of self-control.', traits: ['Responsible', 'Disciplined', 'Self-control'] },
    { id: 'aquarius', name: 'Aquarius', dates: 'Jan 20 - Feb 18', element: 'Air', rulingPlanet: 'Uranus', symbol: '♒', personality: 'Deep, imaginative, original, and uncompromising. Aquarius is a forward-thinker.', traits: ['Progressive', 'Original', 'Independent'] },
    { id: 'pisces', name: 'Pisces', dates: 'Feb 19 - Mar 20', element: 'Water', rulingPlanet: 'Neptune', symbol: '♓', personality: 'Affectionate, empathetic, wise, and artistic. Pisces is the most artistic sign.', traits: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle'] },
];

const COMPATIBILITY_MATRIX = {
    'Fire': { 'Fire': 85, 'Air': 90, 'Earth': 50, 'Water': 40 },
    'Air': { 'Fire': 90, 'Air': 85, 'Earth': 60, 'Water': 50 },
    'Earth': { 'Fire': 50, 'Air': 60, 'Earth': 85, 'Water': 90 },
    'Water': { 'Fire': 40, 'Air': 50, 'Earth': 90, 'Water': 85 },
};

/**
 * APP ROUTER
 */
const router = {
    views: ['home', 'sign-details', 'compatibility'],
    currentSignId: null,

    navigate(viewName, params = {}) {
        // 1. Update Navigation UI
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
        if (viewName === 'home') document.querySelectorAll('.nav-item')[0].classList.add('active');
        if (viewName === 'compatibility') document.querySelectorAll('.nav-item')[1].classList.add('active');

        // 2. Hide all views
        document.querySelectorAll('.view').forEach(el => {
            el.classList.remove('active');
            el.classList.add('hidden');
        });

        // 3. Show target view
        const target = document.getElementById(viewName === 'sign-details' ? 'sign-view' : `${viewName}-view`);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }

        // 4. Specific Logic
        if (viewName === 'home') {
             renderLogic.renderZodiacGrid();
             window.scrollTo(0, 0);
        } else if (viewName === 'sign-details' && params.id) {
            this.currentSignId = params.id;
            renderLogic.renderSignDetails(params.id);
            horoscopeManager.init(params.id);
            window.scrollTo(0, 0);
        } else if (viewName === 'compatibility') {
            renderLogic.initCompatibilityForm();
        }
    }
};

/**
 * RENDER LOGIC
 */
const renderLogic = {
    renderZodiacGrid() {
        const grid = document.getElementById('zodiac-grid');
        grid.innerHTML = '';
        zodiacSigns.forEach(sign => {
            const card = document.createElement('div');
            card.className = 'glass-panel zodiac-card';
            card.onclick = () => router.navigate('sign-details', { id: sign.id });
            card.innerHTML = `
                <span class="card-symbol">${sign.symbol}</span>
                <span class="card-name">${sign.name}</span>
                <span class="card-date">${sign.dates}</span>
            `;
            grid.appendChild(card);
        });
    },

    renderSignDetails(id) {
        const sign = zodiacSigns.find(s => s.id === id);
        if (!sign) return;

        document.getElementById('sign-symbol').textContent = sign.symbol;
        document.getElementById('sign-symbol-bg').textContent = sign.symbol;
        document.getElementById('sign-name').textContent = sign.name;
        document.getElementById('sign-dates').textContent = sign.dates;
        document.getElementById('sign-element').textContent = sign.element;
        document.getElementById('sign-planet').textContent = sign.rulingPlanet;
        document.getElementById('sign-personality').textContent = sign.personality;

        const traitsContainer = document.getElementById('sign-traits');
        traitsContainer.innerHTML = '';
        sign.traits.forEach(t => {
            const span = document.createElement('span');
            span.className = 'trait-pill';
            span.textContent = t;
            traitsContainer.appendChild(span);
        });
    },

    initCompatibilityForm() {
        const selA = document.getElementById('sign-a');
        const selB = document.getElementById('sign-b');
        // Only populate if empty to preserve selection
        if (selA.options.length === 0) {
            zodiacSigns.forEach(s => {
                const optA = new Option(`${s.symbol} ${s.name}`, s.id);
                const optB = new Option(`${s.symbol} ${s.name}`, s.id);
                selA.add(optA);
                selB.add(optB);
            });
            selB.selectedIndex = 4; // Default selection offset
        }
    }
};

/**
 * HOROSCOPE MANAGER (Triple Redundancy + Proxy Support)
 */
const horoscopeManager = {
    currentDay: 'today',
    signId: null,

    init(signId) {
        horoscopeManager.signId = signId;
        horoscopeManager.setDay('today');
    },

    setDay(day) {
        horoscopeManager.currentDay = day;
        // Update UI Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase() === day);
        });
        
        const titleEl = document.getElementById('horoscope-title');
        if (titleEl) titleEl.textContent = `${day.charAt(0).toUpperCase() + day.slice(1)}'s Horoscope`;
        horoscopeManager.fetchHoroscope();
    },

    async fetchHoroscope(retry = false) {
        const contentDiv = document.getElementById('horoscope-content');
        const loadingDiv = document.getElementById('horoscope-loading');
        const errorDiv = document.getElementById('horoscope-error');

        if (!contentDiv || !loadingDiv || !errorDiv) return;

        contentDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
        loadingDiv.classList.remove('hidden');

        try {
            const sign = zodiacSigns.find(s => s.id === horoscopeManager.signId);
            if (!sign) return;

            const capsSign = sign.name.charAt(0).toUpperCase() + sign.name.slice(1);
            const lowerSign = sign.name.toLowerCase();
            
            const proxies = [
                (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
                (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`
            ];

            const primaryUrl = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${capsSign}&day=${horoscopeManager.currentDay}`;
            
            // Try direct
            try {
                let res = await fetch(primaryUrl);
                if (res.ok) {
                    let data = await res.json();
                    horoscopeManager.renderSuccess(data.data.horoscope_data, data.data.date);
                    return;
                }
            } catch (e) {
                console.warn("Direct primary failed, trying proxies...");
                for (let proxy of proxies) {
                    try {
                        let res = await fetch(proxy(primaryUrl));
                        if (!res.ok) continue;
                        let json = await res.json();
                        let data = json;
                        if (json.contents) {
                             data = typeof json.contents === 'string' ? JSON.parse(json.contents) : json.contents;
                        }
                        if (data && data.data && data.data.horoscope_data) {
                            horoscopeManager.renderSuccess(data.data.horoscope_data, data.data.date);
                            return;
                        }
                    } catch (errP) { }
                }
            }

            // Secondary: Ohmanda
            const ohmandaUrl = `https://ohmanda.com/api/horoscope/${lowerSign}`;
            for (let proxy of proxies) {
                try {
                    let res = await fetch(proxy(ohmandaUrl));
                    if (!res.ok) continue;
                    let json = await res.json();
                    let data = json;
                    if (json.contents) {
                        data = typeof json.contents === 'string' ? JSON.parse(json.contents) : json.contents;
                    }
                    if (data && data.horoscope) {
                        horoscopeManager.renderSuccess(data.horoscope, data.date);
                        return;
                    }
                } catch (errO) { }
            }

            throw new Error("All APIs failed");

        } catch (err) {
            console.error("Horoscope Fetch error:", err);
            loadingDiv.classList.add('hidden');
            errorDiv.classList.remove('hidden');
        }
    },

    renderSuccess(text, date) {
        const loading = document.getElementById('horoscope-loading');
        const content = document.getElementById('horoscope-content');
        const textEl = document.getElementById('horoscope-text');
        const dateEl = document.getElementById('horoscope-date');
        
        if (loading) loading.classList.add('hidden');
        if (content) content.classList.remove('hidden');
        if (textEl) textEl.textContent = text;
        if (dateEl) dateEl.textContent = `Date: ${date}`;
    }
};

/**
 * COMPATIBILITY MANAGER
 */
const compatibilityManager = {
    calculate(e) {
        if (e) e.preventDefault();
        
        const signAel = document.getElementById('sign-a');
        const genderAel = document.getElementById('gender-a');
        const signBel = document.getElementById('sign-b');
        const genderBel = document.getElementById('gender-b');
        
        if (!signAel || !signBel) return;

        const signA = signAel.value;
        const genderA = genderAel.value;
        const signB = signBel.value;
        const genderB = genderBel.value;

        const btn = document.getElementById('calc-btn');
        if (!btn) return;

        const originalText = btn.textContent;
        btn.textContent = "Analyzing Stars...";
        btn.disabled = true;

        setTimeout(() => {
            try {
                const result = compatibilityManager.computeLogic(signA, signB, genderA, genderB);
                compatibilityManager.renderResult(result, signA, signB);
            } catch (err) {
                console.error("Computation failed:", err);
                alert("The stars are misaligned. Please try again.");
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        }, 800);
    },

    computeLogic(signA, signB, genderA, genderB) {
        const sA = zodiacSigns.find(s => s.id === signA);
        const sB = zodiacSigns.find(s => s.id === signB);
        
        if (!sA || !sB) throw new Error("Invalid signs");

        const baseScore = COMPATIBILITY_MATRIX[sA.element][sB.element] || 70;

        const seedStr = signA + signB + genderA + genderB;
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) hash = ((hash << 5) - hash) + seedStr.charCodeAt(i) | 0;
        const rng = () => { hash = (hash * 9301 + 49297) % 233280; return hash / 233280; };

        const categories = [
            'Communication', 'Trust & Respect', 'Emotional Connection', 
            'Long-term Commitment', 'Friendship & Fun', 'Support & Growth', 
            'Conflict Handling', 'Values & Ethics', 'Healthy Boundaries',
            'Overall Compatibility'
        ];

        const breakdown = categories.map(cat => {
            const variance = (rng() * 30) - 15;
            let score = Math.round(baseScore + variance);
            return { category: cat, score: Math.max(25, Math.min(100, score)) };
        });

        const avg = Math.round(breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length);
        const overallIdx = breakdown.findIndex(b => b.category === 'Overall Compatibility');
        if (overallIdx !== -1) breakdown[overallIdx].score = avg;

        let summary = "A solid connection with great potential.";
        if (avg > 85) summary = "A rare and beautiful cosmic alignment! You are perfectly in sync.";
        else if (avg > 70) summary = "Very strong compatibility. Your signs harmonize naturally.";
        else if (avg > 50) summary = "Balanced. You have strengths that complement each other's weaknesses.";
        else summary = "A challenging match, but deep growth is possible through understanding.";

        return { overall: avg, breakdown, summary };
    },

    renderResult(result, idA, idB) {
        const form = document.getElementById('love-form');
        const area = document.getElementById('results-area');
        if (!form || !area) return;

        form.classList.add('hidden');
        area.classList.remove('hidden');

        const sA = zodiacSigns.find(s => s.id === idA);
        const sB = zodiacSigns.find(s => s.id === idB);

        document.getElementById('res-sym-a').textContent = sA.symbol;
        document.getElementById('res-sym-b').textContent = sB.symbol;
        document.getElementById('res-names').textContent = `${sA.name} & ${sB.name}`;
        document.getElementById('res-percent').textContent = `${result.overall}%`;
        document.getElementById('res-summary').textContent = result.summary;

        const list = document.getElementById('res-breakdown');
        if (list) {
            list.innerHTML = '';
            result.breakdown.forEach(item => {
                const row = document.createElement('div');
                row.className = 'bar-container';
                row.innerHTML = `
                    <div class="bar-header"><span>${item.category}</span><span>${item.score}%</span></div>
                    <div class="progress-track"><div class="progress-fill" style="width: ${item.score}%"></div></div>
                `;
                list.appendChild(row);
            });
        }

        window.scrollTo(0,0);
    },

    reset() {
        const area = document.getElementById('results-area');
        const form = document.getElementById('love-form');
        if (area) area.classList.add('hidden');
        if (form) form.classList.remove('hidden');
    }
};

// Global Exposure
window.router = router;
window.renderLogic = renderLogic;
window.horoscopeManager = horoscopeManager;
window.compatibilityManager = compatibilityManager;

// Start App
document.addEventListener('DOMContentLoaded', () => {
    router.navigate('home');
});
