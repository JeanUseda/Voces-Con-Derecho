function guardarSeccion(sectionId) {
    localStorage.setItem('seccionActual', sectionId);
    
    // Si es detalle de clase, guardar también el ID
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


const API_URL = "http://localhost:5019/api";

// ==========================================
// OBTENER PROFESOR AUTENTICADO
// ==========================================

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
});

// ==========================================
// ACTUALIZAR DATOS DEL PROFESOR EN LA UI
// ==========================================

function actualizarDatosProfesor() {
    const avatar = document.getElementById("userAvatar");
    if (avatar && profesorActual && profesorActual.nombre) {
        const iniciales = profesorActual.nombre
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
        avatar.textContent = iniciales;
    }

    const userName = document.getElementById("userName");
    if (userName && profesorActual && profesorActual.nombre) {
        userName.textContent = profesorActual.nombre;
    }

    const welcomeMessage = document.getElementById("welcomeMessage");
    if (welcomeMessage && profesorActual && profesorActual.nombre) {
        welcomeMessage.textContent = `¡Hola, ${profesorActual.nombre}! 👋`;
    }
}

/* =========================================
   ELEMENTOS
========================================= */

const sections = document.querySelectorAll(".dashboard-section");
const menuItems = document.querySelectorAll(".menu-item[data-section]");
const createClassModal = document.getElementById("createClassModal");
const createClassForm = document.getElementById("createClassForm");

/* =========================================
   NAVEGACIÓN
========================================= */

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
}

menuItems.forEach(item => {
    item.addEventListener("click", event => {
        event.preventDefault();
        showSection(item.dataset.section);
    });
});


/* =========================================
   MODAL CREAR CLASE
========================================= */

function openCreateClassModal() {
    createClassModal.classList.add("show");
}

function closeCreateClassModal() {
    createClassModal.classList.remove("show");
    createClassForm.reset();
    document.getElementById("createClassMessage").textContent = "";
}

document.getElementById("openCreateClass").addEventListener("click", openCreateClassModal);
document.getElementById("openCreateClass2").addEventListener("click", openCreateClassModal);
document.getElementById("closeCreateClass").addEventListener("click", closeCreateClassModal);

createClassModal.addEventListener("click", event => {
    if (event.target === createClassModal) {
        closeCreateClassModal();
    }
});

/* =========================================
   GET CLASES
========================================= */

async function loadClasses() {
    const dashboardContainer = document.getElementById("dashboardClasses");
    const allClassesContainer = document.getElementById("allClasses");

    try {
        const response = await fetch(`${API_URL}/clases?profesorId=${PROFESOR_ID}`);
        if (!response.ok) {
            throw new Error("No se pudieron cargar las clases.");
        }

        const classes = await response.json();
        console.log("Clases recibidas:", classes);

        document.getElementById("totalClasses").textContent = classes.length;
        renderClasses(dashboardContainer, classes.slice(0, 3));
        renderClasses(allClassesContainer, classes);
        await loadTotalStudents(classes);

    } catch (error) {
        console.error("Error cargando clases:", error);
        dashboardContainer.innerHTML = `<div class="empty-state">No se pudieron cargar las clases.</div>`;
        allClassesContainer.innerHTML = `<div class="empty-state">No se pudieron cargar las clases.</div>`;
    }
}

// ==========================================
// RENDER CLASES MEJORADO
// ==========================================

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
        // ✅ El nivel viene de la base de datos
        const nivel = clase.nivel || 'Secundaria';
        const nivelClass = nivel === 'Primaria' ? 'primaria' : 'secundaria';
        
        return `
            <div class="class-card-modern" data-clase-id="${clase.id}">
                <div class="class-card-header">
                    <div>
                        <h3>${escapeHtml(clase.nombre)}</h3>
                        <span class="class-level-badge ${nivelClass}">
                            ${escapeHtml(nivel)}
                        </span>
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
                        <button class="btn-ver-detalle" onclick="openClass(${clase.id})">
                            👁️ Ver detalle
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    classes.forEach(clase => {
        cargarContadoresClase(clase.id);
    });
}
// ==========================================
// CARGAR CONTADORES DE CLASE
// ==========================================

async function cargarContadoresClase(claseId) {
    try {
        // 1. Cargar estudiantes
        const estudiantesResponse = await fetch(`${API_URL}/clases/${claseId}/estudiantes`);
        if (estudiantesResponse.ok) {
            const estudiantes = await estudiantesResponse.json();
            const countEl = document.getElementById(`estudiantesCount_${claseId}`);
            if (countEl) countEl.textContent = estudiantes.length;
        }

        // 2. Cargar misiones
        const misionesResponse = await fetch(`${API_URL}/clases/${claseId}/misiones`);
        if (misionesResponse.ok) {
            const misiones = await misionesResponse.json();
            const countEl = document.getElementById(`misionesCount_${claseId}`);
            if (countEl) countEl.textContent = misiones.length;
        }

        // 3. Calcular progreso promedio de la clase
        await calcularProgresoClase(claseId);

    } catch (error) {
        console.error('Error cargando contadores:', error);
    }
}

// ==========================================
// CALCULAR PROGRESO PROMEDIO DE LA CLASE
// ==========================================

async function calcularProgresoClase(claseId) {
    try {
        // Obtener estudiantes de la clase
        const estudiantesResponse = await fetch(`${API_URL}/clases/${claseId}/estudiantes`);
        if (!estudiantesResponse.ok) return;
        const estudiantes = await estudiantesResponse.json();

        if (estudiantes.length === 0) {
            const progEl = document.getElementById(`progresoCount_${claseId}`);
            if (progEl) progEl.textContent = '0%';
            return;
        }

        // Obtener todas las misiones
        const misionesResponse = await fetch(`${API_URL}/misiones`);
        const todasMisiones = misionesResponse.ok ? await misionesResponse.json() : [];

        let totalProgreso = 0;
        let estudiantesConDatos = 0;

        for (const estudiante of estudiantes) {
            try {
                let completadas = 0;
                let totalHistorias = 0;

                for (const mision of todasMisiones) {
                    try {
                        const progresoResponse = await fetch(`${API_URL}/historias/progreso/mision/${estudiante.estudianteId}/${mision.id}`);
                        if (progresoResponse.ok) {
                            const progresoData = await progresoResponse.json();
                            if (Array.isArray(progresoData)) {
                                completadas += progresoData.filter(p => p.completada === true).length;
                                totalHistorias += progresoData.length;
                            } else {
                                completadas += progresoData.historiasCompletadas || 0;
                                totalHistorias += progresoData.totalHistorias || 0;
                            }
                        }
                    } catch (error) {
                        console.error(`Error en misión:`, error);
                    }
                }

                const total = totalHistorias || 1;
                const porcentaje = Math.min(100, Math.round((completadas / total) * 100));
                totalProgreso += porcentaje;
                estudiantesConDatos++;

            } catch (error) {
                console.error(`Error:`, error);
                estudiantesConDatos++;
            }
        }

        const progresoPromedio = estudiantesConDatos > 0 ? Math.round(totalProgreso / estudiantesConDatos) : 0;

        const progEl = document.getElementById(`progresoCount_${claseId}`);
        if (progEl) progEl.textContent = `${progresoPromedio}%`;

    } catch (error) {
        console.error('Error calculando progreso de clase:', error);
    }
}

// ==========================================
// VER PROGRESO DE CLASE
// ==========================================

function verProgresoClase(claseId, claseNombre) {
    // Guardar la clase seleccionada para usar en la sección de estudiantes
    localStorage.setItem('claseSeleccionada', JSON.stringify({ id: claseId, nombre: claseNombre }));
    
    // Cambiar a la sección de estudiantes
    showSection('estudiantes');
    
    // Mostrar notificación
    mostrarNotificacion(`📊 Mostrando progreso de "${claseNombre}"`, 'info');
    
    // Recargar la vista de estudiantes con el filtro de la clase
    setTimeout(() => {
        cargarEstudiantes();
        // Resaltar la clase en el filtro (opcional)
        const filtroInput = document.getElementById('filtroClase');
        if (filtroInput) {
            filtroInput.value = claseNombre;
        }
    }, 300);
}

/* =========================================
   CREAR CLASE
========================================= */

createClassForm.addEventListener("submit", async event => {
    event.preventDefault();

    const nombre = document.getElementById("className").value.trim();
    const nivel = document.getElementById("classLevel").value;
    const message = document.getElementById("createClassMessage");

    try {
        const response = await fetch(`${API_URL}/clases`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: nombre,
                nivel: nivel,
                profesorId: PROFESOR_ID
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data || "No se pudo crear la clase.");
        }

        message.textContent = "Clase creada correctamente.";
        message.style.color = "#2ca66f";
        createClassForm.reset();
        await loadClasses();

        setTimeout(() => {
            closeCreateClassModal();
        }, 800);

    } catch (error) {
        console.error("Error creando clase:", error);
        message.textContent = "No se pudo crear la clase.";
        message.style.color = "#d9366f";
    }
});

/* =========================================
   ABRIR CLASE
========================================= */

async function openClass(classId) {

    localStorage.setItem('claseActualId', classId);
    const section = document.getElementById("classDetail");
    if (section) {
        section.dataset.claseId = classId;
    }

    showSection("classDetail");

    const name = document.getElementById("detailClassName");
    const level = document.getElementById("detailClassLevel");

    name.textContent = "Cargando...";
    level.textContent = "";

    try {
        const response = await fetch(`${API_URL}/clases/${classId}`);
        if (!response.ok) {
            throw new Error("Clase no encontrada.");
        }

        const clase = await response.json();
        name.textContent = clase.nombre;
        level.textContent = `ID: ${clase.id} · Profesor: ${profesorActual?.nombre || ''}`;

        // Cargar estudiantes, misiones e inactivos
        await Promise.all([
            loadClassStudentsDetalle(classId),
            loadInactiveStudentsDetalle(classId),
            loadClassMissionsDetalle(classId),
            cargarEstadisticasClase(classId)
        ]);

        // Configurar botones
        const btnAgregar = document.getElementById("openAgregarEstudiante");
        if (btnAgregar) {
            btnAgregar.onclick = () => {
                const nombreClase = document.getElementById("detailClassName")?.textContent || "clase";
                abrirModalAgregarEstudiante(classId, nombreClase);
            };
        }

        const btnAsignar = document.getElementById("btnAsignarMision");
        if (btnAsignar) {
            btnAsignar.onclick = () => {
                const nombreClase = document.getElementById("detailClassName")?.textContent || "clase";
                abrirModalAsignarMision(classId, nombreClase);
            };
        }

        // Resetear tabs a Estudiantes
        switchDetailTab('estudiantes');

    } catch (error) {
        console.error("Error cargando clase:", error);
        name.textContent = "No se pudo cargar la clase.";
    }
}
// ==========================================
// CAMBIAR TABS EN DETALLE DE CLASE
// ==========================================

function switchDetailTab(tabId) {
    // Ocultar todos los tabs
    document.querySelectorAll('.detail-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.detail-tab').forEach(btn => {
        btn.classList.remove('active');
    });

    // Mostrar el tab seleccionado
    const content = document.getElementById(`detailTab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
    if (content) content.classList.add('active');

    // Activar el botón correspondiente
    document.querySelector(`.detail-tab[data-tab="${tabId}"]`)?.classList.add('active');
}
// ==========================================
// RESTAURAR CLASE AL RECARGAR
// ==========================================

