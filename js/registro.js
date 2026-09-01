const API_URL = "http://localhost:5019/api";

const registroForm = document.getElementById("registroForm");
const nombreInput = document.getElementById("nombre");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
const registroMessage = document.getElementById("registroMessage");
const registroButton = document.getElementById("registroButton");

// Botones de rol
const rolEstudianteRegistro = document.getElementById("rolEstudianteRegistro");
const rolProfesorRegistro = document.getElementById("rolProfesorRegistro");

let rolSeleccionado = "estudiante"; // 'estudiante' o 'profesor'

// ==========================================
// SELECTOR DE ROL
// ==========================================

function seleccionarRolRegistro(rol) {
    rolSeleccionado = rol;

    // Resetear estilos
    [rolEstudianteRegistro, rolProfesorRegistro].forEach(btn => {
        btn.style.border = "2px solid var(--border)";
        btn.style.background = "white";
        btn.style.color = "var(--text-light)";
        btn.classList.remove("active");
    });

    // Activar el seleccionado
    if (rol === "estudiante") {
        rolEstudianteRegistro.style.border = "2px solid var(--primary)";
        rolEstudianteRegistro.style.background = "var(--purple-soft)";
        rolEstudianteRegistro.style.color = "var(--primary)";
        rolEstudianteRegistro.classList.add("active");
    } else {
        rolProfesorRegistro.style.border = "2px solid var(--primary)";
        rolProfesorRegistro.style.background = "var(--purple-soft)";
        rolProfesorRegistro.style.color = "var(--primary)";
        rolProfesorRegistro.classList.add("active");
    }
}

rolEstudianteRegistro.addEventListener("click", () => seleccionarRolRegistro("estudiante"));
rolProfesorRegistro.addEventListener("click", () => seleccionarRolRegistro("profesor"));

// ==========================================
// MOSTRAR/OCULTAR CONTRASEÑA
// ==========================================

togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "Ocultar" : "Mostrar";
});

toggleConfirmPassword.addEventListener("click", () => {
    const isPassword = confirmPasswordInput.type === "password";
    confirmPasswordInput.type = isPassword ? "text" : "password";
    toggleConfirmPassword.textContent = isPassword ? "Ocultar" : "Mostrar";
});

// ==========================================
// REGISTRO UNIFICADO
// ==========================================

registroForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validaciones
    if (!nombre || !email || !password || !confirmPassword) {
        registroMessage.textContent = "Completa todos los campos.";
        registroMessage.style.color = "#d9366f";
        return;
    }

    if (password !== confirmPassword) {
        registroMessage.textContent = "Las contraseñas no coinciden.";
        registroMessage.style.color = "#d9366f";
        return;
    }

    if (password.length < 6) {
        registroMessage.textContent = "La contraseña debe tener al menos 6 caracteres.";
        registroMessage.style.color = "#d9366f";
        return;
    }

    // Deshabilitar botón durante el registro
    registroButton.disabled = true;
    registroButton.textContent = "Registrando...";

    try {
        let endpoint = "";
        let body = {};

        if (rolSeleccionado === "estudiante") {
            // Registro de estudiante
            endpoint = `${API_URL}/estudiantes/registro`;
            body = {
                nombre,
                email,
                password,
                esSecundaria: true
            };
        } else {
            // Registro de profesor
            endpoint = `${API_URL}/profesores/registro`;
            body = {
                nombre,
                email,
                password
            };
        }

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || "Error al registrar.");
        }

        registroMessage.textContent = "✅ ¡Registro exitoso! Redirigiendo al login...";
        registroMessage.style.color = "#2ca66f";

        // Limpiar formulario
        registroForm.reset();

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);

    } catch (error) {
        console.error("Error:", error);
        registroMessage.textContent = "❌ " + error.message;
        registroMessage.style.color = "#d9366f";

        // Habilitar botón nuevamente
        registroButton.disabled = false;
        registroButton.textContent = "Registrarse →";
    }
});

