const API_URL = "http://localhost:5019/api";

// ==========================================
// ESTADO DEL JUEGO
// ==========================================

let historiaData = null;
let estudianteActual = null;
let escenaActual = null;
let puntosTotales = 0;
let historiaIdActual = null;
let misionIdActual = null;
let progreso = {
    estudianteId: null,
    historiaId: null,
    escenaActualId: null,
    completada: false,
    puntosObtenidos: 0
};

// ==========================================
// MÓDULO DE ANIMACIONES DEL JUEGO
// ==========================================

const GameAnimations = {
    // Efecto Ripple en botones
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

    // Animación de puntos
    animatePoints(puntos) {
        const badge = document.getElementById("puntosInfo");
        if (!badge) return;
        const oldText = badge.textContent;
        badge.textContent = `⭐ ${puntos} puntos`;
        badge.style.transform = 'scale(1.2)';
        badge.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        setTimeout(() => { 
            badge.style.transform = 'scale(1)'; 
        }, 300);
    },

    // Animación de la barra de progreso
    animateProgress(porcentaje) {
        const fill = document.getElementById("progresoFill");
        if (!fill) return;
        fill.style.width = '0%';
        setTimeout(() => {
            fill.style.width = `${porcentaje}%`;
        }, 150);
    },

    // Animación del resultado final
    animateResultado(icono) {
        const icon = document.getElementById("resultadoIcono");
        if (!icon) return;
        icon.textContent = icono;
        icon.style.transform = 'scale(0) rotate(-30deg)';
        icon.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        setTimeout(() => {
            icon.style.transform = 'scale(1) rotate(0)';
        }, 50);
    },

    // Transición de escena
    transitionScene(element) {
        if (!element) return;
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 50);
    },

    // Confeti o celebración (efecto visual)
    showCelebration() {
        const container = document.getElementById("resultadoContainer");
        if (!container) return;
        // Crear partículas de celebración
        const emojis = ['🎉', '⭐', '🏆', '🌟', '✨'];
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('span');
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            particle.style.cssText = `
                position: fixed;
                font-size: ${20 + Math.random() * 30}px;
                left: ${Math.random() * 100}%;
                top: ${-10 + Math.random() * 20}%;
                animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
                animation-delay: ${Math.random() * 0.5}s;
                pointer-events: none;
                z-index: 9999;
            `;
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 5000);
        }
    }
};