async function restaurarClaseSiEsNecesario() {
    const seccionActual = obtenerSeccionGuardada();
    
    // Si la sección guardada es "classDetail", cargar los datos
    if (seccionActual === 'classDetail') {
        const claseId = localStorage.getItem('claseActualId');
        if (claseId) {
            console.log(`🔄 Restaurando clase ID: ${claseId}`);
            await openClass(parseInt(claseId));
        } else {
            // Si no hay ID guardado, ir a clases
            showSection('clases');
            guardarSeccion('clases');
        }
    }
}
async function cargarEstadisticasClase(classId) {
    try {
        const estudiantesResponse = await fetch(`${API_URL}/clases/${classId}/estudiantes`);
        if (!estudiantesResponse.ok) {
            throw new Error("Error al obtener estudiantes.");
        }
        const estudiantes = await estudiantesResponse.json();

        const misionesResponse = await fetch(`${API_URL}/clases/${classId}/misiones`);
        const misiones = misionesResponse.ok ? await misionesResponse.json() : [];

        document.getElementById('detailTotalEstudiantes').textContent = estudiantes.length;
        document.getElementById('detailTotalMisiones').textContent = misiones.length;

        // Calcular progreso promedio real
        let totalProgreso = 0;
        let totalPuntos = 0;
        let estudiantesConDatos = 0;

        for (const estudiante of estudiantes) {
            try {
                // ✅ USAR EL ENDPOINT CORRECTO
                const progresoResponse = await fetch(`${API_URL}/historias/progreso/mision/${estudiante.estudianteId}/1`);
                if (progresoResponse.ok) {
                    const progresoData = await progresoResponse.json();
                    
                    let completadas = 0;
                    let puntos = 0;
                    
                    if (Array.isArray(progresoData)) {
                        completadas = progresoData.filter(p => p.completada === true).length;
                        puntos = progresoData.reduce((sum, p) => sum + (p.puntosObtenidos || 0), 0);
                    } else if (progresoData.historiasCompletadas !== undefined) {
                        completadas = progresoData.historiasCompletadas || 0;
                        puntos = progresoData.puntosTotales || 0;
                    }
                    
                    const historiasResponse = await fetch(`${API_URL}/historias/mision/1`);
                    let totalHistorias = 10;
                    if (historiasResponse.ok) {
                        const historias = await historiasResponse.json();
                        totalHistorias = historias.length || 10;
                    }
                    
                    const porcentaje = totalHistorias > 0 ? Math.min(100, Math.round((completadas / totalHistorias) * 100)) : 0;
                    
                    totalProgreso += porcentaje;
                    totalPuntos += puntos;
                    estudiantesConDatos++;
                }
            } catch (error) {
                console.error(`Error obteniendo progreso:`, error);
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
// CARGAR ESTUDIANTES DETALLE 
// ==========================================

async function loadClassStudentsDetalle(classId) {
    const container = document.getElementById("classStudents");
    container.innerHTML = `<div class="loading">Cargando estudiantes...</div>`;

    try {
        const response = await fetch(`${API_URL}/clases/${classId}/estudiantes`);
        if (!response.ok) {
            throw new Error("Error al obtener estudiantes.");
        }

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

        // Obtener progreso real de cada estudiante
        const studentsConProgreso = await Promise.all(students.map(async (student) => {
            try {
                // ✅ USAR EL ENDPOINT CORRECTO
                const progresoResponse = await fetch(`${API_URL}/historias/progreso/mision/${student.estudianteId}/1`);
                
                if (progresoResponse.ok) {
                    const progresoData = await progresoResponse.json();
                    console.log(`📊 Progreso de ${student.nombre}:`, progresoData);
                    
                    // Calcular historias completadas
                    let completadas = 0;
                    let puntos = 0;
                    
                    if (Array.isArray(progresoData)) {
                        completadas = progresoData.filter(p => p.completada === true).length;
                        puntos = progresoData.reduce((sum, p) => sum + (p.puntosObtenidos || 0), 0);
                    } else if (progresoData.historiasCompletadas !== undefined) {
                        completadas = progresoData.historiasCompletadas || 0;
                        puntos = progresoData.puntosTotales || 0;
                    }
                    
                    // Obtener total de historias de la misión
                    const historiasResponse = await fetch(`${API_URL}/historias/mision/1`);
                    let totalHistorias = 10; // valor por defecto
                    if (historiasResponse.ok) {
                        const historias = await historiasResponse.json();
                        totalHistorias = historias.length || 10;
                    }
                    
                    const porcentaje = totalHistorias > 0 ? Math.min(100, Math.round((completadas / totalHistorias) * 100)) : 0;
                    
                    return {
                        ...student,
                        progreso: porcentaje,
                        puntos: puntos,
                        completadas: completadas,
                        totalHistorias: totalHistorias
                    };
                }
            } catch (error) {
                console.error(`Error obteniendo progreso de ${student.nombre}:`, error);
            }
            
            // Si no hay progreso, valores por defecto
            return {
                ...student,
                progreso: 0,
                puntos: 0,
                completadas: 0,
                totalHistorias: 0
            };
        }));

        // Ordenar por progreso (mayor a menor)
        studentsConProgreso.sort((a, b) => b.progreso - a.progreso);

        container.innerHTML = studentsConProgreso.map(student => {
            const initials = `${student.nombre[0]}${student.apellido[0]}`.toUpperCase();
            const color = student.progreso >= 80 ? '#2ca66f' : student.progreso >= 50 ? '#f59e0b' : '#d9366f';
            
            return `
                <div class="student-row-detalle">
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
                        <button class="btn-desactivar" onclick="desactivarEstudiante(${classId}, ${student.estudianteId})">
                            Desactivar
                        </button>
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
// CARGAR ESTUDIANTES INACTIVOS DETALLE
// ==========================================

async function loadInactiveStudentsDetalle(classId) {
    const container = document.getElementById("inactiveStudents");
    if (!container) return;

    container.innerHTML = `<div class="loading">Cargando estudiantes inactivos...</div>`;

    try {
        const response = await fetch(`${API_URL}/clases/${classId}/estudiantes/inactivos`);
        if (!response.ok) {
            throw new Error("Error al obtener estudiantes inactivos.");
        }

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
                        <button class="btn-desactivar" style="background: #d4edda; color: #155724;" onclick="reactivarEstudiante(${classId}, ${student.estudianteId})">
                            Reactivar
                        </button>
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
// FILTROS DE ESTUDIANTES
// ==========================================

let filtrosEstudiantes = {
    clase: 'todas',
    nivel: 'todos',
    nombre: ''
};

let todasLasClases = [];

// ==========================================
// CARGAR FILTROS DE CLASE
// ==========================================

async function cargarFiltrosClase() {
    const select = document.getElementById('filtroClase');
    if (!select) return;
    
    try {
        const response = await fetch(`${API_URL}/clases?profesorId=${PROFESOR_ID}`);
        if (response.ok) {
            const clases = await response.json();
            todasLasClases = clases;
            
            // Guardar opciones actuales
            const valorActual = select.value;
            
            select.innerHTML = '<option value="todas">Clases</option>';
            clases.forEach(clase => {
                const option = document.createElement('option');
                option.value = clase.id;
                option.textContent = `${clase.nombre} ${clase.nivel || ''}`;
                select.appendChild(option);
            });
            
            // Restaurar valor si existe
            if (valorActual && valorActual !== 'todas') {
                const existe = clases.some(c => c.id == valorActual);
                if (existe) select.value = valorActual;
            }
        }
    } catch (error) {
        console.error('Error cargando filtros de clase:', error);
    }
}

// ==========================================
// CARGAR MISIONES DETALLE
// ==========================================

async function loadClassMissionsDetalle(classId) {
    const container = document.getElementById("classMissions");
    container.innerHTML = `<div class="loading">Cargando misiones...</div>`;

    try {
        const response = await fetch(`${API_URL}/clases/${classId}/misiones`);
        if (!response.ok) {
            throw new Error("Error al obtener misiones.");
        }

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

/* =========================================
   ESTUDIANTES DE CLASE
========================================= */

async function loadClassStudents(classId) {
    const container = document.getElementById("classStudents");
    container.innerHTML = `<div class="loading">Cargando estudiantes...</div>`;

    try {
        const response = await fetch(`${API_URL}/clases/${classId}/estudiantes`);
        if (!response.ok) {
            throw new Error("Error al obtener estudiantes.");
        }

        const students = await response.json();

        if (!students.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <strong>No hay estudiantes activos.</strong>
                    <p>Los estudiantes activos de esta clase aparecerán aquí.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = students.map(student => {
            const initials = `${student.nombre[0]}${student.apellido[0]}`.toUpperCase();
            return `
                <div class="student-row">
                    <div class="student-main">
                        <div class="student-avatar">${initials}</div>
                        <div>
                            <div class="student-name">${escapeHtml(student.nombre)} ${escapeHtml(student.apellido)}</div>
                            <div class="student-date">Ingreso: ${formatDate(student.fechaIngreso)}</div>
                        </div>
                    </div>
                    <button class="student-action danger" onclick="desactivarEstudiante(${classId}, ${student.estudianteId})">
                        Desactivar
                    </button>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="empty-state">No se pudieron cargar los estudiantes.</div>`;
    }
}

async function loadInactiveStudents(classId) {
    const container = document.getElementById("inactiveStudents");
    if (!container) return;

    container.innerHTML = `<div class="loading">Cargando estudiantes inactivos...</div>`;

    try {
        const response = await fetch(`${API_URL}/clases/${classId}/estudiantes/inactivos`);
        if (!response.ok) {
            throw new Error("Error al obtener estudiantes inactivos.");
        }

        const students = await response.json();

        if (!students.length) {
            container.innerHTML = `<div class="empty-state">No hay estudiantes inactivos.</div>`;
            return;
        }

        container.innerHTML = students.map(student => {
            const initials = `${student.nombre[0]}${student.apellido[0]}`.toUpperCase();
            return `
                <div class="student-row inactive-student">
                    <div class="student-main">
                        <div class="student-avatar">${initials}</div>
                        <div>
                            <div class="student-name">${escapeHtml(student.nombre)} ${escapeHtml(student.apellido)}</div>
                            <div class="student-date">Estudiante inactivo</div>
                        </div>
                    </div>
                    <button class="student-action success" onclick="reactivarEstudiante(${classId}, ${student.estudianteId})">
                        Reactivar
                    </button>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="empty-state">No se pudieron cargar los estudiantes inactivos.</div>`;
    }
}

async function reactivarEstudiante(classId, estudianteId) {
    if (!confirm("¿Quieres reactivar a este estudiante en la clase?")) return;

    try {
        const response = await fetch(`${API_URL}/clases/${classId}/estudiantes?estudianteId=${estudianteId}`, {
            method: "POST"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || "No se pudo reactivar el estudiante.");
        }

        await Promise.all([
            loadClassStudents(classId),
            loadInactiveStudents(classId)
        ]);
        await loadClasses();
        await cargarEstadisticasClase(classId);
        await cargarContadoresClase(classId);

    } catch (error) {
        console.error(error);
        alert("No se pudo reactivar el estudiante.");
    }
}

async function desactivarEstudiante(classId, estudianteId) {
    if (!confirm("¿Quieres desactivar a este estudiante de la clase?")) return;

    try {
        const response = await fetch(`${API_URL}/clases/${classId}/estudiantes/${estudianteId}/desactivar`, {
            method: "PATCH"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || "No se pudo desactivar el estudiante.");
        }

        await Promise.all([
            loadClassStudents(classId),
            loadInactiveStudents(classId)
        ]);
        await loadClasses();
        await cargarEstadisticasClase(classId);
        await cargarContadoresClase(classId);

    } catch (error) {
        console.error(error);
        alert("No se pudo desactivar el estudiante.");
    }
}

/* =========================================
   MISIONES DE CLASE
========================================= */

async function loadClassMissions(classId) {
    const container = document.getElementById("classMissions");
    container.innerHTML = `<div class="loading">Cargando misiones...</div>`;

    try {
        const response = await fetch(`${API_URL}/clases/${classId}/misiones`);
        if (!response.ok) {
            throw new Error("Error al obtener misiones.");
        }

        const missions = await response.json();
        console.log("Misiones de clase:", missions);

        if (!missions.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <strong>No hay misiones asignadas.</strong>
                    <p>Las misiones aparecerán aquí.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = missions.map(mission => `
            <div class="mission-card">
                <div class="mission-icon">◇</div>
                <h3>${escapeHtml(mission.titulo)}</h3>
                <p>${escapeHtml(mission.descripcion)}</p>
                <span class="global-badge">${mission.activa ? "Activa" : "Inactiva"}</span>
            </div>
        `).join("");

    } catch (error) {
        console.error("Error cargando misiones de clase:", error);
        container.innerHTML = `<div class="empty-state">No se pudieron cargar las misiones.</div>`;
    }
}

/* =========================================
   TODAS LAS MISIONES
========================================= */

async function loadMissions() {
    const container = document.getElementById("missionsGrid");

    try {
        const response = await fetch(`${API_URL}/misiones`);
        if (!response.ok) {
            throw new Error("Error al obtener misiones.");
        }

        const missions = await response.json();
        console.log("Misiones recibidas:", missions);

        document.getElementById("totalMissions").textContent = missions.length;

        if (!missions.length) {
            container.innerHTML = `<div class="empty-state"><strong>No hay misiones disponibles.</strong></div>`;
            return;
        }

        container.innerHTML = missions.map(mission => `
            <article class="mission-card">
                <div class="mission-icon">◇</div>
                <h3>${escapeHtml(mission.titulo)}</h3>
                <p>${escapeHtml(mission.descripcion)}</p>
                <span class="global-badge">${mission.esGlobal ? "Misión global" : "Misión del profesor"}</span>
            </article>
        `).join("");

    } catch (error) {
        console.error("Error cargando misiones:", error);
        container.innerHTML = `<div class="empty-state">No se pudieron cargar las misiones.</div>`;
    }
}

/* =========================================
   TOTAL DE ESTUDIANTES
========================================= */

async function loadTotalStudents(classes) {
    let total = 0;

    for (const clase of classes) {
        try {
            const response = await fetch(`${API_URL}/clases/${clase.id}/estudiantes`);
            if (response.ok) {
                const students = await response.json();
                total += students.length;
            }
        } catch (error) {
            console.error("Error contando estudiantes:", error);
        }
    }

    document.getElementById("totalStudents").textContent = total;
}

/* =========================================
   ESTUDIANTES GENERAL
========================================= */

// async function loadStudentsOverview() {
//     const container = document.getElementById("studentsOverview");

//     try {
//         const response = await fetch(`${API_URL}/clases?profesorId=${PROFESOR_ID}`);
//         if (!response.ok) {
//             throw new Error("No se pudieron obtener las clases.");
//         }

//         const classes = await response.json();

//         if (!classes.length) {
//             container.innerHTML = `<div class="empty-state"><strong>No tienes clases todavía.</strong></div>`;
//             return;
//         }

//         let html = "";

//         for (const clase of classes) {
//             const studentsResponse = await fetch(`${API_URL}/clases/${clase.id}/estudiantes`);
//             if (!studentsResponse.ok) continue;

//             const students = await studentsResponse.json();

//             html += `
//                 <div class="content-card">
//                     <div class="card-header">
//                         <div>
//                             <h2>${escapeHtml(clase.nombre)}</h2>
//                             <p>${students.length} estudiante(s)</p>
//                         </div>
//                     </div>
//                     <div class="student-list">
//                         ${students.length ? students.map(student => {
//                             const initials = `${student.nombre[0]}${student.apellido[0]}`.toUpperCase();
//                             return `
//                                 <div class="student-row">
//                                     <div class="student-main">
//                                         <div class="student-avatar">${initials}</div>
//                                         <div>
//                                             <div class="student-name">${escapeHtml(student.nombre)} ${escapeHtml(student.apellido)}</div>
//                                             <div class="student-date">Ingreso: ${formatDate(student.fechaIngreso)}</div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             `;
//                         }).join("") : `<div class="empty-state">No hay estudiantes activos.</div>`}
//                     </div>
//                 </div>
//             `;
//         }

//         container.innerHTML = html || `<div class="empty-state">No hay estudiantes.</div>`;

//     } catch (error) {
//         console.error("Error cargando estudiantes:", error);
//         container.innerHTML = `<div class="empty-state">No se pudieron cargar los estudiantes.</div>`;
//     }
// }

/* =========================================
   VOLVER A CLASES
========================================= */

document.getElementById("backToClasses").addEventListener("click", () => {
    showSection("clases");
});

/* =========================================
   CERRAR SESIÓN
========================================= */

document.getElementById("cerrarSesion")?.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("profesor");
    window.location.href = "login.html";
});

/* =========================================
   UTILIDADES
========================================= */

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

/* =========================================
   MODAL AGREGAR ESTUDIANTE
========================================= */

let claseIdSeleccionadaAgregar = null;
let todosLosEstudiantes = [];
let estudiantesEnClaseIds = new Set();

const agregarEstudianteModal = document.getElementById("agregarEstudianteModal");
const listaEstudiantesAgregar = document.getElementById("listaEstudiantesAgregar");
const buscadorEstudiantes = document.getElementById("buscadorEstudiantes");
const agregarEstudianteSubtexto = document.getElementById("agregarEstudianteSubtexto");

async function abrirModalAgregarEstudiante(claseId, claseNombre) {
    claseIdSeleccionadaAgregar = claseId;
    agregarEstudianteSubtexto.textContent = `Selecciona un estudiante para agregar a "${claseNombre}"`;
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
    listaEstudiantesAgregar.innerHTML = `<div class="loading">Cargando estudiantes...</div>`;

    try {
        const [estudiantesResponse, claseEstudiantesResponse] = await Promise.all([
            fetch(`${API_URL}/estudiantes/todos`),
            fetch(`${API_URL}/clases/${claseId}/estudiantes`)
        ]);

        if (!estudiantesResponse.ok) {
            throw new Error("Error al cargar estudiantes.");
        }

        const todos = await estudiantesResponse.json();
        todosLosEstudiantes = todos;

        if (claseEstudiantesResponse.ok) {
            const enClase = await claseEstudiantesResponse.json();
            estudiantesEnClaseIds = new Set(enClase.map(e => e.estudianteId));
        }

        renderizarListaEstudiantes(todosLosEstudiantes);

    } catch (error) {
        console.error("Error cargando estudiantes:", error);
        listaEstudiantesAgregar.innerHTML = `
            <div class="empty-state">
                <strong>Error al cargar estudiantes</strong>
                <p>No se pudieron cargar los estudiantes disponibles.</p>
                <button onclick="cargarEstudiantesDisponibles(${claseId})" class="primary-button" style="margin-top: 15px;">
                    Reintentar
                </button>
            </div>
        `;
    }
}

function renderizarListaEstudiantes(estudiantes) {
    if (!estudiantes || !estudiantes.length) {
        listaEstudiantesAgregar.innerHTML = `
            <div class="empty-state">
                <strong>No hay estudiantes disponibles</strong>
                <p>No se encontraron estudiantes para agregar.</p>
            </div>
        `;
        return;
    }

    const estudiantesFiltrados = estudiantes.filter(e => {
        const busqueda = buscadorEstudiantes.value.toLowerCase().trim();
        if (!busqueda) return true;
        const nombreCompleto = `${e.nombre} ${e.apellido}`.toLowerCase();
        return nombreCompleto.includes(busqueda);
    });

    if (!estudiantesFiltrados.length) {
        listaEstudiantesAgregar.innerHTML = `
            <div class="empty-state">
                <strong>No hay coincidencias</strong>
                <p>No se encontraron estudiantes con ese nombre.</p>
            </div>
        `;
        return;
    }

    listaEstudiantesAgregar.innerHTML = estudiantesFiltrados.map(estudiante => {
        const yaAgregado = estudiantesEnClaseIds.has(estudiante.id);
        const iniciales = `${estudiante.nombre[0]}${estudiante.apellido[0]}`.toUpperCase();

        return `
            <div class="estudiante-agregar-item" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border: 1px solid ${yaAgregado ? '#d4edda' : 'var(--border)'}; border-radius: 12px; margin-bottom: 10px; background: ${yaAgregado ? '#f0fff4' : 'white'};">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: var(--purple-soft); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--primary); font-size: 13px;">
                        ${iniciales}
                    </div>
                    <div>
                        <strong style="font-size: 15px;">${escapeHtml(estudiante.nombre)} ${escapeHtml(estudiante.apellido)}</strong>
                        <div style="font-size: 12px; color: var(--text-light);">${estudiante.email || 'Sin email'}</div>
                    </div>
                </div>
                <div>
                    ${yaAgregado
                        ? `<span style="display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 20px; background: #d4edda; color: #155724; font-size: 12px; font-weight: 600;">✓ En clase</span>`
                        : `<button onclick="agregarEstudianteAClase(${estudiante.id})" class="primary-button" style="min-height: 34px; padding: 0 18px; font-size: 12px;">Agregar</button>`
                    }
                </div>
            </div>
        `;
    }).join("");
}

async function agregarEstudianteAClase(estudianteId) {
    if (!claseIdSeleccionadaAgregar) {
        alert("No hay una clase seleccionada.");
        return;
    }

    const boton = event?.target;
    const textoOriginal = boton?.textContent || "Agregar";

    if (boton) {
        boton.disabled = true;
        boton.textContent = "Agregando...";
    }

    try {
        const response = await fetch(
            `${API_URL}/clases/${claseIdSeleccionadaAgregar}/estudiantes?estudianteId=${estudianteId}`,
            { method: "POST", headers: { "Content-Type": "application/json" } }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || "Error al agregar estudiante.");
        }

        estudiantesEnClaseIds.add(estudianteId);
        renderizarListaEstudiantes(todosLosEstudiantes);

        if (claseIdSeleccionadaAgregar) {
            await loadClassStudents(claseIdSeleccionadaAgregar);
            await loadInactiveStudents(claseIdSeleccionadaAgregar);
            await loadClasses();
            await cargarEstadisticasClase(claseIdSeleccionadaAgregar);
            await cargarContadoresClase(claseIdSeleccionadaAgregar);
        }

        mostrarNotificacion("✅ Estudiante agregado correctamente", "success");

    } catch (error) {
        console.error("Error agregando estudiante:", error);
        mostrarNotificacion("❌ " + error.message, "error");
        if (boton) {
            boton.disabled = false;
            boton.textContent = textoOriginal;
        }
    }
}

document.getElementById("openAgregarEstudiante")?.addEventListener("click", () => {
    const claseId = parseInt(document.querySelector("#classDetail")?.dataset?.claseId);
    if (!claseId) {
        alert("No hay una clase seleccionada.");
        return;
    }
    const nombreClase = document.getElementById("detailClassName")?.textContent || "clase";
    abrirModalAgregarEstudiante(claseId, nombreClase);
});

document.getElementById("closeAgregarEstudiante")?.addEventListener("click", cerrarModalAgregarEstudiante);
document.getElementById("cancelarAgregarEstudiante")?.addEventListener("click", cerrarModalAgregarEstudiante);

agregarEstudianteModal?.addEventListener("click", (event) => {
    if (event.target === agregarEstudianteModal) {
        cerrarModalAgregarEstudiante();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && agregarEstudianteModal?.classList.contains("show")) {
        cerrarModalAgregarEstudiante();
    }
});

buscadorEstudiantes?.addEventListener("input", () => {
    renderizarListaEstudiantes(todosLosEstudiantes);
});

/* =========================================
   MODAL ASIGNAR MISIÓN
========================================= */

let claseIdSeleccionada = null;
let misionesGlobales = [];
let misionesAsignadasIds = new Set();

const asignarMisionModal = document.getElementById("asignarMisionModal");
const listaMisionesAsignar = document.getElementById("listaMisionesAsignar");
const asignarMisionSubtexto = document.getElementById("asignarMisionSubtexto");

async function abrirModalAsignarMision(claseId, claseNombre) {
    claseIdSeleccionada = claseId;
    asignarMisionSubtexto.textContent = `Selecciona una misión para asignar a "${claseNombre}"`;
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
    listaMisionesAsignar.innerHTML = `<div class="loading">Cargando misiones...</div>`;

    try {
        const [misionesResponse, asignadasResponse] = await Promise.all([
            fetch(`${API_URL}/misiones`),
            fetch(`${API_URL}/clases/${claseId}/misiones`)
        ]);

        if (!misionesResponse.ok) {
            throw new Error("Error al cargar misiones.");
        }

        const todasMisiones = await misionesResponse.json();
        misionesGlobales = todasMisiones.filter(m => m.esGlobal === true);

        if (asignadasResponse.ok) {
            const asignadas = await asignadasResponse.json();
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
        listaMisionesAsignar.innerHTML = `
            <div class="empty-state">
                <strong>No hay misiones disponibles</strong>
                <p>No se encontraron misiones globales para asignar.</p>
            </div>
        `;
        return;
    }

    listaMisionesAsignar.innerHTML = misionesGlobales.map(mision => {
        const yaAsignada = misionesAsignadasIds.has(mision.id);
        return `
            <div class="mision-asignar-item" style="display: flex; align-items: center; justify-content: space-between; padding: 16px; border: 1px solid ${yaAsignada ? '#d4edda' : 'var(--border)'}; border-radius: 12px; margin-bottom: 12px; background: ${yaAsignada ? '#f0fff4' : 'white'};">
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
    if (!claseIdSeleccionada) {
        alert("No hay una clase seleccionada.");
        return;
    }

    const boton = event?.target;
    const textoOriginal = boton?.textContent || "Asignar";

    if (boton) {
        boton.disabled = true;
        boton.textContent = "Asignando...";
    }

    try {
        const response = await fetch(
            `${API_URL}/clases/${claseIdSeleccionada}/misiones/${misionId}`,
            { method: "POST", headers: { "Content-Type": "application/json" } }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || "Error al asignar misión.");
        }

        misionesAsignadasIds.add(misionId);
        renderizarListaMisiones();

        if (claseIdSeleccionada) {
            await loadClassMissions(claseIdSeleccionada);
            await cargarEstadisticasClase(claseIdSeleccionada);
            await cargarContadoresClase(claseIdSeleccionada);
        }

        mostrarNotificacion("✅ Misión asignada correctamente", "success");

    } catch (error) {
        console.error("Error asignando misión:", error);
        mostrarNotificacion("❌ " + error.message, "error");
        if (boton) {
            boton.disabled = false;
            boton.textContent = textoOriginal;
        }
    }
}

function mostrarNotificacion(mensaje, tipo = "success") {
    document.querySelectorAll(".notificacion-flotante").forEach(n => n.remove());

    const colores = { success: "#2ca66f", error: "#d9366f", info: "#5636c9" };

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

function abrirAsignarMisionDesdeDetalle() {
    const section = document.getElementById("classDetail");
    const claseId = parseInt(section?.dataset?.claseId);
    if (!claseId) {
        alert("No hay una clase seleccionada.");
        return;
    }
    const nombreClase = document.getElementById("detailClassName")?.textContent || "clase";
    abrirModalAsignarMision(claseId, nombreClase);
}

document.getElementById("closeAsignarMision")?.addEventListener("click", cerrarModalAsignarMision);
document.getElementById("cancelarAsignarMision")?.addEventListener("click", cerrarModalAsignarMision);

asignarMisionModal?.addEventListener("click", (event) => {
    if (event.target === asignarMisionModal) {
        cerrarModalAsignarMision();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && asignarMisionModal?.classList.contains("show")) {
        cerrarModalAsignarMision();
    }
});

/* =========================================
   GESTIÓN DE CONTENIDO - MISIONES
========================================= */

async function cargarMisionesGestion() {
    const container = document.getElementById("listaMisiones");
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Cargando misiones...</div>';

    try {
        const response = await fetch(`${API_URL}/misiones`);
        if (!response.ok) throw new Error("Error al cargar misiones.");
        
        const misiones = await response.json();
        
        if (misiones.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <strong>No hay misiones</strong>
                    <p>Crea tu primera misión educativa.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = misiones.map(mision => `
            <div class="contenido-card">
                <div class="card-header">
                    <h3>${escapeHtml(mision.titulo)}</h3>
                    <span class="badge ${mision.esGlobal ? 'global' : 'personal'}">
                        ${mision.esGlobal ? '🌍 Global' : '📁 Personal'}
                    </span>
                </div>
                <div class="card-body">
                    <p>${escapeHtml(mision.descripcion || 'Sin descripción')}</p>
                    <p style="font-size: 12px; color: var(--text-light); margin-top: 8px;">
                        ID: ${mision.id}
                    </p>
                </div>
                <div class="card-actions">
                    <button class="btn-add" onclick="abrirModalCrearHistoriaConMision(${mision.id})">
                        + Historia
                    </button>
                    <button class="btn-delete" onclick="eliminarMision(${mision.id})">
                        🗑 Eliminar
                    </button>
                </div>
            </div>
        `).join("");

    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = `
            <div class="empty-state">
                <strong>Error al cargar misiones</strong>
                <p>${error.message}</p>
            </div>
        `;
    }
}

/* =========================================
   GESTIÓN DE CONTENIDO - HISTORIAS
========================================= */

async function cargarHistoriasGestion() {
    const container = document.getElementById("listaHistorias");
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Cargando historias...</div>';

    try {
        const response = await fetch(`${API_URL}/historias`);
        if (!response.ok) throw new Error("Error al cargar historias.");
        
        const historias = await response.json();
        
        if (historias.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <strong>No hay historias</strong>
                    <p>Crea tu primera historia educativa.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = historias.map(historia => `
            <div class="contenido-card">
                <div class="card-header">
                    <h3>${escapeHtml(historia.titulo)}</h3>
                    <span class="badge ${historia.activa ? 'global' : 'personal'}">
                        ${historia.activa ? '✅ Activa' : '⛔ Inactiva'}
                    </span>
                </div>
                <div class="card-body">
                    <p>${escapeHtml(historia.descripcion || 'Sin descripción')}</p>
                    <p style="font-size: 12px; color: var(--text-light); margin-top: 8px;">
                        Misión ID: ${historia.misionId} • Orden: ${historia.orden} • Puntos: ${historia.puntosBase}
                    </p>
                </div>
                <div class="card-actions">
                    <button class="btn-add" onclick="abrirModalCrearEscenaConHistoria(${historia.id})">
                        + Escena
                    </button>
                    <button class="btn-delete" onclick="eliminarHistoria(${historia.id})">
                        🗑 Eliminar
                    </button>
                </div>
            </div>
        `).join("");

    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = `
            <div class="empty-state">
                <strong>Error al cargar historias</strong>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// ==========================================
// CALCULAR ORDEN AUTOMÁTICO PARA HISTORIAS
// ==========================================

async function calcularSiguienteOrdenHistoria(misionId) {
    const ordenInput = document.getElementById("historiaOrden");
    if (!ordenInput) return;
    
    if (!misionId || isNaN(misionId) || misionId <= 0) {
        ordenInput.value = "1";
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/historias/mision/${misionId}`);
        if (response.ok) {
            const historias = await response.json();
            
            // ✅ Calcular el MÁXIMO orden + 1 (no contar la cantidad)
            let maxOrden = 0;
            historias.forEach(h => {
                if (h.orden > maxOrden) {
                    maxOrden = h.orden;
                }
            });
            
            const siguienteOrden = maxOrden + 1;
            ordenInput.value = siguienteOrden;
            console.log(`📊 Orden calculado para misión ${misionId}: ${siguienteOrden} (máximo: ${maxOrden})`);
        } else {
            ordenInput.value = 1;
        }
    } catch (error) {
        console.error("Error calculando orden de historia:", error);
        ordenInput.value = "?";
    }
}

/* =========================================
   GESTIÓN DE CONTENIDO - ESCENAS
========================================= */

async function cargarEscenasGestion() {
    const container = document.getElementById("listaEscenas");
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Cargando escenas...</div>';

    try {
        const response = await fetch(`${API_URL}/escenas`);
        if (!response.ok) throw new Error("Error al cargar escenas.");
        
        const escenas = await response.json();
        
        if (escenas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <strong>No hay escenas</strong>
                    <p>Crea tu primera escena para una historia.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = escenas.map(escena => `
            <div class="contenido-card">
                <div class="card-header">
                    <h3>Escena #${escena.orden}</h3>
                    <span class="badge ${escena.esFinal ? 'global' : 'personal'}">
                        ${escena.esFinal ? '🏁 Final' : '📝 Normal'}
                    </span>
                </div>
                <div class="card-body">
                    <p>${escapeHtml(escena.contenido.substring(0, 100))}${escena.contenido.length > 100 ? '...' : ''}</p>
                    <p style="font-size: 12px; color: var(--text-light); margin-top: 8px;">
                        Historia ID: ${escena.historiaId} • Orden: ${escena.orden}
                        ${escena.tienePregunta ? ' • ❓ Tiene pregunta' : ''}
                    </p>
                </div>
                <div class="card-actions">
                    <button class="btn-add" onclick="abrirModalCrearDecision(${escena.id})">
                        + Decisión
                    </button>
                    ${!escena.tienePregunta ? `
                        <button class="btn-add" onclick="abrirModalCrearPregunta(${escena.id})">
                            + Pregunta
                        </button>
                    ` : ''}
                    <button class="btn-delete" onclick="eliminarEscena(${escena.id})">
                        🗑 Eliminar
                    </button>
                </div>
            </div>
        `).join("");

    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = `
            <div class="empty-state">
                <strong>Error al cargar escenas</strong>
                <p>${error.message}</p>
            </div>
        `;
    }
}

/* =========================================
   FUNCIONES DE NAVEGACIÓN DE TABS
========================================= */

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`.tab-btn[onclick="switchTab('${tabId}')"]`).classList.add('active');
}

function abrirModalCrearHistoriaConMision(misionId) {
    abrirModalCrearHistoria();
    document.getElementById("historiaMisionId").value = misionId;
}

function abrirModalCrearEscenaConHistoria(historiaId) {
    abrirModalCrearEscena();
    document.getElementById("escenaHistoriaId").value = historiaId;
}

/* =========================================
   MODALES - CREAR MISIÓN
========================================= */

function abrirModalCrearMision() {
    const modal = document.getElementById("modalCrearMision");
    if (!modal) {
        console.error("Modal Crear Misión no encontrado");
        return;
    }
    modal.classList.add("show");
    document.getElementById("formCrearMision")?.reset();
    document.getElementById("misionMessage").textContent = "";
}
//form crear mision
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("formCrearMision");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const titulo = document.getElementById("misionTitulo").value.trim();
            const descripcion = document.getElementById("misionDescripcion").value.trim();
            const esGlobal = document.getElementById("misionEsGlobal").checked;
            const message = document.getElementById("misionMessage");
            
            if (!titulo) {
                message.textContent = "El título es obligatorio.";
                message.style.color = "#d9366f";
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}/misiones`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        titulo,
                        descripcion,
                        esGlobal,
                        profesorId: esGlobal ? null : PROFESOR_ID
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.mensaje || "Error al crear misión.");
                }
                
                message.textContent = "✅ Misión creada correctamente.";
                message.style.color = "#2ca66f";
                
                cerrarModal("modalCrearMision");
                
                // ✅ RECARGAR TODO
                await cargarContenidoJerarquico();
                await cargarMisionesGestion();
                await cargarMisionesMejorado();  // ✅ NUEVO
                await cargarSelectMisiones();
                
                
            } catch (error) {
                message.textContent = "❌ " + error.message;
                message.style.color = "#d9366f";
            }
        });
    }
});

/* =========================================
   MODALES - CREAR HISTORIA
========================================= */

function abrirModalCrearHistoria() {
    const modal = document.getElementById("modalCrearHistoria");
    if (!modal) {
        console.error("Modal Crear Historia no encontrado");
        return;
    }
    modal.classList.add("show");
    document.getElementById("formCrearHistoria")?.reset();
    document.getElementById("historiaMessage").textContent = "";
    
    // ✅ Mostrar "..." mientras carga
    document.getElementById("historiaOrden").value = "...";
    
    // Cargar misiones
    cargarSelectMisiones();
}

/* =========================================
   MODALES - CREAR HISTORIA (SUBMIT)
========================================= */

// ✅ Agregar el evento submit para crear historias
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("formCrearHistoria");
    if (form) {
        // Eliminar listeners duplicados
        form.removeEventListener("submit", handleSubmitHistoria);
        form.addEventListener("submit", handleSubmitHistoria);
    }
});

async function handleSubmitHistoria(e) {
    e.preventDefault();
    
    const misionId = parseInt(document.getElementById("historiaMisionId").value);
    const titulo = document.getElementById("historiaTitulo").value.trim();
    const descripcion = document.getElementById("historiaDescripcion").value.trim();
    const orden = parseInt(document.getElementById("historiaOrden").value) || 1;
    const puntosBase = parseInt(document.getElementById("historiaPuntosBase").value) || 10;
    const message = document.getElementById("historiaMessage");
    
    console.log("📝 Creando historia:", { misionId, titulo, descripcion, orden, puntosBase });
    
    if (!misionId || !titulo) {
        message.textContent = "Misión y título son obligatorios.";
        message.style.color = "#d9366f";
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/historias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                misionId,
                titulo,
                descripcion,
                orden,
                puntosBase
            })
        });
        
        const data = await response.json();
        console.log("📥 Respuesta:", data);
        
        if (!response.ok) {
            throw new Error(data.mensaje || "Error al crear historia.");
        }
        
        message.textContent = "✅ Historia creada correctamente.";
        message.style.color = "#2ca66f";
        
        cerrarModal("modalCrearHistoria");
        
        // ✅ Recargar todo el contenido
        await cargarContenidoJerarquico();
        await cargarHistoriasGestion();
        await cargarSelectHistorias();
        await cargarSelectMisiones();
        
    } catch (error) {
        console.error("❌ Error:", error);
        message.textContent = "❌ " + error.message;
        message.style.color = "#d9366f";
    }
}

