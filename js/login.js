const API_URL = "http://localhost:5019/api";

// Elementos
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginMessage = document.getElementById("loginMessage");
const loginButton = document.getElementById("loginButton");

// Botones de rol
const rolEstudiante = document.getElementById("rolEstudiante");
const rolProfesor = document.getElementById("rolProfesor");

let rolSeleccionado = "estudiante"; // 'estudiante' o 'profesor'

// ==========================================
// SELECTOR DE ROL
// ==========================================

function seleccionarRol(rol) {
    rolSeleccionado = rol;

    // Resetear estilos
    [rolEstudiante, rolProfesor].forEach(btn => {
        btn.style.border = "2px solid var(--border)";
        btn.style.background = "white";
        btn.style.color = "var(--text-light)";
        btn.classList.remove("active");
    });

    // Activar el seleccionado
    if (rol === "estudiante") {
        rolEstudiante.style.border = "2px solid var(--primary)";
        rolEstudiante.style.background = "var(--purple-soft)";
        rolEstudiante.style.color = "var(--primary)";
        rolEstudiante.classList.add("active");

        // Cambiar texto del footer
        document.getElementById("footerText").textContent = "¿Aún no tienes cuenta?";
        document.getElementById("footerLink").textContent = "Regístrate aquí";
        document.getElementById("footerLink").href = "registro.html";

        // Cambiar placeholder
        emailInput.placeholder = "ejemplo@correo.com";
        emailInput.type = "email";

    } else {
        rolProfesor.style.border = "2px solid var(--primary)";
        rolProfesor.style.background = "var(--purple-soft)";
        rolProfesor.style.color = "var(--primary)";
        rolProfesor.classList.add("active");

        // Cambiar texto del footer
        document.getElementById("footerText").textContent = "¿Eres profesor?";
        document.getElementById("footerLink").textContent = "Accede al panel de profesores";
        document.getElementById("footerLink").href = "login.html?rol=profesor";

        // Cambiar placeholder
        emailInput.placeholder = "usuario@ejemplo.com";
        emailInput.type = "text";
    }
}

// Eventos de los botones de rol
rolEstudiante.addEventListener("click", () => seleccionarRol("estudiante"));
rolProfesor.addEventListener("click", () => seleccionarRol("profesor"));

// ==========================================
// MOSTRAR/OCULTAR CONTRASEÑA
// ==========================================

togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "Ocultar" : "Mostrar";
});

// ==========================================
// LOGIN UNIFICADO
// ==========================================

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        loginMessage.textContent = "Completa todos los campos.";
        loginMessage.style.color = "#d9366f";
        return;
    }

    // Deshabilitar botón durante el login
    loginButton.disabled = true;
    loginButton.textContent = "Iniciando sesión...";

    try {
        let endpoint = "";
        let responseData = null;

        if (rolSeleccionado === "estudiante") {
            // Login de estudiante
            endpoint = `${API_URL}/estudiantes/login`;

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.mensaje || "Credenciales incorrectas.");
            }

            // Guardar datos del estudiante
            localStorage.setItem("estudiante", JSON.stringify(data));
            responseData = data;

            loginMessage.textContent = "✅ ¡Inicio de sesión exitoso!";
            loginMessage.style.color = "#2ca66f";

            // Redirigir al dashboard del estudiante
            setTimeout(() => {
                window.location.href = "dashboardEstudiantes.html";
            }, 1500);

        } else {
            // Login de profesor
            endpoint = `${API_URL}/profesores/login`;

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.mensaje || "Credenciales incorrectas.");
            }

            // Guardar datos del profesor
            localStorage.setItem("profesor", JSON.stringify(data));
            responseData = data;

            loginMessage.textContent = "✅ ¡Bienvenido profesor!";
            loginMessage.style.color = "#2ca66f";

            // Redirigir al dashboard del profesor
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500);
        }

    } catch (error) {
        console.error("Error:", error);
        loginMessage.textContent = "❌ " + error.message;
        loginMessage.style.color = "#d9366f";

        // Habilitar botón nuevamente
        loginButton.disabled = false;
        loginButton.textContent = "Iniciar sesión →";
    }
});

// ==========================================
// DETECTAR ROL DESDE LA URL
// ==========================================

// Si la URL tiene ?rol=profesor, seleccionar profesor automáticamente
const urlParams = new URLSearchParams(window.location.search);
const rolParam = urlParams.get('rol');

if (rolParam === 'profesor') {
    seleccionarRol('profesor');
}

// ==========================================
// VERIFICAR SESIÓN ACTIVA
// ==========================================

// Si ya hay una sesión activa, redirigir automáticamente
const estudianteActivo = localStorage.getItem("estudiante");
const profesorActivo = localStorage.getItem("profesor");

if (estudianteActivo) {
    window.location.href = "dashboardEstudiantes.html";
} else if (profesorActivo) {
    window.location.href = "dashboard.html";
}




// const loginForm = document.getElementById("loginForm");
// const passwordInput = document.getElementById("password");
// const togglePassword = document.getElementById("togglePassword");
// const loginMessage = document.getElementById("loginMessage");


// /* Mostrar / ocultar contraseña */

// togglePassword.addEventListener("click", () => {

//     const isPassword =
//         passwordInput.type === "password";

//     passwordInput.type =
//         isPassword ? "text" : "password";

//     togglePassword.textContent =
//         isPassword ? "Ocultar" : "Mostrar";

// });


// /* Login */

// loginForm.addEventListener("submit", (event) => {

//     event.preventDefault();

//     const usuario =
//         document.getElementById("usuario").value.trim();

//     const password =
//         passwordInput.value.trim();


//     if (!usuario || !password) {

//         loginMessage.textContent =
//             "Completa todos los campos.";

//         loginMessage.style.color = "#d9366f";

//         return;
//     }


//     /*
//         Por ahora no conectamos con autenticación.

//         La autenticación real se conectará
//         posteriormente con el backend ASP.NET.
//     */

//     loginMessage.textContent =
//         "Formulario listo para conectar con el servidor.";

//     loginMessage.style.color = "#5636c9";

// });