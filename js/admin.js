const API_URL = "http://localhost:5019/api";

// ==========================================
// OBTENER USUARIO ACTUAL
// ==========================================

function obtenerUsuarioActual() {
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
        try {
            const usuario = JSON.parse(usuarioData);
            if (usuario.rol === "admin") {
                return usuario;
            }
        } catch (error) {
            console.error("Error al parsear usuario:", error);
        }
    }

    const profesorData = localStorage.getItem("profesor");
    if (profesorData) {
        try {
            const profesor = JSON.parse(profesorData);
            if (profesor.rol === "admin" || profesor.email?.includes("@Secre.com")) {
                return profesor;
            }
        } catch (error) {
            console.error("Error al parsear profesor:", error);
        }
    }

    window.location.href = "login.html";
    return null;
}

const usuarioActual = obtenerUsuarioActual();

if (!usuarioActual) {
    throw new Error("No hay sesión activa");
}

// ==========================================
// CARGAR DATOS DEL ADMIN
// ==========================================

function cargarDatosAdmin() {
    if (!usuarioActual) return;

    const avatar = document.getElementById("userAvatar");
    if (avatar) {
        const nombre = usuarioActual.nombre || "";
        const apellido = usuarioActual.apellido || "";
        const iniciales = `${nombre[0] || ''}${apellido[0] || ''}`.toUpperCase() || "AD";
        avatar.textContent = iniciales;
    }

    const userName = document.getElementById("userName");
    if (userName) {
        userName.textContent = `${usuarioActual.nombre || ''} ${usuarioActual.apellido || ''}`.trim() || "Administrador";
    }

    const welcomeMessage = document.getElementById("welcomeMessage");
    if (welcomeMessage) {
        welcomeMessage.textContent = `¡Hola, ${usuarioActual.nombre || 'Administrador'}! 👋`;
    }
}

// ==========================================
// CARGAR ESTADÍSTICAS
// ==========================================

async function cargarEstadisticasAdmin() {
    try {
        const profesoresResponse = await fetch(`${API_URL}/profesores`);
        if (profesoresResponse.ok) {
            const profesores = await profesoresResponse.json();
            const totalProfesoresEl = document.getElementById("totalProfesores");
            if (totalProfesoresEl) totalProfesoresEl.textContent = profesores.length;
        }

        const estudiantesResponse = await fetch(`${API_URL}/estudiantes/todos`);
        if (estudiantesResponse.ok) {
            const estudiantes = await estudiantesResponse.json();
            const totalEstudiantesEl = document.getElementById("totalEstudiantesAdmin");
            if (totalEstudiantesEl) totalEstudiantesEl.textContent = estudiantes.length;
        }

    } catch (error) {
        console.error("Error cargando estadísticas:", error);
    }
}

// ==========================================
// MOSTRAR NOTIFICACIÓN FLOTANTE
// ==========================================

