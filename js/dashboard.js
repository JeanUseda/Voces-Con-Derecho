const API_URL = "http://localhost:5019/api";

// ==========================================
// OBTENER PROFESOR AUTENTICADO
// ==========================================

function obtenerProfesorAutenticado() {
    const profesorData = localStorage.getItem("profesor");
    
    if (!profesorData) {
        // Si no hay sesión, redirigir al login
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

// Obtener el profesor actual
const profesorActual = obtenerProfesorAutenticado();

// Si no hay profesor, no continuar
if (!profesorActual) {
    throw new Error("No hay sesión activa");
}

// Usar el ID del profesor autenticado
const PROFESOR_ID = profesorActual.id;

// Mostrar nombre del profesor en la UI
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


/* =========================================
   ELEMENTOS
========================================= */

const sections =
    document.querySelectorAll(".dashboard-section");

const menuItems =
    document.querySelectorAll(".menu-item[data-section]");

const createClassModal =
    document.getElementById("createClassModal");

const createClassForm =
    document.getElementById("createClassForm");


/* =========================================
   NAVEGACIÓN
========================================= */

function showSection(sectionId) {

    sections.forEach(section => {
        section.classList.remove("active-section");
    });

    const section =
        document.getElementById(sectionId);

    if (section) {
        section.classList.add("active-section");
    }

    menuItems.forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.section === sectionId
        );

    });
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

    document.getElementById(
        "createClassMessage"
    ).textContent = "";

}


document
    .getElementById("openCreateClass")
    .addEventListener(
        "click",
        openCreateClassModal
    );


document
    .getElementById("openCreateClass2")
    .addEventListener(
        "click",
        openCreateClassModal
    );


document
    .getElementById("closeCreateClass")
    .addEventListener(
        "click",
        closeCreateClassModal
    );


createClassModal.addEventListener(
    "click",
    event => {

        if (event.target === createClassModal) {

            closeCreateClassModal();

        }

    }
);


/* =========================================
   GET CLASES
========================================= */

async function loadClasses() {

    const dashboardContainer =
        document.getElementById("dashboardClasses");

    const allClassesContainer =
        document.getElementById("allClasses");

    try {

        const response = await fetch(
            `${API_URL}/clases?profesorId=${PROFESOR_ID}`
        );

        if (!response.ok) {

            throw new Error(
                "No se pudieron cargar las clases."
            );

        }

        const classes =
            await response.json();

        console.log("Clases recibidas:", classes);


        /* Total de clases */

        document.getElementById(
            "totalClasses"
        ).textContent = classes.length;


        /* Clases del inicio */

        renderClasses(
            dashboardContainer,
            classes.slice(0, 3)
        );


        /* Todas las clases */

        renderClasses(
            allClassesContainer,
            classes
        );


        /* Total de estudiantes */

        await loadTotalStudents(classes);

    } catch (error) {

        console.error(
            "Error cargando clases:",
            error
        );

        dashboardContainer.innerHTML = `
            <div class="empty-state">
                No se pudieron cargar las clases.
            </div>
        `;

        allClassesContainer.innerHTML = `
            <div class="empty-state">
                No se pudieron cargar las clases.
            </div>
        `;

    }

}


/* =========================================
   RENDER CLASES
========================================= */

function renderClasses(container, classes) {

    if (!container) {
        return;
    }


    if (!classes.length) {

        container.innerHTML = `
            <div class="empty-state">

                <strong>
                    Aún no tienes clases
                </strong>

                <p>
                    Crea tu primera clase para comenzar.
                </p>

            </div>
        `;

        return;

    }


    container.innerHTML =
        classes.map(clase => `

            <article class="class-card">

                <div class="class-top">

                    <div class="class-icon">
                        ▣
                    </div>

                    <span class="class-level">
                        Clase
                    </span>

                </div>


                <h3>
                    ${escapeHtml(clase.nombre)}
                </h3>


                <p>
                    ID de clase: ${clase.id}
                </p>


                <button
                    onclick="openClass(${clase.id})"
                >
                    Ver clase →
                </button>

            </article>

        `).join("");

}


/* =========================================
   CREAR CLASE
========================================= */

createClassForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const nombre =
            document
                .getElementById("className")
                .value
                .trim();


        const nivel =
            document
                .getElementById("classLevel")
                .value;


        const message =
            document.getElementById(
                "createClassMessage"
            );


        try {

            const response = await fetch(
                `${API_URL}/clases`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        nombre: nombre,

                        nivel: nivel,

                        profesorId:
                            PROFESOR_ID

                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data ||
                    "No se pudo crear la clase."
                );

            }


            message.textContent =
                "Clase creada correctamente.";

            message.style.color =
                "#2ca66f";


            createClassForm.reset();


            /* Actualizamos el dashboard */

            await loadClasses();


            setTimeout(() => {

                closeCreateClassModal();

            }, 800);


        } catch (error) {

            console.error(
                "Error creando clase:",
                error
            );

            message.textContent =
                "No se pudo crear la clase.";

            message.style.color =
                "#d9366f";

        }

    }
);


/* =========================================
   ABRIR CLASE
========================================= */

async function openClass(classId) {

    showSection("classDetail");


    const name =
        document.getElementById(
            "detailClassName"
        );

    const level =
        document.getElementById(
            "detailClassLevel"
        );


    name.textContent =
        "Cargando...";

    level.textContent =
        "";


    try {

        /* Obtener información de la clase */

        const response =
            await fetch(
                `${API_URL}/clases/${classId}`
            );


        if (!response.ok) {

            throw new Error(
                "Clase no encontrada."
            );

        }


        const clase =
            await response.json();


        name.textContent =
            clase.nombre;


        level.textContent =
            `Profesor ID: ${clase.profesorId}`;


        /* Cargar estudiantes */

        await loadClassStudents(classId);


        await loadInactiveStudents(classId);
        /* Cargar misiones */

        await loadClassMissions(classId);


    } catch (error) {

        console.error(
            "Error cargando clase:",
            error
        );

        name.textContent =
            "No se pudo cargar la clase.";

    }

}