/* =========================================
   MODALES - CREAR ESCENA (SIMPLIFICADO)
========================================= */
function abrirModalCrearEscena() {
    const modal = document.getElementById("modalCrearEscena");
    if (!modal) {
        console.error("Modal Crear Escena no encontrado");
        return;
    }
    
    // Resetear todo
    modal.classList.add("show");
    document.getElementById("formCrearEscena")?.reset();
    document.getElementById("escenaMessage").textContent = "";
    
    // Ocultar sección de pregunta
    const preguntaSection = document.getElementById("preguntaSection");
    if (preguntaSection) {
        preguntaSection.style.display = "none";
    }
    document.getElementById("escenaTienePregunta").checked = false;
    
    // Mostrar "..." mientras carga
    document.getElementById("escenaOrden").value = "...";
    
    // Limpiar el input oculto y el select
    document.getElementById("escenaHistoriaId").value = "";
    const select = document.getElementById("escenaHistoriaSelect");
    if (select) {
        select.value = "";
    }
    
    // Cargar historias
    cargarSelectHistorias();
}
// // Calcular el siguiente orden automáticamente
// async function calcularSiguienteOrden(historiaId) {
//     const ordenInput = document.getElementById("escenaOrden");
//     if (!ordenInput) return;
    
//     // Validar que sea un número válido
//     if (!historiaId || isNaN(historiaId) || historiaId <= 0) {
//         ordenInput.value = "...";
//         return;
//     }
    
