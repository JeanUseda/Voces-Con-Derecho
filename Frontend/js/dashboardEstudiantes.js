const API_URL = "http://localhost:5019/api";

let estudianteActual = null;
let misionesEstudiante = [];
let progresoEstudiante = [];

// =========================================
// ELEMENTOS
// =========================================

// const sections = document.querySelectorAll(".dashboard-section");
// const menuItems = document.querySelectorAll(".menu-item[data-section]");

// // =========================================
// // NAVEGACIÓN
// // =========================================

// function showSection(sectionId) {
//     sections.forEach(section => {
//         section.classList.remove("active-section");
//     });

//     const section = document.getElementById(sectionId);
//     if (section) {
//         section.classList.add("active-section");
//     }

//     menuItems.forEach(item => {
//         item.classList.toggle(
//             "active",
//             item.dataset.section === sectionId
//         );
//     });
// }

// menuItems.forEach(item => {
//     item.addEventListener("click", (event) => {
//         event.preventDefault();
//         showSection(item.dataset.section);
//     });
// });

// =========================================
// CERRAR SESIÓN
// =========================================

document.getElementById("cerrarSesion")?.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("estudiante");
    window.location.href = "login.html";
});

// =========================================
// VERIFICAR AUTENTICACIÓN
// =========================================

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

// =========================================
// CARGAR DATOS DEL ESTUDIANTE
// =========================================

function cargarDatosEstudiante() {
    if (!estudianteActual) return;

    const avatar = document.getElementById("userAvatar");
    const iniciales = `${estudianteActual.nombre[0]}${estudianteActual.apellido[0]}`.toUpperCase();
    avatar.textContent = iniciales;

    document.getElementById("userName").textContent = 
        `${estudianteActual.nombre} ${estudianteActual.apellido}`;

    document.getElementById("welcomeMessage").textContent = 
        `¡Hola, ${estudianteActual.nombre}! 👋`;
}

// =========================================
// CARGAR MISIONES DEL ESTUDIANTE
// =========================================

async function cargarMisionesEstudiante() {
    if (!estudianteActual) return;

    const contenedorInicio = document.getElementById("misMisiones");
    const contenedorTodas = document.getElementById("todasMisiones");

    try {
        const response = await fetch(
            `${API_URL}/estudiantes/${estudianteActual.id}/misiones`
        );

        if (!response.ok) {
            throw new Error("Error al cargar misiones.");
        }

        misionesEstudiante = await response.json();

        console.log("Misiones del estudiante:", misionesEstudiante);

        document.getElementById("misionesTotales").textContent = 
            misionesEstudiante.length;

        document.getElementById("totalMisiones").textContent = 
            misionesEstudiante.length;

        renderizarMisiones(
            contenedorInicio, 
            misionesEstudiante.slice(0, 3),
            true
        );

        renderizarMisiones(
            contenedorTodas, 
            misionesEstudiante,
            false
        );

    } catch (error) {
        console.error("Error cargando misiones:", error);
        contenedorInicio.innerHTML = `
            <div class="empty-state">
                <strong>No se pudieron cargar las misiones</strong>
                <p>Intenta nuevamente más tarde.</p>
            </div>
        `;
        contenedorTodas.innerHTML = `
            <div class="empty-state">
                <strong>No se pudieron cargar las misiones</strong>
                <p>Intenta nuevamente más tarde.</p>
            </div>
        `;
    }
}

// =========================================
// RENDERIZAR MISIONES
// =========================================

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

    container.innerHTML = misiones.map(mision => `
        <div class="mission-card" onclick="window.location.href='mision-detalle.html?misionId=${mision.misionId}'">
            <div class="mission-icon">◇</div>
            <h3>${escapeHtml(mision.titulo)}</h3>
            <p>${escapeHtml(mision.descripcion || 'Sin descripción')}</p>
            <span class="mission-status pendiente">
                📌 Pendiente
            </span>
            ${!esResumen ? `<small style="display: block; margin-top: 8px; color: var(--text-light);">
                Clase: ${escapeHtml(mision.claseNombre)}
            </small>` : ''}
        </div>
    `).join("");
}

// =========================================
// CARGAR PROGRESO
// =========================================

