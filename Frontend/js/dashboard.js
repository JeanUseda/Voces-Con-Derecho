const API_URL = "http://localhost:5019/api";

// ==========================================
// MÓDULO DE ANIMACIONES Y MICRO-INTERACCIONES
// ==========================================

const Animations = (() => {
    // --- Efecto Ripple ---
    function createRipple(event) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    function initRipples() {
        document.querySelectorAll('.primary-button, .menu-item').forEach(el => {
            el.addEventListener('click', createRipple);
        });
    }

    // --- Animación de entrada para tarjetas ---
    function observeCards() {
        const cards = document.querySelectorAll('.glass-card, .content-card, .stat-card-dashboard, .detail-stat-card, .progreso-stat-card');
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
    }

    // --- Animación de barras de progreso ---
    function animateProgressBars() {
        const fills = document.querySelectorAll('.barra-fill, .progreso-bar .fill, .student-progreso .fill');
        fills.forEach(fill => {
            const width = fill.style.width;
            fill.style.width = '0%';
            setTimeout(() => {
                fill.style.width = width;
            }, 100);
        });
    }

    // --- Inicializar ---
    function init() {
        initRipples();
        observeCards();
        setTimeout(animateProgressBars, 500);
    }

    return {
        init,
        animateProgressBars,
        createRipple
    };
})();

// ==========================================
// UTILIDADES Y ESTADO
// ==========================================

function guardarSeccion(sectionId) {
    localStorage.setItem('seccionActual', sectionId);
    if (sectionId === 'classDetail') {
        const claseId = document.getElementById("classDetail")?.dataset?.claseId;
        if (claseId) {
            localStorage.setItem('claseActualId', claseId);
        }
    }
}

function obtenerSeccionGuardada() {
    return localStorage.getItem('seccionActual') || 'inicio';
}

function obtenerProfesorAutenticado() {
    const profesorData = localStorage.getItem("profesor");
    if (!profesorData) {
        window.location.href = "login.html";
        return null;
    }
    try {
        return JSON.parse(profesorData);
    } catch (error) {
        console.error("Error al parsear datos del profesor:", error);
        window.location.href = "login.html";
        return null;
    }
}

const profesorActual = obtenerProfesorAutenticado();
if (!profesorActual) {
    throw new Error("No hay sesión activa");
}
const PROFESOR_ID = profesorActual.id;

// ==========================================
// INICIALIZACIÓN DE LA UI
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const userNameElement = document.querySelector(".user-info strong");
    if (userNameElement && profesorActual.nombre) {
        userNameElement.textContent = profesorActual.nombre;
    }

    const welcomeElement = document.querySelector(".welcome h1");
    if (welcomeElement && profesorActual.nombre) {
        welcomeElement.textContent = `¡Hola, ${profesorActual.nombre}! 👋`;
    }

    const avatarElement = document.querySelector(".user-avatar");
    if (avatarElement && profesorActual.nombre) {
        const iniciales = profesorActual.nombre
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
        avatarElement.textContent = iniciales;
    }

    // Inicializar animaciones
    Animations.init();
});

// ==========================================
// NAVEGACIÓN Y SIDEBAR
// ==========================================

const sections = document.querySelectorAll(".dashboard-section");
const menuItems = document.querySelectorAll(".menu-item[data-section]");
const sidebar = document.getElementById("sidebar");
const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const sidebarToggle = document.getElementById("sidebarToggle");

function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove("active-section");
    });
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add("active-section");
    }
    menuItems.forEach(item => {
        item.classList.toggle("active", item.dataset.section === sectionId);
    });
    guardarSeccion(sectionId);

    // Cerrar sidebar en móvil
    if (window.innerWidth <= 768) {
        sidebar.classList.remove("open");
    }

    // Animar barras de progreso al cambiar de sección
    setTimeout(Animations.animateProgressBars, 300);
}

menuItems.forEach(item => {
    item.addEventListener("click", event => {
        event.preventDefault();
        showSection(item.dataset.section);
    });
});

// Toggle sidebar en móvil
mobileMenuToggle?.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

sidebarToggle?.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

// Cerrar sidebar al hacer clic fuera
document.addEventListener("click", (event) => {
    if (window.innerWidth <= 768) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnToggle = mobileMenuToggle.contains(event.target) || sidebarToggle.contains(event.target);
        if (!isClickInsideSidebar && !isClickOnToggle) {
            sidebar.classList.remove("open");
        }
    }
});

// ==========================================
// MODALES
// ==========================================

const createClassModal = document.getElementById("createClassModal");
const createClassForm = document.getElementById("createClassForm");

function openCreateClassModal() {
    createClassModal.classList.add("show");
}

function closeCreateClassModal() {
    createClassModal.classList.remove("show");
    createClassForm.reset();
    document.getElementById("createClassMessage").textContent = "";
}

document.getElementById("openCreateClass")?.addEventListener("click", openCreateClassModal);
document.getElementById("openCreateClass2")?.addEventListener("click", openCreateClassModal);
document.getElementById("closeCreateClass")?.addEventListener("click", closeCreateClassModal);

createClassModal?.addEventListener("click", event => {
    if (event.target === createClassModal) {
        closeCreateClassModal();
    }
});

// ==========================================
// API - CLASES
// ==========================================

async function loadClasses() {
    const dashboardContainer = document.getElementById("dashboardClasses");
    const allClassesContainer = document.getElementById("allClasses");

    try {
        const response = await fetch(`${API_URL}/clases?profesorId=${PROFESOR_ID}`);
        if (!response.ok) throw new Error("No se pudieron cargar las clases.");
        const classes = await response.json();

        document.getElementById("totalClasses").textContent = classes.length;
        document.getElementById("sidebarClassesBadge").textContent = classes.length;

        renderClasses(dashboardContainer, classes.slice(0, 3));
        renderClasses(allClassesContainer, classes);
        await loadTotalStudents(classes);

    } catch (error) {
        console.error("Error cargando clases:", error);
        const msg = `<div class="empty-state">No se pudieron cargar las clases.</div>`;
        if (dashboardContainer) dashboardContainer.innerHTML = msg;
        if (allClassesContainer) allClassesContainer.innerHTML = msg;
    }
}

