const API_URL = "http://localhost:5019/api";

let estudianteActual = null;
let misionesEstudiante = [];
let progresoEstudiante = [];

// =========================================
// CERRAR SESIÓN
// =========================================

document.getElementById("cerrarSesion")?.addEventListener("click", (event) => {
    event.preventDefault();
    // ✅ Eliminar todos los datos de sesión
    localStorage.removeItem("usuario");
    localStorage.removeItem("estudiante");
    localStorage.removeItem("profesor");
    localStorage.removeItem("seccionActual");
    localStorage.removeItem("claseActualId");
    localStorage.removeItem("filtrosEstudiantes");
    // ✅ Redirigir al login
    window.location.href = "login.html";
});

// =========================================
// VERIFICAR AUTENTICACIÓN
// =========================================

function verificarAutenticacion() {
    // ✅ Primero intentar con el formato unificado
    const usuarioData = localStorage.getItem("usuario");
    
    if (usuarioData) {
        try {
            const usuario = JSON.parse(usuarioData);
            if (usuario.rol === "estudiante") {
                estudianteActual = usuario;
                return true;
            }
        } catch (error) {
            console.error("Error al parsear usuario:", error);
        }
    }
    
    // ✅ Compatibilidad con formato antiguo
    const estudianteData = localStorage.getItem("estudiante");
    if (estudianteData) {
        try {
            estudianteActual = JSON.parse(estudianteData);
            return true;
        } catch (error) {
            console.error("Error al parsear estudiante:", error);
        }
    }

    window.location.href = "login.html";
    return false;
}
// =========================================
// ELEMENTOS Y NAVEGACIÓN
// =========================================

const sections = document.querySelectorAll(".dashboard-section");
const menuItems = document.querySelectorAll(".menu-item[data-section]");

function showSection(sectionId, guardar = true) {

    sections.forEach(section => {
        section.classList.remove("active-section");
    });

    const section = document.getElementById(sectionId);

    if (section) {
        section.classList.add("active-section");
    }

    menuItems.forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.section === sectionId
        );
    });

    // Guardar la sección actual
    if (guardar) {
        localStorage.setItem("seccionActual", sectionId);
    }
}


// =========================================
// NAVEGACIÓN DEL SIDEBAR
// =========================================

menuItems.forEach(item => {

    item.addEventListener("click", (event) => {

        event.preventDefault();

        const sectionId = item.dataset.section;

        showSection(sectionId);

    });

});


// =========================================
// RECUPERAR ÚLTIMA SECCIÓN
// =========================================