async function cargarProgreso() {
    if (!estudianteActual) return;

    const container = document.getElementById("miProgreso");

    try {
        const response = await fetch(
            `${API_URL}/estudiantes/${estudianteActual.id}/progreso`
        );

        if (!response.ok) {
            throw new Error("Error al cargar progreso.");
        }

        progresoEstudiante = await response.json();

        console.log("Progreso del estudiante:", progresoEstudiante);

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
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--border);">
                            <th style="text-align: left; padding: 12px 8px;">Misión</th>
                            <th style="text-align: left; padding: 12px 8px;">Estado</th>
                            <th style="text-align: center; padding: 12px 8px;">Puntos</th>
                            <th style="text-align: left; padding: 12px 8px;">Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${progresoEstudiante.map(p => `
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 12px 8px; font-weight: 500;">
                                    ${escapeHtml(p.titulo)}
                                </td>
                                <td style="padding: 12px 8px;">
                                    <span class="mission-status ${p.estado === 'completada' ? 'completada' : 'pendiente'}">
                                        ${p.estado === 'completada' ? '✅ Completada' : '⏳ En progreso'}
                                    </span>
                                </td>
                                <td style="text-align: center; padding: 12px 8px;">
                                    ${p.puntos || 0}
                                </td>
                                <td style="padding: 12px 8px; color: var(--text-light); font-size: 13px;">
                                    ${p.fechaInicio ? formatDate(p.fechaInicio) : '—'}
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;

    } catch (error) {
        console.error("Error cargando progreso:", error);
        container.innerHTML = `
            <div class="empty-state">
                <strong>No se pudo cargar el progreso</strong>
                <p>Intenta nuevamente más tarde.</p>
            </div>
        `;
    }
}

// =========================================
// ACTUALIZAR ESTADÍSTICAS DEL DASHBOARD
// =========================================

async function actualizarEstadisticas() {
    if (!estudianteActual) return;

    try {
        const response = await fetch(
            `${API_URL}/estudiantes/${estudianteActual.id}/misiones`
        );

        if (!response.ok) {
            throw new Error("Error al cargar misiones.");
        }

        const misiones = await response.json();
        
        document.getElementById("misionesTotales").textContent = misiones.length;
        document.getElementById("totalMisiones").textContent = misiones.length;

        let totalCompletadas = 0;
        let totalPuntos = 0;

        for (const mision of misiones) {
            try {
                const progresoResponse = await fetch(
                    `${API_URL}/historias/mision/${mision.misionId}/progreso/${estudianteActual.id}`
                );
                
                if (progresoResponse.ok) {
                    const data = await progresoResponse.json();
                    totalCompletadas += data.historiasCompletadas || 0;
                    totalPuntos += data.puntosTotales || 0;
                }
            } catch (error) {
                console.error("Error al obtener progreso de misión:", error);
            }
        }

        document.getElementById("misionesCompletadas").textContent = totalCompletadas;
        document.getElementById("xpTotal").textContent = totalPuntos;

        console.log(`📊 Estadísticas actualizadas: ${totalCompletadas} completadas, ${totalPuntos} puntos`);

    } catch (error) {
        console.error("Error actualizando estadísticas:", error);
    }
}

// =========================================
// CARGAR LOGROS (placeholder)
// =========================================

async function cargarLogros() {
    const container = document.getElementById("misLogros");

    container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            <strong>🏆 Tus logros aparecerán aquí</strong>
            <p>Completa misiones para desbloquear insignias y recompensas.</p>
            <div style="display: flex; gap: 20px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
                <div style="padding: 20px; background: var(--purple-soft); border-radius: 12px; width: 120px; text-align: center;">
                    <div style="font-size: 40px;">⭐</div>
                    <div style="font-size: 12px; margin-top: 8px; color: var(--text-light);">Primera misión</div>
                </div>
                <div style="padding: 20px; background: var(--pink-soft); border-radius: 12px; width: 120px; text-align: center; opacity: 0.4;">
                    <div style="font-size: 40px;">🔒</div>
                    <div style="font-size: 12px; margin-top: 8px; color: var(--text-light);">Bloqueado</div>
                </div>
                <div style="padding: 20px; background: var(--blue-soft); border-radius: 12px; width: 120px; text-align: center; opacity: 0.4;">
                    <div style="font-size: 40px;">🔒</div>
                    <div style="font-size: 12px; margin-top: 8px; color: var(--text-light);">Bloqueado</div>
                </div>
            </div>
        </div>
    `;
}

// =========================================
// UTILIDADES
// =========================================

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

// =========================================
// INICIALIZACIÓN
// =========================================

async function initializeDashboard() {
    if (!verificarAutenticacion()) return;

    cargarDatosEstudiante();

    await Promise.all([
        cargarMisionesEstudiante(),
        cargarProgreso(),
        cargarLogros(),
        actualizarEstadisticas()
    ]);

    console.log("Dashboard del estudiante cargado correctamente.");
}

initializeDashboard();