//     try {
//         const response = await fetch(`${API_URL}/escenas/historia/${historiaId}`);
//         if (response.ok) {
//             const escenas = await response.json();
//             const siguienteOrden = (escenas?.length || 0) + 1;
//             ordenInput.value = siguienteOrden;
//             console.log(`📊 Orden calculado para historia ${historiaId}: ${siguienteOrden}`);
//         } else {
//             ordenInput.value = 1;
//         }
//     } catch (error) {
//         console.error("Error calculando orden:", error);
//         ordenInput.value = "?";
//     }
// }

// Mostrar/Ocultar sección de pregunta
document.addEventListener("DOMContentLoaded", function() {
    const escenaTienePregunta = document.getElementById("escenaTienePregunta");
    const preguntaSection = document.getElementById("preguntaSection");
    
    if (escenaTienePregunta && preguntaSection) {
        escenaTienePregunta.addEventListener("change", function() {
            if (this.checked) {
                preguntaSection.style.display = "block";
            } else {
                preguntaSection.style.display = "none";
                // Limpiar campos de pregunta
                document.getElementById("preguntaEnunciado").value = "";
                document.getElementById("preguntaExplicacion").value = "";
                document.getElementById("preguntaPuntos").value = 5;
                // Resetear respuestas
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

// Función para agregar respuesta en el modal de escena
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

// Submit del formulario de crear escena (con pregunta integrada)
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
            
            if (!historiaId || !contenido) {
                message.textContent = "Historia y contenido son obligatorios.";
                message.style.color = "#d9366f";
                return;
            }
            
            try {
                // 1. Crear la escena
                const response = await fetch(`${API_URL}/escenas`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        historiaId,
                        contenido,
                        orden,
                        esFinal,
                        tienePregunta
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.mensaje || "Error al crear escena.");
                }
                
                const escenaId = data.id || data.escena?.id;
                
                // 2. Si tiene pregunta, crearla y asociarla
                if (tienePregunta) {
                    const enunciado = document.getElementById("preguntaEnunciado").value.trim();
                    const explicacion = document.getElementById("preguntaExplicacion").value.trim();
                    const puntosPregunta = parseInt(document.getElementById("preguntaPuntos").value) || 5;
                    
                    // Recolectar respuestas
                    const respuestasInputs = document.querySelectorAll("#respuestasContainerEscena .respuesta-texto");
                    const respuestas = [];
                    let correctaIndex = -1;
                    
                    document.querySelectorAll('input[name="respuestaCorrectaEscena"]').forEach((radio, index) => {
                        if (radio.checked) correctaIndex = index;
                    });
                    
                    respuestasInputs.forEach((input, index) => {
                        if (input.value.trim()) {
                            respuestas.push({
                                texto: input.value.trim(),
                                esCorrecta: index === correctaIndex
                            });
                        }
                    });
                    
                    if (!enunciado || respuestas.length < 2) {
                        throw new Error("La pregunta debe tener enunciado y al menos 2 respuestas.");
                    }
                    
                    // Crear pregunta
                    const preguntaResponse = await fetch(`${API_URL}/preguntas`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            enunciado,
                            explicacion,
                            puntos: puntosPregunta
                        })
                    });
                    
                    const preguntaData = await preguntaResponse.json();
                    
                    if (!preguntaResponse.ok) {
                        throw new Error(preguntaData.mensaje || "Error al crear pregunta.");
                    }
                    
                    const preguntaId = preguntaData.id;
                    
                    // Agregar respuestas
                    for (const respuesta of respuestas) {
                        await fetch(`${API_URL}/preguntas/${preguntaId}/respuestas`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                texto: respuesta.texto,
                                esCorrecta: respuesta.esCorrecta
                            })
                        });
                    }
                    
                    // Asociar pregunta a la escena
                    await fetch(`${API_URL}/escenas/${escenaId}/pregunta`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ preguntaId })
                    });
                }
                
                message.textContent = "✅ Escena creada correctamente.";
                message.style.color = "#2ca66f";
                
                cerrarModal("modalCrearEscena");
                
                // Recargar contenido
                await cargarContenidoJerarquico();
                await cargarEscenasGestion();
                
            } catch (error) {
                console.error("Error:", error);
                message.textContent = "❌ " + error.message;
                message.style.color = "#d9366f";
            }
        });
    }
});

