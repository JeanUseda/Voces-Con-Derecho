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

    // Obtener ID de la historia desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    historiaIdActual = parseInt(urlParams.get('historiaId'));
    misionIdActual = parseInt(urlParams.get('misionId'));

    if (!historiaIdActual) {
        alert("No se especificó una historia.");
        window.location.href = "dashboardEstudiantes.html";
        return;
    }

    // ✅ ELIMINADO: No usar misionInfo porque no existe en el HTML
    // if (misionIdActual) {
    //     document.getElementById("misionInfo").textContent = 
    //         `Misión: ${await getMisionNombre(misionIdActual)}`;
    // }

    await cargarHistoria(historiaIdActual);
}

// ==========================================
// OBTENER NOMBRE DE MISIÓN
// ==========================================

async function getMisionNombre(misionId) {
    try {
        const response = await fetch(`${API_URL}/misiones/${misionId}`);
        if (response.ok) {
            const data = await response.json();
            return data.titulo;
        }
    } catch (error) {
        console.error("Error al obtener nombre de misión:", error);
    }
    return "Misión";
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
        console.log("📖 Historia cargada:", historiaData);
        console.log("📝 Escenas:", historiaData.escenas);
        
        // ✅ Verificar si alguna escena tiene pregunta
        historiaData.escenas.forEach((e, i) => {
            if (e.pregunta) {
                console.log(`✅ Escena ${i+1} tiene pregunta:`, e.pregunta);
            }
        });

        document.getElementById("historiaTitulo").textContent = historiaData.titulo;

        await cargarProgresoExistente(historiaId);

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
                // Si ya estaba completada, mostrar mensaje
                mostrarResultadoFinal(true);
                return true;
            }
            if (data.escenaActualId) {
                // Cargar la escena donde quedó
                // (Implementar si se quiere continuar desde donde quedó)
            }
        }
    } catch (error) {
        console.error("Error cargando progreso:", error);
    }
    return false;
}

// ==========================================
// GUARDAR PROGRESO - ACTUALIZADO
// ==========================================

async function guardarProgreso() {
    try {
        const response = await fetch(`${API_URL}/historias/progreso`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                estudianteId: progreso.estudianteId,
                historiaId: historiaData?.id,
                escenaActualId: progreso.escenaActualId,
                completada: progreso.completada,
                puntosObtenidos: progreso.puntosObtenidos
            })
        });

        if (!response.ok) {
            console.error("Error al guardar progreso:", await response.text());
        } else {
            console.log("✅ Progreso guardado correctamente");
        }

    } catch (error) {
        console.error("Error al guardar progreso:", error);
    }
}

// ==========================================
// MOSTRAR RESULTADO FINAL
// ==========================================

function mostrarResultadoFinal(yaCompletada = false) {
    // Marcar como completada
    progreso.completada = true;
    progreso.puntosObtenidos = puntosTotales;

    // Guardar progreso
    guardarProgreso();

    // Esto hará que al volver al dashboard se refresquen los datos
    localStorage.setItem("estadisticas_actualizadas", "false");

    // Ocultar todo
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

    // Mostrar resultado
    const container = document.getElementById("resultadoContainer");
    container.style.display = "block";

    const mensajeCompletada = yaCompletada 
        ? "✅ Ya habías completado esta historia. ¡Buen trabajo!" 
        : "🎉 ¡Historia completada!";

    container.innerHTML = `
        <div class="escena-card resultado-final">
            <div class="icono">${icono}</div>
            <h2>${mensajeCompletada}</h2>
            <div class="puntos-finales">⭐ ${puntosTotales} puntos</div>
            <p class="mensaje">${mensaje}</p>
            <div style="margin-top: 24px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <button class="btn-siguiente" style="width: auto; padding: 12px 32px; background: var(--primary);" onclick="volverAMision()">
                    ← Volver a la misión
                </button>
                <button class="btn-siguiente" style="width: auto; padding: 12px 32px; background: var(--success);" onclick="window.location.reload()">
                    🔄 Reintentar
                </button>
            </div>
        </div>
    `;

    // Actualizar barra de progreso al 100%
    document.getElementById("progresoFill").style.width = "100%";
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
            
            // Mostrar cuántas historias faltan
            const faltantes = data.totalHistorias - data.historiasCompletadas;
            const mensajeHistorias = document.getElementById("resultadoMensaje");
            
            if (data.completada) {
                mensajeHistorias.textContent = "🏆 ¡Felicidades! Has completado todas las historias de esta misión.";
                // Desbloquear insignia
                await desbloquearInsignia(misionIdActual);
            } else {
                mensajeHistorias.textContent = `📚 Has completado ${data.historiasCompletadas} de ${data.totalHistorias} historias. Te faltan ${faltantes} por completar.`;
                // Mostrar botón para siguiente historia
                const btnSiguiente = document.getElementById("btnSiguienteHistoria");
                if (btnSiguiente) {
                    btnSiguiente.style.display = "block";
                    btnSiguiente.textContent = `Siguiente historia → (${faltantes} restantes)`;
                    btnSiguiente.onclick = () => irSiguienteHistoria();
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
                // Redirigir a la siguiente historia
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
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                estudianteId: estudianteActual.id,
                misionId: misionId
            })
        });

        if (response.ok) {
            const data = await response.json();
            // Mostrar notificación de insignia desbloqueada
            mostrarNotificacionInsignia(data.nombre);
        }
    } catch (error) {
        console.error("Error al desbloquear insignia:", error);
    }
}

