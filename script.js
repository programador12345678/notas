// Configuración de tu Firebase
const firebaseConfig = {
  databaseURL: "https://notassv-ce8e1-default-rtdb.firebaseio.com/"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Selección de elementos
const loginDiv = document.getElementById('login');
const sistemaDiv = document.getElementById('sistema');
const loginBtn = document.getElementById('login-btn');
const tablaBody = document.querySelector('#tabla tbody');
let usuarioActual = null;

// DEFINICIÓN DE USUARIOS Y PERMISOS
const usuarios = {
  "fatima.flores": { pass: "ccsa2026.", rol: "editor", materias: ["Lenguaje", "Matemáticas", "Estudios Sociales", "Física Química", "Biología"] },
  "jorge.flores": { pass: "atb2026.", rol: "editor", materias: ["Inglés", "Reading and Writing", "Conversation"] },
  "jorge.flores1": { pass: "FJovel26.", rol: "lector", materias: "todas" },
  "carmen.jovel": { pass: "Mined2026.", rol: "lector", materias: "todas" },
  "admin.notas": { pass: "Master2025!", rol: "admin", materias: "todas" } // Usuario Admin
};

// LOGIN
loginBtn.addEventListener('click', () => {
  const user = document.getElementById('usuario').value;
  const pass = document.getElementById('contrasena').value;

  if (usuarios[user] && usuarios[user].pass === pass) {
    usuarioActual = usuarios[user];
    loginDiv.classList.add('hidden');
    sistemaDiv.classList.remove('hidden');
    document.getElementById('welcome').innerText = `Usuario: ${user} (${usuarioActual.rol})`;
    
    configurarTabla();
    cargarDatosRealtime();
  } else {
    document.getElementById('error-msg').innerText = "Credenciales incorrectas";
  }
});

// CONFIGURAR VISIBILIDAD DE FILAS
function configurarTabla() {
  const filas = tablaBody.querySelectorAll('tr');
  filas.forEach(fila => {
    const materia = fila.cells[0].innerText;
    
    // Filtrar materias según usuario
    if (usuarioActual.materias === "todas" || usuarioActual.materias.includes(materia)) {
      fila.style.display = ""; // Mostrar
      
      // Si es editor o admin, permitir edición al hacer clic
      if (usuarioActual.rol === "editor" || usuarioActual.rol === "admin") {
        habilitarEdicion(fila, materia);
      }
    } else {
      fila.style.display = "none"; // Ocultar
    }
  });
}

// HACER QUE LAS CELDAS SEAN EDITABLES
function habilitarEdicion(fila, materia) {
  for (let i = 1; i <= 3; i++) { // Columnas de notas
    fila.cells[i].contentEditable = "true";
    fila.cells[i].style.background = "#fff9c4"; // Color amarillento para indicar que es editable
    
    fila.cells[i].addEventListener('blur', () => {
      const valor = fila.cells[i].innerText;
      const campo = i === 1 ? "cotidiana" : i === 2 ? "integradora" : "examen";
      
      // GUARDAR EN FIREBASE
      database.ref(`notas/${materia}/${campo}`).set(valor);
    });
  }
}

// ESCUCHAR CAMBIOS DE FIREBASE
function cargarDatosRealtime() {
  database.ref('notas').on('value', (snapshot) => {
    const datos = snapshot.val() || {};
    const filas = tablaBody.querySelectorAll('tr');
    
    filas.forEach(fila => {
      const materia = fila.cells[0].innerText;
      if (datos[materia]) {
        fila.cells[1].innerText = datos[materia].cotidiana || "";
        fila.cells[2].innerText = datos[materia].integradora || "";
        fila.cells[3].innerText = datos[materia].examen || "";
        
        // Calcular Final
        const n1 = parseFloat(datos[materia].cotidiana) || 0;
        const n2 = parseFloat(datos[materia].integradora) || 0;
        const n3 = parseFloat(datos[materia].examen) || 0;
        fila.cells[4].innerText = ((n1 + n2 + n3) / 3).toFixed(1);
      }
    });
  });
}