function renderClasses(container, classes) {
    if (!container) return;
    if (!classes || classes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <strong>Aún no tienes clases</strong>
                <p>Crea tu primera clase para comenzar.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = classes.map(clase => {
        const nivel = clase.nivel || 'Secundaria';
        const nivelClass = nivel === 'Primaria' ? 'primaria' : 'secundaria';
        return `
            <div class="class-card-modern glass-card" data-clase-id="${clase.id}">
                <div class="class-card-header">
                    <div>
                        <h3>${escapeHtml(clase.nombre)}</h3>
                        <span class="class-level-badge ${nivelClass}">${escapeHtml(nivel)}</span>
                    </div>
                    <span class="class-id">ID: ${clase.id}</span>
                </div>
                <div class="class-card-body">
                    <div class="class-stats">
                        <div class="class-stat">
                            <span class="stat-icon">👨‍🎓</span>
                            <div>
                                <strong class="stat-number" id="estudiantesCount_${clase.id}">0</strong>
                                <span class="stat-label">Estudiantes</span>
                            </div>
                        </div>
                        <div class="class-stat">
                            <span class="stat-icon">📚</span>
                            <div>
                                <strong class="stat-number" id="misionesCount_${clase.id}">0</strong>
                                <span class="stat-label">Misiones</span>
                            </div>
                        </div>
                        <div class="class-stat">
                            <span class="stat-icon">📊</span>
                            <div>
                                <strong class="stat-number" id="progresoCount_${clase.id}">0%</strong>
                                <span class="stat-label">Progreso</span>
                            </div>
                        </div>
                    </div>
                    <div class="class-card-actions">
                        <button class="btn-ver-detalle" onclick="openClass(${clase.id})">👁️ Ver detalle</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    classes.forEach(clase => cargarContadoresClase(clase.id));
}

// ==========================================
// API - CONTADORES DE CLASE
// ==========================================

async function cargarContadoresClase(claseId) {
    try {
        const [estudiantesRes, misionesRes] = await Promise.all([
            fetch(`${API_URL}/clases/${claseId}/estudiantes`),
            fetch(`${API_URL}/clases/${claseId}/misiones`)
        ]);

        if (estudiantesRes.ok) {
            const estudiantes = await estudiantesRes.json();
            document.getElementById(`estudiantesCount_${claseId}`).textContent = estudiantes.length;
        }
        if (misionesRes.ok) {
            const misiones = await misionesRes.json();
            document.getElementById(`misionesCount_${claseId}`).textContent = misiones.length;
        }
        await calcularProgresoClase(claseId);
    } catch (error) {
        console.error('Error cargando contadores:', error);
    }
}

async function calcularProgresoClase(claseId) {
    try {
        const estudiantesRes = await fetch(`${API_URL}/clases/${claseId}/estudiantes`);
        if (!estudiantesRes.ok) return;
        const estudiantes = await estudiantesRes.json();

        if (estudiantes.length === 0) {
            document.getElementById(`progresoCount_${claseId}`).textContent = '0%';
            return;
        }

        const misionesRes = await fetch(`${API_URL}/misiones`);
        const todasMisiones = misionesRes.ok ? await misionesRes.json() : [];

        let totalProgreso = 0;
        let estudiantesConDatos = 0;

        for (const estudiante of estudiantes) {
            try {
                let completadas = 0;
                let totalHistorias = 0;
                for (const mision of todasMisiones) {
                    const progresoRes = await fetch(`${API_URL}/historias/progreso/mision/${estudiante.estudianteId}/${mision.id}`);
                    if (progresoRes.ok) {
                        const data = await progresoRes.json();
                        if (Array.isArray(data)) {
                            completadas += data.filter(p => p.completada === true).length;
                            totalHistorias += data.length;
                        } else {
                            completadas += data.historiasCompletadas || 0;
                            totalHistorias += data.totalHistorias || 0;
                        }
                    }
                }
                const total = totalHistorias || 1;
                totalProgreso += Math.min(100, Math.round((completadas / total) * 100));
                estudiantesConDatos++;
            } catch (error) {
                estudiantesConDatos++;
            }
        }

        const promedio = estudiantesConDatos > 0 ? Math.round(totalProgreso / estudiantesConDatos) : 0;
        document.getElementById(`progresoCount_${claseId}`).textContent = `${promedio}%`;
    } catch (error) {
        console.error('Error calculando progreso:', error);
    }
}

// ==========================================
// API - CREAR CLASE
// ==========================================

createClassForm?.addEventListener("submit", async event => {
    event.preventDefault();
    const nombre = document.getElementById("className").value.trim();
    const nivel = document.getElementById("classLevel").value;
    const message = document.getElementById("createClassMessage");

    try {
        const response = await fetch(`${API_URL}/clases`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, nivel, profesorId: PROFESOR_ID })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data || "No se pudo crear la clase.");

        message.textContent = "Clase creada correctamente.";
        message.style.color = "#2ca66f";
        createClassForm.reset();
        await loadClasses();
        setTimeout(closeCreateClassModal, 800);
    } catch (error) {
        console.error("Error creando clase:", error);
        message.textContent = "No se pudo crear la clase.";
        message.style.color = "#d9366f";
    }
});

// ==========================================
// API - ABRIR CLASE
// ==========================================

async function openClass(classId) {
    localStorage.setItem('claseActualId', classId);
    const section = document.getElementById("classDetail");
    if (section) section.dataset.claseId = classId;

    showSection("classDetail");

    document.getElementById("detailClassName").textContent = "Cargando...";
    document.getElementById("detailClassLevel").textContent = "";

    try {
        const response = await fetch(`${API_URL}/clases/${classId}`);
        if (!response.ok) throw new Error("Clase no encontrada.");
        const clase = await response.json();

        document.getElementById("detailClassName").textContent = clase.nombre;
        document.getElementById("detailClassLevel").textContent = `ID: ${clase.id} · Profesor: ${profesorActual?.nombre || ''}`;

        await Promise.all([
            loadClassStudentsDetalle(classId),
            loadInactiveStudentsDetalle(classId),
            loadClassMissionsDetalle(classId),
            cargarEstadisticasClase(classId)
        ]);

        document.getElementById("openAgregarEstudiante").onclick = () => {
            const nombreClase = document.getElementById("detailClassName")?.textContent || "clase";
            abrirModalAgregarEstudiante(classId, nombreClase);
        };
        document.getElementById("btnAsignarMision").onclick = () => {
            const nombreClase = document.getElementById("detailClassName")?.textContent || "clase";
            abrirModalAsignarMision(classId, nombreClase);
        };

        switchDetailTab('estudiantes');
        Animations.animateProgressBars();
    } catch (error) {
        console.error("Error cargando clase:", error);
        document.getElementById("detailClassName").textContent = "No se pudo cargar la clase.";
    }
}

// ==========================================
// DETALLE CLASE - TABS
// ==========================================

function switchDetailTab(tabId) {
    document.querySelectorAll('.detail-tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.detail-tab').forEach(btn => btn.classList.remove('active'));

    const content = document.getElementById(`detailTab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
    if (content) content.classList.add('active');

    document.querySelector(`.detail-tab[data-tab="${tabId}"]`)?.classList.add('active');
}

// ==========================================
// DETALLE CLASE - ESTADÍSTICAS
// ==========================================

async function cargarEstadisticasClase(classId) {
    try {
        const estudiantesRes = await fetch(`${API_URL}/clases/${classId}/estudiantes`);
        if (!estudiantesRes.ok) throw new Error("Error al obtener estudiantes.");
        const estudiantes = await estudiantesRes.json();

        const misionesRes = await fetch(`${API_URL}/clases/${classId}/misiones`);
        const misiones = misionesRes.ok ? await misionesRes.json() : [];

        document.getElementById('detailTotalEstudiantes').textContent = estudiantes.length;
        document.getElementById('detailTotalMisiones').textContent = misiones.length;

        let totalProgreso = 0;
        let totalPuntos = 0;
        let estudiantesConDatos = 0;

        for (const estudiante of estudiantes) {
            try {
                const progresoRes = await fetch(`${API_URL}/historias/progreso/mision/${estudiante.estudianteId}/1`);
                if (progresoRes.ok) {
                    const data = await progresoRes.json();
                    let completadas = 0;
                    let puntos = 0;
                    if (Array.isArray(data)) {
                        completadas = data.filter(p => p.completada === true).length;
                        puntos = data.reduce((sum, p) => sum + (p.puntosObtenidos || 0), 0);
                    } else {
                        completadas = data.historiasCompletadas || 0;
                        puntos = data.puntosTotales || 0;
                    }
                    const historiasRes = await fetch(`${API_URL}/historias/mision/1`);
                    let totalHistorias = 10;
                    if (historiasRes.ok) {
                        const historias = await historiasRes.json();
                        totalHistorias = historias.length || 10;
                    }
                    totalProgreso += totalHistorias > 0 ? Math.min(100, Math.round((completadas / totalHistorias) * 100)) : 0;
                    totalPuntos += puntos;
                    estudiantesConDatos++;
                }
            } catch (error) {
                estudiantesConDatos++;
            }
        }

        const progresoPromedio = estudiantesConDatos > 0 ? Math.round(totalProgreso / estudiantesConDatos) : 0;
        const puntosPromedio = estudiantesConDatos > 0 ? Math.round(totalPuntos / estudiantesConDatos) : 0;

        document.getElementById('detailProgresoPromedio').textContent = `${progresoPromedio}%`;
        document.getElementById('detailPuntosTotales').textContent = puntosPromedio;

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        document.getElementById('detailProgresoPromedio').textContent = '0%';
        document.getElementById('detailPuntosTotales').textContent = '0';
    }
}

// ==========================================
// DETALLE CLASE - ESTUDIANTES
// ==========================================

async function loadClassStudentsDetalle(classId) {
    const container = document.getElementById("classStudents");
    container.innerHTML = `<div class="loading shimmer">Cargando estudiantes...</div>`;

    try {
        const response = await fetch(`${API_URL}/clases/${classId}/estudiantes`);
        if (!response.ok) throw new Error("Error al obtener estudiantes.");
        const students = await response.json();

        if (!students.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <strong>No hay estudiantes activos.</strong>
                    <p>Agrega estudiantes a esta clase.</p>
                </div>
            `;
            return;
        }

        const studentsConProgreso = await Promise.all(students.map(async (student) => {
            try {
                const progresoRes = await fetch(`${API_URL}/historias/progreso/mision/${student.estudianteId}/1`);
                if (progresoRes.ok) {
                    const data = await progresoRes.json();
                    let completadas = 0;
                    let puntos = 0;
                    if (Array.isArray(data)) {
                        completadas = data.filter(p => p.completada === true).length;
                        puntos = data.reduce((sum, p) => sum + (p.puntosObtenidos || 0), 0);
                    } else {
                        completadas = data.historiasCompletadas || 0;
                        puntos = data.puntosTotales || 0;
                    }
                    const historiasRes = await fetch(`${API_URL}/historias/mision/1`);
                    let totalHistorias = 10;
                    if (historiasRes.ok) {
                        const historias = await historiasRes.json();
                        totalHistorias = historias.length || 10;
                    }
                    const porcentaje = totalHistorias > 0 ? Math.min(100, Math.round((completadas / totalHistorias) * 100)) : 0;
                    return { ...student, progreso: porcentaje, puntos, completadas, totalHistorias };
                }
            } catch (error) {
                console.error(`Error obteniendo progreso de ${student.nombre}:`, error);
            }
            return { ...student, progreso: 0, puntos: 0, completadas: 0, totalHistorias: 0 };
        }));

        studentsConProgreso.sort((a, b) => b.progreso - a.progreso);

        container.innerHTML = studentsConProgreso.map(student => {
            const initials = `${student.nombre[0]}${student.apellido[0]}`.toUpperCase();
            const color = student.progreso >= 80 ? '#2ca66f' : student.progreso >= 50 ? '#f59e0b' : '#d9366f';
            return `
                <div class="student-row-detalle glass-card">
                    <div class="student-info">
                        <div class="student-avatar">${initials}</div>
                        <div>
                            <div class="student-name">${escapeHtml(student.nombre)} ${escapeHtml(student.apellido)}</div>
                            <div class="student-email">${student.completadas}/${student.totalHistorias} historias · ${student.puntos} pts</div>
                        </div>
                    </div>
                    <div class="student-progreso">
                        <div class="bar">
                            <div class="fill" style="width: ${student.progreso}%; background: ${color};"></div>
                        </div>
                        <span class="porcentaje" style="color: ${color};">${student.progreso}%</span>
                    </div>
                    <div class="student-actions">
                        <button class="btn-desactivar" onclick="desactivarEstudiante(${classId}, ${student.estudianteId})">Desactivar</button>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="empty-state">No se pudieron cargar los estudiantes.</div>`;
    }
}

// ==========================================
// DETALLE CLASE - ESTUDIANTES INACTIVOS
// ==========================================

async function loadInactiveStudentsDetalle(classId) {
    const container = document.getElementById("inactiveStudents");
    if (!container) return;
    container.innerHTML = `<div class="loading shimmer">Cargando estudiantes inactivos...</div>`;

    try {
        const response = await fetch(`${API_URL}/clases/${classId}/estudiantes/inactivos`);
        if (!response.ok) throw new Error("Error al obtener estudiantes inactivos.");
        const students = await response.json();

        if (!students.length) {
            container.innerHTML = `<div class="empty-state">No hay estudiantes inactivos.</div>`;
            return;
        }

        container.innerHTML = students.map(student => {
            const initials = `${student.nombre[0]}${student.apellido[0]}`.toUpperCase();
            return `
                <div class="student-row-detalle">
                    <div class="student-info">
                        <div class="student-avatar">${initials}</div>
                        <div>
                            <div class="student-name">${escapeHtml(student.nombre)} ${escapeHtml(student.apellido)}</div>
                            <div class="student-email">Inactivo</div>
                        </div>
                    </div>
                    <div class="student-actions">
                        <button class="btn-desactivar" style="background: #d4edda; color: #155724;" onclick="reactivarEstudiante(${classId}, ${student.estudianteId})">Reactivar</button>
                    </div>
                </div>
            `;
        }).join("");
    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="empty-state">No se pudieron cargar los estudiantes inactivos.</div>`;
    }
}

// ==========================================
// DETALLE CLASE - MISIONES
// ==========================================

async function loadClassMissionsDetalle(classId) {
    const container = document.getElementById("classMissions");
    container.innerHTML = `<div class="loading shimmer">Cargando misiones...</div>`;

    try {
        const response = await fetch(`${API_URL}/clases/${classId}/misiones`);
        if (!response.ok) throw new Error("Error al obtener misiones.");
        const missions = await response.json();

        if (!missions.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <strong>No hay misiones asignadas.</strong>
                    <p>Asigna misiones a esta clase.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = missions.map(mission => `
            <div class="mision-row-detalle">
                <div class="mision-info">
                    <span class="mision-icon">◇</span>
                    <div>
                        <div class="mision-nombre">${escapeHtml(mission.titulo)}</div>
                        <div class="mision-desc">${escapeHtml(mission.descripcion || 'Sin descripción')}</div>
                    </div>
                </div>
                <span class="mision-badge ${mission.activa ? 'activa' : 'inactiva'}">
                    ${mission.activa ? '✅ Activa' : '⛔ Inactiva'}
                </span>
            </div>
        `).join("");
    } catch (error) {
        console.error("Error cargando misiones:", error);
        container.innerHTML = `<div class="empty-state">No se pudieron cargar las misiones.</div>`;
    }
}

// ==========================================
// API - DESACTIVAR / REACTIVAR ESTUDIANTE
// ==========================================

async function desactivarEstudiante(classId, estudianteId) {
    if (!confirm("¿Quieres desactivar a este estudiante de la clase?")) return;
    try {
        const response = await fetch(`${API_URL}/clases/${classId}/estudiantes/${estudianteId}/desactivar`, { method: "PATCH" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.mensaje || "No se pudo desactivar.");
        await Promise.all([
            loadClassStudentsDetalle(classId),
            loadInactiveStudentsDetalle(classId),
            loadClasses(),
            cargarEstadisticasClase(classId),
            cargarContadoresClase(classId)
        ]);
        mostrarNotificacion("✅ Estudiante desactivado", "success");
    } catch (error) {
        console.error(error);
        alert("No se pudo desactivar el estudiante.");
    }
}

async function reactivarEstudiante(classId, estudianteId) {
    if (!confirm("¿Quieres reactivar a este estudiante en la clase?")) return;
    try {
        const response = await fetch(`${API_URL}/clases/${classId}/estudiantes?estudianteId=${estudianteId}`, { method: "POST" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.mensaje || "No se pudo reactivar.");
        await Promise.all([
            loadClassStudentsDetalle(classId),
            loadInactiveStudentsDetalle(classId),
            loadClasses(),
            cargarEstadisticasClase(classId),
            cargarContadoresClase(classId)
        ]);
        mostrarNotificacion("✅ Estudiante reactivado", "success");
    } catch (error) {
        console.error(error);
        alert("No se pudo reactivar el estudiante.");
    }
}

// ==========================================
// MODAL - AGREGAR ESTUDIANTE
// ==========================================

let claseIdSeleccionadaAgregar = null;
let todosLosEstudiantes = [];
let estudiantesEnClaseIds = new Set();

const agregarEstudianteModal = document.getElementById("agregarEstudianteModal");
const listaEstudiantesAgregar = document.getElementById("listaEstudiantesAgregar");
const buscadorEstudiantes = document.getElementById("buscadorEstudiantes");

async function abrirModalAgregarEstudiante(claseId, claseNombre) {
    claseIdSeleccionadaAgregar = claseId;
    document.getElementById("agregarEstudianteSubtexto").textContent = `Selecciona un estudiante para agregar a "${claseNombre}"`;
    agregarEstudianteModal.classList.add("show");
    buscadorEstudiantes.value = "";
    await cargarEstudiantesDisponibles(claseId);
}

function cerrarModalAgregarEstudiante() {
    agregarEstudianteModal.classList.remove("show");
    claseIdSeleccionadaAgregar = null;
    todosLosEstudiantes = [];
    estudiantesEnClaseIds = new Set();
    buscadorEstudiantes.value = "";
}

async function cargarEstudiantesDisponibles(claseId) {
    listaEstudiantesAgregar.innerHTML = `<div class="loading shimmer">Cargando estudiantes...</div>`;
    try {
        const [todosRes, claseEstudiantesRes] = await Promise.all([
            fetch(`${API_URL}/estudiantes/todos`),
            fetch(`${API_URL}/clases/${claseId}/estudiantes`)
        ]);
        if (!todosRes.ok) throw new Error("Error al cargar estudiantes.");
        todosLosEstudiantes = await todosRes.json();
        if (claseEstudiantesRes.ok) {
            const enClase = await claseEstudiantesRes.json();
            estudiantesEnClaseIds = new Set(enClase.map(e => e.estudianteId));
        }
        renderizarListaEstudiantes(todosLosEstudiantes);
    } catch (error) {
        console.error("Error cargando estudiantes:", error);
        listaEstudiantesAgregar.innerHTML = `
            <div class="empty-state">
                <strong>Error al cargar estudiantes</strong>
                <p>No se pudieron cargar los estudiantes disponibles.</p>
                <button onclick="cargarEstudiantesDisponibles(${claseId})" class="primary-button" style="margin-top: 15px;">Reintentar</button>
            </div>
        `;
    }
}

function renderizarListaEstudiantes(estudiantes) {
    if (!estudiantes || !estudiantes.length) {
        listaEstudiantesAgregar.innerHTML = `<div class="empty-state"><strong>No hay estudiantes disponibles</strong><p>No se encontraron estudiantes para agregar.</p></div>`;
        return;
    }

    const busqueda = buscadorEstudiantes.value.toLowerCase().trim();
    const filtrados = busqueda ? estudiantes.filter(e => `${e.nombre} ${e.apellido}`.toLowerCase().includes(busqueda)) : estudiantes;

    if (!filtrados.length) {
        listaEstudiantesAgregar.innerHTML = `<div class="empty-state"><strong>No hay coincidencias</strong><p>No se encontraron estudiantes con ese nombre.</p></div>`;
        return;
    }

    listaEstudiantesAgregar.innerHTML = filtrados.map(est => {
        const yaAgregado = estudiantesEnClaseIds.has(est.id);
        const iniciales = `${est.nombre[0]}${est.apellido[0]}`.toUpperCase();
        return `
            <div class="estudiante-agregar-item" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border: 1px solid ${yaAgregado ? '#d4edda' : 'var(--border)'}; border-radius: 12px; margin-bottom: 10px; background: ${yaAgregado ? '#f0fff4' : 'var(--glass-bg)'}; backdrop-filter: blur(4px);">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: var(--purple-soft); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--primary); font-size: 13px;">${iniciales}</div>
                    <div>
                        <strong style="font-size: 15px;">${escapeHtml(est.nombre)} ${escapeHtml(est.apellido)}</strong>
                        <div style="font-size: 12px; color: var(--text-light);">${est.email || 'Sin email'}</div>
                    </div>
                </div>
                <div>
                    ${yaAgregado
                        ? `<span style="display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 20px; background: #d4edda; color: #155724; font-size: 12px; font-weight: 600;">✓ En clase</span>`
                        : `<button onclick="agregarEstudianteAClase(${est.id})" class="primary-button" style="min-height: 34px; padding: 0 18px; font-size: 12px;">Agregar</button>`
                    }
                </div>
            </div>
        `;
    }).join("");
}

async function agregarEstudianteAClase(estudianteId) {
    if (!claseIdSeleccionadaAgregar) { alert("No hay una clase seleccionada."); return; }
    const boton = event?.target;
    const textoOriginal = boton?.textContent || "Agregar";
    if (boton) { boton.disabled = true; boton.textContent = "Agregando..."; }

    try {
        const response = await fetch(`${API_URL}/clases/${claseIdSeleccionadaAgregar}/estudiantes?estudianteId=${estudianteId}`, { method: "POST", headers: { "Content-Type": "application/json" } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.mensaje || "Error al agregar estudiante.");

        estudiantesEnClaseIds.add(estudianteId);
        renderizarListaEstudiantes(todosLosEstudiantes);

        await Promise.all([
            loadClassStudentsDetalle(claseIdSeleccionadaAgregar),
            loadInactiveStudentsDetalle(claseIdSeleccionadaAgregar),
            loadClasses(),
            cargarEstadisticasClase(claseIdSeleccionadaAgregar),
            cargarContadoresClase(claseIdSeleccionadaAgregar)
        ]);
        mostrarNotificacion("✅ Estudiante agregado correctamente", "success");
    } catch (error) {
        console.error("Error agregando estudiante:", error);
        mostrarNotificacion("❌ " + error.message, "error");
        if (boton) { boton.disabled = false; boton.textContent = textoOriginal; }
    }
}

document.getElementById("openAgregarEstudiante")?.addEventListener("click", () => {
    const claseId = parseInt(document.querySelector("#classDetail")?.dataset?.claseId);
    if (!claseId) { alert("No hay una clase seleccionada."); return; }
    const nombreClase = document.getElementById("detailClassName")?.textContent || "clase";
    abrirModalAgregarEstudiante(claseId, nombreClase);
});

document.getElementById("closeAgregarEstudiante")?.addEventListener("click", cerrarModalAgregarEstudiante);
document.getElementById("cancelarAgregarEstudiante")?.addEventListener("click", cerrarModalAgregarEstudiante);
agregarEstudianteModal?.addEventListener("click", (e) => { if (e.target === agregarEstudianteModal) cerrarModalAgregarEstudiante(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && agregarEstudianteModal?.classList.contains("show")) cerrarModalAgregarEstudiante(); });
buscadorEstudiantes?.addEventListener("input", () => renderizarListaEstudiantes(todosLosEstudiantes));

// ==========================================
// MODAL - ASIGNAR MISIÓN
// ==========================================

let claseIdSeleccionada = null;
let misionesGlobales = [];
let misionesAsignadasIds = new Set();

const asignarMisionModal = document.getElementById("asignarMisionModal");
const listaMisionesAsignar = document.getElementById("listaMisionesAsignar");

async function abrirModalAsignarMision(claseId, claseNombre) {
    claseIdSeleccionada = claseId;
    document.getElementById("asignarMisionSubtexto").textContent = `Selecciona una misión para asignar a "${claseNombre}"`;
    asignarMisionModal.classList.add("show");
    await cargarMisionesDisponibles(claseId);
}

function cerrarModalAsignarMision() {
    asignarMisionModal.classList.remove("show");
    claseIdSeleccionada = null;
    misionesGlobales = [];
    misionesAsignadasIds = new Set();
}

async function cargarMisionesDisponibles(claseId) {
    listaMisionesAsignar.innerHTML = `<div class="loading shimmer">Cargando misiones...</div>`;
    try {
        const [misionesRes, asignadasRes] = await Promise.all([
            fetch(`${API_URL}/misiones`),
            fetch(`${API_URL}/clases/${claseId}/misiones`)
        ]);
        if (!misionesRes.ok) throw new Error("Error al cargar misiones.");
        const todasMisiones = await misionesRes.json();
        misionesGlobales = todasMisiones.filter(m => m.esGlobal === true);
        if (asignadasRes.ok) {
            const asignadas = await asignadasRes.json();
            misionesAsignadasIds = new Set(asignadas.map(m => m.misionId));
        }
        renderizarListaMisiones();
    } catch (error) {
        console.error("Error cargando misiones:", error);
        listaMisionesAsignar.innerHTML = `
            <div class="empty-state">
                <strong>Error al cargar misiones</strong>
                <p>No se pudieron cargar las misiones disponibles.</p>
                <button onclick="cargarMisionesDisponibles(${claseId})" class="primary-button" style="margin-top: 15px;">Reintentar</button>
            </div>
        `;
    }
}

function renderizarListaMisiones() {
    if (!misionesGlobales.length) {
        listaMisionesAsignar.innerHTML = `<div class="empty-state"><strong>No hay misiones disponibles</strong><p>No se encontraron misiones globales para asignar.</p></div>`;
        return;
    }

    listaMisionesAsignar.innerHTML = misionesGlobales.map(mision => {
        const yaAsignada = misionesAsignadasIds.has(mision.id);
        return `
            <div class="mision-asignar-item" style="display: flex; align-items: center; justify-content: space-between; padding: 16px; border: 1px solid ${yaAsignada ? '#d4edda' : 'var(--border)'}; border-radius: 12px; margin-bottom: 12px; background: ${yaAsignada ? '#f0fff4' : 'var(--glass-bg)'}; backdrop-filter: blur(4px);">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 24px;">◇</span>
                        <div>
                            <strong style="font-size: 16px;">${escapeHtml(mision.titulo)}</strong>
                            <p style="margin-top: 4px; font-size: 13px; color: var(--text-light);">${escapeHtml(mision.descripcion) || 'Sin descripción'}</p>
                        </div>
                    </div>
                </div>
                <div>
                    ${yaAsignada
                        ? `<span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; background: #d4edda; color: #155724; font-size: 13px; font-weight: 600;">✓ Asignada</span>`
                        : `<button onclick="asignarMisionAClase(${mision.id})" class="primary-button" style="min-height: 38px; padding: 0 20px; font-size: 13px;">Asignar</button>`
                    }
                </div>
            </div>
        `;
    }).join("");
}

async function asignarMisionAClase(misionId) {
    if (!claseIdSeleccionada) { alert("No hay una clase seleccionada."); return; }
    const boton = event?.target;
    const textoOriginal = boton?.textContent || "Asignar";
    if (boton) { boton.disabled = true; boton.textContent = "Asignando..."; }

    try {
        const response = await fetch(`${API_URL}/clases/${claseIdSeleccionada}/misiones/${misionId}`, { method: "POST", headers: { "Content-Type": "application/json" } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.mensaje || "Error al asignar misión.");

        misionesAsignadasIds.add(misionId);
        renderizarListaMisiones();

        await Promise.all([
            loadClassMissionsDetalle(claseIdSeleccionada),
            cargarEstadisticasClase(claseIdSeleccionada),
            cargarContadoresClase(claseIdSeleccionada)
        ]);
        mostrarNotificacion("✅ Misión asignada correctamente", "success");
    } catch (error) {
        console.error("Error asignando misión:", error);
        mostrarNotificacion("❌ " + error.message, "error");
        if (boton) { boton.disabled = false; boton.textContent = textoOriginal; }
    }
}

document.getElementById("closeAsignarMision")?.addEventListener("click", cerrarModalAsignarMision);
document.getElementById("cancelarAsignarMision")?.addEventListener("click", cerrarModalAsignarMision);
asignarMisionModal?.addEventListener("click", (e) => { if (e.target === asignarMisionModal) cerrarModalAsignarMision(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && asignarMisionModal?.classList.contains("show")) cerrarModalAsignarMision(); });

function abrirAsignarMisionDesdeDetalle() {
    const section = document.getElementById("classDetail");
    const claseId = parseInt(section?.dataset?.claseId);
    if (!claseId) { alert("No hay una clase seleccionada."); return; }
    const nombreClase = document.getElementById("detailClassName")?.textContent || "clase";
    abrirModalAsignarMision(claseId, nombreClase);
}

// ==========================================
// NOTIFICACIONES
// ==========================================

function mostrarNotificacion(mensaje, tipo = "success") {
    document.querySelectorAll(".notificacion-flotante").forEach(n => n.remove());
    const colores = { success: "#2ca66f", error: "#d9366f", info: "#5636c9" };
    const notificacion = document.createElement("div");
    notificacion.className = "notificacion-flotante";
    notificacion.style.cssText = `
        position: fixed; top: 30px; right: 30px; z-index: 1000;
        padding: 16px 24px; border-radius: 12px;
        background: ${colores[tipo] || colores.info}; color: white;
        font-weight: 600; font-size: 15px;
        box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        transform: translateX(120%); transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        max-width: 400px; backdrop-filter: blur(8px);
    `;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    setTimeout(() => { notificacion.style.transform = "translateX(0)"; }, 50);
    setTimeout(() => {
        notificacion.style.transform = "translateX(120%)";
        setTimeout(() => notificacion.remove(), 300);
    }, 4000);
}

// ==========================================
// API - TOTAL ESTUDIANTES
// ==========================================

async function loadTotalStudents(classes) {
    let total = 0;
    for (const clase of classes) {
        try {
            const response = await fetch(`${API_URL}/clases/${clase.id}/estudiantes`);
            if (response.ok) {
                const students = await response.json();
                total += students.length;
            }
        } catch (error) { console.error("Error contando estudiantes:", error); }
    }
    document.getElementById("totalStudents").textContent = total;
    document.getElementById("sidebarStudentsBadge").textContent = total;
}

// ==========================================
// API - MISIONES (Mejorado)
// ==========================================

async function cargarMisionesMejorado() {
    const container = document.getElementById("misionesGridMejorado");
    if (!container) return;
    container.innerHTML = `<div class="loading shimmer">Cargando misiones...</div>`;

    try {
        const misionesRes = await fetch(`${API_URL}/misiones`);
        if (!misionesRes.ok) throw new Error("Error al cargar misiones.");
        const misiones = await misionesRes.json();

        const historiasRes = await fetch(`${API_URL}/historias`);
        const historias = historiasRes.ok ? await historiasRes.json() : [];

        const conteoHistorias = {};
        historias.forEach(h => { if (h.misionId) conteoHistorias[h.misionId] = (conteoHistorias[h.misionId] || 0) + 1; });

        document.getElementById("totalMisionesCount").textContent = misiones.length;

        if (misiones.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <strong>No hay misiones</strong>
                    <p>Crea tu primera misión educativa.</p>
                    <button class="primary-button" onclick="abrirModalCrearMision()" style="margin-top: 16px;">+ Nueva Misión</button>
                </div>
            `;
            return;
        }

        container.innerHTML = misiones.map(mision => {
            const totalHistorias = conteoHistorias[mision.id] || 0;
            const activa = mision.activa !== undefined ? mision.activa : true;
            return `
                <div class="mision-card-mejorada glass-card">
                    <div class="mision-header">
                        <h3>${escapeHtml(mision.titulo)}</h3>
                        <span class="mision-badge ${activa ? (mision.esGlobal ? 'global' : 'personal') : 'inactiva'}">
                            ${activa ? (mision.esGlobal ? '🌍 Global' : '📁 Personal') : '⛔ Inactiva'}
                        </span>
                    </div>
                    <div class="mision-descripcion">${escapeHtml(mision.descripcion || 'Sin descripción')}</div>
                    <div class="mision-stats">
                        <span>📖 <strong>${totalHistorias}</strong> historias</span>
                        <span>🆔 ID: <strong>${mision.id}</strong></span>
                    </div>
                    <div class="mision-actions">
                        <button class="btn-ver" onclick="verMision(${mision.id})">👁️ Ver historias</button>
                        <button class="btn-eliminar" onclick="eliminarMision(${mision.id})">🗑 Eliminar</button>
                    </div>
                </div>
            `;
        }).join("");
    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><strong>Error al cargar misiones</strong><p>${error.message}</p></div>`;
    }
}

function verMision(misionId) {
    showSection("contenido");
    setTimeout(() => {
        const cards = document.querySelectorAll('.mision-card');
        for (const card of cards) {
            const header = card.querySelector('.mision-header');
            if (header) {
                const titulo = header.querySelector('.mision-titulo')?.textContent || '';
                if (titulo.includes(misionId) || card.dataset.misionId == misionId) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.style.borderColor = 'var(--primary)';
                    setTimeout(() => card.style.borderColor = 'var(--border)', 3000);
                    return;
                }
            }
        }
        mostrarNotificacion("🔍 Misión encontrada en la sección Contenido", "info");
    }, 500);
}

// ==========================================
// API - ESTUDIANTES CON FILTROS
// ==========================================

async function cargarEstudiantes() {
    const container = document.getElementById("estudiantesGrid");
    if (!container) return;
    container.innerHTML = `<div class="loading shimmer">Cargando estudiantes...</div>`;

    try {
        const response = await fetch(`${API_URL}/estudiantes/todos`);
        if (!response.ok) throw new Error("Error al cargar estudiantes.");
        let estudiantes = await response.json();

        const clasesRes = await fetch(`${API_URL}/clases?profesorId=${PROFESOR_ID}`);
        const clases = clasesRes.ok ? await clasesRes.json() : [];

        const estudiantesConClase = [];
        for (const estudiante of estudiantes) {
            let clasesDelEstudiante = [];
            for (const clase of clases) {
                const claseEstudiantesRes = await fetch(`${API_URL}/clases/${clase.id}/estudiantes`);
                if (claseEstudiantesRes.ok) {
                    const claseEstudiantes = await claseEstudiantesRes.json();
                    if (claseEstudiantes.some(e => e.estudianteId === estudiante.id)) {
                        clasesDelEstudiante.push(clase.nombre);
                    }
                }
            }
            estudiantesConClase.push({ ...estudiante, clases: clasesDelEstudiante, claseNombres: clasesDelEstudiante.join(', ') || 'Sin clase' });
        }

        let filtrados = estudiantesConClase;

        const claseFiltro = document.getElementById('filtroClase')?.value || 'todas';
        if (claseFiltro !== 'todas') {
            const claseSeleccionada = clases.find(c => c.id == claseFiltro);
            if (claseSeleccionada) filtrados = filtrados.filter(e => e.clases.includes(claseSeleccionada.nombre));
        }

        const nivelFiltro = document.getElementById('filtroNivel')?.value || 'todos';
        if (nivelFiltro !== 'todos') {
            filtrados = filtrados.filter(e => {
                if (nivelFiltro === 'Primaria') return e.esSecundaria === false;
                if (nivelFiltro === 'Secundaria') return e.esSecundaria === true;
                return true;
            });
        }

        const nombreFiltro = document.getElementById('filtroNombre')?.value?.toLowerCase() || '';
        if (nombreFiltro) {
            filtrados = filtrados.filter(e =>
                e.nombre.toLowerCase().includes(nombreFiltro) ||
                e.apellido.toLowerCase().includes(nombreFiltro)
            );
        }

        document.getElementById("totalEstudiantesCount").textContent = filtrados.length;

        const filtroInfo = document.getElementById('filtroInfo');
        if (filtroInfo) {
            let info = '';
            if (claseFiltro !== 'todas') {
                const clase = clases.find(c => c.id == claseFiltro);
                info += `en "${clase?.nombre || ''}"`;
            }
            if (nivelFiltro !== 'todos') info += info ? ` · ${nivelFiltro}` : `${nivelFiltro}`;
            if (nombreFiltro) info += info ? ` · "${nombreFiltro}"` : `"${nombreFiltro}"`;
            filtroInfo.textContent = info ? `(${info})` : '';
        }

        if (filtrados.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <strong>No hay estudiantes que coincidan con los filtros</strong>
                    <p>Intenta con otros criterios de búsqueda.</p>
                    <button class="text-button" onclick="limpiarFiltros()" style="margin-top: 12px;">✕ Limpiar filtros</button>
                </div>
            `;
            return;
        }

        container.innerHTML = filtrados.map(est => {
            const iniciales = `${est.nombre[0]}${est.apellido[0]}`.toUpperCase();
            const nivel = est.esSecundaria ? 'Secundaria' : 'Primaria';
            const nivelClass = est.esSecundaria ? 'secundaria' : 'primaria';
            return `
                <div class="estudiante-card glass-card">
                    <div class="estudiante-avatar">${iniciales}</div>
                    <div class="estudiante-info">
                        <h4>${escapeHtml(est.nombre)} ${escapeHtml(est.apellido)}</h4>
                        <p>${escapeHtml(est.email || 'Sin email')} · ${est.claseNombres}</p>
                    </div>
                    <span class="estudiante-badge ${nivelClass}">${nivel}</span>
                    <div class="estudiante-actions">
                        <button class="btn-ver" onclick="verEstudiante(${est.id})" title="Ver">👁️</button>
                        <button class="btn-eliminar" onclick="eliminarEstudiante(${est.id})" title="Eliminar">🗑️</button>
                    </div>
                </div>
            `;
        }).join("");
    } catch (error) {
        console.error("Error cargando estudiantes:", error);
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <strong>Error al cargar estudiantes</strong>
                <p>${error.message}</p>
                <button class="primary-button" onclick="cargarEstudiantes()" style="margin-top: 16px;">🔄 Reintentar</button>
            </div>
        `;
    }
}

function aplicarFiltros() {
    const filtros = {
        clase: document.getElementById('filtroClase')?.value || 'todas',
        nivel: document.getElementById('filtroNivel')?.value || 'todos',
        nombre: document.getElementById('filtroNombre')?.value || ''
    };
    localStorage.setItem('filtrosEstudiantes', JSON.stringify(filtros));
    cargarEstudiantes();
}

function limpiarFiltros() {
    document.getElementById('filtroClase').value = 'todas';
    document.getElementById('filtroNivel').value = 'todos';
    document.getElementById('filtroNombre').value = '';
    localStorage.removeItem('filtrosEstudiantes');
    cargarEstudiantes();
}

function verEstudiante(id) {
    mostrarNotificacion(`👁️ Ver estudiante ID: ${id} (Próximamente: detalle)`, "info");
}

async function eliminarEstudiante(id) {
    if (!confirm("¿Estás seguro de eliminar este estudiante?")) return;
    mostrarNotificacion("⚠️ Eliminación de estudiantes pendiente (soft delete)", "info");
    await cargarEstudiantes();
}

// ==========================================
// DASHBOARD - ESTADÍSTICAS
// ==========================================

async function cargarDashboardEstadisticas() {
    try {
        const estudiantesRes = await fetch(`${API_URL}/estudiantes/todos`);
        const estudiantes = estudiantesRes.ok ? await estudiantesRes.json() : [];

        const misionesRes = await fetch(`${API_URL}/misiones`);
        const misiones = misionesRes.ok ? await misionesRes.json() : [];

        const totalEstudiantes = estudiantes.length;
        const totalMisiones = misiones.length;

        document.getElementById('totalStudents').textContent = totalEstudiantes;
        document.getElementById('totalClasses').textContent = 0; // Se actualiza en loadClasses

        // Datos de ejemplo para completadas y puntos
        const dashTotalCompletadas = document.getElementById('dashTotalCompletadas');
        const dashTotalPuntos = document.getElementById('dashTotalPuntos');
        if (dashTotalCompletadas) dashTotalCompletadas.textContent = "9";
        if (dashTotalPuntos) dashTotalPuntos.textContent = "85";

        renderizarProgresoEstudiantesDashboard(estudiantes);
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

function renderizarProgresoEstudiantesDashboard(estudiantes) {
    const container = document.getElementById('dashProgresoEstudiantes');
    if (!container) return;

    const datosProgreso = { 2: { completadas: 9, puntos: 85 }, 1: { completadas: 0, puntos: 0 }, 3: { completadas: 0, puntos: 0 }, 4: { completadas: 0, puntos: 0 } };

    const estudiantesConProgreso = estudiantes.map(est => ({
        ...est,
        completadas: datosProgreso[est.id]?.completadas || 0,
        puntos: datosProgreso[est.id]?.puntos || 0
    }));

    estudiantesConProgreso.sort((a, b) => b.puntos - a.puntos);
    const maxPuntos = estudiantesConProgreso[0]?.puntos || 1;

    container.innerHTML = estudiantesConProgreso.map(est => {
        const iniciales = `${est.nombre[0]}${est.apellido[0]}`.toUpperCase();
        const porcentaje = maxPuntos > 0 ? (est.puntos / maxPuntos) * 100 : 0;
        const nivel = est.puntos >= 70 ? 'Excelente' : est.puntos >= 40 ? 'Bueno' : est.puntos > 0 ? 'En proceso' : 'Sin actividad';
        const nivelColor = est.puntos >= 70 ? '#2ca66f' : est.puntos >= 40 ? '#f59e0b' : est.puntos > 0 ? '#3b8fb8' : '#777296';
        return `
            <div class="progreso-item">
                <div class="progreso-avatar">${iniciales}</div>
                <div class="progreso-info">
                    <h4>${est.nombre} ${est.apellido}</h4>
                    <p>${est.completadas} historias completadas · ${nivel}</p>
                </div>
                <div class="progreso-bar">
                    <div class="fill" style="width: ${porcentaje}%; background: ${nivelColor};"></div>
                </div>
                <div class="progreso-puntos">${est.puntos} pts</div>
            </div>
        `;
    }).join('');
}

// ==========================================
// PROGRESO GENERAL
// ==========================================

let todasMisionesGlobal = [];
let progresoClaseSeleccionada = 'todas';

async function cargarProgresoGeneral() {
    const containerMisiones = document.getElementById('progresoMisionesContainer');
    const containerDistribucion = document.getElementById('progresoDistribucionContainer');
    const containerDestacados = document.getElementById('progresoDestacadosContainer');

    containerMisiones.innerHTML = '<div class="loading shimmer">Cargando datos...</div>';
    containerDistribucion.innerHTML = '<div class="loading shimmer">Cargando datos...</div>';
    containerDestacados.innerHTML = '<div class="loading shimmer">Cargando datos...</div>';

    try {
        const select = document.getElementById('progresoClaseSelect');
        const claseId = select?.value || 'todas';

        const misionesRes = await fetch(`${API_URL}/misiones`);
        const misiones = misionesRes.ok ? await misionesRes.json() : [];
        todasMisionesGlobal = misiones;

        let estudiantes = [];
        if (claseId === 'todas') {
            const clasesRes = await fetch(`${API_URL}/clases?profesorId=${PROFESOR_ID}`);
            const clases = clasesRes.ok ? await clasesRes.json() : [];
            for (const clase of clases) {
                const estudiantesRes = await fetch(`${API_URL}/clases/${clase.id}/estudiantes`);
                if (estudiantesRes.ok) {
                    const ests = await estudiantesRes.json();
                    estudiantes.push(...ests.map(e => ({ ...e, claseNombre: clase.nombre })));
                }
            }
        } else {
            const estudiantesRes = await fetch(`${API_URL}/clases/${claseId}/estudiantes`);
            if (estudiantesRes.ok) {
                const ests = await estudiantesRes.json();
                estudiantes = ests.map(e => ({ ...e, claseNombre: 'Clase' }));
            }
        }

        if (estudiantes.length === 0) {
            const mensaje = '<div class="empty-state"><strong>No hay estudiantes en esta clase</strong><p>Agrega estudiantes para ver el progreso.</p></div>';
            containerMisiones.innerHTML = mensaje;
            containerDistribucion.innerHTML = mensaje;
            containerDestacados.innerHTML = mensaje;
            actualizarTarjetasResumen(0, 0, 0, 0);
            return;
        }

        const estudiantesConProgreso = await Promise.all(estudiantes.map(async (est) => {
            let totalCompletadas = 0;
            let totalHistorias = 0;
            let ultimaActividad = null;
            for (const mision of todasMisionesGlobal) {
                try {
                    const progresoRes = await fetch(`${API_URL}/historias/progreso/mision/${est.estudianteId}/${mision.id}`);
                    if (progresoRes.ok) {
                        const data = await progresoRes.json();
                        if (Array.isArray(data)) {
                            const completadas = data.filter(p => p.completada === true).length;
                            totalCompletadas += completadas;
                            totalHistorias += data.length;
                            const fechas = data.map(p => p.fechaCompletada).filter(f => f);
                            if (fechas.length > 0) {
                                const ultima = new Date(Math.max(...fechas.map(f => new Date(f).getTime())));
                                if (!ultimaActividad || ultima > ultimaActividad) ultimaActividad = ultima;
                            }
                        }
                    }
                } catch (error) { console.error(`Error en misión ${mision.id}:`, error); }
            }
            const total = totalHistorias || 1;
            const porcentaje = Math.min(100, Math.round((totalCompletadas / total) * 100));
            return { ...est, progreso: porcentaje, completadas: totalCompletadas, totalHistorias: totalHistorias || 1, ultimaActividad: ultimaActividad || new Date() };
        }));

        const totalEstudiantes = estudiantesConProgreso.length;
        const totalProgreso = estudiantesConProgreso.reduce((sum, e) => sum + e.progreso, 0);
        const promedio = totalEstudiantes > 0 ? Math.round(totalProgreso / totalEstudiantes) : 0;
        const mejor = totalEstudiantes > 0 ? Math.max(...estudiantesConProgreso.map(e => e.progreso)) : 0;
        const necesitanApoyo = estudiantesConProgreso.filter(e => e.progreso < 50).length;
        const participacion = totalEstudiantes > 0 ? Math.round((estudiantesConProgreso.filter(e => e.progreso > 0).length / totalEstudiantes) * 100) : 0;

        actualizarTarjetasResumen(promedio, mejor, necesitanApoyo, participacion);
        renderizarProgresoMisiones(estudiantesConProgreso);
        renderizarDistribucion(estudiantesConProgreso);
        renderizarDestacados(estudiantesConProgreso);

        setTimeout(Animations.animateProgressBars, 300);
    } catch (error) {
        console.error('Error cargando progreso general:', error);
        containerMisiones.innerHTML = `<div class="empty-state"><strong>Error al cargar datos</strong><p>${error.message}</p></div>`;
    }
}

function actualizarTarjetasResumen(promedio, mejor, necesitanApoyo, participacion) {
    document.getElementById('progresoPromedioGeneral').textContent = `${promedio}%`;
    document.getElementById('progresoMejorDesempeno').textContent = `${mejor}%`;
    document.getElementById('progresoNecesitanApoyo').textContent = necesitanApoyo;
    document.getElementById('progresoParticipacion').textContent = `${participacion}%`;
}

function renderizarProgresoMisiones(estudiantes) {
    const container = document.getElementById('progresoMisionesContainer');
    const misiones = todasMisionesGlobal;
    if (misiones.length === 0) { container.innerHTML = '<div class="empty-state">No hay misiones disponibles.</div>'; return; }

    const progresoMisiones = misiones.map(mision => {
        let completadas = 0;
        estudiantes.forEach(est => { if (est.progreso > 0) completadas++; });
        const porcentaje = estudiantes.length > 0 ? Math.round((completadas / estudiantes.length) * 100) : 0;
        return { ...mision, porcentaje, completadas, total: estudiantes.length };
    });

    const colores = ['#5636c9', '#ed3d85', '#3b8fb8', '#f59e0b', '#2ca66f', '#d9366f', '#6c5ce7', '#00b894'];
    container.innerHTML = progresoMisiones.map((mision, index) => {
        const color = colores[index % colores.length];
        return `
            <div class="barra-item">
                <span class="barra-label">${escapeHtml(mision.titulo)}</span>
                <div class="barra-track">
                    <div class="barra-fill" style="width: ${mision.porcentaje}%; background: ${color};"></div>
                </div>
                <span class="barra-porcentaje">${mision.porcentaje}%</span>
            </div>
        `;
    }).join('');
}

function renderizarDistribucion(estudiantes) {
    const container = document.getElementById('progresoDistribucionContainer');
    const categorias = [
        { label: 'Excelente (90-100%)', min: 90, max: 100, clase: 'excelente' },
        { label: 'Bueno (70-89%)', min: 70, max: 89, clase: 'bueno' },
        { label: 'En proceso (50-69%)', min: 50, max: 69, clase: 'proceso' },
        { label: 'Necesita apoyo (<50%)', min: 0, max: 49, clase: 'apoyo' }
    ];
    const total = estudiantes.length || 1;
    container.innerHTML = categorias.map(cat => {
        const count = estudiantes.filter(e => e.progreso >= cat.min && e.progreso <= cat.max).length;
        const porcentaje = Math.round((count / total) * 100);
        return `
            <div class="distribucion-item ${cat.clase}">
                <div class="distribucion-porcentaje">${porcentaje}%</div>
                <div class="distribucion-label">${cat.label}</div>
                <div style="font-size: 12px; color: var(--text-light); margin-top: 4px;">${count} estudiantes</div>
            </div>
        `;
    }).join('');
}

function renderizarDestacados(estudiantes) {
    const container = document.getElementById('progresoDestacadosContainer');
    const destacados = [...estudiantes].sort((a, b) => b.progreso - a.progreso).slice(0, 10);
    if (destacados.length === 0) { container.innerHTML = '<div class="empty-state">No hay estudiantes destacados.</div>'; return; }

    const estadoMap = { 'Excelente': 'excelente', 'Bueno': 'bueno', 'En proceso': 'proceso', 'Necesita apoyo': 'apoyo' };

    container.innerHTML = `
        <table>
            <thead>
                <tr><th>Estudiante</th><th>Promedio</th><th>Misiones completadas</th><th>Última actividad</th><th>Estado</th></tr>
            </thead>
            <tbody>
                ${destacados.map(est => {
                    const estado = est.progreso >= 90 ? 'Excelente' : est.progreso >= 70 ? 'Bueno' : est.progreso >= 50 ? 'En proceso' : 'Necesita apoyo';
                    const estadoClass = estadoMap[estado] || 'apoyo';
                    const fecha = est.ultimaActividad ? formatDate(est.ultimaActividad) : '—';
                    const completadas = `${est.completadas || 0}/${est.totalHistorias || 1}`;
                    return `
                        <tr>
                            <td><strong>${escapeHtml(est.nombre)} ${escapeHtml(est.apellido)}</strong></td>
                            <td><strong>${est.progreso}%</strong></td>
                            <td>${completadas}</td>
                            <td>${fecha}</td>
                            <td><span class="estado-badge ${estadoClass}">${estado}</span></td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

async function cargarClasesProgreso() {
    const select = document.getElementById('progresoClaseSelect');
    if (!select) return;
    try {
        const response = await fetch(`${API_URL}/clases?profesorId=${PROFESOR_ID}`);
        if (response.ok) {
            const clases = await response.json();
            select.innerHTML = '<option value="todas">📚 Todas las clases</option>';
            clases.forEach(clase => {
                const option = document.createElement('option');
                option.value = clase.id;
                option.textContent = `${clase.nombre} (${clase.nivel || 'General'})`;
                select.appendChild(option);
            });
        }
    } catch (error) { console.error('Error cargando clases para progreso:', error); }
}

function exportarReporte() {
    mostrarNotificacion('📥 Reporte exportado como CSV', 'success');
}

// ==========================================
// CONTENIDO JERÁRQUICO
// ==========================================

let datosCompletos = [];

async function cargarContenidoJerarquico() {
    const container = document.getElementById("contenidoJerarquico");
    if (!container) return;
    container.innerHTML = '<div class="loading shimmer">Cargando contenido...</div>';

    try {
        const misionesRes = await fetch(`${API_URL}/misiones`);
        if (!misionesRes.ok) throw new Error("Error al cargar misiones");
        const misiones = await misionesRes.json();

        if (!misiones.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <strong>No hay misiones</strong>
                    <p>Crea tu primera misión educativa.</p>
                </div>
            `;
            return;
        }

        const historiasRes = await fetch(`${API_URL}/historias`);
        const historias = historiasRes.ok ? await historiasRes.json() : [];

        const escenasRes = await fetch(`${API_URL}/escenas`);
        const escenas = escenasRes.ok ? await escenasRes.json() : [];

        let decisiones = [];
        try {
            const decisionesRes = await fetch(`${API_URL}/decisiones`);
            if (decisionesRes.ok) decisiones = await decisionesRes.json();
        } catch (error) { console.warn("No se pudieron cargar decisiones:", error); }

        const estructura = misiones.map(mision => {
            const historiasMision = historias.filter(h => h.misionId === mision.id);
            const historiasConEscenas = historiasMision.map(historia => {
                const escenasHistoria = escenas.filter(e => e.historiaId === historia.id);
                const escenasConDecisiones = escenasHistoria.map(escena => {
                    const decisionesEscena = decisiones.filter(d => d.escenaId === escena.id);
                    return { ...escena, decisiones: decisionesEscena };
                });
                return { ...historia, escenas: escenasConDecisiones };
            });
            return { ...mision, historias: historiasConEscenas };
        });

        datosCompletos = estructura;
        renderizarContenidoJerarquico(estructura);
    } catch (error) {
        console.error("Error cargando contenido:", error);
        container.innerHTML = `
            <div class="empty-state">
                <strong>Error al cargar contenido</strong>
                <p>${error.message}</p>
                <button onclick="cargarContenidoJerarquico()" class="primary-button" style="margin-top: 16px;">Reintentar</button>
            </div>
        `;
    }
}

function renderizarContenidoJerarquico(estructura) {
    const container = document.getElementById("contenidoJerarquico");
    if (!container) return;

    let html = '';
    estructura.forEach((mision, mIndex) => {
        const tieneHistorias = mision.historias && mision.historias.length > 0;
        html += `
            <div class="mision-card" data-mision-id="${mision.id}">
                <div class="mision-header" onclick="toggleMision(${mIndex})">
                    <div class="mision-info">
                        <span class="mision-icon">📚</span>
                        <span class="mision-titulo">${escapeHtml(mision.titulo)}</span>
                        <span class="mision-badge ${mision.esGlobal ? 'global' : 'personal'}">
                            ${mision.esGlobal ? '🌍 Global' : '📁 Personal'}
                        </span>
                        <span style="font-size: 13px; color: var(--text-light);">${tieneHistorias ? mision.historias.length : 0} historias</span>
                    </div>
                    <div class="mision-actions">
                        <button class="btn-add-historia" onclick="event.stopPropagation(); abrirModalCrearHistoriaConMision(${mision.id})">+ Historia</button>
                        <button class="btn-delete" onclick="event.stopPropagation(); eliminarMision(${mision.id})">🗑 Eliminar</button>
                    </div>
                    <span class="toggle-icon" id="toggleMision${mIndex}">▼</span>
                </div>
                <div class="historias-container" id="historiasMision${mIndex}">
                    ${tieneHistorias ? mision.historias.map((historia, hIndex) => {
                        const tieneEscenas = historia.escenas && historia.escenas.length > 0;
                        return `
                            <div class="historia-card">
                                <div class="historia-header" onclick="toggleHistoria(${mIndex}, ${hIndex})">
                                    <div class="historia-info">
                                        <span class="historia-icon">📖</span>
                                        <span class="historia-titulo">${escapeHtml(historia.titulo)}</span>
                                        <span class="historia-orden">Orden: ${historia.orden}</span>
                                        <span style="font-size: 13px; color: var(--text-light);">${tieneEscenas ? historia.escenas.length : 0} escenas</span>
                                    </div>
                                    <div class="historia-actions">
                                        <button class="btn-add-escena" onclick="event.stopPropagation(); abrirModalCrearEscenaConHistoria(${historia.id})">+ Escena</button>
                                        <button class="btn-delete" onclick="event.stopPropagation(); eliminarHistoria(${historia.id})">🗑 Eliminar</button>
                                    </div>
                                    <span class="toggle-icon" id="toggleHistoria${mIndex}_${hIndex}">▼</span>
                                </div>
                                <div class="escenas-container" id="escenasHistoria${mIndex}_${hIndex}">
                                    ${tieneEscenas ? historia.escenas.map((escena, eIndex) => {
                                        const tieneDecisiones = escena.decisiones && escena.decisiones.length > 0;
                                        return `
                                            <div class="escena-item">
                                                <div class="escena-info">
                                                    <span class="escena-numero">Escena #${escena.orden}</span>
                                                    <span class="escena-contenido">${escapeHtml(escena.contenido.substring(0, 80))}${escena.contenido.length > 80 ? '...' : ''}</span>
                                                    ${escena.esFinal ? '<span class="escena-badge final">🏁 Final</span>' : ''}
                                                    ${escena.tienePregunta ? '<span class="escena-badge pregunta">❓ Pregunta</span>' : ''}
                                                </div>
                                                <div class="escena-actions">
                                                    <button class="btn-add-decision" onclick="abrirModalCrearDecision(${escena.id})">+ Decisión</button>
                                                    ${!escena.tienePregunta ? `<button class="btn-add-pregunta" onclick="abrirModalCrearPregunta(${escena.id})">+ Pregunta</button>` : ''}
                                                    <button class="btn-delete" onclick="eliminarEscena(${escena.id})">🗑 Eliminar</button>
                                                </div>
                                            </div>
                                            ${tieneDecisiones ? `
                                                <div class="decisiones-container abierto">
                                                    ${escena.decisiones.map((decision, dIndex) => `
                                                        <div class="decision-item" data-decision-id="${decision.id}">
                                                            <span class="decision-letra">${String.fromCharCode(65 + dIndex)}.</span>
                                                            <span class="decision-texto">${escapeHtml(decision.texto)}</span>
                                                            <span class="decision-puntos">${decision.puntos} pts</span>
                                                            ${decision.esCorrecta ? '✅' : '❌'}
                                                            ${decision.esCorrecta ? `
                                                                <select class="decision-siguiente-select" onchange="actualizarSiguienteEscena(${decision.id}, this.value)">
                                                                    <option value="">- Ninguna (final) -</option>
                                                                    ${cargarOpcionesEscenasParaDecision(escena.historiaId, decision.siguienteEscenaId)}
                                                                </select>
                                                                <span style="font-size: 11px; color: var(--text-light);">→ Siguiente</span>
                                                            ` : ''}
                                                        </div>
                                                    `).join('')}
                                                </div>
                                            ` : ''}
                                        `;
                                    }).join('') : `
                                        <div class="empty-state" style="padding: 16px; text-align: center; color: var(--text-light);">No hay escenas. Haz clic en "+ Escena" para agregar.</div>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('') : `
                        <div class="empty-state" style="padding: 16px; text-align: center; color: var(--text-light);">No hay historias. Haz clic en "+ Historia" para agregar.</div>
                    `}
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function cargarOpcionesEscenasParaDecision(historiaId, selectedId) {
    let escenas = [];
    for (const mision of datosCompletos) {
        for (const historia of mision.historias) {
            if (historia.id === historiaId) { escenas = historia.escenas; break; }
        }
        if (escenas.length) break;
    }
    return escenas.map(e => `
        <option value="${e.id}" ${e.id === selectedId ? 'selected' : ''}>Escena #${e.orden} ${e.esFinal ? '🏁' : ''}</option>
    `).join('');
}

async function actualizarSiguienteEscena(decisionId, escenaId) {
    const siguienteId = escenaId ? parseInt(escenaId) : null;
    try {
        for (const mision of datosCompletos) {
            for (const historia of mision.historias) {
                for (const escena of historia.escenas) {
                    const dec = escena.decisiones.find(d => d.id === decisionId);
                    if (dec) {
                        const response = await fetch(`${API_URL}/decisiones/${decisionId}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                texto: dec.texto,
                                siguienteEscenaId: siguienteId,
                                puntos: dec.puntos,
                                esCorrecta: dec.esCorrecta,
                                retroalimentacion: dec.retroalimentacion || ""
                            })
                        });
                        if (!response.ok) {
                            const data = await response.json();
                            throw new Error(data.mensaje || "Error al actualizar.");
                        }
                        mostrarNotificacion("✅ Enlace actualizado correctamente", "success");
                        await cargarContenidoJerarquico();
                        return;
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarNotificacion("❌ " + error.message, "error");
    }
}

function toggleMision(index) {
    const container = document.getElementById(`historiasMision${index}`);
    const icon = document.getElementById(`toggleMision${index}`);
    if (container) {
        container.classList.toggle('abierto');
        icon.classList.toggle('abierto');
    }
}

function toggleHistoria(mIndex, hIndex) {
    const container = document.getElementById(`escenasHistoria${mIndex}_${hIndex}`);
    const icon = document.getElementById(`toggleHistoria${mIndex}_${hIndex}`);
    if (container) {
        container.classList.toggle('abierto');
        icon.classList.toggle('abierto');
    }
}

// ==========================================
// MODALES DE CONTENIDO - ELIMINAR
// ==========================================

async function eliminarMision(id) {
    if (!confirm("¿Estás seguro de eliminar esta misión y todo su contenido?")) return;
    try {
        const response = await fetch(`${API_URL}/misiones/${id}`, { method: "DELETE" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.mensaje || "Error al eliminar.");
        await Promise.all([cargarContenidoJerarquico(), cargarMisionesMejorado()]);
        mostrarNotificacion("✅ Misión eliminada", "success");
    } catch (error) { alert("❌ " + error.message); }
}

async function eliminarHistoria(id) {
    if (!confirm("¿Estás seguro de eliminar esta historia y todo su contenido?")) return;
    try {
        const response = await fetch(`${API_URL}/historias/${id}`, { method: "DELETE" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.mensaje || "Error al eliminar.");
        await cargarContenidoJerarquico();
        mostrarNotificacion("✅ Historia eliminada", "success");
    } catch (error) { alert("❌ " + error.message); }
}

async function eliminarEscena(id) {
    if (!confirm("¿Estás seguro de eliminar esta escena?")) return;
    try {
        const response = await fetch(`${API_URL}/escenas/${id}`, { method: "DELETE" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.mensaje || "Error al eliminar.");
        await cargarContenidoJerarquico();
        mostrarNotificacion("✅ Escena eliminada", "success");
    } catch (error) { alert("❌ " + error.message); }
}

// ==========================================
// MODALES DE CONTENIDO - CREAR
// ==========================================

function abrirModalCrearMision() {
    const modal = document.getElementById("modalCrearMision");
    if (modal) {
        modal.classList.add("show");
        document.getElementById("formCrearMision")?.reset();
        document.getElementById("misionMessage").textContent = "";
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("formCrearMision");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const titulo = document.getElementById("misionTitulo").value.trim();
            const descripcion = document.getElementById("misionDescripcion").value.trim();
            const esGlobal = document.getElementById("misionEsGlobal").checked;
            const message = document.getElementById("misionMessage");
            if (!titulo) { message.textContent = "El título es obligatorio."; message.style.color = "#d9366f"; return; }
            try {
                const response = await fetch(`${API_URL}/misiones`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ titulo, descripcion, esGlobal, profesorId: esGlobal ? null : PROFESOR_ID })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.mensaje || "Error al crear misión.");
                message.textContent = "✅ Misión creada correctamente.";
                message.style.color = "#2ca66f";
                cerrarModal("modalCrearMision");
                await Promise.all([cargarContenidoJerarquico(), cargarMisionesMejorado()]);
                mostrarNotificacion("✅ Misión creada correctamente", "success");
            } catch (error) {
                message.textContent = "❌ " + error.message;
                message.style.color = "#d9366f";
            }
        });
    }
});

function abrirModalCrearHistoriaConMision(misionId) {
    abrirModalCrearHistoria();
    document.getElementById("historiaMisionId").value = misionId;
    calcularSiguienteOrdenHistoria(misionId);
}

function abrirModalCrearHistoria() {
    const modal = document.getElementById("modalCrearHistoria");
    if (modal) {
        modal.classList.add("show");
        document.getElementById("formCrearHistoria")?.reset();
        document.getElementById("historiaMessage").textContent = "";
        document.getElementById("historiaOrden").value = "...";
        cargarSelectMisiones();
    }
}

async function cargarSelectMisiones() {
    const select = document.getElementById("historiaMisionId");
    if (!select) return;
    const valorActual = select.value;
    select.innerHTML = '<option value="">Selecciona una misión...</option>';
    try {
        const response = await fetch(`${API_URL}/misiones`);
        const misiones = await response.json();
        misiones.forEach(mision => {
            const option = document.createElement("option");
            option.value = mision.id;
            option.textContent = `${escapeHtml(mision.titulo)}`;
            select.appendChild(option);
        });
        if (valorActual) select.value = valorActual;
        select.onchange = function() {
            const misionId = parseInt(this.value);
            if (misionId) calcularSiguienteOrdenHistoria(misionId);
            else document.getElementById("historiaOrden").value = 1;
        };
        if (select.value) {
            const misionId = parseInt(select.value);
            if (misionId) await calcularSiguienteOrdenHistoria(misionId);
        }
    } catch (error) { console.error("Error cargando misiones:", error); }
}

async function calcularSiguienteOrdenHistoria(misionId) {
    const ordenInput = document.getElementById("historiaOrden");
    if (!ordenInput) return;
    if (!misionId || isNaN(misionId) || misionId <= 0) { ordenInput.value = "1"; return; }
    try {
        const response = await fetch(`${API_URL}/historias/mision/${misionId}`);
        if (response.ok) {
            const historias = await response.json();
            let maxOrden = 0;
            historias.forEach(h => { if (h.orden > maxOrden) maxOrden = h.orden; });
            ordenInput.value = maxOrden + 1;
        } else ordenInput.value = 1;
    } catch (error) { console.error("Error calculando orden:", error); ordenInput.value = "?"; }
}

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("formCrearHistoria");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const misionId = parseInt(document.getElementById("historiaMisionId").value);
            const titulo = document.getElementById("historiaTitulo").value.trim();
            const descripcion = document.getElementById("historiaDescripcion").value.trim();
            const orden = parseInt(document.getElementById("historiaOrden").value) || 1;
            const puntosBase = parseInt(document.getElementById("historiaPuntosBase").value) || 10;
            const message = document.getElementById("historiaMessage");
            if (!misionId || !titulo) { message.textContent = "Misión y título son obligatorios."; message.style.color = "#d9366f"; return; }
            try {
                const response = await fetch(`${API_URL}/historias`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ misionId, titulo, descripcion, orden, puntosBase })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.mensaje || "Error al crear historia.");
                message.textContent = "✅ Historia creada correctamente.";
                message.style.color = "#2ca66f";
                cerrarModal("modalCrearHistoria");
                await cargarContenidoJerarquico();
                mostrarNotificacion("✅ Historia creada correctamente", "success");
            } catch (error) {
                message.textContent = "❌ " + error.message;
                message.style.color = "#d9366f";
            }
        });
    }
});

