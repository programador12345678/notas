import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Esto permite que tus dispositivos se conecten sin bloqueos
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const { user } = req.query;
    if (!user) return res.status(400).json({ error: "Falta el usuario" });

    try {
        if (req.method === 'POST') {
            // GUARDA las notas que envías desde el teléfono
            await kv.set(`notas_${user}`, req.body);
            return res.status(200).json({ success: true });
        } else {
            // LEE las notas guardadas para mostrarlas
            const data = await kv.get(`notas_${user}`);
            return res.status(200).json(data || {});
        }
    } catch (e) {
        return res.status(500).json({ error: "Error de conexión con Vercel KV" });
    }
}