/* =========================================
   ESTUDIANTES DE CLASE
========================================= */

async function loadClassStudents(classId) {

    const container =
        document.getElementById("classStudents");

    container.innerHTML = `
        <div class="loading">
            Cargando estudiantes...
        </div>
    `;

    try {

        const response = await fetch(
            `${API_URL}/clases/${classId}/estudiantes`
        );

        if (!response.ok) {
            throw new Error("Error al obtener estudiantes.");
        }

        const students = await response.json();

        if (!students.length) {

            container.innerHTML = `
                <div class="empty-state">
                    <strong>
                        No hay estudiantes activos.
                    </strong>

                    <p>
                        Los estudiantes activos de esta clase aparecerán aquí.
                    </p>
                </div>
            `;

            return;
        }

        container.innerHTML = students.map(student => {

            const initials =
                `${student.nombre[0]}${student.apellido[0]}`
                .toUpperCase();

            return `
                <div class="student-row">

                    <div class="student-main">

                        <div class="student-avatar">
                            ${initials}
                        </div>

                        <div>

                            <div class="student-name">
                                ${escapeHtml(student.nombre)}
                                ${escapeHtml(student.apellido)}
                            </div>

                            <div class="student-date">
                                Ingreso:
                                ${formatDate(student.fechaIngreso)}
                            </div>

                        </div>

                    </div>

                    <button
                        class="student-action danger"
                        onclick="desactivarEstudiante(
                            ${classId},
                            ${student.estudianteId}
                        )"
                    >
                        Desactivar
                    </button>

                </div>
            `;

        }).join("");

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="empty-state">
                No se pudieron cargar los estudiantes.
            </div>
        `;
    }
}

async function loadInactiveStudents(classId) {

    const container = document.getElementById("inactiveStudents");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="loading">
            Cargando estudiantes inactivos...
        </div>
    `;

    try {

        const response = await fetch(
            `${API_URL}/clases/${classId}/estudiantes/inactivos`
        );

        if (!response.ok) {
            throw new Error("Error al obtener estudiantes inactivos.");
        }

        const students = await response.json();

        if (!students.length) {

            container.innerHTML = `
                <div class="empty-state">
                    No hay estudiantes inactivos.
                </div>
            `;

            return;
        }

        container.innerHTML = students.map(student => {

            const initials =
                `${student.nombre[0]}${student.apellido[0]}`
                .toUpperCase();

            return `
                <div class="student-row inactive-student">

                    <div class="student-main">

                        <div class="student-avatar">
                            ${initials}
                        </div>

                        <div>

                            <div class="student-name">
                                ${escapeHtml(student.nombre)}
                                ${escapeHtml(student.apellido)}
                            </div>

                            <div class="student-date">
                                Estudiante inactivo
                            </div>

                        </div>

                    </div>

                    <button
                        class="student-action success"
                        onclick="reactivarEstudiante(
                            ${classId},
                            ${student.estudianteId}
                        )"
                    >
                        Reactivar
                    </button>

                </div>
            `;

        }).join("");

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="empty-state">
                No se pudieron cargar los estudiantes inactivos.
            </div>
        `;
    }
}

async function reactivarEstudiante(classId, estudianteId) {

    const confirmar = confirm(
        "¿Quieres reactivar a este estudiante en la clase?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/clases/${classId}/estudiantes?estudianteId=${estudianteId}`,
            {
                method: "POST"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.mensaje ||
                "No se pudo reactivar el estudiante."
            );
        }

        console.log(data.mensaje);

        // Actualizar ambas listas inmediatamente
        await Promise.all([
            loadClassStudents(classId),
            loadInactiveStudents(classId)
        ]);

        // Actualizar estadísticas
        await loadClasses();

    } catch (error) {

        console.error(error);

        alert("No se pudo reactivar el estudiante.");
    }
}
async function desactivarEstudiante(classId, estudianteId) {

    const confirmar = confirm(
        "¿Quieres desactivar a este estudiante de la clase?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/clases/${classId}/estudiantes/${estudianteId}/desactivar`,
            {
                method: "PATCH"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.mensaje || "No se pudo desactivar el estudiante."
            );
        }

        console.log(data.mensaje);

        // Actualizar ambas listas inmediatamente
        await Promise.all([
            loadClassStudents(classId),
            loadInactiveStudents(classId)
        ]);

        // Actualizar estadísticas
        await loadClasses();

    } catch (error) {

        console.error(error);

        alert("No se pudo desactivar el estudiante.");
    }
}

/* =========================================
   MISIONES DE CLASE
========================================= */

