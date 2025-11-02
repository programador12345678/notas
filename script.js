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

// Tiempo de inactividad
let inactivityTimer;
function resetInactivity() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(()=>logout.click(), 5*60*1000); // 5 min
}

// Mostrar bienvenida 10s
function showWelcome(msg){
  welcome.textContent = msg;
  setTimeout(()=>welcome.textContent="", 10000);
}

// Actualizar notas finales
function actualizarTabla() {
  let total=0, count=0;
  materias.forEach(f=>{
    const c=f.querySelectorAll("td");
    const coti=parseFloat(c[1].textContent)||0;
    const inte=parseFloat(c[2].textContent)||0;
    const exam=parseFloat(c[3].textContent)||0;
    const final=(coti*0.35+inte*0.35+exam*0.3).toFixed(2);
    c[4].textContent=final;
    c[4].classList.toggle("menor-siete", final<7);
    total+=parseFloat(final);
    count++;
  });
  const prom=(total/count).toFixed(2);
  document.getElementById("promedio").textContent=prom;
  document.getElementById("promedio").classList.toggle("menor-siete", prom<7);
}

// Guardar automáticamente en Firebase
function guardarNotas(){
  if(!currentUser) return;
  const notas={};
  materias.forEach(f=>{
    const mat=f.cells[0].textContent;
    notas[mat]={
      Cotidiana: f.cells[1].textContent || "0",
      Integradora: f.cells[2].textContent || "0",
      Examen: f.cells[3].textContent || "0"
    };
  });
  db.ref(`notas/${currentUser}`).set(notas);
}

// Cargar notas en tiempo real
function cargarNotas(){
  if(!currentUser) return;
  db.ref(`notas/${currentUser}`).on('value', snapshot=>{
    const data=snapshot.val();
    if(!data) return;
    materias.forEach(f=>{
      const mat=f.cells[0].textContent;
      if(data[mat]){
        f.cells[1].textContent=data[mat].Cotidiana||"0";
        f.cells[2].textContent=data[mat].Integradora||"0";
        f.cells[3].textContent=data[mat].Examen||"0";
      }
    });
    actualizarTabla();
  });
}

// Hacer celdas editables
materias.forEach(f=>{
  Array.from(f.cells).forEach((td,i)=>{
    if(i>0){
      td.contentEditable=true;
      td.addEventListener("input", ()=>{
        actualizarTabla();
        guardarNotas();
        resetInactivity();
      });
    }
  });
});

// Mostrar reloj
const relojDiv=document.getElementById("reloj");
function mostrarReloj(){
  const now=new Date();
  const hora=now.toLocaleTimeString();
  relojDiv.textContent=hora;
}
let relojInterval;
function iniciarReloj(){
  mostrarReloj();
  relojInterval=setInterval(mostrarReloj,1000);
  setTimeout(()=>{
    clearInterval(relojInterval);
    relojDiv.textContent="";
  },60000); // 1 min
}

// Login
document.getElementById("login-btn").addEventListener("click", ()=>{
  const user=usuario.value.trim();
  const pass=contrasena.value.trim();
  if((user==="JFlores" && pass==="Notas2025.")||(user==="20210012" && pass==="Mined2025.")){
    currentUser=user;
    loginDiv.style.display="none";
    sistemaDiv.style.display="block";
    showWelcome(user==="JFlores"? "Bienvenido Jorge Flores":"Bienvenida Montserrath");
    cargarNotas();
    iniciarReloj();
    resetInactivity();
  } else errorMsg.textContent="Usuario o contraseña incorrectos.";
});

// Logout
logout.addEventListener("click", ()=>{
  sistemaDiv.style.display="none";
  loginDiv.style.display="block";
  usuario.value="";
  contrasena.value="";
  errorMsg.textContent="";
  welcome.textContent="";
  clearTimeout(inactivityTimer);
  clearInterval(relojInterval);
  relojDiv.textContent="";
});

// Reiniciar inactividad al mover mouse, teclado o touch
document.addEventListener("mousemove", resetInactivity);
document.addEventListener("keydown", resetInactivity);
document.addEventListener("touchstart", resetInactivity);