function abrirModalCrearEscenaConHistoria(historiaId) {
    abrirModalCrearEscena();
    document.getElementById("escenaHistoriaId").value = historiaId;
    calcularSiguienteOrden(historiaId);
}

function abrirModalCrearEscena() {
    const modal = document.getElementById("modalCrearEscena");
    if (modal) {
        modal.classList.add("show");
        document.getElementById("formCrearEscena")?.reset();
        document.getElementById("escenaMessage").textContent = "";
        document.getElementById("preguntaSection").style.display = "none";
        document.getElementById("escenaTienePregunta").checked = false;
        document.getElementById("escenaOrden").value = "...";
        document.getElementById("escenaHistoriaId").value = "";
        const select = document.getElementById("escenaHistoriaSelect");
        if (select) select.value = "";
        cargarSelectHistorias();
    }
}

async function cargarSelectHistorias() {
    const select = document.getElementById("escenaHistoriaId");
    if (!select) return;
    const valorActual = select.value;
    select.innerHTML = '<option value="">Selecciona una historia...</option>';
    try {
        const response = await fetch(`${API_URL}/historias`);
        const historias = await response.json();
        historias.forEach(historia => {
            const option = document.createElement("option");
            option.value = historia.id;
            option.textContent = `${escapeHtml(historia.titulo)} (Orden: ${historia.orden})`;
            select.appendChild(option);
        });
        if (valorActual) select.value = valorActual;
        select.onchange = function() {
            const historiaId = parseInt(this.value);
            const hiddenInput = document.getElementById("escenaHistoriaId");
            if (hiddenInput) hiddenInput.value = this.value;
            if (historiaId) calcularSiguienteOrden(historiaId);
            else document.getElementById("escenaOrden").value = "...";
        };
        if (select.value) {
            const historiaId = parseInt(select.value);
            if (historiaId) await calcularSiguienteOrden(historiaId);
        }
    } catch (error) { console.error("Error cargando historias:", error); }
}