function mostrarNotificacion(mensaje, tipo = "success") {
    document.querySelectorAll(".notificacion-flotante").forEach(n => n.remove());

    const colores = { success: "#2ca66f", error: "#d9366f", info: "#5636c9", warning: "#f59e0b" };

    const notificacion = document.createElement("div");
    notificacion.className = "notificacion-flotante";
    notificacion.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        z-index: 1000;
        padding: 16px 24px;
        border-radius: 12px;
        background: ${colores[tipo] || colores.info};
        color: white;
        font-weight: 600;
        font-size: 15px;
        box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        transform: translateX(120%);
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        max-width: 400px;
    `;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => { notificacion.style.transform = "translateX(0)"; }, 50);
    setTimeout(() => {
        notificacion.style.transform = "translateX(120%)";
        setTimeout(() => { notificacion.remove(); }, 300);
    }, 4000);
}

// ==========================================
// MODAL DE CONFIRMACIÓN PERSONALIZADO
// ==========================================

function mostrarModalConfirmacion(titulo, mensaje, textoBoton, colorBoton) {
    return new Promise((resolve) => {
        document.querySelectorAll('.confirm-overlay').forEach(el => el.remove());

        const overlay = document.createElement("div");
        overlay.className = "confirm-overlay";
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 2000;
            background: rgba(35, 25, 75, 0.5);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease;
        `;

        overlay.innerHTML = `
            <div style="
                width: 100%;
                max-width: 420px;
                background: white;
                border-radius: 20px;
                padding: 30px;
                box-shadow: 0 25px 70px rgba(30, 20, 70, 0.25);
                animation: scaleIn 0.3s ease;
                text-align: center;
            ">
                <div style="
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 20px;
                    background: ${colorBoton}20;
                    color: ${colorBoton};
                    font-size: 28px;
                    margin: 0 auto 15px;
                ">⚠️</div>
                
                <h3 style="font-size: 19px; margin-bottom: 10px; color: var(--text);">${titulo}</h3>
                <p style="font-size: 14px; color: var(--text-light); margin-bottom: 25px; line-height: 1.5;">${mensaje}</p>
                
                <div style="display: flex; gap: 10px;">
                    <button id="confirmCancelar" style="
                        flex: 1;
                        padding: 12px;
                        border: 1.5px solid var(--border);
                        border-radius: 10px;
                        background: white;
                        color: var(--text);
                        font-weight: 600;
                        cursor: pointer;
                        transition: 0.2s;
                    ">Cancelar</button>
                    
                    <button id="confirmAceptar" style="
                        flex: 1;
                        padding: 12px;
                        border: none;
                        border-radius: 10px;
                        background: ${colorBoton};
                        color: white;
                        font-weight: 600;
                        cursor: pointer;
                        transition: 0.2s;
                    ">${textoBoton}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const styleSheet = document.createElement("style");
        styleSheet.textContent = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        `;
        document.head.appendChild(styleSheet);

        overlay.querySelector("#confirmCancelar").addEventListener("click", () => {
            overlay.remove();
            resolve(false);
        });

        overlay.querySelector("#confirmAceptar").addEventListener("click", () => {
            overlay.remove();
            resolve(true);
        });

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(false);
            }
        });

        const handleEscape = (e) => {
            if (e.key === "Escape") {
                overlay.remove();
                document.removeEventListener("keydown", handleEscape);
                resolve(false);
            }
        };
        document.addEventListener("keydown", handleEscape);
    });
}

// ==========================================
// PROFESORES - TABS Y LISTAS
// ==========================================

let todosProfesores = [];
let tabProfesoresAdminActual = 'activos';

function switchTabProfesoresAdmin(tab) {
    tabProfesoresAdminActual = tab;
    
    const tabActivos = document.getElementById('tabProfesoresActivos');
    const tabInactivos = document.getElementById('tabProfesoresInactivos');
    
    if (tabActivos && tabInactivos) {
        tabActivos.classList.toggle('active', tab === 'activos');
        tabInactivos.classList.toggle('active', tab === 'inactivos');
    }
    
    document.querySelectorAll('#profesores .detail-tab[data-tab]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    if (tab === 'activos') {
        renderizarProfesores(todosProfesores.filter(p => p.activo !== false), 'profesoresActivosList');
    } else {
        renderizarProfesores(todosProfesores.filter(p => p.activo === false), 'profesoresInactivosList');
    }
}

async function cargarProfesoresAdmin() {
    const containerInicio = document.getElementById("profesoresList");
    if (containerInicio) containerInicio.innerHTML = '<div class="loading">Cargando profesores...</div>';

    try {
        const response = await fetch(`${API_URL}/profesores`);
        if (!response.ok) throw new Error("Error al cargar profesores.");

        todosProfesores = await response.json();

        // Para inicio: solo 4 profesores con scroll
        if (containerInicio) {
            const primeros4 = todosProfesores.slice(0, 4);
            renderizarProfesoresInicio(primeros4);
        }

        // Para sección profesores: separar activos e inactivos
        renderizarProfesores(todosProfesores.filter(p => p.activo !== false), 'profesoresActivosList');
        renderizarProfesores(todosProfesores.filter(p => p.activo === false), 'profesoresInactivosList');

    } catch (error) {
        console.error("Error:", error);
        if (containerInicio) {
            containerInicio.innerHTML = `<div class="empty-state">Error al cargar profesores.</div>`;
        }
    }
}

function renderizarProfesoresInicio(profesores) {
    const container = document.getElementById("profesoresList");
    if (!container) return;

    if (profesores.length === 0) {
        container.innerHTML = `<div class="empty-state"><strong>No hay profesores</strong></div>`;
        return;
    }

    container.innerHTML = profesores.map(prof => `
        <div class="admin-list-item">
            <div class="admin-list-info">
                <div class="admin-list-avatar">${(prof.nombre?.[0] || '')}${(prof.apellido?.[0] || '')}</div>
                <div>
                    <strong>${prof.nombre || ''} ${prof.apellido || ''}</strong>
                    <p>${prof.email || 'Sin email'}</p>
                    <small>${prof.totalClases || 0} clases</small>
                </div>
            </div>
            <div class="admin-list-actions">
                <button class="btn-ver-detalle" onclick="verDetalleProfesor(${prof.id})">
                    👁️ Ver detalle
                </button>
            </div>
        </div>
    `).join('');
}

