// Configuración Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  databaseURL: "https://TU_PROYECTO-default-rtdb.firebaseio.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_MENSAJE_ID",
  appId: "TU_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

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

// --- Manejo de inactividad ---
function resetInactivity() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    cerrarSesion();
  }, 5 * 60 * 1000); // 5 minutos
}

// --- Mostrar bienvenida 10s ---
function showWelcome(msg) {
  welcome.textContent = msg;
  setTimeout(() => welcome.textContent = "", 10000);
}

// --- Actualizar tabla de notas ---
function actualizarTabla() {
  let total = 0, count = 0;
  materias.forEach(f => {
    const c = f.querySelectorAll("td");
    const coti = parseFloat(c[1].textContent) || 0;
    const inte = parseFloat(c[2].textContent) || 0;
    const exam = parseFloat(c[3].textContent) || 0;
    const final = (coti * 0.35 + inte * 0.35 + exam * 0.3).toFixed(2);
    c[4].textContent = final;
    c[4].classList.toggle("menor-siete", final < 7);
    total += parseFloat(final);
    count++;
  });
  const prom = (total / count).toFixed(2);
  document.getElementById("promedio").textContent = prom;
  document.getElementById("promedio").classList.toggle("menor-siete", prom < 7);
}

// --- Guardar notas automáticamente ---
function guardarNotas() {
  if (!currentUser) return;
  const notas = {};
  materias.forEach(f => {
    const mat = f.cells[0].textContent;
    notas[mat] = {
      Cotidiana: f.cells[1].textContent || "0",
      Integradora: f.cells[2].textContent || "0",
      Examen: f.cells[3].textContent || "0"
    };
  });
  db.ref(`notas/${currentUser}`).set(notas);
}

// --- Cargar notas en tiempo real ---
function cargarNotas() {
  if (!currentUser) return;
  db.ref(`notas/${currentUser}`).on('value', snapshot => {
    const data = snapshot.val();
    if (!data) return;
    materias.forEach(f => {
      const mat = f.cells[0].textContent;
      if (data[mat]) {
        f.cells[1].textContent = data[mat].Cotidiana || "0";
        f.cells[2].textContent = data[mat].Integradora || "0";
        f.cells[3].textContent = data[mat].Examen || "0";
      }
    });
    actualizarTabla();
  });
}

// --- Hacer celdas editables ---
materias.forEach(f => {
  Array.from(f.cells).forEach((td, i) => {
    if (i > 0) {
      td.contentEditable = true;
      td.addEventListener("input", () => {
        actualizarTabla();
        guardarNotas();
        resetInactivity();
      });
    }
  });
});

// --- Mostrar reloj ---
function mostrarReloj() {
  const now = new Date();
  relojDiv.textContent = now.toLocaleTimeString();
}
function iniciarReloj() {
  mostrarReloj();
  relojInterval = setInterval(mostrarReloj, 1000);
  setTimeout(() => {
    clearInterval(relojInterval);
    relojDiv.textContent = "";
  }, 60000); // desaparece después de 1 minuto
}

// --- Cerrar sesión ---
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

// --- Login ---
document.getElementById("login-btn").addEventListener("click", () => {
  const user = usuario.value.trim();
  const pass = contrasena.value.trim();
  if ((user === "JFlores" && pass === "Notas2025.") || (user === "20210012" && pass === "Mined2025.")) {
    currentUser = user;
    loginDiv.style.display = "none";
    sistemaDiv.style.display = "block";
    showWelcome(user === "JFlores" ? "Bienvenido Jorge Flores" : "Bienvenida Montserrath");
    cargarNotas();
    iniciarReloj();
    resetInactividad();
    localStorage.setItem("currentUser", currentUser); // mantener sesión
  } else {
    errorMsg.textContent = "Usuario o contraseña incorrectos.";
    errorMsg.style.color = "red";
  }
});

// --- Mantener sesión aunque se refresque ---
window.addEventListener("load", () => {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = savedUser;
    loginDiv.style.display = "none";
    sistemaDiv.style.display = "block";
    showWelcome(currentUser === "JFlores" ? "Bienvenido Jorge Flores" : "Bienvenida Montserrath");
    cargarNotas();
    iniciarReloj();
    resetInactividad();
  }
});

// --- Reset inactividad al mover mouse, teclado o touch ---
document.addEventListener("mousemove", resetInactividad);
document.addEventListener("keydown", resetInactividad);
document.addEventListener("touchstart", resetInactividad);
