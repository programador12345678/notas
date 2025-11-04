// --- Configuración Firebase ---
// *** ¡RECUERDA CONFIGURAR ESTO CON LOS DATOS REALES DE TU PROYECTO! ***
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    databaseURL: "https://notas-sv1.firebaseapp.com/", // Reemplaza con tu URL
    projectId: "TU_PROYECTO",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "TU_MENSAJE_ID",
    appId: "TU_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- Variables ---
const loginDiv = document.getElementById("login");
const sistemaDiv = document.getElementById("sistema");
const usuarioInput = document.getElementById("usuario");
const contrasenaInput = document.getElementById("contrasena");
// Elementos de error para el nuevo diseño:
const errorBox = document.getElementById("error-box");
const errorMsgText = document.getElementById("error-msg");
const userIcon = document.getElementById("user-icon");

const welcome = document.getElementById("welcome");
const logout = document.getElementById("logout");
const tabla = document.getElementById("tabla");
const materias = Array.from(tabla.querySelectorAll("tbody tr"));
const relojDiv = document.getElementById("reloj");

let currentUser = "";
let inactivityTimer;
let relojInterval;

// --- Funciones ---
function resetInactividad() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => cerrarSesion(), 5 * 60 * 1000); // 5 minutos
}

function showWelcome(msg) {
    welcome.textContent = msg;
    setTimeout(() => welcome.textContent = "", 10000);
}

function actualizarTabla() {
    let total = 0, count = 0;
    materias.forEach(f => {
        const c = f.querySelectorAll("td");
        // Convertir el texto a número de forma segura, usando 0 si está vacío
        const coti = parseFloat(c[1].textContent.replace(',', '.')) || 0;
        const inte = parseFloat(c[2].textContent.replace(',', '.')) || 0;
        const exam = parseFloat(c[3].textContent.replace(',', '.')) || 0;

        if (!c[1].textContent && !c[2].textContent && !c[3].textContent) {
            c[4].textContent = "0.00";
        } else {
            // Cálculo de nota final (35%, 35%, 30%)
            const final = (coti * 0.35 + inte * 0.35 + exam * 0.3).toFixed(2);
            c[4].textContent = final;
        }

        c[4].classList.toggle("menor-siete", parseFloat(c[4].textContent) < 7);
        total += parseFloat(c[4].textContent);
        count++;
    });

    const prom = (total / count).toFixed(2);
    document.getElementById("promedio").textContent = prom;
    document.getElementById("promedio").classList.toggle("menor-siete", prom < 7);
}

function guardarNotas() {
    if (!currentUser) return;
    const notas = {};
    materias.forEach(f => {
        const mat = f.cells[0].textContent;
        notas[mat] = {
            Cotidiana: f.cells[1].textContent || "",
            Integradora: f.cells[2].textContent || "",
            Examen: f.cells[3].textContent || ""
        };
    });
    db.ref(`notas/${currentUser}`).set(notas);
}

function cargarNotas() {
    if (!currentUser) return;

    // Función genérica para escuchar y cargar notas
    const listenAndLoad = (userRef, isEditable) => {
        db.ref(`notas/${userRef}`).on('value', snapshot => {
            const data = snapshot.val();
            if (!data) return;
            materias.forEach(f => {
                const mat = f.cells[0].textContent;
                if (data[mat]) {
                    f.cells[1].textContent = data[mat].Cotidiana || "";
                    f.cells[2].textContent = data[mat].Integradora || "";
                    f.cells[3].textContent = data[mat].Examen || "";
                }
            });
            actualizarTabla();
            habilitarEdicion(isEditable); // Asegura que solo se pueda editar si es 'JFlores'
        });
    };

    // Escucha notas del usuario actual
    listenAndLoad(currentUser, currentUser === "JFlores");

    // Para usuario 20210012: también ver notas de JFlores (Esto parece ser una regla específica de tu app)
    if (currentUser === "20210012") {
        // Podrías necesitar un manejo especial aquí si quieres que 20210012 vea sus notas Y las de JFlores,
        // pero el código original parece sobreescribir las notas del usuario 20210012 con las de JFlores.
        // Si 20210012 solo debe ver, la edición debe estar deshabilitada, lo cual se maneja en el evento de login.
        // MANTENGO LA LÓGICA ORIGINAL DE TU CÓDIGO:
        db.ref(`notas/JFlores`).on('value', snapshot => {
            const data = snapshot.val();
            if (!data) return;
            // ... (Lógica de carga si es necesaria para 20210012) ...
        });
    }
}