function renderizarProfesores(profesores, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (profesores.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <strong>${containerId.includes('Inactivos') ? 'No hay profesores inactivos' : 'No hay profesores activos'}</strong>
            </div>
        `;
        return;
    }

    container.innerHTML = profesores.map(prof => `
        <div class="admin-list-item">
            <div class="admin-list-info">
                <div class="admin-list-avatar">${(prof.nombre?.[0] || '')}${(prof.apellido?.[0] || '')}</div>
                <div>
                    <strong>${prof.nombre || ''} ${prof.apellido || ''}</strong>
                    <p>${prof.email || 'Sin email'}</p>
                    <small>${prof.totalClases || 0} clases</small>
                </div>
            </div>
            <div class="admin-list-actions">
                <button class="btn-ver-detalle" onclick="verDetalleProfesor(${prof.id})">👁️ Detalle</button>
                ${prof.activo !== false 
                    ? `<button class="btn-toggle-estado" onclick="toggleEstadoProfesor(${prof.id}, false)">⛔ Desactivar</button>`
                    : `<button class="btn-reactivar" onclick="toggleEstadoProfesor(${prof.id}, true)">✅ Reactivar</button>`
                }
                <button class="btn-reset-password" onclick="resetearPasswordProfesor(${prof.id})">🔑</button>
            </div>
        </div>
    `).join('');
}

function filtrarProfesores() {
    const buscador = document.getElementById("buscadorProfesores");
    if (!buscador) return;

    const texto = buscador.value.toLowerCase().trim();

    if (!texto) {
        switchTabProfesoresAdmin(tabProfesoresAdminActual);
        return;
    }

    const filtrados = todosProfesores.filter(prof => {
        const nombreCompleto = `${prof.nombre || ''} ${prof.apellido || ''}`.toLowerCase();
        const email = (prof.email || '').toLowerCase();
        return nombreCompleto.includes(texto) || email.includes(texto);
    });

    if (tabProfesoresAdminActual === 'activos') {
        renderizarProfesores(filtrados.filter(p => p.activo !== false), 'profesoresActivosList');
    } else {
        renderizarProfesores(filtrados.filter(p => p.activo === false), 'profesoresInactivosList');
    }
}

// ==========================================
// TOGGLE ESTADO PROFESOR
// ==========================================

async function toggleEstadoProfesor(profesorId, activar) {
    const confirmacion = await mostrarModalConfirmacion(
        activar ? "¿Reactivar profesor?" : "¿Desactivar profesor?",
        activar ? "El profesor podrá acceder nuevamente." : "El profesor no podrá acceder hasta que lo reactives.",
        activar ? "✅ Sí, reactivar" : "⛔ Sí, desactivar",
        activar ? "#2ca66f" : "#d9366f"
    );

    if (!confirmacion) return;

    try {
        const response = await fetch(`${API_URL}/profesores/${profesorId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activo: activar })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.mensaje || "Error.");

        mostrarNotificacion(`✅ Profesor ${activar ? 'reactivado' : 'desactivado'}`, "success");
        
        await cargarProfesoresAdmin();
        await cargarEstadisticasAdmin();
        
        registrarAccion(activar ? "Reactivar Profesor" : "Desactivar Profesor", `ID: ${profesorId}`);

    } catch (error) {
        mostrarNotificacion("❌ " + error.message, "error");
    }
}

// ==========================================
// RESETEAR CONTRASEÑA
// ==========================================

