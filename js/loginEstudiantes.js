const API_URL = "http://localhost:5019/api";

const loginForm = document.getElementById("loginEstudianteForm");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginMessage = document.getElementById("loginMessage");

// Mostrar/ocultar contraseña
togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "Ocultar" : "Mostrar";
});

// Login
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        loginMessage.textContent = "Completa todos los campos.";
        loginMessage.style.color = "#d9366f";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/estudiantes/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || "Credenciales incorrectas.");
        }

        // Guardar datos del estudiante en localStorage
        localStorage.setItem("estudiante", JSON.stringify(data));

        loginMessage.textContent = "✅ ¡Inicio de sesión exitoso!";
        loginMessage.style.color = "#2ca66f";

        // Redirigir al dashboard del estudiante
        setTimeout(() => {
            window.location.href = "dashboardEstudiantes.html";
        }, 1500);

    } catch (error) {
        console.error("Error:", error);
        loginMessage.textContent = "❌ " + error.message;
        loginMessage.style.color = "#d9366f";
    }
});