// ==========================================
// NOTIFICACIÓN DE INSIGNIA
// ==========================================

function mostrarNotificacionInsignia(nombre) {
    const container = document.getElementById("resultadoContainer");
    const insigniaHtml = `
        <div class="insignia-desbloqueada">
            <div class="insignia-icon">🏆</div>
            <h3>¡Nueva insignia desbloqueada!</h3>
            <p><strong>${nombre}</strong></p>
            <p style="font-size: 14px; color: var(--text-light);">Has completado todas las historias de esta misión.</p>
        </div>
    `;
    // Insertar antes del botón de volver
    const btnVolver = container.querySelector(".btn-primario");
    if (btnVolver) {
        btnVolver.insertAdjacentHTML('beforebegin', insigniaHtml);
    }
}

// ==========================================
// MOSTRAR ESCENA - CORREGIDO
// ==========================================

function mostrarEscena(escena) {
    escenaActual = escena;
    progreso.escenaActualId = escena.id;

    // Actualizar texto
    document.getElementById("escenaTexto").textContent = escena.contenido;

    // Actualizar progreso
    const totalEscenas = historiaData.escenas.length;
    const indiceActual = historiaData.escenas.findIndex(e => e.id === escena.id);
    const progresoPorcentaje = ((indiceActual + 1) / totalEscenas) * 100;
    document.getElementById("progresoFill").style.width = `${progresoPorcentaje}%`;

    // Ocultar pregunta y feedback
    document.getElementById("preguntaContainer").style.display = "none";
    document.getElementById("feedbackContainer").style.display = "none";
    document.getElementById("resultadoContainer").style.display = "none";

    const decisionesContainer = document.getElementById("decisionesContainer");
    decisionesContainer.innerHTML = "";

    // ✅ VERIFICAR: Si es final y tiene pregunta, mostrar la pregunta directamente
    if (escena.esFinal && escena.tienePregunta && escena.pregunta) {
        console.log("🎯 Escena final con pregunta detectada:", escena.pregunta);
        
        // Mostrar la pregunta
        mostrarPregunta(escena.pregunta);
        
        // Mensaje para el estudiante
        decisionesContainer.innerHTML = `<p style="color: var(--text-light); padding: 16px; text-align: center; background: var(--blue-soft); border-radius: 8px;">
            📝 Responde la pregunta para completar la historia.
        </p>`;
        
        guardarProgreso();
        return;
    }

    // Si no es final, mostrar decisiones normalmente
    if (escena.decisiones && escena.decisiones.length > 0) {
        const letras = ['A', 'B', 'C', 'D'];
        escena.decisiones.forEach((decision, index) => {
            const btn = document.createElement("button");
            btn.className = "btn-decision";
            btn.innerHTML = `<strong>${letras[index] || ''}.</strong> ${decision.texto}`;
            btn.dataset.decisionId = decision.id;
            btn.onclick = () => tomarDecision(decision.id);
            decisionesContainer.appendChild(btn);
        });
    } else {
        decisionesContainer.innerHTML = "<p style='color: var(--text-light);'>No hay decisiones disponibles.</p>";
    }

    guardarProgreso();
}
// ==========================================
// TOMAR DECISIÓN 
// ==========================================

async function tomarDecision(decisionId) {
    const escena = escenaActual;
    const decision = escena.decisiones.find(d => d.id === decisionId);
    
    if (!decision) return;

    // Deshabilitar todos los botones
    const botones = document.querySelectorAll('.btn-decision');
    botones.forEach(btn => btn.disabled = true);

    // Marcar correcta/incorrecta
    botones.forEach(btn => {
        const id = parseInt(btn.dataset.decisionId);
        const dec = escena.decisiones.find(d => d.id === id);
        if (dec) {
            if (dec.id === decisionId) {
                btn.classList.add(dec.esCorrecta ? 'correcta' : 'incorrecta');
            } else if (dec.esCorrecta) {
                btn.classList.add('correcta');
            }
        }
    });

    // Sumar puntos
    puntosTotales += decision.puntos;
    document.getElementById("puntosInfo").textContent = `⭐ ${puntosTotales} puntos`;

    // Mostrar feedback
    const feedbackContainer = document.getElementById("feedbackContainer");
    feedbackContainer.style.display = "block";
    const feedbackMensaje = document.getElementById("feedbackMensaje");
    feedbackMensaje.textContent = decision.retroalimentacion || "¡Bien hecho!";
    feedbackMensaje.className = `feedback-mensaje ${decision.esCorrecta ? 'exito' : 'error'}`;

    // Mostrar botón continuar
    const btnContinuar = document.getElementById("btnContinuar");
    btnContinuar.style.display = "block";

    // ✅ CORRECCIÓN: Verificar si tiene siguiente escena
    console.log("SiguienteEscenaId:", decision.siguienteEscenaId);
    
    if (decision.siguienteEscenaId) {
        // Buscar la siguiente escena
        const siguienteEscena = historiaData.escenas.find(e => e.id === decision.siguienteEscenaId);
        
        if (siguienteEscena) {
            btnContinuar.textContent = "Continuar →";
            btnContinuar.onclick = () => {
                mostrarEscena(siguienteEscena);
                // Limpiar feedback después de cambiar de escena
                feedbackContainer.style.display = "none";
                btnContinuar.style.display = "none";
            };
        } else {
            // Si no se encuentra la escena, mostrar resultado
            console.warn("No se encontró la siguiente escena:", decision.siguienteEscenaId);
            btnContinuar.textContent = "Ver resultado 🏆";
            btnContinuar.onclick = () => mostrarResultadoFinal();
        }
    } else {
        // Si no tiene siguiente escena, mostrar resultado
        btnContinuar.textContent = "Ver resultado 🏆";
        btnContinuar.onclick = () => mostrarResultadoFinal();
    }

    // Guardar progreso
    await guardarProgreso();
}