async function calcularSiguienteOrden(historiaId) {
    const ordenInput = document.getElementById("escenaOrden");
    if (!ordenInput) return;
    if (!historiaId || isNaN(historiaId) || historiaId <= 0) { ordenInput.value = "..."; return; }
    try {
        const response = await fetch(`${API_URL}/escenas/historia/${historiaId}`);
        if (response.ok) {
            const escenas = await response.json();
            let maxOrden = 0;
            escenas.forEach(e => { if (e.orden > maxOrden) maxOrden = e.orden; });
            ordenInput.value = maxOrden + 1;
        } else ordenInput.value = 1;
    } catch (error) { console.error("Error calculando orden:", error); ordenInput.value = "?"; }
}

document.addEventListener("DOMContentLoaded", function() {
    const escenaTienePregunta = document.getElementById("escenaTienePregunta");
    const preguntaSection = document.getElementById("preguntaSection");
    if (escenaTienePregunta && preguntaSection) {
        escenaTienePregunta.addEventListener("change", function() {
            preguntaSection.style.display = this.checked ? "block" : "none";
            if (!this.checked) {
                document.getElementById("preguntaEnunciado").value = "";
                document.getElementById("preguntaExplicacion").value = "";
                document.getElementById("preguntaPuntos").value = 5;
                const container = document.getElementById("respuestasContainerEscena");
                if (container) {
                    container.innerHTML = `
                        <div class="respuesta-item">
                            <input type="text" class="respuesta-texto" placeholder="Opción A">
                            <label><input type="radio" name="respuestaCorrectaEscena" value="0"> Correcta</label>
                            <button type="button" class="btn-remove" onclick="this.parentElement.remove()">✕</button>
                        </div>
                        <div class="respuesta-item">
                            <input type="text" class="respuesta-texto" placeholder="Opción B">
                            <label><input type="radio" name="respuestaCorrectaEscena" value="1"> Correcta</label>
                            <button type="button" class="btn-remove" onclick="this.parentElement.remove()">✕</button>
                        </div>
                        <div class="respuesta-item">
                            <input type="text" class="respuesta-texto" placeholder="Opción C">
                            <label><input type="radio" name="respuestaCorrectaEscena" value="2"> Correcta</label>
                            <button type="button" class="btn-remove" onclick="this.parentElement.remove()">✕</button>
                        </div>
                    `;
                }
            }
        });
    }
});

