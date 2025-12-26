/**
 * COSMIC INSIGHTS - VERSION 2.1 (FIXED VIEW ENGINE)
 */
console.log("Cosmic Engine 2.1: Loading...");

const ZODIAC_DATA = [
    { id: 'aries', name: 'Aries', dates: 'Mar 21 - Apr 19', element: 'Fire', planet: 'Mars', symbol: '♈', desc: 'Eager, dynamic, quick, and competitive.' },
    { id: 'taurus', name: 'Taurus', dates: 'Apr 20 - May 20', element: 'Earth', planet: 'Venus', symbol: '♉', desc: 'Strong, dependable, sensual, and creative.' },
    { id: 'gemini', name: 'Gemini', dates: 'May 21 - Jun 20', element: 'Air', planet: 'Mercury', symbol: '♊', desc: 'Versatile, expressive, inquisitive, and kind.' },
    { id: 'cancer', name: 'Cancer', dates: 'Jun 21 - Jul 22', element: 'Water', planet: 'Moon', symbol: '♋', desc: 'Intuitive, sentimental, compassionate, and protective.' },
    { id: 'leo', name: 'Leo', dates: 'Jul 23 - Aug 22', element: 'Fire', planet: 'Sun', symbol: '♌', desc: 'Dramatic, outgoing, fiery, and self-assured.' },
    { id: 'virgo', name: 'Virgo', dates: 'Aug 23 - Sep 22', element: 'Earth', planet: 'Mercury', symbol: '♍', desc: 'Practical, loyal, gentle, and analytical.' },
    { id: 'libra', name: 'Libra', dates: 'Sep 23 - Oct 22', element: 'Air', planet: 'Venus', symbol: '♎', desc: 'Social, fair-minded, diplomatic, and gracious.' },
    { id: 'scorpio', name: 'Scorpio', dates: 'Oct 23 - Nov 21', element: 'Water', planet: 'Pluto', symbol: '♏', desc: 'Resourceful, brave, passionate, and mysterious.' },
    { id: 'sagittarius', name: 'Sagittarius', dates: 'Nov 22 - Dec 21', element: 'Fire', planet: 'Jupiter', symbol: '♐', desc: 'Generous, idealistic, and adventurous.' },
    { id: 'capricorn', name: 'Capricorn', dates: 'Dec 22 - Jan 19', element: 'Earth', planet: 'Saturn', symbol: '♑', desc: 'Responsible, disciplined, and self-controlled.' },
    { id: 'aquarius', name: 'Aquarius', dates: 'Jan 20 - Feb 18', element: 'Air', planet: 'Uranus', symbol: '♒', desc: 'Deep, imaginative, original, and uncompromising.' },
    { id: 'pisces', name: 'Pisces', dates: 'Feb 19 - Mar 20', element: 'Water', planet: 'Neptune', symbol: '♓', desc: 'Affectionate, empathetic, wise, and artistic.' }
];

const COMPAT_MATRIX = {
    'Fire': { 'Fire': 85, 'Air': 90, 'Earth': 50, 'Water': 40 },
    'Air': { 'Fire': 90, 'Air': 85, 'Earth': 60, 'Water': 50 },
    'Earth': { 'Fire': 50, 'Air': 60, 'Earth': 85, 'Water': 90 },
    'Water': { 'Fire': 40, 'Air': 50, 'Earth': 90, 'Water': 85 }
};