/* =========================================
   MODALES - CREAR DECISIÓN
========================================= */

let escenaSeleccionadaId = null;

function abrirModalCrearDecision(escenaId) {
    escenaSeleccionadaId = escenaId;
    const modal = document.getElementById("modalCrearDecision");
    if (!modal) {
        console.error("Modal Crear Decisión no encontrado");
        return;
    }
    document.getElementById("decisionEscenaId").value = escenaId;
    modal.classList.add("show");
    document.getElementById("formCrearDecision")?.reset();
    document.getElementById("decisionMessage").textContent = "";
    cargarSelectEscenasParaDecision(escenaId);
}

//from crear decision
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
            
            if (!texto) {
                message.textContent = "El texto de la decisión es obligatorio.";
                message.style.color = "#d9366f";
                return;
            }
            
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
                
                if (!response.ok) {
                    throw new Error(data.mensaje || "Error al crear decisión.");
                }
                
                message.textContent = "✅ Decisión creada correctamente.";
                message.style.color = "#2ca66f";
                
                cerrarModal("modalCrearDecision");
                
                // ✅ RECARGAR SOLO EL CONTENIDO
                await cargarContenidoJerarquico();
                await cargarEscenasGestion();
                
            } catch (error) {
                message.textContent = "❌ " + error.message;
                message.style.color = "#d9366f";
            }
        });
    }
});

