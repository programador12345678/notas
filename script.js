// script.js
import { db } from './firebase.js';
import { ref, set, onValue } from "firebase/database";

// --- Guardar notas ---
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
  set(ref(db, `notas/${currentUser}`), notas);
}

// --- Cargar notas en tiempo real ---
function cargarNotas() {
  if (!currentUser) return;

  const notasRef = ref(db, `notas/${currentUser}`);
  onValue(notasRef, snapshot => {
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

  // Para el usuario 20210012, también mostrar notas de JFlores
  if (currentUser === "20210012") {
    const jfloresRef = ref(db, `notas/JFlores`);
    onValue(jfloresRef, snapshot => {
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
