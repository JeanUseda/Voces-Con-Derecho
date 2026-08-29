const API_URL = "http://localhost:5019/api";

let estudianteActual = null;
let misionesEstudiante = [];
let progresoEstudiante = [];

// ==========================================
// MÓDULO DE ANIMACIONES
// ==========================================

const Animations = {
    initRipples() {
        document.querySelectorAll('.mission-card, .menu-item, .stat-card-dashboard').forEach(el => {
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

    observeCards() {
        const cards = document.querySelectorAll('.glass-card, .mission-card, .stat-card-dashboard, .logro-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(card);
        });
    },

    init() {
        this.initRipples();
        this.observeCards();
    }
};

// ==========================================
// NAVEGACIÓN
// ==========================================

const sections = document.querySelectorAll(".dashboard-section");
const menuItems = document.querySelectorAll(".menu-item[data-section]");
const sidebar = document.getElementById("sidebar");
const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const sidebarToggle = document.getElementById("sidebarToggle");

function showSection(sectionId) {
    sections.forEach(section => section.classList.remove("active-section"));
    const section = document.getElementById(sectionId);
    if (section) section.classList.add("active-section");
    menuItems.forEach(item => {
        item.classList.toggle("active", item.dataset.section === sectionId);
    });
    if (window.innerWidth <= 768) {
        sidebar.classList.remove("open");
    }
}

menuItems.forEach(item => {
    item.addEventListener("click", (event) => {
        event.preventDefault();
        showSection(item.dataset.section);
    });
});

mobileMenuToggle?.addEventListener("click", () => sidebar.classList.toggle("open"));
sidebarToggle?.addEventListener("click", () => sidebar.classList.toggle("open"));

document.addEventListener("click", (event) => {
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(event.target) && !mobileMenuToggle.contains(event.target) && !sidebarToggle.contains(event.target)) {
            sidebar.classList.remove("open");
        }
    }
});

// ==========================================
// AUTENTICACIÓN
// ==========================================

function verificarAutenticacion() {
    const estudianteData = localStorage.getItem("estudiante");
    if (!estudianteData) {
        window.location.href = "login.html";
        return false;
    }
    try {
        estudianteActual = JSON.parse(estudianteData);
        return true;
    } catch (error) {
        console.error("Error al parsear datos del estudiante:", error);
        window.location.href = "login.html";
        return false;
    }
}

// ==========================================
// CARGAR DATOS DEL ESTUDIANTE
// ==========================================

function cargarDatosEstudiante() {
    if (!estudianteActual) return;
    const avatar = document.getElementById("userAvatar");
    const iniciales = `${estudianteActual.nombre[0]}${estudianteActual.apellido[0]}`.toUpperCase();
    avatar.textContent = iniciales;
    document.getElementById("userName").textContent = `${estudianteActual.nombre} ${estudianteActual.apellido}`;
    document.getElementById("welcomeMessage").textContent = `¡Hola, ${estudianteActual.nombre}! 👋`;
}

// ==========================================
// CARGAR MISIONES DEL ESTUDIANTE
// ==========================================

async function cargarMisionesEstudiante() {
    if (!estudianteActual) return;
    const contenedorInicio = document.getElementById("misMisiones");
    const contenedorTodas = document.getElementById("todasMisiones");

    try {
        const response = await fetch(`${API_URL}/estudiantes/${estudianteActual.id}/misiones`);
        if (!response.ok) throw new Error("Error al cargar misiones.");
        misionesEstudiante = await response.json();

        document.getElementById("misionesTotales").textContent = misionesEstudiante.length;
        document.getElementById("totalMisiones").textContent = misionesEstudiante.length;
        document.getElementById("totalMisionesCount").textContent = misionesEstudiante.length;
        document.getElementById("sidebarMisionesBadge").textContent = misionesEstudiante.length;

        renderizarMisiones(contenedorInicio, misionesEstudiante.slice(0, 3), true);
        renderizarMisiones(contenedorTodas, misionesEstudiante, false);

    } catch (error) {
        console.error("Error cargando misiones:", error);
        const msg = `<div class="empty-state"><strong>No se pudieron cargar las misiones</strong><p>Intenta nuevamente más tarde.</p></div>`;
        contenedorInicio.innerHTML = msg;
        contenedorTodas.innerHTML = msg;
    }
}