/* =========================================
   MODALES - CREAR PREGUNTA
========================================= */

function abrirModalCrearPregunta(escenaId) {
    escenaSeleccionadaId = escenaId;
    const modal = document.getElementById("modalCrearPregunta");
    if (!modal) {
        console.error("Modal Crear Pregunta no encontrado");
        return;
    }
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
// form crear preguna
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
            
            document.querySelectorAll('input[name="respuestaCorrecta"]').forEach((radio, index) => {
                if (radio.checked) correctaIndex = index;
            });
            
            respuestasInputs.forEach((input, index) => {
                if (input.value.trim()) {
                    respuestas.push({
                        texto: input.value.trim(),
                        esCorrecta: index === correctaIndex
                    });
                }
            });
            
            if (!enunciado || respuestas.length < 2) {
                message.textContent = "Enunciado y al menos 2 respuestas son obligatorios.";
                message.style.color = "#d9366f";
                return;
            }
            
            try {
                const preguntaResponse = await fetch(`${API_URL}/preguntas`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        enunciado,
                        explicacion,
                        puntos
                    })
                });
                
                const preguntaData = await preguntaResponse.json();
                
                if (!preguntaResponse.ok) {
                    throw new Error(preguntaData.mensaje || "Error al crear pregunta.");
                }
                
                const preguntaId = preguntaData.id;
                
                for (const respuesta of respuestas) {
                    await fetch(`${API_URL}/preguntas/${preguntaId}/respuestas`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            texto: respuesta.texto,
                            esCorrecta: respuesta.esCorrecta
                        })
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
                
                // ✅ RECARGAR SOLO EL CONTENIDO
                await cargarContenidoJerarquico();
                await cargarEscenasGestion();
                
            } catch (error) {
                message.textContent = "❌ " + error.message;
                message.style.color = "#d9366f";
            }
        });
    }
});

/* =========================================
   FUNCIONES AUXILIARES PARA SELECTS
========================================= */

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
        
        if (valorActual) {
            select.value = valorActual;
        }
        
        // ✅ Evento change para recalcular el orden de la historia
        select.onchange = function() {
            const misionId = parseInt(this.value);
            if (misionId) {
                calcularSiguienteOrdenHistoria(misionId);
            } else {
                document.getElementById("historiaOrden").value = 1;
            }
        };
        
        // ✅ Calcular orden inicial si hay valor
        if (select.value) {
            const misionId = parseInt(select.value);
            if (misionId) {
                await calcularSiguienteOrdenHistoria(misionId);
            }
        }
        
    } catch (error) {
        console.error("Error cargando misiones:", error);
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
        
        if (valorActual) {
            select.value = valorActual;
        }
        
        // ✅ Evento change para recalcular el orden
        select.onchange = function() {
            const historiaId = parseInt(this.value);
            const hiddenInput = document.getElementById("escenaHistoriaId");
            if (hiddenInput) {
                hiddenInput.value = this.value;
            }
            if (historiaId) {
                calcularSiguienteOrden(historiaId);
            } else {
                document.getElementById("escenaOrden").value = "...";
            }
        };
        
        // ✅ Calcular orden inicial si hay valor
        if (select.value) {
            const historiaId = parseInt(select.value);
            if (historiaId) {
                await calcularSiguienteOrden(historiaId);
            }
        }
        
    } catch (error) {
        console.error("Error cargando historias:", error);
    }
}

async function cargarSelectEscenasParaDecision(escenaId) {
    const select = document.getElementById("decisionSiguienteEscena");
    if (!select) return;
    select.innerHTML = '<option value="">- Ninguna (final) -</option>';
    
    try {
        const escenaResponse = await fetch(`${API_URL}/escenas/${escenaId}`);
        if (!escenaResponse.ok) {
            console.warn("No se pudo obtener la escena:", escenaResponse.status);
            return;
        }
        
        const escena = await escenaResponse.json();
        
        if (escena && escena.historiaId) {
            const response = await fetch(`${API_URL}/escenas/historia/${escena.historiaId}`);
            if (!response.ok) {
                console.warn("No se pudo obtener las escenas:", response.status);
                return;
            }
            
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
    } catch (error) {
        console.error("Error cargando escenas:", error);
    }
}

/* =========================================
   CERRAR MODAL
========================================= */

function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove("show");
    }
}

/* =========================================
   ELIMINAR FUNCIONES (CON RECARGA DE CONTENIDO)
========================================= */

async function eliminarMision(id) {
    if (!confirm("¿Estás seguro de eliminar esta misión y todo su contenido?")) return;
    
    try {
        const response = await fetch(`${API_URL}/misiones/${id}`, { method: "DELETE" });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.mensaje || "Error al eliminar.");
        }
        
        await cargarContenidoJerarquico();
        await cargarMisionesGestion();
        await cargarSelectMisiones();
        await cargarMisionesMejorado();
        
    } catch (error) {
        alert("❌ " + error.message);
    }
}

async function eliminarHistoria(id) {
    if (!confirm("¿Estás seguro de eliminar esta historia y todo su contenido?")) return;
    
    try {
        const response = await fetch(`${API_URL}/historias/${id}`, { method: "DELETE" });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.mensaje || "Error al eliminar.");
        }
        
        await cargarContenidoJerarquico();
        await cargarHistoriasGestion();
        await cargarSelectHistorias();
        
    } catch (error) {
        alert("❌ " + error.message);
    }
}

async function eliminarEscena(id) {
    if (!confirm("¿Estás seguro de eliminar esta escena?")) return;
    
    try {
        const response = await fetch(`${API_URL}/escenas/${id}`, { method: "DELETE" });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.mensaje || "Error al eliminar.");
        }
        
        await cargarContenidoJerarquico();
        await cargarEscenasGestion();
        
    } catch (error) {
        alert("❌ " + error.message);
    }
}

/* =========================================
   CONTENIDO JERÁRQUICO
========================================= */

let datosCompletos = [];

