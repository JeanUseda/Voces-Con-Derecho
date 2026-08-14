const API_URL = "http://localhost:5019/api";

let estudianteActual = null;
let misionIdActual = null;
let historias = [];
let progresoHistorias = {};

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

    // Obtener ID de la misión desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    misionIdActual = parseInt(urlParams.get('misionId'));

    if (!misionIdActual) {
        alert("No se especificó una misión.");
        window.location.href = "dashboardEstudiantes.html";
        return;
    }

    await cargarDatosMision();
}

// ==========================================
// CARGAR DATOS DE LA MISIÓN
// ==========================================

async function cargarDatosMision() {
    try {
        // Cargar nombre de la misión
        const misionResponse = await fetch(`${API_URL}/misiones/${misionIdActual}`);
        if (misionResponse.ok) {
            const mision = await misionResponse.json();
            document.getElementById("misionTitulo").textContent = mision.titulo || `Misión ${misionIdActual}`;
        }

        // Cargar historias de la misión
        const historiasResponse = await fetch(`${API_URL}/historias/mision/${misionIdActual}`);
        
        if (!historiasResponse.ok) {
            throw new Error("Error al cargar historias.");
        }

        historias = await historiasResponse.json();

        if (historias.length === 0) {
            document.getElementById("historiasContainer").innerHTML = `
                <div class="empty-state">
                    <strong>No hay historias disponibles</strong>
                    <p>Esta misión aún no tiene contenido.</p>
                    <button class="btn-volver" onclick="window.location.href='dashboardEstudiantes.html'" style="margin-top: 16px;">
                        Volver al dashboard
                    </button>
                </div>
            `;
            return;
        }

        // Cargar progreso de cada historia
        await cargarProgresoHistorias();

        // Renderizar las historias
        renderizarHistorias();

    } catch (error) {
        console.error("Error cargando datos:", error);
        document.getElementById("historiasContainer").innerHTML = `
            <div class="empty-state">
                <strong>Error al cargar la misión</strong>
                <p>${error.message}</p>
                <button class="btn-volver" onclick="window.location.href='dashboardEstudiantes.html'" style="margin-top: 16px;">
                    Volver al dashboard
                </button>
            </div>
        `;
    }
}

// ==========================================
// CARGAR PROGRESO DE HISTORIAS
// ==========================================

async function cargarProgresoHistorias() {
    try {
        const response = await fetch(
            `${API_URL}/historias/progreso/mision/${estudianteActual.id}/${misionIdActual}`
        );

        if (response.ok) {
            const data = await response.json();
            progresoHistorias = {};
            data.forEach(p => {
                progresoHistorias[p.historiaId] = p;
            });
            console.log("Progreso cargado:", progresoHistorias);
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

    // Ordenar historias por orden
    historias.sort((a, b) => (a.orden || 0) - (b.orden || 0));

    // Verificar progreso general
    const completadas = historias.filter(h => progresoHistorias[h.id]?.completada).length;
    const total = historias.length;
    document.getElementById("progresoMision").textContent = `${completadas}/${total} completadas`;
    document.getElementById("progresoFill").style.width = `${(completadas / total) * 100}%`;

    let html = "";

    historias.forEach((historia, index) => {
        const progreso = progresoHistorias[historia.id];
        const estaCompletada = progreso?.completada || false;
        
        // Verificar si la anterior está completada (para saber si está disponible)
        let estaDisponible = false;
        if (index === 0) {
            estaDisponible = true; // La primera siempre disponible
        } else {
            const anterior = historias[index - 1];
            const anteriorCompletada = progresoHistorias[anterior.id]?.completada || false;
            estaDisponible = anteriorCompletada;
        }

        let estadoClase = "";
        let estadoTexto = "";
        let estadoColor = "";

        if (estaCompletada) {
            estadoClase = "completada";
            estadoTexto = "✅ Completada";
            estadoColor = "completada";
        } else if (estaDisponible) {
            estadoClase = "disponible";
            estadoTexto = "▶ Jugar";
            estadoColor = "jugar";
        } else {
            estadoClase = "bloqueada";
            estadoTexto = "🔒 Bloqueada";
            estadoColor = "bloqueada";
        }

        html += `
            <div class="historia-card ${estadoClase}" 
                 onclick="${estaDisponible && !estaCompletada ? `window.location.href='jugar-historia.html?historiaId=${historia.id}&misionId=${misionIdActual}'` : ''}">
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

// ==========================================
// INICIALIZAR
// ==========================================

document.addEventListener("DOMContentLoaded", inicializar);