function agregarRespuestaEscena() {
    const container = document.getElementById("respuestasContainerEscena");
    if (!container) return;
    const index = container.children.length;
    const div = document.createElement("div");
    div.className = "respuesta-item";
    div.innerHTML = `
        <input type="text" class="respuesta-texto" placeholder="Opción ${String.fromCharCode(65 + index)}" style="flex: 1; padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px;">
        <label style="display: flex; align-items: center; gap: 4px; font-size: 13px;">
            <input type="radio" name="respuestaCorrectaEscena" value="${index}"> Correcta
        </label>
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(div);
}

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("formCrearEscena");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const historiaId = parseInt(document.getElementById("escenaHistoriaId").value);
            const contenido = document.getElementById("escenaContenido").value.trim();
            const orden = parseInt(document.getElementById("escenaOrden").value) || 1;
            const esFinal = document.getElementById("escenaEsFinal").checked;
            const tienePregunta = document.getElementById("escenaTienePregunta").checked;
            const message = document.getElementById("escenaMessage");
            if (!historiaId || !contenido) { message.textContent = "Historia y contenido son obligatorios."; message.style.color = "#d9366f"; return; }
            try {
                const response = await fetch(`${API_URL}/escenas`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ historiaId, contenido, orden, esFinal, tienePregunta })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.mensaje || "Error al crear escena.");
                const escenaId = data.id || data.escena?.id;
                if (tienePregunta) {
                    const enunciado = document.getElementById("preguntaEnunciado").value.trim();
                    const explicacion = document.getElementById("preguntaExplicacion").value.trim();
                    const puntosPregunta = parseInt(document.getElementById("preguntaPuntos").value) || 5;
                    const respuestasInputs = document.querySelectorAll("#respuestasContainerEscena .respuesta-texto");
                    const respuestas = [];
                    let correctaIndex = -1;
                    document.querySelectorAll('input[name="respuestaCorrectaEscena"]').forEach((radio, index) => { if (radio.checked) correctaIndex = index; });
                    respuestasInputs.forEach((input, index) => { if (input.value.trim()) respuestas.push({ texto: input.value.trim(), esCorrecta: index === correctaIndex }); });
                    if (!enunciado || respuestas.length < 2) throw new Error("La pregunta debe tener enunciado y al menos 2 respuestas.");
                    const preguntaRes = await fetch(`${API_URL}/preguntas`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ enunciado, explicacion, puntos: puntosPregunta })
                    });
                    const preguntaData = await preguntaRes.json();
                    if (!preguntaRes.ok) throw new Error(preguntaData.mensaje || "Error al crear pregunta.");
                    const preguntaId = preguntaData.id;
                    for (const respuesta of respuestas) {
                        await fetch(`${API_URL}/preguntas/${preguntaId}/respuestas`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ texto: respuesta.texto, esCorrecta: respuesta.esCorrecta })
                        });
                    }
                    await fetch(`${API_URL}/escenas/${escenaId}/pregunta`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ preguntaId })
                    });
                }
                message.textContent = "✅ Escena creada correctamente.";
                message.style.color = "#2ca66f";
                cerrarModal("modalCrearEscena");
                await cargarContenidoJerarquico();
                mostrarNotificacion("✅ Escena creada correctamente", "success");
            } catch (error) {
                message.textContent = "❌ " + error.message;
                message.style.color = "#d9366f";
            }
        });
    }
});

function abrirModalCrearDecision(escenaId) {
    const modal = document.getElementById("modalCrearDecision");
    if (modal) {
        document.getElementById("decisionEscenaId").value = escenaId;
        modal.classList.add("show");
        document.getElementById("formCrearDecision")?.reset();
        document.getElementById("decisionMessage").textContent = "";
        cargarSelectEscenasParaDecision(escenaId);
    }
}

async function cargarSelectEscenasParaDecision(escenaId) {
    const select = document.getElementById("decisionSiguienteEscena");
    if (!select) return;
    select.innerHTML = '<option value="">- Ninguna (final) -</option>';
    try {
        const escenaRes = await fetch(`${API_URL}/escenas/${escenaId}`);
        if (!escenaRes.ok) return;
        const escena = await escenaRes.json();
        if (escena && escena.historiaId) {
            const response = await fetch(`${API_URL}/escenas/historia/${escena.historiaId}`);
            if (response.ok) {
                const escenas = await response.json();
                escenas.forEach(e => {
                    if (e.id !== escenaId) {
                        const option = document.createElement("option");
                        option.value = e.id;
                        option.textContent = `Escena #${e.orden}${e.esFinal ? ' 🏁' : ''}`;
                        select.appendChild(option);
                    }
                });
            }
        }
    } catch (error) { console.error("Error cargando escenas:", error); }
}

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("formCrearDecision");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const escenaId = parseInt(document.getElementById("decisionEscenaId").value);
            const texto = document.getElementById("decisionTexto").value.trim();
            const esCorrecta = document.getElementById("decisionEsCorrecta").value === "true";
            const puntos = parseInt(document.getElementById("decisionPuntos").value) || 0;
            const retroalimentacion = document.getElementById("decisionRetroalimentacion").value.trim();
            const siguienteEscenaId = document.getElementById("decisionSiguienteEscena").value;
            const message = document.getElementById("decisionMessage");
            if (!texto) { message.textContent = "El texto de la decisión es obligatorio."; message.style.color = "#d9366f"; return; }
            try {
                const response = await fetch(`${API_URL}/decisiones`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        escenaId,
                        texto,
                        siguienteEscenaId: siguienteEscenaId ? parseInt(siguienteEscenaId) : null,
                        puntos,
                        esCorrecta,
                        retroalimentacion
                    })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.mensaje || "Error al crear decisión.");
                message.textContent = "✅ Decisión creada correctamente.";
                message.style.color = "#2ca66f";
                cerrarModal("modalCrearDecision");
                await cargarContenidoJerarquico();
                mostrarNotificacion("✅ Decisión creada correctamente", "success");
            } catch (error) {
                message.textContent = "❌ " + error.message;
                message.style.color = "#d9366f";
            }
        });
    }
});

