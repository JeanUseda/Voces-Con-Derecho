const API_URL = "http://localhost:5019/api";

// Elementos
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginMessage = document.getElementById("loginMessage");
const loginButton = document.getElementById("loginButton");

// ==========================================
// MOSTRAR/OCULTAR CONTRASEÑA
// ==========================================

togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "Ocultar" : "Mostrar";
});

// ==========================================
// LOGIN UNIFICADO CON ROLES
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
        // Intentar login como profesor/admin
        const response = await fetch(`${API_URL}/profesores/login`, {
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

        // ✅ DETECTAR ROL
        let rol = data.rol || "profesor";
        
        // Si el email tiene @Secre.com, es admin
        if (email.includes("@Secre.com")) {
            rol = "admin";
        }

        console.log(`✅ Login exitoso: ${data.nombre} (${rol})`);

        // Guardar en localStorage unificado
        const usuarioData = {
            id: data.id,
            nombre: data.nombre,
            apellido: data.apellido || "",
            email: data.email,
            rol: rol,
            totalClases: data.totalClases || 0,
            totalEstudiantes: data.totalEstudiantes || 0,
            totalMisiones: data.totalMisiones || 0
        };

        localStorage.setItem("usuario", JSON.stringify(usuarioData));

        // Compatibilidad con versiones anteriores
        if (rol === "admin" || rol === "profesor") {
            localStorage.setItem("profesor", JSON.stringify(usuarioData));
        } else {
            localStorage.setItem("estudiante", JSON.stringify(usuarioData));
        }

        loginMessage.textContent = "✅ ¡Bienvenido!";
        loginMessage.style.color = "#2ca66f";

        // ✅ REDIRIGIR SEGÚN ROL
        setTimeout(() => {
            if (rol === "admin") {
                window.location.href = "admin.html";
            } else if (rol === "profesor") {
                window.location.href = "dashboard.html";
            } else {
                window.location.href = "dashboardEstudiantes.html";
            }
        }, 1500);

    } catch (error) {
        console.error("Error:", error);

        // Si falló como profesor, intentar como estudiante
        try {
            const estudianteResponse = await fetch(`${API_URL}/estudiantes/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const estudianteData = await estudianteResponse.json();

            if (!estudianteResponse.ok) {
                throw new Error(estudianteData.mensaje || "Credenciales incorrectas.");
            }

            const usuarioData = {
                id: estudianteData.id,
                nombre: estudianteData.nombre,
                apellido: estudianteData.apellido || "",
                email: estudianteData.email,
                rol: "estudiante"
            };

            localStorage.setItem("usuario", JSON.stringify(usuarioData));
            localStorage.setItem("estudiante", JSON.stringify(usuarioData));

            loginMessage.textContent = "✅ ¡Bienvenido!";
            loginMessage.style.color = "#2ca66f";

            setTimeout(() => {
                window.location.href = "dashboardEstudiantes.html";
            }, 1500);

        } catch (estudianteError) {
            loginMessage.textContent = "❌ " + estudianteError.message;
            loginMessage.style.color = "#d9366f";
            loginButton.disabled = false;
            loginButton.textContent = "Iniciar sesión →";
        }
    }
});

// ==========================================
// VERIFICAR SESIÓN ACTIVA (evita redirigir al login)
// ==========================================

const usuarioActual = localStorage.getItem("usuario");

// ==========================================
// VERIFICAR SESIÓN ACTIVA (solo en login.html)
// ==========================================

// ✅ Solo ejecutar si estamos en login.html
if (window.location.pathname.includes("login.html")) {
    const usuarioActual = localStorage.getItem("usuario");
    
    if (usuarioActual) {
        try {
            const usuario = JSON.parse(usuarioActual);
            // ✅ Esperar 500ms para evitar bucle
            setTimeout(() => {
                if (usuario.rol === "admin") {
                    window.location.href = "admin.html";
                } else if (usuario.rol === "profesor") {
                    window.location.href = "dashboard.html";
                } else {
                    window.location.href = "dashboardEstudiantes.html";
                }
            }, 500);
        } catch (error) {
            console.error("Error al parsear usuario:", error);
        }
    }
}