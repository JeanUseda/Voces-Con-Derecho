const API_URL = "http://localhost:5019/api";

// ==========================================
// ELEMENTOS
// ==========================================

const loginForm = document.getElementById("loginEstudianteForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginMessage = document.getElementById("loginMessage");
const loginButton = document.querySelector(".login-button");

// ==========================================
// ANIMACIONES
// ==========================================

const Animations = {
    // Efecto Ripple en el botón
    createRipple(event, element) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.className = 'ripple';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            transform: scale(0);
            animation: ripple-anim 0.6s ease-out forwards;
            pointer-events: none;
        `;
        
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    },

    // Animación de carga del botón
    setLoading(isLoading) {
        if (!loginButton) return;
        if (isLoading) {
            loginButton.disabled = true;
            loginButton.innerHTML = `
                <span class="spinner"></span>
                Iniciando sesión...
            `;
            // Añadir spinner CSS
            const style = document.createElement('style');
            style.textContent = `
                .spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        } else {
            loginButton.disabled = false;
            loginButton.innerHTML = 'Iniciar sesión <span>→</span>';
        }
    },

    // Mostrar mensaje con animación
    showMessage(text, isSuccess = false) {
        if (!loginMessage) return;
        loginMessage.textContent = text;
        loginMessage.style.color = isSuccess ? 'var(--success)' : '#d9366f';
        loginMessage.style.opacity = '0';
        loginMessage.style.transform = 'translateY(-10px)';
        loginMessage.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        setTimeout(() => {
            loginMessage.style.opacity = '1';
            loginMessage.style.transform = 'translateY(0)';
        }, 50);
    }
};

// ==========================================
// MOSTRAR/OCULTAR CONTRASEÑA
// ==========================================

togglePassword?.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "Ocultar" : "Mostrar";
});

// ==========================================
// LOGIN
// ==========================================

loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        Animations.showMessage("Completa todos los campos.", false);
        return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Animations.showMessage("Ingresa un correo electrónico válido.", false);
        return;
    }

    Animations.setLoading(true);

    try {
        const response = await fetch(`${API_URL}/estudiantes/login`, {
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
        Animations.showMessage("✅ ¡Inicio de sesión exitoso!", true);

        // Redirigir después de un momento
        setTimeout(() => {
            window.location.href = "dashboardEstudiantes.html";
        }, 1500);

    } catch (error) {
        console.error("Error:", error);
        Animations.showMessage("❌ " + error.message, false);
        Animations.setLoading(false);
    }
});

// ==========================================
// VERIFICAR SESIÓN ACTIVA
// ==========================================

const estudianteActivo = localStorage.getItem("estudiante");
if (estudianteActivo) {
    window.location.href = "dashboardEstudiantes.html";
}

// ==========================================
// EFECTO GLOW EN INPUTS AL FOCUS
// ==========================================

document.querySelectorAll('.form-group input').forEach(input => {
    input.addEventListener('focus', function() {
        this.closest('.form-group')?.querySelector('label')?.style?.setProperty('color', 'var(--primary)');
    });
    input.addEventListener('blur', function() {
        this.closest('.form-group')?.querySelector('label')?.style?.setProperty('color', 'var(--text)');
    });
});