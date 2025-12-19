// Configuración de tu Firebase
const firebaseConfig = {
  databaseURL: "https://notassv-ce8e1-default-rtdb.firebaseio.com/"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Selección de elementos
const loginDiv = document.getElementById('login');
const sistemaDiv = document.getElementById('sistema');
const loginBtn = document.getElementById('login-btn');
const tablaBody = document.querySelector('#tabla tbody');

// 1. FUNCIÓN PARA CARGAR DATOS EN TIEMPO REAL
function cargarNotas() {
  // .on('value'...) hace que se actualice solo cuando algo cambia en la nube
  database.ref('notas').on('value', (snapshot) => {
    const datos = snapshot.val();
    actualizarTabla(datos);
  });
}

// 2. ACTUALIZAR LA TABLA VISUALMENTE
function actualizarTabla(datos) {
  if (!datos) return;

  const filas = tablaBody.querySelectorAll('tr');
  filas.forEach(fila => {
    const materia = fila.cells[0].innerText;
    if (datos[materia]) {
      fila.cells[1].innerText = datos[materia].cotidiana || "-";
      fila.cells[2].innerText = datos[materia].integradora || "-";
      fila.cells[3].innerText = datos[materia].examen || "-";
      
      // Calcular Nota Final
      const n1 = parseFloat(datos[materia].cotidiana) || 0;
      const n2 = parseFloat(datos[materia].integradora) || 0;
      const n3 = parseFloat(datos[materia].examen) || 0;
      const final = ((n1 + n2 + n3) / 3).toFixed(1);
      fila.cells[4].innerText = final;
    }
  });
}

// 3. LOGICA DE LOGIN (Simple para el ejemplo)
loginBtn.addEventListener('click', () => {
  const user = document.getElementById('usuario').value;
  if (user !== "") {
    loginDiv.classList.add('hidden');
    sistemaDiv.classList.remove('hidden');
    document.getElementById('welcome').innerText = "Bienvenido: " + user;
    cargarNotas(); // Empezar a escuchar la base de datos
  }
});
