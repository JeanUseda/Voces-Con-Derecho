const API_URL = "http://localhost:5019/api";

let estudianteActual = null;
let misionIdActual = null;
let historias = [];
let progresoHistorias = {};

// ==========================================
// ANIMACIONES
// ==========================================

const Animations = {
    initRipples() {
        document.querySelectorAll('.historia-card:not(.bloqueada):not(.completada)').forEach(el => {
            el.addEventListener('click', function(e) {
                const rect = this.getBoundingClientRect();
                const ripple = document.createElement('span');
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                ripple.className = 'ripple';
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(86, 54, 201, 0.15);
                    width: ${size}px; height: ${size}px;
                    left: ${x}px; top: ${y}px;
                    transform: scale(0);
                    animation: ripple-anim 0.6s ease-out forwards;
                    pointer-events: none;
                `;
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 700);
            });
        });
    },

    animateBars() {
        document.querySelectorAll('.progreso-fill').forEach(el => {
            const width = el.style.width;
            el.style.width = '0%';
            setTimeout(() => { el.style.width = width; }, 100);
        });
    },

    init() {
        this.initRipples();
        setTimeout(this.animateBars, 300);
    }
};

// ==========================================
// INICIALIZACIÓN
// ==========================================

async function inicializar() {
    const estudianteData = localStorage.getItem("estudiante");
    if (!estudianteData) {
        alert("Debes iniciar sesión primero.");
        window.location.href = "login.html";
        return;
    }
    try {
        estudianteActual = JSON.parse(estudianteData);
    } catch (error) {
        console.error("Error al parsear datos del estudiante:", error);
        window.location.href = "login.html";
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    misionIdActual = parseInt(urlParams.get('misionId'));

    if (!misionIdActual) {
        alert("No se especificó una misión.");
        window.location.href = "dashboardEstudiantes.html";
        return;
    }

    await cargarDatosMision();
    Animations.init();
}

// ==========================================
// CARGAR DATOS DE LA MISIÓN
// ==========================================

async function cargarDatosMision() {
    try {
        const misionResponse = await fetch(`${API_URL}/misiones/${misionIdActual}`);
        if (misionResponse.ok) {
            const mision = await misionResponse.json();
            document.getElementById("misionTitulo").textContent = mision.titulo || `Misión ${misionIdActual}`;
        }

        const historiasResponse = await fetch(`${API_URL}/historias/mision/${misionIdActual}`);
        if (!historiasResponse.ok) throw new Error("Error al cargar historias.");
        historias = await historiasResponse.json();

        if (historias.length === 0) {
            document.getElementById("historiasContainer").innerHTML = `
                <div class="empty-state">
                    <strong>No hay historias disponibles</strong>
                    <p>Esta misión aún no tiene contenido.</p>
                    <button class="btn-volver" onclick="window.location.href='dashboardEstudiantes.html'" style="margin-top: 16px;">Volver al dashboard</button>
                </div>
            `;
            return;
        }

        await cargarProgresoHistorias();
        renderizarHistorias();

    } catch (error) {
        console.error("Error cargando datos:", error);
        document.getElementById("historiasContainer").innerHTML = `
            <div class="empty-state">
                <strong>Error al cargar la misión</strong>
                <p>${error.message}</p>
                <button class="btn-volver" onclick="window.location.href='dashboardEstudiantes.html'" style="margin-top: 16px;">Volver al dashboard</button>
            </div>
        `;
    }
}

// ==========================================
// CARGAR PROGRESO DE HISTORIAS
// ==========================================

async function cargarProgresoHistorias() {
    try {
        const response = await fetch(`${API_URL}/historias/progreso/mision/${estudianteActual.id}/${misionIdActual}`);
        if (response.ok) {
            const data = await response.json();
            progresoHistorias = {};
            data.forEach(p => { progresoHistorias[p.historiaId] = p; });
        }
    } catch (error) {
        console.error("Error cargando progreso:", error);
    }
}

// ==========================================
// RENDERIZAR HISTORIAS
// ==========================================

function renderizarHistorias() {
    const container = document.getElementById("historiasContainer");
    historias.sort((a, b) => (a.orden || 0) - (b.orden || 0));

    const completadas = historias.filter(h => progresoHistorias[h.id]?.completada).length;
    const total = historias.length;
    document.getElementById("progresoMision").textContent = `${completadas}/${total} completadas`;
    document.getElementById("progresoFill").style.width = `${(completadas / total) * 100}%`;

    let html = "";
    historias.forEach((historia, index) => {
        const progreso = progresoHistorias[historia.id];
        const estaCompletada = progreso?.completada || false;
        let estaDisponible = index === 0 || (index > 0 && progresoHistorias[historias[index-1].id]?.completada);

        let estadoClase = "";
        let estadoTexto = "";
        let estadoColor = "";
        let onclickAttr = "";

        if (estaCompletada) {
            estadoClase = "completada";
            estadoTexto = "✅ Completada";
            estadoColor = "completada";
        } else if (estaDisponible) {
            estadoClase = "disponible";
            estadoTexto = "▶ Jugar";
            estadoColor = "jugar";
            onclickAttr = `onclick="window.location.href='jugar-historia.html?historiaId=${historia.id}&misionId=${misionIdActual}'"`;
        } else {
            estadoClase = "bloqueada";
            estadoTexto = "🔒 Bloqueada";
            estadoColor = "bloqueada";
        }

        html += `
            <div class="historia-card ${estadoClase}" ${onclickAttr}>
                <div class="numero">${index + 1}</div>
                <div class="info">
                    <h3>${escapeHtml(historia.titulo)}</h3>
                    <p>${escapeHtml(historia.descripcion || 'Sin descripción')}</p>
                </div>
                <div class="estado ${estadoColor}">${estadoTexto}</div>
                ${estaDisponible && !estaCompletada ? `<span class="flecha">→</span>` : ''}
            </div>
        `;
    });

    container.innerHTML = html;
    Animations.initRipples();
}

// ==========================================
// UTILIDADES
// ==========================================

function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", inicializar);