async function resetearPasswordProfesor(profesorId) {
    const nuevaPassword = prompt("Ingresa la nueva contraseña (mínimo 6 caracteres):");
    
    if (!nuevaPassword) return;
    
    if (nuevaPassword.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/profesores/${profesorId}/password`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nuevaPassword: nuevaPassword })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.mensaje || "Error al resetear contraseña.");

        mostrarNotificacion("✅ Contraseña actualizada correctamente", "success");

    } catch (error) {
        mostrarNotificacion("❌ " + error.message, "error");
    }
}

// ==========================================
// DETALLE DE PROFESOR
// ==========================================

async function verDetalleProfesor(profesorId) {
    const modal = document.getElementById("modalDetalleProfesor");
    if (!modal) return;

    const profesor = todosProfesores.find(p => p.id === profesorId);
    if (!profesor) return;

    document.getElementById("detalleProfesorNombre").textContent = `${profesor.nombre || ''} ${profesor.apellido || ''}`;
    document.getElementById("detalleProfesorEmail").textContent = profesor.email || 'Sin email';

    modal.classList.add("show");

    await cargarClasesProfesor(profesorId);
}

async function cargarClasesProfesor(profesorId) {
    const container = document.getElementById("detalleProfesorClases");
    if (!container) return;

    container.innerHTML = '<div class="loading">Cargando clases...</div>';

    try {
        const response = await fetch(`${API_URL}/Profesores/clases/${profesorId}`);
        if (!response.ok) throw new Error("Error al cargar clases.");

        const clases = await response.json();

        const totalClases = clases.length;
        const totalEstudiantes = clases.reduce((sum, c) => sum + (c.totalEstudiantes || 0), 0);

        document.getElementById("detalleProfesorTotalClases").textContent = totalClases;
        document.getElementById("detalleProfesorTotalEstudiantes").textContent = totalEstudiantes;

        if (clases.length === 0) {
            container.innerHTML = `<div class="empty-state"><strong>No hay clases</strong></div>`;
            return;
        }

        container.innerHTML = clases.map(clase => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: var(--background); border-radius: 10px; border: 1px solid var(--border);">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: var(--purple-soft); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700;">▣</div>
                    <div>
                        <strong style="font-size: 14px; color: var(--text);">${clase.nombre || 'Sin nombre'}</strong>
                        <p style="font-size: 12px; color: var(--text-light); margin: 2px 0 0 0;">${clase.nivel || 'Sin nivel'} · ID: ${clase.id}</p>
                    </div>
                </div>
                <span style="padding: 4px 12px; border-radius: 20px; background: var(--blue-soft); color: var(--blue-dark); font-size: 12px; font-weight: 600;">
                    👨‍🎓 ${clase.totalEstudiantes || 0} estudiantes
                </span>
            </div>
        `).join('');

    } catch (error) {
        container.innerHTML = `<div class="empty-state">Error al cargar clases.</div>`;
    }
}

// ==========================================
// ESTUDIANTES - TABS Y LISTAS
// ==========================================

let todosEstudiantesAdmin = [];
let tabEstudiantesAdminActual = 'activos';

function switchTabEstudiantesAdmin(tab) {
    tabEstudiantesAdminActual = tab;
    
    const tabActivos = document.getElementById('tabEstudiantesAdminActivos');
    const tabInactivos = document.getElementById('tabEstudiantesAdminInactivos');
    
    if (tabActivos && tabInactivos) {
        tabActivos.classList.toggle('active', tab === 'activos');
        tabInactivos.classList.toggle('active', tab === 'inactivos');
    }
    
    document.querySelectorAll('#estudiantes .detail-tab[data-tab]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    if (tab === 'activos') {
        renderizarEstudiantesAdmin(todosEstudiantesAdmin.filter(e => e.activo !== false), 'estudiantesAdminList');
    } else {
        renderizarEstudiantesAdmin(todosEstudiantesAdmin.filter(e => e.activo === false), 'estudiantesAdminInactivosList');
    }
}

async function cargarEstudiantesAdmin() {
    const container = document.getElementById("estudiantesAdminList");
    if (container) container.innerHTML = '<div class="loading">Cargando estudiantes...</div>';

    try {
        const estudiantesResponse = await fetch(`${API_URL}/estudiantes/todos`);
        if (!estudiantesResponse.ok) throw new Error("Error al cargar estudiantes.");
        
        const activos = await estudiantesResponse.json();
        todosEstudiantesAdmin = activos.map(e => ({ ...e, activo: true }));

        const profesoresResponse = await fetch(`${API_URL}/profesores`);
        const profesores = profesoresResponse.ok ? await profesoresResponse.json() : [];

        const contador = document.getElementById("totalEstudiantesAdminCount");
        if (contador) contador.textContent = activos.length;

        renderizarEstudiantesAdmin(activos.map(e => ({ ...e, activo: true })), 'estudiantesAdminList', profesores);
        renderizarEstudiantesAdmin([], 'estudiantesAdminInactivosList', profesores);

    } catch (error) {
        if (container) container.innerHTML = `<div class="empty-state">Error al cargar estudiantes.</div>`;
    }
}

