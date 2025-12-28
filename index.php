<?php 
require 'config.php';

// Manejo de Login
if (isset($_POST['login'])) {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$_POST['username']]);
    $user = $stmt->fetch();
    if ($user && $_POST['password'] === $user['password']) { // En producción usar password_hash
        $_SESSION['user'] = $user;
        header("Location: index.php");
        exit;
    } else { $error = "Credenciales incorrectas"; }
}

// Manejo de Logout
if (isset($_GET['logout'])) { session_destroy(); header("Location: index.php"); exit; }

$userAct = $_SESSION['user'] ?? null;
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Notas PHP | 2026</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root { --bg: #f8fafc; --card: #ffffff; --text: #0f172a; --border: #e2e8f0; --accent: #4f46e5; }
        .dark-mode { --bg: #020617; --card: #0f172a; --text: #f8fafc; --border: #1e293b; --accent: #6366f1; }
        body { font-family: 'Poppins', sans-serif; background-color: var(--bg); color: var(--text); transition: 0.4s; min-height: 100vh; display: flex; flex-direction: column; }
        .glass { background: var(--card); border: 1px solid var(--border); backdrop-filter: blur(15px); }
        .hidden { display: none !important; }
        input, select { background: var(--bg) !important; border: 1px solid var(--border) !important; color: var(--text) !important; border-radius: 12px; padding: 10px; width: 100%; outline: none; }
        .btn-primary { background: var(--accent); color: white; transition: 0.3s; font-weight: 700; border-radius: 12px; }
        .btn-primary:hover { transform: translateY(-2px); opacity: 0.9; }
    </style>
</head>
<body>

    <?php if (!$userAct): ?>
        <div class="min-h-screen flex items-center justify-center p-6">
            <form method="POST" class="glass p-10 rounded-[3rem] shadow-2xl w-full max-w-sm text-center">
                <h1 class="text-3xl font-black text-indigo-600 mb-8 italic">Sistema de Notas</h1>
                <input type="text" name="username" placeholder="Usuario" class="mb-3 text-center" required>
                <input type="password" name="password" placeholder="Contraseña" class="mb-6 text-center" required>
                <button type="submit" name="login" class="w-full btn-primary py-4 text-lg">Entrar</button>
                <?php if(isset($error)): ?> <p class="text-red-500 mt-4 text-xs font-bold"><?= $error ?></p> <?php endif; ?>
            </form>
        </div>
    <?php else: ?>
        <nav class="fixed top-6 right-6 z-[110] flex gap-3">
            <button onclick="toggleModal('profile-modal')" class="glass p-4 rounded-full shadow-xl">👤</button>
            <a href="?logout=1" class="bg-red-500 text-white px-8 py-4 rounded-full font-bold shadow-xl">Salir</a>
        </nav>

        <div id="profile-modal" class="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] hidden flex items-center justify-center p-4">
            <div class="glass p-8 rounded-[2.5rem] w-full max-w-sm">
                <h3 class="text-xl font-bold mb-6">Mi Seguridad</h3>
                <input type="password" id="new-pass" placeholder="Nueva Contraseña" class="mb-4">
                <button onclick="changePass()" class="w-full btn-primary py-3">Guardar</button>
                <button onclick="toggleModal('profile-modal')" class="w-full opacity-40 mt-4">Cerrar</button>
            </div>
        </div>

        <div class="p-6 md:p-12 mt-20">
            <div class="max-w-6xl mx-auto mb-10">
                <div class="glass p-4 rounded-full flex flex-wrap justify-between items-center px-8 shadow-lg">
                    <div class="flex gap-2">
                        <?php if($userAct['access_to'] == 'all' || $userAct['access_to'] == 'both' || $userAct['access_to'] == 'fatima.flores'): ?>
                            <button onclick="loadTable('fatima.flores')" class="px-6 py-3 rounded-full font-bold hover:bg-indigo-600 hover:text-white transition">Fatima Flores</button>
                        <?php endif; ?>
                        <?php if($userAct['access_to'] == 'all' || $userAct['access_to'] == 'both' || $userAct['access_to'] == 'jorge.flores'): ?>
                            <button onclick="loadTable('jorge.flores')" class="px-6 py-3 rounded-full font-bold hover:bg-indigo-600 hover:text-white transition">Jorge Flores</button>
                        <?php endif; ?>
                    </div>
                </div>
            </div>

            <main class="max-w-6xl mx-auto">
                <div class="glass rounded-[3rem] shadow-2xl overflow-hidden">
                    <table class="w-full text-left">
                        <thead class="bg-indigo-600 text-white">
                            <tr>
                                <th class="p-6">Materia</th>
                                <th class="p-6">Coti.</th>
                                <th class="p-6">Inte.</th>
                                <th class="p-6">Examen</th>
                                <th class="p-6 text-right">Final</th>
                            </tr>
                        </thead>
                        <tbody id="table-body" class="divide-y">
                            </tbody>
                    </table>
                </div>
            </main>
        </div>
    <?php endif; ?>

    <script>
        function toggleModal(id) { document.getElementById(id).classList.toggle('hidden'); }

        async function loadTable(student) {
            const res = await fetch(`api.php?action=get_grades&student=${student}`);
            const data = await res.json();
            const isAdmin = "<?= $userAct['role'] ?? '' ?>" !== 'lector';
            
            document.getElementById('table-body').innerHTML = data.map(m => {
                const final = ((parseFloat(m.coti) + parseFloat(m.inte) + parseFloat(m.exam)) / 3).toFixed(1);
                return `
                <tr data-m="${m.subject_name}">
                    <td class="p-6 font-bold text-indigo-600">${m.subject_name}</td>
                    <td class="p-6 editable" contenteditable="${isAdmin}" data-c="coti" onblur="saveGrade('${student}', '${m.subject_name}', this)">${m.coti}</td>
                    <td class="p-6 editable" contenteditable="${isAdmin}" data-c="inte" onblur="saveGrade('${student}', '${m.subject_name}', this)">${m.inte}</td>
                    <td class="p-6 editable" contenteditable="${isAdmin}" data-c="exam" onblur="saveGrade('${student}', '${m.subject_name}', this)">${m.exam}</td>
                    <td class="p-6 text-right font-black text-2xl text-indigo-600">${final}</td>
                </tr>`;
            }).join('');
        }

        async function saveGrade(student, subject, el) {
            const val = el.innerText.replace(/[^0-9.]/g, '');
            const col = el.dataset.c;
            const formData = new FormData();
            formData.append('student', student);
            formData.append('subject', subject);
            formData.append('column', col);
            formData.append('value', val);

            await fetch('api.php?action=save_grade', { method: 'POST', body: formData });
            loadTable(student); // Recargar para actualizar promedio
        }

        async function changePass() {
            const pass = document.getElementById('new-pass').value;
            const formData = new FormData();
            formData.append('password', pass);
            await fetch('api.php?action=change_pass', { method: 'POST', body: formData });
            alert("Contraseña actualizada");
            toggleModal('profile-modal');
        }
    </script>
</body>
</html>