// ==========================================
// RENDERIZAR MISIONES CON ESTADOS VISUALES
// ==========================================

function renderizarMisiones(container, misiones, esResumen = false) {
    if (!misiones || !misiones.length) {
        container.innerHTML = `
            <div class="empty-state">
                <strong>No hay misiones disponibles</strong>
                <p>${esResumen ? 'Pide a tu profesor que asigne misiones a tu clase.' : 'Todavía no tienes misiones asignadas.'}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = misiones.map(mision => {
        // Determinar estado visual
        let statusClass = 'pendiente';
        let statusText = '📌 Pendiente';
        let statusIcon = '◇';
        
        // Simular estados para demo (en producción vendría de la API)
        const random = Math.random();
        if (random > 0.7) {
            statusClass = 'completada';
            statusText = '✅ Completada';
            statusIcon = '🏆';
        } else if (random > 0.4) {
            statusClass = 'en-curso';
            statusText = '⏳ En curso';
            statusIcon = '🔥';
        }

        return `
            <div class="mission-card" onclick="window.location.href='mision-detalle.html?misionId=${mision.misionId}'">
                <div class="mission-icon">${statusIcon}</div>
                <h3>${escapeHtml(mision.titulo)}</h3>
                <p>${escapeHtml(mision.descripcion || 'Sin descripción')}</p>
                <span class="mission-status ${statusClass}">${statusText}</span>
                ${!esResumen ? `<small style="display: block; margin-top: 8px; color: var(--text-light);">Clase: ${escapeHtml(mision.claseNombre)}</small>` : ''}
            </div>
        `;
    }).join("");
}

// ==========================================
// CARGAR PROGRESO
// ==========================================

async function cargarProgreso() {
    if (!estudianteActual) return;
    const container = document.getElementById("miProgreso");

    try {
        const response = await fetch(`${API_URL}/estudiantes/${estudianteActual.id}/progreso`);
        if (!response.ok) throw new Error("Error al cargar progreso.");
        progresoEstudiante = await response.json();

        if (!progresoEstudiante.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <strong>Aún no has iniciado ninguna misión</strong>
                    <p>Selecciona una misión y comienza tu aprendizaje.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="progreso-tabla-container">
                <table class="progreso-tabla">
                    <thead>
                        <tr>
                            <th>Misión</th>
                            <th>Estado</th>
                            <th>Puntos</th>
                            <th>Progreso</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${progresoEstudiante.map(p => `
                            <tr>
                                <td><strong>${escapeHtml(p.titulo)}</strong></td>
                                <td>
                                    <span class="mission-status ${p.estado === 'completada' ? 'completada' : 'pendiente'}">
                                        ${p.estado === 'completada' ? '✅ Completada' : '⏳ En progreso'}
                                    </span>
                                </td>
                                <td><strong>${p.puntos || 0}</strong></td>
                                <td>
                                    <div class="progreso-bar-mini">
                                        <div class="fill" style="width: ${p.porcentaje || 0}%;"></div>
                                    </div>
                                    <span style="font-size: 12px; margin-left: 8px;">${p.porcentaje || 0}%</span>
                                </td>
                                <td style="color: var(--text-light); font-size: 13px;">${p.fechaInicio ? formatDate(p.fechaInicio) : '—'}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;

    } catch (error) {
        console.error("Error cargando progreso:", error);
        container.innerHTML = `<div class="empty-state"><strong>No se pudo cargar el progreso</strong><p>Intenta nuevamente más tarde.</p></div>`;
    }
}

// ==========================================
// ACTUALIZAR ESTADÍSTICAS
// ==========================================

