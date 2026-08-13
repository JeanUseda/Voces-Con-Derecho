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