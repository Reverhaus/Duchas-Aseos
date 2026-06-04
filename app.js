// ========== CONFIGURACIÓN INICIAL ==========
let DB = {};
let func = 5;
let sort = 'priority';
let allData = { done: {}, poo: {} };

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DAY_MAP = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const STORAGE_KEY = 'aseo_progress_v10';

// ========== DOM ELEMENTS ==========
const $ = (id) => document.getElementById(id);

// ========== FUNCIONES DE CARGA ==========
async function loadResidents() {
    try {
        const basePath = window.location.pathname.includes('Duchas-Aseos') ? '/Duchas-Aseos' : '';
        const response = await fetch(basePath + '/residentes.json');
        if (!response.ok) throw new Error('HTTP ' + response.status);
        DB = await response.json();
        console.log('✅ Residentes cargados:', Object.keys(DB).length, 'funciones');
        render();
    } catch (error) {
        console.error('❌ Error cargando residentes:', error);
        alert('Error: ' + error.message);
    }
}

function loadAllData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            allData = JSON.parse(saved);
            if (!allData.done) allData.done = {};
            if (!allData.poo) allData.poo = {};
        }
    } catch (e) {
        allData = { done: {}, poo: {} };
    }
}

function saveAllData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    } catch (e) {
        console.error('Error guardando datos:', e);
    }
}

// ========== FUNCIONES DE DATOS ==========
function getDoneSet() {
    return new Set(allData.done[func] || []);
}

function getPooSet() {
    return new Set(allData.poo[func] || []);
}

function setDoneSet(set) {
    allData.done[func] = [...set];
}

function setPooSet(set) {
    allData.poo[func] = [...set];
}

function clearData() {
    if (confirm('¿BORRAR TODO EL PROGRESO?')) {
        localStorage.removeItem(STORAGE_KEY);
        allData = { done: {}, poo: {} };
        render();
    }
}

// ========== FUNCIONES DE UI ==========
function toggleMenu(id) {
    const menu = $(id);
    menu.classList.toggle('open');
}

function toggleCompletedSection() {
    const section = $('completed-section');
    const icon = $('completed-toggle-icon');
    section.classList.toggle('hidden');
    icon.textContent = section.classList.contains('hidden') ? '👁️' : '🔽';
}

function setFunc(f) {
    saveAllData();
    func = f;
    [5, 6, 8, 9].forEach(n => {
        const btn = $(`btn-${n}`);
        btn.className = `py-3 brutal-btn ${n === f ? 'btn-primary' : 'bg-gray-100'}`;
        if (n !== f) btn.style.color = 'var(--border-color)';
    });
    render();
}

function setSort(s) {
    sort = s;
    ['priority', 'shower', 'room', 'alpha'].forEach(t => {
        const btn = $(`sort-${t}`);
        btn.className = `brutal-btn ${t === s ? 'btn-accent' : 'bg-white'}`;
        if (t !== s) btn.style.color = 'var(--border-color)';
    });
    render();
}