function renderizarEstudiantesAdmin(estudiantes, containerId, profesores = []) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (estudiantes.length === 0) {
        container.innerHTML = `<div class="empty-state"><strong>${containerId.includes('Inactivos') ? 'No hay estudiantes inactivos' : 'No hay estudiantes activos'}</strong></div>`;
        return;
    }

    container.innerHTML = estudiantes.map(est => {
        const iniciales = `${est.nombre?.[0] || ''}${est.apellido?.[0] || ''}`.toUpperCase();
        const nivel = est.esSecundaria ? 'Secundaria' : 'Primaria';
        
        let nombreProfesor = 'Sin profesor asignado';
        if (est.profesorId) {
            const profesor = profesores.find(p => p.id === est.profesorId);
            if (profesor) nombreProfesor = `${profesor.nombre || ''} ${profesor.apellido || ''}`;
        }
        
        return `
            <div class="admin-list-item">
                <div class="admin-list-info">
                    <div class="admin-list-avatar">${iniciales}</div>
                    <div>
                        <strong>${est.nombre || ''} ${est.apellido || ''}</strong>
                        <p>${est.email || 'Sin email'}</p>
                        <small>${nivel} · Profesor: ${nombreProfesor}</small>
                    </div>
                </div>
                <div class="admin-list-actions">
                    <span class="badge ${est.esSecundaria ? 'secundaria' : 'primaria'}">${nivel}</span>
                    <span class="badge ${est.activo !== false ? 'activo' : 'inactivo'}">${est.activo !== false ? '✅ Activo' : '⛔ Inactivo'}</span>
                </div>
            </div>
        `;
    }).join('');
}

function filtrarEstudiantesAdmin() {
    const buscador = document.getElementById("buscadorEstudiantesAdmin");
    if (!buscador) return;

    const texto = buscador.value.toLowerCase().trim();

    if (!texto) {
        switchTabEstudiantesAdmin(tabEstudiantesAdminActual);
        return;
    }

    const filtrados = todosEstudiantesAdmin.filter(est => {
        const nombreCompleto = `${est.nombre || ''} ${est.apellido || ''}`.toLowerCase();
        const email = (est.email || '').toLowerCase();
        return nombreCompleto.includes(texto) || email.includes(texto);
    });

    const contador = document.getElementById("totalEstudiantesAdminCount");
    if (contador) contador.textContent = filtrados.length;

    if (tabEstudiantesAdminActual === 'activos') {
        renderizarEstudiantesAdmin(filtrados.filter(e => e.activo !== false), 'estudiantesAdminList');
    } else {
        renderizarEstudiantesAdmin(filtrados.filter(e => e.activo === false), 'estudiantesAdminInactivosList');
    }
}

// ==========================================
// AUDITORÍA BÁSICA
// ==========================================

function registrarAccion(accion, detalles) {
    const logs = JSON.parse(localStorage.getItem("auditoriaAdmin") || "[]");
    logs.unshift({
        fecha: new Date().toISOString(),
        admin: usuarioActual?.nombre || "Admin",
        accion: accion,
        detalles: detalles
    });
    if (logs.length > 100) logs.pop();
    localStorage.setItem("auditoriaAdmin", JSON.stringify(logs));
}

function verAuditoria() {
    const logs = JSON.parse(localStorage.getItem("auditoriaAdmin") || "[]");
    if (logs.length === 0) {
        alert("No hay registros de auditoría.");
        return;
    }
    
    const modal = document.createElement("div");
    modal.style.cssText = `position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(35, 25, 75, 0.45); backdrop-filter: blur(5px);`;
    modal.innerHTML = `
        <div style="width: 100%; max-width: 600px; max-height: 80vh; overflow-y: auto; background: white; border-radius: 20px; padding: 30px; position: relative;">
            <button onclick="this.closest('div[style]').parentElement.remove()" style="position: absolute; top: 15px; right: 20px; width: 35px; height: 35px; border: none; border-radius: 50%; background: #f5f2fb; color: #777296; font-size: 20px; cursor: pointer;">×</button>
            <h2 style="margin-bottom: 20px; font-size: 22px;">🔍 Auditoría</h2>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${logs.map(log => `
                    <div style="padding: 14px; background: #faf9ff; border-radius: 10px; border: 1px solid var(--border);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <strong style="font-size: 14px;">${log.accion}</strong>
                            <span style="font-size: 11px; color: var(--text-light);">${new Date(log.fecha).toLocaleString('es-NI')}</span>
                        </div>
                        <p style="font-size: 13px; color: var(--text-light); margin: 0;">${log.detalles}</p>
                        <small style="font-size: 11px; color: var(--text-muted);">Por: ${log.admin}</small>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
}