window.Cosmic = {
    currentID: null,
    deferredPrompt: null,

    init() {
        console.log("Initializing UI...");
        this.renderGrid();
        this.initDropdowns();
        this.setupPWA();
        // Force navigate to home to ensure it's visible
        this.navigate('home');
        console.log("System Ready.");
    },

    navigate(view) {
        console.log("Navigating to:", view);
        // Hide all views using both 'active' removal and 'hidden' addition for safety
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active');
            v.classList.add('hidden');
        });
        
        // Show target view
        const target = document.getElementById(`${view}-view`);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }

        // Update Bottom Nav
        document.querySelectorAll('.nav-item').forEach(n => {
            const isTarget = n.textContent.trim().toLowerCase().includes(view === 'compatibility' ? 'love' : 'zodiac');
            n.classList.toggle('active', isTarget);
        });

        window.scrollTo(0,0);
    },

    renderGrid() {
        const grid = document.getElementById('zodiac-grid');
        if (!grid) return;
        grid.innerHTML = ZODIAC_DATA.map(s => `
            <div class="glass-panel zodiac-card" onclick="Cosmic.openSign('${s.id}')">
                <span class="card-symbol">${s.symbol}</span>
                <span class="card-name">${s.name}</span>
                <p class="card-date">${s.dates}</p>
            </div>
        `).join('');
    },

    openSign(id) {
        const s = ZODIAC_DATA.find(x => x.id === id);
        if (!s) return;
        this.currentID = id;

        // Populate details
        const els = {
            'sign-symbol': s.symbol,
            'sign-name': s.name,
            'sign-dates': s.dates,
            'sign-personality': s.desc,
            'sign-element': s.element,
            'sign-planet': s.planet
        };

        for (let id in els) {
            const el = document.getElementById(id);
            if (el) el.innerText = els[id];
        }

        this.navigate('sign');
        this.getHoro('today');
    },

    async getHoro(day) {
        if (!this.currentID) return;
        const s = ZODIAC_DATA.find(x => x.id === this.currentID);
        
        const l = document.getElementById('horoscope-loading');
        const c = document.getElementById('horoscope-content');
        const e = document.getElementById('horoscope-error');
        const t = document.getElementById('horoscope-title');
        
        if (l) l.classList.remove('hidden'); 
        if (c) c.classList.add('hidden'); 
        if (e) e.classList.add('hidden');
        if (t) t.innerText = day.toUpperCase() + "'s Reading";

        // Tab UI
        document.querySelectorAll('.tab-btn').forEach(b => {
             b.classList.toggle('active', b.innerText.toLowerCase() === day);
        });

        const url = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${s.name}&day=${day}`;
        try {
            const r = await fetch(url);
            const d = await r.json();
            this.showHoro(d.data.horoscope_data, d.data.date);
        } catch(ex) {
            try {
                const px = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
                const j = await px.json();
                const d = JSON.parse(j.contents);
                this.showHoro(d.data.horoscope_data, d.data.date);
            } catch(ex2) {
                if (l) l.classList.add('hidden'); 
                if (e) e.classList.remove('hidden');
            }
        }
    },

    showHoro(text, date) {
        const l = document.getElementById('horoscope-loading');
        const c = document.getElementById('horoscope-content');
        const txtEl = document.getElementById('horoscope-text');
        const dateEl = document.getElementById('horoscope-date');
        
        if (l) l.classList.add('hidden');
        if (c) c.classList.remove('hidden');
        if (txtEl) txtEl.innerText = text;
        if (dateEl) dateEl.innerText = date;
    },

    initDropdowns() {
        const a = document.getElementById('sign-a');
        const b = document.getElementById('sign-b');
        if (!a || !b) return;
        
        a.innerHTML = ''; b.innerHTML = '';
        ZODIAC_DATA.forEach(s => {
            a.add(new Option(`${s.symbol} ${s.name}`, s.id));
            b.add(new Option(`${s.symbol} ${s.name}`, s.id));
        });
        b.selectedIndex = 4;
    },

    calculate() {
        const btn = document.getElementById('calc-btn');
        if (!btn) return;
        btn.innerText = "Consulting Stars..."; 
        btn.disabled = true;

        setTimeout(() => {
            const sA = ZODIAC_DATA.find(x => x.id === document.getElementById('sign-a').value);
            const sB = ZODIAC_DATA.find(x => x.id === document.getElementById('sign-b').value);
            
            const base = COMPAT_MATRIX[sA.element][sB.element] || 75;
            const score = Math.max(40, Math.min(100, Math.round(base + (Math.random() * 20 - 10))));

            document.getElementById('love-form').classList.add('hidden');
            document.getElementById('results-area').classList.remove('hidden');
            
            document.getElementById('res-sym-a').innerText = sA.symbol;
            document.getElementById('res-sym-b').innerText = sB.symbol;
            document.getElementById('res-names').innerText = `${sA.name} & ${sB.name}`;
            document.getElementById('res-percent').innerText = `${score}%`;
            
            const list = document.getElementById('res-breakdown');
            const cats = ['Communication', 'Trust', 'Bond', 'Support', 'Values'];
            list.innerHTML = cats.map(c => `
                <div class="bar-container">
                    <div class="bar-header"><span>${c}</span><span>${Math.round(score - 5 + Math.random()*10)}%</span></div>
                    <div class="progress-track"><div class="progress-fill" style="width: ${score}%"></div></div>
                </div>
            `).join('');

            btn.innerText = "Analyze Compatibility"; 
            btn.disabled = false;
            window.scrollTo(0,0);
        }, 1200);
    },

    reset() {
        document.getElementById('results-area').classList.add('hidden');
        document.getElementById('love-form').classList.remove('hidden');
    },

    setupPWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(e => console.warn(e));
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            const btn = document.getElementById('install-btn');
            if (btn) {
                btn.classList.remove('hidden');
                btn.onclick = () => {
                    this.deferredPrompt.prompt();
                    btn.classList.add('hidden');
                };
            }
        });
    }
};

// Start application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Cosmic.init());
} else {
    Cosmic.init();
}
