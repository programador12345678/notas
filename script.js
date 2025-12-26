const firebaseConfig = { databaseURL: "https://notassv-ce8e1-default-rtdb.firebaseio.com/" };
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const usuarios = {
  "fatima.flores": { pass: "Ccsa2026.", rol: "editor", materias: ["Lenguaje", "Matemáticas", "Estudios Sociales", "Física Química", "Biología", "Orientación Para La Vida", "Moral Urbanidad y Cívica"] },
  "jorge.flores": { pass: "Atb2026.", rol: "editor", materias: ["Inglés", "Reading and Writing", "Conversation", "Informática", "Seminario", "Educación Física"] },
  "jorge.flores1": { pass: "JFlores2026.", rol: "lector" },
  "carmen.jovel": { pass: "CJovel2026.", rol: "lector" },
  "admin.notas": { pass: "Admin2026.", rol: "admin" }
};

let userLogged = null;

document.getElementById('login-btn').addEventListener('click', () => {
    const u = document.getElementById('usuario').value;
    const p = document.getElementById('contrasena').value;

    if (usuarios[u] && usuarios[u].pass === p) {
        userLogged = usuarios[u];
        document.getElementById('login').classList.add('hidden');
        document.getElementById('sistema').classList.remove('hidden');
        document.getElementById('welcome').innerText = `Hola, ${u}`;

        if (userLogged.rol === "lector") {
            document.getElementById('panel-lectores').classList.remove('hidden');
        } else {
            const mats = userLogged.rol === "admin" ? [...usuarios["fatima.flores"].materias, ...usuarios["jorge.flores"].materias] : userLogged.materias;
            dibujarTabla(mats);
        }
    } else {
        document.getElementById('error-msg').innerText = "Credenciales inválidas";
    }
});

function filtrarPorProfesor(prof) {
    const mats = prof === 'fatima' ? usuarios["fatima.flores"].materias : usuarios["jorge.flores"].materias;
    document.getElementById('titulo-tabla').innerText = "Notas de " + (prof === 'fatima' ? "Fatima Flores" : "Jorge Flores");
    dibujarTabla(mats);
}

function dibujarTabla(listaMaterias) {
    const tbody = document.getElementById('tabla-cuerpo');
    tbody.innerHTML = "";
    
    listaMaterias.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${m}</td>
            <td class="nota" data-m="${m}" data-c="cotidiana">-</td>
            <td class="nota" data-m="${m}" data-c="integradora">-</td>
            <td class="nota" data-m="${m}" data-c="examen">-</td>
            <td class="final">0.0</td>
        `;
        tbody.appendChild(tr);
        if (userLogged.rol === "editor" || userLogged.rol === "admin") habilitarEdit(tr, m);
    });
    escucharFirebase();
}

function habilitarEdit(fila, m) {
    fila.querySelectorAll('.nota').forEach(td => {
        td.contentEditable = true;
        td.addEventListener('blur', (e) => {
            const campo = e.target.getAttribute('data-c');
            database.ref(`notas/${m}/${campo}`).set(e.target.innerText);
        });
    });
}

function escucharFirebase() {
    database.ref('notas').on('value', snap => {
        const datos = snap.val() || {};
        document.querySelectorAll('#tabla-cuerpo tr').forEach(fila => {
            const m = fila.cells[0].innerText;
            if (datos[m]) {
                fila.cells[1].innerText = datos[m].cotidiana || "-";
                fila.cells[2].innerText = datos[m].integradora || "-";
                fila.cells[3].innerText = datos[m].examen || "-";
                const f = (parseFloat(datos[m].cotidiana || 0) + parseFloat(datos[m].integradora || 0) + parseFloat(datos[m].examen || 0)) / 3;
                fila.cells[4].innerText = f.toFixed(1);
            }
        });
    });
}

document.getElementById('logout').addEventListener('click', () => location.reload());
