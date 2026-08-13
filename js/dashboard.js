const API_URL = "http://localhost:5019/api";

/*
    Profesor de prueba

    Id = 1
    Carlos Pérez
*/

const PROFESOR_ID = 1;


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