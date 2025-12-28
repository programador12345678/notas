<?php require 'config.php'; ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Sistema de Notas 2026 | Neon DB</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root { --bg: #f8fafc; --card: #ffffff; --text: #0f172a; --accent: #4f46e5; }
        body { font-family: 'Poppins', sans-serif; background-color: var(--bg); color: var(--text); }
        .glass { background: var(--card); border: 1px solid #e2e8f0; }
        .hidden { display: none; }
    </style>
</head>
<body>

    <nav class="p-6 flex justify-end gap-4">
        <button onclick="location.reload()" class="glass p-3 rounded-full shadow-md">🔄 Actualizar</button>
    </nav>

    <div class="max-w-6xl mx-auto p-6">
        <div class="flex gap-4 mb-10 justify-center">
            <button onclick="cargarTabla('fatima.flores')" class="bg-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition">Fatima Flores</button>
            <button onclick="cargarTabla('jorge.flores')" class="bg-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition">Jorge Flores</button>
        </div>

        <div class="glass rounded-[2rem] shadow-2xl overflow-hidden">
            <table class="w-full text-left">
                <thead class="bg-indigo-600 text-white">
                    <tr>
                        <th class="p-6 text-xl">Materia</th>
                        <th class="p-6">Coti.</th>
                        <th class="p-6">Inte.</th>
                        <th class="p-6">Examen</th>
                        <th class="p-6 text-right">Final</th>
                    </tr>
                </thead>
                <tbody id="tabla-body" class="divide-y divide-gray-100">
                    </tbody>
            </table>
        </div>
    </div>

    <script>
        let estudianteActual = '';

        async function cargarTabla(id) {
            estudianteActual = id;
            const res = await fetch(`api.php?action=get_notas&estudiante=${id}`);
            const materias = await res.json();
            
            const tbody = document.getElementById('tabla-body');
            tbody.innerHTML = materias.map(m => {
                const promedio = ((parseFloat(m.coti) + parseFloat(m.inte) + parseFloat(m.exam)) / 3).toFixed(1);
                return `
                <tr>
                    <td class="p-6 font-bold text-indigo-600 text-lg">${m.nombre_materia}</td>
                    <td class="p-6"><input type="number" value="${m.coti}" onchange="guardar('${m.nombre_materia}', 'coti', this.value)" class="w-20 p-2 border rounded-lg"></td>
                    <td class="p-6"><input type="number" value="${m.inte}" onchange="guardar('${m.nombre_materia}', 'inte', this.value)" class="w-20 p-2 border rounded-lg"></td>
                    <td class="p-6"><input type="number" value="${m.exam}" onchange="guardar('${m.nombre_materia}', 'exam', this.value)" class="w-20 p-2 border rounded-lg"></td>
                    <td class="p-6 text-right font-black text-2xl text-indigo-500">${promedio}</td>
                </tr>
                `;
            }).join('');
        }

        async function guardar(materia, columna, valor) {
            const fd = new FormData();
            fd.append('estudiante', estudianteActual);
            fd.append('materia', materia);
            fd.append('columna', columna);
            fd.append('valor', valor);

            await fetch('api.php?action=update_nota', {
                method: 'POST',
                body: fd
            });
            // Recargar para refrescar el promedio visualmente
            cargarTabla(estudianteActual);
        }
    </script>
</body>
</html>