async function loadClassMissions(classId) {

    const container =
        document.getElementById(
            "classMissions"
        );


    container.innerHTML = `
        <div class="loading">
            Cargando misiones...
        </div>
    `;


    try {

        const response =
            await fetch(
                `${API_URL}/clases/${classId}/misiones`
            );


        if (!response.ok) {

            throw new Error(
                "Error al obtener misiones."
            );

        }


        const missions =
            await response.json();


        console.log(
            "Misiones de clase:",
            missions
        );


        if (!missions.length) {

            container.innerHTML = `
                <div class="empty-state">

                    <strong>
                        No hay misiones asignadas.
                    </strong>

                    <p>
                        Las misiones aparecerán aquí.
                    </p>

                </div>
            `;

            return;

        }


        container.innerHTML =
            missions.map(mission => `

                <div class="mission-card">

                    <div class="mission-icon">
                        ◇
                    </div>

                    <h3>
                        ${escapeHtml(mission.titulo)}
                    </h3>

                    <p>
                        ${escapeHtml(mission.descripcion)}
                    </p>

                    <span class="global-badge">

                        ${
                            mission.activa
                            ? "Activa"
                            : "Inactiva"
                        }

                    </span>

                </div>

            `).join("");


    } catch (error) {

        console.error(
            "Error cargando misiones de clase:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                No se pudieron cargar las misiones.
            </div>
        `;

    }

}


/* =========================================
   TODAS LAS MISIONES
========================================= */

async function loadMissions() {

    const container =
        document.getElementById(
            "missionsGrid"
        );


    try {

        const response =
            await fetch(
                `${API_URL}/misiones`
            );


        if (!response.ok) {

            throw new Error(
                "Error al obtener misiones."
            );

        }


        const missions =
            await response.json();


        console.log(
            "Misiones recibidas:",
            missions
        );


        document.getElementById(
            "totalMissions"
        ).textContent =
            missions.length;


        if (!missions.length) {

            container.innerHTML = `
                <div class="empty-state">

                    <strong>
                        No hay misiones disponibles.
                    </strong>

                </div>
            `;

            return;

        }


        container.innerHTML =
            missions.map(mission => `

                <article class="mission-card">

                    <div class="mission-icon">
                        ◇
                    </div>

                    <h3>
                        ${escapeHtml(mission.titulo)}
                    </h3>

                    <p>
                        ${escapeHtml(mission.descripcion)}
                    </p>

                    <span class="global-badge">

                        ${
                            mission.esGlobal
                            ? "Misión global"
                            : "Misión del profesor"
                        }

                    </span>

                </article>

            `).join("");


    } catch (error) {

        console.error(
            "Error cargando misiones:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                No se pudieron cargar las misiones.
            </div>
        `;

    }

}


/* =========================================
   TOTAL DE ESTUDIANTES
========================================= */

async function loadTotalStudents(classes) {

    let total = 0;


    for (const clase of classes) {

        try {

            const response =
                await fetch(
                    `${API_URL}/clases/${clase.id}/estudiantes`
                );


            if (response.ok) {

                const students =
                    await response.json();

                total += students.length;

            }

        } catch (error) {

            console.error(
                "Error contando estudiantes:",
                error
            );

        }

    }


    document.getElementById(
        "totalStudents"
    ).textContent = total;

}


/* =========================================
   ESTUDIANTES GENERAL
========================================= */

async function loadStudentsOverview() {

    const container =
        document.getElementById(
            "studentsOverview"
        );


    try {

        const response =
            await fetch(
                `${API_URL}/clases?profesorId=${PROFESOR_ID}`
            );


        if (!response.ok) {

            throw new Error(
                "No se pudieron obtener las clases."
            );

        }


        const classes =
            await response.json();


        if (!classes.length) {

            container.innerHTML = `
                <div class="empty-state">

                    <strong>
                        No tienes clases todavía.
                    </strong>

                </div>
            `;

            return;

        }


        let html = "";


        for (const clase of classes) {

            const studentsResponse =
                await fetch(
                    `${API_URL}/clases/${clase.id}/estudiantes`
                );


            if (!studentsResponse.ok) {
                continue;
            }


            const students =
                await studentsResponse.json();


            html += `

                <div class="content-card">

                    <div class="card-header">

                        <div>

                            <h2>
                                ${escapeHtml(clase.nombre)}
                            </h2>

                            <p>
                                ${students.length}
                                estudiante(s)
                            </p>

                        </div>

                    </div>


                    <div class="student-list">

                        ${
                            students.length

                            ?

                            students.map(student => {

                                const initials =
                                    `${student.nombre[0]}${student.apellido[0]}`
                                    .toUpperCase();

                                return `

                                    <div class="student-row">

                                        <div class="student-main">

                                            <div class="student-avatar">
                                                ${initials}
                                            </div>

                                            <div>

                                                <div class="student-name">

                                                    ${escapeHtml(student.nombre)}
                                                    ${escapeHtml(student.apellido)}

                                                </div>

                                                <div class="student-date">

                                                    Ingreso:
                                                    ${formatDate(
                                                        student.fechaIngreso
                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                `;

                            }).join("")

                            :

                            `
                                <div class="empty-state">
                                    No hay estudiantes activos.
                                </div>
                            `
                        }

                    </div>

                </div>

            `;

        }


        container.innerHTML =
            html ||

            `
                <div class="empty-state">
                    No hay estudiantes.
                </div>
            `;


    } catch (error) {

        console.error(
            "Error cargando estudiantes:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                No se pudieron cargar los estudiantes.
            </div>
        `;

    }

}


/* =========================================
   VOLVER A CLASES
========================================= */

document
    .getElementById("backToClasses")
    .addEventListener(
        "click",
        () => {

            showSection("clases");

        }
    );


/* =========================================
   CARGA INICIAL
========================================= */

async function initializeDashboard() {

    console.log(
        "Inicializando dashboard..."
    );


    await loadClasses();

    await loadMissions();

    await loadStudentsOverview();


    console.log(
        "Dashboard cargado correctamente."
    );

}


initializeDashboard();

// =========================================
// MODAL AGREGAR ESTUDIANTE
// =========================================

let claseIdSeleccionadaAgregar = null;
let todosLosEstudiantes = [];
let estudiantesEnClaseIds = new Set();

// Elementos del modal
const agregarEstudianteModal = document.getElementById("agregarEstudianteModal");
const listaEstudiantesAgregar = document.getElementById("listaEstudiantesAgregar");
const buscadorEstudiantes = document.getElementById("buscadorEstudiantes");
const agregarEstudianteSubtexto = document.getElementById("agregarEstudianteSubtexto");

/**
 * Abre el modal para agregar estudiantes a una clase
 */
async function abrirModalAgregarEstudiante(claseId, claseNombre) {
    claseIdSeleccionadaAgregar = claseId;

    agregarEstudianteSubtexto.textContent =
        `Selecciona un estudiante para agregar a "${claseNombre}"`;

    agregarEstudianteModal.classList.add("show");

    // Limpiar buscador
    buscadorEstudiantes.value = "";

    await cargarEstudiantesDisponibles(claseId);
}

/**
 * Cierra el modal de agregar estudiante
 */
function cerrarModalAgregarEstudiante() {
    agregarEstudianteModal.classList.remove("show");
    claseIdSeleccionadaAgregar = null;
    todosLosEstudiantes = [];
    estudiantesEnClaseIds = new Set();
    buscadorEstudiantes.value = "";
}

/**
 * Carga los estudiantes disponibles y los ya agregados
 */
async function cargarEstudiantesDisponibles(claseId) {
    listaEstudiantesAgregar.innerHTML = `
        <div class="loading">
            Cargando estudiantes...
        </div>
    `;

    try {
        // Obtener todos los estudiantes y los de la clase
        const [estudiantesResponse, claseEstudiantesResponse] = await Promise.all([
            fetch(`${API_URL}/estudiantes/todos`),
            fetch(`${API_URL}/clases/${claseId}/estudiantes`)
        ]);

        if (!estudiantesResponse.ok) {
            throw new Error("Error al cargar estudiantes.");
        }

        const todos = await estudiantesResponse.json();
        todosLosEstudiantes = todos;

        // Obtener IDs de estudiantes ya en la clase
        if (claseEstudiantesResponse.ok) {
            const enClase = await claseEstudiantesResponse.json();
            estudiantesEnClaseIds = new Set(
                enClase.map(e => e.estudianteId)
            );
        }

        renderizarListaEstudiantes(todosLosEstudiantes);

    } catch (error) {
        console.error("Error cargando estudiantes:", error);
        listaEstudiantesAgregar.innerHTML = `
            <div class="empty-state">
                <strong>Error al cargar estudiantes</strong>
                <p>No se pudieron cargar los estudiantes disponibles.</p>
                <button
                    onclick="cargarEstudiantesDisponibles(${claseId})"
                    style="
                        margin-top: 15px;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 8px;
                        background: var(--primary);
                        color: white;
                        cursor: pointer;
                        font-weight: 600;
                    "
                >
                    Reintentar
                </button>
            </div>
        `;
    }
}

/**
 * Renderiza la lista de estudiantes en el modal
 */
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
            <div
                class="estudiante-agregar-item"
                style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    border: 1px solid ${yaAgregado ? '#d4edda' : 'var(--border)'};
                    border-radius: 12px;
                    margin-bottom: 10px;
                    background: ${yaAgregado ? '#f0fff4' : 'white'};
                    transition: 0.2s;
                "
            >
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <div style="
                        width: 38px;
                        height: 38px;
                        border-radius: 50%;
                        background: var(--purple-soft);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 700;
                        color: var(--primary);
                        font-size: 13px;
                    ">
                        ${iniciales}
                    </div>
                    <div>
                        <strong style="font-size: 15px;">
                            ${escapeHtml(estudiante.nombre)} ${escapeHtml(estudiante.apellido)}
                        </strong>
                        <div style="font-size: 12px; color: var(--text-light);">
                            ${estudiante.email || 'Sin email'}
                        </div>
                    </div>
                </div>

                <div>
                    ${yaAgregado
                        ? `
                            <span style="
                                display: inline-flex;
                                align-items: center;
                                gap: 6px;
                                padding: 5px 14px;
                                border-radius: 20px;
                                background: #d4edda;
                                color: #155724;
                                font-size: 12px;
                                font-weight: 600;
                            ">
                                ✓ En clase
                            </span>
                        `
                        : `
                            <button
                                onclick="agregarEstudianteAClase(${estudiante.id})"
                                class="primary-button"
                                style="
                                    min-height: 34px;
                                    padding: 0 18px;
                                    font-size: 12px;
                                "
                            >
                                Agregar
                            </button>
                        `
                    }
                </div>
            </div>
        `;
    }).join("");
}

/**
 * Agrega un estudiante a la clase seleccionada
 */
async function agregarEstudianteAClase(estudianteId) {
    if (!claseIdSeleccionadaAgregar) {
        alert("No hay una clase seleccionada.");
        return;
    }

    // Buscar el botón clickeado
    const boton = event?.target;
    const textoOriginal = boton?.textContent || "Agregar";

    if (boton) {
        boton.disabled = true;
        boton.textContent = "Agregando...";
    }

    try {
        const response = await fetch(
            `${API_URL}/clases/${claseIdSeleccionadaAgregar}/estudiantes?estudianteId=${estudianteId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || "Error al agregar estudiante.");
        }

        // Agregar el ID a los estudiantes en clase
        estudiantesEnClaseIds.add(estudianteId);

        // Re-renderizar la lista
        renderizarListaEstudiantes(todosLosEstudiantes);

        // Actualizar la lista de estudiantes de la clase
        if (claseIdSeleccionadaAgregar) {
            await loadClassStudents(claseIdSeleccionadaAgregar);
            await loadInactiveStudents(claseIdSeleccionadaAgregar);
            await loadClasses(); // Actualizar estadísticas
        }

        // Mostrar notificación de éxito
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

// =========================================
// EVENTOS DEL MODAL
// =========================================

// Abrir modal desde el detalle de clase
document.getElementById("openAgregarEstudiante")?.addEventListener("click", () => {
    const claseId = parseInt(
        document.querySelector("#classDetail")?.dataset?.claseId
    );

    if (!claseId) {
        alert("No hay una clase seleccionada.");
        return;
    }

    const nombreClase =
        document.getElementById("detailClassName")?.textContent || "clase";

    abrirModalAgregarEstudiante(claseId, nombreClase);
});

// Cerrar modal
document.getElementById("closeAgregarEstudiante")?.addEventListener("click", cerrarModalAgregarEstudiante);
document.getElementById("cancelarAgregarEstudiante")?.addEventListener("click", cerrarModalAgregarEstudiante);

// Cerrar al hacer clic en el fondo
agregarEstudianteModal?.addEventListener("click", (event) => {
    if (event.target === agregarEstudianteModal) {
        cerrarModalAgregarEstudiante();
    }
});

// Cerrar con tecla ESC
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && agregarEstudianteModal?.classList.contains("show")) {
        cerrarModalAgregarEstudiante();
    }
});

// Buscador en tiempo real
buscadorEstudiantes?.addEventListener("input", () => {
    renderizarListaEstudiantes(todosLosEstudiantes);
});

// =========================================
// NOTIFICACIONES (reutilizar la misma función)
// =========================================

function mostrarNotificacion(mensaje, tipo = "success") {
    // Eliminar notificaciones existentes
    const notificacionesAnteriores =
        document.querySelectorAll(".notificacion-flotante");
    notificacionesAnteriores.forEach(n => n.remove());

    const colores = {
        success: "#2ca66f",
        error: "#d9366f",
        info: "#5636c9"
    };

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
        font-weight: 600;<!DOCTYPE html>
<html lang="es">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Dashboard | Voces con Derechos</title>

    <link
        rel="stylesheet"
        href="css/dashboard.css"
    >

</head>


<body>

    <div class="dashboard">


        <!-- =====================================
             SIDEBAR
        ====================================== -->

        <aside class="sidebar">

            <div class="sidebar-logo">

                <img
                    src="assets/logo.png"
                    alt="Voces con Derechos"
                >

            </div>


            <nav class="sidebar-menu">

                <a
                    href="#inicio"
                    class="menu-item active"
                    data-section="inicio"
                >
                    <span class="menu-icon">⌂</span>
                    <span>Inicio</span>
                </a>


                <a
                    href="#clases"
                    class="menu-item"
                    data-section="clases"
                >
                    <span class="menu-icon">▣</span>
                    <span>Mis clases</span>
                </a>


                <a
                    href="#misiones"
                    class="menu-item"
                    data-section="misiones"
                >
                    <span class="menu-icon">◇</span>
                    <span>Misiones</span>
                </a>


                <a
                    href="#estudiantes"
                    class="menu-item"
                    data-section="estudiantes"
                >
                    <span class="menu-icon">♧</span>
                    <span>Estudiantes</span>
                </a>

            </nav>

            <div class="sidebar-bottom">
                <a href="login.html" class="menu-item" id="cerrarSesion">
                    <span class="menu-icon">←</span>
                    <span>Cerrar sesión</span>
                </a>
            </div>

        </aside>



        <!-- =====================================
             CONTENIDO PRINCIPAL
        ====================================== -->

        <main class="main-content">


            <!-- HEADER -->

            <header class="topbar">

                <div class="mobile-logo">

                    <img
                        src="assets/logo.png"
                        alt="Voces con Derechos"
                    >

                </div>


                <div class="topbar-user">

                    <div class="user-avatar">
                        CP
                    </div>

                    <div class="user-info">

                        <strong>
                            Carlos Pérez
                        </strong>

                        <span>
                            Profesor
                        </span>

                    </div>

                </div>

            </header>



            <!-- =================================
                 INICIO
            ================================== -->

            <section
                id="inicio"
                class="dashboard-section active-section"
            >

                <div class="welcome">

                    <div>

                        <span class="section-label">
                            PANEL DEL PROFESOR
                        </span>

                        <h1>
                            ¡Hola, Carlos! 👋
                        </h1>

                        <p>
                            Administra tus clases, estudiantes
                            y misiones desde aquí.
                        </p>

                    </div>

                    <button
                        class="primary-button"
                        id="openCreateClass"
                    >
                        + Crear clase
                    </button>

                </div>


                <!-- ESTADÍSTICAS -->

                <div class="stats-grid">

                    <div class="stat-card">

                        <div class="stat-icon purple">
                            ▣
                        </div>

                        <div>

                            <span>
                                Mis clases
                            </span>

                            <strong id="totalClasses">
                                0
                            </strong>

                        </div>

                    </div>


                    <div class="stat-card">

                        <div class="stat-icon pink">
                            ♧
                        </div>

                        <div>

                            <span>
                                Estudiantes
                            </span>

                            <strong id="totalStudents">
                                0
                            </strong>

                        </div>

                    </div>


                    <div class="stat-card">

                        <div class="stat-icon blue">
                            ◇
                        </div>

                        <div>

                            <span>
                                Misiones
                            </span>

                            <strong id="totalMissions">
                                0
                            </strong>

                        </div>

                    </div>

                </div>



                <!-- CLASES -->

                <div class="content-card">

                    <div class="card-header">

                        <div>

                            <h2>
                                Mis clases
                            </h2>

                            <p>
                                Clases que tienes actualmente.
                            </p>

                        </div>

                        <button
                            class="text-button"
                            data-section="clases"
                        >
                            Ver todas →
                        </button>

                    </div>


                    <div
                        id="dashboardClasses"
                        class="classes-grid"
                    >

                        <div class="loading">
                            Cargando clases...
                        </div>

                    </div>

                </div>

            </section>



            <!-- =================================
                 MIS CLASES
            ================================== -->

            <section
                id="clases"
                class="dashboard-section"
            >

                <div class="page-header">

                    <div>

                        <span class="section-label">
                            GESTIÓN
                        </span>

                        <h1>
                            Mis clases
                        </h1>

                        <p>
                            Administra tus grupos y estudiantes.
                        </p>

                    </div>


                    <button
                        class="primary-button"
                        id="openCreateClass2"
                    >
                        + Crear clase
                    </button>

                </div>


                <div
                    id="allClasses"
                    class="classes-grid"
                >

                    <div class="loading">
                        Cargando clases...
                    </div>

                </div>

            </section>



            <!-- =================================
                 DETALLE CLASE
            ================================== -->

    <section
        id="classDetail"
        class="dashboard-section"
    >

        <!-- VOLVER -->
        <button
            class="back-dashboard"
            id="backToClasses"
        >
            ← Volver a mis clases
        </button>


        <!-- INFORMACIÓN DE LA CLASE -->
        <div class="page-header">

            <div>

                <span class="section-label">
                    CLASE
                </span>

                <h1 id="detailClassName">
                    —
                </h1>

                <p id="detailClassLevel">
                    —
                </p>

            </div>

        </div>


        <div class="detail-grid">


            <!-- =================================
                ESTUDIANTES
            ================================== -->

            <div>

                <!-- ESTUDIANTES ACTIVOS -->

                <div class="content-card">

                    <div class="card-header">

                        <div>

                            <h2>
                                Estudiantes
                            </h2>

                            <p>
                                Estudiantes activos pertenecientes a esta clase.
                            </p>

                        </div>

                    </div>


                    <div
                        id="classStudents"
                        class="student-list"
                    >

                        <div class="loading">
                            Cargando estudiantes...
                        </div>

                    </div>

                </div>


                <!-- ESTUDIANTES INACTIVOS -->

                <div class="content-card">

                    <div class="card-header">

                        <div>

                            <h2>
                                Estudiantes inactivos
                            </h2>

                            <p>
                                Estudiantes que fueron desactivados de esta clase.
                            </p>

                        </div>

                    </div>


                    <div
                        id="inactiveStudents"
                        class="student-list"
                    >

                        <div class="loading">
                            Cargando estudiantes inactivos...
                        </div>

                    </div>

                </div>

            </div>



        <!-- =================================
             MISIONES
        ================================== -->

        <div class="content-card">

            <div class="card-header">

                <div>

                    <h2>
                        Misiones asignadas
                    </h2>

                    <p>
                        Misiones disponibles para esta clase.
                    </p>

                </div>

            </div>


            <div
                id="classMissions"
                class="mission-list"
            >

                <div class="loading">
                    Cargando misiones...
                </div>

            </div>

        </div>


    </div>

</section>



            <!-- =================================
                 MISIONES
            ================================== -->

            <section
                id="misiones"
                class="dashboard-section"
            >

                <div class="page-header">

                    <div>

                        <span class="section-label">
                            CONTENIDO EDUCATIVO
                        </span>

                        <h1>
                            Misiones
                        </h1>

                        <p>
                            Consulta las misiones disponibles.
                        </p>

                    </div>

                </div>


                <div
                    id="missionsGrid"
                    class="missions-grid"
                >

                    <div class="loading">
                        Cargando misiones...
                    </div>

                </div>

            </section>



            <!-- =================================
                 ESTUDIANTES
            ================================== -->

            <section
                id="estudiantes"
                class="dashboard-section"
            >

                <div class="page-header">

                    <div>

                        <span class="section-label">
                            ESTUDIANTES
                        </span>

                        <h1>
                            Estudiantes
                        </h1>

                        <p>
                            Consulta los estudiantes de tus clases.
                        </p>

                    </div>

                </div>


                <div class="content-card">

                    <div
                        id="studentsOverview"
                        class="students-overview"
                    >

                        <div class="loading">
                            Cargando estudiantes...
                        </div>

                    </div>

                </div>

            </section>


        </main>

    </div>



    <!-- =====================================
         MODAL CREAR CLASE
    ====================================== -->

    <div
        id="createClassModal"
        class="modal"
    >

        <div class="modal-card">

            <button
                class="close-modal"
                id="closeCreateClass"
            >
                ×
            </button>


            <div class="modal-header">

                <span class="modal-icon">
                    ▣
                </span>

                <h2>
                    Crear nueva clase
                </h2>

                <p>
                    Crea un grupo para comenzar a organizar
                    a tus estudiantes.
                </p>

            </div>


            <form id="createClassForm">

                <div class="form-group">

                    <label for="className">
                        Nombre de la clase
                    </label>

                    <input
                        type="text"
                        id="className"
                        placeholder="Ej. 4to A"
                        required
                    >

                </div>


                <div class="form-group">

                    <label for="classLevel">
                        Nivel educativo
                    </label>

                    <select
                        id="classLevel"
                        required
                    >

                        <option value="">
                            Selecciona un nivel
                        </option>

                        <option value="Primaria">
                            Primaria
                        </option>

                        <option value="Secundaria">
                            Secundaria
                        </option>

                    </select>

                </div>


                <div
                    id="createClassMessage"
                    class="form-message"
                ></div>


                <button
                    type="submit"
                    class="primary-button full"
                >
                    Crear clase
                </button>

            </form>

        </div>

    </div>


    <!-- =====================================
        MODAL ASIGNAR MISIÓN
    ====================================== -->

    <div id="asignarMisionModal" class="modal">

        <div class="modal-card" style="max-width: 580px;">

            <button class="close-modal" id="closeAsignarMision">
                ×
            </button>

            <div class="modal-header">

                <span class="modal-icon">
                    ◇
                </span>

                <h2>
                    Asignar misión
                </h2>

                <p id="asignarMisionSubtexto">
                    Selecciona una misión para asignar a esta clase.
                </p>

            </div>

            <!-- Lista de misiones -->
            <div id="listaMisionesAsignar" style="max-height: 400px; overflow-y: auto;">

                <div class="loading">
                    Cargando misiones...
                </div>

            </div>

            <!-- Footer -->
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end;">

                <button
                    class="text-button"
                    id="cancelarAsignarMision"
                    style="padding: 10px 20px;"
                >
                    Cancelar
                </button>

            </div>

        </div>

    </div>



    <script src="js/dashboard.js"></script>

</body>

</html>
        font-size: 15px;
        box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        transform: translateX(120%);
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        max-width: 400px;
    `;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.style.transform = "translateX(0)";
    }, 50);

    setTimeout(() => {
        notificacion.style.transform = "translateX(120%)";
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }, 4000);
}

/* =========================================
   UTILIDADES
========================================= */

function formatDate(date) {

    if (!date) {
        return "—";
    }


    return new Date(date)
        .toLocaleDateString(
            "es-NI",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

}


function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}

/* =========================================
   MODAL ASIGNAR MISIÓN
========================================= */

let claseIdSeleccionada = null;
let misionesGlobales = [];
let misionesAsignadasIds = new Set();

// Elementos del modal
const asignarMisionModal = document.getElementById("asignarMisionModal");
const listaMisionesAsignar = document.getElementById("listaMisionesAsignar");
const asignarMisionSubtexto = document.getElementById("asignarMisionSubtexto");

/**
 * Abre el modal para asignar misiones a una clase
 */
async function abrirModalAsignarMision(claseId, claseNombre) {

    claseIdSeleccionada = claseId;

    asignarMisionSubtexto.textContent =
        `Selecciona una misión para asignar a "${claseNombre}"`;

    asignarMisionModal.classList.add("show");

    await cargarMisionesDisponibles(claseId);

}

/**
 * Cierra el modal de asignación
 */
function cerrarModalAsignarMision() {

    asignarMisionModal.classList.remove("show");

    claseIdSeleccionada = null;

    misionesGlobales = [];

    misionesAsignadasIds = new Set();

}


/**
 * Carga las misiones disponibles y las ya asignadas
 */
async function cargarMisionesDisponibles(claseId) {

    listaMisionesAsignar.innerHTML = `
        <div class="loading">
            Cargando misiones...
        </div>
    `;

    try {

        // Obtener misiones globales y las asignadas a la clase
        const [misionesResponse, asignadasResponse] = await Promise.all([

            fetch(`${API_URL}/misiones`),

            fetch(`${API_URL}/clases/${claseId}/misiones`)

        ]);

        if (!misionesResponse.ok) {

            throw new Error("Error al cargar misiones.");

        }

        const todasMisiones = await misionesResponse.json();

        // Filtrar solo misiones globales (EsGlobal = true)
        misionesGlobales = todasMisiones.filter(m => m.esGlobal === true);

        // Obtener IDs de misiones ya asignadas
        if (asignadasResponse.ok) {

            const asignadas = await asignadasResponse.json();

            misionesAsignadasIds = new Set(
                asignadas.map(m => m.misionId)
            );

        }

        renderizarListaMisiones();

    } catch (error) {

        console.error("Error cargando misiones:", error);

        listaMisionesAsignar.innerHTML = `

            <div class="empty-state">

                <strong>
                    Error al cargar misiones
                </strong>

                <p>
                    No se pudieron cargar las misiones disponibles.
                </p>

                <button
                    onclick="cargarMisionesDisponibles(${claseId})"
                    style="
                        margin-top: 15px;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 8px;
                        background: var(--primary);
                        color: white;
                        cursor: pointer;
                        font-weight: 600;
                    "
                >
                    Reintentar
                </button>

            </div>

        `;

    }

}


/**
 * Renderiza la lista de misiones en el modal
 */
function renderizarListaMisiones() {

    if (!misionesGlobales.length) {

        listaMisionesAsignar.innerHTML = `

            <div class="empty-state">

                <strong>
                    No hay misiones disponibles
                </strong>

                <p>
                    No se encontraron misiones globales para asignar.
                </p>

            </div>

        `;

        return;

    }


    listaMisionesAsignar.innerHTML =

        misionesGlobales.map(mision => {

            const yaAsignada =
                misionesAsignadasIds.has(mision.id);

            return `

                <div
                    class="mision-asignar-item"
                    style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 16px;
                        border: 1px solid ${yaAsignada ? '#d4edda' : 'var(--border)'};
                        border-radius: 12px;
                        margin-bottom: 12px;
                        background: ${yaAsignada ? '#f0fff4' : 'white'};
                        transition: 0.2s;
                    "
                >

                    <div style="flex: 1;">

                        <div style="display: flex; align-items: center; gap: 12px;">

                            <span style="font-size: 24px;">
                                ◇
                            </span>

                            <div>

                                <strong style="font-size: 16px;">
                                    ${escapeHtml(mision.titulo)}
                                </strong>

                                <p style="
                                    margin-top: 4px;
                                    font-size: 13px;
                                    color: var(--text-light);
                                ">
                                    ${escapeHtml(mision.descripcion) || 'Sin descripción'}
                                </p>

                            </div>

                        </div>

                    </div>

                    <div>

                        ${yaAsignada

                            ? `

                                <span style="
                                    display: inline-flex;
                                    align-items: center;
                                    gap: 6px;
                                    padding: 6px 14px;
                                    border-radius: 20px;
                                    background: #d4edda;
                                    color: #155724;
                                    font-size: 13px;
                                    font-weight: 600;
                                ">
                                    ✓ Asignada
                                </span>

                            `

                            : `

                                <button
                                    onclick="asignarMisionAClase(${mision.id})"
                                    class="primary-button"
                                    style="
                                        min-height: 38px;
                                        padding: 0 20px;
                                        font-size: 13px;
                                    "
                                >
                                    Asignar
                                </button>

                            `

                        }

                    </div>

                </div>

            `;

        }).join("");

}


/**
 * Asigna una misión a la clase seleccionada
 */
async function asignarMisionAClase(misionId) {

    if (!claseIdSeleccionada) {

        alert("No hay una clase seleccionada.");

        return;

    }

    // Buscar el botón clickeado
    const boton = event?.target;

    const textoOriginal = boton?.textContent || "Asignar";

    if (boton) {

        boton.disabled = true;

        boton.textContent = "Asignando...";

    }


    try {

        const response = await fetch(

            `${API_URL}/clases/${claseIdSeleccionada}/misiones/${misionId}`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                }

            }

        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(

                data.mensaje || "Error al asignar misión."

            );

        }


        // Agregar el ID a las asignadas
        misionesAsignadasIds.add(misionId);

        // Re-renderizar la lista
        renderizarListaMisiones();

        // Actualizar la lista de misiones de la clase en el detalle
        if (claseIdSeleccionada) {

            await loadClassMissions(claseIdSeleccionada);

        }


        // Mostrar notificación de éxito
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


/**
 * Muestra una notificación temporal
 */
function mostrarNotificacion(mensaje, tipo = "success") {

    // Eliminar notificaciones existentes
    const notificacionesAnteriores =
        document.querySelectorAll(".notificacion-flotante");

    notificacionesAnteriores.forEach(n => n.remove());


    const colores = {

        success: "#2ca66f",

        error: "#d9366f",

        info: "#5636c9"

    };


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


    // Animación de entrada
    setTimeout(() => {

        notificacion.style.transform = "translateX(0)";

    }, 50);


    // Eliminar después de 4 segundos
    setTimeout(() => {

        notificacion.style.transform = "translateX(120%)";

        setTimeout(() => {

            notificacion.remove();

        }, 300);

    }, 4000);

}


// =========================================
// EVENTOS DEL MODAL
// =========================================

// Abrir modal desde el botón en el detalle de clase
// Esta función se llamará desde el HTML
function abrirAsignarMisionDesdeDetalle() {

    const claseId = claseIdSeleccionada || 
        parseInt(document.querySelector("#classDetail")?.dataset?.claseId);

    if (!claseId) {

        alert("No hay una clase seleccionada.");

        return;

    }

    const nombreClase =
        document.getElementById("detailClassName")?.textContent || "clase";

    abrirModalAsignarMision(claseId, nombreClase);

}


// Cerrar modal
document
    .getElementById("closeAsignarMision")
    ?.addEventListener("click", cerrarModalAsignarMision);


document
    .getElementById("cancelarAsignarMision")
    ?.addEventListener("click", cerrarModalAsignarMision);


// Cerrar al hacer clic en el fondo
asignarMisionModal?.addEventListener("click", (event) => {

    if (event.target === asignarMisionModal) {

        cerrarModalAsignarMision();

    }

});


// Cerrar con tecla ESC
document.addEventListener("keydown", (event) => {

    if (event.key === "Escape" && asignarMisionModal?.classList.contains("show")) {

        cerrarModalAsignarMision();

    }

});

async function openClass(classId) {
    // Guardar el ID de la clase para usarlo en los modales
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
        level.textContent = `Profesor ID: ${clase.profesorId}`;

        // Cargar datos
        await Promise.all([
            loadClassStudents(classId),
            loadInactiveStudents(classId),
            loadClassMissions(classId)
        ]);

        // Actualizar botón "Agregar estudiante"
        const btnAgregar = document.getElementById("openAgregarEstudiante");
        if (btnAgregar) {
            btnAgregar.onclick = () => {
                const nombreClase = document.getElementById("detailClassName")?.textContent || "clase";
                abrirModalAgregarEstudiante(classId, nombreClase);
            };
        }

        // Actualizar botón "Asignar misión"
        const btnAsignar = document.getElementById("btnAsignarMision");
        if (btnAsignar) {
            btnAsignar.onclick = () => {
                const nombreClase = document.getElementById("detailClassName")?.textContent || "clase";
                abrirModalAsignarMision(classId, nombreClase);
            };
        }

    } catch (error) {
        console.error("Error cargando clase:", error);
        name.textContent = "No se pudo cargar la clase.";
    }
}

/**
 * Sobrescribir openClass para guardar el ID y agregar el botón de asignar
 * (Modificación de la función existente)
 */
const openClassOriginal = window.openClass;

window.openClass = async function(classId) {

    // Guardar el ID de la clase para usarlo en el modal
    claseIdSeleccionada = classId;

    // Guardar en el dataset del section para referencia
    const section = document.getElementById("classDetail");

    if (section) {

        section.dataset.claseId = classId;

    }

    // Llamar a la función original
    await openClassOriginal(classId);

    // Agregar el botón "Asignar misión" después de cargar
    agregarBotonAsignarMision();

};


/**
 * Agrega el botón "Asignar misión" al detalle de clase
 */
function agregarBotonAsignarMision() {

    const pageHeader =
        document.querySelector("#classDetail .page-header");

    if (!pageHeader) {

        return;

    }

    // Verificar si el botón ya existe
    if (document.getElementById("btnAsignarMision")) {

        return;

    }

    // Crear el botón
    const boton = document.createElement("button");

    boton.id = "btnAsignarMision";

    boton.className = "primary-button";

    boton.innerHTML = `
        + Asignar misión
    `;

    boton.style.cssText = `
        white-space: nowrap;
    `;

    boton.addEventListener("click", () => {

        const claseId = parseInt(
            document.querySelector("#classDetail")?.dataset?.claseId
        );

        if (!claseId) {

            alert("No hay una clase seleccionada.");

            return;
        }

        const nombreClase =
            document.getElementById("detailClassName")?.textContent || "clase";

        abrirModalAsignarMision(claseId, nombreClase);

    });

    // Insertar el botón en el header
    pageHeader.appendChild(boton);

}
// =========================================
// ABRIR ASIGNAR MISIÓN DESDE DETALLE
// =========================================

function abrirAsignarMisionDesdeDetalle() {
    const section = document.getElementById("classDetail");
    const claseId = parseInt(section?.dataset?.claseId);

    if (!claseId) {
        alert("No hay una clase seleccionada.");
        return;
    }

    const nombreClase =
        document.getElementById("detailClassName")?.textContent || "clase";

    abrirModalAsignarMision(claseId, nombreClase);
}
// =========================================
// CERRAR SESIÓN
// =========================================

document.getElementById("cerrarSesion")?.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("profesor");
    window.location.href = "login.html";
});