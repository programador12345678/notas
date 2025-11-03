// --- Configuración Firebase ---
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  databaseURL: "https://notas-sv1.firebaseapp.com/",
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
const usuario = document.getElementById("usuario");
const contrasena = document.getElementById("contrasena");
const errorMsg = document.getElementById("error-msg");
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
  inactivityTimer = setTimeout(() => cerrarSesion(), 5 * 60 * 1000);
}

function showWelcome(msg) {
  welcome.textContent = msg;
  setTimeout(() => welcome.textContent = "", 10000);
}

function actualizarTabla() {
  let total = 0, count = 0;
  materias.forEach(f => {
    const c = f.querySelectorAll("td");
    const coti = parseFloat(c[1].textContent) || 0;
    const inte = parseFloat(c[2].textContent) || 0;
    const exam = parseFloat(c[3].textContent) || 0;

    if (!c[1].textContent && !c[2].textContent && !c[3].textContent) {
      c[4].textContent = "0.00";
    } else {
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

  // Escucha notas del usuario
  db.ref(`notas/${currentUser}`).on('value', snapshot => {
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
  });

  // Para usuario 20210012: también ver notas de JFlores
  if (currentUser === "20210012") {
    db.ref(`notas/JFlores`).on('value', snapshot => {
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
    });
  }
}

function habilitarEdicion(estado) {
  materias.forEach(f => {
    Array.from(f.cells).forEach((td, i) => {
      if (i > 0) {
        td.contentEditable = estado;
        if (estado) {
          td.addEventListener("input", () => {
            actualizarTabla();
            guardarNotas();
            resetInactividad();
          });
        }
      }
    });
  });
}

function mostrarReloj() {
  relojDiv.textContent = new Date().toLocaleTimeString();
}

function iniciarReloj() {
  mostrarReloj();
  relojInterval = setInterval(mostrarReloj, 1000);
  setTimeout(() => {
    clearInterval(relojInterval);
    relojDiv.textContent = "";
  }, 60000);
}

function cerrarSesion() {
  sistemaDiv.style.display = "none";
  loginDiv.style.display = "block";
  usuario.value = "";
  contrasena.value = "";
  errorMsg.textContent = "";
  welcome.textContent = "";
  clearTimeout(inactivityTimer);
  clearInterval(relojInterval);
  relojDiv.textContent = "";
  currentUser = "";
  localStorage.removeItem("currentUser");
}

// --- Eventos ---
document.getElementById("login-btn").addEventListener("click", () => {
  const user = usuario.value.trim();
  const pass = contrasena.value.trim();
  if ((user === "JFlores" && pass === "Notas2025.") || (user === "20210012" && pass === "Mined2025.")) {
    currentUser = user;
    localStorage.setItem("currentUser", currentUser);
    loginDiv.style.display = "none";
    sistemaDiv.style.display = "block";
    showWelcome(currentUser === "JFlores" ? "Bienvenido Jorge Flores" : "Bienvenida Montserrath");
    habilitarEdicion(currentUser === "JFlores");
    cargarNotas();
    iniciarReloj();
    resetInactividad();
  } else {
    errorMsg.textContent = "Usuario o contraseña incorrectos.";
    errorMsg.style.color = "red";
  }
});

window.addEventListener("load", () => {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = savedUser;
    loginDiv.style.display = "none";
    sistemaDiv.style.display = "block";
    showWelcome(currentUser === "JFlores" ? "Bienvenido Jorge Flores" : "Bienvenida Montserrath");
    habilitarEdicion(currentUser === "JFlores");
    cargarNotas();
    iniciarReloj();
    resetInactividad();
  }
});

document.addEventListener("mousemove", resetInactividad);
document.addEventListener("keydown", resetInactividad);
document.addEventListener("touchstart", resetInactividad);

logout.addEventListener("click", cerrarSesion);