// ==========================================
// MOSTRAR PREGUNTA - CORREGIDO
// ==========================================

function mostrarPregunta(pregunta) {
    console.log("📝 Mostrando pregunta:", pregunta);
    
    const container = document.getElementById("preguntaContainer");
    container.style.display = "block";

    document.getElementById("preguntaEnunciado").textContent = pregunta.enunciado;

    const respuestasContainer = document.getElementById("respuestasContainer");
    respuestasContainer.innerHTML = "";

    const letras = ['A', 'B', 'C', 'D'];
    pregunta.respuestas.forEach((respuesta, index) => {
        const btn = document.createElement("button");
        btn.className = "btn-respuesta";
        btn.innerHTML = `<strong>${letras[index] || ''}.</strong> ${respuesta.texto}`;
        btn.dataset.respuestaId = respuesta.id;
        btn.onclick = () => seleccionarRespuesta(respuesta.id);
        respuestasContainer.appendChild(btn);
    });

    // Ocultar feedback mientras no se responda
    document.getElementById("feedbackContainer").style.display = "none";
    
    // ✅ Asegurar que el contenedor de resultado esté oculto
    document.getElementById("resultadoContainer").style.display = "none";
}

// ==========================================
// SELECCIONAR RESPUESTA - CORREGIDO
// ==========================================

function seleccionarRespuesta(respuestaId) {
    const escena = escenaActual;
    const pregunta = escena.pregunta;
    const respuesta = pregunta.respuestas.find(r => r.id === respuestaId);

    if (!respuesta) return;

    // Deshabilitar todos los botones
    const botones = document.querySelectorAll('.btn-respuesta');
    botones.forEach(btn => btn.disabled = true);

    // Marcar correcta/incorrecta
    botones.forEach(btn => {
        const id = parseInt(btn.dataset.respuestaId);
        const res = pregunta.respuestas.find(r => r.id === id);
        if (res) {
            if (res.id === respuestaId) {
                btn.classList.add(res.esCorrecta ? 'correcta' : 'incorrecta');
            } else if (res.esCorrecta) {
                btn.classList.add('correcta');
            }
        }
    });

    // Sumar puntos
    if (respuesta.esCorrecta) {
        puntosTotales += pregunta.puntos;
        document.getElementById("puntosInfo").textContent = `⭐ ${puntosTotales} puntos`;
    }

    // Mostrar feedback con explicación
    const feedbackContainer = document.getElementById("feedbackContainer");
    feedbackContainer.style.display = "block";
    const feedbackMensaje = document.getElementById("feedbackMensaje");
    
    if (respuesta.esCorrecta) {
        feedbackMensaje.textContent = pregunta.explicacion || "✅ ¡Correcto! Excelente respuesta.";
        feedbackMensaje.className = "feedback-mensaje exito";
    } else {
        feedbackMensaje.textContent = pregunta.explicacion || "❌ Incorrecto. Sigue aprendiendo.";
        feedbackMensaje.className = "feedback-mensaje error";
    }

    // Mostrar botón para ver resultado final
    const btnContinuar = document.getElementById("btnContinuar");
    btnContinuar.style.display = "block";
    btnContinuar.textContent = "Ver resultado 🏆";
    btnContinuar.onclick = () => mostrarResultadoFinal();

    // Guardar progreso
    guardarProgreso();
}
document.addEventListener("DOMContentLoaded", inicializar);

// ==========================================
// VOLVER AL DASHBOARD
// ==========================================

function volverDashboard() {
    window.location.href = "dashboardEstudiantes.html";
}

// ==========================================
// VOLVER A LA MISIÓN
// ==========================================

function volverAMision() {
    
    // Marcar que necesita actualizar estadísticas
    localStorage.setItem("estadisticas_actualizadas", "false");

    if (misionIdActual) {
        window.location.href = `mision-detalle.html?misionId=${misionIdActual}`;
    } else {
        window.location.href = "dashboardEstudiantes.html";
    }
}