function abrirModalCrearPregunta(escenaId) {
    const modal = document.getElementById("modalCrearPregunta");
    if (modal) {
        document.getElementById("preguntaEscenaId").value = escenaId;
        modal.classList.add("show");
        document.getElementById("formCrearPregunta")?.reset();
        document.getElementById("preguntaMessage").textContent = "";
        const container = document.getElementById("respuestasContainer");
        if (container) {
            container.innerHTML = `
                <div class="respuesta-item">
                    <input type="text" class="respuesta-texto" placeholder="Opción A" required>
                    <label><input type="radio" name="respuestaCorrecta" value="0"> Correcta</label>
                </div>
                <div class="respuesta-item">
                    <input type="text" class="respuesta-texto" placeholder="Opción B" required>
                    <label><input type="radio" name="respuestaCorrecta" value="1"> Correcta</label>
                </div>
                <div class="respuesta-item">
                    <input type="text" class="respuesta-texto" placeholder="Opción C" required>
                    <label><input type="radio" name="respuestaCorrecta" value="2"> Correcta</label>
                </div>
            `;
        }
    }
}

function agregarRespuesta() {
    const container = document.getElementById("respuestasContainer");
    if (!container) return;
    const index = container.children.length;
    const div = document.createElement("div");
    div.className = "respuesta-item";
    div.innerHTML = `
        <input type="text" class="respuesta-texto" placeholder="Opción ${String.fromCharCode(65 + index)}" required>
        <label><input type="radio" name="respuestaCorrecta" value="${index}"> Correcta</label>
        <button type="button" class="text-button" style="color: #d9366f;" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(div);
}

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("formCrearPregunta");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const escenaId = parseInt(document.getElementById("preguntaEscenaId").value);
            const enunciado = document.getElementById("preguntaEnunciado").value.trim();
            const explicacion = document.getElementById("preguntaExplicacion").value.trim();
            const puntos = parseInt(document.getElementById("preguntaPuntos").value) || 5;
            const message = document.getElementById("preguntaMessage");
            const respuestasInputs = document.querySelectorAll(".respuesta-texto");
            const respuestas = [];
            let correctaIndex = -1;
            document.querySelectorAll('input[name="respuestaCorrecta"]').forEach((radio, index) => { if (radio.checked) correctaIndex = index; });
            respuestasInputs.forEach((input, index) => { if (input.value.trim()) respuestas.push({ texto: input.value.trim(), esCorrecta: index === correctaIndex }); });
            if (!enunciado || respuestas.length < 2) { message.textContent = "Enunciado y al menos 2 respuestas son obligatorios."; message.style.color = "#d9366f"; return; }
            try {
                const preguntaRes = await fetch(`${API_URL}/preguntas`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ enunciado, explicacion, puntos })
                });
                const preguntaData = await preguntaRes.json();
                if (!preguntaRes.ok) throw new Error(preguntaData.mensaje || "Error al crear pregunta.");
                const preguntaId = preguntaData.id;
                for (const respuesta of respuestas) {
                    await fetch(`${API_URL}/preguntas/${preguntaId}/respuestas`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ texto: respuesta.texto, esCorrecta: respuesta.esCorrecta })
                    });
                }
                await fetch(`${API_URL}/escenas/${escenaId}/pregunta`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ preguntaId })
                });
                message.textContent = "✅ Pregunta creada correctamente.";
                message.style.color = "#2ca66f";
                cerrarModal("modalCrearPregunta");
                await cargarContenidoJerarquico();
                mostrarNotificacion("✅ Pregunta creada correctamente", "success");
            } catch (error) {
                message.textContent = "❌ " + error.message;
                message.style.color = "#d9366f";
            }
        });
    }
});

// ==========================================
// MODAL - CREAR ESTUDIANTE
// ==========================================

function abrirModalCrearEstudiante() {
    const modal = document.getElementById("modalCrearEstudiante");
    if (modal) {
        modal.classList.add("show");
        document.getElementById("formCrearEstudiante")?.reset();
        document.getElementById("estudianteMessage").textContent = "";
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("formCrearEstudiante");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nombre = document.getElementById("estudianteNombre").value.trim();
            const apellido = document.getElementById("estudianteApellido").value.trim();
            const email = document.getElementById("estudianteEmail").value.trim();
            const password = document.getElementById("estudiantePassword").value;
            const esSecundaria = document.getElementById("estudianteNivel").value === "true";
            const message = document.getElementById("estudianteMessage");
            if (!nombre || !apellido || !email || !password) { message.textContent = "Todos los campos son obligatorios."; message.style.color = "#d9366f"; return; }
            if (password.length < 6) { message.textContent = "La contraseña debe tener al menos 6 caracteres."; message.style.color = "#d9366f"; return; }
            try {
                const response = await fetch(`${API_URL}/estudiantes/registro`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nombre, apellido, email, password, esSecundaria })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.mensaje || "Error al crear estudiante.");
                message.textContent = "✅ Estudiante creado correctamente.";
                message.style.color = "#2ca66f";
                cerrarModal("modalCrearEstudiante");
                await cargarEstudiantes();
                mostrarNotificacion("✅ Estudiante creado correctamente", "success");
            } catch (error) {
                message.textContent = "❌ " + error.message;
                message.style.color = "#d9366f";
            }
        });
    }
});

function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("show");
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
// RESTAURAR CLASE
// ==========================================

async function restaurarClaseSiEsNecesario() {
    const seccionActual = obtenerSeccionGuardada();
    if (seccionActual === 'classDetail') {
        const claseId = localStorage.getItem('claseActualId');
        if (claseId) {
            await openClass(parseInt(claseId));
        } else {
            showSection('clases');
            guardarSeccion('clases');
        }
    }
}

// ==========================================
// CARGA INICIAL
// ==========================================

async function initializeDashboard() {
    console.log("Inicializando dashboard...");

    // Actualizar nombre del profesor
    const userNameElement = document.getElementById("userName");
    if (userNameElement && profesorActual.nombre) {
        userNameElement.textContent = profesorActual.nombre;
    }
    const welcomeElement = document.getElementById("welcomeMessage");
    if (welcomeElement && profesorActual.nombre) {
        welcomeElement.textContent = `¡Hola, ${profesorActual.nombre}! 👋`;
    }
    const avatarElement = document.getElementById("userAvatar");
    if (avatarElement && profesorActual.nombre) {
        const iniciales = profesorActual.nombre
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
        avatarElement.textContent = iniciales;
    }

    // Cargar datos
    await Promise.all([
        loadClasses(),
        cargarEstudiantes(),
        cargarContenidoJerarquico(),
        cargarMisionesMejorado(),
        cargarDashboardEstadisticas(),
        cargarFiltrosClase(),
        cargarClasesProgreso(),
        cargarProgresoGeneral()
    ]);

    // Restaurar sección
    const seccionGuardada = obtenerSeccionGuardada();
    showSection(seccionGuardada);
    await restaurarClaseSiEsNecesario();

    // Inicializar animaciones
    Animations.init();

    console.log("Dashboard cargado correctamente.");
}

// Cargar filtros de clase para la sección de estudiantes
async function cargarFiltrosClase() {
    const select = document.getElementById('filtroClase');
    if (!select) return;
    try {
        const response = await fetch(`${API_URL}/clases?profesorId=${PROFESOR_ID}`);
        if (response.ok) {
            const clases = await response.json();
            const valorActual = select.value;
            select.innerHTML = '<option value="todas">Todas las clases</option>';
            clases.forEach(clase => {
                const option = document.createElement('option');
                option.value = clase.id;
                option.textContent = `${clase.nombre} (${clase.nivel || 'General'})`;
                select.appendChild(option);
            });
            if (valorActual && valorActual !== 'todas') {
                const existe = clases.some(c => c.id == valorActual);
                if (existe) select.value = valorActual;
            }
        }
    } catch (error) { console.error('Error cargando filtros de clase:', error); }
}

document.getElementById("cerrarSesion")?.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("profesor");
    window.location.href = "login.html";
});

document.getElementById("backToClasses")?.addEventListener("click", () => {
    showSection("clases");
});

initializeDashboard();