// Añadir keyframes de confeti al documento
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
`;
document.head.appendChild(styleSheet);

// ==========================================
// INICIALIZACIÓN
// ==========================================

async function inicializar() {
    const estudianteData = localStorage.getItem("estudiante");
    if (!estudianteData) {
        alert("Debes iniciar sesión primero.");
        window.location.href = "login.html";
        return;
    }
    try {
        estudianteActual = JSON.parse(estudianteData);
        progreso.estudianteId = estudianteActual.id;
    } catch (error) {
        console.error("Error al parsear datos del estudiante:", error);
        window.location.href = "login.html";
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    historiaIdActual = parseInt(urlParams.get('historiaId'));
    misionIdActual = parseInt(urlParams.get('misionId'));

    if (!historiaIdActual) {
        alert("No se especificó una historia.");
        window.location.href = "dashboardEstudiantes.html";
        return;
    }

    // Configurar botón volver
    const btnVolver = document.getElementById("btnVolver");
    if (btnVolver && misionIdActual) {
        btnVolver.href = `mision-detalle.html?misionId=${misionIdActual}`;
    }

    // Actualizar nombre de la historia
    await cargarHistoria(historiaIdActual);
}

// ==========================================
// CARGAR HISTORIA
// ==========================================

async function cargarHistoria(historiaId) {
    try {
        const response = await fetch(`${API_URL}/historias/${historiaId}/jugar`);
        if (!response.ok) {
            throw new Error("Error al cargar la historia.");
        }
        historiaData = await response.json();
        document.getElementById("historiaTitulo").textContent = historiaData.titulo;

        // Verificar si ya estaba completada
        const yaCompletada = await cargarProgresoExistente(historiaId);
        if (yaCompletada) {
            mostrarResultadoFinal(true);
            return;
        }

        if (historiaData.escenas && historiaData.escenas.length > 0) {
            mostrarEscena(historiaData.escenas[0]);
        } else {
            throw new Error("La historia no tiene escenas.");
        }
    } catch (error) {
        console.error("Error cargando historia:", error);
        document.getElementById("escenaTexto").textContent = "❌ No se pudo cargar la historia.";
    }
}

// ==========================================
// CARGAR PROGRESO EXISTENTE
// ==========================================

async function cargarProgresoExistente(historiaId) {
    try {
        const response = await fetch(
            `${API_URL}/historias/progreso/${estudianteActual.id}/${historiaId}`
        );
        if (response.ok) {
            const data = await response.json();
            if (data.completada) {
                puntosTotales = data.puntosObtenidos || 0;
                return true;
            }
            if (data.escenaActualId) {
                // Continuar desde donde quedó
                const escena = historiaData.escenas.find(e => e.id === data.escenaActualId);
                if (escena) {
                    puntosTotales = data.puntosObtenidos || 0;
                    mostrarEscena(escena);
                    return true;
                }
            }
        }
    } catch (error) {
        console.error("Error cargando progreso:", error);
    }
    return false;
}

// ==========================================
// GUARDAR PROGRESO
// ==========================================

async function guardarProgreso() {
    try {
        await fetch(`${API_URL}/historias/progreso`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                estudianteId: progreso.estudianteId,
                historiaId: historiaData?.id,
                escenaActualId: progreso.escenaActualId,
                completada: progreso.completada,
                puntosObtenidos: progreso.puntosObtenidos
            })
        });
    } catch (error) {
        console.error("Error al guardar progreso:", error);
    }
}

// ==========================================
// MOSTRAR ESCENA CON ANIMACIÓN
// ==========================================

function mostrarEscena(escena) {
    escenaActual = escena;
    progreso.escenaActualId = escena.id;

    const textElement = document.getElementById("escenaTexto");
    textElement.textContent = escena.contenido;
    GameAnimations.transitionScene(textElement);

    // Actualizar barra de progreso
    const totalEscenas = historiaData.escenas.length;
    const indiceActual = historiaData.escenas.findIndex(e => e.id === escena.id);
    const progresoPorcentaje = ((indiceActual + 1) / totalEscenas) * 100;
    GameAnimations.animateProgress(progresoPorcentaje);

    // Ocultar elementos previos
    document.getElementById("preguntaContainer").style.display = "none";
    document.getElementById("feedbackContainer").style.display = "none";
    document.getElementById("resultadoContainer").style.display = "none";

    const decisionesContainer = document.getElementById("decisionesContainer");
    decisionesContainer.innerHTML = "";

    // Si es final y tiene pregunta
    if (escena.esFinal && escena.tienePregunta && escena.pregunta) {
        mostrarPregunta(escena.pregunta);
        decisionesContainer.innerHTML = `
            <p style="color: var(--text-light); padding: 16px; text-align: center; 
                      background: var(--blue-soft); border-radius: 12px;">
                📝 Responde la pregunta para completar la historia.
            </p>
        `;
        guardarProgreso();
        return;
    }

    // Mostrar decisiones
    if (escena.decisiones && escena.decisiones.length > 0) {
        const letras = ['A', 'B', 'C', 'D'];
        escena.decisiones.forEach((decision, index) => {
            const btn = document.createElement("button");
            btn.className = "btn-decision";
            btn.innerHTML = `<strong>${letras[index] || ''}.</strong> ${decision.texto}`;
            btn.dataset.decisionId = decision.id;
            btn.addEventListener('click', (e) => {
                GameAnimations.createRipple(e, btn);
                tomarDecision(decision.id);
            });
            decisionesContainer.appendChild(btn);
        });
    } else {
        decisionesContainer.innerHTML = `<p style="color: var(--text-light);">No hay decisiones disponibles.</p>`;
    }

    guardarProgreso();
}

// ==========================================
// TOMAR DECISIÓN CON ANIMACIÓN
// ==========================================

async function tomarDecision(decisionId) {
    const escena = escenaActual;
    const decision = escena.decisiones.find(d => d.id === decisionId);
    if (!decision) return;

    // Deshabilitar botones
    const botones = document.querySelectorAll('.btn-decision');
    botones.forEach(btn => btn.disabled = true);

    // Marcar respuestas
    botones.forEach(btn => {
        const id = parseInt(btn.dataset.decisionId);
        const dec = escena.decisiones.find(d => d.id === id);
        if (dec) {
            if (dec.id === decisionId) {
                btn.classList.add(dec.esCorrecta ? 'correcta' : 'incorrecta');
                if (dec.esCorrecta) {
                    btn.style.transform = 'scale(1.05)';
                    setTimeout(() => { btn.style.transform = 'scale(1)'; }, 300);
                }
            } else if (dec.esCorrecta) {
                btn.classList.add('correcta');
            }
        }
    });

    // Sumar puntos
    puntosTotales += decision.puntos;
    GameAnimations.animatePoints(puntosTotales);

    // Mostrar feedback
    const feedbackContainer = document.getElementById("feedbackContainer");
    feedbackContainer.style.display = "block";
    GameAnimations.transitionScene(feedbackContainer);
    
    const feedbackMensaje = document.getElementById("feedbackMensaje");
    feedbackMensaje.textContent = decision.retroalimentacion || "¡Bien hecho!";
    feedbackMensaje.className = `feedback-mensaje ${decision.esCorrecta ? 'exito' : 'error'}`;

    // Botón continuar
    const btnContinuar = document.getElementById("btnContinuar");
    btnContinuar.style.display = "block";

    if (decision.siguienteEscenaId) {
        const siguienteEscena = historiaData.escenas.find(e => e.id === decision.siguienteEscenaId);
        if (siguienteEscena) {
            btnContinuar.textContent = "Continuar →";
            btnContinuar.onclick = () => {
                mostrarEscena(siguienteEscena);
                feedbackContainer.style.display = "none";
                btnContinuar.style.display = "none";
            };
        } else {
            btnContinuar.textContent = "Ver resultado 🏆";
            btnContinuar.onclick = () => mostrarResultadoFinal();
        }
    } else {
        btnContinuar.textContent = "Ver resultado 🏆";
        btnContinuar.onclick = () => mostrarResultadoFinal();
    }

    await guardarProgreso();
}

// ==========================================
// MOSTRAR PREGUNTA
// ==========================================

function mostrarPregunta(pregunta) {
    const container = document.getElementById("preguntaContainer");
    container.style.display = "block";
    GameAnimations.transitionScene(container);

    document.getElementById("preguntaEnunciado").textContent = pregunta.enunciado;

    const respuestasContainer = document.getElementById("respuestasContainer");
    respuestasContainer.innerHTML = "";

    const letras = ['A', 'B', 'C', 'D'];
    pregunta.respuestas.forEach((respuesta, index) => {
        const btn = document.createElement("button");
        btn.className = "btn-respuesta";
        btn.innerHTML = `<strong>${letras[index] || ''}.</strong> ${respuesta.texto}`;
        btn.dataset.respuestaId = respuesta.id;
        btn.addEventListener('click', (e) => {
            GameAnimations.createRipple(e, btn);
            seleccionarRespuesta(respuesta.id);
        });
        respuestasContainer.appendChild(btn);
    });

    document.getElementById("feedbackContainer").style.display = "none";
    document.getElementById("resultadoContainer").style.display = "none";
}

// ==========================================
// SELECCIONAR RESPUESTA
// ==========================================

function seleccionarRespuesta(respuestaId) {
    const escena = escenaActual;
    const pregunta = escena.pregunta;
    const respuesta = pregunta.respuestas.find(r => r.id === respuestaId);
    if (!respuesta) return;

    const botones = document.querySelectorAll('.btn-respuesta');
    botones.forEach(btn => btn.disabled = true);

    botones.forEach(btn => {
        const id = parseInt(btn.dataset.respuestaId);
        const res = pregunta.respuestas.find(r => r.id === id);
        if (res) {
            if (res.id === respuestaId) {
                btn.classList.add(res.esCorrecta ? 'correcta' : 'incorrecta');
                if (res.esCorrecta) {
                    btn.style.transform = 'scale(1.05)';
                    setTimeout(() => { btn.style.transform = 'scale(1)'; }, 300);
                }
            } else if (res.esCorrecta) {
                btn.classList.add('correcta');
            }
        }
    });

    if (respuesta.esCorrecta) {
        puntosTotales += pregunta.puntos;
        GameAnimations.animatePoints(puntosTotales);
    }

    const feedbackContainer = document.getElementById("feedbackContainer");
    feedbackContainer.style.display = "block";
    GameAnimations.transitionScene(feedbackContainer);
    
    const feedbackMensaje = document.getElementById("feedbackMensaje");
    feedbackMensaje.textContent = pregunta.explicacion || 
        (respuesta.esCorrecta ? "✅ ¡Correcto! Excelente respuesta." : "❌ Incorrecto. Sigue aprendiendo.");
    feedbackMensaje.className = `feedback-mensaje ${respuesta.esCorrecta ? 'exito' : 'error'}`;

    const btnContinuar = document.getElementById("btnContinuar");
    btnContinuar.style.display = "block";
    btnContinuar.textContent = "Ver resultado 🏆";
    btnContinuar.onclick = () => mostrarResultadoFinal();

    guardarProgreso();
}

// ==========================================
// MOSTRAR RESULTADO FINAL CON CELEBRACIÓN
// ==========================================

function mostrarResultadoFinal(yaCompletada = false) {
    progreso.completada = true;
    progreso.puntosObtenidos = puntosTotales;
    guardarProgreso();

    localStorage.setItem("estadisticas_actualizadas", "false");

    document.getElementById("decisionesContainer").innerHTML = "";
    document.getElementById("preguntaContainer").style.display = "none";
    document.getElementById("feedbackContainer").style.display = "none";

    // Determinar mensaje según puntos
    let mensaje = "";
    let icono = "";

    if (puntosTotales >= 20) {
        mensaje = "¡Excelente trabajo! Has demostrado un gran entendimiento sobre igualdad y respeto. 🌟";
        icono = "🏆";
    } else if (puntosTotales >= 10) {
        mensaje = "¡Buen trabajo! Sigue aprendiendo sobre la importancia de la igualdad. 💪";
        icono = "⭐";
    } else {
        mensaje = "Sigue practicando. Cada paso cuenta para construir una sociedad más igualitaria. 🌱";
        icono = "🌱";
    }

    const container = document.getElementById("resultadoContainer");
    container.style.display = "block";
    GameAnimations.transitionScene(container);
    GameAnimations.animateResultado(icono);

    const mensajeCompletada = yaCompletada 
        ? "✅ Ya habías completado esta historia. ¡Buen trabajo!" 
        : "🎉 ¡Historia completada!";

    document.getElementById("resultadoTitulo").textContent = mensajeCompletada;
    document.getElementById("resultadoPuntos").textContent = `⭐ ${puntosTotales} puntos`;
    document.getElementById("resultadoMensaje").textContent = mensaje;

    GameAnimations.animateProgress(100);

    // Celebrar si es la primera vez
    if (!yaCompletada && puntosTotales >= 10) {
        GameAnimations.showCelebration();
    }

    // Verificar progreso de la misión
    verificarProgresoMision();
}

// ==========================================
// VERIFICAR PROGRESO DE MISIÓN
// ==========================================

async function verificarProgresoMision() {
    if (!misionIdActual) return;

    try {
        const response = await fetch(
            `${API_URL}/historias/mision/${misionIdActual}/progreso/${estudianteActual.id}`
        );
        if (response.ok) {
            const data = await response.json();
            const faltantes = data.totalHistorias - data.historiasCompletadas;
            
            if (data.completada) {
                const mensaje = document.getElementById("resultadoMensaje");
                mensaje.textContent = "🏆 ¡Felicidades! Has completado todas las historias de esta misión.";
                await desbloquearInsignia(misionIdActual);
            } else {
                const btnSiguiente = document.getElementById("btnSiguienteHistoria");
                if (btnSiguiente) {
                    btnSiguiente.style.display = "block";
                    btnSiguiente.textContent = `Siguiente historia → (${faltantes} restantes)`;
                    btnSiguiente.onclick = irSiguienteHistoria;
                }
            }
        }
    } catch (error) {
        console.error("Error verificando progreso de misión:", error);
    }
}

// ==========================================
// IR A SIGUIENTE HISTORIA
// ==========================================

async function irSiguienteHistoria() {
    try {
        const response = await fetch(
            `${API_URL}/historias/mision/${misionIdActual}/siguiente/${estudianteActual.id}`
        );
        if (response.ok) {
            const data = await response.json();
            if (data.completada) {
                alert("🎉 ¡Misión completada! Has terminado todas las historias.");
                window.location.href = "dashboardEstudiantes.html";
            } else {
                window.location.href = `jugar-historia.html?historiaId=${data.historiaId}&misionId=${misionIdActual}`;
            }
        }
    } catch (error) {
        console.error("Error al obtener siguiente historia:", error);
    }
}

// ==========================================
// DESBLOQUEAR INSIGNIA
// ==========================================

async function desbloquearInsignia(misionId) {
    try {
        const response = await fetch(`${API_URL}/insignias/desbloquear`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                estudianteId: estudianteActual.id,
                misionId: misionId
            })
        });
        if (response.ok) {
            const data = await response.json();
            mostrarNotificacionInsignia(data.nombre);
        }
    } catch (error) {
        console.error("Error al desbloquear insignia:", error);
    }
}

function mostrarNotificacionInsignia(nombre) {
    const container = document.getElementById("resultadoContainer");
    const insigniaHtml = `
        <div class="insignia-desbloqueada" style="
            margin: 16px 0;
            padding: 20px;
            background: linear-gradient(135deg, var(--gold), #d4890a);
            border-radius: 16px;
            color: white;
            animation: fadeInUp 0.5s ease;
        ">
            <h3 style="font-size: 22px;">🏆 ¡Nueva insignia desbloqueada!</h3>
            <p style="font-size: 18px; margin-top: 4px;"><strong>${nombre}</strong></p>
            <p style="font-size: 14px; opacity: 0.9;">Has completado todas las historias de esta misión.</p>
        </div>
    `;
    const btnVolver = container.querySelector(".resultado-actions");
    if (btnVolver) {
        btnVolver.insertAdjacentHTML('beforebegin', insigniaHtml);
    }
}

// ==========================================
// VOLVER
// ==========================================

function volverAMision() {
    localStorage.setItem("estadisticas_actualizadas", "false");
    if (misionIdActual) {
        window.location.href = `mision-detalle.html?misionId=${misionIdActual}`;
    } else {
        window.location.href = "dashboardEstudiantes.html";
    }
}

// ==========================================
// INICIAR
// ==========================================

document.addEventListener("DOMContentLoaded", inicializar);