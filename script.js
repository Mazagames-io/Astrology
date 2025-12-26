/**
 * COSMIC INSIGHTS - RELIABLE WEB ENGINE - V1.1
 */
console.log("Cosmic Engine V1.1 Loaded (Cache Cleared)");

// 1. DATA
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
    { id: 'pisces', name: 'Pisces', dates: 'Feb 19 - Mar 20', element: 'Water', rulingPlanet: 'Neptune', symbol: '♓', personality: 'Affectionate, empathetic, wise, and artistic. Pisces is the most artistic sign.', traits: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle'] }
];

const COMPATIBILITY_MATRIX = {
    'Fire': { 'Fire': 85, 'Air': 90, 'Earth': 50, 'Water': 40 },
    'Air': { 'Fire': 90, 'Air': 85, 'Earth': 60, 'Water': 50 },
    'Earth': { 'Fire': 50, 'Air': 60, 'Earth': 85, 'Water': 90 },
    'Water': { 'Fire': 40, 'Air': 50, 'Earth': 90, 'Water': 85 }
};

// 2. CORE ENGINE
const CosmicApp = {
    currentSignId: null,
    deferredPrompt: null,

    init() {
        console.log("App Initializing...");
        CosmicApp.renderGrid();
        CosmicApp.initForm();
        CosmicApp.setupListeners();
        CosmicApp.showView('home');
        
        // SW
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(e => console.warn(e));
        }
    },

    setupListeners() {
        // Nav Buttons
        const navs = document.querySelectorAll('.nav-item');
        if(navs[0]) navs[0].onclick = () => CosmicApp.showView('home');
        if(navs[1]) navs[1].onclick = () => CosmicApp.showView('compatibility');

        // Form
        const form = document.getElementById('love-form');
        if(form) form.onsubmit = (e) => {
            e.preventDefault();
            CosmicApp.runCompatibility();
        };

        // PWA
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            CosmicApp.deferredPrompt = e;
            const btn = document.getElementById('install-btn');
            if(btn) {
                btn.classList.remove('hidden');
                btn.onclick = () => {
                    CosmicApp.deferredPrompt.prompt();
                    btn.classList.add('hidden');
                };
            }
        });
    },

    showView(id) {
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        const target = document.getElementById(`${id}-view`);
        if(target) target.classList.remove('hidden');

        const navs = document.querySelectorAll('.nav-item');
        navs.forEach(n => n.classList.remove('active'));
        if(id === 'home') navs[0]?.classList.add('active');
        if(id === 'compatibility') navs[1]?.classList.add('active');
        
        window.scrollTo(0,0);
    },

    renderGrid() {
        const grid = document.getElementById('zodiac-grid');
        if(!grid) return;
        grid.innerHTML = '';
        zodiacSigns.forEach(s => {
            const el = document.createElement('div');
            el.className = 'glass-panel zodiac-card';
            el.onclick = () => CosmicApp.showSign(s.id);
            el.innerHTML = `
                <span class="card-symbol">${s.symbol}</span>
                <span class="card-name">${s.name}</span>
                <span class="card-date">${s.dates}</span>
            `;
            grid.appendChild(el);
        });
    },

    showSign(id) {
        const s = zodiacSigns.find(x => x.id === id);
        if(!s) return;
        CosmicApp.currentSignId = id;

        document.getElementById('sign-symbol').textContent = s.symbol;
        document.getElementById('sign-symbol-bg').textContent = s.symbol;
        document.getElementById('sign-name').textContent = s.name;
        document.getElementById('sign-dates').textContent = s.dates;
        document.getElementById('sign-element').textContent = s.element;
        document.getElementById('sign-planet').textContent = s.rulingPlanet;
        document.getElementById('sign-personality').textContent = s.personality;

        const tBox = document.getElementById('sign-traits');
        tBox.innerHTML = '';
        s.traits.forEach(t => {
            const p = document.createElement('span');
            p.className = 'trait-pill';
            p.textContent = t;
            tBox.appendChild(p);
        });

        CosmicApp.showView('sign');
        CosmicApp.getHoroscope('today');
    },

    initForm() {
        const a = document.getElementById('sign-a');
        const b = document.getElementById('sign-b');
        if(!a || !b) return;
        zodiacSigns.forEach(s => {
            a.add(new Option(`${s.symbol} ${s.name}`, s.id));
            b.add(new Option(`${s.symbol} ${s.name}`, s.id));
        });
        b.selectedIndex = 5;
    },

    async getHoroscope(day) {
        const sign = zodiacSigns.find(x => x.id === CosmicApp.currentSignId);
        const caps = sign.name;
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.toLowerCase() === day);
            btn.onclick = () => CosmicApp.getHoroscope(btn.textContent.toLowerCase());
        });

        const loading = document.getElementById('horoscope-loading');
        const content = document.getElementById('horoscope-content');
        const err = document.getElementById('horoscope-error');
        
        loading.classList.remove('hidden');
        content.classList.add('hidden');
        err.classList.add('hidden');

        const url = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${caps}&day=${day}`;
        try {
            let r = await fetch(url);
            if(!r.ok) throw 'error';
            let d = await r.json();
            CosmicApp.renderHoro(d.data.horoscope_data, d.data.date);
        } catch(e) {
            try {
                let px = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
                let j = await px.json();
                let d = JSON.parse(j.contents);
                CosmicApp.renderHoro(d.data.horoscope_data, d.data.date);
            } catch(e2) {
                loading.classList.add('hidden');
                err.classList.remove('hidden');
            }
        }
    },

    renderHoro(txt, dt) {
        document.getElementById('horoscope-loading').classList.add('hidden');
        document.getElementById('horoscope-content').classList.remove('hidden');
        document.getElementById('horoscope-text').textContent = txt;
        document.getElementById('horoscope-date').textContent = dt;
    },

    runCompatibility() {
        const btn = document.getElementById('calc-btn');
        if(!btn) return;
        
        btn.textContent = "Analyzing Stars...";
        btn.disabled = true;

        setTimeout(() => {
            try {
                const sA = zodiacSigns.find(x => x.id === document.getElementById('sign-a').value);
                const sB = zodiacSigns.find(x => x.id === document.getElementById('sign-b').value);
                const base = COMPATIBILITY_MATRIX[sA.element][sB.element] || 70;

                const cats = ['Communication', 'Trust', 'Love', 'Bond', 'Support', 'Values', 'Fun', 'Growth', 'Respect', 'Overall'];
                const seed = sA.id + sB.id;
                let h = 0; for(let i=0; i<seed.length; i++) h = ((h << 5) - h) + seed.charCodeAt(i) | 0;
                const rng = () => { h = (h * 9301 + 49297) % 233280; return h / 233280; };

                const items = cats.map(c => ({ name: c, val: Math.max(30, Math.min(100, Math.round(base + (rng()*40-20)))) }));
                const score = Math.round(items.reduce((a,b)=>a+b.val, 0) / 10);
                items[9].val = score;

                CosmicApp.renderComp(score, items, sA, sB);
            } catch(e) {
                console.error(e);
                alert("The calculation failed.");
            } finally {
                btn.textContent = "Analyze Compatibility";
                btn.disabled = false;
            }
        }, 1000);
    },

    renderComp(score, items, sA, sB) {
        document.getElementById('love-form').classList.add('hidden');
        document.getElementById('results-area').classList.remove('hidden');

        document.getElementById('res-sym-a').textContent = sA.symbol;
        document.getElementById('res-sym-b').textContent = sB.symbol;
        document.getElementById('res-names').textContent = `${sA.name} & ${sB.name}`;
        document.getElementById('res-percent').textContent = `${score}%`;

        const list = document.getElementById('res-breakdown');
        list.innerHTML = '';
        items.slice(0, 9).forEach(i => {
            const d = document.createElement('div');
            d.className = 'bar-container';
            d.innerHTML = `
                <div class="bar-header"><span>${i.name}</span><span>${i.val}%</span></div>
                <div class="progress-track"><div class="progress-fill" style="width: ${i.val}%"></div></div>
            `;
            list.appendChild(d);
        });
        window.scrollTo(0,0);
    }
};

// Global Helper
window.resetCalc = () => {
    document.getElementById('results-area').classList.add('hidden');
    document.getElementById('love-form').classList.remove('hidden');
};

// INITIALIZE
document.addEventListener('DOMContentLoaded', CosmicApp.init);