async function actualizarEstadisticas() {
    if (!estudianteActual) return;

    try {
        const response = await fetch(`${API_URL}/estudiantes/${estudianteActual.id}/misiones`);
        if (!response.ok) throw new Error("Error al cargar misiones.");
        const misiones = await response.json();
        
        document.getElementById("misionesTotales").textContent = misiones.length;
        document.getElementById("totalMisiones").textContent = misiones.length;
        document.getElementById("totalMisionesCount").textContent = misiones.length;

        let totalCompletadas = 0;
        let totalPuntos = 0;
        let completadasRecientes = 0;

        for (const mision of misiones) {
            try {
                const progresoResponse = await fetch(`${API_URL}/historias/mision/${mision.misionId}/progreso/${estudianteActual.id}`);
                if (progresoResponse.ok) {
                    const data = await progresoResponse.json();
                    totalCompletadas += data.historiasCompletadas || 0;
                    totalPuntos += data.puntosTotales || 0;
                    if (data.historiasCompletadas > 0) completadasRecientes++;
                }
            } catch (error) { console.error("Error al obtener progreso de misión:", error); }
        }

        document.getElementById("misionesCompletadas").textContent = totalCompletadas;
        document.getElementById("xpTotal").textContent = totalPuntos;
        document.getElementById("rachaTotal").textContent = completadasRecientes > 0 ? `🔥 ${completadasRecientes}` : '0';

    } catch (error) {
        console.error("Error actualizando estadísticas:", error);
    }
}

// ==========================================
// CARGAR LOGROS CON EFECTO BRILLO
// ==========================================

async function cargarLogros() {
    const container = document.getElementById("misLogros");

    try {
        // Simular carga de logros desde la API
        const logros = [
            { id: 1, nombre: 'Primera misión', icono: '⭐', obtenido: true, descripcion: 'Completa tu primera misión' },
            { id: 2, nombre: 'Explorador', icono: '🗺️', obtenido: false, descripcion: 'Completa 5 misiones' },
            { id: 3, nombre: 'Campeón', icono: '🏆', obtenido: false, descripcion: 'Completa 10 misiones' },
            { id: 4, nombre: 'Leyenda', icono: '👑', obtenido: false, descripcion: 'Completa 20 misiones' },
        ];

        const logrosObtenidos = logros.filter(l => l.obtenido).length;
        document.getElementById("sidebarLogrosBadge").textContent = logrosObtenidos;

        container.innerHTML = logros.map(logro => `
            <div class="logro-card">
                <span class="logro-icon ${logro.obtenido ? 'desbloqueado' : 'bloqueado'}">${logro.icono}</span>
                <h4>${logro.nombre}</h4>
                <p>${logro.descripcion}</p>
                <span class="logro-badge ${logro.obtenido ? 'obtenido' : 'bloqueado'}">
                    ${logro.obtenido ? '✅ Obtenido' : '🔒 Bloqueado'}
                </span>
            </div>
        `).join("");

    } catch (error) {
        console.error("Error cargando logros:", error);
        container.innerHTML = `<div class="empty-state"><strong>No se pudieron cargar los logros</strong><p>Intenta nuevamente más tarde.</p></div>`;
    }
}

// ==========================================
// UTILIDADES
// ==========================================

function formatDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("es-NI", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

async function initializeDashboard() {
    if (!verificarAutenticacion()) return;
    cargarDatosEstudiante();

    await Promise.all([
        cargarMisionesEstudiante(),
        cargarProgreso(),
        cargarLogros(),
        actualizarEstadisticas()
    ]);

    Animations.init();

    // Restaurar sección guardada
    const seccionGuardada = localStorage.getItem('seccionEstudiante') || 'inicio';
    showSection(seccionGuardada);

    console.log("Dashboard del estudiante cargado correctamente.");
}

// Cerrar sesión
document.getElementById("cerrarSesion")?.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("estudiante");
    window.location.href = "login.html";
});

// Iniciar
initializeDashboard();