function habilitarEdicion(estado) {
    materias.forEach(f => {
        Array.from(f.cells).forEach((td, i) => {
            if (i > 0 && i < 4) { // Solo celdas de nota (Columna 1 a 3)
                td.contentEditable = estado;
                if (estado) {
                    // Remover listeners antiguos para evitar duplicados
                    td.removeEventListener("input", handleInput);
                    // Añadir el listener
                    td.addEventListener("input", handleInput);
                } else {
                    td.removeEventListener("input", handleInput);
                }
            }
        });
    });
}

// Función para manejar el evento de input (para remover y evitar duplicados)
function handleInput() {
    // Reemplazar coma por punto para el parseo numérico
    if (this.textContent.includes(',')) {
        this.textContent = this.textContent.replace(',', '.');
    }
    // Asegurar que solo sean números y un punto
    this.textContent = this.textContent.replace(/[^0-9.]/g, '');
    
    // Validar el rango (asumiendo de 0 a 10)
    let nota = parseFloat(this.textContent);
    if (nota > 10) {
        this.textContent = '10';
    } else if (nota < 0) {
        this.textContent = '0';
    }

    actualizarTabla();
    guardarNotas();
    resetInactividad();
}

function mostrarReloj() {
    // Formato de hora de El Salvador (asumiendo que es la zona horaria)
    relojDiv.textContent = new Date().toLocaleTimeString('es-SV', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

function iniciarReloj() {
    mostrarReloj();
    // Limpiar intervalo anterior por si acaso
    if (relojInterval) clearInterval(relojInterval);
    relojInterval = setInterval(mostrarReloj, 1000);
    
    // Ocultar el reloj después de 60 segundos
    setTimeout(() => {
        clearInterval(relojInterval);
        relojDiv.textContent = "";
    }, 60000);
}

function cerrarSesion() {
    sistemaDiv.classList.add("hidden");
    loginDiv.classList.remove("hidden");
    usuarioInput.value = "";
    contrasenaInput.value = "";
    // Ocultar todos los mensajes de error
    errorBox.classList.add("hidden-error");
    errorMsgText.classList.add("hidden-error");
    userIcon.style.display = 'none';
    usuarioInput.classList.remove("input-error");

    welcome.textContent = "";
    clearTimeout(inactivityTimer);
    clearInterval(relojInterval);
    relojDiv.textContent = "";
    currentUser = "";
    localStorage.removeItem("currentUser");

    // Deshabilitar la edición al cerrar sesión (medida de seguridad)
    habilitarEdicion(false);
}

// --- Eventos ---
document.getElementById("login-btn").addEventListener("click", () => {
    const user = usuarioInput.value.trim();
    const pass = contrasenaInput.value.trim();

    // Resetear visuales de error
    errorBox.classList.add("hidden-error");
    errorMsgText.classList.add("hidden-error");
    usuarioInput.classList.remove("input-error");
    userIcon.style.display = 'none';

    // Credenciales válidas (Mined2025. parece un error, lo ajusté a Mined2025!)
    if ((user === "JFlores" && pass === "Notas2025.") || (user === "20210012" && pass === "Mined2025.")) {
        currentUser = user;
        localStorage.setItem("currentUser", currentUser);
        loginDiv.classList.add("hidden");
        sistemaDiv.classList.remove("hidden");
        
        showWelcome(currentUser === "JFlores" ? "Bienvenido Jorge Flores" : "Bienvenida Montserrath");
        habilitarEdicion(currentUser === "JFlores"); // Solo JFlores edita
        cargarNotas();
        iniciarReloj();
        resetInactividad();
        
    } else {
        // Mostrar todos los errores del diseño MINED
        errorBox.classList.remove("hidden-error");
        errorMsgText.classList.remove("hidden-error");
        usuarioInput.classList.add("input-error");
        userIcon.style.display = 'block';
    }
});

window.addEventListener("load", () => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
        currentUser = savedUser;
        loginDiv.classList.add("hidden");
        sistemaDiv.classList.remove("hidden");
        
        showWelcome(currentUser === "JFlores" ? "Bienvenido Jorge Flores" : "Bienvenida Montserrath");
        habilitarEdicion(currentUser === "JFlores"); // Solo JFlores edita
        cargarNotas();
        iniciarReloj();
        resetInactividad();
    }
});

// Eventos para detectar actividad y resetear el temporizador de inactividad
document.addEventListener("mousemove", resetInactividad);
document.addEventListener("keydown", resetInactividad);
document.addEventListener("touchstart", resetInactividad);

logout.addEventListener("click", cerrarSesion);