// ========== FUNCIONES DE TARJETAS ==========
function createCard(p, isDone, day) {
    const showerToday = p.days.includes(day);
    const hasPoo = getPooSet().has(p.id);

    const div = document.createElement('div');
    div.className = `card brutal-border p-3 flex items-center gap-3 ${isDone ? 'completed-card' : ''} ${p.p === 1 ? 'priority-top' : p.p === 2 ? 'priority-meal' : 'priority-normal'}`;
    div.id = `card-${p.id}`;
    div.style.position = 'relative';
    div.style.overflow = 'hidden';
    div.style.cursor = 'grab';
    div.style.touchAction = 'pan-y';
    div.style.userSelect = 'none';

    // Badge de prioridad
    if (p.p === 1) {
        const badge = document.createElement('div');
        badge.className = 'priority-badge';
        badge.textContent = '🔝';
        div.appendChild(badge);
    } else if (p.p === 2) {
        const badge = document.createElement('div');
        badge.className = 'meal-badge';
        badge.textContent = '☕';
        div.appendChild(badge);
    }

    // Badge de habitación
    const roomBadge = document.createElement('div');
    roomBadge.className = 'room-badge';
    roomBadge.textContent = p.room;
    div.appendChild(roomBadge);

    // Información del residente
    const infoDiv = document.createElement('div');
    infoDiv.className = 'flex-1 min-w-0';

    const nameEl = document.createElement('h2');
    nameEl.className = 'text-base font-bold uppercase tracking-tight';
    nameEl.style.color = 'var(--text-primary)';
    nameEl.textContent = p.name;
    infoDiv.appendChild(nameEl);

    const daysText = p.days.join(', ');
    const daysEl = document.createElement('p');
    daysEl.className = 'text-xs mt-0.5';
    daysEl.style.color = 'var(--text-secondary)';
    daysEl.textContent = `Duchas: ${daysText}`;
    infoDiv.appendChild(daysEl);

    div.appendChild(infoDiv);

    // Emojis
    const emojiDiv = document.createElement('div');
    emojiDiv.className = 'flex gap-1 items-center';

    if (p.p === 1) {
        const e1 = document.createElement('span');
        e1.className = 'text-2xl';
        e1.textContent = '🔝';
        emojiDiv.appendChild(e1);
    } else if (p.p === 2) {
        const e1 = document.createElement('span');
        e1.className = 'text-2xl';
        e1.textContent = '☕';
        emojiDiv.appendChild(e1);
    }

    if (showerToday) {
        const e2 = document.createElement('span');
        e2.className = 'text-2xl';
        e2.textContent = '🚿';
        emojiDiv.appendChild(e2);
    }

    div.appendChild(emojiDiv);

    // Botón de 💩/🚽
    const pooBtn = document.createElement('button');
    pooBtn.className = `poo-btn ${hasPoo ? 'poo-btn-active' : ''}`;
    pooBtn.textContent = hasPoo ? '💩' : '🚽';
    pooBtn.onclick = (e) => {
        e.stopPropagation();
        togglePoo(p.id, pooBtn);
    };
    div.appendChild(pooBtn);

    // Indicadores de swipe
    const leftIndicator = document.createElement('div');
    leftIndicator.className = 'swipe-indicator left';
    leftIndicator.textContent = '✓';
    div.appendChild(leftIndicator);

    const rightIndicator = document.createElement('div');
    rightIndicator.className = 'swipe-indicator right';
    rightIndicator.textContent = '✓';
    div.appendChild(rightIndicator);

    // Lógica de swipe
    let startX = 0, currentX = 0, isSwiping = false;
    const threshold = 80;

    div.addEventListener('touchstart', (e) => {
        if (e.target === pooBtn) return;
        startX = e.touches[0].clientX;
        isSwiping = true;
        div.style.transition = 'none';
    }, { passive: true });

    div.addEventListener('touchmove', (e) => {
        if (!isSwiping || e.target === pooBtn) return;
        currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        div.style.transform = `translateX(${diff}px)`;

        if (diff < -15) {
            div.classList.add('swiping-left');
            div.classList.remove('swiping-right');
        } else if (diff > 15) {
            div.classList.add('swiping-right');
            div.classList.remove('swiping-left');
        }
    }, { passive: true });

    div.addEventListener('touchend', (e) => {
        if (!isSwiping) return;
        isSwiping = false;
        const diff = currentX - startX;

        if (Math.abs(diff) > threshold) {
            const doneSet = getDoneSet();
            const wasDone = doneSet.has(p.id);

            if (wasDone) {
                doneSet.delete(p.id);
                setDoneSet(doneSet);
                saveAllData();
                particles(div.getBoundingClientRect().left + div.offsetWidth / 2, div.getBoundingClientRect().top + 20, 'reactivate');
            } else {
                doneSet.add(p.id);
                setDoneSet(doneSet);
                saveAllData();
                particles(div.getBoundingClientRect().left + div.offsetWidth / 2, div.getBoundingClientRect().top + 20, 'complete');
            }

            render();
        } else {
            div.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
            div.style.transform = 'translateX(0)';
            div.classList.remove('swiping-left', 'swiping-right');
            setTimeout(() => {
                div.style.transition = '';
            }, 250);
        }
    });

    div.addEventListener('touchcancel', () => {
        isSwiping = false;
        div.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
        div.style.transform = 'translateX(0)';
        div.classList.remove('swiping-left', 'swiping-right');
        setTimeout(() => {
            div.style.transition = '';
        }, 250);
    });

    return div;
}