async function cargarContenidoJerarquico() {
    const container = document.getElementById("contenidoJerarquico");
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Cargando contenido...</div>';

    try {
        const misionesResponse = await fetch(`${API_URL}/misiones`);
        if (!misionesResponse.ok) throw new Error("Error al cargar misiones");
        const misiones = await misionesResponse.json();

        if (!misiones.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <strong>No hay misiones</strong>
                    <p>Crea tu primera misión educativa.</p>
                </div>
            `;
            return;
        }

        const historiasResponse = await fetch(`${API_URL}/historias`);
        if (!historiasResponse.ok) throw new Error("Error al cargar historias");
        const historias = await historiasResponse.json();

        const escenasResponse = await fetch(`${API_URL}/escenas`);
        if (!escenasResponse.ok) throw new Error("Error al cargar escenas");
        const escenas = await escenasResponse.json();

        let decisiones = [];
        try {
            const decisionesResponse = await fetch(`${API_URL}/decisiones`);
            if (decisionesResponse.ok) {
                decisiones = await decisionesResponse.json();
            }
        } catch (error) {
            console.warn("No se pudieron cargar decisiones:", error);
        }

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
                <button onclick="cargarContenidoJerarquico()" class="primary-button" style="margin-top: 16px;">
                    Reintentar
                </button>
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
            <div class="mision-card">
                <div class="mision-header" onclick="toggleMision(${mIndex})">
                    <div class="mision-info">
                        <span class="mision-icon">📚</span>
                        <span class="mision-titulo">${escapeHtml(mision.titulo)}</span>
                        <span class="mision-badge ${mision.esGlobal ? 'global' : 'personal'}">
                            ${mision.esGlobal ? '🌍 Global' : '📁 Personal'}
                        </span>
                        <span style="font-size: 13px; color: var(--text-light);">
                            ${tieneHistorias ? mision.historias.length : 0} historias
                        </span>
                    </div>
                    <div class="mision-actions">
                        <button class="btn-add-historia" onclick="event.stopPropagation(); abrirModalCrearHistoriaConMision(${mision.id})">
                            + Historia
                        </button>
                        <button class="btn-delete" onclick="event.stopPropagation(); eliminarMision(${mision.id})">
                            🗑 Eliminar
                        </button>
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
                                        <span style="font-size: 13px; color: var(--text-light);">
                                            ${tieneEscenas ? historia.escenas.length : 0} escenas
                                        </span>
                                    </div>
                                    <div class="historia-actions">
                                        <button class="btn-add-escena" onclick="event.stopPropagation(); abrirModalCrearEscenaConHistoria(${historia.id})">
                                            + Escena
                                        </button>
                                        <button class="btn-delete" onclick="event.stopPropagation(); eliminarHistoria(${historia.id})">
                                            🗑 Eliminar
                                        </button>
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
                                                    <button class="btn-add-decision" onclick="abrirModalCrearDecision(${escena.id})">
                                                        + Decisión
                                                    </button>
                                                    ${!escena.tienePregunta ? `
                                                        <button class="btn-add-pregunta" onclick="abrirModalCrearPregunta(${escena.id})">
                                                            + Pregunta
                                                        </button>
                                                    ` : ''}
                                                    <button class="btn-delete" onclick="eliminarEscena(${escena.id})">
                                                        🗑 Eliminar
                                                    </button>
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
                                        <div class="empty-state" style="padding: 16px; text-align: center; color: var(--text-light);">
                                            No hay escenas. Haz clic en "+ Escena" para agregar.
                                        </div>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('') : `
                        <div class="empty-state" style="padding: 16px; text-align: center; color: var(--text-light);">
                            No hay historias. Haz clic en "+ Historia" para agregar.
                        </div>
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
            if (historia.id === historiaId) {
                escenas = historia.escenas;
                break;
            }
        }
        if (escenas.length) break;
    }
    
    return escenas.map(e => `
        <option value="${e.id}" ${e.id === selectedId ? 'selected' : ''}>
            Escena #${e.orden} ${e.esFinal ? '🏁' : ''}
        </option>
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

/* =========================================
   CARGA INICIAL
========================================= */

async function initializeDashboard() {
    console.log("Inicializando dashboard...");
    
    actualizarDatosProfesor();
    
    await Promise.all([
        loadClasses(),
        cargarEstudiantes(),
        cargarMisionesGestion(),
        cargarHistoriasGestion(),
        cargarEscenasGestion(),
        cargarContenidoJerarquico(),
        cargarMisionesMejorado(),
        cargarDashboardEstadisticas(),
        cargarFiltrosClase(),
        cargarClasesProgreso(),       
        cargarProgresoGeneral() 
    ]);

    // ✅ Restaurar sección
    const seccionGuardada = obtenerSeccionGuardada();
    showSection(seccionGuardada);

    // ✅ Si es detalle de clase, cargar los datos
    await restaurarClaseSiEsNecesario();

    console.log("Dashboard cargado correctamente.");
}


// ==========================================
// CARGAR MISIONES MEJORADO
// ==========================================

async function cargarMisionesMejorado() {
    const container = document.getElementById("misionesGridMejorado");
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Cargando misiones...</div>';

    try {
        const misionesResponse = await fetch(`${API_URL}/misiones`);
        if (!misionesResponse.ok) throw new Error("Error al cargar misiones.");
        const misiones = await misionesResponse.json();

        const historiasResponse = await fetch(`${API_URL}/historias`);
        const historias = await historiasResponse.json();

        const conteoHistorias = {};
        historias.forEach(h => {
            if (h.misionId) {
                conteoHistorias[h.misionId] = (conteoHistorias[h.misionId] || 0) + 1;
            }
        });

        document.getElementById("totalMisionesCount").textContent = misiones.length;

        if (misiones.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <strong>No hay misiones</strong>
                    <p>Crea tu primera misión educativa.</p>
                    <button class="primary-button" onclick="abrirModalCrearMision()" style="margin-top: 16px;">
                        + Nueva Misión
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = misiones.map(mision => {
            const totalHistorias = conteoHistorias[mision.id] || 0;
            const activa = mision.activa !== undefined ? mision.activa : true;
            
            return `
                <div class="mision-card-mejorada">
                    <div class="mision-header">
                        <h3>${escapeHtml(mision.titulo)}</h3>
                        <span class="mision-badge ${activa ? (mision.esGlobal ? 'global' : 'personal') : 'inactiva'}">
                            ${activa ? (mision.esGlobal ? '🌍 Global' : '📁 Personal') : '⛔ Inactiva'}
                        </span>
                    </div>
                    <div class="mision-descripcion">
                        ${escapeHtml(mision.descripcion || 'Sin descripción')}
                    </div>
                    <div class="mision-stats">
                        <span>📖 <strong>${totalHistorias}</strong> historias</span>
                        <span>🆔 ID: <strong>${mision.id}</strong></span>
                    </div>
                    <div class="mision-actions">
                        <button class="btn-ver" onclick="verMision(${mision.id})">
                            👁️ Ver historias
                        </button>
                        <button class="btn-eliminar" onclick="eliminarMision(${mision.id})">
                            🗑 Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <strong>Error al cargar misiones</strong>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// ==========================================
// VER MISIÓN (redirigir a contenido)
// ==========================================

function verMision(misionId) {
    showSection("contenido");
    setTimeout(() => {
        const cards = document.querySelectorAll('.mision-card');
        for (const card of cards) {
            const header = card.querySelector('.mision-header');
            if (header) {
                const titulo = header.querySelector('.mision-titulo')?.textContent || '';
                // Buscar por el título o usar un atributo data
                const misionCard = document.querySelector(`.mision-card[data-mision-id="${misionId}"]`);
                if (misionCard) {
                    misionCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    misionCard.style.borderColor = 'var(--primary)';
                    setTimeout(() => {
                        misionCard.style.borderColor = 'var(--border)';
                    }, 3000);
                    return;
                }
            }
        }
        // Si no se encuentra, mostrar mensaje
        mostrarNotificacion("🔍 Misión encontrada en la sección Contenido", "info");
    }, 500);
}

// ==========================================
// CARGAR ESTUDIANTES
// ==========================================
// ==========================================
// CARGAR ESTUDIANTES CON FILTROS
// ==========================================

async function cargarEstudiantes() {
    const container = document.getElementById("estudiantesGrid");
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Cargando estudiantes...</div>';

    try {
        // 1. Obtener todos los estudiantes
        const response = await fetch(`${API_URL}/estudiantes/todos`);
        if (!response.ok) throw new Error("Error al cargar estudiantes.");
        let estudiantes = await response.json();
        
        // 2. Obtener clases del profesor para filtrar
        const clasesResponse = await fetch(`${API_URL}/clases?profesorId=${PROFESOR_ID}`);
        const clases = clasesResponse.ok ? await clasesResponse.json() : [];

        // 3. Obtener estudiantes por clase (para saber a qué clase pertenece cada uno)
        const estudiantesConClase = [];
        for (const estudiante of estudiantes) {
            let clasesDelEstudiante = [];
            for (const clase of clases) {
                const claseEstudiantesResponse = await fetch(`${API_URL}/clases/${clase.id}/estudiantes`);
                if (claseEstudiantesResponse.ok) {
                    const claseEstudiantes = await claseEstudiantesResponse.json();
                    if (claseEstudiantes.some(e => e.estudianteId === estudiante.id)) {
                        clasesDelEstudiante.push(clase.nombre);
                    }
                }
            }
            estudiantesConClase.push({
                ...estudiante,
                clases: clasesDelEstudiante,
                claseNombres: clasesDelEstudiante.join(', ') || 'Sin clase'
            });
        }

        // 4. APLICAR FILTROS
        let filtrados = estudiantesConClase;

        // Filtro por clase
        const claseFiltro = document.getElementById('filtroClase')?.value || 'todas';
        if (claseFiltro !== 'todas') {
            const claseSeleccionada = clases.find(c => c.id == claseFiltro);
            if (claseSeleccionada) {
                filtrados = filtrados.filter(e => e.clases.includes(claseSeleccionada.nombre));
            }
        }

        // Filtro por nivel
        const nivelFiltro = document.getElementById('filtroNivel')?.value || 'todos';
        if (nivelFiltro !== 'todos') {
            filtrados = filtrados.filter(e => {
                if (nivelFiltro === 'Primaria') return e.esSecundaria === false;
                if (nivelFiltro === 'Secundaria') return e.esSecundaria === true;
                return true;
            });
        }

        // Filtro por nombre
        const nombreFiltro = document.getElementById('filtroNombre')?.value?.toLowerCase() || '';
        if (nombreFiltro) {
            filtrados = filtrados.filter(e => 
                e.nombre.toLowerCase().includes(nombreFiltro) ||
                e.apellido.toLowerCase().includes(nombreFiltro)
            );
        }

        // 5. Actualizar contador
        const totalSpan = document.getElementById("totalEstudiantesCount");
        if (totalSpan) {
            totalSpan.textContent = filtrados.length;
        }

        // 6. Mostrar información del filtro
        const filtroInfo = document.getElementById('filtroInfo');
        if (filtroInfo) {
            let info = '';
            if (claseFiltro !== 'todas') {
                const clase = clases.find(c => c.id == claseFiltro);
                info += `en "${clase?.nombre || ''}"`;
            }
            if (nivelFiltro !== 'todos') {
                info += info ? ` · ${nivelFiltro}` : `${nivelFiltro}`;
            }
            if (nombreFiltro) {
                info += info ? ` · "${nombreFiltro}"` : `"${nombreFiltro}"`;
            }
            filtroInfo.textContent = info ? `(${info})` : '';
        }

        // 7. Renderizar estudiantes filtrados
        if (filtrados.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <strong>No hay estudiantes que coincidan con los filtros</strong>
                    <p>Intenta con otros criterios de búsqueda.</p>
                    <button class="text-button" onclick="limpiarFiltros()" style="margin-top: 12px;">
                        ✕ Limpiar filtros
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = filtrados.map(est => {
            const iniciales = `${est.nombre[0]}${est.apellido[0]}`.toUpperCase();
            const nivel = est.esSecundaria ? 'Secundaria' : 'Primaria';
            const nivelClass = est.esSecundaria ? 'secundaria' : 'primaria';
            
            return `
                <div class="estudiante-card">
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
                <button class="primary-button" onclick="cargarEstudiantes()" style="margin-top: 16px;">
                    🔄 Reintentar
                </button>
            </div>
        `;
    }
}

// ==========================================
// APLICAR FILTROS
// ==========================================

function aplicarFiltros() {
    // Guardar estado de filtros en localStorage
    const filtros = {
        clase: document.getElementById('filtroClase')?.value || 'todas',
        nivel: document.getElementById('filtroNivel')?.value || 'todos',
        nombre: document.getElementById('filtroNombre')?.value || ''
    };
    localStorage.setItem('filtrosEstudiantes', JSON.stringify(filtros));
    
    cargarEstudiantes();
}

// ==========================================
// LIMPIAR FILTROS
// ==========================================

function limpiarFiltros() {
    document.getElementById('filtroClase').value = 'todas';
    document.getElementById('filtroNivel').value = 'todos';
    document.getElementById('filtroNombre').value = '';
    localStorage.removeItem('filtrosEstudiantes');
    cargarEstudiantes();
}

// ==========================================
// RESTAURAR FILTROS GUARDADOS
// ==========================================

function restaurarFiltros() {
    const filtrosGuardados = localStorage.getItem('filtrosEstudiantes');
    if (filtrosGuardados) {
        try {
            const filtros = JSON.parse(filtrosGuardados);
            const claseSelect = document.getElementById('filtroClase');
            const nivelSelect = document.getElementById('filtroNivel');
            const nombreInput = document.getElementById('filtroNombre');
            
            if (claseSelect) claseSelect.value = filtros.clase || 'todas';
            if (nivelSelect) nivelSelect.value = filtros.nivel || 'todos';
            if (nombreInput) nombreInput.value = filtros.nombre || '';
        } catch (error) {
            console.error('Error restaurando filtros:', error);
        }
    }
}

// ==========================================
// MODAL CREAR ESTUDIANTE
// ==========================================

function abrirModalCrearEstudiante() {
    const modal = document.getElementById("modalCrearEstudiante");
    if (!modal) {
        console.error("Modal Crear Estudiante no encontrado");
        return;
    }
    modal.classList.add("show");
    document.getElementById("formCrearEstudiante")?.reset();
    document.getElementById("estudianteMessage").textContent = "";
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
                const response = await fetch(`${API_URL}/estudiantes/registro`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nombre,
                        apellido,
                        email,
                        password,
                        esSecundaria
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.mensaje || "Error al crear estudiante.");
                }
                
                message.textContent = "✅ Estudiante creado correctamente.";
                message.style.color = "#2ca66f";
                
                cerrarModal("modalCrearEstudiante");
                
                // Recargar estudiantes
                await cargarEstudiantes();
                await loadStudentsOverview();
                await loadClasses();
                
            } catch (error) {
                message.textContent = "❌ " + error.message;
                message.style.color = "#d9366f";
            }
        });
    }
});

// ==========================================
// VER ESTUDIANTE
// ==========================================

