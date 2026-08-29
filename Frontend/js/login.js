const API_URL = "http://localhost:5019/api";

// Elementos
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginMessage = document.getElementById("loginMessage");
const loginButton = document.getElementById("loginButton");
const rolEstudiante = document.getElementById("rolEstudiante");
const rolProfesor = document.getElementById("rolProfesor");

let rolSeleccionado = "estudiante";

// ==========================================
// SELECTOR DE ROL
// ==========================================

function seleccionarRol(rol) {
    rolSeleccionado = rol;
    [rolEstudiante, rolProfesor].forEach(btn => {
        btn.classList.remove("active");
        btn.style.borderColor = "var(--border)";
        btn.style.background = "var(--white)";
        btn.style.color = "var(--text-light)";
    });

    if (rol === "estudiante") {
        rolEstudiante.classList.add("active");
        document.getElementById("footerText").textContent = "¿Aún no tienes cuenta?";
        document.getElementById("footerLink").textContent = "Regístrate aquí";
        document.getElementById("footerLink").href = "registro.html";
        emailInput.placeholder = "ejemplo@correo.com";
    } else {
        rolProfesor.classList.add("active");
        document.getElementById("footerText").textContent = "¿Eres profesor?";
        document.getElementById("footerLink").textContent = "Accede al panel de profesores";
        document.getElementById("footerLink").href = "login.html?rol=profesor";
        emailInput.placeholder = "usuario@ejemplo.com";
    }
}

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

    loginButton.disabled = true;
    loginButton.textContent = "Iniciando sesión...";

    try {
        let endpoint = "";
        if (rolSeleccionado === "estudiante") {
            endpoint = `${API_URL}/estudiantes/login`;
        } else {
            endpoint = `${API_URL}/profesores/login`;
        }

        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || "Credenciales incorrectas.");
        }

        if (rolSeleccionado === "estudiante") {
            localStorage.setItem("estudiante", JSON.stringify(data));
            loginMessage.textContent = "✅ ¡Inicio de sesión exitoso!";
            loginMessage.style.color = "#2ca66f";
            setTimeout(() => { window.location.href = "dashboardEstudiantes.html"; }, 1500);
        } else {
            localStorage.setItem("profesor", JSON.stringify(data));
            loginMessage.textContent = "✅ ¡Bienvenido profesor!";
            loginMessage.style.color = "#2ca66f";
            setTimeout(() => { window.location.href = "dashboard.html"; }, 1500);
        }

    } catch (error) {
        console.error("Error:", error);
        loginMessage.textContent = "❌ " + error.message;
        loginMessage.style.color = "#d9366f";
        loginButton.disabled = false;
        loginButton.textContent = "Iniciar sesión →";
    }
});

// ==========================================
// DETECTAR ROL DESDE LA URL
// ==========================================

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('rol') === 'profesor') {
    seleccionarRol('profesor');
}

// ==========================================
// VERIFICAR SESIÓN ACTIVA
// ==========================================

if (localStorage.getItem("estudiante")) {
    window.location.href = "dashboardEstudiantes.html";
} else if (localStorage.getItem("profesor")) {
    window.location.href = "dashboard.html";
}