// ========== FUNCIONES AUXILIARES ==========
function particles(x, y, type) {
    const colors = type === 'complete' ? ['var(--primary)', 'var(--secondary)'] : ['var(--accent)', 'var(--gray-dark)'];
    const count = type === 'complete' ? 6 : 4;

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.cssText = `
            left: ${x + (i - count / 2) * 8}px;
            top: ${y}px;
            background: ${colors[i % colors.length]};
            animation-delay: ${i * 0.05}s;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 400);
    }
}

function togglePoo(id, btn) {
    const pooSet = getPooSet();
    if (pooSet.has(id)) {
        pooSet.delete(id);
        btn.textContent = '🚽';
        btn.classList.remove('poo-btn-active');
    } else {
        pooSet.add(id);
        btn.textContent = '💩';
        btn.classList.add('poo-btn-active');
        if (navigator.vibrate) navigator.vibrate(30);
    }
    setPooSet(pooSet);
    saveAllData();
    render();
}

// ========== RENDERIZADO ==========
function render() {
    const day = today();
    const list = DB[func] || [];
    const doneSet = getDoneSet();
    const active = list.filter(p => !doneSet.has(p.id));
    const completed = list.filter(p => doneSet.has(p.id));

    // Ordenar
    active.sort((a, b) => {
        if (sort === 'priority') return a.p - b.p || a.room - b.room;
        if (sort === 'room') return a.room - b.room;
        if (sort === 'alpha') return a.name.localeCompare(b.name);
        if (sort === 'shower') {
            const ah = a.days.includes(day) ? 1 : 0;
            const bh = b.days.includes(day) ? 1 : 0;
            return bh - ah || a.name.localeCompare(b.name);
        }
        return 0;
    });

    // Renderizar activos
    const activeContainer = $('active-list');
    activeContainer.innerHTML = '';
    if (active.length) {
        active.forEach(p => {
            activeContainer.appendChild(createCard(p, false, day));
        });
    } else {
        activeContainer.innerHTML = `
            <div class="text-center py-10 brutal-border bg-white">
                <div class="text-4xl mb-3">✓</div>
                <div class="text-lg font-bold" style="color: var(--secondary);">TODO OK</div>
            </div>
        `;
    }

    // Renderizar completados
    const completedContainer = $('completed-list');
    completedContainer.innerHTML = '';
    if (completed.length) {
        completed.forEach(p => {
            completedContainer.appendChild(createCard(p, true, day));
        });
    }

    // Actualizar estadísticas
    const pct = list.length ? Math.round(completed.length / list.length * 100) : 0;
    $('stats-text').textContent = `${completed.length}/${list.length} (${pct}%)`;

    // Actualizar barra de progreso
    const progressBar = $('progress-fill');
    progressBar.style.width = `${pct}%`;

    // Cambiar color de la barra según progreso
    progressBar.className = 'stats-bar-bg';
    if (pct < 30) {
        progressBar.classList.add('progress-low');
    } else if (pct < 70) {
        progressBar.classList.add('progress-medium');
    } else {
        progressBar.classList.add('progress-high');
    }
}

// ========== UTILIDADES ==========
function today() {
    return DAY_MAP[new Date().getDay()];
}

function dateStr() {
    const d = new Date();
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

// ========== INICIALIZACIÓN ==========
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/Duchas-Aseos/sw.js')
            .then(reg => console.log('✅ SW registrado:', reg.scope))
            .catch(err => console.log('❌ SW error:', err));
    });
}

window.addEventListener('beforeunload', () => {
    saveAllData();
});

$('current-date').textContent = dateStr();
loadAllData();
loadResidents();
