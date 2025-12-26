import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const { user } = req.query;
    if (!user) return res.status(400).json({ error: "Usuario requerido" });

    // GUARDAR DATOS (POST)
    if (req.method === 'POST') {
        try {
            await kv.set(`notas_${user}`, req.body);
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // LEER DATOS (GET)
    if (req.method === 'GET') {
        try {
            const data = await kv.get(`notas_${user}`);
            return res.status(200).json(data || {});
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