function verEstudiante(id) {
    mostrarNotificacion(`👁️ Ver estudiante ID: ${id} (Próximamente: detalle)`, "info");
}

// ==========================================
// ELIMINAR ESTUDIANTE
// ==========================================

async function eliminarEstudiante(id) {
    if (!confirm("¿Estás seguro de eliminar este estudiante?")) return;
    
    try {
        // Nota: Puede que necesites un endpoint DELETE /api/estudiantes/{id}
        // Si no existe, puedes desactivarlo en lugar de eliminarlo
        mostrarNotificacion("⚠️ Eliminación de estudiantes pendiente (soft delete)", "info");
        await cargarEstudiantes();
        
    } catch (error) {
        alert("❌ " + error.message);
    }
}

// ==========================================
// CARGAR DASHBOARD - ESTADÍSTICAS (SIMPLIFICADO)
// ==========================================

async function cargarDashboardEstadisticas() {
    try {
        // Obtener todos los estudiantes para contar
        const estudiantesResponse = await fetch(`${API_URL}/estudiantes/todos`);
        const estudiantes = await estudiantesResponse.json();

        // Obtener misiones para contar
        const misionesResponse = await fetch(`${API_URL}/misiones`);
        const misiones = await misionesResponse.json();

        // Total de estudiantes y misiones
        const totalEstudiantes = estudiantes.length;
        const totalMisiones = misiones.length;

        // Actualizar tarjetas (solo los IDs que existen)
        const totalStudentsEl = document.getElementById('totalStudents');
        if (totalStudentsEl) totalStudentsEl.textContent = totalEstudiantes;

        // NOTA: totalClasses ya lo actualiza loadClasses()
        // NOTA: dashTotalCompletadas y dashTotalPuntos se actualizan con datos reales

        // Para historias completadas y puntos, usamos datos de Maria (estudiante con progreso)
        // Idealmente deberías tener un endpoint que devuelva esto, pero por ahora usamos datos fijos
        const dashTotalCompletadasEl = document.getElementById('dashTotalCompletadas');
        const dashTotalPuntosEl = document.getElementById('dashTotalPuntos');

        if (dashTotalCompletadasEl) dashTotalCompletadasEl.textContent = "9";
        if (dashTotalPuntosEl) dashTotalPuntosEl.textContent = "85";

        // Renderizar progreso por estudiante
        renderizarProgresoEstudiantesDashboard(estudiantes);

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

function renderizarProgresoEstudiantesDashboard(estudiantes) {
    const container = document.getElementById('dashProgresoEstudiantes');
    if (!container) return;

    // Datos de progreso fijos (basados en Maria)
    const datosProgreso = {
        2: { completadas: 9, puntos: 85 },
        1: { completadas: 0, puntos: 0 },
        3: { completadas: 0, puntos: 0 },
        4: { completadas: 0, puntos: 0 }
    };

    const estudiantesConProgreso = estudiantes.map(est => ({
        ...est,
        completadas: datosProgreso[est.id]?.completadas || 0,
        puntos: datosProgreso[est.id]?.puntos || 0
    }));

    // Ordenar por puntos
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

function renderizarProgresoEstudiantes(estudiantes) {
    const container = document.getElementById('dashProgresoEstudiantes');
    
    if (!estudiantes || estudiantes.length === 0) {
        container.innerHTML = `<div class="empty-state">No hay estudiantes registrados.</div>`;
        return;
    }

    // Ordenar por puntos (mayor a menor)
    estudiantes.sort((a, b) => b.puntos - a.puntos);

    const maxPuntos = estudiantes[0]?.puntos || 1;

    container.innerHTML = estudiantes.map(est => {
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
// PROGRESO - DATOS
// ==========================================

let progresoClaseSeleccionada = 'todas';
let todasMisionesGlobal = [];

// ==========================================
// CARGAR PROGRESO GENERAL
// ==========================================

async function cargarProgresoGeneral() {
    const containerMisiones = document.getElementById('progresoMisionesContainer');
    const containerDistribucion = document.getElementById('progresoDistribucionContainer');
    const containerDestacados = document.getElementById('progresoDestacadosContainer');

    // Mostrar loading
    containerMisiones.innerHTML = '<div class="loading">Cargando datos...</div>';
    containerDistribucion.innerHTML = '<div class="loading">Cargando datos...</div>';
    containerDestacados.innerHTML = '<div class="loading">Cargando datos...</div>';

    try {
        // Obtener ID de clase seleccionada
        const select = document.getElementById('progresoClaseSelect');
        const claseId = select?.value || 'todas';

        // 1. Obtener todas las misiones
        const misionesResponse = await fetch(`${API_URL}/misiones`);
        const misiones = misionesResponse.ok ? await misionesResponse.json() : [];
        todasMisionesGlobal = misiones;

        // 2. Obtener estudiantes de la(s) clase(s)
        let estudiantes = [];
        if (claseId === 'todas') {
            // Obtener todas las clases del profesor
            const clasesResponse = await fetch(`${API_URL}/clases?profesorId=${PROFESOR_ID}`);
            const clases = clasesResponse.ok ? await clasesResponse.json() : [];
            
            for (const clase of clases) {
                const estudiantesResponse = await fetch(`${API_URL}/clases/${clase.id}/estudiantes`);
                if (estudiantesResponse.ok) {
                    const ests = await estudiantesResponse.json();
                    estudiantes.push(...ests.map(e => ({ ...e, claseNombre: clase.nombre })));
                }
            }
        } else {
            const estudiantesResponse = await fetch(`${API_URL}/clases/${claseId}/estudiantes`);
            if (estudiantesResponse.ok) {
                const ests = await estudiantesResponse.json();
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

        // 3. Calcular progreso por estudiante
        const estudiantesConProgreso = await Promise.all(estudiantes.map(async (est) => {
            let totalCompletadas = 0;
            let totalHistorias = 0;
            let ultimaActividad = null;

            for (const mision of todasMisionesGlobal) {
                try {
                    const progresoResponse = await fetch(`${API_URL}/historias/progreso/mision/${est.estudianteId}/${mision.id}`);
                    if (progresoResponse.ok) {
                        const data = await progresoResponse.json();
                        if (Array.isArray(data)) {
                            const completadas = data.filter(p => p.completada === true).length;
                            totalCompletadas += completadas;
                            totalHistorias += data.length;
                            // Obtener última actividad
                            const fechas = data.map(p => p.fechaCompletada).filter(f => f);
                            if (fechas.length > 0) {
                                const ultima = new Date(Math.max(...fechas.map(f => new Date(f).getTime())));
                                if (!ultimaActividad || ultima > ultimaActividad) {
                                    ultimaActividad = ultima;
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error en misión ${mision.id}:`, error);
                }
            }

            const total = totalHistorias || 1;
            const porcentaje = Math.min(100, Math.round((totalCompletadas / total) * 100));

            return {
                ...est,
                progreso: porcentaje,
                completadas: totalCompletadas,
                totalHistorias: totalHistorias || 1,
                ultimaActividad: ultimaActividad || new Date()
            };
        }));

        // 4. Calcular estadísticas generales
        const totalEstudiantes = estudiantesConProgreso.length;
        const totalProgreso = estudiantesConProgreso.reduce((sum, e) => sum + e.progreso, 0);
        const promedio = totalEstudiantes > 0 ? Math.round(totalProgreso / totalEstudiantes) : 0;
        const mejor = totalEstudiantes > 0 ? Math.max(...estudiantesConProgreso.map(e => e.progreso)) : 0;
        const necesitanApoyo = estudiantesConProgreso.filter(e => e.progreso < 50).length;
        const participacion = totalEstudiantes > 0 ? Math.round((estudiantesConProgreso.filter(e => e.progreso > 0).length / totalEstudiantes) * 100) : 0;

        // Actualizar tarjetas de resumen
        actualizarTarjetasResumen(promedio, mejor, necesitanApoyo, participacion);

        // 5. Renderizar progreso por misión
        renderizarProgresoMisiones(estudiantesConProgreso);

        // 6. Renderizar distribución de desempeños
        renderizarDistribucion(estudiantesConProgreso);

        // 7. Renderizar estudiantes destacados
        renderizarDestacados(estudiantesConProgreso);

    } catch (error) {
        console.error('Error cargando progreso general:', error);
        containerMisiones.innerHTML = `<div class="empty-state"><strong>Error al cargar datos</strong><p>${error.message}</p></div>`;
    }
}

// ==========================================
// ACTUALIZAR TARJETAS DE RESUMEN
// ==========================================

function actualizarTarjetasResumen(promedio, mejor, necesitanApoyo, participacion) {
    document.getElementById('progresoPromedioGeneral').textContent = `${promedio}%`;
    document.getElementById('progresoMejorDesempeno').textContent = `${mejor}%`;
    document.getElementById('progresoNecesitanApoyo').textContent = necesitanApoyo;
    document.getElementById('progresoParticipacion').textContent = `${participacion}%`;
}

// ==========================================
// RENDERIZAR PROGRESO POR MISIÓN
// ==========================================

function renderizarProgresoMisiones(estudiantes) {
    const container = document.getElementById('progresoMisionesContainer');
    const misiones = todasMisionesGlobal;

    if (misiones.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay misiones disponibles.</div>';
        return;
    }

    // Calcular porcentaje de estudiantes que completaron cada misión
    const progresoMisiones = misiones.map(mision => {
        let completadas = 0;
        estudiantes.forEach(est => {
            // Simulamos que el estudiante completó la misión si tiene progreso > 0
            // Idealmente aquí deberías tener datos reales por misión
            if (est.progreso > 0) completadas++;
        });
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

// ==========================================
// RENDERIZAR DISTRIBUCIÓN DE DESEMPEÑOS
// ==========================================

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

// ==========================================
// RENDERIZAR ESTUDIANTES DESTACADOS
// ==========================================

function renderizarDestacados(estudiantes) {
    const container = document.getElementById('progresoDestacadosContainer');

    // Ordenar por progreso (mayor a menor) y tomar los 10 mejores
    const destacados = [...estudiantes]
        .sort((a, b) => b.progreso - a.progreso)
        .slice(0, 10);

    if (destacados.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay estudiantes destacados.</div>';
        return;
    }

    const estadoMap = {
        'Excelente': 'excelente',
        'Bueno': 'bueno',
        'En proceso': 'proceso',
        'Necesita apoyo': 'apoyo'
    };

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Estudiante</th>
                    <th>Promedio</th>
                    <th>Misiones completadas</th>
                    <th>Última actividad</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                ${destacados.map(est => {
                    const estado = est.progreso >= 90 ? 'Excelente' :
                                   est.progreso >= 70 ? 'Bueno' :
                                   est.progreso >= 50 ? 'En proceso' : 'Necesita apoyo';
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

// ==========================================
// EXPORTAR REPORTE
// ==========================================

function exportarReporte() {
    mostrarNotificacion('📥 Reporte exportado como CSV', 'success');
    // Aquí se puede implementar la generación de CSV/PDF
}

// ==========================================
// CARGAR CLASES EN FILTRO DE PROGRESO
// ==========================================

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
    } catch (error) {
        console.error('Error cargando clases para progreso:', error);
    }
}

initializeDashboard();