function recuperarSeccion() {

    const seccionGuardada =
        localStorage.getItem("seccionActual");

    // Si existe y la sección todavía está en el HTML
    if (
        seccionGuardada &&
        document.getElementById(seccionGuardada)
    ) {

        showSection(seccionGuardada, false);

    } else {

        // Por defecto: Inicio
        showSection("inicio", false);

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

const misionesTotalesElement = document.getElementById("misionesTotales");
const totalMisionesElement = document.getElementById("totalMisiones");

if (misionesTotalesElement) {
    misionesTotalesElement.textContent = misionesEstudiante.length;
}

if (totalMisionesElement) {
    totalMisionesElement.textContent = misionesEstudiante.length;
}
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
// RENDERIZAR MISIONES (CUADRÍCULA)
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

    // ✅ Asegurar que el contenedor tenga la clase grid
    if (!container.classList.contains('misiones-grid')) {
        container.classList.add('misiones-grid');
    }

    container.innerHTML = misiones.map(mision => {
        const progresoMision = progresoEstudiante.find(p => p.misionId === mision.misionId);
        const totalHistorias = progresoMision?.totalHistorias || 0;
        const completadas = progresoMision?.historiasCompletadas || 0;
        const estaCompletada = progresoMision?.completada || false;
        const puntos = progresoMision?.puntosTotales || 0;
        
        const estadoClase = estaCompletada ? 'completada' : 'pendiente';
        const estadoTexto = estaCompletada ? '✅ Completada' : '📌 Pendiente';
        
        let progresoTexto = totalHistorias > 0 
            ? `${completadas}/${totalHistorias} historias · ${puntos} pts`
            : `${totalHistorias} historias`;

        const botonTexto = estaCompletada ? '📖 Ver historias' : '🚀 Comenzar';

        return `
            <div class="mision-card-estudiante ${estaCompletada ? 'completada' : ''}">
                <div class="mision-header-estudiante">
                    <div class="mision-icon-estudiante">📚</div>
                    <div class="mision-info-estudiante">
                        <h3>${escapeHtml(mision.titulo)}</h3>
                        <p>${escapeHtml(mision.descripcion || 'Sin descripción')}</p>
                    </div>
                    <span class="mision-estado ${estadoClase}">${estadoTexto}</span>
                </div>
                <div class="mision-footer-estudiante">
                    <div class="mision-stats-estudiante">
                        <span class="progreso-texto">${progresoTexto}</span>
                        ${mision.claseNombre ? `<span class="mision-clase-badge">🏫 ${escapeHtml(mision.claseNombre)}</span>` : ''}
                    </div>
                    <button class="btn-comenzar" onclick="window.location.href='mision-detalle.html?misionId=${mision.misionId}'">
                        ${botonTexto}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}
// =========================================
// CARGAR PROGRESO
// =========================================

async function cargarProgreso() {
    if (!estudianteActual) return;

    const container = document.getElementById("miProgreso");

    try {
        // 1. Obtener todas las misiones del estudiante
        const misionesResponse = await fetch(
            `${API_URL}/estudiantes/${estudianteActual.id}/misiones`
        );
        const misiones = await misionesResponse.json();

        // 2. Obtener progreso de CADA misión
        progresoEstudiante = [];

        for (const mision of misiones) {
            try {
                const response = await fetch(
                    `${API_URL}/historias/mision/${mision.misionId}/progreso/${estudianteActual.id}`
                );
                
                if (response.ok) {
                    const data = await response.json();
                    progresoEstudiante.push({
                        misionId: mision.misionId,
                        totalHistorias: data.totalHistorias || 0,
                        historiasCompletadas: data.historiasCompletadas || 0,
                        puntosTotales: data.puntosTotales || 0,
                        completada: data.completada || false
                    });
                }
            } catch (error) {
                console.error(`Error en misión ${mision.misionId}:`, error);
                // Si falla, agregar datos por defecto
                progresoEstudiante.push({
                    misionId: mision.misionId,
                    totalHistorias: 0,
                    historiasCompletadas: 0,
                    puntosTotales: 0,
                    completada: false
                });
            }
        }

        console.log("📊 Progreso por misión:", progresoEstudiante);

        // 3. Renderizar misiones con el progreso actualizado
        await cargarMisionesEstudiante();

        // 4. Renderizar tabla de progreso
        if (!progresoEstudiante.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <strong>Aún no has iniciado ninguna misión</strong>
                    <p>Selecciona una misión y comienza tu aprendizaje.</p>
                </div>
            `;
            return;
        }

        // Mostrar solo las misiones que tienen historias
        const misionesConProgreso = progresoEstudiante.filter(p => p.totalHistorias > 0);

        if (misionesConProgreso.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <strong>Aún no hay datos de progreso</strong>
                    <p>Comienza una misión para ver tu avance.</p>
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
                            <th style="text-align: center; padding: 12px 8px;">Progreso</th>
                            <th style="text-align: center; padding: 12px 8px;">Puntos</th>
                            <th style="text-align: center; padding: 12px 8px;">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${misionesConProgreso.map(p => {
                            // Obtener el nombre de la misión
                            const mision = misiones.find(m => m.misionId === p.misionId);
                            const porcentaje = p.totalHistorias > 0 
                                ? Math.round((p.historiasCompletadas / p.totalHistorias) * 100) 
                                : 0;
                            
                            return `
                                <tr style="border-bottom: 1px solid var(--border);">
                                    <td style="padding: 12px 8px; font-weight: 500;">
                                        ${escapeHtml(mision?.titulo || 'Misión')}
                                    </td>
                                    <td style="padding: 12px 8px; text-align: center;">
                                        <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
                                            <div style="flex: 1; max-width: 100px; height: 6px; background: var(--border); border-radius: 10px; overflow: hidden;">
                                                <div style="width: ${porcentaje}%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--pink)); border-radius: 10px; transition: width 0.5s;"></div>
                                            </div>
                                            <span style="font-size: 13px; font-weight: 600;">${porcentaje}%</span>
                                        </div>
                                    </td>
                                    <td style="padding: 12px 8px; text-align: center; font-weight: 600; color: var(--primary);">
                                        ${p.puntosTotales}
                                    </td>
                                    <td style="padding: 12px 8px; text-align: center;">
                                        <span class="mission-status ${p.completada ? 'completada' : 'pendiente'}">
                                            ${p.completada ? '✅ Completada' : '⏳ En progreso'}
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
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
        
        const misionesTotalesElement = document.getElementById("misionesTotales");
        const totalMisionesElement = document.getElementById("totalMisiones");

        if (misionesTotalesElement) {
            misionesTotalesElement.textContent = misiones.length;
        }

        if (totalMisionesElement) {
            totalMisionesElement.textContent = misiones.length;
        }

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

    recuperarSeccion();

    await Promise.all([
        cargarMisionesEstudiante(),
        cargarProgreso(),
        cargarLogros(),
        actualizarEstadisticas()
    ]);

    console.log("Dashboard del estudiante cargado correctamente.");
}

initializeDashboard();