// ==========================================
// MODAL CREAR PROFESOR
// ==========================================

function abrirModalCrearProfesor() {
    const modal = document.getElementById("modalCrearProfesor");
    if (!modal) return;
    modal.classList.add("show");
    document.getElementById("formCrearProfesor").reset();
    document.getElementById("profesorMessage").textContent = "";
}

// ==========================================
// GENERAR CORREO PROFESOR
// ==========================================

async function generarCorreoProfesor() {
    const nombre = document.getElementById("profesorNombre").value.trim();
    const apellido = document.getElementById("profesorApellido").value.trim();
    const emailInput = document.getElementById("profesorEmail");
    const year = "26";

    if (!nombre || !apellido) {
        emailInput.value = "";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/profesores`);
        const profesores = await response.json();
        let maxId = 0;
        profesores.forEach(p => { if (p.id > maxId) maxId = p.id; });
        const nextId = maxId + 1;
        const email = `${nombre.toLowerCase()}.${apellido.toLowerCase()}${year}${nextId}@doc.com`;
        emailInput.value = email;
        emailInput.dataset.nextId = nextId;
    } catch (error) {
        const timestamp = Date.now().toString().slice(-4);
        emailInput.value = `${nombre.toLowerCase()}.${apellido.toLowerCase()}${year}${timestamp}@doc.com`;
    }
}

// ==========================================
// CREAR PROFESOR
// ==========================================

document.getElementById("formCrearProfesor").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("profesorNombre").value.trim();
    const apellido = document.getElementById("profesorApellido").value.trim();
    const email = document.getElementById("profesorEmail").value.trim();
    const password = document.getElementById("profesorPassword").value;
    const message = document.getElementById("profesorMessage");

    if (!nombre || !apellido || !email || !password) {
        message.textContent = "Todos los campos son obligatorios.";
        message.style.color = "#d9366f";
        return;
    }

    if (password.length < 6) {
        message.textContent = "La contraseña debe tener al menos 6 caracteres.";
        message.style.color = "#d9366f";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/profesores/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, apellido, email, password, rol: "profesor" })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.mensaje || "Error al crear profesor.");

        message.textContent = `✅ Profesor creado correctamente. Correo: ${email}`;
        message.style.color = "#2ca66f";

        cerrarModal("modalCrearProfesor");
        await Promise.all([cargarProfesoresAdmin(), cargarEstadisticasAdmin()]);

        document.getElementById("formCrearProfesor").reset();
        document.getElementById("profesorEmail").value = "";

    } catch (error) {
        message.textContent = "❌ " + error.message;
        message.style.color = "#d9366f";
    }
});

// ==========================================
// CERRAR SESIÓN
// ==========================================

document.getElementById("cerrarSesion").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("usuario");
    localStorage.removeItem("profesor");
    localStorage.removeItem("estudiante");
    window.location.href = "login.html";
});

// ==========================================
// NAVEGACIÓN
// ==========================================

const sections = document.querySelectorAll(".dashboard-section");
const menuItems = document.querySelectorAll(".menu-item[data-section]");

function showSection(sectionId) {
    sections.forEach(section => section.classList.remove("active-section"));
    const section = document.getElementById(sectionId);
    if (section) section.classList.add("active-section");
    menuItems.forEach(item => item.classList.toggle("active", item.dataset.section === sectionId));
}

menuItems.forEach(item => {
    item.addEventListener("click", (event) => {
        event.preventDefault();
        showSection(item.dataset.section);
    });
});

// ==========================================
// INICIALIZAR
// ==========================================

async function initializeAdmin() {
    console.log("Inicializando panel de administración...");
    cargarDatosAdmin();
    await Promise.all([
        cargarEstadisticasAdmin(),
        cargarProfesoresAdmin(),
        cargarEstudiantesAdmin()
    ]);
    console.log("Panel de administración cargado correctamente.");
}

initializeAdmin();

// ==========================================
// UTILIDADES
// ==========================================

function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("show");
}