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
let currentUser = "";

// Mostrar mensaje
function mostrarMensaje(msg){
  alert(msg);
}

// Actualizar notas y promedio
function actualizarTabla(){
  let total=0, count=0;
  materias.forEach(fila=>{
    const celdas = fila.querySelectorAll("td");
    const coti = parseFloat(celdas[1].textContent)||0;
    const inte = parseFloat(celdas[2].textContent)||0;
    const exam = parseFloat(celdas[3].textContent)||0;
    let final = 0;
    if(coti||inte||exam){
      final = (coti*0.35 + inte*0.35 + exam*0.3).toFixed(2);
      celdas[4].textContent = final;
      celdas[4].classList.toggle("menor-siete", final<7);
      total += parseFloat(final);
    } else {
      celdas[4].textContent="";
    }
    count++;
  });
  const prom = total/count;
  document.getElementById("promedio").textContent = prom.toFixed(2);
  document.getElementById("promedio").classList.toggle("menor-siete", prom<7);
}

// Guardar cambios en Firebase
materias.forEach(fila=>{
  fila.querySelectorAll("td").forEach((td,i)=>{
    if(i>0){
      td.contentEditable = true;
      td.addEventListener('input', ()=>{
        let valor = parseFloat(td.textContent);
        if(valor<2) mostrarMensaje("No se puede poner número menor a 2");
        if(valor>10.1) mostrarMensaje("No se puede poner número mayor a 10.1");

        // Guardar
        const notas = {};
        materias.forEach(f=>{
          const mat = f.cells[0].textContent;
          notas[mat] = {
            Cotidiana: f.cells[1].textContent || '',
            Integradora: f.cells[2].textContent || '',
            Examen: f.cells[3].textContent || ''
          };
        });
        db.ref(`notas/${currentUser}`).set(notas);
        actualizarTabla();
      });
    }
  });
});

// Cargar notas en tiempo real
function cargarNotas(){
  db.ref(`notas/${currentUser}`).on('value', snapshot=>{
    const data = snapshot.val();
    if(!data) return;
    materias.forEach(fila=>{
      const mat = fila.cells[0].textContent;
      if(data[mat]){
        fila.cells[1].textContent = data[mat].Cotidiana || '';
        fila.cells[2].textContent = data[mat].Integradora || '';
        fila.cells[3].textContent = data[mat].Examen || '';
      }
    });
    actualizarTabla();
  });
}

// Login
document.getElementById("login-btn").addEventListener("click", ()=>{
  const user = usuario.value.trim();
  const pass = contrasena.value.trim();
  if((user==="JFlores" && pass==="Notas2025.")||(user==="20210012" && pass==="Mined2025.")){
    currentUser=user;
    loginDiv.classList.add("hidden");
    sistemaDiv.classList.remove("hidden");
    welcome.textContent = user==="JFlores"? "Bienvenido Jorge Flores":"Bienvenida Montserrath";
    cargarNotas();
  } else {
    errorMsg.textContent="Usuario o contraseña incorrectos.";
  }
});

// Logout
logout.addEventListener("click", ()=>{
  sistemaDiv.classList.add("hidden");
  loginDiv.classList.remove("hidden");
  usuario.value="";
  contrasena.value="";
});
