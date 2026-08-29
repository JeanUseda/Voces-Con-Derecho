const API_URL = "http://localhost:5019/api";

// ==========================================
// ELEMENTOS
// ==========================================

const registroForm = document.getElementById("registroForm");
const nombreInput = document.getElementById("nombre");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
const registroMessage = document.getElementById("registroMessage");
const registroButton = document.getElementById("registroButton");

const rolEstudianteRegistro = document.getElementById("rolEstudianteRegistro");
const rolProfesorRegistro = document.getElementById("rolProfesorRegistro");

let rolSeleccionado = "estudiante";

// ==========================================
// ANIMACIONES
// ==========================================

const Animations = {
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

    setLoading(isLoading) {
        if (!registroButton) return;
        if (isLoading) {
            registroButton.disabled = true;
            registroButton.innerHTML = `
                <span class="spinner"></span>
                Registrando...
            `;
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
            registroButton.disabled = false;
            registroButton.innerHTML = 'Registrarse <span>→</span>';
        }
    },

    showMessage(text, isSuccess = false) {
        if (!registroMessage) return;
        registroMessage.textContent = text;
        registroMessage.style.color = isSuccess ? 'var(--success)' : '#d9366f';
        registroMessage.style.opacity = '0';
        registroMessage.style.transform = 'translateY(-10px)';
        registroMessage.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        setTimeout(() => {
            registroMessage.style.opacity = '1';
            registroMessage.style.transform = 'translateY(0)';
        }, 50);
    }
};

// ==========================================
// SELECTOR DE ROL CON ANIMACIÓN
// ==========================================

function seleccionarRolRegistro(rol) {
    rolSeleccionado = rol;

    [rolEstudianteRegistro, rolProfesorRegistro].forEach(btn => {
        btn.classList.remove("active");
        btn.style.borderColor = "var(--border)";
        btn.style.background = "var(--white)";
        btn.style.color = "var(--text-light)";
        btn.style.transform = "scale(1)";
    });

    const selectedBtn = rol === "estudiante" ? rolEstudianteRegistro : rolProfesorRegistro;
    selectedBtn.classList.add("active");
    selectedBtn.style.borderColor = "var(--primary)";
    selectedBtn.style.background = "var(--purple-soft)";
    selectedBtn.style.color = "var(--primary)";
    selectedBtn.style.transform = "scale(1.02)";
}

rolEstudianteRegistro?.addEventListener("click", () => seleccionarRolRegistro("estudiante"));
rolProfesorRegistro?.addEventListener("click", () => seleccionarRolRegistro("profesor"));

// ==========================================
// MOSTRAR/OCULTAR CONTRASEÑA
// ==========================================

togglePassword?.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "Ocultar" : "Mostrar";
});

toggleConfirmPassword?.addEventListener("click", () => {
    const isPassword = confirmPasswordInput.type === "password";
    confirmPasswordInput.type = isPassword ? "text" : "password";
    toggleConfirmPassword.textContent = isPassword ? "Ocultar" : "Mostrar";
});

// ==========================================
// REGISTRO UNIFICADO
// ==========================================

registroForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validaciones
    if (!nombre || !email || !password || !confirmPassword) {
        Animations.showMessage("Completa todos los campos.", false);
        return;
    }

    if (nombre.length < 2) {
        Animations.showMessage("El nombre debe tener al menos 2 caracteres.", false);
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Animations.showMessage("Ingresa un correo electrónico válido.", false);
        return;
    }

    if (password !== confirmPassword) {
        Animations.showMessage("Las contraseñas no coinciden.", false);
        return;
    }

    if (password.length < 6) {
        Animations.showMessage("La contraseña debe tener al menos 6 caracteres.", false);
        return;
    }

    Animations.setLoading(true);

    try {
        let endpoint = "";
        let body = {};

        if (rolSeleccionado === "estudiante") {
            endpoint = `${API_URL}/estudiantes/registro`;
            body = {
                nombre,
                email,
                password,
                esSecundaria: true
            };
        } else {
            endpoint = `${API_URL}/profesores/registro`;
            body = {
                nombre,
                email,
                password
            };
        }

        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || "Error al registrar.");
        }

        Animations.showMessage("✅ ¡Registro exitoso! Redirigiendo al login...", true);

        // Limpiar formulario
        registroForm.reset();

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);

    } catch (error) {
        console.error("Error:", error);
        Animations.showMessage("❌ " + error.message, false);
        Animations.setLoading(false);
    }
});

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

// ==========================================
// VERIFICAR SESIÓN ACTIVA
// ==========================================

const estudianteActivo = localStorage.getItem("estudiante");
const profesorActivo = localStorage.getItem("profesor");

if (estudianteActivo) {
    window.location.href = "dashboardEstudiantes.html";
} else if (profesorActivo) {
    window.location.href = "dashboard.html";
}